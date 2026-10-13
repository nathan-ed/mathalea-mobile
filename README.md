# MathALÉA mobile

Application de parcours MathALÉA pour élèves et enseignants : Android, iOS,
Linux, macOS, Windows. Les exercices sont générés, affichés et corrigés par le
moteur de MathALÉA, embarqué dans l'application : tout fonctionne hors
connexion. Réponses et scores restent sur l'appareil ; l'application ne
connaît aucun compte ni mot de passe.

- Guide enseignant : [docs/enseignants.md](docs/enseignants.md)
- Développement, architecture, à faire : [docs/developpement.md](docs/developpement.md)
- Installateurs : [releases/](releases/)

Dossiers de démonstration (sept parcours) à coller dans l'application :
[kDrive](https://kdrive.infomaniak.com/app/share/120240/ba6c0e4d-4386-4789-80f5-8d824146b723),
[Dropbox](https://www.dropbox.com/scl/fo/61ukfii2ul7wygvtn480a/AMdjmMSWDB0y5U5-HVi2oCU?rlkey=japzwkf6z8n5ocnc0ovxi4lrj&dl=0).

## Installer une version publiée

Dans [releases/](releases/), choisir la dernière version.

| Système | Fichier | Installation |
| --- | --- | --- |
| Android | `.apk` | Copier sur le téléphone, l'ouvrir, autoriser l'installation depuis cette source. |
| Windows | `.msi` ou `-setup.exe` | Double-clic. Windows peut avertir (application non signée) : « Informations complémentaires », « Exécuter quand même ». |
| macOS | `.dmg` (`aarch64` pour Apple Silicon, `x64` pour Intel) | Glisser l'application dans Applications. Premier lancement : clic droit, « Ouvrir » (application non notariée). |
| Linux | `.AppImage`, `.deb` ou `.rpm` | AppImage : `chmod +x` puis lancer. Debian/Ubuntu : `sudo apt install ./fichier.deb`. Fedora : `sudo dnf install ./fichier.rpm`. |
| iOS | aucun pour l'instant | Voir « iPhone et iPad » ci-dessous. |

Vérifier un fichier : `sha256sum -c SHA256SUMS` dans le dossier de la version.

### Installer l'APK sur un téléphone Android

L'application ne vient pas du Play Store : Android demande d'autoriser
l'installation depuis l'application qui ouvre l'APK.

1. Copier l'APK sur le téléphone (câble USB, drive, courriel) ou le télécharger
   depuis la page de release. `arm64` convient à presque tous les téléphones ;
   `armv7` aux plus anciens.
2. Ouvrir le fichier depuis l'application **Fichiers** (ou le navigateur).
3. Android affiche « Pour votre sécurité, l'installation d'applications
   inconnues provenant de cette source n'est pas autorisée » : toucher
   **Paramètres**, activer **Autoriser cette source**, revenir en arrière.
   (Ailleurs : Paramètres, Applications, ⋮ ou Accès spécial, **Installer des
   applis inconnues**, choisir Fichiers ou le navigateur, Autoriser.)
4. Toucher **Installer**. Si Play Protect avertit d'une application inconnue :
   « Plus de détails », **Installer quand même**.
5. Une nouvelle version s'installe par-dessus l'ancienne et garde les données,
   à condition d'être signée avec la même clé. Sinon : désinstaller d'abord.

#### Par câble, en mode développeur

Pour installer depuis un ordinateur, ou lancer l'app en développement :

1. Paramètres, **À propos du téléphone**, toucher sept fois **Numéro de build**
   (Samsung : À propos du téléphone, Informations sur le logiciel, Numéro de
   version). Le message « Vous êtes maintenant développeur » s'affiche.
2. Paramètres, Système, **Options pour les développeurs** : activer
   **Débogage USB**.
3. Brancher le téléphone, accepter « Autoriser le débogage USB » (cocher
   « Toujours autoriser depuis cet ordinateur »).
4. Sur l'ordinateur : `adb devices` doit lister le téléphone, puis
   `adb install -r MathALEA-0.1.0-android-arm64.apk` (`-r` remplace la version
   installée en gardant les données). Avec le SDK Android : `pnpm tauri android dev`
   lance l'app en développement sur le téléphone.

## Lancer depuis les sources

Prérequis : Node 22 et pnpm 10, Rust stable, et les dépendances système de
Tauri 2 (https://v2.tauri.app/start/prerequisites/). Sous Linux : WebKitGTK
4.1 (`webkit2gtk-4.1` sous Arch, `libwebkit2gtk-4.1-dev` sous Debian/Ubuntu).

```bash
pnpm install
pnpm moteur             # moteur : MathALÉA au commit moteur/COMMIT + moteur/, copié dans static/moteur
pnpm app                # application de bureau (données séparées de l'app installée)
pnpm dev                # ou dans un navigateur : http://localhost:1420
```

Dans un navigateur, les dossiers kDrive ne se lisent pas (kDrive refuse les
requêtes venant d'une autre origine) ; l'application les lit par sa partie Rust.

Données locales de l'app installée : `~/.config/fr.coopmaths.mathalea/` (Linux),
celles de `pnpm app` : `~/.config/fr.coopmaths.mathalea.dev/`. Pour repartir de
zéro, supprimer le dossier correspondant (et son pendant dans `~/.local/share/`).

## Construire

```bash
pnpm tauri build        # installateurs du système courant, dans src-tauri/target/release/bundle
```

Chaque système se construit sur lui-même : Linux sur Linux, Windows sur
Windows, macOS sur un Mac. La CI GitHub construit les quatre (voir Releases).

### Android

Prérequis : Android SDK (plateforme 37), NDK, Java 21, cibles Rust Android :

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
export ANDROID_HOME=…/sdk NDK_HOME=$ANDROID_HOME/ndk/<version>
pnpm tauri android build --apk --debug   # APK installable, signé avec la clé de debug
pnpm tauri android build --apk           # APK de release (signé si keystore.properties existe)
```

Les APK sont dans `src-tauri/gen/android/app/build/outputs/apk/`.

APK d'essai, bien plus rapide (arm64 seul, sans LTO, cache séparé) :
`scripts/apk-essai.sh`, ou `scripts/apk-essai.sh x86_64` pour l'émulateur.
Les dépendances Rust déjà compilées sont gardées dans `src-tauri/target` ;
seuls l'app et l'édition de liens sont refaits d'un build à l'autre. Sur un
téléphone branché en USB (débogage activé) : `pnpm tauri android dev`.

### iPhone et iPad

Il faut un Mac avec Xcode, et un compte Apple :

```bash
pnpm tauri ios init
pnpm tauri ios dev          # simulateur, ou iPhone branché
pnpm tauri ios build        # .ipa
```

- Avec un identifiant Apple gratuit, Xcode installe l'application sur votre
  propre iPhone pour sept jours.
- Pour la distribuer (TestFlight, App Store), il faut un compte Apple
  Developer (99 USD par an).

### macOS seulement pour essayer

Sur un Mac : `pnpm tauri build`, puis ouvrir `src-tauri/target/release/bundle/dmg/`.
Ou télécharger le `.dmg` d'une release.

## Tests

```bash
pnpm check                  # types (svelte-check)
pnpm test                   # tests unitaires (partage, versions, sessions, sauvegarde)
cd src-tauri && cargo test -- --include-ignored   # dont la lecture des dossiers kDrive et Dropbox de démonstration
```

Test de bout en bout (trois appareils simulés, format téléphone) :

```bash
pnpm dev                                                   # terminal 1
cd ../parcours-spikes/spike-sync && pnpm run server /tmp/drive # terminal 2 : dossier partagé local
npx tsx e2e/preparer.mts /tmp/drive                        # dépose les parcours de test
DOSSIER=/tmp/drive pnpm e2e
node e2e/regressions.mjs    # défauts corrigés (brouillon, Entrée, suivi) : pnpm dev suffit
node e2e/captures-enseignant.mjs /tmp/captures   # espace enseignant en clair et en sombre, 390 px
```

## Clés et secrets

Deux clés, à créer une seule fois et à garder hors du dépôt (gestionnaire de
mots de passe, coffre de l'équipe). Les perdre empêche de publier des mises
à jour ; les changer impose une nouvelle version de l'app.

| Clé | Sert à | Créer | Où la mettre |
| --- | --- | --- | --- |
| Signature Android (`.jks`) | signer les APK ; Android refuse une mise à jour signée par une autre clé | `keytool -genkey -v -keystore mathalea.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mathalea` | local : `src-tauri/gen/android/keystore.properties` (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`, ignoré par Git) ; GitHub, Settings, Secrets : `ANDROID_KEYSTORE` (`base64 -w0 mathalea.jks`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` |
| Signature du moteur (Ed25519, `.pem`) | signer les mises à jour du moteur téléchargées par l'app | `node scripts/cles-moteur.mjs moteur-ed25519.pem` (affiche la clé publique) | clé publique : `CLE_PUBLIQUE` dans `src-tauri/src/moteur.rs` ; clé privée : chez qui publie (secret de CI) |

Les clés actuelles sont des clés **de test** (sur la machine de Nathan). Avant
une diffusion large : créer les vraies, remplacer les secrets GitHub et
`CLE_PUBLIQUE`, fixer `URL_MISES_A_JOUR` (même fichier), puis publier une
version. Installer la première APK signée par la vraie clé demande de
désinstaller une fois l'ancienne.

Publier un moteur (sans nouvelle version de l'app) :

```bash
pnpm moteur                                                     # construit static/moteur
node scripts/publier-moteur.mjs static/moteur sortie/ moteur-ed25519.pem
# déposer sortie/moteur-*.tar.gz, puis mise-a-jour.json et mise-a-jour.json.sig à URL_MISES_A_JOUR
```

Détails : [docs/developpement.md](docs/developpement.md#moteur-servi-par-coopmaths).

## Releases

Outils : `gh` (GitHub) et `glab` (forge) connectés, Git LFS, `jq`. Le dépôt de
référence est sur la forge ; un miroir **privé** sur GitHub (`github`) sert à
construire Linux, Windows, macOS (ARM et Intel) et Android
(`.github/workflows/release.yml`).

1. Monter la version dans `package.json`, `src-tauri/tauri.conf.json` et
   `src-tauri/Cargo.toml`. Lancer tous les tests (voir ci-dessus), commiter,
   pousser sur `origin` et `github`.
2. Construire sur GitHub :
   `gh workflow run release.yml --repo nathan-ed/mathalea-mobile -f version=v0.2.0 -f cibles=tout`
   (`bureau` ou `android` pour une partie ; un tag `v*` le lance aussi).
   Suivi : `gh run watch <id> --exit-status`. Résultat : release brouillon.
3. APK construites ici, en parallèle (prioritaires sur celles de la CI) :
   `pnpm tauri android build --apk --split-per-abi --target aarch64 --target armv7`.
4. `APK_LOCALES=1 scripts/release.sh v0.2.0` : range les fichiers dans
   `releases/v0.2.0/` (noms uniformes, Git LFS, `SHA256SUMS`) et crée ou
   complète la release de la forge. Commiter `releases/`, pousser. Le
   script se relance quand la CI a fini : APK d'abord, le reste ensuite.

## Licence

AGPL-3.0-or-later, comme MathALÉA.
