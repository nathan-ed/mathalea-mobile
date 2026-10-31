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
  identifiant. Les parcours arrivent par les dossiers partagés
  (`parcours-mathalea.json`), aucun n'est intégré à l'app. Seule exception :
  les parcours de démonstration (`static/demo`, `scripts/demonstration.mts`),
  chargés et retirés par l'enseignant dans les Réglages, jamais d'office.
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
- `pnpm check` et `pnpm test` ; `cargo test` dans `src-tauri`.
- Parcourir le changement comme un élève (vraies réponses, vrais boutons,
  jusqu'au bilan et au suivi), sur téléphone et en fenêtre de bureau. Jamais
  de réponses écrites directement dans le stockage pour conclure.
- Toutes les suites e2e, pas seulement celle du changement.
- Bon sens d'abord (Nathan, 31 octobre 2026 : « make common sense a
  priority ») : ce qu'un élève remarquerait au premier coup d'œil (champ ou
  bouton coupé, texte illisible, couleur qui change sans raison, ordre
  illogique) est un défaut bloquant. Le transformer en critère vérifié par les
  suites, comme `e2e/champs-visibles.mjs` (aucun champ de réponse coupé, joué
  par `test-niveau.mjs` et `parcours-az.mjs`), et regarder chaque capture
  comme un élève avant de dire que c'est fini.
- Défilement au doigt : `node e2e/defilement.mjs` après tout changement de CSS
  de page (`overflow`, `position`, `touch-action`, `height`). `release.yml` et
  `google-play.yml` lancent les suites e2e (`scripts/e2e-ci.sh`) et ne
  construisent ni n'envoient rien si l'une échoue.
- Changement d'interface : `pnpm e2e` (voir README) et un coup d'œil aux
  captures, en clair et en sombre, à 390 px de large.
- Toute release porte sa note de version : écrire `docs/notes-de-version/<vX.Y.Z>.md`
  (en français) avant de poser le tag ; `release.yml` la joint à la release
  GitHub et échoue si elle manque. Même exigence pour Google Play : sans elle la
  review est bloquée. Écrire aussi `docs/notes-de-version/<vX.Y.Z>.play.txt`
  (500 caractères au plus, sans balise), envoyée par `google-play.yml` (voir
  `docs/fiche-boutiques.md`).
- Ne rien commiter ni pousser sans demande explicite (sur ce projet, Nathan a
  demandé de pousser souvent).
