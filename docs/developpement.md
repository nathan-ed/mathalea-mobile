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

## À faire

### Version 2 : moteur servi par Coopmaths

Aujourd'hui, le moteur est livré avec l'application : de nouveaux exercices
MathALÉA demandent une nouvelle version de l'app. Objectif : les télécharger
sans mise à jour de l'app.

1. Dans la CI de MathALÉA, à chaque fusion dans `main` : construire le moteur,
   publier `moteur-<version>.tgz` (20 Mo) et `manifest.json` à une adresse fixe
   (ex. `coopmaths.fr/alea/moteur/`).
2. Signer le manifeste (clé Coopmaths, Ed25519) ; l'app embarque la clé
   publique et refuse un moteur non signé ou d'API incompatible.
3. Dans l'app : au lancement, en Wi-Fi, comparer la version ; télécharger
   l'archive, vérifier la signature et la somme, décompresser dans un nouveau
   dossier des données de l'app, activer au lancement suivant. Garder le
   moteur livré comme secours.
4. `dossierMoteur()` (`src/lib/moteur.ts`) pointe alors vers le moteur actif.
5. Un parcours peut indiquer la version minimale du moteur (exercice récent) :
   télécharger avant d'ouvrir, ou signaler « connexion nécessaire ».
6. Garder les séances commencées sur la version de moteur qui a tiré leurs
   graines, ou s'appuyer sur la règle de stabilité des graines de MathALÉA
   (`stability:check`).

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
