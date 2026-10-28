# Revue des exercices : Terminale

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **37 sur 293**. Constats confirmés : **26**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Contenu mathématique faux | 8 |
| Mise en évidence (miseEnEvidence et champs) | 2 |
| Typographie (nombres, espaces, notations) | 7 |
| Rédaction (français, titres, consignes) | 9 |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canTSpea-NY2025 | C1 Contenu mathématique faux | Mêmes questions que can2a-NY2025 / can1a-NY2025, mêmes défauts (Q28 exposant 2 024, Q4 « pout », Q25 OUI/NON, Q3 « $....$ . », Q6 $\dfrac{1}{2033}$) ; Q13 « coeffcient » ; Q21 « $-2025x^2$ » et « $-4050x$ » sans séparateur ; Q12 couple ⟦(1\,012;1\,017)⟧ mis en évidence d'un bloc pour deux champs | voir can2a-NY2025 ; texNombre ; une évidence par champ | src/exercices/can/canNY-2025 |
| canTSpea-NY2026 | C1 Contenu mathématique faux | Mêmes questions et défauts que can1a-NY2026 / can2a-NY2026 ; Q13 « coeffcient » ; Q21 « $-2026x^2$ », « $-4052x$ » sans séparateur ; Q12 couple mis en évidence d'un bloc pour deux champs | voir can2a-NY2026 | src/exercices/can/canNY-2026 |
| canTSpea-2025 | C1 Contenu mathématique faux | Questions reprises de can2a-2025 et can1a-2025, mêmes défauts (Q3 constant -6, Q7 « nombnre », Q10 « 1+ », Q11 « $9,4=9\text{ h}…$ », Q27 « taux d'évolution globale ») ; Q16 : « $S={\\${miseEnEvidence(…)}\\}$ » (accolade de groupe au lieu de \{, rendu correct par hasard) | voir can2a-2025, can1a-2025 ; $S=\\{…\\}$ | src/exercices/can/canTspea-2025/canTspea-2025-Q16.ts:47 |
| canTSpea-2026 | C1 Contenu mathématique faux | Q15 : « l'énergie potentielle élastique $E_p$ … est donnée par $E=\dfrac{1}{2}k\times x^2$ » : notation $E_p$ puis $E$ (le canEnonce dit $E_p$) | $E_p=\dfrac{1}{2}kx^2$ et correction en $E_p$ | src/exercices/can/canTspea-2026/canTspea-2026-Q15.ts:62 |
| canTSpeAN20 | C1 Contenu mathématique faux | Correction : F(a) soustraite sans parenthèses (« $… - \dfrac{5}{2}\times(-3)^2 -\times(-3)$ » devrait être $-\left(\dfrac52\times(-3)^2-(-3)\right)$) ; « $-\times(-3)$ » quand d=±1 (ecritureAlgebriqueSauf1 suivi de \times) ; « $- -2\times(-4)^2$ » ; résultat mis en évidence brut avec point décimal (« -6.5 ») ; bornes égales possibles ($\int_{-3}^{-3}$, b=randint(a,a+5)) | F(b)-\left(F(a)\right) ; ecritureAlgebrique(d)\times ; texNombre du résultat ; b>a | src/exercices/can/TSpe/canTSpeAN20.ts:49 |
| canTSpeE01 | C1 Contenu mathématique faux | Repère noté « $\big(0,\vec\imath,\vec\jmath,\vec k\big)$ » : origine écrite avec le chiffre 0 au lieu de la lettre O ; coordonnées écrites avec ~;~ | $\big(O\,;\vec\imath,\vec\jmath,\vec k\big)$ | src/exercices/can/TSpe/canTSpeE01.ts:51 |
| canTSpeE02 | C1 Contenu mathématique faux | Repère noté « $\big(0,\vec\imath,\vec\jmath,\vec k\big)$ » : origine écrite avec le chiffre 0 au lieu de la lettre O ; coordonnées écrites avec ~;~ | $\big(O\,;\vec\imath,\vec\jmath,\vec k\big)$ | src/exercices/can/TSpe/canTSpeE02.ts:51 |
| canTSpeE03 | C1 Contenu mathématique faux | Repère noté « $\big(0,\vec\imath,\vec\jmath,\vec k\big)$ » : origine écrite avec le chiffre 0 au lieu de la lettre O ; coordonnées écrites avec ~;~ | $\big(O\,;\vec\imath,\vec\jmath,\vec k\big)$ | src/exercices/can/TSpe/canTSpeE03.ts:51 |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canTSpea-2026 | M4 QCM : évidence ≠ proposition | Q24 (QCM OUI/NON) : « (proche de $0$ mais non nul) » inutile et trompeur ; mise en évidence « pas colinéaires (NON) » au lieu de la proposition « NON » ; propositions en capitales | « Le déterminant est non nul : les vecteurs ne sont pas colinéaires. » et Non en évidence | src/exercices/can/canTspea-2026/canTspea-2026-Q24.ts:70 |
| canTSpeE06 | M1 Évidence refusée par le champ | Seul le radicande est mis en évidence ($\sqrt{⟦236⟧}$) alors que le champ attend $\sqrt{236}$ ; norme notée \vert\vert au lieu de \\| | $${miseEnEvidence(`\\sqrt{${…}}`)}$ ; \\|\vec u\\| | src/exercices/can/TSpe/canTSpeE06.ts:47 |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| canTEA3-01 | T9 Mot en italique | « $PGCD(3;19)$ » : lettres en italique dans la formule | $\text{PGCD}(3\,;\,19)$ | src/exercices/can/Ex/canTEA3-01.ts |
| canTEC1-03 | T9 Mot en italique | « $z = -3-5i$ », « $-iz$ » : i en italique (le reste de la série écrit \mathrm{i}) ; « $\mathcal{Im}(-iz)$ » ; « $~~z$ » | \mathrm{i} ; \operatorname{Im} | src/exercices/can/Ex/canTEC1-03.ts |
| canTEC1-04 | T9 Mot en italique | « $\left(\mathrm{-i}\right)^{8}$ » : signe moins dans \mathrm ; « $\left(\mathrm{i}^{4}\right)^{1}$ » | $(-\mathrm{i})^{8}$ ; exposant 1 omis | src/exercices/can/Ex/canTEC1-04.ts |
| canTEC1-05 | T9 Mot en italique | « $z=-3-5i$ », « $a+ib$ » : i en italique (le reste de la série écrit \mathrm{i}) | \mathrm{i} | src/exercices/can/Ex/canTEC1-05.ts |
| canTEC2-05 | N6 Écriture algébrique | Forme algébrique mise en évidence « $\sqrt{3}-1\mathrm{i}$ » (coefficient 1 écrit) | $\sqrt3-\mathrm{i}$ | src/exercices/can/Ex/canTEC2-05.ts |
| canTSpeAN15 | T9 Mot en italique | « la fonction $ln(u)$ » : ln en italique | $\ln(u)$ | src/exercices/can/TSpe/canTSpeAN15.ts |
| canTSpeS03 | T9 Mot en italique | $e^{-n}$ en italique (constante e) ; $n\to\infty$ (aussi canTSpeS02, S04, S05, S06) | \mathrm{e}^{-n} ; n\to+\infty | src/exercices/can/TSpe/canTSpeS03.ts |

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

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| TSA5-30 | I1 Bonne réponse refusée | 3 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| TSG2-30 | I1 Bonne réponse refusée | 14 | bonne réponse refusée (0/1) Une seule variable de paramétrage doit être utilisée. Une seule variable de paramétrage doit être utilisée. Par exemple, utilisez se |
| TEM1-14 | I2 Réponse fausse acceptée | 60 | réponse fausse acceptée |
| TEM1-15 | I2 Réponse fausse acceptée | 48 | réponse fausse acceptée |
| TEM1-22 | I2 Réponse fausse acceptée | 68 | réponse fausse acceptée |
| TEM1-23 | I2 Réponse fausse acceptée | 34 | réponse fausse acceptée |
| TSP3-01 | I2 Réponse fausse acceptée | 12 | réponse fausse acceptée |
| TSG1-04 | I4 Question sans champ | 1 | champ absent de la page |
| TEC1-51 | X1 Erreur | 1 | console : KaTeX auto-render: Failed to parse `z\neqi` with  ParseError: KaTeX parse error: Undefined control sequence: \neqi at position 3: {z\̲n̲e̲q̲i̲}     at |
| TEC1-51 | X2 Formule cassée | 1 | « $ » visible : quent, on a 𝑍 ∈ 𝑅 Z∈R si et seulement si 𝑥 = 0 x=0, avec $z\neqi$. 𝑥 = 0 ⟺ 𝑥 = 0 x=0⟺x=0. Ainsi, les solutions sont |
| TSA5-42 | X2 Formule cassée | 1 | « $ » visible :  ≈ 12 , 33 &lt; 25 u 1 ​ =ln(3×25+1)+8=ln(76)+8≈12,33&lt;25, donc $u_1Montrons par récurrence que, pour tout entier naturel 𝑛 |
| TSA3-46 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : N1 Nombre hors $ 1537 ; T4  559 ; R5 Virgule 420 ; T5 Espaces 416 ; N6 Écriture algébrique 390 ; T6 Points de suspension 247 ; T3  242 ; N2 Séparateur des milliers 159 ; T8  82 ; R6  51 ; R9  45 ; N3  40 ; N5 Négatif sans parenthèses 27 ; R1 Titre 16 ; R10 Français 6 ; R8  2 ; X3  2 ; R2 Tutoiement, impératif 2.
