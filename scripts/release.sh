#!/usr/bin/env bash
# Récupère une release construite sur le miroir GitHub privé et la range dans
# releases/<version>/ (fichiers en Git LFS, sommes SHA-256). Avec FORGE_TOKEN,
# crée aussi la release correspondante sur la forge, avec un lien par fichier.
#   scripts/release.sh v0.2.0
#   GITHUB_DEPOT=compte/mathalea-mobile FORGE_TOKEN=… scripts/release.sh v0.2.0
set -euo pipefail
version="${1:?Version attendue, ex. v0.2.0}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
depot_github="${GITHUB_DEPOT:-coopmaths/mathalea-mobile}"
dossier="$racine/releases/$version"

mkdir -p "$dossier"
gh release download "$version" --repo "$depot_github" --dir "$dossier" --clobber
(cd "$dossier" && sha256sum -- * | grep -v ' SHA256SUMS$' > SHA256SUMS)
echo "Fichiers dans releases/$version :"
ls -1 "$dossier"

# Liste des versions pour releases/README.md
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

if [ -n "${FORGE_TOKEN:-}" ]; then
  api="https://forge.apps.education.fr/api/v4/projects/coopmaths%2Fmathalea-mobile"
  brut="https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/raw/main/releases/$version"
  liens="$(cd "$dossier" && for f in *; do printf '{"name":"%s","url":"%s/%s","link_type":"package"}\n' "$f" "$brut" "$f"; done | jq -s .)"
  notes="$(gh release view "$version" --repo "$depot_github" --json body --jq .body)"
  jq -n --arg tag "$version" --arg notes "$notes" --argjson liens "$liens" \
    '{tag_name: $tag, ref: "main", name: ("MathALÉA " + $tag), description: $notes, assets: {links: $liens}}' |
    curl --fail --silent --show-error --header "PRIVATE-TOKEN: $FORGE_TOKEN" --header 'Content-Type: application/json' \
      --data @- "$api/releases" > /dev/null
  echo "Release $version créée sur la forge (pousser d'abord le commit qui contient releases/$version)."
else
  echo "Ensuite : git add releases && git commit && git push (puis FORGE_TOKEN=… pour la release de la forge)."
fi
