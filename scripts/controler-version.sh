#!/usr/bin/env bash
# Ce qu'une version doit avoir avant le tag : notes de version (forge et
# Google Play) et numéro monté dans les trois fichiers. Utilisé par
# scripts/publier.sh et par publication.yml.
#   bash scripts/controler-version.sh v0.4.10
set -euo pipefail
version="${1:?Version attendue, ex. v0.4.10}"
cd "$(dirname "$0")/.."
v="${version#v}"
test -f "docs/notes-de-version/$version.md" || { echo "Note de version manquante : docs/notes-de-version/$version.md"; exit 1; }
test -f "docs/notes-de-version/$version.play.txt" || { echo "Note Google Play manquante : docs/notes-de-version/$version.play.txt"; exit 1; }
for f in package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml; do
  grep -q "\"$v\"\|= \"$v\"" "$f" || { echo "Version $v absente de $f"; exit 1; }
done
