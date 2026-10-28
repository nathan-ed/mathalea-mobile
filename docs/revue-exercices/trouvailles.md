# Revue des exercices : trouvailles

Fichier produit par `node revue/rapport.mjs` à partir du journal du banc
(`revue/journal.jsonl`) et de la relecture (`revue/relecture.jsonl`).
Règles : [regles.md](regles.md). État : [etat.md](etat.md).

Avancement : **357 exercices passés sur 4190**.
Constats regroupés : 2088 (un groupe = même exercice, même règle,
même extrait aux nombres près ; « ×n » = nombre de tirages concernés).

Tri : gravité, puis règle, puis niveau et exercice. Les constats
automatiques de typographie et de rédaction (gravité 4 et 5) sont des
candidats : une partie est écartée à la relecture (`revue/ecartes.jsonl`).

## Sommaire

| Gravité | Règle | Exercices | Constats |
| --- | --- | ---: | ---: |
| 1 Interactif faux | [I1 Bonne réponse refusée](#i1) | 4 | 4 |
| 1 Interactif faux | [I2 Réponse fausse acceptée](#i2) | 1 | 1 |
| 1 Interactif faux | [I4 Question interactive sans champ](#i4) | 4 | 4 |
| 1 Interactif faux | [X1 Erreur ou exception](#x1) | 6 | 10 |
| 2 Rendu cassé | [C1 Contenu mathématique faux ou ambigu](#c1) | 13 | 13 |
| 2 Rendu cassé | [X1 Erreur ou exception](#x1) | 11 | 14 |
| 2 Rendu cassé | [X2 Formule cassée (KaTeX, $)](#x2) | 2 | 4 |
| 2 Rendu cassé | [X3 undefined, NaN…](#x3) | 1 | 1 |
| 2 Rendu cassé | [X4 Question en double ou vide](#x4) | 2 | 2 |
| 2 Rendu cassé | [X6 Même graine, exercice différent](#x6) | 2 | 2 |
| 3 Mise en évidence | [C1 Contenu mathématique faux ou ambigu](#c1) | 8 | 8 |
| 3 Mise en évidence | [M1 Valeur mise en évidence refusée par le champ](#m1) | 32 | 90 |
| 3 Mise en évidence | [M2 Unité dans miseEnEvidence](#m2) | 56 | 208 |
| 3 Mise en évidence | [M5 Texte dans miseEnEvidence](#m5) | 54 | 113 |
| 3 Mise en évidence | [M6 Pas de mise en évidence du résultat](#m6) | 3 | 3 |
| 3 Mise en évidence | [M7 Explication en orange](#m7) | 19 | 60 |
| 3 Mise en évidence | [M8 Nombre de mises en évidence et de champs différents](#m8) | 4 | 5 |
| 3 Mise en évidence | [X4 Question en double ou vide](#x4) | 1 | 1 |
| 3 Mise en évidence | [X7 Combinaisons de paramètres non toutes passées](#x7) | 1 | 1 |
| 4 Typographie | [C1 Contenu mathématique faux ou ambigu](#c1) | 2 | 2 |
| 4 Typographie | [N1 Nombre hors $](#n1) | 82 | 124 |
| 4 Typographie | [N2 Séparateur des milliers](#n2) | 3 | 3 |
| 4 Typographie | [N3 Point décimal](#n3) | 7 | 7 |
| 4 Typographie | [N6 Écriture algébrique (1x, +-, -0…)](#n6) | 2 | 2 |
| 4 Typographie | [N7 Zéros significatifs (prix…)](#n7) | 3 | 3 |
| 4 Typographie | [R4 Dernière phrase en saisie libre](#r4) | 3 | 3 |
| 4 Typographie | [T1 Espace avant %](#t1) | 12 | 17 |
| 4 Typographie | [T2 Unité (espace, \text)](#t2) | 12 | 12 |
| 4 Typographie | [T3 Espace avant : ; ! ?](#t3) | 8 | 11 |
| 4 Typographie | [T4 Guillemets](#t4) | 6 | 11 |
| 4 Typographie | [T9 Mot non écrit en \text dans une formule](#t9) | 1 | 1 |
| 4 Typographie | [X5 Débordement à 390 px](#x5) | 40 | 48 |
| 5 Rédaction | [C1 Contenu mathématique faux ou ambigu](#c1) | 2 | 2 |
| 5 Rédaction | [M3 QCM : la bonne proposition n’est pas mise en évidence telle quelle (à vérifier)](#m3) | 20 | 41 |
| 5 Rédaction | [N1 Nombre hors $](#n1) | 25 | 25 |
| 5 Rédaction | [N2 Séparateur des milliers](#n2) | 31 | 44 |
| 5 Rédaction | [N6 Écriture algébrique (1x, +-, -0…)](#n6) | 3 | 6 |
| 5 Rédaction | [R1 Titre](#r1) | 41 | 44 |
| 5 Rédaction | [R10 Français (accords, fautes, coquilles)](#r10) | 44 | 73 |
| 5 Rédaction | [R2 Impératif ou tutoiement](#r2) | 65 | 103 |
| 5 Rédaction | [R3 Point final](#r3) | 5 | 5 |
| 5 Rédaction | [R4 Dernière phrase en saisie libre](#r4) | 1 | 1 |
| 5 Rédaction | [R5 Virgule (soit, alors, or)](#r5) | 25 | 36 |
| 5 Rédaction | [R6 Majuscule sans accent](#r6) | 1 | 1 |
| 5 Rédaction | [R8 Orthographe uniformisée (en dessous, au-dessus…)](#r8) | 2 | 2 |
| 5 Rédaction | [T4 Guillemets](#t4) | 11 | 11 |
| 5 Rédaction | [T5 Espaces en trop](#t5) | 89 | 170 |
| 5 Rédaction | [T6 Points de suspension](#t6) | 142 | 261 |
| 5 Rédaction | [X4 Question en double ou vide](#x4) | 4 | 4 |
| 6 Pour mémoire | [IM Interactif à tester à la main](#im) | 7 | 13 |
| 6 Pour mémoire | [R1 Titre](#r1) | 457 | 457 |
| 6 Pour mémoire | [X7 Combinaisons de paramètres non toutes passées](#x7) | 1 | 1 |

## I1

**Bonne réponse refusée** (gravité 1 : Interactif faux)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-CoopMaths (CAN) | src/exercices/can/5e/can5a-CoopMaths.ts:441 | Q27 : l'énoncé dit « en ${b} h et 20 min », la réponse attendue est calculée pour 15 min (a×(b+0,25)) et la correction affiche « $60\times 1.5$ » (b+0,5, point décimal) : 60 km/h pendant 1 h 20 → 80 km, l'app attend 75. Pas de point d'interrogation. → 20 min → b + 1/3, ou énoncé « b h et 15 min » avec texNombre(b + 0.25). | ×1 |
| can6a-Aléa (CAN) |  q4 qcm | bonne réponse refusée (0/1)  | ×1 ; sup=All nb=10 (revue-1-a) |
| canc3C12 (CAN) | src/exercices/can/c3/canc3C12.ts:36 | Réponse négative possible (a jusqu'à 20, b×res dès 6 : « J'ajoute $20$, … j'obtiens $7$ » → $-6$) en CM1/CM2, avec le clavier clavierNumbers sans signe moins : l'élève ne peut pas saisir la réponse. → Tirer res avec b×res > a (res = randint(Math.ceil((a + 1) / b), 15)) | ×1 |
| CM1N1E (cm1) |  q1 qcm | bonne réponse refusée (0/1)  | ×48 ; sup=3 sup2=6 sup3=7 sup4=true sup5=true ; sup=4 sup2=1 sup3=3 sup4=true sup5=true… (revue-20-a) |

## I2

**Réponse fausse acceptée** (gravité 1 : Interactif faux)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-CoopMaths (CAN) |  q30 mathlive | réponse fausse acceptée | ×4 ; sup=31 ; sup=30 (revue-0-a) |

## I4

**Question interactive sans champ** (gravité 1 : Interactif faux)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6a-Aléa (CAN) |  q1 mathlive | champ absent de la page | ×17 ; sup=All ; sup=All nb=10 (revue-0-a) |
| can6a-CoopMaths (CAN) |  q22 mathlive | champ absent de la page | ×19 ; sup=1 ; sup=5… (revue-1-a) |
| canc3a (CAN) |  q27 mathlive | champ absent de la page | ×13 ; sup=14 ; sup=17… (revue-14-a) |
| canc3C16 (CAN) |  q9 fillInTheBlank | champ absent de la page | ×1 ; défaut nb=10 (revue-1-a) |

## X1

**Erreur ou exception** (gravité 1 : Interactif faux)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6a-Aléa (CAN) | src/exercices/can/6e/can6a-alea.ts:143 | Dans l'app (moteur), toutes les questions restent à « chargement... » : l'exercice charge ses questions de façon asynchrone (loadAllQuests) après nouvelleVersion, et preparerExercice ne l'attend pas. Exercice inutilisable dans l'app ; même mécanisme dans src/exercices/_automatismesCan.ts. → Côté moteur : attendre la promesse de chargement (exposer une promesse dans nouvelleVersionWrapper et l'attendre dans preparerExercice), ou exclure ces exercices du référentiel de l'app. | ×1 |
| can6a-Aléa (CAN) | série q1 | énoncé resté à « chargement... » (questions chargées après la génération) | ×14 ; sup=All ; sup=All nb=10 (revue-0-a) |
| can6N21-02 (CAN) |  | interactif (correcte) : page.evaluate: Target page, context or browser has been closed | ×1 ; sup=3-4 sup2=1 nb=10 (revue-32-a) |
| can6N21-03 (CAN) |  | interactif (correcte) : page.evaluate: Target page, context or browser has been closed | ×1 ; sup=5-6 sup2=1 nb=10 (revue-32-a) |
| can6N21-04 (CAN) |  | interactif (evidence) : page.evaluate: Execution context was destroyed, most likely because of a navigation. | ×1 ; sup=1 sup2=1 (revue-4-b) |
| can6N21-04 (CAN) |  | interactif (correcte) : page.evaluate: TypeError: Cannot read properties of undefined (reading 'interactif')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:22)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 ; sup=1 sup2=1 (revue-4-b) |
| can6N22-01 (CAN) |  | interactif (evidence) : page.evaluate: Execution context was destroyed, most likely because of a navigation. | ×1 ; défaut (revue-0-b) |
| can6N22-01 (CAN) |  | interactif (correcte) : page.evaluate: TypeError: Cannot read properties of undefined (reading 'interactif')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:22)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 ; défaut (revue-0-b) |
| can6N22-02 (CAN) |  | interactif (evidence) : page.evaluate: Execution context was destroyed, most likely because of a navigation. | ×1 ; sup=true (revue-0-a) |
| can6N22-02 (CAN) |  | interactif (correcte) : page.evaluate: TypeError: Cannot read properties of undefined (reading 'interactif')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:22)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 ; sup=true (revue-0-a) |

## C1

**Contenu mathématique faux ou ambigu** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2022 (CAN) | src/exercices/can/4e/can4a-2022.ts:318 | Q4 (cm → m) : « pour passer des m au cm, on divise par 100 » : sens inversé (on passe des cm aux m en divisant). → Ainsi, pour passer des $\text{cm}$ aux $\text{m}$, on divise par $100$. | ×1 |
| can4a-2023 (CAN) | src/exercices/can/4e/can4a-2023.ts:1097 | Q18 : correction « $\dfrac{3\times 3}{2}=⟦6⟧$ » : le calcul affiche a×a au lieu de a×b (réponse juste, calcul faux). → \\dfrac{${a}\\times ${b}}{2} | ×1 |
| can5a-2022 (CAN) | src/exercices/can/5e/can5a-2022.ts:697 | Q14 : l'énoncé parle du triangle $DEF$, la figure montre $CDE$ et $FGH$ (la correction parle bien de $C$). → Le triangle $FGH$ est le symétrique du triangle $CDE$ | ×1 |
| can5a-2024 (CAN) | src/exercices/can/can5a-2024/can5a-2024-Q11.ts:50 | Q11 (cas a+b=10, ordre a+c+b) : « \underbrace{4,2+5,8}_{=1} » au lieu de 10. → _{=10} | ×1 |
| can5a-2025 (CAN) | src/exercices/can/can5a-2025/can5a-2025-Q18.ts:45 | Q18 (a > 45) : la première ligne écrit « $90^\circ+60^\circ+? =180^\circ$ » avec la réponse à la place de l'angle donné (30°), la ligne suivante soustrait 30° : correction incohérente. → $90^\circ+${a > 45 ? 90 - a : a}^\circ+? =180^\circ$ | ×1 |
| can5a-CoopMaths (CAN) | src/exercices/can/5e/can5a-CoopMaths.ts:541 | Q30 : c = Math.round(randint(…)/10) peut valoir 0 : « $0$ kg de framboises coûtent $0$ € … Combien coûtent 4 kg » (question vide de sens) ; réponse attendue « 48€ » (symbole dans la valeur), € dans la formule. → c = Math.max(1, …) ; reponse: texPrix(resultat) | ×1 |
| can5C2-01 (CAN) | src/exercices/can/5e/can5C2-01.ts:37 | Correction « $16 \times (100+1) = 16 \times 100 + 16 \times 101$ » (101 au lieu de 1) ; résultat mis en évidence sans séparateur (⟦1616⟧). → ${a * b} \\times 100 + ${a * b} \\times 1 ; texNombre(a * b * 101) | ×1 |
| can6a-2018 (CAN) | src/exercices/can/6e/can6a-2018.ts:580 | Q15 : la question demande le nombre de fleurs par bouquet, la correction parle du nombre de bouquets (« le fleuriste pourra composer $7$ bouquets identiques »). → Le nombre de ${fleurs} par bouquet est donné par la division de $a$ par $b$ … Chaque bouquet contient $⟦k⟧$ ${fleurs}. | ×1 |
| can6a-NY2024 (CAN) | src/exercices/can/6e/CANSpeciale2024.ts:767 | Q20 : même erreur que canc3a-NY2024 Q26 (« une graduation correspond donc à $8$ unités » avec $4$ intervalles, réponse $2\,018$). → Voir CANSpeciale2024.ts:767. | ×1 |
| can6a-NY2025 (CAN) | src/exercices/can/canNY-2025/can6NY-2025-Q20.ts:60 | Q20 (cas 4) : « Le produit dans la parenthèse est égal à $200$ » pour $2\times 1\,000$ (2 000, comme l'indique l'accolade juste après). → …est égal à $2\,000$. | ×1 |
| canc3a-NY2024 (CAN) | src/exercices/can/6e/CANSpeciale2024.ts:767 | Q26 : « il y a $4$ intervalles. Une graduation correspond donc à $8$ unités » : le 8 est écrit en dur alors qu'avec 4 intervalles entre 2 000 et 2 024 une graduation vaut 6 (réponse 2 006 juste, explication fausse). → Une graduation correspond donc à $${texNombre(24 / nbIntervalles)}$ unités. | ×1 |
| canc3a-NY2025 (CAN) | src/exercices/can/canNY-2025/canc3NY-2025-Q8.ts:63 | Q8 : quand l'écart vaut 5 (2 020 à 2 025, 5 intervalles), la correction écrit « $5 \div 5 = 5$ » et « Une graduation correspond donc à $5$ unités » : valeur écrite en dur, juste seulement pour l'écart 25. → $${texNombre(abs1 - abs0)} \\div 5 = ${choix ? 5 : 1}$ (modèle : canc3NY-2026-Q8, variable pas) | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q2.ts:69 | Q2 : la correction dit « Pour passer des mm au m, on multiplie par 1 000 » (et « des cm au m, on multiplie par 100 ») : c'est l'inverse, on divise (ou : pour passer des m aux mm, on multiplie). → Pour passer des $\text{m}$ aux $\text{mm}$, on multiplie par $1\,000$. | ×1 |

## X1

**Erreur ou exception** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6M2-03 (CAN) |  | non interactif : page.evaluate: Target page, context or browser has been closed | ×1 ; sup=3 sup2=true sup3=4 sup4=1 (revue-57-a) |
| can6M2-03 (CAN) |  | génération : page.evaluate: Target page, context or browser has been closed | ×30 ; sup=3 sup2=true sup3=4 sup4=1 ; sup=3 sup2=true sup3=4 sup4=2… (revue-57-b) |
| can6N21-02 (CAN) |  | non interactif : page.evaluate: Target page, context or browser has been closed | ×1 ; sup=3-4 sup2=1 nb=10 (revue-32-a) |
| can6N21-03 (CAN) |  | non interactif : page.evaluate: Target page, context or browser has been closed | ×1 ; sup=5-6 sup2=1 nb=10 (revue-32-a) |
| can6N21-04 (CAN) |  | arrêt : page.evaluate: Target page, context or browser has been closed | ×1 |
| can6N21-04 (CAN) |  | génération : page.evaluate: TypeError: Cannot read properties of undefined (reading 'preparer')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:21)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×55 ; sup=1 sup2=2 ; sup=1 sup2=3… (revue-5-a) |
| can6N21-05 (CAN) |  | arrêt : page.evaluate: Target page, context or browser has been closed | ×1 |
| can6N21-06 (CAN) |  | arrêt : page.evaluate: Target page, context or browser has been closed | ×1 |
| can6N22-01 (CAN) |  | génération : page.evaluate: TypeError: Cannot read properties of undefined (reading 'preparer')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:21)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 ; défaut nb=10 (revue-1-a) |
| can6N22-02 (CAN) |  | non interactif : page.evaluate: TypeError: Cannot read properties of undefined (reading 'preparer')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:21)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 ; sup=true (revue-0-a) |
| can6N22-02 (CAN) |  | génération : page.evaluate: TypeError: Cannot read properties of undefined (reading 'preparer')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:21)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×4 ; sup=true ; sup=false… (revue-0-b) |
| can6N22-03 (CAN) |  | arrêt : page.evaluate: TypeError: Cannot read properties of undefined (reading 'langue')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:24)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 |
| can6N22-04 (CAN) |  | arrêt : page.evaluate: TypeError: Cannot read properties of undefined (reading 'langue')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:24)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 |
| can6N3-01 (CAN) |  | arrêt : page.evaluate: TypeError: Cannot read properties of undefined (reading 'langue')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:24)     at UtilityScript.evaluate (&lt;anonymous>:305:16)     at UtilityScript.&lt;anonymous> (&lt;anonymous>:1:44) | ×1 |

## X2

**Formule cassée (KaTeX, $)** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-2025 (CAN) | énoncé q14 | nombre impair de $ : ue de nombres&nbsp;: $75$&nbsp;; $150$&nbsp;; $225$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m | ×1 ; sup=false (revue-0-a) |
| can5D-01 (CAN) | correction q1 | « $ » visible : 1. 45 45 min = 45 60 = 60 45 ​ h = 3 4 = 4 3 ​ h = =0,75$ h. Ainsi, 2 2 h 45 45 min = = 2 , 75 2,75 h. | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| can5D-01 (CAN) | correction q1 | nombre impair de $ : nsi, $2$ h $45$ min $=$ ${\color{#F15929}\boldsymbol{2,75}}$ h. | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can5D-01 (CAN) | correction q4 | nombre impair de $ : insi, $5$ h $30$ min $=$ ${\color{#F15929}\boldsymbol{5,5}}$ h. | ×2 ; défaut nb=10 (revue-1-a) |

## X3

**undefined, NaN…** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2023 (CAN) | énoncé non interactif q11 | que Zacharie. Combien de billes a Zacharie&nbsp;? [object Object] | ×1 |

## X4

**Question en double ou vide** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-2020 (CAN) | src/exercices/can/5e/can5a-2020.ts:861 | Q18 (conversion d'heures décimales) : en interactif, la correction reste « cas non traité » (texteCorr n'est écrit que dans la branche non interactive). → Écrire texteCorr avant le if (this.interactif). | ×1 |
| can6a-Aléa (CAN) | série q1 | correction vide | ×18 ; sup=All ; sup=All nb=10 (revue-0-a) |

## X6

**Même graine, exercice différent** (gravité 2 : Rendu cassé)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6S-01 (CAN) |  | même graine, énoncés différents (aléa hors nouvelleVersion ?) | ×1 ; défaut (revue-0-a) |
| canCE2a-2025 (CAN) |  | même graine, énoncés différents (aléa hors nouvelleVersion ?) | ×1 ; sup=false (revue-0-a) |

## C1

**Contenu mathématique faux ou ambigu** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4G2-03 (CAN) | src/exercices/can/4e/can4G2-03.ts:125 | Correction « Le triangle $ILK$ est un agrandissement du triangle $ILK$ » : le même triangle deux fois (le petit triangle est $IJM$) ; lignes 125 et 194. → …agrandissement du triangle $${nom[0]}${nom[1]}${nom[4]}$ | ×1 |
| can5a-2020 (CAN) | src/exercices/can/5e/can5a-2020.ts:817 | Q17 : quand a×5=100, la correction écrit « $10\times b$ soit $5b$ » (facteur 10 au lieu de 5) ; « de couleurs marron » (couleur), répété lignes 811 à 829. → $5\times ${b}$ soit $${5 * b}$ sont de couleur marron | ×1 |
| can5a-2021 (CAN) | src/exercices/can/5e/can5a-2021.ts:415 | Q8 : l'énoncé donne $2\times 10\,000$, la correction recopie $2\times 1\,000$ puis trouve $20\,000$. → ${texNombre(a)}\\times ${texNombre(10000)} | ×1 |
| can5a-2022 (CAN) | src/exercices/can/5e/can5a-2022.ts:641 | Q13 : la correction commence par « $0,3\times 6=$ » au lieu de « $0,3\times 600=$ » (${b} au lieu de ${b * 100}). → $${texNombre(a / 10, 1)}\\times ${b * 100}=…$ | ×1 |
| can5C3-03 (CAN) | src/exercices/can/5e/can5C3-03.ts:43 | Explication : « la partie décimale de $3,59$ » au lieu de $1,59$ (a + d2/10 + c2/100 au lieu de b + …), et bloc « Mentalement » en orange (texteEnCouleur sans couleur). → texNombre(b + d2 / 10 + c2 / 100, 2) ; texteEnCouleur(…, bleuMathalea) | ×1 |
| can6a-2026 (CAN) | src/exercices/can/can6a-2026/can6a-2026-Q18.ts:39 | Q18 : « La moitié de $116$ dixièmes est $58$. » (il manque « dixièmes » : 58 ≠ 5,8) ; « $5{,}8$ unités » (accord, pluriel dès 2). Mêmes Q5, Q11 (pointillés en correction), Q30 (« partager en 10 ») que canc3a-2026. → La moitié de $116$ dixièmes est $58$ dixièmes. | ×1 |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts:582 | Q11 : correction « Puisque Zoé en a 3 de plus, sa sœur en a 3 de moins » : l'autre enfant (Zacharie…) n'est pas forcément une sœur ; double espace « en  a », espace avant « : ». → Puisque ${prenom1} en a $b$ de plus, ${prenom2} en a $b$ de moins, soit : | ×1 |
| canc3C07 (CAN) | src/exercices/can/c3/canc3C07.ts:107 | Correction inversée (branche « prenom2 a b ans de moins que prenom1 ») : énoncé « Nawel a $2$ ans de moins que Gaspard », correction « Gaspard a $2$ ans de moins que Nawel. Il a donc… » (prénoms échangés ; « Il » pour une fille possible). → ${prenom2} a $b$ ans de moins que ${prenom1}. ${prenom2} a donc… | ×1 |

## M1

**Valeur mise en évidence refusée par le champ** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2023 (CAN) |  q14 mathlive | valeur en évidence refusée par le champ : ["3","5"] ; attendu : {"champ":"3;5"} | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) |  q16 mathlive | valeur en évidence refusée par le champ : ["11","14"] ; attendu : {"champ":"\\dfrac{11}{14}"} | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) |  q23 mathlive | valeur en évidence refusée par le champ : ["16","x","11"] ; attendu : {"champ":"16x+11"} | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) |  q26 mathlive | valeur en évidence refusée par le champ : ["1","30"] ; attendu : {"champ":"1 h 30 min"} | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) |  q23 mathlive | valeur en évidence refusée par le champ : ["11","a","9"] ; attendu : {"champ":"11a+9"} | ×1 ; sup2=false (revue-0-b) |
| can4a-2023 (CAN) |  q23 mathlive | valeur en évidence refusée par le champ : ["16","y","7"] ; attendu : {"champ":"16y+7"} | ×1 ; sup2=true (revue-1-a) |
| can4a-2023 (CAN) | src/exercices/can/4e/can4a-2023.ts | Q23 : expression réduite mise en évidence en quatre morceaux (⟦16⟧⟦x⟧ ⟦+⟧ ⟦11⟧) ; Q28 : « revient à prendre $1\times 10\,\%$ de $800$ » (explication inutile pour 10 %). → ⟦16x+11⟧ | ×1 |
| can4a-2024 (CAN) |  q28 mathlive | valeur en évidence refusée par le champ : ["5","24"] ; attendu : {"champ":"5 h 24 min"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| can4a-2026 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["30^\\circ"] ; attendu : {"champ":"30"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2024 (CAN) |  q10 mathlive | valeur en évidence refusée par le champ : ["21","3"] ; attendu : {"champ":"21 h 03 min"} | ×3 ; défaut (revue-0-a) |
| can4C21-06 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["-2 > -\\dfrac{19}{9}."] ; attendu : {"champ":"-2"} | ×8 ; défaut ; défaut nb=10 (revue-0-a) |
| can4C21-06 (CAN) |  q2 mathlive | valeur en évidence refusée par le champ : ["-\\dfrac{8}{9} > -1."] ; attendu : {"champ":"-\\dfrac{8}{9}"} | ×4 ; défaut nb=10 (revue-1-a) |
| can5a-2020 (CAN) |  q7 mathlive | valeur en évidence refusée par le champ : ["21","15"] ; attendu : {"champ":"21 h 15 min"} | ×2 ; sup= (revue-0-a) |
| can5a-2020 (CAN) |  q26 mathlive | valeur en évidence refusée par le champ : ["1,5"] ; attendu : {"champ":"\\dfrac{15}{10}"} | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) |  q17 mathlive | valeur en évidence refusée par le champ : ["-1","4"] ; attendu : {"champ":"\\dfrac{-1}{4}"} | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) |  q18 mathlive | valeur en évidence refusée par le champ : ["-13,99","-13,98"] ; attendu : {"champ":"-13,99;-13,98"} | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) |  q20 mathlive | valeur en évidence refusée par le champ : ["23","15"] ; attendu : {"champ":"23 h 15 min"} | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) |  q26 mathlive | valeur en évidence refusée par le champ : ["9","23"] ; attendu : {"champ":"\\dfrac{9}{23}"} | ×4 ; sup= (revue-0-a) |
| can5a-2022 (CAN) |  q16 mathlive | valeur en évidence refusée par le champ : ["37"] ; attendu : {"champ":"37\\operatorname{cm}"} | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) |  q29 mathlive | valeur en évidence refusée par le champ : ["64\\pi"] ; attendu : {"champ":"64"} | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) |  q17 mathlive | valeur en évidence refusée par le champ : ["\\dfrac{1}{-4,9}"] ; attendu : {"champ":"\\dfrac{10}{-49}"} | ×3 ; sup2=false ; sup2=true (revue-0-b) |
| can5a-2023 (CAN) |  q26 mathlive | valeur en évidence refusée par le champ : ["4","30"] ; attendu : {"champ":"4 h 30 min"} | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2026 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["11","00"] ; attendu : {"champ":"11 h"} | ×1 ; sup=false (revue-0-a) |
| can5a-2026 (CAN) |  q19 mathlive | valeur en évidence refusée par le champ : ["55^\\circ"] ; attendu : {"champ":"55"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-2026 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["15","30"] ; attendu : {"champ":"15 h 30 min"} | ×3 ; sup=false ; sup=true (revue-0-b) |
| can5a-CoopMaths (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["2\\text{ h }18\\text{ min}"] ; attendu : {"champ":"2h18min"} | ×4 ; sup=31 ; sup=6 (revue-0-a) |
| can5a-CoopMaths (CAN) |  q25 mathlive | valeur en évidence refusée par le champ : ["147\\text{ dm}"] ; attendu : {"champ":"147\\operatorname{dm}"} | ×3 ; sup=31 ; sup=25 (revue-0-a) |
| can5a-CoopMaths (CAN) |  q27 mathlive | valeur en évidence refusée par le champ : ["75"] ; attendu : {"champ":"75\\operatorname{km}"} | ×1 ; sup=31 (revue-0-a) |
| can5a-CoopMaths (CAN) |  q30 mathlive | valeur en évidence refusée par le champ : ["48"] ; attendu : {"champ":"48€"} | ×1 ; sup=31 (revue-0-a) |
| can5a-CoopMaths (CAN) |  q25 mathlive | valeur en évidence refusée par le champ : ["113\\text{ m}"] ; attendu : {"champ":"113\\operatorname{m}"} | ×1 ; sup=31 (revue-0-b) |
| can5a-CoopMaths (CAN) |  q27 mathlive | valeur en évidence refusée par le champ : ["146.25"] ; attendu : {"champ":"146,25\\operatorname{km}"} | ×3 ; sup=31 ; sup=27 (revue-0-b) |
| can5a-CoopMaths (CAN) |  q30 mathlive | valeur en évidence refusée par le champ : ["9,60"] ; attendu : {"champ":"9,60€"} | ×3 ; sup=31 ; sup=30 (revue-0-b) |
| can5a-NY2024 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["21","6"] ; attendu : {"champ":"21 h 06 min"} | ×4 ; défaut (revue-0-a) |
| can5C4-02 (CAN) |  q10 mathlive | valeur en évidence refusée par le champ : ["12,135"] ; attendu : {"champ":"12.135000000000002"} | ×1 ; défaut nb=10 (revue-1-a) |
| can5D-01 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["4","45"] ; attendu : {"champ":"4 h 45 min"} | ×7 ; défaut ; défaut nb=10 (revue-0-b) |
| can5D-02 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["4","45"] ; attendu : {"champ":"4 h 45 min"} | ×6 ; défaut ; défaut nb=10 (revue-0-b) |
| can6a-2018 (CAN) |  q5 mathlive | valeur en évidence refusée par le champ : ["4","40"] ; attendu : {"champ":"4 h 40 min"} | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) |  q9 mathlive | valeur en évidence refusée par le champ : ["4","5"] ; attendu : {"champ":"\\dfrac{4}{5}"} | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) |  q20 mathlive | valeur en évidence refusée par le champ : ["1","2"] ; attendu : {"champ":"1;2"} | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) |  q17 mathlive | valeur en évidence refusée par le champ : ["0,9"] ; attendu : {"champ":"\\dfrac{9}{10}"} | ×3 ; sup2=true ; sup2=false (revue-0-b) |
| can6a-2021 (CAN) |  q7 mathlive | valeur en évidence refusée par le champ : ["11","10"] ; attendu : {"champ":"11 h 10 min"} | ×2 ; défaut (revue-0-a) |
| can6a-2021 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["1","3"] ; attendu : {"champ":"\\dfrac{1}{3}"} | ×4 ; défaut (revue-0-a) |
| can6a-2022 (CAN) |  q12 mathlive | valeur en évidence refusée par le champ : ["1","40"] ; attendu : {"champ":"1 h 40 min"} | ×4 ; défaut (revue-0-a) |
| can6a-2022 (CAN) |  q20 mathlive | valeur en évidence refusée par le champ : ["0,2"] ; attendu : {"champ":"\\dfrac{1}{5}"} | ×2 ; défaut (revue-0-a) |
| can6a-2022 (CAN) |  q26 mathlive | valeur en évidence refusée par le champ : ["2\\text{ mm}"] ; attendu : {"champ":"2\\operatorname{mm}"} | ×1 ; défaut (revue-0-a) |
| can6a-2022 (CAN) |  q26 mathlive | valeur en évidence refusée par le champ : ["43\\text{ dm}"] ; attendu : {"champ":"43\\operatorname{dm}"} | ×1 ; défaut (revue-0-b) |
| can6a-2023 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["6","7","2","21","3","14","1","42"] ; attendu : {"champ":"6;7"} | ×2 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false (revue-0-a) |
| can6a-2023 (CAN) |  q7 mathlive | valeur en évidence refusée par le champ : ["1","10"] ; attendu : {"champ":"1 h 10 min"} | ×4 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) |  q9 mathlive | valeur en évidence refusée par le champ : ["251"] ; attendu : {"champ":"251\\operatorname{cm}"} | ×4 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) |  q16 mathlive | valeur en évidence refusée par le champ : ["4","18"] ; attendu : {"champ":"\\dfrac{4}{18}"} | ×8 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["3","6","2","9","1","18"] ; attendu : {"champ":"3;6"} | ×2 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-1-a) |
| can6a-2025 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["10","15"] ; attendu : {"champ":"10 h 15 min"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-CoopMaths (CAN) |  q2 mathlive | valeur en évidence refusée par le champ : ["11"] ; attendu : {"champ":"\\dfrac{11}{23}"} | ×59 ; sup=31 ; sup=2 (revue-0-a) |
| can6a-CoopMaths (CAN) |  q13 mathlive | valeur en évidence refusée par le champ : ["3","11"] ; attendu : {"champ":"3 h 11 min"} | ×62 ; sup=31 ; sup=13 (revue-0-a) |
| can6a-CoopMaths (CAN) |  q22 mathlive | valeur en évidence refusée par le champ : ["1,23\\text{ m}"] ; attendu : {"champ":"1.23"} | ×62 ; sup=31 ; sup=22 (revue-0-a) |
| can6a-CoopMaths (CAN) |  q25 mathlive | valeur en évidence refusée par le champ : ["181"] ; attendu : {"champ":"181\\operatorname{dm}"} | ×22 ; sup=31 ; sup=25 (revue-0-a) |
| can6a-CoopMaths (CAN) |  q30 mathlive | valeur en évidence refusée par le champ : ["9 €"] ; attendu : {"champ":"9"} | ×22 ; sup=31 ; sup=30 (revue-0-a) |
| can6a-CoopMaths (CAN) |  q25 mathlive | valeur en évidence refusée par le champ : ["100"] ; attendu : {"champ":"100\\operatorname{cm}"} | ×16 ; sup=31 ; sup=25 (revue-0-b) |
| can6a-CoopMaths (CAN) |  q3 mathlive | valeur en évidence refusée par le champ : ["82"] ; attendu : {"champ":"82\\operatorname{m}"} | ×24 ; sup=25 (revue-25-a) |
| can6a-CoopMaths (CAN) |  q2 mathlive | valeur en évidence refusée par le champ : ["10,80 €"] ; attendu : {"champ":"10.799999999999999"} | ×40 ; sup=30 (revue-30-a) |
| can6a-NY2024 (CAN) |  q2 mathlive | valeur en évidence refusée par le champ : ["21","6"] ; attendu : {"champ":"21 h 06 min"} | ×2 ; défaut (revue-0-b) |
| can6C52-05 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["\\dfrac{19}{9} > 2."] ; attendu : {"champ":"\\dfrac{19}{9}"} | ×8 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C52-05 (CAN) |  q2 mathlive | valeur en évidence refusée par le champ : ["1 > \\dfrac{8}{9}."] ; attendu : {"champ":"1"} | ×4 ; défaut nb=10 (revue-1-a) |
| can6D1-02 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["3\\text{~min~}54\\text{~s}"] ; attendu : {"champ":"03 min 54 s"} | ×3 ; sup=2 ; sup=3 (revue-1-a) |
| can6D1-06 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["3\\text{~min~}53\\text{~s}"] ; attendu : {"champ":"03 min 53 s"} | ×12 ; défaut ; défaut nb=10 (revue-0-a) |
| can6G1-03 (CAN) |  q1 multi-mathfield | valeur en évidence refusée par le champ : {"champ1":"8"} ; attendu : {"champ1":"23"} | ×10 ; sup=1 sup2=1 sup3=true ; sup=2 sup2=1 sup3=true… (revue-1-a) |
| can6G1-03 (CAN) |  q1 multi-mathfield | valeur en évidence refusée par le champ : {"champ1":"46","champ2":"0"} ; attendu : {"champ1":"34","champ2":"19"} | ×10 ; sup=1 sup2=2 sup3=true ; sup=2 sup2=2 sup3=true… (revue-2-a) |
| can6G1-03 (CAN) |  q1 multi-mathfield | valeur en évidence refusée par le champ : {"champ1":"31","champ2":"16","champ3":"34"} ; attendu : {"champ1":"40","champ2":"4","champ3":"14"} | ×10 ; sup=1 sup2=3 sup3=true ; sup=2 sup2=3 sup3=true… (revue-4-a) |
| canc3a-2023 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["6","7","2","21","3","14","1","42"] ; attendu : {"champ":"6;7"} | ×1 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q7 mathlive | valeur en évidence refusée par le champ : ["1","25"] ; attendu : {"champ":"1 h 25 min"} | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q9 mathlive | valeur en évidence refusée par le champ : ["30"] ; attendu : {"champ":"30\\operatorname{cm}"} | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["59","2"] ; attendu : {"champ":"59;2"} | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q16 mathlive | valeur en évidence refusée par le champ : ["2","10"] ; attendu : {"champ":"\\dfrac{2}{10}"} | ×4 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["5","7","1","35"] ; attendu : {"champ":"5;7"} | ×1 ; défaut (revue-0-b) |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts | Q16, Q19 : fraction réponse mise en évidence en deux morceaux (numérateur et dénominateur séparés $\dfrac{⟦2⟧}{⟦10⟧}$) : la valeur saisie attendue n'apparaît pas comme une seule mise en évidence. → miseEnEvidence('\\dfrac{2}{10}') | ×1 |
| canc3a-2025 (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["10","15"] ; attendu : {"champ":"10 h 15 min"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) |  q6 mathlive | valeur en évidence refusée par le champ : ["10","15"] ; attendu : {"champ":"10 h 15 min"} | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2024 (CAN) |  q15 mathlive | valeur en évidence refusée par le champ : ["21","12"] ; attendu : {"champ":"21 h 12 min"} | ×1 ; défaut (revue-0-b) |
| canc3D01 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["2","25"] ; attendu : {"champ":"2h 25"} | ×13 ; sup=false ; sup=true… (revue-0-a) |
| canc3D01 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["11",""] ; attendu : {"champ":"11h 0"} | ×1 ; sup=false nb=10 (revue-2-a) |
| canc3M01 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["\\text{ dg }"] ; attendu : {"champ":"dg"} | ×1 ; défaut (revue-0-a) |
| canc3M01 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["\\text{ dag }"] ; attendu : {"champ":"dag"} | ×1 ; défaut (revue-0-b) |
| canc3M01 (CAN) |  q1 mathlive | valeur en évidence refusée par le champ : ["\\text{ hm }"] ; attendu : {"champ":"hm"} | ×2 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q2 mathlive | valeur en évidence refusée par le champ : ["\\text{ dL }"] ; attendu : {"champ":"dL"} | ×1 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q3 mathlive | valeur en évidence refusée par le champ : ["\\text{ kg }"] ; attendu : {"champ":"kg"} | ×1 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q4 mathlive | valeur en évidence refusée par le champ : ["\\text{ cg }"] ; attendu : {"champ":"cg"} | ×1 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q5 mathlive | valeur en évidence refusée par le champ : ["\\text{ mL }"] ; attendu : {"champ":"mL"} | ×1 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q7 mathlive | valeur en évidence refusée par le champ : ["\\text{ km }"] ; attendu : {"champ":"km"} | ×2 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q8 mathlive | valeur en évidence refusée par le champ : ["\\text{ mg }"] ; attendu : {"champ":"mg"} | ×1 ; défaut nb=10 (revue-1-a) |
| canc3M01 (CAN) |  q9 mathlive | valeur en évidence refusée par le champ : ["\\text{ cL }"] ; attendu : {"champ":"cL"} | ×1 ; défaut nb=10 (revue-1-a) |

## M2

**Unité dans miseEnEvidence** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 10FA2C-3 (10e) | src/exercices/ch/echellesCartes.ts:153 | unité dans miseEnEvidence : `${texNombre(dReelleKm, 3)}\\,\\text{km}` | ×1 |
| 10FA2C-3 (10e) | src/exercices/ch/echellesCartes.ts:186 | unité dans miseEnEvidence : `${texNombre(dCarte, 3)}\\,\\text{cm}` | ×1 |
| 1A-C15-5 (1e) | src/exercices/1e/1A-C15-5.ts:119 | unité dans miseEnEvidence : bonneReponse === coutCentimesAvecUnites ? `${texNombre(coutCentimes, 0)}\\,\\text{centime${coutCentimes > 1 ? 's' : ''} d'euro}`  | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:337 | unité dans miseEnEvidence : `${abVal + bdVal}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:338 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal}}\\text{ cm}` ‖ unité dans miseEnEvidence : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}` | ×2 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:341 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}` ‖ unité dans miseEnEvidence : `${racineExtraite2[0]}${racineExtraite2[1] === 1 ? '' : `\\sqrt{${racineExtraite2[1]}}`}\\text{ cm}` | ×2 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:344 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal + abVal * abVal}}\\text{ cm}` ‖ unité dans miseEnEvidence : `${racineExtraite3[0]}${racineExtraite3[1] === 1 ? '' : `\\sqrt{${racineExtraite3[1]}}`}\\text{ cm}` | ×2 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:374 | unité dans miseEnEvidence : `${abVal}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:387 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:388 | unité dans miseEnEvidence : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:397 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:398 | unité dans miseEnEvidence : `${racineExtraite2[0]}${racineExtraite2[1] === 1 ? '' : `\\sqrt{${racineExtraite2[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:406 | unité dans miseEnEvidence : `\\sqrt{${abVal * abVal + abVal * bdVal}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:407 | unité dans miseEnEvidence : `${racineExtraite3[0]}${racineExtraite3[1] === 1 ? '' : `\\sqrt{${racineExtraite3[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:434 | unité dans miseEnEvidence : `${bdVal}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:448 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:449 | unité dans miseEnEvidence : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:458 | unité dans miseEnEvidence : `\\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:459 | unité dans miseEnEvidence : `${racineExtraite2[0]}${racineExtraite2[1] === 1 ? '' : `\\sqrt{${racineExtraite2[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:467 | unité dans miseEnEvidence : `\\sqrt{${abVal * abVal + abVal * bdVal}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:468 | unité dans miseEnEvidence : `${racineExtraite3[0]}${racineExtraite3[1] === 1 ? '' : `\\sqrt{${racineExtraite3[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:485 | unité dans miseEnEvidence : `\\sqrt{${a * a - abVal * abVal}}\\text{ cm}` ‖ unité dans miseEnEvidence : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}` | ×2 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:486 | unité dans miseEnEvidence : bdVal.texFractionSimplifiee + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:487 | unité dans miseEnEvidence : edVal.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:488 | unité dans miseEnEvidence : bdVal.ajouteEntier(abVal).texFractionSimplifiee + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:512 | unité dans miseEnEvidence : `\\sqrt{${aeVal * aeVal + edVal * edVal}}\\text{ cm}` ‖ unité dans miseEnEvidence : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}` | ×2 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:513 | unité dans miseEnEvidence : ebCarreVal.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:516 | unité dans miseEnEvidence : ebCarreVal.produitFraction(ebCarreVal).diviseFraction(abCarreVal).simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:541 | unité dans miseEnEvidence : `\\sqrt{${adVal * adVal - aeVal * aeVal}}\\text{ cm}` ‖ unité dans miseEnEvidence : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}` | ×2 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:542 | unité dans miseEnEvidence : ebValCarre.texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:544 | unité dans miseEnEvidence : abValCarre.texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:545 | unité dans miseEnEvidence : bdValCarre.texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:581 | unité dans miseEnEvidence : `\\sqrt{${aeCarre}}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:582 | unité dans miseEnEvidence : `${aeSimpl[0]}${aeSimpl[1] === 1 ? '' : `\\sqrt{${aeSimpl[1]}}`}\\text{ cm}` | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:587 | unité dans miseEnEvidence : ebValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:591 | unité dans miseEnEvidence : abValCarre.texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:624 | unité dans miseEnEvidence : new FractionEtendue(abValCarre, 1).texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:625 | unité dans miseEnEvidence : bdValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:626 | unité dans miseEnEvidence : edValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:627 | unité dans miseEnEvidence : adVal + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:653 | unité dans miseEnEvidence : new FractionEtendue(bdValCarre, 1).texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:654 | unité dans miseEnEvidence : abValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:655 | unité dans miseEnEvidence : aeValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:656 | unité dans miseEnEvidence : adVal + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:681 | unité dans miseEnEvidence : new FractionEtendue(aeValCarre, 1).texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:682 | unité dans miseEnEvidence : bdValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:683 | unité dans miseEnEvidence : edValCarre.simplifie().texRacineCarree() + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:684 | unité dans miseEnEvidence : adVal + '\\text{ cm}' | ×1 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:706 | unité dans miseEnEvidence : new FractionEtendue(edCarreVal, 1).texRacineCarree() + '\\text{ cm}' ‖ unité dans miseEnEvidence : abCarreVal.simplifie().texRacineCarree() + '\\text{ cm}' ‖ unité dans miseEnEvidence : aeCarreVal.simplifie().texRacineCarree() + '\\text{ cm}' | ×4 |
| 1mG3-6 (1re Collège) | src/exercices/ch/1mG3-6.ts:729 | unité dans miseEnEvidence : ebCarreVal.simplifie().texRacineCarree() + '\\text{ cm}' ‖ unité dans miseEnEvidence : abCarreVal.simplifie().texRacineCarree() + '\\text{ cm}' ‖ unité dans miseEnEvidence : aeCarreVal.simplifie().texRacineCarree() + '\\text{ cm}' | ×4 |
| 2A-G3-1 (2e) | src/exercices/1e/1A-G02-1.ts:115 | unité dans miseEnEvidence : `${perimetreEnCm}\\text{ cm}` | ×1 |
| 2A-G3-10 (2e) | src/exercices/1e/1A-G02-10.ts:77 | unité dans miseEnEvidence : `${texNombre(coefficientVolume)}\\pi\\text{ cm}^3` | ×1 |
| 2A-G3-11 (2e) | src/exercices/1e/1A-G02-11.ts:171 | unité dans miseEnEvidence : `${texNombre(coefficientVolume)}\\pi\\text{ cm}^3` | ×1 |
| 2A-G3-12 (2e) | src/exercices/1e/1A-G02-12.ts:81 | unité dans miseEnEvidence : `${texNombre(volume)}\\text{ cm}^3` | ×1 |
| 2A-G3-13 (2e) | src/exercices/1e/1A-G02-13.ts:168 | unité dans miseEnEvidence : `${texNombre(volume)}\\text{ cm}^3` | ×1 |
| 2A-G3-14 (2e) | src/exercices/1e/1A-G02-14.ts:95 | unité dans miseEnEvidence : `${coefficientVolume}\\pi\\text{ cm}^3` | ×1 |
| 2A-G3-2 (2e) | src/exercices/1e/1A-G02-2.ts:109 | unité dans miseEnEvidence : `${aireEnCm2}\\text{ cm}^2` | ×1 |
| 2A-G3-3 (2e) | src/exercices/1e/1A-G02-3.ts:117 | unité dans miseEnEvidence : `${aireEnCm2}\\text{ cm}^2` | ×1 |
| 2A-G3-4 (2e) | src/exercices/1e/1A-G02-4.ts:117 | unité dans miseEnEvidence : `${diametre}\\pi\\text{ cm}` | ×1 |
| 2A-G3-4 (2e) | src/exercices/1e/1A-G02-4.ts:119 | unité dans miseEnEvidence : `${diametre}\\pi\\text{ cm}` | ×1 |
| 2A-G3-5 (2e) | src/exercices/1e/1A-G02-5.ts:103 | unité dans miseEnEvidence : `${coefficientAire}\\pi\\text{ cm}^2` | ×1 |
| 2A-G3-6 (2e) | src/exercices/1e/1A-G02-6.ts:122 | unité dans miseEnEvidence : `${texNombre(aire)}\\text{ cm}^2` | ×1 |
| 2A-G3-7 (2e) | src/exercices/1e/1A-G02-7.ts:74 | unité dans miseEnEvidence : `${texNombre(aireEnM2)}\\text{ m}^2` | ×1 |
| 2A-G3-8 (2e) | src/exercices/1e/1A-G02-8.ts:79 | unité dans miseEnEvidence : `${coefficientVolume}\\pi\\text{ cm}^3` | ×1 |
| 2A-G3-9 (2e) | src/exercices/1e/1A-G02-9.ts:162 | unité dans miseEnEvidence : `${coefficientVolume}\\pi\\text{ cm}^3` | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:35 | unité dans miseEnEvidence : '0,1\\text{ km}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:56 | unité dans miseEnEvidence : '0,1\\text{ km}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:63 | unité dans miseEnEvidence : '0,05\\text{ dm}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:74 | unité dans miseEnEvidence : '17\\text{ dm}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:86 | unité dans miseEnEvidence : '30\\text{ dam}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:97 | unité dans miseEnEvidence : '800\\,000\\text{ m}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:108 | unité dans miseEnEvidence : '0,4\\text{ dam}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:119 | unité dans miseEnEvidence : '0,15\\text{ m}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:126 | unité dans miseEnEvidence : '0,1\\text{ m}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:138 | unité dans miseEnEvidence : '320\\text{ km/h}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:175 | unité dans miseEnEvidence : '0,15\\text{ kg}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:186 | unité dans miseEnEvidence : '70\\,000\\text{ g}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:193 | unité dans miseEnEvidence : '1,2\\text{ t}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:204 | unité dans miseEnEvidence : '0,006\\text{ kg}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:215 | unité dans miseEnEvidence : '0,25\\text{ kg}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:228 | unité dans miseEnEvidence : '0,33\\text{ L}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:239 | unité dans miseEnEvidence : '200\\,000\\text{ mL}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:248 | unité dans miseEnEvidence : '0,02\\text{ m}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:259 | unité dans miseEnEvidence : '0,06\\text{ kg}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:270 | unité dans miseEnEvidence : '2,5\\text{ dL}' | ×1 |
| 2A-N5-5 (2e) | src/exercices/1e/1A-C05-5.ts:281 | unité dans miseEnEvidence : '0,15\\text{ hm}' | ×1 |
| 2A-N7-3 (2e) | src/exercices/1e/1A-C07-3.ts:59 | unité dans miseEnEvidence : `${texNombre(5 * dist)}\\text{ km/h}` | ×1 |
| 2A-N7-3 (2e) | src/exercices/1e/1A-C07-3.ts:77 | unité dans miseEnEvidence : `${texNombre(vitesse, 2)}\\text{ km/h}` | ×1 |
| 2G34-8 (2e) | src/exercices/2e/2G34-8.ts:230 | unité dans miseEnEvidence : `${largeur}\\,\\text{m}` ‖ unité dans miseEnEvidence : `${longueur}\\,\\text{m}` | ×2 |
| 3AutoM07-2 (3e) | src/exercices/dnbAutomatismes/dnb-2026-06-asie-Q3.ts:41 | unité dans miseEnEvidence : `${texNombre(long * la * h, 1)}\\text{ cm}^3` | ×1 |
| 3AutoP01-2 (3e) | src/exercices/dnbAutomatismes/dnb-2026-06-centres-etrangers-Q6.ts:41 | unité dans miseEnEvidence : `${texNombre(distance, Number.isInteger(distance) ? 0 : 1)}\\text{ km}` | ×1 |
| 3AutoP02-3 (3e) | src/exercices/3e/3AutoP06.ts:81 | unité dans miseEnEvidence : `${hour > 0 ? `${hour}\\text{h }` : ''}${minute}\\text{min}` | ×2 |
| 3AutoP04 (3e) | src/exercices/dnbAutomatismes/dnb-2026-06-centres-etrangers-Q9.ts:219 | unité dans miseEnEvidence : '4\\text{ h }30\\text{ min}' | ×2 |
| 3AutoP04 (3e) | src/exercices/dnbAutomatismes/dnb-2026-06-centres-etrangers-Q9.ts:221 | unité dans miseEnEvidence : formatDuree(duree).replace(' h', '\\text{ h }').replace(' min', '\\text{ min}') | ×2 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:504 | unité dans miseEnEvidence : `${taille}${sp()}\\text{m}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:609 | unité dans miseEnEvidence : `${texNombre(reponse)}${sp()}\\text{km}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:948 | unité dans miseEnEvidence : `${texNombre(taille - hauteur)}${sp()}\\text{m}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:952 | unité dans miseEnEvidence : `${texNombre(Math.round(taille))}${sp()}\\text{m}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:1279 | unité dans miseEnEvidence : `${Math.round(taille)}${sp()}\\text{m}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:1285 | unité dans miseEnEvidence : `${texNombre(Math.round(taille / Math.tan(((alpha + 5) * Math.PI) / 180)))}${sp()}\\text{m}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:1289 | unité dans miseEnEvidence : `${Math.round(taille)}${sp()}\\text{m}` ‖ unité dans miseEnEvidence : `${texNombre(Math.round(taille / Math.tan(((alpha + 5) * Math.PI) / 180)))}${sp()}\\text{m}` | ×2 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:1676 | unité dans miseEnEvidence : `${texNombre(Math.round(taille))}${sp()}\\text{m}` | ×1 |
| 3G32-0 (3e) | src/exercices/3e/3G32-0.ts:1789 | unité dans miseEnEvidence : `${texNombre(longueur(A, B), 1)}${sp()}\\text{cm}` | ×1 |
| 3P1QCM-2 (3e) | src/exercices/QCMBrevet/A2013/PJ13E1Q2.ts:35 | unité dans miseEnEvidence : `${m.toString()} \\text{ min } ${s.toString()} \\text{ s }` | ×2 |
| 3Z1DNB-07 (3e) | src/exercices/3e/3Z1DNB-07.ts:133 | unité dans miseEnEvidence : `${dk}\\text{ m}` | ×1 |
| 3Z1DNB-07 (3e) | src/exercices/3e/3Z1DNB-07.ts:145 | unité dans miseEnEvidence : `${da}\\text{ m}` | ×1 |
| 3Z1DNB-07 (3e) | src/exercices/3e/3Z1DNB-07.ts:147 | unité dans miseEnEvidence : `${dk + kj + (da - dj)}\\text{ m}` | ×1 |
| 3Z1DNB-08 (3e) | src/exercices/3e/3Z1DNB-08.ts:152 | unité dans miseEnEvidence : `${texNombre(volumeArrondi, 1)}\\text{ m}^3` | ×1 |
| 3Z1DNB-08 (3e) | src/exercices/3e/3Z1DNB-08.ts:155 | unité dans miseEnEvidence : `${texNombre(volumeRestant, 1)}\\text{ m}^3` | ×1 |
| 3Z1DNB-20 (3e) | src/exercices/3e/3Z1DNB-20.ts:157 | unité dans miseEnEvidence : `${duree.minute}~\\text{min}${ppcM % 60 === 0 ? '' : `~${duree.second}~\\text{s}`}` | ×2 |
| 4C2QCM-05 (4e) | src/exercices/QCMBrevet/A2021/AJ21E1Q6.ts:38 | unité dans miseEnEvidence : texNombre(l0, 0) + '\\text{ cm}' | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:162 | unité dans miseEnEvidence : texNombre(t1) + sp() + '\\text{s}',  | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:169 | unité dans miseEnEvidence : Math.round(f(t1 / 2)) + sp() + '\\text{m}' | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:293 | unité dans miseEnEvidence : texNombre(t1) + sp() + '\\text{m}' | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:296 | unité dans miseEnEvidence : Math.round(f(t1 / 2)) + sp() + '\\text{m}' | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:465 | unité dans miseEnEvidence : texNombre(30) + sp() + '\\text{min}' | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:466 | unité dans miseEnEvidence : texNombre(2 * v3) + sp() + '\\text{km}' | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:648 | unité dans miseEnEvidence : `${hmax}\\text{ h}` | ×1 |
| 4F12 (4e) | src/exercices/4e/4F12.ts:649 | unité dans miseEnEvidence : `${hmin}\\text{ h}` | ×1 |
| 4G22 (4e) | src/exercices/4e/4G22.ts:250 | unité dans miseEnEvidence : `\\text{ cm}` | ×1 |
| 4P10 (4e) | src/exercices/4e/4P10.ts:730 | unité dans miseEnEvidence : [ nbheures !== 0 ? `${texNombre(nbheures)}\\text{ h}` : '', nbminutes !== 0 ? `${texNombre(nbminutes)}\\tex | ×3 |
| 4P10 (4e) | src/exercices/4e/4P10.ts:966 | unité dans miseEnEvidence : [ nbheures !== 0 ? `${texNombre(nbheures)}\\text{ h}` : '', nbminutes !== 0 ? `${texNombre(nbminutes)}\\tex | ×3 |
| 4P10 (4e) | src/exercices/4e/4P10.ts:1282 | unité dans miseEnEvidence : `${texNombre( vMax / 3600, 0, )}\\text{ m}^3` | ×1 |
| 4P10 (4e) | src/exercices/4e/4P10.ts:1361 | unité dans miseEnEvidence : [ nbheures !== 0 ? `${nbheures} \\text{ h }` : '', nbminutes !== 0 ? `${nbminutes} \\text{ min }` : '', n | ×3 |
| 5G2C-1 (5e) | src/exercices/QCMBrevet/A2022/AN22E2Q5.ts:89 | unité dans miseEnEvidence : `${volume}\\text{ cm}^3` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:167 | unité dans miseEnEvidence : `${texNombre(resultat, 0)}${sp()}\\text{L}` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:185 | unité dans miseEnEvidence : `${texNombre(resultat, 0)}${sp()}\\text{L}` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:195 | unité dans miseEnEvidence : `${texNombre(resultat, 3)}${sp()}\\text{L}` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:205 | unité dans miseEnEvidence : `${texNombre(resultat, 6)}${sp()}\\text{L}` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:215 | unité dans miseEnEvidence : `${texNombre(resultat, 9)}${sp()}\\text{L}` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:225 | unité dans miseEnEvidence : `${texNombre(resultat, 3)}${sp()}\\text{dm}^3` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:235 | unité dans miseEnEvidence : `${texNombre(n.mul(1000))}${sp()}\\text{cm}^3` | ×1 |
| 5G2D-2 (5e) | src/exercices/5e/5G2D-2.ts:246 | unité dans miseEnEvidence : `${texNombre(resultat, 6)}${sp()}\\text{m}^3` | ×1 |
| 5G5D-1 (5e) | src/exercices/5e/5G5D-1.ts:234 | unité dans miseEnEvidence : texNombre((cotes[i] * hauteurs[i]) / 2) + '\\text{ cm}^2',  | ×1 |
| 6M4A (6e) | src/exercices/6e/6M4A.ts:89 | unité dans miseEnEvidence : `1~\\text{h}~${formatMinute(m1 + m2 - 60)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}` | ×3 |
| 6M4A (6e) | src/exercices/6e/6M4A.ts:101 | unité dans miseEnEvidence : `${h1 + h2 + 1}~\\text{h}~${formatMinute(m1 + m2 - 60)}~\\text{min}` | ×2 |
| 6M4A (6e) | src/exercices/6e/6M4A.ts:112 | unité dans miseEnEvidence : `${h1 + h2}~\\text{h}~${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}` | ×3 |
| 6M4A (6e) | src/exercices/6e/6M4A.ts:127 | unité dans miseEnEvidence : `1~\\text{h}~${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}~${formatMinute(s1 + s2 - 60)}~\\text{s}` | ×3 |
| 6M4A (6e) | src/exercices/6e/6M4A.ts:143 | unité dans miseEnEvidence : `${h1 + h2 + 1}~\\text{h}~${formatMinute(m1 + m2 - 60)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}` | ×3 |
| 6M4A (6e) | src/exercices/6e/6M4A.ts:161 | unité dans miseEnEvidence : `${h1 + h2 + 1}~\\text{h}~${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}~${formatMinute(s1 + s2 - 60)}~\\text{s}` | ×3 |
| 6M4autoE (6e) | src/exercices/6e/6M4autoE.ts:73 | unité dans miseEnEvidence : `${durees[choix][1]} \\text{h}` | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:78 | unité dans miseEnEvidence : `${texNombre(h * 60)}~\\text{min}` | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:85 | unité dans miseEnEvidence : `${texNombre(h * 3600)}~\\text{s}` | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:92 | unité dans miseEnEvidence : `${texNombre(m * 60)}~\\text{s}` | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:103 | unité dans miseEnEvidence : `${texNombre(h * 3600 + m * 60)}~\\text{s}` | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:119 | unité dans miseEnEvidence : `${j}~\\text{j}~${h}~\\text{h}` | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:147 | unité dans miseEnEvidence : `${h}~\\text{h}~${formatMinute(m)}~\\text{min}~${formatMinute(s)}~\\text{s}`,  | ×3 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:163 | unité dans miseEnEvidence : `${formatMinute(m)}~\\text{min}~${formatMinute(s)}~\\text{s}`,  | ×2 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:195 | unité dans miseEnEvidence : `${s}~\\text{semaines}~${j}~\\text{j}~${h}~\\text{h}`,  | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:207 | unité dans miseEnEvidence : `${s}~\\text{semaine}~${j}~\\text{j}~${h}~\\text{h}`,  | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:463 | unité dans miseEnEvidence : nb2 + '$\\text{ m}$' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:465 | unité dans miseEnEvidence : nb3 + '$\\text{ km}$' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:468 | unité dans miseEnEvidence : nb4 + '$\\text{ m}$' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:498 | unité dans miseEnEvidence : nb2 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:501 | unité dans miseEnEvidence : nb4 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:508 | unité dans miseEnEvidence : nb3 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:549 | unité dans miseEnEvidence : nb2 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:552 | unité dans miseEnEvidence : nb3 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:554 | unité dans miseEnEvidence : nb4 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1093 | unité dans miseEnEvidence : nb4 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1096 | unité dans miseEnEvidence : nb5 + '\\text{ cm}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1126 | unité dans miseEnEvidence : nb4 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1129 | unité dans miseEnEvidence : nb5 + '\\text{ cm}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1182 | unité dans miseEnEvidence : nb4 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1185 | unité dans miseEnEvidence : nb5 + '\\text{ cm}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1387 | unité dans miseEnEvidence : nb3 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1390 | unité dans miseEnEvidence : nb5 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1441 | unité dans miseEnEvidence : nb3 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1445 | unité dans miseEnEvidence : nb5 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1488 | unité dans miseEnEvidence : nb3 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1491 | unité dans miseEnEvidence : nb5 + '\\text{ km}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1562 | unité dans miseEnEvidence : nb1 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1609 | unité dans miseEnEvidence : nb1 + '\\text{ m}' | ×1 |
| 6N5-3 (6e) | src/exercices/6e/6N5-3.ts:1648 | unité dans miseEnEvidence : nb1 + '\\text{ m}' | ×1 |
| 6N5-4 (6e) | src/exercices/6e/6N5-4.ts:1324 | unité dans miseEnEvidence : '\\text{ km}', bleuMathalea | ×3 |
| 9ES1A-15 (9e) | src/exercices/5e/5G33-3.ts:102 | unité dans miseEnEvidence : `${texNombre(distancePointDroite(A, d), 1)}\\text{ cm}` | ×1 |
| can5a-CoopMaths (CAN) | src/exercices/can/5e/can5a-CoopMaths.ts:218 | unité dans miseEnEvidence : `${a}\\text{ h }${b}\\text{ min}` | ×2 |
| can6a-CoopMaths (CAN) | src/exercices/can/6e/can6a-CoopMaths.ts | Q30 : correction « $14,40 € - 5,40 € = ⟦9 €⟧$ » : symbole € dans la formule et dans miseEnEvidence alors que le champ attend le nombre seul ; Q22 : « ⟦1,23 m⟧ » (unité en évidence, unité déjà après le champ). → $14{,}40-5{,}40=⟦9⟧$ € | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:79 | unité dans miseEnEvidence : texNombre(a / 1000) + '\\text{ kg}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:111 | unité dans miseEnEvidence : texNombre(a * 1000) + '\\text{ g}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:143 | unité dans miseEnEvidence : texNombre(a * 100) + '\\text{ cm}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:172 | unité dans miseEnEvidence : texNombre(a / 100) + '\\text{ m}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:205 | unité dans miseEnEvidence : texNombre(a * 10) + '\\text{ mL}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:234 | unité dans miseEnEvidence : texNombre(a / 10) + '\\text{ cL}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:267 | unité dans miseEnEvidence : texNombre(a / 1000) + '\\text{ km}' | ×1 |
| can6M4-03 (CAN) | src/exercices/can/6e/can6M4-03.ts:297 | unité dans miseEnEvidence : texNombre(a * 1000) + '\\text{ m}' | ×1 |
| canc3D02 (CAN) | src/exercices/can/c3/canc3D02.ts:109 | unité dans miseEnEvidence : `${formatMinute(m2 - m1)}\\text{ min }` | ×1 |
| canc3D02 (CAN) | src/exercices/can/c3/canc3D02.ts:111 | unité dans miseEnEvidence : `1\\text{ h }${formatMinute(m2 - m1)}\\text{ min }` | ×2 |
| canc3D03 (CAN) | src/exercices/can/c3/canc3D03.ts:50 | unité dans miseEnEvidence : `${a + c}\\text{ h }${formatMinute(b + d)}\\text{ min}` | ×2 |
| canc3D03 (CAN) | src/exercices/can/c3/canc3D03.ts:52 | unité dans miseEnEvidence : `${1 + a + c}\\text{ h}` | ×1 |
| canc3D04 (CAN) | src/exercices/can/c3/canc3D04.ts:72 | unité dans miseEnEvidence : `${hour}\\text{ h }${formatMinute(minute)}` | ×1 |
| EgaliteFG3-4e-11 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG11.ts:309 | unité dans miseEnEvidence : '36{,}9\\text{°}' | ×1 |
| EgaliteFG4-3e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG12.ts:94 | unité dans miseEnEvidence : '3{,}844\\times 10^{8}\\text{ m}' | ×1 |
| EgaliteFG4-3e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG12.ts:137 | unité dans miseEnEvidence : '500\\,000\\text{ cm}^3' | ×1 |
| EgaliteFG4-3e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG12.ts:146 | unité dans miseEnEvidence : '0{,}5\\text{ m}^3' | ×1 |
| EgaliteFG4-3e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG12.ts:166 | unité dans miseEnEvidence : '1{,}048576\\times 10^{12}\\text{ km}^3' | ×1 |
| 6e/_Exercice_perimetres_et_aires.ts (hors référentiel) | src/exercices/6e/_Exercice_perimetres_et_aires.ts:623 | unité dans miseEnEvidence : texNombre(perimetreMin) + '\\text{ cm}', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(perimetreMax) + '\\text{ cm}', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(perimetreArrondi) + '\\text{ cm}' | ×3 |
| 6e/_Exercice_perimetres_et_aires.ts (hors référentiel) | src/exercices/6e/_Exercice_perimetres_et_aires.ts:625 | unité dans miseEnEvidence : texNombre(aireMin) + '\\text{ cm}^2', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(aireMax) + '\\text{ cm}^2', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(aireArrondie) + '\\text{ cm}^2' | ×3 |
| 6e/_Exercice_perimetres_et_aires.ts (hors référentiel) | src/exercices/6e/_Exercice_perimetres_et_aires.ts:725 | unité dans miseEnEvidence : texNombre(perimetreMin) + '\\text{ cm}', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(perimetreMax) + '\\text{ cm}', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(perimetreArrondi) + '\\text{ cm}' | ×3 |
| 6e/_Exercice_perimetres_et_aires.ts (hors référentiel) | src/exercices/6e/_Exercice_perimetres_et_aires.ts:727 | unité dans miseEnEvidence : texNombre(aireMin) + '\\text{ cm}^2', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(aireMax) + '\\text{ cm}^2', this.valeurArrondie ? bleuMathalea : orangeMathalea ‖ unité dans miseEnEvidence : texNombre(aireArrondie) + '\\text{ cm}^2' | ×3 |
| can/canNY-2025/can4NY-2025-Q17.ts (hors référentiel) | src/exercices/can/canNY-2025/can4NY-2025-Q17.ts:32 | unité dans miseEnEvidence : `${h + 1}\\text{ h } ${25 + k - 60}\\text{ min}` | ×2 |
| can/canNY-2026/can4NY-2026-Q17.ts (hors référentiel) | src/exercices/can/canNY-2026/can4NY-2026-Q17.ts:33 | unité dans miseEnEvidence : `${h + 1}\\text{ h } ${(annee % 100) + k - 60}\\text{ min}` | ×2 |
| 064b5 (Non classés) | src/exercices/EAMPremiere/EAM-FMnonSpe-2026-Q5.ts:54 | unité dans miseEnEvidence : texPrix(reponse) + '\\text{ €}' | ×1 |
| 064b5 (Non classés) | src/exercices/EAMPremiere/EAM-FMnonSpe-2026-Q5.ts:151 | unité dans miseEnEvidence : `${nombre}\\text{ €}` | ×1 |
| 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:57 | unité dans miseEnEvidence : `${texNombre(a * 10 + b, 0)}\\text{ cm}` | ×1 |
| 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:58 | unité dans miseEnEvidence : `${texNombre(c * 10, 0)}\\text{ cm}` | ×1 |
| 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:59 | unité dans miseEnEvidence : `${texNombre(2 * (a * 10 + b + c * 10), 0)}\\text{ cm}` | ×1 |
| ps261 (Non classés) | src/exercices/EAMPremiere/EAM-PolynesieSpe-2026-Q1.ts:43 | unité dans miseEnEvidence : `${texPrix(prixFinal)}\\text{ €}` | ×1 |

## M5

**Texte dans miseEnEvidence** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 1A-C15-5 (1e) | src/exercices/1e/1A-C15-5.ts:113 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 1A-C15-5 (1e) | src/exercices/1e/1A-C15-5.ts:119 | texte dans miseEnEvidence : \text{centime${coutCentimes > 1 ? 's' : ''} | ×1 |
| 1A-F02-8 (1e) | src/exercices/1e/1A-F02-8.ts:155 | texte dans miseEnEvidence : \text{et} | ×1 |
| 2A-N3-8 (2e) | src/exercices/1e/1A-C03-13.ts:116 | texte dans miseEnEvidence : \text{${uniteReponse} | ×1 |
| 2A-N3-8 (2e) | src/exercices/1e/1A-C03-13.ts:117 | texte dans miseEnEvidence : \text{${uniteReponse} | ×1 |
| 2A-N7-4 (2e) | src/exercices/1e/1A-C07-4.ts:48 | texte dans miseEnEvidence : \text{kWh} | ×1 |
| 2A-N7-5 (2e) | src/exercices/1e/1A-C07-5.ts:94 | texte dans miseEnEvidence : \text{${uniteAire} | ×1 |
| 2A-N7-6 (2e) | src/exercices/1e/1A-C07-6.ts:195 | texte dans miseEnEvidence : \text{${bonneUnite} | ×1 |
| 2F21-7 (2e) | src/exercices/2e/2F21-7.ts:197 | texte dans miseEnEvidence : \text{On change le signe de l'inégalité car} | ×1 |
| 2S20-12 (2e) | src/exercices/2e/2S20-12.ts:304 | texte dans miseEnEvidence : \text{${scenario.unite} | ×1 |
| 2S20-12 (2e) | src/exercices/2e/2S20-12.ts:308 | texte dans miseEnEvidence : \text{${scenario.unite} | ×1 |
| 2S20-12 (2e) | src/exercices/2e/2S20-12.ts:312 | texte dans miseEnEvidence : \text{${scenario.unite} | ×1 |
| 2S20-12 (2e) | src/exercices/2e/2S20-12.ts:321 | texte dans miseEnEvidence : \text{${scenario.unite} | ×1 |
| 3A1QCM-1 (3e) | src/exercices/QCMBrevet/A2023/MS23E1Q1.ts:41 | texte dans miseEnEvidence : \text{et} | ×1 |
| 3F1QCM-3 (3e) | src/exercices/3e/3F1QCM-3.ts:41 | texte dans miseEnEvidence : \text{est un antécédent de} ‖ texte dans miseEnEvidence : \text{par} | ×2 |
| 3F1QCM-3 (3e) | src/exercices/3e/3F1QCM-3.ts:42 | texte dans miseEnEvidence : \text{est l'image de} ‖ texte dans miseEnEvidence : \text{par} | ×2 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:150 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:151 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:169 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:170 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:213 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:214 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:232 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:233 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:276 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:277 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:295 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:296 | texte dans miseEnEvidence : \text{en} | ×1 |
| 3G42 (3e) | src/exercices/3e/3G42.ts:221 | texte dans miseEnEvidence : \text{${choixUnites} | ×1 |
| 3G4QCM-1 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q6.ts:56 | texte dans miseEnEvidence : \text{${hemi} ‖ texte dans miseEnEvidence : \text{${long} ‖ texte dans miseEnEvidence : \text{${ew} | ×3 |
| 3G4QCM-1 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q6.ts:57 | texte dans miseEnEvidence : \text{${lat} ‖ texte dans miseEnEvidence : \text{${hemi} ‖ texte dans miseEnEvidence : \text{${ew} | ×3 |
| 3L1QCM-02 (3e) | src/exercices/QCMBrevet/A2013/CEJ13E1Q1.ts:48 | texte dans miseEnEvidence : \text{et} | ×1 |
| 3L1QCM-08 (3e) | src/exercices/QCMBrevet/A2022/MS22E1Q4.ts:47 | texte dans miseEnEvidence : \text{et} | ×1 |
| 3L1QCM-09 (3e) | src/exercices/QCMBrevet/A2021/AJ21E1Q4.ts:34 | texte dans miseEnEvidence : \text{et} | ×1 |
| 3S2QCM-4 (3e) | src/exercices/QCMBrevet/A2022/AN22E2Q1.ts:71 | texte dans miseEnEvidence : \text{soit} | ×1 |
| 3Z1DNB-08 (3e) | src/exercices/3e/3Z1DNB-08.ts:166 | texte dans miseEnEvidence : \text{minutes} | ×1 |
| 3Z1DNB-08 (3e) | src/exercices/3e/3Z1DNB-08.ts:173 | texte dans miseEnEvidence : \text{minutes} | ×1 |
| 3Z1DNB-08 (3e) | src/exercices/3e/3Z1DNB-08.ts:174 | texte dans miseEnEvidence : \text{minutes} | ×1 |
| 3Z1DNB-11 (3e) | src/exercices/3e/3Z1DNB-11.ts:270 | texte dans miseEnEvidence : \text{~cm} | ×1 |
| 4C33-1 (4e) | src/exercices/4e/4C33-1.ts:333 | texte dans miseEnEvidence : \text{facteurs} | ×1 |
| 4C33-1 (4e) | src/exercices/4e/4C33-1.ts:342 | texte dans miseEnEvidence : \text{facteurs} | ×1 |
| 4P10 (4e) | src/exercices/4e/4P10.ts:1326 | texte dans miseEnEvidence : \text{${unites[index]} | ×1 |
| 4P10 (4e) | src/exercices/4e/4P10.ts:1328 | texte dans miseEnEvidence : \text{${ unites[index + 1]} | ×1 |
| 5G1B-5 (5e) | src/exercices/5e/5G1B-5.ts:494 | texte dans miseEnEvidence : \text{~et~} | ×1 |
| 6G6D-1 (6e) | src/exercices/6e/6G6D-1.ts:151 | texte dans miseEnEvidence : \text{${type} | ×1 |
| 6G6D-1 (6e) | src/exercices/6e/6G6D-1.ts:175 | texte dans miseEnEvidence : \text{${type} | ×1 |
| 6G6D-1 (6e) | src/exercices/6e/6G6D-1.ts:199 | texte dans miseEnEvidence : \text{${type} | ×1 |
| 6I1B-5 (6e) | src/exercices/6e/6I1B-5.ts:235 | texte dans miseEnEvidence : \text{=B1\\textasciicircum 2} | ×1 |
| 6I1B-5 (6e) | src/exercices/6e/6I1B-5.ts:243 | texte dans miseEnEvidence : \text{=B1\\textasciicircum 3} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:151 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:158 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:173 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:180 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:185 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:192 | texte dans miseEnEvidence : \text{${unite} | ×2 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:210 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:221 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:257 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:268 | texte dans miseEnEvidence : \text{${unite} | ×2 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:274 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:285 | texte dans miseEnEvidence : \text{${unite} | ×2 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:330 | texte dans miseEnEvidence : \text{${unite} | ×1 |
| 6M2autoB (6e) | src/exercices/6e/6M2autoB.ts:346 | texte dans miseEnEvidence : \text{${unite} | ×2 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:195 | texte dans miseEnEvidence : \text{semaines} | ×1 |
| 6M4C (6e) | src/exercices/6e/6M4C.ts:207 | texte dans miseEnEvidence : \text{semaine} | ×1 |
| 6M4C-1 (6e) | src/exercices/6e/6M4C-1.ts:113 | texte dans miseEnEvidence : \text{~min~} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:286 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:373 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:378 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:481 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:495 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:581 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:588 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:690 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:782 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:791 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:863 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:872 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:947 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:956 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:1031 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| 6N4A-3 (6e) | src/exercices/6e/6N4A-3.ts:1040 | texte dans miseEnEvidence : \text{${uniteVolume} | ×1 |
| can2F3-04 (CAN) | src/exercices/can/2e/can2F3-04.ts:219 | texte dans miseEnEvidence : \text{${solutions1.length > 1 ? 'solutions' : 'solution'} | ×1 |
| can5a-CoopMaths (CAN) | src/exercices/can/5e/can5a-CoopMaths.ts:416 | texte dans miseEnEvidence : \text{${hauteurs[a][3]} | ×1 |
| can6a-2022 (CAN) | src/exercices/can/6e/can6a-2022.ts:1024 | texte dans miseEnEvidence : \text{${taille1[a][3]} | ×1 |
| can6M4-01 (CAN) | src/exercices/can/6e/can6M4-01.ts:98 | texte dans miseEnEvidence : \text{${liste[a][3]} | ×1 |
| canc3M01 (CAN) | src/exercices/can/c3/canc3M01.ts:52 | texte dans miseEnEvidence : \text{${this.reponse} | ×1 |
| canc3M01 (CAN) | src/exercices/can/c3/canc3M01.ts:61 | texte dans miseEnEvidence : \text{${this.reponse} | ×1 |
| canTEC2-02 (CAN) | src/exercices/can/Ex/canTEC2-02.ts:46 | texte dans miseEnEvidence : \text{la médiatrice du segment [AB]} | ×1 |
| EgaliteFG3-4e-9 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG9.ts:77 | texte dans miseEnEvidence : \text{l'étagère} ‖ texte dans miseEnEvidence : \text{est bien perpendiculaire au mur} | ×2 |
| EgaliteFG4-3e-19 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG19.ts:133 | texte dans miseEnEvidence : \text{le triangle} ‖ texte dans miseEnEvidence : \text{n'est pas rectangle} | ×2 |
| EgaliteFG7-Tle-19 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee19.ts:104 | texte dans miseEnEvidence : \text{géométrique de raison} | ×1 |
| can/can2a-2024-2/can2a-2024-mai-Q26.ts (hors référentiel) | src/exercices/can/can2a-2024-2/can2a-2024-mai-Q26.ts:21 | texte dans miseEnEvidence : \text{oui} | ×1 |
| 2cdd4 (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q8.ts:84 | texte dans miseEnEvidence : \text{${uniteCorrecte} | ×1 |
| 775b7 (Non classés) | src/exercices/can/canc3a-2026/canc3a-2026-Q26.ts:57 | texte dans miseEnEvidence : \text{carreaux} | ×1 |
| 79fdf (Non classés) | src/exercices/EAMPremiere/EAM-CETechno-2026-Q5.ts:58 | texte dans miseEnEvidence : \text{et} | ×1 |
| psq08 (Non classés) | src/exercices/EAMPremiere/EAM-PolynesieSpecifique-2026-Q8.ts:111 | texte dans miseEnEvidence : \text{est croissante sur} | ×1 |
| TEC1-42 (Terminale) | src/exercices/TEx/TEC1-42.ts:263 | texte dans miseEnEvidence : \text{et} | ×1 |
| TEC1-43 (Terminale) | src/exercices/TEx/TEC1-43.ts:155 | texte dans miseEnEvidence : \text{et} | ×1 |
| TEG1-11 (Terminale) | src/exercices/TEx/TEG1-11.ts:113 | texte dans miseEnEvidence : \text{${mot} | ×1 |
| TSA1-26 (Terminale) | src/exercices/TSpe/TSA1-26.ts:60 | texte dans miseEnEvidence : \text{Pas de limite} | ×1 |
| TSA1-27 (Terminale) | src/exercices/TSpe/TSA1-27.ts:210 | texte dans miseEnEvidence : \text{Pas de limite} | ×1 |
| TSA1-30 (Terminale) | src/exercices/TSpe/TSA1-30.ts:69 | texte dans miseEnEvidence : \text{Pas de limite} | ×1 |
| TSA1-40 (Terminale) | src/exercices/TSpe/TSA1-40.ts:92 | texte dans miseEnEvidence : \text{décroissante} | ×1 |
| TSA1-40 (Terminale) | src/exercices/TSpe/TSA1-40.ts:96 | texte dans miseEnEvidence : \text{convergente} | ×1 |
| TSA1-44 (Terminale) | src/exercices/TSpe/TSA1-44.ts:172 | texte dans miseEnEvidence : \text{est strictement croissante sur} | ×1 |
| TSA1-44 (Terminale) | src/exercices/TSpe/TSA1-44.ts:229 | texte dans miseEnEvidence : \text{converge vers} | ×1 |
| TSA1-45 (Terminale) | src/exercices/TSpe/TSA1-45.ts:142 | texte dans miseEnEvidence : \text{est géométrique de raison} ‖ texte dans miseEnEvidence : \text{et de premier terme} | ×2 |
| TSA1-46 (Terminale) | src/exercices/TSpe/TSA1-46.ts:129 | texte dans miseEnEvidence : \text{strictement décroissante} | ×1 |
| TSA1-46 (Terminale) | src/exercices/TSpe/TSA1-46.ts:145 | texte dans miseEnEvidence : \text{géométrique de raison} | ×1 |
| TSA1-48 (Terminale) | src/exercices/TSpe/TSA1-48.ts:1356 | texte dans miseEnEvidence : \text{${verdict} | ×1 |
| TSG2-15 (Terminale) | src/exercices/TSpe/TSG2-15.ts:94 | texte dans miseEnEvidence : \text{alignés} | ×1 |
| TSG2-15 (Terminale) | src/exercices/TSpe/TSG2-15.ts:97 | texte dans miseEnEvidence : \text{pas alignés} | ×1 |

## M6

**Pas de mise en évidence du résultat** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-2020 (CAN) | série q18 | aucune mise en évidence dans la correction | ×2 ; sup= (revue-0-a) |
| can5a-2022 (CAN) | série q12 | aucune mise en évidence dans la correction | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can6C6-09 (CAN) | src/exercices/can/6e/can6C6-09.ts | Correction « $\dfrac{5}{5}-⟦\dfrac{4}{5}⟧=\dfrac{1}{5}$ (vert) » : la donnée 4/5 est en orange, le résultat en vert dans la formule ; l'orange est réservé au résultat final. → $\dfrac{5}{5}-\dfrac{4}{5}=⟦\dfrac{1}{5}⟧$ | ×1 |

## M7

**Explication en orange** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:33 | texteEnCouleur sans couleur (orange par défaut) : `est donc une suite arithmétique de raison ${a}` | ×1 |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:52 | texteEnCouleur sans couleur (orange par défaut) : `est donc une suite arithmétique de raison ${a}` | ×1 |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:68 | texteEnCouleur sans couleur (orange par défaut) : `est donc une suite géométrique de raison ${b}` | ×1 |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:100 | texteEnCouleur sans couleur (orange par défaut) : 'est donc une suite ni arithmétique, ni géométrique ' | ×1 |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:133 | texteEnCouleur sans couleur (orange par défaut) : 'est donc une suite ni arithmétique, ni géométrique ' | ×1 |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:147 | texteEnCouleur sans couleur (orange par défaut) : `est donc une suite arithmétique de raison ${a}` | ×1 |
| 1AL11-1QCM (1e) | src/exercices/1e/1AL11-1QCM.ts:179 | texteEnCouleur sans couleur (orange par défaut) : 'est donc une suite ni arithmétique, ni géométrique ' | ×1 |
| 1AL11-5QCM (1e) | src/exercices/1e/1AL11-5QCM.ts:41 | texteEnCouleur sans couleur (orange par défaut) : `La raison est donc ${r}.` | ×1 |
| 2L20-3 (2e) | src/exercices/2e/2L20-3.ts:430 | texteEnCouleur sans couleur (orange par défaut) : 'Un produit est nul si et seulement si au moins un de ses facteurs est nul.' | ×1 |
| 2L22-1 (2e) | src/exercices/2e/2L22-1.ts:93 | texteEnCouleur sans couleur (orange par défaut) : 'Un produit est nul si et seulement si au moins un de ses facteurs est nul.' | ×1 |
| 2L22-1 (2e) | src/exercices/2e/2L22-1.ts:113 | texteEnCouleur sans couleur (orange par défaut) : 'Un produit est nul si et seulement si au moins un de ses facteurs est nul.' | ×1 |
| 2L22-1 (2e) | src/exercices/2e/2L22-1.ts:139 | texteEnCouleur sans couleur (orange par défaut) : 'Un produit est nul si et seulement si au moins un de ses facteurs est nul.' | ×1 |
| 2L22-1 (2e) | src/exercices/2e/2L22-1.ts:167 | texteEnCouleur sans couleur (orange par défaut) : 'Un produit est nul si et seulement si au moins un de ses facteurs est nul.' | ×1 |
| 3G23 (3e) | src/exercices/3e/3G23.ts:483 | texteEnCouleur sans couleur (orange par défaut) : `Donc le point ${I.nom} est un point qui convient.` | ×1 |
| 3G23 (3e) | src/exercices/3e/3G23.ts:503 | texteEnCouleur sans couleur (orange par défaut) : `Donc le point ${I1.nom} est un point qui convient.` | ×1 |
| 4L15-0 (4e) | src/exercices/4e/4L15-0.ts:154 | texteEnCouleur sans couleur (orange par défaut) : `$\\boldsymbol{${inc}}$` ‖ texteEnCouleur sans couleur (orange par défaut) : `$${inc}$` | ×3 |
| 4L15-0 (4e) | src/exercices/4e/4L15-0.ts:176 | texteEnCouleur sans couleur (orange par défaut) : `$\\boldsymbol{${inc}}$` | ×3 |
| 4L15-0 (4e) | src/exercices/4e/4L15-0.ts:198 | texteEnCouleur sans couleur (orange par défaut) : `$\\boldsymbol{${inc}}$` | ×3 |
| 4L15-0 (4e) | src/exercices/4e/4L15-0.ts:220 | texteEnCouleur sans couleur (orange par défaut) : `$\\boldsymbol{${inc}}$` | ×3 |
| 4L15-0 (4e) | src/exercices/4e/4L15-0.ts:241 | texteEnCouleur sans couleur (orange par défaut) : `$\\boldsymbol{${inc}}$` | ×3 |
| can2N3-02 (CAN) | src/exercices/can/2e/can2N3-02.ts:136 | texteEnCouleur sans couleur (orange par défaut) : ` Mentalement : &lt;br> On calcule d'abord $1+${bonneFraction.texFraction}$ en n'oubliant pas que $1=${un.texFraction}$, puis on multip | ×1 |
| can3C4-04 (CAN) | src/exercices/can/3e/can3C4-04.ts:50 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Prendre le cinquième d'un nombre revient à le diviser par 5.&lt;br> Ainsi, le ${N} de $${a}$ est égal à $ | ×1 |
| can3C4-04 (CAN) | src/exercices/can/3e/can3C4-04.ts:65 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Prendre le quart d'un nombre revient à le diviser par 4.&lt;br> Ainsi, le ${N} de $${b}$ est égal à $${b}\\di | ×1 |
| can3C4-04 (CAN) | src/exercices/can/3e/can3C4-04.ts:80 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Prendre le tiers d'un nombre revient à le diviser par 3.&lt;br> Ainsi, le ${N} de $${c}$ est égal à $${c} | ×1 |
| can3C4-04 (CAN) | src/exercices/can/3e/can3C4-04.ts:94 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Prendre le sixième d'un nombre revient à le diviser par 6.&lt;br> Ainsi, le ${N} de $${d}$ est égal à $${d}\\ | ×1 |
| can3L1-04 (CAN) | src/exercices/can/3e/can3L1-04.ts:163 | texteEnCouleur sans couleur (orange par défaut) : ` Mentalement : &lt;br> Faites deux calculs séparés puis comparez les résultats :&lt;br> $\\bullet$ $${ecritureParentheseSiNe | ×1 |
| can3L1-04 (CAN) | src/exercices/can/3e/can3L1-04.ts:174 | texteEnCouleur sans couleur (orange par défaut) : ` Mentalement : &lt;br> Faites deux calculs séparés puis comparez les résultats :&lt;br> $\\bullet$ $${ecritureParentheseSiNe | ×1 |
| can4C22-01 (CAN) | src/exercices/can/4e/can4C22-01.ts:53 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Pour multiplier $${b}$ par $${a.inverse().texFraction}$, on commence par diviser $${b}$ par $${a.n}$, ce qu | ×1 |
| can4C22-01 (CAN) | correction q1 | texte orange (texteEnCouleur sans couleur) : Mentalement : Pour multiplier | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G1-01 (CAN) | src/exercices/can/4e/can4G1-01.ts:106 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> La longueur $${nom[0]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $${b}$ et de $${a}$. | ×1 |
| can4G1-01 (CAN) | src/exercices/can/4e/can4G1-01.ts:122 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> La longueur $${nom[0]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $${b}$ et de $${a}$.&lt;br> | ×1 |
| can4G1-01 (CAN) | src/exercices/can/4e/can4G1-01.ts:159 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> La longueur $${nom[1]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $\\sqrt{${b}}$ et de | ×1 |
| can4G1-01 (CAN) | src/exercices/can/4e/can4G1-01.ts:178 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> La longueur $${nom[1]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $\\sqrt{${b}}$ et de $${ | ×1 |
| can4G1-01 (CAN) | correction q1 | texte orange (texteEnCouleur sans couleur) : Mentalement : La longueur | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C3-06 (CAN) | src/exercices/can/5e/can5C3-06.ts:42 | texteEnCouleur sans couleur (orange par défaut) : ` Mentalement : &lt;br> On fait la somme des parties entières des deux nombres : $${a}+${10 - a}=${10}$, puis on ajoute les parties décimal | ×1 |
| can5C3-06 (CAN) | correction q1 | texte orange (texteEnCouleur sans couleur) : Mentalement : On fait la somme des parties entières des deux nombres : | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5P1-04 (CAN) | src/exercices/can/5e/can5P1-04.ts | Bloc « Mentalement » en orange ; espaces avant les points (« $28$ . », « un frère . »). → texteEnCouleur(…, bleuMathalea) | ×1 |
| can5P1-04 (CAN) | src/exercices/can/5e/can5P1-04.ts:58 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Pour calculer $\\dfrac{1}{5}$ d'une quantité, on la divise par $5$. &lt;br> Ainsi, $\\dfrac{1}{5}\ | ×1 |
| can5P1-04 (CAN) | src/exercices/can/5e/can5P1-04.ts:72 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Pour calculer $\\dfrac{1}{6}$ d'une quantité, on la divise par $6$. &lt;br> Ainsi, $\\dfrac{1}{6}\ | ×1 |
| can5P1-04 (CAN) | src/exercices/can/5e/can5P1-04.ts:86 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Pour calculer $\\dfrac{1}{7}$ d'une quantité, on la divise par $7$. &lt;br> Ainsi, $\\dfrac{1}{7}\ | ×1 |
| can5P1-04 (CAN) | src/exercices/can/5e/can5P1-04.ts:100 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Pour calculer $\\dfrac{1}{4}$ d'une quantité, on la divise par $4$. &lt;br> Ainsi, $\\dfra | ×1 |
| can5P1-04 (CAN) | correction q1 | texte orange (texteEnCouleur sans couleur) : Mentalement : Pour calculer | ×8 ; défaut ; défaut nb=10 (revue-0-a) |
| can6a-2023 (CAN) | src/exercices/can/6e/can6a-2023.ts:691 | texteEnCouleur sans couleur (orange par défaut) : 'ans' | ×1 |
| can6a-2023 (CAN) | correction q11 | texte orange (texteEnCouleur sans couleur) : ans. | ×1 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-1-a) |
| can6M3-02 (CAN) | src/exercices/can/6e/can6M3-02.ts | Bloc « Mentalement » en orange (texteEnCouleur sans couleur) ; unités hors maths (« $40$ cL ») ; « $ ....$ » dans l'énoncé. → texteEnCouleur(…, bleuMathalea) ; $40~\text{cL}+\ldots~\text{cL}=1~\text{L}$ | ×1 |
| can6M3-02 (CAN) | src/exercices/can/6e/can6M3-02.ts:39 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Comme $1$ L $=100$ cL, le nombre cherché est donné par la différence : $100-${a}=${100 - a}$. ` | ×1 |
| can6M3-02 (CAN) | src/exercices/can/6e/can6M3-02.ts:51 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Comme $1$ L $=100$ cL, le nombre cherché est donné par la différence : $100-${a}=${100 - a}$. ` | ×1 |
| can6M3-02 (CAN) | src/exercices/can/6e/can6M3-02.ts:62 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Comme $1$ L$=${texNombre(1000)}$ mL, le nombre cherché est donné par la différence : $${texNombre(1000)}-${a * 1 | ×1 |
| can6M3-02 (CAN) | src/exercices/can/6e/can6M3-02.ts:73 | texteEnCouleur sans couleur (orange par défaut) : `&lt;br> Mentalement : &lt;br> Comme $1$ L$=${texNombre(1000)}$ mL, le nombre cherché est donné par la différence : $${texNombre(1000)}-${a * 1 | ×1 |
| can6M3-02 (CAN) | correction q1 | texte orange (texteEnCouleur sans couleur) : Mentalement : Comme | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C05 (CAN) | correction q1 | texte orange (texteEnCouleur sans couleur) : Mentalement on peut soustraire les chiffres des unités des deux nombres : | ×3 ; défaut nb=10 (revue-1-a) |
| canc3C05 (CAN) | correction q7 | texte orange (texteEnCouleur sans couleur) : Mentalement on peut ajouter seulement les chiffres des unités des deux nombres : | ×2 ; défaut nb=10 (revue-1-a) |
| canc3C05 (CAN) | correction q10 | texte orange (texteEnCouleur sans couleur) : Mentalement on peut soustraire les chiffres des unités des deux nombres (en empr | ×1 ; défaut nb=10 (revue-1-a) |
| CM2G3D-1 (cm2) | src/exercices/CM2/CM2G3D-1.ts:834 | texteEnCouleur sans couleur (orange par défaut) : `Pour l'auto-correction, on peut vérifier que $[${A.nom + C.nom}]$ et $[${B.nom + D.nom}]$ mesurent bien tous les deux $${texNombre(segment( | ×1 |
| CM2G3D-1 (cm2) | src/exercices/CM2/CM2G3D-1.ts:836 | texteEnCouleur sans couleur (orange par défaut) : `Pour l'auto-correction, on peut vérifier que $[${B.nom + D.nom}]$ mesure environ $${texNombre(segment(B, D).longueur, 1)}\\text{ cm}$` | ×1 |
| CM2G3D-1 (cm2) | src/exercices/CM2/CM2G3D-1.ts:838 | texteEnCouleur sans couleur (orange par défaut) : `Pour l'auto-correction, on peut vérifier que tous les côtés du ${naturePoly} mesure environ $${texNombre(segment(A, B).longueur, 1)}\\text{ | ×1 |
| CM2G3D-1 (cm2) | src/exercices/CM2/CM2G3D-1.ts:840 | texteEnCouleur sans couleur (orange par défaut) : `Pour l'auto-correction, on peut vérifier que $[${B.nom + C.nom}]$ mesure environ $${texNombre(segment(B, C).longueur, 1)}\\text{ cm}$` | ×1 |
| CM2G3D-1 (cm2) | src/exercices/CM2/CM2G3D-1.ts:842 | texteEnCouleur sans couleur (orange par défaut) : `Pour l'auto-correction, on peut vérifier que $[${B.nom + D.nom}]$ mesure environ $${texNombre(segment(B, D).longueur, 1)}\\text{ cm}$` | ×1 |
| 6e/bonneAnnee2023.ts (hors référentiel) | src/exercices/6e/bonneAnnee2023.ts:446 | texteEnCouleur sans couleur (orange par défaut) : 'Conclusion de ce préambule' | ×1 |
| can/c3/_Canc3a.ts (hors référentiel) | src/exercices/can/c3/_Canc3a.ts:593 | texteEnCouleur sans couleur (orange par défaut) : 'ans' | ×1 |

## M8

**Nombre de mises en évidence et de champs différents** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2026 (CAN) |  q23 fillInTheBlank | 1 mise(s) en évidence pour 2 trou(s) | ×2 ; sup=false (revue-0-a) |
| can4C21-05 (CAN) |  q1 fillInTheBlank | 1 mise(s) en évidence pour 2 trou(s) | ×12 ; défaut ; défaut nb=10 (revue-0-a) |
| can5a-2026 (CAN) |  q16 fillInTheBlank | 1 mise(s) en évidence pour 2 trou(s) | ×8 ; sup=false ; sup=true (revue-0-a) |
| can5a-2026 (CAN) | src/exercices/can/can5a-2026 | Q16 : deux trous (numérateur, dénominateur) mais une seule fraction mise en évidence, simplifiée ($\dfrac{2}{5}$) alors que l'énoncé compte 4 boules sur 10 ; Q15 : heure mise en évidence en quatre morceaux ($⟦11⟧$ ⟦h⟧ $⟦00⟧$ ⟦min⟧) pour un seul champ. → $\dfrac{⟦4⟧}{⟦10⟧}=\dfrac{2}{5}$ ; $⟦11~\text{h}~00~\text{min}⟧$ | ×1 |
| CM1N2B (cm1) |  q1 fillInTheBlank | 1 mise(s) en évidence pour 3 trou(s) | ×30 ; sup=2-3-4-5-6-7-8-9-10-11 sup2=1-2-3 sup3=true ; sup=2-3-4-5-6-7-8-9-10-11 sup2=1-2-3 sup3=false… (revue-0-a) |

## X4

**Question en double ou vide** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canCE2a-2025 (CAN) | src/exercices/can/canCE2a-2025 | Version non interactive : Q5 « Le triple de $23$ » et Q16 « Le triple de $25$ est : » s'arrêtent sans demande ni pointillés (énoncé incomplet hors interactif). → Le triple de $23$ est $\ldots$ | ×1 |

## X7

**Combinaisons de paramètres non toutes passées** (gravité 3 : Mise en évidence)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6G1-01 (CAN) | src/exercices/6e/_Transformations.ts:77 | App et banc : l'aide du paramètre écrit « 1 & 2 : Symétries obliques », « 3 & 4 : … », « 5 & 6 : … » ; optionsDe (moteur/fichiers/src/moteur/index.ts) ne lit que « n : libellé » : l'éditeur de parcours ne propose que 7 à 10 et le banc n'a pas passé 1 à 6 (même chose pour tous les exercices tirés de 6e/_Transformations.ts). → optionsDe : accepter « n & m : libellé » (une option par numéro) ; banc : passe complémentaire sur ces options. | ×1 |

## C1

**Contenu mathématique faux ou ambigu** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-NY2025 (CAN) | src/exercices/can/canNY-2025 | Q12 (5e, aussi can5a-NY2026) : « Si Quynh a $48$ ans en $2025$, en quelle année est-elle née ? » : deux réponses possibles selon la date d'anniversaire (1977 ou 1976), une seule acceptée. → Préciser « Quynh fête ses 48 ans en 2025 ». | ×1 |
| canCE2a-2025 (CAN) | src/exercices/can/canCE2a-2025 | Q4 : correction « Une forêt est un rectangle dont les côtés mesurent en moyenne environ 1 km » : affirmation fausse présentée comme un fait. ‖ Q14 : « compris entre 238 et 300 » avec chiffre des dizaines 3 : 238 convient aussi si « entre » est large ; seule 239 est acceptée. Nombres hors $. → Si une forêt avait la forme d'un carré d'environ $1~\text{km}$ de côté, son périmètre serait proche de $4~\text{km}$. | ×2 |

## N1

**Nombre hors $** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2022 (CAN) | correction q27 | « 14 » hors $ : L = 14 dm | ×1 ; sup2=false (revue-0-a) |
| can4a-2023 (CAN) | énoncé q17 | « 4 » hors $ : é stylo en position d'écriture :: pen répéter [4] fois avancer de [6] pas fin ‖ « 6 » hors $ : riture :: pen répéter [4] fois avancer de [6] pas fin [champ] pas | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | énoncé non interactif q17 | « 4 » hors $ : é stylo en position d'écriture :: pen répéter [4] fois avancer de [6] pas fin ‖ « 6 » hors $ : riture :: pen répéter [4] fois avancer de [6] pas fin | ×2 |
| can4a-2024 (CAN) | énoncé q21 | « 6 » hors $ : lutin est placé au centre de l'écran répéter [6] fois avancer de [20] pas attendre (2 ‖ « 20 » hors $ : e de l'écran répéter [6] fois avancer de [20] pas attendre (2) secondes fin ‖ « 2 » hors $ : [6] fois avancer de [20] pas attendre (2) secondes fin À l'issue de l'exécutio | ×6 ; sup=false ; sup=true (revue-0-a) |
| can4a-2024 (CAN) | énoncé non interactif q21 | « 6 » hors $ : lutin est placé au centre de l'écran répéter [6] fois avancer de [20] pas attendre (2 ‖ « 20 » hors $ : e de l'écran répéter [6] fois avancer de [20] pas attendre (2) secondes fin ‖ « 2 » hors $ : [6] fois avancer de [20] pas attendre (2) secondes fin À l'issue de l'exécutio | ×3 |
| can4a-2025 (CAN) | énoncé q17 | « 5 » hors $ : ancé ? quand @greenFlag est cliqué répéter [5] fois avancer de [10] pas attendre [1] ‖ « 10 » hors $ : lag est cliqué répéter [5] fois avancer de [10] pas attendre [1] secondes fin ‖ « 1 » hors $ : [5] fois avancer de [10] pas attendre [1] secondes fin Le lutin a avancé de [ | ×6 ; sup=false ; sup=true (revue-0-a) |
| can4a-2025 (CAN) | correction q27 | « 2 » hors $ : revient à diviser par 2. Ainsi, | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4a-2025 (CAN) | énoncé non interactif q17 | « 5 » hors $ : ancé ? quand @greenFlag est cliqué répéter [5] fois avancer de [10] pas attendre [1] ‖ « 10 » hors $ : lag est cliqué répéter [5] fois avancer de [10] pas attendre [1] secondes fin ‖ « 1 » hors $ : [5] fois avancer de [10] pas attendre [1] secondes fin | ×3 |
| can4a-2026 (CAN) | énoncé q23 | « 12 » hors $ : Une urne contient 12 boules rouges, 6 boules vertes et 4 boules noir ‖ « 6 » hors $ : Une urne contient 12 boules rouges, 6 boules vertes et 4 boules noires. [champ] ‖ « 4 » hors $ : rne contient 12 boules rouges, 6 boules vertes et 4 boules noires. [champ] | ×18 ; sup=false ; sup=true (revue-0-a) |
| can4a-2026 (CAN) | énoncé non interactif q23 | « 12 » hors $ : Une urne contient 12 boules rouges, 6 boules vertes et 4 boules noir ‖ « 6 » hors $ : Une urne contient 12 boules rouges, 6 boules vertes et 4 boules noires. ‖ « 4 » hors $ : rne contient 12 boules rouges, 6 boules vertes et 4 boules noires. | ×9 |
| can4a-NY2024 (CAN) | correction q16 | « 33 » hors $ : Le résultat indique qu'il y a 33 heures pleines dans ‖ « 0 » hors $ : (0 h) au ‖ « 6 » hors $ : Un dixième d'heure est égal à 6 minutes. 24 minutes correspondent | ×7 ; défaut (revue-0-a) |
| can4a-NY2025 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2026 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4C21-03 (CAN) | titre | « 0,25 » hors $ : Calculer une fraction de dénominateur 0,25 ou 0,1 ... | ×2 |
| can4C21-05 (CAN) | consigne | « 1 » hors $ : d'un nombre entier et d'une fraction inférieure à 1. | ×2 ; défaut ; défaut nb=10 (revue-0-a) |
| can4C3-01 (CAN) | titre | « 10 » hors $ : Calculer une somme de puissances de 10 | ×1 |
| can4C3-02 (CAN) | titre | « 3 » hors $ : Calculer des puissances de +/-2, 3, 4 ou 5 | ×3 |
| can4C4-03 (CAN) | titre | « 1 » hors $ : Retrancher 1 à un décimal | ×1 |
| can4G2-04 (CAN) | correction q1 | « 2 » hors $ : sont 2 fois plus grandes que les longueurs du triangle ‖ « 2 » hors $ : sont 2 fois plus petites que les longueurs du triangle | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can4P1-03 (CAN) | énoncé q1 | « 12 » hors $ : le tableau de proportionnalité. 12 2 8 [champ] ‖ « 2 » hors $ : tableau de proportionnalité. 12 2 8 [champ] ‖ « 8 » hors $ : eau de proportionnalité. 12 2 8 [champ] | ×33 ; défaut ; défaut nb=10 (revue-0-a) |
| can4P1-03 (CAN) | énoncé non interactif q1 | « 12 » hors $ : le tableau de proportionnalité. 12 2 8 ‖ « 2 » hors $ : tableau de proportionnalité. 12 2 8 ‖ « 8 » hors $ : eau de proportionnalité. 12 2 8 | ×3 |
| can5A-01 (CAN) | énoncé q1 | « 20 » hors $ : iture :: pen répéter [...] fois avancer de [20] pas tourner droite de [36] degrés ‖ « 36 » hors $ : avancer de [20] pas tourner droite de [36] degrés fin Quel nombre doit-on écr | ×4 ; défaut ; défaut nb=10 (revue-0-a) |
| can5A-01 (CAN) | correction q1 | « 10 » hors $ : Un décagone régulier a 10 côtés ( ‖ « 8 » hors $ : Un octogone régulier a 8 côtés ( | ×2 ; défaut ; défaut nb=10 (revue-0-a) |
| can5A-01 (CAN) | énoncé non interactif q1 | « 20 » hors $ : iture :: pen répéter [...] fois avancer de [20] pas tourner droite de [36] degrés ‖ « 36 » hors $ : avancer de [20] pas tourner droite de [36] degrés fin Quel nombre doit-on écr | ×2 |
| can5a-2023 (CAN) | correction q26 | « 30 » hors $ : En 1h 30 min, l'avion parcourt | ×1 ; sup2=true (revue-0-a) |
| can5a-2024 (CAN) | correction q23 | « 5 » hors $ : ubes... Le nombre total de cubes est la somme des 5 premiers carrés d'entier : | ×1 ; sup=false (revue-0-a) |
| can5a-2025 (CAN) | énoncé q16 | « 48 » hors $ : On donne le tableau de proportionnalité : 48 64 6 ? | ×6 ; sup=false ; sup=true (revue-0-a) |
| can5a-2025 (CAN) | énoncé non interactif q16 | « 48 » hors $ : On donne le tableau de proportionnalité : 48 64 6 ? | ×3 |
| can5a-CoopMaths (CAN) | énoncé q7 | « 48 » hors $ : Le triple d'un nombre vaut 48, combien vaut sa moitié ? [champ] ‖ « 240 » hors $ : Quel est le reste de la division euclidienne de 240 par 50 ? [champ] ‖ « 50 » hors $ : st le reste de la division euclidienne de 240 par 50 ? [champ] | ×26 ; sup=31 ; sup=7… (revue-0-a) |
| can5a-CoopMaths (CAN) | correction q10 | « 240 » hors $ : donc le reste de la division de 240 par | ×2 ; sup=31 ; sup=10 (revue-0-a) |
| can5a-CoopMaths (CAN) | énoncé non interactif q7 | « 48 » hors $ : Le triple d'un nombre vaut 48, combien vaut sa moitié ? ‖ « 240 » hors $ : Quel est le reste de la division euclidienne de 240 par 50 ? ‖ « 50 » hors $ : st le reste de la division euclidienne de 240 par 50 ? | ×13 |
| can5a-NY2024 (CAN) | correction q22 | « 33 » hors $ : Le résultat indique qu'il y a 33 heures pleines dans | ×1 ; défaut (revue-0-a) |
| can5a-NY2025 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5C2-01 (CAN) | titre | « 101 » hors $ : Multiplier par les multiples de 101 | ×1 |
| can5C2-02 (CAN) | titre | « 100 » hors $ : Calculer astucieusement avec 100 ou 10 | ×2 |
| can5C2-04 (CAN) | titre | « 1,5 » hors $ : Multiplier par 1,5 ou 2,5 ou ... | ×2 |
| can5C2-07 (CAN) | titre | « 9 » hors $ : Multiplier astucieusement par 9, 11, 19, 21, 99 ou 101 ‖ « 101 » hors $ : ultiplier astucieusement par 9, 11, 19, 21, 99 ou 101 | ×6 |
| can5C2-08 (CAN) | titre | « 25 » hors $ : Multiplier astucieusement par 25 | ×1 |
| can5C3-05 (CAN) | titre | « 0,1 » hors $ : Multiplier ou diviser par 0,1 ou 0,01 ou 0,001 | ×3 |
| can5C6-03 (CAN) | titre | « 3 » hors $ : Calculer le prochain multiple de 3 ou de 9 | ×2 |
| can5D-01 (CAN) | correction q1 | « 0,75 » hors $ : 0,75 ‖ « 2 » hors $ : 2 ‖ « 2,75 » hors $ : {\color{#F15929}\boldsymbol{2,75}} | ×20 ; défaut ; défaut nb=10 (revue-0-a) |
| can5L-02 (CAN) | énoncé q1 | « 9 » hors $ : et 9. [champ] ‖ « 3 » hors $ : et 3 en fonction de ‖ « 7 » hors $ : par 7. [champ] | ×29 ; sup=true sup2=11 sup3=true ; sup=true sup2=11 sup3=false… (revue-21-a) |
| can5L-02 (CAN) | correction q1 | « 9 » hors $ : et 9 peut se noter : ‖ « 7 » hors $ : par 7 peut se noter : ‖ « 3 » hors $ : Le quotient de 3 par | ×27 ; sup=true sup2=11 sup3=true ; sup=true sup2=11 sup3=false… (revue-21-a) |
| can5P1-01 (CAN) | énoncé q4 | « 3 » hors $ : €. Combien coûtent 3 kg de ces framboises ? [champ] € ‖ « 5 » hors $ : €. Combien coûtent 5 kg de ces fraises ? [champ] € | ×2 ; défaut nb=10 (revue-1-a) |
| can5P1-02 (CAN) | énoncé q2 | « 9 » hors $ : kg de abricots coûtent 9 €. Quel est le prix de | ×1 ; défaut nb=10 (revue-1-a) |
| can6a-2024 (CAN) | énoncé q17 | « 15 » hors $ : Joachim a 15 billes. Il en a 5 fois moins que Romain. Romain ‖ « 5 » hors $ : Joachim a 15 billes. Il en a 5 fois moins que Romain. Romain a [champ] billes ‖ « 12 » hors $ : Léo a 12 billes. Il en a 4 fois moins que Lola. Lola a | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2024 (CAN) | correction q27 | « 5 » hors $ : . En effet, il y a 5 carrés dans le rectangle et la zone grisée couvr | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6a-2024 (CAN) | énoncé non interactif q17 | « 15 » hors $ : Joachim a 15 billes. Il en a 5 fois moins que Romain. Romain ‖ « 5 » hors $ : Joachim a 15 billes. Il en a 5 fois moins que Romain. Romain a | ×2 |
| can6a-CoopMaths (CAN) | énoncé q1 | « 46 » hors $ : Le double d'un nombre vaut 46, combien vaut sa moitié ? [champ] ‖ « 23 » hors $ : Quel est le nombre qui, multiplié par 23 donne 11 ? [champ] ‖ « 55 » hors $ : Je possède 55 bonbons et je fabrique des sacs de 9 bonbons. U | ×203 ; sup=31 ; sup=1… (revue-0-a) |
| can6a-CoopMaths (CAN) | correction q1 | « 23 » hors $ : Le nombre est 23, sa moitié est | ×21 ; sup=31 ; sup=1 (revue-0-a) |
| can6a-CoopMaths (CAN) | énoncé non interactif q1 | « 46 » hors $ : Le double d'un nombre vaut 46, combien vaut sa moitié ? ‖ « 23 » hors $ : Quel est le nombre qui, multiplié par 23 donne 11 ? ‖ « 55 » hors $ : Je possède 55 bonbons et je fabrique des sacs de 9 bonbons. U | ×8 |
| can6a-NY2025 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2026 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6C1-03 (CAN) | titre | « 5 » hors $ : Connaître les tables de multiplication (de 5 à 9) | ×2 |
| can6C1-06 (CAN) | titre | « 100 » hors $ : Déterminer le complément à 100 | ×1 |
| can6C1-09 (CAN) | titre | « 4 » hors $ : Multiplier un nombre par 4 ou 8 | ×2 |
| can6C2-01 (CAN) | titre | « 5 » hors $ : Multiplier un nombre pair par 5 | ×1 |
| can6C2-05 (CAN) | titre | « 9 » hors $ : Diviser par 9 | ×1 |
| can6C2-10 (CAN) | titre | « 0,5 » hors $ : Multiplier astucieusement par 0,5 | ×1 |
| can6C2-11 (CAN) | titre | « 5 » hors $ : Diviser astucieusement par 5, 4, 8 ou 0,5 ‖ « 0,5 » hors $ : Diviser astucieusement par 5, 4, 8 ou 0,5 | ×4 |
| can6C3-03 (CAN) | titre | « 1 » hors $ : Trouver le complément à 1 avec un seul chiffre différent de 0 ‖ « 0 » hors $ : complément à 1 avec un seul chiffre différent de 0 | ×2 |
| can6C3-04 (CAN) | titre | « 1 » hors $ : Trouver le complément à 1 avec des centièmes | ×1 |
| can6C3-05 (CAN) | titre | « 0,1 » hors $ : Multiplier par 0,1, 0,01 ou 0,001 | ×3 |
| can6C3-06 (CAN) | titre | « 0 » hors $ : Multiplier deux décimaux compris entre 0 et 1 | ×2 |
| can6C4-01 (CAN) | titre | « 3 » hors $ : Trouver le reste d’une division par 3 | ×1 |
| can6C4-01 (CAN) | correction q1 | « 2 » hors $ : . En enlevant 2 unités à ‖ « 1 » hors $ : . En enlevant 1 unité à | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C4-03 (CAN) | correction q1 | « 8 » hors $ : par 8. On en déduit que le paysagiste pourra fai ‖ « 5 » hors $ : par 5. Cela signifie qu’il pourra former ‖ « 6 » hors $ : par 6. Cela signifie que la documentaliste pourra rem | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C52-02 (CAN) | titre | « 1 » hors $ : Comparer une fraction avec 1 | ×1 |
| can6G1-03 (CAN) | correction q1 | « 22 » hors $ : Le symétrique du point 22 par rapport à ‖ « 4 » hors $ : Les symétriques des points 4, 44 par rapport à ‖ « 30 » hors $ : Les symétriques des points 30, 14, 4 par rapport à | ×70 ; sup=1 sup2=1 sup3=false ; sup=1 sup2=1 sup3=true… (revue-0-a) |
| can6G1-03 (CAN) | énoncé non interactif q1 | « 22 » hors $ : Donner le symétrique du point 22 par rapport à | ×1 |
| can6G1-03 (CAN) | correction non interactive q1 | « 22 » hors $ : Le symétrique du point 22 par rapport à | ×1 |
| can6G2-01 (CAN) | consigne | « 1 » hors $ : t en plein écran). Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ « 1 » hors $ : angles différents. Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ « 3 » hors $ : uant pour reconstruire un grand cube constitué de 3 cubes sur chaque arête. | ×14 ; sup=1 sup2=1 sup3=true sup4=2 ; sup=1 sup2=1 sup3=false sup4=2… (revue-2-a) |
| can6G2-02 (CAN) | consigne | « 3 » hors $ : uant pour reconstruire un grand cube constitué de 3 cubes sur chaque arête. ‖ « 1 » hors $ : t en plein écran). Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ « 1 » hors $ : angles différents. Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en | ×15 ; sup=2 sup2=1 sup3=false sup4=1 ; sup=1 sup2=1 sup3=true sup4=2… (revue-0-a) |
| can6I-01 (CAN) | énoncé q1 | « 50 » hors $ : quand @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] ‖ « 50 » hors $ : and @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] pas tou ‖ « 180 » hors $ : cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] pas tourner droite de [90] | ×1038 ; sup=1 sup2=true sup4=true ; sup=1 sup2=true sup4=false… (revue-0-a) |
| can6I-01 (CAN) | correction q1 | « 6 » hors $ : On obtient la couleur suivante : (6)Jaune ‖ « 1 » hors $ : On obtient la couleur suivante : (1)Noir ‖ « 2 » hors $ : On obtient la couleur suivante : (2)Rouge | ×48 ; sup=2 sup2=true sup4=true ; sup=2 sup2=true sup4=false… (revue-4-a) |
| can6I-01 (CAN) | énoncé non interactif q1 | « 50 » hors $ : quand @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] ‖ « 50 » hors $ : and @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] pas tou ‖ « 180 » hors $ : cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] pas tourner droite de [90] | ×36 |
| can6N21-06 (CAN) | titre | « 10 » hors $ : Multiplier une fraction décimale par 10, 100, 1000 | ×3 |
| can6P2-03 (CAN) | titre | « 100 » hors $ : roblème de calcul de pourcentage par complément à 100% | ×1 |
| canc3a (CAN) | énoncé q18 | « 8 » hors $ : Quel est le périmètre d'un carré de côté 8 ? [champ] ‖ « 40 » hors $ : La moitié de la moitié de 40 [champ] | ×9 ; sup= ; sup=18… (revue-0-a) |
| canc3a (CAN) | énoncé non interactif q18 | « 8 » hors $ : Quel est le périmètre d'un carré de côté 8 ? | ×1 |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts | Q25 : « une figure d'aire 5 unités d'aire », « une figure de 5 unités d'aire » : nombres hors $. → $5$ unités d'aire | ×1 |
| canc3a-2023 (CAN) | énoncé q25 | « 5 » hors $ : Marina veut construire une figure d'aire 5 unités d'aire (uA). Combien de petits car | ×1 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | correction q25 | « 5 » hors $ : petits carreaux. Ainsi, une figure de 5 unités d'aire se représente par une figure de | ×1 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q25 | « 5 » hors $ : Marina veut construire une figure d'aire 5 unités d'aire (uA). Combien de petits car | ×1 |
| canc3a-2024 (CAN) | correction q27 | « 5 » hors $ : . En effet, il y a 5 carrés dans le rectangle et la zone grisée couvr | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2024 (CAN) | correction q28 | « 0 » hors $ : (0 h) au | ×1 ; défaut (revue-0-a) |
| canc3a-NY2025 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2026 (CAN) | correction q29 | « 0 » hors $ : (0 h) au | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3C05 (CAN) | correction q2 | « 139 » hors $ : s'obtient en multipliant le chiffre des unités de 139 et celui de 202. Donc le chiffre des unités de ‖ « 202 » hors $ : tipliant le chiffre des unités de 139 et celui de 202. Donc le chiffre des unités de ‖ « 20 » hors $ : On va retirer le plus grand multiple de 20 possible de | ×10 ; défaut nb=10 (revue-1-a) |
| canc3C19 (CAN) | correction q3 | « 7 » hors $ : Chacun des 7 enfants (Teresa et ses six amis) a le même nombr ‖ « 5 » hors $ : Chacun des 5 enfants (Lisa et ses quatre amis) a le même nomb | ×2 ; défaut nb=10 (revue-1-a) |
| canc3C22 (CAN) | titre | « 10 » hors $ : Multiplier par 10, 100, 1000 | ×3 |
| canc3C23 (CAN) | titre | « 10 » hors $ : Déterminer le complément à 10, 100, 1000 | ×3 |
| canc3D04 (CAN) | src/exercices/can/c3/canc3D04.ts | « Placer correctement les aiguilles pour indiquer 11 h 25. » : heure hors $ (question reprise dans CAN CE1 2025, Q18). → indiquer $11~\text{h}~25$. | ×1 |
| canc3D04 (CAN) | énoncé q1 | « 11 » hors $ : Placer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : cer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : acer correctement les aiguilles pour indiquer 3 h 25. [champ] | ×24 ; sup=false ; sup=true… (revue-0-a) |
| canc3D04 (CAN) | correction q1 | « 22 » hors $ : . Remarque : 22 h correspond à 10 h du soir. | ×2 ; sup=true (revue-1-a) |
| canc3D04 (CAN) | énoncé non interactif q1 | « 11 » hors $ : Placer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : cer correctement les aiguilles pour indiquer 11 h 25. [champ] | ×2 |
| canc3N03 (CAN) | énoncé q1 | « 3 » hors $ : re que l'on peut écrire avec les trois chiffres : 3, 4 et 7 ? [champ] ‖ « 4 » hors $ : que l'on peut écrire avec les trois chiffres : 3, 4 et 7 ? [champ] ‖ « 7 » hors $ : 'on peut écrire avec les trois chiffres : 3, 4 et 7 ? [champ] | ×33 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3N03 (CAN) | énoncé non interactif q1 | « 3 » hors $ : re que l'on peut écrire avec les trois chiffres : 3, 4 et 7 ? ‖ « 4 » hors $ : que l'on peut écrire avec les trois chiffres : 3, 4 et 7 ? ‖ « 7 » hors $ : 'on peut écrire avec les trois chiffres : 3, 4 et 7 ? | ×3 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q18 | Q18 : « Placer correctement les aiguilles pour indiquer 11 h 25. » : nombres hors $ (et seule consigne à l'infinitif du sujet). → indiquer $11~\text{h}~25$. | ×1 |
| canCE1a-2025 (CAN) | correction q15 | « 1 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Fig ‖ « 4 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Figure 3 [champ] Fig ‖ « 3 » hors $ : [champ] Figure 4 [champ] Figure 3 [champ] Figure 2 Le carré ( | ×20 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé q18 | « 11 » hors $ : Placer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : cer correctement les aiguilles pour indiquer 11 h 25. [champ] | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q18 | « 11 » hors $ : Placer correctement les aiguilles pour indiquer 11 h 25. [champ] ‖ « 25 » hors $ : cer correctement les aiguilles pour indiquer 11 h 25. [champ] | ×2 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026/canCE1-2026-Q18.ts | Q18 : « indique 22h15 » (énoncé et correction) : nombres hors $ et sans espaces. → $22~\text{h}~15$ | ×1 |
| canCE1a-2026 (CAN) | correction q15 | « 1 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Figur ‖ « 4 » hors $ : [champ] Figure 1 [champ] Figure 4 [champ] Figure 3 [champ] Figur ‖ « 3 » hors $ : [champ] Figure 4 [champ] Figure 3 [champ] Figure 2 La figure 4 | ×22 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) | énoncé q4 | « 4 » hors $ : Coche la bonne réponse. 4 kilogrammes, c'est [champ] | ×1 ; sup=false (revue-0-a) |
| canCE2-2026 (CAN) | énoncé non interactif q4 | « 4 » hors $ : Coche la bonne réponse. 4 kilogrammes, c'est [champ] | ×1 |
| canCE2a-2025 (CAN) | src/exercices/can/canCE2a-2025 | Q15 : bonne réponse mise en évidence « Il y a 9 fois 6 et il reste 2 » : nombres hors $ dans texteEnCouleurEtGras ; « La bonne réponse était » (temps). → texteEnCouleurEtGras('Il y a') $miseEnEvidence(9)$ … | ×1 |
| canCE2a-2025 (CAN) | énoncé q13 | « 70 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit ‖ « 2 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit-on me rendre ? [ch ‖ « 50 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit-on me rendre ? [champ] € | ×12 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | correction q15 | « 9 » hors $ : . La bonne réponse était : Il y a 9 fois 6 et il reste 2. ‖ « 2 » hors $ : bonne réponse était : Il y a 9 fois 6 et il reste 2. ‖ « 5 » hors $ : onne réponse était : Il y a 7 fois 10 et il reste 5. | ×6 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q13 | « 70 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit ‖ « 2 » hors $ : Un drone coûte 70 €. Je paye avec 2 billets de 50 €. Combien doit-on me rendre ? ‖ « 238 » hors $ : re suis-je ? Je suis un nombre compris entre 238 et 300 et mon chiffre des dizaines est 3. | ×6 |
| CM1C1E (cm1) | titre | « 10 » hors $ : Multiplier un nombre entier par 10, 100 ou 1 000 | ×4 |
| CM1C1F (cm1) | titre | « 10 » hors $ : Multiplier un nombre décimal par 10 | ×1 |
| CM1C1G (cm1) | titre | « 10 » hors $ : Diviser un nombre décimal par 10 | ×1 |
| CM1C1J (cm1) | titre | « 4 » hors $ : Multiplier un nombre par 4 ou 8 | ×2 |
| CM1C1K (cm1) | titre | « 5 » hors $ : Multiplier un nombre par 5 | ×1 |
| CM1C2C (cm1) | correction q3 | « 1 » hors $ : Méthode 1 : [ ‖ « 2 » hors $ : e] [figure] Méthode 2 : [ | ×202 ; sup=3 sup2=3 sup3=4 ; sup=2 sup2=1 sup3=1… (revue-0-a) |
| CM1C2C (cm1) | correction non interactive q3 | « 1 » hors $ : Méthode 1 : [ ‖ « 2 » hors $ : e] [figure] Méthode 2 : [ | ×4 |
| CM1N1E (cm1) | src/exercices/CM1/CM1N1E.ts | Énoncés « composé de 4 chiffres », « On trouve 4 au rang des unités », « est 3 » : chiffres hors $ ; corrections « c'est bien le chiffre des dizaines . » (espace avant le point). → $4$ chiffres ; $4$ ; …des dizaines. | ×1 |
| CM1N1E (cm1) | énoncé q1 | « 4 » hors $ : Je suis un mystérieux nombre entier composé de 4 chiffres, tous différents les uns des autres. a) ‖ « 4 » hors $ : tous différents les uns des autres. a) On trouve 4 au rang des unités. b) La moitié de mon chiffre ‖ « 3 » hors $ : Je suis un nombre entier à 3 chiffres, tous différents. a) Le chiffre des un | ×114 ; sup=4 sup2=3 sup3=1-2-7-8 sup4=true sup5=true ; sup=1 sup2=1 sup3=1-2-7-8 sup4=true sup5=true… (revue-0-a) |
| CM1N1E (cm1) | correction q1 | « 0 » hors $ : ), donc le chiffre est soit 0. Le nombre mystère est donc ‖ « 9 » hors $ : ), donc le chiffre est soit 9, soit 8, soit 7. Les indices ne suffisent pas, à ‖ « 8 » hors $ : ), donc le chiffre est soit 9, soit 8, soit 7. Les indices ne suffisent pas, à eux seu | ×117 ; sup=1 sup2=2 sup3=1 sup4=false sup5=false ; sup=1 sup2=3 sup3=2 sup4=true sup5=false… (revue-2-a) |
| CM1N1E (cm1) | énoncé non interactif q1 | « 4 » hors $ : Je suis un mystérieux nombre entier composé de 4 chiffres, tous différents les uns des autres. a) ‖ « 4 » hors $ : tous différents les uns des autres. a) On trouve 4 au rang des unités. b) La moitié de mon chiffre | ×2 |
| CM1N2B (cm1) | titre | « 1 » hors $ : fraction (partie entière + fraction inférieure à 1) | ×1 |
| CM1N2B (cm1) | consigne | « 1 » hors $ : d'un nombre entier et d'une fraction inférieure à 1. | ×1 ; sup=2-3-4-5-6-7-8-9-10-11 sup2=1-2-3 sup3=true (revue-0-a) |

## N2

**Séparateur des milliers** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2022 (CAN) | correction q2 | nombre sans séparateur de milliers : $= 37000 + 8={\color{}\boldsymbol$ ‖ nombre sans séparateur de milliers : $7000 + 8={\color{}\boldsymbol{37008}}$ ‖ nombre à 4 chiffres sans séparateur : $85+\dfrac{4}{1000}+\dfrac{3}{10}=85+0,004+0$ | ×9 ; sup2=false ; sup2=true (revue-0-a) |
| can6a-2024 (CAN) | src/exercices/can/can6a-2024 | Q12 : « ⟦5500⟧ » sans séparateur ; Q17 : « Joachim a 15 billes. Il en a 5 fois moins » : nombres hors $ ; Q20 : « En $2$h » sans espace ; mêmes questions que canc3a-2024 (Q4, Q15, Q18, Q23, Q28 déjà notées). → $5\,500$ ; $15$ billes | ×1 |
| canc3a-2024 (CAN) | src/exercices/can/canc3a-2024 | Q28 : correction « $1$ L $=1000$ mL » (séparateur, unités hors maths) ; Q3 (sujet officiel) : « ⟦2500⟧ » sans séparateur ni point. → $1~\text{L}=1\,000~\text{mL}$ | ×1 |

## N3

**Point décimal** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | correction q30 | point décimal : $5\div 2=2.5$ | ×1 ; sup2=true (revue-1-a) |
| can5a-2023 (CAN) | correction q22 | point décimal : $AB=4-(-2.5)={\color{}\boldsymbol{6,5}$ | ×1 ; sup2=true (revue-0-a) |
| can5a-CoopMaths (CAN) | correction q19 | point décimal : $mes 5 = 45 \div 2 \times 10 = 22.5\times 10 ={\color{}\bolds$ ‖ point décimal : $60\times 1.5 = {\color{}\boldsymbol{75}$ ‖ point décimal : $45\times 3.5 = {\color{}\boldsymbol{146$ | ×4 ; sup=31 ; sup=19… (revue-0-a) |
| can6C53-03 (CAN) | correction q1 | point décimal : $frac{8}{28} +\dfrac{4}{28} \\[0.7em] &={\color{}\boldsymbol{$ ‖ point décimal : $oldsymbol{\dfrac{12}{28}}} \\[0.7em] &= {\color{}\boldsymbol$ ‖ point décimal : $dfrac{2}{8} + \dfrac{4}{8} \\[0.7em] &={\color{}\boldsymbol{$ | ×17 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C53-04 (CAN) | correction q1 | point décimal : $ac{12}{42} + \dfrac{7}{42} \\[0.7em] &= {\color{}\boldsymbol$ ‖ point décimal : $ac{15}{20} - \dfrac{4}{20} \\[0.7em] &= {\color{}\boldsymbol$ ‖ point décimal : $rac{4}{20} + \dfrac{5}{20} \\[0.7em] &= {\color{}\boldsymbol$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts:629 | Q12 : réponse mise en évidence « 0.18 » (point décimal) : miseEnEvidence(sortie.reponse) sans texNombre. → miseEnEvidence(texNombre(sortie.reponse, 2)) | ×1 |
| CM1C1K (cm1) | correction q2 | point décimal : $s 5 = (61\div 2 ) \times 10 = 30.5\times 10=305$ | ×9 ; défaut ; défaut nb=10 (revue-0-a) |

## N6

**Écriture algébrique (1x, +-, -0…)** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4L2-06 (CAN) | correction q1 | coefficient 1 écrit : $n{aligned} y-0,79y&=1y-0,79y\\ &=(1-0,79$ ‖ coefficient 1 écrit : $gned} 0,21n-n&=0,21n-1n\\ &=(0,21-1)n\\$ ‖ coefficient 1 écrit : $n{aligned} b-0,45b&=1b-0,45b\\ &=(1-0,45$ | ×5 ; défaut nb=10 (revue-1-a) |
| can5a-NY2025 (CAN) | correction q17 | signes accolés : $20,25=20+0,25=20++\dfrac{1}{{\color{}\boldsymb$ | ×1 ; sup=false (revue-0-a) |

## N7

**Zéros significatifs (prix…)** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5P1-05 (CAN) | src/exercices/can/5e/can5P1-05.ts | Prix « $0,40$ € » puis « $0,8$ € » dans la même correction ; unités hors maths. → $0{,}80~\text{€}$ (texPrix) | ×1 |
| can6C6-01 (CAN) | src/exercices/can/6e/can6C6-01.ts | Correction « $20-15,2=4,80$ euros » : zéros des centimes incohérents dans un même calcul, « euros » puis « € ». → $20-15{,}20=4{,}80$ € | ×1 |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts:1468 | Q27 : « $4,3$ € » : prix sans le zéro des centimes. → texPrix : $4{,}30$ € | ×1 |

## R4

**Dernière phrase en saisie libre** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canc3a-2024 (CAN) | src/exercices/can/canc3a-2024/canc3a-2024-Q23.ts:35 | Q23 : énoncé « La moitié de $54$ » suivi du champ, sans verbe (« est »), en interactif comme en non interactif. → La moitié de $54$ est : | ×1 |
| canc3a-2026 (CAN) | src/exercices/can/canc3a-2026 | Q5 « Le double de $19$ », Q18 « La moitié de $250$ » : énoncé sans verbe avant le champ ; Q15 « Combien de fois $\dfrac{1}{10}$ d'unité dans $1$ unité ? » (verbe manquant). → Le double de $19$ est : … ; Combien de fois y a-t-il … | ×1 |
| canc3a-2026b (CAN) | src/exercices/can/canc3a-2026 | Mêmes questions que canc3a-2026 : Q5, Q15, Q18 sans verbe ; Q11 pointillés en correction ; Q30 « partager $370$ en $10$ ». → Voir canc3a-2026. | ×1 |

## T1

**Espace avant %** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 1A-E04-1 (1e) | src/exercices/1e/1A-E04-1.ts:84 | % sans espace insécable : ${p} % | ×1 |
| 2I11-3 (2e) | src/exercices/1eTec/1Tec-A1-2.ts:2 | % sans espace insécable : Appliquer un pourcentage avec 10%, 20%, ... | ×1 |
| 2S20-13 (2e) | src/exercices/2e/2S20-13.ts:49 | % sans espace insécable : L'acier inoxydable 18/8 contient principalement du fer, avec environ 18 % de chrome et 8 % de nickel. | ×1 |
| 2S20-13 (2e) | src/exercices/2e/2S20-13.ts:90 | % sans espace insécable : L'alliage Ti-6Al-4V contient, en composition simplifiée, 6 % d'aluminium et 4 % de vanadium, le reste étant du titane. | ×1 |
| 5I1D (5e) | src/exercices/5e/5I1D.ts:1051 | % sans espace insécable : 100% | ×1 |
| 5I1D (5e) | src/exercices/5e/5I1D.ts:1076 | % sans espace insécable : 100% | ×1 |
| 5I1D (5e) | src/exercices/5e/5I1D.ts:1087 | % sans espace insécable : 100% | ×1 |
| 6I1B-8 (6e) | src/exercices/6e/6I1B-8.ts:364 | % sans espace insécable : 50% | ×2 |
| 6N3P (6e) | src/exercices/6e/6N3P.ts:20 | % sans espace insécable : Résoudre des problèmes de calcul de pourcentage par complément à 100% | ×1 |
| 6N3Q-1 (6e) | src/exercices/6e/6N3Q-1.ts:22 | % sans espace insécable : Prendre 1 %, 10 % ou 50 % d'un nombre | ×1 |
| 6N3Q-3 (6e) | src/exercices/6e/6N3Q-3.ts:155 | % sans espace insécable : 1 : Valeurs entières et 10%, 20%...\n2 : Valeurs entières et 10%, 20%... mais aussi 25% et 50%\n3 : Valeurs entières et 4%, 23%...\n4 : Une décimale comme 34,5% | ×1 |
| can5P2-01 (CAN) | titre | « t % » sans espace insécable : Prendre t % d’une quantité | ×1 |
| can6P2-03 (CAN) | src/exercices/can/6e/can6P2-03.ts:8 | % sans espace insécable : Résoudre un problème de calcul de pourcentage par complément à 100% | ×1 |
| can6P2-03 (CAN) | titre | « 0% » sans espace insécable : blème de calcul de pourcentage par complément à 100% | ×1 |
| apps/_ExternalApp.ts (hors référentiel) | src/exercices/apps/_ExternalApp.ts:41 | % sans espace insécable : 100% | ×1 |
| apps/_ExternalApp.ts (hors référentiel) | src/exercices/apps/_ExternalApp.ts:47 | % sans espace insécable : 100% | ×1 |
| c9016 (Non classés) | src/exercices/can/can2a-2025/can2a-2025-Q4.ts:7 | % sans espace insécable : Appliquer 25 % sur un nombre | ×1 |

## T2

**Unité (espace, \text)** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-CoopMaths (CAN) | correction q13 | unité hors \text : $3h 34min = 3 \times 60 + 34= 214$ | ×2 ; sup=31 ; sup=13 (revue-0-a) |
| can6a-2024 (CAN) | énoncé non interactif q28 | unité hors \text : $\text{450\,mL}+....\,\text{mL} =1\, \t$ | ×1 |
| can6G2-01 (CAN) | correction q1 | unité sans espace : $3\text{cm} \times 3\text{cm} \$ ‖ unité sans espace : $3\text{cm} \times 3\text{cm} \times 3\text{cm} =$ ‖ unité sans espace : ${cm} \times 3\text{cm} \times 3\text{cm} = 27\text{cm}^3$ | ×56 ; sup=2 sup2=1 sup3=true sup4=2 ; sup=2 sup2=1 sup3=false sup4=2… (revue-21-a) |
| can6G2-02 (CAN) | correction q1 | unité sans espace : $3\text{cm} \times 3\text{cm} \$ ‖ unité sans espace : $3\text{cm} \times 3\text{cm} \times 3\text{cm} =$ ‖ unité sans espace : ${cm} \times 3\text{cm} \times 3\text{cm} = 27\text{cm}^3$ | ×56 ; sup=2 sup2=1 sup3=true sup4=2 ; sup=2 sup2=1 sup3=false sup4=2… (revue-22-a) |
| can6M3-03 (CAN) | src/exercices/can/6e/can6M3-03.ts | Correction « $4$ $\text{cm}\times 2$ $\text{cm}\times 6$ $\text{cm}=⟦48⟧$ $\text{cm}^3$ » : formule découpée en morceaux. → $4~\text{cm}\times 2~\text{cm}\times 6~\text{cm}=⟦48⟧~\text{cm}^3$ | ×1 |
| canc3a-2024 (CAN) | énoncé non interactif q28 | unité hors \text : $\text{450\,mL}+....\,\text{mL} =1\, \t$ | ×1 |
| canc3a-2025 (CAN) | src/exercices/can/canc3a-2025 | Q6, Q8, Q13, Q23, Q27 : heures, masses et prix avec unité hors maths (« $9$ h $45$ min », « $18$ g », « $2,70$ € », « $5$ euros » à côté de « € »). → $9~\text{h}~45~\text{min}$ | ×1 |
| canc3D03 (CAN) | src/exercices/can/c3/canc3D03.ts | Énoncé « Calculer $1\text{ h } 30$ min + $1\text{ h } 10$ min. » : formule coupée, « min » et « + » hors maths. → Calculer $1~\text{h}~30~\text{min}+1~\text{h}~10~\text{min}$. | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q8.ts:39 | Q8 : propositions et correction « $45$ s », « $15$ min » : unité hors maths, sans \text ni espace insécable dans la formule. → $45~\text{s}$ | ×1 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026/canCE1-2026-Q8.ts | Q8 : propositions « $25$ m », « $25$ g », « $25$ cm » : unité hors maths. → $25~\text{cm}$ | ×1 |
| canCE2-2026 (CAN) | src/exercices/can/canCE2a-2026 | Q4, Q6, Q13 : « $4\,000$ g », « $1$ kg $= 1\,000$ g », « $10$ € » : unités hors maths ; Q13 « J'ai donné: » sans espace insécable, corrections sans point final. → $4~\text{kg}=4\,000~\text{g}$ | ×1 |
| canCE2a-2025 (CAN) | src/exercices/can/canCE2a-2025 | Q6, Q13 : « $7$ € », « 70 € », correction « $100$ € - $70$ € $ = 30$ € » : unités et signe moins hors maths, formule coupée. → $100~\text{€}-70~\text{€}=30~\text{€}$ | ×1 |

## T3

**Espace avant : ; ! ?** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2023 (CAN) | énoncé q17 | « :: » sans espace insécable : eenFlag est cliqué stylo en position d'écriture :: pen répéter [4] fois avancer de [6] pas | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | énoncé non interactif q17 | « :: » sans espace insécable : eenFlag est cliqué stylo en position d'écriture :: pen répéter [4] fois avancer de [6] pas | ×1 |
| can5A-01 (CAN) | énoncé q1 | « :: » sans espace insécable : enFlag est cliqué stylo en position d'écriture :: pen répéter [...] fois avancer de [20] p | ×2 ; défaut ; défaut nb=10 (revue-0-a) |
| can5A-01 (CAN) | énoncé non interactif q1 | « :: » sans espace insécable : enFlag est cliqué stylo en position d'écriture :: pen répéter [...] fois avancer de [20] p | ×1 |
| can6C2-02 (CAN) | consigne | espace ordinaire (sécable) avant « : » : Calculer : | ×1 ; défaut (revue-0-a) |
| can6C2-03 (CAN) | consigne | espace ordinaire (sécable) avant « : » : Calculer : | ×1 ; défaut (revue-0-a) |
| can6C3-02 (CAN) | consigne | espace ordinaire (sécable) avant « : » : Calculer : | ×1 ; sup2=false (revue-0-a) |
| can6I-01 (CAN) | énoncé q1 | « x: » sans espace insécable : mp] quand @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [ ‖ « y: » sans espace insécable : quand @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] pas ‖ « :: » sans espace insécable : [90] degrés avancer de [40] pas Note la couleur :: list | ×318 ; sup=1 sup2=true sup4=true ; sup=1 sup2=true sup4=false… (revue-0-a) |
| can6I-01 (CAN) | énoncé non interactif q1 | « x: » sans espace insécable : ter. quand @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [ ‖ « y: » sans espace insécable : quand @greenFlag est cliqué aller à x: [50] y: [50] s'orienter à [180] avancer de [20] pas ‖ « :: » sans espace insécable : [90] degrés avancer de [40] pas Note la couleur :: list | ×18 |
| canCE2-2026 (CAN) | correction q13 | « é: » sans espace insécable : J'ai donné: | ×2 ; sup=false ; sup=true (revue-0-a) |
| CM1N1E (cm1) | titre | espace ordinaire (sécable) avant « : » : Deviner : je suis un nombre entier mystère | ×1 |

## T4

**Guillemets** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6M4-04 (CAN) | énoncé q1 | guillemet sans insécable : esseur demande à un élève : « ‖ guillemet sans insécable : ? » La réponse correcte à cet ‖ guillemet sans insécable : ur demande à un élève : « | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M4-04 (CAN) | énoncé non interactif q1 | guillemet sans insécable : esseur demande à un élève : « ‖ guillemet sans insécable : ? » La réponse correcte à cet | ×2 |
| can6M4-06 (CAN) | énoncé q1 | guillemet sans insécable : e professeur demande à un élève : « ‖ guillemet sans insécable : ? » La réponse correcte à cette que ‖ guillemet sans insécable : seur demande à un élève : « | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M4-06 (CAN) | énoncé non interactif q1 | guillemet sans insécable : e professeur demande à un élève : « ‖ guillemet sans insécable : ? » La réponse correcte à cette que | ×2 |
| canc3C08 (CAN) | énoncé q1 | guillemet sans insécable : Isabelle dit à Nawel : « J'ai ‖ guillemet sans insécable : € de moins que toi ». Combien d'argent en t ‖ guillemet sans insécable : Léa dit à Gabrielle : « J'ai | ×6 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C08 (CAN) | énoncé non interactif q1 | guillemet sans insécable : Isabelle dit à Nawel : « J'ai ‖ guillemet sans insécable : € de moins que toi ». Combien d'argent en t | ×2 |
| canc3C23 (CAN) | correction q3 | guillemet sans insécable : , on peut penser : « Combien faut-il ajouter à ‖ guillemet sans insécable : ? » | ×4 ; défaut nb=10 (revue-1-a) |
| canc3N08 (CAN) | énoncé q1 | guillemet sans insécable : Dans la suite répétitive « ABABAB ‖ guillemet sans insécable : », quelle est la ‖ guillemet sans insécable : Dans la suite répétitive « ABCABCABC | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3N08 (CAN) | énoncé non interactif q1 | guillemet sans insécable : Dans la suite répétitive « ABABAB ‖ guillemet sans insécable : », quelle est la | ×2 |
| canCE1a-2025 (CAN) | énoncé q4 | guillemet sans insécable : cases et tombe sur « recule de ‖ guillemet sans insécable : cases ». Magalie doit alors aller sur la case [champ] ‖ guillemet sans insécable : cases ». Zoé doit alors aller sur la case [champ] . | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | guillemet sans insécable : cases et tombe sur « recule de ‖ guillemet sans insécable : cases ». Magalie doit alors aller sur la case | ×2 |

## T9

**Mot non écrit en \text dans une formule** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| canCE2-2026 (CAN) | src/exercices/can/canCE2a-2026 | Q3 : correction « $558 + 5 dizaines = 558 + 50$ » : mot « dizaines » en italique mathématique, sans espace. → $558 + 5\text{ dizaines} = 558+50$ | ×1 |

## X5

**Débordement à 390 px** (gravité 4 : Typographie)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | correction | page de 493 px pour 390 px | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | correction | page de 403 px pour 390 px | ×3 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | correction | page de 484 px pour 390 px | ×2 ; sup2=false ; sup2=true (revue-0-b) |
| can4a-NY2024 (CAN) | correction | page de 398 px pour 390 px | ×1 ; défaut (revue-0-b) |
| can4a-NY2025 (CAN) | correction | page de 504 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| can4a-NY2026 (CAN) | correction | page de 560 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| can4C22-02 (CAN) | correction | page de 466 px pour 390 px | ×1 ; défaut nb=10 (revue-1-a) |
| can4C22-03 (CAN) | correction | page de 441 px pour 390 px | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can4C3-01 (CAN) | correction | page de 429 px pour 390 px | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can4L2-04 (CAN) | correction | page de 404 px pour 390 px | ×1 ; défaut nb=10 (revue-1-a) |
| can5a-2020 (CAN) | correction | page de 493 px pour 390 px | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) | énoncé q26 | table.tableauMathlive de 527 px pour 390 px | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) | énoncé | page de 543 px pour 390 px | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) | correction | page de 493 px pour 390 px | ×2 ; sup= (revue-0-a) |
| can5a-2022 (CAN) | correction | page de 493 px pour 390 px | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2023 (CAN) | correction | page de 464 px pour 390 px | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2026 (CAN) | énoncé | page de 429 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2024 (CAN) | correction | page de 398 px pour 390 px | ×1 ; défaut (revue-0-a) |
| can5a-NY2025 (CAN) | correction | page de 408 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) | correction | page de 560 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| can5C2-02 (CAN) | correction | page de 450 px pour 390 px | ×1 ; défaut nb=10 (revue-1-a) |
| can5C2-06 (CAN) | correction | page de 463 px pour 390 px | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C2-07 (CAN) | correction | page de 419 px pour 390 px | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can6a-2018 (CAN) | correction | page de 432 px pour 390 px | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2024 (CAN) | correction | page de 415 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) | énoncé | page de 400 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) | correction | page de 428 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2024 (CAN) | correction | page de 422 px pour 390 px | ×1 ; défaut (revue-0-b) |
| can6a-NY2025 (CAN) | correction | page de 504 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| can6a-NY2026 (CAN) | correction | page de 560 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| can6G2-01 (CAN) | correction q1 | img de 400 px pour 390 px | ×60 ; sup=1 sup2=1 sup3=true sup4=1 ; sup=1 sup2=1 sup3=true sup4=2… (revue-1-a) |
| can6G2-01 (CAN) | correction | page de 416 px pour 390 px | ×60 ; sup=1 sup2=1 sup3=true sup4=1 ; sup=1 sup2=1 sup3=true sup4=2… (revue-1-a) |
| can6G2-02 (CAN) | correction q1 | img de 400 px pour 390 px | ×60 ; sup=1 sup2=1 sup3=true sup4=1 ; sup=1 sup2=1 sup3=true sup4=2… (revue-1-a) |
| can6G2-02 (CAN) | correction | page de 416 px pour 390 px | ×60 ; sup=1 sup2=1 sup3=true sup4=1 ; sup=1 sup2=1 sup3=true sup4=2… (revue-1-a) |
| can6I-01 (CAN) | énoncé q1 | table de 623 px pour 390 px | ×202 ; sup=1 sup2=true sup4=true ; sup=1 sup2=true sup4=false… (revue-0-a) |
| can6I-01 (CAN) | énoncé | page de 639 px pour 390 px | ×33 ; sup=1 sup2=true sup4=true ; sup=1 sup2=true sup4=false… (revue-0-a) |
| can6N1-01 (CAN) | correction | page de 432 px pour 390 px | ×2 ; sup=false ; sup=true nb=10 (revue-1-b) |
| can6N1-04 (CAN) | correction | page de 460 px pour 390 px | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3a-2023 (CAN) | correction | page de 393 px pour 390 px | ×1 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts | Q10 : correction « soixante-et-un-mille-cinquante = 61 000 + 50 = 61 050 » coupée à droite à 390 px (formule d'un seul tenant, mot dans \text). → Mot hors formule, formule à la ligne. | ×1 |
| canc3a-2024 (CAN) | correction | page de 415 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé | page de 400 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | correction | page de 437 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| canc3a-2026b (CAN) | énoncé | page de 400 px pour 390 px | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2024 (CAN) | correction | page de 398 px pour 390 px | ×2 ; défaut (revue-0-a) |
| canc3a-NY2025 (CAN) | correction | page de 504 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| canc3a-NY2026 (CAN) | correction | page de 560 px pour 390 px | ×1 ; sup=false (revue-0-b) |
| canc3C02 (CAN) | correction | page de 430 px pour 390 px | ×3 ; défaut ; défaut nb=10 (revue-0-a) |

## C1

**Contenu mathématique faux ou ambigu** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-2023 (CAN) | src/exercices/can/5e/can5a-2023.ts | Q30 : « il faut que la somme des chiffres soit $9$ » (un multiple de 9) ; Q22 : « $AB=4-(-2.5)$ » (point décimal) ; Q26 : « En 1h 30 min » hors maths. → il faut que la somme des chiffres soit un multiple de $9$ | ×1 |
| canc3a-2026 (CAN) | src/exercices/can/canc3a-2026 | Q30 : « Il faut partager $370$ en $10$ » : on fait des paquets de 10 (partager en 10 donne 10 parts de 37) ; Q17 : « soit $8+2$ » sans unité ni sens clair. → Il faut faire des paquets de $10$ : $370=37\times 10$. | ×1 |

## M3

**QCM : la bonne proposition n’est pas mise en évidence telle quelle (à vérifier)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×2 ; sup=false (revue-0-a) |
| can4a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×2 ; sup=true (revue-1-a) |
| can4a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×3 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×1 ; sup=false (revue-0-b) |
| can4G1-05 (CAN) |  q1 qcm | QCM : bonne proposition (faux) absente de la mise en évidence (n'estpasrectangle) | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G1-05 (CAN) |  q1 qcm | QCM : bonne proposition (vrai) absente de la mise en évidence (estrectangle) | ×7 ; défaut ; défaut nb=10 (revue-0-b) |
| can5a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×2 ; sup=false (revue-0-a) |
| can5a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×2 ; sup=true (revue-1-a) |
| can5a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×3 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×1 ; sup=false (revue-0-b) |
| can6a-2024 (CAN) |  q10 qcm | QCM : bonne proposition (54cm) absente de la mise en évidence (54) | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2025 (CAN) |  q15 qcm | QCM : bonne proposition (figureb) absente de la mise en évidence (b) | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2025 (CAN) |  q16 qcm | QCM : bonne proposition (figurea) absente de la mise en évidence (a) | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-Aléa (CAN) |  q4 qcm | QCM : bonne proposition (0,64) absente de la mise en évidence () | ×1 ; sup=All nb=10 (revue-1-a) |
| can6a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×2 ; sup=false (revue-0-a) |
| can6a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×2 ; sup=true (revue-1-a) |
| can6a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×3 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×1 ; sup=false (revue-0-b) |
| canc3a-2024 (CAN) |  q10 qcm | QCM : bonne proposition (54cm) absente de la mise en évidence (54) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) |  q15 qcm | QCM : bonne proposition (figureb) absente de la mise en évidence (b) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) |  q16 qcm | QCM : bonne proposition (figurea) absente de la mise en évidence (a) | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×2 ; sup=false (revue-0-a) |
| canc3a-NY2025 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×2 ; sup=true (revue-1-a) |
| canc3a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (non) absente de la mise en évidence (n'estpasunmultiple) | ×3 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2026 (CAN) |  q15 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (estunmultiple) | ×1 ; sup=false (revue-0-b) |
| canc3C05 (CAN) |  q1 qcm | QCM : bonne proposition (non) absente de la mise en évidence (impair) | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C05 (CAN) |  q2 qcm | QCM : bonne proposition (oui) absente de la mise en évidence (pair) | ×7 ; défaut nb=10 (revue-1-a) |
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
| CM1N1E (cm1) |  q1 qcm | QCM : bonne proposition (312) absente de la mise en évidence () | ×42 ; sup=3 sup2=6 sup3=7 sup4=true sup5=true ; sup=4 sup2=1 sup3=3 sup4=true sup5=true… (revue-20-a) |
| CM1N1E (cm1) |  q1 qcm | QCM : bonne proposition (70,248) absente de la mise en évidence () | ×6 ; sup=5 sup2=7 sup3=2 sup4=true sup5=true ; sup=6 sup2=7 sup3=3 sup4=true sup5=true… (revue-35-a) |

## N1

**Nombre hors $** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | titre | ordinal « 4e » hors $ : CAN 4e sujet 2021 | ×1 |
| can4a-2022 (CAN) | titre | ordinal « 4e » hors $ : CAN 4e sujet 2022 | ×1 |
| can4a-2023 (CAN) | titre | ordinal « 4e » hors $ : CAN 4e sujet 2023 | ×1 |
| can4a-2024 (CAN) | titre | ordinal « 4e » hors $ : CAN 4e sujet 2024 | ×1 |
| can4a-2025 (CAN) | titre | ordinal « 4e » hors $ : CAN 4e sujet 2025 | ×1 |
| can4a-2026 (CAN) | titre | ordinal « 4e » hors $ : CAN 4e sujet 2026 | ×1 |
| can4a-NY2024 (CAN) | titre | ordinal « 4ème » hors $ : CAN Spéciale année 2024 - 4ème | ×1 |
| can5a-2020 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2020 | ×1 |
| can5a-2021 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2021 | ×1 |
| can5a-2022 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2022 | ×1 |
| can5a-2023 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2023 | ×1 |
| can5a-2024 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2024 | ×1 |
| can5a-2025 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2025 | ×1 |
| can5a-2026 (CAN) | titre | ordinal « 5e » hors $ : CAN 5e sujet 2026 | ×1 |
| can5a-CoopMaths (CAN) | titre | ordinal « 5e » hors $ : Course aux nombres début de 5e | ×1 |
| can5a-NY2024 (CAN) | titre | ordinal « 5ème » hors $ : CAN Spéciale année 2024 - 5ème | ×1 |
| can6a-2018 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2018 | ×1 |
| can6a-2021 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2021 | ×1 |
| can6a-2022 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2022 | ×1 |
| can6a-2023 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2023 | ×1 |
| can6a-2024 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2024 | ×1 |
| can6a-2025 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2025 | ×1 |
| can6a-2026 (CAN) | titre | ordinal « 6e » hors $ : CAN 6e sujet 2026 | ×1 |
| can6a-CoopMaths (CAN) | titre | ordinal « 6e » hors $ : Course aux nombres fin de 6e | ×1 |
| can6a-NY2024 (CAN) | titre | ordinal « 6ème » hors $ : CAN Spéciale année 2024 - 6ème | ×1 |

## N2

**Séparateur des milliers** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | correction q25 | nombre à 4 chiffres sans séparateur : $1000$ ‖ nombre à 4 chiffres sans séparateur : $xt{ m}^3={\color{}\boldsymbol{7800}}$ | ×3 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | énoncé q6 | nombre à 4 chiffres sans séparateur : $85+\dfrac{4}{1000}+\dfrac{3}{10}$ | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | énoncé non interactif q6 | nombre à 4 chiffres sans séparateur : $85+\dfrac{4}{1000}+\dfrac{3}{10}$ | ×1 |
| can4a-2024 (CAN) | correction q7 | nombre à 4 chiffres sans séparateur : $8,94\times 1000={\color{}\boldsymbol{8\,9$ | ×1 ; sup=false (revue-0-a) |
| can4C3-02 (CAN) | correction q2 | nombre à 4 chiffres sans séparateur : $es(-10)={\color{}\boldsymbol{-1000}}$ | ×1 ; défaut nb=10 (revue-1-a) |
| can4C4-02 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $imes(999+1)\\ &=876\times 1000\\ &={\color{}\boldsym$ | ×3 ; défaut nb=10 (revue-1-a) |
| can5a-2022 (CAN) | correction q5 | nombre à 4 chiffres sans séparateur : $times 83={\color{}\boldsymbol{8300}}$ ‖ nombre à 4 chiffres sans séparateur : $86+\dfrac{2}{1000}+\dfrac{3}{10}=86+0,002+0$ ‖ nombre à 4 chiffres sans séparateur : $29\times 101 = 2929$ | ×5 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) | énoncé q6 | nombre à 4 chiffres sans séparateur : $86+\dfrac{2}{1000}+\dfrac{3}{10}$ | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) | énoncé non interactif q6 | nombre à 4 chiffres sans séparateur : $86+\dfrac{2}{1000}+\dfrac{3}{10}$ | ×1 |
| can5a-2024 (CAN) | correction q7 | nombre à 4 chiffres sans séparateur : $8,94\times 1000={\color{}\boldsymbol{8\,9$ ‖ nombre sans séparateur de milliers : $19397$ ‖ nombre sans séparateur de milliers : $19397+56432$ | ×5 ; sup=false ; sup=true (revue-0-a) |
| can5a-2025 (CAN) | correction q11 | nombre à 4 chiffres sans séparateur : $9\times 1000 + 5\times 0,001 = 9\,000+$ | ×1 ; sup=false (revue-0-a) |
| can5a-CoopMaths (CAN) | correction q12 | nombre à 4 chiffres sans séparateur : $mes 10 = {\color{}\boldsymbol{2770}}$ | ×2 ; sup=31 ; sup=12 (revue-0-a) |
| can5a-NY2024 (CAN) | correction q18 | nombre à 4 chiffres sans séparateur : $2\,024\div 1000={\color{}\boldsymbol{2,02$ | ×1 ; défaut (revue-0-a) |
| can5C1-09 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $3\div 1000={\color{}\boldsymbol{0,00$ ‖ nombre à 4 chiffres sans séparateur : $7\times 1000={\color{}\boldsymbol{7\,0$ | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C2-01 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $mes 303= {\color{}\boldsymbol{2727}}$ | ×5 ; défaut nb=10 (revue-1-a) |
| can5C3-05 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $1000$ ‖ nombre à 4 chiffres sans séparateur : $347\times 0,001=347\div 1000=0,34\underline{7}$ ‖ nombre à 4 chiffres sans séparateur : $956\div 0,001=956\times 1000=95\underline{6}\,000$ | ×18 ; sup=3 ; sup=1… (revue-0-a) |
| can5C4-04 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $0,215=\dfrac{215}{1000}=\dfrac{\cancel{5}\times4$ ‖ nombre à 4 chiffres sans séparateur : $olor{}\boldsymbol{\dfrac{253}{1000}}}$ ‖ nombre à 4 chiffres sans séparateur : $color{}\boldsymbol{\dfrac{23}{1000}}}$ | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C4-04 (CAN) | correction non interactive q1 | nombre à 4 chiffres sans séparateur : $0,215=\dfrac{215}{1000}=\dfrac{\cancel{5}\times4$ | ×1 |
| can6a-2018 (CAN) | correction q3 | nombre à 4 chiffres sans séparateur : $3928=392\times 10+8$ ‖ nombre à 4 chiffres sans séparateur : $3928$ | ×2 ; sup2=false (revue-1-a) |
| can6a-2021 (CAN) | correction q10 | nombre à 4 chiffres sans séparateur : $3861=386\times 10+1$ ‖ nombre à 4 chiffres sans séparateur : $3861$ | ×2 ; défaut (revue-0-a) |
| can6a-2021 (CAN) | énoncé q16 | nombre à 4 chiffres sans séparateur : $3788$ | ×2 ; défaut (revue-0-a) |
| can6a-2021 (CAN) | énoncé non interactif q16 | nombre à 4 chiffres sans séparateur : $3788$ | ×2 |
| can6a-2022 (CAN) | énoncé q11 | nombre à 4 chiffres sans séparateur : $7,4\times 1000=$ | ×1 ; défaut (revue-0-a) |
| can6a-2022 (CAN) | correction q11 | nombre à 4 chiffres sans séparateur : $7,4\times 1000={\color{}\boldsymbol{7\,4$ ‖ nombre à 4 chiffres sans séparateur : $times 24={\color{}\boldsymbol{2400}}$ | ×2 ; défaut (revue-0-a) |
| can6a-2022 (CAN) | énoncé non interactif q11 | nombre à 4 chiffres sans séparateur : $7,4\times 1000=$ | ×1 |
| can6a-2024 (CAN) | correction q12 | nombre à 4 chiffres sans séparateur : $mes 5,5= {\color{}\boldsymbol{5500}}$ ‖ nombre à 4 chiffres sans séparateur : $=1000$ ‖ nombre à 4 chiffres sans séparateur : $imes 100={\color{}\boldsymbol{2500}}$ | ×3 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2024 (CAN) | correction q6 | nombre à 4 chiffres sans séparateur : $2\,024\div 1000={\color{}\boldsymbol{2,02$ | ×1 ; défaut (revue-0-a) |
| can6C2-04 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $8 \times 3,47\times 125 = 1000 \times 3,47 = {\color{}\b$ ‖ nombre à 4 chiffres sans séparateur : $1000$ | ×9 ; sup=false ; sup=false nb=10 (revue-0-a) |
| can6C2-07 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $4\,729+999=4\,729+\underbrace{1000-1}_{999}=5\,729-1=5\,728$ ‖ nombre à 4 chiffres sans séparateur : $9\,723-999=9\,723\underbrace{-1000+1}_{-999}=8\,723+1=8\,724$ | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C3-03 (CAN) | correction q2 | nombre à 4 chiffres sans séparateur : $1000$ | ×6 ; défaut nb=10 (revue-1-a) |
| can6M3-01 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $6,7\text{ m}^3&nbsp;=6700\text{ L}$ ‖ nombre sans séparateur de milliers : $12,7\text{ m}^3&nbsp;=12700\text{ L}$ | ×6 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M4-02 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $=1000\text{ m}$ | ×6 ; défaut ; défaut nb=10 (revue-0-a) |
| can6N1-05 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $1472=147\times 10+2$ ‖ nombre à 4 chiffres sans séparateur : $1472$ | ×14 ; défaut ; défaut nb=10 (revue-0-a) |
| can6N21-01 (CAN) | énoncé q1 | nombre à 4 chiffres sans séparateur : $42+\dfrac{2}{1000}+\dfrac{7}{10}$ ‖ nombre à 4 chiffres sans séparateur : $\dfrac{2}{10}+\dfrac{4}{1000}$ ‖ nombre à 4 chiffres sans séparateur : ${100}+\dfrac{6}{10}+\dfrac{6}{1000}$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6N21-01 (CAN) | correction q1 | nombre à 4 chiffres sans séparateur : $42+\dfrac{2}{1000}+\dfrac{7}{10}=42+0,002+0$ ‖ nombre à 4 chiffres sans séparateur : $14+\dfrac{1}{1000}+\dfrac{19}{100}=14+0,001$ ‖ nombre à 4 chiffres sans séparateur : $\dfrac{2}{10}+\dfrac{4}{1000}=0,2+0,004={\color{}\bold$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6N21-01 (CAN) | énoncé non interactif q1 | nombre à 4 chiffres sans séparateur : $42+\dfrac{2}{1000}+\dfrac{7}{10}$ | ×1 |
| canc3a-2024 (CAN) | correction q28 | nombre à 4 chiffres sans séparateur : $=1000$ ‖ nombre à 4 chiffres sans séparateur : $imes 100={\color{}\boldsymbol{2500}}$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2024 (CAN) | correction q2 | nombre à 4 chiffres sans séparateur : $20\,240\times 1000={\color{}\boldsymbol{20\,$ ‖ nombre à 4 chiffres sans séparateur : $2\,024\times 1000={\color{}\boldsymbol{2\,0$ | ×2 ; défaut (revue-0-a) |
| canc3a-NY2024 (CAN) | énoncé q8 | nombre à 4 chiffres sans séparateur : $2\,024\times 1000$ | ×1 ; défaut (revue-0-a) |
| canc3a-NY2024 (CAN) | énoncé non interactif q8 | nombre à 4 chiffres sans séparateur : $2\,024\times 1000$ | ×1 |
| canc3C01 (CAN) | énoncé q2 | nombre à 4 chiffres sans séparateur : $1000$ | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C01 (CAN) | correction q2 | nombre à 4 chiffres sans séparateur : $1000\times 2 = {\color{}\bolds$ | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C18 (CAN) | correction q4 | nombre à 4 chiffres sans séparateur : $22\,500 -1200=21\,300$ | ×1 ; défaut nb=10 (revue-1-a) |
| canCE2a-2025 (CAN) | correction q7 | nombre à 4 chiffres sans séparateur : $2+7\,000={\color{}\boldsymbol{9622}}$ | ×1 ; sup=false (revue-0-a) |

## N6

**Écriture algébrique (1x, +-, -0…)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | énoncé q19 | exposant 1 : $10^3+10^0+10^1=$ | ×1 ; sup2=true (revue-1-a) |
| can4a-2021 (CAN) | correction q19 | exposant 1 : $10^3+10^0+10^1= 1\,000+1+10 ={\col$ | ×1 ; sup2=true (revue-1-a) |
| can4C3-01 (CAN) | énoncé q3 | exposant 1 : $10^3+10^2+10^1$ | ×4 ; défaut nb=10 (revue-1-a) |
| can4C3-01 (CAN) | correction q3 | exposant 1 : $10^3+10^2+10^1= 1\,000+100+10 ={\c$ ‖ exposant 1 : $10^1+10^6+10^3= 10+1\,000\,0$ ‖ exposant 1 : $10^1+10^0+10^3= 10+1+1\,000$ | ×4 ; défaut nb=10 (revue-1-a) |
| can4C3-02 (CAN) | énoncé q1 | exposant 1 : $(-6)^1$ | ×2 ; défaut nb=10 (revue-1-a) |
| can4C3-02 (CAN) | correction q1 | exposant 1 : $(-6)^1= {\color{}\boldsymbol{-6}}$ | ×2 ; défaut nb=10 (revue-1-a) |

## R1

**Titre** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 2A-N4-3 (2e) | src/exercices/1e/1A-C04-3.ts:19 | titre terminé par un point : Calculer avec inverse, double, carré, ... | ×1 |
| 2A-N4-4 (2e) | src/exercices/1e/1A-C04-4.ts:18 | titre terminé par un point : Calculer avec tiers, quart, demi, ... | ×1 |
| 2G34-2 (2e) | src/exercices/2e/2G34-2.ts:18 | titre terminé par un point : Tester si un couple de points vérifie un système de deux équations à deux inconnues. | ×1 |
| 2I11-3 (2e) | src/exercices/1eTec/1Tec-A1-2.ts:2 | titre terminé par un point : Appliquer un pourcentage avec 10%, 20%, ... | ×1 |
| 4S20-4 (4e) | src/exercices/4e/4S20-4.ts:8 | titre terminé par un point : Calculer des probabilités. | ×1 |
| 6AutoG1-7 (6e) | src/exercices/6e/6G1autoA.ts:29 | titre terminé par un point : Tracer des droites, segments, ... | ×1 |
| 6AutoN4 (6e) | src/exercices/6e/6AutoN4.ts:21 | titre terminé par un point : Multiplier un décimal par 10, 100, 1000, 0,1, 0,01, 0,001... | ×1 |
| 6AutoN4-1 (6e) | src/exercices/6e/6N2C.ts:16 | titre terminé par un point : Diviser par 10, 100, 1 000 revient à .... | ×1 |
| 6AutoN4-4 (6e) | src/exercices/6e/6N2C-2.ts:20 | titre terminé par un point : Par combien diviser un nombre pour que le chiffre des unités devienne le chiffre des ... ‖ titre sans infinitif en tête : Par combien diviser un nombre pour que le chiffre des unités devienne le chiffre des ... | ×2 |
| 6N1A-5 (6e) | src/exercices/6e/6N1A-5.ts:14 | titre terminé par un point : Écrire un nombre à partir de son nombre de dizaines, de centaines, de milliers... | ×1 |
| can4C21-03 (CAN) | src/exercices/can/4e/can4C21-03.ts:4 | titre terminé par un point : Calculer une fraction de dénominateur 0,25 ou 0,1 ... | ×1 |
| can4C21-03 (CAN) | titre | titre terminé par un point : Calculer une fraction de dénominateur 0,25 ou 0,1 ... | ×1 |
| can5C2-04 (CAN) | src/exercices/can/5e/can5C2-04.ts:9 | titre terminé par un point : Multiplier par 1,5 ou 2,5 ou ... | ×1 |
| can5C2-04 (CAN) | titre | titre terminé par un point : Multiplier par 1,5 ou 2,5 ou ... | ×1 |
| can6N1-04 (CAN) | src/exercices/can/6e/can6N1-04.ts:6 | titre terminé par un point : Déterminer le chiffre des ... | ×1 |
| can6N1-04 (CAN) | titre | titre terminé par un point : Déterminer le chiffre des ... | ×1 |
| canTSpeAN14 (CAN) | src/exercices/can/TSpe/canTSpeAN14.ts:11 | titre terminé par un point : Résoudre une équation en logarithme népérien. | ×1 |
| canTSpeS01 (CAN) | src/exercices/can/TSpe/canTSpeS01.ts:9 | titre terminé par un point : Limite d'un polynôme. ‖ titre sans infinitif en tête : Limite d'un polynôme. | ×2 |
| 6e/_Construire_par_symetrie.ts (hors référentiel) | src/exercices/6e/_Construire_par_symetrie.ts:50 | titre terminé par un point : Construire par symétrie... | ×1 |
| can/can2a-2024/can2a-2024-Q1.ts (hors référentiel) | src/exercices/can/can2a-2024/can2a-2024-Q1.ts:11 | titre terminé par un point : Multiplier par 1,5 ou 2,5 ou ... | ×1 |
| can/can2a-2025C/can2a-2025C-Q15.ts (hors référentiel) | src/exercices/can/can2a-2025C/can2a-2025C-Q15.ts:7 | titre terminé par un point : Calculer avec le vocabulaire : carré, triple, double, etc. | ×1 |
| can/can3a-2024/can3-2024-Q26.ts (hors référentiel) | src/exercices/can/can3a-2024/can3-2024-Q26.ts:14 | titre terminé par un point : Exprimer en fonction de ... | ×1 |
| can/can5a-2024/can5a-2024-Q2.ts (hors référentiel) | src/exercices/can/can5a-2024/can5a-2024-Q2.ts:6 | titre terminé par un point : Calculer avec un quart, un tiers, ... | ×1 |
| can/can5a-2024/can5a-2024-Q7.ts (hors référentiel) | src/exercices/can/can5a-2024/can5a-2024-Q7.ts:6 | titre terminé par un point : Multiplier par $10$ ou $100$ ou ... | ×1 |
| can/can6a-2024/can6a-2024-Q14.ts (hors référentiel) | src/exercices/can/can6a-2024/can6a-2024-Q14.ts:6 | titre terminé par un point : Multiplier par 0,1... | ×1 |
| can/canc3a-2024/canc3a-2024-Q14.ts (hors référentiel) | src/exercices/can/canc3a-2024/canc3a-2024-Q14.ts:6 | titre terminé par un point : Multiplier par 10, ... | ×1 |
| can/canNY-2025/can6NY-2025-Q5.ts (hors référentiel) | src/exercices/can/canNY-2025/can6NY-2025-Q5.ts:6 | titre terminé par un point : Trouver le nombres d'unités, de dizaines, ... | ×1 |
| can/canNY-2026/can6NY-2026-Q5.ts (hors référentiel) | src/exercices/can/canNY-2026/can6NY-2026-Q5.ts:6 | titre terminé par un point : Trouver le nombres d'unités, de dizaines, ... | ×1 |
| 9e8ae (Non classés) | src/exercices/1e/1AL11-8QCM.ts:2 | titre terminé par un point : Calculer une somme de termes. | ×1 |
| testEEE (Non classés) | src/exercices/profs/test.ts:8 | titre terminé par un point : Eric fait ses tests interactifs. ‖ titre sans infinitif en tête : Eric fait ses tests interactifs. | ×2 |
| TEA2-01 (Terminale) | src/exercices/TEx/TEA2-01.ts:9 | titre terminé par un point : Calculer un PGCD avec l'algorithme d'Euclide.  | ×1 |
| TSA2-QCM14 (Terminale) | src/exercices/QCMBac/A2022/Metropole2022_1Q6.ts:13 | titre terminé par un point : Métropole 05/22 : exponentielle. ‖ titre sans infinitif en tête : Métropole 05/22 : exponentielle. | ×2 |
| TSA6-QCM03 (Terminale) | src/exercices/QCMBac/A2024/polynesieJuin2024Q1_alea.ts:18 | titre terminé par un point : Polynésie 06/2024 : équa. diff. ‖ titre sans infinitif en tête : Polynésie 06/2024 : équa. diff. | ×2 |
| TSG1-02 (Terminale) | src/exercices/TSpe/TSG1-02.ts:6 | titre terminé par un point : Effectuer un dénombrement (rangement objets). | ×1 |
| TSG1-03 (Terminale) | src/exercices/TSpe/TSG1-03.ts:5 | titre terminé par un point : Effectuer un dénombrement (code). | ×1 |
| TSG1-04 (Terminale) | src/exercices/TSpe/TSG1-04.ts:14 | titre terminé par un point : Utiliser le dénombrement et les probabilités élémentaires. | ×1 |
| TSG1-05 (Terminale) | src/exercices/TSpe/TSG1-05.ts:4 | titre terminé par un point : Utiliser le produit cartésien. | ×1 |
| TSG1-06 (Terminale) | src/exercices/TSpe/TSG1-06.ts:6 | titre terminé par un point : Effectuer une somme de combinaisons. | ×1 |
| TSG1-09 (Terminale) | src/exercices/TSpe/TSG1-09.ts:6 | titre terminé par un point : Déterminer un nombre de combinaision. | ×1 |
| TSG1-QCM04 (Terminale) | src/exercices/QCMBac/A2024/sujetzero2024Ex5Q4.ts:12 | titre terminé par un point : Sujet zéro 2024 : listes ordonnées. | ×1 |
| TSG2-15 (Terminale) | src/exercices/TSpe/TSG2-15.ts:10 | titre terminé par un point : Prouver que 3 points de l’espace sont ou non alignés. | ×1 |
| TSG2-23 (Terminale) | src/exercices/TSpe/TSG2-23.ts:15 | titre terminé par un point : Calculer une valeur approchée de l'angle formé par trois points de l'espace. | ×1 |
| TSG2-34 (Terminale) | src/exercices/TSpe/TSG2-34.ts:13 | titre terminé par un point : Déterminer si deux droites sont orthogonales. | ×1 |
| TSP2-20 (Terminale) | src/exercices/TSpe/TSP2-20.ts:19 | titre terminé par un point : Tirer des boules avec remise dans une urne. | ×1 |

## R10

**Français (accords, fautes, coquilles)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| transversal (?) | grep « passer des $\\text{…}$ au $ » dans src/exercices | « pour passer des $\text{m}$ au $\text{cm}$ » (aux) dans 26 corrections : can6M4-03 (8 fois), can6M4-05 (4), can6M3-01, can6a-2021 (790, 806), can6a-2025-Q29, canc3a-2025-Q29, canc3a-CM1-2025-Q29, can3a-2026-Q4 (3), can5a-2024-Q9 (3), can3a-2022 (300, 317), can5a-2022 (346, 360), can4a-2022 (318, 330). → pour passer des $\text{m}$ aux $\text{cm}$ | ×1 |
| can4a-2021 (CAN) | src/exercices/can/4e/can4a-2021.ts | Q27 : « le temps en seconde (puisque … un temps en seconde) » (secondes) ; Q18 : signe moins mis en évidence à part (⟦-⟧⟦6/7⟧) ; Q30 : « $15\,\%$ . » (espace avant le point) ; Q25 : « $1000$ L », « ⟦7800⟧ ». → en secondes ; ⟦-\dfrac{6}{7}⟧ | ×1 |
| can4a-2022 (CAN) | src/exercices/can/4e/can4a-2022.ts | Q17 : formule découpée en morceaux « $(3-1)$$(3-2)$$=$$2\times$$1$ » ; Q27 : « $14$ L = 14 dm$^3$ » (unité et nombre hors maths), « $1000$ » ; Q2 : « $37000$ », « ⟦37008⟧ ». → $(3-1)(3-2)=2\times 1=⟦2⟧$ | ×1 |
| can4a-2024 (CAN) | src/exercices/can/can4a-2024 | Q25 : « il en reste trois quart » (quarts) ; Q12 : « des "cL" au "L" » (guillemets droits, aux) ; Q26 : « Comme il y a 4 segments…, donc » (comme … donc). → trois quarts ; des $\text{cL}$ aux $\text{L}$ | ×1 |
| can4a-NY2024 (CAN) | src/exercices/can | Q22 : « $(WX)//(UV)$ » (écrire \parallel) ; Q23 : « Un dixième d'heure est égal à 6 minutes… soit 0,4 h » : nombres hors $. → $(WX)\parallel(UV)$ | ×1 |
| can4a-NY2026 (CAN) | correction q25 | élision manquante « que Elsa. » : timbres de moins que Elsa. | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4G1-05 (CAN) | src/exercices/can/4e/can4G1-05.ts | « Dans le triangle $U,V,W$ » (virgules dans le nom) ; « (La figure n'est pas forcément représentative) » majuscule dans la parenthèse ; $UW=18$ sans unité. → Dans le triangle $UVW$ … $UW=18~\text{cm}$ | ×1 |
| can4G2-05 (CAN) | src/exercices/can/4e/can4G2-05.ts:42 | « multiplées » (lignes 42, 58, 72) ; « Les longueurs d'un rectangle de $4\text{ cm}^2$ » (d'aire $4~\text{cm}^2$), double espace. → multipliées ; un rectangle d'aire $4~\text{cm}^2$ | ×1 |
| can5a-2020 (CAN) | src/exercices/can/5e/can5a-2020.ts:524 | Q13 : « multiplant » (multipliant) ; Q25 : « Quelle masse de fromage a-t-il mangé ? » (mangée, lignes 1087 à 1113) ; Q23 : résultat écrit deux fois en tête de correction. → en multipliant ; a-t-il mangée | ×1 |
| can5a-2021 (CAN) | src/exercices/can/5e/can5a-2021.ts:656 | Q14 : « $12\times\times 4$ » (signe doublé, ligne 656) ; Q21 : « L' égalité » (espace après l'apostrophe, 1078 et 1095) ; Q26 : « Le nombre total d'élève » (1321, 1341) ; Q18 : « Écrire les entiers » pour des décimaux (1001, 1019) ; Q9 : « $8,6$ € ». → $12\times 4$ ; L'égalité ; d'élèves ; les nombres | ×1 |
| can5a-2022 (CAN) | src/exercices/can/5e/can5a-2022.ts:815 | Q16 : « demmi-cercle » ; Q12 : correction « $192$min $= 3$h$12$min » sans mise en évidence ni espaces ; Q28 : « $29\times 101 = 2929$ » ; Q20 : guillemets droits. → demi-cercle ; $192~\text{min}=⟦3~\text{h}~12~\text{min}⟧$ | ×1 |
| can5a-2024 (CAN) | src/exercices/can/can5a-2024/can5a-2024-Q20.ts:59 | Q20 : « un ordre e grandeur » et « $1955$ » sans séparateur ; Q26 : « Tous les quarts d'heures » (quarts d'heure), espace avant le point ; Q13 : correction « la somme … est égal à » (minuscule en tête, égale). → un ordre de grandeur ; Tous les quarts d'heure ; La somme … est égale à | ×1 |
| can5a-CoopMaths (CAN) | src/exercices/can/5e/can5a-CoopMaths.ts | Q13 : « $3h 34min$ » (lettres d'unité en italique dans la formule) ; Q19 : « $22.5$ » (point décimal) ; Q22 : « $149 / 100$m » ; Q6 « heures(h) » ; Q10 et Q24 : nombres hors $ ; Q12 : « ⟦2770⟧ ». → $3~\text{h}~34~\text{min}$ ; $22{,}5$ | ×1 |
| can5a-NY2026 (CAN) | correction q25 | élision manquante « que Elsa. » : timbres de moins que Elsa. | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5C6-02 (CAN) | src/exercices/can/5e/can5C6-02.ts:70 | « La dernière oprération » (lignes 70, 105, 140). → opération | ×1 |
| can6a-2021 (CAN) | src/exercices/can/6e/can6a-2021.ts:571 | Q16 : « un nombre a trois chiffres » (à) ; Q18 : « Combien de millième dans une unité ? » / « il y a $1\,000$ millième » (pluriel, verbe manquant, liste ligne 150 au singulier). → Combien de millièmes y a-t-il dans une unité ? … $1\,000$ millièmes. | ×1 |
| can6a-2021 (CAN) | src/exercices/can/6e/can6a-2021.ts:1009 | Q30 : « La figure hachurée est constituée de $22$. » (petits carreaux manquant) puis « une aire de $2,2$ unités » au lieu de uA ; double espace « par  $10$ ». → …constituée de $22$ petits carreaux. Elle a donc une aire de $2{,}2$ uA. | ×1 |
| can6a-2022 (CAN) | src/exercices/can/6e/can6a-2022.ts:817 | Q20 : « le segment mesure $1$ carreaux » (accord quand b = 1) ; Q18 : « des "kg" au "g" » (guillemets droits, aux). → ${b} carreau${b > 1 ? 'x' : ''} ; des $\text{kg}$ aux $\text{g}$ | ×1 |
| can6a-2023 (CAN) | src/exercices/can/6e/can6a-2023.ts:1408 | Q25 : « rerésentée » (coquille). → représentée | ×1 |
| can6a-2023 (CAN) | src/exercices/can/6e/can6a-2023.ts:1278 | Q22 : « Ainsi, en en $2$ h et $20$ min » (mot répété, même phrase que _Canc3a.ts:1182). → Ainsi, en $2~\text{h}~20~\text{min}$ | ×1 |
| can6a-2023 (CAN) | src/exercices/can/6e/can6a-2023.ts | Q15 : « La moitié de $0,3$ est égal à » (égale) ; Q4 : « Le double de $35$ » sans verbe avant le champ ; Q9 : « La taille d'une échelle » alors que la question demande la hauteur. → La moitié de $0{,}3$ est égale à | ×1 |
| can6a-2023 (CAN) | correction q22 | mot répété « en en » : . Ainsi, en en | ×1 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false (revue-0-a) |
| can6a-2025 (CAN) | src/exercices/can/can6a-2025 | Q20 : « Deux tiers de $15$ g est égal à » (Les deux tiers … sont égaux à) et « on commence à en prendre le tiers » (par). → Les deux tiers de $15~\text{g}$ sont égaux à … on commence par en prendre le tiers | ×1 |
| can6a-CoopMaths (CAN) | src/exercices/can/6e/can6a-CoopMaths.ts | Q20 : « combien coûtent $1$ kg de noix ? » (coûte) ; Q2 : « Quel est le nombre qui, multiplié par 23 donne 11 » (virgule après 23, nombres hors $) ; corrections réduites à un calcul sans phrase (Q20, Q27, Q30). → combien coûte $1~\text{kg}$ de noix ? | ×1 |
| can6a-NY2026 (CAN) | src/exercices/can/canNY-2026 | Mêmes constats que canc3a-NY2026 (Q25 « que Elsa », « en … timbres »). | ×1 |
| can6a-NY2026 (CAN) | correction q25 | élision manquante « que Elsa. » : timbres de moins que Elsa. | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6C2-02 (CAN) | src/exercices/can/6e/can6C2-02.ts | « on peut ajouter $50$ et on retranche $1$ » (construction bancale ; même tournure dans canCE2-2026 Q7). → on peut ajouter $50$ puis retrancher $1$ | ×1 |
| can6C4-02 (CAN) | src/exercices/can/6e/can6C4-02.ts | Correction « Comme $59=56 + 3$, donc il me restera… » (comme … donc redondant) ; deux blocs bleus successifs. → Comme $59=56+3$, il me restera $3$ bonbons. | ×1 |
| can6C51-03 (CAN) | src/exercices/can/6e/can6C51-03.ts | Consigne « Complèter. » (accent en trop). → Compléter. | ×1 |
| can6C6-06 (CAN) | correction q7 | élision manquante « de Yvette. » : € de plus que celui de Yvette. Elle l'a donc payé ( ‖ élision manquante « que Olivier. » : de plus que Olivier. Il mesure donc ( | ×2 ; défaut nb=10 (revue-1-a) |
| can6C6-10 (CAN) | src/exercices/can/6e/can6C6-10.ts | « le prix du litre d'essence est $5$ centimes moins cher » (un prix n'est pas cher ou moins cher) ; can6C6-05, can6C6-06 : espace avant le point (« litre . », « de plus . »). → le litre d'essence coûte $5$ centimes de moins | ×1 |
| can6M2-03 (CAN) | src/exercices/can/6e/can6M2-03.ts:45 | Titre du paramètre « Choixe de l'unité d'aire » (aussi dans 6M2autoC-1) ; correction « $⟦4\times4⟧\text{ soit }⟦16⟧\text{cm}^2$ » (calcul mis en évidence, texte dans la formule, pas d'espace avant l'unité). → Choix de l'unité d'aire ; $4\times 4=⟦16⟧~\text{cm}^2$ | ×1 |
| canc3a (CAN) | énoncé q1 | élision manquante « que Yann. » : fois plus âgé que Yann. Quel âge a Yann ? [champ] ‖ élision manquante « que Arthur. » : fois plus âgé que Arthur. Quel âge a Arthur ? [champ] ‖ élision manquante « que Elsa. » : fois plus âgé que Elsa. Quel âge a Elsa ? [champ] | ×5 ; sup=11 (revue-11-a) |
| canc3a (CAN) | correction q1 | élision manquante « de Yann » : L'âge de Yann est : ‖ élision manquante « de Arthur » : L'âge de Arthur est : ‖ élision manquante « de Elsa » : L'âge de Elsa est : | ×6 ; sup=11 ; sup=13 (revue-11-a) |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts:1182 | Q22 : « Ainsi, en en 1 h et 15 min » (mot répété). → Ainsi, en $1~\text{h}$ et $15~\text{min}$ | ×1 |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts:393 | Q8 : « oeufs » (œufs), double espace « boites de  $4$ ». → œufs ; boîtes de $4$ | ×1 |
| canc3a-2023 (CAN) | src/exercices/can/c3/_Canc3a.ts | Q24 : correction « $140 = 1$ centaines et $4$ dizaines » : accord (1 centaine), égalité coupée entre maths et texte. → $140 = 1$ centaine et $4$ dizaines | ×1 |
| canc3a-2023 (CAN) | src/exercices/can/c3/canc3a-2023.ts:899 | Q30 : la question parle de menus, le champ est suivi de « repas » ; « Combien de repas différents peut-on réaliser ? » dans une autre version. → texteApres: 'menus.' | ×1 |
| canc3a-2023 (CAN) | énoncé q8 | ligature œ manquante « oeufs » : oeufs, combien de boites de ‖ ligature œ manquante « oeufs » : oeufs dois-je utiliser ? [champ] | ×2 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | correction q22 | mot répété « en en » : . Ainsi, en en | ×1 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q8 | ligature œ manquante « oeufs » : oeufs, combien de boites de ‖ ligature œ manquante « oeufs » : oeufs dois-je utiliser ? ‖ mot répété « object Object » : lus que Zacharie. Combien de billes a Zacharie ? [object Object] | ×3 |
| canc3a-2024 (CAN) | src/exercices/can/canc3a-2024/canc3a-2024-Q16.ts:43 | Q16 : « est éagl à » (coquille). → est égal à | ×1 |
| canc3a-2024 (CAN) | src/exercices/can/can6a-2024/can6a-2024-Q18.ts:91 | Q18 : « le nombre de carreaux entier » (accord). → carreaux entiers | ×1 |
| canc3a-2024 (CAN) | src/exercices/can/canc3a-2024 | Q24 : « complète. : » (point puis deux-points) ; Q4 : « carreaux de chocolats » puis « carreaux de chocolat ». → Sachant que $18\times 8=144$, compléter : | ×1 |
| canc3a-2025 (CAN) | src/exercices/can/canc3a-2025/canc3a-2025-Q13.ts:35 | Q13 : « Il faur donc » (coquille). → Il faut donc | ×1 |
| canc3a-2025 (CAN) | src/exercices/can/can6a-2025/can6a-2025-Q16.ts:91 | Q16 : « La figure A est composé » (accord). → est composée | ×1 |
| canc3a-2025 (CAN) | src/exercices/can/canc3a-2025/canc3a-2025-Q29.ts:33 | Q29 : « pour passer des cm au mm » (aux) ; même tournure « des cm au m » dans can6M4-03, can6M4-05, can6a-2021. → pour passer des $\text{cm}$ aux $\text{mm}$ | ×1 |
| canc3a-2025b (CAN) | src/exercices/can/canc3a-2025b | Q29 : « pour passer des m au cm » (aux) ; Q25 : « Coche la réponse du calcul » (le résultat du calcul). → pour passer des $\text{m}$ aux $\text{cm}$ | ×1 |
| canc3a-NY2025 (CAN) | src/exercices/can/canNY-2025 | Q25 : « Mehdi en a $1\,600$ timbres » (pronom « en » et complément en double) ; Q30 : correction sans calcul ($2\,043-2\,025=18$, moitié $9$). → Mehdi a $1\,600$ timbres. | ×1 |
| canc3a-NY2026 (CAN) | src/exercices/can/canNY-2026 | Q25 : « Mehdi en possède $426$ timbres de moins que Elsa » (élision qu'Elsa, « en » en double) et « Mehdi en a … timbres » ; Q24 : « $2026$ » sans séparateur à côté de « $2\,002$ » ; Q30 sans calcul. → Mehdi possède $426$ timbres de moins qu'Elsa. | ×1 |
| canc3a-NY2026 (CAN) | correction q25 | élision manquante « que Elsa. » : timbres de moins que Elsa. | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3C07 (CAN) | énoncé q1 | élision manquante « que Isabelle » : s que Lilian. Sachant que Isabelle a | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C07 (CAN) | correction q1 | élision manquante « que Isabelle. » : ballons de plus que Isabelle. Il a donc ( | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C08 (CAN) | correction q1 | élision manquante « que Isabelle. » : € de plus que Isabelle. Nawel a donc : ‖ élision manquante « que Isabelle. » : ballons de plus que Isabelle. Il a donc ( | ×2 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C08 (CAN) | énoncé q1 | élision manquante « que Isabelle » : s que Lilian. Sachant que Isabelle a | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C09 (CAN) | énoncé q1 | élision manquante « que Yvette » : fois moins de biscuits que Yvette qui en a ‖ élision manquante « que Yasmine. » : fois plus que Yasmine. Combien de ballons a Yasmine ? [ch | ×2 ; défaut nb=10 (revue-1-a) |
| canc3C09 (CAN) | correction q7 | élision manquante « que Yasmine, » : fois plus que Yasmine, Yasmine en a | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C10 (CAN) | énoncé q1 | élision manquante « que Isabelle. » : fois plus que Isabelle. Combien de ballons ‖ élision manquante « que Yvette. » : fois moins que Yvette. Combien de biscuits | ×2 ; défaut nb=10 (revue-1-a) |
| canc3C10 (CAN) | correction q1 | élision manquante « que Isabelle, » : fois plus que Isabelle, Isabelle en a donc ‖ élision manquante « que Yvette, » : fois moins que Yvette, Yvette en a donc | ×2 ; défaut nb=10 (revue-1-a) |
| canc3C18 (CAN) | src/exercices/can/c3/canc3C18.ts | « Combien lui reste-t-il de $\text{ km}$ à parcourir ? » : abréviation d'unité employée comme nom dans la phrase. → Combien de kilomètres lui reste-t-il à parcourir ? | ×1 |
| canc3C19 (CAN) | src/exercices/can/c3/canc3C19.ts | « Combien de mètres a-t-elle parcouru ? » (accord avec le complément placé avant : parcourus). → Combien de mètres a-t-elle parcourus ? | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q12.ts:29 | Q12 : « Combien en reste-il ? » (t euphonique manquant). → Combien en reste-t-il ? | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q14.ts:32 | Q14 : correction « se lit quatre- vingts . » : espaces dans la balise &lt;i> (« quatre- vingts » puis espace avant le point). → quatre-&lt;i>vingts&lt;/i>. | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q15.ts | Q15 (sup=false) : « Quelle est la figure ayant que $4$ axes de symétrie ? » (tournure fautive). → Quelle figure a exactement $4$ axes de symétrie ? | ×1 |
| canCE1a-2025 (CAN) | énoncé q12 | t euphonique manquant « reste-il » : gâteaux ont été mangés. Combien en reste-il ? Il reste [champ] gâteaux. | ×2 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | correction q14 | trait d'union et espace : se lit quatre- vingts . | ×1 ; sup=false (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q12 | t euphonique manquant « reste-il » : gâteaux ont été mangés. Combien en reste-il ? | ×1 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026/canCE1-2026-Q5.ts | Q5 : correction « $753$ est vient juste après $738$ » (mot en trop). → $753$ vient juste après $738$ | ×1 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026 | Q1, Q2, Q5, Q6, Q8, Q9 : « Entoure » alors que l'élève coche une case dans l'app (QCM). → Coche / Cocher | ×1 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026/canCE1-2026-Q9.ts | Q9 : nombre en lettres écrit en maths ($\textit{Six cent quatre-vingt-dix}$) et en orthographe traditionnelle, alors que le sujet 2025 écrit « cent-soixante-quatorze » (rectifiée) : choisir une orthographe pour les deux sujets. → Entoure le nombre &lt;em>six-cent-quatre-vingt-dix&lt;/em>. | ×1 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026/canCE1-2026-Q16.ts | Q16 : « Combien j'obtiens ? » (registre oral). → Combien est-ce que j'obtiens ? | ×1 |
| canCE2-2026 (CAN) | src/exercices/can/canCE2a-2026 | Q8 : « Dans $45$ combien de fois $9$ ? » (virgule manquante, présente dans le sujet 2025) ; Q16, Q20 : « Combien j'obtiens ? » ; Q5 « Compléter. » à côté de « Complète. » dans le même sujet. → Dans $45$, combien de fois $9$ ? | ×1 |
| canCE2a-2025 (CAN) | src/exercices/can/canCE2a-2025 | Q18 : « Quel nombre j'obtiens si… » (registre oral) ; Q10 : double espace avant « : » (« chiffres  : »). → Quel nombre obtient-on si l'on enlève… | ×1 |

## R2

**Impératif ou tutoiement** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 4C20-4 (4e) | src/exercices/4e/4C20-4.ts:58 | consigne à l'impératif : Compare les fractions suivantes. | ×1 |
| can4a-2021 (CAN) | énoncé q5 | impératif : Complète : ‖ impératif : Recopie la bonne réponse. ‖ impératif : . Détermine sa largeur. [champ] m | ×20 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2021 (CAN) | énoncé non interactif q5 | impératif : Complète : ‖ impératif : Recopie la bonne réponse. ‖ impératif : . Détermine sa largeur. | ×10 |
| can4a-2022 (CAN) | énoncé q2 | impératif : Écris en chiffres le nombre : ‖ impératif : Recopie le résultat de : ‖ impératif : Écris | ×28 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | énoncé non interactif q2 | impératif : Écris en chiffres le nombre : ‖ impératif : Recopie le résultat de : ‖ impératif : Écris | ×14 |
| can4a-2023 (CAN) | énoncé q14 | impératif : boules vertes. On tire une boule au hasard. Complète : ‖ impératif : Simplifie l'expression : | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | énoncé non interactif q14 | impératif : boules vertes. On tire une boule au hasard. Complète : ‖ impératif : Simplifie l'expression : | ×2 |
| can4a-2024 (CAN) | énoncé q4 | impératif : Complète par un nombre. ‖ impératif : Complète : ‖ deuxième personne : Le nombre d'arêtes d'un cube est : [champ] . | ×8 ; sup=false ; sup=true (revue-0-a) |
| can4a-2024 (CAN) | énoncé non interactif q4 | impératif : Complète par un nombre. ‖ impératif : Complète : ‖ deuxième personne : Le nombre d'arêtes d'un cube est : | ×4 |
| can4a-2026 (CAN) | énoncé q4 | impératif : Complète : | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4a-2026 (CAN) | énoncé non interactif q4 | impératif : Complète : | ×1 |
| can5a-2020 (CAN) | énoncé q1 | impératif : Complète : ‖ impératif : Écris sous forme décimale : ‖ impératif : Détermine l'abscisse du point | ×7 ; sup= (revue-0-a) |
| can5a-2020 (CAN) | énoncé non interactif q1 | impératif : Complète : ‖ impératif : Écris sous forme décimale : ‖ impératif : Détermine l'abscisse du point | ×7 |
| can5a-2021 (CAN) | énoncé q5 | impératif : Complète : ‖ impératif : . Recopie la longueur possible de ‖ impératif : Donne un encadrement au centième près du nombre | ×7 ; sup= (revue-0-a) |
| can5a-2021 (CAN) | énoncé non interactif q5 | impératif : Complète : ‖ impératif : . Recopie la longueur possible de ‖ impératif : Donne un encadrement au centième près du nombre | ×6 |
| can5a-2022 (CAN) | énoncé q2 | impératif : Écris en chiffres le nombre : ‖ impératif : Écris sous forme décimale : ‖ impératif : Recopie le résultat de : | ×17 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) | énoncé non interactif q2 | impératif : Écris en chiffres le nombre : ‖ impératif : Écris sous forme décimale : ‖ impératif : Recopie le résultat de : | ×10 |
| can5a-2023 (CAN) | énoncé q18 | impératif : Complète ce tableau de proportionnalité : ‖ impératif : Recopie le résultat de : | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2023 (CAN) | énoncé non interactif q18 | impératif : Complète ce tableau de proportionnalité : ‖ impératif : Recopie le résultat de : | ×2 |
| can5a-2024 (CAN) | énoncé q4 | impératif : Complète par un nombre. ‖ impératif : Complète : ‖ impératif : Recopie un ordre de grandeur de | ×10 ; sup=false ; sup=true (revue-0-a) |
| can5a-2024 (CAN) | énoncé non interactif q4 | impératif : Complète par un nombre. ‖ impératif : Complète : ‖ impératif : Entoure un ordre de grandeur de : | ×5 |
| can5a-2025 (CAN) | énoncé q14 | impératif : Complète cette suite logique de nombres : ‖ impératif : Détermine le reste de la division euclidienne de | ×3 ; sup=false ; sup=true (revue-0-a) |
| can5a-2025 (CAN) | énoncé non interactif q14 | impératif : Complète cette suite logique de nombres : ‖ impératif : Détermine le reste de la division euclidienne de | ×2 |
| can5a-2026 (CAN) | énoncé q4 | impératif : Complète : ‖ impératif : Complète la suite logique : | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-2026 (CAN) | énoncé non interactif q4 | impératif : Complète : ‖ impératif : Complète la suite logique : | ×2 |
| can5a-CoopMaths (CAN) | énoncé q25 | impératif : Choisis parmi les propositions suivantes la hauteu | ×2 ; sup=31 ; sup=25 (revue-0-a) |
| can5a-CoopMaths (CAN) | énoncé non interactif q25 | impératif : Choisis parmi les propositions suivantes la hauteu | ×1 |
| can5a-NY2025 (CAN) | énoncé q5 | impératif : Complète par un nombre. | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2025 (CAN) | énoncé non interactif q5 | impératif : Complète par un nombre. | ×1 |
| can5a-NY2026 (CAN) | énoncé q5 | impératif : Complète par un nombre. | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) | énoncé non interactif q5 | impératif : Complète par un nombre. | ×1 |
| can6a-2018 (CAN) | énoncé q4 | impératif : Complète : ‖ impératif : Donne l'écriture décimale de ‖ impératif : Détermine l'abscisse du point A : On donnera le | ×14 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) | énoncé non interactif q4 | impératif : Complète : ‖ impératif : Donne l'écriture décimale de ‖ impératif : Détermine l'abscisse du point A : On donnera le | ×7 |
| can6a-2021 (CAN) | énoncé q12 | impératif : Donne l'écriture décimale de ‖ impératif : Complète : ‖ impératif : Recopie le nombre le plus proche de | ×5 ; défaut (revue-0-a) |
| can6a-2021 (CAN) | énoncé non interactif q12 | impératif : Donne l'écriture décimale de ‖ impératif : Complète : ‖ impératif : Recopie le nombre le plus proche de | ×5 |
| can6a-2022 (CAN) | énoncé q3 | impératif : Complète : ‖ impératif : Écris en chiffres : Deux-millions- ‖ impératif : Détermine l'abscisse du point A : On donnera le | ×8 ; défaut (revue-0-a) |
| can6a-2022 (CAN) | énoncé non interactif q3 | impératif : Complète : ‖ impératif : Écris en chiffres : Deux-millions- ‖ impératif : Détermine l'abscisse du point A : On donnera le | ×8 |
| can6a-2023 (CAN) | énoncé q6 | impératif : Complète : ‖ deuxième personne : œufs, combien de boîtes de ‖ deuxième personne : œufs dois-je utiliser ? [champ] boîtes | ×16 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) | énoncé non interactif q6 | impératif : Complète : ‖ deuxième personne : œufs, combien de boîtes de ‖ impératif : Choisis parmi les propositions suivantes la hauteu | ×7 |
| can6a-2024 (CAN) | énoncé q3 | impératif : Écris le nombre égal à ‖ impératif : Complète. [champ] ‖ impératif : Complète. | ×14 ; sup=false ; sup=true (revue-0-a) |
| can6a-2024 (CAN) | énoncé non interactif q3 | impératif : Écris le nombre égal à ‖ impératif : Complète. ‖ impératif : Complète : | ×7 |
| can6a-2025 (CAN) | énoncé q4 | impératif : Écris, en chiffres, le nombre : mille-cinq [ ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×19 ; sup=false ; sup=true (revue-0-a) |
| can6a-2025 (CAN) | énoncé non interactif q4 | impératif : Écris, en chiffres, le nombre : mille-cinq ‖ impératif : Complète. ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×10 |
| can6a-2026 (CAN) | énoncé q1 | impératif : Complète. [champ] ‖ impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] | ×20 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) | énoncé non interactif q1 | impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] ‖ impératif : . Complète. | ×11 |
| can6a-CoopMaths (CAN) | énoncé q25 | impératif : Choisis parmi les propositions suivantes la hauteu | ×31 ; sup=31 ; sup=25 (revue-0-a) |
| can6a-CoopMaths (CAN) | énoncé non interactif q25 | impératif : Choisis parmi les propositions suivantes la hauteu | ×1 |
| can6C4-03 (CAN) | énoncé q6 | deuxième personne : . Combien de rangées complètes peut-il former ? [champ] rangée(s) | ×3 ; défaut nb=10 (revue-1-a) |
| can6C6-04 (CAN) | src/exercices/can/6e/can6C6-04.ts | Explication « évaluez un ordre de grandeur » : impératif et vouvoiement. → on évalue un ordre de grandeur | ×1 |
| can6G2-01 (CAN) | consigne | deuxième personne : pilement en plein écran). Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ deuxième personne : ec deux angles différents. Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ deuxième personne : pilement en plein écran). Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume manqua | ×6 ; sup=1 sup2=1 sup3=true sup4=2 ; sup=1 sup2=1 sup3=false sup4=2… (revue-2-a) |
| can6G2-02 (CAN) | consigne | deuxième personne : pilement en plein écran). Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ deuxième personne : ec deux angles différents. Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume en ‖ deuxième personne : pilement en plein écran). Les cubes ayant des arêtes de 1 cm de longueur, calculer le volume manqua | ×6 ; sup=1 sup2=1 sup3=true sup4=2 ; sup=1 sup2=1 sup3=false sup4=2… (revue-2-a) |
| can6G2-03 (CAN) | titre | deuxième personne : Compter les arêtes et les faces | ×1 |
| can6G2-03 (CAN) | énoncé q1 | deuxième personne : Quel est le nombre d'arêtes de ce solide ? [champ] ‖ deuxième personne : oici un solide : [champ] Quel est le nombre d'arêtes de ce solide ? [champ] | ×6 ; sup2=false ; sup2=true… (revue-0-a) |
| can6G2-03 (CAN) | énoncé non interactif q1 | deuxième personne : Quel est le nombre d'arêtes de ce solide ? | ×1 |
| canc3a-2023 (CAN) | énoncé q6 | impératif : Complète : ‖ impératif : Écris les deux nombres séparés par un point-virgu ‖ impératif : Choisis parmi les propositions suivantes la hauteu | ×9 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q6 | impératif : Complète : ‖ impératif : Choisis parmi les propositions suivantes la hauteu ‖ impératif : Écris en chiffres le nombre : soixante-et-un-mil | ×7 |
| canc3a-2024 (CAN) | énoncé q3 | impératif : Écris le nombre égal à ‖ impératif : Complète. [champ] ‖ impératif : Complète. | ×16 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | énoncé non interactif q3 | impératif : Écris le nombre égal à ‖ impératif : Complète. ‖ impératif : Coche le plus grand nombre : [champ] | ×8 |
| canc3a-2025 (CAN) | énoncé q4 | impératif : Écris, en chiffres, le nombre : mille-cinq [ ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×18 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | énoncé non interactif q4 | impératif : Écris, en chiffres, le nombre : mille-cinq ‖ impératif : Complète. ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×9 |
| canc3a-2025b (CAN) | énoncé q4 | impératif : Écris, en chiffres, le nombre : mille-cinq [ ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×20 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé non interactif q4 | impératif : Écris, en chiffres, le nombre : mille-cinq ‖ impératif : Complète. ‖ impératif : Coche la bonne réponse. Une voiture peut mesu | ×11 |
| canc3a-2026 (CAN) | énoncé q1 | impératif : Complète. [champ] ‖ impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] | ×20 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé non interactif q1 | impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] ‖ impératif : . Complète. | ×11 |
| canc3a-2026b (CAN) | énoncé q1 | impératif : Complète. [champ] ‖ impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] | ×26 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026b (CAN) | énoncé non interactif q1 | impératif : Complète. ‖ deuxième personne : Viens-tu à vélo ? [champ] ‖ impératif : . Complète. | ×14 |
| canc3C08 (CAN) | énoncé q1 | deuxième personne : € de moins que toi ». Combien d'argent ‖ deuxième personne : € et tu as | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C08 (CAN) | énoncé non interactif q1 | deuxième personne : € de moins que toi ». Combien d'argent | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025 | Tout le sujet est à l'impératif et au tutoiement (« Coche », « Écris », « Calcule », « Complète », « comptes-tu ») contre la règle de l'infinitif ; à arbitrer pour le CE1 (formulation du sujet officiel ?). | ×1 |
| canCE1a-2025 (CAN) | énoncé q2 | impératif : Coche la bonne réponse. [champ] ‖ impératif : Écris un nombre qui a ‖ impératif : Coche le nombre qui est entre | ×22 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q2 | impératif : Coche la bonne réponse. [champ] ‖ impératif : Écris un nombre qui a ‖ impératif : Coche le nombre qui est entre | ×11 |
| canCE1a-2026 (CAN) | énoncé q1 | impératif : Entoure la moitié de ‖ impératif : Entoure le résultat le plus petit. [champ] ‖ impératif : Entoure le nombre qui a | ×28 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2026 (CAN) | énoncé non interactif q1 | impératif : Entoure la moitié de ‖ impératif : Entoure le résultat le plus petit. [champ] ‖ impératif : Entoure le nombre qui a | ×14 |
| canCE2-2026 (CAN) | énoncé q1 | impératif : Complète. ‖ impératif : Complète. [champ] ‖ impératif : Coche la bonne réponse. 4 kilogrammes, c'est [cham | ×18 ; sup=false ; sup=true (revue-0-a) |
| canCE2-2026 (CAN) | énoncé non interactif q1 | impératif : Complète. ‖ impératif : Coche la bonne réponse. 4 kilogrammes, c'est [cham ‖ impératif : Calcule : | ×9 |
| canCE2a-2025 (CAN) | énoncé q3 | impératif : Complète la case grise. ‖ impératif : Calcule : ‖ impératif : Coche la bonne réponse pour | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q3 | impératif : Complète la case grise. ‖ impératif : Calcule : ‖ impératif : Coche la bonne réponse pour | ×4 |
| can/can6a-2024/can6a-2024-Q14.ts (hors référentiel) | src/exercices/can/can6a-2024/can6a-2024-Q14.ts:23 | consigne à l'impératif : Complète : | ×1 |
| can/can6a-2024/can6a-2024-Q28.ts (hors référentiel) | src/exercices/can/can6a-2024/can6a-2024-Q28.ts:51 | consigne à l'impératif : Complète : | ×1 |
| can/can6a-2024/can6a-2024-Q5.ts (hors référentiel) | src/exercices/can/can6a-2024/can6a-2024-Q5.ts:32 | consigne à l'impératif : Complète.  | ×1 |
| can/can6a-2024/can6a-2024-Q7.ts (hors référentiel) | src/exercices/can/can6a-2024/can6a-2024-Q7.ts:29 | consigne à l'impératif : Complète.  | ×1 |
| can/can6a-2025/can6a-2025-Q12.ts (hors référentiel) | src/exercices/can/can6a-2025/can6a-2025-Q12.ts:61 | consigne à l'impératif : Complète. | ×1 |
| can/canc3a-2024/canc3a-2024-Q14.ts (hors référentiel) | src/exercices/can/canc3a-2024/canc3a-2024-Q14.ts:23 | consigne à l'impératif : Complète : | ×1 |
| 0c7bb (Non classés) | src/exercices/can/can6a-2026/can6a-2026-Q1.ts:68 | consigne à l'impératif : Complète. | ×1 |
| 1h3ps (Non classés) | src/exercices/can/can6a-2026/can6a-2026-Q10.ts:29 | consigne à l'impératif : Complète. | ×1 |
| 257d0 (Non classés) | src/exercices/can/canc3a-2026/canc3a-2026-Q11.ts:31 | consigne à l'impératif : Complète. | ×1 |
| 450b6 (Non classés) | src/exercices/can/canc3a-CM1-2026/canc3a-CM1-2026-Q11.ts:33 | consigne à l'impératif : Complète. | ×1 |
| 4ed52 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q15.ts:48 | consigne à l'impératif : Coche la bonne réponse pour $${a}\\div ${b}$.&lt;br> | ×1 |
| 50cd1 (Non classés) | src/exercices/can/canc3a-2025/canc3a-2025-Q27.ts:37 | consigne à l'impératif : Complète. | ×1 |
| 565f3 (Non classés) | src/exercices/can/canc3a-CM1-2025/canc3a-CM1-2025-Q27.ts:37 | consigne à l'impératif : Complète. | ×1 |
| 5bd1f (Non classés) | src/exercices/can/canCE2a-2026/canCE2-2026-Q11.ts:57 | consigne à l'impératif : Coche la bonne réponse.&lt;br>Un cube a : | ×1 |
| 698bb (Non classés) | src/exercices/can/canc3a-2025/canc3a-2025-Q19.ts:35 | consigne à l'impératif : Complète.  | ×1 |
| 8c3df (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q11.ts:27 | consigne à l'impératif : Complète cette suite logique. | ×1 |
| 9f722 (Non classés) | src/exercices/can/canc3a-CM1-2026/canc3a-CM1-2026-Q14.ts:31 | consigne à l'impératif : Complète. | ×1 |
| a2993 (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q18.ts:210 | consigne à l'impératif : Coche la pendule qui indique ${heureAffichage}.&lt;br>${dessin}&lt;br> | ×1 |
| b5563 (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q20.ts:151 | consigne à l'impératif : Coche la représentation de la fraction un demi. | ×1 |
| b949c (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q15.ts:243 | consigne à l'impératif : Coche le numéro de la figure qui a deux angles droits. | ×1 |
| d4573 (Non classés) | src/exercices/can/can6a-2025/can6a-2025-Q9.ts:34 | consigne à l'impératif : Complète.  | ×1 |
| e5ec7 (Non classés) | src/exercices/can/canCE1a-2025/canCE1-2025-Q11.ts:26 | consigne à l'impératif : Complète cette suite logique. | ×1 |
| f9261 (Non classés) | src/exercices/modèlesExos/21_parametrable.ts:23 | consigne à l'impératif : Calcule | ×1 |
| pb769 (Non classés) | src/exercices/can/can6a-2026/can6a-2026-Q11.ts:32 | consigne à l'impératif : Complète. | ×1 |
| testEEE (Non classés) | src/exercices/profs/test.ts:181 | consigne à l'impératif : Recopie exactement une de ces deux propositions. | ×1 |
| testEEE (Non classés) | src/exercices/profs/test.ts:182 | consigne à l'impératif : Donne un ensemble de nombres égal à :  | ×1 |

## R3

**Point final** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6a-2022 (CAN) | src/exercices/can/6e/can6a-2022.ts:879 | Q23 : « Combien faut-il de pièces de $10$ centimes pour avoir $3{,}60$ €. » : question terminée par un point (aussi lignes 887 et 896). → …pour avoir $3{,}60$ € ? | ×1 |
| can6P1-03 (CAN) | src/exercices/can/6e/can6P1-03.ts | Correction « $60\times 3,5 = ⟦210⟧$ » sans unité ni phrase. → $60\times 3{,}5=⟦210⟧$ donc la voiture parcourt $210~\text{km}$. | ×1 |
| canc3a-2024 (CAN) | src/exercices/can/canc3a-2024/canc3a-2024-Q15.ts | Q15 : « Le périmètre de ce rectangle est égal à [champ] cm » sans point, correction sans unité ni point (« $(6+4)\times 2=…=20$ »). → … $=20~\text{cm}$. | ×1 |
| canCE1a-2025 (CAN) | src/exercices/can/canCE1a-2025/canCE1-2025-Q17.ts:34 | Q17 : « Il y a [champ] pattes » sans point final (texteApres 'pattes'). → texteApres: 'pattes.' | ×1 |
| canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026 | Q12, Q13, Q17 : phrase terminée par le champ sans point (texteApres « cartes », « oreilles », rien après « Le double de 19 est : »). → texteApres: 'cartes.' | ×1 |

## R4

**Dernière phrase en saisie libre** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can5a-2025 (CAN) | src/exercices/can/can5a-2025 | Q3 « Le quart de $44$ » sans verbe avant le champ ; Q14 « $225$ ; $$ » (formule vide) ; Q11 « $9\times 1000$ » sans séparateur. → Le quart de $44$ est : | ×1 |

## R5

**Virgule (soit, alors, or)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | correction q27 | pas de virgule avant « soit » : L pour une minute soit | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can4C1-02 (CAN) | correction q1 | pas de virgule avant « alors » : est négatif et que le résultat est négatif alors le facteur manquant est forcément positif. ‖ pas de virgule avant « alors » : est positif et que le résultat est négatif alors le facteur manquant est forcément négatif. | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can4P1-01 (CAN) | correction q1 | pas de virgule avant « soit » : L pour une minute soit | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can5a-2020 (CAN) | correction q21 | pas de virgule avant « soit » : Pour qu'un triangle soit constructible (non aplati), il faut que la ‖ pas de virgule avant « soit » : aplati), il faut que la longueur du plus grand côté soit strictement inférieure à la somme des deux | ×2 ; sup= (revue-0-a) |
| can5a-2021 (CAN) | correction q16 | pas de virgule avant « soit » : Pour qu'un triangle soit constructible, il faut que la longueur du p ‖ pas de virgule avant « soit » : uctible, il faut que la longueur du plus grand côté soit inférieure à la somme des deux autres. | ×2 ; sup= (revue-0-a) |
| can5a-2023 (CAN) | énoncé q30 | pas de virgule avant « soit » : qui soit divisible par | ×2 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2023 (CAN) | correction q30 | pas de virgule avant « soit » : il faut que la somme des chiffres soit ‖ pas de virgule avant « soit » : qui soit divisible par | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2023 (CAN) | énoncé non interactif q30 | pas de virgule avant « soit » : qui soit divisible par | ×1 |
| can5C2-05 (CAN) | correction q1 | pas de virgule avant « alors » : . Il reste alors à multiplier | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C3-05 (CAN) | correction q1 | pas de virgule avant « alors » : devient le chiffre des millièmes. On obtient alors : ‖ pas de virgule avant « alors » : devient le chiffre des unités de mille. On obtient alors : ‖ pas de virgule avant « alors » : devient le chiffre des centaines. On obtient alors : | ×13 ; sup=3 ; sup=1… (revue-0-a) |
| can5C5-03 (CAN) | énoncé q1 | pas de virgule avant « soit » : Quel nombre doit-on écrire pour que l'égalité soit correcte ? [champ] | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C5-03 (CAN) | énoncé non interactif q1 | pas de virgule avant « soit » : Quel nombre doit-on écrire pour que l'égalité soit correcte ? | ×1 |
| can5C5-04 (CAN) | énoncé q1 | pas de virgule avant « soit » : Quel nombre doit-on écrire pour que l'égalité soit correcte ? [champ] | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C5-04 (CAN) | énoncé non interactif q1 | pas de virgule avant « soit » : Quel nombre doit-on écrire pour que l'égalité soit correcte ? | ×1 |
| can5C6-03 (CAN) | énoncé q1 | pas de virgule avant « soit » : qui soit divisible par | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C6-03 (CAN) | correction q1 | pas de virgule avant « soit » : de trop pour qu'il soit divisible par | ×9 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C6-03 (CAN) | énoncé non interactif q1 | pas de virgule avant « soit » : qui soit divisible par | ×1 |
| can5P1-05 (CAN) | correction q1 | pas de virgule après « Or » : €. Or | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C1-07 (CAN) | src/exercices/can/6e/can6C1-07.ts | « le nombre qui, diminué de $2$ est égal à $19$ » : virgule fermante manquante (même phrase dans can6NY-2025). → qui, diminué de $2$, est égal à | ×1 |
| can6C2-04 (CAN) | correction q1 | pas de virgule avant « alors » : . Il reste alors à multiplier par | ×12 ; sup=false ; sup=true… (revue-0-a) |
| can6C6-04 (CAN) | correction q1 | pas de virgule avant « alors » : . Il reste alors | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-06 (CAN) | énoncé q1 | pas de virgule avant « soit » : € pour son déjeuner soit | ×3 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-06 (CAN) | correction q1 | pas de virgule après « Or » : g de plus que Zacharie. Or ‖ pas de virgule après « Or » : g de plus que Fernando. Or | ×2 ; défaut nb=10 (revue-1-a) |
| can6C6-06 (CAN) | énoncé non interactif q1 | pas de virgule avant « soit » : € pour son déjeuner soit | ×1 |
| can6C6-07 (CAN) | correction q1 | pas de virgule avant « alors » : . Il reste alors : | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3a (CAN) | correction q28 | pas de virgule avant « soit » : min soit | ×7 ; sup= ; sup=28 (revue-0-a) |
| canc3a-2023 (CAN) | correction q26 | pas de virgule après « Or » : centièmes. Or | ×1 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | src/exercices/can/canc3a-2024/canc3a-2024-Q11.ts:47 | Q11 : « Comme … est égal à $4,416$ alors, le plus grand nombre » : virgule après « alors » au lieu d'avant. → …égal à $4{,}416$, alors le plus grand nombre… | ×1 |
| canc3C07 (CAN) | énoncé q4 | pas de virgule avant « soit » : ans soit | ×1 ; défaut nb=10 (revue-1-a) |
| canc3C08 (CAN) | énoncé q1 | pas de virgule avant « soit » : € soit | ×1 ; défaut (revue-0-a) |
| canc3C08 (CAN) | correction q1 | pas de virgule avant « soit » : ) soit | ×5 ; défaut nb=10 (revue-1-a) |
| canc3C08 (CAN) | énoncé non interactif q1 | pas de virgule avant « soit » : € soit | ×1 |
| canc3D02 (CAN) | correction q1 | pas de virgule avant « soit » : graduations soit | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3N08 (CAN) | correction q1 | pas de virgule avant « alors » : est impair alors la ‖ pas de virgule avant « alors » : est pair alors la | ×6 ; défaut ; défaut nb=10 (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé q4 | pas de virgule avant « alors » : cases ». Magalie doit alors aller sur la case [champ] . ‖ pas de virgule avant « soit » : cris un nombre dans lequel on entend vingt et qui soit plus grand que ‖ pas de virgule avant « alors » : cases ». Zoé doit alors aller sur la case [champ] . | ×4 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | pas de virgule avant « alors » : cases ». Magalie doit alors aller sur la case ‖ pas de virgule avant « soit » : cris un nombre dans lequel on entend vingt et qui soit plus grand que | ×2 |

## R6

**Majuscule sans accent** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6N3-02 (CAN) | src/exercices/can/6e/can6N3-02.ts | Énoncé « Determiner l'abscisse du point $A$. » (accent manquant) ; correction « du point A » hors maths, sans point final. → Déterminer l'abscisse du point $A$. | ×1 |

## R8

**Orthographe uniformisée (en dessous, au-dessus…)** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 6P3D-2 (6e) | src/exercices/6e/6P3D-2.ts:401 | Compléter le tableau de proportionnalité ci dessous. | ×1 |
| TSA2-QCM03 (Terminale) | src/exercices/QCMStatiques/Convexite2.ts:42 | C'est un résultat de cours. La fonction étant concave sur l'intervalle $[a;b]$, les tangentes sont au dessous de la courbe $\\mathcal {C_f}$ et les cordes en de | ×1 |

## T4

**Guillemets** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2024 (CAN) | correction q12 | guillemets droits : L, pour passer des "cL" au "L", on divise par ‖ guillemets droits : cL, pour passer des "L" au "cL", on multiplie par | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-2022 (CAN) | correction q20 | guillemets droits : (chaque graduation "correspond" à | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can5C1-08 (CAN) | correction q1 | guillemets droits : ultat est plus petit que le nombre de départ. L'"écart" entre les deux nombres est | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C4-01 (CAN) | correction q1 | guillemets droits : (car la division "tombe juste") : on obtient | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can6a-2022 (CAN) | correction q18 | guillemets droits : g, pour passer des "kg" au "g", on multiplie par | ×2 ; défaut (revue-0-a) |
| can6C6-06 (CAN) | titre | guillemets droits : Résoudre un problème avec "de plus", "de moins" | ×2 |
| canc3C07 (CAN) | titre | guillemets droits : Résoudre un problème avec "de plus", "de moins" | ×2 |
| canc3C08 (CAN) | titre | guillemets droits : Résoudre un problème avec "de plus", "de moins"* | ×2 |
| canc3C09 (CAN) | titre | guillemets droits : Résoudre un problème avec "fois plus", "fois moins" | ×2 |
| canc3C10 (CAN) | titre | guillemets droits : Résoudre un problème avec "fois plus", "fois moins"* | ×2 |
| canc3N08 (CAN) | src/exercices/can/c3/canc3N08.ts | Lettres entre apostrophes droites ('B', 'A') et « Comme $23$ est impair alors » (virgule avant alors). → la lettre est « A » ; …impair, alors… | ×1 |

## T5

**Espaces en trop** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can4a-2021 (CAN) | énoncé q2 | double espace : est : [champ] | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2021 (CAN) | correction q13 | double espace : L'aire d'un rectangle est obtenue par le produit de sa longueur par sa largeur. ‖ double espace : est deux fois plus petit que | ×3 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | énoncé q9 | double espace : Recopie le résultat de : | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | correction q4 | double espace : , pour passer des | ×1 ; sup2=true (revue-1-a) |
| can4a-2022 (CAN) | énoncé non interactif q9 | double espace : Recopie le résultat de : | ×1 |
| can4a-2023 (CAN) | correction q3 | double espace : min. Son trajet aura duré ‖ double espace : Le volume d'un pavé droit est donné par le produit longueur | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | énoncé q7 | double espace : €. Combien coûtent ‖ double espace : . Écrire les deux nombres séparés par un point-virgule. [champ] ‖ double espace : ombien de pas avance le stylo ? quand @greenFlag est cliqué stylo en position d'écr | ×19 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | énoncé non interactif q7 | double espace : €. Combien coûtent ‖ double espace : ombien de pas avance le stylo ? quand @greenFlag est cliqué stylo en position d'écr ‖ double espace : s avance le stylo ? quand @greenFlag est cliqué stylo en position d'écriture :: pen | ×9 |
| can4a-2024 (CAN) | correction q6 | double espace : min. Son trajet aura duré ‖ double espace : , pour passer des ‖ double espace : , l'aire exacte d'un disque de diamètre | ×6 ; sup=false ; sup=true (revue-0-a) |
| can4a-2024 (CAN) | énoncé q14 | double espace : Le nombre d'arêtes d'un cube est : [champ] . ‖ double espace : quand @greenFlag est cliqué Le lutin est placé au c ‖ double espace : quand @greenFlag est cliqué Le lutin est placé au centre de l'é | ×21 ; sup=false ; sup=true (revue-0-a) |
| can4a-2024 (CAN) | énoncé non interactif q21 | double espace : quand @greenFlag est cliqué Le lutin est placé au c ‖ double espace : quand @greenFlag est cliqué Le lutin est placé au centre de l'é ‖ double espace : Le lutin est placé au centre de l'écran répéter [6] fois avancer de [20] pas attendre | ×10 |
| can4a-2025 (CAN) | énoncé q17 | double espace : de combien de pas le lutin a-t-il avancé ? quand @greenFlag est cliqué répéter [5] fois ava ‖ double espace : de pas le lutin a-t-il avancé ? quand @greenFlag est cliqué répéter [5] fois avancer de [10 ‖ double espace : l avancé ? quand @greenFlag est cliqué répéter [5] fois avancer de [10] pas attendre | ×16 ; sup=false ; sup=true (revue-0-a) |
| can4a-2025 (CAN) | correction q15 | double espace : , donc l'arrondi au centième de | ×1 ; sup=true (revue-1-a) |
| can4a-2025 (CAN) | énoncé non interactif q17 | double espace : de combien de pas le lutin a-t-il avancé ? quand @greenFlag est cliqué répéter [5] fois ava ‖ double espace : de pas le lutin a-t-il avancé ? quand @greenFlag est cliqué répéter [5] fois avancer de [10 ‖ double espace : l avancé ? quand @greenFlag est cliqué répéter [5] fois avancer de [10] pas attendre | ×8 |
| can4a-2026 (CAN) | énoncé q17 | double espace : L'arrondi au dixième près de ‖ double espace : est [champ] . ‖ double espace : est [champ] | ×26 ; sup=false ; sup=true (revue-0-a) |
| can4a-2026 (CAN) | énoncé non interactif q17 | double espace : L'arrondi au dixième près de ‖ double espace : quand @greenFlag est cliqué stylo en position d'écr ‖ double espace : quand @greenFlag est cliqué stylo en position d'écriture répét | ×11 |
| can4a-NY2024 (CAN) | énoncé q13 | double espace : ra-t-il à payer ensuite pour le dernier versement ? [champ] € ‖ double espace : h. Combien d'heures fallait-il attendre avant de pouvoir s | ×2 ; défaut (revue-0-a) |
| can4a-NY2024 (CAN) | correction q16 | double espace : min. Le reste de la division euclidienne de ‖ double espace : qui montre que le reste de la division euclidienne de | ×2 ; défaut (revue-0-a) |
| can4a-NY2024 (CAN) | énoncé non interactif q20 | double espace : h. Combien d'heures fallait-il attendre avant de pouvoir s | ×1 |
| can4a-NY2025 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : , alors ‖ double espace : minutes + | ×6 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2025 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2025 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| can4a-NY2026 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : , alors ‖ double espace : minutes + | ×5 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2026 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2026 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| can4C1-01 (CAN) | correction q1 | double espace : ioritaire sur l'addition, on commence par effectuer le produit | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can4C22-04 (CAN) | correction q1 | double espace : les met au même dénominateur. On prend pour dénominateur commun le produit des deux dénomi ‖ double espace : minateur. On prend pour dénominateur commun le produit des deux dénominateurs | ×20 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G1-01 (CAN) | correction q1 | double espace : , rectangle en | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G1-02 (CAN) | correction q1 | double espace : , rectangle en | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G2-03 (CAN) | correction q1 | double espace : . Le coefficient d'agrandissement est donné par : | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G3-03 (CAN) | énoncé q1 | double espace : Quelle est l'aire d'un carré dont le périmètre est | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G3-03 (CAN) | énoncé non interactif q1 | double espace : Quelle est l'aire d'un carré dont le périmètre est | ×1 |
| can4G3-04 (CAN) | énoncé q1 | double espace : Déterminer le périmètre d'un carré d'aire | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can4G3-04 (CAN) | énoncé non interactif q1 | double espace : Déterminer le périmètre d'un carré d'aire | ×1 |
| can5A-01 (CAN) | énoncé q1 | double espace : quand @greenFlag est cliqué stylo en position d'éc ‖ double espace : quand @greenFlag est cliqué stylo en position d'écriture :: pe ‖ double espace : liqué stylo en position d'écriture :: pen répéter [...] fois avancer de [20] pas tourne | ×20 ; défaut ; défaut nb=10 (revue-0-a) |
| can5A-01 (CAN) | énoncé non interactif q1 | double espace : quand @greenFlag est cliqué stylo en position d'éc ‖ double espace : quand @greenFlag est cliqué stylo en position d'écriture :: pe ‖ double espace : liqué stylo en position d'écriture :: pen répéter [...] fois avancer de [20] pas tourne | ×10 |
| can5a-2021 (CAN) | énoncé q2 | double espace : est : [champ] | ×1 ; sup= (revue-0-a) |
| can5a-2022 (CAN) | correction q4 | double espace : , pour passer des ‖ double espace : La somme de | ×3 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) | énoncé q9 | double espace : Recopie le résultat de : | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) | énoncé non interactif q9 | double espace : Recopie le résultat de : ‖ double espace : ..... h ..... min ‖ espace avant ponctuation : ..... h ..... min | ×3 |
| can5a-2023 (CAN) | correction q3 | double espace : min. Son trajet aura duré ‖ double espace : , il mettra | ×3 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2023 (CAN) | énoncé q7 | double espace : €. Combien coûtent ‖ double espace : Recopie le résultat de : | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can5a-2023 (CAN) | énoncé non interactif q7 | double espace : €. Combien coûtent ‖ double espace : Recopie le résultat de : | ×2 |
| can5a-2024 (CAN) | correction q6 | double espace : min. Son trajet aura duré ‖ double espace : , pour passer des ‖ double espace : L'aire du rectangle est : | ×5 ; sup=false ; sup=true (revue-0-a) |
| can5a-2024 (CAN) | énoncé q26 | double espace : min à vitesse constante. La distance parco ‖ double espace : h de trajet est : [champ] ‖ double espace : min. La durée de son trajet en minutes est de : [champ] min | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-2024 (CAN) | énoncé non interactif q26 | double espace : min à vitesse constante. La distance parco | ×1 |
| can5a-NY2024 (CAN) | correction q15 | double espace : , alors ‖ double espace : est un multiple de ‖ double espace : min. Le reste de la division euclidienne de | ×4 ; défaut (revue-0-a) |
| can5a-NY2024 (CAN) | énoncé q19 | double espace : ra-t-il à payer ensuite pour le dernier versement ? [champ] € | ×1 ; défaut (revue-0-a) |
| can5a-NY2025 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : Mehdi possède | ×3 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2025 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2025 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| can5a-NY2026 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| can5C2-03 (CAN) | correction q1 | double espace : On remarque de part et d'autre du signe " | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C2-04 (CAN) | titre | espace avant ponctuation : Multiplier par 1,5 ou 2,5 ou ... | ×1 |
| can5C5-03 (CAN) | titre | double espace : Trouver un entier relatif (addition à trou) | ×1 |
| can5C5-04 (CAN) | titre | double espace : Trouver un entier relatif (addition à trou, écriture simpl | ×1 |
| can5P1-03 (CAN) | énoncé q1 | double espace : kg. Combien faut-il acheter de ces mêmes potimarrons pour totaliser une masse ‖ double espace : kg. Combien faut-il acheter de ces mêmes potimarrons pour totaliser une mas ‖ double espace : kg. Combien faut-il acheter de ces mêmes citrouilles pour totaliser une mas | ×5 ; défaut nb=10 (revue-1-a) |
| can5P1-04 (CAN) | correction q1 | double espace : élèves ont un frère . Le nombre d'élèves n'en ayant pas est donc donné par : ‖ espace avant ponctuation : élèves ont un frère . Le nombre d'élèves n'en ayant pas ‖ double espace : un frère . Le nombre d'élèves n'en ayant pas est donc donné par : | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| can5P2-01 (CAN) | énoncé non interactif q1 | espace avant ponctuation : d'une quantité revient à la multiplier par .... | ×1 |
| can6a-2018 (CAN) | énoncé q13 | double espace : abscisse du point A : On donnera le résultat sous forme décimale. ‖ double espace : que sa sœur. Combien de billes sa sœur a-t-elle ? [champ] ‖ double espace : Recopie le plus grand nombre : | ×6 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) | correction q27 | double espace : Puisque Océane en a ‖ double espace : Puisque Alice en a | ×2 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) | énoncé non interactif q10 | espace avant ponctuation : vis pèsent ....... g. ‖ double espace : abscisse du point A : On donnera le résultat sous forme décimale. ‖ double espace : œufs est .... œufs. | ×10 |
| can6a-2021 (CAN) | correction q4 | double espace : , le nombre écrit sous le point d'interrogation c ‖ double espace : , pour passer des | ×2 ; défaut (revue-0-a) |
| can6a-2021 (CAN) | énoncé q10 | double espace : Combien y a-t-il de dizaines en tout dans ‖ double espace : Recopie le nombre le plus proche de | ×2 ; défaut (revue-0-a) |
| can6a-2021 (CAN) | énoncé non interactif q10 | double espace : Combien y a-t-il de dizaines en tout dans ‖ double espace : Recopie le nombre le plus proche de | ×2 |
| can6a-2022 (CAN) | énoncé q9 | double espace : est : [champ] ‖ double espace : abscisse du point A : On donnera le résultat sous forme décimale. | ×2 ; défaut (revue-0-a) |
| can6a-2022 (CAN) | correction q18 | double espace : g, pour passer des "kg" au "g", on multiplie par | ×1 ; défaut (revue-0-a) |
| can6a-2022 (CAN) | énoncé non interactif q24 | double espace : abscisse du point A : On donnera le résultat sous forme décimale. | ×1 |
| can6a-2023 (CAN) | correction q4 | double espace : Le double de ‖ double espace : Puisque Lisa en a ‖ double espace : ongueur du rectangle B. On en déduit que la largeur du rectangle B est aussi | ×4 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) | énoncé q11 | double espace : fois plus que sa sœur. Combien de billes sa sœur a-t-elle ? [champ] billes. ‖ double espace : de est deux fois plus âgé que Karole. Jean-Claude a [champ] ans. | ×2 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) | énoncé non interactif q7 | espace avant ponctuation : ..... h ..... min ‖ double espace : fois plus que sa sœur. Combien de billes sa sœur a-t-elle ? | ×2 |
| can6a-2024 (CAN) | énoncé q4 | double espace : carreaux de chocolat pèsent [champ] g | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6a-2024 (CAN) | correction q4 | double espace : g, donc ‖ double espace : On commence par calculer | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2025 (CAN) | énoncé q8 | double espace : morceaux de sucre pèsent [champ] g. ‖ double espace : g est égal à [champ] g. ‖ double espace : €. On me rend [champ] € | ×6 ; sup=false ; sup=true (revue-0-a) |
| can6a-2025 (CAN) | correction q8 | double espace : g, donc | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) | énoncé non interactif q26 | double espace : . [figure] | ×1 |
| can6a-CoopMaths (CAN) | énoncé q13 | espace avant ponctuation : minutes en heures et minutes (format : ... h ...min) [champ] | ×31 ; sup=31 ; sup=13 (revue-0-a) |
| can6a-CoopMaths (CAN) | énoncé non interactif q13 | espace avant ponctuation : minutes en heures et minutes (format : ... h ...min) | ×1 |
| can6a-NY2024 (CAN) | énoncé q23 | double espace : ra-t-il à payer ensuite pour le dernier versement ? [champ] € | ×1 ; défaut (revue-0-a) |
| can6a-NY2025 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : , alors ‖ double espace : Mehdi possède | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2025 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2025 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| can6a-NY2026 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : , alors | ×3 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2026 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2026 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| can6C1-02 (CAN) | src/exercices/can/6e/can6C1-02.ts | Correction « Le quart de $48$ est $⟦12⟧.$ » : point final dans la formule. → est $⟦12⟧$. | ×1 |
| can6C1-07 (CAN) | correction q1 | double espace : Le nombre cherché vérifie l'égalité : | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C2-01 (CAN) | correction q1 | double espace : ou bien d'abord diviser par ‖ double espace : , puis multiplier par | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C3-05 (CAN) | correction q1 | double espace : Ainsi, le chiffre des unités devient le chiffre des dixièmes. ‖ double espace : rendre le centième. Ainsi, le chiffre des unités devient le chiffre des centièmes. | ×7 ; défaut nb=10 (revue-1-a) |
| can6C4-03 (CAN) | correction q1 | double espace : élève sans place dans une rangée. ‖ double espace : élèves sans place dans une rangée. | ×4 ; défaut nb=10 (revue-1-a) |
| can6C51-01 (CAN) | correction q1 | double espace : . Ainsi, le nombre qui, multiplié par | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C53-05 (CAN) | correction q1 | double espace : re ces deux nombres. Le plus petit multiple commun de | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-02 (CAN) | énoncé q3 | double espace : Combien de mangas Hélène a-t-elle achetés ? [champ] mangas ‖ double espace : Combien de mangas Yvette a-t-elle achetés ? [champ] mangas | ×2 ; défaut nb=10 (revue-1-a) |
| can6C6-02 (CAN) | correction q3 | double espace : €, donc le nombre de mangas est donné par | ×6 ; défaut nb=10 (revue-1-a) |
| can6C6-05 (CAN) | énoncé q1 | double espace : litres de jus de fruits. Les verres de Corinne contiennent ‖ double espace : Le nombre de billes de Benoît est égal au quart du nombre de billes de sa sœur. ‖ double espace : litres de jus de fruits. Les verres de Quynh contiennent | ×12 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-05 (CAN) | correction q1 | espace avant ponctuation : litre . Dans ‖ espace avant ponctuation : litre . Elle pourra donc servir | ×2 ; défaut (revue-0-a) |
| can6C6-05 (CAN) | énoncé non interactif q1 | double espace : litres de jus de fruits. Les verres de Corinne contiennent | ×1 |
| can6C6-06 (CAN) | énoncé q1 | double espace : € de moins que Nawel. ‖ double espace : kg de légumes . Il en a acheté ‖ espace avant ponctuation : kg de légumes . Il en a acheté | ×19 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-06 (CAN) | correction q1 | double espace : € de moins que celui de Nawel. Na ‖ double espace : € de moins que celui de Nawel. Nawel a donc ‖ double espace : € de plus . Elle l'a donc payé ( | ×39 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-06 (CAN) | énoncé non interactif q1 | double espace : € de moins que Nawel. | ×2 |
| can6C6-10 (CAN) | correction q1 | double espace : On calcule l'économie par le produit du nombre de | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6D2-02 (CAN) | correction q1 | double espace : et on complète par ‖ double espace : . Puis on ajoute les | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| can6D3-01 (CAN) | énoncé q3 | double espace : Un quart d'heure est égal à [champ] minutes | ×1 ; défaut nb=10 (revue-1-a) |
| can6D3-01 (CAN) | correction q3 | double espace : Un quart d'heure est égal à | ×1 ; défaut nb=10 (revue-1-a) |
| can6I-01 (CAN) | consigne | espace avant ponctuation : ropose. Pour jouer, regarder les Règles du jeu . | ×1 ; sup=1 sup2=true sup4=true (revue-0-a) |
| can6I-01 (CAN) | énoncé q1 | double espace : e et trouver la couleur à noter. [champ] quand @greenFlag est cliqué aller à x: [50] y: [ ‖ double espace : la couleur à noter. [champ] quand @greenFlag est cliqué aller à x: [50] y: [50] s'orie ‖ double espace : orienter à [180] avancer de [20] pas tourner droite de [90] degrés avancer de [40] pas Note la | ×318 ; sup=1 sup2=true sup4=true ; sup=1 sup2=true sup4=false… (revue-0-a) |
| can6I-01 (CAN) | énoncé non interactif q1 | double espace : programme et trouver la couleur à noter. quand @greenFlag est cliqué aller à x: [50] y: [50 ‖ double espace : trouver la couleur à noter. quand @greenFlag est cliqué aller à x: [50] y: [50] s'orient ‖ double espace : ienter à [180] avancer de [20] pas tourner droite de [90] degrés avancer de [40] pas Note la co | ×18 |
| can6M1-01 (CAN) | correction q1 | double espace : . Pour avoir son périmètre, on multiplie par | ×10 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M1-04 (CAN) | correction q3 | double espace : , on obtient la somme des deux longueurs égales du triangle en effectuant la différence ‖ double espace : . On obtient la longueur cherchée en divisant par | ×2 ; défaut nb=10 (revue-1-a) |
| can6M1-04 (CAN) | énoncé q4 | double espace : Le périmètre de ce carré est ‖ double espace : Quel est le périmètre de ce triangle ? | ×2 ; défaut nb=10 (revue-1-a) |
| can6M2-01 (CAN) | correction q1 | double espace : . Ce qui fait une différence de ‖ double espace : . Ce qui fait bien une différence de | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M3-01 (CAN) | correction q1 | double espace : , alors pour passer des | ×6 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M4-01 (CAN) | énoncé q2 | double espace : Choisir parmi les propositions suivantes la hauteur d'une colline. [champ] ‖ double espace : Choisir parmi les propositions suivantes la hauteur d'une chaise. [champ] ‖ double espace : Choisir parmi les propositions suivantes la hauteur d'une maison. [champ] | ×5 ; défaut nb=10 (revue-1-a) |
| can6M4-01 (CAN) | correction q2 | double espace : La hauteur d'une colline est ‖ double espace : La hauteur d'une chaise est ‖ double espace : La hauteur d'une maison est | ×5 ; défaut nb=10 (revue-1-a) |
| can6M4-03 (CAN) | correction q1 | double espace : , pour passer des | ×5 ; défaut nb=10 (revue-1-a) |
| can6M4-05 (CAN) | correction q1 | double espace : , pour convertir des | ×5 ; défaut ; défaut nb=10 (revue-0-a) |
| can6N1-04 (CAN) | titre | espace avant ponctuation : Déterminer le chiffre des ... | ×1 |
| can6N3-02 (CAN) | énoncé q1 | double espace : . On donnera le résultat sous forme décimale. | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6N3-02 (CAN) | énoncé non interactif q1 | double espace : . On donnera le résultat sous forme décimale. | ×1 |
| can6P2-03 (CAN) | énoncé q1 | double espace : en voiture et les autres à pied. Quel est le pourcen ‖ double espace : el est le pourcentage des élèves qui se déplacent à pied ? [champ] % | ×2 ; défaut nb=10 (revue-1-a) |
| can6P2-03 (CAN) | correction q1 | double espace : des élèves de ce collège se déplacent à pied. | ×1 ; défaut nb=10 (revue-1-a) |
| can6P2-04 (CAN) | correction q1 | double espace : €. Le pourcentage de baisse est donné par le quotient : ‖ double espace : €. Le pourcentage d’augmentation est donné par le quotient : | ×5 ; défaut nb=10 (revue-1-a) |
| canc3a (CAN) | énoncé q29 | espace avant ponctuation : minutes elle fait .... tours. [champ] ‖ espace avant ponctuation : minutes il fait .... tours. [champ] | ×32 ; sup= ; sup=29… (revue-0-a) |
| canc3a (CAN) | énoncé non interactif q29 | espace avant ponctuation : minutes elle fait .... tours. | ×1 |
| canc3a-2023 (CAN) | correction q11 | double espace : Puisque Zoé en a | ×1 ; défaut (revue-0-a) |
| canc3a-2024 (CAN) | énoncé q4 | double espace : carreaux de chocolat pèsent [champ] g ‖ double espace : billes et Wendy en a ‖ double espace : billes et Lola en a | ×6 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | correction q4 | double espace : g, donc ‖ double espace : On commence par calculer | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2024 (CAN) | énoncé non interactif q17 | double espace : billes et Wendy en a | ×2 |
| canc3a-2025 (CAN) | énoncé q8 | double espace : morceaux de sucre pèsent [champ] g. ‖ double espace : œufs est [champ] œufs. ‖ double espace : euros. On me rend [champ] €. | ×6 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025 (CAN) | correction q8 | double espace : g, donc ‖ double espace : dixièmes est égal à | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé q8 | double espace : morceaux de sucre pèsent [champ] g. ‖ double espace : mises bout à bout. On obtient une longueur de [champ] ‖ double espace : La longueur du contour de ce triangle est de | ×10 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | correction q8 | double espace : g, donc ‖ double espace : dizaines est égal à ‖ double espace : La longueur du contour est | ×5 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2025b (CAN) | énoncé non interactif q18 | double espace : La longueur du contour de ce triangle est de | ×1 |
| canc3a-2026 (CAN) | énoncé non interactif q26 | double espace : . [figure] | ×1 |
| canc3a-2026b (CAN) | énoncé non interactif q26 | double espace : . [figure] | ×1 |
| canc3a-NY2024 (CAN) | énoncé q23 | double espace : ra-t-il à payer ensuite pour le dernier versement ? [champ] € ‖ double espace : h du matin. Combien d'heures fallait-il attendre avant de pouvoir s | ×2 ; défaut (revue-0-a) |
| canc3a-NY2024 (CAN) | énoncé non interactif q28 | double espace : h du matin. Combien d'heures fallait-il attendre avant de pouvoir s | ×1 |
| canc3a-NY2025 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : , alors ‖ double espace : Mehdi possède | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2025 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2025 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| canc3a-NY2026 (CAN) | correction q4 | double espace : Le nombre cherché vérifie l'égalité : ‖ double espace : , alors | ×3 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2026 (CAN) | énoncé q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2026 (CAN) | énoncé non interactif q13 | double espace : Quel est le périmètre de ce triangle ? ‖ double espace : h du matin. Combien d'heures faut-il attendre avant de pouvoir se s | ×2 |
| canc3C07 (CAN) | énoncé q1 | double espace : ans de moins que Gaspard. ‖ double espace : ballons de moins que Lilian. ‖ double espace : ballons de moins que Lilian. Sachant | ×21 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C07 (CAN) | correction q1 | double espace : ans de moins que Nawel. Il a donc ( ‖ double espace : ballons de moins que Lilian donc Lilian a ‖ double espace : ballons de plus que Isabelle. Il | ×43 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C07 (CAN) | énoncé non interactif q1 | double espace : ans de moins que Gaspard. | ×1 |
| canc3C08 (CAN) | correction q1 | double espace : €. Isabelle a ‖ double espace : € de moins que Nawel signifie que Nawel a ‖ double espace : € de plus que Isabelle. Nawel a donc : | ×39 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C08 (CAN) | énoncé q1 | double espace : ballons de moins que Lilian. ‖ double espace : ballons de moins que Lilian. Sachant ‖ espace avant ponctuation : garçons . Il y a | ×18 ; défaut nb=10 (revue-1-a) |
| canc3C09 (CAN) | énoncé q1 | double espace : fois plus que Béatrice. Combien de biscuits a Béatrice ? ‖ double espace : fois plus que Béatrice. Combien de biscuits a Béatrice ? [champ] biscuits ‖ double espace : fois moins de biscuits que Yvette qui en a | ×21 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C09 (CAN) | correction q1 | double espace : Puisque Julien a ‖ double espace : fois plus que Béatrice, Béatrice en a ‖ double espace : Yvette a | ×22 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C09 (CAN) | énoncé non interactif q1 | double espace : fois plus que Béatrice. Combien de biscuits a Béatrice ? | ×2 |
| canc3C10 (CAN) | énoncé q1 | double espace : fois plus. Combien de clous ont-ils ensembl ‖ double espace : fois plus que Isabelle. Combien de ballo ‖ double espace : que Isabelle. Combien de ballons ont-ils ensemble ? [champ] ballons | ×23 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C10 (CAN) | correction q1 | double espace : Gabrielle a ‖ double espace : fois plus, il en a donc ‖ double espace : Puisque Yann a | ×39 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C10 (CAN) | énoncé non interactif q1 | double espace : fois plus. Combien de clous ont-ils ensembl | ×1 |
| canc3C17 (CAN) | énoncé q1 | double espace : euros. Combien a-t-elle d'argent maintenant sur son compte ? [champ] ‖ double espace : € et un casque à | ×3 ; défaut nb=10 (revue-1-a) |
| canc3C17 (CAN) | correction q3 | double espace : Dans la journée, le vendeur a vendu un VTT à ‖ double espace : € et un casque à ‖ double espace : €, puis il a dépensé | ×5 ; défaut nb=10 (revue-1-a) |
| canc3C18 (CAN) | correction q3 | double espace : € à Rémi pour acheter son jeu. ‖ double espace : € à Xavier pour acheter son jeu. | ×2 ; défaut nb=10 (revue-1-a) |
| canc3C20 (CAN) | énoncé q3 | double espace : Pour un concert, il y a ‖ double espace : €. Chaque tee-shirt coûte | ×4 ; défaut nb=10 (revue-1-a) |
| canc3M02 (CAN) | énoncé q3 | double espace : Quel est le périmètre de ce triangle ? La fig ‖ double espace : Le périmètre de ce carré est ‖ double espace : Quel est le périmètre de ce triangle ? | ×3 ; défaut nb=10 (revue-1-a) |
| canc3M02 (CAN) | correction q4 | double espace : Il s'agit d'un carré. Son côté est donc le quart de son périmètre, soit ‖ double espace : , on obtient la somme des deux longueurs égales du triangle en effectuant la différence ‖ double espace : . On obtient la longueur cherchée en divisant par | ×3 ; défaut nb=10 (revue-1-a) |
| canCE1a-2025 (CAN) | énoncé q4 | double espace : cases ». Magalie doit alors aller sur la case [champ] . ‖ double espace : Écris un nombre qui a ‖ double espace : Écris un nombre dans lequel on entend vingt et qui soit plus grand que | ×8 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | correction q4 | double espace : Magalie arrive donc sur la case ‖ espace avant ponctuation : se lit quatre- vingts . ‖ double espace : parts. Chaque part correspond à | ×5 ; sup=false ; sup=true (revue-0-a) |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | double espace : cases ». Magalie doit alors aller sur la case ‖ double espace : Écris un nombre qui a ‖ double espace : Écris un nombre dans lequel on entend vingt et qui soit plus grand que | ×4 |
| canCE2a-2025 (CAN) | énoncé q10 | double espace : el est le plus grand nombre que je peux former avec les chiffres : | ×2 ; sup=false ; sup=true (revue-0-a) |
| canCE2a-2025 (CAN) | correction q13 | double espace : €, soit la somme de | ×1 ; sup=false (revue-0-a) |
| canCE2a-2025 (CAN) | énoncé non interactif q10 | double espace : el est le plus grand nombre que je peux former avec les chiffres : | ×1 |
| CM1C1K (cm1) | correction q1 | double espace : ou bien d'abord diviser par ‖ double espace : , puis multiplier par | ×26 ; défaut ; défaut nb=10 (revue-0-a) |
| CM1N1E (cm1) | énoncé q1 | double espace : Je suis un mystérieux nombre composé de 3 chiffres, tous différents les uns ‖ double espace : Je suis un nombre à 3 chiffres, tous différents. a) On trouve 7 ‖ double espace : Je suis un nombre à 4 chiffres, tous différents. a) Le chiffre d | ×7 ; sup=1 sup2=7 sup3=6 sup4=true sup5=true ; sup=2 sup2=7 sup3=7 sup4=false sup5=false… (revue-7-a) |

## T6

**Points de suspension** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 1AL11-8 (1e) | src/exercices/1e/1AL11-8.ts:37 | « ... » : Calculer $S = ${u0} + ${u0 + r} + ${u0 + 2 * r} + ${u0 + 3 * r} + ... + ${u0 + n * r}$. | ×1 |
| 1AL11-8 (1e) | src/exercices/1e/1AL11-8.ts:39 | « ... » : $S = ${u0} + (${u0} + ${r}) + (${u0} + 2 \\times ${r}) + (${u0} + 3 \\times ${r}) + ... + (${u0} + ${n} \\times ${r})$ | ×1 |
| 1AL11-8 (1e) | src/exercices/1e/1AL11-8.ts:40 | « ... » : &lt;br>$S = (\\underbrace{${u0} + ${u0} + ${u0} + ... + ${u0}}_{${n + 1}\\times${u0}}) + ${r} \\times (1 + 2 + 3 + ... + ${n})$ | ×1 |
| 1AL11-8 (1e) | src/exercices/1e/1AL11-8.ts:42 | « ... » : &lt;br> Or, on sait d'après le cours que : $1 + 2 + 3 + ... + n = \\dfrac{n(n+1)}{2}$. | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:32 | « ... » : Rappel : $1 + 2 + 3 + ... + n = \\dfrac{n(n + 1)}{2}$. | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:60 | « ... » : &lt;br>Calculer $\\displaystyle S = ${u}_1 + ${u}_2 + ... + ${u}_{${n}} =\\sum_{k=1}^{k=${n}}${u}_k$. | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:62 | « ... » : $S = ${u1} + (${u1} + ${r}) + (${u1} + 2\\times${r}) + ... + (${u1} + ${n - 1} \\times ${r})$ | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:63 | « ... » : &lt;br>$\\phantom{S} = (\\underbrace{${u1} + ${u1} + ... + ${u1}}_{${n}\\times ${u1}}) + ${r} \\times (1 + 2 + ... + ${n - 1})$ | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:74 | « ... » : &lt;br>Calculer $\\displaystyle S = ${u}_0 + ${u}_1 + ... + ${u}_{${n}} =\\sum_{k=0}^{k=${n}}${u}_k$. | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:76 | « ... » : $S = ${u0} + (${u0} + ${r}) + (${u0} + 2\\times${r}) + ... + (${u0} + ${n} \\times ${r})$ | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:77 | « ... » : &lt;br>$\\phantom{S} = (\\underbrace{${u0} + ${u0} + ... + ${u0}}_{${n + 1}\\times ${u0}}) + ${r} \\times (1 + 2 + ... + ${n})$ | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:90 | « ... » : &lt;br>Calculer $\\displaystyle S = ${u}_{${premierIndice}} + ${u}_{${premierIndice + 1}} + ... + ${u}_{${dernierIndice}} =\\sum_{k=${premierIndice}}^{k=${dernierI | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:92 | « ... » : $S = ${u0} + (${u0} + ${r}) + (${u0} + 2\\times${r}) + ... + (${u0} + ${n - 1}\\times${r})$ | ×1 |
| 1AL11-8b (1e) | src/exercices/1e/1AL11-8b.ts:93 | « ... » : &lt;br>$\\phantom{S} = ${n}\\times${u0} + ${r}\\times(1 + 2 + ... + ${n - 1})$ | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:67 | « ... » : &lt;br>Calculer $\\displaystyle S = ${u}_0 + ${u}_1 + ... + ${u}_{${n}} =\\sum_{k=0}^{${n}}${u}_k$ | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:73 | « ... » : ${texteGras('Rappel')} : $1 + q + q^2 + ... + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$. | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:74 | « ... » : $S = \\underbrace{${premierTerme}}_{${u}_0} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_1}) + (\\underbrace{${premierTerme} \\times${texNombr | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:75 | « ... » : &lt;br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ${texNombre(q)}^2 + ... + ${texNombre(q)}^{${n}})$ | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:85 | « ... » : &lt;br>Calculer $\\displaystyle S = ${u}_1 + ${u}_2 + ... + ${u}_{${n}} =\\sum_{k=1}^{${n}}${u}_k$ | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:91 | « ... » : ${texteGras('Rappel')} : $1 + q + q^2 + ... + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$. | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:92 | « ... » : $S = \\underbrace{${premierTerme}}_{${u}_1} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_2}) + (\\underbrace{${premierTerme} \\times${texNombr | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:93 | « ... » : &lt;br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ${texNombre(q)}^2 + ... + ${texNombre(q)}^{${n - 1}})$ | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:104 | « ... » : &lt;br>Calculer $\\displaystyle S = ${u}_{${premierRang}} + ${u}_{${premierRang + 1}} + ... + ${u}_{${dernierRang}} =\\sum_{k=${premierRang}}^{${dernierRang}}${u}_ | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:113 | « ... » : ${texteGras('Rappel')} : $1 + q + q^2 + ... + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$. | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:114 | « ... » : $S = \\underbrace{${premierTerme}}_{${u}_{${premierRang}}} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_{${premierRang + 1}}}) + ... + (\\unde | ×1 |
| 1AL11-8c (1e) | src/exercices/1e/1AL11-8c.ts:115 | « ... » : &lt;br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ... + ${texNombre(q)}^{${nombreDeTermes - 1}})$ | ×1 |
| 1AN14-6 (1e) | src/exercices/1e/1AN14-6.ts:49 | « ... » : Montrer que... (non interactif) | ×1 |
| 3I12-1 (3e) | src/exercices/3e/3I12-1.ts:44 | « ... » : Nombres séparés par des tirets :\n1 : Une phrase finale contient : ... est un multiple de ...\n2 : Une phrase finale contient : ... divise ...\n3 : Une phrase f | ×1 |
| 3I12-2 (3e) | src/exercices/3e/3I12-2.ts:47 | « ... » : Nombres séparés par des tirets :\n1 : Une phrase finale contient : ... est un multiple de ...\n2 : Une phrase finale contient : ... divise ...\n3 : Une phrase f | ×1 |
| 3I12-3 (3e) | src/exercices/3e/3I12-3.ts:52 | « ... » : Nombres séparés par des tirets :\n1 : Une phrase finale contient : ... est un multiple de ...\n2 : Une phrase finale contient : ... divise ...\n3 : Une phrase f | ×1 |
| 3I12-4 (3e) | src/exercices/3e/3I12-4.ts:46 | « ... » : Nombres séparés par des tirets :\n1 : Une phrase finale contient : ... est un multiple de ...\n2 : Une phrase finale contient : ... divise ...\n3 : Une phrase f | ×1 |
| 3L13-3 (3e) | src/exercices/3e/3L13-3.ts:967 | « ... » : Nombres séparés par des tirets :\n0 : Mélange\n1 : basket\n2 : basket2\n3 : achats\n4 : polygone\n5 : programmes (produit vs produit,\n ... solution entière pos | ×1 |
| 3S1QCM-2 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q3.ts:44 | « ... » : Le médiane de la série ci-dessous est ... &lt;br> | ×1 |
| 3S1QCM-3 (3e) | src/exercices/QCMBrevet/A2023/NCD23E1Q5.ts:40 | « ... » : Le médiane de la série ci-dessous est ... &lt;br> | ×1 |
| 3S1QCM-4 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q4.ts:39 | « ... » : La moyenne de la série ci-dessous est ... &lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:91 | « ... » : Les événements « Obtenir ${figure} » et « Obtenir un ${nombre} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:97 | « ... » : Les événements « Obtenir un ${nombre} » et « Obtenir ${figure} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:107 | « ... » : Les événements « Obtenir un ${valeur} » et « Obtenir un ${famille} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:113 | « ... » : Les événements « Obtenir un ${famille} » et « Obtenir un ${valeur} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:124 | « ... » : Les événements « Obtenir une carte de couleur Noire » et « Obtenir une carte de couleur Rouge » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:133 | « ... » : Les événements « Obtenir une carte de couleur Rouge » et « Obtenir une carte de couleur Noire » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:145 | « ... » : Les événements « Obtenir ${figure} » et « Obtenir une carte de couleur ${couleur} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:151 | « ... » : Les événements « Obtenir une carte de couleur ${couleur} » et « Obtenir ${figure} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:161 | « ... » : Les événements « Obtenir un ${trefleOuPique} » et « Obtenir une carte de couleur Noire » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:167 | « ... » : Les événements « Obtenir un ${carreauOuCoeur} » et « Obtenir une carte de couleur Rouge » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:178 | « ... » : Les événements « Obtenir un Carreau ou un Coeur » et « Obtenir une carte de couleur Noire » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:189 | « ... » : Les événements « Obtenir un Trèfle ou un Pique » et « Obtenir une carte de couleur Rouge » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:219 | « ... » : Les événements « Obtenir une carte autre qu'un Roi » et « Obtenir une Dame ou un Valet » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:226 | « ... » : Les événements « Obtenir une carte autre qu'une Dame » et « Obtenir un Valet ou un Roi » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:236 | « ... » : Les événements « Obtenir une carte autre qu' ${figure} » et « Obtenir ${figure} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:242 | « ... » : Les événements « Obtenir une carte autre qu'un ${nombre} » et « Obtenir un ${nombre} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:252 | « ... » : Les événements « Ne pas obtenir ${valeur} » et « Obtenir ${valeur} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:260 | « ... » : Les événements « Obtenir ${valeur} » et « Ne pas obtenir ${valeur} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:272 | « ... » : Les événements « Ne pas obtenir une carte de couleur ${couleur} » et « Obtenir un ${trefleOuPique} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:278 | « ... » : Les événements « Obtenir un ${trefleOuPique} » et « Ne pas obtenir une carte de couleur ${couleur} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:289 | « ... » : Les événements « Ne pas obtenir une carte de couleur ${couleur} » et « Obtenir un ${carreauOuCoeur} » sont...&lt;br> | ×1 |
| 4S20-3 (4e) | src/exercices/4e/4S20-3.ts:295 | « ... » : Les événements « Obtenir un ${carreauOuCoeur} » et « Ne pas obtenir une carte de couleur ${couleur} » sont...&lt;br> | ×1 |
| 5G3A-4 (5e) | src/exercices/5e/5G3A-4.ts:129 | « ... » : 1 : Construire l'image de ... par la symétrie de centre ...\n2 : Construire le symétrique de ... par rapport au point ... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:104 | « ... » : Si un quadrilatère est un parallélogramme, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:143 | « ... » : Si un quadrilatère est un parallélogramme, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:167 | « ... » : Si un quadrilatère est un parallélogramme, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:199 | « ... » : Si un quadrilatère est un parallélogramme, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:230 | « ... » : Si un quadrilatère est un parallélogramme, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:255 | « ... » : Si un quadrilatère est un rectangle, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:293 | « ... » : Si un quadrilatère est un rectangle, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:316 | « ... » : Si un quadrilatère est un rectangle, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:350 | « ... » : Si un quadrilatère est un rectangle, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:380 | « ... » : Si un quadrilatère est un rectangle, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:405 | « ... » : Si un quadrilatère est un losange, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:443 | « ... » : Si un quadrilatère est un losange, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:466 | « ... » : Si un quadrilatère est un losange, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:498 | « ... » : Si un quadrilatère est un losange, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:527 | « ... » : Si un quadrilatère est un losange, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:552 | « ... » : Si un quadrilatère est un carré, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:589 | « ... » : Si un quadrilatère est un carré, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:611 | « ... » : Si un quadrilatère est un carré, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:643 | « ... » : Si un quadrilatère est un carré, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:672 | « ... » : Si un quadrilatère est un carré, alors... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:696 | « ... » : Si un quadrilatère non croisé a deux côtés opposés parallèles, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:728 | « ... » : Si un quadrilatère non croisé a deux côtés opposés de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:760 | « ... » : Si un quadrilatère non croisé a deux côtés consécutifs perpendiculaires, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:792 | « ... » : Si un quadrilatère non croisé a deux côtés consécutifs de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:824 | « ... » : Si un quadrilatère non croisé a deux côtés consécutifs perpendiculaires et de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:856 | « ... » : Si un parallélogramme a deux côtés consécutifs perpendiculaires, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:887 | « ... » : Si un parallélogramme a deux côtés consécutifs de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:918 | « ... » : Si un parallélogramme a deux côtés consécutifs perpendiculaires et de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:949 | « ... » : Si un quadrilatère non croisé a ses diagonales perpendiculaires, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:981 | « ... » : Si un quadrilatère non croisé a ses diagonales de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:1013 | « ... » : Si un parallélogramme a ses diagonales perpendiculaires, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:1042 | « ... » : Si un parallélogramme a ses diagonales de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:1071 | « ... » : Si un quadrilatère non croisé a ses angles opposés de même mesure, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:1102 | « ... » : Si un quadrilatère non croisé a ses angles consécutifs supplémentaires, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:1133 | « ... » : Si un parallélogramme a ses diagonales perpendiculaires et de même longueur, alors on est sûr que... | ×1 |
| 5G6F-1 (5e) | src/exercices/5e/5G6F-1.ts:1163 | « ... » : Si un quadrilatère non croisé a ses diagonales perpendiculaires et de même longueur, alors on est sûr que... | ×1 |
| 5N1I-6 (5e) | src/exercices/5e/5N1I-6.ts:144 | « ... » : 1 : "Divisible par..."\n2 : "Multiple de..."\n3 : Mélange | ×1 |
| 5N5A (5e) | src/exercices/5e/5N5A.ts:334 | « ... » : Cela fait zéro, il me semble... donc ça ne fonctionne que pour 1. | ×1 |
| 5N5A (5e) | src/exercices/5e/5N5A.ts:464 | « ... » : C'est un de trop... | ×1 |
| 6AutoG1-4 (6e) | src/exercices/6e/6G2A.ts:165 | « ... » : 1 : Un rayon est...\n2 : [AB] est ...\n3 : Mélange | ×1 |
| 6AutoN4 (6e) | src/exercices/6e/6AutoN4.ts:22 | « ... » : Multiplier un décimal par 10, 100, 1000, 0,1, 0,01, 0,001... | ×1 |
| 6AutoN4-2 (6e) | src/exercices/6e/6AutoN4-2.ts:15 | « ... » : Multiplier ou diviser un entier par 10, 100, 1 000... avec résultat entier | ×1 |
| 6AutoP2 (6e) | src/exercices/6e/6P3autoB.ts:16 | « ... » : Résoudre des problèmes de type : ... fois plus ou ... fois moins | ×1 |
| 6G0-1 (6e) | src/exercices/6e/6G0-1.ts:142 | « ... » : Placer 3 points $${p[0]}$, $${p[1]}$ et $${p[2]}$ non alignés puis tracer... &lt;br>&lt;br> | ×1 |
| 6G2A-1 (6e) | src/exercices/6e/6G2A-1.ts:213 | « ... » : ...  | ×1 |
| 6N1A (6e) | src/exercices/6e/6N1A.ts:18 | « ... » : Décomposer un nombre décimal (nombre de..., chiffre des..., partie entière, partie décimale) | ×1 |
| 6N1A-5 (6e) | src/exercices/6e/6N1A-5.ts:15 | « ... » : Écrire un nombre à partir de son nombre de dizaines, de centaines, de milliers... | ×1 |
| 6N2autoB-1 (6e) | src/exercices/6e/6N2autoB-1.ts:246 | « ... » : 6 : n/10 = ... + .../10 + .../100 | ×1 |
| 6N2autoC-2 (6e) | src/exercices/6e/6N2autoC-2.ts:8 | « ... » : Par combien multiplier un nombre pour que le chiffre des unités devienne le chiffre des ... ? | ×1 |
| 6N2B-4 (6e) | src/exercices/6e/6N2B-4.ts:25 | « ... » : Par combien multiplier un nombre pour que le chiffre des unités devienne le chiffre des ... ? | ×1 |
| 6N5-8 (6e) | src/exercices/6e/6N5-8.ts:19 | « ... » : Résoudre des problèmes de type : ... de plus ou ... de moins | ×1 |
| can4a-2021 (CAN) | énoncé q5 | points de suspension en maths (\ldots) : $15\times .... =60$ ‖ points de suspension en maths (\ldots) : $-2\times 4\times .... =40$ | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2021 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $15\times .... =60$ ‖ points de suspension en maths (\ldots) : $-2\times 4\times .... =40$ | ×17 |
| can4a-2022 (CAN) | énoncé q14 | points de suspension en maths (\ldots) : $3+(....)=0$ ‖ points de suspension en maths (\ldots) : $\dfrac{6}{18}=\dfrac{....}{27}$ ‖ points de suspension en maths (\ldots) : $9\times....=1$ | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2022 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....\text{ m}$ ‖ points de suspension en maths (\ldots) : $\mathscr{P}=.... \text{ cm}$ | ×17 |
| can4a-2023 (CAN) | énoncé q14 | points de suspension en maths (\ldots) : $....$ | ×4 ; sup2=false ; sup2=true (revue-0-a) |
| can4a-2023 (CAN) | énoncé non interactif q5 | points de suspension en maths (\ldots) : $.... °$ ‖ points de suspension en maths (\ldots) : $....\text{ m}^2$ ‖ points de suspension en maths (\ldots) : $....$ | ×9 |
| can4a-2024 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $9 &lt; .... &lt; 9,1$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....\text{ dm}$ | ×13 |
| can4a-2025 (CAN) | énoncé non interactif q5 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $=....$ ‖ points de suspension en maths (\ldots) : $x=....$ | ×11 |
| can4a-2026 (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $....\text{ min}$ ‖ points de suspension en maths (\ldots) : $....\text{mm}$ ‖ points de suspension en maths (\ldots) : $....\text{ dam}^2$ | ×17 |
| can4a-NY2024 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....\text{ m}$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $=....$ | ×6 |
| can4a-NY2025 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,030$ ‖ points de suspension en maths (\ldots) : $2\,030= .... -3$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2025 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....~-2=2\,025+5$ ‖ points de suspension en maths (\ldots) : $....~ \times 2\,025=202\,500$ ‖ points de suspension en maths (\ldots) : $=....\text{ cm}$ | ×6 |
| can4a-NY2026 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,031$ ‖ points de suspension en maths (\ldots) : $2\,028= .... -1$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| can4a-NY2026 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $.... -2=2\,026+5$ ‖ points de suspension en maths (\ldots) : $.... \times 2\,026=202\,600$ ‖ points de suspension en maths (\ldots) : $=....\text{ cm}$ | ×5 |
| can4C21-03 (CAN) | titre | points de suspension : Calculer une fraction de dénominateur 0,25 ou 0,1 ... | ×1 |
| can4C21-05 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{19}{7} = .... + ....$ | ×2 |
| can4C22-06 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can5A-01 (CAN) | énoncé q1 | points de suspension : é stylo en position d'écriture :: pen répéter [...] fois avancer de [20] pas tourner d | ×2 ; défaut ; défaut nb=10 (revue-0-a) |
| can5A-01 (CAN) | énoncé non interactif q1 | points de suspension : é stylo en position d'écriture :: pen répéter [...] fois avancer de [20] pas tourner d | ×1 |
| can5a-2020 (CAN) | énoncé q1 | points de suspension en maths (\ldots) : $7\times .... =42$ | ×2 ; sup= (revue-0-a) |
| can5a-2020 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $7\times .... =42$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....\text{ cm}$ | ×19 |
| can5a-2021 (CAN) | énoncé q5 | points de suspension en maths (\ldots) : $15\times .... =60$ ‖ points de suspension en maths (\ldots) : $.... \leqslant -13,985 \leqsla$ ‖ points de suspension en maths (\ldots) : $. \leqslant -13,985 \leqslant ....$ | ×7 ; sup= (revue-0-a) |
| can5a-2021 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $15\times .... =60$ ‖ points de suspension en maths (\ldots) : $....\text{ cm}^2$ | ×20 |
| can5a-2022 (CAN) | énoncé q18 | points de suspension en maths (\ldots) : $4\times .... =18$ | ×2 ; sup2=false ; sup2=true (revue-0-a) |
| can5a-2022 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....\text{ cm}$ ‖ points de suspension : ..... h ..... min | ×20 |
| can5a-2023 (CAN) | énoncé non interactif q5 | points de suspension en maths (\ldots) : $.... °$ ‖ points de suspension en maths (\ldots) : $....\text{ m}^2$ ‖ points de suspension en maths (\ldots) : $....$ | ×6 |
| can5a-2024 (CAN) | correction q23 | points de suspension : cubes... Le nombre total de cubes est la somme des 5 pr | ×1 ; sup=false (revue-0-a) |
| can5a-2024 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $9 &lt; .... &lt; 9,1$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....\text{ dm}$ | ×18 |
| can5a-2025 (CAN) | énoncé non interactif q5 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $=....$ ‖ points de suspension en maths (\ldots) : $....\text{ m}$ | ×12 |
| can5a-2026 (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $....\text{ min}$ ‖ points de suspension en maths (\ldots) : $....\text{mm}$ ‖ points de suspension en maths (\ldots) : $....$ | ×20 |
| can5a-NY2024 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....\text{ cm}$ ‖ points de suspension en maths (\ldots) : $=....$ | ×6 |
| can5a-NY2025 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,030$ ‖ points de suspension en maths (\ldots) : $2\,030= .... -3$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2025 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....~-2=2\,025+5$ ‖ points de suspension en maths (\ldots) : $2,025 &lt; .... &lt; 2,035$ ‖ points de suspension en maths (\ldots) : $....$ | ×9 |
| can5a-NY2026 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,031$ ‖ points de suspension en maths (\ldots) : $2\,028= .... -1$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| can5a-NY2026 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $.... -2=2\,026+5$ ‖ points de suspension en maths (\ldots) : $2,026 &lt; .... &lt; 2,036$ ‖ points de suspension en maths (\ldots) : $....$ | ×7 |
| can5C1-09 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $5\,000 \times .... = 15$ | ×1 |
| can5C2-04 (CAN) | titre | points de suspension : Multiplier par 1,5 ou 2,5 ou ... | ×1 |
| can5C2-06 (CAN) | correction q1 | points de suspension : ... de chaque facteur en une seule opération : | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can5C4-06 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{3}{4} +~ .... =0,83$ | ×1 |
| can5C5-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $........ + (+18) = (+10)$ | ×2 |
| can5C5-04 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $.... +18 = 10$ | ×1 |
| can5D-01 (CAN) | énoncé non interactif q1 | points de suspension : ..... h | ×1 |
| can5D-02 (CAN) | énoncé non interactif q1 | points de suspension : ..... h | ×1 |
| can5D-03 (CAN) | énoncé non interactif q1 | points de suspension : ..... h | ×1 |
| can5P2-01 (CAN) | énoncé non interactif q1 | points de suspension : d'une quantité revient à la multiplier par .... | ×1 |
| can5P2-02 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $............&nbsp;\%$ | ×4 |
| can5P2-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....&nbsp;\%$ | ×1 |
| can6a-2018 (CAN) | src/exercices/can/6e/can6a-2018.ts | Q29 : « etc... » ; Q27 : « soit  : » (double espace). → etc. | ×1 |
| can6a-2018 (CAN) | énoncé q4 | points de suspension en maths (\ldots) : $.... \times 7=42$ ‖ points de suspension en maths (\ldots) : $.... &lt; \dfrac{5}{3} &lt; \ldots$ ‖ points de suspension en maths (\ldots) : $2\times .... =20$ | ×4 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) | correction q29 | points de suspension : lui qui a le plus grand chiffre des centièmes, etc... Le plus grand nombre est donc : | ×2 ; sup2=true ; sup2=false (revue-0-a) |
| can6a-2018 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $.... \times 7=42$ ‖ points de suspension : vis pèsent ....... g. | ×18 |
| can6a-2021 (CAN) | énoncé q2 | points de suspension en maths (\ldots) : $9\times .... =81$ ‖ points de suspension en maths (\ldots) : $1,5+....=10$ ‖ points de suspension en maths (\ldots) : $....$ | ×3 ; défaut (revue-0-a) |
| can6a-2021 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $9\times .... =81$ ‖ points de suspension en maths (\ldots) : $....\text{ cm}$ | ×15 |
| can6a-2022 (CAN) | énoncé q3 | points de suspension en maths (\ldots) : $34+.... =100$ ‖ points de suspension en maths (\ldots) : $8+4=....+2$ ‖ points de suspension en maths (\ldots) : $9\times .... =72$ | ×3 ; défaut (revue-0-a) |
| can6a-2022 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension : est : .... ‖ points de suspension en maths (\ldots) : $34+.... =100$ | ×21 |
| can6a-2023 (CAN) | énoncé q6 | points de suspension en maths (\ldots) : $.... \times .... =42$ ‖ points de suspension en maths (\ldots) : $4,9+.... =10$ ‖ points de suspension en maths (\ldots) : $....$ | ×8 ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=false ; sup=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30 sup2=true (revue-0-a) |
| can6a-2023 (CAN) | énoncé non interactif q6 | points de suspension en maths (\ldots) : $.... \times .... =42$ ‖ points de suspension : ..... h ..... min ‖ points de suspension en maths (\ldots) : $4,9+.... =10$ | ×7 |
| can6a-2024 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $9+3= .... -6$ ‖ points de suspension en maths (\ldots) : $9 \times .... = 54$ | ×15 |
| can6a-2025 (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $4\times ....=36$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $1 +\dfrac{9}{10} =\dfrac{....}{10}$ | ×14 |
| can6a-2026 (CAN) | correction q11 | points de suspension en maths (\ldots) : $n{aligned} 28\times 25 &= .... \times 50\\ &= \under$ ‖ points de suspension en maths (\ldots) : $times 50\\ &= \underbrace{.... \times 2}_{28}\times 25\\$ ‖ points de suspension en maths (\ldots) : $in{aligned} 12\times 5 &= .... \times 10\\ &= \under$ | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $81=....\times....$ ‖ points de suspension en maths (\ldots) : $9\,388+300=....$ ‖ points de suspension en maths (\ldots) : $19\times .... = 1\,900$ | ×15 |
| can6a-Aléa (CAN) | src/exercices/can/6e/can6a-alea.ts:90 | « ... » : Une lettre seule (C, G, M, N...) ou un début de code (C5, N2) sélectionne toutes les rubriques correspondantes | ×1 |
| can6a-Aléa (CAN) | src/exercices/can/6e/can6a-alea.ts:270 | « ... » : chargement... | ×1 |
| can6a-Aléa (CAN) | énoncé q1 | points de suspension : chargement... | ×1 ; sup=All (revue-0-a) |
| can6a-CoopMaths (CAN) | énoncé q13 | points de suspension : minutes en heures et minutes (format : ... h ...min) [champ] | ×62 ; sup=31 ; sup=13 (revue-0-a) |
| can6a-CoopMaths (CAN) | énoncé non interactif q13 | points de suspension : minutes en heures et minutes (format : ... h ...min) | ×2 |
| can6a-NY2024 (CAN) | énoncé non interactif q19 | points de suspension en maths (\ldots) : $....\text{ m}$ | ×1 |
| can6a-NY2025 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,030$ ‖ points de suspension en maths (\ldots) : $2\,030= .... -3$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2025 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....~-2=2\,025+5$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $....~ \times 2\,025=202\,500$ | ×9 |
| can6a-NY2026 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,031$ ‖ points de suspension en maths (\ldots) : $2\,028= .... -1$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| can6a-NY2026 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $.... -2=2\,026+5$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $.... \times 2\,026=202\,600$ | ×8 |
| can6C1-07 (CAN) | correction q1 | points de suspension en maths (\ldots) : $19= .... -2$ ‖ points de suspension en maths (\ldots) : $14= .... +6$ ‖ points de suspension en maths (\ldots) : $.... -2=15$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C1-07 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $10+9= .... -2$ | ×1 |
| can6C2-09 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6C51-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{1}{9} =\dfrac{....}{45}$ | ×1 |
| can6C51-04 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $.... + \dfrac{1}{4} = \dfrac{3$ | ×1 |
| can6C52-01 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{27}{7} \quad .... \quad \dfrac{10}{7}$ | ×1 |
| can6C52-02 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{21}{40}\quad .... \quad 1$ | ×1 |
| can6C52-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{9}{50}\quad\quad....\quad\quad\dfrac{1}{10}$ | ×1 |
| can6C52-04 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{21}{40}\quad .... \quad \dfrac{18}{7}$ | ×1 |
| can6C6-08 (CAN) | énoncé q1 | points de suspension en maths (\ldots) : $....$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6C6-08 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6D1-01 (CAN) | énoncé non interactif q1 | points de suspension : .... minutes | ×1 |
| can6D1-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $........$ | ×2 |
| can6D1-04 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $................$ | ×5 |
| can6D3-01 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $................$ | ×5 |
| can6D3-02 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6D3-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6M3-01 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....\text{ L}$ | ×1 |
| can6M3-02 (CAN) | énoncé q1 | points de suspension en maths (\ldots) : $....$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| can6M3-02 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6M4-03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....\text{ kg}$ | ×1 |
| can6M4-04 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6M4-05 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....\text{ cm}$ | ×1 |
| can6M4-06 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| can6M4-07 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....\text{ m}$ | ×1 |
| can6N1-04 (CAN) | titre | points de suspension : Déterminer le chiffre des ... | ×1 |
| can6N1-06 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $..............................$ | ×10 |
| can6N21-05 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $1 = \dfrac{....}{6}$ | ×1 |
| can6N21-07 (CAN) | énoncé non interactif q1 | points de suspension : ; ..... | ×1 |
| can6S-02 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| canc3a (CAN) | énoncé q16 | points de suspension en maths (\ldots) : $.... - 9=1,2$ ‖ points de suspension en maths (\ldots) : $7 \times .... = 35$ ‖ points de suspension en maths (\ldots) : $.... + 2,1=4,2$ | ×121 ; sup= ; sup=16… (revue-0-a) |
| canc3a (CAN) | énoncé non interactif q16 | points de suspension en maths (\ldots) : $.... - 9=1,2$ ‖ points de suspension en maths (\ldots) : $7 \times .... = 35$ ‖ points de suspension en maths (\ldots) : $.... + 2,1=4,2$ | ×6 |
| canc3a-2023 (CAN) | énoncé q6 | points de suspension en maths (\ldots) : $.... \times .... =42$ ‖ points de suspension en maths (\ldots) : $0\text{ min }+55 \text{ min }=.... \text{ h } .... \text{ mi$ ‖ points de suspension en maths (\ldots) : $\text{ min }=.... \text{ h } .... \text{ min }$ | ×8 ; défaut (revue-0-a) |
| canc3a-2023 (CAN) | énoncé non interactif q6 | points de suspension en maths (\ldots) : $.... \times .... =42$ ‖ points de suspension en maths (\ldots) : $0\text{ min }+55 \text{ min }=.... \text{ h } .... \text{ mi$ ‖ points de suspension en maths (\ldots) : $\text{ min }=.... \text{ h } .... \text{ min }$ | ×9 |
| canc3a-2024 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $9+3= .... -6$ ‖ points de suspension en maths (\ldots) : $9 \times .... = 54$ | ×15 |
| canc3a-2025 (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $4\times ....=36$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $1 +\dfrac{9}{10} =\dfrac{....}{10}$ | ×13 |
| canc3a-2025b (CAN) | énoncé non interactif q2 | points de suspension en maths (\ldots) : $4\times ....=36$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $1 +\dfrac{9}{10} =\dfrac{....}{10}$ | ×11 |
| canc3a-2026 (CAN) | src/exercices/can/canc3a-2026 | Q11 : correction « $5\times 5 = .... + 20$ » : pointillés dans la correction. → $5\times 5=\ldots+20$ ou directement $25=⟦5⟧+20$ | ×1 |
| canc3a-2026 (CAN) | correction q11 | points de suspension en maths (\ldots) : $gin{aligned} 5\times 5 &= .... + 20\\ 25 &={\color{}\$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $81=....\times....$ ‖ points de suspension en maths (\ldots) : $9\,388+300=....$ ‖ points de suspension en maths (\ldots) : $19\times .... = 1\,900$ | ×15 |
| canc3a-2026b (CAN) | correction q11 | points de suspension en maths (\ldots) : $\begin{aligned} 5+ 6 &= .... + 2\\ 11 &={\color{}\b$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026b (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $81=....\times....$ ‖ points de suspension en maths (\ldots) : $9\,388+300=....$ ‖ points de suspension en maths (\ldots) : $19\times .... = 1\,900$ | ×17 |
| canc3a-NY2024 (CAN) | énoncé non interactif q17 | points de suspension en maths (\ldots) : $....\text{ m}$ ‖ points de suspension en maths (\ldots) : $....$ | ×2 |
| canc3a-NY2025 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,030$ ‖ points de suspension en maths (\ldots) : $2\,030= .... -3$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2025 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....~-2=2\,025+5$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $2\,025\times .... =2\,025\,000$ | ×8 |
| canc3a-NY2026 (CAN) | correction q4 | points de suspension en maths (\ldots) : $.... -2=2\,031$ ‖ points de suspension en maths (\ldots) : $2\,028= .... -1$ | ×2 ; sup=false ; sup=true (revue-0-a) |
| canc3a-NY2026 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $.... -2=2\,026+5$ ‖ points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $2\,026\times .... =2\,026\,000$ | ×7 |
| canc3C03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $.... \times 3=18$ | ×1 |
| canc3C13 (CAN) | énoncé q1 | points de suspension en maths (\ldots) : $2\times .... \times 3 =48$ ‖ points de suspension en maths (\ldots) : $4\times 5 \times .... =120$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C13 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $2\times .... \times 3 =48$ | ×1 |
| canc3C14 (CAN) | énoncé q1 | points de suspension en maths (\ldots) : $40\div .... =8$ ‖ points de suspension en maths (\ldots) : $.... \div 6=7$ | ×8 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3C14 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $40\div .... =8$ | ×1 |
| canc3M01 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| canc3M03 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $4\text{ cg}+14\text{ mg }= .... \text{ mg}$ | ×1 |
| canc3N07 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $4\,388=....$ ‖ points de suspension en maths (\ldots) : $....$ | ×2 |
| canc3N08 (CAN) | énoncé q1 | points de suspension en maths (\ldots) : $....$ | ×11 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3N08 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×1 |
| canCE1a-2025 (CAN) | énoncé non interactif q4 | points de suspension en maths (\ldots) : $....$ ‖ points de suspension en maths (\ldots) : $p;10&nbsp;&nbsp;;&nbsp;&nbsp;{....}&nbsp;&nbsp;;&nbsp;&nbsp;$ ‖ points de suspension en maths (\ldots) : $6 \times .... = 36$ | ×4 |
| canCE1a-2026 (CAN) | énoncé non interactif q3 | points de suspension en maths (\ldots) : $384 + 70 = ....$ ‖ points de suspension en maths (\ldots) : $29~;~25~;~{....}~;~17~;~13$ ‖ points de suspension en maths (\ldots) : $....$ | ×4 |
| canCE2-2026 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $9\times .... =45$ ‖ points de suspension en maths (\ldots) : $.... +186=190$ ‖ points de suspension en maths (\ldots) : $....$ | ×12 |
| canCE2a-2025 (CAN) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $434 + .... = 440$ ‖ points de suspension en maths (\ldots) : $10 \times ........ = 2\,700$ | ×4 |
| CM1C1F (cm1) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×3 |
| CM1C1G (cm1) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $....$ | ×3 |
| CM1N2B (cm1) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $\dfrac{8}{6}~=~.... + \dfrac{....}{....}$ ‖ points de suspension en maths (\ldots) : $c{8}{6}~=~.... + \dfrac{....}{....}$ ‖ points de suspension en maths (\ldots) : ${15}{4}~=~.... + \dfrac{....}{....}$ | ×15 |
| CM1N3K (cm1) | énoncé non interactif q1 | points de suspension en maths (\ldots) : $............$ | ×24 |
| CM2N1D-2 (cm2) | src/exercices/CM2/CM2N1D-2.ts:76 | « ... » : 1 : Décomposer (donner les chiffres)\n2 : Décomposer (compléter avec 10, 100...)\n3 : Composer (sans groupement)\n4 : Composer avec groupement\n5 : Mélange | ×1 |
| CM2N3A-14 (cm2) | src/exercices/CM2/CM2N3A-14.ts:44 | « ... » : 2 : n + ... = 10 | ×1 |
| CM2N3A-14 (cm2) | src/exercices/CM2/CM2N3A-14.ts:46 | « ... » : 4 : n + ... = 100 | ×1 |
| CM2N3A-14 (cm2) | src/exercices/CM2/CM2N3A-14.ts:48 | « ... » : 6 : n + ... = 1 000 | ×1 |
| EgaliteFG2-5e-6 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG6.ts:109 | « ... » : L'écart le plus important se situe entre l'école élémentaire (très féminisée) et le collège, où la proportion de femmes chute nettement. Une explication possibl | ×1 |
| EgaliteFG4-3e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG12.ts:66 | « ... » : Réponse possible parmi de nombreuses grandeurs : la température, l'énergie, la force, l'aire, l'intensité électrique, la concentration...&lt;br>La durée : minutes, | ×1 |
| EgaliteFG4-3e-20 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG20.ts:59 | « ... » : .&lt;br>Shakuntala Devi était capable de résoudre mentalement des calculs bien plus vite que des ordinateurs de son époque. Pourtant, elle fut souvent présentée co | ×1 |
| _automatismesCan.ts (hors référentiel) | src/exercices/_automatismesCan.ts:303 | « ... » : chargement... | ×1 |
| 6e/_Construire_par_symetrie.ts (hors référentiel) | src/exercices/6e/_Construire_par_symetrie.ts:50 | « ... » : Construire par symétrie... | ×1 |
| beta/QcmJsonGenerator.ts (hors référentiel) | src/exercices/beta/QcmJsonGenerator.ts:71 | « ... » : Correct ! $\\pi \\approx 3,14159...$ | ×1 |
| can/can5a-2024/can5a-2024-Q23.ts (hors référentiel) | src/exercices/can/can5a-2024/can5a-2024-Q23.ts:68 | « ... » : Si on part du haut, on a $1$ cube de côté, ce qui fait $1$ cube, puis $2$ cubes de côtés ce qui fait $2\\times2=4$ cubes...&lt;br> | ×1 |
| can/can6a-2024/can6a-2024-Q14.ts (hors référentiel) | src/exercices/can/can6a-2024/can6a-2024-Q14.ts:6 | « ... » : Multiplier par 0,1... | ×1 |
| c0f91 (Non classés) | src/exercices/QCMStatiques/QCMBacSuites.ts:381 | « ... » : def seuil() :\n n=0\n u=15\n while ... ...:\n n=n+1\n u=1,2*u+12\n return(n) | ×1 |
| exemple-qcm-json (Non classés) | src/exercices/modèlesExos/ExempleQcmJson.ts:54 | « ... » : Correct ! $\\pi \\approx 3,14159...$ | ×1 |
| PR-31 (Primaire) | src/exercices/6e/6N12-1.ts:8 | « ... » : Par combien multiplier un entier pour que le chiffre des unités devienne le chiffre des ... ? | ×1 |
| TTE-8 (Terminale) | src/exercices/TT/TTE-8.ts:121 | « ... » : $= ... ${logString}(x)$ | ×1 |

## X4

**Question en double ou vide** (gravité 5 : Rédaction)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6a-Aléa (CAN) | série q2 | question 2 identique à la question 1 | ×15 ; sup=All ; sup=All nb=10 (revue-0-a) |
| can6C52-02 (CAN) | série q9 | question 9 identique à la question 2 | ×1 ; défaut nb=10 (revue-1-a) |
| canc3a (CAN) | série q17 | question 17 identique à la question 11 | ×1 ; sup=15 (revue-15-a) |
| CM1N3K (cm1) | série q2 | question 2 identique à la question 1 | ×2 ; sup=2 sup2=1 sup3=1 ; sup=2 sup2=1 sup3=2 (revue-30-b) |

## IM

**Interactif à tester à la main** (gravité 6 : Pour mémoire)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| can6a-2025 (CAN) |  q12 fillInTheBlank | aucune valeur attendue | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) |  q1 fillInTheBlank | aucune valeur attendue | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) |  q4 meta-interactif-2d | format meta-interactif-2d : à tester à la main | ×12 ; sup=false ; sup=true (revue-0-a) |
| can6a-2026 (CAN) |  q26 apigeom-figure | format apigeom-figure : à tester à la main | ×4 ; sup=false ; sup=true (revue-0-a) |
| can6C7-07 (CAN) |  q1 my-calculator | format my-calculator : à tester à la main | ×12 ; défaut ; défaut nb=10 (revue-0-a) |
| canc3a-2026 (CAN) |  q1 fillInTheBlank | aucune valeur attendue | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) |  q4 meta-interactif-2d | format meta-interactif-2d : à tester à la main | ×8 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026 (CAN) |  q26 apigeom-figure | format apigeom-figure : à tester à la main | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026b (CAN) |  q1 fillInTheBlank | aucune valeur attendue | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026b (CAN) |  q4 meta-interactif-2d | format meta-interactif-2d : à tester à la main | ×12 ; sup=false ; sup=true (revue-0-a) |
| canc3a-2026b (CAN) |  q26 apigeom-figure | format apigeom-figure : à tester à la main | ×4 ; sup=false ; sup=true (revue-0-a) |
| canc3D04 (CAN) |  q1 interactive-clock | format interactive-clock : à tester à la main | ×14 ; sup=false ; sup=true… (revue-0-a) |
| canCE1a-2025 (CAN) |  q18 interactive-clock | format interactive-clock : à tester à la main | ×4 ; sup=false ; sup=true (revue-0-a) |

## R1

**Titre** (gravité 6 : Pour mémoire)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| 1A (1e) | src/exercices/1e/1a-automatismes.ts:6 | titre sans infinitif en tête : Sélection d'automatismes | ×1 |
| 1A-A01-1 (1e) | src/exercices/1e/1A-A01-1.ts:11 | titre sans infinitif en tête : Amérique du Nord Spécialité | ×1 |
| 1A-A01-10 (1e) | src/exercices/1e/1A-A01-10.ts:10 | titre sans infinitif en tête : Antilles Guyane Sans Spécialité | ×1 |
| 1A-A01-11 (1e) | src/exercices/1e/1A-A01-11.ts:15 | titre sans infinitif en tête : Antilles Guyane Techno | ×1 |
| 1A-A01-12 (1e) | src/exercices/1e/1A-A01-12.ts:11 | titre sans infinitif en tête : Polynésie Spécialité | ×1 |
| 1A-A01-13 (1e) | src/exercices/1e/1A-A01-13.ts:11 | titre sans infinitif en tête : Polynésie Sans Spécialité | ×1 |
| 1A-A01-14 (1e) | src/exercices/1e/1A-A01-14.ts:11 | titre sans infinitif en tête : Polynésie Techno | ×1 |
| 1A-A01-2 (1e) | src/exercices/1e/1A-A01-2.ts:14 | titre sans infinitif en tête : Amérique du Nord Sans Spécialité | ×1 |
| 1A-A01-3 (1e) | src/exercices/1e/1A-A01-3.ts:10 | titre sans infinitif en tête : Centres Étrangers Spécialité | ×1 |
| 1A-A01-4 (1e) | src/exercices/1e/1A-A01-4.ts:14 | titre sans infinitif en tête : Centres Étrangers Sans Spécialité | ×1 |
| 1A-A01-5 (1e) | src/exercices/1e/1A-A01-5.ts:10 | titre sans infinitif en tête : Centres Étrangers Techno | ×1 |
| 1A-A01-6 (1e) | src/exercices/1e/1A-A01-6.ts:10 | titre sans infinitif en tête : France métropole Spécialité | ×1 |
| 1A-A01-7 (1e) | src/exercices/1e/1A-A01-7.ts:10 | titre sans infinitif en tête : France métropole Sans Spécialité | ×1 |
| 1A-A01-8 (1e) | src/exercices/1e/1A-A01-8.ts:14 | titre sans infinitif en tête : France métropole Techno | ×1 |
| 1A-A01-9 (1e) | src/exercices/1e/1A-A01-9.ts:10 | titre sans infinitif en tête : Antilles Guyane Spécialité | ×1 |
| 2A (2e) | src/exercices/2e/2a-automatismes.ts:10 | titre sans infinitif en tête : Sélection d'automatismes | ×1 |
| 2A-F1-3 (2e) | src/exercices/1e/1A-F01-3.ts:34 | titre sans infinitif en tête : Retrouver, graphiquement, la phrase correcte avec des images et antécédents | ×1 |
| 2mTrigoTri-5 (2e Collège) | src/exercices/ch/2mTrigo-5.ts:35 | titre sans infinitif en tête : Résolution de triangles (cas non ambigus) | ×1 |
| 2mTrigoTri-6 (2e Collège) | src/exercices/ch/2mTrigo-6.ts:23 | titre sans infinitif en tête : Résolution de triangles (cas ambigu CCA) | ×1 |
| 3A10DNB1 (3e) | src/exercices/3e/3A10DNB1.ts:35 | titre sans infinitif en tête : Se préparer au DNB : arithmétique, volume, fraction | ×1 |
| 3A14-0 (3e) | src/exercices/3e/3A14-0.ts:27 | titre sans infinitif en tête : Se préparer au DNB : arithmétique et volumes | ×1 |
| 3A1QCM-1 (3e) | src/exercices/QCMBrevet/A2023/MS23E1Q1.ts:18 | titre sans infinitif en tête : Divisibilité (Septembre 2023 Métropole) | ×1 |
| 3A1QCM-2 (3e) | src/exercices/QCMBrevet/A2021/AJ21E1Q3.ts:22 | titre sans infinitif en tête : Tableur (06/2021 Asie) | ×1 |
| 3Auto (3e) | src/exercices/3e/3a-automatismes.ts:10 | titre sans infinitif en tête : Sélection d'automatismes | ×1 |
| 3C1QCM-01 (3e) | src/exercices/QCMBrevet/A2024/MJ24E4Q2.ts:17 | titre sans infinitif en tête : Calcul de puissance (2023 Métropole) | ×1 |
| 3C1QCM-03 (3e) | src/exercices/QCMBrevet/A2013/PJ13E1Q1.ts:16 | titre sans infinitif en tête : Calcul avec les puissances de 10 (2013 Polynésie) | ×1 |
| 3C1QCM-04 (3e) | src/exercices/QCMBrevet/A2022/MS22E1Q1.ts:15 | titre sans infinitif en tête : Calcul avec des puissances (septembre 2022 Métropole) | ×1 |
| 3C1QCM-05 (3e) | src/exercices/QCMBrevet/A2021/AJ21E1Q5.ts:17 | titre sans infinitif en tête : Puissances (06/2021 Asie) | ×1 |
| 3C1QCM-06 (3e) | src/exercices/QCMBrevet/A2020/AGS20E2Q4.ts:15 | titre sans infinitif en tête : Notation scientifique (09/2020 Antilles-Guyane) | ×1 |
| 3C1QCM-07 (3e) | src/exercices/QCMBrevet/A2019/NCD19E1Q3.ts:14 | titre sans infinitif en tête : Puissances de 10 et ordre de grandeur (12/2019 Nouvelle-Calédonie) | ×1 |
| 3F14DNB-1 (3e) | src/exercices/3e/3F14DNB-1.ts:22 | titre sans infinitif en tête : Préparation DNB : Fonctions, tableur et équation produit nul | ×1 |
| 3F24DNB-1 (3e) | src/exercices/3e/3F24DNB-1.ts:32 | titre sans infinitif en tête : Préparation DNB : Fonctions, fonction affine, tableur et équation produit-nul | ×1 |
| 3F2QCM-1 (3e) | src/exercices/QCMBrevet/A2022/AN22E2Q3.ts:16 | titre sans infinitif en tête : Fonction linéaire (Juin 2022 Amérique du nord) | ×1 |
| 3G1QCM-1 (3e) | src/exercices/QCMBrevet/A2023/MS23E1Q5.ts:25 | titre sans infinitif en tête : Rapport d'homothétie (2023 Métropole) | ×1 |
| 3G1QCM-2 (3e) | src/exercices/QCMBrevet/A2023/NCS23E1Q5.ts:25 | titre sans infinitif en tête : Rapport d'homothétie (2023 Métropole) | ×1 |
| 3G1QCM-3 (3e) | src/exercices/QCMBrevet/A2021/MS22E1Q3.ts:23 | titre sans infinitif en tête : Rotation (12/2021 Métropole) | ×1 |
| 3G1QCM-5 (3e) | src/exercices/QCMBrevet/A2024/MJ24E4Q4bis.ts:26 | titre sans infinitif en tête : Rotations (2024 Métropole sujet de secours) | ×1 |
| 3G1QCM-6 (3e) | src/exercices/QCMBrevet/A2024/MJ24E4Q3bis.ts:24 | titre sans infinitif en tête : Symétrie (2024 Métropole sujet de secours) | ×1 |
| 3G20DNB0 (3e) | src/exercices/3e/3G20DNB0.ts:27 | titre sans infinitif en tête : Se préparer au DNB : Thalès, Pythagore, aire | ×1 |
| 3G2QCM-1 (3e) | src/exercices/QCMBrevet/A2013/PJ13E1Q3.ts:15 | titre sans infinitif en tête : Agrandissement volume (2013 Polynésie) | ×1 |
| 3G30DNB0 (3e) | src/exercices/3e/3G30DNB0.ts:31 | titre sans infinitif en tête : Se préparer au DNB : Pythagore, trigonométrie, aire, volume | ×1 |
| 3G3QCM-1 (3e) | src/exercices/QCMBrevet/A2024/MJ24E4Q6.ts:24 | titre sans infinitif en tête : Trigonométrie dans le triangle rectangle (2023 Métropole) | ×1 |
| 3G40 (3e) | src/exercices/3e/3G40.ts:32 | titre sans infinitif en tête : Se repérer sur une sphère | ×1 |
| 3G4QCM-1 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q6.ts:16 | titre sans infinitif en tête : Coordonnées sur la Terre (12/2020 Nouvelle Calédonie) | ×1 |
| 3I1DNB-0 (3e) | src/exercices/3e/3I1DNB-0.ts:28 | titre sans infinitif en tête : Se préparer au DNB : Scratch | ×1 |
| 3L14DNB-0 (3e) | src/exercices/3e/3L14DNB-0.ts:19 | titre sans infinitif en tête : Préparation DNB : Calcul littéral, scratch et équation produit nul | ×1 |
| 3L14DNB-1 (3e) | src/exercices/3e/3L14DNB-1.ts:28 | titre sans infinitif en tête : Se préparer au DNB : programme de calcul, scratch et calcul littéral | ×1 |
| 3L14DNB-2 (3e) | src/exercices/3e/3L14DNB-2.ts:25 | titre sans infinitif en tête : Se préparer au DNB : programme de calcul et calcul littéral | ×1 |
| 3L1QCM-01 (3e) | src/exercices/QCMBrevet/A2013/ANJ13E1Q2.ts:16 | titre sans infinitif en tête : Équation (2013 Amérique du nord) | ×1 |
| 3L1QCM-02 (3e) | src/exercices/QCMBrevet/A2013/CEJ13E1Q1.ts:16 | titre sans infinitif en tête : Équation produit nul (2013 Centres étrangers) | ×1 |
| 3L1QCM-03 (3e) | src/exercices/QCMBrevet/A2013/CEJ13E1Q3.ts:14 | titre sans infinitif en tête : Calcul littéral développement (2013 Centres étrangers) | ×1 |
| 3L1QCM-04 (3e) | src/exercices/QCMBrevet/A2023/MS23E1Q3.ts:17 | titre sans infinitif en tête : Calcul expression 2nd degré (septembre 2023 Métropole) | ×1 |
| 3L1QCM-05 (3e) | src/exercices/QCMBrevet/A2013/PJ13E1Q4-2.ts:14 | titre sans infinitif en tête : Calcul littéral factorisation (2013 Centres étrangers) | ×1 |
| 3L1QCM-06 (3e) | src/exercices/QCMBrevet/A2013/PJ13E1Q4.ts:14 | titre sans infinitif en tête : Calcul littéral factorisation (2013 Polynésie) | ×1 |
| 3L1QCM-07 (3e) | src/exercices/QCMBrevet/A2022/MS22E1Q3.ts:15 | titre sans infinitif en tête : Calcul littéral développement (septembre 2022 Métropole) | ×1 |
| 3L1QCM-08 (3e) | src/exercices/QCMBrevet/A2022/MS22E1Q4.ts:15 | titre sans infinitif en tête : Équation produit nul (septembre 2022 Métropole) | ×1 |
| 3L1QCM-09 (3e) | src/exercices/QCMBrevet/A2021/AJ21E1Q4.ts:17 | titre sans infinitif en tête : Équation type $x^2=a$ (06/2021 Asie) | ×1 |
| 3L1QCM-10 (3e) | src/exercices/QCMBrevet/A2020/AGS20E2Q5.ts:14 | titre sans infinitif en tête : Calcul littéral développement (09/2020 Antilles-Guyane) | ×1 |
| 3P11-1 (3e) | src/exercices/egaliteFG/egaliteFG14.ts:15 | titre sans infinitif en tête : Au pressing et à la table à repasser | ×1 |
| 3P1QCM-1 (3e) | src/exercices/QCMBrevet/A2023/NCD23E1Q3.ts:16 | titre sans infinitif en tête : Calcul d'un pourcentage (12/2023 Nouvelle Calédonie) | ×1 |
| 3S1QCM-1 (3e) | src/exercices/QCMBrevet/A2024/MJ24E4Q5.ts:18 | titre sans infinitif en tête : Calcul de médiane (2024 Métropole) | ×1 |
| 3S1QCM-2 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q3.ts:17 | titre sans infinitif en tête : Médiane d'une série d'effectif impair (12/2020 Nouvelle Calédonie) | ×1 |
| 3S1QCM-3 (3e) | src/exercices/QCMBrevet/A2023/NCD23E1Q5.ts:16 | titre sans infinitif en tête : Médiane d'une série d'effectif impair (12/2023 Nouvelle Calédonie) | ×1 |
| 3S1QCM-4 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q4.ts:16 | titre sans infinitif en tête : Moyenne d'une série (12/2020 Nouvelle Calédonie) | ×1 |
| 3S20-2 (3e) | src/exercices/3e/3S20-2.ts:17 | titre sans infinitif en tête : Calcul de probabilités à partir d'un tableau à double entrée | ×1 |
| 3S2QCM-1 (3e) | src/exercices/QCMBrevet/A2023/NCD23E1Q1.ts:16 | titre sans infinitif en tête : Probabilité (12/2023 Nouvelle Calédonie) | ×1 |
| 3S2QCM-2 (3e) | src/exercices/QCMBrevet/A2020/NCD20E1Q5.ts:16 | titre sans infinitif en tête : Probabilité simple (12/2020 Nouvelle Calédonie) | ×1 |
| 3S2QCM-3 (3e) | src/exercices/QCMBrevet/A2022/MS22E1Q5.ts:17 | titre sans infinitif en tête : Probabilités (septembre 2022 Métropole) | ×1 |
| 3S2QCM-4 (3e) | src/exercices/QCMBrevet/A2022/AN22E2Q1.ts:16 | titre sans infinitif en tête : Probabilités (Juin 2022 Amérique du nord) | ×1 |
| 3S2QCM-5 (3e) | src/exercices/QCMBrevet/A2021/MS22E1Q2.ts:17 | titre sans infinitif en tête : Probabilités (septembre 2021 Métropole) | ×1 |
| 3S2QCM-7 (3e) | src/exercices/QCMBrevet/A2023/MS23E1Q4.ts:15 | titre sans infinitif en tête : Probabilités (septembre 2023 Métropole) | ×1 |
| 3Z1DNB-07 (3e) | src/exercices/3e/3Z1DNB-07.ts:29 | titre sans infinitif en tête : Se préparer au DNB : Pythagore, Thalès, trigonométrie | ×1 |
| 3Z1DNB-08 (3e) | src/exercices/3e/3Z1DNB-08.ts:19 | titre sans infinitif en tête : Préparation DNB : Volume, fonctions, vitesse, grandeurs composées | ×1 |
| 3Z1DNB-09 (3e) | src/exercices/3e/3Z1DNB-09.ts:25 | titre sans infinitif en tête : Préparation DNB : Trigo, Pythagore, agrandissement-réduction | ×1 |
| 3Z1DNB-10 (3e) | src/exercices/3e/3Z1DNB-10.ts:14 | titre sans infinitif en tête : Préparation DNB : Fonctions, équation, statistiques, volume | ×1 |
| 3Z1DNB-11 (3e) | src/exercices/3e/3Z1DNB-11.ts:39 | titre sans infinitif en tête : Préparation DNB : Volume, Pythagore, périmètre, agrandissement-réduction | ×1 |
| 3Z1DNB-12 (3e) | src/exercices/3e/3Z1DNB-12.ts:24 | titre sans infinitif en tête : Se préparer au DNB : fonctions affines et lecture graphique | ×1 |
| 3Z1DNB-18 (3e) | src/exercices/3e/3Z1DNB-18.ts:23 | titre sans infinitif en tête : Préparation DNB : Volumes, périmètres, proportionnalité, prise d'intitiative | ×1 |
| 3Z1DNB-19 (3e) | src/exercices/3e/3Z1DNB-19.ts:21 | titre sans infinitif en tête : Préparation DNB : Probabilités, arithmétique et nombres premiers | ×1 |
| 3Z1DNB-20 (3e) | src/exercices/3e/3Z1DNB-20.ts:30 | titre sans infinitif en tête : Préparation DNB : arithmétique, prise d'initiatives et nombres premiers | ×1 |
| 3Z1DNB-21 (3e) | src/exercices/3e/3Z1DNB-21.ts:26 | titre sans infinitif en tête : Se préparer au DNB : aires, prise d'initiative, volumes | ×1 |
| 3Z1DNB-22 (3e) | src/exercices/3e/3Z1DNB-22.ts:29 | titre sans infinitif en tête : Préparation DNB : Statistiques, pourcentages, trigonométrie | ×1 |
| 3Z1DNB-23 (3e) | src/exercices/3e/3Z1DNB-23.ts:17 | titre sans infinitif en tête : Préparation DNB : Probabilité, arithmétique | ×1 |
| 3Z1DNB-25 (3e) | src/exercices/3e/3Z1DNB-25.ts:20 | titre sans infinitif en tête : Se préparer au DNB : graphique, vitesse et proportionnalité | ×1 |
| 3Z1OS-01 (3e) | src/exercices/3e/3Z1OS-01.ts:26 | titre sans infinitif en tête : Se préparer à la seconde : fonction, équation, calcul littéral | ×1 |
| 4C10-4 (4e) | src/exercices/4e/4C10-4.ts:10 | titre sans infinitif en tête : Quotient de deux entiers relatifs | ×1 |
| 4C10-5 (4e) | src/exercices/4e/4C10-5.ts:8 | titre sans infinitif en tête : Multiplications de deux entiers relatifs dans un tableau à double entrée | ×1 |
| 4C10-7 (4e) | src/exercices/4e/4C10-7.ts:27 | titre sans infinitif en tête : Opérations avec deux entiers relatifs | ×1 |
| 4C2QCM-01 (4e) | src/exercices/QCMBrevet/A2023/NCD23E1Q2.ts:15 | titre sans infinitif en tête : Calcul avec des fractions (12/2023 Nouvelle Calédonie) | ×1 |
| 4C2QCM-02 (4e) | src/exercices/QCMBrevet/A2022/MS22E1Q2.ts:16 | titre sans infinitif en tête : Fraction irréductible (septembre 2022 Métropole) | ×1 |
| 4C2QCM-03 (4e) | src/exercices/QCMBrevet/A2022/AN22E2Q2.ts:15 | titre sans infinitif en tête : Ratios (Juin 2022 Amérique du nord) | ×1 |
| 4C2QCM-04 (4e) | src/exercices/QCMBrevet/A2021/MS22E1Q1.ts:17 | titre sans infinitif en tête : Somme de fractions (septembre 2021 Métropole) | ×1 |
| 4C2QCM-05 (4e) | src/exercices/QCMBrevet/A2021/AJ21E1Q6.ts:16 | titre sans infinitif en tête : Ratios (06/2021 Asie) | ×1 |
| 4C2QCM-06 (4e) | src/exercices/QCMBrevet/A2020/AGS20E2Q3.ts:17 | titre sans infinitif en tête : Somme de fractions (09/2021 Antilles-Guyane) | ×1 |
| 4G1QCM-1 (4e) | src/exercices/QCMBrevet/A2024/MJ24E4Q3.ts:21 | titre sans infinitif en tête : Image par translation (2024 Métropole) | ×1 |
| 4G52 (4e) | src/exercices/4e/4G52.ts:34 | titre sans infinitif en tête : Se repérer sur un pavé droit | ×1 |
| 4L10-1 (4e) | src/exercices/4e/4L10-1.ts:16 | titre sans infinitif en tête : Réduire, si possible, une expression littérale simple | ×1 |
| 4P1QCM-01 (4e) | src/exercices/QCMBrevet/A2019/NCD19E1Q2.ts:15 | titre sans infinitif en tête : Proportionnalité et ordre de grandeur (12/2019 Nouvelle-Calédonie) | ×1 |
| 5G4A-2 (5e) | src/exercices/5e/5G4A-2.ts:18 | titre sans infinitif en tête : Se servir des relations entre perpendicularité et parallélisme | ×1 |
| 5I1C (5e) | src/exercices/5e/5I1C.ts:36 | titre sans infinitif en tête : Calculs numériques à représenter en code par blocs | ×1 |
| 5N2autoA (5e) | src/exercices/5e/5N2autoA.ts:21 | titre sans infinitif en tête : Additionner, soustraire, multiplier des nombres décimaux à une ou deux décimales | ×1 |
| 6A (6e) | src/exercices/6e/6a-automatismes.ts:10 | titre sans infinitif en tête : Sélection d'automatismes | ×1 |
| 6AutoF2-1 (6e) | src/exercices/6e/6N3autoC.ts:16 | titre sans infinitif en tête : Passer, de façon automatique, d'une valeur décimale à une valeur fractionnaire et réciproquement avec demis et quarts | ×1 |
| 6AutoF2-2 (6e) | src/exercices/6e/6N3autoC-1.ts:20 | titre sans infinitif en tête : Passer, de façon automatique, d'une valeur décimale à une valeur fractionnaire et réciproquement sur des valeurs simples | ×1 |
| 6AutoF3 (6e) | src/exercices/6e/6N3autoB.ts:11 | titre sans infinitif en tête : Connaître, de façon automatique, les liens entre 1/4, 1/2 et 3/4 | ×1 |
| 6AutoP1-1 (6e) | src/exercices/6e/6P3autoA-2.ts:11 | titre sans infinitif en tête : Quart | ×1 |
| 6I1B-8 (6e) | src/exercices/6e/6I1B-8.ts:32 | titre sans infinitif en tête : Se déplacer et se repérer | ×1 |
| 6N2A-4 (6e) | src/exercices/6e/6N2A-4.ts:2 | titre sans infinitif en tête : Additionner, soustraire des nombres décimaux à une ou deux décimales | ×1 |
| 6N2autoB-5 (6e) | src/exercices/6e/6N2autoB-5.ts:16 | titre sans infinitif en tête : Restituer, de manière automatique, des équivalences sur les fractions décimales | ×1 |
| 6N2autoC-2 (6e) | src/exercices/6e/6N2autoC-2.ts:7 | titre sans infinitif en tête : Par combien multiplier un nombre pour que le chiffre des unités devienne le chiffre des ... ? | ×1 |
| 6N2B-4 (6e) | src/exercices/6e/6N2B-4.ts:24 | titre sans infinitif en tête : Par combien multiplier un nombre pour que le chiffre des unités devienne le chiffre des ... ? | ×1 |
| 6N3autoD-5 (6e) | src/exercices/6e/6N3autoD-5.ts:2 | titre sans infinitif en tête : Message secret à décoder avec les tables de multiplication | ×1 |
| 9FA2B-17 (9e) | src/exercices/CM2/CM2N5C-4.ts:18 | titre sans infinitif en tête : Au marché (addition et soustraction de masses, conversions) | ×1 |
| 9NO3C-16 (9e) | src/exercices/CM2/CM2N5C-6.ts:23 | titre sans infinitif en tête : La bouteille (problème de conversion avec fraction simple) | ×1 |
| 9QCM-5 (9e) | src/exercices/QCMBrevet/A2022/AN22E2Q4.ts:15 | titre sans infinitif en tête : Nombres premiers (Juin 2022 Amérique du nord) | ×1 |
| BP1AUTO055 (BP1) | src/exercices/bp1/BP1AUTO055.ts:2 | titre sans infinitif en tête : Fonctions linéaires | ×1 |
| BP1AUTO095 (BP1) | src/exercices/bp1/BP1AUTO095.ts:2 | titre sans infinitif en tête : Calculs de volumes | ×1 |
| BP1AUTO096 (BP1) | src/exercices/bp1/BP1AUTO096.ts:2 | titre sans infinitif en tête : Calculs de volumes | ×1 |
| BP1GEO01 (BP1) | src/exercices/bp1/BP1GEO01.ts:2 | titre sans infinitif en tête : Cosinus et sinus des valeurs particulières | ×1 |
| BP2AutoQ3 (BP2) | src/exercices/CM/c3N30.ts:2 | titre sans infinitif en tête : Conversion d'unités des préfixes k,h,da vers unité de référence | ×1 |
| can6a-Aléa (CAN) | src/exercices/can/6e/can6a-alea.ts:11 | titre sans infinitif en tête : Choix aléatoires des questions | ×1 |
| can6M3-03 (CAN) | src/exercices/can/6e/can6M3-03.ts:7 | titre sans infinitif en tête : Volume de pavé droit | ×1 |
| can6M3-04 (CAN) | src/exercices/can/6e/can6M3-04.ts:13 | titre sans infinitif en tête : Volume de pavé droit par dénombrement de cubes unités | ×1 |
| canTEC1-01 (CAN) | src/exercices/can/Ex/canTEC1-01.ts:10 | titre sans infinitif en tête : Somme de nombres complexes | ×1 |
| canTEC1-02 (CAN) | src/exercices/can/Ex/canTEC1-02.ts:14 | titre sans infinitif en tête : produit de nombres complexes | ×1 |
| canTSpeAN30 (CAN) | src/exercices/can/TSpe/canTSpeAN30.ts:8 | titre sans infinitif en tête : Dérivée cosinus et sinus | ×1 |
| canTSpeS02 (CAN) | src/exercices/can/TSpe/canTSpeS02.ts:6 | titre sans infinitif en tête : Limite de $n^{-m}\\pm n^{p}$ | ×1 |
| canTSpeS03 (CAN) | src/exercices/can/TSpe/canTSpeS03.ts:6 | titre sans infinitif en tête : Limite de $e^{-n}\\pm kn$ | ×1 |
| canTSpeS04 (CAN) | src/exercices/can/TSpe/canTSpeS04.ts:6 | titre sans infinitif en tête : Limite de $\\dfrac{a\\pm kn}{n}$ | ×1 |
| canTSpeS05 (CAN) | src/exercices/can/TSpe/canTSpeS05.ts:6 | titre sans infinitif en tête : Limite de $u_n\\times v_n$ | ×1 |
| canTSpeS06 (CAN) | src/exercices/can/TSpe/canTSpeS06.ts:8 | titre sans infinitif en tête : Limite de $\\dfrac{u_n}{v_n}$ | ×1 |
| canTSpeS07 (CAN) | src/exercices/can/TSpe/canTSpeS07.ts:5 | titre sans infinitif en tête : Limite de $n^m-n^p$ | ×1 |
| canTSpeS08 (CAN) | src/exercices/can/TSpe/canTSpeS08.ts:7 | titre sans infinitif en tête : Limite de $\\sqrt(n)-n^p$ | ×1 |
| canTSpeS09 (CAN) | src/exercices/can/TSpe/canTSpeS09.ts:6 | titre sans infinitif en tête : Limite de $\\dfrac{a+n^m}{n^p}$ | ×1 |
| EgaliteFG1-6e-1 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG1.ts:8 | titre sans infinitif en tête : Julie et Paul réussiront-ils à être à l'heure ? | ×1 |
| EgaliteFG1-6e-2 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG2.ts:15 | titre sans infinitif en tête : Devoirs facultatifs rendus : filles et garçons | ×1 |
| EgaliteFG1-6e-3 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG3.ts:12 | titre sans infinitif en tête : Le temps consacré aux tâches ménagères | ×1 |
| EgaliteFG1-6e-4 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG4.ts:15 | titre sans infinitif en tête : Les personnages dans les sujets du DNB | ×1 |
| EgaliteFG1-6e-5 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG5.ts:10 | titre sans infinitif en tête : Les femmes à l'Assemblée nationale | ×1 |
| EgaliteFG2-5e-6 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG6.ts:10 | titre sans infinitif en tête : La place des femmes parmi les enseignants | ×1 |
| EgaliteFG2-5e-7 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG7.ts:13 | titre sans infinitif en tête : Clubs de la pause méridienne : filles et garçons | ×1 |
| EgaliteFG3-4e-10 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG10.ts:13 | titre sans infinitif en tête : Katherine Johnson et la hauteur de la fusée | ×1 |
| EgaliteFG3-4e-11 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG11.ts:14 | titre sans infinitif en tête : Hypatie d\'Alexandrie | ×1 |
| EgaliteFG3-4e-8 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG8.ts:11 | titre sans infinitif en tête : Un mur bien droit ? | ×1 |
| EgaliteFG3-4e-9 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG9.ts:12 | titre sans infinitif en tête : Une étagère pour pompiers | ×1 |
| EgaliteFG4-3e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG12.ts:13 | titre sans infinitif en tête : À la conquête de l'espace | ×1 |
| EgaliteFG4-3e-13 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG13.ts:13 | titre sans infinitif en tête : Zoé et Paul | ×1 |
| EgaliteFG4-3e-15 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG15.ts:15 | titre sans infinitif en tête : Inès et Arthur | ×1 |
| EgaliteFG4-3e-16 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG16.ts:14 | titre sans infinitif en tête : Katherine Johnson : poids, masse et gravité | ×1 |
| EgaliteFG4-3e-17 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG17.ts:16 | titre sans infinitif en tête : Ada Lovelace : un programme de calcul | ×1 |
| EgaliteFG4-3e-18 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG18.ts:21 | titre sans infinitif en tête : Maryam Mirzakhani : médailles Fields, prix Nobel et arithmétique | ×1 |
| EgaliteFG4-3e-19 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG19.ts:9 | titre sans infinitif en tête : Sophie Germain : un QCM mystère | ×1 |
| EgaliteFG4-3e-20 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFG20.ts:13 | titre sans infinitif en tête : Shakuntala Devi : le café qui coule | ×1 |
| EgaliteFG5-2de-1 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee1.ts:15 | titre sans infinitif en tête : Records du 100 mètres | ×1 |
| EgaliteFG5-2de-2 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee2.ts:12 | titre sans infinitif en tête : Les femmes députées | ×1 |
| EgaliteFG5-2de-3 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee3.ts:15 | titre sans infinitif en tête : Les nombres premiers de Sophie Germain | ×1 |
| EgaliteFG5-2de-4 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee4.ts:15 | titre sans infinitif en tête : Taux de chômage des hommes et des femmes en 2009 | ×1 |
| EgaliteFG5-2de-5 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee5.ts:12 | titre sans infinitif en tête : Maryam Mirzakhani : trajectoires dans un hexagone régulier | ×1 |
| EgaliteFG5-2de-6 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee6.ts:14 | titre sans infinitif en tête : Une politique de rattrapage salarial | ×1 |
| EgaliteFG5-2de-7 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee7.ts:10 | titre sans infinitif en tête : L'écart salarial en équivalent temps plein (EQTP) | ×1 |
| EgaliteFG6-1e-10 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee10.ts:15 | titre sans infinitif en tête : Femmes et hommes dans les postes de direction | ×1 |
| EgaliteFG6-1e-11 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee11.ts:8 | titre sans infinitif en tête : Évolution des salaires : rattraper l'écart ? | ×1 |
| EgaliteFG6-1e-12 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee12.ts:11 | titre sans infinitif en tête : Tabagisme au travail : un paradoxe statistique | ×1 |
| EgaliteFG6-1e-13 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee13.ts:15 | titre sans infinitif en tête : Le partage des tâches domestiques | ×1 |
| EgaliteFG6-1e-14 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee14.ts:13 | titre sans infinitif en tête : La filière STMG deviendra-t-elle majoritairement féminine ? | ×1 |
| EgaliteFG6-1e-15 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee15.ts:9 | titre sans infinitif en tête : Orientation en première | ×1 |
| EgaliteFG6-1e-16 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee16.ts:10 | titre sans infinitif en tête : Les filières technologiques | ×1 |
| EgaliteFG6-1e-8 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee8.ts:16 | titre sans infinitif en tête : Choix de spécialités en médecine : un plan d'inclusivité | ×1 |
| EgaliteFG6-1e-9 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee9.ts:11 | titre sans infinitif en tête : Le choix des spécialités en terminale générale | ×1 |
| EgaliteFG7-Tle-17 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee17.ts:15 | titre sans infinitif en tête : L'accès aux CPGE scientifiques | ×1 |
| EgaliteFG7-Tle-18 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee18.ts:15 | titre sans infinitif en tête : La sorcière d'Agnesi | ×1 |
| EgaliteFG7-Tle-19 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee19.ts:15 | titre sans infinitif en tête : Étudiantes en école d'ingénieurs | ×1 |
| EgaliteFG7-Tle-20 (Égalité filles-garçons) | src/exercices/egaliteFG/egaliteFGLycee20.ts:15 | titre sans infinitif en tête : La féminisation du corps médical | ×1 |
| Portraits-001 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait001.ts:3 | titre sans infinitif en tête : Portrait : Sophie Adenot | ×1 |
| Portraits-002 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait002.ts:3 | titre sans infinitif en tête : Portrait : Amandine Aftalion | ×1 |
| Portraits-003 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait003.ts:3 | titre sans infinitif en tête : Portrait : Clémence Allietta | ×1 |
| Portraits-004 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait004.ts:3 | titre sans infinitif en tête : Portrait : Nalini Anantharaman | ×1 |
| Portraits-005 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait005.ts:3 | titre sans infinitif en tête : Portrait : Nathalie Ayi | ×1 |
| Portraits-006 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait006.ts:3 | titre sans infinitif en tête : Portrait : Hanna Bendjador | ×1 |
| Portraits-007 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait007.ts:3 | titre sans infinitif en tête : Portrait : Sylvie Benzoni-Gavage | ×1 |
| Portraits-008 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait008.ts:3 | titre sans infinitif en tête : Portrait : Karine Berger | ×1 |
| Portraits-009 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait009.ts:3 | titre sans infinitif en tête : Portrait : Florence Bertails-Descoubes | ×1 |
| Portraits-010 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait010.ts:3 | titre sans infinitif en tête : Portrait : Manon Blanc | ×1 |
| Portraits-011 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait011.ts:3 | titre sans infinitif en tête : Portrait : Laure Blanc-Féraud | ×1 |
| Portraits-012 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait012.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Bloch | ×1 |
| Portraits-013 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait013.ts:3 | titre sans infinitif en tête : Portrait : Justine Bonnot | ×1 |
| Portraits-014 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait014.ts:3 | titre sans infinitif en tête : Portrait : Mireille Bossy | ×1 |
| Portraits-015 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait015.ts:3 | titre sans infinitif en tête : Portrait : Muriel Boulakia | ×1 |
| Portraits-016 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait016.ts:3 | titre sans infinitif en tête : Portrait : Mireille Bousquet-Mélou | ×1 |
| Portraits-017 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait017.ts:3 | titre sans infinitif en tête : Portrait : Anne Bouverot | ×1 |
| Portraits-018 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait018.ts:3 | titre sans infinitif en tête : Portrait : Patricia Bouyer-Decitre | ×1 |
| Portraits-019 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait019.ts:3 | titre sans infinitif en tête : Portrait : Sylvie Buglioni | ×1 |
| Portraits-020 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait020.ts:3 | titre sans infinitif en tête : Portrait : Claire Calmejane | ×1 |
| Portraits-021 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait021.ts:3 | titre sans infinitif en tête : Portrait : Marie-Paule Cani | ×1 |
| Portraits-022 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait022.ts:3 | titre sans infinitif en tête : Portrait : Anne Canteaut | ×1 |
| Portraits-023 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait023.ts:3 | titre sans infinitif en tête : Portrait : Karine Chemla | ×1 |
| Portraits-024 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait024.ts:3 | titre sans infinitif en tête : Portrait : Émilie Chouzenoux | ×1 |
| Portraits-025 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait025.ts:3 | titre sans infinitif en tête : Portrait : Corinne Cipière | ×1 |
| Portraits-026 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait026.ts:3 | titre sans infinitif en tête : Portrait : Marie-Anne Clair | ×1 |
| Portraits-027 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait027.ts:3 | titre sans infinitif en tête : Portrait : Sarah Cohen-Boulakia | ×1 |
| Portraits-028 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait028.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Collet | ×1 |
| Portraits-029 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait029.ts:3 | titre sans infinitif en tête : Portrait : Évelyne Contejean | ×1 |
| Portraits-030 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait030.ts:3 | titre sans infinitif en tête : Portrait : Véronique Cortier | ×1 |
| Portraits-031 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait031.ts:3 | titre sans infinitif en tête : Portrait : Sophie Dabo-Niang | ×1 |
| Portraits-032 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait032.ts:3 | titre sans infinitif en tête : Portrait : Julie Delon | ×1 |
| Portraits-033 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait033.ts:3 | titre sans infinitif en tête : Portrait : Agnès Desolneux | ×1 |
| Portraits-034 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait034.ts:3 | titre sans infinitif en tête : Portrait : Catherine Devic | ×1 |
| Portraits-035 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait035.ts:3 | titre sans infinitif en tête : Portrait : Laurence Devillers | ×1 |
| Portraits-036 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait036.ts:3 | titre sans infinitif en tête : Portrait : Léa Douchet | ×1 |
| Portraits-037 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait037.ts:3 | titre sans infinitif en tête : Portrait : Nathalie Drach-Temam | ×1 |
| Portraits-038 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait038.ts:3 | titre sans infinitif en tête : Portrait : Virginie Ehrlacher | ×1 |
| Portraits-039 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait039.ts:3 | titre sans infinitif en tête : Portrait : Marie Ekeland | ×1 |
| Portraits-040 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait040.ts:3 | titre sans infinitif en tête : Portrait : Nicole El Karoui | ×1 |
| Portraits-041 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait041.ts:3 | titre sans infinitif en tête : Portrait : Samira El Yacoubi | ×1 |
| Portraits-042 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait042.ts:3 | titre sans infinitif en tête : Portrait : Anne Etien | ×1 |
| Portraits-043 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait043.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Fantoni | ×1 |
| Portraits-044 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait044.ts:4 | titre sans infinitif en tête : Portrait : Virginie Fauvel | ×1 |
| Portraits-045 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait045.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Gallagher | ×1 |
| Portraits-046 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait046.ts:3 | titre sans infinitif en tête : Portrait : Solenne Gaucher | ×1 |
| Portraits-047 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait047.ts:3 | titre sans infinitif en tête : Portrait : Hélyette Geman | ×1 |
| Portraits-048 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait048.ts:3 | titre sans infinitif en tête : Portrait : Élodie Germani | ×1 |
| Portraits-049 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait049.ts:3 | titre sans infinitif en tête : Portrait : Eva Girousse | ×1 |
| Portraits-050 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait050.ts:3 | titre sans infinitif en tête : Portrait : Aliénor Grandclément | ×1 |
| Portraits-051 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait051.ts:3 | titre sans infinitif en tête : Portrait : Christine Guillemot | ×1 |
| Portraits-052 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait052.ts:3 | titre sans infinitif en tête : Portrait : Alice Guionnet | ×1 |
| Portraits-053 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait053.ts:3 | titre sans infinitif en tête : Portrait : Céline Guivarch | ×1 |
| Portraits-054 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait054.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Guyon | ×1 |
| Portraits-055 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait055.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Hébert | ×1 |
| Portraits-056 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait056.ts:3 | titre sans infinitif en tête : Portrait : Raphaèle Herbin | ×1 |
| Portraits-057 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait057.ts:3 | titre sans infinitif en tête : Portrait : Christel Heydemann | ×1 |
| Portraits-058 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait058.ts:3 | titre sans infinitif en tête : Portrait : Caroline Hillairet | ×1 |
| Portraits-059 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait059.ts:3 | titre sans infinitif en tête : Portrait : Céline Hudelot | ×1 |
| Portraits-060 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait060.ts:3 | titre sans infinitif en tête : Portrait : Élise Janvresse | ×1 |
| Portraits-061 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait061.ts:3 | titre sans infinitif en tête : Portrait : Aurélie Jean | ×1 |
| Portraits-062 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait062.ts:3 | titre sans infinitif en tête : Portrait : Monique Jeanblanc | ×1 |
| Portraits-063 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait063.ts:3 | titre sans infinitif en tête : Portrait : Maëlle Jounay | ×1 |
| Portraits-064 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait064.ts:3 | titre sans infinitif en tête : Portrait : Fanny Kassel | ×1 |
| Portraits-065 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait065.ts:3 | titre sans infinitif en tête : Portrait : Christine Keribin | ×1 |
| Portraits-066 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait066.ts:3 | titre sans infinitif en tête : Portrait : Hélène Kirchner | ×1 |
| Portraits-067 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait067.ts:3 | titre sans infinitif en tête : Portrait : Madeleine Kubasch | ×1 |
| Portraits-068 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait068.ts:3 | titre sans infinitif en tête : Portrait : Céline Lazorthes | ×1 |
| Portraits-069 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait069.ts:3 | titre sans infinitif en tête : Portrait : Pauline Leclerc-Glorieux | ×1 |
| Portraits-070 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait070.ts:3 | titre sans infinitif en tête : Portrait : Aline Lefebvre-Lepot | ×1 |
| Portraits-071 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait071.ts:3 | titre sans infinitif en tête : Portrait : Florence Lustman | ×1 |
| Portraits-072 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait072.ts:3 | titre sans infinitif en tête : Portrait : Nadia Maïzi | ×1 |
| Portraits-073 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait073.ts:3 | titre sans infinitif en tête : Portrait : Sibylle Marcotte | ×1 |
| Portraits-074 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait074.ts:3 | titre sans infinitif en tête : Portrait : Claire Mathieu | ×1 |
| Portraits-075 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait075.ts:3 | titre sans infinitif en tête : Portrait : Véronique Maume-Deschamps | ×1 |
| Portraits-076 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait076.ts:3 | titre sans infinitif en tête : Portrait : Clémentine Maurice | ×1 |
| Portraits-077 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait077.ts:3 | titre sans infinitif en tête : Portrait : Sylvie Méléard | ×1 |
| Portraits-078 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait078.ts:3 | titre sans infinitif en tête : Portrait : Julie Meunier | ×1 |
| Portraits-079 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait079.ts:3 | titre sans infinitif en tête : Portrait : Nathalie Mitton | ×1 |
| Portraits-080 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait080.ts:3 | titre sans infinitif en tête : Portrait : Sophie Morel | ×1 |
| Portraits-081 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait081.ts:3 | titre sans infinitif en tête : Portrait : Christine Morin | ×1 |
| Portraits-082 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait082.ts:3 | titre sans infinitif en tête : Portrait : Hélène Morlon | ×1 |
| Portraits-083 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait083.ts:3 | titre sans infinitif en tête : Portrait : Sophie Mourlon | ×1 |
| Portraits-084 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait084.ts:3 | titre sans infinitif en tête : Portrait : Laurence Nigay | ×1 |
| Portraits-085 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait085.ts:3 | titre sans infinitif en tête : Portrait : Anne-Cécile Orgerie | ×1 |
| Portraits-086 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait086.ts:3 | titre sans infinitif en tête : Portrait : Claire Pagetti | ×1 |
| Portraits-087 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait087.ts:3 | titre sans infinitif en tête : Portrait : Katia Parodi | ×1 |
| Portraits-088 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait088.ts:3 | titre sans infinitif en tête : Portrait : Catherine Pelachaud | ×1 |
| Portraits-089 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait089.ts:3 | titre sans infinitif en tête : Portrait : Bernadette Perrin-Riou | ×1 |
| Portraits-090 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait090.ts:3 | titre sans infinitif en tête : Portrait : Florence Picard | ×1 |
| Portraits-091 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait091.ts:3 | titre sans infinitif en tête : Portrait : Anne Pichon | ×1 |
| Portraits-092 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait092.ts:3 | titre sans infinitif en tête : Portrait : Sophie Proust | ×1 |
| Portraits-093 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait093.ts:3 | titre sans infinitif en tête : Portrait : Marie-Christine Rousset | ×1 |
| Portraits-094 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait094.ts:3 | titre sans infinitif en tête : Portrait : Isabelle Ryl | ×1 |
| Portraits-095 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait095.ts:3 | titre sans infinitif en tête : Portrait : Myriam Saadé | ×1 |
| Portraits-096 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait096.ts:3 | titre sans infinitif en tête : Portrait : Laure Saint-Raymond | ×1 |
| Portraits-097 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait097.ts:3 | titre sans infinitif en tête : Portrait : Fatiha Saïs | ×1 |
| Portraits-098 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait098.ts:3 | titre sans infinitif en tête : Portrait : Sylvia Serfaty | ×1 |
| Portraits-099 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait099.ts:3 | titre sans infinitif en tête : Portrait : Anne Siegel | ×1 |
| Portraits-100 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait100.ts:3 | titre sans infinitif en tête : Portrait : Marie-Luce Taupin | ×1 |
| Portraits-101 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait101.ts:3 | titre sans infinitif en tête : Portrait : Véronique Torner | ×1 |
| Portraits-102 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait102.ts:3 | titre sans infinitif en tête : Portrait : Florence Tupin | ×1 |
| Portraits-103 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait103.ts:3 | titre sans infinitif en tête : Portrait : Amandine Véber | ×1 |
| Portraits-104 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait104.ts:3 | titre sans infinitif en tête : Portrait : Michèle Vergne | ×1 |
| Portraits-105 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait105.ts:3 | titre sans infinitif en tête : Portrait : Sophie Viger | ×1 |
| Portraits-106 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait106.ts:3 | titre sans infinitif en tête : Portrait : Claire Voisin | ×1 |
| Portraits-107 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait107.ts:3 | titre sans infinitif en tête : Portrait : Muriel Boulakia | ×1 |
| Portraits-108 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait108.ts:3 | titre sans infinitif en tête : Portrait : Lucia Clarotto | ×1 |
| Portraits-109 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait109.ts:3 | titre sans infinitif en tête : Portrait : Camille Coron | ×1 |
| Portraits-110 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait110.ts:3 | titre sans infinitif en tête : Portrait : Aline Lefebvre-Lepot (livret Versailles) | ×1 |
| Portraits-111 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait111.ts:3 | titre sans infinitif en tête : Portrait : Yilin Wang | ×1 |
| Portraits-112 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait112.ts:3 | titre sans infinitif en tête : Portrait : Maëva Arlandis | ×1 |
| Portraits-113 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait113.ts:3 | titre sans infinitif en tête : Portrait : Marie Zeidler | ×1 |
| Portraits-114 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait114.ts:3 | titre sans infinitif en tête : Portrait : Rabetrano Miora Andriambololo-Nivo | ×1 |
| Portraits-115 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait115.ts:3 | titre sans infinitif en tête : Portrait : Laura Schittecatte | ×1 |
| Portraits-116 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait116.ts:3 | titre sans infinitif en tête : Portrait : Catherine Langlet | ×1 |
| Portraits-117 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait117.ts:3 | titre sans infinitif en tête : Portrait : Hypatie d'Alexandrie | ×1 |
| Portraits-118 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait118.ts:3 | titre sans infinitif en tête : Portrait : Sophie Germain (livret Versailles) | ×1 |
| Portraits-119 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait119.ts:3 | titre sans infinitif en tête : Portrait : Ada Lovelace | ×1 |
| Portraits-120 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait120.ts:3 | titre sans infinitif en tête : Portrait : Florence Nightingale | ×1 |
| Portraits-121 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait121.ts:3 | titre sans infinitif en tête : Portrait : Emmy Noether | ×1 |
| Portraits-122 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait122.ts:3 | titre sans infinitif en tête : Portrait : Julia Robinson | ×1 |
| Portraits-123 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait123.ts:3 | titre sans infinitif en tête : Portrait : Mary Cartwright | ×1 |
| Portraits-124 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait124.ts:3 | titre sans infinitif en tête : Portrait : Dorothy Vaughan | ×1 |
| Portraits-125 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait125.ts:3 | titre sans infinitif en tête : Portrait : Gladys West | ×1 |
| Portraits-126 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait126.ts:3 | titre sans infinitif en tête : Portrait : Sally Ride | ×1 |
| Portraits-127 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait127.ts:3 | titre sans infinitif en tête : Portrait : Shakuntala Devi | ×1 |
| Portraits-128 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait128.ts:3 | titre sans infinitif en tête : Portrait : Maryam Mirzakhani | ×1 |
| Portraits-129 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait129.ts:3 | titre sans infinitif en tête : Portrait : Katherine Johnson | ×1 |
| Portraits-130 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait130.ts:3 | titre sans infinitif en tête : Portrait : Valérie Thomas | ×1 |
| Portraits-131 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait131.ts:3 | titre sans infinitif en tête : Portrait : Claire Voisin (livret Versailles) | ×1 |
| Portraits-132 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait132.ts:3 | titre sans infinitif en tête : Portrait : Fei-Fei Li | ×1 |
| Portraits-133 (Égalité filles-garçons) | src/exercices/egaliteFG/portrait133.ts:3 | titre sans infinitif en tête : Portrait : Timnit Gebru | ×1 |
| EN-CompteBon (EN) | src/exercices/enigmes-jeux/EN-le-compte-est-bon.ts:13 | titre sans infinitif en tête : Le compte est bon | ×1 |
| 3e/3F12.ts (hors référentiel) | src/exercices/3e/3F12.ts:5 | titre sans infinitif en tête : Calculer, de manières différentes, des images par une fonction | ×1 |
| 5e/_Constructibilite_des_triangles.ts (hors référentiel) | src/exercices/5e/_Constructibilite_des_triangles.ts:18 | titre sans infinitif en tête : Constructibilité des triangles via les longueurs ou les angles | ×1 |
| can/c3/_Canc3a.ts (hors référentiel) | src/exercices/can/c3/_Canc3a.ts:33 | titre sans infinitif en tête : Classe CAN C3 | ×1 |
| can/can1a-2022/can1a-2022-Q30.ts (hors référentiel) | src/exercices/can/can1a-2022/can1a-2022-Q30.ts:7 | titre sans infinitif en tête : Q30 | ×1 |
| can/can2a-2025C/can2a-2025C-Q13.ts (hors référentiel) | src/exercices/can/can2a-2025C/can2a-2025C-Q13.ts:6 | titre sans infinitif en tête : Q13 | ×1 |
| can/can2a-2025C/can2a-2025C-Q21.ts (hors référentiel) | src/exercices/can/can2a-2025C/can2a-2025C-Q21.ts:5 | titre sans infinitif en tête : Q21 | ×1 |
| can/can2a-2026/can2a-2026-Q12.ts (hors référentiel) | src/exercices/can/can2a-2026/can2a-2026-Q12.ts:7 | titre sans infinitif en tête : Calcul retourné par un algorithme | ×1 |
| can/can3a-2026/can3a-2026-Q19.ts (hors référentiel) | src/exercices/can/can3a-2026/can3a-2026-Q19.ts:6 | titre sans infinitif en tête : Décomposition en produit de facteurs premiers | ×1 |
| can/can4a-2025/can4a-2025-Q22.ts (hors référentiel) | src/exercices/can/can4a-2025/can4a-2025-Q22.ts:5 | titre sans infinitif en tête : Somme de nombre relatifs | ×1 |
| can/can4a-2025/can4a-2025-Q24.ts (hors référentiel) | src/exercices/can/can4a-2025/can4a-2025-Q24.ts:8 | titre sans infinitif en tête : Fraction restante | ×1 |
| can/can4a-2025/can4a-2025-Q25.ts (hors référentiel) | src/exercices/can/can4a-2025/can4a-2025-Q25.ts:6 | titre sans infinitif en tête : Somme astucieuse | ×1 |
| can/can4a-2025/can4a-2025-Q27.ts (hors référentiel) | src/exercices/can/can4a-2025/can4a-2025-Q27.ts:6 | titre sans infinitif en tête : Moitié d'un nombre décimal | ×1 |
| can/can4a-2025/can4a-2025-Q28.ts (hors référentiel) | src/exercices/can/can4a-2025/can4a-2025-Q28.ts:8 | titre sans infinitif en tête : Ratios | ×1 |
| ExerciceVraiFaux.ts (hors référentiel) | src/exercices/ExerciceVraiFaux.ts:9 | titre sans infinitif en tête : A trouver | ×1 |
| modèlesExos/ExempleCanListeDeroulante.ts (hors référentiel) | src/exercices/modèlesExos/ExempleCanListeDeroulante.ts:10 | titre sans infinitif en tête : Un test exo simple + liste déroulante | ×1 |
| ressources/iframe.ts (hors référentiel) | src/exercices/ressources/iframe.ts:9 | titre sans infinitif en tête : Ressource externe | ×1 |
| ressources/testKatex.ts (hors référentiel) | src/exercices/ressources/testKatex.ts:4 | titre sans infinitif en tête : Katex sandbox | ×1 |
| ressources/video.ts (hors référentiel) | src/exercices/ressources/video.ts:10 | titre sans infinitif en tête : Vidéo | ×1 |
| HPC103 (HP) | src/exercices/HP/HPC103.ts:12 | titre sans infinitif en tête : Produit de matrices | ×1 |
| 1eb36 (Non classés) | src/exercices/modèlesExos/30_constructions_géométriques.ts:16 | titre sans infinitif en tête : Nom de l'exercice | ×1 |
| 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:8 | titre sans infinitif en tête : Test MultiMathfield | ×1 |
| 2cdd4 (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q8.ts:7 | titre sans infinitif en tête : (QCM) | ×1 |
| 36cc7 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q3.ts:11 | titre sans infinitif en tête : Droite des nombres | ×1 |
| 38d97 (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q13.ts:8 | titre sans infinitif en tête : Conversion de longueurs | ×1 |
| 47d36 (Non classés) | src/exercices/QCMBrevet/A2025/MJ25E3Q1.ts:16 | titre sans infinitif en tête : Proportionnalité (Métropole Juin 2025) | ×1 |
| 47d56 (Non classés) | src/exercices/QCMBrevet/A2025/MJ25E3Q2.ts:26 | titre sans infinitif en tête : Transformations (Métropole Juin 2025) | ×1 |
| 47f36 (Non classés) | src/exercices/QCMBrevet/A2025/MJ25E3Q3.ts:16 | titre sans infinitif en tête : Aumentation en pourcentage (Métropole Juin 2025) | ×1 |
| 47v56 (Non classés) | src/exercices/QCMBrevet/A2025/MJ25E3Q6.ts:26 | titre sans infinitif en tête : Volume (Métropole Juin 2025) | ×1 |
| 48d36 (Non classés) | src/exercices/QCMBrevet/A2025/MJ25E3Q5.ts:19 | titre sans infinitif en tête : Calcul littéral (Métropole Juin 2025) | ×1 |
| 4ed52 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q15.ts:7 | titre sans infinitif en tête : Division euclidienne | ×1 |
| 5160f (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q2.ts:3 | titre sans infinitif en tête : Tables de multiplication | ×1 |
| 5514f (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q9.ts:4 | titre sans infinitif en tête : Complément à la centaine supérieure | ×1 |
| 667d6 (Non classés) | src/exercices/can/TSpe/canTSpeS11.ts:5 | titre sans infinitif en tête : Raisonnement par récurrence | ×1 |
| 6b74b (Non classés) | src/exercices/serieAleatoire/SerieAleatoire.ts:16 | titre sans infinitif en tête : Série aléatoire | ×1 |
| 76efb (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q10.ts:6 | titre sans infinitif en tête : Numeration et ordre | ×1 |
| 88a60 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q14.ts:7 | titre sans infinitif en tête : Numeration et intervalle | ×1 |
| 88e43 (Non classés) | src/exercices/modèlesExos/10_simple.ts:4 | titre sans infinitif en tête : Somme de deux entiers | ×1 |
| 8a20a (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q5.ts:6 | titre sans infinitif en tête : Multiple simple | ×1 |
| 8e72f (Non classés) | src/exercices/HP/HPC106.ts:19 | titre sans infinitif en tête : Calculs avec des nombres complexes | ×1 |
| 90ba8 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q16.ts:7 | titre sans infinitif en tête : Multiples simples | ×1 |
| 9194d (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q18.ts:7 | titre sans infinitif en tête : Numération compliquée | ×1 |
| 97290 (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q16.ts:7 | titre sans infinitif en tête : Différence de fracion | ×1 |
| 9e72f (Non classés) | src/exercices/TEx/TEC1-0.ts:4 | titre sans infinitif en tête : Sommes algébriques de nombres complexes | ×1 |
| 9e82f (Non classés) | src/exercices/TEx/TEC1-03.ts:4 | titre sans infinitif en tête : Quotients de nombres complexes | ×1 |
| 9e83f (Non classés) | src/exercices/TEx/TEC1-04.ts:4 | titre sans infinitif en tête : Sommes algébriques complexes | ×1 |
| 9f72f (Non classés) | src/exercices/TEx/TEC1-02.ts:4 | titre sans infinitif en tête : Produits de nombres complexes | ×1 |
| 9f83f (Non classés) | src/exercices/TEx/TEC1-05.ts:5 | titre sans infinitif en tête : Produits complexes | ×1 |
| a2993 (Non classés) | src/exercices/can/canCE1a-2026/canCE1-2026-Q18.ts:16 | titre sans infinitif en tête : Trouve l'heure sur une horloge (QCM) | ×1 |
| a309b (Non classés) | src/exercices/modèlesExos/30_questions_differentes_chronologiquesy.ts:3 | titre sans infinitif en tête : Nom de l'exercice | ×1 |
| a343a (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q20.ts:6 | titre sans infinitif en tête : Division euclidienne | ×1 |
| a343b (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q22.ts:7 | titre sans infinitif en tête : Proportionnalité | ×1 |
| a343g (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q1.ts:6 | titre sans infinitif en tête : Tables de multiplication | ×1 |
| a343h (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q2.ts:5 | titre sans infinitif en tête : Somme de deux nombres décimaux | ×1 |
| a343i (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q3.ts:6 | titre sans infinitif en tête : Fraction simple | ×1 |
| a343j (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q4.ts:5 | titre sans infinitif en tête : Complément à 100 | ×1 |
| a343k (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q5.ts:8 | titre sans infinitif en tête : Abscisse d'un point | ×1 |
| a343l (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q6.ts:6 | titre sans infinitif en tête : Priorité des opérations | ×1 |
| a343m (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q7.ts:6 | titre sans infinitif en tête : Conversion en minutes décimales | ×1 |
| a343n (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q8.ts:7 | titre sans infinitif en tête : Multiplication par 100 de nombres décimaux | ×1 |
| a343o (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q9.ts:7 | titre sans infinitif en tête : Dix pour cent | ×1 |
| a343p (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q10.ts:5 | titre sans infinitif en tête : Répartition | ×1 |
| a343r (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q12.ts:22 | titre sans infinitif en tête : Symétrie axiale | ×1 |
| a343s (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q13.ts:7 | titre sans infinitif en tête : Produit de 3 facteurs | ×1 |
| a343t (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q14.ts:6 | titre sans infinitif en tête : Suite de nombres | ×1 |
| a343u (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q15.ts:6 | titre sans infinitif en tête : Répartition | ×1 |
| a343v (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q16.ts:7 | titre sans infinitif en tête : Proportionnalité | ×1 |
| a343w (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q17.ts:8 | titre sans infinitif en tête : Conversion de longueurs | ×1 |
| a343x (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q18.ts:12 | titre sans infinitif en tête : Somme des angles d'un triangle | ×1 |
| a343y (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q25.ts:5 | titre sans infinitif en tête : Expression à calculer | ×1 |
| a343z (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q19.ts:8 | titre sans infinitif en tête : Numération | ×1 |
| a3y3b (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q26.ts:6 | titre sans infinitif en tête : Égalité de fractions | ×1 |
| afrce (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q14.ts:8 | titre sans infinitif en tête : Probabilités | ×1 |
| aModifier (Non classés) | src/exercices/modèlesExos/20_plusieurs_types.ts:4 | titre sans infinitif en tête : Nom de l'exercice | ×1 |
| autres-1 (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q17.ts:7 | titre sans infinitif en tête : Boucle scratch | ×1 |
| b343g (Non classés) | src/exercices/can/can5a-2025/can5a-2025-Q23.ts:5 | titre sans infinitif en tête : Majoration de fraction | ×1 |
| b9935 (Non classés) | src/exercices/modèlesExos/00_simple_Course_au_Nombres.ts:4 | titre sans infinitif en tête : Somme de deux entiers | ×1 |
| byxrt (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q12.ts:15 | titre sans infinitif en tête : Distance sur un segment | ×1 |
| c3917 (Non classés) | src/exercices/can/canCE1a-2025/canCE1-2025-Q1.ts:3 | titre sans infinitif en tête : Multiple simple | ×1 |
| ccf0d (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q1.ts:7 | titre sans infinitif en tête : Complément à la dizaine supérieure | ×1 |
| cdff0 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q20.ts:5 | titre sans infinitif en tête : Somme facilitée | ×1 |
| croiss (Non classés) | src/exercices/QCMBrevet/A2019/CroissanceFonctions.ts:15 | titre sans infinitif en tête : Croissance de fonctions | ×1 |
| dce62 (Non classés) | src/exercices/can/can6a-2025/can6a-2025-Q7.ts:3 | titre sans infinitif en tête : Multiple simple | ×1 |
| e24f0 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q17.ts:6 | titre sans infinitif en tête : Multiples de 10 | ×1 |
| e6bf9 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q8.ts:6 | titre sans infinitif en tête : Combien de fois ? | ×1 |
| exemple-qcm-json (Non classés) | src/exercices/modèlesExos/ExempleQcmJson.ts:65 | titre sans infinitif en tête : Exemple QCM JSON | ×1 |
| f0cad (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q21.ts:5 | titre sans infinitif en tête : Somme de nombre relatifs | ×1 |
| f343g (Non classés) | src/exercices/can/can6a-2025/can6a-2025-Q1.ts:5 | titre sans infinitif en tête : Sommes de nombres entiers | ×1 |
| f34d0 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q6.ts:8 | titre sans infinitif en tête : Multiple simple | ×1 |
| f3a3g (Non classés) | src/exercices/can/can6a-2025/can6a-2025-Q2.ts:5 | titre sans infinitif en tête : Tables à trou | ×1 |
| f6jd7 (Non classés) | src/exercices/can/canCE2a-2025/canCE2-2025-Q11.ts:20 | titre sans infinitif en tête : Visualisation 3d | ×1 |
| f776b (Non classés) | src/exercices/can/can4a-2025/can4a-2025-Q19.ts:6 | titre sans infinitif en tête : Programme de calcul | ×1 |
| f9261 (Non classés) | src/exercices/modèlesExos/21_parametrable.ts:3 | titre sans infinitif en tête : Nom de l'exercice | ×1 |
| jnapmep1 (Non classés) | src/exercices/modèlesExos/JNAPMEP_parametrage.ts:14 | titre sans infinitif en tête : Nom de l'exercice | ×1 |
| r70zj (Non classés) | src/exercices/can/can4a-2026/can4a-2026-Q18.ts:14 | titre sans infinitif en tête : Expression du périmètre d'un rectangle en fonction de sa largeur | ×1 |
| sebseb (Non classés) | src/exercices/modèlesExos/ExempleSchemaEnBoite.ts:10 | titre sans infinitif en tête : Schemas en boite | ×1 |
| PR-31 (Primaire) | src/exercices/6e/6N12-1.ts:7 | titre sans infinitif en tête : Par combien multiplier un entier pour que le chiffre des unités devienne le chiffre des ... ? | ×1 |
| PR-7 (Primaire) | src/exercices/can/can5a-2025/can5a-2025-Q24.ts:19 | titre sans infinitif en tête : Partage d'un segment | ×1 |
| PR-9 (Primaire) | src/exercices/can/canCE2a-2025/canCE2-2025-Q7.ts:7 | titre sans infinitif en tête : Numeration simple | ×1 |
| TSA1-QCM01 (Terminale) | src/exercices/QCMBac/A2023/AmNordAout2023Q3.ts:12 | titre sans infinitif en tête : Amérique 08/23 : limites | ×1 |
| TSA1-QCM02 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023Q2.ts:12 | titre sans infinitif en tête : Métropole 09/23 : nature | ×1 |
| TSA1-QCM03 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023Q3.ts:12 | titre sans infinitif en tête : Métropole 09/23 : Python | ×1 |
| TSA1-QCM04 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023Q4.ts:12 | titre sans infinitif en tête : Métropole 09/23 : nature et variations | ×1 |
| TSA2-QCM06 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_1Q2_alea.ts:18 | titre sans infinitif en tête : Centres étrangers 05/22 : convexité | ×1 |
| TSA2-QCM07 (Terminale) | src/exercices/QCMBac/2021/metropole092021_2Q1_alea.ts:26 | titre sans infinitif en tête : Métropole 09/21 : étude de dérivée | ×1 |
| TSA2-QCM08 (Terminale) | src/exercices/QCMBac/2021/metropole092021_2Q2_alea.ts:25 | titre sans infinitif en tête : Métropole 09/21 : exponentielle | ×1 |
| TSA2-QCM09 (Terminale) | src/exercices/QCMBac/2021/metropole092021_2Q3.ts:25 | titre sans infinitif en tête : Métropole 09/21 : point d'inflexion | ×1 |
| TSA2-QCM10 (Terminale) | src/exercices/QCMBac/A2022/Polynesie2022_2Q5.ts:13 | titre sans infinitif en tête : Polynésie 05/22 : tangente | ×1 |
| TSA2-QCM11 (Terminale) | src/exercices/QCMBac/A2022/Metropole2022_1Q1.ts:13 | titre sans infinitif en tête : Métropole 05/2022 : asymptote | ×1 |
| TSA2-QCM12 (Terminale) | src/exercices/QCMBac/A2022/Metropole2022_1Q3.ts:19 | titre sans infinitif en tête : Métropole 05/22 : convexité | ×1 |
| TSA4-QCM01 (Terminale) | src/exercices/QCMBac/A2023/AmNordAout2023Q2.ts:12 | titre sans infinitif en tête : Amérique 08/23 : TVI | ×1 |
| TSA4-QCM02 (Terminale) | src/exercices/QCMBac/A2022/Polynesie2022_2Q3.ts:13 | titre sans infinitif en tête : Polynésie 05/22 : équation | ×1 |
| TSA5-QCM01 (Terminale) | src/exercices/QCMBac/A2023/AmNordAout2023Q1.ts:12 | titre sans infinitif en tête : Amérique 08/23 : limite | ×1 |
| TSA5-QCM02 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_2Q1_alea.ts:17 | titre sans infinitif en tête : Centres étrangers 05/22 : équation | ×1 |
| TSA5-QCM03 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_2Q2_alea.ts:13 | titre sans infinitif en tête : Centres étrangers 05/22 : concavité | ×1 |
| TSA5-QCM04 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_2Q3_alea.ts:13 | titre sans infinitif en tête : Centres étrangers 05/22 : primitive | ×1 |
| TSA5-QCM05 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_2Q4_alea.ts:13 | titre sans infinitif en tête : Centres étrangers 05/22 : domaine | ×1 |
| TSA5-QCM06 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_2Q5_alea.ts:13 | titre sans infinitif en tête : Centres étrangers 05/22 : tangente | ×1 |
| TSA5-QCM07 (Terminale) | src/exercices/QCMBac/A2022/Etrangers2022_2Q6_alea.ts:13 | titre sans infinitif en tête : Centres étrangers 05/22 : inéquation | ×1 |
| TSA5-QCM08 (Terminale) | src/exercices/QCMBac/A2022/Madagascar2022_1Q2_alea.ts:13 | titre sans infinitif en tête : Madagascar 05/22 : propriétés | ×1 |
| TSA5-QCM09 (Terminale) | src/exercices/QCMBac/A2022/Madagascar2022_1Q3_alea.ts:13 | titre sans infinitif en tête : Madagascar 05/22 : asymptote | ×1 |
| TSA5-QCM11 (Terminale) | src/exercices/QCMBac/A2022/Madagascar2022_1Q4.ts:13 | titre sans infinitif en tête : Madagascar 05/22 : équation | ×1 |
| TSA5-QCM12 (Terminale) | src/exercices/QCMBac/A2022/Madagascar2022_1Q5.ts:13 | titre sans infinitif en tête : Madagascar 05/22 : tangente | ×1 |
| TSA5-QCM13 (Terminale) | src/exercices/QCMBac/A2022/Madagascar2022_1Q6.ts:13 | titre sans infinitif en tête : Madagascar 05/22 : point d'inflexion | ×1 |
| TSA5-QCM15 (Terminale) | src/exercices/QCMBac/A2022/Amerique2022_2Q2.ts:13 | titre sans infinitif en tête : Amérique 05/22 : équation | ×1 |
| TSA5-QCM16 (Terminale) | src/exercices/QCMBac/A2022/Amerique2022_2Q3.ts:13 | titre sans infinitif en tête : Amérique 05/22 : fonction | ×1 |
| TSA5-QCM17 (Terminale) | src/exercices/QCMBac/A2022/Polynesie2022_2Q1.ts:13 | titre sans infinitif en tête : Polynésie 05/22 : dérivée | ×1 |
| TSA5-QCM18 (Terminale) | src/exercices/QCMBac/A2022/Polynesie2022_2Q6.ts:13 | titre sans infinitif en tête : Polynésie 05/22 : équation | ×1 |
| TSA5-QCM19 (Terminale) | src/exercices/QCMBac/A2022/Metropole2022_1Q5.ts:13 | titre sans infinitif en tête : Métropole 05/22 : limites | ×1 |
| TSA5-QCM20 (Terminale) | src/exercices/QCMBac/A2022/Amerique20222Q1.ts:13 | titre sans infinitif en tête : Amérique 05/22 : somme | ×1 |
| TSA5-QCM21 (Terminale) | src/exercices/QCMBac/A2022/Polynesie20222Q2.ts:13 | titre sans infinitif en tête : Polynésie 05/22 : limite | ×1 |
| TSA6-QCM01 (Terminale) | src/exercices/QCMBac/A2023/caledonieAout2023Q1.ts:12 | titre sans infinitif en tête : Nouvelle Calédonie 08/23 : primitive | ×1 |
| TSA6-QCM02 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023Q1.ts:12 | titre sans infinitif en tête : Métropole 09/23 : primitive | ×1 |
| TSA6-QCM04 (Terminale) | src/exercices/QCMBac/A2024/modele_polynesieJuin2024Q2.ts:22 | titre sans infinitif en tête : Polynésie 06/2024 : graphique | ×1 |
| TSA6-QCM05 (Terminale) | src/exercices/QCMBac/A2024/polynesieJuin2024Q3.ts:12 | titre sans infinitif en tête : Polynésie 06/2024 : intégration | ×1 |
| TSA6-QCM06 (Terminale) | src/exercices/QCMBac/A2022/Polynesie2022_2Q4.ts:13 | titre sans infinitif en tête : Polynésie 05/2022 : primitive | ×1 |
| TSA6-QCM09 (Terminale) | src/exercices/QCMBac/A2022/Polynesie20221Q2.ts:13 | titre sans infinitif en tête : Polynésie 05/22 : primitive | ×1 |
| TSA6-QCM7 (Terminale) | src/exercices/QCMBac/A2022/Metropole2022_1Q2.ts:13 | titre sans infinitif en tête : Métropole 05/22 : primitive | ×1 |
| TSA6-QCM8 (Terminale) | src/exercices/QCMBac/A2022/Metropole2022_1Q4.ts:13 | titre sans infinitif en tête : Métropole 05/22 : variations | ×1 |
| TSG1-QCM01 (Terminale) | src/exercices/QCMBac/A2024/polynesieJuin2024Q4.ts:16 | titre sans infinitif en tête : Polynésie 06/2024 : combinatoire | ×1 |
| TSG1-QCM06 (Terminale) | src/exercices/QCMBac/A2024/polynesieJuin2024Q5.ts:16 | titre sans infinitif en tête : Polynésie 06/2024 : combinatoire | ×1 |
| TSG2-QCM01 (Terminale) | src/exercices/QCMBac/A2023/caledonieAout2023Q2.ts:12 | titre sans infinitif en tête : Nouvelle Calédonie 08/23 : droites | ×1 |
| TSG2-QCM02 (Terminale) | src/exercices/QCMBac/A2023/caledonieAout2023Q3.ts:12 | titre sans infinitif en tête : Nouvelle Calédonie 08/23 : droite et plan | ×1 |
| TSG2-QCM03 (Terminale) | src/exercices/QCMBac/A2023/caledonieAout2023Q4.ts:12 | titre sans infinitif en tête : Nouvelle Calédonie 08/23 : plans | ×1 |
| TSG2-QCM04 (Terminale) | src/exercices/QCMBac/A2023/caledonieAout2023Q5.ts:12 | titre sans infinitif en tête : Nouvelle Calédonie 08/23 : produit scalaire | ×1 |
| TSG2-QCM05 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023_2Q1.ts:12 | titre sans infinitif en tête : Métropole 09/2024 : point d'un plan | ×1 |
| TSG2-QCM06 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023_2Q2.ts:12 | titre sans infinitif en tête : Métropole 09/2024 : nature d'un triangle | ×1 |
| TSG2-QCM07 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023_2Q3.ts:12 | titre sans infinitif en tête : Métropole 09/2024 : droite-plan | ×1 |
| TSG2-QCM08 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023_2Q4.ts:12 | titre sans infinitif en tête : Métropole 09/2024 : produit scalaire | ×1 |
| TSG2-QCM09 (Terminale) | src/exercices/QCMBac/A2023/metropoleSept2023_2Q5.ts:12 | titre sans infinitif en tête : Métropole 09/2024 : plan-droite | ×1 |
| TTE-5 (Terminale) | src/exercices/TT/TTE-5.ts:16 | titre sans infinitif en tête : Résolution d'équations du type $a^x = b$ avec un logarithme | ×1 |

## X7

**Combinaisons de paramètres non toutes passées** (gravité 6 : Pour mémoire)

| Exercice | Où | Constat | Tirages |
| --- | --- | --- | --- |
| CM1N1E (cm1) |  | 1680 combinaisons : 71 passées (couverture par paires) | ×1 |
