# Revue des exercices : trouvailles

Fichier produit par `node revue/rapport.mjs` à partir du journal du banc
(`revue/journal.jsonl`) et de la relecture (`revue/relecture.jsonl`).
Règles : [regles.md](regles.md). État : [etat.md](etat.md).

Avancement : **9 exercices passés sur 4190**.
Constats regroupés : 117 (un groupe = même exercice, même règle,
même extrait aux nombres près ; « ×n » = nombre de tirages concernés).

Tri : gravité, puis règle, puis niveau et exercice. Les constats
automatiques de typographie et de rédaction (gravité 4 et 5) sont des
candidats : une partie est écartée à la relecture (`revue/ecartes.jsonl`).

## Sommaire

| Gravité | Règle | Exercices | Constats |
| --- | --- | ---: | ---: |
| 1 Interactif faux | [I2 Réponse fausse acceptée](#i2) | 1 | 1 |
| 2 Rendu cassé | [X3 undefined, NaN…](#x3) | 1 | 1 |
| 2 Rendu cassé | [X6 Même graine, exercice différent](#x6) | 1 | 1 |
| 3 Mise en évidence | [M1 Valeur mise en évidence refusée par le champ](#m1) | 3 | 8 |
| 3 Mise en évidence | [M7 Explication en orange](#m7) | 1 | 1 |
| 4 Typographie | [N1 Nombre hors $](#n1) | 6 | 13 |
| 4 Typographie | [T2 Unité (espace, \text)](#t2) | 6 | 16 |
| 4 Typographie | [T3 Espace avant : ; ! ?](#t3) | 1 | 1 |
| 4 Typographie | [T4 Guillemets](#t4) | 1 | 2 |
| 4 Typographie | [X5 Débordement à 390 px](#x5) | 3 | 4 |
| 5 Rédaction | [M3 QCM : la bonne proposition n’est pas mise en évidence telle quelle (à vérifier)](#m3) | 6 | 15 |
| 5 Rédaction | [N2 Séparateur des milliers](#n2) | 2 | 2 |
| 5 Rédaction | [R2 Impératif ou tutoiement](#r2) | 9 | 18 |
| 5 Rédaction | [R5 Virgule (soit, alors, or)](#r5) | 2 | 3 |
| 5 Rédaction | [T5 Espaces en trop](#t5) | 7 | 16 |
| 5 Rédaction | [T6 Points de suspension](#t6) | 9 | 11 |
| 6 Pour mémoire | [IM Interactif à tester à la main](#im) | 2 | 4 |

## I2

**Réponse fausse acceptée** (gravité 1 : Interactif faux)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canCE1a-2025 (CAN) |  q5 mathlive | réponse fausse acceptée | ×8 ; sup=false ; sup=true (revue-0-a) |

## X3

**undefined, NaN…** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | énoncé non interactif q11 | que Zacharie. Combien de billes a Zacharie&nbsp;? [object Object] | ×1 ; défaut (revue-0-a) |

## X6

**Même graine, exercice différent** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canCE2a-2025 (CAN) |  | même graine, énoncés différents (aléa hors nouvelleVersion ?) | ×1 ; sup=false (revue-0-a) |

## M1

**Valeur mise en évidence refusée par le champ** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["6","7","2","21","3","14","1","42"] ; attendu : {"champ":"6;7"} | ×1 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q7 mathlive | valeur en évidence refusée par le champ : ["1","25"] ; attendu : {"champ":"1 h 25 min"} | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q9 mathlive | valeur en évidence refusée par le champ : ["30"] ; attendu : {"champ":"30\\operatorname{cm}"} | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["59","2"] ; attendu : {"champ":"59;2"} | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q16 mathlive | valeur en évidence refusée par le champ : ["2","10"] ; attendu : {"champ":"\\dfrac{2}{10}"} | ×4 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["5","7","1","35"] ; attendu : {"champ":"5;7"} | ×1 ; défaut (revue-0-b) |
| canc3a-2025 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["10","15"] ; attendu : {"champ":"10 h 15 min"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["10","15"] ; attendu : {"champ":"10 h 15 min"} | ×4 ; sup=false ; sup=true (revue-0-a) |

## M7

**Explication en orange** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | correction q11 | texte orange (texteEnCouleur sans couleur) : ans. | ×1 ; défaut (revue-0-b) |

## N1

**Nombre hors $** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | énoncé q25 | « 5 » hors $ : Marina veut construire une figure d'aire 5 unités d'aire (uA). Combien de petits car ‖ « 5 » hors $ : ans. Yann a 5 ans de moins que Dalila. Yann a [champ] ans. ‖ « 1 » hors $ : Nadia veut construire une figure d'aire 1 unité d'aire (uA). Combien de petits | ×3 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | correction q25 | « 5 » hors $ : petits carreaux. Ainsi, une figure de 5 unités d'aire se représente par une figure de ‖ « 5 » hors $ : Puisque Yann a 5 ans de moins que Dalila, son âge est : ‖ « 1 » hors $ : petits carreaux. Ainsi, une figure de 1 unité d'aire se représente par une figure de | ×3 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q25 | « 5 » hors $ : Marina veut construire une figure d'aire 5 unités d'aire (uA). Combien de petits car | ×1 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | correction q27 | « 5 » hors $ : . En effet, il y a 5 carrés dans le rectangle et la zone grisée couvr | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | correction q15 | « 1 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Fig ‖ « 4 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Figure 3 [champ] Fig ‖ « 3 » hors $ : [champ] Figure 4 [champ] Figure 3 [champ] Figure 2 Le carré ( | ×40 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé q18 | « 11 » hors $ : Placer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : cer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 45 » hors $ : acer correctement les aiguilles pour indiquer 2 h 45. [champ] | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q18 | « 11 » hors $ : Placer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : cer correctement les aiguilles pour indiquer 11 h 25. [champ] | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2026 (CAN) | correction q15 | « 1 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Figur ‖ « 4 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Figure 3 [champ] Figur ‖ « 3 » hors $ : [champ] Figure 4 [champ] Figure 3 [champ] Figure 2 La figure 4 | ×52 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) | énoncé q4 | « 4 » hors $ : Coche la bonne réponse. 4 kilogrammes, c'est [champ] | ×1 ; sup=false (revue-0-a) |
| canCE2-2026 (CAN) | énoncé non interactif q4 | « 4 » hors $ : Coche la bonne réponse. 4 kilogrammes, c'est [champ] | ×1 ; sup=false (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé q13 | « 70 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit ‖ « 2 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit-on me rendre ? [ch ‖ « 50 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit-on me rendre ? [champ] € | ×24 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | correction q15 | « 9 » hors $ : . La bonne réponse était : Il y a 9 fois 6 et il reste 2. ‖ « 2 » hors $ : bonne réponse était : Il y a 9 fois 6 et il reste 2. ‖ « 7 » hors $ : onne réponse était : Il y a 9 fois 10 et il reste 7. | ×12 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q13 | « 70 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit ‖ « 2 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit-on me rendre ? ‖ « 238 » hors $ : re suis-je ? Je suis un nombre compris entre 238 et 300 et mon chiffre des dizaines est 3. | ×12 ; sup=false ; sup=true (revue-0-a) |

## T2

**Unité (espace, \text)** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | énoncé q7 | unité sans espace : $30\text{ min }+55 \text{ min }=$ ‖ unité sans espace : $30\text{ m}$ ‖ unité sans espace : $30\text{ dm}$ | ×21 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | correction q21 | unité sans espace : $1\text{ h}$ ‖ unité sans espace : $80\text{ km}$ ‖ unité sans espace : $15\text{ min}$ | ×19 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q7 | unité sans espace : $30\text{ min }+55 \text{ min }=$ ‖ unité sans espace : $30\text{ m}$ ‖ unité sans espace : $30\text{ dm}$ | ×10 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | énoncé q16 | unité sans espace : $360\text{ m}$ ‖ unité sans espace : $40\text{ g}$ ‖ unité sans espace : $240\text{ km}$ | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | correction q16 | unité sans espace : $360\text{ m}$ ‖ unité sans espace : $3\times 110\text{ km}={\color{}\boldsymb$ ‖ unité sans espace : $40\text{ g}$ | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | énoncé non interactif q16 | unité sans espace : $360\text{ m}$ ‖ unité hors \text : $\text{450\,mL}+....\,\text{mL} =1\, \t$ ‖ unité sans espace : $240\text{ km}$ | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | correction q10 | unité sans espace : $4\text{ m}$ ‖ unité sans espace : $4\text{ km}$ ‖ unité sans espace : $4\text{ cm}$ | ×28 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé q18 | unité sans espace : $36\text{ cm}$ | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé non interactif q18 | unité sans espace : $36\text{ cm}$ ‖ unité sans espace : $320\text{ min }= ~.... ~\text{h$ | ×6 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | correction q10 | unité sans espace : $4\text{ m}$ ‖ unité sans espace : $4\text{ km}$ ‖ unité sans espace : $4\text{ cm}$ | ×40 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé q13 | unité sans espace : $3\text{ cm}$ ‖ unité sans espace : $27\text{ m}$ | ×12 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé non interactif q13 | unité sans espace : $3\text{ cm}$ ‖ unité sans espace : $140\text{ min }= ~.... ~\text{h$ ‖ unité sans espace : $27\text{ m}$ | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé q13 | unité sans espace : $6\text{ m}+11\text{ cm}=$ ‖ unité sans espace : $4\text{ kg}$ ‖ unité sans espace : $26\text{ cm}$ | ×24 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | correction q13 | unité sans espace : $6\text{ m}+11\text{ cm}=6\text$ ‖ unité sans espace : $6\text{ m}+11\text{ cm}=6\text{ m}+0,11\te$ ‖ unité sans espace : $6\text{ m}+11\text{ cm}=6\text{ m}+0,11\text{ m}$ | ×56 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé non interactif q13 | unité sans espace : $6\text{ m}+11\text{ cm}=$ ‖ unité sans espace : $4\text{ kg}$ ‖ unité sans espace : $26\text{ cm}$ | ×12 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | correction q4 | unité sans espace : $4\text{ cm}$ ‖ unité sans espace : $4\text{ km}$ ‖ unité sans espace : $4\text{ m}$ | ×16 ; sup=false ; sup=true (revue-0-a) |

## T3

**Espace avant : ; ! ?** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canCE2-2026 (CAN) | correction q13 | « é: » sans espace insécable : J'ai donné: | ×4 ; sup=false ; sup=true (revue-0-a) |

## T4

**Guillemets** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canCE1a-2025 (CAN) | énoncé q4 | guillemet sans insécable : cases et tombe sur « recule de ‖ guillemet sans insécable : cases ». Magalie doit alors aller sur la case [champ] ‖ guillemet sans insécable : cases ». Diane doit alors aller sur la case [champ] . | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | guillemet sans insécable : cases et tombe sur « recule de ‖ guillemet sans insécable : cases ». Magalie doit alors aller sur la case ‖ guillemet sans insécable : cases ». Zoé doit alors aller sur la case | ×4 ; sup=false ; sup=true (revue-0-a) |

## X5

**Débordement à 390 px** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | correction | page de 393 px pour 390 px | ×1 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | correction | page de 415 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé | page de 400 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | correction | page de 437 px pour 390 px | ×1 ; sup=false (revue-0-b) |

## M3

**QCM : la bonne proposition n’est pas mise en évidence telle quelle (à vérifier)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2024 (CAN) |  q10 qcm | QCM : bonne proposition (54cm) absente de la mise en évidence (54) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) |  q15 qcm | QCM : bonne proposition (figureb) absente de la mise en évidence (b) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) |  q16 qcm | QCM : bonne proposition (figurea) absente de la mise en évidence (a) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) |  q2 qcm | QCM : bonne proposition (1m=1000mm) absente de la mise en évidence (1000mm) | ×1 ; sup=false (revue-0-a) |
| canCE1a-2025 (CAN) |  q8 qcm | QCM : bonne proposition (45s) absente de la mise en évidence (45) | ×1 ; sup=false (revue-0-a) |
| canCE1a-2025 (CAN) |  q2 qcm | QCM : bonne proposition (1m=100cm) absente de la mise en évidence (100cm) | ×3 ; sup=false ; sup=true (revue-0-b) |
| canCE1a-2025 (CAN) |  q8 qcm | QCM : bonne proposition (90min) absente de la mise en évidence (90) | ×3 ; sup=false ; sup=true (revue-0-b) |
| canCE1a-2026 (CAN) |  q10 qcm | QCM : bonne proposition (6faces) absente de la mise en évidence (6) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) |  q4 qcm | QCM : bonne proposition (4000g) absente de la mise en évidence (4000) | ×1 ; sup=false (revue-0-a) |
| canCE2-2026 (CAN) |  q11 qcm | QCM : bonne proposition (6faceset12arêtes.) absente de la mise en évidence (612) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) |  q4 qcm | QCM : bonne proposition (7kg) absente de la mise en évidence (7) | ×3 ; sup=false ; sup=true (revue-0-b) |
| canCE2a-2025 (CAN) |  q11 qcm | QCM : bonne proposition () absente de la mise en évidence (deuxième) | ×1 ; sup=false (revue-0-a) |
| canCE2a-2025 (CAN) |  q15 qcm | QCM : bonne proposition (ilya9fois6etilreste2.) absente de la mise en évidence (ilya9fois6etilreste2) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) |  q11 qcm | QCM : bonne proposition () absente de la mise en évidence (troisième) | ×2 ; sup=false ; sup=true (revue-0-b) |
| canCE2a-2025 (CAN) |  q11 qcm | QCM : bonne proposition () absente de la mise en évidence (première) | ×1 ; sup=true (revue-1-b) |

## N2

**Séparateur des milliers** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2024 (CAN) | correction q28 | nombre à 4 chiffres sans séparateur : $=1000$ ‖ nombre à 4 chiffres sans séparateur : $imes 100={\color{}\boldsymbol{2500}}$ | ×3 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | correction q7 | nombre à 4 chiffres sans séparateur : $2+7\,000={\color{}\boldsymbol{9622}}$ | ×1 ; sup=false (revue-0-a) |

## R2

**Impératif ou tutoiement** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | énoncé q6 | impératif : Complète : ‖ impératif : Écris les deux nombres séparés par un point-virgu ‖ impératif : Choisis parmi les propositions suivantes la hauteu | ×18 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q6 | impératif : Complète : ‖ impératif : Choisis parmi les propositions suivantes la hauteu ‖ impératif : Écris en chiffres le nombre : soixante-et-un-mil | ×7 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | énoncé q3 | impératif : Écris le nombre égal à ‖ impératif : Complète. [champ] ‖ impératif : Complète. | ×32 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | énoncé non interactif q3 | impératif : Écris le nombre égal à ‖ impératif : Complète. ‖ impératif : Coche le plus grand nombre : [champ] | ×16 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé q4 | impératif : Écris, en chiffres, le nombre : mille-cinq [ ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×36 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé non interactif q4 | impératif : Écris, en chiffres, le nombre : mille-cinq ‖ impératif : Complète. ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×18 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé q4 | impératif : Écris, en chiffres, le nombre : mille-cinq [ ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×40 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé non interactif q4 | impératif : Écris, en chiffres, le nombre : mille-cinq ‖ impératif : Complète. ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×22 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé q1 | impératif : Complète. [champ] ‖ impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] | ×40 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé non interactif q1 | impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] ‖ impératif : . Complète. | ×22 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé q2 | impératif : Coche la bonne réponse. [champ] ‖ impératif : Écris un nombre qui a ‖ impératif : Coche le nombre qui est entre | ×44 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q2 | impératif : Coche la bonne réponse. [champ] ‖ impératif : Écris un nombre qui a ‖ impératif : Coche le nombre qui est entre | ×22 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2026 (CAN) | énoncé q1 | impératif : Entoure la moitié de ‖ impératif : Entoure le résultat le plus petit. [champ] ‖ impératif : Entoure le nombre qui a | ×56 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2026 (CAN) | énoncé non interactif q1 | impératif : Entoure la moitié de ‖ impératif : Entoure le résultat le plus petit. [champ] ‖ impératif : Entoure le nombre qui a | ×28 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) | énoncé q1 | impératif : Complète. ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. 4 kilogrammes, c'est [cham | ×36 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) | énoncé non interactif q1 | impératif : Complète. ‖ impératif : Coche la bonne réponse. 4 kilogrammes, c'est [cham ‖ impératif : Calcule : | ×18 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé q3 | impératif : Complète la case grise. ‖ impératif : Calcule : ‖ impératif : Coche la bonne réponse pour | ×16 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q3 | impératif : Complète la case grise. ‖ impératif : Calcule : ‖ impératif : Coche la bonne réponse pour | ×8 ; sup=false ; sup=true (revue-0-a) |

## R5

**Virgule (soit, alors, or)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | correction q26 | pas de virgule après « Or » : centièmes. Or | ×2 ; défaut (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé q4 | pas de virgule avant « alors » : cases ». Magalie doit alors aller sur la case [champ] . ‖ pas de virgule avant « soit » : cris un nombre dans lequel on entend vingt et qui soit plus grand que ‖ pas de virgule avant « alors » : cases ». Diane doit alors aller sur la case [champ] . | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | pas de virgule avant « alors » : cases ». Magalie doit alors aller sur la case ‖ pas de virgule avant « soit » : cris un nombre dans lequel on entend vingt et qui soit plus grand que ‖ pas de virgule avant « alors » : cases ». Zoé doit alors aller sur la case | ×4 ; sup=false ; sup=true (revue-0-a) |

## T5

**Espaces en trop** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | correction q11 | double espace : Puisque Zoé en a ‖ double espace : Le double de | ×2 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | énoncé q4 | double espace : carreaux de chocolat pèsent [champ] g ‖ double espace : billes et Wendy en a ‖ double espace : billes et Karole en a | ×12 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | correction q4 | double espace : g, donc ‖ double espace : On commence par calculer | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | énoncé non interactif q17 | double espace : billes et Wendy en a ‖ double espace : billes et Lola en a | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé q8 | double espace : morceaux de sucre pèsent [champ] g. ‖ double espace : œufs est [champ] œufs. ‖ double espace : euros. On me rend [champ] €. | ×12 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | correction q8 | double espace : g, donc ‖ double espace : dixièmes est égal à ‖ double espace : centièmes est égal à | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé q8 | double espace : morceaux de sucre pèsent [champ] g. ‖ double espace : mises bout à bout. On obtient une longueur de [champ] ‖ double espace : La longueur du contour de ce triangle est de | ×20 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | correction q8 | double espace : g, donc ‖ double espace : dizaines est égal à ‖ double espace : La longueur du contour est | ×12 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé non interactif q18 | double espace : La longueur du contour de ce triangle est de | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé non interactif q26 | double espace : . [figure] | ×2 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé q4 | double espace : cases ». Magalie doit alors aller sur la case [champ] . ‖ double espace : Écris un nombre qui a ‖ double espace : Écris un nombre dans lequel on entend vingt et qui soit plus grand que | ×16 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | correction q4 | double espace : Magalie arrive donc sur la case ‖ espace avant ponctuation : se lit quatre- vingts . ‖ double espace : parts. Chaque part correspond à | ×12 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | double espace : cases ». Magalie doit alors aller sur la case ‖ double espace : Écris un nombre qui a ‖ double espace : Écris un nombre dans lequel on entend vingt et qui soit plus grand que | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé q10 | double espace : el est le plus grand nombre que je peux former avec les chiffres : | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | correction q13 | double espace : €, soit la somme de | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q10 | double espace : el est le plus grand nombre que je peux former avec les chiffres : | ×2 ; sup=false ; sup=true (revue-0-a) |

## T6

**Points de suspension** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | énoncé q6 | points de suspension en maths (\ldots) : $.... \times .... =42$ ‖ points de suspension en maths (\ldots) : $0\text{ min }+55 \text{ min }=.... \text{ h } .... \text{ mi$ ‖ points de suspension en maths (\ldots) : $\text{ min }=.... \text{ h } .... \text{ min }$ | ×16 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q6 | points de suspension en maths (\ldots) : $.... \times .... =42$ ‖ points de suspension en maths (\ldots) : $0\text{ min }+55 \text{ min }=.... \text{ h } .... \text{ mi$ ‖ points de suspension en maths (\ldots) : $\text{ min }=.... \text{ h } .... \text{ min }$ | ×9 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $9+3= .... -6$ ‖ points de suspension en maths (\ldots) : $9 \times .... = 54$ | ×30 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $4\times ....=36$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $1 +\dfrac{9}{10} =\dfrac{....}{10}$ | ×26 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $4\times ....=36$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $1 +\dfrac{9}{10} =\dfrac{....}{10}$ | ×22 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | correction q11 | points de suspension en maths (\ldots) : $gin{aligned} 5\times 5 &= .... + 20\\ 25 &={\color{}\$ | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $81=....\times....$ ‖ points de suspension en maths (\ldots) : $9\,388+300=....$ ‖ points de suspension en maths (\ldots) : $19\times .... = 1\,900$ | ×30 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $p;10&nbsp;&nbsp;;&nbsp;&nbsp;{....}&nbsp;&nbsp;;&nbsp;&nbsp;$ ‖ points de suspension en maths (\ldots) : $6 \times .... = 36$ | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2026 (CAN) | énoncé non interactif q3 | points de suspension en maths (\ldots) : $384 + 70 = ....$ ‖ points de suspension en maths (\ldots) : $29~;~25~;~{....}~;~17~;~13$ ‖ points de suspension en maths (\ldots) : $....$ | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $9\times .... =45$ ‖ points de suspension en maths (\ldots) : $.... +186=190$ ‖ points de suspension en maths (\ldots) : $....$ | ×24 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $434 + .... = 440$ ‖ points de suspension en maths (\ldots) : $10 \times ........ = 2\,700$ ‖ points de suspension en maths (\ldots) : $10 \times ........ = 200$ | ×8 ; sup=false ; sup=true (revue-0-a) |

## IM

**Interactif à tester à la main** (gravité 6 : Pour mémoire)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2026 (CAN) |  q1 fillInTheBlank | aucune valeur attendue | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) |  q4 meta-interactif-2d | format meta-interactif-2d : à tester à la main | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) |  q26 apigeom-figure | format apigeom-figure : à tester à la main | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) |  q18 interactive-clock | format interactive-clock : à tester à la main | ×4 ; sup=false ; sup=true (revue-0-a) |
