#!/usr/bin/env bash
# Contrôle des claviers : chaque réponse attendue des parcours officiels peut
# être tapée au clavier virtuel de MathALÉA (lettre e absente, x absent…).
# Parcours contrôlés : ceux du dossier kDrive de l'Explorer (FR et CH,
# téléchargés), explorer/*.json, la démonstration et les questions de
# « Teste ton niveau ». Exercices générés par MathALÉA au commit moteur/COMMIT,
# dans le clone de scripts/moteur.sh (pnpm moteur d'abord).
#   bash scripts/verifier-claviers.sh        (GRAINES=30 tirages par exercice, 3 min)
# Rapport : $SORTIE/rapport-claviers.json. Défauts déjà signalés à MathALÉA :
# scripts/claviers/connus.json (exercice -> touches), affichés sans bloquer ;
# code 1 seulement pour un défaut nouveau. Retirer une entrée une fois le
# moteur monté à un commit qui la corrige.
set -euo pipefail
racine="$(cd "$(dirname "$0")/.." && pwd)"
mathalea="${MATHALEA_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/mathalea-mobile/mathalea}"
SORTIE="${SORTIE:-${TMPDIR:-/tmp}/verification-mathalea}"
mkdir -p "$SORTIE"
commit="$(cat "$racine/moteur/COMMIT")"
[ "$(git -C "$mathalea" rev-parse HEAD 2>/dev/null)" = "$commit" ] || { echo "Clone du moteur absent ou pas au commit moteur/COMMIT : pnpm moteur"; exit 1; }

drive="$SORTIE/explorer-drive"
rm -rf "$drive"
node "$racine/scripts/claviers/telecharger-explorer.mjs" "$drive"
fichiers=$(find "$drive" "$racine/explorer" "$racine/static/demo" -name '*.json' | sort | tr '\n' ':')
fichiers="$fichiers$racine/src/lib/questionsCan.json"

# Fichiers temporaires dans le clone (remis à zéro par scripts/moteur.sh)
cp "$racine/scripts/claviers/claviers.test.ts" "$mathalea/tasks/claviers.test.ts"
cat > "$mathalea/vitest.claviers.config.js" <<'JS'
import { mergeConfig } from 'vitest/config'
import base from './vitest.config.js'
export default mergeConfig(base, { server: { fs: { strict: false } }, test: { include: ['tasks/claviers.test.ts'] } })
JS
trap 'rm -f "$mathalea/tasks/claviers.test.ts" "$mathalea/vitest.claviers.config.js"' EXIT
(cd "$mathalea" && FICHIERS="$fichiers" GRAINES="${GRAINES:-30}" RAPPORT="$SORTIE/rapport-claviers.json" \
  node_modules/.bin/vitest run --config vitest.claviers.config.js > "$SORTIE/claviers-vitest.log" 2>&1) \
  || { echo "vitest échoue (voir $SORTIE/claviers-vitest.log)"; exit 1; }

node - "$SORTIE/rapport-claviers.json" "$racine/scripts/claviers/connus.json" <<'JS'
const r = require(process.argv[2])
const connus = require(process.argv[3])
console.log(`${r.exercices} exercices, ${r.champs} champs contrôlés`)
for (const e of r.erreurs) console.log(`  génération impossible : ${e.ou} : ${e.erreur}`)
const connu = (p) => p.touches.every((t) => (connus[p.exercice]?.touches ?? []).includes(t))
const afficher = (p) => {
  console.log(`  ${p.exercice} : touche ${p.touches.join(', ')} absente, par exemple ${p.exemple}`)
  for (const o of [...new Set(p.ou)]) console.log(`    ${o}`)
}
const nouveaux = r.problemes.filter((p) => !connu(p))
const anciens = r.problemes.filter(connu)
if (anciens.length) console.log(`Défauts connus (connus.json), non bloquants : ${[...new Set(anciens.map((p) => p.exercice))].join(', ')}`)
const corriges = Object.keys(connus).filter((k) => !k.startsWith('_') && !r.problemes.some((p) => p.exercice === k))
if (corriges.length) console.log(`Plus vus, à retirer de connus.json : ${corriges.join(', ')}`)
if (nouveaux.length) {
  console.log('NOUVEAUX DÉFAUTS :')
  nouveaux.forEach(afficher)
}
process.exit(nouveaux.length ? 1 : 0)
JS
