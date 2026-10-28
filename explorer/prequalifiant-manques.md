# Préqualifiant : couverture à compléter

Ce bilan accompagne `prequalifiant.json` (version 10). Les ceintures comportent au moins deux exercices interactifs ; certaines révisent aussi un prérequis ou un savoir-faire connexe. La fiche de cours et le score ne suffisent pas à prouver la maîtrise d'un savoir-faire qui n'est pas interrogé directement.

La compétence NO01 (écrire les nombres en toutes lettres) a été retirée à la demande de Nathan : elle demande des réponses trop longues pour ce parcours mobile.

## Exercices à créer ou à étendre

| Savoir-faire | Couverture actuelle | Proposition MathALÉA |
| --- | --- | --- |
| Choisir une unité adaptée à une situation (MG01) | Le parcours travaille les préfixes et les conversions. Les exercices du document pour identifier une grandeur ne corrigent pas cette compétence dans le moteur actuel ; les questions courtes de choix d'unité ne fournissent qu'une question par génération. | Série de six situations courantes avec choix de la grandeur puis de l'unité. Paramètres : longueur, masse, durée, capacité ; objets du quotidien ; unités usuelles ou préfixées ; distracteurs plausibles. |
| Mesurer la distance d'un point à une droite (MG03) | Les candidats PRQ `29c3b` et `29c3c` ne sont pas interactifs. La ceinture « Mesurer un angle » ne mesure donc pas cette compétence. | Figure sur quadrillage avec une droite horizontale ou verticale et un point. L'élève trace ou repère la perpendiculaire, puis saisit la distance avec l'unité. Étendre ensuite aux droites obliques avec mesure arrondie explicitée. Paramètres : orientation, pas du quadrillage, distance entière ou décimale, présence du pied de la perpendiculaire. |
| Décomposer une figure composée (ESF07) | La ceinture noire utilise `6999f` pour l'aire et `06b1a` pour réviser les aires simples. Le choix d'une décomposition n'est pas corrigé directement ; `ebaff` est non interactif. | Figure composée de rectangles et triangles. Première question : choisir parmi plusieurs découpages corrects. Deuxième question : donner l'aire totale. Paramètres : formes autorisées, dimensions entières ou décimales, découpage suggéré ou libre. |
| Calculer le volume d'un assemblage de solides (ESF09) | La ceinture bleue travaille un volume usuel, mais le volume d'un assemblage n'est pas testé. `083b9` est non interactif et les candidats du document pour les volumes complexes ne donnent pas une famille interactive actuelle satisfaisante. | Assemblage de deux pavés droits, puis pavé et prisme ou cylindre. L'élève identifie les volumes à additionner ou à retrancher et saisit le volume avec l'unité cube. Paramètres : famille des solides, évidement ou ajout, dimensions entières ou décimales, figure avec ou sans aide visuelle. |
| Justifier une propriété géométrique (ESF01, STR3) | Les exercices choisis vérifient reconnaissance et mesures. `c46e8` et `07d1a` sont non interactifs ; une justification rédigée ne se corrige pas dans le parcours actuel. | Questions à étapes sur une figure : choisir la propriété applicable, identifier les données nécessaires, conclure par une égalité ou une relation. Paramètres : parallélisme, perpendicularité, symétrie, conservation des longueurs ou des angles. |
| Calculer une fraction d'une quantité (NO12) | La ceinture marron entraîne la multiplication et la division de fractions ; elle ne pose pas directement une fraction d'une quantité. | Situation courte avec quantité entière ou décimale et fraction simple. L'élève calcule d'abord une part puis la quantité demandée. Paramètres : numérateur, dénominateur, quantité multiple du dénominateur ou non, unité du contexte. |

Les questions de résolution d'équation de STR5 et STR6 ainsi que les démonstrations algébriques de STR4 seront à reprendre dans le chapitre d'algèbre prévu plus tard. Elles ne sont pas utilisées pour fabriquer artificiellement une ceinture des chapitres actuels.

## Avant une version 2

Attribuer à chaque nouvel exercice un UUID stable, vérifier sa correction interactive sur téléphone et plusieurs graines, puis augmenter la version du parcours concerné avant de diffuser le JSON actualisé. Le premier fichier reste importable avec le moteur actuellement embarqué.
