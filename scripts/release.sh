#!/usr/bin/env bash
# Range les installateurs d'une version dans releases/<version>/ (Git LFS),
# sous des noms uniformes (MathALEA-<v>-<système>.<ext>), avec SHA256SUMS,
# puis crée ou complète la release de la forge (un lien par fichier).
#
#   scripts/release.sh v0.2.0             # tout ce que la CI GitHub a construit
#                                         # (+ l'.ipa du dernier run ios.yml réussi
#                                         #  sur le commit du tag, lancé avec ipa=true)
#   APK_LOCALES=1 scripts/release.sh v0.2.0   # + les APK construites ici (prioritaires)
#   IPA_RUN=<id> scripts/release.sh v0.2.0    # .ipa d'un run ios.yml précis
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
signatures="$brut/signatures"
mkdir -p "$signatures"
lien_brut="https://forge.apps.education.fr/$projet/-/raw/main/releases/$version"
trap 'rm -rf "$brut"' EXIT
mkdir -p "$dossier"

# Nom uniforme d'après le nom produit par tauri-action ou Gradle
uniforme() {
  case "$1" in
    *.sig) echo "" ;;
    *aarch64.app.tar.gz) echo "MathALEA-$v-macos-apple-silicon.app.tar.gz" ;;
    *x64.app.tar.gz) echo "MathALEA-$v-macos-intel.app.tar.gz" ;;
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
    # Archive de mise à jour du Mac : seulement signée (sinon elle ne sert à rien)
    case "$f" in *.app.tar.gz) [ -s "$f.sig" ] || nom="" ;; esac
    if [ -n "$nom" ]; then
      cp "$f" "$dossier/$nom" && echo "  $nom"
      # Signature de mise à jour gardée à côté, pour latest.json
      if [ -s "$f.sig" ]; then cp "$f.sig" "$signatures/$nom.sig"; fi
    fi
  done
}

# releases/latest.json : ce que lisent les apps de bureau pour se mettre à jour
# (src-tauri/src/maj.rs). Écrit seulement si la version est la plus récente et
# si chaque système a sa signature (Windows, macOS, AppImage Linux).
ecrire_latest() {
  local latest="$racine/releases/latest.json" actuelle
  actuelle="$(jq -r '.version // empty' "$latest" 2> /dev/null || true)"
  if [ -n "$actuelle" ] && [ "$(printf '%s\n%s\n' "$actuelle" "$v" | sort -V | tail -1)" != "$v" ]; then
    echo "latest.json garde la $actuelle (plus récente que $v)."
    return
  fi
  local manquants=""
  for nom in windows-setup.exe windows.msi macos-apple-silicon.app.tar.gz macos-intel.app.tar.gz linux-amd64.AppImage; do
    [ -s "$signatures/MathALEA-$v-$nom.sig" ] || manquants="$manquants $nom"
  done
  if [ -n "$manquants" ]; then
    echo "Pas de latest.json : signature de mise à jour manquante pour$manquants."
    return
  fi
  local notes="$racine/docs/notes-de-version/$version.md"
  jq -n --arg v "$v" --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg lien "$lien_brut" \
    --arg sig "$signatures" --rawfile notes "$notes" '
    def entree(nom): {signature: ($sig + "/MathALEA-" + $v + "-" + nom + ".sig"), url: ($lien + "/MathALEA-" + $v + "-" + nom)};
    {version: $v, notes: $notes, pub_date: $date, platforms: {
      "windows-x86_64-nsis": entree("windows-setup.exe"),
      "windows-x86_64-msi": entree("windows.msi"),
      "darwin-aarch64-app": entree("macos-apple-silicon.app.tar.gz"),
      "darwin-x86_64-app": entree("macos-intel.app.tar.gz"),
      "linux-x86_64-appimage": entree("linux-amd64.AppImage")
    }}' > "$latest.tmp"
  # Chemins des signatures remplacés par leur contenu
  local entree fichier
  for entree in $(jq -r '.platforms | keys[]' "$latest.tmp"); do
    fichier="$(jq -r --arg e "$entree" '.platforms[$e].signature' "$latest.tmp")"
    jq --arg e "$entree" --rawfile s "$fichier" '.platforms[$e].signature = ($s | rtrimstr("\n"))' \
      "$latest.tmp" > "$latest.tmp2" && mv "$latest.tmp2" "$latest.tmp"
  done
  mv "$latest.tmp" "$latest"
  echo "latest.json : $v (mise à jour des apps de bureau au prochain push sur main)"
}

if gh release view "$version" --repo "$depot_github" > /dev/null 2>&1; then
  echo "Release GitHub $version :"
  gh release download "$version" --repo "$depot_github" --dir "$brut/github" --clobber
  ranger "$brut/github"
fi
# .ipa non signée : artefact du workflow ios.yml (pas dans la release GitHub)
# IPA_RUN=<id> : celle d'un run précis (par exemple sur main, même code de l'app
# que le tag, après un correctif du seul workflow)
commit="$(git -C "$racine" rev-parse "$version^{commit}")"
for run in ${IPA_RUN:-$(gh run list --repo "$depot_github" --workflow ios.yml --status success --limit 30 \
  --json databaseId,headSha --jq ".[] | select(.headSha == \"$commit\") | .databaseId")}; do
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
ecrire_latest

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
# Liens sur main (lien_brut) : une version peut être complétée après coup (APK d'abord, puis le reste)
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
