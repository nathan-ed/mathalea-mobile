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
can6a-CoopMaths (3a526, Q25), canc3a-2023 (57239, Q9).

Tolérances explicites à vérifier (bonne réponse + 1 acceptée, voulu ?) :
- 3G32-2 (5986b, Q3, 4, 7) : « 33,16 m », `precisionUnite: 1` (réponse au
  cm, tolérance d'un mètre) ; 3G32-0, 3G32-3, 3G32-4, 3G42 : idem au mètre ;
- 5G5D-1 (06b1a, Q1 à 3) : aires de 12 à 27 cm², `precisionUnite: 3` ;
- can5a-CoopMaths (9e40d) Q27 et 3G32-0, 3G32-1 : `precisionUnite: 1000` (km).

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

### 1.8 À vérifier

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
  descriptif mais pas trop long) ») et l'exercice de test « testEEE »
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

## 5 bis. À décider pour l'app

- Politique de sécurité du WebView (`app.security.csp` vaut `null` dans
  `src-tauri/tauri.conf.json`) : une CSP `connect-src`/`style-src`/
  `script-src` limitée à l'app et au moteur (`self`, `moteur:`, `asset:`,
  `blob:`, `data:`) bloquerait les requêtes vers jsdelivr, mathgraph32 et
  podeduc (section 3). À essayer sur Android et iPhone avant de la livrer
  (chargement du moteur téléchargé, polices, figures, vidéos).

## 6. Reste à tester

- Figures apigeom (80 éléments) et `meta-custom` (74) : vérifiés par une
  fonction propre à chaque exercice, pas de réponse à lire dans
  `autoCorrection`. Vérifié : sans réponse, les 75 exercices comptent faux,
  sans erreur. Bonne réponse : à tester exercice par exercice dans l'app.
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
