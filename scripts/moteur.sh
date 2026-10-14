#!/usr/bin/env bash
# Construit le moteur MathALÉA embarquable et le copie dans static/moteur.
# Source : MathALÉA au commit moteur/COMMIT, plus les fichiers de moteur/
# (voir moteur/README.md). Le clone est gardé dans MATHALEA_CACHE pour les
# constructions suivantes.
set -euo pipefail
racine="$(cd "$(dirname "$0")/.." && pwd)"
commit="$(cat "$racine/moteur/COMMIT")"
mathalea="${MATHALEA_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/mathalea-mobile/mathalea}"

if [ ! -e "$mathalea/.git" ]; then
  mkdir -p "$(dirname "$mathalea")"
  git clone --filter=blob:none --no-checkout https://forge.apps.education.fr/coopmaths/mathalea.git "$mathalea"
fi
cd "$mathalea"
git cat-file -e "$commit^{commit}" 2>/dev/null || git fetch origin "$commit"
# Clone réservé à ce script : remis à l'état exact du commit à chaque fois
git checkout -q -f "$commit"
git clean -q -fd -e node_modules
cp -r "$racine/moteur/fichiers/." .
git apply "$racine/moteur/mathalea.patch"

# Version : date, commit de MathALÉA, empreinte des fichiers de moteur/
empreinte="$(cd "$racine/moteur" && find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -c1-7)"
export MOTEUR_VERSION="$(date -u +%F)+${commit:0:9}.$empreinte"

pnpm install --frozen-lockfile
pnpm makeJson
pnpm build:moteur

rm -rf "$racine/static/moteur"
cp -r "$mathalea/dist-moteur" "$racine/static/moteur"
echo "Moteur $(node -p "require('$racine/static/moteur/manifest.json').version") copié dans static/moteur."
