# Corrections à faire dans MathALÉA

Extrait du registre d'audit `docs/audit-mathalea.md` : uniquement ce qui
concerne MathALÉA (moteur, éléments interactifs et exercices). Les
correctifs de l'app mobile, les points à décider pour l'app, la liste de
ce qui a été vérifié sans défaut et les outils de test restent dans le
registre.

Conventions : moteur de `static/moteur` (commit de `moteur/COMMIT`), graine
`audit-jf` sauf mention contraire, numéro d'exercice 3 (champs
`champTexteEx3Q<i>`). « Q n » : n-ième question (rang `n - 1` de
`autoCorrection`). Chaque constat donne l'exercice (id, uuid), la graine,
le réglage, la question, ce qui a été saisi, le résultat et, quand elle est
connue, la cause avec un correctif proposé.

Méthode (23 et 24 octobre 2026) : les 3 628 exercices interactifs (FR et
CH), chaque élément rempli en entier avec la bonne réponse (doit être
acceptée) puis une réponse fausse (doit être refusée), avec trois graines
puis avec chaque valeur de chaque réglage (6 624 variantes) ; éléments à
vérification propre (figures, grilles, labyrinthes, traceur, Scratch…)
testés un par un, par de vrais clics ou touchers quand c'était possible,
au téléphone à 390 px pour plusieurs d'entre eux.

## Synthèse

À corriger en priorité : un élève qui répond juste est compté faux, ou la
question est impossible à réussir.
- Traceur de courbe (3F10-7, 4F11, d4c81) : une saisie sur deux est perdue
  dans le tableau de valeurs (2.0).
- Arrondis : hauteur exacte refusée dans 5G5E-2, même fonction dans 5G5G-1
  (pente arrondie à 2 décimales) ; barres fractionnaires 6AutoF3-3, 7/9
  refusé (2.0).
- 3G95-17, 3G95-17p : fraction à un chiffre (`\frac72`) refusée (2.0).
- Signe moins en tête refusé (`noTrivialFactor`) : 10FA4C-8, 10FA4C-9
  (« −stz » impossible), 10FA4F-10, 10FA4E-4 (2.0).
- QCM sans case (JSON mal échappé) : can1E1-01 et 1AN30-2 avec `sup3` ;
  QCM sans bonne réponse : 6G6C-1 `sup=2` ; QCM `format=lettre` sans
  case : EgaliteFG4-3e-19 (2.0).
- Questions sans champ mais notées : 1AN14-6 `sup2` (2.0).
- Clé fausse ou en désaccord avec la correction : a17d6, CH 3a384, 4P16,
  canc3a Q27, can6a-2021 Q18, 3L15-2, CH 39232, EgaliteFG1-6e-5,
  2mTrigoFct-5 et -7, 6G7B-10, 2F21-9 (2.0).
- Automatismes : `question-index` non renuméroté, questions impossibles
  (tableau-hybride, alea-iep-editeur, solveur, multi-lignes) (3).
- 6I1B-4 « Division » seule : la préparation plante selon la graine
  (3 quater).

Réponses fausses acceptées (section 1) : unités à ±1 par défaut
(`unitsCompare`, une trentaine d'exercices), intervalles ouverts, fonctions
et indices, exposants de Pythagore (4G20-1), tableur SOMME et MOYENNE,
réponses entre `$…$`, n'importe quelle réponse (CH 90fd5), QCM incohérents,
ensembles, calculatrice à touches cassées contournable au clavier, écriture
décimale non contrôlée (6N3F-2).

Moteur embarquable (section 3) : chargement différé des Automatismes,
identifiants non renumérotés, ressources absentes, requêtes Internet
(labyrinthes, MathGraph32, vidéos), MathLive sans polices ni sons,
exercices non déterministes, entrées d'`autoCorrection` orphelines.

Autres : textes (3 bis : « undefined », coquilles, doublon de liste),
226 exercices donnant moins de questions que demandé (3 ter), réglages
qui réduisent ou cassent l'exercice (3 quater), affichage à 390 px (4).

Remarques secondaires, sans effet sur la note ou latentes : section 5.

## 1. Comparaisons qui acceptent des réponses fausses

### 1.1 Unités : ±1 accepté par défaut (`unitsCompare`)

`fonctionComparaison` avec `{ unite: true }` appelle
`unitsCompare(input, goodAnswer, { precision: options.precisionUnite })`.
La fonction déstructure `{ precision = 1 }` : sans `precisionUnite`, la
précision vaut 1, le test `precision !== undefined` est toujours vrai et la
branche d'égalité exacte (`estEgal`) n'est jamais atteinte. Avec
`Grandeur.estUneApproximation`, la tolérance est de 1 dans la plus petite des
deux unités.

Exemple : canc3a-2023 (57239) Q9, hauteur d'une bouteille, attendu 32 cm.
Acceptés : 31 cm, 32,5 cm, 33 cm, 0,33 m. Refusés : 33,1 cm, 34 cm, 330 mm.

Correctif proposé : `{ precision } = {}` (égalité exacte sans
`precisionUnite`).

Exercices concernés (bonne réponse + 1 acceptée, sans `precisionUnite`) :
29957 (Q1), c6fb2 (Q1, 2), d1513 (Q1 à 6), eb45a (Q1 à 3), 3G20 (74eac, Q1,
2), 3G22-1 (a0ad1, Q2, 5, 6, 7), 3G30 (bd6b1, Q1 à 3), 3L13-3 (22412, Q1),
4G30 (18a21, Q1, 2), 4G40 (3303a, Q1 à 3), 5G2E-5 (6999f, Q1, 2), 5G4autoA-1
(ed9f4, Q1, 3, 5), 5G6G (d6cd1, Q1), 5P1A-2 (edb61, Q1, 3), 6G5A (01875, Q1),
6G5A-1 (91875, Q1 à 3), 6M1D (7433c, Q1, 2), 6M1autoE-1 (ab280, Q1), 6M2C
(c6fbe, Q1, 2), 6M2C-1 (5e598, Q1), 6N4A-3 (5c5a3, Q1), 6N5-10 (b3aa4, Q1, 3),
6P3E (9c78f, Q1 à 3), BP2AutoV3 (eb45e, Q1 à 3), BP2AutoV4 (d1514, Q1),
can6a-CoopMaths (3a526, Q25), canc3a-2023 (57239, Q9), CH 10FA1B-1 (b428f,
réglage `sup=2`, Q2, 8 km : 9 km accepté).

Tolérances explicites à vérifier (bonne réponse + 1 acceptée, voulu ?) :
- 3G32-2 (5986b, Q3, 4, 7) : « 33,16 m », `precisionUnite: 1` (réponse au
  cm, tolérance d'un mètre) ; 3G32-0, 3G32-3, 3G32-4, 3G42 : idem au mètre ;
- 5G5D-1 (06b1a, Q1 à 3) : aires de 12 à 27 cm², `precisionUnite: 3` ;
- can5a-CoopMaths (9e40d) Q27 et 3G32-0, 3G32-1 : `precisionUnite: 1000` (km).
- angles en degrés avec `precisionUnite: 1` : 6G7B-9 (493cf) et 5G3B-2
  (64099) Q1, attendu 85 °, 86 ° accepté (tous les réglages `sup2`, `sup3`) ;
- CH 5999e et 5999f, « Calculer périmètre et aire de figures composées
  (ancienne version) », réglage `sup3=2` (décimaux) : réponses au
  dixième ou au centième (38,6 cm ; 63,61 cm²) avec `precisionUnite: 1`,
  donc 39,6 cm et 64,61 cm² acceptés. `precisionUnite` semble pris pour un
  nombre de décimales.
- can6a-2023 (09430) Q9, réglage `sup2=true` : attendu 17 m,
  `precisionUnite: 1`, 18 m accepté.

### 1.2 Intervalles sans `intervalle: true` : tout intervalle ouvert accepté

Sans option, `fonctionComparaison` finit par
`r.is(n) || (variablesLibres && r.isEqual(n))` sur les expressions Compute
Engine. Pour un intervalle, la comparaison passe : can2L3-04 (bdc96) Q1,
attendu ]16 ; +∞[, sont acceptés ]17 ; +∞[, ]100 ; +∞[, ]−∞ ; 16[ et ]0 ; 1[
(refusés : [16 ; +∞[, 16).

Exercices concernés (borne décalée acceptée) : can2L3-04 (bdc96, Q1),
can2a-NY2024 (dd9d0, Q30), can1a-NY2024 (ac288, Q27), can1a-NY2025 (7244e,
Q16), can1a-NY2026 (214cd, Q16), canTSpea-NY2025 (90dad, Q16),
canTSpea-NY2026 (91563, Q16), canTSpea-2025 (6ca87, Q28), CH 85bf3 (Q1),
1A-C14-4 (97a0b, graine `audit-jf-2`, Q1 : ]−6 ; 1[ accepté pour ]−6 ; 0[),
CH 6ca15 (graine `audit-jf-3`, Q27 : ]−∞ ; 2025[ accepté pour ]−∞ ; 2024[).

Correctif : `intervalle: true` sur ces réponses ; et, dans le repli, ne pas
conclure à l'égalité quand l'une des expressions n'est pas valide (`isValid`)
ou n'est pas numérique.

### 1.3 Expressions avec fonction ou indice : n'importe quoi accepté

Même repli `isEqual` avec variables libres :
- can2P2-02 (32394) Q1, attendu p_{\overline{O}}(Z) : « zzz », P(Z), p_O(Z)
  acceptés (refusé : 0,5) ;
- CH afd39 (questions de cours) Q2, V(aX) = a²V(X) : « zzz », 2a, a², aV(X),
  a³V(X) acceptés (refusés : V(X), 5).

Le repli fonctionne en revanche sur 426 expressions littérales ordinaires
(3x + 2…) testées de la même façon.

### 1.3 bis Égalité de Pythagore : exposants non vérifiés

4G20-1 (40c47), « Donner ou compléter une égalité de Pythagore », réglage
`sup=2` (compléter $GI^2=\ldots$) : la comparaison vérifie les lettres et le
signe mais pas les exposants. Attendu `HI^2-GH^2` ; acceptés `HI^2-GH^3`,
`HI^3-GH^2`, `HI^3-GH^3`, `HI^2-GH^{2.5}`, `HI^2-GH^{-2}`. Même chose pour
une somme (Q3 : `KL^2+KM^3` accepté). Refusés à juste titre : `HI^2-GH`
(« Il manque au moins un carré »), `HI^2+GH^2`, `AB^2-CD^2`.

### 1.4 Tableur : toute formule avec SOMME ou MOYENNE acceptée

`MySpreadSheet.compareSheetFunction` : si la formule n'est pas identique au
texte attendu, les deux formules sont recalculées dans deux tableurs cachés
(`testSheet`, `testSheetUser`) avec des valeurs tirées au hasard. Ces
tableurs ne semblent pas connaître les fonctions françaises : la formule
attendue et celle de l'élève donnent la même erreur, donc toute formule qui
contient la fonction passe, et une formule juste sans elle est refusée.
6I1B-7 (e0f6b) Q1, attendu =SOMME(A1:D1) : acceptés =SOMME(A1:D1)+1,
=SOMME(A1:C1) ; refusés =A1+B1+C1+D1 et =SUM(A1:D1). Même chose dans 3I13-1
(ae07e) Q1 (=MOYENNE(A1:F1)+1 accepté) et Q2 (=SOMME(A1:D1)+1 accepté).

### 1.5 Réponses attendues écrites entre `$…$`

- CH 667d6 (raisonnement par récurrence) Q1 : attendu `$\geqslant 4$`. La
  saisie d'un élève, « ⩾4 », est refusée ; seule la chaîne avec dollars
  passe, et « $⩾5$ » aussi. Impossible de réussir.
- CH afd39 Q5 : attendu `$0$` ; « 0 » est refusé.

### 1.5 bis N'importe quelle réponse acceptée, même vide

- CH 90fd5 (identifier une hauteur et sa base associée), graine
  `audit-jf-2`, Q1 : quand la figure n'a aucun angle droit (« On ne peut
  donc pas déterminer de hauteur ni de base associée »), la vérification du
  `multi-mathfield` renvoie juste pour des champs vides, « zzz » ou n'importe
  quel segment, avec `points: null` (aucune valeur attendue, seulement un
  `bareme`). Les champs ne permettent pas de répondre « impossible ».
  `points: null` cassait aussi le score et les sauvegardes de l'app mobile
  (contourné dans l'app ; un résultat sans `points` numériques reste à
  éviter côté moteur).

### 1.5 ter QCM

Contrôle des 3 236 QCM (deux graines, `qcm1` et `qcm2`) : aucune proposition
juste, toutes justes, doublons.
- CH 3a5ab (arbre de probabilités), graine `qcm1`, Q1 : « $p(B)=0,3$ »
  proposé deux fois, l'un faux, l'autre juste (seule différence : une espace
  finale dans le texte) ; l'élève qui coche le premier est compté faux.
- 2N10-5 (ca9b7), graine `qcm1`, Q4 : les cinq ensembles (ℕ, ℤ, 𝔻, ℚ, ℝ)
  sont justes (nombre entier naturel) : voulu, mais la question ne teste
  alors rien.

### 1.5 quater Calculatrice à touches cassées contournable au clavier

can6C7-07 (0aaea), « Utiliser une calculatrice avec touches cassées »
(`my-calculator`) : à la souris ou au doigt, les touches cassées sont
inactives et le calcul juste est accepté (graines `audit-jf`, `g2`, `g3`,
`g4` : « 9 − 1 », « 7 + 7 »… 1/1 ; résultat faux 0/1). Mais le clavier
physique (`addKeyboardSupport`) ne tient pas compte des touches cassées :
graine `audit-jf`, cible 8, touche 8 cassée, « 8 » puis Entrée tapés au
clavier → valeur « 8 », 1/1. Sur ordinateur (fenêtre de bureau de l'app,
site), la consigne se contourne. Correctif : appliquer
`checkAndIncrementKeyUsage` aux touches du clavier physique.

### 1.6 Ensembles (`ensembleDeNombres`)

- 2L22-3 (93432), graine `audit-jf-2`, Q4 : attendu {−1/2 ; −4/7} ; accepté
  {−1/2 ; −4/8}. La comparaison vérifie que chaque valeur saisie est dans
  l'ensemble attendu et que le nombre de valeurs est le bon, mais ne repère
  les doublons que s'ils sont écrits pareil ({−1/2 ; −1/2} est refusé :
  « valeurs qui se répètent ») : −4/8 = −1/2 passe pour −4/7.
- CH 2mTrigoFct-6 (a7c64), graine `audit-jf-2`, Q2 : la réponse attendue
  {0 ; π/2 ; π ; 3π/2} est refusée (« Les nombres doivent tous être séparés
  par un point-virgule »), avec \dfrac comme avec \frac.

### 1.7 Variante de saisie refusée

- 2N14-5 (acff) Q1, ranger 1,2 ; 3/4 ; 13/20 ; 13/21 : la vérification
  (`callback` de l'exercice) accepte `\frac{13}{21}<…` mais renvoie
  « erreur dans le programme » (« Invalid LaTeX fraction format:
  \dfrac{9}{4} » en console) pour `\dfrac`, forme de sa propre réponse
  attendue.

### 1.7 bis Écriture demandée non contrôlée

- 6N3F-2 (ab44e), « Décomposer une fraction puis donner l'écriture
  décimale » (réglage `sup3` par défaut) : le trou « écriture décimale »
  accepte `\frac{5}{4}` (comparaison `isEqual`), la recopie de la fraction
  de l'énoncé.
- 5N1H (86fa8), « Utiliser la distributivité pour du calcul mental » :
  l'étape « = … − … » attend 6 400 et 128 mais accepte `64\times100`
  (comparaison `isSame` qui évalue). Moins grave : l'étape de calcul peut
  être sautée.

### 1.8 À vérifier

- TEM1-12 (b74bf), QCM à branches « Le calcul de AB est-il possible ? »,
  graine `audit-jf` : le choix juste « Oui » porte le retour « Le calcul est
  impossible. », et le choix faux « Non » déclare `points: 2`. Le score est
  pourtant juste (matrice juste 2/2, un coefficient faux 1/2, « Non » 0/2).
- 6N5-3 (7fb24), réglage `sup3=true` (« Certains problèmes peuvent être
  insolubles ») : 9 problèmes sur 10 insolubles (graine `audit-jf`), et pour
  ceux-ci la seule réponse juste est de ne rien cocher (toutes les
  propositions à `statut: false`, correction « Aucune donnée n'est utile »).
  Aucune case « On ne peut pas répondre » : l'élève qui hésite ne peut pas
  l'exprimer, et une question laissée blanche par oubli est comptée juste.
  Dans l'app, la vérification d'un QCM vide est possible et juste ; à la
  fin, l'app signale ces questions comme « sans réponse ».

- 6N1F-4 (6b534) : « 18/295 ≈ [champ1] soit environ [champ2] % » ; champ1
  accepte 0 et 1, champ2 accepte 6 et 7 (listes de valeurs par défaut et par
  excès à toutes les précisions). « 1 » et « 7 % » sont-ils voulus ?
- CH a2ac2 Q3 : « 2 » et « 3 » acceptés tous deux (liste `["2", "3"]`).
- 4L23 (8d4f2) Q1, QCM à branches « 9 + 8x = 17x pour tout x ? » : le choix
  juste « Faux » porte le retour « L'affirmation est vraie. », et le choix
  « Vrai » demande « une expression réduite commune aux deux membres »
  (attendu 8x + 9). Textes génériques par branche ? À relire.

## 2. Bonnes réponses refusées

### 2.0 Clé de réponse et correction en désaccord (élève juste compté faux)

Contrôle de cohérence (graine `coherence`, 7 297 exercices) : valeur attendue
par la vérification comparée au résultat mis en évidence dans la correction
(`\color{#F15929}\boldsymbol{…}`). 110 désaccords, la plupart sans gravité
(numérateur et dénominateur mis en évidence séparément, question à plusieurs
éléments) ; contrôle affiné (`node e2e/audit-coherence.mjs`) : 8 restent,
tous vérifiés à la main :
- **a17d6** (6AutoA1-3, 6M2autoC-3, can6M2-04), « Mesurer différence d'aire
  par comptage », Q1 : rectangle de 35 cm², 14 carreaux orange ; la question
  demande l'aire de la **zone hachurée** = 21 cm² (la correction le dit),
  mais la réponse attendue est 14 : « 21 » est compté faux, « 14 » juste.
- **CH 3a384**, « Effectuer un dénombrement (ancienne version) » : la
  réponse attendue est le numéro de la question (« 1 », « 2 »…) au lieu du
  résultat ; Q1 : 575 757 (C(39, 5), donné par la correction) est refusé,
  « 1 » accepté ; Q2 : 564 129 refusé, « 2 » accepté.
- **4P16 (63cdb) Q4** : 486 W·h en kW·s ; attendu 1 749,6 (exact), la
  correction affiche « 1 750 » ; « 1 750 » est refusé (« Résultat
  incorrect »). Arrondir la correction ou accepter l'arrondi.
- **canc3a (32a0f) Q27** (CAN CM1) : réponse 24 (66 − 42) ; la correction
  met en évidence 66 au lieu de 24.
- **can6a-2021 (90c8c) Q18** : « Combien de millièmes dans une centaine ? »,
  réponse 100 000 ; la correction met en évidence « 1 000 ».

- **Réduction, signe moins en tête** : la règle `noTrivialFactor` (« Cette
  expression n'est pas assez réduite : elle contient un facteur trivial ou un
  terme nul », morceau `sameAffineSignTable`) renvoie vrai pour toute
  `Negate(Multiply(…))`. « −bx² + 5k² » est refusée (« La valeur est
  correcte » puis ce message) alors que « 5k² − bx² » passe. CH 10FA4C-8
  (2f983) Q8, CH 10FA4F-10 (1cd08) Q8 (« −rt³ + 8t³ + 4rt − 32t »), CH
  10FA4E-4 (4b495, graine `audit-jf-2`, Q4, « −tyz + 7yz + 19y − 7 »), et
  sûrement toute réponse qui commence par un monôme littéral négatif. Dans
  la fonction : `if (e.operator === "Negate") return …Multiply…` devrait
  examiner l'opérande (`return L(e.ops[0])`) au lieu de conclure.
  Réglages (audit des paramètres) : CH 10FA4C-9 (62111, « Multiplier des
  monômes ») avec `sup=2`, `sup=3`, `sup2=1` : tout monôme négatif est
  refusé. `sup2=1` Q5, attendu « −stz » : refusés `-stz`, `-s t z`, `-zts`,
  `-1stz` ; question impossible à réussir. `sup=2` Q2, attendu
  « −9/4 ryz² » : `-\frac{9}{4}ryz^2` refusé, `\frac{-9}{4}ryz^2` et
  `-2,25ryz^2` acceptés.
- **3L15-2 (0f844) Q1** : valeur attendue `-\sqrt{\dfrac{29}{7}};\sqrt{\dfrac{29}{7}`
  sans l'accolade finale ; la bonne réponse est comptée « 1 valeur correcte
  et 1 valeur incorrecte ».
- **EgaliteFG4-3e-19 (c9362)**, « Sophie Germain : un QCM mystère », Q1 à
  Q4 : `mathalea-qcm` avec `format=lettre` en mode interactif : aucune case à
  cocher n'est affichée (seulement « A. B. C. » et les textes), l'élève ne
  peut pas répondre.
- **CH 39232**, « Compléter un tableau de variations (démo) », Q1 : le
  tableau rempli exactement avec la configuration attendue
  (`autoCorrection[0].valeur.reponse.value`) obtient 3/4 ; une partie n'est
  jamais validée. Le titre « (démo) » laisse penser qu'il ne devrait pas être
  au référentiel.
- **EgaliteFG1-6e-5 (a108d) Q1** (les femmes à l'Assemblée) :
  `formatInteractif: 'mathlive'` alors que la question affiche un
  `tableau-mathlive` ; toutes les cases justes donnent « erreur dans le
  programme », 0/1. Format attendu : `tableauMathlive`.
- **CH 2mTrigoFct-5 (8f72a) Q3, 2mTrigoFct-7 (c6f91) Q4** : la valeur de la
  correction (−π/6 − 2kπ/3) est refusée : « Les expressions ne décrivent pas
  le même ensemble ».
- **6G7B-10 (cd69a) Q3** : réponse attendue `\whidehat{JWH}` (coquille de
  `\widehat`).
- **2F21-9 (99d4e) Q1** : tableau de signes, réponse attendue `"{}"`.
- **testEEE (CH)** : `-2(x-4)` refusé avec `expressionsForcementReduites`
  (exercice de test dans le référentiel CH ?).
- **can1E1-01 (ce463)**, « Simplifier des expressions exponentielles »,
  réglage `sup3=true` (QCM) : l'attribut `propositions` de `mathalea-qcm`
  contient du JSON dont les barres obliques inverses ne sont pas doublées
  (`[{"texte":"$\mathrm{e}^{12}$",…`) ; `JSON.parse` échoue (« Bad escaped
  character in JSON at position 13 ») et le QCM s'affiche sans aucune case :
  question impossible à réussir. Correctif : construire l'attribut avec
  `JSON.stringify` (puis échapper pour l'attribut HTML).
  Même défaut pour **1AN30-2 (cb7d9)**, réglage `sup3=true` : les 7 QCM
  sans case.
- **1AN14-6 (b32f2)**, réglage `sup2=true` (« Montrer que f′(x) = … ») :
  l'énoncé donne la dérivée et n'affiche aucun champ, mais les 4 questions
  restent interactives avec une réponse attendue (`autoCorrection` en
  `mathalea-mathfield`) : l'élève ne peut rien saisir et chaque question
  compte fausse. Avec ce réglage, les questions devraient être non
  interactives (sur papier).
- **3G95-17 (a7f28) et 3G95-17p (f3a91)**, « Déterminer un vecteur non nul
  orthogonal à deux vecteurs » et « Résoudre un système avec une infinité de
  solutions » : une solution juste écrite avec une fraction à un chiffre est
  refusée. MathLive renvoie `\frac72` (et non `\frac{7}{2}`) par
  `getPromptValue` ; `valeurNumerique` ne reconnaît que
  `\d?frac\{…\}\{…\}` et rend `null`. Graine `audit-jf` : vecteur
  $(\frac{7}{2}; 6; \frac{13}{2})$ refusé alors que $(3{,}5; 6; 6{,}5)$ et
  $(7; 12; 13)$ sont acceptés ; couple $(\frac{1}{2}; 2)$ refusé, $(0{,}5; 2)$
  accepté. Correctif : lire `getPromptValue(champ, 'latex-expanded')`, ou
  accepter `\d?frac(\d)(\d)` dans l'expression régulière, ou passer par
  le moteur de calcul (`ComputeEngine`). Seuls ces deux exercices analysent
  eux-mêmes les fractions des trous.
- **Traceur de courbe (`traceur-de-courbe`, 3F10-7 d4a81, 4F11 2ecde,
  d4c81) : une saisie sur deux est perdue.** Tableau de valeurs à remplir
  case par case : après une case remplie, la frappe dans la case suivante
  disparaît (la case reste vide) et la page lève `Cannot read properties
  of undefined (reading 'options')` (MathLive, `atomToString` dans
  `getValue`) ; la case d'après fonctionne, la suivante non, etc. Reproduit
  sur le moteur seul (clic + clavier) et dans l'app à 390 px au doigt, au
  clavier virtuel de l'app (valeurs mêlées entre cases : « −13 », « 15 »)
  et à la souris dans une fenêtre de bureau : 0/1 au lieu de 1/1. Cause
  (`TraceurDeCourbe-*.js`) : au `change` d'une case, l'élément retrie les
  colonnes par x, reconstruit tout son HTML (`render()` remplace
  `innerHTML`, donc de nouveaux `math-field`) puis redonne le focus à la
  case touchée (`he()` par `queueMicrotask`, avant que le nouveau champ
  MathLive soit monté) ; `pendingPointerFocus` est en plus effacé dès
  `setTimeout(…, 0)` après `pointerdown`, avant le `change` au doigt.
  Les colonnes se retrient aussi sous les yeux de l'élève (une valeur tapée
  en 2ᵉ colonne passe en 1ʳᵉ). Correctif : mettre à jour les valeurs et le
  graphique sans recréer les champs (ou retrier seulement à la sortie du
  tableau, `focusout` vers l'extérieur), et redonner le focus après
  l'événement `mount` du champ. Exercice pratiquement impossible à réussir
  au doigt.
- **6AutoF3-3 (1574f)**, « Ajouter des barres fractionnaires »
  (`svg-selection`), graine `g5` : attendu 7/9, clé `0.7777777777777778`.
  Les deux seules sélections possibles (1/3 + 1/9 + 1/3, éléments 3, 4, 8
  ou 3, 8, 9) donnent la valeur `0.7777777777777777` et sont refusées
  (comparaison exacte avec `nombreDecimalSeulement`) : question impossible
  à réussir. Graines `audit-jf`, `g2`, `g3`, `g4`, `g6` : toutes les
  sélections justes acceptées. Correctif : comparer avec une tolérance, ou
  additionner en fractions (`FractionEtendue`) avant de comparer.
- **5G5E-2 (c7c78)**, « Tracer une hauteur dans un triangle », graine
  `audit-jf` : triangle B(0 ; 0), O(3 ; −8), F(6 ; −4), hauteur issue de F
  construite exactement (Droite perpendiculaire à [BO] passant par F) :
  0/1, « Aucune droite ne correspond à la réponse attendue ». La fonction
  `ke` compare pentes et ordonnées à l'origine arrondies à 2 décimales
  (`Math.round(x * 100) / 100`) : la droite tracée a une pente de
  0,3749999999999999 (arrondie 0,37), l'attendue 0,375 (arrondie 0,38).
  Toute pente ou ordonnée en « ,xx5 » est exposée. Graines `g2`, `g4`,
  `g5`, `g6` : 1/1. Même fonction dans 5G5G-1 (63d3a, médiane). Correctif :
  comparer avec une tolérance (`Math.abs(c - h) < 1e-6`), ou mieux, tester
  que le point attendu est sur la droite et que la direction est
  perpendiculaire.
- **5G3A-4 (d37ea)**, « Construire l'image d'une figure par une symétrie
  centrale », question « triangle » : seule la figure tracée avec l'outil
  Polygone est acceptée (`checkPolygon`) ; le triangle tracé avec l'outil
  Segment (proposé dans la barre) n'a que 1/2, alors que 6G7B-11 (symétrie
  axiale) accepte les deux (`checkPolygon || trois checkSegment`). Graines
  `audit-jf` Q3, `g2` Q1, `g3` Q1.
- **5G3A-4 (d37ea)**, cas dégénéré : graine `g2`, Q6, « Construire l'image
  de la droite (AV) par la symétrie de centre X » avec X(0 ; 0), A(−2 ; 4),
  V(−4 ; 8) : la droite passe par le centre, son image est elle-même, déjà
  tracée ; figure laissée vide : 1/2. Le tirage devrait écarter un centre
  aligné avec les deux points.
- **6G6C-1 (bcbe1)**, « Justifier la construction des triangles via les
  angles », réglage `sup=2` (« 2 angles et le 3ème en fonction du 1er ou du
  2ème ») : toutes les propositions du QCM ont `statut: false`. Graine
  `audit-jf`, Q1 : angles 5°, 43,75° et le triple de 43,75° ; la correction
  conclut « On peut donc construire le triangle POT », mais « Le triangle
  POT est constructible mais n'est pas plat » est compté faux ; seule une
  réponse vide est comptée juste. Q1 à Q3 avec `sup=2`, et les questions de
  ce type avec `sup=3` (Mélange, Q2 et Q3).
- **Solveur, 4L15-1 (6463b)** : une dernière étape en fraction (« v = 5/4 »)
  compte fausse si l'élève n'a pas touché « Évaluer » ; juste après
  « Évaluer ».

## 3. Moteur embarquable (`moteur/fichiers`)

- **Chargement différé** : Sélection d'automatismes 6e (c6cd6), 3e (a531a),
  2de (2a1c7), 1re (ce2ea) renvoient d'abord des questions
  « chargement... » (`generationStatus: 'loading'`) ; `preparerExercice`
  devrait attendre `ready` (l'app le fait, `src/lib/moteur.ts`,
  `preparerComplet`). **can6a-Aléa (315b6)** n'a pas de `generationStatus`
  et ne prévient que par l'événement `updateAsyncEx` : il reste
  « chargement... » dans l'app.
- **Identifiants non renumérotés** dans les Automatismes et les CAN : une
  figure ou un tableau d'exemple garde la numérotation de son exercice
  d'origine : `M2DpenteAffineEx0Q0`, `tableau-mathliveEx0Q0` dans la 5e
  question de 1A, `tableau2x2Ex3Q0` dans la Q16 de can5a-2025 et can3a-2026,
  la Q29 de can4a-2026, la Q3 de 3AutoDNB2026-6. Doublons d'identifiants dans
  la page ; l'app a dû restreindre la recherche des éléments d'une question.
- **`question-index` non renuméroté dans les Automatismes** : l'identifiant
  de l'élément est renuméroté (`tableau-hybrideEx3Q8`) mais pas ses
  attributs `question-index` (resté 0) ; la vérification
  (`tableau-hybride[numero-exercice][question-index]`) ne le trouve pas et
  renvoie « erreur dans le programme » : question impossible à réussir.
  Vu dans 6A (c6cd6, graine audit-jf, Q9 `tableau-hybride`, emploi du temps
  d'Inès ; même question réussie seule dans 6AutoS1-4, b74c8), et pour
  `alea-iep-editeur` (6A, graines qi1 Q4, qi2 Q9, qi6 Q10),
  `mathalea-solveur` (3Auto a531a, qi1 Q4, qi11 Q10),
  `possible-multi-lines-answer` (3Auto, qi3 Q9, qi7 Q8, qi11 Q6).
- **Entrées d'`autoCorrection` orphelines** : plus d'entrées que de
  questions, sans champ dans l'énoncé : 6AutoF1-2 (28e58, 4 pour 3),
  5N2G-3 (ce849, 5 pour 4), CM2N1D-2 réglage `sup2=1` (49 entrées pour 3
  questions, 47 sans champ). Sans effet dans l'app (elle compte les
  questions), mais tout ce qui parcourt `autoCorrection` (score de
  MathALÉA, AMC, export) compte des questions fantômes.
  Même défaut quand le réglage « Valeur maximale » est petit (`sup=1`) :
  l'exercice ne trouve plus de question nouvelle, s'arrête avant le nombre
  demandé et laisse une entrée de plus que de questions (la question écartée
  comme doublon a déjà reçu sa réponse) : CM2N3A-2 (ed7fc, 1 question pour
  10, 2 entrées), CM2N3A-3 (3751c, 2 pour 10), 6N0A-1 (ace0a, 1 pour 10),
  5N2I-1 (f2db1, 3 pour 5), 4C10-10 (857c1, 3 pour 10, un QCM fantôme),
  5N5F (85d2d, 2 pour 5), 4C10-3 (153b9, 3 pour 10), 4C10-7 (0b020,
  `sup3=1`, 4 pour 10). Enregistrer la réponse seulement après
  `questionJamaisPosee`, et borner « Valeur maximale » à une valeur qui
  permet le nombre de questions demandé.
- **`tableau-hybride`** : chaque liste déroulante d'une case partage son
  `id` avec un `span` (`tableau-hybrideEx3Q0L1C3` deux fois).
- **Corrections de QCM** : leurs boutons radio, bonne réponse cochée, portent
  le même `name` que ceux de l'énoncé (`checkEx<n>Q<i>`) ; affichée sous
  l'énoncé, la correction décoche le choix de l'élève. L'app construit la
  correction hors du document et renomme ces boutons (`fragmentCorrection`).
- **Figures à cliquer, `propositions` désaccordées** : 6AutoG1-1 (83763) ;
  les figures sont mélangées mais `autoCorrection[k].propositions` garde
  l'ordre d'avant le mélange (la première toujours juste, graine `audit-jf` :
  solutions réelles 4e, 2e, 1re figure). La vérification lit
  `cliqueFiguresArray` et reste juste ; tout ce qui lit `propositions`
  (QCM, AMC, relevés) désigne la mauvaise figure.
- **`clique-figure`** : l'énoncé ne contient pas l'élément `<clique-figure>`
  qui rend les figures cliquables ; l'app le crée (`figuresACliquer`).
- **MathLive** : `fontsDirectory` et `soundsDirectory` ne sont pas fixés ;
  MathLive cherche `morceaux/fonts/KaTeX_*.woff2` et
  `morceaux/sounds/plonk.wav` (404). L'app les fixe après `initialiser()`.
- **Ressources absentes de `dist-moteur`** (`vite.moteur.config.ts` ne copie
  que les polices) : `images/` (3G40-1 globe, 3P11-1 tables à repasser),
  `scratch-blocks/media`, `blockly/media`, `styles/scratch-simulator.css`,
  `/fonts/Arial Rounded Bold.ttf`, `/alea/images/egalite/*` (portraits,
  156 exercices « Sur le chemin de l'égalité » du référentiel CH).
- **Exercices non déterministes à graine égale** (déjà notés) : CM2N4D-1,
  6G7B-8, 5G3A-11, 5G3A-12, 4G12, 4G12-1, TSA8-10, b7773 (CH) ; c541a échoue
  selon la graine.
- **Points cliquables** : 60 questions affichées ensemble figent la page
  environ 28 s.

- **Requête Internet depuis le moteur** : le rendu MathLive des labyrinthes
  (`mathalea-labyrinthe`, classe de typeset qui suit `Oq`) insère dans
  l'ombre de l'élément `@import url("https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css")`.
  L'app est hors ligne et ne doit rien demander à Internet : utiliser la
  feuille de MathLive livrée avec le moteur. Vu dans 5N1J-1 (424b2),
  5N3autoE-2 (e1a0a) et les autres labyrinthes.
- **Autres requêtes Internet** (relevé de tous les exercices, papier compris,
  énoncés et corrections affichés) : `https://www.mathgraph32.org/js/MathJax3/es5/tex-svg.js`
  chargé par 3G11 (18e25), 4G15 (0da6a), PEG20 (44b85), PEG21 (838fb),
  PEG22 (b752a) (élément MathGraph32 ; les figures mathalea2d s'affichent
  bien sans) ; vidéos `podeduc.apps.education.fr` intégrées dans TSG1-06
  (3634f) et TSG1-08 (300a4). Rien d'autre sur 4 094 exercices.
- **Référentiel CH** : il contient le modèle d'exercice
  « AchangerOBLIGATOIREMENT » (titre « Mettre le titre souhaité (assez
  descriptif mais pas trop long) »), l'exercice « babybel » (titre
  « TITRE », énoncé vide, une figure apigeom) et l'exercice de test « testEEE »
  (« Eric fait ses tests interactifs »), visibles dans « Non classés ».

## 3 bis. Textes affichés

Relevé du texte rendu (énoncés et corrections, graine `reseau`, 4 094
exercices) : aucune erreur KaTeX, aucune préparation en échec.
- « undefined » en tête de l'énoncé, juste avant le QCM, dans 5 exercices
  CH : 83789 (produit), 4ed52 (division euclidienne), 884fe (comparer deux
  fractions), b5324 (produit), f6jd7 (visualisation 3d). Le texte d'énoncé
  passé au QCM vaut `undefined`.
- 3AutoP04-3 (5bc80) Q1, correction : « On trouve
  $AD={\color{#F15929}\boldsymbol{2,8}}\text{ cm}. » : `$` fermant
  manquant, la formule s'affiche brute.
- CH sebseb (schémas en boîte) Q8 : « $45\text{ cm}$ » affiché brut dans
  l'énoncé (texte du schéma non rendu par KaTeX ?).
- 6N2F-1 (6e828), correction : « Do,c » pour « Donc ».
- CH 1972e (points remarquables du triangle), corrections : « le point K est
  le le centre du cercle inscrit », « le le centre de gravité au triangle ».
  Q8 : l'option « On ne peut pas savoir » (`onpps`) figure deux fois dans la
  liste déroulante (contrôle des 169 listes du référentiel : seul défaut).
- CH addd5, « Reconnaître une fonction d'après sa courbe » : aucune courbe
  affichée ; énoncé « Choisir l'expression mathématique », une liste
  déroulante, correction « Vous avez choisi : . » (exercice inachevé ?).

## 3 ter. Nombre de questions

Chaque exercice préparé avec 1 puis 5 questions demandées (7 789
préparations) : aucun ne donne 0 question. 226 exercices qui ne déclarent pas
`nbQuestionsModifiable: false` donnent moins de questions que demandé
(l'enseignant règle 5 questions dans l'éditeur et en obtient moins ; l'app
suit le nombre réel). À déclarer non modifiable, ou à compléter :
- 1 question pour 5 demandées (148) : can5A-01, can5C6-04, CM2N4B-3, 6N2autoB-1, 5G2E, 5G3A-9, 5G5B-4, 5G5E-1, 3G12, 3G40, 2F21-10, 2S20-7, TSA2-33, TSA2-34, TSP1-10, TSP1-11, TSP2-10, TSP2-12, TSP2-13, TSP2-17, TSP2-18, TSP2-19, TSP3-10, TSG1-QCM04, CH 11FA2A-7, CH 1mF3-16, CH 3G93-6, CH 4mProbStat-4, CH 4mProbStat-8, CH 4mProbStat-9, CH 4mQCM-2, CH autres-3, CH 29957, CH 57688, CH 83663, CH 83800, CH 84545, CH 89612, CH 3acb0, CH 3ca11, CH 4b3b4, CH 4b8ca, CH 4f818, CH 5b0ab, CH 5dd79, CH 5e041, CH 5e27b, CH 6d3cf, CH 6eaec, CH 6f117, CH 7ab60, CH 7d7ee, CH 7e718, CH 8eaa0, CH 8eb0d, CH 8ef85, CH 8fa5c, CH 9b711, CH 9bfb4, CH 9e8a8, CH 9e9fb, CH 9fd0c, CH 41aff, CH 41d8d, CH 45e51, CH 48aff, CH 50ee5, CH 56e02, CH 62f5e, CH 67a5b, CH 71b1f, CH 77ef9, CH 83b36, CH 86c44, CH 90b1e, CH 93a9e, CH 94d92, CH 94db5, CH 416d2, CH 570b7, CH 691a7, CH 752b3, CH 764b2, CH 836b0, CH 999ee, CH 4650c, CH 5494d, CH 7372a, CH a03b4, CH a63b6, CH a601c, CH a2828, CH a9046, CH aa613, CH aaaaa, CH AchangerOBLIGATOIREMENT, CH ae01d, CH afbe8, CH agjju, CH b7d33, CH bc9a6, CH bc372, CH bd6d4, CH bd8e1, CH bdaaf, CH bdd72, CH c5b23, CH c573b, CH c1209, CH c3202, CH c9016, CH ca805, CH cd32b, CH cfa5e, CH d09fe, CH d8a6b, CH d873d, CH daf1d, CH dc224, CH dd1ed, CH de353, CH de363, CH df264, CH dff98, CH e1d48, CH e4f38, CH e6d46, CH e9e43, CH e12d9, CH e37a9, CH e8254, CH ecb98, CH ed974, CH ee42f, CH efdaf, CH f78d0, CH f3208, CH f5387, CH fa682, CH faefb, CH fb224, CH fca9d, CH fdadd, CH fe22f, CH fef8a, CH ff7fe, CH jnapmep0, CH q3sjw.
- 2 questions pour 5 demandées (10) : 6AutoA2-2, 6M1B, 6M1autoE-4, 6G6C, 5G4autoB, 5G5D, 5G6F-2, CH 95d37, CH 603f6, CH ree46.
- 3 questions pour 5 demandées (29) : can6D1-03, CM2G2A-2, 6AutoN4-1, 6AutoN4-4, 6N2B-4, 6N2autoC-2, 6G3B-2, 4F12, 1AL11-1, CH 9ES1E-19, CH 1z5ph, CH 2e77f, CH 4cc5b, CH a4cbf, CH cd8eb, CH d3b6c, CH d6f1f, CH d631d, CH e0486, CH exemple-qcm-json, CH fhmbj, CH gbgfa, CH pl5rm, CH ps264, CH sdxi0, CH t25p6, CH tfw5s, CH xd0yc, CH PR-31.
- 4 questions pour 5 demandées (39) : can6D1-04, can6D3-01, 5G2E-4, 5G2autoC, 5G6D, 4G20-5, 2A-N1-5, 2A-E3-3, 1A-C03-7, 1A-C03-9, CH 91304, CH 97290, CH 0es14, CH 1gyyf, CH 3dff8, CH 6e29b, CH 9t36i, CH 42fc1, CH 365f4, CH 471c3, CH 663ca, CH 816ad, CH 7057b, CH a8e1d, CH b799f, CH c6cbe, CH d3e8f, CH df646, CH e45ab, CH fec31, CH guufj, CH jcadx, CH jltht, CH p6rs9, CH psq01, CH rg0k0, CH toc9u, CH yhfer, CH yhwly.

## 3 quater. Paramètres des exercices

Chaque exercice préparé avec chaque valeur de chacun de ses paramètres
réglables dans l'éditeur (`sup` à `sup4` : cases, listes, nombres jusqu'à
12 ; 10 950 préparations) : aucun plantage, aucun exercice vide. Seuls
défauts : le « undefined » de CH 4ed52 et f6jd7 (section 3 bis), quelle que
soit la valeur de « sujet officiel ».

Constats par combinaison de réglages (relevés en testant les réponses) :
- **6I1B-4 (ae07c)**, « Programmer des calculs sur tableur » : avec le type
  d'opérations « 4 : Division » seul, `preparerExercice` plante
  (`TypeError: Cannot read properties of undefined (reading 'oldn')` dans
  `nouvelleVersion`) pour 3 graines sur 5 avec 3 opérations et 5 sur 5 avec
  5 opérations ; quand il ne plante pas, 1 ou 2 opérations au lieu de 3.
  « 3 : Multiplication » seule : toujours 1 opération au lieu de 3 ou 5.
  « 2 : Soustraction » avec 5 opérations : de 1 à 5 selon la graine.
  Addition seule et mélange : nombre demandé respecté.
- **6I1D (f320c)**, « Programmer le déplacement d'un bus » : « Nombre de
  lignes (entre 2 et 8) » et « de colonnes » plafonnent à 5 (8 × 8 donne
  5 × 5) ; 2 colonnes donnent 3 colonnes.

## 4. Affichage à 390 px (téléphone)

- `deuxColonnes`/`troisColonnes` : colonnes flottantes de 40 % ; la figure
  « ci-contre » sortait de l'écran de 50 à 190 px (une trentaine
  d'exercices : 1A-F04-5, 1A-F04-6, 1A-C10-3 à -6, 2mIneq-13, 6G7B-8,
  5G3A-11, 4G12…). L'app les empile ; côté MathALÉA, `deuxColonnesResp`
  conviendrait.
- 2N12-10 (66159) : tableau à relier de 600 px, défile dans l'app.
- Étiquettes qui se chevauchent quand la figure est réduite : 6N1C-2 (axe
  « 3 0004 000 »), 6N1H-1 (graduations sur les points).
- 6M2B-1 (f36d5) : le champ de réponse recouvre la figure (et « cm² »).
- CM2N2A-1 (c28e5) : cases de la bande à colorier d'environ 10 px.
- Étiquettes hors de la figure : CH azer (−4 et −5, 60 et 120 px),
  6G7B-6 (« (d₂) » coupé à gauche dans la correction), 3F24DNB-1.
- CH 05b52 : « …la représentation graphique.` » (accent grave en trop).
- CH ad5f5 (tracer des droites graduées) : énoncé réduit à une droite, sans
  consigne ni correction.

## 5. Remarques secondaires

Relevées pendant les tests qui ont réussi : sans effet sur la note de
l'élève, ou défauts latents.

- `checkCoords` avec `checkOnlyAbscissa` compare quand même l'ordonnée
  (`he(_.y, a) === he(n, a)`) : sans effet tant que les points restent sur
  l'axe (CM2N2E-1, 6N1G…).
- Médiatrice : les objets `PerpendicularBisector` et
  `PerpendicularBisectorByPoints` sont refusés (6G3B 0dbe7 : « n'est pas
  une droite », le contrôle exige un type contenant « Line » ; 1ed48
  Hypatie : « n'est pas une droite unique », alors que la correction de
  l'exercice les utilise). Latent tant que l'outil Médiatrice n'est pas
  dans la barre.
- Parallélogramme 4d4a8 (`geoParallelogramme1`) : A, B, C toujours aux
  mêmes coordonnées quelle que soit la graine ; une deuxième vérification
  de la même figure donne 1/5 après 5/5 (la vérification clique sur
  « SHAKE ») ; l'énoncé « Placer le point D… » ne dit pas qu'il faut le
  construire (un point libre au bon endroit vaut 0/5).
- 79d64 et e514f (`geoTriangle1`) donnent le même triangle à graine égale.
- 6fdab, b1e01 (`geoElements1/2`) : la notation affichée met le crochet
  fermant hors de la formule (`$[GH$)`, getter `notation`).
- 6N3D-1 (cff13, demi-droite graduée) : la clé contient `showwNegative`
  (coquille de `showNegative`).
- Yohaku (`_Yohaku`, exercice générique 3a377) : `correctionInteractive`
  ne renvoie que Ligne 1, Ligne 2, Colonne 1, Colonne 2 ; pour une grille
  de 3 × 3 ou plus, la troisième ligne et la troisième colonne ne sont pas
  notées (les Yohaku du référentiel sont en 2 × 2).
- 9103e (ancienne version de 5N1H) : résultat final faux 1/2, contre 0/2
  dans 5N1H et 3b474 (le second point y suit le quatrième trou).
- 46bae (tableur, ancienne version) : avec un seul type de formule
  (« Double »), les trois cellules d'une question demandent la même
  formule.
- EN-Juniper-Green (cc308) : la règle affichée (« à tour de rôle », « le
  joueur qui ne peut plus jouer a perdu ») décrit une partie à deux, alors
  que l'élève joue seul ; toute suite menée jusqu'au blocage vaut 2/2,
  qu'elle compte 6 ou 17 nombres.
- Labyrinthes (`mathalea-labyrinthe`) : en fin de partie, l'élément clique
  `#buttonScoreEx<n>`, qui n'existe que sur le site ; la grille est dans
  une racine fantôme fermée, ce qui empêche les tests automatiques d'y
  accéder.
- 6I1D (bus Blockly) : le programme est exécuté par `new Function`, ce qui
  impose `'unsafe-eval'` dans toute politique de sécurité du contenu.
- Figures apigeom plus larges qu'un écran de téléphone (CM2N2E-1 : droite
  graduée de 792 px) : la figure a `touch-action: none`, un glissement
  dessus ne la fait pas défiler et crée un point là où le doigt s'est posé.
  Suggestions : ne créer le point qu'au relâcher d'un toucher immobile,
  largeur de figure adaptée à l'écran.
- 6N2J-3 : les listes de la question t sont numérotées `Q2t` et `Q2t+1`,
  et 6N3B (42fbx) numérote ses champs `Q100` à `Q103`, hors de la
  numérotation des questions (sans effet dans l'app, qui lit les saisies
  dans la zone de la question).
