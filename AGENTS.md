# MathALÉA mobile : consignes

Application Tauri 2 (Svelte 5, SvelteKit statique) de parcours MathALÉA.
Détails : `docs/developpement.md` ; guide enseignant : `docs/enseignants.md`.
Savoir-faire complet (exigences, moteur, drives, Android, CI, releases,
pièges) : skill `.claude/skills/mathalea-mobile/SKILL.md`, à charger avant
toute modification.

## Règles

### Rédiger des parcours pédagogiques

- Dans une fiche, « À retenir » contient une règle ou une méthode utilisable, jamais le libellé de la compétence. Écrire comme on expliquerait en classe, sans formule de slogan ni tournure artificielle.
- Chaque exemple résolu et chaque petite question portent sur le savoir-faire de la ceinture où ils figurent. Éviter les étapes qui répètent la même idée. Vérifier les calculs et les distinctions de vocabulaire, notamment « chiffre des centaines » et « nombre de centaines ».
- Donner un exemple résolu à chaque ceinture. Le retour d'une petite question explique le raisonnement en français naturel ; il ne se limite pas à répéter la bonne réponse. Relire ensemble règle, exemple, question et retour dans l'aperçu élève.
- Pour les parcours mobiles de Préqualifiant, éviter les exercices qui demandent d'écrire des nombres en toutes lettres ou d'autres longues réponses en français quand l'écriture n'est pas l'objectif mathématique utile.
- Prévoir plusieurs exercices par ceinture pour varier l'évaluation. Un exercice connexe ou un prérequis peut servir de révision espacée, à condition que le savoir-faire principal reste réellement interrogé. Noter séparément ce qui manque au catalogue interactif et proposer une famille d'exercices à créer.
- À chaque travail sur un parcours : `node e2e/apercu-parcours.mjs <fichier> <id>` (fiches et questions dans l'ordre de passage, ceinture indiquée, une planche par ceinture dans `apercus/<id>/`), relire les planches puis les envoyer à Nathan ; et `PARCOURS=<id> node e2e/parcours-az.mjs <fichier>` (un élève qui répond juste obtient chaque ceinture).
- Étiqueter chaque exercice avec le savoir-faire qu'il interroge réellement. Une question de révision ne doit pas gonfler la maîtrise affichée de l'objectif nouveau. Vérifier l'ordre des ceintures avec les questions générées, pas seulement leurs titres.

- Français partout (interface, commentaires, documentation). Pas de tiret cadratin.
- Design : couleurs, polices et icônes de MathALÉA (classes Tailwind compilées
  dans `static/moteur/moteur.css`, voir `src/lib/ui/classes.ts`), formes d'une
  app de téléphone et non d'un site : barre de titre avec retour, onglets en
  bas, panneaux du bas (`Feuille`), bouton retour du téléphone partout. Le
  peu de CSS propre à l'app est dans `src/app.css`, avec les variables de
  couleur de MathALÉA (aucune nouvelle couleur). Aucun style
  « maquette IA » (dégradés, pastilles décoratives, slogans), aucun texte de
  remplissage ni placeholder : chaque texte porte une information ou une action.
- Icônes boxicons avec `aria-hidden="true"`.
- Aucune donnée de l'élève ne quitte l'appareil ; l'app ne stocke aucun
  identifiant. Les parcours de l'enseignant arrivent par les dossiers partagés
  (`parcours-mathalea.json`). Le catalogue de l'Explorer n'est pas dans
  l'app : les fichiers `explorer/*.json` (sources, testées) sont déposés dans
  le dossier kDrive partagé de l'Explorer, sous-dossier `FR` ou `CH`
  (`DOSSIER_EXPLORER` dans `src/lib/partage.ts`), lus comme ceux des enseignants ; l'app garde la
  dernière copie reçue et, hors connexion, invite à se connecter. Les parcours de démonstration
  (`static/demo`, `scripts/demonstration.mts`) sont chargés et retirés par
  l'enseignant dans les Réglages, jamais d'office.
- Une séance garde une copie figée de son parcours (`contenu`) : ne jamais lire
  la version courante pour rejouer, relire ou reprendre.
- Moteur : chargé à l'exécution depuis `static/moteur` (`pnpm moteur`, source
  dans `moteur/`), jamais importé dans le code de l'app. Contrat :
  `src/lib/moteur.ts` (`API_ATTENDUE`). Toutes les apps utilisent notre moteur,
  livré avec l'app : aucune mise à jour téléchargée depuis mathalea.fr
  (`MISES_A_JOUR`, `moteur.rs`). Le code de MathALÉA n'est jamais modifié ;
  les corrections vont dans `moteur/fichiers/src/moteur/index.ts`, le style
  dans `src/app.css`.
- Moteur de chaque version : toujours commiter le moteur construit avec la
  version, dans `releases/<vX.Y.Z>/MathALEA-<X.Y.Z>-moteur.tar.gz` (Git LFS ;
  `tar -czf … -C static moteur`). Sans lui, on ne peut plus rejouer ni
  vérifier une version sans la forge de MathALÉA (session sans accès à la
  forge, 30 octobre 2026). Pour une version déjà publiée sans archive :
  `scripts/moteur-depuis-app.py` l'extrait du binaire Linux de la release.

## Vérifier avant de rendre

Chaque release touche beaucoup de monde : rien ne passe sans vérification
complète (détails dans le skill, « Vérification »).

- Release : seulement par `bash scripts/publier.sh vX.Y.Z`, sur l'ordinateur
  de Nathan (seul à publier). Il lance `scripts/verifier-release.sh` (check,
  test, cargo test, toutes les suites e2e, tous les formats de réponse et
  **tous les parcours** de `explorer/` et de la démonstration joués de A à Z
  par un élève qui répond juste) et ne pose le tag que si tout est vert.
  Jamais de tag `v*` posé à la main.
- Formats de réponse (Nathan, 31 octobre 2026 : « validables et validés et
  pris en compte ») : chacun est saisi juste et compté correct, correction à
  chaque question et à la fin (`node e2e/formats.mjs`,
  `node e2e/formats-fin.mjs`). Aucune exemption dans `e2e/formats-reponse.json`.
- `pnpm check` et `pnpm test` ; `cargo test` dans `src-tauri`.
- Parcourir le changement comme un élève (vraies réponses, vrais boutons,
  jusqu'au bilan et au suivi), sur téléphone et en fenêtre de bureau. Jamais
  de réponses écrites directement dans le stockage pour conclure.
- Toutes les suites e2e, pas seulement celle du changement.
- Suites e2e (Nathan, 1er novembre 2026 : « toujours tester sur la version
  construite », un test qui échoue alors que l'app va bien n'est pas normal) :
  - toujours sur l'app construite (`NODE_ENV=development npx vite build` puis
    `npx vite preview --port 1420`), jamais sur `pnpm dev` ; arrêter `vite
    preview` avant de reconstruire ;
  - aucune pause fixe : attendre un état avec `e2e/attente.mjs` (`pagePrete`,
    `taperDans`, `pointStable`, `jusqua`), ou au plus une durée qui fait partie
    du geste testé (appui long, glissement) ;
  - tout travail asynchrone de l'app (rendu d'une question, démarrage,
    réseau, chargement) porte `aria-busy="true"` tant qu'il dure : c'est ce
    qu'attend `pagePrete` ;
  - un échec se rejoue d'abord seul, sur un petit sous-ensemble et plusieurs
    fois, avant de relancer toute la vérification. Vert seul mais rouge sous
    charge : la cause est dans la suite (geste fait trop tôt ou hors écran),
    on la trouve, on ne relance pas en espérant ;
  - écrire une suite (modèle : `e2e/eleve-puis-enseignant.mjs`) : toucher
    seulement un bouton immobile et visible (`pointStable`, `touchable` : la
    barre du bas suit le clavier), vérifier que chaque geste a eu son effet
    (arrivée au bilan, étiquette posée) et le refaire au plus deux fois comme
    un élève, faire défiler pour voir ce qu'on touche, téléphone (clair) et
    bureau (sombre), bouton retour, aucune erreur de page, captures
    regardées. Drives simulés par `ctx.route('**/__telecharger?**')`, jamais
    de vrai réseau. Le stockage (`copie:<clé>`) sert à poser un état de
    départ, jamais à donner une réponse. Une nouvelle suite entre dans
    `scripts/verifier-release.sh` ;
  - ne jamais modifier une suite pendant que `verifier-release.sh` tourne,
    ni reconstruire : elle joue le code présent au moment où elle le lit.
- Bon sens d'abord (Nathan, 31 octobre 2026 : « make common sense a
  priority ») : ce qu'un élève remarquerait au premier coup d'œil (champ ou
  bouton coupé, texte illisible, couleur qui change sans raison, ordre
  illogique) est un défaut bloquant. Le transformer en critère vérifié par les
  suites, comme `e2e/champs-visibles.mjs` (aucun champ de réponse coupé, joué
  par `test-niveau.mjs` et `parcours-az.mjs`), et regarder chaque capture
  comme un élève avant de dire que c'est fini.
- Défilement au doigt : `node e2e/defilement.mjs` et `node e2e/defilement-ecrans.mjs`
  (chaque écran et chaque panneau du bas, deux tailles de téléphone, bureau)
  après tout changement de CSS ou de mise en page (`overflow`, `position`,
  `touch-action`, `height`, `flex`). `release.yml` et
  `google-play.yml` lancent les suites e2e (`scripts/e2e-ci.sh`) et ne
  construisent ni n'envoient rien si l'une échoue.
- Catalogue de l'Explorer : avant de déposer un fichier, `node e2e/catalogue-moteur.mjs`
  (chaque exercice préparé par le moteur, sous trois graines, interactif).
- Changement d'interface : `pnpm e2e` (voir README) et un coup d'œil aux
  captures, en clair et en sombre, à 390 px de large.
- Google Play (Nathan, 2 novembre 2026 : « plus de Play Console pour
  l'instant ») : aucun envoi à la Play Console par la CI ni par Claude.
  `google-play.yml` reste désactivé ; Nathan crée lui-même la version Play
  avec le `.aab` de `release.yml` (artefact `google-play`) et sa note
  `.play.txt`. Claude peut faire la release de la forge (`scripts/publier.sh`)
  quand tout est vert.
- Toute release porte sa note de version : écrire `docs/notes-de-version/<vX.Y.Z>.md`
  (en français) avant de poser le tag ; `release.yml` la joint à la release
  GitHub et échoue si elle manque. Même exigence pour Google Play : sans elle la
  review est bloquée. Écrire aussi `docs/notes-de-version/<vX.Y.Z>.play.txt`
  (500 caractères au plus, sans balise), envoyée par `google-play.yml` (voir
  `docs/fiche-boutiques.md`).
- Ne rien commiter ni pousser sans demande explicite (sur ce projet, Nathan a
  demandé de pousser souvent).
- Une session = une branche et un worktree : `bash scripts/worktree.sh <nom>`.
  Le travail en cours se commite sur sa branche, jamais laissé dans la copie
  de travail de `main` (plusieurs sessions, locales et cloud, travaillent sur
  ce dépôt). Une seule suite e2e à la fois sur la machine (ports 1420, 8702).
