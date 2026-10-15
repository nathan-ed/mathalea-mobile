#!/usr/bin/env bash
# Signe des APK en v1, v2 et v3. AGP ne pose pas la signature v1 quand
# minSdk >= 24, or certains installateurs de constructeurs (MIUI…) refusent
# une APK sans elle. Clé : src-tauri/gen/android/keystore.properties.
#   scripts/signer-apk.sh <apk>...
set -euo pipefail
racine="$(cd "$(dirname "$0")/.." && pwd)"
proprietes="$racine/src-tauri/gen/android/keystore.properties"
[ -f "$proprietes" ] || { echo "Pas de keystore.properties : APK laissées telles quelles"; exit 0; }
# Valeurs écrites par cle-android.sh : \\ redevient \
prop() { grep "^$1=" "$proprietes" | cut -d= -f2- | sed 's/\\\\/\\/g'; }
sdk="${ANDROID_HOME:-$HOME/.local/share/the-file-android/sdk}"
apksigner="$(ls -d "$sdk"/build-tools/* | sort -V | tail -1)/apksigner"
mdp="$(mktemp)"; mdpcle="$(mktemp)"
trap 'rm -f "$mdp" "$mdpcle"' EXIT
prop storePassword > "$mdp"; prop keyPassword > "$mdpcle"
for apk in "$@"; do
  "$apksigner" sign --ks "$(prop storeFile)" --ks-key-alias "$(prop keyAlias)" \
    --ks-pass "file:$mdp" --key-pass "file:$mdpcle" \
    --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true "$apk"
  rm -f "$apk.idsig"
  # Échec de vérification : arrêt ; avertissements sur META-INF (couvert par v2) masqués
  sortie=$("$apksigner" verify --min-sdk-version 18 "$apk" 2>&1) || { echo "$sortie"; exit 1; }
  echo "$sortie" | grep -v "^WARNING: META-INF" || true
  echo "Signée v1, v2, v3 : $apk"
done
