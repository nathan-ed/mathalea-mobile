#!/usr/bin/env bash
# Construit le moteur MathALÉA embarquable et le copie dans static/moteur.
# MATHALEA_DIR : clone de MathALÉA contenant src/moteur et vite.moteur.config.ts
# (branche moteur-embarquable tant qu'elle n'est pas fusionnée).
set -euo pipefail
racine="$(cd "$(dirname "$0")/.." && pwd)"
mathalea="${MATHALEA_DIR:-$racine/../mathalea}"

if [ ! -f "$mathalea/vite.moteur.config.ts" ]; then
  echo "MathALÉA sans moteur embarquable dans $mathalea (définir MATHALEA_DIR)." >&2
  exit 1
fi

cd "$mathalea"
[ -d node_modules ] || pnpm install --frozen-lockfile
pnpm makeJson
NODE_OPTIONS=--max-old-space-size=6144 npx vite build -c vite.moteur.config.ts

rm -rf "$racine/static/moteur"
cp -r "$mathalea/dist-moteur" "$racine/static/moteur"
echo "Moteur $(node -p "require('$racine/static/moteur/manifest.json').version") copié dans static/moteur."
