#!/usr/bin/env bash
# Vérification complète avant une release, sur l'ordinateur de qui publie :
# pnpm check, pnpm test, cargo test, puis toutes les suites e2e jouées comme
# un élève (dont tous les formats de réponse et les parcours de l'Explorer de
# A à Z), sur la version construite de l'app (vite build, comme chez les
# élèves) servie par vite preview, jamais sur le serveur de développement.
#   bash scripts/verifier-release.sh   (tout ; tous les parcours de explorer/
#   et la démonstration sont joués de A à Z, sans exception)
# Lancé par scripts/publier.sh, qui ne pose le tag que si tout est vert.
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
# Moteur construit à partir de moteur/ tel qu'il est (sinon suites faussées)
bash scripts/moteur-a-jour.sh || exit 1
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
  # Un serveur déjà ouvert sur 1420 (pnpm dev d'une autre session) ferait jouer
  # les suites sur un autre code : vu le 2026-11-02
  if curl -s -o /dev/null localhost:1420/; then echo "port 1420 déjà occupé : l'arrêter, ou lancer dans un réseau isolé (unshare -rn, voir docs/developpement.md)"; exit 1; fi
  # Version construite, servie avec les relais de vite.config.js (téléchargement,
  # heure). NODE_ENV=development garde le relais de téléchargement des drives
  # (partage.ts), comme dans un navigateur en développement
  NODE_ENV=development VITE_URL_EXPLORER="$1" npx vite build > "$SORTIE/build.log" 2>&1 || { echo "vite build échoue (voir $SORTIE/build.log)"; exit 1; }
  # Groupe de processus à part : arrêté d'un coup par arreter()
  setsid npx vite preview --port 1420 --strictPort > "$SORTIE/preview.log" 2>&1 &
  serveur=$!
  for _ in $(seq 60); do curl -sf http://localhost:1420/ > /dev/null && break; sleep 0.5; done
  curl -sf http://localhost:1420/ > /dev/null || { echo "vite preview ne démarre pas"; exit 1; }
}
arreter() { kill -- -"$serveur" 2>/dev/null; sleep 2; }
trap 'kill -- -"${serveur:-0}" 2>/dev/null; kill "$partage" 2>/dev/null' EXIT

# Adresse de l'Explorer de l'app (bloquée par les suites : elles gardent leur
# catalogue en cache), imposée même si .env.development.local en donne une autre
demarrer "https://coopmaths.fr/alea/parcours/"
# Longues suites en parallèle : formats de réponse et parcours de l'Explorer
paralleles=(formats formats-fin az-1 az-2 az-3)
pids=()
for s in "${paralleles[@]}"; do
  (node "e2e/$s.mjs" > "$SORTIE/$s.log" 2>&1; echo $? > "$SORTIE/$s.code") &
  pids+=($!)
done
wait "${pids[@]}"
for s in "${paralleles[@]}"; do
  if [ "$(cat "$SORTIE/$s.code")" = 0 ]; then echo "== $s"; echo "   vert"; else echo "== $s"; echo "   ÉCHEC (voir $SORTIE/$s.log)"; echecs+=("$s"); fi
done
for s in reponses-elements defilement un-toucher terminer-passees barre-clavier regressions changer-appareil classe-qr en-classe \
  fiche-parcours session-qr ouverture-paliers paliers papier recherche correction-parcours \
  reponses-session revisions test-niveau test-niveau-reel couleurs-reponse reprise-ecran retour eleve-puis-enseignant \
  auteurs session-qr-long catalogue-moteur impression; do
  etape "$s" node "e2e/$s.mjs"
done
arreter
# Bout en bout à trois appareils : catalogue Explorer du dossier de test
demarrer "http://127.0.0.1:8702/s/Xk42demo/explorer/"
etape complet env DOSSIER="$dossier" node e2e/complet.mjs
arreter
kill "$partage" 2>/dev/null
sleep 1

# Explorer : la suite sert elle-même son catalogue sur 8702
demarrer "http://127.0.0.1:8702/explorer.json"
etape explorer node e2e/explorer.mjs
etape defilement-ecrans node e2e/defilement-ecrans.mjs
arreter

echo
if [ ${#echecs[@]} -gt 0 ]; then
  echo "À CORRIGER AVANT LA RELEASE : ${echecs[*]}"
  exit 1
fi
echo "TOUT VERT : la release peut partir ($(git rev-parse --short HEAD))."
