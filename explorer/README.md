# Catalogue de l'Explorer

Parcours proposés par l'équipe MathALÉA, à déposer dans le dossier servi à
l'adresse `URL_EXPLORER` (`src/lib/partage.ts`). Ils ne sont pas intégrés à
l'app : elle les lit dans ce dossier, comme ceux des enseignants.

- Format `classes-mathalea/1` (`docs/guide/format-parcours.md`), un fichier
  par degré.
- `niveau` et `theme` : noms du référentiel de MathALÉA (« 4e Collège »,
  « Intégration »). L'app range l'Explorer par degré puis par chapitre dans
  l'ordre du référentiel et en déduit le pays (un degré suisse, sinon France).
- Exercices interactifs, `uuid` lus sur le site ou dans le moteur.

Fichiers :

- `ch-4e-college.json` : Suisse, 4e Collège, Intégration (chapitre 4mInt) :
  « Primitives et intégrales » (ceintures blanche à verte) et « Intégration
  par parties et volumes » (bleue et marron).
