"""Parcours de 11e (voie LS), un par chapitre : écrit explorer/ch-11e-ls.json.

Chapitres et ceintures d'après les objectifs d'un cours de 11e LS ; fiches
rédigées pour l'app (remédiation brève, voir le skill fiches-cours).
Chapitres encore incomplets dans MathALÉA (relatifs et rationnels,
proportionnalité, figures planes) : voir 11ls-chapitres-proposition.md.

    python3 explorer/ch-11e-ls-gen.py
"""
import json
from datetime import datetime, timezone
from pathlib import Path

SORTIE = Path(__file__).with_name('ch-11e-ls.json')
NIVEAU = '11e'
AUTEURS = ['l’équipe CoopMaths', 'Nathan Scheinmann', 'Claude Opus 5.5']
CEINTURES = ['blanche', 'jaune', 'orange', 'verte', 'bleue', 'marron', 'noire']


# Blocs de fiche
def listes(texte):
    """Ligne vide avant une liste qui suit une phrase : sinon les tirets restent bruts."""
    lignes = texte.split('\n')
    sortie = []
    for k, l in enumerate(lignes):
        if l.startswith('- ') and k and lignes[k - 1].strip() and not lignes[k - 1].startswith('- '):
            sortie.append('')
        sortie.append(l)
    return '\n'.join(sortie)


def T(texte):
    return {'type': 'texte', 'texte': listes(texte)}


def R(titre, texte):
    return {'type': 'retenir', 'titre': titre, 'texte': listes(texte)}


def E(enonce, etapes, titre=None):
    b = {'type': 'exemple', 'enonce': enonce, 'etapes': etapes}
    if titre:
        b['titre'] = titre
    return b


def QC(enonce, choix, explication, bonne=0):
    return {'type': 'question', 'enonce': enonce, 'choix': choix, 'bonne': bonne, 'explication': explication}


def QN(enonce, reponse, explication):
    return {'type': 'question', 'enonce': enonce, 'reponse': reponse, 'explication': explication}


def G(**g):
    return {'type': 'graphique', **g}


# Une étape : (uuid, référence, nombre de questions, titre vu par l'élève, réglages)
def X(uuid, ref, n, titre, **sup):
    return {'uuid': uuid, 'id': ref, 'nbQuestions': n, 'titre': titre, **sup}


CHAPITRES = []

# Version de chaque parcours, à augmenter à chaque modification diffusée (1 par défaut).
# 2 : QCM remplacés par des exercices à réponse tapée quand le moteur en a un (0.4.12).
VERSIONS = {
    'ch-11ls-puissances-racines': 2,
    'ch-11ls-ensembles-nombres': 2,
    'ch-11ls-grandeurs-plan': 2,
    'ch-11ls-calcul-litteral': 2,
    'ch-11ls-transformations': 2,
}

# Chapitre du référentiel suisse (11e) sous lequel l'Explorer range chaque parcours
THEMES = {
    'ch-11ls-puissances-racines': 'Nombres réels',
    'ch-11ls-ensembles-nombres': 'Nombres réels',
    'ch-11ls-grandeurs-plan': 'Lignes, surfaces et théorèmes',
    'ch-11ls-calcul-litteral': 'Calcul littéral',
    'ch-11ls-equations': 'Équations',
    'ch-11ls-solides': 'Solides',
    'ch-11ls-fonctions': 'Fonctions',
    'ch-11ls-thales': 'Lignes, surfaces et théorèmes',
    'ch-11ls-transformations': 'Transformations géométriques',
    'ch-11ls-systemes': 'Équations',
    'ch-11ls-probabilites': 'Situations aléatoires',
}


def chapitre(id, titre, icone, objectif, ceintures):
    CHAPITRES.append({'id': id, 'titre': titre, 'icone': icone, 'objectif': objectif, 'ceintures': ceintures})


# Une ceinture : titre, objectif (libellé unique), étapes, blocs de la fiche
def C(titre, objectif, etapes, blocs):
    return {'titre': titre, 'objectif': objectif, 'etapes': etapes, 'blocs': blocs}


# ---------------------------------------------------------------------------
chapitre('ch-11ls-puissances-racines', 'Puissances et racines', 'bx-math',
         'Calculer avec des puissances, l’écriture scientifique et des racines carrées.', [
    C('Calculer une puissance', 'Calculer une puissance', [
        X('36f8b', '10NO3D-1', 4, 'Calculer une puissance'),
        X('125bd', '10NO3D-5', 3, 'Puissances de nombres négatifs', sup='true'),
    ], [
        T('Une puissance abrège un produit dont tous les facteurs sont égaux. On en a besoin dès qu’une même multiplication se répète : aires, volumes, très grands ou très petits nombres.'),
        R('Définition', r'Pour un nombre $a$ et un entier $n\geqslant1$ :' '\n' r'$$a^n=\underbrace{a\times a\times\cdots\times a}_{n\text{ facteurs}}$$' '\n' r'$a$ est la **base**, $n$ l’**exposant**. $a^2$ se lit « $a$ au carré », $a^3$ « $a$ au cube ».'),
        E(r'Calculer $(-2)^5$.', [
            r'On écrit le produit : $(-2)\times(-2)\times(-2)\times(-2)\times(-2)$.',
            r'Il y a cinq facteurs négatifs, un nombre impair : le produit est négatif.',
            r'$2^5=32$, donc $(-2)^5=-32$.',
        ]),
        R('Cas particuliers', r'- $a^1=a$' '\n' r'- $a^0=1$ si $a\neq0$' '\n' r'- $1^n=1$' '\n' r'- $0^n=0$ si $n\geqslant1$' '\n' r'- $a^{-n}=\dfrac{1}{a^n}$ si $a\neq0$ : $2^{-3}=\dfrac18$'),
        R('Le signe', r'Une puissance d’un nombre négatif est **positive** si l’exposant est pair, **négative** s’il est impair. La règle vaut aussi pour un exposant négatif : $(-4)^{-6}>0$.' '\n\n' r'Une puissance d’un nombre positif est toujours positive : $3^{-2}=\dfrac19$.'),
        E(r'Comparer $(-3)^2$ et $-3^2$.', [
            r'$(-3)^2=(-3)\times(-3)=9$ : la base est $-3$.',
            r'$-3^2=-(3\times3)=-9$ : la base est $3$, le signe « $-$ » reste devant.',
            r'Les deux nombres sont opposés.',
        ], 'Avec ou sans parenthèses'),
        QC(r'Que vaut $-2^4$ ?', [r'$-16$', r'$16$', r'$-8$'], r'L’exposant porte seulement sur $2$ : $-2^4=-(2\times2\times2\times2)=-16$.'),
        QN(r'Que vaut $(-1)^7+5^0$ ?', 0, r'$(-1)^7=-1$ car l’exposant est impair, et $5^0=1$. La somme vaut $0$.'),
        R('Pièges', r'- $2^3$ n’est pas $2\times3$ : $2^3=8$.' '\n' r'- Sans parenthèses, l’exposant ne porte pas sur le signe « $-$ ».' '\n' r'- $a^0$ vaut $1$, pas $0$.'),
    ]),
    C('Puissances de 10', 'Calculer avec des puissances de 10', [
        X('93df9', '10NO3D-3', 3, 'Écrire une puissance de 10 en écriture décimale'),
        X('f5dcf', '10NO3D-2', 3, 'Calculer avec des puissances de 10'),
    ], [
        T('Les puissances de 10 permettent d’écrire les très grands et les très petits nombres sans aligner des dizaines de zéros.'),
        R('Exposant positif ou négatif', r'Pour un entier $n\geqslant1$ :' '\n' r'- $10^n$ s’écrit avec un $1$ suivi de $n$ zéros ;' '\n' r'- $10^{-n}=\dfrac{1}{10^n}$ s’écrit avec $n$ zéros avant le $1$, en comptant celui des unités : $10^{-3}=0{,}001$.' '\n\n' r'$10^0=1$.'),
        E(r'Écrire $10^{-4}$ en écriture décimale.', [
            r'$10^{-4}=\dfrac{1}{10^4}=\dfrac{1}{10\,000}$.',
            r'Quatre zéros avant le $1$ : $10^{-4}=0{,}0001$.',
        ]),
        R('Multiplier par une puissance de 10', r'Multiplier par $10^n$ décale la virgule de $n$ rangs vers la droite ; multiplier par $10^{-n}$ la décale de $n$ rangs vers la gauche.'),
        R('Règles de calcul', r'Pour des entiers $m$ et $n$ :' '\n' r'- $10^m\times10^n=10^{m+n}$' '\n' r'- $\dfrac{10^m}{10^n}=10^{m-n}$' '\n' r'- $(10^m)^n=10^{m\times n}$'),
        E(r'Écrire $\dfrac{10^{4}\times10^{-7}}{10^{2}}$ sous la forme $10^k$.', [
            r'Numérateur : $10^{4+(-7)}=10^{-3}$.',
            r'Quotient : $10^{-3-2}=10^{-5}$.',
        ], 'Avec les règles'),
        QC(r'$35{,}6\times10^{-2}$ est égal à :', [r'$0{,}356$', r'$3\,560$', r'$0{,}0356$'], r'On décale la virgule de deux rangs vers la gauche : $0{,}356$.'),
        QN(r'$(10^3)^2\times10^{-4}=10^k$. Que vaut $k$ ?', 2, r'$(10^3)^2=10^6$, puis $10^{6+(-4)}=10^2$.'),
        R('Pièges', r'- $10^{-2}$ est positif : c’est $0{,}01$, pas $-100$.' '\n' r'- $10^3\times10^4=10^7$ : on additionne les exposants, on ne les multiplie pas.'),
    ]),
    C('Propriétés des puissances', 'Utiliser les propriétés des puissances', [
        X('bae57', '10NO3D-9', 2, 'Produit de puissances de même exposant', sup='4'),
        X('bae57', '10NO3D-9', 2, 'Puissance d’une puissance', sup='3'),
        X('a8a2e', '10NO3D-22', 3, 'Écrire sous la forme d’une seule puissance'),
    ], [
        T('Quand des puissances ont la même base, ou le même exposant, on calcule sans tout développer.'),
        R('Même base', r'Pour $a\neq0$ et des entiers $m$ et $n$ :' '\n' r'- $a^m\times a^n=a^{m+n}$' '\n' r'- $\dfrac{a^m}{a^n}=a^{m-n}$' '\n' r'- $(a^m)^n=a^{m\times n}$'),
        E(r'Écrire $\dfrac{2^5\times2^3}{2^4}$ sous la forme $2^k$.', [
            r'$2^5\times2^3=2^{5+3}=2^8$.',
            r'$\dfrac{2^8}{2^4}=2^{8-4}=2^4$.',
        ]),
        R('Même exposant', r'Pour tout entier $n$ : $a^n\times b^n=(a\times b)^n$.'),
        E(r'Calculer $4^3\times25^3$.', [
            r'Les exposants sont égaux : $4^3\times25^3=(4\times25)^3$.',
            r'$4\times25=100$, donc le résultat est $100^3=1\,000\,000$.',
        ], 'Même exposant'),
        E(r'Écrire $\dfrac{9^2\times3}{27}$ sous la forme $3^k$.', [
            r'$9=3^2$ et $27=3^3$.',
            r'$9^2=(3^2)^2=3^4$.',
            r'$\dfrac{3^4\times3^1}{3^3}=3^{4+1-3}=3^2$.',
        ], 'Changer de base'),
        QC(r'$(5^2)^3$ est égal à :', [r'$5^6$', r'$5^5$', r'$25^5$'], r'Pour une puissance de puissance, on multiplie les exposants : $2\times3=6$.'),
        QN(r'$\dfrac{7^{9}}{7^{3}\times7^{4}}=7^k$. Que vaut $k$ ?', 2, r'$7^3\times7^4=7^7$, puis $7^{9-7}=7^2$.'),
        R('Pièges', r'- $2^3\times3^2$ ne se simplifie pas : ni la base ni l’exposant ne sont communs.' '\n' r'- $a^m+a^n$ n’est pas $a^{m+n}$ : la règle vaut pour un produit, pas pour une somme.'),
    ]),
    C('Écriture scientifique', 'Écrire un nombre en écriture scientifique', [
        X('a0d17', '10NO3F-1', 3, 'Passer en écriture scientifique'),
        X('a0d17', '10NO3F-1', 3, 'Écriture scientifique de grands et petits nombres', sup2='3'),
    ], [
        T(r'La distance de la Terre au Soleil, environ $150\,000\,000$ km, ou la masse d’un atome se lisent mal en écriture décimale. L’écriture scientifique les rend lisibles et faciles à comparer.'),
        R('Définition', r'Un nombre est en **écriture scientifique** s’il s’écrit $a\times10^n$, avec $n$ entier et $1\leqslant a<10$ (précédé d’un « $-$ » pour un nombre négatif).'),
        E(r'Écrire $4\,560\,000$ en écriture scientifique.', [
            r'On place la virgule après le premier chiffre non nul : $a=4{,}56$.',
            r'Pour retrouver $4\,560\,000$, la virgule doit avancer de $6$ rangs vers la droite.',
            r'$4\,560\,000=4{,}56\times10^6$.',
        ]),
        E(r'Écrire $0{,}000\,72$ en écriture scientifique.', [
            r'$a=7{,}2$.',
            r'Pour retrouver $0{,}000\,72$, la virgule recule de $4$ rangs vers la gauche.',
            r'$0{,}000\,72=7{,}2\times10^{-4}$.',
        ], 'Un petit nombre'),
        E(r'Écrire $53\times10^{-3}$ en écriture scientifique.', [
            r'$53$ n’est pas entre $1$ et $10$ : $53=5{,}3\times10^1$.',
            r'$5{,}3\times10^1\times10^{-3}=5{,}3\times10^{-2}$.',
        ], 'Corriger une écriture'),
        QC('Quelle écriture est scientifique ?', [r'$2{,}5\times10^{-4}$', r'$25\times10^{-5}$', r'$0{,}25\times10^{-3}$'], r'Seul $2{,}5$ est compris entre $1$ et $10$. Les trois écritures valent pourtant le même nombre.'),
        QN(r'$0{,}0031=3{,}1\times10^{k}$. Que vaut $k$ ?', -3, r'De $0{,}0031$ à $3{,}1$, la virgule avance de trois rangs : $k=-3$.'),
        R('Pièges', r'- Un grand nombre a un exposant positif ; un nombre entre $0$ et $1$, un exposant négatif.' '\n' r'- $10\times10^3$ n’est pas une écriture scientifique : $a$ doit être strictement inférieur à $10$.'),
    ]),
    C('Calculer en écriture scientifique', 'Calculer avec des écritures scientifiques', [
        X('0ec6a', '11NO3A-2', 3, 'Calculer avec l’écriture scientifique'),
        X('0ec6a', '11NO3A-2', 2, 'Multiplier et diviser en écriture scientifique', sup='3-4', sup2='2'),
        X('5c9c2', '10NO3F-5', 2, 'Résoudre un problème avec des puissances de 10'),
    ], [
        T('Pour multiplier ou diviser des nombres en écriture scientifique, on traite à part les nombres $a$ et les puissances de 10.'),
        R('Produit et quotient', r'- On regroupe les nombres d’un côté, les puissances de 10 de l’autre.' '\n' r'- On calcule chaque partie, avec les règles des puissances pour la seconde.' '\n' r'- On remet le résultat en écriture scientifique si $a$ n’est plus entre $1$ et $10$.'),
        E(r'Calculer $A=1{,}2\times10^{16}\times9\times10^{-25}$.', [
            r'$A=(1{,}2\times9)\times(10^{16}\times10^{-25})$.',
            r'$A=10{,}8\times10^{-9}$.',
            r'$10{,}8=1{,}08\times10^1$, donc $A=1{,}08\times10^{-8}$.',
        ]),
        E(r'Calculer $B=\dfrac{3\times10^{21}\times5\times10^{-9}}{2\times10^{4}}$.', [
            r'Les nombres : $\dfrac{3\times5}{2}=7{,}5$.',
            r'Les puissances : $10^{21-9-4}=10^8$.',
            r'$B=7{,}5\times10^8$.',
        ], 'Un quotient'),
        R('Une somme', r'Pour une somme, les règles des puissances ne s’appliquent pas : on écrit d’abord les termes en écriture décimale, ou avec la même puissance de 10.'),
        E(r'Calculer $2{,}3\times10^3+5\times10^4$.', [
            r'$2{,}3\times10^3=2\,300$ et $5\times10^4=50\,000$.',
            r'$2\,300+50\,000=52\,300$.',
            r'$52\,300=5{,}23\times10^4$.',
        ], 'Une somme'),
        QC(r'$4\times10^5\times3\times10^{-2}$ est égal à :', [r'$1{,}2\times10^4$', r'$12\times10^{-10}$', r'$7\times10^3$'], r'$4\times3=12$ et $10^{5-2}=10^3$. Puis $12\times10^3=1{,}2\times10^4$.'),
        QN(r'$\dfrac{8\times10^{7}}{2\times10^{3}}=4\times10^k$. Que vaut $k$ ?', 4, r'$\dfrac82=4$ et $10^{7-3}=10^4$.'),
    ]),
    C('Racines carrées', 'Calculer et encadrer une racine carrée', [
        X('f5cbd', '10NO3E-1', 4, 'Racine carrée d’un carré parfait'),
        X('ed2ed', '10NO3E-5', 3, 'Encadrer une racine carrée'),
    ], [
        T('Chercher une racine carrée, c’est faire le chemin inverse du carré : on connaît l’aire d’un carré et on cherche la longueur de son côté.'),
        R('Définition', r'Pour $a\geqslant0$, la **racine carrée** de $a$, notée $\sqrt{a}$, est le nombre **positif** dont le carré vaut $a$.' '\n\n' r'$\sqrt{a}$ n’existe pas si $a<0$.'),
        E(r'Calculer $\sqrt{144}$.', [
            r'On cherche un nombre positif dont le carré vaut $144$.',
            r'$12^2=144$, donc $\sqrt{144}=12$.',
        ]),
        R('Carrés à connaître', r'$1$, $4$, $9$, $16$, $25$, $36$, $49$, $64$, $81$, $100$, $121$, $144$, $169$, $196$, $225$ : les carrés des entiers de $1$ à $15$.'),
        R('Encadrer une racine', r'Si $a$ n’est pas un carré parfait, on l’encadre par les deux carrés parfaits voisins : si $n^2<a<(n+1)^2$, alors $n<\sqrt{a}<n+1$.'),
        E(r'Encadrer $\sqrt{70}$ par deux entiers consécutifs.', [
            r'Les carrés parfaits voisins de $70$ sont $64$ et $81$.',
            r'$64<70<81$, donc $\sqrt{64}<\sqrt{70}<\sqrt{81}$.',
            r'$8<\sqrt{70}<9$.',
        ], 'Encadrer'),
        QC(r'Entre quels entiers se trouve $\sqrt{30}$ ?', [r'$5$ et $6$', r'$15$ et $16$', r'$4$ et $5$'], r'$25<30<36$, donc $5<\sqrt{30}<6$. La racine n’est pas la moitié du nombre.'),
        QN(r'Que vaut $\sqrt{169}$ ?', 13, r'$13^2=169$.'),
        R('Pièges', r'- $\sqrt{16}=4$, pas $8$ : la racine n’est pas la moitié.' '\n' r'- $\sqrt{-9}$ n’existe pas : un carré n’est jamais négatif.'),
    ]),
    C('Propriétés des racines', 'Utiliser les propriétés des racines carrées', [
        X('13310', '13310', 3, 'Calculer avec les propriétés des racines'),
        X('d9495', '11NO3B-3', 3, 'Extraire un entier d’une racine'),
        X('12b72', '11NO3B-4', 2, 'Simplifier une somme de racines'),
    ], [
        T('Les racines carrées se multiplient et se divisent facilement. Ces règles permettent de simplifier une racine en sortant les carrés qu’elle contient.'),
        R('Produit et quotient', r'Pour $a\geqslant0$ et $b\geqslant0$ :' '\n' r'- $\sqrt{a}\times\sqrt{b}=\sqrt{a\times b}$' '\n' r'- $\dfrac{\sqrt{a}}{\sqrt{b}}=\sqrt{\dfrac{a}{b}}$ si $b\neq0$' '\n' r'- $(\sqrt{a})^2=a$ et $\sqrt{a^2}=a$'),
        E(r'Calculer $\sqrt{18}\times\sqrt{2}$.', [
            r'$\sqrt{18}\times\sqrt{2}=\sqrt{36}$.',
            r'$\sqrt{36}=6$.',
        ]),
        R('Extraire un entier', r'Pour écrire $\sqrt{n}$ sous la forme $a\sqrt{b}$ avec $b$ le plus petit possible, on cherche le plus grand carré qui divise $n$ :' '\n' r'$$\sqrt{a^2\times b}=a\sqrt{b}.$$'),
        E(r'Écrire $\sqrt{108}$ sous la forme $a\sqrt{b}$.', [
            r'Le plus grand carré qui divise $108$ est $36$ : $108=36\times3$.',
            r'$\sqrt{108}=\sqrt{36}\times\sqrt{3}$.',
            r'$\sqrt{108}=6\sqrt{3}$.',
        ], 'Extraire'),
        E(r'Écrire $\sqrt{12}+\sqrt{75}$ sous la forme $a\sqrt{3}$.', [
            r'$\sqrt{12}=\sqrt{4\times3}=2\sqrt{3}$.',
            r'$\sqrt{75}=\sqrt{25\times3}=5\sqrt{3}$.',
            r'$2\sqrt{3}+5\sqrt{3}=7\sqrt{3}$.',
        ], 'Une somme de racines'),
        QC(r'$\sqrt{9+16}$ est égal à :', [r'$5$', r'$7$', r'$\sqrt{9}+\sqrt{16}$'], r'On calcule d’abord sous la racine : $\sqrt{25}=5$. Une racine ne se coupe pas sur une somme.'),
        QN(r'$\sqrt{50}=a\sqrt{2}$. Que vaut $a$ ?', 5, r'$50=25\times2$, donc $\sqrt{50}=5\sqrt{2}$.'),
        R('Pièges', r'- $\sqrt{a+b}\neq\sqrt{a}+\sqrt{b}$.' '\n' r'- Prendre le **plus grand** carré : $\sqrt{72}=2\sqrt{18}$ n’est pas fini, car $72=36\times2$ donne $6\sqrt{2}$.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-ensembles-nombres', 'Ensembles de nombres et valeurs approchées', 'bx-calculator',
         'Classer un nombre dans un ensemble et donner une valeur approchée d’un calcul.', [
    C('Ensembles de nombres', 'Classer un nombre dans un ensemble de nombres', [
        X('25fb4', '11NO5-1', 3, 'Trouver le plus petit ensemble'),
        X('25fb4', '11NO5-1', 3, 'Classer des nombres moins évidents', sup='4-5-7-8-9'),
        X('ec6e7', '11NO5-3', 3, 'Classer le résultat d’un calcul'),
    ], [
        T(r'Selon ce qu’on compte, mesure ou calcule, on rencontre des nombres de plus en plus riches : entiers, décimaux, fractions, puis des nombres comme $\sqrt{2}$ ou $\pi$.'),
        R('Les ensembles', r'- $\mathbb{N}$ : entiers naturels $0$ ; $1$ ; $2$ ; …' '\n' r'- $\mathbb{Z}$ : entiers relatifs … ; $-2$ ; $-1$ ; $0$ ; $1$ ; …' '\n' r'- $\mathbb{D}$ : décimaux, qui ont une écriture décimale finie' '\n' r'- $\mathbb{Q}$ : rationnels, quotients de deux entiers ; leur écriture décimale est finie ou périodique' '\n' r'- $\mathbb{R}$ : réels, tous les nombres de la droite graduée'),
        R('Inclusions', r'$$\mathbb{N}\subset\mathbb{Z}\subset\mathbb{D}\subset\mathbb{Q}\subset\mathbb{R}$$' '\n' r'Un nombre d’un ensemble appartient aussi à tous ceux qui le contiennent. Les réels qui ne sont pas rationnels sont **irrationnels**, comme $\sqrt{2}$ ou $\pi$.'),
        E(r'Quel est le plus petit ensemble qui contient $\dfrac{28}{4}$ ?', [
            r'On simplifie d’abord : $\dfrac{28}{4}=7$.',
            r'$7$ est un entier positif.',
            r'Le plus petit ensemble est $\mathbb{N}$.',
        ]),
        E(r'Quel est le plus petit ensemble qui contient $\dfrac{22}{7}$ ?', [
            r'$22\div7=3{,}142857\,142857\ldots$ : le bloc $142857$ se répète sans fin.',
            r'Ce n’est pas un décimal, mais c’est un quotient d’entiers.',
            r'Le plus petit ensemble est $\mathbb{Q}$.',
        ], 'Une fraction'),
        E(r'Où ranger $-\sqrt{16}$ et $\sqrt{3}$ ?', [
            r'$-\sqrt{16}=-4$ : un entier négatif, donc dans $\mathbb{Z}$.',
            r'$3$ n’est pas un carré parfait : $\sqrt{3}$ est irrationnel, il est seulement dans $\mathbb{R}$.',
        ], 'Des racines'),
        QC(r'Quel est le plus petit ensemble qui contient $\dfrac{3}{5}$ ?', [r'$\mathbb{D}$', r'$\mathbb{Q}$', r'$\mathbb{N}$'], r'$\dfrac35=0{,}6$ a une écriture décimale finie : c’est un décimal.'),
        R('Pièges', r'- Simplifier avant de classer : $\dfrac{12}{3}=4\in\mathbb{N}$.' '\n' r'- $\sqrt{25}=5$ est entier : seule la racine d’un entier qui n’est pas un carré parfait est irrationnelle.' '\n' r'- $-3$ n’appartient pas à $\mathbb{N}$.'),
    ]),
    C('Arrondir et tronquer', 'Donner une valeur approchée', [
        X('d2b82', 'PR-43', 3, 'Arrondir ou tronquer un nombre'),
        X('013fe', '10NO3E-9', 2, 'Arrondir un quotient'),
    ], [
        T(r'Une calculatrice affiche souvent une valeur approchée : $\dfrac{57}{13}\approx4{,}384615385$. Il faut savoir la raccourcir correctement.'),
        R('Tronquer, arrondir', r'- **Tronquer** au dixième : on coupe après le chiffre des dixièmes.' '\n' r'- **Arrondir** au dixième : on garde le nombre au dixième le plus proche. On regarde le chiffre suivant : de $0$ à $4$, on garde ; de $5$ à $9$, on augmente de $1$ le dernier chiffre gardé.'),
        E(r'Donner la troncature et l’arrondi au centième de $4{,}384\,6$.', [
            r'Troncature : on coupe après les centièmes, $4{,}38$.',
            r'Arrondi : le chiffre suivant est $4$, on garde $4{,}38$.',
        ]),
        E(r'Arrondir $48\,715{,}789\,6$ au dixième, puis à l’unité.', [
            r'Au dixième : le chiffre qui suit le $7$ est $8$, donc $48\,715{,}8$.',
            r'À l’unité : le chiffre des dixièmes est $7$, donc $48\,716$.',
        ], 'Quand l’arrondi change'),
        R('Encadrer', r'Encadrer au dixième, c’est donner les deux nombres au dixième qui entourent la valeur : $4{,}3<\dfrac{57}{13}<4{,}4$.'),
        E(r'Arrondir $-0{,}244\,7$ au centième.', [
            r'On arrondit $0{,}244\,7$ : le chiffre des millièmes est $4$, on garde $0{,}24$.',
            r'On remet le signe : $-0{,}24$.',
        ], 'Un nombre négatif'),
        QC(r'L’arrondi au millième de $2{,}718\,28$ est :', [r'$2{,}718$', r'$2{,}719$', r'$2{,}71$'], r'Le chiffre qui suit les millièmes est $2$ : on garde $2{,}718$.'),
        QN(r'Arrondir $3{,}141\,59$ au centième.', 3.14, r'Le chiffre des millièmes est $1$ : on garde $3{,}14$.'),
        R('Pièges', r'- Arrondir à la centaine donne un multiple de $100$ : $48\,715\approx48\,700$.' '\n' r'- Tronquer ne change jamais le dernier chiffre gardé ; arrondir peut l’augmenter.'),
    ]),
    C('Calculer et arrondir', 'Calculer à la calculatrice et arrondir', [
        X('1cd63', '11NO5-13', 2, 'Calculer avec une barre de fraction'),
        X('41188', '10NO3E-2', 3, 'Arrondir une racine carrée'),
        X('d8741', '10GM1B-7', 2, 'Calculer avec π et arrondir'),
    ], [
        T('La calculatrice respecte les priorités opératoires, à condition de lui donner les bonnes parenthèses. On arrondit ensuite le résultat à la précision demandée.'),
        R('Saisir correctement', r'- Une barre de fraction contient des parenthèses invisibles : $\dfrac{70}{8+2}$ se tape $70\div(8+2)$.' '\n' r'- Pour $\pi$, utiliser la touche $\pi$, pas $3{,}14$.' '\n' r'- On arrondit seulement le résultat final.'),
        E(r'Calculer $\dfrac{70}{8+2}+4$.', [
            r'Le dénominateur forme un bloc : $8+2=10$.',
            r'$70\div10=7$.',
            r'$7+4=11$.',
        ]),
        E(r'Donner l’arrondi à l’unité de l’aire d’un disque de rayon $5$ cm.', [
            r'$\mathcal{A}=\pi r^2=\pi\times5^2=25\pi$.',
            r'La calculatrice affiche $78{,}539\ldots$',
            r'$\mathcal{A}\approx79$ cm².',
        ], 'Avec π'),
        E(r'Arrondir $\sqrt{15}$ au centième.', [
            r'La calculatrice affiche $3{,}872\,983\ldots$',
            r'Le chiffre des millièmes est $2$ : $\sqrt{15}\approx3{,}87$.',
        ], 'Une racine'),
        QC(r'Pour calculer $\dfrac{12}{2\times3}$, on tape :', [r'$12\div(2\times3)$', r'$12\div2\times3$', r'$12\times2\div3$'], r'Sans parenthèses, $12\div2\times3$ donne $18$ au lieu de $2$.'),
        QN(r'Que vaut $9+4\times\dfrac{33+3}{2\times3}$ ?', 33, r'$\dfrac{36}{6}=6$, puis $4\times6=24$ et $9+24=33$.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-grandeurs-plan', 'Pythagore, périmètres et aires', 'bx-shape-triangle',
         'Calculer des longueurs avec Pythagore, des périmètres et des aires, et transformer une formule.', [
    C('Calculer un côté', 'Calculer un côté avec le théorème de Pythagore', [
        X('40c47', '10GM1D-2', 3, 'Écrire l’égalité de Pythagore'),
        X('bd660', '10GM1D-3', 3, 'Calculer une longueur avec Pythagore'),
        X('60e9e', '10GM1D-4', 2, 'Calculer un côté d’un triangle rectangle'),
    ], [
        T('Dans un triangle rectangle, les trois côtés sont liés par une égalité. Connaître deux côtés suffit pour calculer le troisième.'),
        R('Théorème de Pythagore', r'Si un triangle $ABC$ est rectangle en $A$, alors' '\n' r'$$BC^2=AB^2+AC^2.$$' '\n' r'$[BC]$, le côté opposé à l’angle droit, est l’**hypoténuse** : c’est le plus long côté.'),
        E(r'$EFG$ est rectangle en $E$, $EF=5$ cm et $EG=8$ cm. Calculer $FG$ au millimètre.', [
            r'L’hypoténuse est $[FG]$ : $FG^2=EF^2+EG^2$.',
            r'$FG^2=25+64=89$.',
            r'$FG=\sqrt{89}\approx9{,}4$ cm.',
        ], 'Calculer l’hypoténuse'),
        E(r'$MNP$ est rectangle en $N$, $NP=6$ dm et $MP=9$ dm. Calculer $MN$.', [
            r'L’hypoténuse est $[MP]$ : $MP^2=MN^2+NP^2$.',
            r'$MN^2=MP^2-NP^2=81-36=45$.',
            r'$MN=\sqrt{45}\approx6{,}7$ dm.',
        ], 'Calculer un autre côté'),
        QC(r'$ABC$ est rectangle en $B$. Quelle égalité est juste ?', [r'$AC^2=AB^2+BC^2$', r'$AB^2=AC^2+BC^2$', r'$BC^2=AB^2+AC^2$'], r'L’angle droit est en $B$ : l’hypoténuse est le côté opposé, $[AC]$.'),
        QN(r'Les côtés de l’angle droit d’un triangle rectangle mesurent $6$ cm et $8$ cm. Combien mesure l’hypoténuse, en cm ?', 10, r'$6^2+8^2=36+64=100$ et $\sqrt{100}=10$.'),
        R('Pièges', r'- Repérer l’hypoténuse avant d’écrire l’égalité : elle est seule de son côté du signe $=$.' '\n' r'- Pour un côté de l’angle droit, on **soustrait** les carrés.' '\n' r'- On arrondit seulement à la fin, après la racine.'),
    ]),
    C('Problèmes avec Pythagore', 'Résoudre un problème avec le théorème de Pythagore', [
        X('b18e8', '10GM1D-5', 3, 'Utiliser Pythagore dans une figure', sup='1'),  # sens direct : la réciproque est en QCM
        X('b18e9', '10GM1D-6', 2, 'Calculer dans un triangle équilatéral'),
    ], [
        T('Beaucoup de figures cachent un triangle rectangle : la diagonale d’un rectangle, la hauteur d’un triangle isocèle ou équilatéral.'),
        R('Méthode', r'- Repérer un triangle rectangle et son angle droit.' '\n' r'- Nommer l’hypoténuse.' '\n' r'- Écrire l’égalité de Pythagore, remplacer, calculer.'),
        E(r'$STUV$ est un rectangle avec $ST=3$ cm et $TU=4$ cm. Calculer $SU$.', [
            r'Le triangle $STU$ est rectangle en $T$.',
            r'$SU^2=ST^2+TU^2=9+16=25$.',
            r'$SU=5$ cm.',
        ], 'Diagonale d’un rectangle'),
        E(r'Calculer la hauteur d’un triangle équilatéral de côté $2$ cm.', [
            r'La hauteur coupe le côté opposé en son milieu : on obtient un triangle rectangle d’hypoténuse $2$ cm et dont un côté mesure $1$ cm.',
            r'$h^2=2^2-1^2=3$.',
            r'$h=\sqrt{3}\approx1{,}73$ cm.',
        ], 'Triangle équilatéral'),
        QC(r'Une échelle de $5$ m est appuyée contre un mur, son pied à $3$ m du mur. À quelle hauteur touche-t-elle le mur ?', [r'$4$ m', r'$\sqrt{34}$ m', r'$2$ m'], r'L’échelle est l’hypoténuse : $h^2=25-9=16$, donc $h=4$ m.'),
        QN(r'Un carré a des côtés de $5$ cm et une diagonale $d$. Que vaut $d^2$ ?', 50, r'Deux côtés et la diagonale forment un triangle rectangle : $d^2=5^2+5^2=50$.'),
    ]),
    C('Rectangle ou non', 'Décider si un triangle est rectangle', [
        X('ab5d4', '11GM1A-1', 3, 'Le triangle est-il rectangle ?'),
        X('5344c', '11GM1A-2', 3, 'Reconnaître un triangle rectangle'),
    ], [
        T('Le théorème de Pythagore part d’un triangle rectangle. Sa réciproque et sa contraposée font le chemin inverse : à partir des longueurs, on décide si le triangle est rectangle.'),
        R('Réciproque', r'Si, dans un triangle, le carré du plus long côté est **égal** à la somme des carrés des deux autres, alors ce triangle est rectangle. L’angle droit est opposé au plus long côté.'),
        R('Contraposée', r'Si le carré du plus long côté n’est **pas égal** à la somme des carrés des deux autres, alors le triangle n’est pas rectangle.'),
        E(r'$HIJ$ : $IJ=6$ cm, $HJ=8$ cm, $HI=10$ cm. Ce triangle est-il rectangle ?', [
            r'Le plus long côté est $[HI]$ : $HI^2=100$.',
            r'Les deux autres : $IJ^2+HJ^2=36+64=100$.',
            r'Les deux résultats sont égaux : d’après la réciproque du théorème de Pythagore, $HIJ$ est rectangle en $J$.',
        ]),
        E(r'$RST$ : $RS=3$ cm, $RT=5$ cm, $ST=6$ cm. Ce triangle est-il rectangle ?', [
            r'Le plus long côté est $[ST]$ : $ST^2=36$.',
            r'$RS^2+RT^2=9+25=34$.',
            r'$36\neq34$ : d’après la contraposée, $RST$ n’est pas rectangle.',
        ], 'Un triangle qui ne l’est pas'),
        QC(r'Un triangle a des côtés de $5$ cm, $12$ cm et $13$ cm. Il est :', ['rectangle', 'pas rectangle', 'impossible à dire sans figure'], r'$13^2=169$ et $5^2+12^2=25+144=169$.'),
        QN(r'Un triangle a des côtés de $7$, $24$ et $25$. Que vaut $7^2+24^2$ ?', 625, r'$49+576=625=25^2$ : le triangle est rectangle.'),
        R('Pièges', r'- Comparer avec le carré du **plus long** côté.' '\n' r'- Calculer les deux membres séparément, puis conclure en nommant la propriété utilisée.'),
    ]),
    C('Convertir longueurs et aires', 'Convertir des longueurs et des aires', [
        X('ab9ff', '9GM1A-4', 3, 'Convertir des longueurs'),
        X('6225c', '9GM1A-6', 3, 'Convertir des aires'),
    ], [
        T('Avant de calculer un périmètre ou une aire, toutes les longueurs doivent être exprimées dans la même unité.'),
        R('Longueurs', r'$$\text{km}\quad\text{hm}\quad\text{dam}\quad\text{m}\quad\text{dm}\quad\text{cm}\quad\text{mm}$$' '\n' r'D’une unité à la suivante, on multiplie ou on divise par $10$.'),
        R('Aires', r'$$\text{km}^2\quad\text{hm}^2\quad\text{dam}^2\quad\text{m}^2\quad\text{dm}^2\quad\text{cm}^2\quad\text{mm}^2$$' '\n' r'D’une unité à la suivante, on multiplie ou on divise par $100$ : un carré de $1$ m de côté contient $10\times10$ carrés de $1$ dm de côté.'),
        E(r'Convertir $87$ m en hm.', [
            r'Du m au hm, on monte de deux unités : on divise par $10\times10=100$.',
            r'$87\div100=0{,}87$ : $87$ m $=0{,}87$ hm.',
        ]),
        E(r'Convertir $3$ hm² en m².', [
            r'Du hm² au m², on descend de deux unités : on multiplie par $100\times100=10\,000$.',
            r'$3$ hm² $=30\,000$ m².',
        ], 'Une aire'),
        QC(r'$1$ m² vaut :', [r'$10\,000$ cm²', r'$100$ cm²', r'$1\,000$ cm²'], r'Du m² au cm², deux unités : $100\times100=10\,000$.'),
        QN(r'Combien de mètres font $2{,}5$ km ?', 2500, r'Trois unités du km au m : on multiplie par $1\,000$.'),
        R('Pièges', r'- Pour les aires, chaque unité compte pour un facteur $100$, pas $10$.' '\n' r'- Vers une unité plus petite, le nombre devient plus grand.'),
    ]),
    C('Périmètres et aires', 'Calculer le périmètre et l’aire d’une figure', [
        X('065d1', '10GM1A-2', 2, 'Périmètre et aire de polygones'),
        X('6999f', '10GM1A-4', 2, 'Figures composées'),
        X('f9a03', '10GM1B-6', 2, 'Périmètre et aire d’un disque'),
        X('ff387', '10GM1C-2', 2, 'Portions de disque'),
    ], [
        T('Le périmètre mesure la longueur du contour, l’aire mesure la surface. Une figure composée se découpe en figures usuelles.'),
        R('Aires usuelles', r'- Rectangle : $L\times\ell$ ; carré : $c^2$' '\n' r'- Triangle : $\dfrac{b\times h}{2}$' '\n' r'- Parallélogramme : $b\times h$' '\n' r'- Losange : $\dfrac{D\times d}{2}$' '\n' r'- Trapèze : $\dfrac{(B+b)\times h}{2}$' '\n' r'- Disque de rayon $r$ : $\pi r^2$'),
        R('Cercle, arc et secteur', r'Le périmètre d’un cercle vaut $2\pi r$. Un arc ou un secteur d’angle $\alpha$ représente la fraction $\dfrac{\alpha}{360}$ du cercle ou du disque.'),
        E(r'Calculer le périmètre et l’aire d’un demi-disque de rayon $4$ cm, au dixième.', [
            r'Aire : $\dfrac{\pi\times4^2}{2}=8\pi\approx25{,}1$ cm².',
            r'Contour : le demi-cercle mesure $\dfrac{2\pi\times4}{2}=4\pi$ cm, et on ajoute le diamètre, $8$ cm.',
            r'Périmètre : $4\pi+8\approx20{,}6$ cm.',
        ]),
        E(r'Un rectangle de $8$ cm sur $5$ cm est surmonté d’un triangle de base $8$ cm et de hauteur $3$ cm. Calculer l’aire de la figure.', [
            r'Rectangle : $8\times5=40$ cm².',
            r'Triangle : $\dfrac{8\times3}{2}=12$ cm².',
            r'Aire totale : $52$ cm².',
        ], 'Une figure composée'),
        QC(r'Un secteur de $90^\circ$ d’un disque de rayon $2$ cm a pour aire :', [r'$\pi$ cm²', r'$4\pi$ cm²', r'$2\pi$ cm²'], r'$90^\circ$ est un quart de tour : $\dfrac14\times\pi\times2^2=\pi$.'),
        QN(r'Quelle est l’aire, en cm², d’un trapèze de bases $6$ cm et $4$ cm et de hauteur $3$ cm ?', 15, r'$\dfrac{(6+4)\times3}{2}=15$.'),
        R('Pièges', r'- Dans le périmètre d’une figure composée, ne pas compter les côtés intérieurs.' '\n' r'- Une aire s’exprime en unités carrées.' '\n' r'- Le diamètre vaut deux fois le rayon.'),
    ]),
    C('Dimension manquante', 'Retrouver une dimension et transformer une formule', [
        X('e94b0', '11GM3-8', 3, 'Isoler une grandeur dans une formule'),
        X('bf029', '9GM1B-17', 3, 'Périmètre d’un rectangle connaissant son aire'),
    ], [
        T('Une formule relie plusieurs grandeurs. Si on les connaît toutes sauf une, on peut retrouver celle qui manque. La formule donnée est parfois celle d’un solide : la méthode ne change pas.'),
        R('Isoler une grandeur', 'On traite la formule comme une équation : on applique la même opération aux deux membres jusqu’à isoler la grandeur cherchée.'),
        E(r'L’aire d’un triangle vaut $\mathcal{A}=\dfrac{b\times h}{2}$. Exprimer $h$ en fonction de $\mathcal{A}$ et de $b$.', [
            r'On multiplie par $2$ : $2\mathcal{A}=b\times h$.',
            r'On divise par $b$ : $h=\dfrac{2\mathcal{A}}{b}$.',
        ]),
        E(r'Exprimer le rayon $r$ d’un disque en fonction de son aire $\mathcal{A}$.', [
            r'$\mathcal{A}=\pi r^2$.',
            r'On divise par $\pi$ : $r^2=\dfrac{\mathcal{A}}{\pi}$.',
            r'$r$ est positif : $r=\sqrt{\dfrac{\mathcal{A}}{\pi}}$.',
        ], 'Avec un carré'),
        E(r'Un triangle a une base de $14$ m et une aire de $42$ m². Calculer sa hauteur.', [
            r'$h=\dfrac{2\mathcal{A}}{b}$.',
            r'$h=\dfrac{2\times42}{14}=6$ m.',
        ], 'Avec des nombres'),
        QC(r'L’aire d’un trapèze vaut $\mathcal{A}=\dfrac{(B+b)h}{2}$. Alors $h$ vaut :', [r'$\dfrac{2\mathcal{A}}{B+b}$', r'$\dfrac{\mathcal{A}}{2(B+b)}$', r'$2\mathcal{A}-(B+b)$'], r'On multiplie par $2$, puis on divise par $B+b$.'),
        QN(r'Un rectangle a une aire de $40$ cm² et une largeur de $5$ cm. Quel est son périmètre, en cm ?', 26, r'La longueur vaut $40\div5=8$ cm, puis le périmètre $2\times(8+5)=26$ cm.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-calcul-litteral', 'Réduire, développer, factoriser', 'bx-font-family',
         'Réduire, développer, factoriser et substituer dans une expression littérale.', [
    C('Réduire une somme', 'Réduire une somme de monômes', [
        X('2f983', '10FA4C-8', 3, 'Additionner des monômes'),
        X('85d2d', '10FA4C-1', 3, 'Réduire une expression'),
    ], [
        T('En calcul littéral, une lettre tient la place d’un nombre. Réduire une expression, c’est l’écrire avec le moins de termes possible.'),
        R('Monôme', r'Un **monôme** est le produit d’un nombre et de lettres, comme $-5x^2y$. Le nombre $-5$ est son **coefficient**, $x^2y$ sa **partie littérale**. Son **degré** est la somme des exposants des lettres : ici $2+1=3$.'),
        R('Monômes semblables', r'Deux monômes sont **semblables** s’ils ont la même partie littérale. On additionne des monômes semblables en additionnant leurs coefficients :' '\n' r'$$7x^2-4x^2=3x^2.$$'),
        E(r'Réduire $A=4z+b+9z+4+4b$.', [
            r'On regroupe les termes semblables : $(4z+9z)+(b+4b)+4$.',
            r'$A=13z+5b+4$.',
        ]),
        E(r'Réduire $B=-7cxy+9xy+6cxy$.', [
            r'$-7cxy$ et $6cxy$ sont semblables : $-7cxy+6cxy=-cxy$.',
            r'$9xy$ n’a pas la même partie littérale : il reste seul.',
            r'$B=-cxy+9xy$.',
        ], 'Plusieurs lettres'),
        QC(r'$3x^2+2x$ est égal à :', [r'$3x^2+2x$ : on ne peut pas réduire', r'$5x^3$', r'$5x^2$'], r'$x^2$ et $x$ n’ont pas la même partie littérale.'),
        QN(r'$5a-8a+a=ka$. Que vaut $k$ ?', -2, r'$5-8+1=-2$ : le coefficient de $a$ est $1$.'),
        R('Pièges', r'- $x$ et $x^2$ ne sont pas semblables.' '\n' r'- $x$ a pour coefficient $1$, et $-x$ a pour coefficient $-1$.'),
    ]),
    C('Multiplier des monômes', 'Multiplier des monômes', [
        X('4623e', '10FA4C-2', 3, 'Somme ou produit'),
        X('62111', '10FA4C-9', 3, 'Multiplier des monômes'),
    ], [
        T('Pour multiplier des monômes, ils n’ont pas besoin d’être semblables : on multiplie les nombres entre eux et les lettres entre elles.'),
        R('Produit de monômes', r'- On multiplie les coefficients, avec la règle des signes.' '\n' r'- Pour une même lettre, on additionne les exposants : $x^2\times x^3=x^5$.'),
        E(r'Calculer $(-4rt^2)\times7rz$.', [
            r'Coefficients : $-4\times7=-28$.',
            r'Lettres : $r\times r=r^2$ ; $t^2$ et $z$ restent.',
            r'$-28r^2t^2z$.',
        ]),
        R('Somme ou produit', r'$6b+3b=9b$, mais $6b\times3b=18b^2$.'),
        QC(r'$2y\times6y$ est égal à :', [r'$12y^2$', r'$8y$', r'$12y$'], r'On multiplie les nombres, $2\times6=12$, et les lettres, $y\times y=y^2$.'),
        QN(r'$(-3tx)\times(-7stx)=k\,st^2x^2$. Que vaut $k$ ?', 21, r'$(-3)\times(-7)=21$ : deux facteurs négatifs donnent un produit positif.'),
        R('Pièges', r'- Dans un produit, on **additionne** les exposants : $x^2\times x^3=x^5$, pas $x^6$.' '\n' r'- Additionner exige des monômes semblables ; multiplier, non.'),
    ]),
    C('Additionner des polynômes', 'Additionner et soustraire des polynômes', [
        X('603a8', '10FA4E-1', 2, 'Supprimer des parenthèses'),
        X('c88ba', '10FA4E-3', 3, 'Additionner et soustraire des polynômes'),
        X('4b495', '10FA4E-4', 2, 'Polynômes à plusieurs lettres'),
    ], [
        T('Un **polynôme** est une somme de monômes. Pour additionner ou soustraire des polynômes, on supprime les parenthèses, puis on réduit.'),
        R('Supprimer des parenthèses', r'- Précédées de « $+$ » : on les supprime sans rien changer.' '\n' r'- Précédées de « $-$ » : on les supprime en changeant le signe de **chaque** terme. On ajoute ainsi l’**opposé** du polynôme.'),
        E(r'Écrire l’opposé de $3x^2-4x+11$.', [
            r'$-(3x^2-4x+11)$.',
            r'On change chaque signe : $-3x^2+4x-11$.',
        ]),
        E(r'Réduire $C=(4b^2+6b-7)-(-9b^2-11b-7)$.', [
            r'$C=4b^2+6b-7+9b^2+11b+7$.',
            r'On regroupe : $(4b^2+9b^2)+(6b+11b)+(-7+7)$.',
            r'$C=13b^2+17b$.',
        ], 'Une soustraction'),
        R('Degré', r'Le **degré** d’un polynôme réduit est le plus grand degré de ses monômes. On l’ordonne en écrivant ses monômes du plus grand degré au plus petit.'),
        QC(r'$-(x-5)$ est égal à :', [r'$-x+5$', r'$-x-5$', r'$x+5$'], r'Le « $-$ » change le signe des deux termes.'),
        QN(r'$(2x+3)-(5x-1)=ax+b$. Que vaut $b$ ?', 4, r'$2x+3-5x+1=-3x+4$.'),
        R('Pièges', r'Après un « $-$ », changer le signe de **tous** les termes de la parenthèse, pas seulement du premier.'),
    ]),
    C('Développer', 'Développer un produit', [
        X('f61d9', '10FA4D-4', 3, 'Simple distributivité'),
        X('67396', '10FA4F-3', 3, 'Double distributivité'),
        X('82313', '10FA4F-5', 2, 'Développer et réduire'),
    ], [
        T('Pour multiplier une expression par une parenthèse, on distribue : chaque terme multiplie chaque terme.'),
        R('Distributivité', r'$$k(a+b)=ka+kb$$' '\n' r'$$(a+b)(c+d)=ac+ad+bc+bd$$'),
        E(r'Développer $9z(2z+1)$.', [
            r'$9z\times2z=18z^2$ et $9z\times1=9z$.',
            r'$9z(2z+1)=18z^2+9z$.',
        ]),
        E(r'Développer et réduire $(-3c-2)(-5c+9)$.', [
            r'$(-3c)\times(-5c)=15c^2$ et $(-3c)\times9=-27c$.',
            r'$(-2)\times(-5c)=10c$ et $(-2)\times9=-18$.',
            r'$15c^2-27c+10c-18=15c^2-17c-18$.',
        ], 'Deux parenthèses'),
        E(r'Développer et réduire $B=5-(x+2)(x-3)$.', [
            r'On développe d’abord le produit : $(x+2)(x-3)=x^2-3x+2x-6=x^2-x-6$.',
            r'On garde les parenthèses : $B=5-(x^2-x-6)$.',
            r'$B=5-x^2+x+6=-x^2+x+11$.',
        ], 'Un « moins » devant'),
        QC(r'$(x+3)(x+4)$ est égal à :', [r'$x^2+7x+12$', r'$x^2+12$', r'$2x+7$'], r'Quatre produits : $x^2+4x+3x+12$.'),
        QN(r'$(2x-1)(3x+5)=6x^2+bx-5$. Que vaut $b$ ?', 7, r'$2x\times5+(-1)\times3x=10x-3x=7x$.'),
        R('Pièges', r'- Deux parenthèses de deux termes donnent quatre produits : n’en oublier aucun.' '\n' r'- Avec un « $-$ » devant un produit, développer d’abord le produit entre parenthèses.'),
    ]),
    C('Identités remarquables', 'Développer avec les identités remarquables', [
        X('04b0a', '11FA4A-4', 3, 'Développer avec une identité'),
        X('7bd4f', '11FA4A-6', 3, 'Identités dans une expression'),
        X('889ef', '11FA4A-8', 2, 'Développer puis réduire'),
    ], [
        T('Trois produits reviennent si souvent qu’on retient leur résultat. On évite ainsi de développer terme à terme.'),
        R('Les trois identités', r'$$(a+b)^2=a^2+2ab+b^2$$' '\n' r'$$(a-b)^2=a^2-2ab+b^2$$' '\n' r'$$(a+b)(a-b)=a^2-b^2$$'),
        E(r'Développer $(4x+8)^2$.', [
            r'$a=4x$ et $b=8$.',
            r'$a^2=16x^2$, $2ab=2\times4x\times8=64x$, $b^2=64$.',
            r'$(4x+8)^2=16x^2+64x+64$.',
        ]),
        E(r'Développer $(9x-5)(9x+5)$.', [
            r'C’est $(a-b)(a+b)$ avec $a=9x$ et $b=5$.',
            r'$(9x-5)(9x+5)=81x^2-25$.',
        ], 'Somme fois différence'),
        E(r'Développer et réduire $8-(4+9x)^2$.', [
            r'$(4+9x)^2=16+72x+81x^2$.',
            r'$8-(16+72x+81x^2)=8-16-72x-81x^2$.',
            r'$-81x^2-72x-8$.',
        ], 'Dans une expression'),
        QC(r'$(x-3)^2$ est égal à :', [r'$x^2-6x+9$', r'$x^2-9$', r'$x^2+9$'], r'Les autres réponses oublient le double produit $2\times x\times3=6x$.'),
        QN(r'$(5x+2)^2=25x^2+bx+4$. Que vaut $b$ ?', 20, r'$2\times5x\times2=20x$.'),
        R('Pièges', r'- $(a+b)^2\neq a^2+b^2$ : ne pas oublier $2ab$.' '\n' r'- $(3x)^2=9x^2$, pas $3x^2$.'),
    ]),
    C('Traduire', 'Traduire une phrase par une expression et inversement', [
        X('8b18b', '10FA5A-3', 2, 'Écrire une expression littérale'),
        X('fefa0', '10FA4A-2', 3, 'Traduire une phrase par une expression'),
        X('458ae', '10FA4A-8', 2, 'Traduire une expression par une phrase'),
    ], [
        T('Une expression littérale se lit comme une phrase. Son nom vient de la dernière opération effectuée.'),
        R('Vocabulaire', r'- **Somme** : résultat d’une addition ; ses éléments sont des **termes**.' '\n' r'- **Différence** : résultat d’une soustraction.' '\n' r'- **Produit** : résultat d’une multiplication ; ses éléments sont des **facteurs**.' '\n' r'- **Quotient** : résultat d’une division.' '\n' r'- Le double, le triple : $2x$, $3x$ ; le carré : $x^2$ ; l’inverse : $\dfrac1x$ ; l’opposé : $-x$.' '\n' r'- Pour un entier $n$ : $2n$ est un nombre pair, $2n+1$ un nombre impair.'),
        E(r'Traduire : le quotient de $30$ par la somme de $x$ et $5$.', [
            r'La dernière opération est une division : $30\div(\ldots)$.',
            r'Le diviseur est la somme $x+5$.',
            r'$\dfrac{30}{x+5}$.',
        ]),
        E(r'Lire $(73-y)\div(3+x)$.', [
            r'La dernière opération est la division.',
            r'Le dividende est une différence, le diviseur une somme.',
            r'Le quotient de la différence de $73$ et $y$ par la somme de $3$ et $x$.',
        ], 'Lire une expression'),
        QC(r'Le double de la somme de $x$ et $3$ s’écrit :', [r'$2(x+3)$', r'$2x+3$', r'$x+3^2$'], r'On calcule d’abord la somme, puis on la double : les parenthèses sont nécessaires.'),
        QC(r'$3x^2$ est :', [r'le triple du carré de $x$', r'le carré du triple de $x$', r'le carré de $x$, plus $3$'], r'Le carré porte seulement sur $x$. Le carré du triple serait $(3x)^2$.'),
    ]),
    C('Substituer', 'Substituer un nombre à une lettre', [
        X('17e39', '10FA4B-2', 3, 'Calculer une expression pour des valeurs'),
        X('1abc6', '10FA4B-4', 3, 'Calculer une expression plus complexe'),
    ], [
        T('Substituer, c’est remplacer chaque lettre par un nombre donné, puis calculer en respectant les priorités.'),
        R('Méthode', r'- Réécrire l’expression avec la valeur à la place de la lettre, entre parenthèses si elle est négative.' '\n' r'- Rétablir les signes $\times$ sous-entendus : $3x$ devient $3\times x$.' '\n' r'- Calculer avec les priorités.'),
        E(r'Calculer $2x^2-2x+3$ pour $x=6$.', [
            r'$2\times6^2-2\times6+3$.',
            r'La puissance d’abord : $6^2=36$.',
            r'$72-12+3=63$.',
        ]),
        E(r'Calculer $x^2-3x$ pour $x=-2$.', [
            r'$(-2)^2-3\times(-2)$.',
            r'$4+6=10$.',
        ], 'Une valeur négative'),
        QC(r'Pour $x=-3$, $-x^2$ vaut :', [r'$-9$', r'$9$', r'$6$'], r'$-x^2=-(x^2)=-\big((-3)^2\big)=-9$.'),
        QN(r'Calculer $(9-y)(3+7x)$ pour $x=3$ et $y=7$.', 48, r'$(9-7)\times(3+21)=2\times24=48$.'),
        R('Pièges', r'- Pour $x=5$, $3x$ vaut $15$, pas $35$.' '\n' r'- Une valeur négative se met entre parenthèses avant d’être élevée au carré.'),
    ]),
    C('Factoriser', 'Factoriser une expression', [
        X('5f5a6', '11FA4B-1', 3, 'Mettre en évidence'),
        X('51360', '11FA4B-3', 2, 'Facteur commun entre parenthèses'),
        X('0bd00', '11FA4C-2', 3, 'Factoriser avec une identité'),
        X('c4b73', '11FA4C-5', 2, 'Mise en évidence ou identité'),
    ], [
        T('Factoriser, c’est transformer une somme en produit : le chemin inverse du développement. C’est l’outil qui permet de résoudre les équations produit nul.'),
        R('Mise en évidence', r'Si chaque terme contient un même facteur $k$ :' '\n' r'$$ka+kb=k(a+b).$$' '\n' r'On met en évidence le plus grand facteur commun, nombre et lettres.'),
        E(r'Factoriser $-12b-21b^2$.', [
            r'Facteur commun : $-3b$.',
            r'$-12b=-3b\times4$ et $-21b^2=-3b\times7b$.',
            r'$-12b-21b^2=-3b(4+7b)$.',
        ]),
        E(r'Factoriser $x(x+1)+3(x+1)$.', [
            r'Le facteur commun est la parenthèse $(x+1)$.',
            r'$x(x+1)+3(x+1)=(x+1)(x+3)$.',
        ], 'Une parenthèse commune'),
        R('Avec les identités', r'On lit les identités de droite à gauche :' '\n' r'$$a^2+2ab+b^2=(a+b)^2$$' '\n' r'$$a^2-2ab+b^2=(a-b)^2$$' '\n' r'$$a^2-b^2=(a+b)(a-b)$$'),
        E(r'Factoriser $x^2-18x+81$.', [
            r'$x^2=a^2$ avec $a=x$, et $81=b^2$ avec $b=9$.',
            r'Le double produit $2\times x\times9=18x$ est précédé d’un « $-$ ».',
            r'$x^2-18x+81=(x-9)^2$.',
        ], 'Avec une identité'),
        QC(r'$x^2-81$ se factorise en :', [r'$(x-9)(x+9)$', r'$(x-9)^2$', r'$(x-81)(x+1)$'], r'C’est une différence de deux carrés : $x^2-9^2$.'),
        QN(r'$6tx^2+16x=2x(3tx+k)$. Que vaut $k$ ?', 8, r'$2x\times8=16x$.'),
        R('Pièges', r'- Contrôler en redéveloppant le résultat.' '\n' r'- $x^2+81$ ne se factorise pas avec les identités : c’est une somme de carrés.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-equations', 'Résoudre des équations', 'bx-math',
         'Résoudre des équations du premier et du deuxième degré, et mettre un problème en équation.', [
    C('Tester une solution', 'Tester si un nombre est solution d’une équation', [
        X('d8841', '10FA5B-3', 2, 'Tester une égalité'),
        X('12d4b', '10FA5C-1', 4, 'Résoudre une équation simple'),
    ], [
        T('Une équation est une égalité qui contient une inconnue. La résoudre, c’est trouver toutes les valeurs de l’inconnue qui rendent l’égalité vraie : ses **solutions**.'),
        R('Tester un nombre', 'On remplace l’inconnue par le nombre dans chaque membre et on calcule chaque membre séparément. Le nombre est solution si les deux résultats sont égaux.'),
        E(r'$4$ est-il solution de $3x-3=2x+6$ ?', [
            r'Membre de gauche : $3\times4-3=9$.',
            r'Membre de droite : $2\times4+6=14$.',
            r'$9\neq14$ : $4$ n’est pas solution.',
        ]),
        R('Règles d’équivalence', r'On obtient une équation qui a les mêmes solutions en :' '\n' r'- ajoutant ou en soustrayant un même nombre aux deux membres ;' '\n' r'- multipliant ou en divisant les deux membres par un même nombre **non nul**.'),
        E(r'Résoudre $3x-5=-4x+58$.', [
            r'On ajoute $4x$ : $7x-5=58$.',
            r'On ajoute $5$ : $7x=63$.',
            r'On divise par $7$ : $x=9$.',
        ], 'Résoudre'),
        QC(r'Quel nombre est solution de $2x+1=x+4$ ?', [r'$3$', r'$5$', r'$-3$'], r'$2\times3+1=7$ et $3+4=7$.'),
        QN(r'Résoudre $-3x+21=0$.', 7, r'$-3x=-21$, donc $x=7$.'),
    ]),
    C('Équations du premier degré', 'Résoudre une équation du premier degré', [
        X('23bdc', '10FA5C-2', 3, 'Résoudre une équation'),
        X('b9e01', '10FA5C-7', 3, 'Résoudre avec la distributivité'),
        X('45156', '10FA5C-5', 2, 'Résoudre avec des fractions'),
    ], [
        T(r'Une équation du premier degré se ramène toujours à la forme $ax=b$ : on range les termes en $x$ d’un côté, les nombres de l’autre.'),
        R('Méthode', r'- Développer et réduire chaque membre.' '\n' r'- Rassembler les termes en $x$ dans un membre, les nombres dans l’autre.' '\n' r'- Diviser par le coefficient de $x$.' '\n' r'- Contrôler en remplaçant.'),
        E(r'Résoudre $5(x-2)=3x+4$.', [
            r'On développe : $5x-10=3x+4$.',
            r'On soustrait $3x$ : $2x-10=4$.',
            r'On ajoute $10$ : $2x=14$, donc $x=7$.',
            r'Contrôle : $5\times5=25$ et $21+4=25$.',
        ]),
        E(r'Résoudre $\dfrac{x+1}{3}=\dfrac{x}{2}$.', [
            r'On multiplie les deux membres par $6$, multiple commun de $3$ et de $2$ : $2(x+1)=3x$.',
            r'$2x+2=3x$.',
            r'$x=2$.',
        ], 'Avec des fractions'),
        QC(r'Pour résoudre $-4x=12$, on :', [r'divise les deux membres par $-4$', r'ajoute $4$ aux deux membres', r'divise les deux membres par $4$'], r'$-4$ multiplie $x$ : on divise par $-4$ et on obtient $x=-3$.'),
        QN(r'Résoudre $2(x+3)=x-1$.', -7, r'$2x+6=x-1$, donc $x=-7$.'),
        R('Pièges', r'- Un terme qui « change de membre » change de signe : on l’a en fait soustrait (ou ajouté) des deux côtés.' '\n' r'- Diviser par le coefficient avec son signe.'),
    ]),
    C('Mettre en équation', 'Résoudre un problème avec une équation', [
        X('2be1d', '10FA5D-9', 2, 'Retrouver le nombre de départ'),
        X('22412', '10FA5D-2', 2, 'Mettre un problème en équation', sup='1-2-3-4-5-6-7-8-9-12-13'),  # sans Thalès (10, 11)
        X('08752', '10FA5D-4', 2, 'Résoudre un problème'),
        X('75a84', '10FA5D-1', 1, 'Résoudre un problème de périmètre'),
    ], [
        T('Une équation résout un problème quand on peut exprimer deux fois la même quantité.'),
        R('Méthode', r'- Choisir l’inconnue et écrire ce qu’elle représente.' '\n' r'- Exprimer les autres quantités en fonction de l’inconnue.' '\n' r'- Écrire l’équation et la résoudre.' '\n' r'- Vérifier dans l’énoncé et répondre par une phrase.'),
        E(r'Je choisis un nombre, j’ajoute $2$, puis je multiplie par $4$ ; j’obtiens $32$. Quel est le nombre de départ ?', [
            r'Soit $x$ le nombre de départ : $4(x+2)=32$.',
            r'$x+2=8$.',
            r'$x=6$. Contrôle : $(6+2)\times4=32$.',
        ]),
        E(r'Un triangle isocèle a un périmètre de $265$ mm. Sa base est plus courte de $14$ mm que chacun des côtés égaux. Combien mesurent les côtés égaux ?', [
            r'Soit $x$ la longueur d’un côté égal : la base mesure $x-14$.',
            r'$x+x+(x-14)=265$, donc $3x-14=265$.',
            r'$3x=279$ et $x=93$ mm.',
        ], 'Un périmètre'),
        QC(r'La somme de deux entiers consécutifs vaut $41$. Quelle équation convient ?', [r'$x+(x+1)=41$', r'$x+x=41$', r'$x\times(x+1)=41$'], r'Deux entiers consécutifs s’écrivent $x$ et $x+1$.'),
        QN(r'La somme de trois entiers consécutifs vaut $57$. Quel est le plus petit ?', 18, r'$x+(x+1)+(x+2)=57$, donc $3x=54$ et $x=18$.'),
    ]),
    C('Produit nul', 'Résoudre une équation produit nul', [
        X('57f44', '11FA5B-5', 2, 'Résoudre x² = a'),
        X('ecf62', '11FA5B-2', 3, 'Résoudre une équation produit nul'),
        X('93432', '11FA5B-9', 2, 'Factoriser puis résoudre'),
    ], [
        T('Une équation du deuxième degré peut avoir deux solutions. On la résout souvent en la ramenant à un produit égal à zéro.'),
        R('Équation produit nul', r'Un produit est nul si et seulement si l’un de ses facteurs est nul :' '\n' r'$$A\times B=0\iff A=0\ \text{ou}\ B=0.$$'),
        E(r'Résoudre $(x-11)(8x+48)=0$.', [
            r'$x-11=0$ ou $8x+48=0$.',
            r'$x=11$ ou $x=-6$.',
            r'$S=\{-6;11\}$.',
        ]),
        R('Équation $x^2=a$', r'- Si $a>0$ : deux solutions, $\sqrt{a}$ et $-\sqrt{a}$.' '\n' r'- Si $a=0$ : une solution, $0$.' '\n' r'- Si $a<0$ : aucune solution.'),
        E(r'Résoudre $(7x-5)^2+(7x-5)(3x-6)=0$.', [
            r'Facteur commun $(7x-5)$ : $(7x-5)\big[(7x-5)+(3x-6)\big]=0$.',
            r'$(7x-5)(10x-11)=0$.',
            r'$x=\dfrac57$ ou $x=\dfrac{11}{10}$.',
        ], 'Factoriser d’abord'),
        QC(r'Les solutions de $x^2=121$ sont :', [r'$-11$ et $11$', r'$11$ seulement', r'$60{,}5$'], r'$11^2=121$ et $(-11)^2=121$.'),
        QN(r'$(x+4)(2x-6)=0$. Quelle est la solution positive ?', 3, r'$2x-6=0$ donne $x=3$ ; l’autre solution est $-4$.'),
        R('Pièges', r'- La propriété exige un produit égal à **zéro** : $(x-1)(x+2)=5$ ne se résout pas ainsi.' '\n' r'- Ne pas diviser par une expression qui contient $x$ : on perdrait une solution.'),
    ]),
    C('Formule de Viète', 'Résoudre une équation du deuxième degré avec la formule', [
        X('feb39', '11FA5B-11', 3, 'Calculer le discriminant'),
        X('cf78f', '11FA5B-13', 3, 'Résoudre une équation du deuxième degré'),
    ], [
        T(r'Quand aucune factorisation n’apparaît, une formule donne directement les solutions de toute équation $ax^2+bx+c=0$.'),
        R('Discriminant', r'Pour $ax^2+bx+c=0$ avec $a\neq0$, on calcule le **discriminant**' '\n' r'$$\Delta=b^2-4ac.$$'),
        R('Solutions', r'- $\Delta>0$ : deux solutions, $x=\dfrac{-b-\sqrt{\Delta}}{2a}$ et $x=\dfrac{-b+\sqrt{\Delta}}{2a}$.' '\n' r'- $\Delta=0$ : une solution, $x=\dfrac{-b}{2a}$.' '\n' r'- $\Delta<0$ : aucune solution.'),
        E(r'Résoudre $-x^2+5x-6=0$.', [
            r'$a=-1$, $b=5$, $c=-6$.',
            r'$\Delta=25-4\times(-1)\times(-6)=25-24=1$.',
            r'$x=\dfrac{-5-1}{-2}=3$ et $x=\dfrac{-5+1}{-2}=2$.',
            r'$S=\{2;3\}$.',
        ]),
        E(r'Résoudre $2x^2+8x+8=0$.', [
            r'$\Delta=64-4\times2\times8=0$.',
            r'Une seule solution : $x=\dfrac{-8}{4}=-2$.',
        ], 'Une seule solution'),
        QC(r'Combien de solutions a $x^2+x+1=0$ ?', ['aucune', 'une', 'deux'], r'$\Delta=1-4=-3<0$.'),
        QN(r'Calculer le discriminant de $3x^2-4x+1=0$.', 4, r'$\Delta=(-4)^2-4\times3\times1=16-12=4$.'),
        R('Pièges', r'- $b^2$ est toujours positif : $(-4)^2=16$.' '\n' r'- Écrire d’abord l’équation sous la forme $\ldots=0$, puis lire $a$, $b$ et $c$ avec leur signe.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-solides', 'Aires et volumes des solides', 'bx-cube',
         'Reconnaître les solides, calculer leurs aires et leurs volumes, retrouver une dimension.', [
    C('Reconnaître un solide', 'Reconnaître et décrire un solide', [
        X('051aa', '10ES2A-1', 3, 'Reconnaître un solide'),
        X('95371', '10ES2A-7', 3, 'Nommer un solide d’après ses propriétés'),
        X('da6a4', '9ES2A-1', 3, 'Compter faces et arêtes'),
    ], [
        T('Un solide se reconnaît à ses faces. Les polyèdres n’ont que des faces planes ; le cylindre, le cône et la boule ont une surface courbe.'),
        R('Vocabulaire', r'Dans un **polyèdre**, les **faces** sont des polygones. Deux faces se rencontrent sur une **arête**, et les arêtes se rencontrent en un **sommet**.'),
        R('Les solides', r'- **Pavé droit** : six faces rectangulaires ; le **cube** a six faces carrées.' '\n' r'- **Prisme droit** : deux bases polygonales identiques et parallèles, faces latérales rectangulaires.' '\n' r'- **Pyramide** : une base polygonale et des faces latérales triangulaires qui se rejoignent au sommet.' '\n' r'- **Cylindre** : deux disques parallèles reliés par une surface courbe.' '\n' r'- **Cône** : un disque et un sommet reliés par une surface courbe.' '\n' r'- **Boule** : les points à une distance au plus $r$ du centre ; sa surface est la **sphère**.'),
        E('Compter les faces, les arêtes et les sommets d’un prisme droit à base triangulaire.', [
            r'Faces : $2$ bases et $3$ faces latérales, soit $5$.',
            r'Arêtes : $3$ sur chaque base et $3$ latérales, soit $9$.',
            r'Sommets : $3$ sur chaque base, soit $6$.',
        ]),
        QC('J’ai une face de plus que le nombre de côtés de ma base. Je suis :', ['une pyramide', 'un prisme droit', 'un cylindre'], r'Une pyramide dont la base a $n$ côtés a $n$ faces latérales, plus sa base.'),
        QN('Combien d’arêtes a une pyramide à base carrée ?', 8, r'$4$ arêtes pour la base et $4$ qui montent au sommet.'),
    ]),
    C('Patrons', 'Reconnaître et compléter un patron', [
        X('f57fe', '9ES2B-1', 2, 'Choisir le patron d’un cube'),
        X('75a8c', '10ES2A-6', 2, 'Reporter les longueurs d’un patron de pavé'),
        X('bc788', '10ES2A-4', 2, 'Longueurs d’un patron de cylindre'),
    ], [
        T('Un patron est le solide déplié à plat, d’un seul morceau. En le repliant, chaque arête se recolle à une arête de même longueur.'),
        R('Patrons à connaître', r'- Cube : six carrés ; deux faces opposées ne sont jamais côte à côte.' '\n' r'- Pavé droit : trois paires de rectangles identiques.' '\n' r'- Cylindre : deux disques et un rectangle dont une dimension est la hauteur et l’autre le périmètre $2\pi r$ de la base.'),
        E(r'Un pavé droit mesure $7$ cm, $2$ cm et $3$ cm. Quelles faces trouve-t-on dans son patron ?', [
            r'Deux rectangles de $7$ cm sur $2$ cm.',
            r'Deux rectangles de $7$ cm sur $3$ cm.',
            r'Deux rectangles de $2$ cm sur $3$ cm.',
        ]),
        E(r'Un cylindre a un rayon de $3$ cm et une hauteur de $5$ cm. Donner les dimensions du rectangle de son patron.', [
            r'Une dimension est la hauteur : $5$ cm.',
            r'L’autre fait le tour de la base : $2\pi\times3=6\pi\approx18{,}8$ cm.',
        ], 'Cylindre'),
        QC(r'Le rectangle du patron d’un cylindre de rayon $2$ cm a pour longueur :', [r'$4\pi$ cm', r'$2\pi$ cm', r'$4$ cm'], r'Il fait le tour de la base : $2\pi r=4\pi$ cm.'),
        QN('Combien de faces compte le patron d’un cube ?', 6, 'Un cube a six faces, toutes présentes dans le patron.'),
    ]),
    C('Aire d’un solide', 'Calculer l’aire d’un solide', [
        X('5c1e7', '11GM2-4', 4, 'Calculer l’aire d’un solide'),
    ], [
        T('L’aire d’un solide est l’aire de son patron : la surface à recouvrir, sans remplir le solide.'),
        R('Aire latérale, aire totale', r'- **Aire latérale** : somme des aires des faces latérales.' '\n' r'- **Aire totale** : aire latérale plus l’aire des bases.'),
        R('Formules', r'- Prisme droit : $\mathcal{A}_\text{lat}=\text{périmètre de la base}\times h$.' '\n' r'- Cylindre : $\mathcal{A}_\text{lat}=2\pi rh$.' '\n' r'- Pyramide régulière : somme des aires des triangles latéraux.' '\n' r'- Sphère : $\mathcal{A}=4\pi r^2$.'),
        E(r'Une pyramide régulière a pour base un carré de côté $12$ cm. Chaque face latérale est un triangle de hauteur $10$ cm. Calculer son aire totale.', [
            r'Une face latérale : $\dfrac{12\times10}{2}=60$ cm².',
            r'Les quatre faces : $240$ cm².',
            r'La base : $12^2=144$ cm².',
            r'Aire totale : $384$ cm².',
        ]),
        E(r'Calculer l’aire totale d’un cylindre de rayon $3$ cm et de hauteur $5$ cm.', [
            r'Aire latérale : $2\pi\times3\times5=30\pi$.',
            r'Les deux disques : $2\times\pi\times3^2=18\pi$.',
            r'Aire totale : $48\pi\approx150{,}8$ cm².',
        ], 'Cylindre'),
        QC(r'Un prisme droit de hauteur $10$ cm a pour base un triangle de côtés $3$, $4$ et $5$ cm. Son aire latérale vaut :', [r'$120$ cm²', r'$60$ cm²', r'$132$ cm²'], r'Périmètre de la base, $12$ cm, fois la hauteur, $10$ cm. $132$ cm² ajoute les deux bases : c’est l’aire totale.'),
        QN(r'L’aire d’une sphère de rayon $5$ cm vaut $k\pi$ cm². Que vaut $k$ ?', 100, r'$4\pi\times5^2=100\pi$.'),
    ]),
    C('Unités de volume', 'Convertir des volumes et des capacités', [
        X('33ac2', '10GM3A-1', 3, 'Convertir des volumes'),
        X('f4d29', '10GM3A-2', 3, 'Convertir des volumes en capacités'),
    ], [
        T(r'Un volume se mesure en unités cubes ; une capacité, souvent en litres. Les deux sont reliés : $1$ dm³ $=1$ L.'),
        R('Volumes', r'$$\text{km}^3\quad\text{hm}^3\quad\text{dam}^3\quad\text{m}^3\quad\text{dm}^3\quad\text{cm}^3\quad\text{mm}^3$$' '\n' r'D’une unité à la suivante, on multiplie ou on divise par $1\,000$.'),
        R('Capacités', r'$1$ dm³ $=1$ L et $1$ cm³ $=1$ mL. Les unités de capacité vont de $10$ en $10$ : hL, daL, L, dL, cL, mL.'),
        E(r'Convertir $48$ dam³ en m³.', [
            r'Du dam³ au m³, on descend d’une unité : on multiplie par $1\,000$.',
            r'$48$ dam³ $=48\,000$ m³.',
        ]),
        E(r'Convertir $14$ cm³ en L.', [
            r'$14$ cm³ $=14$ mL.',
            r'$1$ L $=1\,000$ mL, donc $14$ mL $=0{,}014$ L.',
        ], 'Vers les litres'),
        QC(r'$1$ m³ vaut :', [r'$1\,000$ L', r'$100$ L', r'$10$ L'], r'$1$ m³ $=1\,000$ dm³ $=1\,000$ L.'),
        QN('Combien de cm³ font $2{,}5$ dm³ ?', 2500, r'Facteur $1\,000$ entre dm³ et cm³.'),
    ]),
    C('Volumes des solides', 'Calculer le volume d’un solide usuel', [
        X('6ec4a', '10GM2A-3', 2, 'Volume d’un prisme droit'),
        X('c7b58', '10GM2B-3', 2, 'Volume d’un cylindre'),
        X('f0128', '11GM2A-2', 2, 'Volume d’une pyramide'),
        X('4a061', '11GM2B-3', 2, 'Volume d’un cône'),
        X('c2f91', '11GM2C-2', 2, 'Volume d’une boule'),
    ], [
        T('Deux familles de formules suffisent : les solides « droits » (prisme, cylindre), et les solides à sommet (pyramide, cône), qui valent le tiers des premiers. La boule a sa propre formule.'),
        R('Formules', r'- Prisme droit, cylindre : $V=\mathcal{A}_\text{base}\times h$ ; pour le cylindre, $V=\pi r^2h$.' '\n' r'- Pyramide, cône : $V=\dfrac{\mathcal{A}_\text{base}\times h}{3}$ ; pour le cône, $V=\dfrac{\pi r^2h}{3}$.' '\n' r'- Boule : $V=\dfrac43\pi r^3$.'),
        E(r'Calculer le volume d’une pyramide de hauteur $3$ cm dont la base est un rectangle de $10$ cm sur $16$ cm.', [
            r'Base : $10\times16=160$ cm².',
            r'$V=\dfrac{160\times3}{3}=160$ cm³.',
        ]),
        E(r'Calculer le volume exact d’un cône de diamètre $6$ cm et de hauteur $4$ cm.', [
            r'Le rayon vaut $3$ cm : la base mesure $\pi\times3^2=9\pi$ cm².',
            r'$V=\dfrac{9\pi\times4}{3}=12\pi$ cm³, environ $37{,}7$ cm³.',
        ], 'Cône'),
        E(r'Calculer le volume exact d’une boule de rayon $3$ cm.', [
            r'$V=\dfrac43\pi\times3^3=\dfrac43\pi\times27$.',
            r'$V=36\pi$ cm³.',
        ], 'Boule'),
        QC('Un cylindre et un cône ont la même base et la même hauteur. Le volume du cône est :', ['le tiers de celui du cylindre', 'la moitié', 'le même'], r'Un solide à sommet vaut le tiers du solide droit de même base et de même hauteur.'),
        QN(r'Volume, en cm³, d’un prisme droit de hauteur $5$ cm dont la base a une aire de $42$ cm² ?', 210, r'$42\times5=210$.'),
        R('Pièges', r'- Le rayon est la moitié du diamètre.' '\n' r'- Toutes les longueurs dans la même unité avant de calculer ; le volume est en unités cubes.'),
    ]),
    C('Solides composés', 'Calculer le volume d’un solide composé', [
        X('8473d', '11GM2-3', 3, 'Volume d’un solide composé'),
        X('b72f3', '11GM2-5', 2, 'Problème de solides en plusieurs étapes'),
    ], [
        T('Un objet réel est souvent un assemblage : une maison est un pavé surmonté d’une pyramide, un tube est un cylindre percé. On le découpe en solides connus.'),
        R('Méthode', r'- Repérer les solides qui composent l’objet.' '\n' r'- Calculer le volume de chacun avec ses propres dimensions.' '\n' r'- **Ajouter** les volumes assemblés, **soustraire** ceux qui sont retirés (trou, creux).'),
        E(r'Une maison miniature est un pavé à base carrée de côté $4$ cm et de hauteur $7$ cm, surmonté d’une pyramide de même base et de hauteur $3$ cm. Calculer son volume.', [
            r'Pavé : $4\times4\times7=112$ cm³.',
            r'Pyramide : $\dfrac{16\times3}{3}=16$ cm³.',
            r'Volume total : $128$ cm³.',
        ]),
        E(r'Un pavé de $13$ cm sur $11$ cm sur $4$ cm est percé de haut en bas par un trou cylindrique de rayon $2$ cm. Calculer son volume au cm³.', [
            r'Pavé : $13\times11\times4=572$ cm³.',
            r'Trou : $\pi\times2^2\times4=16\pi\approx50{,}3$ cm³.',
            r'$572-16\pi\approx522$ cm³.',
        ], 'Un solide percé'),
        QC(r'Une boule de rayon $r$ est posée dans un cylindre de rayon $r$ et de hauteur $2r$. Le volume restant vaut :', [r'$\dfrac23\pi r^3$', r'$\dfrac43\pi r^3$', r'$2\pi r^3$'], r'Cylindre : $\pi r^2\times2r=2\pi r^3$ ; boule : $\dfrac43\pi r^3$ ; la différence vaut $\dfrac23\pi r^3$.'),
        QN(r'Un cube de $10$ cm de côté est traversé de part en part par un trou en forme de pavé de $2$ cm sur $3$ cm. Quel volume reste-t-il, en cm³ ?', 940, r'$1\,000-2\times3\times10=940$.'),
    ]),
    C('Retrouver une dimension', 'Retrouver une dimension d’un solide', [
        X('3b8d4', '11GM3-9', 3, 'Calculer une grandeur manquante'),
        X('e94b0', '11GM3-8', 3, 'Isoler une grandeur dans une formule'),
    ], [
        T('Si on connaît le volume d’un solide et toutes ses dimensions sauf une, la formule du volume devient une équation.'),
        R('Méthode', r'- Écrire la formule du volume.' '\n' r'- Isoler la dimension cherchée, comme dans une équation.' '\n' r'- Remplacer par les valeurs et calculer.'),
        E(r'Exprimer $h$ en fonction de $V$ et de $r$ dans $V=\pi r^2h$.', [
            r'On divise les deux membres par $\pi r^2$.',
            r'$h=\dfrac{V}{\pi r^2}$.',
        ]),
        E(r'Un bidon cylindrique a un rayon de $3$ cm et un volume de $27\pi$ cm³. Calculer sa hauteur.', [
            r'$h=\dfrac{V}{\pi r^2}=\dfrac{27\pi}{9\pi}$.',
            r'$h=3$ cm.',
        ], 'Avec des valeurs'),
        E(r'Une pyramide a un volume de $96$ cm³ et une base de $36$ cm². Calculer sa hauteur.', [
            r'$V=\dfrac{B\times h}{3}$, donc $h=\dfrac{3V}{B}$.',
            r'$h=\dfrac{288}{36}=8$ cm.',
        ], 'Pyramide'),
        QC(r'Dans $V=\dfrac{B\times h}{3}$, l’aire de la base $B$ vaut :', [r'$\dfrac{3V}{h}$', r'$\dfrac{V}{3h}$', r'$3Vh$'], r'On multiplie par $3$, puis on divise par $h$.'),
        QN(r'Un pavé droit a un volume de $120$ cm³, une longueur de $6$ cm et une largeur de $5$ cm. Quelle est sa hauteur, en cm ?', 4, r'$6\times5=30$ et $120\div30=4$.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-fonctions', 'Étudier des fonctions', 'bx-line-chart',
         'Calculer et lire des images et des préimages, étudier les fonctions affines et résoudre des problèmes.', [
    C('Image et préimage', 'Calculer une image ou une préimage', [
        X('ba522', '10FA1B-4', 3, 'Calculer une image'),
        X('2aed8', '10FA1B-9', 3, 'Image par une expression'),
        X('397d2', '11FA1A-13', 2, 'Images et préimages'),
    ], [
        T(r'Une fonction associe à chaque nombre $x$ un seul nombre, son image $f(x)$. Son expression algébrique dit comment la calculer.'),
        R('Vocabulaire', r'Si $f(x)=y$ :' '\n' r'- $y$ est l’**image** de $x$ par $f$ ;' '\n' r'- $x$ est une **préimage** de $y$.' '\n\n' r'Un nombre a une seule image, mais peut avoir aucune, une ou plusieurs préimages.'),
        E(r'$f(x)=-2x-9$. Calculer l’image de $\dfrac12$.', [
            r'$f\left(\dfrac12\right)=-2\times\dfrac12-9$.',
            r'$=-1-9=-10$.',
        ]),
        E(r'$g(x)=3x+2$. Trouver la préimage de $29$.', [
            r'On résout $3x+2=29$.',
            r'$3x=27$, donc $x=9$.',
        ], 'Trouver une préimage'),
        E(r'$h(x)=(-3x-4)^2$. Calculer $h(-1)$.', [
            r'Dans la parenthèse : $-3\times(-1)-4=3-4=-1$.',
            r'$(-1)^2=1$, donc $h(-1)=1$.',
        ], 'Avec un carré'),
        QC(r'$f(x)=x^2$. Les préimages de $9$ sont :', [r'$-3$ et $3$', r'$81$', r'$3$ seulement'], r'$3^2=9$ et $(-3)^2=9$.'),
        QN(r'$f(x)=\dfrac{4}{x+2}+7$. Calculer $f(-3)$.', 3, r'$\dfrac{4}{-1}+7=-4+7=3$.'),
        R('Pièges', r'- Image : on calcule $f(x)$. Préimage : on résout $f(x)=y$.' '\n' r'- Remplacer $x$ par une valeur négative entre parenthèses.'),
    ]),
    C('Tableau de valeurs', 'Compléter et lire un tableau de valeurs', [
        X('bfb2f', '11FA1A-2', 3, 'Compléter un tableau de valeurs'),
        X('b92de', '10FA1B-2', 3, 'Lire un tableau de valeurs'),
    ], [
        T(r'Un tableau de valeurs range des nombres $x$ et leurs images. On le remplit avec l’expression, ou on le lit pour trouver des images et des préimages.'),
        R('Lire un tableau', r'Dans la ligne des $x$, on cherche le nombre de départ ; son image est juste en dessous. Pour une préimage, on part de la ligne des $f(x)$ et on remonte, en relevant **toutes** les colonnes qui conviennent.'),
        E(r'Compléter le tableau de $f(x)=7x$ pour $x=-3$, $6$ et $9$.', [
            r'$f(-3)=-21$.',
            r'$f(6)=42$.',
            r'$f(9)=63$.',
        ]),
        E(r'Un tableau donne $f(-8)=18$, $f(7)=-8$, $f(18)=-1$ et $f(19)=-8$. Donner l’image de $18$ et les préimages de $-8$.', [
            r'Sous $18$, on lit $-1$ : l’image de $18$ est $-1$.',
            r'$-8$ apparaît sous $7$ et sous $19$ : ses préimages sont $7$ et $19$.',
        ], 'Lire'),
        QC(r'Avec ce tableau, que vaut $f(-8)$ ?', [r'$18$', r'$-8$', r'$7$'], r'Sous $-8$, on lit $18$.'),
        QN(r'$g(x)=x^2-1$. Calculer $g(-3)$.', 8, r'$(-3)^2-1=9-1=8$.'),
    ]),
    C('Lire un graphique', 'Lire une image et des préimages sur un graphique', [
        X('f2352', '11FA1A-3', 2, 'Lire des images'),
        X('8117f', '11FA1A-4', 2, 'Lire des préimages'),
        X('4b122', '11FA1A-5', 1, 'Lire images et préimages'),
    ], [
        T(r'La représentation graphique de $f$ est formée des points de coordonnées $\big(x;f(x)\big)$. On y lit images et préimages.'),
        R('Lire une image', r'On part de $x$ sur l’axe horizontal, on va verticalement jusqu’à la courbe, puis on lit l’ordonnée sur l’axe vertical.'),
        R('Lire des préimages', r'On part de $y$ sur l’axe vertical, on va horizontalement et on lit les abscisses de **tous** les points où l’on rencontre la courbe.'),
        G(fonctions=['(x-1)^2/2-2'], x=[-3, 5], y=[-3, 6], curseurs={'a': [-3, 5, 3, 0.5]},
          points=[{'x': 'a', 'sur': 0, 'nom': 'M', 'coordonnees': True}],
          legende=r'Déplacer $M$ : son abscisse est $x$, son ordonnée est l’image $f(x)$.'),
        E(r'Sur ce graphique, trouver les préimages de $0$.', [
            r'On cherche où la courbe rencontre l’axe horizontal, où $y=0$.',
            r'Elle le rencontre en $x=-1$ et en $x=3$.',
            r'Les préimages de $0$ sont $-1$ et $3$.',
        ]),
        QC(r'Sur ce graphique, combien de préimages a $-2$ ?', ['une', 'deux', 'aucune'], r'$-2$ est la plus petite valeur de $f$ ; elle n’est atteinte qu’en $x=1$.'),
        QN(r'Sur ce graphique, que vaut $f(5)$ ?', 6, r'On place $M$ en $x=5$ : son ordonnée vaut $6$.'),
    ]),
    C('Point sur une courbe', 'Vérifier qu’un point appartient à une courbe', [
        X('ec059', '11FA1A-12', 2, 'Coordonnées d’un point d’une courbe'),
        X('d1a6e', '11QCM-63', 2, 'Un point sur une hyperbole ?'),
        X('7ef2d', '11QCM-60', 2, 'Position d’un point et d’une courbe'),
    ], [
        T(r'Un point est sur la courbe de $f$ exactement quand son ordonnée est l’image de son abscisse.'),
        R('Critère', r'Le point $A(x_A;y_A)$ appartient à la courbe de $f$ si et seulement si $f(x_A)=y_A$.'),
        E(r'Le point $A(2;5)$ est-il sur la courbe de $f(x)=2x^2-3$ ?', [
            r'$f(2)=2\times4-3=5$.',
            r'$f(2)=y_A$ : $A$ est sur la courbe.',
        ]),
        E(r'Le point $B$ d’abscisse $-1$ est sur la courbe de $f(x)=9x-4$. Calculer son ordonnée.', [
            r'$y_B=f(-1)=-9-4=-13$.',
            r'$B(-1;-13)$.',
        ], 'Calculer l’ordonnée'),
        E(r'Le point $C$ d’ordonnée $5$ est sur la courbe de $g(x)=\dfrac{-7}{x}+3$. Calculer son abscisse.', [
            r'On résout $\dfrac{-7}{x}+3=5$.',
            r'$\dfrac{-7}{x}=2$, donc $x=-\dfrac72$.',
        ], 'Calculer l’abscisse'),
        QC(r'Le point $N\left(\dfrac13;\dfrac13\right)$ est-il sur la courbe d’équation $y=\dfrac6x$ ?', ['non', 'oui'], r'$\dfrac{6}{1/3}=18$, qui n’est pas $\dfrac13$.'),
        QN(r'Le point $P(3;k)$ est sur la droite $y=\dfrac23x+4$. Que vaut $k$ ?', 6, r'$\dfrac23\times3+4=2+4=6$.'),
    ]),
    C('Pente et ordonnée à l’origine', 'Reconnaître la pente et l’ordonnée à l’origine', [
        X('80d4f', '11FA1B-15', 3, 'Lire pente et ordonnée à l’origine'),
        X('156fa', '11FA1B-7', 2, 'Lire une droite'),
        X('1ea16', '11FA1B-21', 3, 'Pente d’une droite par deux points'),
    ], [
        T('Une fonction affine a pour graphique une droite. Deux nombres la décrivent : sa pente et son ordonnée à l’origine.'),
        R('Fonction affine', r'Une fonction **affine** s’écrit $f(x)=ax+b$.' '\n' r'- $a$ est la **pente** : quand $x$ augmente de $1$, $f(x)$ varie de $a$.' '\n' r'- $b$ est l’**ordonnée à l’origine** : la droite coupe l’axe vertical en $(0;b)$.' '\n\n' r'Si $b=0$, $f$ est **linéaire** : sa droite passe par l’origine. Si $a=0$, $f$ est **constante** : sa droite est horizontale.'),
        G(fonctions=['a*x+b'], x=[-5, 5], y=[-5, 5], curseurs={'a': [-3, 3, 1, 0.5], 'b': [-4, 4, 2, 1]},
          points=[{'x': 0, 'y': 'b', 'nom': 'B', 'coordonnees': True}],
          legende=r'Faire varier $a$ change l’inclinaison ; faire varier $b$ déplace la droite le long de l’axe vertical.'),
        E(r'Donner la pente et l’ordonnée à l’origine de $g(t)=\dfrac67-\dfrac t2$.', [
            r'On réordonne : $g(t)=-\dfrac12t+\dfrac67$.',
            r'Pente $-\dfrac12$, ordonnée à l’origine $\dfrac67$.',
        ]),
        R('Pente par deux points', r'Pour une droite qui passe par $A$ et $B$ :' '\n' r'$$a=\dfrac{y_B-y_A}{x_B-x_A}.$$'),
        E(r'Calculer la pente de la droite qui passe par $A(4;5)$ et $B(0;2)$.', [
            r'$a=\dfrac{2-5}{0-4}=\dfrac{-3}{-4}$.',
            r'$a=\dfrac34$.',
        ], 'Par deux points'),
        QC(r'La droite de $f(x)=-9x-4$ coupe l’axe vertical en :', [r'$(0;-4)$', r'$(0;-9)$', r'$(-4;0)$'], r'Pour $x=0$, $f(0)=-4$.'),
        QN(r'Quelle est la pente de la droite qui passe par $A(-1;4)$ et $B(0;-3)$ ?', -7, r'$\dfrac{-3-4}{0-(-1)}=\dfrac{-7}{1}=-7$.'),
    ]),
    C('Équation d’une droite', 'Déterminer l’équation d’une droite', [
        X('41e6f', '11FA1B-18', 2, 'Équation d’une droite tracée'),
        X('93f13', '11FA1B-10', 2, 'Expression d’une fonction affine tracée'),
        X('b8b3e', '11FA1B-6', 2, 'Fonction affine par deux images'),
    ], [
        T('Pour trouver l’expression d’une fonction affine, il suffit de connaître deux points de sa droite.'),
        R('Par lecture graphique', r'- $b$ : on lit où la droite coupe l’axe vertical.' '\n' r'- $a$ : depuis un point de la droite, on avance de $1$ vers la droite et on compte de combien on monte (pente positive) ou on descend (pente négative).'),
        E(r'Une droite passe par $(0;-2)$ et $(5;3)$. Donner son équation.', [
            r'Elle coupe l’axe vertical en $-2$ : $b=-2$.',
            r'$a=\dfrac{3-(-2)}{5-0}=1$.',
            r'$y=x-2$.',
        ]),
        E(r'$f$ est affine, $f(2)=7$ et $f(4)=11$. Déterminer $f(x)$.', [
            r'$a=\dfrac{11-7}{4-2}=2$.',
            r'$f(2)=2\times2+b=7$, donc $b=3$.',
            r'$f(x)=2x+3$.',
        ], 'Par deux images'),
        QC(r'$f$ est affine, $f(0)=4$ et $f(2)=0$. Alors :', [r'$f(x)=-2x+4$', r'$f(x)=2x+4$', r'$f(x)=4x-2$'], r'$a=\dfrac{0-4}{2-0}=-2$ et $b=f(0)=4$.'),
        QN(r'$f$ est affine, $f(0)=-1$ et $f(4)=-5$. Quelle est sa pente ?', -1, r'$\dfrac{-5-(-1)}{4-0}=\dfrac{-4}{4}=-1$.'),
    ]),
    C('Familles de fonctions', 'Classer une fonction d’après son expression ou sa courbe', [
        X('90998', '11FA1B-9', 3, 'Reconnaître une fonction affine'),
        X('f214a', '11FA1A-10', 3, 'Reconnaître une fonction d’après sa courbe'),
    ], [
        T('La forme de l’expression annonce la forme de la courbe.'),
        R('Familles', r'- **Linéaire** $f(x)=ax$ : droite qui passe par l’origine.' '\n' r'- **Affine** $f(x)=ax+b$ : droite.' '\n' r'- **Constante** $f(x)=b$ : droite horizontale.' '\n' r'- **Carré** $f(x)=x^2$ : parabole.' '\n' r'- **Inverse** $f(x)=\dfrac1x$ : hyperbole.' '\n' r'- **Cube** $f(x)=x^3$.' '\n' r'- **Valeur absolue** $f(x)=|x|$ : courbe en forme de V, de sommet l’origine.'),
        G(fonctions=['x^2', 'x^3'], x=[-2.5, 2.5], y=[-4, 4], styles=[{'couleur': 'bleu'}, {'couleur': 'orange'}],
          textes=[{'x': -1.9, 'y': 3.3, 'texte': '$x^2$', 'couleur': 'bleu'}, {'x': 1.9, 'y': -3.3, 'texte': '$x^3$', 'couleur': 'orange'}],
          legende=r'La parabole $y=x^2$ reste au-dessus de l’axe ; la courbe de $x^3$ monte de bas en haut.'),
        E(r'$f(x)=13\times(4x+8)$ est-elle affine ?', [
            r'On développe : $f(x)=52x+104$.',
            r'C’est la forme $ax+b$ avec $a=52$ et $b=104$ : $f$ est affine, mais pas linéaire.',
        ]),
        E(r'$g(x)=2x^2+1$ est-elle affine ?', [
            r'$x$ apparaît au carré : $g$ n’est pas affine.',
            r'Sa courbe est une parabole.',
        ], 'Une fonction qui ne l’est pas'),
        QC('Laquelle est linéaire ?', [r'$f(x)=-\dfrac{x}{8}$', r'$f(x)=-\dfrac{x}{8}+\dfrac12$', r'$f(x)=\dfrac8x$'], r'$-\dfrac x8=-\dfrac18x$ a la forme $ax$. $\dfrac8x$ est une fonction inverse.'),
        QC(r'La courbe de $f(x)=\dfrac1x$ est :', ['une hyperbole', 'une droite', 'une parabole'], r'La fonction inverse a pour courbe une hyperbole.'),
    ]),
    C('Problèmes', 'Résoudre un problème avec une fonction', [
        X('5622b', '11FA1C-1', 2, 'Modéliser par une fonction'),
        X('5bc82', '11FA1C-3', 2, 'Lire un graphique pour un problème de prix'),
        X('b429f', '10FA1B-18', 2, 'Interpréter un graphique'),
    ], [
        T('Beaucoup de situations sont des fonctions : un prix selon une quantité, une distance selon une durée. On choisit la variable, on écrit l’expression, puis on calcule ou on lit le graphique.'),
        R('Méthode', r'- Nommer la variable $x$, ce qu’elle représente et son unité.' '\n' r'- Écrire $f(x)$ d’après l’énoncé : une part fixe donne $b$, une part proportionnelle donne $ax$.' '\n' r'- Pour une image, calculer $f(x)$ ; pour une valeur de $x$, résoudre $f(x)=y$.' '\n' r'- Avec un graphique, lire de la même façon une image ou une préimage, en regardant les unités des axes.'),
        E(r'L’eau coûte un abonnement de $65{,}50$ francs par an plus $3{,}52$ francs par m³. Exprimer le prix $f(x)$ pour $x$ m³, puis calculer le prix de $100$ m³.', [
            r'Part fixe : $65{,}50$ ; part proportionnelle : $3{,}52x$.',
            r'$f(x)=3{,}52x+65{,}50$.',
            r'$f(100)=352+65{,}50=417{,}50$ francs.',
        ]),
        E(r'Un silo contient $1\,536$ kg de grains ; des poulets en mangent $38{,}4$ kg par jour. Après combien de jours est-il vide ?', [
            r'Masse restante après $x$ jours : $g(x)=1\,536-38{,}4x$.',
            r'On résout $1\,536-38{,}4x=0$.',
            r'$x=40$ jours.',
        ], 'Une durée'),
        QC(r'Un taxi coûte $6$ francs de prise en charge plus $3$ francs par kilomètre. Quelle expression donne le prix pour $x$ km ?', [r'$3x+6$', r'$6x+3$', r'$9x$'], r'La prise en charge est fixe, le prix par kilomètre est proportionnel à $x$.'),
        QN(r'Avec ce taxi, combien de kilomètres a-t-on parcourus pour $45$ francs ?', 13, r'$3x+6=45$, donc $3x=39$ et $x=13$.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-thales', 'Thalès et triangles semblables', 'bx-shape-triangle',
         'Calculer des longueurs avec le théorème de Thalès et dans des triangles semblables.', [
    C('Rapports de Thalès', 'Écrire les rapports de Thalès', [
        X('6fd12', '11GM1B-2', 3, 'Écrire une relation de Thalès'),
        X('1aaa0', '11GM1B-5', 3, 'Résoudre une égalité de rapports'),
    ], [
        T('Deux droites sécantes coupées par deux parallèles forment deux triangles, emboîtés ou en « papillon ». Leurs côtés sont proportionnels.'),
        R('Théorème de Thalès', r'Les droites $(BM)$ et $(CN)$ se coupent en $A$, et $(MN)\parallel(BC)$. Alors' '\n' r'$$\dfrac{AM}{AB}=\dfrac{AN}{AC}=\dfrac{MN}{BC}.$$'),
        R('Écrire les rapports', r'- En haut, les côtés d’un triangle ; en bas, les côtés correspondants de l’autre.' '\n' r'- Les deux premiers rapports partent du sommet commun $A$ ; le dernier relie les côtés parallèles.'),
        E(r'$(LO)$ et $(MP)$ sont sécantes en $N$, et $(LM)\parallel(OP)$. Écrire l’égalité de Thalès.', [
            r'Les deux triangles sont $NLM$ et $NOP$.',
            r'Côtés correspondants : $NL$ et $NO$, $NM$ et $NP$, $LM$ et $OP$.',
            r'$\dfrac{NL}{NO}=\dfrac{NM}{NP}=\dfrac{LM}{OP}$.',
        ]),
        E(r'Résoudre $\dfrac{x}{6}=\dfrac54$.', [
            r'Produit en croix : $4x=6\times5$.',
            r'$x=\dfrac{30}{4}=7{,}5$.',
        ], 'Produit en croix'),
        QC(r'Dans un triangle $ABC$, $M\in[AB]$, $N\in[AC]$ et $(MN)\parallel(BC)$. Quelle égalité est juste ?', [r'$\dfrac{AM}{AB}=\dfrac{MN}{BC}$', r'$\dfrac{AM}{MB}=\dfrac{MN}{BC}$', r'$\dfrac{AB}{AM}=\dfrac{MN}{BC}$'], r'On compare chaque côté du triangle $AMN$ au côté correspondant de $ABC$, toujours dans le même ordre. $MB$ n’est pas un côté de ces triangles.'),
        QN(r'$\dfrac{x}{9}=\dfrac23$. Que vaut $x$ ?', 6, r'$3x=18$, donc $x=6$.'),
    ]),
    C('Calculer des longueurs', 'Calculer une longueur avec le théorème de Thalès', [
        X('74eac', '11GM1B-3', 2, 'Calculer des longueurs avec Thalès'),
        X('de083', '11GM1B-8', 2, 'Triangles emboîtés'),
        X('eeb5a', '11GM1B-9', 2, 'Configuration papillon'),
        X('c1def', '11GM1B-10', 2, 'Longueur par différence'),
    ], [
        T('Une fois l’égalité écrite, on garde les deux rapports qui contiennent trois longueurs connues et la longueur cherchée.'),
        R('Méthode', r'- Vérifier la configuration : deux droites sécantes, deux droites parallèles.' '\n' r'- Écrire les trois rapports.' '\n' r'- Garder deux rapports, remplacer, faire un produit en croix.'),
        E(r'$(BM)$ et $(CN)$ se coupent en $A$, $(MN)\parallel(BC)$, $AM=4$, $AB=10$ et $BC=7{,}5$. Calculer $MN$.', [
            r'$\dfrac{AM}{AB}=\dfrac{MN}{BC}$, donc $\dfrac{4}{10}=\dfrac{MN}{7{,}5}$.',
            r'$MN=\dfrac{4\times7{,}5}{10}=3$.',
        ]),
        E(r'Les points $A$, $O$, $C$ et $B$, $O$, $D$ sont alignés dans cet ordre, $(AB)\parallel(CD)$, $OA=3$, $OC=6$ et $CD=5$. Calculer $AB$.', [
            r'Triangles $OAB$ et $OCD$ : $\dfrac{OA}{OC}=\dfrac{AB}{CD}$.',
            r'$\dfrac36=\dfrac{AB}{5}$.',
            r'$AB=2{,}5$.',
        ], 'En papillon'),
        E(r'Avec $AM=4$ et $AB=10$, on demande $MB$.', [
            r'$M$ est sur $[AB]$ : $MB=AB-AM$.',
            r'$MB=6$.',
        ], 'Une différence'),
        QC(r'Pour calculer $AN$ connaissant $AM$, $AB$ et $AC$, on utilise :', [r'$\dfrac{AM}{AB}=\dfrac{AN}{AC}$', r'$\dfrac{AM}{AB}=\dfrac{MN}{BC}$', r'$AN=AC-AM$'], r'C’est l’égalité qui contient $AN$ et les trois longueurs connues.'),
        QN(r'$\dfrac{AM}{AB}=\dfrac{AN}{AC}$ avec $AM=3$, $AB=12$ et $AC=8$. Que vaut $AN$ ?', 2, r'$AN=\dfrac{3\times8}{12}=2$.'),
    ]),
    C('Triangles semblables', 'Calculer des longueurs dans des triangles semblables', [
        X('f4b7e', '11ES1C-2', 3, 'Côtés homologues de triangles semblables'),
        X('58a6f', '11ES1C-3', 2, 'Calculer des longueurs'),
    ], [
        T('Deux triangles **semblables** ont la même forme : l’un est un agrandissement ou une réduction de l’autre.'),
        R('Reconnaître', r'Deux triangles sont semblables si leurs angles sont égaux deux à deux. Deux paires d’angles égaux suffisent, car la somme des angles vaut $180^\circ$.'),
        R('Côtés homologues', r'Dans deux triangles semblables, les côtés opposés aux angles égaux sont **homologues**, et leurs longueurs sont proportionnelles :' '\n' r'$$\dfrac{A^{\prime}B^{\prime}}{AB}=\dfrac{B^{\prime}C^{\prime}}{BC}=\dfrac{A^{\prime}C^{\prime}}{AC}=k.$$'),
        E(r'$ABC$ et $DEF$ sont semblables, avec $\widehat{A}=\widehat{D}$ et $\widehat{B}=\widehat{E}$ ; $AB=4$, $BC=6$ et $DE=6$. Calculer $EF$.', [
            r'Côtés homologues : $AB$ et $DE$, $BC$ et $EF$.',
            r'$k=\dfrac{DE}{AB}=\dfrac64=1{,}5$.',
            r'$EF=1{,}5\times6=9$.',
        ]),
        QC(r'Un triangle a deux angles de $50^\circ$ et $60^\circ$, un autre deux angles de $60^\circ$ et $70^\circ$. Ils sont :', ['semblables', 'pas semblables'], r'Le troisième angle du premier vaut $180^\circ-50^\circ-60^\circ=70^\circ$ : les trois angles sont les mêmes.'),
        QN(r'Un triangle de côtés $3$, $4$ et $5$ est agrandi : le plus grand côté mesure maintenant $15$. Combien mesure le plus petit ?', 9, r'Le rapport vaut $\dfrac{15}{5}=3$, donc $3\times3=9$.'),
        R('Pièges', r'Associer les côtés grâce aux angles, pas d’après leur position sur la figure.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-transformations', 'Isométries et homothétie', 'bx-transfer',
         'Reconnaître une isométrie, utiliser ses propriétés et calculer avec une homothétie.', [
    C('Reconnaître une isométrie', 'Reconnaître une isométrie', [
        X('2d343', '9ES3-7', 3, 'Identifier une transformation'),
        X('8ac93', '9ES3-5', 3, 'Trouver la transformation'),
    ], [
        T('Une **isométrie** déplace une figure sans la déformer : l’image a les mêmes longueurs et les mêmes angles.'),
        R('Les quatre isométries', r'- **Translation** : glissement le long d’une flèche (direction, sens, longueur).' '\n' r'- **Symétrie axiale** : retournement autour d’un axe, comme dans un miroir.' '\n' r'- **Symétrie centrale** : demi-tour autour d’un point.' '\n' r'- **Rotation** : rotation d’un angle donné autour d’un centre.'),
        R('Les distinguer', r'- La figure est retournée : symétrie axiale.' '\n' r'- Elle n’est ni retournée ni tournée : translation.' '\n' r'- Elle a tourné : rotation ; d’un demi-tour : symétrie centrale.'),
        E(r'Un triangle a pour image un triangle orienté de la même façon, décalé de $3$ carreaux vers la droite.', [
            r'La figure n’est ni retournée ni tournée.',
            r'C’est une translation de $3$ carreaux vers la droite.',
        ]),
        E(r'Une figure a pour image une figure à l’envers, et tous les segments $[AA^{\prime}]$ ont le même milieu $O$.', [
            r'La figure a fait un demi-tour autour de $O$.',
            r'C’est la symétrie de centre $O$, c’est-à-dire la rotation de $180^\circ$ autour de $O$.',
        ], 'Un demi-tour'),
        QC('La lettre « b » a pour image la lettre « d ». C’est :', ['une symétrie axiale', 'une translation', 'une symétrie centrale'], '« d » est « b » vu dans un miroir vertical. Un demi-tour donnerait « q ».'),
        QC('Quelle transformation n’est pas une isométrie ?', ['un agrandissement', 'une rotation', 'une translation'], 'Un agrandissement change les longueurs.'),
    ]),
    C('Propriétés conservées', 'Utiliser les propriétés des isométries', [
        X('493cf', '10ES3A-1', 3, 'Ce que conserve une symétrie'),
        X('07d1b', '10ES3A-2', 2, 'Longueurs et angles conservés'),
        X('64099', '10ES3A-4', 2, 'Symétrie et propriétés conservées'),
    ], [
        T('Comme une isométrie ne déforme rien, on peut lire une mesure sur l’image au lieu de la mesurer sur la figure de départ.'),
        R('Ce qui est conservé', r'Une isométrie conserve :' '\n' r'- les longueurs ;' '\n' r'- les angles ;' '\n' r'- l’alignement et le parallélisme ;' '\n' r'- les aires.'),
        E(r'$[GN]$ est le symétrique de $[LV]$ par rapport à $(d)$, et $LV=7{,}3$ cm. Que vaut $GN$ ?', [
            r'La symétrie axiale conserve les longueurs.',
            r'$GN=7{,}3$ cm.',
        ]),
        E(r'$R$, $G$, $E$ sont les images de $J$, $K$, $Y$ par une symétrie, et $\widehat{JYK}=43^\circ$. Que vaut $\widehat{REG}$ ?', [
            r'$\widehat{REG}$ est l’image de $\widehat{JYK}$ : son sommet $E$ est l’image de $Y$.',
            r'Les angles sont conservés : $\widehat{REG}=43^\circ$.',
        ], 'Un angle'),
        QC(r'$A^{\prime}$, $B^{\prime}$, $C^{\prime}$ sont les images de trois points alignés par une rotation. Ils sont :', ['alignés', 'pas alignés', 'alignés seulement pour un demi-tour'], 'Une rotation, comme toute isométrie, conserve l’alignement.'),
        QN(r'Un triangle d’aire $12$ cm² subit une translation. Quelle est l’aire de son image, en cm² ?', 12, 'Une translation conserve les aires.'),
    ]),
    C('Image par une homothétie', 'Construire l’image d’un point par une homothétie', [
        X('d5f34', '11ES3A-5', 3, 'Image d’un point par une homothétie', sup='9-10'),  # homothéties seulement
        X('d4088', '11ES3A-4', 2, 'Coordonnées d’une image', sup='5-6'),  # homothéties seulement
    ], [
        T('Une **homothétie** agrandit ou réduit une figure à partir d’un point fixe, son centre. Elle produit des figures semblables.'),
        R('Définition', r'L’homothétie de centre $O$ et de rapport $k$ envoie $M$ sur $M^{\prime}$ tel que :' '\n' r'- $O$, $M$ et $M^{\prime}$ sont alignés ;' '\n' r'- $OM^{\prime}=|k|\times OM$ ;' '\n' r'- si $k>0$, $M^{\prime}$ est du même côté de $O$ que $M$ ; si $k<0$, de l’autre côté.'),
        E(r'$O$ est l’origine et $A(2;3)$. Trouver l’image de $A$ par l’homothétie de centre $O$ et de rapport $3$.', [
            r'On multiplie les coordonnées par $3$.',
            r'$A^{\prime}(6;9)$.',
        ]),
        E(r'Même point $A(2;3)$, rapport $-\dfrac12$.', [
            r'On multiplie les coordonnées par $-\dfrac12$ : $A^{\prime}(-1;-1{,}5)$.',
            r'$A^{\prime}$ est de l’autre côté de $O$, deux fois plus près.',
        ], 'Rapport négatif'),
        R('Centre quelconque', r'Si le centre est $\Omega$, on multiplie par $k$ les écarts au centre : $x^{\prime}=x_\Omega+k(x-x_\Omega)$, et de même pour $y$.'),
        QC(r'Une homothétie de rapport $-1$ est :', ['une symétrie centrale', 'une translation', 'une symétrie axiale'], r'$OM^{\prime}=OM$, de l’autre côté de $O$ : c’est un demi-tour.'),
        QN(r'Centre $\Omega(1;1)$, rapport $2$ et $M(4;3)$. Quelle est l’abscisse de $M^{\prime}$ ?', 7, r'$1+2\times(4-1)=7$.'),
    ]),
    C('Rapport et effets', 'Calculer le rapport et les effets d’une homothétie', [
        X('6f383', '11ES3A-3', 3, 'Calculs avec une homothétie', sup='2-3-4-5-6-7-8'),  # sans les cas 10 et 11 (QCM)
        X('6f383', '11ES3A-3', 2, 'Calculer le rapport d’une homothétie', sup='1-9'),
        X('a0ad1', '11GM1C-2', 2, 'Agrandissement et réduction'),
        X('960f9', '11GM1C-1', 1, 'Effet sur les aires et les volumes'),
    ], [
        T('Le rapport d’une homothétie se lit en comparant une longueur de l’image à la longueur correspondante de la figure.'),
        R('Trouver le rapport', r'$|k|=\dfrac{OM^{\prime}}{OM}$. Si $|k|>1$, c’est un agrandissement ; si $|k|<1$, une réduction.'),
        R('Aires et volumes', r'Pour un agrandissement ou une réduction de rapport $k$ :' '\n' r'- les longueurs sont multipliées par $|k|$ ;' '\n' r'- les aires par $k^2$ ;' '\n' r'- les volumes par $|k|^3$.'),
        E(r'$OF=3{,}8$ cm et $OI=9{,}12$ cm ; $I$ est l’image de $F$, du même côté de $O$. Calculer le rapport $k$.', [
            r'$k=\dfrac{9{,}12}{3{,}8}$.',
            r'$k=2{,}4$, positif car $I$ est du même côté que $F$.',
        ]),
        E(r'L’image d’une figure par une homothétie de rapport $5$ a une aire de $2\,020$ cm². Calculer l’aire de départ.', [
            r'Les aires sont multipliées par $5^2=25$.',
            r'$2\,020\div25=80{,}8$ cm².',
        ], 'Une aire'),
        QC(r'On réduit un solide avec un rapport $0{,}5$. Son volume est multiplié par :', [r'$0{,}125$', r'$0{,}5$', r'$0{,}25$'], r'$0{,}5^3=0{,}125$.'),
        QN(r'Une figure d’aire $8$ cm² est agrandie avec un rapport $3$. Quelle est sa nouvelle aire, en cm² ?', 72, r'$8\times3^2=72$.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-systemes', 'Systèmes d’équations', 'bx-git-merge',
         'Résoudre un système de deux équations à deux inconnues, graphiquement ou par le calcul.', [
    C('Couple solution', 'Vérifier qu’un couple est solution d’un système', [
        X('ccb71', '11FA5A-1', 4, 'Le couple est-il solution ?'),
    ], [
        T(r'Un système de deux équations à deux inconnues demande un couple $(x;y)$ qui vérifie **les deux** équations à la fois.'),
        R('Couple solution', r'$(x_0;y_0)$ est solution du système si, en remplaçant $x$ par $x_0$ et $y$ par $y_0$, chacune des deux équations est vraie.'),
        E(r'$(-11;-5)$ est-il solution de $\begin{cases}-4x-6y=76\\-6x-6y=96\end{cases}$ ?', [
            r'Première équation : $-4\times(-11)-6\times(-5)=44+30=74$, et non $76$.',
            r'La première équation est fausse : ce couple n’est pas solution, même si la seconde est vraie.',
        ]),
        QC(r'Le couple $(2;1)$ est-il solution de $\begin{cases}x+y=3\\x-y=5\end{cases}$ ?', ['non', 'oui'], r'$2+1=3$, mais $2-1=1$ et non $5$ : il faut que les deux équations soient vraies.'),
        QN(r'Le couple $(3;y)$ vérifie $2x+y=10$. Que vaut $y$ ?', 4, r'$6+y=10$, donc $y=4$.'),
    ]),
    C('Résolution graphique', 'Résoudre un système graphiquement', [
        X('a1b2c', '11FA5A-10', 3, 'Lire le point d’intersection'),
        X('81fd6', '11FA5A-8', 2, 'Associer système et graphique'),
    ], [
        T('Chaque équation du premier degré à deux inconnues se représente par une droite. Résoudre le système, c’est chercher le point commun aux deux droites.'),
        R('Méthode', r'- Écrire chaque équation sous la forme $y=ax+b$.' '\n' r'- Tracer les deux droites.' '\n' r'- Lire les coordonnées du point d’intersection : c’est la solution.'),
        G(fonctions=['-x+4', 'x-2'], x=[-2, 6], y=[-3, 5], styles=[{'couleur': 'bleu'}, {'couleur': 'orange'}],
          points=[{'x': 3, 'y': 1, 'nom': 'I', 'coordonnees': True}],
          legende=r'Droites $y=-x+4$ et $y=x-2$.'),
        E(r'Résoudre graphiquement $\begin{cases}x+y=4\\x-y=2\end{cases}$.', [
            r'$y=-x+4$ et $y=x-2$.',
            r'Les deux droites se coupent en $I(3;1)$.',
            r'Solution : $(3;1)$. Contrôle : $3+1=4$ et $3-1=2$.',
        ]),
        R('Nombre de solutions', r'- Droites sécantes (pentes différentes) : une solution.' '\n' r'- Droites parallèles distinctes : aucune solution.' '\n' r'- Droites confondues : une infinité de solutions.'),
        QC(r'Combien de solutions a le système formé par $y=2x+1$ et $y=2x-3$ ?', ['aucune', 'une', 'une infinité'], r'Même pente, ordonnées à l’origine différentes : les droites sont parallèles.'),
        QN(r'Les droites $y=x+1$ et $y=-x+5$ se coupent en un point. Quelle est son abscisse ?', 2, r'$x+1=-x+5$, donc $2x=4$ et $x=2$.'),
    ]),
    C('Substitution', 'Résoudre un système par substitution', [
        X('521b6', '11FA5A-5', 4, 'Résoudre par substitution'),
    ], [
        T('Quand une inconnue est déjà isolée, ou facile à isoler, on la remplace dans l’autre équation.'),
        R('Méthode', r'- Isoler une inconnue dans une équation, par exemple $y=\ldots$' '\n' r'- La remplacer dans l’autre équation : il reste une équation à une inconnue.' '\n' r'- La résoudre, puis revenir à l’expression isolée pour trouver l’autre inconnue.'),
        E(r'Résoudre $\begin{cases}y=3x-5\\-2y=-8x+8\end{cases}$.', [
            r'On remplace $y$ dans la seconde : $-2(3x-5)=-8x+8$.',
            r'$-6x+10=-8x+8$, donc $2x=-2$ et $x=-1$.',
            r'$y=3\times(-1)-5=-8$.',
            r'$S=\{(-1;-8)\}$.',
        ]),
        QC(r'Dans $\begin{cases}x=y-3\\3x+3y=45\end{cases}$, on obtient d’abord :', [r'$3(y-3)+3y=45$', r'$3x+3(x-3)=45$', r'$y=x-3$'], r'$x$ est isolé dans la première équation : on le remplace par $y-3$ dans la seconde.'),
        QN(r'Résoudre $\begin{cases}y=2x\\x+y=9\end{cases}$. Que vaut $x$ ?', 3, r'$x+2x=9$, donc $x=3$ (et $y=6$).'),
    ]),
    C('Combinaison', 'Résoudre un système par combinaison', [
        X('5179b', '11FA5A-3', 3, 'Résoudre par combinaison'),
        X('fade2', '11FA5A-6', 2, 'Nombre de solutions d’un système'),
    ], [
        T('Quand aucune inconnue n’est isolée, on additionne ou on soustrait les équations pour en faire disparaître une.'),
        R('Méthode', r'- Multiplier une équation, ou les deux, pour obtenir des coefficients opposés devant une même inconnue.' '\n' r'- Additionner les équations membre à membre : cette inconnue disparaît.' '\n' r'- Résoudre, puis remplacer dans une équation de départ.'),
        E(r'Résoudre $\begin{cases}-x+6y=-22\\-4x-3y=-34\end{cases}$.', [
            r'On multiplie la seconde par $2$ : $-8x-6y=-68$.',
            r'On l’additionne à la première : $-9x=-90$, donc $x=10$.',
            r'$-10+6y=-22$, donc $6y=-12$ et $y=-2$.',
            r'$S=\{(10;-2)\}$.',
        ]),
        E(r'Ranger $8x-4y-20=3x-2y+8$ avant de combiner.', [
            r'Termes en $x$ et en $y$ à gauche, nombres à droite.',
            r'$8x-3x=5x$, $-4y+2y=-2y$ et $8+20=28$ : $5x-2y=28$.',
        ], 'Ranger d’abord'),
        QC(r'Pour éliminer $y$ dans $\begin{cases}2x+3y=7\\x-y=1\end{cases}$, on multiplie la seconde équation par :', [r'$3$', r'$2$', r'$-3$'], r'$-y\times3=-3y$, l’opposé de $3y$ : il suffit ensuite d’additionner.'),
        QN(r'$\begin{cases}x+y=10\\x-y=4\end{cases}$. Que vaut $x$ ?', 7, r'En additionnant : $2x=14$, donc $x=7$.'),
    ]),
    C('Problèmes', 'Résoudre un problème avec un système', [
        X('6fbf9', '11FA5A-7', 3, 'Résoudre un problème'),
    ], [
        T('Un problème avec deux quantités inconnues et deux informations se traduit par un système.'),
        R('Méthode', r'- Nommer les deux inconnues $x$ et $y$.' '\n' r'- Traduire chaque information par une équation.' '\n' r'- Résoudre le système, vérifier dans l’énoncé, répondre par une phrase.'),
        E(r'Sur un parking, $30$ véhicules, des quads et des motos, ont $100$ roues en tout. Combien y a-t-il de quads ?', [
            r'$x$ quads et $y$ motos : $x+y=30$ et $4x+2y=100$.',
            r'On soustrait deux fois la première de la seconde : $2x=40$, donc $x=20$.',
            r'$y=10$ : il y a $20$ quads et $10$ motos.',
        ]),
        E(r'Le périmètre d’un rectangle vaut $86$ m et sa longueur dépasse sa largeur de $13$ m. Calculer ses dimensions.', [
            r'$2L+2\ell=86$ et $L=\ell+13$.',
            r'$2(\ell+13)+2\ell=86$, donc $4\ell=60$ et $\ell=15$.',
            r'$L=28$ m et $\ell=15$ m.',
        ], 'Un rectangle'),
        QC(r'$3$ cafés et $2$ croissants coûtent $13$ francs. Avec $x$ le prix d’un café et $y$ celui d’un croissant :', [r'$3x+2y=13$', r'$5(x+y)=13$', r'$3x=2y+13$'], r'Le prix total est la somme des prix des cafés et des croissants.'),
        QN(r'Deux nombres ont pour somme $20$ et pour différence $6$. Quel est le plus grand ?', 13, r'$x+y=20$ et $x-y=6$ : en additionnant, $2x=26$, donc $x=13$.'),
    ]),
])

# ---------------------------------------------------------------------------
chapitre('ch-11ls-probabilites', 'Probabilités', 'bx-dice-5',
         'Décrire une expérience aléatoire et calculer la probabilité d’un événement.', [
    C('Vocabulaire', 'Décrire une expérience aléatoire', [
        X('4703c', '11NO4A-2', 3, 'Vocabulaire des probabilités'),
        X('48b39', '11NO4A-4', 5, 'Impossible, certain ou possible'),
    ], [
        T('Une expérience est **aléatoire** quand on connaît tous ses résultats possibles sans pouvoir prévoir celui qui va se produire : lancer un dé, tirer une carte.'),
        R('Vocabulaire', r'- **Issue** : un résultat possible.' '\n' r'- **Événement** : un ensemble d’issues, comme « obtenir un nombre pair ».' '\n' r'- Un événement est **impossible** si aucune issue ne le réalise, **certain** si toutes les issues le réalisent.' '\n' r'- Les issues sont **équiprobables** si elles ont toutes la même chance de se produire, comme les faces d’un dé équilibré.'),
        E(r'On lance un dé à six faces. Donner les issues, puis celles de l’événement « obtenir plus de $4$ ».', [
            r'Issues : $1$, $2$, $3$, $4$, $5$ et $6$.',
            r'« Obtenir plus de $4$ » est réalisé par $5$ et $6$.',
        ]),
        QC(r'Avec un dé à six faces, « obtenir $9$ » est un événement :', ['impossible', 'certain', 'possible'], r'Aucune face ne porte $9$.'),
        QC(r'Avec un dé à six faces, « obtenir un nombre inférieur à $7$ » est un événement :', ['certain', 'impossible', 'possible mais pas certain'], r'Les six issues sont toutes inférieures à $7$.'),
    ]),
    C('Calculer une probabilité', 'Calculer la probabilité d’un événement', [
        X('b8297', '11NO4A-3', 3, 'Probabilité d’un tirage'),
        X('69e1a', '11NO4A-1', 3, 'Probabilités d’une expérience à une épreuve'),
        X('a813f', '11NO4A-12', 2, 'Probabilités simples'),
    ], [
        T('Quand toutes les issues ont la même chance de se produire, on calcule la probabilité d’un événement en comptant.'),
        R('Issues équiprobables', r'$$P(A)=\dfrac{\text{nombre d’issues qui réalisent }A}{\text{nombre total d’issues}}$$' '\n' r'Une probabilité est comprise entre $0$ et $1$. Elle s’écrit en fraction, en nombre décimal ou en pourcentage.'),
        R('Événement contraire', r'La probabilité que $A$ ne se réalise pas vaut $1-P(A)$. Les probabilités de toutes les issues ont pour somme $1$.'),
        E(r'Un sac contient $3$ boules rouges et $7$ boules vertes. Quelle est la probabilité de tirer une boule verte ?', [
            r'Il y a $10$ boules, dont $7$ vertes.',
            r'$P=\dfrac{7}{10}=0{,}7=70\,\%$.',
        ]),
        E(r'Une équipe gagne avec une probabilité de $0{,}3$ et fait match nul avec une probabilité de $0{,}38$. Quelle est la probabilité qu’elle perde ?', [
            r'Gagner, faire match nul et perdre couvrent toutes les issues : leurs probabilités ont pour somme $1$.',
            r'$1-0{,}3-0{,}38=0{,}32$.',
        ], 'Avec la somme des probabilités'),
        QC(r'Un paquet contient $20$ bonbons, dont $4$ rouges. Quelle est la probabilité de tirer un bonbon rouge ?', [r'$\dfrac15$', r'$\dfrac14$', r'$\dfrac{4}{16}$'], r'$\dfrac{4}{20}=\dfrac15$ : on divise par le nombre **total** de bonbons.'),
        QN(r'La probabilité de gagner vaut $0{,}35$. Quelle est la probabilité de ne pas gagner ?', 0.65, r'$1-0{,}35=0{,}65$.'),
    ]),
    C('Cartes et événements', 'Calculer des probabilités avec un jeu de cartes', [
        X('24db8', '10NO3G-1', 5, 'Tirer une carte'),
        X('00bb0', '11NO4A-5', 3, 'Événements contraires ou incompatibles'),
    ], [
        T(r'Un jeu de $32$ cartes compte $4$ couleurs de $8$ cartes : cœur et carreau en rouge, pique et trèfle en noir. Chaque couleur contient le $7$, le $8$, le $9$, le $10$, le valet, la dame, le roi et l’as.'),
        R('Compter', r'- $32$ cartes : $16$ rouges et $16$ noires.' '\n' r'- $8$ cartes de chaque couleur, par exemple $8$ trèfles.' '\n' r'- $4$ cartes de chaque valeur, par exemple $4$ rois.' '\n' r'- $12$ figures : valet, dame et roi de chaque couleur.'),
        R('Deux événements', r'- **Incompatibles** : ils ne peuvent pas se réaliser en même temps.' '\n' r'- **Contraires** : l’un se réalise exactement quand l’autre ne se réalise pas.' '\n\n' r'Deux événements contraires sont incompatibles ; l’inverse est faux.'),
        E('Quelle est la probabilité de tirer une carte qui n’est pas une figure ?', [
            r'$32-12=20$ cartes ne sont pas des figures.',
            r'$P=\dfrac{20}{32}=\dfrac58$.',
        ]),
        E('« Obtenir un trèfle » et « obtenir un cœur » sont-ils contraires ?', [
            r'Une carte ne peut pas être les deux : ils sont incompatibles.',
            r'Un carreau n’est ni trèfle ni cœur : ils ne sont pas contraires.',
        ], 'Incompatibles ou contraires'),
        QC('« Obtenir une carte rouge » et « obtenir une carte noire » sont :', ['contraires', 'incompatibles mais pas contraires', 'compatibles'], 'Chaque carte est soit rouge, soit noire : exactement un des deux se réalise.'),
        QN('Dans un jeu de $32$ cartes, combien de cartes réalisent « tirer un roi ou un cœur » ?', 11, r'Les $8$ cœurs, plus les $3$ rois des autres couleurs.'),
    ]),
])


# ---------------------------------------------------------------------------
def parcours(ch):
    etapes, paliers = [], []
    for c in ch['ceintures']:
        for e in c['etapes']:
            etapes.append({**e, 'objectifs': [c['objectif']]})
        paliers.append({'titre': c['titre'], 'nb': len(c['etapes']), 'acces': 'seuil', 'seuil': 80,
                        'fiche': {'titre': c['titre'], 'avant': True, 'blocs': c['blocs']}})
    noms = [c['titre'] for c in ch['ceintures']]
    rangs = [CEINTURES[k] if k < len(CEINTURES) else f'noire, {k - len(CEINTURES) + 2}e dan' for k in range(len(noms))]
    return {
        'id': ch['id'], 'version': VERSIONS.get(ch['id'], 1), 'titre': ch['titre'], 'objectif': ch['objectif'], 'auteurs': AUTEURS,
        'descriptionEleves': f"{len(noms)} ceintures pour le chapitre « {ch['titre']} » de 11e. Chaque ceinture s’ouvre sur une fiche qui rappelle la méthode ; tu passes à la suivante à partir de 80 % de réponses correctes.",
        'descriptionEnseignant': f"Programme de 11e, voie LS. {len(noms)} ceintures, de la blanche à la {rangs[-1]} : " + ' ; '.join(noms) + '. Une fiche précède chaque ceinture ; la suivante se débloque à 80 %. Chaque exercice est étiqueté avec l’objectif de sa ceinture.',
        'niveau': NIVEAU, 'theme': THEMES[ch['id']], 'difficulte': 2, 'icone': ch['icone'],
        'presentation': 'une_question_par_page', 'correction': 'question', 'enTetesMasques': True, 'melanger': True,
        'style': 'ceintures', 'premiereCeinture': 0, 'paliers': paliers, 'etapes': etapes,
    }


def main():
    tous = [parcours(ch) for ch in CHAPITRES]
    objectifs, vus = [], set()
    for ch in CHAPITRES:
        for c in ch['ceintures']:
            assert c['objectif'] not in vus, c['objectif']
            vus.add(c['objectif'])
            objectifs.append({'libelle': c['objectif'], 'niveau': NIVEAU, 'theme': THEMES[ch['id']]})
    fichier = {
        'format': 'classes-mathalea/1',
        'exporteLe': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        'classes': [{'nom': '11e LS', 'parcours': tous}],
        'bibliotheque': {'parcours': [], 'objectifs': objectifs},
    }
    SORTIE.write_text(json.dumps(fichier, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    n = sum(len(p['etapes']) for p in tous)
    print(f'{SORTIE.name} : {len(tous)} parcours, {sum(len(p["paliers"]) for p in tous)} ceintures, {n} étapes, {len(objectifs)} objectifs')


if __name__ == '__main__':
    main()
