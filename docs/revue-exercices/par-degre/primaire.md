# Revue des exercices : Primaire

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **142 sur 145**. Constats confirmés : **98**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Interactif faux (la bonne réponse est refusée, ou pas de champ) | 2 |
| Contenu mathématique faux | 14 |
| Rendu cassé (formule, débordement, erreur) | 6 |
| Mise en évidence (miseEnEvidence et champs) | 7 |
| Typographie (nombres, espaces, notations) | 25 |
| Rédaction (français, titres, consignes) | 44 |

## Interactif faux (la bonne réponse est refusée, ou pas de champ)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canc3C12 | I1 Bonne réponse refusée | Réponse négative possible (a jusqu'à 20, b×res dès 6 : « J'ajoute $20$, … j'obtiens $7$ » → $-6$) en CM1/CM2, avec le clavier clavierNumbers sans signe moins : l'élève ne peut pas saisir la réponse. | Tirer res avec b×res > a (res = randint(Math.ceil((a + 1) / b), 15)) | src/exercices/can/c3/canc3C12.ts:36 |
| CM2N1D-2 | I4 Question sans champ | Puissances de 10 en lettres (sup coché), type « Décomposer » : le champ est inséré à l'intérieur de la formule (`${ajouteChampTexteMathLive(…)}~unité+` dans $…$) : aucun champ n'apparaît, la formule s'affiche avec ses $ (« $3= ~unités$ ») et les mots unité, dizaines… sont en italique hors \text. 110 tirages touchés | fermer la formule avant le champ : `$${champ}$~\\text{${mot}}+` | src/exercices/CM2/CM2N1D-2.ts:173 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| CM2N3G-1 | C1 Contenu mathématique faux | Cas « facteur manquant » (champ avant le produit) : l'énoncé affiche la fraction deux fois, « $\dfrac{99}{100}\times$ [champ] $\times\dfrac{99}{100}=\dfrac{990}{100}$ », alors que la correction est « ⟦10⟧$\times\dfrac{99}{100}=\dfrac{990}{100}$ » (texte += puis texteApres: texte) | construire l'énoncé une seule fois : champ puis $\times\dfrac{99}{100}=…$ | src/exercices/6e/_MultiplierDecimauxPar101001000.ts:395 |
| CM2N3G-2 | C1 Contenu mathématique faux | Cas « facteur manquant » (champ avant le produit) : l'énoncé affiche la fraction deux fois, « $\dfrac{99}{100}\times$ [champ] $\times\dfrac{99}{100}=\dfrac{990}{100}$ », alors que la correction est « ⟦10⟧$\times\dfrac{99}{100}=\dfrac{990}{100}$ » (texte += puis texteApres: texte) | construire l'énoncé une seule fois : champ puis $\times\dfrac{99}{100}=…$ | src/exercices/6e/_MultiplierDecimauxPar101001000.ts:395 |
| canc3a-NY2024 | C1 Contenu mathématique faux | Q26 : « il y a $4$ intervalles. Une graduation correspond donc à $8$ unités » : le 8 est écrit en dur alors qu'avec 4 intervalles entre 2 000 et 2 024 une graduation vaut 6 (réponse 2 006 juste, explication fausse). | Une graduation correspond donc à $${texNombre(24 / nbIntervalles)}$ unités. | src/exercices/can/6e/CANSpeciale2024.ts:767 |
| canc3a-2023 | C1 Contenu mathématique faux | Q11 : correction « Puisque Zoé en a 3 de plus, sa sœur en a 3 de moins » : l'autre enfant (Zacharie…) n'est pas forcément une sœur ; double espace « en  a », espace avant « : ». | Puisque ${prenom1} en a $b$ de plus, ${prenom2} en a $b$ de moins, soit : | src/exercices/can/c3/_Canc3a.ts:582 |
| canc3C07 | C1 Contenu mathématique faux | Correction inversée (branche « prenom2 a b ans de moins que prenom1 ») : énoncé « Nawel a $2$ ans de moins que Gaspard », correction « Gaspard a $2$ ans de moins que Nawel. Il a donc… » (prénoms échangés ; « Il » pour une fille possible). | ${prenom2} a $b$ ans de moins que ${prenom1}. ${prenom2} a donc… | src/exercices/can/c3/canc3C07.ts:107 |
| canc3a-2026 | C1 Contenu mathématique faux | Q30 : « Il faut partager $370$ en $10$ » : on fait des paquets de 10 (partager en 10 donne 10 parts de 37) ; Q17 : « soit $8+2$ » sans unité ni sens clair. | Il faut faire des paquets de $10$ : $370=37\times 10$. | src/exercices/can/canc3a-2026 |
| canCE1a-2025 | C1 Contenu mathématique faux | Q2 : la correction dit « Pour passer des mm au m, on multiplie par 1 000 » (et « des cm au m, on multiplie par 100 ») : c'est l'inverse, on divise (ou : pour passer des m aux mm, on multiplie). | Pour passer des $\text{m}$ aux $\text{mm}$, on multiplie par $1\,000$. | src/exercices/can/canCE1a-2025/canCE1-2025-Q2.ts:69 |
| canCE2a-2025 | C1 Contenu mathématique faux | Q4 : correction « Une forêt est un rectangle dont les côtés mesurent en moyenne environ 1 km » : affirmation fausse présentée comme un fait. | Si une forêt avait la forme d'un carré d'environ $1~\text{km}$ de côté, son périmètre serait proche de $4~\text{km}$. | src/exercices/can/canCE2a-2025 |
| canCE2a-2025 | C1 Contenu mathématique faux | Q14 : « compris entre 238 et 300 » avec chiffre des dizaines 3 : 238 convient aussi si « entre » est large ; seule 239 est acceptée. Nombres hors $. | strictement compris entre $238$ et $300$ | src/exercices/can/canCE2a-2025 |
| canc3a-NY2025 | C1 Contenu mathématique faux | Q8 : quand l'écart vaut 5 (2 020 à 2 025, 5 intervalles), la correction écrit « $5 \div 5 = 5$ » et « Une graduation correspond donc à $5$ unités » : valeur écrite en dur, juste seulement pour l'écart 25. | $${texNombre(abs1 - abs0)} \\div 5 = ${choix ? 5 : 1}$ (modèle : canc3NY-2026-Q8, variable pas) | src/exercices/can/canNY-2025/canc3NY-2025-Q8.ts:63 |
| CM2N1D-1 | C1 Contenu mathématique faux | « en complétant avec les adjectifs numéraux qui conviennent (unité(s) ou dizaine(s)…) » : unité, dizaine, centaine sont des noms, pas des adjectifs numéraux ; mise en évidence de toute la décomposition avec les mots en \textbf (texte dans miseEnEvidence) ; « ou ... » / « ou $....$ » | « avec les mots qui conviennent (unités, dizaines…) » ; \ldots | src/exercices/CM2/CM2N1D-1.ts:104 |
| CM2N3A-14 | C1 Contenu mathématique faux | Types « 10 - n » et « n + … = 10 » seuls : moins de cas possibles que les $10$ questions par défaut, la série est plus courte que l'autoCorrection (champs absents) | limiter nbQuestions au nombre de cas ou autoriser les doublons | src/exercices/CM2/CM2N3A-14.ts |
| CM2N3A-2 | C1 Contenu mathématique faux | Valeur maximale 1 : une seule question produite au lieu des $10$ demandées, avec des nombres au-delà du maximum (« $2+2$ ») ; autoCorrection plus longue que la liste (champs absents) | borner le paramètre (minimum 2 ou 3) ou autoriser les doublons quand il n'y a pas assez de cas | src/exercices/CM2/CM2N3A-2.ts |
| CM2N3A-3 | C1 Contenu mathématique faux | Valeur maximale 1 : une seule question produite au lieu des $10$ demandées, avec des nombres au-delà du maximum (« $2+2$ ») ; autoCorrection plus longue que la liste (champs absents) | borner le paramètre (minimum 2 ou 3) ou autoriser les doublons quand il n'y a pas assez de cas | src/exercices/CM2/CM2N3A-3.ts |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canc3a-2023 | X5 Débordement à 390 px | Q10 : correction « soixante-et-un-mille-cinquante = 61 000 + 50 = 61 050 » coupée à droite à 390 px (formule d'un seul tenant, mot dans \text). | Mot hors formule, formule à la ligne. | src/exercices/can/c3/_Canc3a.ts |
| canCE2a-2025 | X4  | Version non interactive : Q5 « Le triple de $23$ » et Q16 « Le triple de $25$ est : » s'arrêtent sans demande ni pointillés (énoncé incomplet hors interactif). | Le triple de $23$ est $\ldots$ | src/exercices/can/canCE2a-2025 |
| CM1N1E | X4  | 24 combinaisons de paramètres sur 71 ne génèrent aucune question (exemples : sup=3 sup2=6 sup3=7 ; sup=4 sup2=1 sup3=3 ; sup=5 sup2=1 sup3=4) : l'exercice reste vide (aucune boucle de tirage ne trouve de nombre). | Limiter les combinaisons proposées ou prévoir un repli quand cpt atteint la limite. | src/exercices/CM1/CM1N1E.ts |
| CM2N1D-2 | X2 Formule cassée | Type « Donner le nombre » avec 1 chiffre (sup2=1) : énoncé « … de l'égalité. =$ » ($ visible) et correction « {\color…\boldsymbol{$0}}$ » (erreur KaTeX « 0}} ») ; mises en évidence avec les mots (⟦6~\text{dizaines}⟧) alors que le champ attend « dizaines » ou un nombre | $=$ avant le champ ; une valeur par champ en évidence | src/exercices/CM2/CM2N1D-2.ts:297 |
| CM2N2E-1 | X5 Débordement à 390 px | Droite graduée apigeom de 750 à 830 px : à 390 px seule la partie de 0 à environ 1,5 est visible, les points à placer (ex. $\dfrac{8}{2}$) sont hors de l'écran (capture revue/captures/cm2/CM2N2E-1) | unité plus petite ou figure ajustée à la largeur (côté MathALÉA), ou défilement horizontal du conteneur (côté app) | src/exercices/CM2/CM2N2E-1.ts |
| CM2N2E-2 | X5 Débordement à 390 px | Droite graduée apigeom de 750 à 830 px : à 390 px seule la partie de 0 à environ 1,5 est visible, les points à placer (ex. $\dfrac{8}{2}$) sont hors de l'écran (capture revue/captures/cm2/CM2N2E-2) | unité plus petite ou figure ajustée à la largeur (côté MathALÉA), ou défilement horizontal du conteneur (côté app) | src/exercices/CM2/CM2N2E-2.ts |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| CM2N3G-1 | M1 Évidence refusée par le champ | Cas « dénominateur manquant » (« $100\times\dfrac{338}{[champ]}=\dfrac{33\,800}{1\,000}$ ») : la correction met en évidence le facteur $100$ (donné) et pas le dénominateur $1\,000$ à trouver ; « $\dfrac{34}{⟦1000⟧}$ » sans séparateur | miseEnEvidence(texNombre(choixPuissance10)) au dénominateur | src/exercices/6e/_MultiplierDecimauxPar101001000.ts:666 |
| CM2N3G-2 | M1 Évidence refusée par le champ | Cas « dénominateur manquant » (« $100\times\dfrac{338}{[champ]}=\dfrac{33\,800}{1\,000}$ ») : la correction met en évidence le facteur $100$ (donné) et pas le dénominateur $1\,000$ à trouver ; « $\dfrac{34}{⟦1000⟧}$ » sans séparateur | miseEnEvidence(texNombre(choixPuissance10)) au dénominateur | src/exercices/6e/_MultiplierDecimauxPar101001000.ts:666 |
| canc3a-2023 | M1 Évidence refusée par le champ | Q16, Q19 : fraction réponse mise en évidence en deux morceaux (numérateur et dénominateur séparés $\dfrac{⟦2⟧}{⟦10⟧}$) : la valeur saisie attendue n'apparaît pas comme une seule mise en évidence. | miseEnEvidence('\\dfrac{2}{10}') | src/exercices/can/c3/_Canc3a.ts |
| CM2D3B-2 | M1 Évidence refusée par le champ | Durée demandée « (en h et min) » : la correction met en évidence ⟦85⟧ minutes ; la réponse attendue « 1 h 25 min » n'est pas mise en évidence (« soit 1 heure 25 minutes » en texte normal) ; nombres hors $ dans tout l'exercice (« parcourt 8 $\text{km}$ en 40 minutes ») | mettre en évidence $1$ h $25$ min ; $8$ km, $40$ min | src/exercices/CM2/CM2D3B-2.ts |
| CM2N1D-2 | M8 Évidences et champs | Type « Décomposer » en chiffres : un champ par chiffre, mais la correction met en évidence toute la décomposition d'un bloc (⟦(3\times 1\,000)+(2\times 100)+(3\times 1)⟧) | mettre en évidence chaque chiffre à saisir | src/exercices/CM2/CM2N1D-2.ts:186 |
| CM2N3A-10 | M1 Évidence refusée par le champ | Divisions à trous « $32\div$ [champ] $=8$ » : la correction met en évidence le quotient ⟦8⟧ (donné dans l'énoncé) au lieu du diviseur à trouver ($4$) | $32\div ${miseEnEvidence(4)} = 8$ | src/exercices/CM2/CM2N3A-10.ts |
| CM2N3A-9 | M1 Évidence refusée par le champ | Divisions à trous « $32\div$ [champ] $=8$ » : la correction met en évidence le quotient ⟦8⟧ (donné dans l'énoncé) au lieu du diviseur à trouver ($4$) | $32\div ${miseEnEvidence(4)} = 8$ | src/exercices/CM2/CM2N3A-9.ts |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| CM2G5B-1 | T5 Espaces | Arêtes notées « [$JF$] », « [$⟦KG⟧$] » : crochets hors de la formule | $[JF]$ | src/exercices/6e/_Solide_6e.ts |
| canc3a-2023 | N1 Nombre hors $ | Q25 : « une figure d'aire 5 unités d'aire », « une figure de 5 unités d'aire » : nombres hors $. | $5$ unités d'aire | src/exercices/can/c3/_Canc3a.ts |
| canc3a-2023 | N7 Prix | Q27 : « $4,3$ € » : prix sans le zéro des centimes. | texPrix : $4{,}30$ € | src/exercices/can/c3/_Canc3a.ts:1468 |
| canc3a-2023 | N3  | Q12 : réponse mise en évidence « 0.18 » (point décimal) : miseEnEvidence(sortie.reponse) sans texNombre. | miseEnEvidence(texNombre(sortie.reponse, 2)) | src/exercices/can/c3/_Canc3a.ts:629 |
| canc3a | T6 Points de suspension | Types 16, 17, 19, 21, 23, 25, 29 : « $.... - 6=1,4$ [champ] », « il fait .... tours. [champ] » : points de suspension et champ ensemble en interactif | \ldots seulement hors interactif ; champ à la place des points | src/exercices/can/c3/canc3a.ts |
| canc3a | N7 Prix | Types 22 et 24 : prix écrits « $5,1$ » et « $5,4$ € » dans le calcul et l'énoncé (« $2\times 5,1$ » après « $5,10$ € pièce ») | texPrix partout | src/exercices/can/c3/canc3a.ts |
| canc3a | N1 Nombre hors $ | Type 18 : « carré de côté 18 » (nombre hors $, sans unité) | carré de côté $${a}$ cm | src/exercices/can/c3/canc3a.ts:333 |
| canc3D03 | T2  | Énoncé « Calculer $1\text{ h } 30$ min + $1\text{ h } 10$ min. » : formule coupée, « min » et « + » hors maths. | Calculer $1~\text{h}~30~\text{min}+1~\text{h}~10~\text{min}$. | src/exercices/can/c3/canc3D03.ts |
| canc3D04 | N1 Nombre hors $ | « Placer correctement les aiguilles pour indiquer 11 h 25. » : heure hors $ (question reprise dans CAN CE1 2025, Q18). | indiquer $11~\text{h}~25$. | src/exercices/can/c3/canc3D04.ts |
| canc3N08 | T4  | Lettres entre apostrophes droites ('B', 'A') et « Comme $23$ est impair alors » (virgule avant alors). | la lettre est « A » ; …impair, alors… | src/exercices/can/c3/canc3N08.ts |
| canc3a-2024 | N2 Séparateur des milliers | Q28 : correction « $1$ L $=1000$ mL » (séparateur, unités hors maths) ; Q3 (sujet officiel) : « ⟦2500⟧ » sans séparateur ni point. | $1~\text{L}=1\,000~\text{mL}$ | src/exercices/can/canc3a-2024 |
| canc3a-2025 | T2  | Q6, Q8, Q13, Q23, Q27 : heures, masses et prix avec unité hors maths (« $9$ h $45$ min », « $18$ g », « $2,70$ € », « $5$ euros » à côté de « € »). | $9~\text{h}~45~\text{min}$ | src/exercices/can/canc3a-2025 |
| canc3a-2026 | T6 Points de suspension | Q11 : correction « $5\times 5 = .... + 20$ » : pointillés dans la correction. | $5\times 5=\ldots+20$ ou directement $25=⟦5⟧+20$ | src/exercices/can/canc3a-2026 |
| canCE1a-2025 | N1 Nombre hors $ | Q18 : « Placer correctement les aiguilles pour indiquer 11 h 25. » : nombres hors $ (et seule consigne à l'infinitif du sujet). | indiquer $11~\text{h}~25$. | src/exercices/can/canCE1a-2025/canCE1-2025-Q18 |
| canCE1a-2025 | T2  | Q8 : propositions et correction « $45$ s », « $15$ min » : unité hors maths, sans \text ni espace insécable dans la formule. | $45~\text{s}$ | src/exercices/can/canCE1a-2025/canCE1-2025-Q8.ts:39 |
| canCE1a-2026 | N1 Nombre hors $ | Q18 : « indique 22h15 » (énoncé et correction) : nombres hors $ et sans espaces. | $22~\text{h}~15$ | src/exercices/can/canCE1a-2026/canCE1-2026-Q18.ts |
| canCE1a-2026 | T2  | Q8 : propositions « $25$ m », « $25$ g », « $25$ cm » : unité hors maths. | $25~\text{cm}$ | src/exercices/can/canCE1a-2026/canCE1-2026-Q8.ts |
| canCE2a-2025 | T2  | Q6, Q13 : « $7$ € », « 70 € », correction « $100$ € - $70$ € $ = 30$ € » : unités et signe moins hors maths, formule coupée. | $100~\text{€}-70~\text{€}=30~\text{€}$ | src/exercices/can/canCE2a-2025 |
| canCE2a-2025 | N1 Nombre hors $ | Q15 : bonne réponse mise en évidence « Il y a 9 fois 6 et il reste 2 » : nombres hors $ dans texteEnCouleurEtGras ; « La bonne réponse était » (temps). | texteEnCouleurEtGras('Il y a') $miseEnEvidence(9)$ … | src/exercices/can/canCE2a-2025 |
| canCE2-2026 | T9 Mot en italique | Q3 : correction « $558 + 5 dizaines = 558 + 50$ » : mot « dizaines » en italique mathématique, sans espace. | $558 + 5\text{ dizaines} = 558+50$ | src/exercices/can/canCE2a-2026 |
| canCE2-2026 | T2  | Q4, Q6, Q13 : « $4\,000$ g », « $1$ kg $= 1\,000$ g », « $10$ € » : unités hors maths ; Q13 « J'ai donné: » sans espace insécable, corrections sans point final. | $4~\text{kg}=4\,000~\text{g}$ | src/exercices/can/canCE2a-2026 |
| CM1N1E | N1 Nombre hors $ | Énoncés « composé de 4 chiffres », « On trouve 4 au rang des unités », « est 3 » : chiffres hors $ ; corrections « c'est bien le chiffre des dizaines . » (espace avant le point). | $4$ chiffres ; $4$ ; …des dizaines. | src/exercices/CM1/CM1N1E.ts |
| CM2N2A-4 | T5 Espaces | « Sélectionner$\dfrac{1}{6}$ de la plaque », « Hachurer$…$ » : espace manquante avant la fraction | `${…} $${frac.texFraction}$` | src/exercices/CM2/CM2N2A-4.ts:396 |
| CM2N3A-7 | N2 Séparateur des milliers | Valeur maximale 9999 : nombres écrits sans séparateur des milliers dans l'énoncé et la correction (« $8905 + 9404 = 18309$ ») | texNombre | src/exercices/CM2/CM2N3A-7.ts |
| CM2N4B-4 | N1 Nombre hors $ | Tirage et nombre cible écrits hors formules (« Voici le tirage : 100 ; 5 ; 8 … Et le nombre à trouver est : 923. ») ; titre avec guillemets droits « "compte est bon" » (aussi CM2N4B-3) | $100$ ; $5$… ; « Le compte est bon » | src/exercices/CM2/CM2N4B-4.ts |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canc3a-2023 | R10 Français | Q24 : correction « $140 = 1$ centaines et $4$ dizaines » : accord (1 centaine), égalité coupée entre maths et texte. | $140 = 1$ centaine et $4$ dizaines | src/exercices/can/c3/_Canc3a.ts |
| canc3a-2023 | R10 Français | Q22 : « Ainsi, en en 1 h et 15 min » (mot répété). | Ainsi, en $1~\text{h}$ et $15~\text{min}$ | src/exercices/can/c3/_Canc3a.ts:1182 |
| canc3a-2023 | R10 Français | Q8 : « oeufs » (œufs), double espace « boites de  $4$ ». | œufs ; boîtes de $4$ | src/exercices/can/c3/_Canc3a.ts:393 |
| canc3a-2023 | R10 Français | Q30 : la question parle de menus, le champ est suivi de « repas » ; « Combien de repas différents peut-on réaliser ? » dans une autre version. | texteApres: 'menus.' | src/exercices/can/c3/canc3a-2023.ts:899 |
| canc3a | R10 Français | Type 13 : « Nadia a $12$ ans. elle a $4$ ans de plus » (minuscule) ; type 24 : « … coûtent $42$ €, combien coûtent … ? » (deux phrases liées par une virgule) | Elle a ; « … coûtent 42 €. Combien coûtent … ? » | src/exercices/can/c3/canc3a.ts |
| canc3a | R10 Français | Type 15 : « Les fraises sont vendus », « Les noix sont vendus » (fruits féminins et masculins) | « Les fraises sont vendues » : accord selon le fruit, ou « Le kilogramme de fraises coûte … » | src/exercices/can/c3/canc3a.ts:281 |
| canc3C18 | R10 Français | « Combien lui reste-t-il de $\text{ km}$ à parcourir ? » : abréviation d'unité employée comme nom dans la phrase. | Combien de kilomètres lui reste-t-il à parcourir ? | src/exercices/can/c3/canc3C18.ts |
| canc3C19 | R10 Français | « Combien de mètres a-t-elle parcouru ? » (accord avec le complément placé avant : parcourus). | Combien de mètres a-t-elle parcourus ? | src/exercices/can/c3/canc3C19.ts |
| canc3a-2024 | R10 Français | Q18 : « le nombre de carreaux entier » (accord). | carreaux entiers | src/exercices/can/can6a-2024/can6a-2024-Q18.ts:91 |
| canc3a-2025 | R10 Français | Q16 : « La figure A est composé » (accord). | est composée | src/exercices/can/can6a-2025/can6a-2025-Q16.ts:91 |
| canc3a-2024 | R10 Français | Q24 : « complète. : » (point puis deux-points) ; Q4 : « carreaux de chocolats » puis « carreaux de chocolat ». | Sachant que $18\times 8=144$, compléter : | src/exercices/can/canc3a-2024 |
| canc3a-2024 | R5 Virgule | Q11 : « Comme … est égal à $4,416$ alors, le plus grand nombre » : virgule après « alors » au lieu d'avant. | …égal à $4{,}416$, alors le plus grand nombre… | src/exercices/can/canc3a-2024/canc3a-2024-Q11.ts:47 |
| canc3a-2024 | R3  | Q15 : « Le périmètre de ce rectangle est égal à [champ] cm » sans point, correction sans unité ni point (« $(6+4)\times 2=…=20$ »). | … $=20~\text{cm}$. | src/exercices/can/canc3a-2024/canc3a-2024-Q15.ts |
| canc3a-2024 | R10 Français | Q16 : « est éagl à » (coquille). | est égal à | src/exercices/can/canc3a-2024/canc3a-2024-Q16.ts:43 |
| canc3a-2024 | R4  | Q23 : énoncé « La moitié de $54$ » suivi du champ, sans verbe (« est »), en interactif comme en non interactif. | La moitié de $54$ est : | src/exercices/can/canc3a-2024/canc3a-2024-Q23.ts:35 |
| canc3a-2025 | R10 Français | Q13 : « Il faur donc » (coquille). | Il faut donc | src/exercices/can/canc3a-2025/canc3a-2025-Q13.ts:35 |
| canc3a-2025 | R10 Français | Q29 : « pour passer des cm au mm » (aux) ; même tournure « des cm au m » dans can6M4-03, can6M4-05, can6a-2021. | pour passer des $\text{cm}$ aux $\text{mm}$ | src/exercices/can/canc3a-2025/canc3a-2025-Q29.ts:33 |
| canc3a-2025b | R10 Français | Q29 : « pour passer des m au cm » (aux) ; Q25 : « Coche la réponse du calcul » (le résultat du calcul). | pour passer des $\text{m}$ aux $\text{cm}$ | src/exercices/can/canc3a-2025b |
| canc3a-2026 | R4  | Q5 « Le double de $19$ », Q18 « La moitié de $250$ » : énoncé sans verbe avant le champ ; Q15 « Combien de fois $\dfrac{1}{10}$ d'unité dans $1$ unité ? » (verbe manquant). | Le double de $19$ est : … ; Combien de fois y a-t-il … | src/exercices/can/canc3a-2026 |
| canc3a-2026b | R4  | Mêmes questions que canc3a-2026 : Q5, Q15, Q18 sans verbe ; Q11 pointillés en correction ; Q30 « partager $370$ en $10$ ». | Voir canc3a-2026. | src/exercices/can/canc3a-2026 |
| canCE1a-2025 | R2 Tutoiement, impératif | Tout le sujet est à l'impératif et au tutoiement (« Coche », « Écris », « Calcule », « Complète », « comptes-tu ») contre la règle de l'infinitif ; à arbitrer pour le CE1 (formulation du sujet officiel ?). |  | src/exercices/can/canCE1a-2025 |
| canCE1a-2025 | R10 Français | Q12 : « Combien en reste-il ? » (t euphonique manquant). | Combien en reste-t-il ? | src/exercices/can/canCE1a-2025/canCE1-2025-Q12.ts:29 |
| canCE1a-2025 | R10 Français | Q14 : correction « se lit quatre- vingts . » : espaces dans la balise &lt;i> (« quatre- vingts » puis espace avant le point). | quatre-&lt;i>vingts&lt;/i>. | src/exercices/can/canCE1a-2025/canCE1-2025-Q14.ts:32 |
| canCE1a-2025 | R10 Français | Q15 (sup=false) : « Quelle est la figure ayant que $4$ axes de symétrie ? » (tournure fautive). | Quelle figure a exactement $4$ axes de symétrie ? | src/exercices/can/canCE1a-2025/canCE1-2025-Q15.ts |
| canCE1a-2025 | R3  | Q17 : « Il y a [champ] pattes » sans point final (texteApres 'pattes'). | texteApres: 'pattes.' | src/exercices/can/canCE1a-2025/canCE1-2025-Q17.ts:34 |
| canCE1a-2026 | R10 Français | Q1, Q2, Q5, Q6, Q8, Q9 : « Entoure » alors que l'élève coche une case dans l'app (QCM). | Coche / Cocher | src/exercices/can/canCE1a-2026 |
| canCE1a-2026 | R3  | Q12, Q13, Q17 : phrase terminée par le champ sans point (texteApres « cartes », « oreilles », rien après « Le double de 19 est : »). | texteApres: 'cartes.' | src/exercices/can/canCE1a-2026 |
| canCE1a-2026 | R10 Français | Q16 : « Combien j'obtiens ? » (registre oral). | Combien est-ce que j'obtiens ? | src/exercices/can/canCE1a-2026/canCE1-2026-Q16.ts |
| canCE1a-2026 | R10 Français | Q5 : correction « $753$ est vient juste après $738$ » (mot en trop). | $753$ vient juste après $738$ | src/exercices/can/canCE1a-2026/canCE1-2026-Q5.ts |
| canCE1a-2026 | R10 Français | Q9 : nombre en lettres écrit en maths ($\textit{Six cent quatre-vingt-dix}$) et en orthographe traditionnelle, alors que le sujet 2025 écrit « cent-soixante-quatorze » (rectifiée) : choisir une orthographe pour les deux sujets. | Entoure le nombre &lt;em>six-cent-quatre-vingt-dix&lt;/em>. | src/exercices/can/canCE1a-2026/canCE1-2026-Q9.ts |
| canCE2a-2025 | R10 Français | Q18 : « Quel nombre j'obtiens si… » (registre oral) ; Q10 : double espace avant « : » (« chiffres  : »). | Quel nombre obtient-on si l'on enlève… | src/exercices/can/canCE2a-2025 |
| canCE2-2026 | R10 Français | Q8 : « Dans $45$ combien de fois $9$ ? » (virgule manquante, présente dans le sujet 2025) ; Q16, Q20 : « Combien j'obtiens ? » ; Q5 « Compléter. » à côté de « Complète. » dans le même sujet. | Dans $45$, combien de fois $9$ ? | src/exercices/can/canCE2a-2026 |
| canc3a-NY2025 | R10 Français | Q25 : « Mehdi en a $1\,600$ timbres » (pronom « en » et complément en double) ; Q30 : correction sans calcul ($2\,043-2\,025=18$, moitié $9$). | Mehdi a $1\,600$ timbres. | src/exercices/can/canNY-2025 |
| canc3a-NY2026 | R10 Français | Q25 : « Mehdi en possède $426$ timbres de moins que Elsa » (élision qu'Elsa, « en » en double) et « Mehdi en a … timbres » ; Q24 : « $2026$ » sans séparateur à côté de « $2\,002$ » ; Q30 sans calcul. | Mehdi possède $426$ timbres de moins qu'Elsa. | src/exercices/can/canNY-2026 |
| CM2D3B-1 | R2 Tutoiement, impératif | « trouve combien pèse un pétoncle » (impératif, 2e personne) ; « $2\,100\text{ g}\div 42$ = $50$ g » (égalité coupée hors formule) ; version tableau : « 100 fois ? .... ? » avec nombres hors $ | Trouver combien… ; $2\,100\text{ g}\div 42=50\text{ g}$ | src/exercices/CM2/CM2D3B-1.ts |
| CM2G2B-2 | R2 Tutoiement, impératif | Consigne « c) Tracer la droite … et nomme $M$ » : « nomme » au lieu de « nommer » (alors que le reste est à l'infinitif) ; correction « contrôle la position du point $E$ » | nommer ; on peut contrôler | src/exercices/CM2/CM2G2B-2.ts |
| CM2G2A-1 | R2 Tutoiement, impératif | Correction : « Pour la perpendiculaire en $B$, contrôle la position du point $E$ » (tutoiement) | on peut contrôler la position du point $E$ | src/exercices/CM2/CM2G2B-2.ts:244 |
| CM2G3D-1 | R10 Français | « on peut vérifier que tous les côtés du carré mesure environ » (accord) ; phrase d'auto-correction en orange (texteEnCouleur par défaut) ; même code dans CM2G3D-2 | mesurent ; texteEnCouleur(…, bleu) ou texte normal | src/exercices/CM2/CM2G3D-1.ts:838 |
| CM2G5C-1 | R10 Français | « Le dessin 2 poséde des faces » (deux fois) ; « Procédons par élimination: » (espace avant :) ; numéros de dessins et nombres de faces hors $ | possède ; élimination : ; $4$, $5$ faces | src/exercices/CM2/CM2G5C-1.ts:279 |
| CM2N2U-2 | R6  | Libellé du paramètre « Enoncé avec « nombre mixte » » (majuscule sans accent) | Énoncé | src/exercices/CM2/CM2N2U-2.ts |
| CM2N2U-3 | R10 Français | Point isolé après le champ (« point $A$ : [champ] . ») | retirer le point | src/exercices/CM2/CM2N2U-3.ts |
| CM2N3A-3 | R10 Français | Correction redondante « $16-15=1$ donc $16-15=⟦1⟧$ » | $16-15=⟦1⟧$ | src/exercices/CM2/CM2N3A-3.ts |
| CM2N3A-6 | R1 Titre | Titre « Trouver le dernier chiffre d'une somme entre entiers » alors que l'exercice propose aussi des produits et des différences ; « $1029 - 35$ » sans séparateur | Trouver le dernier chiffre d'un calcul entre entiers ; texNombre | src/exercices/CM2/CM2N3A-6.ts |
| CM2N4B-1 | R2 Tutoiement, impératif | Aide du composant de réponse en plusieurs lignes : « Tu peux directement donner le résultat ou cliquer sur le + … » (tutoiement, partagé par tous les exercices qui l'utilisent) | « Donner directement le résultat ou toucher + pour calculer en plusieurs étapes. » | src/lib/customElements/PossibleMultiLinesAnswerElement.ts:73 |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| canc3a | I4 Question sans champ | 13 | champ absent de la page |
| canc3C16 | I4 Question sans champ | 1 | champ absent de la page |
| CM2N1D-2 | I4 Question sans champ | 110 | champ absent de la page |
| CM2N3A-14 | I4 Question sans champ | 4 | champ absent de la page |
| CM2N3A-2 | I4 Question sans champ | 24 | champ absent de la page |
| CM2N3A-3 | I4 Question sans champ | 33 | champ absent de la page |
| canCE2-2026 | X1 Erreur | 5 | rendu correction : page.evaluate: Error: aucun exercice préparé     at Module.rendre (http://127.0.0.1:5173/alea/revue-sonde.ts?t=1793185166125:127:18)     at e |
| CM2N1D-2 | X1 Erreur | 1 | console : KaTeX auto-render: Failed to parse `0}}` with  ParseError: KaTeX parse error: Expected 'EOF', got '}' at position 4: {0}}̲}     at _Parser.expect (htt |
| CM2N1D-3 | X1 Erreur | 1 | arrêt : page.evaluate: TypeError: Cannot read properties of undefined (reading 'langue')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:24)     at Utili |
| CM2N2A-1 | X1 Erreur | 1 | arrêt : page.evaluate: TypeError: Cannot read properties of undefined (reading 'langue')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:24)     at Utili |
| CM2N2A-2 | X1 Erreur | 1 | arrêt : page.evaluate: TypeError: Cannot read properties of undefined (reading 'langue')     at eval (eval at evaluate (:303:30), &lt;anonymous>:1:24)     at Utili |
| CM2N1D-2 | X2 Formule cassée | 92 | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $1= ~unité$ |
| canCE2a-2025 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| CM2N2A-4 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : N1 Nombre hors $ 3813 ; T5 Espaces 1192 ; T6 Points de suspension 667 ; T3  620 ; R2 Tutoiement, impératif 420 ; N2 Séparateur des milliers 256 ; M7  118 ; R10 Français 79 ; T4  53 ; R5 Virgule 38 ; X4  24 ; R6  14 ; N3  9 ; X2 Formule cassée 3 ; X3  1 ; T2  1.
