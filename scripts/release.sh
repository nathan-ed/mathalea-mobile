#!/usr/bin/env bash
# Range les installateurs d'une version dans releases/<version>/ (Git LFS),
# sous des noms uniformes (MathALEA-<v>-<système>.<ext>), avec SHA256SUMS,
# puis crée ou complète la release de la forge (un lien par fichier).
#
#   scripts/release.sh v0.2.0             # tout ce que la CI GitHub a construit
#                                         # (+ l'.ipa du dernier run ios.yml réussi
#                                         #  sur le commit du tag, lancé avec ipa=true)
#   APK_LOCALES=1 scripts/release.sh v0.2.0   # + les APK construites ici (prioritaires)
#
# Peut être relancé : les fichiers déjà présents sont remplacés, les liens
# manquants ajoutés à la release de la forge. Pousser le commit qui contient
# releases/<version> avant (les liens pointent sur main).
set -euo pipefail
version="${1:?Version attendue, ex. v0.2.0}"
v="${version#v}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
depot_github="${GITHUB_DEPOT:-nathan-ed/mathalea-mobile}"
projet="coopmaths/mathalea-mobile"
dossier="$racine/releases/$version"
brut="$(mktemp -d)"
trap 'rm -rf "$brut"' EXIT
mkdir -p "$dossier"

# Nom uniforme d'après le nom produit par tauri-action ou Gradle
uniforme() {
  case "$1" in
    *.AppImage) echo "MathALEA-$v-linux-amd64.AppImage" ;;
    *.deb) echo "MathALEA-$v-linux-amd64.deb" ;;
    *.rpm) echo "MathALEA-$v-linux-x86_64.rpm" ;;
    *aarch64*.dmg) echo "MathALEA-$v-macos-apple-silicon.dmg" ;;
    *x64*.dmg) echo "MathALEA-$v-macos-intel.dmg" ;;
    *ios-non-signee.ipa) echo "MathALEA-$v-ios-non-signee.ipa" ;;
    *.msi) echo "MathALEA-$v-windows.msi" ;;
    *setup.exe) echo "MathALEA-$v-windows-setup.exe" ;;
    *arm64*.apk | *aarch64*.apk) echo "MathALEA-$v-android-arm64.apk" ;;
    *armeabi*.apk | *arm-*.apk | *armv7*.apk) echo "MathALEA-$v-android-armv7.apk" ;;
    *) echo "" ;;
  esac
}

ranger() {
  for f in "$1"/*; do
    nom="$(uniforme "$(basename "$f")")"
    if [ -n "$nom" ]; then cp "$f" "$dossier/$nom" && echo "  $nom"; fi
  done
}

if gh release view "$version" --repo "$depot_github" > /dev/null 2>&1; then
  echo "Release GitHub $version :"
  gh release download "$version" --repo "$depot_github" --dir "$brut/github" --clobber
  ranger "$brut/github"
fi
# .ipa non signée : artefact du workflow ios.yml (pas dans la release GitHub)
commit="$(git -C "$racine" rev-parse "$version^{commit}")"
for run in $(gh run list --repo "$depot_github" --workflow ios.yml --status success --limit 30 \
  --json databaseId,headSha --jq ".[] | select(.headSha == \"$commit\") | .databaseId"); do
  if gh run download "$run" --repo "$depot_github" --name ipa-non-signee --dir "$brut/ios" > /dev/null 2>&1; then
    echo "iOS (run $run) :"
    ranger "$brut/ios"
    break
  fi
done
[ -d "$brut/ios" ] || echo "Pas d'.ipa : lancer ios.yml avec ipa=true sur $version, puis relancer ce script."
if [ -n "${APK_LOCALES:-}" ]; then
  echo "APK construites ici :"
  mkdir -p "$brut/local"
  find "$racine/src-tauri/gen/android/app/build/outputs/apk" -name '*-release.apk' -newer "$racine/package.json" -exec cp {} "$brut/local/" \;
  ranger "$brut/local"
fi

(cd "$dossier" && sha256sum -- MathALEA-* > SHA256SUMS)

{
  echo "# Versions de MathALÉA"
  echo
  echo "Chaque dossier contient les installateurs d'une version et leurs sommes"
  echo "SHA-256 (\`sha256sum -c SHA256SUMS\`). Installation : voir ../README.md."
  echo
  for d in $(ls -1d "$racine"/releases/v* | sort -rV); do
    echo "- [$(basename "$d")]($(basename "$d")/)"
  done
} > "$racine/releases/README.md"

# Release de la forge : créée au besoin, puis un lien par fichier manquant
cd "$racine"  # glab prend la forge dans le remote origin
api="projects/${projet//\//%2F}/releases"
# Liens sur main : une version peut être complétée après coup (APK d'abord, puis le reste)
lien_brut="https://forge.apps.education.fr/$projet/-/raw/main/releases/$version"
if ! glab api "$api/$version" > /dev/null 2>&1; then
  glab api -X POST "$api" -f tag_name="$version" -f ref=main -f name="MathALÉA $v" \
    -f description="Installateurs : voir releases/$version et le README (installation)." > /dev/null
  echo "Release $version créée sur la forge."
fi
existants="$(glab api "$api/$version/assets/links" | jq -r '.[].name')"
for f in "$dossier"/*; do
  nom="$(basename "$f")"
  grep -qxF "$nom" <<< "$existants" && continue
  glab api -X POST "$api/$version/assets/links" -f name="$nom" -f url="$lien_brut/$nom" -f link_type=package > /dev/null
  echo "  lien ajouté : $nom"
done
