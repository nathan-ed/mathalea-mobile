#!/usr/bin/env bash
# Signe le moteur de static/moteur (construit et vérifié au commit
# moteur/COMMIT) et le range dans releases/moteur : archive, mise-a-jour.json
# et sa signature, les trois dernières archives gardées, puis commit.
# Utilisé par scripts/publier-moteur.sh et par publication.yml ; ne pousse rien.
#   bash scripts/signer-moteur.sh <clé privée .pem> [précision du message]
set -euo pipefail
cle="${1:?Clé privée du moteur attendue}"
precision="${2:-}"
cd "$(dirname "$0")/.."
commit="$(cat moteur/COMMIT)"
version="$(node -p "require('./static/moteur/manifest.json').version")"
sortie=releases/moteur
node moteur/fichiers/tasks/publier_moteur.mjs static/moteur "$sortie" "$cle"
# Les trois dernières archives : une app qui a lu l'annonce juste avant la
# publication suivante trouve encore la sienne. Ordre par le nom (date en tête),
# pas par la date du fichier (toutes égales après un clone, en CI)
nouvelle="$sortie/$(node -p "require('./$sortie/mise-a-jour.json').archive")"
ls -1 "$sortie"/moteur-*.tar.gz | grep -vxF "$nouvelle" | sort -r | tail -n +3 | while read -r f; do
  git rm -q --ignore-unmatch "$f"
  rm -f "$f"
done
git add moteur/COMMIT "$sortie"
git commit -q -m "Moteur $version publié pour toutes les apps (MathALÉA ${commit:0:10})${precision:+, $precision}"
echo "$version"
