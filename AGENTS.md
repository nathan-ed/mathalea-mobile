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
  `src/lib/moteur.ts` (`API_ATTENDUE`).

## Vérifier avant de rendre

Chaque release touche beaucoup de monde : rien ne passe sans vérification
complète (détails dans le skill, « Vérification »).

- `pnpm check` et `pnpm test` ; `cargo test` dans `src-tauri`.
- Parcourir le changement comme un élève (vraies réponses, vrais boutons,
  jusqu'au bilan et au suivi), sur téléphone et en fenêtre de bureau. Jamais
  de réponses écrites directement dans le stockage pour conclure.
- Toutes les suites e2e, pas seulement celle du changement.
- Changement d'interface : `pnpm e2e` (voir README) et un coup d'œil aux
  captures, en clair et en sombre, à 390 px de large.
- Ne rien commiter ni pousser sans demande explicite (sur ce projet, Nathan a
  demandé de pousser souvent).
