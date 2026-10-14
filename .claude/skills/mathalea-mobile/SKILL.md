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
- Vocabulaire : « correcte(s) / incorrecte(s) » (pas « juste / pas juste »),
  l'app s'appelle « MathALÉA » (logo : dé + « MathALÉA par CoopMaths »),
  pas de « min » de durée, pas de badge « Hors ligne » (tout est hors ligne).
- Icônes boxicons avec `aria-hidden="true"`.
- Captures à vérifier à 390 px, en clair et en sombre.

Ergonomie décidée
- Éditeur de parcours : **un seul écran** pour créer et modifier (pas
  d'assistant à étapes : « trop compliqué »). Tout prérempli à la
  modification, réglages d'exercice modifiables sur place à partir des valeurs
  choisies, ligne « À compléter : … » tant qu'il manque une information.
- Classes et chapitres existants toujours proposés (les siens et ceux des
  dossiers suivis), chapitres des classes cochées d'abord.
- Ajout d'exercices comme sur le site : niveau, puis chapitre (noms du site),
  recherche, réglages (paramètres du site) et aperçu.
- Après « Valider » / « Enregistrer et quitter » : encadré qui propose
  « Télécharger (Android : Partager) tous les parcours » et « … ce parcours
  seul ». C'est « le plus important » : sans fichier, rien n'arrive aux élèves.
- Réglages de l'app : chaque réglage s'applique aussitôt ; après un
  changement, bouton « Enregistrer et quitter » qui ramène à l'accueil.
- Entrée : champ suivant (ajoute la classe saisie, importe le lien collé).
- Un élève avec une seule classe voit directement son contenu.

Git et publication
- « Ne rien commiter ni pousser sans demande explicite » en général. Sur ce
  projet, Nathan a demandé de **pousser souvent**, même sans release prête.
- MathALÉA : « on ne fork pas ». Le code du moteur vit dans `moteur/` en
  attendant une MR que Nathan ouvrira plus tard (voir 3).

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
- `exporter()` : banque complète, marque `exportee` par classe.
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
- `decrireExercice` est optionnelle côté app (`moteur.decrireExercice?.()`) :
  un moteur ancien n'a pas les réglages.
- Valeur par défaut d'un paramètre : non stockée dans l'étape (l'exercice suit
  les évolutions du site).
- Suisse : niveaux 9e, 10e, 11e, 1re à 4e Collège, référentiel CH. Le niveau
  d'un parcours d'un autre pays reste affiché dans l'éditeur.

Mises à jour du moteur sans mise à jour de l'app (`src-tauri/src/moteur.rs`)
- Publication : `node scripts/publier-moteur.mjs <dist-moteur> <sortie> <clé .pem>`
  → `moteur-<v>.tar.gz`, `mise-a-jour.json` (format `moteur-mathalea/1`,
  version, api, publieLe, archive, taille, sha256), `mise-a-jour.json.sig`
  (Ed25519, base64). Clé : `node scripts/cles-moteur.mjs <fichier>` ; la clé
  publique va dans `CLE_PUBLIQUE`. Clé actuelle = clé de test
  (`~/.local/share/mathalea-mobile/moteur-ed25519.pem`).
- App : signature, même API, plus récent (`publieLe`), taille et SHA-256,
  extraction à part, activation au lancement suivant (jamais en séance),
  recherche au lancement, au retour dans l'app et toutes les 10 min comme
  les dossiers suivis et l'Explorer (`actualiser()`),
  servi par `moteur://`, repli sur le moteur livré. Réglages : version et
  « Rechercher une mise à jour ».
- `URL_MISES_A_JOUR` et `URL_EXPLORER` (catalogue Explorer, `partage.ts`)
  sont des **adresses provisoires** (coopmaths.fr répond 503) : Nathan les
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
  - Autre (Nextcloud, local) : `<lien>/parcours-mathalea.json` seulement.
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
  session. Projet **privé** : les liens de release mènent à la connexion pour
  un visiteur. `main` protégée : force-push interdit (on l'a autorisé un temps
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
  `scripts/release.sh v0.1.1` (récupère la release GitHub, `APK_LOCALES=1`
  ajoute les APK construites ici, crée ou complète la release via `glab api`).
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
- `node e2e/regressions.mjs` (seulement `pnpm dev`) : brouillon d'une question
  quittée aussitôt, Entrée avec correction à la fin, suivi d'une ancienne
  version. Vraie frappe clavier : la sonde réessaie tant que le champ
  MathLive n'est pas prêt (sinon résultats aléatoires).
- Les deux scripts sortent avec le code 1 en cas d'échec. `spike-sync` se lance
  par `pnpm run server <dossier>` (`pnpm server` est une commande de pnpm).
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
  brouillon de `BlocQuestion` part dans un `queueMicrotask`.
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

## 10. Feuille de route

- 0.1.1 : publiée (éditeur sur un écran, navigateur d'exercices, plusieurs
  fichiers par dossier, téléchargements après validation, partage Android,
  mises à jour du moteur et Explorer avec adresses provisoires).
- À fixer avec Coopmaths : adresses `URL_MISES_A_JOUR` et `URL_EXPLORER`,
  vraie clé de signature du moteur et de l'APK, projet de la forge public,
  MR du moteur dans MathALÉA (puis supprimer `moteur/` et la release `moteur`
  du miroir GitHub).
- 0.1.2 (publiée) : fiabilité (sauvegardes, brouillons, Entrée, suivi).
- 0.1.3 (publiée) : espace enseignant réorganisé (Publier et état « à jour chez les
  élèves », mise en route, « Éditer un parcours existant » pour tous les
  parcours, « Exporter ce parcours », Dupliquer, ordre par classe,
  correction invisible pour les élèves : `reprendreResultats`), relecture
  des dossiers et du moteur à chaque retour dans l'app.
- 0.1.4 : dictionnaire de compétences par chapitre (édité dans l'app ou
  importé en JSON), étiquetage rapide des exercices, suivi par compétence.
- Idées notées par Nathan (docs/developpement.md, « À faire ») : création
  de parcours depuis le site MathALÉA (et édition d'un `.json` chargé),
  retour élève vers enseignant (QR ou fichier `bilan-mathalea/1` avec
  statistiques et réponses des tentatives dernière et meilleure, graines
  pour régénérer les questions ; tailles mesurées dans la doc).
- Plus tard : moteur en ressource Android (une copie), iOS (Mac nécessaire),
  Wi-Fi seulement pour le moteur, version minimale du moteur par parcours,
  clé Google Drive, ressources (PDF, images) à côté des parcours.
