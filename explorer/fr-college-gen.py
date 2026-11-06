# Écrit explorer/fr-college.json : premiers parcours de l'Explorer France
# (novembre 2026), simples, pour que l'Explorer français ne soit pas vide.
# Relancer ce script remplace le fichier.
import json
from pathlib import Path

AUTEURS = ['Claude Opus 5.5', 'Nathan Scheinmann']


def ceinture(titre, retenir, exemple, question):
    """Fiche d'une ceinture : la règle, un exemple résolu, une petite question non notée"""
    return {
        'titre': titre,
        'avant': True,
        'blocs': [
            {'type': 'retenir', 'titre': 'À retenir', 'texte': retenir},
            {'type': 'exemple', 'titre': 'Exemple', 'enonce': exemple[0], 'etapes': exemple[1]},
            {'type': 'question', 'enonce': question[0], 'choix': question[1], 'bonne': question[2], 'explication': question[3]},
        ],
    }


def parcours(id, titre, niveau, objectif, eleves, enseignant, ceintures):
    etapes, paliers = [], []
    for k, (titre_c, exercice, fiche) in enumerate(ceintures):
        uuid, ref, titre_e = exercice
        etapes.append({'uuid': uuid, 'id': ref, 'titre': titre_e, 'nbQuestions': 4})
        palier = {'titre': titre_c, 'nb': 1, 'fiche': fiche}
        if k:
            palier |= {'acces': 'seuil', 'seuil': 80}
        paliers.append(palier)
    return {
        'id': id,
        'version': 1,
        'titre': titre,
        'objectif': objectif,
        'auteurs': AUTEURS,
        'descriptionEleves': eleves,
        'descriptionEnseignant': enseignant,
        'niveau': niveau,
        'theme': 'Nombres et calculs',
        'difficulte': 1,
        'icone': 'bx-medal',
        'presentation': 'une_question_par_page',
        'correction': 'question',
        'style': 'ceintures',
        'etapes': etapes,
        'paliers': paliers,
    }


relatifs = parcours(
    'fr-5e-relatifs-addition',
    'Additionner et soustraire des relatifs',
    '5e',
    'Additionner et soustraire des nombres relatifs, puis enchaîner les calculs.',
    'Trois ceintures : additionner, soustraire, puis enchaîner les deux. Chaque ceinture s’ouvre sur une fiche de cours ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    'Trois ceintures de quatre questions (blanche, jaune, orange) : 5R20, 5R21, 5R22. Fiche courte avant chaque ceinture : règle, exemple résolu, question non notée.',
    [
        (
            'Additionner deux relatifs',
            ('cbc26', '5R20', 'Additionner deux relatifs'),
            ceinture(
                'Additionner deux relatifs',
                'Deux nombres de même signe : on additionne leurs distances à zéro et on garde ce signe. Deux nombres de signes contraires : on soustrait la plus petite distance à zéro de la plus grande, et on prend le signe du nombre le plus éloigné de zéro.',
                ('Calculer $(-7)+(+3)$.', [
                    'Les signes sont contraires : on compare les distances à zéro, $7$ et $3$.',
                    '$7-3=4$, et c’est $-7$ qui est le plus éloigné de zéro : le résultat est négatif.',
                    '$(-7)+(+3)=-4$.',
                ]),
                ('Combien vaut $(-5)+(-6)$ ?', ['$-1$', '$-11$', '$+11$'], 1,
                 'Les deux nombres sont négatifs : on additionne leurs distances à zéro, $5+6=11$, et on garde le signe « $-$ ». Donc $(-5)+(-6)=-11$.'),
            ),
        ),
        (
            'Soustraire deux relatifs',
            ('b6982', '5R21', 'Soustraire deux relatifs'),
            ceinture(
                'Soustraire deux relatifs',
                'Soustraire un nombre, c’est ajouter son opposé : $a-b=a+(-b)$. On transforme d’abord la soustraction en addition, puis on applique la règle de l’addition.',
                ('Calculer $(+4)-(-9)$.', [
                    'On ajoute l’opposé de $-9$, c’est-à-dire $+9$ : $(+4)-(-9)=(+4)+(+9)$.',
                    'Les deux nombres sont positifs : $4+9=13$.',
                    '$(+4)-(-9)=+13$.',
                ]),
                ('Combien vaut $(-3)-(+8)$ ?', ['$+5$', '$-5$', '$-11$'], 2,
                 'On ajoute l’opposé de $+8$ : $(-3)-(+8)=(-3)+(-8)$. Les deux nombres sont négatifs : $3+8=11$, donc le résultat est $-11$.'),
            ),
        ),
        (
            'Enchaîner additions et soustractions',
            ('f6ea7', '5R22', 'Enchaîner additions et soustractions'),
            ceinture(
                'Enchaîner additions et soustractions',
                'Dans une suite d’additions et de soustractions, on remplace chaque soustraction par l’addition de l’opposé. On peut alors regrouper les nombres positifs d’un côté et les négatifs de l’autre.',
                ('Calculer $(-2)-(-5)+(-6)$.', [
                    'Soustraire $-5$, c’est ajouter $+5$ : $(-2)+(+5)+(-6)$.',
                    'Les positifs : $+5$. Les négatifs : $(-2)+(-6)=-8$.',
                    '$(+5)+(-8)=-3$.',
                ]),
                ('Combien vaut $(+7)-(+10)+(-1)$ ?', ['$-4$', '$-2$', '$+4$'], 0,
                 'On écrit $(+7)+(-10)+(-1)$. Les positifs : $+7$ ; les négatifs : $-11$. Et $(+7)+(-11)=-4$.'),
            ),
        ),
    ],
)

fractions = parcours(
    'fr-4e-fractions',
    'Fractions : simplifier, additionner, multiplier',
    '4e',
    'Simplifier une fraction, additionner des fractions, multiplier et diviser des fractions.',
    'Trois ceintures : simplifier, additionner, puis multiplier et diviser. Chaque ceinture s’ouvre sur une fiche de cours ; tu passes à la suivante à partir de 80 % de réponses correctes.',
    'Trois ceintures de quatre questions (blanche, jaune, orange) : 5N13, 4C21, 4C22. Fiche courte avant chaque ceinture : règle, exemple résolu, question non notée.',
    [
        (
            'Simplifier une fraction',
            ('f8f4e', '5N13', 'Simplifier une fraction'),
            ceinture(
                'Simplifier une fraction',
                'On simplifie une fraction en divisant son numérateur et son dénominateur par un même nombre, un diviseur commun aux deux. La fraction est irréductible quand leur seul diviseur commun est $1$.',
                ('Simplifier $\\dfrac{18}{24}$.', [
                    '$18$ et $24$ sont tous les deux divisibles par $6$.',
                    '$\\dfrac{18}{24}=\\dfrac{18\\div6}{24\\div6}=\\dfrac{3}{4}$.',
                    '$3$ et $4$ n’ont que $1$ comme diviseur commun : $\\dfrac{3}{4}$ est irréductible.',
                ]),
                ('Quelle fraction est égale à $\\dfrac{15}{35}$ ?', ['$\\dfrac{1}{2}$', '$\\dfrac{3}{7}$', '$\\dfrac{5}{7}$'], 1,
                 'On divise $15$ et $35$ par $5$ : $\\dfrac{15\\div5}{35\\div5}=\\dfrac{3}{7}$.'),
            ),
        ),
        (
            'Additionner des fractions',
            ('5f429', '4C21', 'Additionner des fractions'),
            ceinture(
                'Additionner des fractions',
                'Pour additionner deux fractions, on les écrit d’abord avec le même dénominateur. On additionne ensuite les numérateurs et on garde ce dénominateur.',
                ('Calculer $\\dfrac{2}{3}+\\dfrac{1}{6}$.', [
                    '$6$ est un multiple de $3$ : $\\dfrac{2}{3}=\\dfrac{2\\times2}{3\\times2}=\\dfrac{4}{6}$.',
                    '$\\dfrac{4}{6}+\\dfrac{1}{6}=\\dfrac{5}{6}$.',
                ]),
                ('Combien vaut $\\dfrac{1}{4}+\\dfrac{3}{8}$ ?', ['$\\dfrac{4}{12}$', '$\\dfrac{4}{8}$', '$\\dfrac{5}{8}$'], 2,
                 '$\\dfrac{1}{4}=\\dfrac{2}{8}$, donc $\\dfrac{2}{8}+\\dfrac{3}{8}=\\dfrac{5}{8}$. On n’additionne jamais les dénominateurs.'),
            ),
        ),
        (
            'Multiplier et diviser des fractions',
            ('72ce7', '4C22', 'Multiplier et diviser des fractions'),
            ceinture(
                'Multiplier et diviser des fractions',
                'Pour multiplier deux fractions, on multiplie les numérateurs entre eux et les dénominateurs entre eux. Diviser par une fraction, c’est multiplier par son inverse.',
                ('Calculer $\\dfrac{3}{5}\\div\\dfrac{9}{10}$.', [
                    'L’inverse de $\\dfrac{9}{10}$ est $\\dfrac{10}{9}$ : $\\dfrac{3}{5}\\div\\dfrac{9}{10}=\\dfrac{3}{5}\\times\\dfrac{10}{9}$.',
                    '$=\\dfrac{3\\times10}{5\\times9}=\\dfrac{30}{45}$.',
                    'On simplifie par $15$ : $\\dfrac{30}{45}=\\dfrac{2}{3}$.',
                ]),
                ('Combien vaut $\\dfrac{2}{7}\\times\\dfrac{3}{4}$ ?', ['$\\dfrac{3}{14}$', '$\\dfrac{5}{11}$', '$\\dfrac{6}{11}$'], 0,
                 '$\\dfrac{2\\times3}{7\\times4}=\\dfrac{6}{28}$, puis on simplifie par $2$ : $\\dfrac{3}{14}$.'),
            ),
        ),
    ],
)

fichier = {
    'format': 'classes-mathalea/1',
    'exporteLe': '2026-11-06T08:00:00.000Z',
    'classes': [{'nom': 'Explorer France', 'parcours': [relatifs, fractions]}],
}
Path(__file__).with_name('fr-college.json').write_text(json.dumps(fichier, ensure_ascii=False, indent=2) + '\n')
