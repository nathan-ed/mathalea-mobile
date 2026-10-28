# Revue des exercices : Autres

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **108 sur 268**. Constats confirmés : **109**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Contenu mathématique faux | 4 |
| Rendu cassé (formule, débordement, erreur) | 6 |
| Mise en évidence (miseEnEvidence et champs) | 14 |
| Typographie (nombres, espaces, notations) | 8 |
| Rédaction (français, titres, consignes) | 77 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP1AUTO085 | C1 Contenu mathématique faux | Propositions : « x(x+10)+25 » n'est pas une factorisation (c'est une somme) mais la correction le rappelle en remarque ; QCM « Une factorisation de … est » (la factorisation) ; bonne réponse non mise en évidence (1 M3). | Retirer la proposition ou la justifier ; « La factorisation ». | src/exercices/BP1/BP1AUTO085.ts |
| BP1FDEV02 | C1 Contenu mathématique faux | Titre « Dériver une fonction du type $\lambda u$ » alors que l'exercice dérive un polynôme (5x³+7x²-x+6) : titre sans rapport avec le contenu ; « dérivable pour tout $x\in\R$ » ; aucune explication dans la correction (« f'(x)=15x²+14x-1 » seul). | Titre « Dériver une fonction polynôme » ; ajouter les étapes. | src/exercices/BP1/BP1FDEV02.ts |
| BP2FONC31 | C1 Contenu mathématique faux | Titre « Résoudre algébriquement une équation f(x)=k avec la fonction carrée » mais l'équation proposée est 1/x=13 (fonction inverse) ; 50 insécables pour centrer l'équation (mise en page à l'espace) ; $\mathbb{R}^*$ ; M1 (3). | Titre « … fonction inverse » ; saut de ligne. | src/exercices/BP2/BP2FONC31.ts |
| BP2FONC32 | C1 Contenu mathématique faux | Titre « …inéquation avec la fonction carrée » mais l'inéquation est \|x\|⩽4 (fonction valeur absolue) ; correction en liste « • On trace … • On trace … » ; 12 M1 : intervalle mis en évidence refusé ; X4. | Titre « fonction valeur absolue ». | src/exercices/BP2/BP2FONC32.ts |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP1AUTO087 | X4  | 6 X4 (énoncé de série vide) ; « $x^2-9$ $=$ » deux dollars ; correction absente de la sortie. | Énoncé ; correction (a²-b²)=(a-b)(a+b). | src/exercices/BP1/BP1AUTO087.ts |
| BP2AutoK1 | X4  | Solveur interactif (138 IM, 138 X4) : énoncé de série vide, à tester à la main. | Tester à la main. | src/exercices/BP2/BP2AutoK1.ts |
| PET12 | X2 Formule cassée | Références absolues de tableur « =$B$2*C2 » écrites sans protection dans le texte : les « $ » sont pris pour des délimiteurs de maths, la formule s'affiche en double (« =$B$2*C2 =$B$2*C2 ») et le reste de la phrase est mal découpé (34 X2) ; 57 pages > 390 px (tableur) ; « ⟦fausse⟧ » mot en évidence (texte). | Échapper les $ (\$) ou écrire la formule en \texttt ; tableur défilant. | src/exercices/PE/PET12.ts |
| PET13 | X2 Formule cassée | Même défaut (26 X2 : « $B$2 »), 94 pages > 390 px ; « B2×C2/100 » ; « retire C2 % de B2 » : « 2 % » sans insécable (2 T1) ; 64 IM (tableur) à tester à la main. | Idem PET12. | src/exercices/PE/PET13.ts |
| PET14 | X2 Formule cassée | Même défaut que PET12/13 (14 X2 : « $B$2 » pris pour des délimiteurs) ; 64 IM ; 94 pages > 390 px ; « D'autres écritures sont possibles, par exemple $\text{=B2+B3+B4+B5+B6}$ » (\text pour une formule). | Idem PET12. | src/exercices/PE/PET14.ts |
| PET15 | X2 Formule cassée | Même défaut (182 X2 : les « $ » des références absolues cassent le rendu) ; 138 M1 : mise en évidence de la formule refusée par le champ texte ; 212 phrases sans virgule ; « Cette cellule est ensuite copiée » : « Cette formule ». | Échapper les $ ; formule en texteEnCouleurEtGras. | src/exercices/PE/PET15.ts |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP1AUTO070 | M3  | QCM : correction juste, bonne proposition non mise en évidence comme proposition ; « (x+4)^2 = x^2+2×4×x+4^2 » ordre 2×4×x. | Proposition en évidence. | src/exercices/BP1/BP1AUTO070.ts |
| BP1AUTO091 | M1 Évidence refusée par le champ | Cube de 15 dm : unité cubique en \textbf{ dm}^3 dans la mise en évidence (texte) refusée par le champ (42 M1) ; $\mathcal{V}= c^3$ ; 3 375 correct. | Unité en \text{} saisissable. | src/exercices/BP1/BP1AUTO091.ts |
| BP1AUTO094 | M1 Évidence refusée par le champ | Pavé droit : « de profondeur, de longueur et de hauteur » (3, 9, 9 cm) ; « $\mathcal{V}= l \times L \times h$ » : l et L pour deux dimensions (largeur/profondeur) incohérent avec « profondeur » ; 42 M1. | Nommer \ell, L, h comme l'énoncé. | src/exercices/BP1/BP1AUTO094.ts |
| BP1AUTO095 | M1 Évidence refusée par le champ | Même défaut (58 M1, unité exigée) ; 25 pages > 390 px. | Idem. | src/exercices/BP1/BP1AUTO095.ts |
| BP1AUTO096 | M1 Évidence refusée par le champ | Même défaut que BP1AUTO091 (unité cubique en évidence, 42 M1) ; calcul vérifié (16³=4 096). | Idem. | src/exercices/BP1/BP1AUTO096.ts |
| BP1AUTO097 | M1 Évidence refusée par le champ | Même défaut (106 M1, 42 X5). | Idem. | src/exercices/BP1/BP1AUTO097.ts |
| BP2AutoI17 | M1 Évidence refusée par le champ | Factorisation : la correction met en évidence trois fois le facteur commun « (2x+4) » mais pas le résultat final « (5-x)(2x+4) » (100 M1 : (2x+4) saisi refusé, attendu (-x+5)(2x+4)) ; le résultat n'est pas complètement factorisé (2x+4=2(x+2)) ; (5-x) en couleur bleue dans le texte. | Mettre en évidence le produit final ; préciser « factoriser par (2x+4) ». | src/exercices/BP2/BP2AutoI17.ts |
| BP2AutoV3 | M1 Évidence refusée par le champ | Clone de 6M2C : unité d'aire exigée mais absente de la mise en évidence (24 M1). | Unité dans l'évidence. | src/exercices/BP2/BP2AutoV3.ts |
| BP2AutoV4 | M1 Évidence refusée par le champ | Clone de 6M2C-1 : unité exigée mais absente de l'évidence (58 M1) ; énoncé de série vide (24 X4). | Unité dans l'évidence ; consigne. | src/exercices/BP2/BP2AutoV4.ts |
| BP2FONC28 | M3  | QCM croissante/décroissante : la bonne réponse n'est pas mise en évidence comme proposition (18 M3) ; « $a=7~$ et $b=-6$ » espace dans le dollar. | Proposition en évidence. | src/exercices/BP2/BP2FONC28.ts |
| EgaliteFG3-4e-8 | M3  | QCM Vrai/Faux : calcul de réciproque de Pythagore juste (60²+80²=100²) mais « L'affirmation est ⟦vraie⟧ » : mot seul en évidence (8 M3) ; 9 T3, 8 T4. | « Vrai » en évidence ; insécables. | src/exercices/EgaliteFG/EgaliteFG3-4e-8.ts |
| EgaliteFG3-4e-9 | M3  | Calcul juste (72²+96²=120²) ; « le plus grand côté est [BC] » ; M3 (8) ; 12 guillemets T4. | Idem. | src/exercices/EgaliteFG/EgaliteFG3-4e-9.ts |
| PEA12 | M1 Évidence refusée par le champ | Décomposition de 810 et 198 : un seul champ avec deux trous : la mise en évidence ne donne pas chaque produit séparément (2 M1) ; correction avec \qquad\qquad entre deux tableaux de division (large sur téléphone). | Une évidence par trou. | src/exercices/PE/PEA12.ts |
| PET16 | M1 Évidence refusée par le champ | Signe dollar de l'énoncé échappé correctement (« $\$$ ») mais 57 X2 dans la correction ; « les références qui ne sont pas bloquées par le signe dollar $\$$ » ; 11 M1. | Corriger l'échappement de la correction. | src/exercices/PE/PET16.ts |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| BP1AA05 | T5 Espaces | 1 double espace ; correction juste (t_n=-6-n) ; « pour tout n » ok. | RAS. | src/exercices/BP1/BP1AA05.ts |
| BP1GEO01 | T3  | Consigne « Déterminer la valeur exacte de : » (deux-points sans insécable et sans complément) ; « $\cos(\pi/3)$ = [champ] » égal hors du dollar ; correction absente. | « Déterminer la valeur exacte de » + question ; correction (cercle trigo). | src/exercices/BP1/BP1GEO01.ts |
| BP1GEO06 | T3  | Consigne « De quels solides simples sont composés les solides suivants ? » : « sont composés » (« est composé ») ; 1 T3. | Accord. | src/exercices/BP1/BP1GEO06.ts |
| BP1SP02 | T4  | 112 T4 : guillemets sans insécables ; « P(F∩\overline{C}) » avec « Nombre de femmes employées » en \text dans une fraction ; effectifs vérifiés plausibles (15+37=52). | Insécables ; formule. | src/exercices/BP1/BP1SP02.ts |
| EN-EtoileCalculs | T4  | Exercice « étoile de calculs » interactif (130 IM, 130 X4) à tester à la main ; 1 840 guillemets/T4 (consigne) ; consigne « Compléter les pointillés de manière à obtenir le résultat figurant au milieu de l'étoile. Tous les nombres à trouver sont des entiers. » correcte. | Tester à la main. | src/exercices/EN/EN-EtoileCalculs.ts |
| PEG23 | N6 Écriture algébrique | 226 N6 et 226 M6 : correction sans figure ; « OI = 1u » ($1\,u$) ; « de même origine [OB) » phrase ; construction du produit par Thalès non nommé. | Figure ; $1u$ → $1\,u$. | src/exercices/PE/PEG23.ts |
| PEG24 | N6 Écriture algébrique | Même défaut (226 N6, 226 M6) ; « [BA] » au lieu de [IA] : la droite à construire est parallèle à (BA) passant par I (à vérifier). | Vérifier la droite parallèle. | src/exercices/PE/PEG24.ts |
| PEN22 | T3  | Consigne « Poser et effectuer les calculs suivants : » (deux-points final sans insécable) ; 289 N1, 161 N2, 80 N6 (nombres sans séparateur) ; correction absente de la sortie (opérations posées). | Ajouter la correction. | src/exercices/PE/PEN22.ts |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| transversal | R10 Français | « pour passer des $\text{m}$ au $\text{cm}$ » (aux) dans 26 corrections : can6M4-03 (8 fois), can6M4-05 (4), can6M3-01, can6a-2021 (790, 806), can6a-2025-Q29, canc3a-2025-Q29, canc3a-CM1-2025-Q29, can3a-2026-Q4 (3), can5a-2024-Q9 (3), can3a-2022 (300, 317), can5a-2022 (346, 360), can4a-2022 (318, 330). | pour passer des $\text{m}$ aux $\text{cm}$ | grep « passer des $\\text{…}$ au $ » dans src/exercices |
| BP1AA02 | R3  | Correction : couleurs violet/purple différentes pour un même terme (« {\color{violet}…} », « {\color{purple}…} ») : code couleur non expliqué ; « w_{n+1} = w_n -4 » espace avant -4 ; calcul juste. | Une seule couleur par terme ; espace. | src/exercices/BP1/BP1AA02.ts |
| BP1AA03 | R3  | « suite arithmétique de raison $r=8$ et de premier terme $u_1=-5$ » puis « $u_n=-13+8n$ » correct (u_15=107) ; $n\in\mathbb{N}^*$ sans espace ; correction recopie l'énoncé. | Supprimer la répétition de l'énoncé. | src/exercices/BP1/BP1AA03.ts |
| BP1AA04 | R3  | « on obtient donc la raison de la suite en effectuant la différence de deux termes consécutifs » ok ; pas de problème notable ; correction juste (-8). | RAS. | src/exercices/BP1/BP1AA04.ts |
| BP1AA07 | R2 Tutoiement, impératif | « ⟦décroissante.⟧ » mot et point final dans la mise en évidence (texte) ; QCM : proposition non mise en évidence (12 M3) ; « de raison $-6$ et de premier terme $t_0$ » ; 12 phrases sans virgule (« Or $r&lt;0$, donc »). | texteEnCouleurEtGras('décroissante') ; point hors évidence. | src/exercices/BP1/BP1AA07.ts |
| BP1AA08 | R13  | « Etudier le sens de variation » sans accent (Étudier) ; énoncé sans point final ; « u_{n+1} = u_n +98 » espace avant +98 ; 16 R6. | Étudier ; point final. | src/exercices/BP1/BP1AA08.ts |
| BP1AUTO050 | R16  | Titre « Résoudre une inéquation $ax+b>0$ » alors que l'énoncé propose $3x+6\leqslant0$ (⩽) ; « L'ensemble de solutions est : » (des solutions) ; 5 T3. | Titre « ax+b ⩽ 0 » ; « des solutions ». | src/exercices/BP1/BP1AUTO050.ts |
| BP1AUTO055 | R2 Tutoiement, impératif | « ⟦3x.⟧ » : point final dans la mise en évidence (le champ attend 3x) ; « le coefficient $a$ tel que de $f(x)=ax$ vérifie » (phrase cassée : « tel que $f(x)=ax$ vérifie ») ; $f(x)=$ $⟦…⟧$ deux dollars. | Point hors évidence ; reformuler. | src/exercices/BP1/BP1AUTO055.ts |
| BP1AUTO056 | R1 Titre | « avance de 1 unité d'abscisses » (1 hors des $, « d'abscisse ») ; « $g⍽: x \mapsto $$ax$ » : deux dollars collés ; 118 N1 ; 20 figures. | $1$ ; $g : x\mapsto ax$. | src/exercices/BP1/BP1AUTO056.ts |
| BP1AUTO061 | R3  | « définie sur ℝ par : $v(x)=2x^2+3x+1$ On note » : phrase non séparée (« … +1 On note ») ; 36 doubles espaces ; 10 pages > 390 px (fractions) ; $\mathscr{C}$ vs $\mathcal{C}$ selon exos. | Point final ; \mathcal{C}. | src/exercices/BP1/BP1AUTO061.ts |
| BP1AUTO071 | R3  | Correction : « Le terme en x vient de la somme de x×4 et de -2×x » : -2 \times x (signe moins) ; bonne proposition non mise en évidence (QCM) ; calcul juste. | RAS ; proposition en évidence. | src/exercices/BP1/BP1AUTO071.ts |
| BP1AUTO072 | R3  | « A=(-x-8)\times(-7) » : x(-7)... ; correction juste ; produit « -7\times(-x) » ordre ; QCM sans mise en évidence. | Proposition en évidence. | src/exercices/BP1/BP1AUTO072.ts |
| BP1CF01 | R3  | Correction « soit $⟦1,4⟧$ » correct ; QCM : 4 propositions dont « 1,04 » ; 8 R10 ; 23 doubles espaces ; « Autre formulation » en texte brut. | RAS. | src/exercices/BP1/BP1CF01.ts |
| BP1CF02 | R3  | « $⟦+ 40⍽ \%⟧$ » : signe + suivi d'une espace et insécable dans l'évidence ; 69 doubles espaces ; propositions « +1,04\,\% » etc. avec \, correct. | « +40\,\% ». | src/exercices/BP1/BP1CF02.ts |
| BP1F2D06 | R10 Français | « $\mathscr{f}$ » : la lettre f n'a pas de forme calligraphique (rendu dégradé) ; « Séparer les racines par un point-virgule » : champ à saisir en texte, forme (1;3) non précisée ; 17 M1. | $f$ ; préciser « sans espace ». | src/exercices/BP1/BP1F2D06.ts |
| BP1FDEV04 | R16  | Consigne « on admet que la fonction est définie et dérivable sur un intervalle $I$ » : « une expression de la fonction dérivée sur I » ; correction absente de la sortie ; $\dfrac{1}{x}$ : domaine ℝ* à préciser. | Ajouter la correction ; préciser le domaine. | src/exercices/BP1/BP1FDEV04.ts |
| BP1GEO07 | R16  | Titre « Reconnaitre des solides » (Reconnaître) ; le champ texte pour nommer le solide est configuré avec le clavier « numbers fullOperations variables » (aucune lettre) alors que la réponse est un nom de solide (« cube », « pyramide »). | Reconnaître ; clavier texte (ou liste de choix). | src/exercices/BP1/BP1GEO07.ts |
| BP1SP05 | R13  | Titre « évènement » et énoncé « événement » : deux orthographes dans le même exercice ; QCM : bonne réponse non mise en évidence comme proposition ; correction juste. | « événement » partout. | src/exercices/BP1/BP1SP05.ts |
| BP1SP07 | R3  | « $4\,\%$ de $1\,200 = 0,04\times1\,200 = ⟦48⟧$ » : « de » dans un dollar avec égalités chaînées (« 4 % de 1 200 = 0,04 × 1 200 ») ; calcul juste ; QCM sans mise en évidence. | Séparer : 4 % de 1 200, c'est 0,04×1 200. | src/exercices/BP1/BP1SP07.ts |
| BP1SP08 | R2 Tutoiement, impératif | « ⟦N⟧&⟦=250⟧ » : N et « =250 » en deux évidences séparées ; $N=2,48$ distracteur ; correction juste. | Une évidence : $N=250$. | src/exercices/BP1/BP1SP08.ts |
| BP1SP09 | R3  | « $N=25\times60$ élèves » : unité hors du dollar ; « alors N est 25 fois plus grand que 60 » ; calcul juste (1 500). | $25\times60=1\,500$ élèves. | src/exercices/BP1/BP1SP09.ts |
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
| EgaliteFG1-6e-1 | R16  | Consigne : lien externe « nuage03.apps.education.fr … Sur le chemin de l'égalité en mathématiques » dans l'énoncé (inaccessible hors ligne, même défaut que 6I1B-2) ; « Donne ta réponse » (tutoiement) alors que le reste est à l'infinitif ; « $17\text{h}00$ » ; 27 R2. | Retirer le lien ; formule neutre. | src/exercices/EgaliteFG/EgaliteFG1-6e-1.ts |
| EgaliteFG1-6e-2 | R16  | Série « Égalité filles-garçons » : consigne « D'après &lt;a href=nuage03.apps.education.fr…> » avec lien externe cliquable (inaccessible hors ligne ; règle de confidentialité) ; tutoiement (« Complète le tableau ») ; mises en forme : « député(e)s » (écriture inclusive à crochet), guillemets sans insécables (T4), énoncés/figures > 390 px. | Retirer le lien (ou le remplacer par une référence en texte) ; consigne à l'infinitif. | src/exercices/EgaliteFG/EgaliteFG1-6e-2.ts |
| EgaliteFG1-6e-3 | R16  | Série « Égalité filles-garçons » : consigne « D'après &lt;a href=nuage03.apps.education.fr…> » avec lien externe cliquable (inaccessible hors ligne ; règle de confidentialité) ; tutoiement (« Complète le tableau ») ; mises en forme : « député(e)s » (écriture inclusive à crochet), guillemets sans insécables (T4), énoncés/figures > 390 px. | Retirer le lien (ou le remplacer par une référence en texte) ; consigne à l'infinitif. | src/exercices/EgaliteFG/EgaliteFG1-6e-3.ts |
| EgaliteFG1-6e-4 | R16  | Série « Égalité filles-garçons » : consigne « D'après &lt;a href=nuage03.apps.education.fr…> » avec lien externe cliquable (inaccessible hors ligne ; règle de confidentialité) ; tutoiement (« Complète le tableau ») ; mises en forme : « député(e)s » (écriture inclusive à crochet), guillemets sans insécables (T4), énoncés/figures > 390 px. | Retirer le lien (ou le remplacer par une référence en texte) ; consigne à l'infinitif. | src/exercices/EgaliteFG/EgaliteFG1-6e-4.ts |
| EgaliteFG1-6e-5 | R16  | Série « Égalité filles-garçons » : consigne « D'après &lt;a href=nuage03.apps.education.fr…> » avec lien externe cliquable (inaccessible hors ligne ; règle de confidentialité) ; tutoiement (« Complète le tableau ») ; mises en forme : « député(e)s » (écriture inclusive à crochet), guillemets sans insécables (T4), énoncés/figures > 390 px. | Retirer le lien (ou le remplacer par une référence en texte) ; consigne à l'infinitif. | src/exercices/EgaliteFG/EgaliteFG1-6e-5.ts |
| EgaliteFG2-5e-6 | R16  | Série Égalité F-G : consignes au tutoiement (« Commence par compter parmi tes enseignants ») ; exercice à réponse personnelle dont la correction dit « Réponse personnelle, qui dépend de la composition réelle de ta classe » (aucune réponse type attendue : à ne pas compter dans le score) ; « Partie 1 - À égalité dans notre formation ? » tiret + titre ; 18 R2. | Impératif/infinitif ; marquer l'exercice « sans score ». | src/exercices/EgaliteFG/EgaliteFG2-5e-6.ts |
| EgaliteFG2-5e-7 | R5 Virgule | Probabilité « 10/33 ≈ 0,303 » correcte ; 20 phrases sans virgule ; tutoiement possible ; 16 N1. | Virgules. | src/exercices/EgaliteFG/EgaliteFG2-5e-7.ts |
| EgaliteFG3-4e-10 | R3  | Correction : « $\widehat{TPK}=\widehat{TF_1F}=90°$ » le signe ° en texte dans un dollar (au lieu de ^\circ) ; « (arrondie au centième) » ; tutoiement. | ^\circ. | src/exercices/EgaliteFG/EgaliteFG3-4e-10.ts |
| EgaliteFG3-4e-11 | R16  | Consigne au tutoiement et en deux niveaux numérotés (« 1. … 2. Construis, à la perpendiculaire, les trois médiatrices (rappel : …) ») : « à la perpendiculaire » ; {red:rouge} en couleur écrite en dur ; apigeom à tester à la main (6 IM). | Reformuler ; tester à la main. | src/exercices/EgaliteFG/EgaliteFG3-4e-11.ts |
| EgaliteFG4-3e-12 | R16  | « Explore ta mémoire et cite cinq autres grandeurs » (tutoiement) ; liste « …, la concentration... » points de suspension en texte ; 53 R2 (texte dans l'évidence) ; exercice en trois parties, correction ouverte. | Reformuler ; \ldots. | src/exercices/EgaliteFG/EgaliteFG4-3e-12.ts |
| EgaliteFG4-3e-13 | R16  | « Exprime en fonction de x la longueur AB » (tutoiement) ; correction « $AB=AE+EB=(x+4)+(x-3)=⟦2x+1⟧$ » correcte ; 44 R2. | Impératif/infinitif. | src/exercices/EgaliteFG/EgaliteFG4-3e-13.ts |
| EN-Gratte-ciel | R16  | Consigne : « Les immeubles d'une même rangée, ligne ou colonne, sont tous de tailles différentes » ; « 10, 20 ou 30 étages » nombres hors des $ ; tableau hybride à tester à la main (19 IM, 42 pages > 390 px). | $10$, $20$ ; tester à la main. | src/exercices/EN/EN-Gratte-ciel.ts |
| EN-Grimuku | R1 Titre | Consigne : « de 1 à 9 » nombres hors des $ (KillerSudoku les met en $1$ à $6$) ; jeu interactif à tester à la main (58 IM, 58 X4 énoncé de série vide). | $1$ à $9$ ; tester à la main. | src/exercices/EN/EN-Grimuku.ts |
| EN-Juniper-Green | R16  | Consigne : « Cliquer sur « Vérifier les réponses » arrête la partie en cours et affiche le score » : ce bouton est celui du site (l'app n'a pas de bouton « Vérifier les réponses » : « Valider » ou équivalent) ; guillemets français ok ; « à tour de rôle » : le jeu se joue seul ? (2 IM). | Nom du bouton de l'app ; préciser le joueur. | src/exercices/EN/EN-Juniper-Green.ts |
| EN-KenKen | R1 Titre | « les nombres de 1 à 4 » hors des $ ; « ici la soustraction, la multiplication et la division » (liste liée à l'instance : si les opérations changent, la consigne devient fausse) ; à tester à la main. | $1$ à $4$ ; consigne dynamique. | src/exercices/EN/EN-KenKen.ts |
| EN-KillerSudoku | R3  | Consigne : mélange de « $1$ à $6$ » et de « blocs de $2\times3$ cases » (bon) mais « Aucun nombre n'est donné : une cage d'une seule case donne directement son nombre » : lourd ; à tester à la main. | Alléger. | src/exercices/EN/EN-KillerSudoku.ts |
| EN-Monnaie | R16  | Consigne trop courte : « Cette grille contient une pièce de monnaie dans chaque case. La somme … » sans verbe d'action (que faut-il faire ? retrouver les pièces) ; à tester à la main. | Ajouter « Retrouver la pièce de chaque case ». | src/exercices/EN/EN-Monnaie.ts |
| EN-Pyramide | R16  | « se trouvant dans les deux cases juste en dessous » ; opération « effectuée avec » ; à tester à la main. | « situés dans les deux cases juste en dessous ». | src/exercices/EN/EN-Pyramide.ts |
| EN-Shikaku | R16  | Consigne en un bloc de 4 phrases ; « Pour être certain que rien ne se chevauche, les rectangles et carrés doivent tous avoir strictement la même couleur de fond » : indication peu claire (couleur du fond ?) ; « Le nombre indique le nombre de cases » (le nombre indique la taille). | Reformuler ; liste. | src/exercices/EN/EN-Shikaku.ts |
| EN-SquarO | R16  | Consigne au vouvoiement (« Si vous le souhaitez, vous pouvez placer… ») alors que toutes les autres consignes de l'app sont à l'infinitif/impératif ; « parmi les 4 sommets » : 4 hors des $. | « Il est possible de placer… » ; $4$. | src/exercices/EN/EN-SquarO.ts |
| EN-TablesEffacees | R3  | Consigne : « Tous les nombres sont des entiers strictement positifs, et un même nombre ne peut pas apparaître deux fois sur une même ligne ou une même colonne » : contrainte surprenante pour une table de multiplication (4×… ) à vérifier ; à tester à la main. | Vérifier la contrainte. | src/exercices/EN/EN-TablesEffacees.ts |
| EN-Zeros | R16  | Titre « zeros » (zéros) ; consigne : « auquels » (auxquels) et « de 1 à 3 » hors des $ ; 120 pages > 390 px (tableau de 4 colonnes) ; 82 M6. | zéros ; auxquels ; $1$ à $3$. | src/exercices/EN/EN-Zeros.ts |
| HPC100 | R1 Titre | Consigne « Calculer le quotient Q(x) de la division de P(x) par D(x) » : Q(x), P(x), D(x) hors des $ ; énoncé « $P(x)=… $ par $D(x)=x+4$ » : « par » entre deux dollars ; pas de point final. | $Q(x)$ ; point final. | src/exercices/HP/HPC100.ts |
| HPC102 | R3  | « \mathcal{N}(0,1) » : virgule de séparation et virgule décimale confondues (N(0 ; 1)) ; « P(-1,45 &lt; X &lt; 2,96) » : « -1,45 » ; « Calculer à 10^{-2} près » sans $ cohérents ; 6 pages > 390 px (7 figures de courbe). | $\mathcal{N}(0~;~1)$. | src/exercices/HP/HPC102.ts |
| HPC103 | R16  | Mêmes énoncés que TEM1-11 (doublon) : A de taille 4×2 et B de 4×3 : AB et BA sont tous deux impossibles, cas à bien expliquer dans la correction ; 32 doubles espaces. | Mutualiser ; expliquer l'impossibilité. | src/exercices/HP/HPC103.ts |
| HPC104 | R16  | Consigne « Calcul du déterminant d'une matrice carrée » (nominale, sans verbe d'action) alors que l'énoncé dit « Calculer le déterminant » ; 3 pages > 390 px (développement de Sarrus). | « Calculer le déterminant d'une matrice carrée ». | src/exercices/HP/HPC104.ts |
| HPC105 | R3  | « f⍽: \begin{array}{rcl}…\end{array}. » : \[ … \] avec point final après le crochet ; « (x,y,z) » virgules sans espaces ; 3 pages > 390 px. | $(x~;~y~;~z)$. | src/exercices/HP/HPC105.ts |
| PEA11 | R16  | Titre « Décomposer un nombre en produit de facteurs premiers et déterminer ses diviseurs » : seule la décomposition est demandée (150) ; correction juste ; 2 M1. | Titre fidèle ou ajouter la question des diviseurs. | src/exercices/PE/PEA11.ts |
| PEA13 | R2 Tutoiement, impératif | 13 R2 (texte dans la mise en évidence), 6 M1 ; énoncé : « chacun d'eux (et elle-même) » ; « Nombres d'amis possibles, » champ texte ; 8 phrases sans virgule. | texteEnCouleurEtGras ; reformuler. | src/exercices/PE/PEA13.ts |
| PEG20 | R3  | « sur $[AB ]$ » espace dans le crochet ; « nommés $A_1$, $A_2$... » points de suspension en texte collés ; « 5 points » hors des $ ; correction sans figure (2 M6) ; « Tracer un segment [AB] puis placer » ; « (car le dénominateur de la fraction est 5) ». | $[AB]$ ; \ldots ; $5$. | src/exercices/PE/PEG20.ts |
| PEG21 | R3  | « $\sqrt{15}u$ » ($\sqrt{15}\,u$) ; « 3 points A, H et B » nombres et noms hors des $ ; « AH = 3u » avec u l'unité ; 2 M6 (correction sans figure). | $\sqrt{15}\,u$ ; $3$ points. | src/exercices/PE/PEG21.ts |
| PEG22 | R3  | « $\sqrt{35}u$ » ; « On remarque que $35=5^2+3^2+1$ » : 35 = 25+9+1 (deux étapes de Pythagore) non expliqué ; « 2 points M et N » hors des $ ; 4 M6 (correction sans figure). | $\sqrt{35}\,u$ ; expliquer les deux triangles. | src/exercices/PE/PEG22.ts |
| PEN11 | R3  | Correction : « Ce nombre peut s'écrire sous la forme d'une fraction irréductible » ; 5 doubles espaces ; décomposition vérifiée (11 200 = 2⁶×5²×7). | RAS. | src/exercices/PE/PEN11.ts |
| PEN14 | R16  | Correction constituée de figures (division posée en SVG) sans texte lisible dans la sortie : à regarder à la main ; « la $2026^{\mathrm{e}}$ décimale » ; 23 phrases sans virgule, 23 T6. | Ajouter un texte (période 6 : 2026 = 6×337+4). | src/exercices/PE/PEN14.ts |
| PEN15 | R16  | Énoncé « Le nombre A est-il … ? » : A n'est pas défini dans le texte affiché (« A » défini plus loin / dans la figure) ; « Justifier chacune des réponses » sans point final ; correction « 5 n'est pas divisible par 13 » : 5 hors des $ ; 11 N1. | Définir A ; $5$. | src/exercices/PE/PEN15.ts |
| PEN16 | R3  | « $1,\overline{9}$ » : trait de période (\overline) ok mais 105 N6 ; énoncé sans correction visible dans la sortie ; consigne « La calculatrice est autorisée. » après la consigne (même ligne). | Ajouter la correction (1,\overline{9}=2). | src/exercices/PE/PEN16.ts |
| PEN21-1 | R16  | Énoncé : « Les nombre (BB)_{12} et (95AA)_{12} » (nombres) ; calculs vérifiés (143 ; 16 402) ; « 11×12+11 » : B=11 non rappelé ; 57 N1. | « Les nombres » ; rappeler A=10, B=11. | src/exercices/PE/PEN21-1.ts |
| PEN21 | R3  | « $(22)_3$ » : base en indice avec parenthèses ; calculs vérifiés (8 ; 53) ; 74 N1 / 18 N2. | RAS. | src/exercices/PE/PEN21.ts |
| PEN23 | R16  | Consigne « Poser et effectuer les calculs suivants : » alors que l'exercice demande « Écrire la table de Pythagore en base 5 » (consigne sans rapport) ; 885 N1 ; 13 M6. | Consigne adaptée. | src/exercices/PE/PEN23.ts |
| PET11 | R3  | « la formule $\text{=A1*C3-C2}$ » : formule dans un dollar avec \text ; « La cellule D1 affiche ⟦12⟧ » nombre hors des $ ; correction juste (3×7-9=12) ; 58 N1. | \texttt{=A1*C3-C2} ; $12$. | src/exercices/PE/PET11.ts |

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
