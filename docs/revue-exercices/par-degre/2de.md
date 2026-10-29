# Revue des exercices : 2de

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **487 sur 615**. Constats confirmés : **159**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Interactif faux (la bonne réponse est refusée, ou pas de champ) | 2 |
| Contenu mathématique faux | 18 |
| Rendu cassé (formule, débordement, erreur) | 6 |
| Mise en évidence (miseEnEvidence et champs) | 34 |
| Typographie (nombres, espaces, notations) | 25 |
| Rédaction (français, titres, consignes) | 74 |

## Interactif faux (la bonne réponse est refusée, ou pas de champ)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can2N4-02 | I1 Bonne réponse refusée | Confirmé avec revue/essayer.mjs : « 32 » refusé pour $5^{5}\times 0,4^{5}$ (attendu 32.00000000000001), « 1 » refusé pour $5^{4}\times 0,2^{4}$ | arrondi(…) sur this.reponse (lignes 48 et 59) | src/exercices/can/2e/can2N4-02.ts:48 |
| can2N4-02 | I1 Bonne réponse refusée | Réponse attendue calculée en flottant : 5^4×0,2^4 donne 1.0000000000000002 ; la bonne réponse « 1 » saisie par l'élève est refusée (vu au banc : la mise en évidence ⟦1⟧ est refusée). Même risque pour 4^b×0,25^b et 5^b×0,4^b | this.reponse = (4 * a) ** b arrondi : arrondi(5 ** b * a ** b) ou calcul exact | src/exercices/can/2e/can2N4-02.ts:59 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can2F22-02 | C1 Contenu mathématique faux | Fonction inverse avec un décimal : texNombre(nombre, 0) arrondit l'antécédent à l'unité, la correction affiche « $f(-0)=…$ » et « L'image de $-0$ » pour $f(-0,1)$ ; résultat écrit avec un point (valeurDecimale brute : « -0.25 ») ; fraction $\dfrac{1}{-0,1}$ mise en évidence en plus du résultat (deux mises en évidence pour un champ). Même code dans 2F22-1 | texNombre(nombre, 6) ; texNombre(solution.valeurDecimale) ; une seule mise en évidence | src/exercices/2e/2F22-1.ts:155 |
| can2a-2021 | C1 Contenu mathématique faux | Q25 : « Il y a $b$ boules rouges » alors que b est le nombre de boules vertes (« Il y a $2$ boules rouges sur un total de $6$ » pour 4 rouges). | Il y a $${a}$ boules rouges sur un total de… | src/exercices/can/2e/can2a-2021.ts:959 |
| can2a-2023 | C1 Contenu mathématique faux | Q14 : correction « Ainsi, $a \times 0,5=…$ » pour un calcul 0,25×a | $a \times 0,25=…$ | src/exercices/can/2e/can2a-2023.ts:698 |
| can2a-2023 | C1 Contenu mathématique faux | Q20 (cube) : unité du champ « m^2 » pour un volume (texteApres commun aux deux cas) | texteApres m^3 dans le cas du cube | src/exercices/can/2e/can2a-2023.ts:951 |
| can2G21-07 | C1 Contenu mathématique faux | Rappel de cours : « Si $\vec{u}\begin{pmatrix}x_{\vec{u}} \\ x_{\vec{v}}\end{pmatrix}$ » : seconde coordonnée de $\vec{u}$ notée $x_{\vec{v}}$ au lieu de $y_{\vec{u}}$ (lignes 77, 123 et suivantes) ; « det » en italique ; guillemets droits | y_{\vec{u}} ; \det ; « Faux » | src/exercices/can/2e/can2G21-07.ts:77 |
| can2L10-05 | C1 Contenu mathématique faux | Correction : « facteur commun aux deux termes : $3a$ et $3\times 9$ » : le second terme est $3\times 9b$ | $${r}\\times ${n}b$ | src/exercices/can/2e/can2L10-05.ts:71 |
| can2L3-03 | C1 Contenu mathématique faux | Correction (cas $x^2>k$) : « L'ensemble des solutions de l'inéquation $x^2>8$ » alors que l'énoncé est $x^2>64$ (affiche a au lieu de a²) ; double espace « de  l'inéquation » | $x^2>${a ** 2}$ | src/exercices/can/2e/can2L3-03.ts:206 |
| can2a-2024 | C1 Contenu mathématique faux | Q28 (sujet officiel) : correction « La droite d'équation $y=-1$ a un deux points d'intersection » alors que la question porte sur $y=2$ | La droite d'équation $y=2$ a deux points d'intersection | src/exercices/can/can2a-2024/can2a-2024-Q28.ts:163 |
| can2a-2025 | C1 Contenu mathématique faux | Q10 : correction « $a+\dfrac{b}{c} = …$ » pour le calcul $a-\dfrac{b}{c}$ | ${a}-${bSurC.texFraction} | src/exercices/can/can2a-2025/can2a-2025-Q10.ts:72 |
| can2a-2025 | C1 Contenu mathématique faux | Q17 : formule « $m=\dfrac{y_L-y_K}{x_-x_A}$ » | $m=\dfrac{y_L-y_K}{x_L-x_K}$ | src/exercices/can/can2a-2025/can2a-2025-Q17.ts:47 |
| can2a-2025 | C1 Contenu mathématique faux | Q19 : « le taux global est donné par $3,2-1=220\,\%$ » (3,2-1=2,2) | $3,2-1=2,2$, soit une hausse de $220\,\%$ | src/exercices/can/can2a-2025/can2a-2025-Q19.ts:53 |
| can2a-2025 | C1 Contenu mathématique faux | Q3 (sujet officiel) : « Le terme constant vient de $-2\times 3=6$ » | $-2\times 3=-6$ | src/exercices/can/can2a-2025/can2a-2025-Q3.ts:47 |
| can2a-2025 | C1 Contenu mathématique faux | Q7 : « $3^{2}$ est positif (puissance paire d'un nombre négatif) » pour une base positive ; « nombnre » | distinguer base positive (puissance d'un nombre positif) et puissance paire d'un négatif ; « nombre » | src/exercices/can/can2a-2025/can2a-2025-Q7.ts:66 |
| can2a-2025C | C1 Contenu mathématique faux | Q24 : « Membre de gauche : $(-2)^2-\times (-2)$ » (ecritureAlgebriqueSauf1(-1) donne « - » suivi de \times) | $(-2)^2-(-2)$ : traiter b=±1 sans \times | src/exercices/can/can2a-2025C/can2a-2025C-Q24.ts:58 |
| can2a-NY2025 | C1 Contenu mathématique faux | Q18 (sujet officiel) : réponse « $-\sqrt{2\,025}$ » mise en évidence, non simplifiée alors que $\sqrt{2\,025}=45$ (thème de l'année) | $-\sqrt{2\,025}=-45$, mettre en évidence $-45$ | src/exercices/can/canNY-2025 |
| can2a-NY2025 | C1 Contenu mathématique faux | Q28 : question « $(-1)^{2\,025}\pm(-1)^{2\,023}$ », correction écrite avec l'exposant $2\,024$ (« $(-1)^{2\,025}-(-1)^{2\,024}=-1-(-1)$ » est faux) | exposant 2 023 dans la correction | src/exercices/can/canNY-2025/can2NY-2025-Q28.ts:47 |
| can2a-NY2025 | C1 Contenu mathématique faux | Q21 (variante hypoténuse) : « $IK^2=(\sqrt{2\,024})^2+6^2$ » puis $2\,025+36$, alors que la figure porte $\sqrt{2025}$ | (\sqrt{2\,025})^2 | src/exercices/can/canNY-2025/can3NY-2025-Q21.ts:81 |
| can2a-NY2026 | C1 Contenu mathématique faux | Q21 (sujet officiel) : réponse mise en évidence « $TU=\sqrt{2\,025}$ » non simplifiée ($=45$) | $TU=\sqrt{2\,025}=45$ | src/exercices/can/canNY-2026 |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can2P1-03 | X5 Débordement à 390 px | Tableau des probabilités (tableau-mathlive) de 434 px : dépasse à 390 px | tableau plus étroit (en-tête « Face », « P ») | src/exercices/can/1e/can1P12-05.ts |
| can2F24-05 | X5 Débordement à 390 px | Commentaire en \text dans l'aligned (« Comme la fonction cube est strictement croissante… ») : 803 px, coupé à 390 px | phrase hors de la formule | src/exercices/can/2e/can2F3-02_old.ts:183 |
| can2F24-04 | X5 Débordement à 390 px | Commentaire « Comme la fonction racine carrée est strictement croissante… » écrit en \text dans un aligned après \qquad : ligne de 866 px, coupée à 390 px (capture), illisible sur téléphone. Même chose pour can2F24-05 (fonction cube, 803 px) | sortir la phrase de la formule (texte après le aligned) | src/exercices/can/2e/can2F3-02_old.ts:201 |
| can2N5-05 | X2 Formule cassée | « Calculer $-$$\sqrt{64}$ » : signe moins dans une formule à part, collée à la suivante ($$ consécutifs) ; double espace « Calculer  » | Calculer $${choix ? '' : '-'}\\sqrt{…}$ | src/exercices/can/2e/can2N5-05.ts:57 |
| can2a-2024 | X2 Formule cassée | Q8 : $ mal placé, « $4  ;  14$ » : le séparateur et $sp$ passent dans la formule | $${c}$ ${sp(4)} ; ${sp(4)} $${d}$ | src/exercices/can/can2a-2024/can2a-2024-Q8.ts:55 |
| can2a-2025 | X2 Formule cassée | Q12 (aléatoire) : apostrophe parasite « \hline ' » dans le tableau du script ; sujet officiel « \hline\\ » ajoute une ligne vide | retirer « ' » et le \\ après \hline | src/exercices/can/can2a-2025/can2a-2025-Q12.ts:63 |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can2a-2024 | M8 Évidences et champs | Q18 : écriture scientifique mise en évidence en trois morceaux ⟦2,23⟧⟦×⟧⟦10^{-4}⟧ pour un seul champ ; Q21 : ⟦5⟧/⟦4⟧ séparés | mettre en évidence $2,23\times 10^{-4}$ d'un seul tenant |  |
| can2P2-02 | M1 Évidence refusée par le champ | La correction met en évidence l'égalité entière ⟦P_{Z}(C)=0,23⟧ alors que le champ attend seulement la notation (can2P2-02) ou seulement le nombre (can2P2-03) | mettre en évidence la seule partie à saisir | src/exercices/can/1e/can1P11-01.ts |
| can2P2-03 | M1 Évidence refusée par le champ | La correction met en évidence l'égalité entière ⟦P_{Z}(C)=0,23⟧ alors que le champ attend seulement la notation (can2P2-02) ou seulement le nombre (can2P2-03) | mettre en évidence la seule partie à saisir | src/exercices/can/1e/can1P11-02.ts |
| can2F23-01 | M4 QCM : évidence ≠ proposition | QCM : la correction met en évidence l'inégalité écrite dans l'autre sens que la proposition à cocher (ex. proposition $\dfrac{1}{-6,9}&lt;\dfrac{1}{-7,2}$, évidence $\dfrac{1}{-7,2}>\dfrac{1}{-6,9}$) | mettre en évidence l'inégalité telle qu'écrite dans la bonne proposition | src/exercices/can/2e/can2F23-01.ts |
| can2F23-02 | M4 QCM : évidence ≠ proposition | QCM : la correction met en évidence l'inégalité écrite dans l'autre sens que la proposition à cocher (ex. proposition $\dfrac{1}{-6,9}&lt;\dfrac{1}{-7,2}$, évidence $\dfrac{1}{-7,2}>\dfrac{1}{-6,9}$) | mettre en évidence l'inégalité telle qu'écrite dans la bonne proposition | src/exercices/can/2e/can2F23-02.ts |
| can2F23-03 | M4 QCM : évidence ≠ proposition | QCM : la correction met en évidence l'inégalité écrite dans l'autre sens que la proposition à cocher (ex. proposition $\dfrac{1}{-6,9}&lt;\dfrac{1}{-7,2}$, évidence $\dfrac{1}{-7,2}>\dfrac{1}{-6,9}$) | mettre en évidence l'inégalité telle qu'écrite dans la bonne proposition | src/exercices/can/2e/can2F23-03.ts |
| can2F23-04 | M4 QCM : évidence ≠ proposition | QCM : la correction met en évidence l'inégalité écrite dans l'autre sens que la proposition à cocher (ex. proposition $\dfrac{1}{-6,9}&lt;\dfrac{1}{-7,2}$, évidence $\dfrac{1}{-7,2}>\dfrac{1}{-6,9}$) | mettre en évidence l'inégalité telle qu'écrite dans la bonne proposition | src/exercices/can/2e/can2F23-04.ts |
| can2F23-05 | M4 QCM : évidence ≠ proposition | QCM : évidence écrite dans l'autre sens que la proposition à cocher ; parenthèses incohérentes entre propositions ($1,3^3$ et $(1,3)^3$) | même écriture que la bonne proposition | src/exercices/can/2e/can2F23-05.ts |
| can2F25-02 | M8 Évidences et champs | Correction : le nombre ajouté aux deux membres (⟦1⟧, ⟦(-2)⟧) est mis en évidence comme une réponse, en plus de la solution ; can2F25-02 passe de $-x^2+1-1=4-1$ à $x^2=-3$ sans l'étape $-x^2=3$ | couleur d'explication (bleu) pour l'opération, orange réservé à la réponse ; ajouter l'étape | src/exercices/can/2e/can2F25-02.ts |
| can2F25-04 | M8 Évidences et champs | Correction : le nombre ajouté aux deux membres (⟦1⟧, ⟦(-2)⟧) est mis en évidence comme une réponse, en plus de la solution ; can2F25-02 passe de $-x^2+1-1=4-1$ à $x^2=-3$ sans l'étape $-x^2=3$ | couleur d'explication (bleu) pour l'opération, orange réservé à la réponse ; ajouter l'étape | src/exercices/can/2e/can2F25-04.ts |
| can2G1-07 | M8 Évidences et champs | Coordonnées mises en évidence caractère par caractère : ⟦(⟧ ⟦5⟧\,⟦;⟧\,⟦9⟧ ⟦)⟧ (six mises en évidence pour un champ) | $${miseEnEvidence(`(${-x}\\,;\\,${-y})`)}$ | src/exercices/can/2e/can2G1-07.ts |
| can2G20-01 | M8 Évidences et champs | Relation de Chasles : les lettres intermédiaires (⟦J⟧…⟦J⟧) sont mises en évidence en orange comme une réponse ; la bonne proposition du QCM ($\overrightarrow{KF}$, $\overrightarrow{0}$) n'est pas mise en évidence dans tous les cas | autre couleur pour les lettres qui se simplifient, orange pour le résultat seul | src/exercices/can/2e/can2G20-01.ts |
| can2G20-02 | M8 Évidences et champs | Relation de Chasles : les lettres intermédiaires (⟦J⟧…⟦J⟧) sont mises en évidence en orange comme une réponse ; la bonne proposition du QCM ($\overrightarrow{KF}$, $\overrightarrow{0}$) n'est pas mise en évidence dans tous les cas | autre couleur pour les lettres qui se simplifient, orange pour le résultat seul | src/exercices/can/2e/can2G20-02.ts |
| can2G20-03 | M1 Évidence refusée par le champ | Cas « même sens » : la mise en évidence englobe le vecteur (⟦\dfrac{6}{5}\overrightarrow{ZM}⟧) alors que le champ attend $k$ seul ; la valeur $\dfrac{6}{5}$ juste avant n'est pas mise en évidence | $\overrightarrow{ZN}=${miseEnEvidence(k)}\\overrightarrow{ZM}$ | src/exercices/can/2e/can2G20-03.ts |
| can2G21-03 | M1 Évidence refusée par le champ | Le champ attend un couple « (2;-4) » mais la correction met en évidence les deux coordonnées dans une colonne \begin{pmatrix} ; l'énoncé ne dit pas sous quelle forme écrire les coordonnées | préciser la forme attendue et mettre en évidence $(2\,;\,-4)$ | src/exercices/can/2e/can2G21-03.ts |
| can2G21-04 | M1 Évidence refusée par le champ | Le champ attend un couple « (2;-4) » mais la correction met en évidence les deux coordonnées dans une colonne \begin{pmatrix} ; l'énoncé ne dit pas sous quelle forme écrire les coordonnées | préciser la forme attendue et mettre en évidence $(2\,;\,-4)$ | src/exercices/can/2e/can2G21-04.ts |
| can2G30-07 | M1 Évidence refusée par le champ | Le champ est entre parenthèses dans l'énoncé (« $($ [champ] $)$ ») et attend « x;y », mais la correction met en évidence le couple avec ses parenthèses (⟦(-5;10)⟧) ou les deux coordonnées séparément | $(${miseEnEvidence(`${x}\\,;\\,${y}`)})$ | src/exercices/can/2e/can2G30-07.ts |
| can2G30-08 | M1 Évidence refusée par le champ | Le champ est entre parenthèses dans l'énoncé (« $($ [champ] $)$ ») et attend « x;y », mais la correction met en évidence le couple avec ses parenthèses (⟦(-5;10)⟧) ou les deux coordonnées séparément | $(${miseEnEvidence(`${x}\\,;\\,${y}`)})$ | src/exercices/can/2e/can2G30-08.ts |
| can2G31-02 | M1 Évidence refusée par le champ | Le champ est entre parenthèses dans l'énoncé (« $($ [champ] $)$ ») et attend « x;y », mais la correction met en évidence le couple avec ses parenthèses (⟦(-5;10)⟧) ou les deux coordonnées séparément | $(${miseEnEvidence(`${x}\\,;\\,${y}`)})$ | src/exercices/can/2e/can2G31-02.ts |
| can2I2-02 | M2 Unité en évidence | Le champ porte déjà « % » après lui et attend « -5 », mais la correction met en évidence ⟦- 5\,\%⟧ (signe séparé par une espace, sp() dans la formule, %) | $${miseEnEvidence(texNombre(taux))}\\,\\%$ | src/exercices/can/2e/can2I2-02.ts |
| can2N10-04 | M1 Évidence refusée par le champ | Réunion égale à ℝ : mise en évidence « ]-\infty\,;\,+\infty[=\mathbb{R} » refusée telle quelle par le champ | mettre en évidence $]-\infty\,;\,+\infty[$ seul, puis « $=\mathbb{R}$ » hors évidence | src/exercices/can/2e/can2N10-04.ts |
| can2N11-01 | M2 Unité en évidence | Écriture en pourcentage : « \,\% » dans miseEnEvidence alors que le champ porte déjà % en texteApres et attend le nombre seul | ${miseEnEvidence(texNombre(pourcentage))}\,\% | src/exercices/can/2e/can2N11-01.ts:114 |
| can2N5-06 | M8 Évidences et champs | Deux mises en évidence pour un champ (⟦3\times9⟧=⟦3\times3^2⟧) | une seule mise en évidence (la forme attendue) | src/exercices/can/2e/can2N5-06.ts |
| can2a-NY2024 | M8 Évidences et champs | Q11 et Q12 : un champ HMS (« 33 h 48 min ») et deux mises en évidence ⟦33⟧ h ⟦48⟧ min | pour mémoire : forme admise si la règle M2 interdit l'unité dans miseEnEvidence | src/exercices/can/6e/CANSpeciale2024.ts:2426 |
| can2a-NY2024 | M8 Évidences et champs | Q13 : le champ attend oui/non (O/N) mais la correction met en évidence « n'est pas un diviseur » ou « est un multiple », jamais la réponse à saisir | ${texteEnCouleurEtGras('Non')}, $2\,024$ n'est pas un diviseur de $8$ (idem « Oui » dans l'autre cas) | src/exercices/can/6e/CANSpeciale2024.ts:2840 |
| can2a-2025 | M8 Évidences et champs | Q11 : trois mises en évidence (x_M, y_M, puis M(-10 ; 8)) pour deux champs à trous | mettre en évidence seulement x_M et y_M, ou seulement le couple | src/exercices/can/can2a-2025/can2a-2025-Q11.ts:47 |
| can2a-2025 | M8 Évidences et champs | Q30 (aléatoire) : correction « $AB=5$ » puis « La valeur exacte de $AB$ est ⟦\sqrt{25}⟧ » quand l'hypoténuse est entière | mettre en évidence la valeur simplifiée quand isCarre | src/exercices/can/can2a-2025/can2a-2025-Q30.ts:100 |
| can2a-2025C | M8 Évidences et champs | Q4 et Q12 : deux champs à trous (numérateur/dénominateur ; base/exposant) et une seule mise en évidence (⟦-\dfrac{1}{4}⟧, ⟦12⟧ sans la base) | mettre en évidence chaque valeur à saisir : \dfrac{⟦-1⟧}{⟦4⟧}, ⟦7⟧^{⟦12⟧} | src/exercices/can/can2a-2025C/can2a-2025C-Q12.ts:40 |
| can2a-2026 | M1 Évidence refusée par le champ | Q14 : mise en évidence ⟦\{-2\,;\,1\}⟧ avec les accolades, alors que le champ attend « -2;1 » (pas d'accolades dans l'énoncé) | S=\{⟦-2\,;\,1⟧\} | src/exercices/can/can2a-2026/can2a-2026-Q14.ts |
| can2a-2026 | M1 Évidence refusée par le champ | Q29 : mise en évidence ⟦\overrightarrow{PA}⟧ alors que le champ à trous est déjà sous la flèche et attend « PA » | \overrightarrow{⟦PA⟧} | src/exercices/can/can2a-2026/can2a-2026-Q29.ts |
| can2a-NY2025 | M4 QCM : évidence ≠ proposition | Q6 et Q25 (QCM OUI/NON) : propositions en capitales, correction qui met en évidence « n'est pas un multiple » ou « non » au lieu de la proposition cochée | propositions « Oui »/« Non » et texteEnCouleurEtGras('Non') | src/exercices/can/canNY-2025/can6NY-2025-Q15.ts:33 |
| can2a-NY2025 | M5 Texte en évidence | Q7 : unités dans miseEnEvidence (⟦21 \textbf{h} 13 \textbf{min}⟧) | $${miseEnEvidence('21')}$ h $${miseEnEvidence('13')}$ min | src/exercices/can/canNY-2025/can6NY-2025-Q17.ts:40 |
| can2a-NY2026 | M4 QCM : évidence ≠ proposition | Q6 (QCM OUI/NON) : propositions en capitales, correction qui met en évidence « n'est pas un multiple » au lieu de « Non » | « Oui »/« Non », texteEnCouleurEtGras('Non') | src/exercices/can/canNY-2026 |
| can2a-NY2026 | M5 Texte en évidence | Q7 : unités dans miseEnEvidence (⟦21 \textbf{h} 20 \textbf{min}⟧) | valeurs seules en évidence | src/exercices/can/canNY-2026 |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can2a-2023 | N2 Séparateur des milliers | Q16 : « 1000 » sans séparateur des milliers | texNombre |  |
| can2a-2021 | N6 Écriture algébrique | Q27 : « $DB=⟦1\sqrt{2}⟧$ » quand a = 1 (coefficient 1 écrit, et mis en évidence) ; Q16 : « en produits de facteurs premiers » (produit) ; Q29 : « Donner une valeur approchée … ? ». | ${rienSi1(a)}\\sqrt{2} | src/exercices/can/2e/can2a-2021.ts:1077 |
| can2F11-01 | N6 Écriture algébrique | Aide « Mentalement » : « $1\times (-3)-2$ » (coefficient 1 écrit) alors que la fonction est $\dfrac{x-2}{x+2}$ | rienSi1 / reduireAxPlusB | src/exercices/can/2e/can2F11-01.ts |
| can2F20-06 | N6 Écriture algébrique | Formule « $\dfrac{f(-1)-f(-4)}{-1-{-4}}$ » : soustraction d'un négatif sans parenthèses (rendu « −1−−4 ») ; « est donnée par la formule » (le coefficient… est donné) | ecritureParentheseSiNegatif(xA) ; est donné | src/exercices/can/2e/can2F20-06.ts:54 |
| can2F25-08 | N5 Négatif sans parenthèses | « Or $-3^3=-27$ » : la base négative doit être entre parenthèses ($(-3)^3$) ; écrite ainsi l'égalité ne dit pas que $-3$ est solution | $${ecritureParentheseSiNegatif(a)}^3$ | src/exercices/can/2e/can2F3-03_old.ts |
| can2F4-03 | T5 Espaces | « le maximum de $f$ est $2$ . Il est atteint » : espace avant le point | est $2$. Il | src/exercices/can/2e/can2F4-03.ts |
| can2G1-04 | T5 Espaces | « Calculer $FG$ . » : espace avant le point | Calculer $FG$. | src/exercices/can/2e/can2G1-04.ts |
| can2G21-08 | T9 Mot en italique | « $det\left(\vec{u}\,;\,\vec{v}\right)$ » : det en italique (lettres d, e, t) | \det | src/exercices/can/2e/can2G21-08.ts |
| can2I2-01 | T1 Espace avant % | « $140~\%$ » (~ au lieu de \,) ; champ suivi d'un point isolé (texteApres « . ») | $140\,\%$ | src/exercices/can/2e/can2I2-01.ts |
| can2L3-05 | T5 Espaces | Intervalle écrit $]-\infty;-10[$ sans espaces dans un cas, $]2\,;\,4[$ dans l'autre | \,;\, partout | src/exercices/can/2e/can2L3-05.ts |
| can2N10-02 | T5 Espaces | Intervalles écrits avec ${sp(1)} et doubles espaces dans la formule ($\bigg[-2  ⍽ ; ⍽ 3\bigg]$) au lieu de \,;\, | $\bigg[${a}\,;\,${b}\bigg]$ (ou \left[ \right]) | src/exercices/can/2e/can2N10-02.ts:46 |
| can2a-NY2024 | N1 Nombre hors $ | Q11 : « 33 heures pleines » hors $ ; doubles espaces « la  division », « min  $=$ » | $33$ heures | src/exercices/can/6e/CANSpeciale2024.ts:2417 |
| can2a-2024 | N7 Prix | Q14 QCM : propositions « $7,5$ € » alors que la correction met en évidence « 7,50 » (prix) | texPrix dans les propositions | src/exercices/can/can2a-2024/can2a-2024-Q14.ts:52 |
| can2a-2025 | N6 Écriture algébrique | Q11 : « $\dfrac{-10+-10}{2}$ », « $2+-4$ » | ecritureParentheseSiNegatif(xb) | src/exercices/can/can2a-2025/can2a-2025-Q11.ts:47 |
| can2a-2025 | N1 Nombre hors $ | Q4 (sujet officiel) : « le quart de 80 » hors $ | le quart de $80$ | src/exercices/can/can2a-2025/can2a-2025-Q4.ts:36 |
| can2a-2025C | N7 Prix | Q22 : prix « $22,5$ € » dans l'énoncé et la correction ; « $22,5$€ » collé dans canEnonce | texPrix | src/exercices/can/can2a-2025C/can2a-2025C-Q22.ts:63 |
| can2a-2026 | N6 Écriture algébrique | Q11 : « $\dfrac{-10+-10}{2}$ » (même code que can2a-2025-Q11) | ecritureParentheseSiNegatif | src/exercices/can/can2a-2026/can2a-2026-Q11.ts |
| can2a-2026 | T1 Espace avant % | Q19 : « $40~\%$ » (espace insécable ~ au lieu de l'espace fine \,) ; double espace « associé  à » | $40\,\%$ | src/exercices/can/can2a-2026/can2a-2026-Q19.ts:43 |
| can2a-2026 | N6 Écriture algébrique | Q7 : « $(-4)^2-1\times (-4)$ » (coefficient 1 écrit) | $(-4)^2-(-4)$ | src/exercices/can/can2a-2026/can2a-2026-Q7.ts |
| can2a-NY2025 | N2 Séparateur des milliers | Q18 : « $\dfrac{1}{-2025}$ » sans séparateur et dénominateur négatif, mis en évidence et attendu tel quel | $-\dfrac{1}{2\,025}$ | src/exercices/can/canNY-2025/can2NY-2025-Q18.ts:47 |
| can2a-NY2025 | N1 Nombre hors $ | Q17 : « (0 h) » hors $ | ($0$ h) | src/exercices/can/canNY-2025/can6NY-2025-Q29.ts:34 |
| can2a-NY2025 | T6 Points de suspension | Q3 : correction « $.... -2=2\,030$ . » (points au lieu de \ldots, espace avant le point, double espace « vérifie  l'égalité ») | $\ldots-2=2\,030$. | src/exercices/can/canNY-2025/can6NY-2025-Q4.ts:42 |
| can2a-NY2026 | N2 Séparateur des milliers | Q18 : « $\dfrac{1}{-2026}$ », « $\dfrac{1}{2026}$ » sans séparateur (mis en évidence) ; Q25 « antécédent de $2026$ », « $f(x)=2026$ » | texNombre ; $-\dfrac{1}{2\,026}$ | src/exercices/can/canNY-2026 |
| can2a-NY2026 | N1 Nombre hors $ | Q17 : « (0 h) » hors $ | ($0$ h) | src/exercices/can/canNY-2026 |
| can2a-NY2026 | T6 Points de suspension | Q3 : « $.... -2=2\,031$ . » (points au lieu de \ldots, espace avant le point) | $\ldots-2=2\,031$. | src/exercices/can/canNY-2026 |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 2A | R10 Français | Énoncé : « chargement... » (meta-custom jamais rempli dans le banc, voir 3Auto) | Voir bug meta-custom | relecture |
| 2A-P3-3 | R16  | Titre « Comparer des probabilités » terminé par une espace | Retirer | relecture |
| 2A-R1-5 | R16  | Titre « Comparer  avec des pourcentages » : deux espaces | Une seule espace | relecture |
| 2F21-1 | R16  | Titre « Reconnaitre » | « Reconnaître » | relecture |
| 2F21-2 | R16  | Titre « Reconnaitre » | « Reconnaître » | relecture |
| 2N51-1 | R16  | Titre « Connaitre » | « Connaître » | relecture |
| 2A-A01-7 | R16  | Énoncé : « À quel nombre décimal, le nombre $\dfrac{3}{4}$ est-il égal ? » (virgule parasite) | Supprimer la virgule | src/exercices/2e/ |
| 2A-C4-4 | R16  | Énoncé : « Le périmètre $P$ d'un rectangle est donnée » (donné) | « est donné » | src/exercices/2e/ |
| 2A-C4-5 | R16  | Énoncé : $C=(1+t)^2$ sans hypothèse sur le signe de $1+t$, mais la correction affirme « les deux membres sont positifs » et prend $\sqrt{C}=1+t$ (la réponse unique $\sqrt{C}-1$ est fausse pour $t&lt;-1$) | Ajouter « avec $t\geqslant -1$ » (ou $1+t\geqslant0$) dans l'énoncé | src/exercices/2e/ |
| 2A-F1-3 | R2 Tutoiement, impératif | Correction : phrase entière « $6$ a pour image $2$ » en miseEnEvidence | texteEnCouleurEtGras | src/exercices/2e/ |
| 2A-F2-1 | R3  | Champ à trous « (\placeholder{};\placeholder{}) » : point-virgule sans espaces (2A-F2-3 écrit \,;\,) | Harmoniser sur \,;\, | src/exercices/2e/ |
| 2A-G2-1 | R6  | Correction : miseEnEvidence englobe « A(5 ; −2) » avec le nom du point alors que les champs attendent seulement 5 et −2 | Mettre en évidence les deux valeurs | src/exercices/2e/ |
| 2A-G2-3 | R16  | Énoncé : « $H(2;-1)$ » coordonnées sans espaces autour de « ; » | $H(2\,;\,-1)$ | src/exercices/2e/ |
| 2A-G5-2 | R16  | Énoncé : « représenté à l'echelle » (échelle) | « échelle » | src/exercices/2e/ |
| 2A-N1-3 | R12  | Énoncé et correction : « $0{,}125$ » (virgule en {,}) mêlée à « $0,127$ » (virgule simple) ; point final dans la formule « \dfrac{3}{25}.$ » | Une seule écriture de la virgule ; sortir le point | src/exercices/2e/ |
| 2A-N2-3 | R16  | Énoncé : « sous la forme d'un quotient aux numérateur et dénominateur simplifiés » (tournure fautive) | « dont le numérateur et le dénominateur sont simplifiés » | src/exercices/2e/ |
| 2A-N3-1 | R16  | Correction : la chaîne commence par « $N=\dfrac{10^5}{5^3}$ » alors que le nom N n'est pas défini dans l'énoncé | Aligner énoncé et correction | src/exercices/2e/ |
| 2A-N3-7 | R16  | Titre : « Trouver  l'égalité correcte » deux espaces | Une seule espace | src/exercices/2e/ |
| 2A-N4-2 | R3  | Correction : « On a ⍽: » espace ordinaire puis espace insécable avant « : » (double espace) | Un seul espace insécable | src/exercices/2e/ |
| 2A-N5-2 | R3  | Correction : « $\underbrace{0,0.... 0}_{39 \text{ zéros}}1$ » quatre points tapés au lieu de \ldots | \ldots | src/exercices/2e/ |
| 2A-N7-3 | R16  | Correction : « Dans une $1$ heure, il y a… » (article fautif) | « En $1$ heure » | src/exercices/2e/ |
| 2A-N7-5 | R3  | Correction : « $3$ $\text{ dm}$ » nombre et unité en deux formules avec espace dans \text ; « mm}^2$ . » espace avant le point final | $3\text{ dm}$ ; point collé | src/exercices/2e/ |
| 2A-P2-1 | R4  | Orthographe incohérente : titre « évènement contraire » mais énoncé « événement » (même exercice) ; et 3A/4S utilisent d'autres formes | Choisir une graphie (rectifiée « événement » acceptée par MathALÉA ?) et l'appliquer partout | src/exercices/2e/ |
| 2A-P2-2 | R3  | Énoncé : « $15 \,\%$ » espace ordinaire puis \, avant % (double espace) | $15\,\%$ | src/exercices/2e/ |
| 2A-R2-4 | R16  | Énoncé : « Quel est le nombre d' appartements » (espace après l'apostrophe) | « d'appartements » | src/exercices/2e/ |
| 2A-R2-7 | R16  | Unité après le champ : « ton » (ni « t » ni « tonnes ») ; « $30 \,\%$ » espace avant \, | « tonnes » ou « t » | src/exercices/2e/ |
| 2A-S2-7 | R16  | Titre « Comparer la moyenne et l'écart-type d'une série rangée en classes » alors que l'exercice compare deux séries simples E et F sur leur moyenne | Titre cohérent avec la question | src/exercices/2e/ |
| 2A-S4-6 | R16  | Titre « Lire une fréquence… » mais la question demande la valeur du troisième quartile | Titre cohérent | src/exercices/2e/ |
| 2N12-1 | R16  | Titre : « intervalle de  $\mathbb{R}$ » deux espaces | Une seule espace | src/exercices/2e/ |
| 2N12-2 | R3  | Énoncé : intervalles « $]-\infty;22]\cap]34;44]$ » sans espaces autour de « ; » (aussi 2N12-3 « $[-11; 78]$ » espace ordinaire) | $]-\infty\,;\,22]$ | src/exercices/2e/ |
| 2N12-4 | R16  | Énoncé : « Si $A \cup B = …$, $A \cap B = …$ et $B \setminus A = ….$ » : proposition subordonnée sans principale (phrase incomplète) | « On sait que… » ou « Sachant que… » | src/exercices/2e/ |
| 2N13-1 | R12  | Valeur absolue notée de trois façons selon l'exercice : \vert (2N13-1, 2N13-3), \| \| (2N13-2), \lvert \rvert (2N13-4) | Harmoniser (\lvert … \rvert) | src/exercices/2e/ |
| 2F21-9 | R16  | Correction : « $g(0)=\dfrac{3}{5}\times +\dfrac{3}{2}$ » et « $g(4)=\dfrac{3}{5}\times +4 +\dfrac{3}{2}$ » : le facteur x est écrit avec ecritureAlgebrique (« +4 », valeur 0 vide) au lieu de la valeur seule, d'où « \times + » ; il faut $\dfrac{3}{5}\times 0+\dfrac{3}{2}$ et $\dfrac{3}{5}\times 4+\dfrac{3}{2}$ | Utiliser x0.texFSD / ecritureParentheseSiNegatif(x0) pour le facteur | src/exercices/2e/2F21-9.ts:526 |
| can2F3-06 | R10 Français | « elles sont négatives lorque la courbe » (code de 2F32-3) | lorsque | src/exercices/2e/2F32-3.ts:228 |
| 2L10-3 | R14  | Même exercice que 5N5A (« Écrire une expression littérale », QCM « triple de z ») et 3AutoN10 : triple publication | Fusionner ou différencier | src/exercices/2e/2L10-3.ts |
| 2L10-5 | R5 Virgule | Consigne « Calculer, pour les valeurs données de $x$, le résultat des expressions suivantes » sans point final | Ajouter le point | src/exercices/2e/2L10-5.ts |
| 2L10-7 | R1 Titre | Énoncé : « en °C », « $m_1=3$ kg » : unités hors $ et titre terminé par une espace | $3\text{ kg}$ ; $\text{°C}$ | src/exercices/2e/2L10-7.ts |
| 2L14-2 | R16  | Correction : « d'un cerclce » (cercle) ; titre « à  partir » deux espaces | « cercle » ; une seule espace | src/exercices/2e/2L14-2.ts |
| 2L21-6 | R10 Français | Correction : \[ \begin{aligned}… \] en mode display inséré dans une phrase (autres exercices utilisent $…$) | Utiliser $\begin{aligned}…$ | src/exercices/2e/2L21-6.ts |
| 2L22-3 | R10 Français | Énoncé : « ($7x-2)( 7x+6)+(7x-2)(-5x-4)=0$ » : la parenthèse ouvrante est hors de la formule ($ placé après le « ( ») ; espaces parasites « ( 7x+6) » ; correction \underline{7x-2)} avec la parenthèse fermante soulignée | Démarrer $ avant la première parenthèse | src/exercices/2e/2L22-3.ts |
| 2N20-5 | R3  | Correction : « $2 \times 180180$ », « 90090 », « 45045 »… sans espace fine des milliers (l'énoncé écrit $360\,360$) | texNombre | src/exercices/2e/2N20-5.ts |
| 2N20-7 | R1 Titre | Énoncé : « 55 dents », « 15 » hors $ (même défaut que 4A12, 3A12-4) | Nombres entre $ | src/exercices/2e/2N20-7.ts |
| 2N30-4 | R16  | Consigne : « Compléter avec deux nombres entiers consécutifs ? Nombres entiers consécutifs : Ce sont deux nombres entiers qui se suivent comme 4 et 5. . » : « ? » parasite, majuscule après deux-points, point doublé ; nombres hors $ | Réécrire la consigne et son rappel | src/exercices/2e/2N30-4.ts |
| 2N51-6 | R16  | Correction : « irrationnalité » (irrationalité) ; guillemets droits "quantité conjuguée" | « irrationalité » ; guillemets français | src/exercices/2e/2N51-6.ts |
| can2a-2022 | R10 Français | Q15 : « Si on va $k$ fois plus de fois à la piscine, le prix payé est $k$ fois plus immportant » (coquille, « fois plus de fois ») ; lignes 644 et 661. | Si on va $k$ fois plus souvent à la piscine, le prix payé est $k$ fois plus important. | src/exercices/can/2e/can2a-2022.ts:644 |
| can2a-2023 | R10 Français | Q19 : « jeu viéo » | jeu vidéo | src/exercices/can/2e/can2a-2023.ts:904 |
| can2a-2023 | R10 Français | Q20 : « le cube agrandit », « le carré agrandit » | agrandi | src/exercices/can/2e/can2a-2023.ts:931 |
| can2F20-02 | R10 Français | « une augmentation d'une unité en abscisse augmentent l'ordonnée » ; double espace « de  $…$ » | augmente l'ordonnée | src/exercices/can/2e/can2F20-02.ts:61 |
| can2F21-01 | R10 Français | Correction « En divisant par $1$ dans chaque membre » quand le coefficient vaut 1 ; guillemets droits « cocher "Faux" » | sauter l'étape si a=1 ; « Faux » | src/exercices/can/2e/can2F21-01.ts |
| can2F24-03 | R10 Français | « est égale à $1$ unités » (pluriel avec 1) | unité${distance > 1 ? 's' : ''} | src/exercices/can/2e/can2F3-02_old.ts:129 |
| can2G1-02 | R10 Français | « multiplées » (aussi can3G1-01 et can4G2-05, 8 occurrences) | multipliées | src/exercices/can/2e/can2G1-02.ts:79 |
| can2G21-06 | R5 Virgule | « Pour quelle valeur de $a$, les vecteurs … sont-ils colinéaires » : virgule entre complément et sujet | Pour quelle valeur de $a$ les vecteurs | src/exercices/can/2e/can2G21-06.ts |
| can2G30-05 | R10 Français | « Le coefficient directeur … est donnée par la formule » | est donné | src/exercices/can/2e/can2G30-05.ts |
| can2G30-06 | R10 Français | « le coeffcient directeur » | coefficient | src/exercices/can/2e/can2G30-06.ts |
| can2L12-02 | R10 Français | « Le périmètre $P$ d'un rectangle est donnée en fonction de sa longueur $L$ et sa largeur » : accord et préposition | est donné en fonction de sa longueur $L$ et de sa largeur | src/exercices/can/2e/can2L12-02.ts:224 |
| can2L2-03 | R10 Français | « l'expression … est égal au coefficient multiplicateur » ; « coeffcient » (même coquille dans canTNY-2025-Q13, canTNY-2026-Q13, CANSpeciale2024, can2G30-06, 3G24-2) ; double espace « de  $…$ » | est égale ; coefficient | src/exercices/can/2e/can2L2-03.ts:45 |
| can2L2-04 | R10 Français | Correction : « équivalente à$-x^2…$ » (espace manquante), « cette équation » sans majuscule après un point, « a 1 seule solution » ; double espace « et  $-…$ » | équivalente à $…$. Cette équation a une seule solution | src/exercices/can/2e/can2L2-04.ts:51 |
| can2L3-01 | R10 Français | « L'ensemble de solutions est » ; intervalle écrit $[-5~;~+\infty[$ (~ au lieu de \,) | L'ensemble des solutions est $[-5\,;\,+\infty[$ | src/exercices/can/2e/can2L3-01.ts |
| can2N10-02 | R2 Tutoiement, impératif | Correction : « Comptez-les ! » (impératif adressé à l'élève) ; guillemets droits « "comprises" » | On peut les compter ; « comprises » | src/exercices/can/2e/can2N10-02.ts:50 |
| can2N3-01 | R1 Titre | Titre « Simplifier un quotient de nombre relatifs » | nombres relatifs | src/exercices/can/2e/can2N3-01.ts |
| can2N3-04 | R10 Français | « Quelle fraction de la bouteille a-t-elle bu à midi ? » : participe non accordé avec le COD placé avant | a-t-elle bue | src/exercices/can/2e/can2N3-04.ts |
| can2N4-02 | R1 Titre | Titre « Calculer avec  des puissances* » : double espace et astérisque | Calculer avec des puissances | src/exercices/can/2e/can2N4-02.ts:9 |
| can2N5-05 | R1 Titre | Titre terminé par une espace « Calculer avec des racines carrées  » | retirer l'espace finale | src/exercices/can/2e/can2N5-05.ts:7 |
| can2a-NY2024 | R10 Français | Q29 : « Calculer $…$. $=$ [champ] » : point puis signe égal | retirer le point | src/exercices/can/6e/CANSpeciale2024.ts |
| can2a-2024 | R10 Français | Q12 : « Determiner » sans accent (aussi can6N3-02:45 et :82) | Déterminer | src/exercices/can/can2a-2024/can2a-2024-Q12.ts:74 |
| can2a-2024 | R10 Français | Q22 : texteApres « . » isolé après le champ (« est : [champ] . »)  | pas de point après un champ précédé de « : » | src/exercices/can/can2a-2024/can2a-2024-Q22.ts:28 |
| can2a-2024 | R10 Français | Q28 : « Le nombre de solution de l'équation » | Le nombre de solutions | src/exercices/can/can2a-2024/can2a-2024-Q28.ts:160 |
| can2a-2024 | R5 Virgule | Q30 : « Sur quel intervalle, $f$ est-elle positive » : virgule entre complément et verbe ; point final manquant dans la correction | Sur quel intervalle $f$ est-elle positive | src/exercices/can/can2a-2024/can2a-2024-Q30.ts:153 |
| can2a-2025 | R10 Français | Q16 : « dénominateur commmun » | commun | src/exercices/can/can2a-2025/can2a-2025-Q16.ts:56 |
| can2a-2025 | R10 Français | Q19 : « Une hausse … suivie d'une hausse … correspondent » ; double espace « une  hausse » ; canEnonce sans \,\% après le taux | correspond ; $${texNombre(Taux, 0)}\,\%$ | src/exercices/can/can2a-2025/can2a-2025-Q19.ts:49 |
| can2a-2025C | R10 Français | Q22 : « Le prix d'un gâteaux » (replace(/s$/) ne traite pas le pluriel en x) | singulier explicite pour chaque objet | src/exercices/can/can2a-2025C/can2a-2025C-Q22.ts:70 |
| can2a-2026 | R10 Français | Q30 : unité écrite « $u.\ell$ » (italique, sans point final) dans l'énoncé et le champ, « u.l. » dans la correction | u.l. partout, hors mode math | src/exercices/can/can2a-2026/can2a-2026-Q30.ts:177 |
| can2a-NY2025 | R10 Français | Q4 : « pout obtenir » ; trois mises en évidence de $1,8$ pour un champ | pour obtenir | src/exercices/can/canNY-2025/can2NY-2025-Q4.ts:65 |
| can2a-NY2026 | R10 Français | Q4 : « pout obtenir » (copié de 2025) | pour obtenir | src/exercices/can/canNY-2026/can2NY-2026-Q4.ts |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| 2A-G3-1 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-G3-12 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-G3-13 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-G3-2 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-G3-3 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-G3-6 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-G3-7 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1)  |
| 2A-S2-9 | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1) Résultat incorrect car une valeur décimale (ou entière) est attendue. |
| 2L31-2 | I1 Bonne réponse refusée | 4 | bonne réponse refusée (0/1) Il y a une erreur avec la valeur : $\\{\dfrac38\}$. |
| 2N51-6 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Incorrect car la réponse attendue est une fraction. |
| can2a-NY2024 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1)  |
| 2A | I4 Question sans champ | 58 | champ absent de la page |
| 2F21-2 | X1 Erreur | 14 | interactif (correcte) : page.evaluate: Target page, context or browser has been closed |
| 2F21-4 | X1 Erreur | 12 | interactif (correcte) : page.evaluate: Target page, context or browser has been closed |
| can2F4-03 | X1 Erreur | 7 | rendu enonce : page.evaluate: Target page, context or browser has been closed |
| can2G1-01 | X1 Erreur | 9 | rendu enonce : page.evaluate: Target page, context or browser has been closed |
| 2L30-5 | X2 Formule cassée | 2 | « $ » visible : 3. a) Résolution de l'inéquation : $\begin{aligned} -6x+9&\dfrac{-12}{-7} \end{aligned}$ Comme  |
| 2A-S1-1 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| can2F21-02 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : T6 Points de suspension 5074 ; N1 Nombre hors $ 2650 ; T5 Espaces 1718 ; T4  1296 ; N2 Séparateur des milliers 844 ; N6 Écriture algébrique 381 ; R5 Virgule 366 ; T3  105 ; R2 Tutoiement, impératif 102 ; M7  71 ; N3  26 ; X3  22 ; N5 Négatif sans parenthèses 18 ; R10 Français 17 ; R6  14 ; T1 Espace avant % 10 ; T2  5 ; R1 Titre 2.
