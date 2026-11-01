#!/usr/bin/env bash
# Filme une vidéo de présentation dans un écran virtuel (Xvfb) : la fenêtre de
# Chromium ne s'ouvre pas sur le bureau, et l'écran est filmé en pixels réels.
#   bash e2e/video/filmer.sh e2e/video/video-eleve.mjs
# Variables : DOSSIER, CATALOGUE, SORTIE (voir l'en-tête de chaque vidéo).
set -euo pipefail
VIDEO_XVFB=1 exec xvfb-run -a -s "-screen 0 1200x2000x24" node "$@"
