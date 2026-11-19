#!/usr/bin/env bash
# Prévient Nathan (notification du bureau et petit son) ; ne fait jamais échouer
# le script appelant. Utilisé par verifier-release.sh et publier.sh.
#   bash scripts/prevenir.sh echec|fin "titre" "détail"
niveau="${1:-fin}"
titre="${2:-MathALÉA}"
detail="${3:-}"
urgence=normal
son=complete
if [ "$niveau" = echec ]; then urgence=critical; son=dialog-warning; fi
command -v notify-send > /dev/null && notify-send -u "$urgence" -a "MathALÉA mobile" "$titre" "$detail" 2> /dev/null
command -v canberra-gtk-play > /dev/null && canberra-gtk-play -i "$son" 2> /dev/null
exit 0
