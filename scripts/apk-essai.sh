#!/usr/bin/env bash
# APK d'essai rapide : arm64 seulement (ou x86_64 pour l'émulateur), sans LTO.
# Dossier de compilation séparé (target-essai) : les caches de l'essai et de la
# release ne s'invalident pas l'un l'autre.
#   scripts/apk-essai.sh            # téléphone (arm64)
#   scripts/apk-essai.sh x86_64     # émulateur
set -euo pipefail
cible="${1:-aarch64}"
export PATH="$HOME/.cargo/bin:$PATH"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/.local/share/the-file-android/sdk}"
export NDK_HOME="${NDK_HOME:-$(ls -d "$ANDROID_HOME"/ndk/* | sort -V | tail -1)}"
export CARGO_TARGET_DIR="$(dirname "$0")/../src-tauri/target-essai"
export CARGO_PROFILE_RELEASE_LTO=false CARGO_PROFILE_RELEASE_CODEGEN_UNITS=16 CARGO_PROFILE_RELEASE_OPT_LEVEL=2
pnpm tauri android build --apk --split-per-abi --target "$cible"
