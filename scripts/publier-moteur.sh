#!/usr/bin/env bash
# Publier notre moteur sans nouvelle version de l'app : Android et ordinateurs
# le téléchargent (src-tauri/src/moteur.rs, URL_MISES_A_JOUR), iOS non.
#   bash scripts/publier-moteur.sh <commit de MathALÉA>
# Nathan choisit le commit. Le script le met dans moteur/COMMIT, construit le
# moteur (pnpm moteur), lance la vérification complète
# (scripts/verifier-release.sh) et ne publie que si tout est vert : archive,
# mise-a-jour.json et sa signature dans releases/moteur/, commit et push sur
# main. Les apps le prennent au lancement suivant.
# Clé privée : MOTEUR_CLE ou ~/.local/share/mathalea-mobile/moteur-forge-ed25519.pem
# (clé publique dans CLE_PUBLIQUE). Revenir à un moteur précédent : relancer
# avec son commit ; la nouvelle date de publication le fait reprendre.
set -euo pipefail
commit="${1:?Commit de MathALÉA attendu (ex. 5516e630a08a9f22acfabb44bd5733e985819fef)}"
cd "$(dirname "$0")/.."
cle="${MOTEUR_CLE:-$HOME/.local/share/mathalea-mobile/moteur-forge-ed25519.pem}"
test -r "$cle" || { echo "Clé privée du moteur introuvable : $cle"; exit 1; }
test -z "$(git status --porcelain --untracked-files=no)" || { echo "Des modifications ne sont pas commitées."; exit 1; }
git fetch -q origin main
git merge-base --is-ancestor origin/main HEAD || { echo "HEAD ne prolonge pas origin/main : fusionner d'abord."; exit 1; }

# Commit complet, pour que moteur/COMMIT désigne une version précise
mathalea="${MATHALEA_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/mathalea-mobile/mathalea}"
if [ -e "$mathalea/.git" ]; then
  git -C "$mathalea" cat-file -e "$commit^{commit}" 2>/dev/null || git -C "$mathalea" fetch -q origin main
  commit="$(git -C "$mathalea" rev-parse --verify "$commit^{commit}")"
fi
echo "$commit" > moteur/COMMIT
pnpm moteur
bash scripts/verifier-release.sh

version="$(node -p "require('./static/moteur/manifest.json').version")"
sortie=releases/moteur
node moteur/fichiers/tasks/publier_moteur.mjs static/moteur "$sortie" "$cle"
# Les trois dernières archives : une app qui a lu l'annonce juste avant la
# publication suivante trouve encore la sienne
ls -t "$sortie"/moteur-*.tar.gz | tail -n +4 | xargs -r git rm -q --ignore-unmatch
ls -t "$sortie"/moteur-*.tar.gz | tail -n +4 | xargs -r rm -f

git add moteur/COMMIT "$sortie"
git commit -q -m "Moteur $version publié pour Android et ordinateurs (MathALÉA ${commit:0:10})"
git push origin HEAD:main
if git remote | grep -qx github; then git push github HEAD:main; fi
echo "Moteur $version publié : https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/raw/main/$sortie/mise-a-jour.json"
