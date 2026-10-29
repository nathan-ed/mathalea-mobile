import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / 'mathalea-mobile'
# Catalogue le plus récent : le worktree propre d'abord, le dépôt principal sinon.
CAT_DIR = next(d for d in (ROOT / 'mathalea-evacom/src/json', ROOT / 'mathalea/src/json') if (d / 'exercicesCH.json').exists())
CAT_CH = json.loads((CAT_DIR / 'exercicesCH.json').read_text())
CAT_FR = json.loads((CAT_DIR / 'exercicesFR.json').read_text())
BY_UUID = {}
for item in list(CAT_FR.values())+list(CAT_CH.values()):
    if item.get('features', {}).get('interactif', {}).get('isActive') and 'old' not in item.get('url', '').lower() and 'xxx' not in item.get('url', '').lower():
        BY_UUID[item['uuid']] = item

# Une ceinture : titre, deux savoir-faire évalués, règle, exemple corrigé, question courte.
# Chaque savoir-faire a deux exercices, avec trois questions demandées par exercice.
# Le second exercice « triangle rectangle ou non » n'est pas classé en fr-CH.
B = {
 'TAF': [
  ('Lire et placer les nombres', [('Placer et comparer des nombres', '6d577 b8e31'), ('Relier fraction, décimal et pourcentage', '2359a 91d72')],
   'Sur une droite graduée, on repère le pas entre deux traits avant de placer un nombre. Un pourcentage est une fraction dont le dénominateur est 100.',
   'Placer 0,5 sur une droite graduée de 0 à 1.', ['0,5 est la moitié de 1.', 'On place donc le point au milieu entre 0 et 1.'],
   'Quelle écriture vaut 50 % ?', ['0,5', '0,05', '5'], 0, '50 % = 50/100 = 0,5.'),
  ('Respecter l’ordre des calculs', [('Calculer avec des décimaux', '01873 52939'), ('Appliquer les priorités', '4c10a 2d79c'), ('Substituer dans une expression', '17e39 d05d3')],
   'On calcule d’abord ce qui est entre parenthèses, puis les puissances, les produits et les quotients, enfin les sommes et les différences.',
   'Calculer 4 + 3 × 2.', ['On calcule le produit : 3 × 2 = 6.', 'On ajoute 4 : le résultat est 10.'],
   'Que vaut 4 + 3 × 2 ?', ['10', '14', '18'], 0, 'La multiplication précède l’addition : 4 + 6 = 10.'),
  ('Calculer avec les fractions', [('Additionner et soustraire des fractions', '51ab4 5f429'), ('Simplifier et décomposer', 'f8f4e 7f50c')],
   'Pour additionner des fractions, on les écrit avec un même dénominateur. On simplifie le résultat si le numérateur et le dénominateur ont un diviseur commun.',
   'Calculer 1/2 + 1/4.', ['1/2 = 2/4.', '2/4 + 1/4 = 3/4.'],
   'Que vaut 1/2 + 1/4 ?', ['3/4', '2/6', '1/6'], 0, 'On garde le dénominateur commun : 2/4 + 1/4 = 3/4.'),
  ('Fractions et pourcentages en situation', [('Prendre une fraction d’une quantité', 'ddb83 e81fe'), ('Calculer un pourcentage et un complément', 'fb422 612a5'), ('Utiliser la proportionnalité', 'f7a15 091ac')],
   'Prendre trois quarts d’une quantité revient à la partager en quatre parts égales, puis à en prendre trois. Pour 20 %, on prend 20 centièmes.',
   'Calculer les trois quarts de 20.', ['Un quart de 20 vaut 5.', 'Trois quarts valent 3 × 5 = 15.'],
   'Quel est 25 % de 80 ?', ['20', '25', '40'], 0, '25 % est un quart ; un quart de 80 vaut 20.'),
  ('Convertir les unités', [('Convertir longueurs et durées', '504ae 4f8f4'), ('Convertir aires et volumes', '6225c f4d29')],
   'Pour une longueur, deux unités voisines diffèrent d’un facteur 10. Pour une aire, ce facteur vaut 100 ; pour un volume, 1 000. Une heure vaut 60 minutes.',
   'Convertir 2 h 30 min en minutes.', ['2 h = 120 min.', '120 min + 30 min = 150 min.'],
   'Combien de minutes font 2 h 30 min ?', ['150', '230', '120'], 0, 'Deux heures font 120 minutes ; on ajoute 30 minutes.'),
  ('Mesurer des figures planes', [('Calculer périmètres et aires', '065d1 f9a03'), ('Travailler les portions de disque', '5db4b ff387'), ('Reconnaître et mesurer des angles', '1f334 ff2ce')],
   'Le périmètre mesure le contour ; l’aire mesure la surface. Pour un cercle de rayon r, le périmètre vaut 2πr et l’aire vaut πr².',
   'Calculer le périmètre d’un cercle de rayon 3 cm.', ['La formule est 2πr.', 'Avec r = 3 cm, on obtient 6π cm.'],
   'Quel est le périmètre d’un cercle de rayon 3 cm ?', ['6π cm', '9π cm', '3π cm'], 0, 'On utilise 2πr, soit 2 × π × 3 = 6π cm.'),
  ('Résoudre des problèmes géométriques', [('Utiliser Pythagore', 'bd660 b18e8'), ('Calculer des volumes usuels', 'c7b58 e4c72'), ('Reconnaître des solides et des patrons', '051aa f57fe')],
   'Dans un triangle rectangle, le carré de l’hypoténuse égale la somme des carrés des deux autres côtés. Le volume d’un cylindre vaut l’aire de sa base multipliée par sa hauteur.',
   'Trouver l’hypoténuse d’un triangle rectangle de côtés 3 cm et 4 cm.', ['Son carré vaut 3² + 4² = 25.', 'L’hypoténuse mesure donc 5 cm.'],
   'Quelle est l’hypoténuse de ce triangle ?', ['5 cm', '7 cm', '25 cm'], 0, 'On calcule √(3² + 4²) = √25 = 5 cm.'),
 ],
 '11LC': [
  ('Calculer avec les fractions', [('Additionner et soustraire des fractions', '51ab4 5f429'), ('Multiplier et diviser des fractions', '3ee4e 55354'), ('Prendre une fraction ou un pourcentage', 'ddb83 612a5')],
   'Une somme exige un dénominateur commun. Pour multiplier, on multiplie les numérateurs entre eux et les dénominateurs entre eux. Diviser par une fraction revient à multiplier par son inverse.',
   'Calculer 2/3 + 1/6.', ['2/3 = 4/6.', '4/6 + 1/6 = 5/6.'],
   'Que vaut 2/3 + 1/6 ?', ['5/6', '3/9', '3/6'], 0, 'On convertit 2/3 en 4/6 avant d’additionner.'),
  ('Puissances et écritures des nombres', [('Calculer puissances et racines simples', 'eb865 f5cbd'), ('Utiliser la notation scientifique', 'a0d17 762fe')],
   'Une puissance répète une multiplication ; la racine carrée d’un carré parfait redonne son côté positif. En notation scientifique, le nombre devant la puissance de 10 est au moins 1 et inférieur à 10.',
   'Écrire 32 000 en notation scientifique.', ['32 000 = 3,2 × 10 000.', 'Donc 32 000 = 3,2 × 10⁴.'],
   'Quelle écriture est scientifique pour 32 000 ?', ['3,2 × 10⁴', '32 × 10³', '0,32 × 10⁵'], 0, 'Le nombre placé devant 10⁴ doit être compris entre 1 et 10.'),
  ('Calcul littéral : comprendre et réduire', [('Substituer une valeur', '17e39 d05d3'), ('Réduire une expression', '85d2d cc129')],
   'Remplacer une lettre par un nombre demande de conserver les parenthèses, surtout si le nombre est négatif. On additionne seulement les termes de même nature.',
   'Calculer 2x + 3 pour x = −4.', ['On remplace x : 2 × (−4) + 3.', 'Le résultat est −8 + 3 = −5.'],
   'Combien vaut 2x + 3 pour x = −4 ?', ['−5', '−11', '5'], 0, '2 × (−4) + 3 = −8 + 3 = −5.'),
  ('Développer et transformer', [('Développer une expression', '56a2d 1cd08'), ('Isoler une grandeur dans une formule', 'c42f7 96bac')],
   'Développer, c’est multiplier chaque terme d’une parenthèse. Pour isoler une grandeur, on applique la même opération inverse aux deux membres.',
   'Développer 3(x + 2).', ['3 multiplie x et 2.', 'On obtient 3x + 6.'],
   'Que vaut 3(x + 2) ?', ['3x + 6', '3x + 2', 'x + 6'], 0, 'La distributivité donne 3 × x + 3 × 2.'),
  ('Mettre en équation et résoudre', [('Traduire une situation', '5a6f2 2d15c'), ('Résoudre une équation', '12d4b 23bdc')],
   'On choisit une inconnue, on écrit une égalité qui traduit les données, puis on effectue la même transformation dans les deux membres.',
   'Résoudre 3x + 2 = 14.', ['On soustrait 2 : 3x = 12.', 'On divise par 3 : x = 4.'],
   'Quelle valeur résout 3x + 2 = 14 ?', ['4', '6', '12'], 0, '3 × 4 + 2 = 14.'),
  ('Pythagore et mesures du plan', [('Calculer une longueur avec Pythagore', 'bd660 b18e8'), ('Vérifier si un triangle est rectangle', 'ab5d4 5344c'), ('Calculer aires et portions de disque', 'f9a03 ff387')],
   'Avant Pythagore, on repère le plus grand côté. Pour une aire de disque, on élève le rayon au carré avant de multiplier par π.',
   'Un triangle rectangle a pour côtés de l’angle droit 6 cm et 8 cm. Trouver l’hypoténuse.', ['Son carré vaut 6² + 8² = 100.', 'L’hypoténuse mesure 10 cm.'],
   'Quelle est l’hypoténuse ?', ['10 cm', '14 cm', '100 cm'], 0, '√(6² + 8²) = √100 = 10 cm.'),
  ('Résoudre des problèmes composés', [('Résoudre un problème par équation', 'cd2f2 b9e01'), ('Calculer une grandeur manquante', '96bac 6999f')],
   'Dans un problème à plusieurs étapes, on écrit ce que représente l’inconnue et on garde les unités. On vérifie le résultat dans la situation initiale.',
   'Un rectangle a une aire de 24 cm² et une longueur de 6 cm. Trouver sa largeur.', ['Aire = longueur × largeur.', 'La largeur vaut 24 ÷ 6 = 4 cm.'],
   'Quelle est la largeur ?', ['4 cm', '18 cm', '144 cm'], 0, 'La grandeur manquante est 24 ÷ 6 = 4 cm.'),
 ],
 '11LS': [
  ('Fractions, puissances et carrés', [('Calculer avec les fractions', '51ab4 3ee4e'), ('Calculer puissances et carrés', 'eb865 f5cbd')],
   'Une somme de fractions demande un dénominateur commun. Une puissance est un produit répété ; la racine carrée de 49 est le nombre positif dont le carré vaut 49.',
   'Calculer 1/2 + 1/3.', ['On choisit le dénominateur 6 : 1/2 = 3/6 et 1/3 = 2/6.', 'La somme vaut 5/6.'],
   'Que vaut 1/2 + 1/3 ?', ['5/6', '2/5', '1/6'], 0, '3/6 + 2/6 = 5/6.'),
  ('Calculer avec les racines', [('Extraire un facteur d’une racine', 'd9495 99b29'), ('Simplifier et encadrer des racines', '12b72 516d2')],
   'On extrait d’une racine un facteur carré parfait. On additionne ensuite seulement les racines qui portent sur le même nombre.',
   'Simplifier √75.', ['75 = 25 × 3.', '√75 = √25 × √3 = 5√3.'],
   'Quelle est la forme simplifiée de √75 ?', ['5√3', '25√3', '3√5'], 0, 'On extrait le carré parfait 25.'),
  ('Notation scientifique et lettres', [('Utiliser la notation scientifique', 'a0d17 762fe'), ('Substituer et réduire', '17e39 85d2d')],
   'La notation scientifique écrit un nombre sous la forme a × 10ⁿ avec 1 ≤ a < 10. En calcul littéral, on ne regroupe que les termes de même nature.',
   'Réduire 3x + 2x − 4.', ['3x et 2x sont des termes de même nature.', 'L’expression devient 5x − 4.'],
   'Que vaut 3x + 2x − 4 ?', ['5x − 4', '5x', 'x − 4'], 0, 'On ajoute 3x et 2x ; le terme constant reste −4.'),
  ('Développer avec les identités', [('Développer des produits', '1cd08 877a9'), ('Reconnaître les identités remarquables', '5a4ad 7f0cf')],
   'Le carré d’une somme contient trois termes : a² + 2ab + b². Le terme du milieu apparaît deux fois dans le produit.',
   'Développer (x + 3)².', ['(x + 3)² = (x + 3)(x + 3).', 'On obtient x² + 6x + 9.'],
   'Quel est le terme du milieu de (x + 3)² ?', ['6x', '3x', '9x'], 0, 'Le terme du milieu vaut 2 × x × 3 = 6x.'),
  ('Factoriser et résoudre', [('Factoriser une expression', '0ee90 0bd00'), ('Factoriser un trinôme x² + bx + c', '8cb63'), ('Résoudre des équations', '23bdc b9e01')],
   'Factoriser, c’est écrire une somme sous forme de produit. Pour x² + bx + c, on cherche deux nombres dont la somme vaut b et le produit vaut c : si ce sont p et q, alors x² + bx + c = (x + p)(x + q). Une équation du premier degré se résout en conservant l’égalité à chaque étape.',
   'Factoriser x² + 13x + 40.', ['On cherche deux nombres de somme 13 et de produit 40.', '5 + 8 = 13 et 5 × 8 = 40.', 'Donc x² + 13x + 40 = (x + 5)(x + 8).'],
   'Quelle factorisation de x² + 2x − 15 convient ?', ['(x + 5)(x − 3)', '(x − 5)(x + 3)', '(x + 5)(x + 3)'], 0, 'On cherche deux nombres de somme 2 et de produit −15 : 5 et −3, car 5 + (−3) = 2 et 5 × (−3) = −15.'),
  ('Formules et géométrie', [('Transformer une formule', '96bac 14e86'), ('Appliquer Pythagore', 'bd660 b18e8'), ('Vérifier si un triangle est rectangle', 'ab5d4 5344c')],
   'Pour isoler une lettre, on applique une opération inverse dans les deux membres. Pour vérifier qu’un triangle est rectangle, on compare le carré du plus long côté à la somme des carrés des deux autres.',
   'Un triangle a des côtés de 5 cm, 12 cm et 13 cm. Est-il rectangle ?', ['13² = 169.', '5² + 12² = 25 + 144 = 169 : il est rectangle.'],
   'Ce triangle est-il rectangle ?', ['Oui', 'Non', 'On ne peut pas savoir'], 0, 'Les deux calculs donnent 169 : la réciproque de Pythagore s’applique.'),
  ('Solides et volumes', [('Reconnaître des solides et leurs patrons', '051aa f57fe'), ('Calculer des volumes simples', '6ec4a c7b58'), ('Calculer les volumes de pyramides, cônes et boules', 'f0128 f0d92 c2f91'), ('Calculer le volume d’un solide composé', '8473d')],
   'Le volume d’un prisme ou d’un cylindre vaut aire de la base × hauteur. Pour une pyramide ou un cône, on divise encore par 3. Pour une boule, on utilise 4πr³/3. Pour un solide composé, on calcule le volume de chaque partie puis on les additionne, ou on retranche le volume du trou.',
   'Calculer le volume d’un cône de rayon 3 cm et de hauteur 4 cm.', ['Aire de la base : π × 3² = 9π cm².', 'Volume : 9π × 4 ÷ 3 = 12π cm³.'],
   'Quel est le volume de ce cône ?', ['12π cm³', '36π cm³', '9π cm³'], 0, 'On multiplie l’aire de la base par la hauteur, puis on divise par 3.'),
 ],
}

PRQ = json.loads((APP/'explorer/prequalifiant.json').read_text())
KNOWN = {}
for p in PRQ['classes'][0]['parcours']:
    for e in p['etapes']:
        KNOWN.setdefault(e['uuid'], {k:e[k] for k in ('sup','sup2','sup3','sup4') if k in e})

def stage(uuid, objective, filiere):
    item=BY_UUID.get(uuid)
    if item is None: raise ValueError(f'UUID non interactif ou absent des référentiels : {uuid}')
    params=dict(KNOWN.get(uuid,{}))
    if uuid=='ab5d4': params.update({'sup':'3','sup2':'true'})
    if uuid=='12b72': params.update({'sup':'1','sup2':'true'})
    if uuid=='ff2ce': params.update({'sup3':'1'})
    if uuid=='1cd08' and filiere=='11LC': params.update({'sup':'2','sup2':'1','sup3':'1','sup4':'1'})
    # 3L12-4 : seulement x² + bx + c par somme et produit, sans mise en évidence.
    if uuid=='8cb63': params.update({'sup':'4','sup2':'1','sup3':'1','sup4':'1'})
    return {'uuid':uuid,'id':item['id'],'nbQuestions':3,'titre':item['titre'].strip(),
            'objectifs':[f'{objective} (EVACOM {filiere})'],**params}

AUTEURS=['l’équipe CoopMaths','Nathan Scheinmann','Claude Opus 5.5','Sol']
paths=[]; objectives=[]
for filiere, belts in B.items():
    steps=[];paliers=[]
    for i,(title, groups, tip, ex, lines, question, choices, correct, explanation) in enumerate(belts):
        for label, uuids in groups:
            objectives.append({'libelle':f'{label} (EVACOM {filiere})','niveau':'11e','theme':f'EVACOM {filiere}'})
            steps.extend(stage(uuid,label,filiere) for uuid in uuids.split())
        blocks=[{'type':'retenir','texte':tip},
                {'type':'exemple','enonce':ex,'etapes':lines},
                {'type':'question','enonce':question,'choix':choices,'bonne':correct,'explication':explanation}]
        paliers.append({'titre':title,'nb':sum(len(u.split()) for _,u in groups),
                        'fiche':{'titre':title,'avant':True,'blocs':blocks},
                        **({} if i==0 else {'acces':'seuil','seuil':80})})
    paths.append({'id':f'evacom-{filiere.lower()}-revision','version':3,
                  'titre':f'Réviser l’EVACOM {filiere}',
                  'objectif':f'Réviser l’EVACOM {filiere}, ceinture par ceinture.',
                  'auteurs':AUTEURS,
                  'descriptionEleves':f'Pour réviser l’EVACOM {filiere}. Chaque ceinture reprend une famille de savoir-faire : tu lis la règle, tu étudies un exemple, puis tu t’entraînes. Tu passes à la ceinture suivante à partir de 80 % de réponses correctes.',
                  'descriptionEnseignant':f'Révision de l’EVACOM {filiere} en ceintures. Chaque ceinture s’ouvre avec une fiche de cours ; le palier suivant se débloque à 80 %. Les objectifs sont étiquetés « (EVACOM {filiere}) » pour le suivi.',
                  'niveau':'11e','theme':f'EVACOM {filiere}','difficulte':2,
                  'presentation':'une_question_par_page','correction':'question',
                  'enTetesMasques':True,'melanger':True,'style':'ceintures',
                  'premiereCeinture':0,'paliers':paliers,'etapes':steps})

data={'format':'classes-mathalea/1','exporteLe':datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z'),
      'classes':[{'nom':'EVACOM 11LC','parcours':[paths[1]]},{'nom':'EVACOM 11LS','parcours':[paths[2]]},{'nom':'EVACOM TAF','parcours':[paths[0]]}],
      'bibliotheque':{'parcours':[],'objectifs':objectives}}
out=APP/'explorer/evacom-revisions.json'
out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(out)
print('parcours',len(paths),'ceintures',sum(len(p['paliers']) for p in paths),'étapes',sum(len(p['etapes']) for p in paths),'objectifs',len(objectives))
