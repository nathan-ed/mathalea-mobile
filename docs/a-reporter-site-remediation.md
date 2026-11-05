# Remédiation : report sur la page « Parcours pour l'application » du site

Conception : `remediation.md`. Côté app, fait sur la branche
`ccr-72fe30a6-9ez07r`. Côté site, une branche `parcours-remediation` a été
préparée depuis `main` de MathALÉA (commit 01451063f, 5 novembre 2026) dans une session cloud
qui ne peut pas pousser sur la forge : le correctif est dans
`docs/patchs/site-remediation.patch`, à appliquer dans
`~/Documents/projets/mathalea` :

```bash
git fetch origin && git switch -c parcours-remediation origin/main
git am /chemin/vers/mathalea-mobile/docs/patchs/site-remediation.patch
pnpm vitest run tests/unit/parcours.test.ts && pnpm check
```

Ce que fait le correctif :

- **Format** (`parcoursTypes.ts`, `parcoursFile.ts`) : `Step.points`,
  `Step.remediation`, `Remediation` (objectif, exercices, fiche, prérequis),
  `Parcours.remediations`, `Parcours.positionnement`, `Parcours.adaptatif`, contrôlés comme dans
  l'app (`validation.ts`). Correction au passage : `listOf(v.etapes, isStep)`
  passait le rang de l'exercice en second argument.
- **Publication** (`parcoursLibrary.ts`, `cleaned`) : identifiants de salon
  retirés aussi des exercices de remédiation ; points sans objectif et
  remédiations sans exercice retirés.
- **Moteur du site** (`src/moteur/index.ts`) : `decrirePoints`, repris de
  `moteur/fichiers` de l'app (rangs d'une question lus dans l'énoncé, cases
  d'un rang). Rien ne change à `verifier` du site.
- **Éditeur** (`ParcoursEditor.svelte`, `ExercisePreview.svelte`) :
  - sous les objectifs d'un exercice, « Si l'élève n'y arrive pas » : exercices
    ajoutés avec la fenêtre d'ajout du site, nombre de questions, essai, retrait ;
  - dans l'aperçu élève, « Objectifs par réponse » : une ligne par réponse
    (« Case 1 », « Sous-question b) », « Réponse 2 »…), le champ encadré dans
    l'aperçu au survol, un objectif de l'exercice au choix. Grisé avec une
    phrase si les réponses changent d'une série à l'autre (deux autres graines
    préparées en arrière-plan) ;
  - section « Remédiation par objectif » (objectifs du parcours et prérequis
    choisis) : exercices, puis « Ensuite, si l'élève échoue encore » (prérequis) ;
  - « Pour les élèves » : cases « Test de positionnement » et « Entraînement
    adapté » (parcours à paliers, `adaptatif`).
- **Tests** (`tests/unit/parcours.test.ts`) : format accepté et refusé,
  publication.

Vérifié dans la session : `tests/unit/parcours.test.ts` (25 tests verts),
`node tasks/check-changed.js` (0 erreur sur 6 fichiers et 92 dépendants),
éditeur ouvert dans Chromium sur le site local : objectifs par réponse de
TSA3-32 (« Réponse 1 », « Réponse 2 », champ encadré au survol), choix
enregistré dans `points`, remédiations et prérequis, case du test.

Pas encore dans le correctif : fiche d'une remédiation d'objectif (l'éditeur
de fiches existe, il suffit de le brancher comme pour un palier), plan du
parcours (`ParcoursSchema.svelte`), aperçu élève de la boucle (`player/`),
salons (`remediations` en un seul champ d'en-tête, voir `remediation.md`, 7).
