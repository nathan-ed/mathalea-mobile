#!/usr/bin/env bash
# Suites e2e en CI, avant toute construction de release ou d'envoi aux
# boutiques : rien ne part si l'une échoue (0.4.6 et 0.4.7 sont parties avec
# des écrans qui ne défilaient plus au doigt). Il faut static/moteur et les
# dépendances installées (pnpm install).
#   bash scripts/e2e-ci.sh defilement un-toucher regressions
set -euo pipefail
cd "$(dirname "$0")/.."
test -s static/moteur/manifest.json || { echo "static/moteur manquant"; exit 1; }

# Chromium de Playwright, au chemin attendu par les scripts e2e
pnpm exec playwright install --with-deps chromium
chrome="$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | sort | tail -1)"
if [ "$(id -u)" = 0 ]; then ln -sf "$chrome" /usr/bin/chromium; else sudo ln -sf "$chrome" /usr/bin/chromium; fi

# Fausse caméra des suites QR : image Pillow (python3 -I) filmée par ffmpeg
if ! python3 -I -c 'import PIL' 2>/dev/null || ! command -v ffmpeg > /dev/null; then
  if [ "$(id -u)" = 0 ]; then apt-get install -y python3-pil ffmpeg; else sudo apt-get install -y python3-pil ffmpeg; fi
fi

# Catalogue de l'Explorer servi par les suites elles-mêmes (explorer,
# defilement-ecrans) ; sans elles, rien ne répond et l'Explorer reste vide
export VITE_URL_EXPLORER="${VITE_URL_EXPLORER:-http://127.0.0.1:8702/explorer.json}"
journal="${RUNNER_TEMP:-/tmp}/pnpm-dev.log"
# Groupe de processus à part : pnpm, sh et vite arrêtés ensemble à la fin
setsid pnpm dev > "$journal" 2>&1 &
serveur=$!
trap 'kill -- -$serveur 2>/dev/null || true' EXIT
for _ in $(seq 120); do
  curl -sf http://localhost:1420/ > /dev/null && break
  sleep 1
done
curl -sf http://localhost:1420/ > /dev/null || { cat "$journal"; exit 1; }

export CAPTURES="${RUNNER_TEMP:-/tmp}/captures"
mkdir -p "$CAPTURES"
echecs=()
for suite in "$@"; do
  echo "::group::$suite"
  if ! node "e2e/$suite.mjs"; then echecs+=("$suite"); fi
  echo "::endgroup::"
done
if [ ${#echecs[@]} -gt 0 ]; then
  echo "Suites en échec : ${echecs[*]}"
  exit 1
fi
echo "Suites vertes : $*"
