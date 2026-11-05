# Remédiation

Demande de Nathan (5 novembre 2026) : à la fin d'un quiz manqué, savoir ce
que l'élève n'a pas réussi et lui proposer des exercices sur cette
compétence seulement ; aller jusqu'au champ de réponse (« on prend le premier
champ de réponse qui ne marche pas et on leur donne des exercices sur ce
champ-là »), par exemple dans une étude de fonction ; un chemin à branches
qui se construit au fur et à mesure ; après un test de base, monter
graduellement en difficulté sans parcours tout fait.

Ce document décrit ce qui est construit (branche `ccr-72fe30a6-9ez07r`), ce
que mesure le référentiel, le format, le parcours de l'élève, l'éditeur du
site, le serveur et la suite.

## 1. En bref

- **Le moteur sait dire quel champ est manqué**, sans toucher au code de
  MathALÉA. Une question peut avoir plusieurs « points de réponse » (trous,
  sous-questions a), b), cellules de tableau, plusieurs réponses) ; `verifier`
  renvoie le score de chacun.
- **18 % des exercices interactifs** ont des questions à plusieurs points
  (466 sur 2 642 en France, 552 sur 3 564 en Suisse). Pour 9 sur 10 d'entre
  eux, les points restent les mêmes d'une graine à l'autre : on peut les
  étiqueter. Pour les autres (82 %), une question = un point : l'objectif se
  pose sur l'exercice, ce qui suffit.
- **Dans l'app, la boucle est jouable de bout en bout** : diagnostic au
  bilan, séance de remédiation (exercices plus simples, puis l'exercice
  manqué avec de nouvelles valeurs), retour à la ceinture, prérequis si
  l'élève échoue encore, aide de l'enseignant après trois tours. Test de
  positionnement pour commencer à la bonne ceinture.
- **Le format est rétrocompatible** : des champs facultatifs, ignorés par les
  apps déjà installées.
- **Pour l'enseignant** : vue « Objectifs » d'une session de classe
  (réussite par objectif, réponse par réponse, et par où reprendre), sans rien
  envoyer à un serveur ; test de positionnement dans l'éditeur de l'app.
- **Montée en puissance sans parcours tout fait** : « Entraînement adapté »
  sur un parcours à paliers (`adaptatif`) ; l'app choisit l'exercice suivant
  (plus difficile après deux réussites, plus simple après un échec,
  prérequis après deux échecs, confirmation un autre jour).
- **Reste à faire** : appliquer à MathALÉA le correctif de l'éditeur du site
  (`?v=parcours`, préparé : `a-reporter-site-remediation.md`), où se posent
  objectifs par réponse et remédiations.

## 2. Ce que dit la recherche, et ce qu'on en garde

La revue d'octobre (`revue-pistes-2026-10.md`, 3.2) a déjà posé le principe :
l'effet de la pédagogie de la maîtrise tient à la boucle évaluation
formative, correction ciblée, puis **évaluation parallèle** (Bloom ; Guskey ;
Slavin, 1987). La remédiation construite ici est cette boucle :

| Étape de la maîtrise | Dans l'app |
| --- | --- |
| Évaluation formative | La séance d'une ceinture |
| Diagnostic | Premier point de réponse manqué, son objectif |
| Correction ciblée | Fiche de la remédiation, exemple corrigé de l'exercice manqué, exercices plus simples ou plus ciblés |
| Évaluation parallèle | L'exercice manqué, mêmes réglages, nouvelles valeurs |
| Correction suivante | Objectif prérequis, au plus trois tours, puis l'enseignant |

Deux choix viennent de la même source :

- **Le premier point manqué** plutôt que tous : dans une tâche en étapes
  (étude de fonction), l'erreur d'une étape entraîne souvent les suivantes ;
  corriger la première débloque le reste et évite d'en proposer trois à la fois.
- **Ni score ni ceinture pour une remédiation** : un exercice plus simple ne
  dit rien de la maîtrise de l'objectif visé (consigne du dépôt : « une
  question de révision ne doit pas gonfler la maîtrise affichée »). L'élève
  regagne la ceinture en la refaisant.

## 3. Ce que mesure le référentiel

Sonde `node e2e/sonde-points.mjs FR|CH` (app construite) : chaque exercice
interactif préparé sous trois graines, points de réponse de chaque question.

| | France | Suisse |
| --- | --- | --- |
| Exercices interactifs | 2 642 | 3 564 |
| Un seul point par question | 2 176 (82 %) | 3 012 (85 %) |
| Plusieurs points | 466 | 552 |
| … mêmes points dans toutes les questions et graines | 379 | 461 |
| … mêmes points pour une même question | 41 | 41 |
| … points qui changent avec la graine | 46 | 50 |

Plusieurs points, en France : trous d'un champ à compléter (298), plusieurs
réponses dans une question (85), sous-questions a), b) (45), tableaux (36).
Les points qui changent sont surtout des tableaux à cases tirées au hasard
(6N1E, 6AutoS1-4) et des trous en nombre variable (6N1A-3) : on ne les
étiquette pas, l'objectif reste sur l'exercice.

En lycée, la plupart des études de fonction de MathALÉA sont découpées en
questions séparées (un point chacune) ou en réponses multiples dans une même
question : TSA3-32 (dérivée puis tableau de variations), TSA3-43 (signes de
f, f′, f″ en sous-questions). `createSubQuestions` (sous-questions a), b)
d'une même question, octobre 2026) se répand dans MathALÉA : chaque
sous-question y est un point stable (`field0`, `field1`…), le cas idéal.

## 4. Points de réponse (moteur)

`moteur/fichiers/src/moteur/index.ts`, ajouts facultatifs au contrat
(`API_MOTEUR` reste 1) :

- `decrirePoints(exercice, i)` : points de la question i, dans l'ordre de
  l'énoncé. Clé « 0 », « 1 »… (rang de la réponse dans la question) pour une
  réponse simple, « 0:champ2 », « 0:field1 », « 0:L2C3 » pour une case d'une
  réponse qui en a plusieurs.
- `verifier()` renvoie `detail` : le score de chaque point (0 à 1).

MathALÉA calcule déjà le score de chaque case avant de les passer au barème
de la question (`bareme(points)`). Le moteur enveloppe ce barème le temps de
la vérification, sans rien changer au score : vérifié sur les trous (une case
juste sur deux : `champ1` 1, `champ2` 0, question 0/1 comme avant) et les
sous-questions. Une fonction de rappel propre à l'exercice qui n'appelle pas
le barème donne à chaque case le résultat de la question.

L'app garde `detail` dans l'essai seulement pour une question à plusieurs
points (`Essai.detail`).

## 5. Format (classes-mathalea/1, champs facultatifs)

```jsonc
{
  "positionnement": true,               // paliers : test proposé avant le premier
  "etapes": [
    {
      "uuid": "4336f", "id": "TSA3-32", "nbQuestions": 1,
      "objectifs": ["Dériver une fonction composée", "Dresser un tableau de variations"],
      // objectifs de chaque point ; un point absent garde ceux de l'exercice
      "points": { "0": ["Dériver une fonction composée"], "1": ["Dresser un tableau de variations"] },
      // exercices proposés à l'élève qui manque celui-ci, quel que soit l'objectif
      "remediation": [{ "uuid": "…", "id": "…", "titre": "…", "nbQuestions": 2 }]
    }
  ],
  "remediations": [                      // par objectif, un objectif au plus une fois
    {
      "objectif": "Dériver une fonction composée",
      "etapes": [{ "uuid": "3391d", "id": "1AN14-7", "titre": "Dériver u(ax + b)", "nbQuestions": 2 }],
      "fiche": { "titre": "…", "blocs": [] },   // facultative, montrée avant les exercices
      "prerequis": ["Dériver une fonction usuelle"]  // si l'élève échoue encore
    }
  ]
}
```

Contrôle : `estEtape`, `estParcours` (`validation.ts`) ; une remédiation n'a
pas de remédiation propre (profondeur par les prérequis seulement) ; clés de
points `^\d+(:[\w-]+)?$`. Sauvegarde : `Essai.detail`, `Seance.remediation`,
clé `positionnement` (`sauvegarde.ts`). Une app plus ancienne ignore ces
champs : elle montre le parcours comme avant.

## 6. Pour l'élève

Logique dans `src/lib/remediation.ts` (tests : `tests/remediation.test.ts`),
écrans dans `Bilan.svelte`, `DetailParcours.svelte`, `+page.svelte`.

**Diagnostic, au bilan d'une séance.** Pour chaque question manquée, dans
l'ordre où l'élève l'a vue : son premier point manqué et ses objectifs
(`points`, sinon ceux de l'exercice). Chaque objectif une fois, trois au
plus, sous « À retravailler » : « Dériver une fonction composée · Manqué
dans : Étudier les variations… ». Le bouton plein devient « Retravailler :
… ». Un exercice qui vise plusieurs objectifs sans résultat par point (une
question à un seul champ, plusieurs objectifs) demande à l'élève :
« Qu'est-ce qui t'a bloqué ? », avec les objectifs qui ont une remédiation.
C'est la question de Nathan, posée seulement quand l'app ne peut pas savoir.

**Choix de la remédiation**, dans cet ordre :

1. celle de l'enseignant pour l'objectif (`remediations`) ;
2. celle de l'exercice (`remediation`) ; elle passe en premier quand le
   diagnostic vient de l'exercice et non d'un point ;
3. automatique : les autres exercices du parcours qui visent l'objectif,
   ceux des paliers précédents d'abord (plus simples), puis ceux du même
   palier, jamais ceux d'un palier suivant ; deux au plus, trois questions
   chacun ;
4. automatique : les exercices d'autres parcours du même niveau (classes,
   Explorer) qui visent le même objectif, des moins difficiles aux plus
   difficiles ;
5. automatique, pour un objectif du programme (posé d'office, libellé du
   référentiel) : deux exercices interactifs du référentiel de MathALÉA rangés
   sous ce même objectif, dans l'ordre du menu du site. Ainsi un parcours sans
   aucune remédiation prévue en a une pour chaque objectif du programme
   (sonde : 2 642 exercices préparés sans erreur sous trois graines).

Rien trouvé : pas de proposition, le bilan reste celui d'avant (« Refaire »).

**Séance de remédiation.** Parcours généré sur l'appareil
(`remediation-<id>`), comme les révisions : la fiche de la remédiation s'il y
en a une, un **exemple corrigé** de l'exercice manqué (une question à lire,
champs inertes, « Voir la correction », hors score : `interactif: false` sur
l'étape), ses exercices, puis l'exercice manqué (mêmes réglages, nouvelles
valeurs, trois questions au plus), correction à chaque question. Elle garde
son origine (`Seance.remediation` : parcours, version, exercice, objectif,
profondeur). Quittée, elle se reprend depuis la page du parcours
(« Continuer »).

**Bilan de la remédiation.**

- Exercice manqué réussi : « Exercice réussi : tu peux reprendre le
  parcours », bouton « Continuer : ceinture jaune » (la ceinture de
  l'exercice).
- Encore manqué : le prérequis prévu par l'enseignant, sinon l'objectif d'une
  question manquée dans la remédiation, avec sa propre remédiation
  (« Prochaine étape : Dériver une fonction usuelle ») ; c'est le chemin à
  branches, qui se construit avec les remédiations que l'enseignant ajoute.
- Après trois remédiations (`PROFONDEUR_MAX`), ou sans suite : « demande de
  l'aide à ton enseignant ». Toujours « Recommencer avec de nouvelles
  valeurs » et « Revenir au parcours ».

**Test de positionnement** (`positionnement: true`, parcours à paliers).
Avant le premier passage, la page du parcours propose « Faire le test » :
la première question du premier exercice de chaque palier, dans l'ordre,
corrigées à la fin, titrées par leur ceinture (le nom de l'exercice donnerait
la méthode). Les paliers réussis d'affilée depuis le premier s'ouvrent, sans
être obtenus (« Ouvert par le test de positionnement ») ; l'élève commence au
premier palier manqué. Le test vaut pour la version du parcours où il a été
passé.

**Ce qui ne compte pas.** Remédiations et tests : ni résultats du parcours, ni
ceintures, ni révisions espacées, ni maîtrise des objectifs dans le Suivi.

**Maîtrise par objectif, point par point** (`scoresParObjectif`,
`objectifsTravailles`) : avec des points étiquetés, chaque point compte pour
ses objectifs. Une étude de fonction où la dérivée est juste et le tableau
faux donne 100 % à « Dériver » et 0 % à « Tableau de variations », au lieu de
50 % aux deux. C'est ce qui rend utile un quiz de diagnostic : beaucoup de
questions sur une page, des objectifs par réponse ; le bilan de la séance
montre « Par objectif » (réussite de chaque objectif, seulement quand un
exercice en vise plusieurs ou a des objectifs par réponse, sinon il
répéterait la liste des exercices), le Suivi dit lesquels sont acquis, et la
vue Objectifs d'une session le dit pour la classe.

## 7. Éditeur du site (`?v=parcours`)

Les parcours se créent surtout sur le site (`src/components/setup/parcours/`
de MathALÉA, même format que l'app). Les points 1, 2, 3 et 5 ci-dessous sont
écrits dans un correctif à appliquer à MathALÉA
(`a-reporter-site-remediation.md`) ; 4 et 6 restent à faire. Proposition
d'ergonomie, sans nouvel écran :

1. **Objectifs par réponse, dans l'aperçu élève de l'exercice**
   (`ExercisePreview.svelte`, déjà rendu par le même moteur). Un interrupteur
   « Objectifs par réponse » encadre chaque champ en pointillé ; un clic sur
   un champ ouvre la liste des objectifs du parcours (celle de l'onglet
   Objectifs) ; l'objectif choisi s'affiche en étiquette sous le champ. Le
   lien champ → clé vient de `decrirePoints` (id `champTexteEx…Q…`, trou
   `champN`, sous-question `field…`). Avant d'enregistrer, l'éditeur prépare
   l'exercice sous trois graines : si les points changent (cas de la
   section 3), l'interrupteur est grisé avec « Les réponses changent d'une
   série à l'autre : objectifs de l'exercice seulement ».
2. **« Si l'élève n'y arrive pas »**, sous les objectifs de chaque exercice :
   ajouter des exercices avec la fenêtre d'ajout du site (« rien de nouveau »),
   réglages et aperçu comme pour un exercice du parcours.
3. **Onglet Objectifs** (`ParcoursObjectives.svelte`) : pour chaque objectif
   du parcours, « Remédiation » : exercices, fiche (l'éditeur de fiches
   existe), prérequis choisis dans la liste. Une remédiation d'objectif sert
   dans tous les parcours qui l'utilisent : la garder aussi dans la liste
   d'objectifs (fichier `objectifs-mathalea/1`, champ `remediation`) pour
   qu'un collègue la reprenne avec la liste.
4. **Plan du parcours** (`ParcoursSchema.svelte`) : sous chaque palier, ses
   objectifs et, en retrait, leurs remédiations ; la ligne « À compléter »
   signale un objectif sans remédiation dans un parcours à positionnement.
5. **Réglage du parcours** : « Test de positionnement » (case), à côté du
   style des paliers.
6. **Aperçu élève du parcours** (`player/`) : reprendre `remediation.ts`
   (comme `parcoursPlayer.ts` reprend déjà `progression.ts`), pour essayer la
   boucle avant de publier.

Salons (édition à plusieurs, `salonDoc.ts`) : `points` et `remediation`
voyagent avec l'exercice (une clé par exercice), `positionnement` dans
l'en-tête : rien à faire. `remediations` serait un seul champ de l'en-tête :
deux collègues qui modifient deux remédiations en même temps s'écraseraient.
À ranger comme les exercices (clés stables, `writeList`) si on le garde dans
le parcours.

## 8. Serveur, mutualisation, résultats

- Le projet « Mon MathALÉA » (synchronisation des sauvegardes par compte) est
  abandonné (archive dans la documentation de MathALÉA). La mutualisation
  passe par les **salons** (`mathalea-salons`) : parcours, fiches, objectifs
  et commentaires. Les remédiations y entrent avec le parcours ; une
  bibliothèque commune de remédiations par objectif serait un salon
  d'équipe, ou la liste d'objectifs partagée (point 3 ci-dessus).
- **Aucune donnée d'élève sur un serveur** (règle de l'app et du cahier des
  charges de MathALÉA). Le diagnostic se fait sur l'appareil de l'élève.
- **Pour l'enseignant**, sans rien envoyer : le relevé des sessions par QR
  code recalcule déjà chaque réponse avec le moteur sur l'appareil de
  l'enseignant (`ReponsesClasse`). Ce recalcul garde désormais `detail` :
  la vue « Objectifs » de la session (`objectifsSession.ts`) donne la
  réussite de la classe par objectif et le nombre d'élèves dont la première
  réponse manquée le vise, sans changer le QR code. C'est le « diagnostic
  rapide » d'une classe.

## 9. Remédiation automatisée et montée en puissance : la suite

Déjà automatique : le diagnostic, le choix d'exercices du parcours ou du
catalogue qui visent l'objectif, l'enchaînement des prérequis prévus.

Pour aller plus loin, dans l'ordre :

1. **Exemple corrigé** (`revue-pistes`, 3.3) : fait en tête de remédiation.
   Le même type d'étape (`interactif: false`) pourrait servir en tête d'une
   ceinture de découverte, posé par l'enseignant, puis retiré dans les
   ceintures suivantes (estompage).
2. **Objectifs du programme** : fait pour les objectifs posés d'office
   (source 5 ci-dessus). Reste : un objectif propre à l'enseignant relié à
   un code (`Objectif.code`) en profiterait aussi ; chercher aussi aux
   niveaux inférieurs (prérequis du programme), le référentiel n'étant pas
   trié par difficulté.
3. **Graphe des prérequis** : `prerequis` est posé par remédiation ; le
   ranger dans la liste d'objectifs en ferait un graphe commun à tous les
   parcours d'un enseignant ou d'une équipe.
4. **Progression adaptée sans parcours tout fait** (la « montée en
   puissance ») : un parcours devient une banque d'exercices étiquetés
   (objectif, difficulté = rang de la ceinture) et un objectif final.
   L'app choisit l'exercice suivant : l'objectif le plus bas non acquis
   dont les prérequis le sont ; un cran plus difficile après deux réussites
   d'affilée, remédiation après un échec ; objectif acquis après une
   réussite au plus haut niveau confirmée un autre jour (révisions). Le
   positionnement et la remédiation construits ici en sont les deux
   premières briques ; les ceintures restent l'affichage. La logique est
   écrite et testée, sans écran (`progressionAdaptee.ts`,
   `tests/progression-adaptee.test.ts`) : `banqueDuParcours` tire la banque
   d'un parcours à ceintures existant, `choisir` donne l'exercice suivant et
   sa raison (commencer, monter, continuer, consolider, remédier, confirmer).
   Écran fait pour un parcours à paliers marqué `adaptatif` : section
   « Entraînement adapté » sur sa page (« Un cran plus difficile : Dériver une
   fonction composée »), « Exercice suivant » (un exercice, deux questions au
   plus, `adapte-<id>`), bilan « Exercice réussi » ou « le suivant reprend
   plus simplement ». Les tentatives viennent des passages des paliers et de
   ces exercices ; les ceintures restent données par les paliers. À décider :
   faire de l'objectif final acquis une ceinture.

Toujours sur l'appareil : la difficulté vient de l'enseignant (rang de la
ceinture), jamais de statistiques collectées.

## 10. Limites connues

- Points qui changent avec la graine (environ 2 % des exercices) : objectifs
  de l'exercice seulement.
- QCM, figures, exercices à vérification propre : un point par réponse.
- Une remédiation automatique dépend des objectifs posés : sans objectifs,
  seule la remédiation propre à l'exercice existe.
- Un élève qui échoue trois fois est renvoyé à l'enseignant ; l'enseignant
  le voit seulement dans une session relevée (vue Objectifs), pas hors
  session.
- Le test de positionnement est fixe (une question par palier, toutes
  posées) ; un arrêt après deux échecs d'affilée serait plus court pour un
  élève en difficulté.

## 11. Vérifications

- `pnpm check` (0 erreur), `pnpm test` (380 tests, dont
  `tests/remediation.test.ts`, `tests/objectifs-session.test.ts`,
  `tests/progression-adaptee.test.ts`) ;
- `node e2e/remediation.mjs` (94 vérifications) : téléphone (clair) et bureau
  (sombre), réponses saisies au toucher et au clavier :
  1. test de positionnement : la ceinture jaune s'ouvre sans être obtenue ;
  2. étude de fonction manquée sur la dérivée seulement : « À retravailler »
     la dérivée, « Par objectif » 0 % et 100 %, résultat par point enregistré ;
     remédiation (exemple corrigé, 1AN14-7, l'étude reprise), reprise après
     le bouton retour et après un relancement de l'app, retour à la ceinture ;
  3. remédiation manquée : le prérequis prévu (1AN14-3), profondeur 2 ;
  4. Suivi : les deux objectifs de l'étude, sans ceux des remédiations ;
  5. « Qu'est-ce qui t'a bloqué ? » : panneau, bouton retour, choix ;
  6. entraînement adapté : commencer, continuer, monter, consolider ;
  7. remédiation automatique par le référentiel (5N2G : 5N2G-1 et 5N2G-2) ;
- `node e2e/reponses-session.mjs` : vue Objectifs de la session (cinq élèves) ;
- `bash scripts/verifier-release.sh` complet, deux fois vert sur les états
  intermédiaires (toutes les suites, tous les formats, tous les parcours de
  l'Explorer et de la démonstration de A à Z), relancé sur l'état final ;
- sondes `e2e/sonde-points.mjs FR` et `CH` ;
- site : `tests/unit/parcours.test.ts`, contrôle de types des fichiers
  touchés et de leurs 92 dépendants, éditeur ouvert dans Chromium.

Pas fait ici : Android 11 et les vrais appareils (aucun émulateur dans cette
session), la release.

## 12. Questions pour Nathan

1. Le test de positionnement ouvre les ceintures sans les donner : faut-il
   les donner (et donc les afficher obtenues dans le Suivi) ?
2. « Qu'est-ce qui t'a bloqué ? » ne propose que des objectifs qui ont une
   remédiation : faut-il aussi « La consigne », « Un calcul » (sans suite
   proposée, mais visible pour l'enseignant) ?
3. Remédiation par objectif : dans le parcours (`remediations`) ou dans la
   liste d'objectifs partagée, ou les deux ?
4. Après trois remédiations : faut-il bloquer la ceinture ou laisser l'élève
   continuer ?
