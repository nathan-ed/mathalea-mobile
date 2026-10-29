# Revue des exercices : 1re

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **288 sur 325**. Constats confirmés : **68**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Interactif faux (la bonne réponse est refusée, ou pas de champ) | 1 |
| Contenu mathématique faux | 8 |
| Rendu cassé (formule, débordement, erreur) | 1 |
| Mise en évidence (miseEnEvidence et champs) | 9 |
| Typographie (nombres, espaces, notations) | 12 |
| Rédaction (français, titres, consignes) | 37 |

## Interactif faux (la bonne réponse est refusée, ou pas de champ)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 1A-E05-1 | I1 Bonne réponse refusée | Question « Quel est le taux à appliquer… ? » : seule la fraction exacte 11/39 est acceptée ; « 28,2 \% » et « 0,282 » sont refusés (testé) alors que la consigne n'impose ni fraction ni pourcentage | Préciser « sous forme de fraction irréductible » ou accepter une valeur approchée en pourcentage | src/exercices/1e/ |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can1P11-04 | C1 Contenu mathématique faux | Correction en fractions sur $100\,000$ (« $P(\bar A)\times P_{\bar A}(C)=\dfrac{20\,000}{100\,000}x$ », « $\dfrac{\dfrac{16\,000}{100\,000}}{\dfrac{20\,000}{100\,000}}$ ») au lieu de fractions simplifiées ; résultat mis en évidence non irréductible (⟦\dfrac{8}{10}⟧) | fractions simplifiées (\dfrac{1}{5}x…), résultat $\dfrac{4}{5}$ | src/exercices/can/1e/can1P11-04.ts |
| can1SD3-01 | C1 Contenu mathématique faux | Cas avec $\sqrt{x}$ (réponse Faux) : la correction affirme « La fonction $g$ est une fonction polynôme du second. L'expression contient une racine carrée de $x$ » : « est » au lieu de « n'est pas », degré manquant | ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré | src/exercices/can/1e/can1SD3-01.ts:375 |
| can1a-2024 | C1 Contenu mathématique faux | Q19 : dérivée « $f'(x)=\dfrac{1}{2}\times 2x+b$ » : utilise la constante b au lieu du coefficient a (ex. $\frac12x^2+7x-2$ → « $\frac12\times 2x-2$ ») ; canEnonce sans le x (« $\dfrac{1}{2}x^2-3+4$ ») | \\dfrac{1}{2}\\times 2x${ecritureAlgebrique(a)} ; ${ecritureAlgebriqueSauf1(a)}x dans canEnonce | src/exercices/can/can1a-2024/can1a-2024-Q19.ts:44 |
| can1a-2024 | C1 Contenu mathématique faux | Q25 (aléatoire) : « Le double de $2^{30}$ est $2\times 2^{29}$ » alors que la question porte sur $2^{29}$ | Le double de $2^{${a}}$ | src/exercices/can/can1a-2024/can1a-2024-Q25.ts:54 |
| can1a-2025 | C1 Contenu mathématique faux | Q11 : « $9,4 = 9\text{ h }+…$ » : l'unité h manque après 9,4 (égalité fausse telle qu'écrite) | $9,4\text{ h}=9\text{ h}+0,4\times 60\text{ min}=…$ | src/exercices/can/can1a-2025/can1a-2025-Q11.ts:38 |
| can1a-2026 | C1 Contenu mathématique faux | Q28 : « les événements $C$ et $\overline{C}$ forment une partition de $D$ » : ils forment une partition de l'univers (et $C\cap D$, $\overline{C}\cap D$ une partition de $D$) | forment une partition de l'univers | src/exercices/can/can1a-2026/can1a-2026-Q28.ts:54 |
| can1a-NY2025 | C1 Contenu mathématique faux | Mêmes questions que can2a-NY2025 avec les mêmes erreurs : Q28 (exposant 2 024 dans la correction au lieu de 2 023), Q21 ($(\sqrt{2\,024})^2$ pour $\sqrt{2\,025}$), Q4 « pout », Q25 QCM « OUI/NON », Q18 $\dfrac{1}{-2025}$ | voir can2a-NY2025 | src/exercices/can/canNY-2025/can2NY-2025-Q28.ts:52 |
| can1a-NY2026 | C1 Contenu mathématique faux | Mêmes questions que can2a-NY2026 avec les mêmes défauts : Q4 « pout », Q3 « $....$ . », Q18 $\dfrac{1}{-2026}$, Q25 « $2026$ » sans séparateur, Q6 $\dfrac{1}{2034}$, Q16 intervalles sans séparateur dans la correction | voir can2a-NY2026 | src/exercices/can/canNY-2026 |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can1D3-03 | X2 Formule cassée | Un des cas écrit « f'(x)=$ » sans $ ouvrant : « f'(x)= » s'affiche en texte et le $ final ouvre une formule avec la suite | "$f'(x)=$" | src/exercices/can/1e/can1D3-03.ts:50 |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can1D1-05 | M8 Évidences et champs | Deux mises en évidence pour un champ (⟦4(x-2)+6⟧ puis ⟦4x-2⟧) ; en $x=0$ : « $2(x+0)+2$ » (ecritureAlgebrique(-0)) | seule la forme réduite en évidence ; traiter nbre=0 | src/exercices/can/1e/can1D1-05.ts:183 |
| can1SD12-03 | M8 Évidences et champs | Question sur l'ordonnée du sommet : l'abscisse intermédiaire ⟦2⟧ est aussi mise en évidence (deux évidences pour un champ) | abscisse sans évidence quand on demande l'ordonnée | src/exercices/can/1e/can1SD12-03.ts |
| can1SD21-02 | M8 Évidences et champs | Les opérations faites sur les deux membres (⟦+5⟧, ⟦-8⟧) sont mises en orange comme des réponses | autre couleur pour les opérations | src/exercices/can/1e/can1SD21-02.ts |
| can1a-2022 | M2 Unité en évidence | Q18 : le champ porte « % » après lui, la correction met en évidence ⟦11\,\%⟧ | $${miseEnEvidence(texNombre(reponse, 0))}\\,\\%$ | src/exercices/can/can1a-2022/can1a-2022-Q18.ts:39 |
| can1a-2022 | M5 Texte en évidence | Q19 : unités « h » et « min » mises en orange gras avec les valeurs (champ HMS unique, quatre mises en évidence) | valeurs seules en évidence, unités en noir | src/exercices/can/can1a-2022/can1a-2022-Q19.ts:44 |
| can1a-2022 | M8 Évidences et champs | Q7 : la fraction non simplifiée ⟦\dfrac{4}{6}⟧ est mise en évidence, puis simplifiée en $\dfrac{2}{3}$ sans évidence | mettre en évidence la forme finale | src/exercices/can/can1a-2022/can1a-2022-Q7.ts:61 |
| can1a-2024 | M4 QCM : évidence ≠ proposition | Q2, Q16, Q29 (Vrai/Faux) : la correction met en évidence « FAUSSE » ou « Vraie » (casse et accord différents) au lieu de la proposition « Faux »/« Vrai » | L'affirmation est fausse : il fallait cocher « Faux » (Faux en évidence) | src/exercices/can/can1a-2024/can1a-2024-Q16.ts:50 |
| can1a-2026 | M8 Évidences et champs | Q14 : deux mises en évidence (⟦45⟧ pour Δ, ⟦2⟧ pour le nombre de solutions) pour un seul champ | seul le nombre de solutions en évidence | src/exercices/can/can1a-2026/can1a-2026-Q14.ts |
| can1a-2026 | M4 QCM : évidence ≠ proposition | Q26 (QCM) : la proposition à cocher est « de raison $4$ » ; la correction met « de raison » en orange gras et $4$ à part | mettre en évidence la proposition entière ou la raison seule | src/exercices/can/can1a-2026/can1a-2026-Q26.ts:60 |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| can1S22-01 | T6 Points de suspension | Énoncé interactif « $u_{2}=.....$ [champ] » : points de suspension devant le champ (doublon du champ) | $u_{2}=$ suivi du champ ; \ldots seulement hors interactif | src/exercices/can/1e/can1S22-01.ts |
| can1S22-02 | T6 Points de suspension | Énoncé interactif « $u_{2}=.....$ [champ] » : points de suspension devant le champ (doublon du champ) | $u_{2}=$ suivi du champ ; \ldots seulement hors interactif | src/exercices/can/1e/can1S22-02.ts |
| can1SD3-04 | N6 Écriture algébrique | « $-18x+19x=1x$ », « $-x\times(-1)+(-1)\times 5x=1x-5x$ » ; « Le coefficient du terme en $x$ … est $-18x$ » (le coefficient est $-18$) | rienSi1 ; le terme en $x$ est $-18x$ | src/exercices/can/1e/can1SD3-04.ts |
| can1a-NY2024 | N6 Écriture algébrique | Q5 : « $\dfrac{2\,024+-6}{2}$ » (signes accolés) | ecritureParentheseSiNegatif | src/exercices/can/6e/CANSpeciale2024.ts |
| can1a-NY2024 | N1 Nombre hors $ | Q17 : correction hors formules (« égal à 6 minutes. 24 minutes correspondent … soit 0,4 h ») | $6$ minutes, $24$ minutes, $0,4$ h | src/exercices/can/6e/CANSpeciale2024.ts:1741 |
| can1a-NY2024 | N2 Séparateur des milliers | Q2 : « $-2\times 2024+2$ » et Q7 « $2024-13$ » sans séparateur des milliers (le reste du sujet écrit $2\,024$) | ${texNombre(2024)} | src/exercices/can/6e/CANSpeciale2024.ts:2446 |
| can1a-2022 | T1 Espace avant % | Q10 : « $90$ $\%$ de $90$ » : % dans une formule séparée (espace normale sécable avant %) ; doubles espaces « $\%$  de » | $90\,\%$ de $90$ | src/exercices/can/can1a-2022/can1a-2022-Q10.ts:35 |
| can1a-2022 | N1 Nombre hors $ | Q26 : correction du script hors formules : « tant que u&lt;11 », « u=5 et n=0 », « 5 $ +$ 5 = 10 » (signe + seul en maths, nombres hors $) ; « \hline\\ » ajoute une ligne vide au tableau | $u=5$ et $n=0$, puis $n=1$ et $u=5+5=10$… | src/exercices/can/can1a-2022/can1a-2022-Q26.ts:47 |
| can1a-2025 | N6 Écriture algébrique | Q17 (sujet officiel, $\dfrac{1}{x^2}$) : « $\dfrac{-2x^{}}{x^{4}}$ » (exposant vide quand n-1=1) | $\dfrac{-2x}{x^4}$ (exposant omis si 1) | src/exercices/can/can1a-2025/can1a-2025-Q17.ts |
| can1a-2025 | T5 Espaces | Q18 : « du second degré :$[f(x)=a(x-\alpha)^2+\beta]$ » : espace manquante avant la formule, crochets inutiles ; double espace « de  $x\longmapsto$ » | du second degré : $f(x)=a(x-\alpha)^2+\beta$ | src/exercices/can/can1a-2025/can1a-2025-Q18.ts:38 |
| can1a-2025 | T5 Espaces | Q22 : « a deux solutions . » (espace avant le point) | deux solutions. | src/exercices/can/can1a-2025/can1a-2025-Q22.ts |
| can1a-NY2025 | N2 Séparateur des milliers | Q6 : réponse « $\dfrac{1}{2033}$ » sans séparateur ; Q16 : intervalles de la correction écrits $]-2020\,;\,2025[$ sans séparateur (l'énoncé écrit $2\,020$) | texNombre | src/exercices/can/canNY-2025 |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 1A-F08-2 | R16  | Correction : « Le coefficient directeur m … est donnée par la formule » (accord) | est donné | relecture |
| 1A-F08-3 | R16  | Correction : « Le coefficient directeur m … est donnée par la formule » (accord) | est donné | relecture |
| 1A-P05-8 | R2 Tutoiement, impératif | Correction : « Étape 1 : la case croisée manquante. » entièrement en miseEnEvidence (texte) | texteEnCouleurEtGras | relecture |
| 1AL11-1 | R3  | QCM : « de raison  $9$ » deux espaces | Un seul espace | relecture |
| 1AL11-1QCM | R10 Français | Énoncé : « u_n=-1n^2+4 » (coefficient 1 écrit) | rienSi1 / ecritureAlgebrique | relecture |
| 1AL11-4QCM | R16  | Correction : « de rasion r » (raison) | raison | relecture |
| 1AL11-5QCM | R16  | Énoncé : « La raison de cette suite est est égale à » (doublon) et « u_{16 } » (espace dans l'indice) | est égale ; u_{16} | relecture |
| 1AL11-8 | R12  | « ... » au lieu de \ldots (aussi 1AL11-8b) | \ldots | relecture |
| 1AL12-20 | R13  | Titre et énoncé : « Etudier » sans accent (majuscule accentuée) | Étudier | relecture |
| 1AL12-21 | R13  | Titre et énoncé : « Etudier » sans accent (majuscule accentuée) | Étudier | relecture |
| 1AL20-11 | R16  | Titre : « discriminant  d'une » deux espaces | Un seul espace | relecture |
| 1AL21-10 | R3  | Énoncé : A(-6 ; 5) avec espace insécable avant le point-virgule seulement (pas \,;\,) ; incohérent avec les autres exercices | A\left(-6\,;\,5\right) | relecture |
| 1AL23-23 | R16  | uuid « fe4dg » contient un caractère non hexadécimal (les autres sont en hexadécimal) | Vérifier l'uuid | relecture |
| 1AL23-52 | R16  | Énoncé : « En déduire, les coordonnées » virgule en trop | En déduire les coordonnées | relecture |
| 1AN14-1 | R16  | Titre contenant du LaTeX brut « $\lambda u$ » (aussi 1AN14-4 « $u + v$ ») | Titre lisible ou rendu LaTeX | relecture |
| 1AN14-10 | R3  | Titre : « du type$\dfrac{a}{u}$ » espace manquant avant le $ | du type $…$ | relecture |
| 1AN20-5 | R16  | Correction : « ne s'annule pas $\mathbb{R}\smallsetminus\{-5\}$ » (manque « sur ») | ne s'annule pas sur | relecture |
| 1AN20-7 | R3  | Intervalle « [-3\,;1] » : espace fine avant le point-virgule seulement | [-3\,;\,1] | relecture |
| 1AN31-3 | R12  | Correction et réponse attendue : « e^{kx} », « e^{5x} » en italique alors que l'énoncé utilise \mathrm{e} | \mathrm{e} | relecture |
| 1A-C08-2 | R5 Virgule | Correction : phrase terminée par deux points « …⟦9y+4y⟧.. » | Un seul point | src/exercices/1e/ |
| 1A-C15-5 | R3  | Correction : « $\dfrac{2000}{1000}$ » sans espace fine (mais $2\,000$ avant) | texNombre | src/exercices/1e/ |
| 1A-E04-2 | R16  | Énoncé : « Le prix d’un article connait » (connaît) | « connaît » | src/exercices/1e/ |
| 1A-F02-13 | R16  | Correction : guillemets droits "les bras" tournés vers le bas (aussi 1A-F02-14) | Guillemets français | src/exercices/1e/ |
| 1A-F02-7 | R14  | Correction : la dernière ligne « $x>-3$ » est répétée deux fois dans le bloc aligné | Supprimer le doublon | src/exercices/1e/ |
| 1A-F04-3 | R2 Tutoiement, impératif | Correction : la phrase correcte est mise en évidence en cinq morceaux (⟦L'inéquation ⟧$⟦f(x)\leqslant 0⟧$⟦ a pour ensemble… ⟧) : texte dans miseEnEvidence | texteEnCouleurEtGras pour la phrase | src/exercices/1e/ |
| can1E1-01 | R10 Français | Libellé du paramètre « Produit et puisances » | puissances | src/exercices/1e/1AN30-2.ts:58 |
| can1SD11-01 | R10 Français | « L'abscisse du sommet de la parabole est positif / négatif. Celui-ci est donné par » (accords) ; guillemets droits « "les bras" » | est positive / négative. Elle est donnée par | src/exercices/can/1e/can1SD11-01.ts:111 |
| can1SD21-03 | R10 Français | « Un poduit de deux facteurs » | produit | src/exercices/can/1e/can1SD21-03.ts:305 |
| can1SD21-04 | R10 Français | Point isolé après le champ (« point-virgule : [champ] . ») | retirer le texteApres « . » | src/exercices/can/1e/can1SD21-04.ts |
| can1SD22-01 | R10 Français | Énoncé « fonction polynôme du second définie par » (degré manquant) ; correction « En effet le fonction est d'abord » | du second degré ; la fonction | src/exercices/can/1e/can1SD22-01.ts:59 |
| can1SD22-04 | R10 Français | « fonction polynôme du scond degré » | second | src/exercices/can/1e/can1SD22-04.ts:107 |
| can1SD23-01 | R1 Titre | Titre « Déterminer le sens de variation d'un pôlynome du second degré » | polynôme | src/exercices/can/1e/can1SD23-01.ts:15 |
| can1a-2022 | R10 Français | Q20 à Q22 : « À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation. » : phrase sans verbe principal | Le graphique ci-dessous représente une fonction $f$ et une tangente à sa courbe. | src/exercices/can/can1a-2022/can1a-2022-Q20.ts:90 |
| can1a-2024 | R10 Français | Q20 : « l'espérance mathématiques » ; Q14 : « L' ordonnée » (espace après l'apostrophe) | mathématique ; L'ordonnée | src/exercices/can/can1a-2024/can1a-2024-Q20.ts:51 |
| can1a-2024 | R10 Français | Q29 : « coefficient multiplicateur gobal », « puis à l'augmenter $10\,\%$ » (de manquant), doubles espaces | global ; l'augmenter de | src/exercices/can/can1a-2024/can1a-2024-Q29.ts:36 |
| can1a-2025 | R10 Français | Q26 : « le taux d'évolution globale » | taux d'évolution global | src/exercices/can/can1a-2025/can1a-2025-Q26.ts:42 |
| can1a-NY2025 | R10 Français | Q15 (officiel) : « cette équation a ⟦1⟧ seule solution réelle : 0. » (minuscule après le point, 0 hors $) | Cette équation a une seule solution réelle : $0$. | src/exercices/can/canNY-2025 |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| can1a-NY2024 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1)  |
| can1a-NY2025 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| can1a-NY2025 | I2 Réponse fausse acceptée | 2 | réponse fausse acceptée |
| can1a-NY2026 | I2 Réponse fausse acceptée | 3 | réponse fausse acceptée |
| 1A | I4 Question sans champ | 77 | champ absent de la page |
| 1A-P01-3 | I4 Question sans champ | 1 | champ absent de la page |
| 1AN10-1 | I4 Question sans champ | 1 | champ absent de la page |
| 1AL23-23 | X1 Erreur | 2 | console : KaTeX auto-render: Failed to parse `\Delta = (-m-1)^2-4\error{\blacksquare} \error{(}` with  ParseError: KaTeX parse error: Undefined control sequence |
| 1AL23-23 | X2 Formule cassée | 2 | « $ » visible : −m−1) 2 −4×(m+)×(−2m−3). Ou encore, sous forme développée : $\Delta = (-m-1)^2-4\error{\blacksquare} \error{(}$ Cherchon |
| can1D3-03 | X2 Formule cassée | 10 | nombre impair de $ : a fonction définie par $f(x)=\dfrac{3}{-3x+5}$.&lt;br> f'(x)=$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- |
| 1A-F03-7 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| 1A-F05-4 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| 1A-F07-2 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| can1SD22-04 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : T5 Espaces 843 ; R5 Virgule 451 ; T4  375 ; T6 Points de suspension 371 ; N1 Nombre hors $ 328 ; T3  140 ; N2 Séparateur des milliers 100 ; N6 Écriture algébrique 89 ; R6  46 ; R10 Français 44 ; N3  23 ; N5 Négatif sans parenthèses 20 ; M7  12 ; X2 Formule cassée 4 ; R2 Tutoiement, impératif 1.
