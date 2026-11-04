"""Parcours « Prérequis pour l'analyse » (4e Collège) : entrée des parcours
« Calcul intégral » et « Exponentielle et logarithme » de explorer/ch-4e-college.json.

Sept ceintures, un savoir-faire indispensable chacune, trois exercices ciblés
(Nathan, 3 novembre 2026 : « il faut vraiment l'essentiel […] plus d'exercices
ciblés »). La ceinture noire mène aux premières ceintures des deux parcours
(dérivées de fonctions composées, logarithme naturel). Le parcours est placé
en tête de la classe « 4e Collège » ; le relancer le remplace.

    python3 explorer/ch-4e-prerequis-gen.py
"""
import json
from pathlib import Path

FICHIER = Path(__file__).with_name('ch-4e-college.json')
ID = 'ch-4c-prerequis-analyse'
# 2 : listes des fiches précédées d'une ligne vide (tirets bruts dans les apps 0.4.12 et avant)
VERSION = 2
NIVEAU = '4e Collège'
THEME = 'Analyse'
AUTEURS = ['l’équipe CoopMaths', 'Nathan Scheinmann', 'Claude Opus 5.5']


def listes(texte):
    """Ligne vide avant une liste qui suit une phrase (comme ch-11e-ls-gen.py) : les
    apps d'avant le 2026-11-05 laissaient sinon les tirets bruts."""
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


def E(titre, enonce, etapes):
    return {'type': 'exemple', 'titre': titre, 'enonce': enonce, 'etapes': etapes}


def QC(enonce, choix, explication, bonne=0):
    return {'type': 'question', 'enonce': enonce, 'choix': choix, 'bonne': bonne, 'explication': explication}


def QN(enonce, reponse, explication):
    return {'type': 'question', 'enonce': enonce, 'reponse': reponse, 'explication': explication}


# Une étape : (uuid, référence, nombre de questions, titre vu par l'élève, réglages)
def X(uuid, ref, n, titre, **sup):
    return {'uuid': uuid, 'id': ref, 'nbQuestions': n, 'titre': titre, **sup}


# Une ceinture : titre, objectif (libellé unique), étapes, blocs de la fiche
CEINTURES = [
    ('Puissances', 'Calculer avec des puissances', [
        X('a8a2e', '2N43-2', 3, 'Écrire sous la forme d’une seule puissance', sup='true'),
        X('32a31', '1A-C03-2', 3, 'Simplifier avec les propriétés des puissances'),
        X('eb865', '10NO3D-25', 2, 'Puissances à exposant négatif', sup='2'),
    ], [
        T(r'Pour dériver ou trouver une primitive, on écrit chaque terme comme une puissance de $x$ : $\dfrac{1}{x^2}=x^{-2}$, $\sqrt{x}=x^{\frac12}$. Cette ceinture reprend les règles de calcul avec les puissances.'),
        R('Règles de calcul', r'Pour $a\neq0$ et des exposants entiers $m$ et $n$ :' '\n' r'- $a^m\cdot a^n=a^{m+n}$ et $\dfrac{a^m}{a^n}=a^{m-n}$' '\n' r'- $\left(a^m\right)^n=a^{m\cdot n}$ et $(a\cdot b)^n=a^n\cdot b^n$' '\n' r'- $a^0=1$ et $a^{-n}=\dfrac{1}{a^n}$'),
        R('Racines', r'Pour $x>0$ : $\sqrt{x}=x^{\frac12}$, $\sqrt[n]{x^m}=x^{\frac{m}{n}}$ et $\dfrac{1}{\sqrt{x}}=x^{-\frac12}$. Les règles ci-dessus restent vraies avec ces exposants.'),
        E('Un quotient', r'Écrire $\dfrac{x^3\cdot x^{-1}}{x^5}$ sous la forme $x^n$.', [
            r'Au numérateur, même base : on additionne les exposants, $x^{3+(-1)}=x^2$.',
            r'Quotient de même base : on soustrait les exposants, $\dfrac{x^2}{x^5}=x^{2-5}=x^{-3}$.',
        ]),
        E('Avant de dériver', r'Écrire $f(x)=\dfrac{2}{x^3}+\dfrac{1}{\sqrt{x}}$ avec des puissances de $x$.', [
            r'$\dfrac{2}{x^3}=2\cdot\dfrac{1}{x^3}=2x^{-3}$.',
            r'$\dfrac{1}{\sqrt{x}}=\dfrac{1}{x^{\frac12}}=x^{-\frac12}$, donc $f(x)=2x^{-3}+x^{-\frac12}$.',
        ]),
        QC(r'$\dfrac{1}{x^2}$ s’écrit :', [r'$x^{-2}$', r'$-x^2$', r'$x^{\frac12}$'],
           r'Diviser par $x^2$, c’est multiplier par $x^{-2}$. Le signe « $-$ » est dans l’exposant : $-x^2$ est un tout autre nombre, négatif.'),
        QN(r'Que vaut $2^{-3}\cdot2^{5}$ ?', 4, r'Même base : on additionne les exposants, $-3+5=2$, et $2^2=4$.'),
    ]),
    ('Factoriser', 'Factoriser une expression', [
        X('8cb63', '3L12-4', 3, 'Factoriser une expression'),
        X('c4b73', '1mCL2-1', 3, 'Mise en évidence ou identité remarquable'),
        X('2cb9a', '2L13-5', 2, 'Calculer avec des fractions littérales'),
    ], [
        T('Factoriser sert à trouver les zéros d’une fonction, à étudier son signe et à simplifier une fraction : on s’en sert dans presque chaque calcul d’aire.'),
        R('Méthode', r'1. Mettre en évidence le facteur commun : $ab+ac=a\,(b+c)$.' '\n' r'2. Reconnaître une identité remarquable : $a^2-b^2=(a-b)(a+b)$ et $a^2\pm2ab+b^2=(a\pm b)^2$.' '\n' r'3. Pour $x^2+bx+c$, chercher deux nombres de somme $b$ et de produit $c$ : $x^2-x-6=(x-3)(x+2)$.'),
        E('Facteur commun puis identité', r'Factoriser $2x^3-8x$.', [
            r'Facteur commun $2x$ : $2x^3-8x=2x\,(x^2-4)$.',
            r'$x^2-4=x^2-2^2=(x-2)(x+2)$, donc $2x^3-8x=2x\,(x-2)(x+2)$.',
        ]),
        E('Même dénominateur', r'Écrire $\dfrac{1}{x}-\dfrac{1}{x+1}$ en une seule fraction.', [
            r'Dénominateur commun : $x\,(x+1)$.',
            r'$\dfrac{x+1}{x\,(x+1)}-\dfrac{x}{x\,(x+1)}=\dfrac{x+1-x}{x\,(x+1)}=\dfrac{1}{x\,(x+1)}$.',
        ]),
        QC(r'Une factorisation de $x^2-6x+9$ est :', [r'$(x-3)^2$', r'$(x+3)^2$', r'$(x-3)(x+3)$'],
           r'$9=3^2$ et $6x=2\cdot x\cdot3$ : c’est un carré. Le terme en $x$ est négatif, donc $(x-3)^2$. Le produit $(x-3)(x+3)$ donnerait $x^2-9$.'),
        R('Piège', r'On ne simplifie une fraction que par un **facteur** : $\dfrac{(x-3)(x+3)}{x+3}=x-3$ pour $x\neq-3$, mais $\dfrac{x+3}{x}$ ne se simplifie pas.'),
    ]),
    ('Résoudre une équation', 'Résoudre une équation', [
        X('cf78f', '1AL23-21', 3, 'Résoudre une équation du deuxième degré'),
        X('6357e', '1mCL4-5', 3, 'Factoriser puis résoudre'),
        X('ecf62', '11FA5B-2', 2, 'Résoudre une équation produit nul'),
    ], [
        T(r'Les bornes d’une aire sont souvent les solutions d’une équation : $f(x)=0$ pour les zéros, $f(x)=g(x)$ pour l’intersection de deux courbes.'),
        R('Produit nul', r'Un produit est nul si et seulement si l’un de ses facteurs est nul : $A\cdot B=0$ équivaut à $A=0$ ou $B=0$. On ramène donc tout d’un côté ($\ldots=0$), puis on factorise.'),
        R('Deuxième degré', r'Pour $ax^2+bx+c=0$ ($a\neq0$), on calcule $\Delta=b^2-4ac$ :' '\n' r'- $\Delta>0$ : deux solutions $x=\dfrac{-b-\sqrt{\Delta}}{2a}$ et $x=\dfrac{-b+\sqrt{\Delta}}{2a}$ ;' '\n' r'- $\Delta=0$ : une solution $x=-\dfrac{b}{2a}$ ;' '\n' r'- $\Delta<0$ : aucune solution réelle.'),
        E('Intersection de deux courbes', r'Trouver les points d’intersection des courbes de $f(x)=x^2$ et $g(x)=x+2$.', [
            r'$x^2=x+2$ équivaut à $x^2-x-2=0$.',
            r'Deux nombres de somme $-1$ et de produit $-2$ : $-2$ et $1$. Donc $(x-2)(x+1)=0$.',
            r'$x=2$ ou $x=-1$ : les courbes se coupent en $(2\,;4)$ et $(-1\,;1)$.',
        ]),
        QN(r'Combien de solutions a l’équation $x^3-4x=0$ ?', 3,
           r'$x^3-4x=x\,(x^2-4)=x\,(x-2)(x+2)$. Le produit est nul pour $x=0$, $x=2$ ou $x=-2$ : trois solutions.'),
        R('Piège', r'Ne pas diviser les deux membres par $x$ : dans $x^3=4x$, on perdrait la solution $x=0$.'),
    ]),
    ('Signe d’une expression', 'Étudier le signe d’une expression', [
        X('fa1c5', '2L31-1', 3, 'Résoudre une inéquation produit'),
        X('0c09b', '2L31-2', 3, 'Résoudre une inéquation quotient'),
        X('a7860', '2F32-3', 2, 'Lire un tableau de signes sur un graphique'),
    ], [
        T(r'Pour calculer l’aire entre deux courbes, il faut savoir laquelle est au-dessus : c’est le signe de $f(x)-g(x)$. Le signe de la dérivée donne aussi les variations d’une fonction.'),
        R('Tableau de signes', r'1. Factoriser l’expression.' '\n' r'2. Chercher le zéro de chaque facteur : $ax+b$ s’annule en $x=-\dfrac{b}{a}$ et a le signe de $a$ à sa droite.' '\n' r'3. Une ligne par facteur, puis la dernière ligne par la règle des signes.' '\n' r'4. Dans un quotient, une valeur qui annule le dénominateur est interdite (double barre).'),
        E('Un produit', r'Étudier le signe de $f(x)=(x-1)(x+3)$.', [
            r'Zéros : $x=1$ et $x=-3$.',
            r'Pour $x<-3$ : deux facteurs négatifs, $f(x)>0$. Pour $-3<x<1$ : $(x-1)<0$ et $(x+3)>0$, $f(x)<0$. Pour $x>1$ : $f(x)>0$.',
            r'Donc $f(x)<0$ exactement sur $]-3\,;1[$.',
        ]),
        QC(r'Pour quels $x$ a-t-on $\dfrac{x-2}{x+1}\leqslant0$ ?', [r'$]-1\,;2]$', r'$[-1\,;2]$', r'$]-\infty\,;-1[\,\cup\,[2\,;+\infty[$'],
           r'Le numérateur s’annule en $2$ (valeur comprise, car on accepte $0$) ; $-1$ est interdit. Entre les deux, le numérateur est négatif et le dénominateur positif : le quotient est négatif.'),
    ]),
    ('Limites', 'Calculer une limite', [
        X('34de8', '3mLimCont-2', 3, 'Lire une limite sur un graphique'),
        X('0c3d9', '3mLimCont-3', 2, 'Compléter un tableau de limites'),
        X('04b1e', '3mLimCont-1', 3, 'Limite d’une fonction rationnelle'),
    ], [
        T('Les limites décrivent une fonction au bord de son domaine : asymptotes, puis, plus tard, les limites avec le logarithme et l’exponentielle.'),
        R('En l’infini', r'Pour une fonction rationnelle, seuls les termes de plus haut degré comptent : $\displaystyle\lim_{x\to+\infty}\dfrac{2x^2+1}{x^2-3x}=\lim_{x\to+\infty}\dfrac{2x^2}{x^2}=2$.'),
        R('Près d’une valeur interdite', r'- Numérateur vers un nombre non nul, dénominateur vers $0$ : la limite est infinie (asymptote verticale) ; son signe se lit de chaque côté avec un tableau de signes.' '\n' r'- Numérateur et dénominateur vers $0$ : factoriser et simplifier, puis remplacer.'),
        E('Forme « 0/0 »', r'Calculer $\displaystyle\lim_{x\to2}\dfrac{x^2-4}{x-2}$.', [
            r'En $x=2$, numérateur et dénominateur valent $0$ : on factorise.',
            r'$\dfrac{(x-2)(x+2)}{x-2}=x+2$ pour $x\neq2$, donc la limite vaut $2+2=4$.',
        ]),
        E('Asymptote verticale', r'Calculer $\displaystyle\lim_{x\to1^+}\dfrac{3}{x-1}$.', [
            r'Le numérateur vaut $3$ et le dénominateur tend vers $0$ en restant positif ($x>1$).',
            r'La limite vaut $+\infty$ : la droite $x=1$ est une asymptote verticale.',
        ]),
        QN(r'Que vaut $\displaystyle\lim_{x\to+\infty}\dfrac{6x-1}{2x+5}$ ?', 3, r'En l’infini, on garde les termes de plus haut degré : $\dfrac{6x}{2x}=3$.'),
    ]),
    ('Dériver', 'Dériver une fonction', [
        X('ec088', '1AN14-3', 3, 'Dériver un polynôme'),
        X('a83c0', '3mA2-3', 3, 'Dériver une somme : polynôme, inverse, racine'),
        X('3391d', '1AN14-7', 2, 'Dériver une fonction du type u(ax+b)'),
    ], [
        T('Chercher une primitive, c’est dériver à l’envers : les règles de dérivation doivent être sûres avant le calcul intégral.'),
        R('Règles de base', r'- $(k)^{\prime}=0$ et $\left(x^n\right)^{\prime}=n\,x^{n-1}$, aussi pour un exposant négatif ou fractionnaire' '\n' r'- $(k\cdot u)^{\prime}=k\cdot u^{\prime}$ et $(u+v)^{\prime}=u^{\prime}+v^{\prime}$' '\n' r'- $\big(u(ax+b)\big)^{\prime}=a\cdot u^{\prime}(ax+b)$'),
        E('Avec des puissances', r'Dériver $f(x)=3x^4-\dfrac{2}{x}+\sqrt{x}$.', [
            r'On écrit des puissances : $f(x)=3x^4-2x^{-1}+x^{\frac12}$.',
            r'$f^{\prime}(x)=12x^3+2x^{-2}+\dfrac12x^{-\frac12}=12x^3+\dfrac{2}{x^2}+\dfrac{1}{2\sqrt{x}}$.',
        ]),
        E('Du type u(ax+b)', r'Dériver $g(x)=(5x-2)^3$.', [
            r'$u(t)=t^3$, $u^{\prime}(t)=3t^2$, avec $a=5$.',
            r'$g^{\prime}(x)=5\cdot3\,(5x-2)^2=15\,(5x-2)^2$.',
        ]),
        QN(r'$f(x)=x^3-6x$. Que vaut $f^{\prime}(2)$ ?', 6, r'$f^{\prime}(x)=3x^2-6$, donc $f^{\prime}(2)=3\cdot4-6=6$.'),
    ]),
    ('Tangente', 'Déterminer une tangente', [
        X('4c8c7', '1AN11-3', 3, 'Déterminer une équation de tangente', sup='2-3'),  # polynômes (le cas 1 est da914)
        X('da914', '1Tec-D13', 2, 'Tangente avec image et nombre dérivé'),
        X('8c073', '1AN11-5', 3, 'Lire un nombre dérivé sur la tangente'),
    ], [
        T(r'Le nombre dérivé $f^{\prime}(a)$ est la pente de la tangente au point d’abscisse $a$. Les études de fonctions avec le logarithme et l’exponentielle s’en servent sans cesse.'),
        R('Équation de la tangente', r'La tangente à la courbe de $f$ au point d’abscisse $a$ a pour équation' '\n' r'$$y=f^{\prime}(a)\,(x-a)+f(a)$$' '\n' r'Il faut deux nombres : $f(a)$ (le point de contact) et $f^{\prime}(a)$ (la pente).'),
        E('Calcul', r'Déterminer la tangente à la courbe de $f(x)=x^2-3x$ au point d’abscisse $a=1$.', [
            r'$f(1)=1-3=-2$.',
            r'$f^{\prime}(x)=2x-3$, donc $f^{\prime}(1)=-1$.',
            r'$y=-1\cdot(x-1)-2$, soit $y=-x-1$.',
        ]),
        QN(r'La tangente à la courbe de $f$ au point d’abscisse $a$ passe par $(0\,;1)$ et $(2\,;5)$. Que vaut $f^{\prime}(a)$ ?', 2,
           r'$f^{\prime}(a)$ est la pente de la tangente : $\dfrac{5-1}{2-0}=2$.'),
        R('Piège', r'$f^{\prime}(a)$ est un nombre : on calcule d’abord $f^{\prime}(x)$, puis on remplace $x$ par $a$. Remplacer avant de dériver donne la dérivée d’une constante, $0$.'),
    ]),
]

etapes, paliers, objectifs = [], [], []
for k, (titre, objectif, ex, blocs) in enumerate(CEINTURES):
    etapes += [{**e, 'objectifs': [objectif]} for e in ex]
    objectifs.append({'libelle': objectif, 'niveau': NIVEAU, 'theme': THEME})
    paliers.append({'titre': titre, 'nb': len(ex), **({'acces': 'seuil', 'seuil': 80} if k else {}),
                    'fiche': {'titre': titre, 'avant': True, 'blocs': blocs}})
noms = [c[0] for c in CEINTURES]
parcours = {
    'id': ID, 'version': VERSION, 'titre': 'Prérequis pour l’analyse',
    'objectif': 'Revoir les calculs dont l’analyse de 4e a besoin : puissances, factorisation, équations, signe, limites, dérivées et tangente.',
    'auteurs': AUTEURS,
    'descriptionEleves': 'Avant le calcul intégral et le logarithme : sept ceintures pour revoir les puissances, la factorisation, les équations, le signe d’une expression, les limites, les dérivées et la tangente. Chaque ceinture s’ouvre sur une fiche de cours ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    'descriptionEnseignant': 'Entrée des parcours « Calcul intégral » et « Exponentielle et logarithme ». Sept ceintures de trois exercices ciblés, de la blanche à la noire : ' + ' ; '.join(noms) + '. Une fiche de cours précède chaque ceinture ; la suivante se débloque à 80 %. La ceinture noire mène aux premières ceintures des deux parcours (dérivée d’une fonction composée, logarithme naturel).',
    'niveau': NIVEAU, 'theme': THEME, 'difficulte': 2, 'icone': 'bx-line-chart',
    'presentation': 'une_question_par_page', 'correction': 'question', 'enTetesMasques': True, 'melanger': True,
    'style': 'ceintures', 'premiereCeinture': 0, 'paliers': paliers, 'etapes': etapes,
}

donnees = json.loads(FICHIER.read_text())
classe = next(c for c in donnees['classes'] if c['nom'] == NIVEAU)
classe['parcours'] = [parcours] + [p for p in classe['parcours'] if p['id'] != ID]
# Bibliothèque du fichier : l'app exige sa liste de parcours (vide ici), à côté des objectifs
biblio = donnees.setdefault('bibliotheque', {})
biblio.setdefault('parcours', [])
biblio['objectifs'] = [o for o in biblio.get('objectifs', []) if o['theme'] != THEME or o['niveau'] != NIVEAU] + objectifs
FICHIER.write_text(json.dumps(donnees, ensure_ascii=False, indent=2) + '\n')
print(f'{FICHIER.name} : {ID}, {len(paliers)} ceintures, {len(etapes)} étapes')
