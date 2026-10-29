#!/usr/bin/env bash
# Publier une version : vérification complète (scripts/verifier-release.sh,
# tous les parcours joués de A à Z), puis tag et push. Rien n'est posé si une
# suite échoue. Ne jamais poser un tag v* à la main.
#   bash scripts/publier.sh v0.4.10
set -euo pipefail
version="${1:?Version attendue, ex. v0.4.10}"
cd "$(dirname "$0")/.."
v="${version#v}"
test -z "$(git status --porcelain --untracked-files=no)" || { echo "Des modifications ne sont pas commitées."; exit 1; }
test -f "docs/notes-de-version/$version.md" || { echo "Note de version manquante : docs/notes-de-version/$version.md"; exit 1; }
test -f "docs/notes-de-version/$version.play.txt" || { echo "Note Google Play manquante : docs/notes-de-version/$version.play.txt"; exit 1; }
for f in package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml; do
  grep -q "\"$v\"\|= \"$v\"" "$f" || { echo "Version $v absente de $f"; exit 1; }
done
bash scripts/verifier-release.sh
git tag "$version"
git push origin main "$version"
if git remote | grep -qx github; then git push github main "$version"; fi
echo "Version $version publiée : la CI construit les binaires (release.yml)."
