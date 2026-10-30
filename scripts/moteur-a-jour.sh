#!/usr/bin/env bash
# Échoue si static/moteur n'a pas été construit à partir de moteur/ tel qu'il
# est : un moteur d'avant la dernière correction fait échouer (ou passer) les
# suites à tort, et part dans les APK. L'empreinte est celle de scripts/moteur.sh.
#   bash scripts/moteur-a-jour.sh
set -euo pipefail
cd "$(dirname "$0")/.."
test -s static/moteur/manifest.json || { echo "static/moteur manquant : pnpm moteur" >&2; exit 1; }
empreinte="$(cd moteur && find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -c1-7)"
grep -q "\"version\":\"[^\"]*\.$empreinte\"" static/moteur/manifest.json || {
  echo "static/moteur ($(grep -o '"version":"[^"]*"' static/moteur/manifest.json)) ne correspond pas à moteur/ ($empreinte) : pnpm moteur" >&2
  exit 1
}
