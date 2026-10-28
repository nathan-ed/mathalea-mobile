# Revue des exercices : Autres

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **34 sur 268**. Constats confirmés : **35**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Contenu mathématique faux | 2 |
| Rendu cassé (formule, débordement, erreur) | 1 |
| Mise en évidence (miseEnEvidence et champs) | 4 |
| Typographie (nombres, espaces, notations) | 1 |
| Rédaction (français, titres, consignes) | 27 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP2FONC31 | C1 Contenu mathématique faux | Titre « Résoudre algébriquement une équation f(x)=k avec la fonction carrée » mais l'équation proposée est 1/x=13 (fonction inverse) ; 50 insécables pour centrer l'équation (mise en page à l'espace) ; $\mathbb{R}^*$ ; M1 (3). | Titre « … fonction inverse » ; saut de ligne. | src/exercices/BP2/BP2FONC31.ts |
| BP2FONC32 | C1 Contenu mathématique faux | Titre « …inéquation avec la fonction carrée » mais l'inéquation est \|x\|⩽4 (fonction valeur absolue) ; correction en liste « • On trace … • On trace … » ; 12 M1 : intervalle mis en évidence refusé ; X4. | Titre « fonction valeur absolue ». | src/exercices/BP2/BP2FONC32.ts |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP2AutoK1 | X4  | Solveur interactif (138 IM, 138 X4) : énoncé de série vide, à tester à la main. | Tester à la main. | src/exercices/BP2/BP2AutoK1.ts |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP2AutoI17 | M1 Évidence refusée par le champ | Factorisation : la correction met en évidence trois fois le facteur commun « (2x+4) » mais pas le résultat final « (5-x)(2x+4) » (100 M1 : (2x+4) saisi refusé, attendu (-x+5)(2x+4)) ; le résultat n'est pas complètement factorisé (2x+4=2(x+2)) ; (5-x) en couleur bleue dans le texte. | Mettre en évidence le produit final ; préciser « factoriser par (2x+4) ». | src/exercices/BP2/BP2AutoI17.ts |
| BP2AutoV3 | M1 Évidence refusée par le champ | Clone de 6M2C : unité d'aire exigée mais absente de la mise en évidence (24 M1). | Unité dans l'évidence. | src/exercices/BP2/BP2AutoV3.ts |
| BP2AutoV4 | M1 Évidence refusée par le champ | Clone de 6M2C-1 : unité exigée mais absente de l'évidence (58 M1) ; énoncé de série vide (24 X4). | Unité dans l'évidence ; consigne. | src/exercices/BP2/BP2AutoV4.ts |
| BP2FONC28 | M3  | QCM croissante/décroissante : la bonne réponse n'est pas mise en évidence comme proposition (18 M3) ; « $a=7~$ et $b=-6$ » espace dans le dollar. | Proposition en évidence. | src/exercices/BP2/BP2FONC28.ts |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP1AA05 | T5 Espaces | 1 double espace ; correction juste (t_n=-6-n) ; « pour tout n » ok. | RAS. | src/exercices/BP1/BP1AA05.ts |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| transversal | R10 Français | « pour passer des $\text{m}$ au $\text{cm}$ » (aux) dans 26 corrections : can6M4-03 (8 fois), can6M4-05 (4), can6M3-01, can6a-2021 (790, 806), can6a-2025-Q29, canc3a-2025-Q29, canc3a-CM1-2025-Q29, can3a-2026-Q4 (3), can5a-2024-Q9 (3), can3a-2022 (300, 317), can5a-2022 (346, 360), can4a-2022 (318, 330). | pour passer des $\text{m}$ aux $\text{cm}$ | grep « passer des $\\text{…}$ au $ » dans src/exercices |
| BP1AA02 | R3  | Correction : couleurs violet/purple différentes pour un même terme (« {\color{violet}…} », « {\color{purple}…} ») : code couleur non expliqué ; « w_{n+1} = w_n -4 » espace avant -4 ; calcul juste. | Une seule couleur par terme ; espace. | src/exercices/BP1/BP1AA02.ts |
| BP1AA03 | R3  | « suite arithmétique de raison $r=8$ et de premier terme $u_1=-5$ » puis « $u_n=-13+8n$ » correct (u_15=107) ; $n\in\mathbb{N}^*$ sans espace ; correction recopie l'énoncé. | Supprimer la répétition de l'énoncé. | src/exercices/BP1/BP1AA03.ts |
| BP1AA04 | R3  | « on obtient donc la raison de la suite en effectuant la différence de deux termes consécutifs » ok ; pas de problème notable ; correction juste (-8). | RAS. | src/exercices/BP1/BP1AA04.ts |
| BP1AA07 | R2 Tutoiement, impératif | « ⟦décroissante.⟧ » mot et point final dans la mise en évidence (texte) ; QCM : proposition non mise en évidence (12 M3) ; « de raison $-6$ et de premier terme $t_0$ » ; 12 phrases sans virgule (« Or $r&lt;0$, donc »). | texteEnCouleurEtGras('décroissante') ; point hors évidence. | src/exercices/BP1/BP1AA07.ts |
| BP1AA08 | R13  | « Etudier le sens de variation » sans accent (Étudier) ; énoncé sans point final ; « u_{n+1} = u_n +98 » espace avant +98 ; 16 R6. | Étudier ; point final. | src/exercices/BP1/BP1AA08.ts |
| BP2AutoD2 | R3  | « La température moyenne est de $⟦13,8⟧$°C » : °C collé hors du dollar sans espace ; énoncé : « degré Celsius » (degrés) ; liste « $8$⍽; $11$⍽; » ; calcul vérifié (152/11≈13,8). | $13,8~\text{°C}$ ; degrés Celsius. | src/exercices/BP2/BP2AutoD2.ts |
| BP2AutoD3 | R10 Français | Série écrite « $29$$ ⍽; 18$$ ⍽; 11$$ … $ » : dollars doublés ($$ = mode display) entre les valeurs : 23 T5/T6, rendu avec blocs centrés possibles ; énoncé « La moyenne de la série ci-dessous est ... » points de suspension en texte (23 T6) ; calcul vérifié (234/13=18). | $29~;~18~;~11~;…$ en un dollar ; « est : ». | src/exercices/BP2/BP2AutoD3.ts |
| BP2AutoE4 | R3  | « 36,9 » proposition ; « \dfrac{37-5\times10^{-4}}{5\times10^3}=⍽? » : l'énoncé finit par « =⍽? » (point d'interrogation dans le dollar) ; valeur vérifiée (0,0073999=73,999×10^{-4}) ; réponse non en notation scientifique (73,999×10^{-4} n'est pas scientifique). | « Quelle est la valeur de … ? » ; $7,399\,9\times10^{-3}$. | src/exercices/BP2/BP2AutoE4.ts |
| BP2AutoF3 | R3  | Correction juste (9×10^6) ; mise en évidence du seul résultat ; 1 page > 390 px. | RAS. | src/exercices/BP2/BP2AutoF3.ts |
| BP2AutoF5 | R3  | « $ 450 \times 10^{16}$ » espaces à l'intérieur des dollars ; propositions « $450 \times 16 $ » ; écriture scientifique : « 4,5 × 10^{18} » correct. | Retirer les espaces. | src/exercices/BP2/BP2AutoF5.ts |
| BP2AutoH26 | R16  | Résultat « 14/10 » non simplifié (7/5) alors que la consigne est « Calculer » : la forme attendue n'est pas précisée ; correction en une ligne sans mise en évidence de la forme irréductible. | Demander « sous forme irréductible » ou accepter 7/5. | src/exercices/BP2/BP2AutoH26.ts |
| BP2AutoK2 | R3  | « $-5x=20$ ⍽⍽⍽⍽⍽⍽⍽⍽⍽⍽ » dix espaces insécables pour décaler (mise en page à l'espace) ; « La solution est : x= [champ] . » espace avant le point final. | Saut de ligne ; point collé. | src/exercices/BP2/BP2AutoK2.ts |
| BP2AutoP1 | R10 Français | « sur [$-4;$6] » : dollars mal placés (le crochet et le 6 sortent des maths : « [$-4;$6] ») dans l'énoncé et la correction ; « r(x){\color{black}\boldsymbol{~=~}}h(x) » égal mis en gras noir ; 180 N1, 100 doubles espaces. | $[-4~;~6]$ ; $r(x)=h(x)$. | src/exercices/BP2/BP2AutoP1.ts |
| BP2AutoQ1 | R3  | 400 T6 (« Choisir… » ou points de suspension) ; « $ 18~\text{mL} = $ » espaces dans le dollar. | Retirer les espaces. | src/exercices/BP2/BP2AutoQ1.ts |
| BP2AutoQ3 | R3  | Clone de 6M1autoC-1 : 1 050 T6 (« Choisir… ») ; 16 pages > 390 px (tableaux de conversion) ; « $ 9~\text{km} = $ » espaces dans le dollar. | Voir 6M1autoC. | src/exercices/BP2/BP2AutoQ3.ts |
| BP2CCF10 | R16  | Correction « $1\,170\div900=1,3=130~\%=100~\%+30~\%$ » : chaîne d'égalités fausse (1,3 = 130 % puis = 100 % + 30 %) : l'égalité n'est pas transitive (130 % ≠ 100 %+30 % comme valeur) ; « exprimer l'augmentation du prix en pourcentage » ; I4 (champ absent). | Séparer les étapes en lignes. | src/exercices/BP2/BP2CCF10.ts |
| BP2CCF11 | R3  | « $V_i$ » et « $V_f$ » (indices en italique : $V_{\text{i}}$) ; « L'évolution du prix est … » ; 10 doubles espaces ; calcul vérifié (251,6/740=0,34). | Indices droits. | src/exercices/BP2/BP2CCF11.ts |
| BP2CCF14 | R3  | Clone de 6N3Q-2 : « $50 ⍽⍽\%$ » deux insécables ; « le montant en euro ». | Voir 6N3Q-2. | src/exercices/BP2/BP2CCF14.ts |
| BP2CCF5 | R3  | Clone de 6N5-7/6N5-1 (prix) : « $29,82$⍽€ » ; 72 N1 ; 3 R10. | Voir 6N5-1. | src/exercices/BP2/BP2CCF5.ts |
| BP2FONC30 | R16  | Consigne « Soit f la fonction carré » (carrée) ; « Calculer l'image de 8 » : 8 hors du dollar ; correction non revue (absente de la sortie). | « la fonction carrée » ; $8$. | src/exercices/BP2/BP2FONC30.ts |
| BP2RES28 | R3  | Titre avec le LaTeX $\dfrac{x}{a}=\dfrac{b}{c}$ ; « $BU =$ » : lettres BU en italique collées ($B\times U$) pour une longueur : écrire $BU$ avec \text ou « BU » comme segment ; 23 N1 ; correction absente de la sortie. | Titre en texte ; correction. | src/exercices/BP2/BP2RES28.ts |
| HPC100 | R1 Titre | Consigne « Calculer le quotient Q(x) de la division de P(x) par D(x) » : Q(x), P(x), D(x) hors des $ ; énoncé « $P(x)=… $ par $D(x)=x+4$ » : « par » entre deux dollars ; pas de point final. | $Q(x)$ ; point final. | src/exercices/HP/HPC100.ts |
| HPC102 | R3  | « \mathcal{N}(0,1) » : virgule de séparation et virgule décimale confondues (N(0 ; 1)) ; « P(-1,45 &lt; X &lt; 2,96) » : « -1,45 » ; « Calculer à 10^{-2} près » sans $ cohérents ; 6 pages > 390 px (7 figures de courbe). | $\mathcal{N}(0~;~1)$. | src/exercices/HP/HPC102.ts |
| HPC103 | R16  | Mêmes énoncés que TEM1-11 (doublon) : A de taille 4×2 et B de 4×3 : AB et BA sont tous deux impossibles, cas à bien expliquer dans la correction ; 32 doubles espaces. | Mutualiser ; expliquer l'impossibilité. | src/exercices/HP/HPC103.ts |
| HPC104 | R16  | Consigne « Calcul du déterminant d'une matrice carrée » (nominale, sans verbe d'action) alors que l'énoncé dit « Calculer le déterminant » ; 3 pages > 390 px (développement de Sarrus). | « Calculer le déterminant d'une matrice carrée ». | src/exercices/HP/HPC104.ts |
| HPC105 | R3  | « f⍽: \begin{array}{rcl}…\end{array}. » : \[ … \] avec point final après le crochet ; « (x,y,z) » virgules sans espaces ; 3 pages > 390 px. | $(x~;~y~;~z)$. | src/exercices/HP/HPC105.ts |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| BP2CCF10 | I4 Question sans champ | 1 | champ absent de la page |
| EN-CompteBon | X1 Erreur | 1 | arrêt : délai de 10 min dépassé |
| PET12 | X2 Formule cassée | 34 | « $ » visible :  article, un élève va saisir dans la cellule D2 la formule =$B$2*C2 =$B$2*C2, puis étirer la cellule vers le bas jusqu’e |
| PET13 | X2 Formule cassée | 26 | « $ » visible : asseur 7 10 70 5 Dans la cellule D2, on a saisi la formule =$B$2*C2 =$B$2*C2, puis on a étiré la cellule vers le bas jus |
| PET14 | X2 Formule cassée | 14 | « $ » visible : 1. Il faut saisir dans la cellule C2 la formule =B2/B$5*100 =B2/B$5*100 puis étirer la cellule vers le bas. D’aut |
| PET15 | X2 Formule cassée | 182 | « $ » visible : 2. Dans la cellule C7 d’un tableur, on a saisi la formule =B$1+C$6 =B$1+C$6. Cette cellule est ensuite copiée dans la ce |
| PET16 | X2 Formule cassée | 57 | « $ » visible : a cellule B5 du tableur ci-dessous, on a saisi la formule =A$6*$C4 =A$6*$C4. Cette cellule est ensuite copiée dans la ce |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : N1 Nombre hors $ 3239 ; T3  2370 ; T4  1656 ; T5 Espaces 194 ; R5 Virgule 154 ; T6 Points de suspension 143 ; R2 Tutoiement, impératif 110 ; N2 Séparateur des milliers 91 ; N6 Écriture algébrique 88 ; T2  23 ; R6  13 ; R10 Français 7 ; T1 Espace avant % 7.
