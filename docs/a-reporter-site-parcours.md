# Report sur la page « Parcours pour l'application » du site

Fiches de cours (octobre 2026) : faites dans MathALÉA, branche
`parcours-fiches` (worktree `mathalea-tickets`), MR à ouvrir après
validation de sa description par Nathan.

Principe : les fiches et les parcours proposés vivent dans l'app (dépôt
`explorer/`, dossiers des enseignants). Le site n'en garde aucune ; sa page
`?v=parcours` est seulement l'éditeur.

Ce que fait la branche :

- Types `Lesson`, `LessonBlock`, `LessonGraph` (`parcoursTypes.ts`), `fiche`
  sur un palier et sur un parcours.
- Contrôle identique à `estFiche` de l'app (`lessonFile.ts`, analyseur
  d'expressions `lessonExpression.ts`, même grammaire que `expression.ts`).
- Fiches gardées quand on supprime un palier ou qu'on passe en liste simple
  (`parcoursEditing.ts`).
- Éditeur (`LessonEditor.svelte`) : blocs repliables, barre de mise en forme,
  formulaires par type (graphique : courbes, fenêtre, curseurs, aire), JSON
  modifiable, « À compléter », aperçu rendu comme dans l'app
  (`LessonPreview.svelte`, `LessonGraph.svelte`, KaTeX).
- Onglet « Fiches » (fiche seule, `fiche-mathalea/1`) et, sous chaque
  palier, ajout, import, modification en plein écran, téléchargement.

À garder synchronisé : un changement du format des fiches dans l'app
(`catalogue.ts`, `validation.ts`, `expression.ts`, `texteRiche.ts`,
`Cours.svelte`, `GraphiqueCours.svelte`) se reporte dans ces fichiers du
site, et inversement.

## Date d'ouverture d'un palier (0.4.5, à reporter)

L'app lit `ouverture` sur un palier (voir `catalogue.ts`, `estOuverture`,
`ouvertureDuJour`) : instant « AAAA-MM-JJT08:00:00 » avec le décalage horaire de
l'enseignant, valable aussi pour le premier palier. L'éditeur du site ne la
connaît pas : ni champ « À partir d'une date » (sous « Pour y accéder »), ni
conservation du champ quand on modifie un parcours déjà daté (à vérifier :
`parcoursEditing.ts` reconstruit des objets de palier). À faire dans la même
branche que les fiches : type `ouverture?: string` (`parcoursTypes.ts`),
contrôle (`parcoursFile.ts`), champ jour dans `ParcoursEditor.svelte`
(« À partir d'une date », 8 h affichées), schéma `ParcoursSchema.svelte` (palier
fermé avant la date).
