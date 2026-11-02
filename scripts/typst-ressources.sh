#!/usr/bin/env bash
# Ressources du compilateur Typst embarqué (src-tauri/typst/) : paquets
# @preview utilisés par les fiches de MathALÉA (versions lues dans
# typstPackages.ts au commit du moteur, plus leurs dépendances) et polices
# par défaut des fiches (Libertinus Serif et Libertinus Math).
# À relancer après un changement de moteur/COMMIT.
set -euo pipefail
racine="$(cd "$(dirname "$0")/.." && pwd)"
commit="$(cat "$racine/moteur/COMMIT")"
mathalea="${MATHALEA_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/mathalea-mobile/mathalea}"
cible="$racine/src-tauri/typst"
paquets="$cible/paquets/preview"

versions="$(git -C "$mathalea" show "$commit:src/components/setup/typst/typstPackages.ts" |
  sed -n "/VERSIONS = {/,/}/p" | sed -nE "s/^ *'?([a-z0-9-]+)'?: '([0-9.]+)',?/\1:\2/p")"
rm -rf "$cible/paquets"
mkdir -p "$paquets"
a_faire="$versions"
vus=""
while [ -n "$a_faire" ]; do
  set -- $a_faire
  p="$1"; shift; a_faire="$*"
  case " $vus " in *" $p "*) continue ;; esac
  vus="$vus $p"
  nom="${p%%:*}"; version="${p##*:}"
  mkdir -p "$paquets/$nom/$version"
  curl -sfL "https://packages.typst.org/preview/$nom-$version.tar.gz" | tar -xz -C "$paquets/$nom/$version"
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
