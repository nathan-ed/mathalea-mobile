#!/usr/bin/env bash
# Publier une version : vérification complète (scripts/verifier-release.sh,
# tous les parcours joués de A à Z), puis tag et push. Rien n'est posé si une
# suite échoue. Ne jamais poser un tag v* à la main.
#   bash scripts/publier.sh v0.4.10
#   SANS_FORGE=1 bash scripts/publier.sh v0.4.10   (tag et main sur GitHub
#   seulement, la forge plus tard : git push origin main v0.4.10)
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
# La version vérifiée est HEAD (souvent une branche release-X.Y.Z, main étant
# pris par une autre copie de travail) : elle doit prolonger main sans rien perdre
git fetch -q origin main
git merge-base --is-ancestor origin/main HEAD || { echo "HEAD ne prolonge pas origin/main : fusionner d'abord."; exit 1; }
bash scripts/verifier-release.sh
git tag "$version"
if [ "${SANS_FORGE:-}" = 1 ]; then
  echo "SANS_FORGE=1 : rien n'est poussé sur la forge (plus tard : git push origin main $version)"
else
  git push origin HEAD:main "$version"
fi
if git remote | grep -qx github; then git push github HEAD:main "$version"; fi
echo "Version $version publiée : la CI construit les binaires (release.yml)."
