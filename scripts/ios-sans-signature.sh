#!/usr/bin/env bash
# Coupe la signature du projet iOS généré, pour une .ipa non signée (CI,
# ios.yml) que la personne signe ensuite avec son identifiant Apple.
# Tauri régénère le projet Xcode depuis project.yml : la coupure va là.
set -euo pipefail
yml=src-tauri/gen/apple/project.yml
grep -q CODE_SIGNING_ALLOWED "$yml" || sed -i.orig 's/^      PRODUCT_BUNDLE_IDENTIFIER: fr.coopmaths.mathalea$/&\
      CODE_SIGNING_ALLOWED: "NO"\
      CODE_SIGNING_REQUIRED: "NO"\
      CODE_SIGN_IDENTITY: ""/' "$yml"
grep -n "CODE_SIGNING_ALLOWED" "$yml"
(cd src-tauri/gen/apple && xcodegen generate)
