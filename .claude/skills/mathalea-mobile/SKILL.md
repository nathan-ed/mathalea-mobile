---
name: mathalea-mobile
description: Développer, tester et publier l'app MathALÉA mobile (Tauri 2, Svelte 5, moteur MathALÉA embarqué) - exigences de Nathan, architecture, partage par drives, moteur, Android, builds, CI, releases et pièges connus. À charger avant toute modification de ce dépôt.
---

# MathALÉA mobile : savoir-faire du projet

Dépôt : `~/Documents/projets/mathalea-mobile`. Consignes courtes : `AGENTS.md`
(lien `CLAUDE.md`). Détails techniques : `docs/developpement.md`. Guide
enseignant : `docs/enseignants.md`. Ce skill rassemble ce qui a été appris
en développant les versions 0.1.0 et 0.1.1 (octobre 2026).

## 1. Exigences de Nathan (à respecter sans qu'il le redise)

Rédaction
- Français partout : interface, commentaires, docs, réponses. Aucun tiret
  cadratin (le caractère long), ni dans le chat ni dans les fichiers.
- Docs « concises, claires, aucun style IA ».

Design (« les dev MathALÉA en charge du design vont me tomber dessus »)
- 100 % charte MathALÉA : uniquement les classes Tailwind présentes dans
  `static/moteur/moteur.css` (compilées par le site). Avant d'utiliser une
  classe nouvelle, la chercher :
  `grep -c '\.h-9[{,: ]' static/moteur/moteur.css` (0 = absente, ne marche pas).
- Composants repris du site : `Tuile` (MobileTile), `ChampTexte`
  (InputText), `ChoixRadio` (FormRadio), classes de `src/lib/ui/classes.ts`
  (`boutonAction`, `boutonInverse`, `listeGroupee`, `pastille`).
- « Ça fait trop site web » (testeurs, octobre 2026) : couleurs, polices et
  icônes de MathALÉA, mais **formes d'app** (décision de Nathan). `EnTete`
  (logo à l'accueil seulement, ailleurs retour + titre), `BarreOnglets`
  (onglets élève en bas), `Feuille` (confirmations en panneau du bas), bouton
  flottant (`.bouton-flottant`), boutons sans majuscules ni survol, cartes
  sans cadre, pas de pied de page (licence dans Réglages, « À propos »),
  thème dans Réglages (« Apparence »), texte non sélectionnable hors champs,
  dé qui tourne au lancement (`app.html`). CSS propre à l'app dans
  `src/app.css` avec les variables `--color-coopmaths*` de moteur.css.
- Bouton retour du téléphone partout (`navigation.svelte.ts`, `retourSi`) :
  tout nouvel état « ouvert » (sous-niveau, panneau, mode) doit déclarer
  `retourSi(() => ouvert, () => (ouvert = false))`.
- Rien d'« AI-like » : pas de dégradés, pastilles décoratives, slogans, texte
  de remplissage ni placeholder. Chaque texte porte une information ou une
  action (« aucun placeholder ou dead text avec moi »).
- Beau, motivant, « 300 % intuitif », « 100 % fluide » pour les élèves.
- « L'appli doit être nickel. N'oublie jamais les Android 11 » : chaque
  changement d'interface ou d'Android s'essaie aussi sur Android 11 (des
  collègues et élèves l'ont encore, souvent sous MIUI), pas seulement sur le
  dernier Android de l'émulateur. Voir section 5.
- Vocabulaire : « correcte(s) / incorrecte(s) » (pas « juste / pas juste »),
  l'app s'appelle « MathALÉA » (logo : dé + « MathALÉA par CoopMaths »),
  pas de « min » de durée, pas de badge « Hors ligne » (tout est hors ligne).
- Icônes boxicons avec `aria-hidden="true"`.
- Captures à vérifier à 390 px, en clair et en sombre.
- Tout changement d'interface : **montrer les captures à Nathan** (390 px,
  clair et sombre, écrans touchés) avant de dire que c'est fini, sans
  attendre qu'il les demande (« montre-moi une capture pour valider »). Prendre
  la capture après les animations (panneaux, changement d'écran).

Vérification (Nathan, 17 octobre 2026 : « chaque release touche beaucoup de
monde, on ne peut pas se permettre d'avoir des erreurs comme ça »)
- Rien ne part sans avoir été parcouru **comme un élève** : vraies réponses
  (case cochée, saisie au clavier), vrais boutons, jusqu'au bilan puis au
  suivi. Un test qui écrit les réponses dans `localStorage` ne prouve rien
  sur l'interface (c'est ainsi que le 0/15 et la fiche « CAN CM2 sujet 2024 »
  sont passés en 0.3.1).
- Téléphone (390 px, tactile) **et** fenêtre de bureau (testeurs sur Mac) ;
  à chaque écran : bouton du bas visible et touchable (`elementFromPoint`),
  aucun texte interdit (CAN, noms de sujets), clair et sombre.
- Chaque chemin de sortie : quitter, reprendre, supprimer la tentative,
  bouton retour. Vérifier où l'on arrive.
- Relancer toutes les suites e2e, pas seulement celle du changement. Une
  suite en échec n'est jamais « déjà cassée » : la réparer ou trouver le bug.

Ergonomie décidée
- Profil : tout le monde est élève ; « Je suis enseignant » (interrupteur en
  bas des Réglages, pas d'infobulle sur mobile) remplace les onglets par ceux
  de l'enseignant (2026-10-20) : Parcours (bibliothèque, objectifs), Classes
  (et leurs sessions), En classe (sessions), Explorer. Mes parcours et Suivi :
  « Vue élève » (bandeau « Quitter »). « Les élèves ne devraient jamais voir
  Créer. » Toucher un parcours de la bibliothèque ouvre sa page
  (`FicheParcours`), pas l'éditeur. Une session porte sa classe (facultatif). Pas de choix
  du profil au premier lancement (programme seulement). L'enseignant voit
  toutes les classes de ses dossiers (pastilles), l'élève choisit la sienne.
- Rien de chargé (« c'est hyper chargé », « pas joli ») : un seul bouton plein
  par écran ; actions secondaires en lien (`boutonLien`) ou dans « Autres
  actions » (panneau du bas en liste avec icônes) ; confirmations et
  garde-fous en panneau du bas, jamais en encadré dans la page.
- Éditeur de parcours : **un seul écran** pour créer et modifier (pas
  d'assistant à étapes : « trop compliqué »). Tout prérempli à la
  modification, réglages d'exercice modifiables sur place à partir des valeurs
  choisies, ligne « À compléter : … » tant qu'il manque une information.
- Classes et chapitres existants toujours proposés (les siens et ceux des
  dossiers suivis), chapitres des classes cochées d'abord.
- Ajout d'exercices comme sur le site : niveau, puis chapitre (noms du site),
  recherche, réglages (paramètres du site) et aperçu.
- Après « Valider » / « Enregistrer et quitter » : panneau du bas qui propose
  « Exporter tous les parcours », « Choisir les parcours à exporter » et, sans
  classe, « Donner à des classes ». C'est « le
  plus important » : sans fichier, rien n'arrive aux élèves.
- Réglages de l'app : chaque réglage s'applique aussitôt ; après un
  changement, bouton « Enregistrer et quitter » qui ramène à l'accueil.
- Entrée : champ suivant (ajoute la classe saisie, importe le lien collé).
- Un élève avec une seule classe voit directement son contenu.
- Bouton retour (Nathan, 2026-10-20 : « on devrait toujours repasser par
  l'écran d'accueil ») : l'onglet de départ (Parcours pour l'enseignant, Mes
  parcours pour l'élève) est le seul d'où « retour » quitte l'app ; tout
  autre onglet y ramène. Vérifier par `node e2e/en-classe.mjs`.
- Sessions de l'enseignant (2026-10-20) : tout au même endroit, l'onglet En
  classe ; « Lancer la session » mène directement à la page de la session
  (QR code et code affichés), jamais un détour par plusieurs onglets.

Git et publication
- « Ne rien commiter ni pousser sans demande explicite » en général. Sur ce
  projet, Nathan a demandé de **pousser souvent**, même sans release prête.
- MathALÉA : « on ne fork pas ». Le code du moteur vit dans `moteur/` en
  attendant la MR !9394 (branche `moteur-app-mobile`, voir 3). Pousser vers
  MathALÉA : HTTPS avec `-c 'credential.helper=!glab auth git-credential'`
  (le SSH ne passe pas) ; travailler dans `~/Documents/projets/mathalea`
  (Nathan l'a autorisé) puis le remettre sur sa branche.

## 2. Architecture

- Tauri 2 + SvelteKit statique (Svelte 5, runes). Partie Rust :
  `telechargement.rs` (drives sans en-tête Origin), `moteur.rs` (mises à jour
  signées du moteur, protocole `moteur://`), `partage.rs` (feuille de partage
  Android), plugins sql, http, dialog, fs, opener.
- Données locales (SQLite via `stockage.ts`, `localStorage` dans un
  navigateur). Aucun compte, aucune donnée élève ne quitte l'appareil.
- Identifiant `fr.coopmaths.mathalea`, productName `MathALEA`, AGPL-3.0.
  `pnpm app` lance la version de dev sous `fr.coopmaths.mathalea.dev`
  (`src-tauri/tauri.dev.conf.json`) : données séparées de l'app installée.
  Données Linux : `~/.config/fr.coopmaths.mathalea[.dev]/parcours.db` et
  `~/.local/share/fr.coopmaths.mathalea[.dev]/` (moteurs téléchargés).
  Une AppImage qui « a déjà des parcours » lit ces données, ce n'est pas un bug.

Modèle (`src/lib/catalogue.ts`)
- `Parcours` : id (`[a-z0-9-]+`, stable), version (V1, V2…), titre, objectif,
  niveau, theme (= chapitre), difficulte 1-3 (Découverte, Entraînement,
  Approfondissement), presentation (`une_question_par_page`,
  `un_exo_par_page`, `liste_exos`), correction (`question`, `page`,
  `parcours` : avec `parcours`, changer de page ne valide rien), etapes.
- `Etape` : uuid, id, titre (titre MathALÉA brut avec `$`), `titreMasque`,
  nbQuestions, `sup`…`sup4` (chaînes, comme l'URL du site). `titreEleve()`
  enlève la référence et les `$`, ou donne « Exercice n ».
- Une séance garde une copie figée de son parcours (`contenu`) : ne jamais
  relire la version courante pour rejouer, relire ou reprendre. Résultats par
  version (`resultats:<id>@<version>`). Session partagée : code (ex. `1k3lr`),
  graine `code-id-vversion-étape`.

Bibliothèque de l'enseignant (`src/lib/bibliotheque.ts`)
- `enregistrer()` : modification d'un parcours déjà exporté = version
  suivante. Doit renvoyer `{ ...b, … }` (un oubli effaçait `lien`).
- `exporter()` : banque complète (« Exporter tous les parcours »), marque
  `exportee` par classe et pose `empreinte` (classes, parcours et
  attributions, objectifs). `aJour()` compare : sinon bannière « Version
  différente de celle du drive » / « Mettre à jour » sous la barre de chaque
  écran (`EnTete`, état dans `rappelExport.svelte.ts`, hors séance), puis
  « Fichier exporté : déposez-le sur le drive » jusqu'à `verifieLe` (dossier
  relu par `actualiser()`) ; sans lien, « Drive pas encore configuré » /
  « Configurer ». Croix : fermée jusqu'au prochain lancement.
  `completerEmpreinte()` au lancement : une bibliothèque d'avant 0.3.4 déjà
  exportée ne déclenche pas de fausse alerte. `sansEcartDrive()` : charger ou
  retirer la démonstration ne rend pas le drive « différent ».
  Nathan (17 octobre 2026) : par défaut on exporte **tout** ; l'attribution
  aux classes vient ensuite ; bannière « toute petite, discrète », sans date
  ni nom de fichier. Pas de message positif (« le dossier a le dernier
  fichier ») : on ne signale que ce qui reste à faire, la bannière disparaît
  quand c'est fait.
- `exporterChoix(b, ids)` : quelques parcours (panneau « Exporter des
  parcours », tous cochés par défaut ; tous cochés = fichier complet).
- `exporterUn()` : un parcours seul (`parcours-<titre>.json`, nom stable pour remplacer le précédent). Ne compte
  pas comme exporté par classe, mais marque sa version diffusée (`exportee['']`) :
  sinon un parcours seul déposé dans le dossier restait en V1 après
  modification et n'arrivait jamais aux élèves.
- Import d'un fichier (« Éditer un parcours existant ») : classes gardées
  par parcours (clé `importes-classes`), reprises par `adopter()`.
- `adopter(b, p, classes)` : reprise d'un parcours d'un dossier ou d'un
  fichier. Jamais de doublon (même id) ; une version plus récente remplace la
  copie locale ; les classes d'origine sont reprises.
- « Éditer un parcours existant » (`modeles` dans `+page.svelte`) : un
  parcours par id à sa version la plus haute, masqué si l'enseignant a déjà
  la même version ou plus récente. Import d'un fichier `.json` possible.

Organisation des parcours (0.2.0, voir `docs/developpement.md`)
- « On crée pour un niveau, on donne à une classe » (Nathan) : aucune classe
  dans l'éditeur ni dans le panneau d'après-enregistrement ; attribution dans
  la vue Classes de l'onglet Créer (Parcours / Classes / Objectifs).
- Paliers et ceintures : `paliers` (nombre d'exercices de chacun), `acces`
  `libre`|`seuil`, `seuil`, `ressource` (pour revoir), `pause` (contenu après
  le palier : « une pause du type on peut insérer un contenu théorique… un
  bravo »), `style` `paliers`|`ceintures`, `premiereCeinture` (on peut
  commencer à l'orange). Ne pas dire « jalon ». Couleurs des ceintures : seule
  exception à la charte, sur la ceinture elle-même (`CEINTURES`).
- Une séance = un palier ; pourcentage du parcours seulement pour un passage
  complet ; tuile « 1/3 » ; session partagée sur un palier ouvert ; bilan de
  palier avec la pause et « Continuer ».
- Objectifs : objectif du programme lu par le moteur (`listerExercices`, code
  sous le chapitre), mémoire par exercice (`cleExercice`), CSV au fil de
  l'année ; Suivi élève : objectifs (meilleur niveau, date au toucher) et
  ceintures (`objectifsTravailles`, `ceinturesObtenues`).
- Publication : le fichier porte toute la bibliothèque (`bibliotheque`) ;
  état « prêt à déposer » puis vérification du dossier (`publieLe`,
  `verifieLe`) ; reprise (`reprendre`) depuis un lien ou un fichier.
- **Toujours reporter sur la page `?v=parcours` du site** (demande de Nathan)
  tout changement du modèle de parcours ou de l'éditeur (nouveau champ,
  valeur par défaut, contrôle) : types `parcoursTypes.ts`, contrôle
  `parcoursFile.ts` (`isParcours`), valeurs par défaut `parcoursLibrary.ts`
  et `Parcours.svelte`, formulaire `ParcoursEditor.svelte`, test
  `tests/unit/parcours.test.ts`. D'abord récupérer `main` de MathALÉA
  (`git fetch` en HTTPS avec glab), une branche par changement depuis
  `origin/main`, puis push et MR (`glab mr create -R coopmaths/mathalea`).
  Exemple : MR !9426 (`enTetesMasques`, `melanger`).
- Page du site `?v=parcours` : dans `main` de MathALÉA depuis octobre 2026
  (la première MR a été fusionnée). Worktree
  `~/Documents/projets/mathalea-parcours` (ancienne branche `parcours-enseignants`),
  `src/lib/parcours/` (identifiants en anglais, règle du dépôt) et
  `src/components/setup/parcours/` ; fenêtre d'ajout du site réutilisée
  (`TypstAddExerciseModal`, options facultatives). « Rien de nouveau » : ne pas
  refaire un sélecteur d'exercices, réutiliser celui du site.
- Affichage (octobre 2026) : `enTetesMasques` (questions enchaînées,
  numérotées 1, 2, 3…) et `melanger` (ordre tiré une fois, `Seance.ordre`,
  du code en session partagée ; `questionsOrdonnees()` pour l'affichage,
  `questionsDe()` pour bilan et suivi). Vrais pour un nouveau parcours,
  absents = comportement d'avant (ne rien changer chez les élèves).
- Éditeur : « tout doit apparaître » (Nathan) : les exercices du menu du
  site selon le pays (FR ou CH), interactifs ou non, sauf « Égalité
  filles-garçons » (rangé à part sur le site). Un exercice non interactif se
  fait sur papier : « Voir la correction », hors score, passées et seuils
  (`Seance.papier`), bilan « Correction vue » (choix de Nathan). Le
  référentiel a des doublons d'uuid dans un même chapitre : dédoublonner
  toute liste à clé (`e2e/recherche.mjs` ouvre tous les chapitres).
- Teste ton niveau (Explorer, pour tous ; « on prend les annales », Nathan) :
  `src/lib/testNiveau.ts`, `TestNiveau.svelte`. Sujets CAN officiels de 2024
  et après (`can<niv>a-<année>`, racine `CAN` du référentiel FR, même en
  Suisse) ; `MetaExerciceCan` donne les questions de `sup2` (« 3-7-12 »).
  Une série de 15 (Nathan : « 30 c'est beaucoup ») : 5 parmi les questions
  1 à 10, 10 parmi les suivantes, classées par domaine (« classer les
  questions et tirer parmi » pour éviter les redondances :
  `scripts/questions-can.mts` → `src/lib/questionsCan.json`, par source,
  titre, domaine ; une question reprise par deux sujets = même source),
  80 %, correction à la fin puis bilan direct par question, sans nom de
  sujet. Ceinture par niveau (CM1 blanche … Terminale noire 3e dan).
  **Aucune mention de la CAN ni des sujets côté élève** (Nathan : « on ne
  voulait plus de références à ces CAN ») : titre et ceinture seulement
  (`presenterTest`, appliqué aussi aux tirages enregistrés), étapes
  `titreMasque`. Un test n'a pas de fiche de parcours : supprimer une
  tentative ramène aux niveaux, il n'est jamais ajouté à l'accueil. Pas de
  score dans la séance avant la soumission (il afficherait 0/15).
- Révisions espacées (`revisions.ts`, `Revisions.svelte`, tuile en haut de
  « Mes parcours ») : sur l'appareil, sans l'enseignant, l'élève peut choisir
  ses chapitres (Nathan, 2026-10-19). Leitner 1, 3, 7, 21, 56 jours, échec =
  boîte précédente, ceintures jamais retirées, séance de 3, 6 ou 10
  questions au choix (une par exercice), jamais de stock affiché, séance
  mélangée sans titres (`entrelacer`). Détails : `docs/developpement.md`, test
  `node e2e/revisions.mjs` (horloge Playwright `page.clock`).
- Suivi : « tout doit y figurer, ce sont des ceintures comme les autres » :
  tests passés (ligne par niveau, ceintures CM1 à Terminale dans l'onglet
  Ceintures) et parcours de l'Explorer même non ajoutés à l'accueil
  (`parcoursSuivis` dans `+page.svelte`).
- `titreMasque` : l'exercice disparaît de la fiche vue par l'élève (ni titre,
  ni « Exercice n ») et n'a pas de titre pendant l'activité.
  Les questions des sujets sont souvent importées d'un autre sujet (les 10
  premières communes à deux niveaux) : lire les imports du sujet, pas son
  dossier. Les sujets 2018-2023, « Spéciale année » (NY) et Aléa/CoopMaths
  ne choisissent pas leurs questions. Vérifier : `node e2e/sonde-can.mjs`,
  `node e2e/test-niveau.mjs` (pnpm dev).
- Explorer par degré puis par chapitre (Nathan, 2026-10-26) : noms et ordre
  repris du référentiel de MathALÉA (« si le référentiel change, il faut que
  ça change »), `src/lib/explorer.ts` (`reperesDu`, `arborescence`) ; seuls
  les degrés et chapitres qui ont des parcours apparaissent ; pays déduit du
  niveau (aucun champ `pays`). « Commencer » ajoute à Mes parcours ;
  enseignant : « Donner à des classes » (`adopter`, puis sa page). Sources
  du catalogue dans `explorer/` (Suisse : `ch-4e-college.json`, chapitre
  4mInt). Le référentiel se lit dans le moteur compilé (`listerExercices`),
  même sans accès à la forge. Test : `node e2e/explorer.mjs`. À venir :
  fiches de cours interactives avant une ceinture, « ceinture générale » de
  chapitre (plusieurs parcours courts).
- Démonstration : `static/demo/parcours-demonstration.json`
  (`npx tsx scripts/demonstration.mts`), chargée et retirée dans les Réglages
  (enseignant), classe `LIEN_DEMONSTRATION` jamais synchronisée.

## 3. Moteur MathALÉA

- Jamais importé dans le code : chargé à l'exécution depuis `static/moteur`
  (non versionné). Contrat : `src/lib/moteur.ts` (`API_ATTENDUE = 1`).
- Source : `moteur/` = `COMMIT` (commit de MathALÉA), `fichiers/`
  (`src/moteur/index.ts`, `vite.moteur.config.ts`), `version.patch`
  (`version.ts` sans appel réseau). `pnpm moteur` (`scripts/moteur.sh`) clone
  MathALÉA à ce commit dans `~/.cache/mathalea-mobile/mathalea` (ou
  `MATHALEA_CACHE`), y copie `fichiers/`, applique le correctif, construit
  (6 Go de RAM, environ 2 min) et copie `dist-moteur` dans `static/moteur`.
  Le clone est remis à l'état exact du commit à chaque fois : n'y rien éditer.
  Éditer le moteur = éditer `moteur/fichiers/`. Version du moteur :
  `date+commit.empreinte` (empreinte de `moteur/`, via `MOTEUR_VERSION`).
- Sur la machine de Nathan, le cache est un worktree du dépôt
  `~/Documents/projets/mathalea` ; le worktree `~/Documents/projets/mathalea-moteur`
  (branche `moteur-embarquable`, non commité) a servi au développement et
  contient la même chose : la source de vérité est désormais `moteur/`.
- API : `initialiser`, `preparerExercice(params, numero)` (champs
  `champTexteEx<numero>Q<i>` : deux exercices affichés ensemble ont des
  numéros différents ; l'aperçu de l'éditeur prend 900+), `afficher`,
  `ajusterFigures`, `ecrireReponses`, `verifier`, `monterClavier`,
  `listerExercices(pays)` (référentiel FR ou CH, `interactif` ; chapitres
  nommés par `levelsThemesList.json` / `levelsThemesListCH.json`, sinon on
  voit des codes comme « 4C2 »), `decrireExercice(uuid)` (nbQuestions par
  défaut, `nbQuestionsModifiable`, paramètres `sup`…`sup4` lus dans
  `besoinFormulaire{n}Numerique|Texte|CaseACocher` : nombre, liste,
  case, texte ; options « n : libellé » de l'info-bulle), `definirLangue`
  (`fr-CH` : `\cdot` au lieu de `\times`).
- Réponses de la classe à une session partagée (Nathan, 2026-10-18 : « tout le
  monde répond à une session partagée, l'enseignant récupère et met tout dans
  une IA pour un retour rapide et anonyme des erreurs », « disponible sur
  toutes les plateformes ») : QR code de l'élève (`MesReponses`, `releve.ts`,
  sans nom), relevé par l'enseignant (onglet En classe : `Releve` liste, `SessionClasse` page d'une session, `LectureReponses`, `Scanner`, `qr.ts`), recalcul
  hors écran (`ReponsesClasse` : on ne croit jamais un score reçu ; énoncés
  comparés par empreinte), résumé, vues Questions et Élèves, « Copier pour
  une IA », « Coller la réponse d'une IA », analyse dans l'app (`ia.ts`) par
  Claude, Mistral, OpenAI, une IA locale (Ollama, LM Studio) ou une autre
  adresse au format OpenAI (Nathan, 2026-10-19 : « Claude, local ou autre
  API ») ; réglage `cle-ia` (`ConfigIA`) jamais sauvegardé, `http://`
  seulement en réseau local. Prénom au choix de l'enseignant, **jamais envoyé
  à l'IA** (Nathan) : « Élève N » vers l'IA, consigne de garder ces numéros,
  `retraduire()` remet les prénoms à l'affichage.
  Toute session lancée par l'enseignant (`ReglageSession` puis « Lancer la
  session ») est gardée (Nathan : « si on quitte l'écran, on ne peut plus
  scanner », relever une heure après le cours ; croix pour effacer les
  sessions de test). La page de session ne se rafraîchit qu'à la fermeture de
  la caméra (sinon le scanner se refermerait au premier QR code).
  QR code de session à projeter (`invitation.ts`, `QrSession`) : l'élève le
  scanne depuis l'icône en haut de l'accueil et arrive dans la session, même
  sans le parcours (copie portée par le QR) ; app plus ancienne prévenue.
  Tests : `node e2e/session-qr.mjs`, `node e2e/en-classe.mjs`.
  Politique de confidentialité : nouveau texte en attente dans
  `docs/confidentialite-brouillon.html`. Ne jamais modifier
  `static/confidentialite.html` (publiée à chaque push par `pages`) pendant
  un examen Google Play (Nathan, 2026-10-19) : attendre son feu vert.
  Envoi automatique du lundi (`google-play.yml`) **désactivé** sur GitHub
  le 2026-10-19 pendant cet examen ; le réactiver seulement sur demande de
  Nathan (`gh workflow enable google-play.yml --repo nathan-ed/mathalea-mobile`).
  Pour un envoi à la main pendant la pause : `enable`, `workflow run … -f
  piste=internal`, puis `disable` aussitôt (un run lancé continue). 0.4.0
  (code 26101907), 0.4.1 et 0.4.2 envoyées ainsi en test interne le 2026-10-19,
  0.4.5 (code 26102520) le 2026-10-25. Le run sans `piste` part en production.
  Réglage dans le code de session (`modeQr` : empreinte du code entier, pas
  une lettre, pour qu'un élève ne puisse pas choisir son mode) : aucun, après,
  avant la correction (correction à la fin et QR code avant les résultats),
  chacun avec ou sans prénom. Vocabulaire : « Correcte / Incorrecte ».
  Guide : `docs/guide/sessions.md`, captures par `GUIDE=docs/guide/images`.
  Toute nouvelle clé de stockage doit avoir son validateur dans
  `sauvegarde.ts` (sinon les sauvegardes ne se restaurent plus). Pièges : le
  « ⊕ » des énoncés est le bouton « Ajouter une ligne » des réponses en
  plusieurs étapes (`.pmla-add`) ; jsQR ne lit qu'un code par image (masquer
  et relire) ; jamais `BarcodeDetector` : dans le WebView d'Android il appelle
  les services Google Play et tue l'app (`FATAL EXCEPTION:
  Chrome_InProcGpuThread`, `GooglePlayServicesMissingManifestValueException`,
  vu dans l'émulateur Android 16) ; KaTeX écrit « − » (U+2212) pour un moins. Tests :
  `node e2e/reponses-session.mjs` (Chromium, fausse caméra qui filme les QR
  codes) et `NAVIGATEUR=webkit` (WebKit de Playwright : bibliothèques flite
  manquantes remplacées par des bibliothèques vides dans
  `~/.cache/ms-playwright/webkit-*/minibrowser-wpe/lib`, avec
  `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`). Émulateur Android :
  `-camera-back videofile:<mp4>` fait filmer une vidéo des QR codes.
- Navigateur d'exercices = menu « Exercices aléatoires » du site, à
  l'identique (Nathan, 2026-10-18 : « le même affichage que sur le site ») :
  `listerExercices` renvoie les exercices dans l'ordre du menu et leur
  `chemin` (nœuds avec libellé du site « 2N : Calcul numérique », niveaux
  « Seconde », `sousTheme`). Le FR a jusqu'à 4 niveaux de nœuds (2e › 2N ›
  2N1 › 2N1A) : l'ancien découpage niveau › chapitre en faisait des listes de
  100+ exercices. L'app descend nœud par nœud ; un sous-thème (6N1A, 9NO1A,
  2N10) est un intertitre déplié, comme sur le site. Tri et libellés recopiés
  de `ReferentielNode.svelte` (`prepareSubset`, `themeCodeisSubthemeCode`) et
  `SideMenu.svelte` (`orderFollowingSchoolLevel`) : à resynchroniser s'ils
  changent. `titreHtml` (KaTeX) pour titres, tuiles et en-tête. Vérifier :
  `node e2e/referentiel-site.mjs FR|CH` (site sur 5199 :
  `npx vite --port 5199` dans `mathalea`, sans `makeJson`), qui déplie tout
  le menu du site et le compare au moteur.
- `decrireExercice` est optionnelle côté app (`moteur.decrireExercice?.()`) :
  un moteur ancien n'a pas les réglages.
- Valeur par défaut d'un paramètre : non stockée dans l'étape (l'exercice suit
  les évolutions du site).
- Suisse : niveaux 9e, 10e, 11e, 1re à 4e Collège, référentiel CH. Le niveau
  d'un parcours d'un autre pays reste affiché dans l'éditeur.

Mises à jour du moteur sans mise à jour de l'app (`src-tauri/src/moteur.rs`)
- Publication : par le site, à chaque mise en ligne, sur
  `https://mathalea.fr/releases/` (`URL_MISES_A_JOUR`). Scripts dans
  `moteur/fichiers/tasks/` (entrent dans MathALÉA avec la MR) :
  `pnpm build:moteur` puis `pnpm deploy:moteur` (`deploy_moteur.sh` :
  `publier_moteur.mjs` signe, rsync de l'archive puis de `mise-a-jour.json`
  et `.sig` vers `REMOTE_RELEASES_PATH`, trois archives gardées ; sans
  `REMOTE_SERVER`, dossier local pour les essais) ; `build:deploy` enchaîne
  site et moteur. Deux scripts séparés voulus : publier le moteur seul, et
  un échec du moteur ne bloque pas le site. Mode d'emploi des clés pour qui
  publie : `moteur/fichiers/documentation/developpement/maintenance-moteur/architecture/publication-moteur.md`
  (`node tasks/cles_moteur.mjs <.pem>`, la clé publique revient à l'app dans
  `CLE_PUBLIQUE`). Clé actuelle = clé de mathalea.fr (Rémi Angot, depuis
  0.1.5) ; la clé de test (`~/.local/share/mathalea-mobile/moteur-ed25519.pem`)
  ne signe plus que des publications locales, refusées par `CLE_PUBLIQUE`.
  Contrôle sur la vraie publication : copier `mise-a-jour.json`, `.sig` et
  l'archive de mathalea.fr/releases dans un dossier, puis
  `MOTEUR_PUBLICATION=<dossier> cargo test moteur -- --include-ignored`.
- Format : `moteur-<v>.tar.gz`, `mise-a-jour.json` (format `moteur-mathalea/1`,
  version, api, publieLe, archive, taille, sha256), `mise-a-jour.json.sig`
  (Ed25519, base64). La signature protège les apps d'un serveur web
  compromis (le moteur a les droits de l'app) ; la clé privée n'est pas sur
  le serveur.
- App : signature, même API, plus récent (`publieLe`), taille et SHA-256,
  extraction à part, activation au lancement suivant (jamais en séance),
  recherche au lancement, au retour dans l'app et toutes les 10 min comme
  les dossiers suivis et l'Explorer (`actualiser()`),
  servi par `moteur://`, repli sur le moteur livré. Réglages : version et
  « Rechercher une mise à jour ».
- `URL_EXPLORER` (catalogue Explorer, `partage.ts`) est une **adresse
  provisoire** (coopmaths.fr répond 503 ; le site tourne sur mathalea.fr/alea) : Nathan les
  fixe avec les devs Coopmaths. Essais : `MATHALEA_MOTEUR_URL`,
  `VITE_URL_EXPLORER` (`.env.development.local`, ignoré par Git).
- Sans adresse servie, tout fonctionne : moteur livré, Explorer « Aucun
  parcours proposé pour le moment. ».
- Hébergement possible partout où les trois fichiers sont publics sous une
  même adresse fixe (coopmaths.fr, GitLab Pages, `-/raw/` d'un projet public) ;
  redirections suivies (testé). Adresse et clé sont compilées dans l'app :
  les fixer avant une release, sinon les apps installées gardent l'ancienne.

## 4. Partage par dossiers de drive

- L'enseignant dépose des fichiers `.json` (format `classes-mathalea/1`,
  plusieurs classes ; l'ancien `classe-mathalea/1` reste lisible) dans un
  dossier partagé par lien public. Pas d'identifiants WebDAV. Le lien ne
  change jamais ; on remplace ou ajoute des fichiers.
- Tous les `.json` **à la racine** du dossier sont lus (banque
  `parcours-mathalea.json`, parcours seuls…). **Pas de sous-dossiers**
  (décision de Nathan). Les `.json` qui ne sont pas des parcours sont ignorés
  quand il y a plusieurs fichiers. `fusionner()` : classes de même nom
  réunies, un parcours (même id) gardé à sa version la plus haute, quel que
  soit l'ordre des fichiers.
- Un lien = un dossier, qui peut contenir plusieurs classes ; une seule classe
  = prise d'office, sinon l'élève choisit. Élève et enseignant peuvent suivre
  plusieurs dossiers (collègues).
- Lecteurs (`partage.ts`) :
  - kDrive : API de la page de partage (non documentée, reprise de sonoTour) :
    `/2/app/<drive>/share/<uuid>/init` → `data.file_id`, puis
    `/files/<id>/files?per_page=200&page=n`, `/files/<id>/download`.
  - Dropbox : `dl=1` ; un dossier arrive en zip **avec les fichiers à la
    racine** (entrée `/` puis `x.json`, sans dossier parent : vérifié sur le
    vrai zip) ; un fichier arrive tel quel.
  - Google Drive : lien de fichier (`uc?export=download`) ; lien de dossier
    seulement avec `VITE_CLE_API_GOOGLE` (non fournie).
  - Nextcloud (dont le Nuage d'apps.education.fr) : lien `…/s/<jeton>` →
    `…/s/<jeton>/download`, zip du dossier sous un dossier de tête à son nom
    (vérifié sur Nextcloud 30 : `docker run -p 127.0.0.1:8090:80 -e
    SQLITE_DATABASE=nc -e NEXTCLOUD_ADMIN_USER=… nextcloud:30-apache`, dépôt
    par WebDAV, partage par l'API OCS `shareType=3`) ; un fichier partagé
    seul arrive tel quel.
  - Autre (serveur local de test) : lien d'un .json, sinon
    `<lien>/parcours-mathalea.json`.
- Publications horodatées (`nomHorodate` : `parcours-mathalea-<date>.json`,
  `parcours-<titre>-<date>.json`) : demandé par Nathan, un nouveau dépôt
  n'est jamais renommé « (1) ». Lecture sans nom imposé (« cela ne devrait
  pas être aussi fragile »). La banque porte `banque: true` : seule la plus
  récente du dossier compte, un parcours retiré ne revient pas ; les parcours
  seuls s'ajoutent (version la plus haute).
- kDrive redirige vers une page d'erreur toute requête avec un `Origin`
  étranger, Dropbox n'autorise pas CORS. D'où :
  - dans l'app : commande Rust `telecharger` (HTTPS, HTTP seulement local) ;
  - dans le navigateur en dev (`pnpm dev`, `vite preview`) : relais
    `/__telecharger?url=` du serveur Vite (`vite.config.js`) ;
  - une version web publiée n'aurait ni l'un ni l'autre.
- Dossiers de démonstration (« Classe test », 7 parcours) :
  kDrive `https://kdrive.infomaniak.com/app/share/120240/ba6c0e4d-4386-4789-80f5-8d824146b723`,
  Dropbox `https://www.dropbox.com/scl/fo/61ukfii2ul7wygvtn480a/AMdjmMSWDB0y5U5-HVi2oCU?rlkey=japzwkf6z8n5ocnc0ovxi4lrj&dl=0`.
  Dossier de test plus complet (banque, parcours seul en V2, autre classe,
  `notes.json` à ignorer) : `npx tsx scripts/dossier-test.mts <sortie>` ; le
  déposer à la racine du dossier partagé. Ce que l'app lit d'un vrai lien :
  `npx tsx scripts/verifier-dossier.mts <lien>`.
- Les parcours de test ne sont jamais intégrés à l'app (« la classe test
  n'est pas là par défaut ») : `tests/parcours-de-test.ts`, pour les tests.

## 5. Android

Environnement (machine de Nathan)
- `ANDROID_HOME=$HOME/.local/share/the-file-android/sdk`,
  `NDK_HOME=$ANDROID_HOME/ndk/30.0.16248370`, `PATH=$HOME/.cargo/bin:$PATH`
  (rustup et cibles Android installées). Java 21.
- Release : `pnpm tauri android build --apk --split-per-abi --target aarch64 --target armv7`
  (pas d'APK universelle ni debug : l'APK debug universelle pesait 880 Mo ;
  limite de Nathan : 100 Mo, « juste mon apk à moi »). APK : environ 32 Mo
  (arm64) et 28 Mo (armv7), dans
  `src-tauri/gen/android/app/build/outputs/apk/{arm64,arm}/release/`.
- Essai rapide : `scripts/apk-essai.sh` (arm64) ou `scripts/apk-essai.sh x86_64`
  (émulateur) : sans LTO, une architecture, cache `src-tauri/target-essai`.
- Installation refusée sur un Xiaomi (MIUI 12, Android 11) : « paquet
  invalide » dans un installateur tiers, rien dans celui de MIUI, alors que la
  même APK s'installe sur un Android 11 standard. Depuis : bibliothèques
  compressées (`jniLibs.useLegacyPackaging = true`, APK de 32 à 25 Mo) et
  signature v1 + v2 + v3. AGP ne pose pas la v1 avec `minSdk` 24 : l'ajouter
  avec `apksigner sign --v1-signing-enabled true …` (vérifier avec
  `apksigner verify -v --min-sdk-version 18`).
- WebView minimum : Chrome 111 (Tailwind 4 de MathALÉA : `@layer`, `:where`,
  `:has`, `@property`). En dessous, `app.html` affiche « Mise à jour
  nécessaire » avec un lien Play Store vers Android System WebView. Convertir
  le CSS pour Chrome 83 a été essayé (lightningcss + postcss-preset-env) :
  il reste des centaines de `:where`/`:has`, abandonné. Un démarrage raté
  affiche la raison sous le dé après 20 s (`__erreursLancement`). Essai :
  image `system-images;android-30;google_apis;x86_64` (WebView 83 figé, sans
  Play Store) ; la supprimer ensuite (3,3 Go).
- **Toujours essayer sur Android 11** (API 30) en plus d'Android 16 : APK
  x86_64 sur un AVD Android 11 ; avec le WebView 83 de l'image sans Play
  Store, seul l'écran « Mise à jour nécessaire » est testable : pour l'app
  elle-même, il faut une image Android 11 dont le WebView est 111 ou plus
  (image `google_apis_playstore` à jour, ou WebView mis à jour). Nettoyer
  l'AVD et l'image après (disque).
- Constaté le 14 octobre 2026 : sur ce PC (x86_64), impossible de faire
  tourner l'interface sur un émulateur Android 11. Les images API 30 ont un
  WebView 83 figé, et Google ne publie plus de WebView x86 que pour
  Android 12L et plus (vérifié sur les versions 15x) ; pas de WebView x86 dans
  les compilations Chromium. Sur émulateur Android 11 : seulement
  l'installation et l'écran « Mise à jour nécessaire ». Pour l'interface : APK
  d'essai arm64 (`scripts/apk-essai.sh`, rangée dans `releases/essai/`) sur un
  vrai téléphone Android 11, dont le WebView se met à jour par le Play Store.
- Signature v1 : `scripts/signer-apk.sh <apk>…` (aussi dans la CI).
- **Toute compilation terminée va dans `releases/`** (demande de Nathan) :
  release dans `releases/v<x>/`, essai dans `releases/essai/`
  (`MathALEA-<version>-<commit>-android-<abi>.apk`, ignoré par Git), fait
  par `scripts/apk-essai.sh` lui-même.
- Signature : `src-tauri/gen/android/keystore.properties` (ignoré) ; clé de
  **test** `~/.local/share/mathalea-mobile/mathalea-test.jks`, aussi dans les
  secrets GitHub (`ANDROID_KEYSTORE`, `_PASSWORD`, `ANDROID_KEY_ALIAS`,
  `ANDROID_KEY_PASSWORD`). Nathan mettra la vraie clé lui-même dans les
  secrets (ne jamais la faire passer dans le chat). Changer de clé oblige à
  désinstaller une fois.
- `src-tauri/gen/android` est commité ; le plugin de partage y vit :
  `app/src/main/java/fr/coopmaths/mathalea/PartagePlugin.kt` (enregistré par
  `partage.rs` via `register_android_plugin`), fichier écrit dans
  `cacheDir/partage/`, FileProvider existant (`${applicationId}.fileprovider`,
  `xml/file_paths` : `cache-path`), `ACTION_SEND` `application/json`.
  Commande appelée côté JS : `partager_fichier` (`fichiers.ts`,
  `partageNatif` = Tauri + Android). Ailleurs : fenêtre « Enregistrer sous ».
  Sur Android, un panneau (`ChoixEnregistrement`) propose d'abord « Envoyer
  vers une app » ou « Enregistrer sur le téléphone » (`enregistrer_fichier`,
  `ACTION_CREATE_DOCUMENT`, rappel `@ActivityCallback`) : la feuille de
  partage ne propose pas toujours d'enregistrer (demande de Nathan, 0.3.3).
- Émulateur : AVD `mathalea` (Android 36, x86_64, sans Play) dans
  `~/.config/.android/avd` → exporter `ANDROID_AVD_HOME`. Lancement sans
  fenêtre : `emulator -avd mathalea -no-window -no-audio -no-snapshot -gpu swiftshader_indirect`,
  puis `adb wait-for-device`, `getprop sys.boot_completed`. Il faut une APK
  x86_64. Piloter avec `adb shell input tap/text/keyevent` et
  `adb exec-out screencap -p` (capture 1080x2400 affichée réduite : multiplier
  les coordonnées lues par 1,2). Pas d'app de drive dans l'image : la feuille
  de partage s'ouvre mais affiche « No apps can perform this action »
  (normal ; à vérifier sur un vrai téléphone). Arrêt : `adb emu kill`.
- Procédure d'installation pour les utilisateurs (sources inconnues, mode
  développeur, `adb install -r`) : README, « Installer l'APK ».

## 6. Builds, disque et vitesse

- Profil release : `opt-level "s"`, `lto`, `codegen-units 1`, `strip`,
  `panic abort` (taille). L'édition de liens LTO prend plusieurs minutes.
- Les dépendances Rust restent dans `src-tauri/target/<cible>/release` ; seul
  un changement de dépendances (ou de leurs features) les recompile.
- Disque presque plein (14 Go libres un jour). Gros postes reconstructibles :
  `src-tauri/target/debug` (≈ 9 Go), anciennes cibles `i686`/`x86_64` de
  `target`, `src-tauri/gen/android/app/build` (≈ 5 Go, à vider après avoir
  rangé les APK), AVD (≈ 2 Go). Garder `target/aarch64-linux-android` et
  `target/armv7-linux-androideabi` (cache des APK de release). Ne jamais
  supprimer pendant un build en cours.

## 7. CI et releases

- Forge (référence) : `origin` =
  `https://forge.apps.education.fr/coopmaths/mathalea-mobile.git`, push par
  `glab` (credential helper `!glab auth git-credential`, compte
  `nathan.scheinmann-ext`, Owner). Le SSH vers la forge ne marche pas depuis la
  session. Projet **public** depuis le 15 octobre 2026 (avant : privé). `main` protégée : force-push interdit (on l'a autorisé un temps
  avec `glab api PATCH protected_branches/main allow_force_push=true` pour
  réécrire l'historique initial, puis remis à `false`).
- Miroir **privé** GitHub `github` = `git@github.com:nathan-ed/mathalea-mobile.git` :
  construit les binaires (`.github/workflows/release.yml`). Lancer :
  `gh workflow run release.yml --repo nathan-ed/mathalea-mobile -f version=v0.1.1 -f cibles=tout|bureau|android`
  (ou un tag `v*`). Jobs : `moteur` (`scripts/moteur.sh`, cache du clone),
  `bureau` (ubuntu-22.04, windows, macos-latest ARM, macos-15-intel ; via
  tauri-action, release GitHub brouillon), `android` (NDK 27.2.12479018).
  Cache Rust `Swatinem/rust-cache`. Suivi : `gh run watch <id> --exit-status`.
- `.gitlab-ci.yml` (forge) : `pnpm check` et `pnpm test` à chaque push, dans
  `node:22` avec corepack. pnpm est fixé par `packageManager` (`package.json`) :
  sans cela corepack prend la dernière version (pnpm 12), qui refuse un paquet
  publié depuis moins de 24 h (`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`).
  Reproduire le job avant de pousser :
  `git archive $(git write-tree) | tar -x -C <dossier>` puis
  `docker run --rm -v <dossier>:/w -w /w node:22 bash -c "corepack enable && pnpm install --frozen-lockfile && pnpm check && pnpm test"`.
  Une copie propre n'a pas les types de Node : pas de `Buffer` ni de
  `req.url` typé dans `vite.config.js` (JSDoc `any`, `Uint8Array`).
- Release : tout va dans `releases/<v>/` (Git LFS, activé sur la forge) sous
  des noms uniformes `MathALEA-<v>-<système>.<ext>` + `SHA256SUMS`, et dans la
  release de la forge (un lien par fichier, liens sur `-/raw/main/…` pour
  pouvoir compléter après coup) :
  `scripts/release.sh v0.1.1` (récupère la release GitHub et l'`.ipa` du
  dernier run `ios.yml` réussi sur le commit du tag, `APK_LOCALES=1` ajoute les APK construites ici, crée ou complète la release via `glab api`).
  Relançable. Ordre voulu par Nathan : **APK d'abord**, puis le reste ; ranger
  ce qui est prêt sans attendre le reste. Penser à monter la version dans
  `package.json`, `src-tauri/tauri.conf.json` et `src-tauri/Cargo.toml`.
- Déroulé d'une release (0.1.3, fait de bout en bout) : tests complets
  (check, test, cargo test, job CI rejoué dans Docker, `complet.mjs`,
  `regressions.mjs`), version montée et `docs/developpement.md` à jour,
  commit, `git tag v<x>`, push du tag **seul** :
  `git push origin main v<x>` puis `git push github main v<x>` (le tag sur
  GitHub lance `release.yml` avec `cibles=tout`, environ 20 min ; suivre avec
  `gh run watch`). Puis `scripts/release.sh v<x>` ; il ne commite rien :
  `git add releases` (README et `releases/v<x>/`), commit, push sur les deux
  dépôts (300 Mo de LFS). Contrôle : somme SHA-256 d'une APK lue par
  `glab api "projects/coopmaths%2Fmathalea-mobile/repository/files/releases%2Fv<x>%2F<fichier>/raw?ref=main&lfs=true"`.
- **Jamais `git push --tags`** : des tags locaux anciens (`v0.1.0`, `v0.1.1`,
  `moteur`) partent avec. Un tag `v*` absent de GitHub relance une release
  (à annuler : `gh run cancel <id>`) ; le tag `moteur` sur la forge lance un
  pipeline en échec. Supprimer un tag distant (`git push origin :refs/tags/x`)
  est bloqué en mode auto : le demander à Nathan (`! …`).
- Lien vers la dernière release :
  `https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/releases/permalink/latest`.

- Boutiques (Google Play, App Store) : moteur figé (`MATHALEA_MOTEUR_FIGE=1`,
  toujours sur iOS), leurs règles interdisant le code téléchargé qui change
  l'app (vérifié dans le texte : Play « Device and Network Abuse », Apple
  2.5.2 et 4.7.2). Nathan accepte des versions hebdomadaires automatiques :
  `google-play.yml` (lundi, si nouveau moteur publié, dernier tag `v*`,
  `versionCode` daté). `.aab` aussi construit par `release.yml` (artefact).
  Voir `docs/developpement.md`, « Google Play et App Store ».
- Clés Android en CI : `scripts/cle-android.sh` écrit `keystore.properties`
  depuis l'environnement (jamais `${{ secrets.X }}` dans un `run:`, qui casse
  un mot de passe avec `$`, `\`, `"`). Clé d'importation Play de Nathan
  (`CN=CoopMaths`, secrets `ANDROID_UPLOAD_*`) posée le 15 octobre 2026 ;
  vérifier un `.aab` : `keytool -printcert -jarfile`.
- Fiche des boutiques : `docs/fiche-boutiques.md` (textes, réponses de la
  Play Console), captures `node e2e/fiche-play.mjs <dossier>` (1080 × 1920).
  Politique de confidentialité : `static/confidentialite.html`, aussi dans
  les Réglages (À propos), publique sur les Pages de la forge
  (https://coopmaths.forge.apps.education.fr/mathalea-mobile/confidentialite.html,
  `pages_access_level=public`, job `pages`).
- Guide en ligne (Pages de la forge) : https://coopmaths.forge.apps.education.fr/mathalea-mobile/,
  sources `docs/guide/*.md` (Markdown simple, liens `.md` changés en `.html`)
  construites par `scripts/guide.mjs` (job `pages`). Captures avec repère du
  prochain toucher : `node e2e/guide.mjs` (pnpm dev) et
  `node e2e/guide-site.mjs` (MathALÉA local, `npx vite --port 5180` dans le
  worktree), puis `FICHIER=<publié> SEULEMENT=importer node e2e/guide.mjs`.
  Ton voulu par Nathan : simple, « pas une syntaxe de livre ».
- Historique réécrit le 15 octobre 2026 (adresse personnelle retirée de deux
  commits) : tags `v*` et releases de la forge recréés, tag `moteur` supprimé.
- Google Play (15 octobre 2026) : 0.2.4 (code 26101518) envoyée en
  production, en examen. Bundle : `google-play.yml` (signé `CN=CoopMaths`,
  vérifier `keytool -printcert -jarfile`). Exigence des pages de 16 Ko :
  `-Wl,-z,max-page-size=16384` dans `src-tauri/build.rs` (Tauri impose
  RUSTFLAGS, `.cargo/config.toml` ne marcherait pas) ; contrôle
  `readelf -lW` sur le `.so`, segments `LOAD` à `0x4000`. Un code de version
  déjà importé est refusé : « Ajouter à partir de la bibliothèque ».
  Bêta-testeurs (inscription par Mattermost auprès de Nathan) : piste
  « Tests fermés » avec liste d'adresses Gmail, pas « Tests ouverts ».
  Avertissements Play sur `setStatusBarColor` : viennent d'androidx
  (`enableEdgeToEdge`), rien à faire. Envoi automatique : secret
  `GOOGLE_PLAY_SERVICE_ACCOUNT` posé, API « Google Play Android Developer »
  activée le 16 octobre 2026 (projet 922562518325). Envoi à la main :
  `gh workflow run google-play.yml --repo nathan-ed/mathalea-mobile -f forcer=true -f piste=internal`.
  0.3.0 envoyée en « Test interne » le 16 octobre 2026, puis 0.3.1. Le
  `versionCode` est daté à l'heure (`AAMMJJHH`, UTC) : deux envois dans la
  même heure sont refusés (« Version code … has already been used ») ;
  relancer après l'heure pleine. Test fermé (liste « Test 1 ») = piste
  `alpha` ; une version pour le test interne et le fermé = deux envois dans
  deux heures différentes (0.3.2, 17 octobre 2026). Attention : le
  lundi, sans `piste`, l'envoi part en **production** (dernier tag `v*`, si
  nouveau moteur publié). Le `.aab` (70 Mo) ne va pas sur la forge ; trop
  gros pour SendUserFile (30 Mo).
- `.ipa` non signée pour iPhone (`ios.yml`, `ipa=true`,
  `scripts/ios-sans-signature.sh`) jointe aux releases de la forge : lancer
  `gh workflow run ios.yml --ref v<x> -f ipa=true` (ou sur main au même
  commit) **avant** `scripts/release.sh`, qui la range avec le reste ;
  installation par Sideloadly (7 jours) décrite dans le guide. Non essayée
  sur un vrai iPhone. TestFlight attend le compte Apple Developer.
- Clavier d'Android et double toucher : vérifier sur l'émulateur avec
  `adb shell settings put secure show_ime_with_hard_keyboard 1` et le
  débogage du WebView (`adb forward tcp:9222
  localabstract:webview_devtools_remote_<pid>`, CDP en WebSocket ;
  Playwright `connectOverCDP` ne marche pas sur un WebView).
- iOS sans Mac : `ios.yml` (macOS de GitHub, à la main ; minutes macOS
  comptées dix fois sur un dépôt privé : ne pas le lancer pour rien).
  Plugin Swift `src-tauri/ios/` lié par `build.rs` (cfg macOS + cible ios),
  `partageNatif` vrai sur iPhone et iPad (qui se dit Macintosh tactile).
  `barre_etat` reçoit `telephone` : iOS rend alors l'apparence au téléphone
  (sinon `prefers-color-scheme` resterait figé). `moteur-publie.mjs` : le
  tar de macOS ne connaît pas `--warning`. Rien de lourd en local : la
  mémoire de la machine de Nathan est limitée (arrêter démons Gradle et
  serveurs de dev après usage).

## 8. Tests

- `pnpm check` (svelte-check, 0 erreur et 0 avertissement),
  `pnpm test` (vitest : partage, drives simulés, fusion, versions, sessions,
  bibliothèque, sauvegarde), `cd src-tauri && cargo test` (moteur : signature,
  archive altérée, autre API…) ; `cargo test -- --include-ignored` lit aussi
  les vrais dossiers kDrive et Dropbox ;
  `MOTEUR_PUBLICATION=<sortie> cargo test -- --ignored` vérifie une
  publication du script Node.
- Bout en bout `e2e/complet.mjs` (Playwright, Chromium système, trois
  appareils simulés à 390 px) : serveur `pnpm dev` sur 1420 ; dossier partagé
  local `spike-sync` (`../parcours-spikes/spike-sync`, 8701 WebDAV, 8702
  public, lien `http://127.0.0.1:8702/s/Xk42demo/test/`) ;
  `npx tsx e2e/preparer.mts <dossier>` (classes de test et catalogue
  Explorer) ; `.env.development.local` avec
  `VITE_URL_EXPLORER=http://127.0.0.1:8702/s/Xk42demo/explorer/` ;
  `DOSSIER=<dossier> CAPTURES=e2e/captures node e2e/complet.mjs` →
  « TOUT VERT ». Vider `<dossier>/classe-3a` avant. Regarder les captures.
- `node e2e/test-niveau-reel.mjs` (seulement `pnpm dev`, `THEME`, `NIVEAU`) :
  test parcouru au toucher sur téléphone et bureau, suivi, suppression,
  parcours de l'Explorer non ajouté, exercice masqué.
- `node e2e/regressions.mjs` (seulement `pnpm dev`) : brouillon d'une question
  quittée aussitôt, Entrée avec correction à la fin, suivi d'une ancienne
  version. Vraie frappe clavier : la sonde réessaie tant que le champ
  MathLive n'est pas prêt (sinon résultats aléatoires).
- Les deux scripts sortent avec le code 1 en cas d'échec. `spike-sync` se lance
  par `pnpm run server <dossier>` (`pnpm server` est une commande de pnpm).
- `node e2e/papier.mjs` et `node e2e/recherche.mjs` (seulement `pnpm dev`,
  sans le serveur de dossier qui remplace l'Explorer) : exercice papier,
  tous les chapitres.
- `node e2e/retour.mjs` (seulement `pnpm dev` et le dossier « test ») :
  bouton retour (`page.goBack()`) à chaque niveau.
- `node e2e/captures-enseignant.mjs <dossier>` : captures enseignant en clair
  et en sombre.
- `node e2e/drives.mjs` : vrais kDrive et Dropbox dans le navigateur (relais).
- Pièges Playwright : sélecteurs ambigus (`Enregistrer et quitter`,
  `Ouvrir le dossier`, boutons « Retirer l'exercice 4C21 » vs l'exercice) →
  `.first()/.last()` ou nom plus précis ; attendre la description d'un
  exercice avant de régler le nombre de questions (sinon la valeur par défaut
  écrase la saisie).

## 9. Pièges rencontrés

- Sauvegarde : `lireSauvegarde()` contrôle chaque clé (`cleInvalide`) avant
  d'effacer quoi que ce soit, tout le contenu imbriqué et l'unicité des noms
  et identifiants servant de clés aux listes (`src/lib/validation.ts`, aussi
  utilisé pour les fichiers partagés). Une nouvelle clé de stockage ou un
  nouveau champ affiché doit y être ajouté, sinon les sauvegardes qui le
  contiennent sont refusées (ou passent sans contrôle).
- CI GitHub : `pnpm/action-setup` sans `version` (le `packageManager` de
  `package.json` fait foi ; les deux différents = erreur). Actions en Node 24
  depuis octobre 2026 (checkout v7, setup-node v7, cache v6, artifacts v7/v8,
  tauri-action v1 : release brouillon obligatoire si elle existe déjà).
- Suivi, bilan, relecture : lire les étapes dans `seance.contenu`, jamais
  dans le parcours courant (une étape retirée faisait planter le suivi).
  Clés de `{#each}` : un même exercice peut figurer deux fois, prendre le rang.
- Svelte 5 : pendant un démontage (`onDestroy`), l'état relu a ses anciennes
  valeurs. Écrire la séance à ce moment remettait la question quittée : le
  brouillon de `BlocQuestion` part dans un `queueMicrotask`. De même, une
  tentative supprimée serait recréée par ce brouillon : `Seance` n'écrit plus
  rien après `supprimerTentative` (drapeau `supprimee`).
- Clavier du téléphone (Android, affichage bord à bord) : il recouvre la page
  au lieu de la réduire ; les barres du bas passaient dessous (« il faut
  appuyer deux fois », Nathan). `MainActivity.kt` réduit la vue de contenu de
  la hauteur du clavier moins la barre de navigation (déjà comptée par
  `--marge-bas`). Ne se voit pas dans Chromium : essayer sur l'émulateur avec
  `adb shell settings put secure show_ime_with_hard_keyboard 1` (sinon pas de
  clavier à l'écran). Les boutons des barres du bas ne prennent pas le focus
  (`barreDuBas.ts`, `use:garderSaisie`).
- APK d'essai sans compiler ici : `gh workflow run apk-essai.yml --repo
  nathan-ed/mathalea-mobile` (arm64 et x86_64, artefact `apk-essai`).
- Champs dans une figure (`MetaInteractif2d`, CAN) : réponse = trou
  `champ1` (`getPromptValue`), brouillon au format
  `MetaInteractif2dEx<n>Q<i>` → JSON ; un champ retiré de la page renvoie
  un trou vide (lire la valeur LaTeX). Le bug (« la réponse n'a pas été
  prise en compte ») ne se voyait qu'avec la correction à la fin.
- Tracés à main levée (`MainLevee`) : besoin de `div#appMathalea` dans la
  page, créé par `initialiser()` du moteur ; sans lui, figures sans segments.
- Champ à trous (« 81 = … × … ») : MathLive n'envoie ni `input` ni
  `change`, seulement `beforeinput` et `selection-change` ; sa valeur LaTeX
  n'est jamais vide (`trousVides`).
- Le clavier de MathALÉA peut s'ouvrir juste après l'ouverture d'une
  `Feuille` (focus de la question suivante) et la recouvrir : masqué par
  `body:has(.feuille)` dans `app.css`.
- Touche Entrée dans une séance (`surEntree`) : avec la correction à la fin,
  elle passe à la question suivante sans rien vérifier.

- `CARGO_TARGET_DIR` relatif : `tauri android build` travaille dans
  `src-tauri/`, le chemin y est résolu (un `src-tauri/src-tauri/target-essai`
  de 1,4 Go est apparu ainsi). Toujours un chemin absolu.
- Ne jamais `pkill -f` / `pgrep -f` avec un motif présent dans la commande
  elle-même : cela tue le shell. Tuer par PID (`ps -eo pid,cmd | grep "[m]otif"`).
- Plugin Vite : `configureServer` ne doit **rien renvoyer** (une fonction
  renvoyée est appelée après coup → « Cannot read properties of undefined
  (reading 'url') »). Après un changement de `vite.config.js`, SvelteKit
  rate souvent son redémarrage : relancer `pnpm dev`.
- `import.meta.env` est absent sous Node (scripts `tsx`) : écrire
  `import.meta.env?.VAR`.
- sha2 0.11 : l'empreinte ne se formate plus en `{:x}` ; convertir octet par
  octet.
- Script bash avec `set -e` : `[ -n "$x" ] && cmd` en fin de boucle arrête le
  script quand le test est faux ; écrire `if …; then …; fi`.
- Pas de `transform` dans une animation d'écran : il fait du conteneur le
  repère des éléments `fixed` (barres du bas, clavier) ; animer `left`.
- Le clavier MathALÉA (fixé, au premier plan) recouvre ce qui s'ouvre en bas :
  `Feuille` retire le focus à l'ouverture et passe au-dessus (`z-index: 100`).
- Historique : passer par `pushState` de `$app/navigation` (état
  `page.state.retour`), jamais `history.pushState` directement (conflit avec
  le routeur de SvelteKit).
- Svelte 5 : `let x: HTMLElement` lié par `bind:this` et utilisé dans une
  fonction donne un avertissement → `$state()`. Un `$effect.pre` qui rouvre
  un niveau doit ne le faire qu'une fois (sinon « retour » impossible).
- Titres MathALÉA avec `$…$` : KaTeX dans les en-têtes, `$` retirés dans les
  listes.
- La barre d'actions de la séance ne suit la hauteur du clavier que si un
  champ de réponse (`math-field`, clavier MathALÉA) a le focus.

- Serveur de dev ouvert depuis longtemps : après de gros changements de
  modules, le rechargement à chaud peut garder un module périmé (« nomPalier is
  not defined » alors que l'import est juste). Relancer `pnpm app`/`pnpm dev`
  avant de conclure à un bug.
- Rejouer la CI sur la copie de travail : `git ls-files -co --exclude-standard
  | tar -cf - -T - | tar -x -C <dossier>` ; `git write-tree` ne prend que
  l'index (modifications non indexées absentes). Docker crée des fichiers
  root : nouveau dossier à chaque fois, ou `chown` en fin de commande.
- Tuile avec épingle : deux boutons dont le nom contient le titre ; dans les
  tests, ancrer (`/^Titre/`).
- Panneaux (`Feuille`) : priorité au bouton retour (`retourSi(..., 1)`), sinon
  un onglet enregistré plus tard passe devant. Rôle `dialog`, nommé par son
  premier texte en gras, focus gardé, hauteur limitée à la zone visible.
- Ne jamais faire de capture du bureau de Nathan (`import -window root`) :
  données personnelles. Vérifier par Playwright avec ses données copiées.

## 10. Feuille de route

- 0.1.1 : publiée (éditeur sur un écran, navigateur d'exercices, plusieurs
  fichiers par dossier, téléchargements après validation, partage Android,
  mises à jour du moteur et Explorer avec adresses provisoires).
- À fixer avec Coopmaths : adresse `URL_EXPLORER`,
  vraie clé de signature du moteur et de l'APK, projet de la forge public,
  MR du moteur dans MathALÉA (puis supprimer `moteur/` et la release `moteur`
  du miroir GitHub).
- 0.1.2 (publiée) : fiabilité (sauvegardes, brouillons, Entrée, suivi).
- 0.1.3 (publiée) : espace enseignant réorganisé (Publier et état « à jour chez les
  élèves », mise en route, « Éditer un parcours existant » pour tous les
  parcours, « Exporter ce parcours », Dupliquer, ordre par classe,
  correction invisible pour les élèves : `reprendreResultats`), relecture
  des dossiers et du moteur à chaque retour dans l'app.
- 0.1.4 : interface d'app, APK plus compatible, écran WebView ancien.
- 0.1.5 : dictionnaire de compétences par chapitre (édité dans l'app ou
  importé en JSON), étiquetage rapide des exercices, suivi par compétence.
- Idées notées par Nathan (docs/developpement.md, « À faire ») : création
  de parcours depuis le site MathALÉA (et édition d'un `.json` chargé),
  retour élève vers enseignant (QR ou fichier `bilan-mathalea/1` avec
  statistiques et réponses des tentatives dernière et meilleure, graines
  pour régénérer les questions ; tailles mesurées dans la doc).
- Plus tard : moteur en ressource Android (une copie), iOS sur TestFlight,
  Wi-Fi seulement pour le moteur, version minimale du moteur par parcours,
  clé Google Drive, ressources (PDF, images) à côté des parcours.
