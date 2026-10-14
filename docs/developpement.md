# Développement

## Architecture

Application Tauri 2 : interface Svelte 5 (SvelteKit en mode statique) et une
petite partie Rust (stockage SQLite, téléchargement des dossiers partagés,
fichiers).

### Moteur MathALÉA

L'application ne contient pas le code de MathALÉA : elle charge à l'exécution
un **paquet moteur** construit depuis le dépôt MathALÉA (branche
`moteur-embarquable` : `src/moteur/index.ts`, `vite.moteur.config.ts`).

- Source : `moteur/` (fichiers ajoutés à MathALÉA et commit de référence,
  voir `moteur/README.md`), en attendant la MR dans MathALÉA.
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

### Interface d'app

- Bouton retour du téléphone : `src/lib/navigation.svelte.ts`. Chaque
  composant déclare ce que « retour » referme chez lui (`retourSi`) ; sinon
  la page revient à l'écran précédent. L'historique garde une seule entrée
  en plus de la page (sans changer d'adresse) : Android revient en arrière
  par défaut tant qu'elle existe, puis quitte l'app depuis l'accueil.
- `EnTete` : logo à l'accueil, ailleurs retour et titre. Onglets élève en bas
  (`BarreOnglets`), confirmations dans un panneau du bas (`Feuille`), bouton
  flottant pour l'action principale de l'enseignant.
- Lancement : `app.html` affiche le dé MathALÉA qui tourne et applique le
  thème avant tout chargement ; retiré quand le moteur est prêt. Android :
  fond de fenêtre aux couleurs canvas (`res/values*/colors.xml`), icônes de
  la barre d'état selon le thème de l'app (commande `barre_etat`,
  `PartagePlugin.kt`).
- iOS (à faire sur un Mac après `pnpm tauri ios init`) : fond de l'écran de
  démarrage (`LaunchScreen.storyboard`) aux couleurs canvas, couleur des
  icônes de la barre d'état, et le geste de retour par balayage du bord
  (WKWebView `allowsBackForwardNavigationGestures`, à activer côté natif ;
  la flèche de la barre de titre suffit sans lui).

## Tests

- `pnpm check` : types.
- `pnpm test` : unitaires (`tests/`) : drives simulés, fichier à plusieurs
  classes, ancien format, versions, sessions, sauvegarde.
- `cargo test -- --include-ignored` (dans `src-tauri`) : lecture du dossier
  kDrive de démonstration.
- `pnpm e2e` : bout en bout, trois appareils simulés (voir README). Parcours
  de test : `tests/parcours-de-test.ts`, déposés par `e2e/preparer.mts`.
- `node e2e/retour.mjs` : bouton retour du téléphone (simulé par
  « précédent ») à chaque niveau, confirmations de la séance.
- `node e2e/regressions.mjs` : défauts déjà corrigés (brouillon d'une question
  quittée aussitôt, Entrée avec correction à la fin, suivi après modification
  d'un parcours). Seul `pnpm dev` est nécessaire. Code de sortie 1 si un
  contrôle échoue (comme `pnpm e2e`).

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

- Fiabilité (fait) : sauvegardes et fichiers partagés validés en entier,
  brouillon gardé, Entrée sans correction anticipée, suivi sur la copie figée.

### 0.1.3

- Espace enseignant : état « à jour chez les élèves » et un seul bouton
  Publier, mise en route du dossier partagé, « Éditer un parcours existant »
  pour tous les parcours (les siens, ceux des dossiers, un fichier importé),
  « Exporter ce parcours » (nom stable), Dupliquer, ordre des parcours par
  classe, correction d'un parcours sans que les élèves voient de différence
  (résultats repris par exercice d'une version à l'autre, avec leur version).
- Dossiers suivis, Explorer et moteur relus à chaque retour dans l'app, au
  retour de la connexion et toutes les 10 minutes, sans cache (fait).

### 0.1.4

- Compétences : dictionnaire par chapitre, modifiable dans l'app ou importé en
  JSON ; à la création d'un parcours, étiqueter rapidement chaque exercice
  avec une ou plusieurs compétences ; suivi de l'élève par compétence.

## À faire (sans version fixée)

- Site MathALÉA : option pour créer un parcours directement depuis le site
  (exercices choisis, présentation, correction) et le télécharger au format
  `parcours-mathalea.json`, à déposer tel quel dans le dossier partagé ; et
  pouvoir y charger un `.json` existant pour le modifier. À proposer à
  l'équipe MathALÉA (pas de fork).
- Retour vers l'enseignant (idée de Nathan, à reprendre plus tard). Rien ne
  quitte l'appareil sans un geste de l'élève ; pas de compte ni de serveur.
  - Un format `bilan-mathalea/1`, transmis de deux façons : QR code montré en
    classe et scanné par l'app enseignant (plugin Tauri barcode-scanner,
    mobile seulement), ou fichier envoyé par le partage du téléphone (ENT,
    messagerie, drive) et importé par l'enseignant, ordinateur compris.
  - Nom montré à l'enseignant saisi une fois par l'élève, gardé sur son
    appareil, présent seulement dans les bilans qu'il envoie.
  - Contenu par parcours : identifiant, version, version du moteur ; par
    exercice : nombre de tentatives, score moyen, meilleur, dernier ; les
    réponses de la dernière et de la meilleure tentative, avec leurs
    graines. Les graines suffisent à l'app enseignant pour régénérer les
    questions et montrer réponse et correction, comme la relecture. Limite :
    il faut la même version du moteur que l'élève (sinon, scores seulement).
  - Taille mesurée (JSON compressé par deflate, deux tentatives avec
    réponses, réponses variées) : 3 × 5 questions ≈ 340 o, 5 × 5 ≈ 430 o,
    8 × 6 ≈ 630 o, 10 × 10 ≈ 1 Ko. Un QR lu d'écran à écran reste fiable
    jusqu'à 800 o à 1 Ko environ (version 20 à 25, correction M) : un
    parcours courant tient dans un QR ; au-delà, plusieurs QR à la suite
    (« 1/2, 2/2 ») ou le fichier.
  - Limite par défaut : statistiques, réponses des tentatives dernière et
    meilleure, et pas plus de 800 o environ ; au-delà, plusieurs QR.
  - Plusieurs QR : une grille sur un écran ne stocke guère plus qu'un grand
    QR de même surface (la taille des modules limite), mais elle est plus
    robuste (un QR mal lu se relit seul) ; norme « structured append » (16
    symboles au plus). Gains réels : QR qui défilent (un par demi-seconde,
    assemblés par l'app, sans limite de taille) et plusieurs téléphones
    d'élèves photographiés d'un coup (ML Kit détecte plusieurs codes par
    image ; plugin Tauri à vérifier, sinon plugin Kotlin comme le partage ;
    sur ordinateur, zxing-cpp en WebAssembly).
  - Choix de Nathan : **pas de réponses** dans le bilan, seulement le
    résultat de chaque question (dernière et meilleure tentative), le nombre
    de tentatives, les scores moyen, meilleur et dernier par exercice.
  - Essai (simulation, 13 octobre 2026) : bilans réels sans réponses
    (JSON, deflate, base64) de 216 caractères (3 × 5, QR version 11) à 360
    (10 × 10, version 14). Photos simulées (perspective, flou, bruit, JPEG)
    lues avec zxing-cpp, qui lit plusieurs codes par image :
    - 4 téléphones en 2 × 2 sur la table : 4/4 lus dans tous les cas, même en
      aperçu caméra 720p et avec le flou le plus fort ;
    - 4 téléphones en ligne (champ plus large, QR plus petits) : 4/4 avec un
      flou léger, 0/4 avec le flou fort : préférer 2 × 2, ou deux photos ;
    - 1 téléphone, grille 2 × 2 de QR (1 068 caractères) et un seul grand QR
      (version 27) : lus dans tous les cas.
    À confirmer sur de vrais téléphones (reflets d'écran, luminosité) et avec
    ML Kit sur Android avant de choisir.
  - Côté enseignant : onglet Résultats par classe, tableau élèves × exercices,
    exercices les moins réussis en tête, réponses d'un élève sur une
    question, export CSV.

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
- Actualisation (`actualiser()`, `+page.svelte`) : dossiers suivis, Explorer
  et moteur sont relus au lancement, à chaque retour dans l'app
  (`visibilitychange`), au retour de la connexion et toutes les 10 minutes
  tant que l'app est affichée (au plus une fois par minute). Requêtes en
  `no-cache` / `no-store` ; une mise à jour du moteur déjà installée n'est
  pas retéléchargée.
- Tests : `cargo test moteur` (publication valide, ancienne, autre API,
  signature d'une autre clé, archive altérée, redirections d'une forge, page
  de connexion d'un projet privé) ; publication réelle du script :
  `MOTEUR_PUBLICATION=<sortie> cargo test -- --ignored`.
- Hébergement : n'importe quel serveur HTTPS public qui sert les trois
  fichiers sous une même adresse (`<adresse>mise-a-jour.json`, etc.). Les
  redirections sont suivies. Conviennent : un dossier de coopmaths.fr,
  GitLab Pages, les fichiers d'un projet **public** de la forge
  (`…/-/raw/<branche>/<dossier>/`) ou le registre de paquets génériques
  (`…/packages/generic/moteur/<version>/`, une adresse par version : à
  éviter, l'adresse doit rester fixe). Un projet privé renvoie vers la page
  de connexion : la signature échoue, rien n'est installé. Publier l'archive
  avant `mise-a-jour.json` et sa signature, pour qu'une app ne lise jamais une
  annonce dont l'archive manque.

Reste à faire :

1. Choisir l'adresse publique et la renseigner dans `URL_MISES_A_JOUR`, avec
   la vraie clé publique dans `CLE_PUBLIQUE`, puis publier une version de
   l'app : les deux sont compilées dans l'app, les apps déjà installées
   continuent d'interroger l'ancienne adresse.
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
- CI : quand le moteur sera dans MathALÉA, supprimer `moteur/` et construire
  depuis la forge. La release `moteur` du miroir GitHub ne sert plus (à
  supprimer).
