# Développement

## Architecture

Application Tauri 2 : interface Svelte 5 (SvelteKit en mode statique) et une
petite partie Rust (stockage SQLite, téléchargement des dossiers partagés,
fichiers).

### Moteur MathALÉA

L'application ne contient pas le code de MathALÉA : elle charge à l'exécution
un **paquet moteur** construit depuis le dépôt MathALÉA (branche
`moteur-embarquable` : `src/moteur/index.ts`, `vite.moteur.config.ts`).

- `pnpm moteur` construit ce paquet (`dist-moteur/` : `moteur.js`, ses
  morceaux, `moteur.css`, polices, `manifest.json`) et le copie dans
  `static/moteur/` (non versionné). Taille : 70 Mo sur disque, 20 Mo
  compressé.
- `src/lib/moteur.ts` le charge (`import()` dynamique) et vérifie la version
  d'API (`API_MOTEUR`).
- API : `preparerExercice` (uuid, paramètres, graine), `afficher` (KaTeX,
  MathLive, figures), `verifier`, `ecrireReponses`, `monterClavier` (clavier
  de MathALÉA), `listerExercices` (référentiel FR ou CH), `definirLangue`
  (`fr-CH` : notations suisses).
- L'interface reprend les classes Tailwind de MathALÉA, compilées dans
  `moteur.css` : n'utiliser que des classes présentes dans le site
  (`src/lib/ui/classes.ts`).

### Données

| Fichier | Rôle |
| --- | --- |
| `src/lib/catalogue.ts` | types : parcours, étapes, présentation, validation |
| `src/lib/progression.ts` | séances (version figée du parcours, graines, brouillons, essais), score à la première vérification, bilans, sessions partagées |
| `src/lib/partage.ts` | fichier `parcours-mathalea.json` (plusieurs classes), lecture des drives |
| `src/lib/bibliotheque.ts` | parcours de l'enseignant, versions, export |
| `src/lib/sauvegarde.ts` | sauvegarde et restauration (avec retour arrière) |
| `src/lib/stockage.ts` | SQLite dans Tauri, `localStorage` dans un navigateur |
| `src-tauri/src/telechargement.rs` | téléchargement sans en-tête `Origin` |

Règles :

- Une séance embarque une copie du parcours (`contenu`). Rejouer, relire ou
  reprendre une séance ne dépend jamais de la version courante.
- Résultats rangés par version (`resultats:<id>@<version>`).
- Session partagée : graine = `code-id-vversion-étape`. Même code et même
  version : mêmes exercices.
- Aucune donnée ne quitte l'appareil ; l'app ne stocke aucun identifiant.

### Partage

L'enseignant exporte un fichier et le dépose dans un dossier partagé par lien
public. `partage.ts` lit ce fichier selon le drive :

| Drive | Méthode |
| --- | --- |
| kDrive | service de la page de partage : `/2/app/<drive>/share/<uuid>/init`, `/files/<id>/files`, `/files/<id>/download` (non documenté par Infomaniak, déjà utilisé par sonoTour) |
| Dropbox | `dl=1` : un dossier arrive en zip, un fichier tel quel |
| Google Drive | lien de fichier : `uc?export=download` ; lien de dossier : API Drive avec une clé (`VITE_CLE_API_GOOGLE`, non fournie) |
| autres | `<lien>/parcours-mathalea.json` |

kDrive redirige vers une page d'erreur toute requête qui porte un en-tête
`Origin` étranger : dans l'app, les téléchargements passent par la commande
Rust `telecharger`.

## Tests

- `pnpm check` : types.
- `pnpm test` : unitaires (`tests/`) : drives simulés, fichier à plusieurs
  classes, ancien format, versions, sessions, sauvegarde.
- `cargo test -- --include-ignored` (dans `src-tauri`) : lecture du dossier
  kDrive de démonstration.
- `pnpm e2e` : bout en bout, trois appareils simulés (voir README). Parcours
  de test : `tests/parcours-de-test.ts`, déposés par `e2e/preparer.mts`.

## Signature Android

Créer la clé une fois, la garder hors du dépôt :

```bash
keytool -genkey -v -keystore mathalea.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mathalea
```

Sur GitHub (Settings, Secrets) : `ANDROID_KEYSTORE` (`base64 -w0 mathalea.jks`),
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
En local : `src-tauri/gen/android/keystore.properties` (ignoré par Git) avec
`storeFile`, `storePassword`, `keyAlias`, `keyPassword`.

Toutes les versions doivent être signées avec la même clé, sinon Android
refuse la mise à jour.

## Feuille de route

### 0.1.1

- Mises à jour du moteur sans réinstaller l'app (fait ; adresse de publication
  à fixer) : voir « Moteur servi par Coopmaths » ci-dessous.
- Explorer : catalogue de parcours proposés par l'équipe MathALÉA, au format
  `parcours-mathalea.json` (fait ; adresse provisoire `URL_EXPLORER` dans
  `src/lib/partage.ts`, `VITE_URL_EXPLORER` pour les essais). Copie locale hors
  connexion ; « Ajouter à l'accueil » garde une copie du parcours, qui suit ses
  nouvelles versions.
- Titres d'exercices : titre MathALÉA sans référence par défaut, modifiable ou
  masqué à la création (fait).
- Séance : la barre d'actions ne suit plus le clavier qui se referme (fait).
- Éditeur de parcours sur un seul écran ; navigateur d'exercices par niveau
  et chapitre, réglages (`decrireExercice` du moteur) et aperçu (fait).
- Dossiers partagés : tous les `.json` à la racine du dossier lus (pas les
  sous-dossiers), fusion par
  identifiant à la version la plus haute (`fusionner`) ; téléchargement de la
  banque ou d'un parcours seul après l'enregistrement ; import d'un fichier
  (fait). Dossier de test : `npx tsx scripts/dossier-test.mts <sortie>`,
  vérification d'un lien réel : `npx tsx scripts/verifier-dossier.mts <lien>`.
- `scripts/release.sh` : noms uniformes des fichiers
  (`MathALEA-<v>-<système>.<ext>`) et release de la forge via `glab`.

### 0.1.2

- Compétences : dictionnaire par chapitre, modifiable dans l'app ou importé en
  JSON ; à la création d'un parcours, étiqueter rapidement chaque exercice
  avec une ou plusieurs compétences ; suivi de l'élève par compétence.

## À faire (sans version fixée)

### Moteur servi par Coopmaths

Le mécanisme est en place (0.1.1) ; il manque l'adresse de publication.

- Publication : `node scripts/publier-moteur.mjs <dist-moteur> <sortie> <clé privée>`
  produit `moteur-<version>.tar.gz`, `mise-a-jour.json` (version, API, date,
  taille, SHA-256) et `mise-a-jour.json.sig` (signature Ed25519). Les trois
  fichiers se déposent à l'adresse `URL_MISES_A_JOUR` (`src-tauri/src/moteur.rs`,
  provisoire : à fixer avec l'équipe ; `MATHALEA_MOTEUR_URL` pour les essais).
- Clé : `node scripts/cles-moteur.mjs <fichier .pem>` crée la paire ; la clé
  publique remplace `CLE_PUBLIQUE` dans `moteur.rs`. La clé actuelle est une
  clé de test (privée dans `~/.local/share/mathalea-mobile/` sur la machine de
  Nathan) : Coopmaths génère la sienne et la garde dans les secrets de sa CI.
- App : au lancement, `chargerMoteur()` prend le plus récent entre le moteur
  livré et le moteur téléchargé (`moteur://`, repli sur le livré en cas
  d'échec), puis `mettre_a_jour_moteur` cherche une publication plus récente :
  signature, même `API_MOTEUR`, taille et SHA-256, extraction dans
  `<données>/moteurs/`, activation au lancement suivant. Réglages : version du
  moteur et recherche manuelle.
- Tests : `cargo test moteur` (publication valide, ancienne, autre API,
  signature d'une autre clé, archive altérée) ; publication réelle du script :
  `MOTEUR_PUBLICATION=<sortie> cargo test -- --ignored`.

Reste à faire :

1. Choisir l'adresse publique et la renseigner dans `URL_MISES_A_JOUR`.
2. Dans la CI de MathALÉA, à chaque mise en production : construire le moteur,
   le publier avec `publier-moteur.mjs` et la clé de Coopmaths.
3. Un parcours pourra indiquer la version minimale du moteur (exercice récent) :
   télécharger avant d'ouvrir, ou signaler « connexion nécessaire ».
4. Wi-Fi seulement pour les 20 Mo ? Réglage à prévoir sur Android.

### MathALÉA

- Fusionner la branche `moteur-embarquable` (moteur, `version.ts` sans appel
  réseau dans le moteur, `definirLangue`) et documenter le moteur dans
  `documentation/`.
- Lancer `pnpm prebuild-unit-tests` sur cette branche.
- Branche `flowmath-evenements-verification` (événements de vérification pour
  les intégrations par iframe) : indépendante de l'app, à proposer à part.

### Application

- Remplacer la clé de signature Android de test (secrets GitHub) par la clé
  définitive de Coopmaths ; les APK signés avec l'une ne mettent pas à jour
  ceux signés avec l'autre (désinstaller une fois).
- Livrer le moteur comme ressource Android (`assets`, une seule copie) au lieu
  de l'inclure dans le binaire de chaque architecture ; prépare aussi la v2.
- Essayer sur iPhone (Mac nécessaire) et sur d'autres téléphones Android :
  clavier, figures, PDF, mode avion.
- Ressources des parcours (PDF, images) à côté du fichier de classe.
- Clé d'API Google pour lire les dossiers Google Drive.
- CI : quand `moteur-embarquable` sera dans MathALÉA, supprimer la release
  `moteur` du miroir GitHub ; le workflow construira alors le moteur depuis la
  forge.
