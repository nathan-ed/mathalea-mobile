# Audit de l'app et de MathALÉA : registre des constats

Registre unique de tout ce que les tests ont trouvé (octobre 2026), tenu à
jour à chaque étape : sections 1 à 4, constats pour MathALÉA (moteur et
exercices) à corriger par Nathan ; section 5, correctifs déjà faits dans
l'app ; section 6, ce qui reste à tester ; section 7, outils.
Moteur : celui de `static/moteur` (commit de `moteur/COMMIT`), graine
`audit-jf` sauf mention contraire, numéro d'exercice 3 (champs
`champTexteEx3Q<i>`). « Q n » : n-ième question (rang `n - 1` de
`autoCorrection`). Reproduire avec `node e2e/audit-justes-fausses.mjs`
(`UUIDS=…`, voir l'en-tête du script).

Méthode (23 octobre 2026) : les 3 628 exercices interactifs (FR, puis CH
seulement), toutes les questions affichées ensemble, chaque élément corrigé
rempli en entier avec la bonne réponse tirée de `autoCorrection` (doit être
acceptée), puis avec une réponse fausse (nombre décalé de 1, autre
proposition, autre option : doit être refusée). Sur 10 406 éléments, 9 972
se comportent bien ; 104 acceptent une réponse fausse et 87 refusent la bonne,
détaillés ci-dessous une fois écartés les cas où le banc ne pouvait pas
deviner la réponse (règles décrites par une fonction : décomposition en
facteurs premiers, « écrire le calcul et non le résultat », droite
paramétrée). Glisser-déposer, tableur, QCM à branches et couteau suisse
sont remplis depuis (21 exercices). Restent hors du banc les éléments
vérifiés par une fonction propre à l'exercice : figures apigeom (80),
meta-custom (74), schéma en barre, éditeurs de grille et d'empilement de
cubes, justifications par contre-exemple.

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
  `points: null` cassait aussi le score et les sauvegardes de l'app (corrigé
  dans l'app, section 5).

### 1.5 ter QCM

Contrôle des 3 236 QCM (deux graines, `qcm1` et `qcm2`) : aucune proposition
juste, toutes justes, doublons.
- CH 3a5ab (arbre de probabilités), graine `qcm1`, Q1 : « $p(B)=0,3$ »
  proposé deux fois, l'un faux, l'autre juste (seule différence : une espace
  finale dans le texte) ; l'élève qui coche le premier est compté faux.
- 2N10-5 (ca9b7), graine `qcm1`, Q4 : les cinq ensembles (ℕ, ℤ, 𝔻, ℚ, ℝ)
  sont justes (nombre entier naturel) : voulu, mais la question ne teste
  alors rien.

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

## 5. Correctifs faits dans l'app (branche `claude/matalea-extensive-testing-6cdk6g`)

Session 1 (balayage, parcours élève et enseignant, vraie app de bureau) :
- 37a2533 : questions sans champ et figures larges utilisables sur téléphone
  (cadre défilant, « Vérifier » actif après un geste) ;
- bfc0ed4 : question qui affiche plusieurs éléments corrigés, tous vérifiés ;
- 8f65780 : réponses des éléments sans champ gardées, figures à cliquer
  actives (`<clique-figure>` créé) ;
- d457c1a : session partagée rejointe de nouveau, réponses gardées ;
- f44e254 : scores décimaux avec une virgule ;
- 754269f : options de liste déroulante visibles ;
- cd98bb5 : QCM à boutons radio, seul le choix coché compte ;
- 1092081 : relevé de classe lisible (QCM, trous, horloge) ;
- 819f6b3 : trop de réponses pour un QR code, envoi par fichier ;
- dcf35d1 : fichier de parcours avec marque BOM lisible.

Session 2 (figures, chaque type de réponse, justes et fausses) :
- b9481f6 : colonnes de MathALÉA empilées (figure « ci-contre » qui sortait
  de l'écran) ; tableaux de figures qui passent à la ligne ; champ posé sur
  une figure suivi d'une unité, juste compté faux après un aller-retour
  (`trouDansLatex`) ;
- ebda74c : Automatismes chargés en entier (plus de « chargement... ») ;
  polices et sons de MathLive ; figures d'une correction en retrait ;
- c412350 : une question n'est vérifiée que sur ses propres éléments (mon
  correctif de la session 1 associait des figures et des listes d'autres
  questions : scores faussés dans les CAN 2025-2026, 6AutoA2-2, 6N2J-3…) ;
  correction de QCM qui décochait le choix de l'élève ;
- cccb8da, a34137c, 76b5a0e : suites et bancs de test (section 7).
- Résultats du moteur aux points absents (`points: null`) normalisés
  (`resultatNormalise`) : la question juste comptait 0, et un tel essai
  rendait toute sauvegarde impossible à restaurer ; la restauration accepte
  désormais `points: null` pour les essais déjà enregistrés.
- Préparation qui plante selon la graine (6I1B-4 avec « Division »
  seule : 3 graines sur 5) : toute la séance restait sur « Impossible de
  préparer les exercices ». `preparerSansPlantage` refait la préparation
  avec des graines dérivées (`graine~1`, `~2`, `~3`), les mêmes sur chaque
  appareil (séance de classe et relevé de l'enseignant restent identiques) ;
  la séance garde la graine qui a servi. Vérifié : 6 séances sur 6 prêtes,
  l'une menée au tableur jusqu'au bilan (100 %).

## 5 bis. À décider pour l'app

- Politique de sécurité du WebView (`app.security.csp` vaut `null` dans
  `src-tauri/tauri.conf.json`) : une CSP `connect-src`/`style-src`/
  `script-src` limitée à l'app et au moteur (`self`, `moteur:`, `asset:`,
  `blob:`, `data:`) bloquerait les requêtes vers jsdelivr, mathgraph32 et
  podeduc (section 3). À essayer sur Android et iPhone avant de la livrer
  (chargement du moteur téléchargé, polices, figures, vidéos).
  Une CSP sans `'unsafe-eval'` casserait aussi 6I1D (le programme Blockly
  est exécuté par `new Function`).
- Figures apigeom plus larges que l'écran (CM2N2E-1, 778c0 : droite graduée
  de 792 px dans 390 px), vérifié dans une vraie séance à 390 px au doigt :
  la figure a `touch-action: none`, un glissement dessus ne fait pas
  défiler le cadre et crée un point (« A ») là où le doigt s'est posé ;
  glisser sur la consigne « Cliquer pour créer un point. » au-dessus de la
  figure fait défiler (344 px sur 458), mais les boutons partent avec. Les
  points à placer au-delà de l'écran ne sont atteignables que par ce geste
  peu évident. Pistes : réduire la figure à la largeur de l'écran (à
  vérifier : précision du toucher sur des huitièmes à environ 10 px), ou
  une indication « faire glisser au-dessus de la figure ». Côté MathALÉA :
  ne créer le point qu'au relâcher d'un toucher immobile, et une largeur
  de figure adaptée à l'écran.

## 6. Reste à tester

- Figures apigeom (80 éléments) et `meta-custom` (74) : vérifiés par une
  fonction propre à chaque exercice, pas de réponse à lire dans
  `autoCorrection`. Vérifié : sans réponse, les 75 exercices comptent faux,
  sans erreur. Bonne réponse : à tester exercice par exercice dans l'app.
- Audit justes/fausses avec chaque valeur des réglages (6 624 variantes,
  `LISTE=/tmp/claude-0/liste-params.json`, résultats
  `/tmp/claude-0/audit-jf/params.jsonl`) : en cours le 23 octobre au soir
  (environ 2 500 variantes faites ; constats intégrés : 4G20-1, can1E1-01,
  6G6C-1, 6N5-3, entrées orphelines, tolérances d'angles). Faux positifs de
  l'outil écartés à la main : 5N1I-5 (« n'en indiquer qu'une seule » : la
  « fausse » réponse était un autre diviseur juste) et les « Complète
  36 = … × … » des CAN (clé vide, comparaison propre à l'exercice qui
  accepte 4 × 9 et 6 × 6 et refuse 5 × 7).
- `apigeom` (bonnes et mauvaises réponses par de vrais clics sur la
  figure) : CM2N2A-1 (c28e5, fraction de l'unité, 5 types : juste accepté,
  une case de trop et cases non contiguës refusées), CM2N2E-1 (778c0,
  points sur une droite graduée, 2 graines : justes 3/3, un point décalé
  2/3, A et B inversés 1/3). `checkCoords` avec `checkOnlyAbscissa`
  compare quand même l'ordonnée (`he(_.y, a) === he(n, a)`) : sans effet
  tant que les points restent sur l'axe.
  6N1G (e528e), 5N2E-1 (7cfbe), a9120, 6d576, 2ba53 : mêmes
  résultats (juste accepté, point décalé ou inversé refusé). 6G7B-11 (4114e, symétrique d'un
  segment, d'une droite, d'une demi-droite, d'un cercle, d'un triangle ;
  objets créés par l'API de la figure, 3 graines) : image juste 2/2, point
  décalé refusé, droite et segment pris à l'envers acceptés, demi-droite à
  l'envers refusée (1/2 pour les points), figure vide 0/2.
  4dadb (points nommés dans un repère) et 67c96 (symétriques de points
  par rapport à un point), 2 graines : juste accepté, un point décalé
  refusé, points justes mais non nommés refusés (l'élève doit les nommer
  avec l'outil « Nommer »).
  67c96 aussi au doigt, dans une vraie séance à 390 px : outil Point,
  toucher à l'endroit du symétrique, nom tapé dans la boîte (`<dialog>`
  avec champ texte, pas de `prompt()`), Valider, puis « Vérifier » de
  l'app : 1/1 ; premier point mal nommé : 0,7/1.
  580a6 (droite par un point et un vecteur directeur ou un coefficient)
  et d45ce (droite d'équation cartésienne), 3 graines : droite juste 1/1,
  fausse 0/1 ; c360e et 20c65 (représenter une fonction affine, 3 questions,
  3 graines) : idem. Parallélogrammes 4d4a8 (`geoParallelogramme1`) et 784a7
  (`geoParallelogramme2`) : construction de la correction (parallèles,
  intersection D, côtés [CD] et [AD]) 5/5 ; D placé au bon endroit comme
  point libre : 0/5 (« pas toujours parallèles », `checkParallel` secoue
  la figure). Voulu pour 784a7 (« sans tracer de parallèles »), à préciser
  dans l'énoncé de 4d4a8 (« Placer le point D… » ne dit pas qu'il faut le
  construire). 4d4a8 : A, B, C toujours aux mêmes coordonnées, quelle que
  soit la graine ; et une deuxième vérification de la même figure donne
  1/5 après 5/5 (la vérification clique sur « SHAKE » et laisse la figure
  dans un état qui fait échouer le second contrôle). Sans effet dans l'app,
  qui ne vérifie qu'une fois et réaffiche le score enregistré.
  79d64 et e514f (`geoTriangle1`, triangle de trois longueurs ; outils
  Cercle centre-rayon, Point sur, intersection) : construction au compas
  5/5, un rayon faux 2/5, sommets placés aux bonnes coordonnées comme points
  libres 0/5 (« la distance n'est pas toujours égale »). Les deux
  exercices donnent le même triangle (HIJ, 9, 3, 10) à graine égale.
  Médiatrice 0dbe7 (6G3B, couleur imposée) : Milieu puis Droite
  perpendiculaire de la bonne couleur 1/1 ; droite libre au bon endroit
  0/1 ; mauvaise couleur 0/1. L'objet `PerpendicularBisector` serait
  refusé (« n'est pas une droite », le contrôle exige un type contenant
  « Line ») mais l'outil Médiatrice n'est pas dans la barre. Hauteur
  c7c78 et médiane 63d3a : constructions justes 1/1 hormis le défaut
  d'arrondi (section 2.0).
  Carrés et rectangles (e7bad, 95526, 01607, 1d6ca) : construction à la
  règle et au compas 5/5, mauvaises dimensions 3/5 ou 4/5 (95526 accepte
  tout rectangle, voulu), sommets libres 0/5. Vecteur dans un repère
  (3a3ec, en vert comme l'énoncé le demande), point par égalité
  vectorielle (6cf42), points dans un repère quelconque (df171),
  symétriques de points (8d4bf), 2 graines : juste accepté, point décalé
  refusé, rien 0.
  Cercles et disques de couleur et de rayon donnés (f8dee, 3 graines) :
  juste 2/2 ; rayon, couleur ou cercle au lieu de disque faux : 1/2.
  Symétriques axiaux nommés (26ea4) : juste 3/3, mauvais nom ou point
  décalé 2/3.
  6N3B (42fbx, définition du quotient, 2 graines) : points A et B sur la
  droite graduée et les deux champs de la phrase justes 4/4 ; B décalé et
  un champ faux 2/4. Ses champs sont numérotés `champTexteEx3Q100` à
  `Q103` (hors de la numérotation des questions) : sans effet dans l'app,
  qui lit les saisies dans la zone de la question.
  Grilles EN-SquarO (e2024, points bleus attendus `positionsPointsBleus`)
  et EN-Shikaku (ccf19, grille résolue par la sonde), 3 graines : solution
  3/3 ; un point en moins ou en trop, un rectangle manquant ou deux qui se
  chevauchent : 2/3 (barème par paliers annoncé) ; rien 0/3.
  6fdab et b1e01 (`geoElements1/2`, tracer segment, droite et demi-droite
  ; l'élève crée et nomme d'abord les points), 3 graines : juste 3/3,
  demi-droite à l'envers ou segment au lieu de droite 2/3. La notation
  affichée met le crochet fermant hors de la formule (`$[GH$)`, getter
  `notation`).
  1ed48 (Hypatie, `egaliteFG11`, Q1 : trois médiatrices en rouge, bleu,
  vert) : Milieu puis Droite perpendiculaire 3/3, couleurs échangées 0/3,
  une médiatrice manquante 2/3. Les objets `PerpendicularBisectorByPoints`
  sont refusés (« n'est pas une droite unique ») alors que la correction de
  l'exercice les utilise ; défaut latent tant que l'outil Médiatrice n'est
  pas dans la barre (même cas que 0dbe7). Q2 et Q3 non testées.
  Labyrinthes (`mathalea-labyrinthe` : 5N1J-1, 5N1L-3, 5N1autoA,
  5N3autoE-2, labyvec ; 2 graines, vrais clics case par case, chemin en
  8 voisins calculé depuis le modèle) : chemin complet 4/4, un mauvais clic
  0/4 ou 1/4, rien 0/4. Au doigt dans une vraie séance à 390 px (5N1J-1) :
  la grille tient en 358 px, chemin complet 1/1, chemin abandonné après
  deux cases 0,3/1. La grille est dans une racine fantôme fermée
  (`attachShadow({ mode: 'closed' })`) ; en fin de partie l'élément clique
  `#buttonScoreEx<n>`, absent de l'app (sans effet).
  Grilles à remplir, solution tapée case par case au clavier (2 graines) :
  EN-Pyramide (fa607) 5/5, EN-KenKen (5b4fa) 4/4, EN-KillerSudoku
  (4f449, 36 cases) 6/6, EN-TablesEffacees (34c33) 16/16 et 18/18,
  EN-Grimuku (01def) 6/6, EN-EtoileCalculs (e7f3a, champs MathLive) 8/8 ;
  une case fausse retire un point ; rien 0.
  Demi-droite graduée interactive 6N3D-1 (cff13, 3 graines, à 390 px,
  vrais clics : « Max+ », nombre de parts, « Placer le point », clic sur
  l'axe) : point juste 1/1, avec une graduation deux fois plus fine 1/1,
  point décalé d'une part 0/1. La clé contient `showwNegative` (coquille
  de `showNegative`), sans effet sur la note.
  `svg-selection` (1474f pièces de monnaie, 1574f barres fractionnaires,
  1574a plaque de chocolat ; 3 graines, vrais clics, sous-ensemble de la
  bonne somme) : juste 1/1, un élément de trop 0/1, rien 0/1 ; pour 1574f
  toutes les combinaisons justes ont été essayées (défaut d'arrondi en
  2.0).
  5G3A-4 (d37ea, symétrie centrale, mêmes 5 types, 3 graines) : conforme
  hormis les deux constats en 2.0 (triangle en segments, droite passant par
  le centre).
- `meta-custom` (vérification propre à l'exercice), bonnes et mauvaises
  réponses construites à partir de l'état interne de l'exercice : Roses
  (8 exercices, chaque type de question, 3, 5 et 9 valeurs, 3 graines) et
  Yohaku (8 exercices, avec et sans aide, 3 graines) conformes ; 5N1H,
  6N3F-2, 3G95-17, 3G95-17p, 6N2J-3 (listes `Q2t`/`Q2t+1`), 6I1D (programme
  Blockly construit bloc par bloc d'après le trajet : juste accepté, un
  bloc en moins refusé), 6I1B-4 (formules justes acceptées, valeurs
  recopiées et formules fausses refusées). Constats en 1.7 bis, 2.0,
  3 quater. 3b474 et 9103e (anciennes versions de 5N1H, 3 graines, toutes
  les questions) : justes 2/2, étape fausse 1/2 ; résultat final faux 0/2
  dans 5N1H et 3b474 mais 1/2 dans 9103e (le second point y suit le
  quatrième trou). 46bae (`6I1B-5-old-old`, tableur, 10 types de
  formules) : formule juste ou équivalente (`=B1*0.5` pour la moitié)
  acceptée, valeur recopiée, formule fausse et cellule vide refusées. Avec
  un seul type (« Double »), les trois cellules d'une question demandent
  la même formule (`=B1*2` trois fois).
- Schéma en barre, éditeurs de grille et d'empilement de cubes, QCM à
  branches avec justification par contre-exemple.
- Audit justes/fausses avec une deuxième graine (`audit-jf-2`) : fait,
  10 013 éléments conformes ; nouveaux constats intégrés ci-dessus (2L22-3,
  2mTrigoFct-6, 1A-C14-4, 10FA4E-4). Troisième graine (`audit-jf-3`) :
  9 970 éléments conformes, un seul nouveau cas (CH 6ca15, intervalle).
  Les mêmes familles reviennent à chaque graine : la liste est stable.
- Relevé des requêtes hors de l'appareil et des traces de génération :
  fait (sections 3 et 3 bis).

## 7. Outils

- `node e2e/audit-justes-fausses.mjs` : justes et fausses par l'API du
  moteur, tout le référentiel (`UUIDS`, `GRAINE`, `PAYS`, `SORTIE`).
- `node e2e/types.mjs` : chaque type de réponse dans la vraie app, justes et
  fausses, aller-retour, bilan.
- `node e2e/audit-coherence.mjs` : valeur attendue comparée au résultat mis en
  évidence dans la correction, tout le référentiel (quelques minutes).
- `node e2e/interactions.mjs`, `node e2e/regressions.mjs` et les autres
  suites (README, `docs/developpement.md`).
