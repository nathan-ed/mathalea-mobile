# Catalogue de l'Explorer

Parcours proposés par l'équipe MathALÉA. Ils ne sont pas dans l'app : chaque
fichier, une fois vérifié (`node e2e/catalogue-moteur.mjs`, puis
`PARCOURS=<id> node e2e/parcours-az.mjs <fichier>`), est déposé dans le
sous-dossier `FR` ou `CH` du dossier kDrive partagé de l'Explorer
(https://kdrive.infomaniak.com/app/share/120240/9635c7c9-5984-4278-a739-d9f8c7d69f50,
`DOSSIER_EXPLORER` dans `src/lib/partage.ts`). Seuls les `.json` à la racine
de chaque sous-dossier sont lus. L'app lit ces dossiers comme ceux des enseignants : un
fichier modifié sur le drive arrive chez les élèves sans mise à jour de l'app.
Elle garde la dernière copie reçue pour le hors ligne. Ce dépôt reste la
source : on modifie ici, on teste, puis on remplace le fichier sur le drive.

- Format `classes-mathalea/1` (`docs/guide/format-parcours.md`), un fichier
  par degré.
- `niveau` et `theme` : noms du référentiel de MathALÉA (« 4e Collège »,
  « Intégration »). L'app range l'Explorer par degré puis par chapitre dans
  l'ordre du référentiel. Le dossier décide du pays : l'app suisse ne lit
  que `CH`, la française que `FR`. Un fichier relève d'un seul pays (vérifié
  par `pnpm test`) ; un fichier suisse déposé dans `FR` n'apparaît nulle part.
- Exercices interactifs, `uuid` lus sur le site ou dans le moteur. Un
  parcours suisse peut prendre un exercice que le référentiel suisse range
  dans « Non classés » (exercice français) : le moteur le prépare de même.
- Fiches de cours dans les paliers (`fiche`, format dans
  `docs/guide/format-parcours.md`), rédigées pour l'app et relues avant d'être
  déposées. Figures plus riches que les graphiques de l'app : images SVG ou
  PNG produites par Typst ou TikZ, intégrées au fichier.

Fichiers :

- `ch-4e-college.json` : Suisse, 4e Collège, trois parcours à ceintures
  suivant le cours de 4M1, une fiche par ceinture, montrée d'office.
  - « Prérequis pour l'analyse » (chapitre 4mAna), entrée des deux parcours
    suivants, sept ceintures (blanche à noire) d'un savoir-faire et trois
    exercices ciblés chacune : puissances, factoriser, résoudre une
    équation, signe, limites, dériver, tangente. Écrit par
    `ch-4e-prerequis-gen.py` (le relancer remplace le parcours).
  - « Calcul intégral » (chapitre Analyse, sous-thème 4mInt), huit ceintures (blanche à noire,
    2e dan) : rappels de dérivées, sommes de Darboux, primitives, fonctions
    composées, intégrale, valeur moyenne, aires, volumes de révolution.
    Exercices 4mAna-4 à 6 et 4mInt-1 à 13.
  - « Exponentielle et logarithme » (chapitre Analyse, sous-thème 4mExpLog), neuf ceintures
    (blanche à noire, 3e dan) : logarithme naturel, dériver avec ln,
    primitives avec ln, graphe et limites, éléments simples, exponentielle,
    primitives avec exp, autres bases, aires et volumes. Exercices
    4mExpLog-1 à 6, 4mAna-1 et 4, 4mInt-8, et 2mLogExp-3, 4, 10, 11, 12
    (2e Collège : pas encore d'équivalent en 4e Collège).
- `ch-1re-college.json` : Suisse, 1re Collège, quatre parcours à ceintures
  (`ch-1re-college-gen.py`), préparés pour une classe de 1re de Nathan
  (novembre 2026). Priorité à la difficulté progressive : dans chaque
  ceinture, les exercices vont du cas simple au plus difficile, sans
  mélange des questions. Fiches : exemples résolus, chacun suivi de son
  point crucial.
  - « Calcul littéral et factorisation » (chapitre Factorisation), sept
    ceintures : développer, identités, mise en évidence, factoriser avec
    les identités, somme et produit, groupements, fractions rationnelles.
  - « Résolution d'équations » (chapitre Équations du second degré), sept
    ceintures : premier degré, produit nul, racine carrée, complétion du
    carré, discriminant, degré 3 et 4 et équations irrationnelles,
    problèmes.
  - « Systèmes d'équations » (chapitre Systèmes d'équations), six
    ceintures : solution d'un système, comparaison, substitution,
    combinaison, nombre de solutions, problèmes.
  - « Preuves en arithmétique » (chapitre Calcul littéral - Généralités),
    cinq ceintures : vrai ou faux (4L23), diviseurs et multiples, traduire
    avec un nombre pair, impair ou multiple, parité, traduire avec
    plusieurs nombres.
  - Manques du catalogue interactif : fraction rationnelle à factoriser
    puis simplifier, problèmes menant au second degré, systèmes 3x3 sans
    matrices (vu seulement dans une fiche), chapitre 1mCL3 vide. 1mSE-1
    (81fd6) est écarté : illisible à 390 px (figures superposées).
- `evacom-revisions.json` : révisions des EVACOM 11LC, 11LS et TAF
  (`evacom-gen.py`, qui écrit dans le dépôt principal). Paliers libres, une
  partie par sujet : les sujets sont indépendants, ce n'est pas une
  progression (Nathan, 3 novembre 2026).
