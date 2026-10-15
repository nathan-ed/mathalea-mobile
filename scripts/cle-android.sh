#!/usr/bin/env bash
# Écrit src-tauri/gen/android/keystore.properties (CI) depuis des variables
# d'environnement, jamais depuis le texte du workflow : un mot de passe avec
# $, \, " ou ` passe alors tel quel.
# PROPRIETES : autre fichier de sortie (script lancé hors du dépôt).
#   CLE_BASE64=… CLE_MOT_DE_PASSE=… CLE_ALIAS=… CLE_MOT_DE_PASSE_CLE=… scripts/cle-android.sh <fichier.jks>
set -euo pipefail
fichier="${1:?Chemin du .jks attendu}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
sortie="${PROPRIETES:-$racine/src-tauri/gen/android/keystore.properties}"
printf '%s' "$CLE_BASE64" | base64 -d > "$fichier"
# Format .properties : la barre oblique inverse s'échappe
echapper() { local v="${1//\\/\\\\}"; printf '%s' "$v"; }
{
  printf 'storeFile=%s\n' "$(echapper "$fichier")"
  printf 'storePassword=%s\n' "$(echapper "$CLE_MOT_DE_PASSE")"
  printf 'keyAlias=%s\n' "$(echapper "$CLE_ALIAS")"
  # Clé PKCS12 (keytool récent) : même mot de passe que le fichier si non fourni
  printf 'keyPassword=%s\n' "$(echapper "${CLE_MOT_DE_PASSE_CLE:-$CLE_MOT_DE_PASSE}")"
} > "$sortie"
