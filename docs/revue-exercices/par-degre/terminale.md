# Revue des exercices : Terminale

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **64 sur 293**. Constats confirmés : **53**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Contenu mathématique faux | 15 |
| Rendu cassé (formule, débordement, erreur) | 2 |
| Mise en évidence (miseEnEvidence et champs) | 4 |
| Typographie (nombres, espaces, notations) | 13 |
| Rédaction (français, titres, consignes) | 19 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| TSA1-QCM03 | C1 Contenu mathématique faux | Code Python faux : « u=1,2$*$u+12 » (en Python, 1,2 est un couple : il faut 1.2), propositions « u$\leqslant 10000$ » (symbole mathématique au lieu de « u &lt;= 10000 ») ; code écrit en texte et en formules mêlés, sans police à chasse fixe ; « par: » sans espace. | Bloc de code (police fixe) : « u = 1.2*u + 12 », propositions « u &lt;= 10000 », « u > 10000 »… comme dans le sujet. | QCMBac/A2023/metropoleSept2023Q3.ts |
| canTSpea-NY2025 | C1 Contenu mathématique faux | Mêmes questions que can2a-NY2025 / can1a-NY2025, mêmes défauts (Q28 exposant 2 024, Q4 « pout », Q25 OUI/NON, Q3 « $....$ . », Q6 $\dfrac{1}{2033}$) ; Q13 « coeffcient » ; Q21 « $-2025x^2$ » et « $-4050x$ » sans séparateur ; Q12 couple ⟦(1\,012;1\,017)⟧ mis en évidence d'un bloc pour deux champs | voir can2a-NY2025 ; texNombre ; une évidence par champ | src/exercices/can/canNY-2025 |
| canTSpea-NY2026 | C1 Contenu mathématique faux | Mêmes questions et défauts que can1a-NY2026 / can2a-NY2026 ; Q13 « coeffcient » ; Q21 « $-2026x^2$ », « $-4052x$ » sans séparateur ; Q12 couple mis en évidence d'un bloc pour deux champs | voir can2a-NY2026 | src/exercices/can/canNY-2026 |
| canTSpea-2025 | C1 Contenu mathématique faux | Questions reprises de can2a-2025 et can1a-2025, mêmes défauts (Q3 constant -6, Q7 « nombnre », Q10 « 1+ », Q11 « $9,4=9\text{ h}…$ », Q27 « taux d'évolution globale ») ; Q16 : « $S={\\${miseEnEvidence(…)}\\}$ » (accolade de groupe au lieu de \{, rendu correct par hasard) | voir can2a-2025, can1a-2025 ; $S=\\{…\\}$ | src/exercices/can/canTspea-2025/canTspea-2025-Q16.ts:47 |
| canTSpea-2026 | C1 Contenu mathématique faux | Q15 : « l'énergie potentielle élastique $E_p$ … est donnée par $E=\dfrac{1}{2}k\times x^2$ » : notation $E_p$ puis $E$ (le canEnonce dit $E_p$) | $E_p=\dfrac{1}{2}kx^2$ et correction en $E_p$ | src/exercices/can/canTspea-2026/canTspea-2026-Q15.ts:62 |
| canTSpeAN20 | C1 Contenu mathématique faux | Correction : F(a) soustraite sans parenthèses (« $… - \dfrac{5}{2}\times(-3)^2 -\times(-3)$ » devrait être $-\left(\dfrac52\times(-3)^2-(-3)\right)$) ; « $-\times(-3)$ » quand d=±1 (ecritureAlgebriqueSauf1 suivi de \times) ; « $- -2\times(-4)^2$ » ; résultat mis en évidence brut avec point décimal (« -6.5 ») ; bornes égales possibles ($\int_{-3}^{-3}$, b=randint(a,a+5)) | F(b)-\left(F(a)\right) ; ecritureAlgebrique(d)\times ; texNombre du résultat ; b>a | src/exercices/can/TSpe/canTSpeAN20.ts:49 |
| canTSpeE01 | C1 Contenu mathématique faux | Repère noté « $\big(0,\vec\imath,\vec\jmath,\vec k\big)$ » : origine écrite avec le chiffre 0 au lieu de la lettre O ; coordonnées écrites avec ~;~ | $\big(O\,;\vec\imath,\vec\jmath,\vec k\big)$ | src/exercices/can/TSpe/canTSpeE01.ts:51 |
| canTSpeE02 | C1 Contenu mathématique faux | Repère noté « $\big(0,\vec\imath,\vec\jmath,\vec k\big)$ » : origine écrite avec le chiffre 0 au lieu de la lettre O ; coordonnées écrites avec ~;~ | $\big(O\,;\vec\imath,\vec\jmath,\vec k\big)$ | src/exercices/can/TSpe/canTSpeE02.ts:51 |
| canTSpeE03 | C1 Contenu mathématique faux | Repère noté « $\big(0,\vec\imath,\vec\jmath,\vec k\big)$ » : origine écrite avec le chiffre 0 au lieu de la lettre O ; coordonnées écrites avec ~;~ | $\big(O\,;\vec\imath,\vec\jmath,\vec k\big)$ | src/exercices/can/TSpe/canTSpeE03.ts:51 |
| TSA1-33 | C1 Contenu mathématique faux | « ≈ » posé d'office devant u_2, u_3 et u_4, même quand la valeur est exacte (u_2≈6,75 ; avec u_0=12 : u_2≈9, u_3≈8,5, u_4≈8,25), et « = » devant u_1 même si elle était arrondie. | Choisir « = » ou « \approx » selon que texNombre(termes[k], 3) arrondit ou non. | src/exercices/TSpe/TSA1-33.ts:290 |
| TSA1-44 | C1 Contenu mathématique faux | Appel Python écrit $\mathtt{seuil(0,001)}$ : avec la virgule, Python passe deux arguments (0 et 1) et la fonction plante ; l'élève qui recopie l'appel n'obtient pas 200. | Écrire l'appel avec un point (seuil(0.001)) en texteCode, comme dans le programme. | src/exercices/TSpe/TSA1-44.ts:119 |
| TSA1-46 | C1 Contenu mathématique faux | « ≈ » devant des valeurs exactes : $u_2\approx 11\,375$ alors que u_2=11 375 est calculé exactement plus haut. | Choisir « = » ou « \approx » selon que texNombre(terme, 1) arrondit ou non. | src/exercices/TSpe/TSA1-46.ts:150 |
| TSA1-47 | C1 Contenu mathématique faux | De u_n>8 000, la correction tire « 8 000-u_n ⩽ 0 » puis « décroissante », alors que l'inégalité stricte donne une suite strictement décroissante ; la phrase « la suite (v_n) est géométrique de raison 0,75 » est ensuite répétée telle quelle. | « 8 000-u_n&lt;0 », « u_{n+1}-u_n&lt;0 », « strictement décroissante » ; supprimer la phrase répétée (ligne 158 ou celle qui la précède). | src/exercices/TSpe/TSA1-47.ts:139 |
| TSA1-20 | C1 Contenu mathématique faux | Justification fausse : « La fonction cosinus est périodique. La suite $(5\cos(n))$ n'admet donc pas de limite. » (la périodicité de la fonction ne suffit pas : $\cos(2\pi n)$ est constante) ; « n'admet donc pas de limite » mis en évidence en texte alors que le champ attend $\not\exists$. | Admettre le résultat (« La suite $(\cos n)$ n'a pas de limite (résultat admis) ») ; évidence sur $\not\exists$. | TSpe/TSA1-20.ts |
| TSA1-27 | C1 Contenu mathématique faux | Correction : les égalités successives de $u_n$ sont reliées par « $\iff$ » (« $u_n=1+q+\cdots \iff u_n=\dfrac{1-q^{n+1}}{1-q}$ ») alors qu'il s'agit d'une suite d'égalités sur la même quantité ; « $q=\dfrac{-3}{5}$ » au lieu de $-\dfrac{3}{5}$. | Chaîne d'égalités ($u_n = … = …$) ; $-\dfrac{3}{5}$. | TSpe/TSA1-27.ts |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| TSA1-42 | X5 Débordement à 390 px | Correction, partie A question 5 : justifications en \text{} au bout de chaque ligne du aligned (« car, pour a>0 et b>0, a strictement inférieur à b ⟺ … ») : la ligne dépasse largement les 390 px. | Sortir les justifications de l'aligned (phrases sous le calcul) ou les raccourcir (« car ln est strictement croissante sur ]0 ; +∞[ »). | src/exercices/TSpe/TSA1-42.ts:199 |
| TSA1-12 | X5 Débordement à 390 px | Correction à 390 px : le calcul aligné avec ses justifications en vert (« ← hypothèse de récurrence ») élargit la page à 451 px ; « \text{car 2n+6=2(n+1)+4} » écrit en texte droit au lieu de formule. | Justifications sous chaque ligne sur petit écran ; « car $2n+6=2(n+1)+4$ ». | TSpe/TSA1-12.ts |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canTSpea-2026 | M4 QCM : évidence ≠ proposition | Q24 (QCM OUI/NON) : « (proche de $0$ mais non nul) » inutile et trompeur ; mise en évidence « pas colinéaires (NON) » au lieu de la proposition « NON » ; propositions en capitales | « Le déterminant est non nul : les vecteurs ne sont pas colinéaires. » et Non en évidence | src/exercices/can/canTspea-2026/canTspea-2026-Q24.ts:70 |
| canTSpeE06 | M1 Évidence refusée par le champ | Seul le radicande est mis en évidence ($\sqrt{⟦236⟧}$) alors que le champ attend $\sqrt{236}$ ; norme notée \vert\vert au lieu de \\| | $${miseEnEvidence(`\\sqrt{${…}}`)}$ ; \\|\vec u\\| | src/exercices/can/TSpe/canTSpeE06.ts:47 |
| TSA1-26 | M5 Texte en évidence | Texte dans miseEnEvidence : « $\boldsymbol{\textbf{Pas de limite}}$ » (règle : texte avec texteEnCouleurEtGras) ; la limite est mise en évidence deux fois (« $=0$ » puis « La bonne réponse est $0$ »). | texteEnCouleurEtGras('Pas de limite') ; une seule évidence. | TSpe/TSA1-26.ts |
| TSA1-30 | M5 Texte en évidence | Correction : $q$ utilisé sans être défini ($u_n$ est donnée explicitement) ; « $(-2)^n$ n'admet pas de limites en $+\infty$ » (singulier) et phrases sans point final ; « $\textbf{Pas de limite}$ » dans miseEnEvidence (texte) ; « Comme $0>-3$ » pour dire que $-3$ est négatif. | « Ici $q=-2$… », « n'admet pas de limite. », texteEnCouleurEtGras('Pas de limite'), « Comme $-3&lt;0$ ». | TSpe/TSA1-30.ts |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| TSA1-QCM01 | N1 Nombre hors $ | « $\left(v_{n}\right)$ converge vers 0 . » : 0 hors $ et espace avant le point ; correction réduite à « $\dfrac{0}{+\infty}\to 0$ » (quotient de limites écrit comme une fraction, sans phrase). | « converge vers $0$. » ; « Par quotient, $\lim\dfrac{v_n}{u_n}=0$, donc la suite converge. » | QCMBac/A2023/AmNordAout2023Q3.ts |
| TSA1-QCM02 | T5 Espaces | « définie … par: », « La suite $(u_n)$ est: » (deux-points collés) ; correction « Si pour tout entier naturel $n$, : » (virgule et deux-points), sans point final ; « arithmétique de raison 2 » (2 hors $) ; en interactif la bonne proposition n'est pas mise en évidence (seulement « réponse A » en non interactif). | Espaces insécables avant « : », $2$, conclusion « … géométrique de raison $\mathrm{e}^2$. » avec la proposition en évidence. | QCMBac/A2023/metropoleSept2023Q2.ts |
| TSA1-QCM04 | N1 Nombre hors $ | « géométrique de raison 1,2 » hors $ (proposition et conclusion), « par: », « est: » sans espace insécable. | « raison $1,2$ » ; « par : ». | QCMBac/A2023/metropoleSept2023Q4.ts |
| canTEA3-01 | T9 Mot en italique | « $PGCD(3;19)$ » : lettres en italique dans la formule | $\text{PGCD}(3\,;\,19)$ | src/exercices/can/Ex/canTEA3-01.ts |
| canTEC1-03 | T9 Mot en italique | « $z = -3-5i$ », « $-iz$ » : i en italique (le reste de la série écrit \mathrm{i}) ; « $\mathcal{Im}(-iz)$ » ; « $~~z$ » | \mathrm{i} ; \operatorname{Im} | src/exercices/can/Ex/canTEC1-03.ts |
| canTEC1-04 | T9 Mot en italique | « $\left(\mathrm{-i}\right)^{8}$ » : signe moins dans \mathrm ; « $\left(\mathrm{i}^{4}\right)^{1}$ » | $(-\mathrm{i})^{8}$ ; exposant 1 omis | src/exercices/can/Ex/canTEC1-04.ts |
| canTEC1-05 | T9 Mot en italique | « $z=-3-5i$ », « $a+ib$ » : i en italique (le reste de la série écrit \mathrm{i}) | \mathrm{i} | src/exercices/can/Ex/canTEC1-05.ts |
| canTEC2-05 | N6 Écriture algébrique | Forme algébrique mise en évidence « $\sqrt{3}-1\mathrm{i}$ » (coefficient 1 écrit) | $\sqrt3-\mathrm{i}$ | src/exercices/can/Ex/canTEC2-05.ts |
| canTSpeAN15 | T9 Mot en italique | « la fonction $ln(u)$ » : ln en italique | $\ln(u)$ | src/exercices/can/TSpe/canTSpeAN15.ts |
| canTSpeS03 | T9 Mot en italique | $e^{-n}$ en italique (constante e) ; $n\to\infty$ (aussi canTSpeS02, S04, S05, S06) | \mathrm{e}^{-n} ; n\to+\infty | src/exercices/can/TSpe/canTSpeS03.ts |
| TSA1-10 | N1 Nombre hors $ | Justifications en vert : « On ajoute 3. » (nombre hors $) ; « $\dfrac{1}{1}$ » laissé tel quel quand $a=1$. | « On ajoute $3$. » ; écrire $1$. | TSpe/TSA1-10.ts |
| TSA1-22 | N5 Négatif sans parenthèses | « $\lim_{n\to+\infty}-5n^{2}=-\infty$ », « $\lim -\dfrac{2}{n}=0$ » : terme négatif sans parenthèses après lim (lu comme $-\lim$) ; titre « par somme ou quotient » alors que les questions ne sont que des sommes (graines revue-0-a, revue-1-a). | $\lim\left(-5n^2\right)$ ; vérifier la présence des quotients. | TSpe/TSA1-22.ts |
| TSA1-23 | N5 Négatif sans parenthèses | Même écriture que TSA1-22 : « $\lim_{n\to+\infty}-2n=-\infty$ », « $\lim -1=-1$ » sans parenthèses. | $\lim\left(-2n\right)$ | TSpe/TSA1-23.ts |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canTSpea-2026 | R10 Français | Q18 : « Un polynome du second degré » ; doubles espaces | polynôme | src/exercices/can/canTspea-2026/canTspea-2026-Q18.ts:55 |
| canTSpea-2026 | R10 Français | Q21 : « Le total des coefficents » | coefficients | src/exercices/can/canTspea-2026/canTspea-2026-Q21.ts:79 |
| canTEC1-02 | R1 Titre | Titre « produit de nombres complexes » (minuscule, sans verbe) | Calculer le produit de nombres complexes | src/exercices/can/Ex/canTEC1-02.ts:14 |
| canTSpeAN14 | R1 Titre | Titre terminé par un point ; énoncé « Résoudre sur $D=$ $~]-\infty~;~-\dfrac{8}{5}~[~,~$l'équation » (virgule dans la formule, ~ multiples) | Résoudre sur $D=\left]-\infty\,;\,-\dfrac85\right[$ l'équation | src/exercices/can/TSpe/canTSpeAN14.ts |
| canTSpeS01 | R10 Français | « avec les limites de références » ; titre « Limite d'un polynôme. » (point, sans verbe) | limites de référence ; Déterminer la limite d'un polynôme | src/exercices/can/TSpe/canTSpeS01.ts |
| canTSpeS07 | R10 Français | « forme indeterminée » (accent) ; $\lim\limits_{n\to\infty}$ au lieu de $n\to+\infty$ | indéterminée ; n\to+\infty | src/exercices/can/TSpe/canTSpeS07.ts |
| canTSpeS08 | R10 Français | « forme indeterminée » (accent) ; $\lim\limits_{n\to\infty}$ au lieu de $n\to+\infty$ | indéterminée ; n\to+\infty | src/exercices/can/TSpe/canTSpeS08.ts |
| canTSpeS08 | R1 Titre | Titre « Limite de $\sqrt(n)-n^p$ » : \sqrt(n) mal écrit (rend la racine de « ( ») | $\sqrt{n}-n^p$ | src/exercices/can/TSpe/canTSpeS08.ts:7 |
| canTSpeS09 | R10 Français | « forme indeterminée » (accent) ; $\lim\limits_{n\to\infty}$ au lieu de $n\to+\infty$ | indéterminée ; n\to+\infty | src/exercices/can/TSpe/canTSpeS09.ts |
| TSA1-32 | R16  | Correction, question 2 de la partie 2 : « Pour tout entier naturel n : » suivi d'une autre phrase qui répète « pour tout entier naturel n : ». | Supprimer la ligne « Pour tout entier naturel $n$ : » de la question 2. | src/exercices/TSpe/TSA1-32.ts:104 |
| TSA1-40 | R2 Tutoiement, impératif | Texte dans miseEnEvidence : « décroissante » et « convergente » (\text{…}), alors que la conclusion de la question 1 passe par texteEnCouleur. | texteEnCouleurEtGras('décroissante') et texteEnCouleurEtGras('convergente'), hors des $. | src/exercices/TSpe/TSA1-40.ts:92 |
| TSA1-42 | R16  | « Quelle que soit la quantité de prises » (des prises se comptent) ; « la 14e prise » sans exposant. | « Quel que soit le nombre de prises » ; $14^{\text{e}}$. | src/exercices/TSpe/TSA1-42.ts:190 |
| TSA1-43 | R3  | Seuil écrit sans espace des milliers dans les maths de l'énoncé, des propositions et de la correction : $u_n>10000$, $w\leqslant 2000$. | texNombre(seuil) dans les $…$ (garder 10000 dans le code Python). | src/exercices/TSpe/TSA1-43.ts:46 |
| TSA1-44 | R2 Tutoiement, impératif | Texte dans miseEnEvidence : « f est strictement croissante sur … » et « (u_n) converge vers 1 » (\text{…}). | Phrase en texteEnCouleurEtGras, intervalle et 1 seuls en miseEnEvidence. | src/exercices/TSpe/TSA1-44.ts:172 |
| TSA1-45 | R2 Tutoiement, impératif | Texte dans miseEnEvidence : « (v_n) est géométrique de raison 0,85 et de premier terme v_0=… ». | Phrase en texteEnCouleurEtGras, raison et premier terme seuls en miseEnEvidence. | src/exercices/TSpe/TSA1-45.ts:142 |
| TSA1-45 | R1 Titre | Énoncé : « 15 % des clients » et « 900 nouveaux clients » hors des $ (le reste de l'énoncé les met). | Taux et apport entre $ : $15\,\%$ et $900$ (texNombre). | src/exercices/TSpe/TSA1-45.ts:69 |
| TSA1-46 | R2 Tutoiement, impératif | Texte dans miseEnEvidence : « strictement décroissante », « géométrique de raison 0,75 ». | texteEnCouleurEtGras pour le texte, miseEnEvidence pour la raison seule. | src/exercices/TSpe/TSA1-46.ts:129 |
| TSA1-47 | R1 Titre | Années entre $ : « En $2024$ », « l’année $2025$ » (les années restent hors des maths). | Écrire ${anneeInitiale} et ${anneeInitiale + 1} sans $. | src/exercices/TSpe/TSA1-47.ts:108 |
| TSA1-11 | R14  | Plusieurs questions : la même fonction revient (Q3 et Q7, Q6 et Q8, Q1 et Q4, graine revue-1-a) ; « $f'(x)=\dfrac{2}{4}x$ » non simplifié ; question 2 sans point final. | Test de doublon sur les coefficients ; simplifier $\dfrac{2}{4}$ ; point final. | TSpe/TSA1-11.ts |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| canTSpea-NY2025 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| canTSpeE03 | I1 Bonne réponse refusée | 14 | bonne réponse refusée (0/1) Une seule variable de paramétrage doit être utilisée. Une seule variable de paramétrage doit être utilisée. Par exemple, utilisez se |
| TSA5-30 | I1 Bonne réponse refusée | 3 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| TSG2-30 | I1 Bonne réponse refusée | 14 | bonne réponse refusée (0/1) Une seule variable de paramétrage doit être utilisée. Une seule variable de paramétrage doit être utilisée. Par exemple, utilisez se |
| TTE-11 | I1 Bonne réponse refusée | 4 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| canTSpea-NY2025 | I2 Réponse fausse acceptée | 2 | réponse fausse acceptée |
| canTSpea-NY2026 | I2 Réponse fausse acceptée | 3 | réponse fausse acceptée |
| TEG1-21 | I2 Réponse fausse acceptée | 46 | réponse fausse acceptée |
| TEM1-14 | I2 Réponse fausse acceptée | 60 | réponse fausse acceptée |
| TEM1-15 | I2 Réponse fausse acceptée | 48 | réponse fausse acceptée |
| TEM1-22 | I2 Réponse fausse acceptée | 68 | réponse fausse acceptée |
| TEM1-23 | I2 Réponse fausse acceptée | 34 | réponse fausse acceptée |
| TEM1-24 | I2 Réponse fausse acceptée | 136 | réponse fausse acceptée |
| TEM1-25 | I2 Réponse fausse acceptée | 84 | réponse fausse acceptée |
| TEM1-31 | I2 Réponse fausse acceptée | 56 | réponse fausse acceptée |
| TEM1-32 | I2 Réponse fausse acceptée | 64 | réponse fausse acceptée |
| TSP3-01 | I2 Réponse fausse acceptée | 12 | réponse fausse acceptée |
| TSG1-04 | I4 Question sans champ | 1 | champ absent de la page |
| TEC1-51 | X1 Erreur | 1 | console : KaTeX auto-render: Failed to parse `z\neqi` with  ParseError: KaTeX parse error: Undefined control sequence: \neqi at position 3: {z\̲n̲e̲q̲i̲}     at |
| TTE-7 | X1 Erreur | 1 | non interactif : page.evaluate: Target page, context or browser has been closed |
| TTE-9 | X1 Erreur | 4 | interactif (incorrecte) : page.evaluate: Target page, context or browser has been closed |
| TEC1-51 | X2 Formule cassée | 1 | « $ » visible : quent, on a 𝑍 ∈ 𝑅 Z∈R si et seulement si 𝑥 = 0 x=0, avec $z\neqi$. 𝑥 = 0 ⟺ 𝑥 = 0 x=0⟺x=0. Ainsi, les solutions sont |
| TEG1-11 | X2 Formule cassée | 14 | nombre impair de $ : c la réponse est ${\color{#F15929}\boldsymbol{\textbf{oui}}}$.&lt;/li> &lt;/ol> |
| TSA5-42 | X2 Formule cassée | 1 | « $ » visible :  ≈ 12 , 33 &lt; 25 u 1 ​ =ln(3×25+1)+8=ln(76)+8≈12,33&lt;25, donc $u_1Montrons par récurrence que, pour tout entier naturel 𝑛 |
| TSA3-46 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : N1 Nombre hors $ 1579 ; T4  837 ; T5 Espaces 433 ; N6 Écriture algébrique 433 ; R5 Virgule 420 ; T6 Points de suspension 253 ; T3  246 ; N2 Séparateur des milliers 179 ; T8  82 ; R6  51 ; R9  45 ; N3  40 ; N5 Négatif sans parenthèses 27 ; R1 Titre 16 ; X2 Formule cassée 10 ; R10 Français 7 ; X3  5 ; R8  2 ; R2 Tutoiement, impératif 2.
