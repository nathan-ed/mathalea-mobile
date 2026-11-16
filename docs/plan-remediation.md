# Remédiation : plan de reprise (0.8.0)

Plan du 16 novembre 2026. Le travail du 6 novembre est sur la branche
`ccr-72fe30a6-9ez07r` (GitHub, 27 commits, partie de la 0.5.1). Sa conception
est dans son `docs/remediation.md`. Rien n'en est dans `main`.

## Pourquoi pas une fusion

- La fusion donne 18 conflits (`git merge-tree`), dont `+page.svelte`
  (917 lignes changées dans `main` depuis), `Bilan.svelte`, `catalogue.ts`,
  `validation.ts`, `objectifs.ts`, `Seance.svelte`.
- Depuis la 0.6, l'app n'a plus que le mode élève. Quatre écrans que la branche
  modifie n'existent plus : `CreationParcours`, `ReglagesExercice`,
  `ReponsesClasse`, `SessionClasse`. Tout ce qui est côté enseignant (réglage
  du test de positionnement, vue Objectifs d'une session) va sur le site ou
  est abandonné.
- Les révisions (0.7) décident déjà quoi faire retravailler. La remédiation
  doit s'y brancher, pas vivre à côté.
- `e2e/parcours-az.mjs` a été découpé (`az-1` à `az-3`) ; `e2e/eleve-repond.mjs`
  de la branche est à comparer avec ce qui existe.

On reporte donc à la main, par tranches. Chaque tranche : relecture par un
agent, tests ciblés, captures à 390 px (clair et sombre), puis la suivante.

## Ce qu'on reprend, ce qu'on laisse

| Élément de la branche | Décision |
| --- | --- |
| Points de réponse (`decrirePoints`, détail de `verifier`) | Repris, tranche 1 |
| Diagnostic au bilan, séance de remédiation, exemple corrigé | Repris, tranche 2, sources automatiques seulement |
| Réponses enchaînées (`Etape.enchainees`) | Repris avec la tranche 3 (champ du format) |
| Remédiations de l'enseignant, objectifs par réponse, prérequis | Tranche 3, avec l'éditeur du site |
| Test de positionnement | Tranche 4, raccourci |
| Entraînement adapté (`progressionAdaptee.ts`, `adaptatif`) | Laissé : troisième mécanisme de choix à côté des ceintures et des révisions |
| Vue Objectifs d'une session (enseignant) | Laissée dans l'app ; à reprendre sur le site si le retour vers l'enseignant s'y fait |
| `docs/mutualisation.md` | À relire à part : proposition, pas du code |

## Tranche 1 : points de réponse dans le moteur

Rien ne change pour l'élève.

- `moteur/fichiers/src/moteur/index.ts` : `decrirePoints(exercice, i)` et le
  `detail` de `verifier` (barème enveloppé le temps de la vérification).
  `API_ATTENDUE` reste 1.
- `src/lib/moteur.ts` : types et appel.
- Essai : `detail` gardé seulement pour une question à plusieurs points.
- À vérifier avant tout : le moteur se met à jour sans l'app depuis la 0.7.1.
  Un moteur publié sans `decrirePoints` ne doit pas casser une app qui
  l'attend, et l'inverse. L'app doit tester la présence de la fonction.
- Tests : `e2e/sonde-points.mjs` de la branche (tous les exercices
  interactifs, trois graines), remis sur le moteur actuel.

## Tranche 2 : remédiation automatique (le cœur)

Sans changement de format ni de site : elle sert sur les parcours existants.

- `src/lib/remediation.ts` et `tests/remediation.test.ts`, repris de la
  branche, limités aux sources 3 et 4 (exercices du parcours ou d'autres
  parcours qui visent l'objectif, jamais d'un palier suivant) et 5
  (référentiel).
- `Bilan.svelte` : « À retravailler » et le bouton « Retravailler : … ».
- Séance générée sur l'appareil (`remediation-<id>`), comme les révisions.
- Hors score : ni résultats, ni ceintures, ni révisions, ni Suivi.

Changements par rapport à la branche, pour les élèves :

1. **Une seule proposition au bilan.** Objectif manqué identifié et
   remédiation trouvée : « Retravailler » est le bouton plein, « Réessayer avec
   d'autres valeurs » et « Refaire » passent en actions secondaires. Sinon,
   rien ne change.
2. **Branchement sur les révisions.** Un exercice manqué deux fois de suite en
   révision propose « Retravailler » au bilan de la révision. Dans la
   préparation d'une évaluation, même proposition sous « À finir avant
   l'évaluation ».
3. **Séance courte.** Un exemple, un exercice plus simple (trois questions),
   puis l'exercice manqué (deux ou trois questions). La branche permet deux
   exercices simples : plafond à un.
4. **Exemple corrigé à compléter.** La dernière étape reste à saisir par
   l'élève (à étudier : faisable seulement si l'exercice a plusieurs points ;
   sinon exemple à lire, comme dans la branche).
5. **Élève sans enseignant.** Après trois tours, proposer la fiche de cours du
   palier ou du parcours s'il y en a une ; « demande à ton enseignant »
   seulement si l'élève est dans une classe.
6. **Source 5 bornée.** Exercices du référentiel de niveau égal ou inférieur
   seulement ; si rien, pas de proposition.
7. **« Qu'est-ce qui t'a bloqué ? »** garde ses choix, avec « Je ne sais pas »,
   qui mène à la remédiation la plus simple.

Tests : `e2e/remediation.mjs` de la branche (94 vérifications), réécrit sur
les écrans actuels ; ajout dans `verifier-release.sh` ; cas « reprise après
relancement de l'app » et « bouton retour » gardés.

## Tranche 3 : format et éditeur du site

À faire en même temps dans l'app et dans MathALÉA, avec une fiche de travail
dans `docs/site/`, comme pour les évaluations annoncées.

- Champs facultatifs : `Etape.points`, `Etape.remediation`,
  `Etape.enchainees`, `Parcours.remediations`. Contrôle dans `validation.ts`
  et `parcoursFile.ts` (une app d'avant les ignore).
- Site : le correctif `docs/patchs/site-remediation.patch` date du 5 novembre
  et ne s'applique plus (éditeur compact, salons, fiches). À réécrire sur
  `origin/main` : « Si l'élève n'y arrive pas » sous un exercice, remédiation
  par objectif dans l'onglet Objectifs, objectifs par réponse dans l'aperçu.
- Salons : ranger `remediations` comme les exercices (clés stables), sinon
  deux collègues s'écrasent.
- Restent à écrire côté site : remédiations dans le schéma du parcours, boucle
  de remédiation dans l'aperçu élève.

## Tranche 4 : test de positionnement

- `Parcours.positionnement`, réglage sur le site seulement.
- Arrêt après deux paliers manqués d'affilée, au lieu de toutes les questions.
- Les paliers ouverts par le test ne sont pas obtenus.

## Essai en classe

Rien ne remonte des appareils. Avant de généraliser : la tranche 2 sur un
parcours d'une classe de Nathan, en regardant les résultats différés
(révisions de la semaine suivante), pas les scores du jour.

## À décider

- Exemple corrigé à compléter : oui ou non, selon l'étude de la tranche 2.
- Vue Objectifs d'une session : sur le site, ou abandonnée.
- Entraînement adapté : abandonné, ou repris après un essai en classe de la
  remédiation.
