#!/usr/bin/env bash
# Vérification complète avant une release, sur l'ordinateur de qui publie :
# pnpm check, pnpm test, cargo test, puis toutes les suites e2e jouées comme
# un élève (dont tous les formats de réponse et les parcours de l'Explorer de
# A à Z). Rien ne doit être modifié dans src/ pendant qu'il tourne : Vite
# rechargerait la page et ferait échouer une suite au hasard.
#   bash scripts/verifier-release.sh            (tout, environ 2 h 30)
#   RAPIDE=1 bash scripts/verifier-release.sh   (sans les parcours de A à Z)
# Il faut static/moteur (pnpm moteur), Chromium à /usr/bin/chromium, python3
# et ffmpeg (fausse caméra des suites QR). Captures et journaux dans $SORTIE.
set -uo pipefail
cd "$(dirname "$0")/.."
SORTIE="${SORTIE:-${TMPDIR:-/tmp}/verification-mathalea}"
rm -rf "$SORTIE"
mkdir -p "$SORTIE"
export CAPTURES="$SORTIE"
echecs=()
etape() {
  local nom="$1"
  shift
  echo "== $nom"
  if "$@" > "$SORTIE/$nom.log" 2>&1; then echo "   vert"; else echo "   ÉCHEC (voir $SORTIE/$nom.log)"; echecs+=("$nom"); fi
}

test -s static/moteur/manifest.json || { echo "static/moteur manquant : pnpm moteur"; exit 1; }
etape check pnpm check
etape test pnpm test
etape cargo bash -c 'cd src-tauri && cargo test'

# Dossier partagé local (complet, retour) et catalogue Explorer de test
dossier="$SORTIE/partage/s/Xk42demo"
mkdir -p "$dossier/classe-3a"
npx tsx e2e/preparer.mts "$dossier" > /dev/null
(cd "$SORTIE/partage" && exec python3 -m http.server 8702 --bind 127.0.0.1) > "$SORTIE/partage.log" 2>&1 &
partage=$!

demarrer() {
  # Groupe de processus à part : pnpm, sh et vite arrêtés ensemble
  VITE_URL_EXPLORER="$1" setsid pnpm dev > "$SORTIE/pnpm-dev.log" 2>&1 &
  serveur=$!
  for _ in $(seq 120); do curl -sf http://localhost:1420/ > /dev/null && return; sleep 1; done
  echo "pnpm dev ne démarre pas"; exit 1
}
arreter() { kill -- -"$serveur" 2>/dev/null; sleep 2; }
trap 'kill -- -"${serveur:-0}" 2>/dev/null; kill "$partage" 2>/dev/null' EXIT

demarrer "http://127.0.0.1:8702/s/Xk42demo/explorer/"
# Longues suites en parallèle : formats de réponse et parcours de l'Explorer
paralleles=(formats)
if [ -z "${RAPIDE:-}" ]; then paralleles+=(az-prequalifiant-1 az-prequalifiant-2 az-evacom); fi
pids=()
for s in "${paralleles[@]}"; do
  (node "e2e/$s.mjs" > "$SORTIE/$s.log" 2>&1; echo $? > "$SORTIE/$s.code") &
  pids+=($!)
done
wait "${pids[@]}"
for s in "${paralleles[@]}"; do
  if [ "$(cat "$SORTIE/$s.code")" = 0 ]; then echo "== $s"; echo "   vert"; else echo "== $s"; echo "   ÉCHEC (voir $SORTIE/$s.log)"; echecs+=("$s"); fi
done
for s in reponses-elements defilement un-toucher regressions changer-appareil classe-qr en-classe \
  fiche-parcours session-qr ouverture-paliers paliers papier recherche correction-parcours \
  reponses-session revisions test-niveau test-niveau-reel retour; do
  etape "$s" node "e2e/$s.mjs"
done
etape complet env DOSSIER="$dossier" node e2e/complet.mjs
arreter
kill "$partage" 2>/dev/null
sleep 1

# Explorer : la suite sert elle-même son catalogue sur 8702
demarrer "http://127.0.0.1:8702/explorer.json"
etape explorer node e2e/explorer.mjs
arreter

echo
if [ ${#echecs[@]} -gt 0 ]; then
  echo "À CORRIGER AVANT LA RELEASE : ${echecs[*]}"
  exit 1
fi
echo "TOUT VERT : la release peut partir ($(git rev-parse --short HEAD))."
