# Catalogue de l'Explorer

Parcours proposés par l'équipe MathALÉA, intégrés au build de l'app
(`src/lib/catalogueIntegre.ts`) et lus par le même lecteur que les fichiers
des enseignants. À terme, MathALÉA pourra servir ce dossier
(`VITE_URL_EXPLORER`, `src/lib/partage.ts`) : une version plus récente en
ligne remplacera alors celle de l'app, parcours par parcours.

- Format `classes-mathalea/1` (`docs/guide/format-parcours.md`), un fichier
  par degré.
- `niveau` et `theme` : noms du référentiel de MathALÉA (« 4e Collège »,
  « Intégration »). L'app range l'Explorer par degré puis par chapitre dans
  l'ordre du référentiel et en déduit le pays (un degré suisse, sinon France).
- Exercices interactifs, `uuid` lus sur le site ou dans le moteur. Un
  parcours suisse peut prendre un exercice que le référentiel suisse range
  dans « Non classés » (exercice français) : le moteur le prépare de même.
- Fiches de cours dans les paliers (`fiche`, format dans
  `docs/guide/format-parcours.md`), rédigées pour l'app et relues avant d'être
  déposées. Figures plus riches que les graphiques de l'app : images SVG ou
  PNG produites par Typst ou TikZ, intégrées au fichier.

Fichiers :

- `ch-4e-college.json` : Suisse, 4e Collège, deux parcours à ceintures
  suivant le cours de 4M1, une fiche par ceinture, montrée d'office.
  - « Calcul intégral » (chapitre 4mInt), huit ceintures (blanche à noire,
    2e dan) : rappels de dérivées, sommes de Darboux, primitives, fonctions
    composées, intégrale, valeur moyenne, aires, volumes de révolution.
    Exercices 4mAna-4 à 6 et 4mInt-1 à 13.
  - « Exponentielle et logarithme » (chapitre 4mExpLog), neuf ceintures
    (blanche à noire, 3e dan) : logarithme naturel, dériver avec ln,
    primitives avec ln, graphe et limites, éléments simples, exponentielle,
    primitives avec exp, autres bases, aires et volumes. Exercices
    4mExpLog-1 à 6, 4mAna-1 et 4, 4mInt-8, et 2mLogExp-3, 4, 10, 11, 12
    (2e Collège : pas encore d'équivalent en 4e Collège).
