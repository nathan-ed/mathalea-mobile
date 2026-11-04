# Revue des parcours 4M1 : intégration, exponentielle et logarithme

Relecture du 4 novembre 2026. Catalogue : `explorer/ch-4e-college.json`.
Les repères du cours et les paramètres sont synchronisés dans
`cours2627/4M1/mathalea/parcours.yml`.

## Changements pédagogiques

Le rappel des dérivées du chapitre d’intégration proposait les familles par
défaut, dont exp et ln, avant leur introduction en cours. Le mélange des
exercices pouvait aussi placer une question plus longue avant une question
d’introduction. Les deux parcours sont maintenant ordonnés (`melanger: false`)
et leurs familles sont fixées explicitement.

| Parcours | Version | Ceintures | Configurations | Questions par passage complet |
| --- | --- | --- | --- | --- |
| Calcul intégral | 4 → 5 | 8 → 10 | 16 → 27 | 33 → 29 |
| Exponentielle et logarithme | 3 → 4 | 9 → 11 | 17 → 34 | 38 → 36 |

Une configuration peut demander deux questions. Les notions sont davantage
séparées, avec plusieurs exercices par ceinture et moins de questions dans
un même passage. Chaque ceinture garde une fiche de remédiation, un exemple
résolu et deux petites questions avec explication.

### Calcul intégral

1. Degré 2 à coefficients entiers, sommes, puis puissance positive d’une affine.
2. Produits algébriques, quotient de polynômes, puis sinus ou cosinus composé.
3. Sommes de Darboux : affine avant quadratique, rectangles visibles.
4. Primitives élémentaires, puis condition initiale sur un polynôme.
5. Primitives composées : affine avec exposant positif, autres compositions,
   inverse de racine, puis condition initiale.
6. Intégrales : polynôme, autre fonction élémentaire, puis composées.
7. Moyenne : affine, problème de débit ou vitesse, puis recherche d’une borne.
8. Aire et intégrale : zéros donnés avant zéros à déterminer.
9. Aire entre courbes : intersections données avant recherche des intersections.
10. Volumes : disques avec une droite, puis couronnes entre racine et droite.

Aucune famille exp ou ln n’est autorisée dans ce parcours. Les primitives
de puissances négatives excluent l’exposant −1 : le cas 1/x attend le chapitre
sur ln. Les volumes exponentiels y sont également reportés.

### Exponentielle et logarithme

1. Équation à un seul logarithme, puis réduction en fonction de ln(x).
2. Dérivées de ln : argument affine, puissance, polynôme, puis révision du produit.
3. Primitives donnant ln : inverse d’affine, u’/u polynomial et trigonométrique,
   puis puissance de ln.
4. Domaines, translations et symétries de ln, puis limites de composées et différences.
5. Équations avec plusieurs logarithmes, regroupement et contrôle du domaine.
6. Éléments simples : numérateur constant, affine, puis coefficients fractionnaires.
7. Introduction de l’exponentielle, équation à solution entière, équation simple,
   puis deux bases différentes.
8. Dérivées de l’exponentielle : exposant affine, polynomial, puis révision du produit.
9. Primitives exponentielles, puissances, puis quotient mêlant exp ou ln.
10. Autres bases : changement de base, dérivées simples, composées, primitives.
11. Croissances comparées, aires avec exp ou ln et volumes exponentiels.

Avant la ceinture 7, e peut apparaître comme constante définie par ln(e)=1,
par exemple dans la réponse à ln(ax+b)=1. Il n’y a pas de question demandant
de dériver ou de primitiver une exponentielle de variable à ce stade.

## Pièges des paramètres vérifiés dans les générateurs

- **Puissance composée :** `4mDer-4`, famille `power`, mélange exposants
  positifs et négatifs. Pour le premier rappel, `4mDer-3`, `sup=1`, garantit
  une puissance positive d’une fonction affine. La première question reste
  un polynôme de degré 2, sans coefficients rationnels ni décimaux.
- **Produit :** dans `4mDer-5`, chaque facteur est tiré indépendamment.
  Autoriser polynômes et ln peut donc donner deux polynômes, deux logarithmes
  ou un de chaque. Même limite pour polynômes et exp. Ces étapes portent
  le libellé « Réviser la règle du produit ». Les autres questions de leurs
  ceintures imposent bien la fonction nouvelle. Le réglage actuel ne permet
  pas d’exiger exactement un facteur de chaque type.
- **Graphique de ln :** `4mExpLog-4` propose toujours quatre transformations.
  S’il y a moins de quatre cases cochées, il complète avec d’autres formes.
  Le réglage final coche donc exactement quatre formes : les deux translations
  et les deux symétries. Les valeurs absolues et la dilatation ne peuvent
  plus apparaître par complément automatique.
- **Primitives de ln :** `quotientExpLn` de `4mExpLog-2` mélange réellement
  exponentielle et logarithme. Cette famille est exclue de la première
  ceinture de primitives de ln et ne revient qu’après l’exponentielle.
- **Primitives exponentielles :** la famille `exponentielle` de ce même
  exercice inclut des exposants affines, monomiaux, racines, inverses et trigonométriques.
  Elle ne garantit pas un premier exposant affine. Le libellé est donc
  « Reconnaître u’ exp(u) » et la fiche donne la règle générale après les
  rappels de composition. Isoler une difficulté affine demanderait un filtre
  supplémentaire dans MathALÉA.
- **Inverse de racine :** dans les intégrales composées, le sélecteur
  d’exposants ne s’applique pas aux familles spéciales d’inverses de racines.
  La famille sélectionnée garantit bien une racine, même si le second champ
  du paramètre vaut `1-0-0`.
- **Équations logarithmiques :** le type dit simple de `2mLogExp-11` peut
  contenir du second degré. L’entrée utilise `2mLogExp-4` en mode ln, avec
  argument affine ; les sommes et différences sont repoussées à la ceinture 5.
- **Changement de base :** `sup=true` de `2mLogExp-10` impose ln dans la
  réécriture mais conserve des logarithmes d’autres bases dans l’énoncé.
  Cet exercice est placé à « Autres bases ».
- **Types des anciens formulaires :** `sup2=true` signifie ln dans
  `2mLogExp-3`, `-11` et `-12`, mais `2mLogExp-2` utilise le nombre 2.
  `2mLogExp-4` utilise directement `sup=2`. La conversion effective par le
  moteur a été contrôlée : nombres et booléens ne sont pas interchangeables.
- **Moteur utilisé :** `2026-11-04+4c46164a1.a879cf4`. Les sélecteurs à
  quatre familles de volumes et d’éléments simples correspondent à cette
  version. Un ancien moteur limité à trois familles ne prend pas en charge
  les familles exponentielle et affine fractionnaire ; garder le moteur
  actuel lors de la diffusion du catalogue.

## Vérifications

- Lecture des formulaires et des branches des générateurs, puis huit graines
  par configuration : 61 configurations, 520 questions générées. Contrôle de
  la longueur des sélecteurs, des champs fixés, des familles autorisées, des
  questions interactives et de l’absence d’expressions non définies.
- Contrôle des prérequis dans les énoncés et corrections : aucun exp ou ln
  dans les tirages d’intégration ; aucune exponentielle de variable avant
  son introduction dans l’autre parcours.
- 21 fiches acceptées par le lecteur réel de l’application, de 8 à 14 blocs.
  Calculs des nouveaux exemples et réponses courtes revérifiés séparément.
- Relecture des 21 planches sur téléphone, avec fiche et questions dans
  l’ordre. Les libellés distinguent les révisions de la règle du produit
  des questions qui imposent ln ou exp.
- `pnpm test` : 261 tests réussis. `pnpm check` : aucune erreur ni aucun
  avertissement. Après le dernier réglage graphique, les 36 tests du catalogue
  et de l’Explorer passent également. Synchronisation exacte du YAML, du
  catalogue et des paramètres contrôlés dans le moteur vérifiée.
- Parcours élève intégration : dix ceintures obtenues à 100 %, ouverture
  successive et dix ceintures présentes dans le suivi, aucune erreur JavaScript.
- Parcours élève exponentielle et logarithme : onze ceintures obtenues à
  100 %, ouverture successive et onze ceintures présentes dans le suivi,
  aucune erreur JavaScript. Vérification finale sur une copie isolée de
  l’application avec le moteur du 4 novembre.
- Au total, les 65 questions des deux parcours ont été réussies dans
  l’interface ; les 21 ceintures sont obtenues et affichées dans le suivi.

Ces contrôles vérifient les familles, des tirages représentatifs et la saisie
des réponses attendues. Ils ne constituent pas une démonstration automatique
de la correction de tous les tirages possibles de MathALÉA. La progression
porte sur les notions et les prérequis ; deux tirages d’une même famille
peuvent demander des calculs de longueurs différentes.

## Aperçus à relire

- [Calcul intégral : dix planches](../apercus/4m1-progression-20261104/ch-4c-integrales/index.html).
- [Exponentielle et logarithme : onze planches](../apercus/4m1-progression-20261104/ch-4c-exp-log/index.html).

## Paramètres complets dans l’ordre de passage

`n` est le nombre de questions de l’étape. Dans un formulaire complexe,
`*` sépare les champs ; les 0 et 1 sélectionnent les familles selon leur ordre
exact dans le moteur. Pour `4mExpLog-4`, la liste binaire est sans tirets.
Les réglages ci-dessous sont ceux du catalogue final.

### Calcul intégral


1. **Puissances, sommes et composées simples**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `3mA2-2` | 1 | `sup=3 ; sup2=false ; sup3=false` | degré 2 ; coefficients entiers |
| `4mDer-7` | 1 | `sup=0-0-1*1-0-0-0-0` | somme de fonctions ; polynômes |
| `4mDer-3` | 1 | `sup=1` | puissance positive de fonction affine |

2. **Produits, quotients et trigonométrie**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mDer-5` | 1 | `sup=1-0-0-0*1-1-0-0-0` | produit simple ; polynômes, racines |
| `4mDer-6` | 1 | `sup=1-0-0-0*1-0-0-0-0` | quotient simple ; polynômes |
| `4mDer-4` | 1 | `sup=0-0-0-1-1-0-0-0*0-1-0-0-0-0-0-0-0` | sinus, cosinus ; polynômes |

3. **Aire et sommes de Darboux**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-10` | 1 | `sup=1-0-0*1` | affine ; rectangles affichés |
| `4mInt-10` | 1 | `sup=0-1-0*1` | quadratique ; rectangles affichés |

4. **Primitives et condition initiale**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-1` | 1 | `sup=1-0-0-0-0-0` | polynôme |
| `4mInt-1` | 2 | `sup=0-1-1-1-1-1` | puissances négatives (hors −1), racine, inverse de racine, sinus, cosinus |
| `4mInt-3` | 1 | `sup=1-0-0-0-0-0*valeur` | polynôme ; condition F(x₀)=y₀ |

5. **Primitives de fonctions composées**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-2` | 1 | `sup=1-0-0-0-0-0-0-0*1-0-0` | affine ; exposants positifs |
| `4mInt-2` | 1 | `sup=0-1-1-1-0-0-0-0*1-0-0` | polynôme, sinus, cosinus ; exposants positifs |
| `4mInt-2` | 1 | `sup=0-0-0-0-0-1-0-0*1-0-0` | inverse de racine affine ; filtre d’exposants sans effet sur cette famille |
| `4mInt-4` | 1 | `sup=1-1-0-0-0-0-0-0*1-0-0*valeur` | affine, polynôme ; exposants positifs ; condition F(x₀)=y₀ |

6. **Calculer une intégrale**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-5` | 1 | `sup=1-0-0-0-0-0` | polynôme |
| `4mInt-5` | 1 | `sup=0-1-1-1-1-1` | puissances négatives (hors −1), racine, inverse de racine, sinus, cosinus |
| `4mInt-6` | 2 | `sup=1-1-1-1-0-1-0-0*1-1-1` | affine, polynôme, sinus, cosinus, inverse de racine affine ; exposants positifs, puissances négatives (hors −1), exposants fractionnaires |

7. **Valeur moyenne et applications**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-7` | 1 | `sup=1-0-0-0-0-0*0` | affine ; intégrale à calculer |
| `4mInt-12` | 1 | `sup=1-0-1-0` | débit, vitesse |
| `4mInt-13` | 1 | aucun | moyenne d’un polynôme, borne inconnue ; sans formulaire |

8. **Intégrale et aire géométrique**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-11` | 1 | `sup=1-0-0*1` | parabole ; zéros donnés |
| `4mInt-11` | 1 | `sup=1-1-0*0` | parabole, cubique ; zéros à trouver |

9. **Aire entre deux courbes**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-8` | 1 | `sup=1-0-0-0-0*1` | deux paraboles ; intersections données |
| `4mInt-8` | 1 | `sup=1-1-0-0-0*0` | deux paraboles, cubique ; intersections à trouver |

10. **Volumes de révolution**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mInt-9` | 1 | `sup=1-0*1-0-0-0` | disques ; droite |
| `4mInt-9` | 1 | `sup=0-1*0-0-1-0` | couronnes ; racine |

### Exponentielle et logarithme


1. **Premiers calculs avec ln**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `2mLogExp-4` | 2 | `sup=2` | équation ln d’une affine = 0 ou 1 |
| `2mLogExp-3` | 1 | `sup=1 ; sup2=true` | expression en ln(x), coefficients entiers |

2. **Dériver avec ln**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mDer-1` | 1 | `sup=1` | ln(ax+b) |
| `4mDer-1` | 1 | `sup=3` | ln d’une puissance de x |
| `4mDer-4` | 1 | `sup=0-0-0-0-0-0-0-1*0-1-0-0-0-0-0-0-0` | ln ; polynômes |
| `4mDer-5` | 1 | `sup=1-0-0-0*1-0-0-0-1` | produit simple ; polynômes, ln |

3. **Primitives avec ln**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mExpLog-1` | 1 | aucun | intégrale d’un inverse de fonction affine ; sans formulaire |
| `4mExpLog-2` | 1 | `sup=1-0-0-0-0-0-0` | u’/u polynomial |
| `4mExpLog-2` | 1 | `sup=0-1-0-0-0-0-0` | u’/u trigonométrique |
| `4mExpLog-2` | 1 | `sup=0-0-0-0-1-0-0` | puissance de ln |

4. **Graphes et limites de ln**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mExpLog-4` | 1 | `sup=1111000*1` | translations verticale et horizontale ; symétries par rapport aux deux axes ; domaines demandés |
| `4mExpLog-6` | 1 | `sup=1-0-0` | ln composé |
| `4mExpLog-6` | 1 | `sup=0-0-1` | différence de ln |

5. **Équations logarithmiques**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `2mLogExp-11` | 1 | `sup=3 ; sup2=true` | somme de logarithmes, regroupement en produit |
| `2mLogExp-11` | 1 | `sup=4 ; sup2=true` | différence de logarithmes, regroupement en quotient |

6. **Décomposition en éléments simples**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mExpLog-3` | 1 | `sup=1-0-0-0*1` | numérateur constant ; facteurs unitaires |
| `4mExpLog-3` | 1 | `sup=0-1-0-0*1` | affine ; facteurs unitaires |
| `4mExpLog-3` | 1 | `sup=0-0-0-1*0` | numérateur affine, décomposition fractionnaire ; facteurs non unitaires |

7. **Propriétés et équations exponentielles**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `2mLogExp-2` | 1 | `sup=2 ; sup2=2` | équation exponentielle, solution entière, mode ln |
| `2mLogExp-12` | 1 | `sup=1 ; sup2=true` | équation exponentielle simple, mode ln |
| `2mLogExp-12` | 1 | `sup=2 ; sup2=true` | équation exponentielle à deux bases, mode ln |

8. **Dériver avec l’exponentielle**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mDer-4` | 1 | `sup=0-0-0-0-0-0-1-0*1-0-0-0-0-0-0-0-0` | exp ; affine |
| `4mDer-4` | 1 | `sup=0-0-0-0-0-0-1-0*0-1-0-0-0-0-0-0-0` | exp ; polynômes |
| `4mDer-5` | 1 | `sup=1-0-0-0*1-0-0-1-0` | produit simple ; polynômes, exp |

9. **Primitives avec l’exponentielle**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mExpLog-2` | 2 | `sup=0-0-0-1-0-0-0` | exponentielle |
| `4mExpLog-2` | 1 | `sup=0-0-0-0-0-1-0` | puissance d’expression exponentielle |
| `4mExpLog-2` | 1 | `sup=0-0-1-0-0-0-0` | u’/u avec exp ou ln |

10. **Autres bases**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `2mLogExp-10` | 1 | `sup=true` | changement de base exprimé avec ln |
| `4mExpLog-5` | 1 | `sup=1-0-1-0` | exp, logarithme de base a |
| `4mExpLog-5` | 1 | `sup=0-1-0-1` | exponentielle de base a composée, logarithme de base a composé |
| `4mExpLog-2` | 1 | `sup=0-0-0-0-0-0-1` | exponentielle de base a |

11. **Croissances comparées, aires et volumes**

| Exercice | n | Paramètres | Familles et options |
| --- | ---: | --- | --- |
| `4mExpLog-6` | 1 | `sup=0-1-0` | quotient simple |
| `4mInt-8` | 1 | `sup=0-0-0-0-1*0` | exp ou ln ; intersections à trouver |
| `4mInt-9` | 1 | `sup=0-1*0-0-0-1` | couronnes ; exponentielle |
