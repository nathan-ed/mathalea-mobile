# Préqualifiant : couverture à compléter

Ce bilan accompagne `prequalifiant.json` (version 13 ; fiches générées par `prequalifiant-fiches.py`). Les ceintures comportent au moins deux exercices interactifs ; certaines révisent aussi un prérequis ou un savoir-faire connexe. La fiche de cours et le score ne suffisent pas à prouver la maîtrise d'un savoir-faire qui n'est pas interrogé directement.

Chaque exercice porte un objectif précis. L'application affiche un pourcentage de réussite par objectif, distinct du résultat de la ceinture. Le passage à la ceinture suivante dépend de son seuil de 80 %. Le format actuel ne permet pas de fixer un seuil de validation indépendant pour chaque objectif.

La compétence NO01 (écrire les nombres en toutes lettres) a été retirée à la demande de Nathan : elle demande des réponses trop longues pour ce parcours mobile.

## Version 13 (fiches réécrites, novembre 2026)

Les 63 fiches sont réécrites par `prequalifiant-fiches.py`, qui ne touche que le bloc `fiche` des paliers ; exercices et seuils sont ceux de la version 12. Elles restent courtes (trois ou quatre blocs : une règle, un exemple résolu, une question), mais chacune porte sur ce que les exercices de sa ceinture demandent, d'après leurs énoncés générés par le moteur de l'app :

- fiches qui parlaient d'autre chose que leurs exercices : « Décomposer un nombre » (nombre de dixièmes, centièmes, millièmes, et non décomposition d'entiers), « Comprendre les rangs » (« $45$ centaines et $82$ dizaines »), « Choisir une opération » (somme, différence, produit, quotient), « Calculer des puissances », « Prélever les données utiles » (effectif total, « au plus », « au moins »), « Organiser plusieurs calculs » (une seule ligne avec parenthèses), « Vérifier une égalité » (tester avec une valeur de $x$), « Convertir les durées » (heures décimales), « Nommer les figures » (nommer un angle, quadrilatères), « Repérer droites et angles » (adjacents, alternes-internes…), « Choisir les dimensions utiles » ;
- questions qui répétaient l'exemple ou proposaient des leurres absurdes : remplacées par des erreurs réellement commises (comparer $2{,}8$ et $2{,}15$ comme des entiers, $7^2=14$, oublier la division par $2$…) ;
- la bonne réponse était toujours la première (l'app ne mélange pas les choix) : elle change de place ;
- une seule écriture de la multiplication, le point des exercices en Suisse ($3\cdot4$), au lieu de « multiplié par ».

Avec ses sept fiches, un parcours ne tient plus dans le QR code d'une séance : le QR code part sans fiches et l'élève prend la copie de son appareil de même version (Explorer ou accueil), fiches comprises. C'était déjà le cas de deux parcours en version 12.

En relisant les énoncés, quatre ceintures se sont révélées incomplètes : « Calculer des puissances », « Convertir capacités et prix », « Décrire les solides et patrons » et « Prélever les données utiles ». Elles sont décrites, avec les exercices à essayer ou à créer, dans le tableau « Exercices à créer ou à étendre » ci-dessous.

À surveiller : 9QCM-22 (`6d577`, placer un point sur une droite graduée, ceinture 5 de « Situer et comparer les nombres ») a une fois compté fausse une bonne réponse lors du parcours joué de A à Z ; rejoué seul deux fois, il passe.

## Version 12 (moins de QCM, novembre 2026)

Un QCM ne fait pas travailler l'élève sur téléphone : chaque exercice à cocher est remplacé par un exercice à réponse tapée qui entraîne le même savoir-faire, quand MathALÉA en a un.

- Situer et comparer les nombres : `a7aa7` (comparer deux entiers, QCM) devient `3bba9` dans l'ordre décroissant ; `dcf22` sans sa version QCM (`sup` à `false`).
- Calculer avec les décimaux et les relatifs : `32e02` (vocabulaire des opérations, QCM) devient 9NO1E-4 (`10777`, traduire une phrase par une expression, une ou deux opérations).
- Puissances, carrés et racines : `762fe` devient 10NO3F-1 (`a0d17`) de la notation scientifique vers l'écriture décimale.
- Lire une situation, traduire et vérifier : `81c7b` et `3ba7a` (versions QCM) deviennent 9FA3A-2 (`930ef`) et 9FA3A-5 (`c02fd`) ; `de779` devient 9NO1G-16 (`6e828`) ; `2e229` sans sa version QCM (`sup3` à `false`) ; `b9893` devient 10FA5B-3 (`d8841`) avec des entiers relatifs.
- Figures, angles et solides : `e8d33` devient 9ES1B-1 (`e10d1`, nom de l'angle tapé) dans « Nommer les figures » et 9ES1B-9 (`cded3`, mesures des angles particuliers) dans « Mesurer un angle » ; le second `428b2` devient 9ES3C-10 (`8106a`, image dans un pavage, une question à plusieurs réponses).
- Divisibilité et décomposition : `918c2` devient 9NO1A-9 (`e1b05`) ; `4a128` et `fa3ec` deviennent 9NO1A-6 (`bc57e`, trouver un nombre) et 9NO1A-15 (`5636e`, chiffre manquant), réglés sur 2, 5 et 10 puis sur 3 et 9.

QCM gardés, faute d'équivalent à réponse tapée : `e8d33` (vocabulaire des angles, une fois), `4e52e` et `b6c33` (nature d'un quadrilatère), `428b2` (centre de symétrie, une fois), `af4b1` (diviseur, multiple, divisible).

## Version 11 (après la première séance en classe, octobre 2026)

- Calculer avec les décimaux et les relatifs, ceinture blanche : 9NO1F-7 (`1f853`, nouvelle version de `cd0d8`) réglé sur une opération par phrase. Les phrases à trois opérations imbriquées étaient trop difficiles pour une première ceinture.
- Lire une situation, traduire et vérifier, « Traduire en calcul » : même exercice, une ou deux opérations.
- Puissances, carrés et racines, « Utiliser les règles des puissances » : puissances de 10 seulement, une règle à la fois (10NO3D-2 `f5dcf` produit et puissance de puissance, 10NO3D-21 `6b2e5` calculs de base). L'ancien 10NO3D-27 (`a8a2e`) mêlait quotients et changements de base ($27^3/3$) dès la quatrième ceinture. Fiche réécrite sur ces trois règles.
- À créer : une famille « règles des puissances de même base » avec des bases 2, 3, 5 et un seul calcul par question, avant les écritures fractionnaires.

## Exercices à créer ou à étendre

| Savoir-faire | Couverture actuelle | Proposition MathALÉA |
| --- | --- | --- |
| Choisir une unité adaptée à une situation (MG01) | Le parcours travaille les préfixes et les conversions. Les exercices du document pour identifier une grandeur ne corrigent pas cette compétence dans le moteur actuel ; les questions courtes de choix d'unité ne fournissent qu'une question par génération. | Série de six situations courantes avec choix de la grandeur puis de l'unité. Paramètres : longueur, masse, durée, capacité ; objets du quotidien ; unités usuelles ou préfixées ; distracteurs plausibles. |
| Mesurer la distance d'un point à une droite (MG03) | Les candidats PRQ `29c3b` et `29c3c` ne sont pas interactifs. La ceinture « Mesurer un angle » ne mesure donc pas cette compétence. | Figure sur quadrillage avec une droite horizontale ou verticale et un point. L'élève trace ou repère la perpendiculaire, puis saisit la distance avec l'unité. Étendre ensuite aux droites obliques avec mesure arrondie explicitée. Paramètres : orientation, pas du quadrillage, distance entière ou décimale, présence du pied de la perpendiculaire. |
| Décomposer une figure composée (ESF07) | La ceinture noire utilise `6999f` pour l'aire et `06b1a` pour réviser les aires simples. Le choix d'une décomposition n'est pas corrigé directement ; `ebaff` est non interactif. | Figure composée de rectangles et triangles. Première question : choisir parmi plusieurs découpages corrects. Deuxième question : donner l'aire totale. Paramètres : formes autorisées, dimensions entières ou décimales, découpage suggéré ou libre. |
| Calculer le volume d'un assemblage de solides (ESF09) | La ceinture bleue travaille un volume usuel, mais le volume d'un assemblage n'est pas testé. `083b9` est non interactif et les candidats du document pour les volumes complexes ne donnent pas une famille interactive actuelle satisfaisante. | Assemblage de deux pavés droits, puis pavé et prisme ou cylindre. L'élève identifie les volumes à additionner ou à retrancher et saisit le volume avec l'unité cube. Paramètres : famille des solides, évidement ou ajout, dimensions entières ou décimales, figure avec ou sans aide visuelle. |
| Justifier une propriété géométrique (ESF01, STR3) | Les exercices choisis vérifient reconnaissance et mesures. `c46e8` et `07d1a` sont non interactifs ; une justification rédigée ne se corrige pas dans le parcours actuel. | Questions à étapes sur une figure : choisir la propriété applicable, identifier les données nécessaires, conclure par une égalité ou une relation. Paramètres : parallélisme, perpendicularité, symétrie, conservation des longueurs ou des angles. |
| Calculer des puissances (Puissances, carrés et racines, 3e ceinture) | Les deux exercices redonnent les tirages d'« Écrire une puissance » : 10NO3D-25 (`eb865`) réglé sur `1` produit les mêmes questions que 9NO1D-2 (`36f8b`). Ni puissance d'un relatif, ni piège $-2^4$ / $(-2)^4$, ni puissance dans un calcul. | À essayer d'abord : 10NO1-1 (`2d79c`, priorités avec carrés et cubes, `sup2` : `1` carrés, `2` cubes, `3` mélange ; `sup3` pour les positifs seuls) et 10NO3D-6 (`67432`, signe d'une puissance, QCM). Sinon créer : une puissance à calculer par question ($(-2)^3$, $-2^4$, $0{,}5^2$, $\left(\tfrac{2}{3}\right)^2$, $10^{-2}$). Paramètres : base entière, relative, décimale ou fractionnaire ; exposant 0 à 4 ou négatif ; avec ou sans parenthèses. |
| Convertir des capacités et des prix (Grandeurs, unités et conversions, 4e ceinture) | Mêmes exercices que la ceinture précédente (9GM1A-4 `ab9ff`, 9GM3B-1 `504ae`). 9GM3B-1 garde son réglage par défaut (longueurs, contenances et masses mélangées) : aucun prix. Son formulaire complexe (`unites`) permet de ne garder que les contenances, mais ses prix sont en euros (k€, c€). | Tout de suite : régler 9GM3B-1 sur les contenances seules. À étendre dans MathALÉA : unité « prix » en francs suisses pour `fr-CH` (fr. et ct., $1$ fr. $= 100$ ct.). À essayer pour les prix : 9FA2B-12 (`7b350`, prix à partir d'un prix au kg). Sinon créer : prix au litre ou au kilo avec changement d'unité (prix de $250$ g connaissant le prix au kg, de $33$ cL connaissant le prix au litre). |
| Décrire un solide par son patron (Figures, angles et solides, 5e ceinture « Décrire les solides et patrons ») | 9ES2A-6 (`051aa`) et 9ES2A-5 (`95371`) décrivent des solides (faces, arêtes, sommets) ; aucune question ne montre un patron. | À essayer : 9ES2B-1 (`f57fe`, choisir le patron d'un cube, QCM avec cube en 3D, une question par tirage) et 10ES2A-6 (`75a8c`, reporter des longueurs sur un patron de pavé droit, réponses tapées). Sinon créer : patron de prisme, pyramide ou cylindre à reconnaître, puis nombre de faces ou longueur d'une arête lue sur le patron. Paramètres : famille de solides, patron correct ou non, dimensions entières. |
| Prélever les données utiles (Lire une situation, traduire et vérifier) | La ceinture reprend 9FA3A-2 (`930ef`) de « Lire un diagramme » et ajoute 9FA3A-5 (`c02fd`, effectif total) : chaque donnée lue sert au calcul, l'élève n'a rien à trier. Aucun exercice du référentiel suisse ne propose d'énoncé avec des données superflues. | Créer : problème court avec quatre ou cinq données dont une ou deux inutiles. Question 1 : cocher les données utiles ; question 2 : réponse numérique. Paramètres : contexte (achats, trajet, recette), nombre de données superflues, une ou deux opérations, données dans le texte ou dans un tableau. |
| Calculer une fraction d'une quantité (NO12) | La ceinture marron entraîne la multiplication et la division de fractions ; elle ne pose pas directement une fraction d'une quantité. | Situation courte avec quantité entière ou décimale et fraction simple. L'élève calcule d'abord une part puis la quantité demandée. Paramètres : numérateur, dénominateur, quantité multiple du dénominateur ou non, unité du contexte. |

Les questions de résolution d'équation de STR5 et STR6 ainsi que les démonstrations algébriques de STR4 seront à reprendre dans le chapitre d'algèbre prévu plus tard. Elles ne sont pas utilisées pour fabriquer artificiellement une ceinture des chapitres actuels.

## Avant une version 2

Attribuer à chaque nouvel exercice un UUID stable, vérifier sa correction interactive sur téléphone et plusieurs graines, puis augmenter la version du parcours concerné avant de diffuser le JSON actualisé. Le premier fichier reste importable avec le moteur actuellement embarqué.
