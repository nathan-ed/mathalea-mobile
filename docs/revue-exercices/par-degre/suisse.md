# Revue des exercices : Suisse

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **72 sur 1168**. Constats confirmés : **58**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Contenu mathématique faux | 6 |
| Rendu cassé (formule, débordement, erreur) | 12 |
| Mise en évidence (miseEnEvidence et champs) | 6 |
| Typographie (nombres, espaces, notations) | 1 |
| Rédaction (français, titres, consignes) | 33 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| a01f3 | C1 Contenu mathématique faux | Titre « Trouver le plus grand nombre (QCM) » alors que la question est « Quel est le plus petit nombre ? » ; QCM à 2 propositions seulement ; bonne réponse non mise en évidence (10 M3). | Titre « le plus petit ». | src/exercices/CH/a01f3.ts |
| a309b | C1 Contenu mathématique faux | Exercice modèle laissé dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », question « Question 1 » (texte de remplissage) : à retirer de la liste ou de l'app (règle : aucun placeholder). | Retirer de la liste. | src/exercices/CH/a309b.ts |
| a343n | C1 Contenu mathématique faux | Titre « Multiplication par 100 de nombres décimaux » alors que l'exercice multiplie par 1 000 ; correction juste (3 400). | Titre « par 1 000 ». | src/exercices/CH/a343n.ts |
| aaaaa | C1 Contenu mathématique faux | Exercice modèle laissé dans le référentiel : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) » et question « 5+6 » (texte de remplissage) : à retirer (règle : aucun placeholder). | Retirer de la liste. | src/exercices/CH/aaaaa.ts |
| AchangerOBLIGATOIREMENT | C1 Contenu mathématique faux | Deuxième exercice modèle (id « AchangerOBLIGATOIREMENT ») : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) », question « 5+6 », 2 X1 : à retirer de la liste (règle : aucun placeholder). | Retirer de la liste. | src/exercices/CH/AchangerOBLIGATOIREMENT.ts |
| addd5 | C1 Contenu mathématique faux | Titre « Reconnaitre » (Reconnaître) ; correction : « Vous avez choisi : . » (la valeur choisie n'apparaît pas : phrase vide) ; vouvoiement « Vous avez choisi » seule occurrence ; 2 M6. | Afficher la bonne expression ; reconnaître. | src/exercices/CH/addd5.ts |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| a1e38 | X4  | Exercice « Consulter la liste des patterns disponibles pour différents exercices » : outil de développeur/enseignant exposé dans l'app, énoncé de 15 606 nombres hors des $ (N1), 972 guillemets T4, 96 X4 (énoncé vide), « Pour le motif 43, il y a 87 soleils » (nombres hors $) : sans intérêt pour un élève. | Retirer des exercices proposés aux élèves. | src/exercices/CH/a1e38.ts |
| a343t | X2 Formule cassée | Énoncé : « $25$; $50$; $75$; $$ [champ] » : $$ vide (délimiteur de mode display sans formule) → 14 X2 ; correction « Ainsi, ? = 75+25 » avec « ? » non défini ; « Complète » ; 26 R2. | Remplacer $$ par $\dots$. | src/exercices/CH/a343t.ts |
| a9f31 | X4  | « Créer une animation de construction aux instruments (Instrumenpoche) » : outil d'enseignant (éditeur IEP) sans question ni correction (4 X4) : à retirer des exercices proposés aux élèves ; 2 pages > 390 px. | Retirer pour les élèves. | src/exercices/CH/a9f31.ts |
| a9f71 | X4  | « Produire un diagramme » : outil diagram-builder sans consigne (énoncé vide, 4 X4, 2 IM) ; à tester à la main. | Ajouter une consigne ; tester à la main. | src/exercices/CH/a9f71.ts |
| a9f82 | X4  | « Illustrer le crible d'Ératosthène » : outil d'illustration sans consigne ni correction (4 X4) ; non évaluable. | Retirer ou ajouter une consigne. | src/exercices/CH/a9f82.ts |
| a9f83 | X4  | « Créer un schéma en barre » : outil schema-en-barre sans consigne ni correction (20 X4) ; non évaluable. | Ajouter une consigne. | src/exercices/CH/a9f83.ts |
| acb80 | X1 Erreur | Pyramide à base triangulaire : 64 X1 (exécution interrompue du banc, à repasser), 160 M1 ; correction juste (V≈41 cm³) ; « arrondi au $\text{ cm}^3$ près » unité sans nombre ; 73 pages > 390 px. | Repasser le banc ; « à l'unité de cm³ près ». | src/exercices/CH/acb80.ts |
| acbb6 | X3  | Identifiants « cols-responsive…-undefined » et bloc &lt;style> dans l'énoncé (52 X3, même défaut que 6N4A-1) ; « les élèves qui ont choisi la réponse D » lettre D non rappelée dans la légende affichée ; « 20 élèves » hors des $. | Numéro d'exercice dans les id ; $20$. | src/exercices/CH/acbb6.ts |
| ad5f5 | X4  | « Tracer des droites graduées » : outil de dessin (figure seule, énoncé et correction vides, 98 X4) : n'est pas un exercice évaluable pour un élève. | Retirer pour les élèves ou ajouter consigne. | src/exercices/CH/ad5f5.ts |
| ad5f6 | X4  | « Construire des droites graduées avec zoom » : outil sans consigne ni correction (22 X4). | Idem. | src/exercices/CH/ad5f6.ts |
| ad5f7 | X4  | « Utiliser des grilles décimales » : outil sans consigne (28 X4). | Idem. | src/exercices/CH/ad5f7.ts |
| ad5f8 | X4  | « Fabriquer des pavages pour travailler les transformations » : outil sans consigne (28 X4). | Idem. | src/exercices/CH/ad5f8.ts |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| a2ac2 | M6  | Résolution graphique f(x)=k : correction « Il y en a 1 (tracé rouge en pointillés) » : couleur pour désigner un tracé ; 2 M6 ; 12 figures > 390 px. | Désigner par le nom du tracé. | src/exercices/CH/a2ac2.ts |
| a3870 | M1 Évidence refusée par le champ | Labyrinthe de multiples : 289 M1 (deux champs sortie / nombre de cases, ordre inverse de la correction : même défaut que 6N3autoD-2) ; 995 N1. | Même ordre champs/correction. | src/exercices/CH/a3870.ts |
| a55d2 | M3  | QCM à réponses multiples : correction sans l'ensemble des bonnes propositions en évidence (30 M3, 30 M6) ; 293 N1 ; réponses justes (2, 5, 10 ; 3 non : somme 28). | Évidence des propositions. | src/exercices/CH/a55d2.ts |
| a8c21 | M1 Évidence refusée par le champ | Encadrement : correction en trois évidences « $⟦9\,858,9⟧&lt;9\,858,⟦9⟧99&lt;⟦9\,859⟧$ » dont le chiffre « 9 » au milieu du nombre (évidence parasite, 33 M1) ; « au dixième: » sans espace avant les deux-points (42 T3) ; 208 « Choisir… ». | Deux évidences (borne inférieure, borne supérieure). | src/exercices/CH/a8c21.ts |
| ac571 | M1 Évidence refusée par le champ | « Donner une valeur approchée au dixième de cm pour l'un et au dixième de cm² pour l'autre » : unités exigées par les champs mais absentes des évidences (112 M1) ; « \approx31,416\text{ cm} » trois décimales alors que l'approximation demandée est au dixième ; « 2·5·π cm » unité dans le produit. | Unités dans l'évidence ; arrondir à 31,4. | src/exercices/CH/ac571.ts |
| ad8c8 | M1 Évidence refusée par le champ | Même défaut que acd4a (abscisse entière, grands nombres) : « A( [champ] ) » comme point du plan ; 29 M1 ; correction faite de figures sans texte. | Idem acd4a. | src/exercices/CH/ad8c8.ts |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| a3f3b | T6 Points de suspension | « $0,3\text{ L}=0,3\cdot1\,000\text{ cm}^3$ » \cdot CH conforme ; 11 T6 (« Choisir… ») ; correction juste. | RAS. | src/exercices/CH/a3f3b.ts |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| a09e5 | R16  | Limite en +∞ : « lim (-2-5x)/(4x-7) = lim -5x/4x » sans justification (équivalent des termes de plus haut degré non nommé) ; titre « Calculer une limite » ; résultat -5/4 juste. | Citer la règle (termes de plus haut degré). | src/exercices/CH/a09e5.ts |
| a0d16 | R10 Français | « $300\,000$$⍽=$ » : deux $ collés ($$ = mode display) avant l'égal ; titre « Associer un nombre décimal à sa notation scientifique » alors que la consigne demande de donner la notation ; 8 N6. | $300\,000=$ en un dollar ; titre cohérent. | src/exercices/CH/a0d16.ts |
| a12ef | R16  | Correction : « et $452$ est vient juste après $428$ » (faute de frappe : « est » en trop) ; « Entoure » (consigne papier dans une app tactile ; « Choisir ») ; énoncé « qui vient juste après 428 » ambigu (432 serait le suivant) ; 26 R2. | « 452 vient juste après 428 » ; « Choisir ». | src/exercices/CH/a12ef.ts |
| a2993 | R3  | Titre « Trouve l'heure sur une horloge (QCM) » (tutoiement) ; propositions « Pendule 1/2/3 » sans l'image dans le texte (15 X4 : énoncé vide, 6 R2) ; correction « 15h15 » écrit sans espaces ni $. | « Trouver l'heure » ; « 15 h 15 ». | src/exercices/CH/a2993.ts |
| a2b75 | R5 Virgule | Correction : « on peut procéder par élimination : • Les Berlines occupent exactement la moitié du disque, soit 50 % » ; 23 phrases sans virgule ; « $50 \,\%$ » espace avant \, ; lecture visuelle seule : valeur à lire, pas de mesure. | « $50\,\%$ » ; virgules. | src/exercices/CH/a2b75.ts |
| a343a | R16  | « Détermine le reste » (tutoiement CH) ; 26 R2 (« reste » en évidence) ; correction juste (40=7·5+5). | Voir règle tutoiement/infinitif. | src/exercices/CH/a343a.ts |
| a343b | R16  | « 4 gommes coûtent 7 euros » nombres en dollars mais unité « euros » en texte ; correction : « 7+3,50 » ; prix « 3,50 » avec zéro final contre « 10,50 » : cohérent ; 12 T6. | RAS (CH : francs). | src/exercices/CH/a343b.ts |
| a343i | R16  | Correction : « La moitié de 24 est égal à » (est égale à) ; énoncé « La moitié de 24 » sans verbe. | « est égale à » ; « Calculer la moitié de 24 ». | src/exercices/CH/a343i.ts |
| a343m | R3  | « $3$ min $30$ s » unités hors des $ ; « $3$ min $ + $ $0,5$ min » espaces autour du + ; 11 T6. | $3\text{ min}$. | src/exercices/CH/a343m.ts |
| a343q | R13  | Titre « Ecriture décimale » sans accent (É) ; correction « $3\cdot1000+5\cdot0,1$ » : 1000 sans espace fine (1 000). | Écriture ; 1\,000. | src/exercices/CH/a343q.ts |
| a343s | R3  | Calcul juste (5 700) ; $\cdot$ CH conforme. | RAS. | src/exercices/CH/a343s.ts |
| a343u | R16  | Titre « Répartition » pour un exercice de périmètre de rectangle (titre copié d'a343p) ; correction juste (2·(5+4)=18). | Titre « Périmètre d'un rectangle ». | src/exercices/CH/a343u.ts |
| a343v | R3  | Tableau « 21 42 3 ? » en texte brut (nombres hors des $, 78 N1) ; $\text{⍽? }=$ ; correction juste. | Vrai tableau. | src/exercices/CH/a343v.ts |
| a343w | R3  | Conversion juste (43 m) ; 12 T6 ; « dam » unité peu courante à ce niveau (CH). | RAS. | src/exercices/CH/a343w.ts |
| a343x | R3  | Correction : « égale à $180$° » (° hors du dollar) puis « $90^\circ+40^\circ+\text{⍽? }=180^\circ$ » ; « ?= » mis en évidence 50 ; 8 T6. | $180^\circ$. | src/exercices/CH/a343x.ts |
| a3bc7 | R3  | « $⟦\dfrac{2}{4}⟧$$=⟦\dfrac{1}{2}⟧$ » : deux dollars collés ; réponse attendue 2/4 ou 1/2 : les deux acceptées ? (« coloriée » -> « coloriée »). | Un seul dollar. | src/exercices/CH/a3bc7.ts |
| a3x3b | R3  | « une religieuse à $2$ euros et $6$ cookies à $40$ centimes » : unités en toutes lettres hors des $ ; « $2,40+2=⟦4,40⟧$ » ; calcul juste. | $2\text{ euros}$ ou « francs » ? (CH : francs). | src/exercices/CH/a3x3b.ts |
| a3y3b | R16  | « $\dfrac{4}{6}=\dfrac{?}{12}$ » : point d'interrogation en italique dans le dollar ; « $\text{? }=$ » ; correction « ?=2·4=8 » : le « ? » devient inconnue sans nom. | Nommer l'inconnue (x). | src/exercices/CH/a3y3b.ts |
| a49d5 | R3  | Proposition « $a^{6{n}}$ » (accolades autour de n inutiles) ; « Soient a un nombre réel non nul et n un entier » (n∈ℕ dans la correction) ; 13 doubles espaces. | $a^{6n}$ ; n entier naturel. | src/exercices/CH/a49d5.ts |
| a4cb3 | R3  | Calcul juste (A/B+1=7/3) ; titre avec espace final ; \cdot (CH) ; QCM sans évidence. | RAS. | src/exercices/CH/a4cb3.ts |
| a4cbf | R16  | Titre « Calculer avec les chiffres » pour $2+0+2+5$ (clin d'œil à l'année) ; réponse 9 juste ; exercice trivial. | RAS. | src/exercices/CH/a4cbf.ts |
| a5300 | R3  | « Calculer la température moyenne , au dixième près » (espace avant la virgule) ; 78 T3 (espaces avant deux-points) ; « 13,8 °C » : °C hors du dollar sans espace (comme BP2AutoD2) ; calcul juste. | Espace ; $13,8~\text{°C}$. | src/exercices/CH/a5300.ts |
| a59w1 | R3  | Propositions « OUI » / « NON » en majuscules ; « ⟦n'est pas un multiple⟧ » texte dans l'évidence ; 3 M3. | Oui/Non en minuscule ; texteEnCouleurEtGras. | src/exercices/CH/a59w1.ts |
| a5ab7 | R3  | « Voici la série de nombres : $5$; $6$; … » : point-virgule collé aux dollars, 30 valeurs sans espace ; 1 920 N1 (nombres hors des $ dans la correction « 1, 2, 2, … ») ; « valeurs aberrantes » (critères non rappelés). | Séparateurs ~;~ ; nombres entre $. | src/exercices/CH/a5ab7.ts |
| a6e9f | R3  | Correction juste (médiane 11) ; « $4^{\text{e}}$ » ; liste « $2 \,;\, 11 …$ » espace fine ; \text{e} correct. | RAS. | src/exercices/CH/a6e9f.ts |
| a7515 | R16  | Titre « …(ancien exercice) » : mention interne affichée aux élèves ; 16 M3 : proposition non mise en évidence ; 4 phrases sans virgule. | Retirer « (ancien exercice) ». | src/exercices/CH/a7515.ts |
| a8e1d | R3  | Titre « Convertir m$^3$ et Litres » (dollar dans le titre, « Litres » majuscule) ; conversion juste (20,25 m³) ; « $1\text{ L} =0,001\text{ m}^3$ » espaces. | « litres » ; titre sans LaTeX. | src/exercices/CH/a8e1d.ts |
| a9046 | R16  | « le nombre de préimage(s) de $-4$ » (« nombre d'antécédent(s) » dans le titre : deux vocabulaires) ; « a $0$ préimage » ; correction juste. | Un seul terme : antécédent. | src/exercices/CH/a9046.ts |
| aa613 | R3  | « $u_{2\,025}$ » : indice avec espace fine (année) ; correction juste (suite constante 1). | $u_{2025}$. | src/exercices/CH/aa613.ts |
| ab0ff | R3  | « Complète : » (tutoiement) ; 23 R2 ; 11 T6 ; correction juste (800 cm). | RAS. | src/exercices/CH/ab0ff.ts |
| acd4a | R3  | Abscisses « A( [champ] ) B( [champ] ) C( [champ] ) » : coordonnées d'un point sur une droite graduée écrites comme des points du plan ; 25 M1 ; correction faite de 9 figures sans texte. | Écrire « A: [champ] » ; texte de correction. | src/exercices/CH/acd4a.ts |
| autres-1 | R16  | Correction : « il avance de $2$ fois de $15$ pas » (« il avance 2 fois de 15 pas ») ; programme Scratch en texte brut « répéter [2] fois avancer de [15] pas » ; 208 doubles espaces ; exercice CH sans équivalent FR (périmètre : CH only). | « 2 fois 15 pas ». | src/exercices/CH/autres-1.ts |
| autres-13 | R3  | Suite de décimaux « 2,50 ; 2,75 ; 3 » : le 3 devrait s'écrire 3,00 ; « Complète » (tutoiement CH) ; « 3+0,25 » ; 21 R2. | 3,00 ; vouvoiement/infinitif selon l'app. | src/exercices/CH/autres-13.ts |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| afd39 | I2 Réponse fausse acceptée | 1 | réponse fausse acceptée |
| acb80 | X1 Erreur | 64 | interactif (incorrecte) : page.evaluate: Target page, context or browser has been closed |
| AchangerOBLIGATOIREMENT | X1 Erreur | 1 | console : Un exercice simple doit avoir un this.reponse sauf si c'est un qcm ou un MathaleaCustomElement avec sa propre autoCorrection |
| bc372 | X1 Erreur | 3 | génération : page.evaluate: TypeError: this.sup.split is not a function     at SimulateurDes.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/profs/P01 |
| a343t | X2 Formule cassée | 14 | nombre impair de $ : ique de nombres&nbsp;: $25$&nbsp;; $50$&nbsp;; $75$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m |
| afd39 | X2 Formule cassée | 1 | nombre impair de $ : $P(x)=a(x-\alpha)^2+\beta)$, avec $a&lt;0$ est croissant sur $$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- |
| c8ee7 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : N1 Nombre hors $ 7605 ; T4  480 ; T2  371 ; T6 Points de suspension 243 ; T5 Espaces 240 ; R2 Tutoiement, impératif 174 ; T3  127 ; R5 Virgule 100 ; N6 Écriture algébrique 71 ; N2 Séparateur des milliers 55 ; X3  38 ; M7  33 ; X2 Formule cassée 12 ; R10 Français 12 ; R6  1 ; T1 Espace avant % 1.
