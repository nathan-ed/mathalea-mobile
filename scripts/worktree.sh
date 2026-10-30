#!/usr/bin/env bash
# Espace de travail d'une session : une branche et un worktree à côté du dépôt,
# prêts pour les tests (dépendances, moteur compilé). Plusieurs sessions
# travaillent sur ce dépôt : chacune commite sur sa branche au lieu de laisser
# son travail dans la copie de travail de main.
#   bash scripts/worktree.sh <nom> [base]   (base : main par défaut)
# Crée ../mathalea-mobile-<nom> sur la branche <nom>. Une seule suite e2e à la
# fois sur la machine : les worktrees partagent les ports 1420 et 8702.
set -euo pipefail
nom="${1:?nom de la branche}"
base="${2:-main}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
cible="$(dirname "$racine")/mathalea-mobile-$nom"
[ ! -e "$cible" ] || { echo "$cible existe déjà" >&2; exit 1; }
git -C "$racine" worktree add -b "$nom" "$cible" "$base"
cd "$cible"
pnpm install --frozen-lockfile --prefer-offline
# Moteur : copié du dépôt principal s'il correspond à moteur/, sinon construit
if [ -s "$racine/static/moteur/manifest.json" ]; then cp -r "$racine/static/moteur" static/; fi
bash scripts/moteur-a-jour.sh 2> /dev/null || pnpm moteur
echo "Prêt : $cible (branche $nom)"
