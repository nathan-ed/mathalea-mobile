"""Parcours de 1re Collège (Suisse) : écrit explorer/ch-1re-college.json.

Quatre parcours à ceintures, préparés pour la classe de 1re de Nathan
(novembre 2026) puis mis dans l'Explorer :

- Calcul littéral et factorisation (7 ceintures), chapitre Factorisation
- Résolution d'équations (7 ceintures), chapitre Équations du second degré
- Systèmes d'équations (6 ceintures), chapitre Systèmes d'équations
- Preuves en arithmétique (5 ceintures), chapitre Calcul littéral - Généralités

Priorité : la difficulté progressive. Dans chaque ceinture, les exercices vont
du cas le plus simple au plus difficile (un même exercice revient avec des
réglages plus exigeants) et les questions ne sont pas mélangées. Les
ceintures suivent l'ordre des prérequis. Fiches : exemples résolus, chacun
suivi de son point crucial.

Exercices interactifs du référentiel CH ; un exercice non classé, ancien ou
français est pris quand il n'a pas d'équivalent (4L23, 1A-C02-3, 1A-C03-11).
Manques du catalogue : voir explorer/README.md.

    python3 explorer/ch-1re-college-gen.py
"""
import json
from datetime import datetime, timezone
from pathlib import Path

FICHIER = Path(__file__).with_name('ch-1re-college.json')
CLASSE = '1re Collège'
NIVEAU = '1re Collège'
AUTEURS = ['Claude Opus 5.5', 'Nathan Scheinmann']


def E(titre, enonce, etapes, crucial):
    """Exemple résolu suivi de son point crucial."""
    return [
        {'type': 'exemple', 'titre': titre, 'enonce': enonce, 'etapes': etapes},
        {'type': 'retenir', 'titre': 'Point crucial', 'texte': crucial},
    ]


# Une étape : (uuid, référence CH, nombre de questions, titre vu par l'élève, réglages)
def X(uuid, ref, n, titre, **sup):
    return {'uuid': uuid, 'id': ref, 'nbQuestions': n, 'titre': titre, **{k: str(v).lower() if isinstance(v, bool) else str(v) for k, v in sup.items()}}


# ---------------------------------------------------------------------------
# Parcours 1 : calcul littéral et factorisation
# ---------------------------------------------------------------------------
CALCUL = [
    ('Développer et réduire', 'Développer et réduire une expression', [
        X('4b495', '1mCL1-12', 2, 'Additionner des polynômes', sup=1, sup2=1, sup3=2, sup4=1, sup5=2),
        X('4b495', '1mCL1-12', 2, 'Soustraire des polynômes', sup=3, sup2=1, sup3=2, sup4=1, sup5=2),
        X('1cd08', '1mCL1-6', 2, 'Distributivité simple', sup=1, sup2=1, sup3=1, sup4=1, sup5=False),
        X('1cd08', '1mCL1-6', 2, 'Distributivité double', sup=2, sup2=1, sup3=1, sup4=1, sup5=False),
        X('1cd08', '1mCL1-6', 2, 'Distributivité double avec un signe devant', sup=2, sup2=1, sup3=2, sup4=1, sup5=True),
    ], [
        *E('Une différence de polynômes', r'Réduire $(3x^2-2x+5)-(x^2-4x+1)$.', [
            r'Le signe « $-$ » devant la parenthèse change le signe de chaque terme : $3x^2-2x+5-x^2+4x-1$.',
            r'On regroupe les termes semblables : $(3x^2-x^2)+(-2x+4x)+(5-1)$.',
            r'$=2x^2+2x+4$.',
        ], r'Devant une parenthèse précédée de « $-$ », on change le signe de **tous** les termes, pas seulement du premier.'),
        *E('Distributivité double', r'Développer et réduire $(2x-3)(x+4)$.', [
            r'Chaque terme du premier facteur multiplie chaque terme du second : $2x\cdot x+2x\cdot4-3\cdot x-3\cdot4$.',
            r'$=2x^2+8x-3x-12$.',
            r'$=2x^2+5x-12$.',
        ], r'Quatre produits, chacun avec son signe : $-3\cdot4=-12$.'),
        *E('Un signe devant le produit', r'Développer et réduire $5-(x-2)(x+3)$.', [
            r'On développe d’abord le produit, en le gardant entre parenthèses : $5-(x^2+3x-2x-6)$.',
            r'$=5-(x^2+x-6)$.',
            r'$=5-x^2-x+6=-x^2-x+11$.',
        ], r'Le produit développé reste entre parenthèses tant que le « $-$ » qui le précède n’est pas distribué.'),
    ]),
    ('Identités remarquables', 'Développer avec les identités remarquables', [
        X('04b0a', '11FA4A-4', 2, 'Carré d’une somme, carré d’une différence', sup=1, sup2='1-2'),
        X('04b0a', '11FA4A-4', 1, 'Produit d’une somme et d’une différence', sup=1, sup2='3'),
        X('04b0a', '11FA4A-4', 2, 'Identités avec un coefficient devant $x$', sup=2, sup2='4'),
        X('7bd4f', '11FA4A-6', 2, 'Une identité dans une expression', sup=2, sup2='4', sup3='1-2', sup4='1-2'),
        X('8f546', '11FA4A-7', 2, 'Additionner ou soustraire deux identités', sup=1, sup2=3, sup3='4', sup4='4'),
    ], [
        *E('Carré d’une somme', r'Développer $(x+5)^2$.', [
            r'On reconnaît $(a+b)^2=a^2+2ab+b^2$ avec $a=x$ et $b=5$.',
            r'$(x+5)^2=x^2+2\cdot x\cdot5+5^2$.',
            r'$=x^2+10x+25$.',
        ], r'Le double produit $2ab$ ne s’oublie pas : $(x+5)^2\neq x^2+25$.'),
        *E('Un coefficient devant $x$', r'Développer $(3x-2)^2$.', [
            r'On reconnaît $(a-b)^2=a^2-2ab+b^2$ avec $a=3x$ et $b=2$.',
            r'$(3x-2)^2=(3x)^2-2\cdot3x\cdot2+2^2$.',
            r'$=9x^2-12x+4$.',
        ], r'Le coefficient est aussi élevé au carré : $(3x)^2=9x^2$, et non $3x^2$.'),
        *E('Une identité dans une expression', r'Développer et réduire $3-(2x+1)(2x-1)$.', [
            r'$(2x+1)(2x-1)=(2x)^2-1^2=4x^2-1$.',
            r'$3-(4x^2-1)=3-4x^2+1$.',
            r'$=-4x^2+4$.',
        ], r'Développer l’identité entre parenthèses avant de distribuer le « $-$ ».'),
        *E('Deux identités', r'Développer et réduire $(x+3)^2-(x-1)^2$.', [
            r'$(x+3)^2=x^2+6x+9$ et $(x-1)^2=x^2-2x+1$.',
            r'$x^2+6x+9-(x^2-2x+1)=x^2+6x+9-x^2+2x-1$.',
            r'$=8x+8$.',
        ], r'Développer chaque identité entre parenthèses, puis distribuer le « $-$ » devant la seconde.'),
    ]),
    ('Mise en évidence', 'Factoriser par mise en évidence', [
        X('0ee90', '1mCL2-0', 2, 'Mettre en évidence un nombre', sup='1', sup2='1', sup3=True, sup4=True),
        X('0ee90', '1mCL2-0', 2, 'Mettre en évidence, avec des facteurs négatifs', sup='2-3', sup2='2-3', sup3=True, sup4=True),
        X('c4b73', '1mCL2-1', 2, 'Mettre en évidence un monôme', sup='1', sup2=2, sup3=1, sup4=1),
        X('c4b73', '1mCL2-1', 2, 'Mettre en évidence avec deux lettres', sup='1', sup2=2, sup3=2, sup4=2),
    ], [
        *E('Le plus grand facteur commun', r'Factoriser $6x^2-15x$.', [
            r'Plus grand diviseur commun aux coefficients $6$ et $15$ : $3$.',
            r'Les deux termes contiennent $x$ : le facteur commun est $3x$.',
            r'$6x^2-15x=3x\cdot2x-3x\cdot5=3x(2x-5)$.',
        ], r'Mettre en évidence le plus grand facteur commun : $3x$, pas seulement $3$ ou $x$. On vérifie en développant.'),
        *E('Un terme égal au facteur commun', r'Factoriser $4ab+4a$.', [
            r'Facteur commun : $4a$.',
            r'$4ab+4a=4a\cdot b+4a\cdot1$.',
            r'$=4a(b+1)$.',
        ], r'Quand un terme est entièrement mis en évidence, il reste $1$ dans la parenthèse, pas $0$.'),
        *E('Un facteur négatif', r'Factoriser $-2x-8$ en mettant $-2$ en évidence.', [
            r'$-2x-8=-2\cdot x+(-2)\cdot4$.',
            r'$=-2(x+4)$.',
        ], r'En mettant un nombre négatif en évidence, les signes changent dans la parenthèse.'),
    ]),
    ('Factoriser avec les identités', 'Factoriser avec les identités remarquables', [
        X('7f0cf', '1mCL1-8', 2, 'Compléter une identité remarquable', sup='1-2', sup2=1, sup3=True),
        X('a1cb3', '1mCL2-3', 2, 'Reconnaître une identité remarquable'),
        X('7f0cf', '1mCL1-8', 2, 'Compléter une identité avec un coefficient', sup='3-4', sup2=1, sup3=True),
        X('c4b73', '1mCL2-1', 2, 'Factoriser avec une identité, termes dans le désordre', sup='2', sup2=1, sup3=1, sup4=1, sup5=True),
        X('c4b73', '1mCL2-1', 2, 'Mettre en évidence, puis utiliser une identité', sup='3', sup2=2, sup3=2, sup4=1),
    ], [
        *E('Compléter une identité', r'Compléter : $x^2-\ldots+49=(x-\ldots)^2$.', [
            r'$49=7^2$, donc le second terme du carré est $7$.',
            r'Le double produit vaut $2\cdot x\cdot7=14x$.',
            r'$x^2-14x+49=(x-7)^2$.',
        ], r'Repérer d’abord les deux carrés, puis calculer le double produit.'),
        *E('Différence de deux carrés', r'Factoriser $x^2-36$.', [
            r'$x^2-36=x^2-6^2$ : une différence de deux carrés.',
            r'$a^2-b^2=(a-b)(a+b)$, donc $x^2-36=(x-6)(x+6)$.',
        ], r'Une **somme** de deux carrés, comme $x^2+36$, ne se factorise pas ainsi.'),
        *E('Trinôme carré parfait', r'Factoriser $4x^2+12x+9$.', [
            r'$4x^2=(2x)^2$ et $9=3^2$.',
            r'Double produit : $2\cdot2x\cdot3=12x$, c’est bien le terme du milieu.',
            r'$4x^2+12x+9=(2x+3)^2$.',
        ], r'Vérifier le double produit avant de conclure : $4x^2+10x+9$ n’est pas un carré.'),
        *E('Mise en évidence, puis identité', r'Factoriser $3x^3-12x$.', [
            r'Facteur commun $3x$ : $3x^3-12x=3x(x^2-4)$.',
            r'$x^2-4=(x-2)(x+2)$.',
            r'$3x^3-12x=3x(x-2)(x+2)$.',
        ], r'Commencer par la mise en évidence, puis regarder si la parenthèse se factorise encore.'),
    ]),
    ('Somme et produit', 'Factoriser un trinôme par somme et produit', [
        X('8cb63', '1mCL2-4', 3, 'Trouver deux nombres de somme et de produit donnés', sup='4', sup2=1, sup3=2, sup4=1),
        X('8cb63', '1mCL2-4', 2, 'Mettre en évidence, puis somme et produit', sup='5', sup2=1, sup3=2, sup4=1),
        X('c4b73', '1mCL2-1', 2, 'Somme et produit avec une puissance de $x$ en évidence', sup='6-7', sup2=2, sup3=1, sup4=1),
        X('c4b73', '1mCL2-1', 2, 'Somme et produit avec un coefficient devant $x$', sup='4', sup2=1, sup3=1, sup4=1),
    ], [
        *E('Somme et produit', r'Factoriser $x^2+7x+12$.', [
            r'On cherche deux nombres de somme $7$ et de produit $12$.',
            r'$3+4=7$ et $3\cdot4=12$.',
            r'$x^2+7x+12=(x+3)(x+4)$.',
        ], r'Parcourir les paires de diviseurs du produit, puis garder celle qui donne la somme.'),
        *E('Avec des signes', r'Factoriser $x^2-2x-15$.', [
            r'Somme $-2$, produit $-15$ : le produit est négatif, les deux nombres sont de signes contraires.',
            r'$-5+3=-2$ et $-5\cdot3=-15$.',
            r'$x^2-2x-15=(x-5)(x+3)$.',
        ], r'Produit négatif : signes contraires, et le nombre de plus grande valeur absolue porte le signe de la somme.'),
        *E('Une puissance de $x$ en évidence', r'Factoriser $x^4+5x^3+6x^2$.', [
            r'Mise en évidence de $x^2$ : $x^2(x^2+5x+6)$.',
            r'Somme $5$, produit $6$ : $2$ et $3$.',
            r'$x^4+5x^3+6x^2=x^2(x+2)(x+3)$.',
        ], r'La méthode somme et produit s’applique à $x^2+bx+c$ : mettre d’abord en évidence ce qui est commun.'),
        *E('Un coefficient devant $x$', r'Factoriser $4x^2+4x-3$ en posant $u=2x$.', [
            r'$4x^2=(2x)^2=u^2$ et $4x=2u$ : $u^2+2u-3$.',
            r'Somme $2$, produit $-3$ : $3$ et $-1$, donc $u^2+2u-3=(u+3)(u-1)$.',
            r'$4x^2+4x-3=(2x+3)(2x-1)$.',
        ], r'Repérer le carré $(2x)^2$ et écrire le terme du milieu avec $2x$ : on retrouve un trinôme en $u=2x$.'),
    ]),
    ('Groupements', 'Factoriser par groupements', [
        X('9965d', '1mCL2-2', 2, 'Facteur commun visible', sup='1', sup2=1, sup3=1, sup4=1, sup5=1),
        X('9965d', '1mCL2-2', 2, 'Facteur commun à faire apparaître', sup='2-3', sup2=1, sup3=1, sup4=1, sup5=1),
        X('9965d', '1mCL2-2', 2, 'Grouper les termes d’une expression développée', sup='4-5', sup2=1, sup3=1, sup4=1, sup5=1),
        X('9965d', '1mCL2-2', 2, 'Groupements avec une mise en évidence de plus', sup='6-7-8', sup2=1, sup3=1, sup4=1, sup5=1),
        X('9965d', '1mCL2-2', 2, 'Grouper, puis mettre encore en évidence', sup='9-10', sup2=1, sup3=1, sup4=1, sup5=1),
    ], [
        *E('Facteur commun visible', r'Factoriser $(x+1)(2x-3)+(x+1)(x+5)$.', [
            r'Facteur commun : $(x+1)$.',
            r'$(x+1)\big[(2x-3)+(x+5)\big]$.',
            r'$=(x+1)(3x+2)$.',
        ], r'Après la mise en évidence, réduire le contenu du crochet.'),
        *E('Un changement de signe', r'Factoriser $(x-4)(x+2)-3(4-x)$.', [
            r'$4-x=-(x-4)$, donc $-3(4-x)=3(x-4)$.',
            r'$(x-4)(x+2)+3(x-4)=(x-4)\big[(x+2)+3\big]$.',
            r'$=(x-4)(x+5)$.',
        ], r'$4-x$ et $x-4$ sont opposés : changer le signe devant pour faire apparaître le facteur commun.'),
        *E('Une expression développée', r'Factoriser $x^3+2x^2-3x-6$.', [
            r'On groupe les termes deux par deux : $(x^3+2x^2)+(-3x-6)$.',
            r'$=x^2(x+2)-3(x+2)$.',
            r'$=(x+2)(x^2-3)$.',
        ], r'Faire apparaître le **même** facteur dans chaque groupe : ici, mettre $-3$ (et non $3$) en évidence dans le second.'),
    ]),
    ('Fractions rationnelles', 'Calculer avec des fractions rationnelles', [
        X('2cb9a', '1mCN-13', 2, 'Multiplier des fractions rationnelles', sup='3'),
        X('2cb9a', '1mCN-13', 2, 'Diviser des fractions rationnelles', sup='4'),
        X('0af93', '1A-C03-11', 1, 'Écrire sans trait de fraction un quotient de fractions'),
        X('2cb9a', '1mCN-13', 2, 'Additionner des fractions rationnelles', sup='1'),
        X('2cb9a', '1mCN-13', 2, 'Additionner avec une lettre au dénominateur', sup='2'),
        X('78fde', '1A-C02-3', 2, 'Soustraire une fraction rationnelle'),
    ], [
        *E('Simplifier', r'Simplifier $\dfrac{x^2-9}{x^2+3x}$ ($x\neq0$ et $x\neq-3$).', [
            r'On factorise : $x^2-9=(x-3)(x+3)$ et $x^2+3x=x(x+3)$.',
            r'$\dfrac{(x-3)(x+3)}{x(x+3)}$ : le facteur $(x+3)$ est commun.',
            r'$=\dfrac{x-3}{x}$.',
        ], r'On ne simplifie que par un **facteur** commun : factoriser d’abord le numérateur et le dénominateur.'),
        *E('Diviser', r'Calculer $\dfrac{x}{3}:\dfrac{x^2}{6}$ ($x\neq0$).', [
            r'Diviser, c’est multiplier par l’inverse : $\dfrac{x}{3}\cdot\dfrac{6}{x^2}$.',
            r'$=\dfrac{6x}{3x^2}$.',
            r'$=\dfrac{2}{x}$.',
        ], r'Inverser la seconde fraction seulement, puis simplifier.'),
        *E('Additionner', r'Écrire $\dfrac{2}{x}+\dfrac{3}{x+1}$ en une seule fraction.', [
            r'Dénominateur commun : $x(x+1)$.',
            r'$\dfrac{2(x+1)}{x(x+1)}+\dfrac{3x}{x(x+1)}$.',
            r'$=\dfrac{2x+2+3x}{x(x+1)}=\dfrac{5x+2}{x(x+1)}$.',
        ], r'Chaque numérateur est multiplié par le facteur qui manque à son dénominateur.'),
        *E('Soustraire', r'Écrire $\dfrac{1}{4}-\dfrac{2x+1}{x}$ en une seule fraction ($x\neq0$).', [
            r'Dénominateur commun : $4x$.',
            r'$\dfrac{x}{4x}-\dfrac{4(2x+1)}{4x}=\dfrac{x-(8x+4)}{4x}$.',
            r'$=\dfrac{x-8x-4}{4x}=\dfrac{-7x-4}{4x}$.',
        ], r'Le signe $-$ porte sur tout le numérateur : le garder entre parenthèses avant de réduire.'),
    ]),
]

# ---------------------------------------------------------------------------
# Parcours 2 : résolution d'équations
# ---------------------------------------------------------------------------
EQUATIONS = [
    ('Équations du premier degré', 'Résoudre une équation du premier degré', [
        X('b9e01', '10FA5C-7', 2, 'Résoudre $ax+b=cx+d$', sup='1', sup2=True),
        X('b9e01', '10FA5C-7', 2, 'Résoudre avec des parenthèses', sup='2-3', sup2=True),
        X('b9e01', '10FA5C-7', 2, 'Résoudre, solution fractionnaire', sup='1-2-3', sup2=False),
        X('231d3', '11FA5B-4', 2, 'Développer, puis résoudre', sup='6-7', sup2=True),
    ], [
        *E('Regrouper les termes', r'Résoudre $5x-3=2x+9$.', [
            r'$5x-2x=9+3$.',
            r'$3x=12$.',
            r'$x=4$, donc $S=\{4\}$.',
        ], r'Un terme qui change de membre change de signe ; on divise ensuite par le coefficient de $x$.'),
        *E('Avec des parenthèses', r'Résoudre $7-(2x+3)=x$.', [
            r'$7-2x-3=x$.',
            r'$4=3x$.',
            r'$x=\dfrac43$, donc $S=\left\{\dfrac43\right\}$.',
        ], r'La solution peut être une fraction : on l’écrit sous forme irréductible.'),
        *E('Les carrés s’éliminent', r'Résoudre $(x+2)^2=x^2+16$.', [
            r'$x^2+4x+4=x^2+16$.',
            r'$4x=12$.',
            r'$x=3$, donc $S=\{3\}$.',
        ], r'Après développement, les termes en $x^2$ s’annulent : l’équation est du premier degré.'),
    ]),
    ('Produit nul', 'Résoudre une équation en factorisant', [
        X('231d3', '11FA5B-4', 2, 'Mettre $x$ en évidence, puis résoudre', sup='1-2', sup2=True),
        X('231d3', '11FA5B-4', 2, 'Utiliser une identité, puis résoudre', sup='3-5', sup2=True),
        X('77aae', '1mCL4-0', 2, 'Mettre en évidence, puis résoudre', sup='1-2', sup2=1),
        X('77aae', '1mCL4-0', 2, 'Se ramener à une identité remarquable', sup='3-4-5-6-7-8', sup2=1),
        X('77aae', '1mCL4-0', 2, 'Somme et produit, puis résoudre', sup='9', sup2=1),
        X('6357e', '1mCL4-6', 2, 'Factoriser complètement, puis résoudre', sup='1-1-0-0*entieres'),
    ], [
        *E('Mettre $x$ en évidence', r'Résoudre $x^2-5x=0$.', [
            r'$x(x-5)=0$.',
            r'Un produit est nul si et seulement si l’un des facteurs est nul : $x=0$ ou $x-5=0$.',
            r'$S=\{0;5\}$.',
        ], r'Ne pas diviser par $x$ : on perdrait la solution $x=0$.'),
        *E('Avec une identité', r'Résoudre $4x^2-9=0$.', [
            r'$(2x-3)(2x+3)=0$.',
            r'$2x-3=0$ ou $2x+3=0$.',
            r'$S=\left\{-\dfrac32;\dfrac32\right\}$.',
        ], r'Reconnaître $a^2-b^2=(a-b)(a+b)$, puis appliquer le produit nul.'),
        *E('Tout dans un membre', r'Résoudre $x^2+x=6$.', [
            r'$x^2+x-6=0$.',
            r'Somme $1$, produit $-6$ : $3$ et $-2$, donc $(x+3)(x-2)=0$.',
            r'$S=\{-3;2\}$.',
        ], r'Le produit nul ne s’applique que s’il y a $0$ dans l’autre membre.'),
    ]),
    ('Racine carrée', 'Résoudre une équation avec la racine carrée', [
        X('3b832', '1mQCM-27', 2, 'Nombre de solutions de $x^2=a$'),
        X('0f844', '1mCL4-1', 2, 'Résoudre $ax^2=b$, solutions entières', sup=1),
        X('0f844', '1mCL4-1', 2, 'Résoudre $ax^2=b$, solutions fractionnaires ou racines', sup=4),
        X('74715', '1mCL4-5', 2, 'Résoudre $(x+a)^2=k$'),
    ], [
        *E('Deux solutions', r'Résoudre $x^2=49$.', [
            r'Deux nombres ont pour carré $49$ : $7$ et $-7$.',
            r'$S=\{-7;7\}$.',
        ], r'$x^2=a$ a deux solutions $-\sqrt a$ et $\sqrt a$ si $a>0$, une seule ($0$) si $a=0$, aucune si $a<0$.'),
        *E('Isoler le carré', r'Résoudre $3x^2-15=0$.', [
            r'$3x^2=15$.',
            r'$x^2=5$.',
            r'$S=\left\{-\sqrt5;\sqrt5\right\}$.',
        ], r'Isoler $x^2$ avant de prendre la racine.'),
        *E('Le carré d’une parenthèse', r'Résoudre $(x-2)^2=9$.', [
            r'$x-2=3$ ou $x-2=-3$.',
            r'$x=5$ ou $x=-1$.',
            r'$S=\{-1;5\}$.',
        ], r'Ne pas développer : on prend la racine du carré, sans oublier la solution négative.'),
    ]),
    ('Complétion du carré', 'Résoudre une équation par complétion du carré', [
        X('7f0dd', '1mCL4-2', 2, 'Compléter le carré, solutions irrationnelles', sup='2', sup2=True),
        X('7f0dd', '1mCL4-2', 2, 'Compléter le carré, coefficients fractionnaires', sup='1', sup2=True),
        X('7f0dd', '1mCL4-2', 2, 'Compléter le carré, coefficient de $x^2$ différent de 1', sup='3', sup2=False),
    ], [
        *E('Coefficient de $x^2$ égal à 1', r'Résoudre $x^2+6x-7=0$.', [
            r'$x^2+6x=(x+3)^2-9$.',
            r'$(x+3)^2-9-7=0$, soit $(x+3)^2=16$.',
            r'$x+3=4$ ou $x+3=-4$, donc $S=\{-7;1\}$.',
        ], r'La moitié du coefficient de $x$ donne le carré : $x^2+bx=\left(x+\dfrac b2\right)^2-\left(\dfrac b2\right)^2$.'),
        *E('Diviser d’abord', r'Résoudre $2x^2-4x-3=0$.', [
            r'On divise par $2$ : $x^2-2x-\dfrac32=0$.',
            r'$(x-1)^2-1-\dfrac32=0$, soit $(x-1)^2=\dfrac52$.',
            r'$x-1=-\sqrt{\dfrac52}$ ou $x-1=\sqrt{\dfrac52}$, donc $S=\left\{1-\dfrac{\sqrt{10}}{2};1+\dfrac{\sqrt{10}}{2}\right\}$.',
        ], r'Diviser d’abord par le coefficient de $x^2$ pour se ramener à $x^2+bx+c=0$.'),
    ]),
    ('Discriminant', 'Résoudre une équation du second degré avec le discriminant', [
        X('731f0', '11FA5B-11', 2, 'Calculer le discriminant'),
        X('feb39', '11FA5B-12', 2, 'Discriminant et nombre de solutions'),
        X('cf78f', '11FA5B-14', 3, 'Résoudre avec le discriminant'),
    ], [
        *E('Calculer $\\Delta$', r'Calculer le discriminant de $2x^2-3x-5$.', [
            r'$a=2$, $b=-3$ et $c=-5$.',
            r'$\Delta=b^2-4ac=(-3)^2-4\cdot2\cdot(-5)$.',
            r'$\Delta=9+40=49$.',
        ], r'Mettre $b$ et $c$ entre parenthèses quand ils sont négatifs : $(-3)^2=9$.'),
        *E('Nombre de solutions', r'Combien de solutions a l’équation $x^2+2x+5=0$ ?', [
            r'$\Delta=2^2-4\cdot1\cdot5=4-20=-16$.',
            r'$\Delta<0$ : l’équation n’a aucune solution réelle.',
        ], r'$\Delta>0$ : deux solutions ; $\Delta=0$ : une solution ; $\Delta<0$ : aucune solution.'),
        *E('Résoudre', r'Résoudre $2x^2-3x-5=0$.', [
            r'$\Delta=49$ et $\sqrt\Delta=7$.',
            r'$x_1=\dfrac{3-7}{4}=-1$ et $x_2=\dfrac{3+7}{4}=\dfrac52$.',
            r'$S=\left\{-1;\dfrac52\right\}$.',
        ], r'$x=\dfrac{-b\pm\sqrt\Delta}{2a}$ : avec $b=-3$, on a $-b=3$.'),
    ]),
    ('Degré 3 et 4, équations irrationnelles', 'Résoudre une équation de degré 3 ou 4, ou irrationnelle', [
        X('89034', '1mCL4-4', 2, 'Équation bicarrée, solutions entières', sup='1', sup2='1'),
        X('6357e', '1mCL4-6', 1, 'Degré 3 : grouper, puis résoudre', sup='0-0-0-1*melange'),
        X('89034', '1mCL4-4', 2, 'Équation bicarrée, autres cas', sup='3', sup2='2-3'),
        X('6357e', '1mCL4-6', 1, 'Degré 4 : différence de deux carrés', sup='0-0-1-0*melange'),
        X('5f5fa', '1mCL4-3', 2, 'Équation irrationnelle, solutions entières', sup='1', sup2=True, sup3=False),
        X('5f5fa', '1mCL4-3', 2, 'Équation irrationnelle, cas général', sup='3', sup2=False, sup3=True),
    ], [
        *E('Équation bicarrée', r'Résoudre $x^4-13x^2+36=0$.', [
            r'On pose $y=x^2$ : $y^2-13y+36=0$.',
            r'Somme $13$, produit $36$ : $y=4$ ou $y=9$.',
            r'$x^2=4$ ou $x^2=9$, donc $S=\{-3;-2;2;3\}$.',
        ], r'Revenir à $x$ : une valeur positive de $y$ donne deux solutions, une valeur négative aucune.'),
        *E('Grouper, puis le produit nul', r'Résoudre $x^3-4x^2-x+4=0$.', [
            r'$x^2(x-4)-(x-4)=0$.',
            r'$(x-4)(x^2-1)=(x-4)(x-1)(x+1)=0$.',
            r'$S=\{-1;1;4\}$.',
        ], r'Factoriser complètement, puis annuler chaque facteur.'),
        *E('Équation irrationnelle', r'Résoudre $\sqrt{x+6}=x$.', [
            r'On élève au carré : $x+6=x^2$, soit $x^2-x-6=0$.',
            r'$(x-3)(x+2)=0$ : $x=3$ ou $x=-2$.',
            r'Vérification : $\sqrt9=3$ convient ; $\sqrt4=2\neq-2$. Donc $S=\{3\}$.',
        ], r'Élever au carré peut ajouter des solutions : vérifier chacune dans l’équation de départ.'),
    ]),
    ('Problèmes', 'Résoudre un problème par une équation', [
        X('22412', '10FA5D-2', 2, 'Mettre un problème en équation', sup='12-3-7-8', sup2=True),
        X('cd2f2', '10FA5D-3', 2, 'Problème de périmètre et d’aire', sup='1-2'),
        X('22412', '10FA5D-2', 2, 'Problèmes variés', sup='0', sup2=False),
    ], [
        *E('Nombres consécutifs', r'La somme de trois entiers consécutifs vaut $87$. Quels sont ces entiers ?', [
            r'Soit $n$ le plus petit : les nombres sont $n$, $n+1$ et $n+2$.',
            r'$n+(n+1)+(n+2)=87$, soit $3n+3=87$.',
            r'$n=28$ : les entiers sont $28$, $29$ et $30$.',
        ], r'Nommer l’inconnue par une phrase avant d’écrire l’équation, et vérifier la réponse dans l’énoncé.'),
        *E('Un rectangle', r'Un rectangle a un périmètre de $30$ cm. Sa longueur mesure $3$ cm de plus que sa largeur. Quelles sont ses dimensions ?', [
            r'Soit $x$ la largeur : la longueur est $x+3$.',
            r'$2x+2(x+3)=30$, soit $4x+6=30$.',
            r'$x=6$ : la largeur mesure $6$ cm et la longueur $9$ cm.',
        ], r'Exprimer toutes les longueurs avec la même inconnue.'),
        *E('Un problème du second degré', r'Le produit de deux entiers consécutifs vaut $132$. Quels sont ces entiers ?', [
            r'$n(n+1)=132$, soit $n^2+n-132=0$.',
            r'Somme $1$, produit $-132$ : $12$ et $-11$, donc $(n+12)(n-11)=0$.',
            r'$n=11$ ou $n=-12$ : les entiers sont $11$ et $12$, ou $-12$ et $-11$.',
        ], r'Une équation du second degré peut donner deux réponses : garder celles qui conviennent à l’énoncé.'),
    ]),
]

# ---------------------------------------------------------------------------
# Parcours 3 : systèmes d'équations
# ---------------------------------------------------------------------------
SYSTEMES = [
    ('Solution d’un système', 'Reconnaître la solution d’un système', [
        X('ccb71', '11FA5A-1', 2, 'Tester si un couple est solution d’un système', sup=1),
        X('ccb71', '11FA5A-1', 1, 'Tester si un couple est solution d’un système, niveau 2', sup=2),
        X('a1b2c', '1mSE-2', 2, 'Lire le point d’intersection de deux droites', sup=1),
    ], [
        *E('Tester un couple', r'Le couple $(2;-1)$ est-il solution du système $\begin{cases}x+3y=-1\\2x-y=4\end{cases}$ ?', [
            r'On remplace $x$ par $2$ et $y$ par $-1$ dans la première équation : $2+3\cdot(-1)=-1$. Elle est vérifiée.',
            r'Dans la seconde : $2\cdot2-(-1)=5$ et $5\neq4$. Elle n’est pas vérifiée.',
            r'Le couple $(2;-1)$ n’est pas solution du système.',
        ], r'Un couple est solution d’un système s’il vérifie **toutes** les équations. Une seule équation fausse suffit pour conclure qu’il n’est pas solution.'),
        *E('Point d’intersection', r'Résoudre graphiquement $\begin{cases}y=x-3\\y=-2x+3\end{cases}$', [
            r'On trace les deux droites : elles se coupent au point $(2;-1)$.',
            r'Vérification : $2-3=-1$ et $-2\cdot2+3=-1$.',
            r'$S=\{(2;-1)\}$.',
        ], r'La solution d’un système est un **couple** $(x;y)$ : les coordonnées du point d’intersection des deux droites.'),
    ]),
    ('Comparaison', 'Résoudre un système par comparaison', [
        X('1b828', '11FA5A-2', 1, 'Point d’intersection de deux droites $y=mx+h$'),
        X('2991a', '11FA5A-4', 1, 'Résoudre par comparaison, niveau 1', sup=1),
        X('2991a', '11FA5A-4', 2, 'Résoudre par comparaison, niveau 2', sup=2),
        X('a1b2c', '1mSE-2', 1, 'Point d’intersection en dehors du graphique', sup=2),
    ], [
        *E('Deux expressions de $y$', r'Résoudre $\begin{cases}y=3x-4\\y=-x+8\end{cases}$', [
            r'Les deux expressions de $y$ sont égales : $3x-4=-x+8$.',
            r'$4x=12$, donc $x=3$.',
            r'$y=3\cdot3-4=5$, donc $S=\{(3;5)\}$.',
        ], r'Quand les deux équations donnent la même inconnue, on égale les deux expressions.'),
        *E('Deux expressions de $2x$', r'Résoudre $\begin{cases}2x=y+7\\2x=-3y+3\end{cases}$', [
            r'Les deux expressions de $2x$ sont égales : $y+7=-3y+3$.',
            r'$4y=-4$, donc $y=-1$.',
            r'$2x=-1+7=6$, donc $x=3$ et $S=\{(3;-1)\}$.',
        ], r'Il suffit que les deux équations donnent la même expression ($2x$, $4y$, …) : on les égale sans isoler l’inconnue.'),
        *E('Point hors du graphique', r'Sur un graphique, $d_1$ passe par $(0;1)$ et $(1;3)$, et $d_2$ par $(0;5)$ et $(1;6)$. Les droites se coupent en dehors du graphique. Déterminer leur point d’intersection.', [
            r'$d_1$ coupe l’axe des ordonnées en $1$ et monte de $2$ quand $x$ augmente de $1$ : $d_1 : y=2x+1$.',
            r'De même, $d_2 : y=x+5$.',
            r'On compare : $2x+1=x+5$, donc $x=4$, puis $y=2\cdot4+1=9$. Le point d’intersection est $(4;9)$.',
        ], r'Quand le point ne se lit pas, on lit les équations $y=mx+h$ des deux droites, puis on résout le système.'),
    ]),
    ('Substitution', 'Résoudre un système par substitution', [
        X('521b6', '11FA5A-5', 2, 'Résoudre par substitution, niveau 1', sup=1),
        X('521b6', '11FA5A-5', 2, 'Résoudre par substitution, niveau 2', sup=2),
    ], [
        *E('Une inconnue déjà isolée', r'Résoudre $\begin{cases}y=2x-1\\3x+y=9\end{cases}$', [
            r'On remplace $y$ par $2x-1$ dans la seconde équation : $3x+2x-1=9$.',
            r'$5x=10$, donc $x=2$.',
            r'$y=2\cdot2-1=3$, donc $S=\{(2;3)\}$.',
        ], r'Remplacer, résoudre, puis revenir à l’équation isolée pour trouver la seconde inconnue.'),
        *E('Isoler une inconnue', r'Résoudre $\begin{cases}x+2y=7\\2x-3y=0\end{cases}$', [
            r'On isole $x$ dans la première équation : $x=7-2y$.',
            r'$2(7-2y)-3y=0$, soit $14-7y=0$, donc $y=2$.',
            r'$x=7-2\cdot2=3$, donc $S=\{(3;2)\}$.',
        ], r'Isoler une inconnue de coefficient $1$ ou $-1$, et mettre des parenthèses autour de l’expression remplacée.'),
    ]),
    ('Combinaison', 'Résoudre un système par combinaison', [
        X('5179b', '11FA5A-3', 2, 'Combinaison, niveau 1', sup=1, sup2=False),
        X('5179b', '11FA5A-3', 2, 'Combinaison, niveau 2', sup=2, sup2=False),
        X('5179b', '11FA5A-3', 2, 'Combinaison, niveau 3', sup=3, sup2=False),
    ], [
        *E('Coefficients opposés', r'Résoudre $\begin{cases}3x+2y=12\\5x-2y=4\end{cases}$', [
            r'On additionne les deux équations : $8x=16$, donc $x=2$.',
            r'$3\cdot2+2y=12$, donc $y=3$.',
            r'$S=\{(2;3)\}$.',
        ], r'Les coefficients de $y$ sont opposés : l’addition élimine $y$.'),
        *E('Multiplier avant de combiner', r'Résoudre $\begin{cases}2x+3y=8\\3x+4y=11\end{cases}$', [
            r'On multiplie la première équation par $3$ et la seconde par $2$ : $6x+9y=24$ et $6x+8y=22$.',
            r'On soustrait : $y=2$.',
            r'$2x+6=8$, donc $x=1$ et $S=\{(1;2)\}$.',
        ], r'Multiplier pour obtenir le même coefficient devant une inconnue, puis soustraire.'),
        *E('Trois équations, trois inconnues', r'Résoudre $\begin{cases}x+y+z=6\\x-y+z=2\\2x+y-z=1\end{cases}$', [
            r'Première moins deuxième : $2y=4$, donc $y=2$.',
            r'Avec $y=2$ : $x+z=4$ et $2x-z=-1$. On additionne : $3x=3$, donc $x=1$.',
            r'$z=4-1=3$, donc $S=\{(1;2;3)\}$.',
        ], r'Éliminer une inconnue pour se ramener à deux équations à deux inconnues.'),
    ]),
    ('Nombre de solutions', 'Déterminer le nombre de solutions d’un système', [
        X('2eee3', '11FA5A-9', 2, 'Position relative de deux droites et nombre de solutions'),
        X('fade2', '11FA5A-6', 2, 'Nature des solutions, niveau 1', sup=1),
        X('fade2', '11FA5A-6', 1, 'Nature des solutions, niveau 2', sup=2),
    ], [
        *E('Droites parallèles', r'Combien de solutions a le système $\begin{cases}y=3x+1\\y=3x-2\end{cases}$ ?', [
            r'Même pente $3$, ordonnées à l’origine différentes.',
            r'Les droites sont parallèles et distinctes : aucune solution.',
        ], r'Pentes différentes : une solution ; même pente et ordonnées à l’origine différentes : aucune ; droites confondues : une infinité.'),
        *E('Droites confondues', r'Combien de solutions a le système $\begin{cases}2x-y=3\\4x-2y=6\end{cases}$ ?', [
            r'La seconde équation est la première multipliée par $2$.',
            r'Les deux équations décrivent la même droite : une infinité de solutions.',
        ], r'Deux équations proportionnelles décrivent la même droite.'),
    ]),
    ('Problèmes', 'Résoudre un problème par un système', [
        X('4b211', '11FA5A-11', 1, 'Point d’intersection de deux droites données par des points'),
        X('6fbf9', '11FA5A-7', 2, 'Problème de groupes', sup=1),
        X('6fbf9', '11FA5A-7', 2, 'Problème de rectangle', sup=2),
    ], [
        *E('Droites données par deux points', r'Déterminer le point d’intersection des droites $(AB)$ et $(CD)$ avec $A(0;-1)$, $B(1;1)$, $C(0;8)$ et $D(2;6)$.', [
            r'Pente de $(AB)$ : $\frac{1-(-1)}{1-0}=2$, ordonnée à l’origine $-1$ : $y=2x-1$.',
            r'Pente de $(CD)$ : $\frac{6-8}{2-0}=-1$, ordonnée à l’origine $8$ : $y=-x+8$.',
            r'$2x-1=-x+8$, donc $3x=9$, $x=3$ et $y=2\cdot3-1=5$. Le point d’intersection est $(3;5)$.',
        ], r'Écrire d’abord l’équation de chaque droite, puis résoudre le système formé par les deux équations.'),
        *E('Deux prix inconnus', r'Au cinéma, $3$ billets adulte et $2$ billets enfant coûtent $58$ CHF ; $2$ billets adulte et $3$ billets enfant coûtent $52$ CHF. Quel est le prix de chaque billet ?', [
            r'Soit $x$ le prix d’un billet adulte et $y$ celui d’un billet enfant : $3x+2y=58$ et $2x+3y=52$.',
            r'On multiplie par $3$ et par $2$ : $9x+6y=174$ et $4x+6y=104$. On soustrait : $5x=70$, donc $x=14$.',
            r'$3\cdot14+2y=58$, donc $y=8$ : $14$ CHF pour un adulte, $8$ CHF pour un enfant.',
        ], r'Deux inconnues, deux informations : une équation par information.'),
        *E('Un rectangle', r'Un rectangle a un périmètre de $26$ cm. Sa longueur dépasse de $1$ cm le double de sa largeur. Quelles sont ses dimensions ?', [
            r'Soit $L$ la longueur et $\ell$ la largeur : $2L+2\ell=26$ et $L=2\ell+1$.',
            r'On remplace : $2(2\ell+1)+2\ell=26$, soit $6\ell=24$, donc $\ell=4$.',
            r'$L=2\cdot4+1=9$ : $9$ cm sur $4$ cm.',
        ], r'Vérifier la réponse dans chaque phrase de l’énoncé.'),
    ]),
]

# ---------------------------------------------------------------------------
# Parcours 4 : preuves en arithmétique
# ---------------------------------------------------------------------------
ARITHMETIQUE = [
    ('Vrai ou faux', 'Démontrer ou réfuter une égalité littérale', [
        X('8d4f2', '4L23', 4, 'Démontrer ou réfuter une égalité littérale'),
    ], [
        *E('Une égalité vraie', r'Pour tous les nombres $x$, a-t-on $3(x+2)-x=2x+6$ ?', [
            r'On réduit le membre de gauche : $3(x+2)-x=3x+6-x=2x+6$.',
            r'Les deux membres ont la même expression réduite $2x+6$ : l’égalité est vraie pour tous les nombres $x$.',
        ], r'Pour démontrer qu’une égalité est vraie pour **tous** les nombres, on réduit les deux membres : un exemple ne suffit pas.'),
        *E('Une égalité fausse', r'Pour tous les nombres $x$, a-t-on $(2x)^2=2x^2$ ?', [
            r'On essaie $x=1$ : $(2\cdot1)^2=4$ et $2\cdot1^2=2$.',
            r'$4\neq2$ : $x=1$ est un contre-exemple, l’égalité est fausse.',
            r'Avec $x=0$, on obtient $0=0$ : cette valeur ne permet pas de conclure.',
        ], r'Pour réfuter une égalité, une seule valeur suffit : un **contre-exemple**, qui donne deux résultats différents.'),
    ]),
    ('Diviseurs et multiples', 'Utiliser le vocabulaire de la divisibilité', [
        X('42d20', '9NO1A-14', 2, 'Vocabulaire de la division euclidienne', sup='1', sup2='5'),
        X('42d20', '9NO1A-14', 2, 'Quotient et reste', sup='2'),
        X('42d20', '9NO1A-14', 2, 'Diviseurs et multiples', sup='3-4'),
        X('42d20', '9NO1A-14', 1, 'Liste des diviseurs', sup='5', sup3=2, sup4=10),
    ], [
        *E('Division euclidienne', r'Effectuer la division euclidienne de $87$ par $6$.', [
            r'$6\cdot14=84$ et $6\cdot15=90>87$.',
            r'$87=6\cdot14+3$ : le quotient est $14$, le reste $3$.',
        ], r'Le reste est toujours plus petit que le diviseur : ici $0\leqslant3<6$.'),
        *E('Diviseur ou multiple', r'On sait que $52=4\cdot13$. Compléter : $13$ est … de $52$.', [
            r'La division de $52$ par $13$ tombe juste : le reste est nul.',
            r'$13$ est un diviseur de $52$, et $52$ est un multiple de $13$.',
        ], r'« $a$ est un diviseur de $b$ » et « $b$ est un multiple de $a$ » disent la même chose.'),
        *E('Liste des diviseurs', r'Donner la liste des diviseurs de $36$.', [
            r'Produits égaux à $36$ : $1\cdot36$, $2\cdot18$, $3\cdot12$, $4\cdot9$, $6\cdot6$.',
            r'Diviseurs de $36$ : $1$, $2$, $3$, $4$, $6$, $9$, $12$, $18$, $36$.',
        ], r'Chercher les diviseurs par paires, jusqu’à ce que les deux facteurs se rejoignent.'),
    ]),
    ('Traduire : pair, impair, multiple', 'Traduire une phrase par une expression littérale', [
        X('e5cd3', '1mCL1-16', 3, 'Un entier, un nombre pair ou impair : une opération', sup='1-0-0-0-0*libre*1*hasard*nm'),
        X('e5cd3', '1mCL1-16', 2, 'Un multiple : une opération', sup='0-1-0-0-0*libre*1*hasard*nm'),
        X('e5cd3', '1mCL1-16', 3, 'Un nombre : deux opérations', sup='1-1-0-0-0*libre*2*hasard*nm'),
    ], [
        *E('Un nombre pair', r'Traduire par une expression littérale : « le carré d’un nombre pair ».', [
            r'Un nombre pair s’écrit $2n$, avec $n$ entier.',
            r'Son carré : $(2n)^2$.',
            r'Sous forme réduite : $4n^2$.',
        ], r'Les parenthèses comptent : $(2n)^2=4n^2$, alors que $2n^2$ est le double du carré de $n$.'),
        *E('Un multiple', r'Traduire : « le cube d’un multiple de $3$ ».', [
            r'Un multiple de $3$ s’écrit $3n$, avec $n$ entier.',
            r'Son cube : $(3n)^3=27n^3$.',
        ], r'Un multiple de $k$ s’écrit $kn$, avec $n$ entier.'),
        *E('Deux opérations', r'Traduire : « la somme de $3$ et du double d’un nombre impair ».', [
            r'Un nombre impair s’écrit $2n+1$, avec $n$ entier.',
            r'Son double : $2(2n+1)$.',
            r'$3+2(2n+1)$, soit $4n+5$.',
        ], r'Partir du nombre, puis appliquer les opérations de la phrase, de la dernière nommée à la première.'),
    ]),
    ('Parité', 'Déterminer la parité d’une expression', [
        X('3ec5c', '11FA4D-3', 6, 'Déterminer la parité d’une expression'),
    ], [
        *E('Un facteur 2', r'$n$ est un entier. Déterminer la parité de $6n+4$.', [
            r'$6n+4=2(3n+2)$.',
            r'$3n+2$ est un entier, donc $6n+4$ est pair.',
        ], r'Un nombre pair s’écrit $2k$, un nombre impair $2k+1$, avec $k$ entier.'),
        *E('Un carré', r'$n$ est un entier. Comparer la parité de $5n^2$ à celle de $n$.', [
            r'$5n^2=2\cdot2n^2+n^2$, et $2\cdot2n^2$ est pair : $5n^2$ a la même parité que $n^2$.',
            r'Un carré a la même parité que le nombre : $n^2$ a la même parité que $n$.',
            r'$5n^2$ a donc la même parité que $n$.',
        ], r'Séparer un multiple de $2$, qui est pair, du reste de l’expression : c’est le reste qui décide de la parité.'),
        *E('Une parité qui dépend de $n$', r'$n$ est un entier. Comparer la parité de $3n+1$ à celle de $n$.', [
            r'Si $n$ est pair, $3n$ est pair et $3n+1$ est impair.',
            r'Si $n$ est impair, $3n$ est impair et $3n+1$ est pair.',
            r'$3n+1$ est de parité contraire à celle de $n$.',
        ], r'Quand la parité dépend de $n$, étudier les deux cas : $n$ pair, puis $n$ impair.'),
    ]),
    ('Traduire : plusieurs nombres', 'Traduire une phrase par une expression littérale', [
        X('e5cd3', '1mCL1-16', 2, 'Deux nombres : une opération', sup='0-0-1-0-0*libre*1*hasard*nm'),
        X('e5cd3', '1mCL1-16', 2, 'Nombres consécutifs : une opération', sup='0-0-0-1-1*libre*1*hasard*nm'),
        X('e5cd3', '1mCL1-16', 2, 'Plusieurs nombres : deux opérations', sup='0-1-1-1-1*melange*2*hasard*nm'),
        X('e5cd3', '1mCL1-16', 2, 'Plusieurs nombres : trois opérations', sup='0-1-1-1-1*melange*3*hasard*nm'),
    ], [
        *E('Deux nombres pairs', r'Traduire : « la somme des carrés de deux nombres pairs ».', [
            r'Les deux nombres sont choisis indépendamment : $2n$ et $2m$, avec $n$ et $m$ entiers.',
            r'$(2n)^2+(2m)^2$.',
            r'Sous forme réduite : $4n^2+4m^2$.',
        ], r'Deux nombres quelconques : deux lettres différentes. Avec $2n$ et $2n$, ce serait deux fois le même nombre.'),
        *E('Trois entiers consécutifs', r'Traduire : « la somme de trois entiers consécutifs ».', [
            r'Des entiers consécutifs se suivent : $n$, $n+1$ et $n+2$.',
            r'$n+(n+1)+(n+2)=3n+3$.',
        ], r'Des nombres consécutifs s’écrivent avec **une seule** lettre ; $n-1$, $n$ et $n+1$ conviennent aussi.'),
        *E('Notation imposée', r'Traduire : « le produit de deux entiers consécutifs, le plus grand étant noté $n$ ».', [
            r'Le plus grand est $n$, donc le plus petit est $n-1$.',
            r'$(n-1)n$, soit $n^2-n$.',
        ], r'Respecter le rôle donné à $n$ dans l’énoncé.'),
    ]),
]

PARCOURS = [
    {
        'id': 'ch-1c-calcul-litteral', 'titre': 'Calcul littéral et factorisation', 'theme': 'Factorisation',
        'icone': 'bx-math', 'ceintures': CALCUL,
        'objectif': 'Développer, puis factoriser par mise en évidence, identités, somme et produit, et groupements.',
        'descriptionEleves': 'Sept ceintures, du développement aux fractions rationnelles. Chaque ceinture s’ouvre sur des exemples résolus ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    },
    {
        'id': 'ch-1c-equations', 'titre': 'Résolution d’équations', 'theme': 'Équations du second degré',
        'icone': 'bx-calculator', 'ceintures': EQUATIONS,
        'objectif': 'Résoudre des équations du premier et du second degré, puis de degré 3 et 4, et des problèmes.',
        'descriptionEleves': 'Sept ceintures, du premier degré aux problèmes. Chaque ceinture s’ouvre sur des exemples résolus ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    },
    {
        'id': 'ch-1c-systemes', 'titre': 'Systèmes d’équations', 'theme': "Systèmes d'équations",
        'icone': 'bx-git-merge', 'ceintures': SYSTEMES,
        'objectif': 'Résoudre un système de deux équations à deux inconnues, graphiquement et par le calcul.',
        'descriptionEleves': 'Six ceintures : solution d’un système, comparaison, substitution, combinaison, nombre de solutions et problèmes. Chaque ceinture s’ouvre sur des exemples résolus ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    },
    {
        'id': 'ch-1c-preuves', 'titre': 'Preuves en arithmétique', 'theme': 'Calcul littéral - Généralités',
        'icone': 'bx-hash', 'ceintures': ARITHMETIQUE,
        'objectif': 'Démontrer ou réfuter une égalité, puis écrire des entiers avec des lettres pour démontrer un résultat sur la parité.',
        'descriptionEleves': 'Cinq ceintures : vrai ou faux, diviseurs et multiples, traduire une phrase avec un nombre pair, impair ou multiple, déterminer la parité d’une expression, puis traduire une phrase avec plusieurs nombres. Chaque ceinture s’ouvre sur des exemples résolus ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    },
]


def construire(p):
    etapes, paliers, objectifs = [], [], []
    for k, (titre, objectif, ex, blocs) in enumerate(p['ceintures']):
        etapes += [{**e, 'objectifs': [objectif]} for e in ex]
        if objectif not in [o['libelle'] for o in objectifs]:
            objectifs.append({'libelle': objectif, 'niveau': NIVEAU, 'theme': p['theme']})
        paliers.append({'titre': titre, 'nb': len(ex), **({'acces': 'seuil', 'seuil': 80} if k else {}),
                        'fiche': {'titre': titre, 'avant': True, 'blocs': blocs}})
    noms = [c[0] for c in p['ceintures']]
    parcours = {
        'id': p['id'], 'version': 1, 'titre': p['titre'], 'objectif': p['objectif'], 'auteurs': AUTEURS,
        'descriptionEleves': p['descriptionEleves'],
        'descriptionEnseignant': f'{len(noms)} ceintures, de la blanche à la {["blanche", "jaune", "orange", "verte", "bleue", "marron", "noire"][len(noms) - 1]} : ' + ' ; '.join(noms)
        + '. Dans chaque ceinture, les exercices vont du cas le plus simple au plus difficile, sans mélange des questions. Des exemples résolus précèdent chaque ceinture ; la suivante se débloque à 80 %.',
        'niveau': NIVEAU, 'theme': p['theme'], 'difficulte': 2, 'icone': p['icone'],
        'presentation': 'une_question_par_page', 'correction': 'question', 'enTetesMasques': True, 'melanger': False,
        'style': 'ceintures', 'premiereCeinture': 0, 'paliers': paliers, 'etapes': etapes,
    }
    return parcours, objectifs


tous, objectifs = [], []
for p in PARCOURS:
    parcours, obj = construire(p)
    tous.append(parcours)
    objectifs += [o for o in obj if o['libelle'] not in [x['libelle'] for x in objectifs]]

donnees = {
    'format': 'classes-mathalea/1',
    'exporteLe': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
    'classes': [{'nom': CLASSE, 'parcours': tous}],
    'bibliotheque': {'parcours': [], 'objectifs': objectifs},
}
FICHIER.write_text(json.dumps(donnees, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for p in tous:
    print(f"{p['id']} : {len(p['paliers'])} ceintures, {len(p['etapes'])} étapes, {sum(e['nbQuestions'] for e in p['etapes'])} questions")
