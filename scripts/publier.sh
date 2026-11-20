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
test -z "$(git status --porcelain --untracked-files=no)" || { echo "Des modifications ne sont pas commitées."; exit 1; }
bash scripts/controler-version.sh "$version"
# La version vérifiée est HEAD (souvent une branche release-X.Y.Z, main étant
# pris par une autre copie de travail) : elle doit prolonger main sans rien perdre
git fetch -q origin main
git merge-base --is-ancestor origin/main HEAD || { echo "HEAD ne prolonge pas origin/main : fusionner d'abord."; exit 1; }
bash scripts/verifier-release.sh || { bash scripts/prevenir.sh echec "Release $version arrêtée" "La vérification a échoué : aucun tag posé." || true; exit 1; }
git tag "$version"
if [ "${SANS_FORGE:-}" = 1 ]; then
  echo "SANS_FORGE=1 : rien n'est poussé sur la forge (plus tard : git push origin main $version)"
else
  git push origin HEAD:main "$version"
fi
if git remote | grep -qx github; then git push github HEAD:main "$version"; fi
bash scripts/prevenir.sh fin "Version $version publiée" "Tag posé et poussé ; la CI construit les binaires." || true
echo "Version $version publiée : la CI construit les binaires (release.yml)."
