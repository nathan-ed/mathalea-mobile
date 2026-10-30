#!/usr/bin/env bash
# Vérification complète avant une release, sur l'ordinateur de qui publie :
# pnpm check, pnpm test, cargo test, puis toutes les suites e2e jouées comme
# un élève (dont tous les formats de réponse et tous les parcours de explorer/
# et de la démonstration de A à Z). Rien ne doit être modifié dans src/ pendant
# qu'il tourne : Vite rechargerait la page et ferait échouer une suite au hasard.
#   bash scripts/verifier-release.sh   (tout, environ 1 h)
#   PARALLELE=3 bash scripts/verifier-release.sh   (machine plus faible)
# Suites lues dans e2e/suites.json : longues et groupes de release.yml joués en
# parallèle (PARALLELE à la fois, 4 par défaut), puis une à une celles qui
# servent elles-mêmes un dossier ou un catalogue sur le port 8702.
# Lancé par scripts/publier.sh, qui ne pose le tag que si tout est vert.
# Il faut static/moteur construit depuis moteur/ (pnpm moteur), Chromium à
# /usr/bin/chromium, python3 et ffmpeg (fausse caméra des suites QR).
# Captures et journaux dans $SORTIE.
set -uo pipefail
cd "$(dirname "$0")/.."
SORTIE="${SORTIE:-${TMPDIR:-/tmp}/verification-mathalea}"
PARALLELE="${PARALLELE:-4}"
GROUPES_AZ="${GROUPES_AZ:-5}"
rm -rf "$SORTIE"
mkdir -p "$SORTIE"
export CAPTURES="$SORTIE"
debut=$(date +%s)
echecs=()
resultat() {
  local nom="$1" code="$2"
  echo "== $nom ($(( ($(date +%s) - debut) / 60 )) min)"
  if [ "$code" = 0 ]; then echo "   vert"; else echo "   ÉCHEC (voir $SORTIE/$nom.log)"; echecs+=("$nom"); fi
}
etape() {
  local nom="$1"
  shift
  "$@" > "$SORTIE/$nom.log" 2>&1
  resultat "$nom" $?
}

bash scripts/moteur-a-jour.sh || exit 1
etape check pnpm check
etape test pnpm test
etape cargo bash -c 'cd src-tauri && cargo test'

liste() { node -p "const s = require('./e2e/suites.json'); [].concat(${1}).join(' ')"; }
port8702=" $(liste s.port8702) "
courtes="$(liste 's.groupes.flat()')"

# Processus qui écoutent sur le port 1420 (serveur de dev)
sur1420() { ss -ltnp 2>/dev/null | grep ':1420 ' | grep -oP 'pid=\K[0-9]+' | sort -u; }
demarrer() {
  # Un serveur resté ouvert répondrait à la place du nouveau, avec une autre
  # adresse d'Explorer : les suites tourneraient sur le mauvais (vu en 0.4.10)
  [ -z "$(sur1420)" ] || { echo "port 1420 déjà occupé (pid $(sur1420 | tr '\n' ' ')) : arrêter ce serveur d'abord"; exit 1; }
  # Groupe de processus à part : pnpm, sh et vite arrêtés ensemble
  VITE_URL_EXPLORER="$1" setsid pnpm dev > "$SORTIE/pnpm-dev.log" 2>&1 &
  serveur=$!
  for _ in $(seq 120); do curl -sf http://localhost:1420/ > /dev/null && break; sleep 1; done
  curl -sf http://localhost:1420/ > /dev/null || { echo "pnpm dev ne démarre pas"; exit 1; }
  # Premier chargement : Vite optimise ses dépendances puis recharge la page ;
  # on le fait ici, pas pendant une suite
  node -e "
    const { chromium } = require('playwright')
    ;(async () => {
      const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
      const page = await nav.newPage()
      await page.goto('http://localhost:1420/')
      await page.waitForTimeout(15000)
      await nav.close()
    })()
  " > /dev/null 2>&1
}
arreter() {
  kill -- -"$serveur" 2>/dev/null
  # Vite peut survivre à son groupe : on arrête ce qui écoute encore sur 1420
  for _ in $(seq 10); do [ -z "$(sur1420)" ] && return; sleep 1; done
  sur1420 | xargs -r kill 2>/dev/null
  sleep 2
  [ -z "$(sur1420)" ] || { echo "serveur de dev impossible à arrêter"; exit 1; }
}
trap 'kill -- -"${serveur:-0}" 2>/dev/null; sur1420 | xargs -r kill 2>/dev/null; kill "${partage:-0}" 2>/dev/null' EXIT

# 1. En parallèle, les plus longues d'abord : formats, parcours de A à Z en
# GROUPES_AZ groupes, puis les suites de la matrice de release.yml (hors port
# 8702). Même adresse d'Explorer que la CI (scripts/e2e-ci.sh) : personne n'y
# répond, l'app garde son catalogue intégré.
demarrer "http://127.0.0.1:8702/explorer.json"
taches=(formats)
for g in $(seq "$GROUPES_AZ"); do taches+=("az-$g"); done
for s in $courtes; do case "$port8702" in *" $s "*) ;; *) taches+=("$s") ;; esac; done
declare -A pids=()
lancer() {
  local s="$1"
  case "$s" in
    az-*) GROUPE="${s#az-}" GROUPES="$GROUPES_AZ" node e2e/az-groupe.mjs > "$SORTIE/$s.log" 2>&1 & ;;
    *) node "e2e/$s.mjs" > "$SORTIE/$s.log" 2>&1 & ;;
  esac
  pids[$!]="$s"
}
recolter() {
  local pid code
  wait -n -p pid "${!pids[@]}"
  code=$?
  resultat "${pids[$pid]}" "$code"
  unset "pids[$pid]"
}
for s in "${taches[@]}"; do
  while [ "${#pids[@]}" -ge "$PARALLELE" ]; do recolter; done
  lancer "$s"
done
while [ "${#pids[@]}" -gt 0 ]; do recolter; done

# 2. Une à une, celles qui servent elles-mêmes leur catalogue sur 8702
for s in $courtes; do case "$port8702" in *" $s "*) etape "$s" node "e2e/$s.mjs" ;; esac; done
arreter

# 3. Bout en bout à trois appareils : dossier partagé et catalogue de test
dossier="$SORTIE/partage/s/Xk42demo"
mkdir -p "$dossier/classe-3a"
npx tsx e2e/preparer.mts "$dossier" > /dev/null
(cd "$SORTIE/partage" && exec python3 -m http.server 8702 --bind 127.0.0.1) > "$SORTIE/partage.log" 2>&1 &
partage=$!
demarrer "http://127.0.0.1:8702/s/Xk42demo/explorer/"
etape complet env DOSSIER="$dossier" node e2e/complet.mjs
arreter
kill "$partage" 2>/dev/null

echo
echo "Durée : $(( ($(date +%s) - debut) / 60 )) min"
if [ ${#echecs[@]} -gt 0 ]; then
  echo "À CORRIGER AVANT LA RELEASE : ${echecs[*]}"
  exit 1
fi
echo "TOUT VERT : la release peut partir ($(git rev-parse --short HEAD))."
