# Revue des exercices : règles contrôlées

Règles appliquées à chaque exercice de MathALÉA pendant la revue. Chacune
cite sa source dans le dépôt MathALÉA (`main` du 28 octobre 2026,
`0509fdbbd`) :

- `RED` : `documentation/developpement/auteurs-exercices/rediger-un-exercice.md`
- `MEF` : `documentation/developpement/auteurs-exercices/complements/mise-en-forme.md`
- `NOM` : `documentation/developpement/auteurs-exercices/mathematiques/afficher-des-nombres.md`
- `DEC` : `documentation/developpement/auteurs-exercices/mathematiques/gerer-les-decimaux.md`
- `PRO` : `documentation/developpement/auteurs-exercices/mathematiques/probabilites.md`
- `AGT` : `AGENTS.md`
- `QCM` : `.claude/skills/qcm-vers-saisie-libre/SKILL.md`
- `COM` : commits d'uniformisation récents (Eric Elter, Rémi Angot)

Détection : **S** sortie produite (énoncé, correction, HTML rendu),
**C** code source, **I** test de l'interactif dans le navigateur,
**L** lecture.

## Interactif et mise en évidence (le plus grave)

| Règle | Contenu | Source | Détection |
| --- | --- | --- | --- |
| I1 | Une réponse correcte est acceptée. | AGT | I |
| I2 | Une réponse incorrecte est refusée. | AGT | I |
| I3 | Un champ vide est refusé, sans erreur. | `nouvel-exercice` | I |
| I4 | Une question interactive a un champ ou un QCM visible ; une question avec champ a une `autoCorrection`. | AGT | I, S |
| I5 | Barème fixe par question, quel que soit le tirage. | AGT | I (deux graines) |
| I6 | Écritures équivalentes acceptées sauf si la forme compte (alors comparaison imposée). | RED, QCM | I, C |
| M1 | La valeur dans `miseEnEvidence()` est **exactement** ce que le champ attend : saisie telle quelle, elle est acceptée. | RED | I (saisie de la valeur extraite) |
| M2 | Pas d'unité, de libellé (`x=`, `S=`) ni de texte dans `miseEnEvidence()` si le champ ne les attend pas. | RED, QCM | S, C |
| M3 | QCM et saisie libre : en QCM la proposition complète est mise en évidence, en saisie libre la seule valeur attendue (`correctionCourte`). Chaque mode a sa mise en évidence. | RED | I, C |
| M4 | QCM : la proposition mise en évidence est la bonne. | RED | I |
| M5 | Pas de texte dans `miseEnEvidence()`, même dans `\text{}` : texte en `texteEnCouleurEtGras()`, maths en `miseEnEvidence()`, mêlés. | RED, Lynx | S, C |
| M6 | Le résultat final est mis en évidence (pas oublié), et rien d'autre n'est orange. | RED | S |
| M7 | Explications de la correction en `bleuMathalea`, jamais la couleur par défaut (orange) de `texteEnCouleur()`. | RED | S, C |

## Nombres

| Règle | Contenu | Source | Détection |
| --- | --- | --- | --- |
| N1 | Tout nombre entre `$…$`, sauf les dates (« en 1789 »). | RED, Lynx | S, C |
| N2 | Séparateur des milliers (`texNombre`, `stringNombre`) : `12\,345`, jamais `12345` ni `12 345` brut. | MEF, NOM | S |
| N3 | Virgule décimale `{,}` dans les maths, jamais de point décimal. | NOM | S |
| N4 | Aucune erreur de flottant (`0,30000000000000004`), ni notation `e+`. | DEC | S |
| N5 | Négatifs parenthésés après `\times`, `-`, puissance, dans une substitution. | NOM | S |
| N6 | Pas de `1x`, `-1x`, `+-`, `-+`, `--`, `+ -`, `0x`, `x^1`, `-0`. | NOM | S |
| N7 | Zéros significatifs gardés quand ils ont un sens (prix : `2{,}50`). | NOM | S, L |
| N8 | Fraction exacte gardée tant qu'aucune approximation n'est demandée. | NOM | L |

## Typographie et espaces

| Règle | Contenu | Source | Détection |
| --- | --- | --- | --- |
| T1 | Espace insécable avant `%` : `33${sp()}%` en texte, `$33\,\%$` (ou `~\%`) en maths ; jamais `33%` ni `33 %`. | RED, COM (#9907) | S, C |
| T2 | Espace insécable avant une unité, unité en `\text{cm}` dans `$…$`, jamais en italique ni en texte brut. | RED, COM | S |
| T3 | Espace insécable avant `:`, fine insécable avant `;`, `!`, `?`. | MEF | S |
| T4 | Guillemets français « » avec insécables à l'intérieur. | RED, MEF | S |
| T5 | Pas de double espace, pas d'espace avant `.` ou `,`. | MEF | S |
| T6 | `\ldots` pour des points de suspension utiles ; jamais `...` pour couper une phrase. | RED | S |
| T7 | `texteApres` : pas d'espace en tête (le moteur l'ajoute), point final après l'unité. | RED | C |
| T8 | Espaces autour de `<` dans les maths, espace après une commande LaTeX suivie d'une lettre. | MEF | S (erreur KaTeX, texte masqué) |
| T9 | Mots dans une formule en `\text{}`. | MEF | S |

## Rédaction

| Règle | Contenu | Source | Détection |
| --- | --- | --- | --- |
| R1 | Titre à l'infinitif, sans point final. | RED, COM | S |
| R2 | Consigne et instructions à l'infinitif (pas « Calcule »). | RED | S, L |
| R3 | Toute phrase finit par un point (énoncé, correction, propositions de QCM, phrase terminée par un champ : point dans `texteApres`). Exception : deux-points suivis d'une formule à la ligne. | RED, COM | S |
| R4 | En saisie libre, la dernière phrase est une question (« Quel est… ? »), pas une phrase à trous finie par « : ». | RED | S, L |
| R5 | Virgule avant « soit » et « alors », après « or ». | RED | S |
| R6 | Majuscules accentuées (É, À, È). | MEF | S |
| R7 | Énumération après deux-points : minuscule, point-virgule, point au dernier. | MEF | L |
| R8 | Orthographe uniformisée : « en dessous » (sans trait d'union), « au-dessus », « au-dessous », « ci-dessous », « ci-dessus ». | COM (27 octobre) | S |
| R9 | Probabilités : `P` majuscule (`P(B)`, `P_A(B)`), jamais `p(B)` ; « $P(B)$ est égal ». | PRO | S |
| R10 | Accords avec un nombre tiré (« 1 élèves », « 0,5 litres »), conjugaison, fautes, coquilles. | Lynx | L |
| R11 | Pas de `<br>` en tête de question, consigne ou item. | MEF | S |
| R12 | `this.consigne` ne contient rien de propre à une question. | QCM | C, L |

## Rendu et robustesse

| Règle | Contenu | Source | Détection |
| --- | --- | --- | --- |
| X1 | Aucune exception à la génération ni à la vérification, aucune erreur de console. | `erreurs-console-e2e.md` | S |
| X2 | Aucune erreur KaTeX (`.katex-error`), `$` équilibrés, pas de `$$` vide, pas de LaTeX hors maths. | MEF | S |
| X3 | Aucun `undefined`, `NaN`, `Infinity`, `[object Object]`, `null` affiché. | — | S |
| X4 | Pas de question en double dans une série, ni d'énoncé ou de correction vide. | — | S |
| X5 | Figures lisibles à 390 px (pas de débordement, étiquettes dans la figure). | — | captures |
| X6 | Une même graine donne le même exercice (pas d'aléa dans le constructeur). | AGT, RED | S (deux préparations) |
| X7 | Chaque paramètre (`sup` à `sup5`), chaque valeur, et leurs combinaisons fonctionnent. | `nouvel-exercice` | S, I |
