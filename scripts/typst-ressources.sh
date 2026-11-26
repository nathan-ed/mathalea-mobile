#!/usr/bin/env bash
# Ressources du compilateur Typst embarqué (src-tauri/typst/) : paquets
# @preview demandés par le moteur construit (scripts/typst/paquets-moteur.mjs,
# plus leurs dépendances), ajoutés à ceux déjà embarqués, et polices
# par défaut des fiches (Libertinus Serif et Libertinus Math).
# À relancer après un changement de moteur/COMMIT.
set -euo pipefail
racine="$(cd "$(dirname "$0")/.." && pwd)"
commit="$(cat "$racine/moteur/COMMIT")"
mathalea="${MATHALEA_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/mathalea-mobile/mathalea}"
cible="$racine/src-tauri/typst"
paquets="$cible/paquets/preview"

# Paquets demandés par le moteur construit : table des versions de MathALÉA
# et imports écrits en toutes lettres (figures apigeom : @preview/cetz:0.3.4).
# Il faut static/moteur (pnpm moteur).
test -s "$racine/static/moteur/manifest.json" || { echo "static/moteur manquant : pnpm moteur"; exit 1; }
versions="$(node "$racine/scripts/typst/paquets-moteur.mjs" "$racine/static/moteur" 2>/dev/null)"
# Les versions déjà embarquées restent (jamais de rm) : une app installée
# reçoit des moteurs plus anciens ou plus récents que le sien, et le moteur
# téléchargé du 25 novembre 2026 demandait taskize 0.2.12, cetz 0.5.3,
# simple-plot 1.1.1 et breather 0.2.0, absents de l'app 0.7.5 : plus de PDF.
mkdir -p "$paquets"
a_faire="$versions"
vus=""
while [ -n "$a_faire" ]; do
  set -- $a_faire
  p="$1"; shift; a_faire="$*"
  case " $vus " in *" $p "*) continue ;; esac
  vus="$vus $p"
  nom="${p%%:*}"; version="${p##*:}"
  if [ -f "$paquets/$nom/$version/typst.toml" ]; then :; else
  mkdir -p "$paquets/$nom/$version"
  curl -sfL "https://packages.typst.org/preview/$nom-$version.tar.gz" | tar -xz -C "$paquets/$nom/$version"
  fi
  # Dépendances : seulement les #import (pas les exemples des commentaires)
  for dep in $(grep -rhoE '^#import "@preview/[a-z0-9-]+:[0-9.]+' "$paquets/$nom/$version" --include=*.typ | sed 's|.*@preview/||' | sort -u); do
    a_faire="$a_faire $dep"
  done
done
# Documentation des paquets : inutile à la compilation
find "$paquets" -name "*.md" -delete
echo "Paquets :$vus"

mkdir -p "$cible/polices"
assets="https://raw.githubusercontent.com/typst/typst-assets/v0.15.1/files/fonts"
for f in LibertinusSerif-Regular LibertinusSerif-Italic LibertinusSerif-Bold LibertinusSerif-BoldItalic; do
  curl -sfL "$assets/$f.otf" -o "$cible/polices/$f.otf"
done
git -C "$mathalea" show "$commit:public/fonts/typst/LibertinusMath.otf" > "$cible/polices/LibertinusMath.otf"
git -C "$mathalea" show "$commit:public/fonts/typst/OFL-LibertinusMath.txt" > "$cible/polices/OFL-Libertinus.txt"
du -sh "$cible/paquets" "$cible/polices"
