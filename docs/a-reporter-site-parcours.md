# À reporter sur la page « Parcours pour l'application » du site

Changements du format des parcours faits dans l'app (branche
`claude/swiss-learning-paths-iy5hwl`), à reporter dans MathALÉA pour que la
page `?v=parcours` les lise, les contrôle et ne les perde pas à
l'enregistrement. Repéré sur `main` de MathALÉA au commit `3025a52a`.

Référence côté app : types `src/lib/catalogue.ts` (`Fiche`, `Bloc`,
`Graphique`), contrôle `src/lib/validation.ts` (`estFiche`), analyseur
`src/lib/expression.ts`, format `docs/guide/format-parcours.md` (« Fiches de
cours ») et schéma `docs/guide/parcours-mathalea.schema.json`.

## Ce qui change dans le fichier

- Un palier peut porter une `fiche` ; un parcours aussi (parcours sans
  paliers, ou fiche du premier palier).
- Une fiche : `{ titre, avant?, blocs }`. Blocs `texte`, `retenir`,
  `exemple`, `question`, `graphique`, `image`, `lien` (champs dans
  `format-parcours.md`).
- Rien d'autre : pas de champ `pays` (l'Explorer déduit le pays du niveau,
  lu dans le référentiel).

Aujourd'hui le site accepte un fichier avec des fiches (un champ inconnu
n'est pas refusé) et `cleaned()` les garde (`...rest`). Elles se perdent ou
passent sans contrôle aux endroits suivants.

## Fichiers de MathALÉA

`src/lib/parcours/parcoursTypes.ts`
- Ajouter `Fiche`, `Bloc` et `Graphique`, recopiés de `catalogue.ts` (clés
  du JSON en français, comme le reste du fichier).
- `fiche?: Fiche` dans `Level` et dans `Parcours`.

`src/lib/parcours/parcoursFile.ts`
- `isLevel` : `optional(v.fiche, isFiche)` ; `isParcours` : idem.
- `isFiche` : reprendre `estFiche` et `estBloc` de `validation.ts`, y compris
  les graphiques (intervalles croissants, curseurs d'une lettre ni `x` ni `e`,
  bornes d'aire nombre ou nom de curseur, rangs de fonctions existants) et les
  images `data:image/(svg+xml|png|jpeg|webp)`. Pour les expressions, copier
  `compiler()` de `expression.ts` (sans dépendance) ou au moins vérifier
  qu'elles ne contiennent que `[0-9a-z.+\-*/^() ]`.

`src/lib/parcours/parcoursEditing.ts`
- `splitIntoLevels` : reconstruit les paliers ; reporter `p.fiche` sur le
  premier palier s'il n'en a pas.
- `removeLevel` : la fiche du palier supprimé disparaît. La garder sur le
  palier voisin s'il n'en a pas ; quand il ne reste qu'un palier
  (`delete r.paliers`), la remettre en `r.fiche`.

`src/components/setup/parcours/ParcoursEditor.svelte`
- Pas d'éditeur de fiches (décision du 2026-10-26). Afficher seulement, par
  palier, « Fiche : <titre> » (et « montrée avant l'entraînement » si
  `avant`), avec « Retirer la fiche ». Les fiches arrivent par le fichier.

`src/components/setup/parcours/ParcoursSchema.svelte`
- Facultatif : une icône de fiche sur le palier qui en a une.

`tests/unit/parcours.test.ts`
- Un fichier avec fiches (celui de `explorer/ch-4e-college.json` convient)
  est accepté, relu et republié sans perte (`cleaned`, `publish`).
- Fiche mal formée refusée (bloc inconnu, `bonne` hors des choix, expression
  invalide, image non `data:`).
- `splitIntoLevels` et `removeLevel` gardent les fiches.

## Vérifier

Ouvrir `explorer/ch-4e-college.json` sur `?v=parcours`, déplacer un exercice,
enregistrer, publier : le fichier publié a toujours ses six fiches. Puis
l'importer dans l'app (« Éditer un parcours existant ») et faire « Aperçu
élève » : la fiche de la ceinture blanche s'ouvre avant l'entraînement.
