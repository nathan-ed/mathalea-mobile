---
name: generer-parcours
description: Générer ou modifier un fichier de parcours MathALÉA (format classes-mathalea/1) pour l'application mobile, sans passer par l'éditeur - à partir d'adresses d'exercices du site, d'une progression ou d'une demande d'enseignant. À charger pour « génère / écris un parcours JSON », « convertis cette feuille MathALÉA en parcours », « ajoute des ceintures à ce fichier ».
---

# Générer un fichier de parcours MathALÉA

Référence complète (champs, règles, exemple, consigne pour un assistant) :
`docs/guide/format-parcours.md`, publiée dans le guide en ligne
(https://coopmaths.forge.apps.education.fr/mathalea-mobile/format-parcours.html).
Fiches de cours d'un palier : skill `fiches-cours` (ligne éditoriale,
contrôle). Schéma : `docs/guide/parcours-mathalea.schema.json`. Exemple complet :
`docs/guide/exemple-parcours.json`. La vérité reste le contrôle de l'app
(`src/lib/validation.ts`, `lireFichier` dans `src/lib/partage.ts`) : si l'un
change, mettre à jour la page, le schéma et l'exemple (un test les compare,
`tests/testNiveau.test.ts`, « format des parcours »).

## Méthode

1. Exercices : uniquement des `uuid` réels, pris d'une adresse du site
   (`uuid=`, `id=`, `n=` → `nbQuestions`, `s`… `s4` → `sup`… `sup4`, en
   chaînes). Ne jamais inventer d'uuid. Dans ce dépôt, le référentiel est
   lisible par le moteur (`listerExercices`) ou dans le clone
   `~/.cache/mathalea-mobile/mathalea/src/json/referentiel2022FR.json`.
   Exercices interactifs seulement, et **référencés** dans le référentiel du
   pays (Nathan, 2026-10-26) : jamais « Non classés » ni un exercice pris dans
   le référentiel de l'autre pays.
2. Parcours : `id` en minuscules et tirets, stable ; `version` 1 pour un
   nouveau, +1 pour toute modification d'un parcours diffusé ; `titre`,
   `objectif` (une phrase pour l'élève), `niveau`, `theme`, `difficulte`
   1 à 3, `presentation`, `correction`. Nouveaux parcours de l'app :
   `enTetesMasques` et `melanger` à `true`.
3. Paliers : somme des `nb` = nombre d'étapes, au moins deux paliers ;
   `style: "ceintures"` et `premiereCeinture` 0 à 6 pour des ceintures.
4. Fichier : `format`, `exporteLe` (ISO), `classes` (noms uniques) ;
   parcours sans classe dans `bibliotheque.parcours` ; objectifs dans
   `bibliotheque.objectifs` (libellé = identifiant, cité par les étapes).
5. Vérifier avant de rendre :
   `npx tsx -e "import('./src/lib/partage.ts').then(m => m.lireFichier(require('fs').readFileSync('<fichier>','utf8')))"`
   ne doit rien afficher ; sinon le message dit quel parcours est invalide.

## Construire une progression par ceintures

- Partir des savoir-faire et de leurs prérequis, pas de l'ordre d'un tableau de programme. Déplacer une notion introduite trop tôt, fusionner les répétitions et écarter les objectifs hors du chapitre. Formuler ce qui est réellement entraîné, même si cela diffère légèrement du libellé administratif.
- Une ceinture teste son savoir-faire principal avec assez de questions variées. Prévoir en général au moins deux exercices et contrôler le nombre de questions **effectivement générées** : `nbQuestions` demandé peut être ignoré par un `ExerciceSimple`. Le second exercice peut réviser un prérequis ou une notion connexe, mais ne doit pas prendre toute la place.
- Lire les sources des exercices retenus : un titre ou un UUID interactif ne garantit ni le bon contenu ni la difficulté annoncée. Examiner `sup` à `sup4`, leurs valeurs par défaut, les familles mélangées et les limites du formulaire. Éviter les variantes `Old` quand une version actuelle existe. Tester plusieurs graines dans le moteur livré avec l'app, puis l'aperçu élève sur téléphone.
- Relire la suite des questions d'une ceinture et l'ordre des ceintures : aucune fraction avant sa représentation, aucune racine avant les carrés, aucune technique avancée sans préparation. Si un exercice ne peut pas être réglé pour le savoir-faire visé, le remplacer ou signaler la lacune ; ne pas renommer seulement le titre.
- Étiqueter chaque **exercice** avec l'objectif qu'il travaille réellement. Une révision espacée garde l'objectif du prérequis ; elle ne compte pas comme preuve de maîtrise de l'objectif nouveau. Vérifier les résultats par objectif en plus du seuil de la ceinture.
- Distinguer les deux suivis dans la présentation au professeur : le seuil de la ceinture commande l'accès à la suivante ; les objectifs étiquetés donnent un pourcentage de réussite distinct. Le format actuel ne définit pas de seuil de validation autonome pour chaque objectif. Ne pas annoncer qu'un objectif est « validé » automatiquement par le JSON.
- Pour les fiches, appliquer `fiches-cours`. Dans « À retenir », écrire une règle utilisable, jamais le libellé de l'objectif. L'exemple résolu et, s'il y en a une, la petite question portent sur cette ceinture. Le retour explique le raisonnement en français naturel. Éviter les longues réponses en toutes lettres si elles n'apportent rien à l'apprentissage mathématique sur mobile.
- Livrer avec le JSON une courte liste des savoir-faire non couverts par le moteur actuel et une idée précise d'exercice à créer. Augmenter la version des parcours déjà importés avant de rediffuser, sinon l'app peut garder l'ancienne copie.

## Rédaction

Français, titres d'élève courts (sans la référence du site), aucun tiret
cadratin, objectif concret (« Additionner deux relatifs sans hésiter »).
