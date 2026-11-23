# Types de réponse de MathALÉA dans l'app

Inventaire fait le 29 octobre 2026 sur le moteur de l'app (MathALÉA au commit
de `moteur/COMMIT`) : les 3 723 exercices interactifs des référentiels FR et
CH ont été générés, aucun en erreur. Chaque format est joué dans l'app par
`node e2e/formats.mjs` (un exercice par format, `e2e/formats-reponse.json`),
avant chaque release et chaque envoi Google Play.

Deux niveaux de vérification :

- **Correcte** : le test saisit la bonne réponse comme un élève (toucher,
  clavier, clavier de MathALÉA, glisser au doigt) et l'app la compte correcte.
- **Prise en compte** : la réponse dépend d'une manipulation que le test ne
  sait pas produire (construction, jeu, programme). Le test touche l'élément,
  vérifie que « Vérifier » s'active et que la vérification se fait sans
  erreur ; il écrit aussi la réponse attendue dans l'élément, comme MathALÉA
  réécrit une réponse enregistrée, quand l'élément l'accepte.

Comment l'app lit une réponse (`BlocQuestion.svelte`, `lireSaisies`) : les
champs `math-field` et `input` qui ont un id, les cases cochées, et la valeur
(`value`) des éléments `liste-deroulante`, `multi-mathfield`, `drag-and-drop`,
`svg-selection`. Pour tout autre élément de MathALÉA (id `…Ex<n>Q<k>…`,
`…Ex<n>F<k>` pour apigeom), un toucher ou une frappe suffit pour activer
« Vérifier ». La vérification elle-même est celle de MathALÉA
(`verifQuestion` de chaque élément), appelée par le moteur.

| Format | Exercices | Dans nos parcours | Vérification dans l'app |
| --- | ---: | ---: | --- |
| `mathlive` | 1194 | 15 | correcte |
| `mathalea-mathfield` | 1102 | 144 | correcte (nombres, fractions, unités par la touche du clavier, écriture scientifique, intervalles) |
| `mathalea-qcm` | 777 | 38 | correcte |
| `multi-mathfield` | 197 | 30 | correcte (encadrer, arrondir une racine) |
| `fill-in-the-blank` | 168 | 5 | correcte |
| `fillInTheBlank` | 96 | 2 | correcte |
| `liste-deroulante` | 58 | 5 | correcte |
| `apigeom-figure` | 47 | 2 | correcte pour placer un point sur une droite graduée ; prise en compte pour une construction |
| `meta-custom` | 37 | 0 | prise en compte |
| `possible-multi-lines-answer` | 28 | 10 | correcte (résultat direct ou en plusieurs étapes, voir plus bas) |
| `tableau-mathlive` | 26 | 2 | correcte |
| `qcm` | 18 | 0 | correcte |
| `tableau-signes-variations` | 17 | 0 | prise en compte |
| `mathalea-solveur` | 16 | 4 | correcte |
| `MetaInteractif2d` | 11 | 1 | correcte |
| `alea-iep-editeur` | 9 | 0 | prise en compte |
| `dnd` | 8 | 1 | correcte |
| `clique-figure` | 8 | 2 | correcte |
| `tableauMathlive` | 8 | 1 | correcte |
| `my-spreadsheet` | 8 | 0 | prise en compte |
| `mathalea-couteau-suisse` | 7 | 0 | prise en compte |
| `points-cliquables` | 5 | 0 | prise en compte |
| `mathalea-labyrinthe` | 5 | 0 | prise en compte |
| `meta-interactif-2d` | 3 | 0 | correcte |
| `svg-selection` | 3 | 1 | correcte |
| `mathalea-textfield` | 3 | 1 | correcte |
| `tableau-hybride` | 3 | 0 | prise en compte |
| `demi-droite-interactive` | 3 | 0 | prise en compte |
| `echiquier-probleme` | 3 | 0 | prise en compte |
| `traceur-de-courbe` | 3 | 0 | prise en compte |
| `interactive-clock` | 2 | 0 | prise en compte |
| `relier-etiquettes` | 2 | 0 | prise en compte |
| `scratch-editor` | 2 | 0 | prise en compte |
| `mathalea-branching-qcm` | 2 | 0 | prise en compte |
| `intervalle-droite` | 2 | 0 | prise en compte |
| `my-calculator`, `decomposition-facteurs-premiers`, `diagram-pie-assessment`, `objets-cliquables`, `guide-ane`, `ensemble-intervalles-droite`, `mathalea-compte-est-bon`, `etoile-calculs`, `grimuku-grille`, `juniper-green`, `kenken-grille`, `killer-sudoku-grille`, `pyramide-nombres`, `tables-effacees-grille`, `trigo-circle-selection` | 1 chacun | 0 | prise en compte |

## Réponse en plusieurs étapes (novembre 2026)

`possible-multi-lines-answer` (MR !10087 de MathALÉA) : l'élève ajoute des
lignes avec le bouton ⊕. Avec la vérification « À chaque étape » (valeur par
défaut des exercices de calcul littéral, `bareme="etapes"`), chaque ligne est
corrigée dès son ajout puis verrouillée ; la question vaut 2 points, 1 si le
résultat est juste malgré une étape fausse, 0 sinon. Avec « À la fin », tout
est corrigé à la validation, 1 point seulement si tout est juste.

L'app n'a rien de propre à ce format pour les résultats : le moteur rend
`points` et `total` de MathALÉA, une question vaut `points / total` (un
demi-point pour une étape fausse) dans le score, les seuils et le suivi. Le
brouillon garde toutes les lignes (valeur de l'élément, liste JSON), une
étape fausse revient donc barrée et verrouillée après un changement de
question ou un rechargement. Adapté dans l'app : demi-points écrits avec une
virgule (`ecrirePoints`), ⊕ de 44 px, croix et coches aux couleurs des
pastilles « Correcte » / « Incorrecte » (`src/app.css`). Vérifié par
`node e2e/etapes.mjs`.

## Défauts trouvés et corrigés (octobre 2026)

Dans l'app :

- Liste déroulante, champs multiples, glisser-déposer, sélection dans une
  figure : « Vérifier » restait grisé (valeur jamais lue).
- Grilles (KenKen, Killer Sudoku) : cases sans id, « Vérifier » ne s'activait
  jamais ; figures, horloges, diagrammes : le toucher ne comptait pas.
- Champ dans une figure (`MetaInteractif2d`) : un trou vide passait pour une
  réponse.
- Messages de retour de MathALÉA : formules non rendues.
- Éléments plus larges que l'écran (glisser-déposer, grille de Juniper Green,
  guide-âne) : ils passent à la ligne ou défilent dans la question.
- Tableau à laisser vide en partie (résoudre un triangle sans solution) :
  « Vérifier » restait grisé alors que la bonne réponse est vide.
- Pyramide de nombres : son pavé de chiffres cachait « Passer » et « Vérifier » ;
  la barre d'actions passe au-dessus, comme pour le clavier de MathALÉA.

Dans le moteur de l'app (`moteur/fichiers/src/moteur/index.ts`, à reporter
dans `src/moteur/index.ts` de MathALÉA pour les mises à jour du moteur) :

- Plusieurs réponses dans une question : chaque rang vérifié par sa question.
- `clique-figure` : figures activées après l'affichage, comme le site.
- Figures apigeom trop larges : réduites par leur zoom.
- Espaces entre les chiffres jamais exigés.
- `videAccepte` : une question dont une case attendue est vide se vérifie sans saisie.

Dans MathALÉA (à signaler, rien de modifié) : 845fa reprend dans la question 2
les id de la question 1 (`meta-interactif-2dEx0Q0field0`) ; 5d1e2 affiche
« Choisit le bon calcul ».
