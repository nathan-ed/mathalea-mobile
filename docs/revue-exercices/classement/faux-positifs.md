# Faux positifs écartés

Constats automatiques reconnus faux à la relecture, gardés pour la traçabilité.

36 constats, 10 exercices. Données complètes : `revue/classement/faux-positifs.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [M1 Valeur mise en évidence refusée par le champ](#m1) | 23 | 2 |
| [M8 Nombre de mises en évidence et de champs différents](#m8) | 1 | 1 |
| [N1 Nombre hors $](#n1) | 3 | 3 |
| [R5 Virgule (soit, alors, or)](#r5) | 3 | 3 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 2 | 1 |
| [X3 undefined, NaN…](#x3) | 4 | 1 |

## M1

**Valeur mise en évidence refusée par le champ**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-2e5b8daf62 | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["1,969","2","1,97","1,9"] ; attendu : {"champ":"1.97"} (×2) | écarté à la relecture | sup=2 sup2=5, graine revue-9-a, q1 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&s=2&s2=5&alea=revue-9-a&i=1&cd=1)) |
| A-46d5eaa113 | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["1,1","1","1,061","1,06"] ; attendu : {"champ":"1"} (×2) | écarté à la relecture | sup=1 sup2=5, graine revue-0-b, q1 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&s=1&s2=5&alea=revue-0-b&i=1&cd=1)) |
| A-55531f6f31 | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["2,619","2,62","2,6","3"] ; attendu : {"champ":"5.12"} | écarté à la relecture | sup=1 sup2=5 nb=10, graine revue-20-a, q9 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&n=10&s=1&s2=5&alea=revue-20-a&i=1&cd=1)) |
| A-878c8ed856 | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["1","1,256","2","1,257","1,256","1,2","1","1,25","1,25","1,3","1,3","1,26"] ; attendu : {"champ":"1.25"} | écarté à la relecture | sup=4 sup2=5, graine revue-19-a, q1 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&s=4&s2=5&alea=revue-19-a&i=1&cd=1)) |
| A-9796185bfc | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["1","0,15","0,147","0,2"] ; attendu : {"champ":"0.147"} (×3) | écarté à la relecture | sup=2 sup2=5, graine revue-9-b, q1 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&s=2&s2=5&alea=revue-9-b&i=1&cd=1)) |
| A-c3fc01ce2d | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["0","0,06","0,1","0,063"] ; attendu : {"champ":"3"} | écarté à la relecture | sup=1 sup2=5 nb=10, graine revue-20-a, q2 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&n=10&s=1&s2=5&alea=revue-20-a&i=1&cd=1)) |
| A-e00bb9de13 | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["1","0,506","0,50","0","0,51","0,50","0,507","0,6","0,5","0,506","0,5","1"] ; attendu : {"champ":"0.5"} | écarté à la relecture | sup=4 sup2=5, graine revue-19-b, q1 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&s=4&s2=5&alea=revue-19-b&i=1&cd=1)) |
| A-f80e059da5 | 6N1L (6e) |  | valeur en évidence refusée par le champ : ["0,244","0,2","0","0,24"] ; attendu : {"champ":"0.2"} (×3) | écarté à la relecture | sup=3 sup2=5, graine revue-14-a, q1 ([site](https://coopmaths.fr/alea/?uuid=013ef&id=6N1L&s=3&s2=5&alea=revue-14-a&i=1&cd=1)) |
| A-0418d8a7dc | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"1\\,565,304","champ2":"15\\,653,04"} ; attendu : {"champ1":"392.98","champ2":"15653.04"} (×3) | écarté à la relecture | sup=3 sup2=false, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=false&alea=revue-0-a&i=1&cd=1)) |
| A-0a0a4f01e7 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"31,971\\,8","champ2":"3,197\\,18"} ; attendu : {"champ1":"8.208","champ2":"3.19718"} (×5) | écarté à la relecture | sup=3 sup2=false, graine revue-0-b, q1 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=false&alea=revue-0-b&i=1&cd=1)) |
| A-2c0d6d8744 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"1,960\\,8","champ2":"19,608"} ; attendu : {"champ1":"18.34","champ2":"19.608"} (×6) | écarté à la relecture | sup=3 sup2=false, graine revue-0-a, q4 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=false&alea=revue-0-a&i=1&cd=1)) |
| A-3c4aef84c1 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"77,88","champ2":"0,778\\,8"} ; attendu : {"champ1":"2.69","champ2":"0.7788"} (×4) | écarté à la relecture | sup=3 sup2=false, graine revue-0-b, q4 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=false&alea=revue-0-b&i=1&cd=1)) |
| A-5ffd54b8d8 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"25\\,918,7","champ2":"2,591\\,87"} ; attendu : {"champ1":"9.081","champ2":"2.59187"} (×5) | écarté à la relecture | sup=3 sup2=false, graine revue-0-a, q2 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=false&alea=revue-0-a&i=1&cd=1)) |
| A-6980867c2c | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"232,509","champ2":"2\\,325,09"} ; attendu : {"champ1":"230","champ2":"2325.09"} | écarté à la relecture | sup=3 sup2=true, graine revue-5-b, q1 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=true&alea=revue-5-b&i=1&cd=1)) |
| A-9637cbb871 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"292\\,248","champ2":"2\\,922,48"} ; attendu : {"champ1":"323.3","champ2":"2922.48"} | écarté à la relecture | sup=3 sup2=true, graine revue-5-a, q4 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=true&alea=revue-5-a&i=1&cd=1)) |
| A-a95427a7c6 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"6\\,450,93","champ2":"645,093"} ; attendu : {"champ1":"939.687","champ2":"645.093"} (×3) | écarté à la relecture | sup=2 sup2=true, graine revue-3-a, q3 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=2&s2=true&alea=revue-3-a&i=1&cd=1)) |
| A-ba72dea674 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"22\\,982,4","champ2":"229\\,824"} ; attendu : {"champ1":"48","champ2":"229824"} | écarté à la relecture | sup=3 sup2=true, graine revue-5-a, q2 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=true&alea=revue-5-a&i=1&cd=1)) |
| A-c836fea40e | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"163,053","champ2":"16\\,305,3"} ; attendu : {"champ1":"695.3","champ2":"16305.3"} (×2) | écarté à la relecture | sup=2 sup2=true, graine revue-3-b, q2 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=2&s2=true&alea=revue-3-b&i=1&cd=1)) |
| A-cb029f3b04 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"703\\,148","champ2":"70,314\\,8"} ; attendu : {"champ1":"2.1020000000000003","champ2":"70.3148"} | écarté à la relecture | sup=2 sup2=true, graine revue-3-a, q2 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=2&s2=true&alea=revue-3-a&i=1&cd=1)) |
| A-d03f8b3199 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"49,306\\,4","champ2":"493\\,064"} ; attendu : {"champ1":"5691","champ2":"493064"} | écarté à la relecture | sup=3 sup2=true, graine revue-5-b, q3 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=true&alea=revue-5-b&i=1&cd=1)) |
| A-d4846a43b0 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"59\\,904","champ2":"599,04"} ; attendu : {"champ1":"9216.065","champ2":"599.04"} | écarté à la relecture | sup=3 sup2=false nb=10, graine revue-6-a, q5 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&n=10&s=3&s2=false&alea=revue-6-a&i=1&cd=1)) |
| A-dae17dbfe9 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"76,912","champ2":"769,12"} ; attendu : {"champ1":"92.8","champ2":"769.12"} (×6) | écarté à la relecture | sup=3 sup2=false, graine revue-0-a, q3 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=3&s2=false&alea=revue-0-a&i=1&cd=1)) |
| A-dd13efa3f2 | 6N2E-3 (6e) |  | valeur en évidence refusée par le champ : {"champ1":"19,816\\,2","champ2":"1\\,981,62"} ; attendu : {"champ1":"93.30000000000001","champ2":"1981.62"} (×2) | écarté à la relecture | sup=2 sup2=false, graine revue-4-b, q1 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=2&s2=false&alea=revue-4-b&i=1&cd=1)) |

## M8

**Nombre de mises en évidence et de champs différents**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-a405887636 | 6N2E-3 (6e) |  | 1 mise(s) en évidence pour 2 champ(s) (×16) | écarté à la relecture | sup=1 sup2=true, graine revue-1-a, q1 ([site](https://coopmaths.fr/alea/?uuid=71be7&id=6N2E-3&s=1&s2=true&alea=revue-1-a&i=1&cd=1)) |

## N1

**Nombre hors $**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-af99e16e09 | can2L2-06 (CAN) | correction | « 1 » hors $ : Méthode 1 : On reconnaît l'identité remarquable ‖ « 2 » hors $ : . Méthode 2 : On isole le carré pour se ramener à une équat (×2) | écarté à la relecture | sup=6, graine revue-6-a, q1 ([site](https://coopmaths.fr/alea/?uuid=f1286&id=can2L2-06&s=6&alea=revue-6-a&i=1&cd=1)) |
| A-6dfeb22ab3 | CM1C2F (cm1) | correction | « 1 » hors $ : Lorsqu'on divise un nombre par 1, le quotient est le nombre initial : (×8) | écarté à la relecture | sup=1 sup2=true sup3=1, graine revue-1-a, q1 ([site](https://coopmaths.fr/alea/?uuid=b659a&id=CM1C2F&s=1&s2=true&s3=1&alea=revue-1-a&i=1&cd=1)) |
| A-303050047b | CM2N3A-5 (cm2) | correction | « 1 » hors $ : Lorsqu'on divise un nombre par 1, le quotient est le nombre initial : (×12) | écarté à la relecture | sup=1 sup2=true sup3=1, graine revue-1-a, q1 ([site](https://coopmaths.fr/alea/?uuid=b259a&id=CM2N3A-5&s=1&s2=true&s3=1&alea=revue-1-a&i=1&cd=1)) |

## R5

**Virgule (soit, alors, or)**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-7ad2f04cdf | can2a-2025 (CAN) | correction | pas de virgule avant « alors » : On les met au même dénominateur et on additionne alors les numérateurs en gardant le dénominateur (×2) | écarté à la relecture | sup=false, graine revue-0-a, q16 ([site](https://coopmaths.fr/alea/?uuid=4581b&id=can2a-2025&s=false&alea=revue-0-a&i=1&cd=1)) |
| A-2db9128261 | can2F25-08 (CAN) | correction | pas de virgule après « Or » : admet donc une unique solution. Or (×8) | écarté à la relecture | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=8a5c3&id=can2F25-08&alea=revue-0-a&i=1&cd=1)) |
| A-f77d305d73 | can2N3-04 (CAN) | correction | pas de virgule avant « alors » : de la bouteille. Il reste alors (×11) | écarté à la relecture | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=4c878&id=can2N3-04&alea=revue-0-a&i=1&cd=1)) |

## R10

**Français (accords, fautes, coquilles)**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-9f83096170 | CM2N2F-1 (cm2) | correction | mot répété « de de » : . Pour les autres points on procède de la même façon. (×298) | écarté à la relecture | sup=13 sup2=1-2-4-6, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=0e527&id=CM2N2F-1&s=13&s2=1-2-4-6&alea=revue-0-a&i=1&cd=1)) |
| A-e103c1993f | CM2N2F-1 (cm2) | correction non interactive | mot répété « de de » : . Pour les autres points on procède de la même façon. (×3) | écarté à la relecture |  |

## X3

**undefined, NaN…**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-838aa9e141 | can1D1-05 (CAN) | énoncé non interactif | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > &lt;div cl | écarté à la relecture |  |
| A-b351772608 | can1D1-05 (CAN) | énoncé | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > &lt;div cl (×11) | écarté à la relecture | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=6f32d&id=can1D1-05&alea=revue-0-a&i=1&cd=1)) |
| A-c99b0d8f4f | can1D1-05 (CAN) | énoncé | div> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:100px;' > &lt;div c (×11) | écarté à la relecture | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=6f32d&id=can1D1-05&alea=revue-0-a&i=1&cd=1)) |
| A-d2bd88c77d | can1D1-05 (CAN) | énoncé non interactif | div> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:100px;' > &lt;div c | écarté à la relecture |  |
