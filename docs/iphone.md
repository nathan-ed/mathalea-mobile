# MathALÉA sur iPhone et iPad

Un iPhone n'installe que des apps signées par Apple. La voie simple pour les
collègues est **TestFlight** : ils ouvrent un lien, l'app s'installe et se met
à jour seule. Tout se fait depuis un ordinateur sans Mac (Linux, Windows) : le
site d'Apple dans le navigateur, l'onglet Actions de GitHub. La compilation et
la signature tournent sur un Mac de GitHub (`.github/workflows/ios.yml`),
gratuit pour un dépôt public.

## Ce qui ne marche pas pour les collègues

- **Sideloadly, AltStore** avec un identifiant Apple gratuit (`.ipa` non
  signée de `ios.yml`, case « ipa ») : il faut un ordinateur et l'app expire
  au bout de 7 jours.
- **Xcode** avec l'iPhone branché : réservé à un Mac de développeur.
- Le **simulateur** (workflow `emulateurs`) sert aux tests : rien ne s'installe
  sur un vrai iPhone par ce chemin.

## Une fois : compte et clés

1. **Programme développeur Apple**, au nom de l'association CoopMaths
   (organisation, numéro D-U-N-S) : developer.apple.com/programs/enroll.
   Apple vérifie l'entité juridique, souvent par un appel à son représentant
   (quelques jours à deux semaines). Exonération des 99 $ par an pour
   association à but non lucratif demandée en octobre 2026 : réponse en
   quelques semaines.
2. **Team ID** : developer.apple.com, « Membership ».
3. **App Store Connect** (appstoreconnect.apple.com) :
   - « Apps », « + », « Nouvelle app » : plateforme iOS, nom « MathALÉA »,
     identifiant de lot `fr.coopmaths.mathalea`, langue française.
   - « Utilisateurs et accès », « Intégrations », « Clés d'API App Store
     Connect » : créer une clé, rôle **App Manager**. Télécharger le fichier
     `.p8` (possible une seule fois), noter l'**ID de la clé** et l'**ID de
     l'émetteur** (Issuer ID, en haut de la page).
4. **Secrets GitHub** : dépôt `nathan-ed/mathalea-mobile`, « Settings »,
   « Secrets and variables », « Actions », « New repository secret » :

   | Secret | Valeur |
   | --- | --- |
   | `APPLE_API_KEY_P8` | tout le contenu du fichier `.p8` |
   | `APPLE_API_KEY_ID` | l'ID de la clé |
   | `APPLE_API_ISSUER` | l'ID de l'émetteur |
   | `APPLE_DEVELOPMENT_TEAM` | le Team ID |

### Sans clé d'API : certificat et profil (signature manuelle)

Seul le titulaire du compte peut ouvrir l'accès à l'API App Store Connect
(un Admin voit « Demander l'accès » grisé). Un Admin peut signer sans lui ;
l'app obtenue est la même, mais le profil est à refaire chaque année et
l'envoi se fait avec son identifiant Apple. `ios.yml` prend la clé d'API si
elle existe, sinon cette voie.

1. Clé privée et demande de certificat, hors du dépôt :
   `openssl req -new -newkey rsa:2048 -nodes -keyout distribution.key -out distribution.csr -subj "/CN=CoopMaths/C=FR"`
   (dans `~/.local/share/mathalea-mobile/apple/` chez Nathan).
2. developer.apple.com, « Certificats », « + », **Apple Distribution** :
   envoyer `distribution.csr`, télécharger `distribution.cer`.
3. « Profils », « + », **App Store Connect**, identifiant
   `fr.coopmaths.mathalea`, ce certificat : télécharger le `.mobileprovision`.
   Valable un an : en refaire un (même certificat) et remplacer le secret.
4. Certificat en `.p12` (`-legacy` : le trousseau de macOS refuse le format
   par défaut d'OpenSSL 3) :
   ```
   openssl x509 -inform DER -in distribution.cer -out distribution.pem
   openssl pkcs12 -export -legacy -inkey distribution.key -in distribution.pem -out distribution.p12
   ```
5. account.apple.com, « Connexion et sécurité », « Mots de passe pour les
   apps » : en créer un pour la CI.
6. Secrets GitHub :

   | Secret | Valeur |
   | --- | --- |
   | `IOS_CERTIFICATE` | `base64 -w0 distribution.p12` |
   | `IOS_CERTIFICATE_PASSWORD` | le mot de passe du `.p12` |
   | `IOS_MOBILE_PROVISION` | `base64 -w0 <profil>.mobileprovision` |
   | `APPLE_ID` | l'identifiant Apple de l'Admin |
   | `APPLE_APP_PASSWORD` | le mot de passe pour app |
   | `APPLE_DEVELOPMENT_TEAM` | le Team ID (`U2463X724U`) |

## À chaque version : envoi à TestFlight

1. GitHub, onglet « Actions », workflow **ios**, « Run workflow » : choisir le
   tag de la version (par exemple `v0.4.10`) et cocher **« Signer et envoyer à
   TestFlight »**.
2. Le Mac de GitHub construit le moteur (le nôtre, `scripts/moteur.sh`), signe
   l'app avec la clé d'API (certificats et profils créés automatiquement) et
   l'envoie. Numéro de compilation daté, toujours croissant.
3. La version apparaît dans App Store Connect, « TestFlight », après le
   traitement d'Apple (de quelques minutes à une heure).

## Le lien pour les collègues

1. App Store Connect, « TestFlight », « Testeurs externes », « + » : créer un
   groupe (par exemple « Enseignants »), y ajouter la version.
2. Remplir ce que demande la vérification d'Apple : description courte,
   adresse de contact, **politique de confidentialité** (page publique de
   `docs/confidentialite.md`). La première version d'un groupe externe passe
   une vérification (en général un jour), les suivantes presque jamais.
3. Activer le **lien public** du groupe et le diffuser.
4. Chez un collègue : installer l'app **TestFlight** depuis l'App Store,
   ouvrir le lien sur l'iPhone, « Accepter », « Installer ». Les nouvelles
   versions arrivent seules (notification TestFlight).

Une version TestFlight reste valable 90 jours : en envoyer une nouvelle avant.

## Le jour où le compte est ouvert

1. Team ID, clé d'API et secrets GitHub (plus haut, « Une fois »).
2. App Store Connect, « Nouvelle app » : nom, identifiant de lot, et la fiche
   de `docs/fiche-boutiques.md`, section « App Store » (sous-titre, mots-clés,
   classification 4+, « Données non collectées », notes pour la
   vérification).
3. Captures iPhone 6,9 pouces et iPad 13 pouces :
   `APPAREILS=iphone-6-9,ipad-13 node e2e/fiche-play.mjs <dossier>`.
4. Workflow **ios** sur le dernier tag, case « Signer et envoyer à
   TestFlight » ; essayer la version TestFlight sur un vrai iPhone (caméra
   des QR codes comprise).
5. « Distribution » : choisir cette compilation, « Soumettre pour
   vérification ». Compter un à deux jours ; une première app est souvent
   refusée une fois (réponse dans le « Resolution Center », puis nouvel
   envoi).
Pour l'App Store ensuite : même version, « Distribution », fiche de
`docs/fiche-boutiques.md` (catégorie Éducation, 4+, pas la catégorie
Enfants).

## Tests sur iPhone avant d'envoyer

Le workflow **emulateurs** joue un élève dans l'app sur le simulateur iPhone
(Appium, `e2e/appareil-ios.mjs`) : premier lancement, défilement au doigt,
parcours de démonstration répondu juste au clavier de MathALÉA jusqu'au bilan,
« Quitter », thème sombre. Captures du vrai écran dans les artefacts
(`captures-iphone`) et dans le journal.

## Mac : .dmg signé et notarisé

Sans signature, macOS affiche « développeur non identifié » (ou « Apple n'a
pas pu vérifier… ») à l'ouverture. Il faut un certificat **Developer ID
Application**, que seul le **titulaire du compte** peut créer, puis la
notarisation par Apple (faisable avec l'identifiant Apple d'un Admin).

1. Demande de certificat, hors du dépôt :
   `openssl req -new -newkey rsa:2048 -nodes -keyout developer-id.key -out developer-id.csr -subj "/CN=CoopMaths/C=FR"`
   (dans `~/.local/share/mathalea-mobile/apple/` chez Nathan).
2. Le titulaire : developer.apple.com, « Certificats », « + »,
   **Developer ID Application** (G2 Sub-CA), envoie `developer-id.csr`,
   transmet le `.cer` (non secret).
3. `.p12` comme pour l'iPhone (`openssl x509 -inform DER …`, puis
   `openssl pkcs12 -export -legacy …`), puis secrets GitHub
   `APPLE_DEVID_CERTIFICATE` (`base64 -w0`) et
   `APPLE_DEVID_CERTIFICATE_PASSWORD`. La notarisation reprend `APPLE_ID`,
   `APPLE_APP_PASSWORD` et `APPLE_DEVELOPMENT_TEAM`.
4. Chaque release : `release.yml` signe l'app (runtime renforcé, droit
   caméra pour les QR codes), la fait notariser, puis signe et notarise le
   `.dmg`. Pour une version publiée avant (0.5.0) : workflow **macos**
   (`gh workflow run macos.yml -f version=v<x>`), qui remplace les `.dmg` de
   la release GitHub (même nom), puis `scripts/release.sh v<x>` pour la forge.

Certificat valable cinq ans.
