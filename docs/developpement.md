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
  de MathALÉA), `listerExercices` (référentiel FR ou CH, ordre et nœuds du
  menu du site), `titreHtml` (formules des titres), `definirLangue`
  (`fr-CH` : notations suisses).
- `verifier(exercice, i)` : `i` est le rang dans `listeQuestions`, qui peut
  porter plusieurs rangs de réponse (`autoCorrection`) : Thales2D (3G20)
  range les deux longueurs de la question e aux rangs 2e et 2e+1. Le moteur
  les retrouve dans les éléments de réponse de l'énoncé (id
  `…Ex<n>Q<k>…`, `question-index`, `index` d'apigeom) et les vérifie tous.
- L'interface reprend les classes Tailwind de MathALÉA, compilées dans
  `moteur.css` : n'utiliser que des classes présentes dans le site
  (`src/lib/ui/classes.ts`).

### Données

| Fichier | Rôle |
| --- | --- |
| `src/lib/catalogue.ts` | types : parcours, étapes, présentation, validation |
| `src/lib/progression.ts` | séances (version figée du parcours, graines, brouillons, essais), score à la première vérification, bilans, sessions partagées |
| `src/lib/partage.ts` | fichier `parcours-mathalea.json` (plusieurs classes), lecture des drives |
| `src/lib/bibliotheque.ts` | parcours de l'enseignant, classes, préférences, versions, publication (toute la bibliothèque) et reprise |
| `src/lib/objectifs.ts` | objectifs (CSV, mémoire par exercice), états des paliers, suivi par objectif, ceintures obtenues |
| `src/lib/testNiveau.ts` | « Teste ton niveau » : sujets de CAN par niveau, tirage des questions, textes vus par l'élève (`presenterTest`), ceintures |
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
- Paliers : `paliers` donne le nombre d'exercices de chacun (les étapes
  restent une liste ; une ancienne app affiche tout le parcours), `acces`
  (`libre`, `seuil`), `seuil`, `ouverture` (instant avec le décalage de
  l'enseignant, 8 h du jour choisi (`HEURE_OUVERTURE`) : `2026-11-12T08:00:00+01:00` ; fermé
  avant, en plus de l'accès ; comparé à l'heure des serveurs, jamais à
  l'horloge du téléphone : `heure.svelte.ts`, en-tête `Date` d'une requête
  HEAD vers mathalea.fr et forge.apps.education.fr, la plus petite des deux,
  avancée par `performance.now()`, relue au retour dans l'app et toutes les
  10 minutes, seulement si un parcours a des dates ; hors ligne, fermé ; dans
  le navigateur, relais `/__heure` de `vite.config.js`), `ressource`, `pause` (contenu
  après le palier) ;
  `style` (`paliers`, `ceintures`) et `premiereCeinture`. Une séance porte sur
  un palier (`etapes`) ; le pourcentage du parcours (`complet:<id>`) ne vient
  que d'un passage sur toutes ses étapes.
- Objectifs : libellés sur les étapes (`objectifs`) ; l'objectif du programme
  vient du moteur (`listerExercices`, code sous le chapitre : `5N2` › `5N2G`).
- Affichage : `enTetesMasques` (ni numéro ni titre d'exercice, questions
  numérotées 1, 2, 3…) et `melanger` (sans effet avec un exercice par page).
  Les deux sont vrais pour un nouveau parcours ; absents (anciens parcours),
  rien ne change. L'ordre mélangé est tiré une fois toutes les questions
  préparées et gardé dans la séance (`ordre`, clés `étape-question`) ; en
  session partagée, il vient du code. `questionsOrdonnees()` sert à
  l'affichage, `questionsDe()` reste dans l'ordre des étapes (bilan, suivi).
- Teste ton niveau (Explorer, pour tous) : questions des sujets de la Course
  aux nombres de 2024 et après (référentiel FR, racine `CAN`, ids
  `can<niveau>a-<année>`), du CM1 à la Terminale. Ces sujets
  (`MetaExerciceCan`) produisent les questions demandées par `sup2`
  (« 3-7-12 »), sans changement du moteur (`node e2e/sonde-can.mjs` le
  vérifie sujet par sujet). Questions classées par
  `scripts/questions-can.mts` (lit le clone de MathALÉA de `pnpm moteur`,
  écrit `src/lib/questionsCan.json`) : pour chaque sujet, source, titre et
  domaine (mots-clés du titre ; à relancer quand le moteur change de commit).
  Un tirage = un parcours `test-niveau-<niveau>` de 15 questions : 5 parmi
  les questions 1 à 10 des sujets (automatismes), 10 parmi les suivantes,
  domaines alternés, jamais deux fois la même source ni le même titre ;
  80 % donnent la ceinture. Correction à la fin et bilan direct (`Seance`,
  `bilanDirect`), bilan question par question. La version augmente à chaque
  tirage. État dans la clé `test-niveau` (dernier tirage, date de validation
  par niveau ; `reperage` de la 0.3.0 encore lu) ; séances et historique
  sous les clés habituelles.
- Une question par page : barre de progression à segments (touchables) et
  « Question n sur N » au lieu des onglets numérotés.
- Champs placés dans une figure (`MetaInteractif2d`) : le brouillon garde le
  trou `champ1` au format de MathALÉA (`MetaInteractif2dEx<n>Q<i>` → JSON),
  lu dans la valeur LaTeX si le champ a déjà quitté la page
  (`BlocQuestion.svelte`). Sinon la réponse était perdue avec la correction
  à la fin.

### Partage

L'enseignant publie un fichier daté et le dépose dans un dossier partagé par
lien public. `partage.ts` lit tous les .json du dossier selon le drive, quel
que soit leur nom ; parmi les publications complètes (`banque: true`), seule
la plus récente compte (`fusionner`) :

| Drive | Méthode |
| --- | --- |
| kDrive | service de la page de partage : `/2/app/<drive>/share/<uuid>/init`, `/files/<id>/files`, `/files/<id>/download` (non documenté par Infomaniak, déjà utilisé par sonoTour) |
| Dropbox | `dl=1` : un dossier arrive en zip, un fichier tel quel |
| Google Drive | lien de fichier : `uc?export=download` ; lien de dossier : API Drive avec une clé (`VITE_CLE_API_GOOGLE`, non fournie) |
| Nextcloud | lien `…/s/<jeton>` : `…/s/<jeton>/download`, le dossier en zip sous un dossier de tête (un fichier partagé seul arrive tel quel) |
| autres | lien d'un `.json`, sinon `<lien>/parcours-mathalea.json` |

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
- iOS : apparence de la barre d'état selon le thème de l'app (même commande
  `barre_etat`, plugin Swift `src-tauri/ios/`) et zones sûres par
  `env(safe-area-inset-*)` ; à faire : fond de l'écran de démarrage
  (`LaunchScreen.storyboard`) aux couleurs canvas, et le geste de retour par balayage du bord
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
  « précédent ») à chaque niveau de l'élève (page d'un parcours, fiche,
  panneau du bas, onglets, Réglages), confirmations de la séance, aucune
  entrée en attente à l'accueil. Téléphone et bureau, seul `pnpm dev`.
- Liste unique des suites : `e2e/suites.json` (groupes de la matrice de
  `release.yml`, longues suites locales, suites des émulateurs, scripts hors
  vérification avec leur raison). `tests/suites-e2e.test.ts` échoue si un
  script de `e2e/` n'y est pas classé ou si `release.yml` ou `emulateurs.yml`
  s'en écartent. `scripts/verifier-release.sh` la lit et joue les suites en
  parallèle (`PARALLELE`, 4 par défaut), sauf celles qui servent le port 8702
  (`port8702`), jouées une à une. Ne pas lancer `pnpm test` pendant une suite :
  il recharge la page du serveur de dev (`.svelte-kit` régénéré).
- `node e2e/defilement-ecrans.mjs` : chaque écran (élève, Explorer,
  enseignant) et chaque panneau du bas défile au doigt jusqu'en bas et revient
  en haut, rien n'est caché sous une barre fixée, aucune liste écrasée ;
  390 × 844, 360 × 640 et bureau à la molette.
- `node e2e/auteurs.mjs` : auteurs et descriptions saisis dans l'éditeur,
  page de l'enseignant, vue de l'élève (jamais la description des enseignants).
- `node e2e/session-qr-long.mjs` : session d'un long parcours (fiches
  illustrées, 36 exercices) lancée, QR code exporté puis lu à la fausse
  caméra ; l'élève qui a déjà le parcours garde ses fiches.
- `node e2e/catalogue-moteur.mjs` : chaque exercice des parcours livrés
  préparé par le moteur sous trois graines, interactif.
- `tests/catalogues.test.ts`, `tests/invitations.test.ts` : fichiers du dépôt
  lus par l'app (paliers bien comptés, auteurs), invitations de session et de
  classe, place dans un QR code.
- `node e2e/regressions.mjs` : défauts déjà corrigés (brouillon d'une question
  quittée aussitôt, Entrée avec correction à la fin, suivi après modification
  d'un parcours). Seul `pnpm dev` est nécessaire. Code de sortie 1 si un
  contrôle échoue (comme `pnpm e2e`).
- `node e2e/changer-appareil.mjs` : un élève change de téléphone (sauvegarde
  exportée, « Récupérer mes données » au premier lancement, séance en cours
  reprise et terminée, suivi). Seul `pnpm dev` (`BASE=` pour un autre port).

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

## Google Play et App Store

Les deux boutiques interdisent de télécharger du code qui change l'app
(Google Play : « Device and Network Abuse », exception floue pour le
JavaScript d'une WebView ; Apple : règle 2.5.2, et 4.7.2 pour l'accès aux
fonctions natives). Leurs versions ne téléchargent donc pas le moteur :
`MISES_A_JOUR` (`src-tauri/src/moteur.rs`) est faux sur iOS et quand l'app est
construite avec `MATHALEA_MOTEUR_FIGE=1` ; l'app garde alors le moteur livré
et masque « Rechercher une mise à jour ». Les versions de la forge (APK,
ordinateurs) gardent les mises à jour signées depuis mathalea.fr.

- Fichier Google Play : `.aab` (Android App Bundle, arm64, armv7, x86_64),
  construit par `release.yml` (artefact `google-play`, pas dans `releases/`),
  signé avec la clé d'importation (README, tableau des clés). Numéro de
  version interne daté (`AAMMJJHH`) : toujours croissant.
- Chaque lundi, `google-play.yml` construit une version Google Play si
  mathalea.fr a publié un nouveau moteur (`scripts/moteur-publie.mjs` :
  signature, taille et SHA-256 vérifiés), avec le code du dernier tag `v*`,
  et l'envoie à la Play Console (secret `GOOGLE_PLAY_SERVICE_ACCOUNT`). Les
  élèves la reçoivent par la mise à jour automatique d'Android. À la main :
  Actions, `google-play`, « Run workflow » (moteur forcé, piste au choix).
- Signature d'application Play : la version Play est signée par Google, les
  APK de la forge par notre clé ; l'une ne met pas l'autre à jour (sauvegarder,
  désinstaller, réinstaller).
- Fiche Play : public cible avec des moins de 13 ans (règlement Familles),
  Sécurité des données « aucune donnée collectée ni partagée », politique de
  confidentialité `docs/confidentialite.md` (page `static/confidentialite.html`,
  à publier à une adresse publique).
- App Store : même règle, moteur figé d'office sur iOS. Aucun Mac nécessaire :
  `ios.yml` (GitHub, à lancer à la main) tourne sur macOS. Sans secret, il
  compile pour le simulateur, lance l'app et en fait des captures (clair,
  sombre, artefact `captures-ios`), et fournit le projet Xcode généré
  (`projet-xcode`, à verser dans `src-tauri/gen/apple`). Avec « envoi » et
  les secrets `APPLE_API_KEY_P8` (clé d'API App Store Connect, rôle App
  Manager), `APPLE_API_KEY_ID`, `APPLE_API_ISSUER` et `APPLE_DEVELOPMENT_TEAM`,
  il signe (signature automatique par la clé d'API) et envoie l'`.ipa` à
  TestFlight, numéro de compilation daté. Fiche : catégorie Éducation, 4+, pas
  la catégorie Enfants (elle impose un contrôle parental avant tout lien
  externe) ; `ITSAppUsesNonExemptEncryption` faux (`src-tauri/Info.ios.plist`).
  Pas à pas sans Mac (compte, clés, secrets, lien TestFlight) : `docs/iphone.md`.
- Partage natif iOS : plugin Swift `src-tauri/ios/` (feuille de partage,
  barre d'état, zones sûres), compilé et lié par `src-tauri/build.rs` sur macOS
  seulement, avec l'API Swift de Tauri copiée dans `src-tauri/.tauri/`.

## Feuille de route

### 0.1.1

- Mises à jour du moteur sans réinstaller l'app (fait ; adresse de publication
  à fixer) : voir « Moteur servi par Coopmaths » ci-dessous.
- Explorer : catalogue de parcours proposés par l'équipe MathALÉA, au format
  `parcours-mathalea.json`, fichiers `explorer/*.json` intégrés au build
  (`src/lib/catalogueIntegre.ts`). Catalogue en ligne optionnel par
  `VITE_URL_EXPLORER` (aucun par défaut), fusionné par version. Copie locale hors
  connexion ; « Ajouter à l'accueil » garde une copie du parcours, qui suit ses
  nouvelles versions.
- Explorer par degré puis par chapitre (`src/lib/explorer.ts`) : degrés,
  chapitres et leur ordre viennent du référentiel lu par le moteur
  (`listerExercices(pays)`), seuls ceux qui ont des parcours apparaissent. Le
  pays d'un parcours se déduit de son niveau (un degré suisse, sinon France) :
  aucun champ de plus dans le fichier. Sans moteur, niveaux de l'éditeur.
  « Commencer » ajoute le parcours à Mes parcours ; l'enseignant le reprend par
  « Donner à des classes » (`adopter`, puis sa page). Test :
  `node e2e/explorer.mjs` (catalogue d'essai servi en local, voir l'en-tête).
- Fiches de cours (`Fiche` dans `catalogue.ts`, écran `Cours.svelte`) : portées
  par le palier (`fiche`) ou le parcours, elles voyagent avec lui et la séance
  en garde la copie. Blocs texte, retenir, exemple (étapes dévoilées),
  question (non notée), graphique (tracé par l'app : `expression.ts`, sans eval,
  `GraphiqueCours.svelte`), image (SVG ou PNG intégré, fait par Typst ou TikZ)
  et lien. Texte enrichi `texteRiche.ts` (tout échappé, formules par
  `titreHtml` du moteur). `avant` : montrée d'office avant la première séance
  du palier (clé `fiches-vues`), puis « Fiche : … » sur la page du parcours et
  « Revoir la fiche » au bilan sous le seuil. Format : `docs/guide/format-parcours.md`.
- Titres d'exercices : titre MathALÉA sans référence par défaut, modifiable ou
  masqué à la création (fait).
- Séance : la barre d'actions ne suit plus le clavier qui se referme (fait).
- Éditeur de parcours sur un seul écran ; navigateur d'exercices identique au
  menu du site (niveau, chapitre, sous-chapitre, sous-thèmes en intertitres,
  même ordre ; vérifié par `e2e/referentiel-site.mjs`), réglages (`decrireExercice` du moteur) et aperçu (fait).
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

- Interface d'app et non de site (retours des testeurs) : bouton retour du
  téléphone, barre de titre, onglets en bas, panneaux du bas, bouton
  flottant, dé qui tourne au lancement, barres du système d'Android (fait).
- Installation : bibliothèques natives compressées et signatures v1, v2, v3
  (`scripts/signer-apk.sh`), après un refus sur un Xiaomi sous MIUI 12 (fait).
- WebView trop ancien (moins de Chrome 111, minimum du CSS de MathALÉA) :
  écran qui propose de mettre à jour « Android System WebView » par le Play
  Store au lieu d'un écran blanc (fait).

### 0.1.5

- Sortie d'une séance (croix ou retour) : reprendre plus tard, terminer
  maintenant (soumettre si la correction est à la fin ; masqué sans aucune
  réponse) ou supprimer la tentative. Suppression aussi depuis le détail du
  parcours ; les passages terminés et les résultats restent
  (`supprimerSeance`). Le clavier de MathALÉA est masqué sous un panneau du
  bas (fait).
- Détail du parcours allégé : un seul bouton (Commencer, Continuer…), le
  reste dans « Autres actions » (panneau du bas : tout refaire, supprimer la
  tentative, sessions) ; classe `boutonLien` pour les actions sans cadre (fait).
- Enseignant = élève + onglet Créer : réglage « Je suis enseignant » (bas des
  Réglages, interrupteur `.interrupteur`), plus de choix du profil au premier
  lancement ; l'enseignant voit toutes les classes de ses dossiers (pastilles),
  l'élève choisit la sienne (fait).
- Publication allégée : une ligne d'état et Publier, « Dossier partagé » et
  « Éditer un parcours existant » en liste, panneau du bas après
  l'enregistrement ; actions de l'éditeur dans « Autres actions » ; garde-fou
  de la séance en panneau du bas ; import par lien replié (fait).
- Fichiers horodatés (`nomHorodate`) : `parcours-mathalea-<date>.json`, jamais
  renommé « (1) ». Lecture de tous les .json quel que soit le nom ; parmi les
  publications complètes (`banque: true`), seule la plus récente compte.
  Nextcloud : dossier lu en zip par `…/s/<jeton>/download` (dossier de tête),
  testé sur Nextcloud 30 dans Docker (fait).
- Mises à jour du moteur signées par la clé de mathalea.fr (transmise par
  Rémi Angot), publication sur `https://mathalea.fr/releases/` (fait).

## 0.2.0 : organisation des parcours (fait)

Demandes de Nathan du 15 octobre 2026, après une recherche didactique
(`reports/`, non versionné : maîtrise, remédiation, pratique espacée, ceintures,
plateformes) et un audit d'ergonomie :

- On crée pour un niveau, on donne aux classes dans la vue Classes ;
  bibliothèque par niveau et chapitre ; préférences de création.
- Organisation : liste simple, paliers, ceintures (première au choix) ; accès
  par seuil ou ouvert à tout moment ; ressource pour revoir ; pause (contenu)
  après un palier ; validation « à la fin du palier ».
- Objectifs du programme posés automatiquement, objectifs de l'enseignant
  (CSV au fil de l'année), vue par objectif ; suivi de l'élève par objectif
  (meilleur niveau, dernière fois travaillé) et ceintures obtenues.
- Élève : carte en paliers, bilan de palier avec pause et « Continuer »,
  progression « 1/3 », épingle sur les tuiles, session sur un palier ouvert.
- Publication : le fichier porte toute la bibliothèque ; état « prêt à
  déposer » puis « Vérifier le dossier partagé » ; reprise sur un autre
  appareil ou depuis la page du site.
- Icône proposée d'après le chapitre ; parcours de démonstration (Réglages,
  enseignant) ; restauration avec aperçu, confirmation et annulation ;
  panneaux accessibles et limités à la zone visible.
- Page du site `?v=parcours` (MR sur MathALÉA) : même format et même
  bibliothèque, fenêtre d'ajout d'exercices du site, schéma du parcours.

Plus tard : reprises espacées et révision mélangée (recommandées par la
recherche, laissées à l'enseignant pour l'instant), pages de cours intégrées,
format minimal (`formatMin`) si un ajout devait être ignoré à tort par une
ancienne app.

## 0.2.1 : boutiques (fait)

- Moteur figé dans les versions des boutiques (`MATHALEA_MOTEUR_FIGE`, iOS) ;
  fichier Google Play (`.aab`) ; version Google Play hebdomadaire
  automatique (`google-play.yml`) ; politique de confidentialité.

## 0.2.2 : publication sur Google Play (fait)

- Politique de confidentialité lisible dans les Réglages (À propos), avec le
  contact de CoopMaths ; fiche des boutiques (`docs/fiche-boutiques.md`,
  captures `e2e/fiche-play.mjs`). Mots de passe des clés Android passés par
  l'environnement en CI (`scripts/cle-android.sh`). Premier travail iOS :
  partage natif (plugin Swift), barre d'état, workflow `ios.yml`.

## 0.3.4 : tout exporter par défaut, bannière du drive (fait)

- Enseignant : par défaut, on exporte tout (un fichier avec les classes, tous
  les parcours, même sans classe, et les objectifs) ; le panneau après
  l'enregistrement le propose d'abord, l'attribution aux classes vient
  ensuite. « Exporter des parcours » : tous cochés (fichier complet), ou
  quelques-uns pour un collègue (`exporterChoix`).
- Petite bannière sous la barre de chaque écran (hors séance) : « Version
  différente de celle du drive » / « Mettre à jour » dès que la bibliothèque
  diffère du dernier fichier complet (`empreinte`, `aJour`) ; « Drive pas
  encore configuré » / « Configurer » sans lien ; « Fichier exporté :
  déposez-le sur le drive » jusqu'à ce que l'app le trouve dans le dossier
  (relu au retour dans l'app). Croix : fermée jusqu'au prochain lancement.
  Aucun message quand tout est à jour.
- Bibliothèques d'avant 0.3.4 déjà exportées : pas de fausse alerte
  (`completerEmpreinte`) ; la démonstration ne compte pas (`sansEcartDrive`).

## 0.3.3 : enregistrer un export sur le téléphone (fait)

- Android : chaque export (publication, parcours seul, sauvegarde, CSV)
  propose « Envoyer vers une app » (feuille de partage) ou « Enregistrer sur
  le téléphone » (sélecteur de fichiers d'Android, `ACTION_CREATE_DOCUMENT`,
  commande `enregistrer_fichier`, `PartagePlugin.enregistrer`). La feuille de
  partage ne proposait pas toujours d'enregistrer le fichier. iOS garde sa
  feuille de partage (« Enregistrer dans Fichiers »).

## 0.3.2 : retours des testeurs, tous les exercices du site (fait)

- Séance avec correction à la fin : plus de score « 0/15 » avant la
  soumission ; la barre du bas reste au-dessus du clavier de MathALÉA même
  quand il reste affiché sans focus.
- Teste ton niveau : plus aucune mention de la CAN ni des sujets (titre et
  ceinture seulement, tirages déjà enregistrés compris) ; supprimer une
  tentative ramène aux niveaux ; un test n'est plus ajouté à l'accueil.
- Suivi : tests passés et parcours de l'Explorer non ajoutés à l'accueil ;
  ceintures du test (CM1 à Terminale) dans l'onglet Ceintures.
- Exercice masqué par l'enseignant : absent de la fiche vue par l'élève.
- Vérification : `e2e/test-niveau-reel.mjs` (vraies réponses, téléphone et
  bureau) ; `e2e/paliers.mjs` suit l'ordre mélangé des questions.
- Éditeur : tous les exercices du menu du site (FR ou CH selon le pays),
  interactifs ou non, sauf « Égalité filles-garçons » que le site range à
  part. Un exercice rangé deux fois dans un chapitre du référentiel (même
  uuid, ex. « Fonctions » de Seconde) empêchait d'ouvrir le chapitre : une
  ligne par exercice. `e2e/recherche.mjs` ouvre tous les chapitres.
- Exercice non interactif : à faire sur papier, « Voir la correction » sous
  la question ; hors du score, des questions passées et des seuils
  (`Seance.papier`, clé de question → correction vue) ; bilan « Correction
  vue ». Vérification : `e2e/papier.mjs`.
- Moteur : les tracés à main levée (`MainLevee`, roughjs) cherchent le
  conteneur `#appMathalea` du site ; sans lui, les segments disparaissaient
  des figures. `initialiser()` le crée, et l'app aussi avant de l'appeler
  (`src/lib/moteur.ts`) : la version Google Play prend le moteur publié par
  mathalea.fr, qui ne le crée pas encore.
- Réponse dans un trou (« 81 = … × … ») : MathLive n'envoie pas `input`,
  « Vérifier » restait grisé avec la correction à chaque question ;
  `BlocQuestion` écoute aussi `beforeinput` et `selection-change`.

## 0.3.1 : Teste ton niveau en 15 questions (fait)

- Teste ton niveau : une seule série de 15 questions classées par domaine,
  sans doublon, bilan direct par question ; barre de progression pour une
  question par page ; réponses dans une figure gardées avec la correction à
  la fin.
- Réglages, « À propos » : lien vers le guide en ligne. Guide : page
  technique « Format des parcours » (schéma JSON, exemple, consigne pour un
  assistant) et skill `generer-parcours`.

## 0.3.0 : Teste ton niveau (fait)

- Explorer : « Teste ton niveau », ceintures du CM1 (blanche) à la Terminale
  (noire, 3e dan) d'après les sujets de la Course aux nombres.
- Parcours : exercices sans en-tête et questions mélangées (réglages de
  « Icône, pages et correction », vrais par défaut pour un nouveau parcours).

## 0.2.4 : Google Play, pages de 16 Ko (fait)

- Bibliothèques natives Android alignées sur des pages de 16 Ko (exigence de
  Google Play pour Android 15 et plus) : `-Wl,-z,max-page-size=16384` posé
  par `src-tauri/build.rs`. Vérifier : `readelf -lW` sur le `.so` de l'APK,
  alignement `0x4000` des segments `LOAD`. Contient aussi tout le contenu
  de la 0.2.3, qui n'a pas été publiée.

## 0.2.3 : un seul toucher pour valider (non publiée, reprise dans 0.2.4)

- Android : la page s'arrête au-dessus du clavier du téléphone (affichage bord
  à bord, `MainActivity.kt`) ; les barres du bas (Valider, Enregistrer)
  passaient dessous et demandaient deux touchers. Les boutons des barres du
  bas ne prennent plus le focus (`barreDuBas.ts`).
- Séance : le panneau « Soumettre quand même ? » ne se referme plus tout seul
  (le champ quitté signalait une nouvelle saisie) ; en se refermant, un
  panneau ne rouvre plus le clavier sur la correction.
- Guide en ligne (Pages de la forge), `.ipa` non signée pour iPhone et iPad.

## À faire (sans version fixée)

- **PRIORITAIRE : vérifier la migration des données entre les versions de
  l'app** (Nathan, 2026-10-30), dès que l'app est de nouveau fonctionnelle :
  la 0.4.8 en production refusait de nombreux élèves, ses données ne servent
  pas de référence. Méthode prévue : une version publiée jouée dans un
  worktree à son tag (`git worktree add --detach … v<x>`, `pnpm install`,
  `static/moteur`, `npx vite dev --port 1521`), scénario élève et enseignant
  par `e2e/donnees/creer.mjs` (séance terminée, ceinture obtenue, séance
  quittée en cours, démonstration chargée) qui garde le stockage dans
  `e2e/donnees/<version>-<qui>.json` ; puis une suite `e2e/mise-a-jour.mjs`
  (à écrire) qui ouvre ces données avec la version courante : rien de perdu,
  séance reprise à la bonne question, ceintures, bibliothèque, sauvegarde
  valide (`cleInvalide`), aucune erreur JavaScript. Reste à régler dans
  `creer.mjs` : les réponses de la ceinture ne sont pas enregistrées (0/2).
  Une version par release au moins, la précédente en production d'abord.
- **Fonctionnalités décidées par Nathan (2026-10-30)**, à faire :
  - **Grands écrans** (tablette, ordinateur des testeurs) : mise en page
    propre aux grands écrans, l'app est aujourd'hui pensée pour 390 px.
  - **Toutes les fiches de cours à un endroit** : retrouver chaque fiche hors
    de son parcours, l'enregistrer pour y revenir vite, organiser les siennes.
  - **Ceinture générale de chapitre** : **par chapitre**, pas par parcours
    (plusieurs parcours travaillent les mêmes ceintures).
  - **Plusieurs appareils pour un même élève** : fusionner les données au lieu
    de remplacer (exporter puis importer), avec une vraie gestion des cas
    (même séance des deux côtés, ceintures, révisions).
  - Révisions : rappels **dans l'app seulement**, jamais de notification
    hors de l'app.
- Plus tard (pas une priorité) : suivi de classe dans la durée (relevés
  regroupés par élève et par objectif), sauvegarde déposée sur un drive en
  lecture seule, catalogue de l'Explorer servi par MathALÉA (le jour où des
  parcours seront développés avec MathALÉA).
- **Politique de confidentialité** à mettre à jour avant de publier les
  réponses de session (caméra, prénom) : texte prêt dans
  `docs/confidentialite-brouillon.html`, à copier sur
  `static/confidentialite.html` (publiée par le job `pages`). Pas avant la
  fin de l'examen Google Play en cours (Nathan, 2026-10-19 : Google ne doit
  pas l'évaluer sur la version examinée). Revoir aussi la « Sécurité des
  données » de la Play Console (`docs/fiche-boutiques.md`).
- **Envoi automatique Google Play en pause** depuis le 2026-10-19 (Nathan) :
  workflow `google-play.yml` désactivé sur GitHub pendant l'examen de la
  0.2.4, pour qu'aucune version ne parte seule en production. Le réactiver
  après l'examen et la politique à jour :
  `gh workflow enable google-play.yml --repo nathan-ed/mathalea-mobile`
  (désactivé, il ne se lance pas non plus à la main).

- Page `?v=parcours` du site : `enTetesMasques` et `melanger` repris (MR !9426, à fusionner).
- Teste ton niveau : ajouter le CE1 et le CE2 (sujets présents dans le
  référentiel, `canCE1a`, `canCE2a`) si les collègues le souhaitent.
- Bannière « Nouvelle version de l'app » (demande de Nathan, 2026-10-18) :
  petite, par-dessus l'app, comme la plupart des apps, quand une version
  plus récente existe ; bouton « Mettre à jour », croix (fermée jusqu'au
  prochain lancement). Source selon l'installation : Google Play, API
  « In-App Updates » (Play Core, mode flexible : téléchargement en fond puis
  « Redémarrer ») par un petit plugin Kotlin ; APK, bureau et `.ipa` de la
  forge, dernière release lue par l'API de la forge, lien vers la page de
  téléchargement ; App Store plus tard, API de recherche d'Apple
  (`itunes.apple.com/lookup?bundleId=`). Aucune donnée envoyée (simple
  lecture, comme les mises à jour du moteur).

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

Le mécanisme est en place (0.1.1) ; le moteur est publié avec le site sur
`https://mathalea.fr/releases/` (`URL_MISES_A_JOUR`, `src-tauri/src/moteur.rs` ;
`MATHALEA_MOTEUR_URL` pour les essais).

- Publication : à chaque mise en ligne du site, `pnpm build:deploy` de
  MathALÉA enchaîne `build:moteur` et `tasks/deploy_moteur.sh`, qui signe
  (`tasks/publier_moteur.mjs`) et dépose `moteur-<version>.tar.gz`, puis
  `mise-a-jour.json` (version, API, date, taille, SHA-256) et
  `mise-a-jour.json.sig` (signature Ed25519) dans `REMOTE_RELEASES_PATH`.
  Ces fichiers sont dans MathALÉA depuis la MR !9394 (copie dans
  `moteur/fichiers/tasks/`). Deux scripts séparés plutôt qu'un seul : le moteur peut être republié
  seul, et un échec du moteur (clé absente) n'empêche pas le site de partir.
- Clé : mode d'emploi pour qui publie dans
  `moteur/fichiers/documentation/developpement/maintenance-moteur/architecture/publication-moteur.md`
  (`node tasks/cles_moteur.mjs <.pem>` ; la clé publique est transmise et
  remplace `CLE_PUBLIQUE`). Clé actuelle : celle de mathalea.fr, transmise
  par Rémi Angot le 14 octobre 2026 (version 0.1.5). L'ancienne clé de test
  (privée dans `~/.local/share/mathalea-mobile/`) ne sert plus qu'aux
  publications locales, qui ne passent donc plus `CLE_PUBLIQUE`.
- Pourquoi signer : le moteur téléchargé s'exécute avec les droits de l'app.
  HTTPS protège le trajet, pas le serveur : la signature empêche qu'un accès
  au serveur web suffise pour envoyer du code à toutes les apps.
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
  de connexion d'un projet privé) ; publication réelle du script (déposée en
  local : `REMOTE_RELEASES_PATH=<dossier>` sans `REMOTE_SERVER`) :
  `MOTEUR_PUBLICATION=<dossier> cargo test moteur -- --include-ignored`.
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

1. Un parcours pourra indiquer la version minimale du moteur (exercice récent) :
   télécharger avant d'ouvrir, ou signaler « connexion nécessaire ».
2. Wi-Fi seulement pour les 20 Mo ? Réglage à prévoir sur Android.

### MathALÉA

- MR !9394 (branche `moteur-app-mobile`, ouverte le 14 octobre 2026) : moteur,
  `version.ts` sans appel réseau, publication sur mathalea.fr/releases. Une
  fois fusionnée, supprimer `moteur/`. Ancienne branche locale
  `moteur-embarquable` remplacée. Documenter le moteur dans
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
- Essayer sur iPhone (TestFlight) et sur d'autres téléphones Android :
  clavier, figures, PDF, mode avion.
- Clé d'API Google pour lire les dossiers Google Drive.
- CI : le moteur est dans MathALÉA (MR !9394) ; reverser nos ajouts de
  `moteur/fichiers/src/moteur/index.ts` (`chemin`, `titreHtml`,
  `appMathalea`), puis supprimer `moteur/` et construire depuis la forge. La
  release `moteur` du miroir GitHub ne sert plus (à supprimer).

## 0.3.5 : référentiel affiché comme sur le site (fait)

- « Ajouter des exercices » reprend le menu « Exercices aléatoires » du site :
  niveaux nommés et rangés comme sur le site (« Sixième », « Bac Pro -
  Seconde »), chapitres et sous-chapitres avec leur code (« 2N : Calcul
  numérique » › « 2N1 : Nombres réels »), sous-thèmes en intertitres, même
  ordre des exercices (flash d'abord, numéros dans l'ordre naturel), formules
  rendues. Avant, le référentiel français était coupé en niveau › chapitre :
  des listes de plus de 100 exercices, dans l'ordre brut du JSON.
- Moteur : `listerExercices` donne le `chemin` de chaque exercice dans le menu
  du site ; `titreHtml` rend les formules. Un moteur plus ancien garde
  l'affichage niveau › chapitre.
- Vérification : `node e2e/referentiel-site.mjs FR|CH` déplie tout le menu du
  site et le compare au moteur (identique, hors exercices plus récents que le
  commit du moteur).

## Retours de la première séance en classe (octobre 2026, pas encore publié)

- Réponses bloquées : `lireSaisies` (`BlocQuestion`) ne voyait que les
  `math-field` et `input`. Liste déroulante (`liste-deroulante`), champs
  multiples (`multi-mathfield` : encadrer, arrondir une racine) et
  glisser-déposer (`drag-and-drop`) n'étaient jamais « saisis » : « Vérifier »
  restait grisé et aucun brouillon n'était gardé. Leur `value` est lue et
  réécrite comme MathALÉA (id → value) ; le dépôt d'une étiquette relance la
  lecture (`drop`, `dragend`, `touchend`).
- Glisser-déposer : la ligne des cases (`.rectangles`, `flex` sans retour à
  la ligne sur le site) sortait de l'écran ; elle passe à la ligne
  (`app.css`).
- Espaces : un champ MathLive n'accepte pas d'espace tapé au clavier du
  téléphone. Le moteur retire `nombreAvecEspace` des réponses attendues et
  la consigne « Penser à mettre les espaces nécessaires »
  (`sansEspacesExiges`).
- Plusieurs réponses dans une question (PR #1, ticket 1 de la forge) :
  aussi dans le Préqualifiant (9ES1B-7 dans trois ceintures, 9ES3C-13,
  9GM1B-5, 9FA2B-18), 159 exercices au référentiel. Règle corrigée : chaque
  rang n'appartient qu'à une question (la sienne si son énoncé le contient,
  sinon la première), smiley et message de retour exclus. Sans cela, la PR #1
  faisait vérifier à 107 exercices une réponse absente de la page (845fa :
  MathALÉA reprend l'id meta-interactif-2dEx0Q0field0 dans la question 2 ;
  sujets CAN de Teste ton niveau).
- Figures à cliquer (clique-figure, 8 exercices dont 9ES2B-1 d'EVACOM) : le
  site les active après l'affichage (prepareExerciceCliqueFigure), le moteur
  ne le faisait pas ; un toucher ne faisait rien. `activerCliqueFigures` dans
  `afficher()` (registre des exercices préparés, sans changer l'API).
- Figures apigeom plus larges que l'écran (droite graduée de 650 px, 9QCM-22) :
  une partie hors d'atteinte. `ajusterApigeom` les réduit par leur propre
  zoom (événement zoomChanged de figureApigeom, les clics suivent).
- Grilles KenKen, Killer Sudoku : cases sans id ; une frappe dans un élément
  de réponse suffit désormais pour activer Vérifier. Tout toucher sur un
  élément de réponse de MathALÉA (id …Ex<n>Q<k>, Ex<n>F<k> pour apigeom)
  compte aussi (figures, horloge, diagrammes…).
- Champ dans une figure (MetaInteractif2d) : un trou vide passait pour une
  réponse (« \\text{ cm}^2 » lu par l'expression de secours) ; Vérifier
  s'activait sans rien saisir.
- Message de retour de MathALÉA (« Le point $A$ a pour abscisse… ») : ses
  formules sont rendues après la vérification.
- Séance : ceinture en cours en haut (couleur, nom et titre), segments verts
  (correcte), orange (en partie), rouges (incorrecte) dans les deux thèmes ;
  le « warn » sombre de MathALÉA est rose, la pastille de score reste verte.
  Orange de MathALÉA aussi en sombre (variables `--color-coopmathsdark-action*`
  redéfinies dans `app.css`). Bouton plein inactif en sombre : gris (l'orange
  à 40 % sur le fond sombre tirait sur le rouge brun).
- Ordinateur : fenêtre ouverte en grand (`maximized`), énoncé et champs à
  1,45 rem sur une fenêtre large (`.question-eleve`).
- Moteur : toutes les apps utilisent désormais le moteur construit depuis
  `moteur/` et livré avec elles (`MISES_A_JOUR` faux sauf construction avec
  `MATHALEA_MOTEUR_MAJ=1`) : le moteur publié par mathalea.fr est construit
  depuis `src/moteur/index.ts` de MathALÉA, sans les corrections de l'app, et
  aurait remplacé le nôtre. Conséquence : de nouveaux exercices du site
  arrivent avec une release de l'app (monter `moteur/COMMIT`). `google-play.yml`
  construit aussi notre moteur (`scripts/moteur.sh`).
- Release : `bash scripts/publier.sh v<x>` sur l'ordinateur de Nathan :
  `scripts/verifier-release.sh` (toutes les suites, tous les formats, tous les
  parcours de `explorer/` et de la démonstration joués de A à Z, en
  parallèle ; il refuse un `static/moteur` qui ne correspond pas à `moteur/`,
  `scripts/moteur-a-jour.sh`), puis tag et push seulement si tout est vert. La CI GitHub ne garde
  que les suites rapides.
- Préqualifiant v11 : voir `explorer/prequalifiant-manques.md`.
- Tests : `node e2e/reponses-elements.mjs` (téléphone et bureau, réponses
  attendues régénérées avec la graine de la séance), aussi en CI ;
  `node e2e/parcours-az.mjs` : parcours de l'Explorer joués de A à Z par un
  élève qui répond juste (tous formats, vrais seuils, suivi) ;
  `FORMATS=1 node e2e/parcours-az.mjs <fichier>` : un exercice par format ;
  `GROUPE=1 GROUPES=5 node e2e/az-groupe.mjs` : tous les parcours proposés,
  en groupes équilibrés par nombre de questions.
  Inventaire des formats : `docs/types-de-reponse.md`.

## 0.4.9 : corriger un parcours déjà travaillé (fait)

- Constat : ajouter ou déplacer un exercice faisait disparaître des ceintures
  du Suivi (les passages étaient retrouvés par numéro d'exercice) et refermait
  le palier suivant d'un parcours à seuil.
- `ceinturesObtenues` retrouve un passage par le rang du palier dans sa copie
  figée, ou par les `uuid` de ses exercices, et juge la réussite avec le seuil
  de la version du passage : une ceinture obtenue n'est jamais retirée.
- `etatsPaliers(..., acquis)` : une ceinture acquise garde le palier suivant
  ouvert (`acquisDe`). Le palier modifié reste à terminer.
- `Etape.remiseAZero` : case « Les élèves repartent de zéro » dans l'éditeur ;
  `enregistrer()` remplace `true` par le numéro de la version ouverte, et
  `reprendreResultats` n'y reprend rien. Un marqueur d'une version antérieure
  disparaît. À reporter sur le site (`docs/a-reporter-site-parcours.md`).
- « Parcours mis à jour » (`DetailParcours`) : tant que tous les passages de
  l'élève sont d'une version antérieure ; aucune clé de stockage nouvelle.
- Tests : `tests/correction-parcours.test.ts`, `node e2e/correction-parcours.mjs`
  (V1, correction, sauvegarde, téléphone neuf, ceinture terminée), dans le
  groupe 3 de `release.yml`.

## 0.4.8 : défilement au doigt rétabli (fait)

- Depuis 0.4.6, aucun écran ne défilait au doigt ni à la molette (Réglages,
  accueil, séance) : avec `overflow-x: clip` sur `html`, le `body` ne
  transmet plus son `overflow` à la fenêtre, et son `overflow-x: hidden`
  (donc `overflow-y: auto`) en faisait un conteneur de défilement à la
  hauteur de son contenu, qui prenait le geste sans défiler. `scrollTo`
  marchait : les tests qui font défiler par programme ne voyaient rien.
- `body` passe à `overflow-x: clip` (pas de conteneur de défilement) ; un
  contenu plus large que l'écran n'élargit toujours pas la page.
- Test : `node e2e/defilement.mjs` (vrais glissés `Input.dispatchTouchEvent`,
  molette du bureau, contenu de 1200 px). `Input.synthesizeScrollGesture` ne
  fait rien en mode sans fenêtre : ne pas s'y fier.
- Pour que cela ne reparte plus : `tests/defilement.test.ts` (à chaque push,
  refuse un `overflow` de `body` qui en fait un conteneur de défilement sous le
  clip de `html`) ; job `e2e` de `release.yml` (16 suites en 4 groupes, avec le
  moteur de la release), dont dépendent les jobs `bureau` et `android` ; étape
  « Parcours e2e » de `google-play.yml` (moteur publié) avant la construction
  du `.aab`. Les deux passent par `scripts/e2e-ci.sh <suites>` (Chromium de
  Playwright, `pnpm dev`, code 1 si une suite échoue).

## 0.4.7 : QR code de classe et de dossier (fait)

- Nathan (2026-10-28) : « juste le fait de scanner, ça rajoute toutes les
  informations pour lancer la session élève ». QR code `MACLA1.` (base64 du
  JSON `{ l, c }` : lien du dossier partagé, nom de la classe, vide pour tout
  le dossier), `encoderClasse` et `decoderClasse` dans `invitation.ts`.
- Enseignant, seulement avec un lien de dossier : icône QR code à côté du
  nom de la classe (onglet Classes) et « QR code pour les élèves » dans les
  actions de la classe ; « QR code pour les élèves » dans la fiche « Dossier
  partagé » pour tout le dossier. Plein écran et image exportée par
  `QrSession` (`classe`, `fichier`).
- Élève : même scanner que la session (icône en haut de l'accueil),
  `rejoindreClasse` dans `+page.svelte`. Dossier ajouté ou relu, classe
  choisie ; une classe absente du fichier du drive est signalée et rien
  n'est ajouté ; QR code du dossier : la classe se choisit comme après un
  lien collé (prise d'office s'il n'y en a qu'une). Une erreur de
  téléchargement laisse le scanner ouvert et le code est relu 4 s plus tard.
- Une app plus ancienne répond « Ce n'est pas un QR code de session
  MathALÉA. »
- Test : `node e2e/classe-qr.mjs` (dossier servi en local sur 8713).

## 0.4.6 : moteur au main de MathALÉA, tableaux larges (fait)

- Moteur construit au `main` de MathALÉA du 27 octobre 2026 (8757328d), où le
  moteur est fusionné : `moteur/mathalea.patch` supprimé, `index.ts` fusionné
  à trois voies (`sup5` et `interactif: false` de MathALÉA, `chemin`,
  `titreHtml` et `appMathalea` de l'app).
- Un tableau plus large que l'écran (5N2B) élargissait toute la page sur
  téléphone, et le clavier de MathALÉA, qui suit `innerWidth`, s'élargissait
  avec : page décalée, boutons du bas coupés. `overflow-x: clip` sur `html`
  (sur `body`, il ne suffit pas).
- Aussi depuis 0.4.5 : paliers ouverts à une date, analyse par une IA mise de
  côté, « Récupérer mes données » au premier lancement, Explorer par degré
  et parcours suisses, fiches de cours.

## Analyse par une IA mise de côté

- Nathan (2026-10-27) : pas d'IA dans l'app pour la publication sur l'App
  Store. Retirés : `ia.ts`, `analyse.ts`, « Copier pour une IA », « Coller la
  réponse d'une IA », analyse dans l'app (Claude, Mistral, OpenAI, IA locale),
  réglages de l'IA, `Releve.analyse`, `textePourIA`, `retraduire`, motif
  `http://*:*/*` du plugin HTTP (revenu à `http://*:8702/*`). Gardés : caméra
  et import des QR codes, résumé de la classe, vues Questions et Élèves,
  prénom facultatif. Un ancien relevé qui porte une `analyse` reste lisible
  (champ ignoré) ; la clé `cle-ia` d'une ancienne version reste hors des
  sauvegardes (`CLES_DE_L_APPAREIL`).
- Le travail est gardé sur la branche locale `analyse-ia` (main plus le
  retour de ce retrait), à reprendre plus tard.

## 0.4.5 : Claude sans bibliothèque (fait, retiré depuis)

- Nathan (2026-10-25) : pas de SDK d'un fournisseur dans l'app, comme pour
  Mistral, OpenAI et les IA locales. `ia.ts` appelle l'API Messages
  d'Anthropic par `fetch` (en-têtes `x-api-key`, `anthropic-version`,
  `anthropic-beta: server-side-fallback-2026-07-01`) et lit le flux
  (`content_block_delta`, `stop_reason: "refusal"`, événement `error`) avec
  le même lecteur que le format OpenAI (`lireFlux`). `@anthropic-ai/sdk`
  retiré. Test : `node e2e/reponses-session.mjs` (API simulée).

## 0.4.4 : page d'un parcours, onglets de l'enseignant, sessions par classe (fait)

- Plan d'ergonomie enseignant (Nathan, 2026-10-20), étape 1. Une tuile de la
  bibliothèque (vues Parcours et Classes) ouvre la page du parcours
  (`FicheParcours.svelte`, vue `fiche`) au lieu de l'éditeur : état de
  publication par classe (`aExporter`), « Lancer une session » (seul bouton
  plein), Essayer (aperçu, `apercuDepuis`), Modifier, classes en pastilles
  (`attribuer`), exercices, sessions du parcours, Autres actions (exporter
  seul, dupliquer, supprimer avec confirmation). L'éditeur, l'aperçu et une
  session ouverts depuis la page y reviennent (`creationDepuis`,
  `sessionDepuis`) ; « Valider » d'une modification aussi (une création garde
  le panneau d'après-enregistrement). Test : `node e2e/fiche-parcours.mjs`.
- Onglets de l'enseignant (Nathan, 2026-10-20 : « oui ») : Parcours (clé
  `creer` : bibliothèque et objectifs, `EspaceEnseignant` section
  `parcours`), Classes (section `classes` : classes et leurs sessions), En
  classe, Explorer. Mes parcours et Suivi passent en **vue élève**
  (`vueEleve`, ligne « Vue élève » de la bibliothèque, bandeau « Quitter » ;
  le bouton retour depuis Mes parcours en sort). Tout retour vers un onglet
  enseignant referme la vue élève (`versCreer`, `versClasse`). « Donner à des
  classes » (panneau d'après-enregistrement) ouvre l'onglet Classes. Une
  barre d'onglets cachée par le clavier : refermer le clavier dans les tests
  avant de toucher un onglet.
- Sessions rattachées à une classe (Nathan : « oui ») : `Releve.classe`
  (facultatif, contrôlé dans `estReleves`), choisie dans `ReglageSession`
  (pastilles « Classe », la seule classe du parcours proposée d'abord) ;
  En classe groupe par classe (puis « Sans classe »), l'onglet Classes montre
  « Sessions de … » ; une session ouverte depuis Classes y revient.
- Étape suivante du plan : publier en un geste (« Ouvrir le dossier du
  drive », vérification automatique).

## 0.4.3 : onglet En classe, retour par l'accueil (fait)

- Nathan (2026-10-20) : retrouver ses sessions demandait plusieurs onglets
  (créées depuis Mes parcours, listées dans Créer). Onglet **En classe**
  (enseignant, après Créer ; `Releve.svelte`) : « Nouvelle session » (choix
  du parcours : bibliothèque et dossiers suivis), lecture des QR codes, liste
  des sessions. « Sessions partagées » retiré de Créer.
- Session de l'enseignant : panneau de réglages (`ReglageSession.svelte` :
  palier, tous proposés ; QR code des réponses, moment, prénom), puis
  « Lancer la session » mène à sa page (`SessionClasse.svelte`, vue
  `session`) : QR code et code affichés, « Plein écran » (`QrSession`),
  lecture des réponses (`LectureReponses.svelte`, aussi dans l'onglet) ; avec
  des réponses, `ReponsesClasse` sous un en-tête de session (`haut`). La page
  ne se met à jour qu'à la fermeture de la caméra ou après un import (sinon la
  caméra se refermerait au premier QR code lu). Le code est tiré au lancement
  et noté alors seulement (`lancerSession`) : plus de sessions d'essai notées
  à chaque réglage.
- Bouton retour : l'onglet d'accueil est celui où l'app s'ouvre (Créer pour
  l'enseignant, Mes parcours pour l'élève) ; tout autre onglet y ramène avant
  que l'app se ferme. Page de session → En classe → Créer. Avant, un
  enseignant revenu sur Mes parcours quittait l'app au retour suivant.
- Test : `node e2e/en-classe.mjs` (clair et sombre, retours, double retour
  rapide, élève sans l'onglet).

## 0.4.2 : révisions espacées, QR code de session exportable (fait)

- Révisions espacées et mélangées (détails ci-dessous).
- Enseignant : « Session pour la classe » sur la page du parcours, sans
  « Commencer la session » ; QR code de session exportable en image (PNG).
- Sessions partagées : suppression toujours confirmée.
- Accueil : « MathALÉA par CoopMaths » entier dès 360 px.

## Révisions espacées

- `revisions.ts`, sur l'appareil, sans réglage de l'enseignant (Nathan,
  2026-10-19 : « complètement indépendant de l'enseignant », « l'élève peut
  cocher les chapitres »). Clé `revisions` (`estRevisions` dans la sauvegarde).
- Un élément par exercice (`cleExercice` : uuid et réglages), avec ses
  objectifs, niveau, chapitre. Boîtes de Leitner 1 à 5, intervalles 1, 3, 7,
  21, 56 jours (`INTERVALLES`). Entrée d'après la réussite au parcours (< 50 %
  : 1, < 80 % : 2, sinon 3) ; révision réussie (toutes les questions) : boîte
  suivante ; manquée : boîte précédente (pas retour au début, moins
  décourageant). Un nouveau passage d'un exercice à revoir compte comme une
  révision ; manqué (< 50 %), il revient le lendemain.
- `integrerPassages` au lancement (tous les `historique:*`) et à chaque fin de
  séance : un repère par exercice (`traites`, « parcours@début#étape »), compté
  une seule fois, quand il est complet (questions passées reprises plus tard).
  Exclus : exercices sur papier, Teste ton niveau, les révisions elles-mêmes.
- Séance (`tirerRevision`) : 3, 6 ou 10 questions au choix de l'élève
  (`taille`, 6 par défaut), une par exercice, les plus fragiles (boîte basse)
  puis les plus en retard, à tour de rôle par chapitre ; jamais de stock
  affiché (Nathan : « pas comme dans Anki, 90 questions d'un coup ») ;
  `enTetesMasques`, `titreMasque`, `remiseAZero` ;
  ordre `entrelacer` (`fixerOrdre`, id `revisions`) : jamais deux questions du
  même exercice à la suite. Résultats (`resultatsRevision`) une fois par
  exercice et par séance ; bilan : titres dévoilés, « Revient dans… ».
- Chapitres choisis (`chapitres` ; absent : tous, les nouveaux inclus).
- Suivi : les séances de révision comptent pour les objectifs, qui gardent le
  niveau et le chapitre du parcours d'origine (`objectifsTravailles`, passages
  triés par date) ; solidité d'un objectif = boîte la plus basse de ses
  exercices (à consolider 1-2, en bonne voie 3-4, durable 5). Ceintures jamais
  retirées.
- Vérification : `tests/revisions.test.ts`, `node e2e/revisions.mjs` (deux
  parcours faits au clavier, horloge du navigateur avancée d'un jour puis
  d'une semaine, séance, bilan, chapitres, suivi, sombre).

## 0.4.1 : sessions préparées, QR code de session (fait)

- « Sessions partagées » (onglet Créer) garde toute session créée par
  l'enseignant dès que son code s'affiche : la préparer avant le cours, la
  lancer, la relever plus tard ; croix pour la supprimer.
- QR code de session à projeter : l'élève le scanne depuis l'accueil et
  arrive directement dans la session ; app plus ancienne prévenue.
- Écrans de relevé et d'analyse allégés (textes inutiles retirés).

## 0.4.0 : réponses de la classe à une session partagée (fait)

- Réglage de l'enseignant à la création de la session (`DetailParcours`,
  profil enseignant) : pas de QR code, après la correction, avant la
  correction. Porté par le code (`modeQr`, `progression.ts`) : empreinte
  FNV-1a du code entier modulo 3 ; `nouveauCode(mode)` tire des codes jusqu'à
  tomber sur le mode voulu. Code hors format (autre longueur, lettre hors de
  l'alphabet, comme `1k3lr` des tests) : aucun. Avant la correction : la copie
  du parcours de la séance passe en correction à la fin, bilan direct
  (`bilanDirect`), QR code avant le bilan et dans la relecture tant que
  `Seance.qrMontre` est faux ; le passage n'affiche pas son score.
- Élève : fin d'une session partagée (bilan, relecture), « Montrer mes
  réponses à l'enseignant » : QR code (`MesReponses.svelte`) ou fichier
  `.txt`. Contenu (`releve.ts`, `MAREP1.` + JSON compressé en base64) : code,
  parcours, version, titre, exercices des étapes (uuid, nombre de questions,
  `sup`…), ordre mélangé ou non, empreinte des énoncés vus par étape
  (`Seance.empreintes`, texte sans balises), première réponse vérifiée de
  chaque question. Ni nom ni identifiant ; `d` (empreinte du début du
  passage) compte un passage une seule fois. Environ 300 caractères pour
  6 questions, correction L.
- Sessions créées : dès qu'un code s'affiche chez l'enseignant
  (`DetailParcours`, `onnoter`), un relevé vide est noté (`noterSession`,
  `creee: true`, `invitation`) ; un changement de réglage dans le même
  panneau remplace le code noté s'il n'a rien reçu, un autre palier met son QR
  code à jour. Écritures en file dans `+page.svelte`.
- QR code de session (`invitation.ts`, `MASES1.` + JSON compressé) : code,
  copie du parcours sans pauses ni ressources, palier (`e`), version du
  moteur de l'enseignant (`m`). Affiché par `QrSession.svelte` (panneau de
  session, « Sessions partagées ») ; enseignant : « Session pour la classe »
  sur la page du parcours, panneau sans « Commencer la session » (bouton
  principal : le QR code) ; lu par l'élève depuis l'accueil
  (`Scanner` en mode `session`), qui lance la séance sur cette copie et ajoute
  le parcours à `ajoutes`. Moteur de l'élève plus ancien (date de la version)
  : « Mets l'application à jour », « Continuer quand même ». Test :
  `node e2e/session-qr.mjs`.
- Enseignant : Créer, « Sessions partagées » (`Releve.svelte`, les plus
  récentes d'abord ; sans réponse : code et « Lire les QR codes » ; croix,
  toujours avec confirmation) : caméra
  (`Scanner.svelte`, `getUserMedia` sur toutes les plateformes, lecture par
  jsQR ; pas de `BarcodeDetector`, qui fait planter l'app dans le WebView
  d'Android en passant par les services Google Play), import de photos (plusieurs
  codes : chaque code lu est masqué puis on relit, `qr.ts`) et de fichiers.
  Relevés gardés sous `releves`.
- Recalcul (`ReponsesClasse.svelte`) : questions regénérées avec les graines
  de la session, réponses réinjectées et revérifiées hors écran comme dans la
  relecture ; énoncés différents (autre moteur) mis à part. Verdicts gardés
  (`Releve.calcul`), refaits si le moteur change. Questions des moins
  réussies aux plus réussies, mauvaises réponses regroupées (écriture
  normalisée ; réponse finale seule pour les réponses en plusieurs lignes).
- Prénom (facultatif, choix de l'enseignant) : cinq réglages portés par
  l'empreinte du code (aucun, après, avant, après avec prénom, avant avec
  prénom). L'élève le tape une fois (`MesReponses`, clé `prenom`), il part
  dans le QR (`n`). Sans prénom : « Élève N » dans l'ordre de réception.
- Vue enseignant : résumé (moyenne, élèves sous 50 %, de 50 à 79 %, 80 % et
  plus, questions sous 70 %), vues Questions (mauvaises ou toutes les
  réponses avec les prénoms) et Élèves (`bilanDesEleves`, plus faibles
  d'abord, détail au toucher).
- Analyse par une IA : retirée depuis, voir « Analyse par une IA mise de côté ».
- Caméra : Android `CAMERA` (facultative pour Google Play), iOS et macOS
  `NSCameraUsageDescription`, Linux : flux média de WebKitGTK activé et
  demande acceptée (`lib.rs`).
- Vérification : `tests/releve.test.ts` ; `node e2e/reponses-session.mjs`
  (fausse caméra de Chromium qui filme les QR codes des élèves, photo de
  quatre téléphones, réglages de session, aucune IA proposée) et
  `NAVIGATEUR=webkit` (WebKit de Playwright). Captures du guide
  (`docs/guide/sessions.md`) : `GUIDE=docs/guide/images node e2e/reponses-session.mjs`.
