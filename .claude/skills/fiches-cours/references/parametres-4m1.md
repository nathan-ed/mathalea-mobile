# Paramètres des parcours 4M1 : pièges vérifiés

À lire pour choisir ou modifier les exercices d'intégration et d'exp-log.
Constats du 4 novembre 2026, vérifiés dans les générateurs et dans le moteur
`2026-11-04+4c46164a1.a879cf4`. Recontrôler les formulaires si le moteur évolue :
ce document explique les choix, il ne remplace pas la lecture du générateur.

## Progression et prérequis

Le rappel des dérivées en intégration reste algébrique et trigonométrique.
Il commence par un polynôme de degré 2 à coefficients entiers, puis les
sommes et une puissance positive d'affine, avant produits, quotients et
composées trigonométriques. Les primitives de 1/x et les volumes exponentiels
attendent le chapitre exp-log.

Dans ce chapitre, introduire ln avant ses dérivées et primitives, puis exp
avant ses dérivées et primitives. Les équations à plusieurs logarithmes,
les coefficients fractionnaires et les applications longues viennent après
les calculs directs. La constante e définie par ln(e)=1 peut déjà servir
dans une équation ln(ax+b)=1 ; cela n'introduit pas la fonction exponentielle
de variable.

## Limites des réglages

| Exercice ou générateur | Ce qui est réellement garanti | Conséquence pour le parcours |
| --- | --- | --- |
| `3mA2-2` | `sup=3`, `sup2=false`, `sup3=false` : degré 2, coefficients entiers. | Entrée simple du rappel de dérivation. Contrôler la conversion des chaînes exportées en nombre et booléens. |
| `4mDer-4`, famille `power` | Mélange exposants positifs et négatifs. | Pour une puissance positive d'affine garantie, prendre `4mDer-3`, `sup=1`. |
| `4mDer-5`, produit | Les types des deux facteurs sont tirés indépendamment. Polynômes et ln autorisent aussi deux polynômes ou deux logarithmes ; même limite pour polynômes et exp. | Ne pas annoncer un produit comportant forcément ln ou exp. Étiqueter la révision du produit et interroger la fonction nouvelle dans d'autres questions dédiées. |
| `4mExpLog-4`, graphes | Quatre transformations sont imposées. Moins de quatre cases cochées déclenche un complément avec d'autres formes. | `sup=1111000*1` garantit les deux translations, les deux symétries et la demande des domaines. La liste binaire est sans tirets. |
| `4mExpLog-2`, `quotientExpLn` | Mélange effectivement exp et ln. | L'exclure des premières primitives de ln ; la proposer après l'introduction d'exp. |
| `4mExpLog-2`, `exponentielle` | Exposants affines, monomiaux, racines, inverses et trigonométriques. Aucun filtre affine seul. | Annoncer la reconnaissance de u' exp(u), après les rappels de composition. Signaler la lacune si l'on veut imposer une entrée affine. |
| `4mInt-2`, `-4`, `-6`, inverses de racines | Le choix d'exposants ne s'applique pas aux familles spéciales d'inverses de racines. | Lire d'abord la famille active ; un second champ `1-0-0` ne transforme pas ce cas en puissance entière positive. |
| `2mLogExp-11` | Le type dit simple peut déjà demander une équation du second degré. | Pour débuter avec un seul ln d'argument affine, utiliser `2mLogExp-4`, `sup=2`. |
| `2mLogExp-10`, `sup=true` | La réécriture se fait avec ln, mais l'énoncé garde des logarithmes d'autres bases. | À placer avec le changement de base. |

## Types et format des paramètres

- `2mLogExp-3`, `-11`, `-12` : `sup2=true` choisit ln.
- `2mLogExp-2` : c'est la valeur numérique `sup2=2` qui choisit ln.
- `2mLogExp-4` : le mode ln est directement `sup=2`.
- Dans un formulaire complexe, `*` sépare les champs. Une `listePonderee`
  encode les poids séparés par des tirets ; une `liste` utilise ici des
  chiffres accolés. Relever le type, le nombre d'entrées et leur ordre dans
  le formulaire du moteur avant de construire le paramètre.
- Vérifier les valeurs effectives après préparation de l'exercice, et les
  branches qui les consomment. La description d'une case cochée ne prouve
  pas que le tirage ne contient que cette difficulté.

## Compatibilité et vérifications

Le moteur contrôlé propose quatre familles pour `4mInt-9` et `4mExpLog-3`,
dont les nouvelles familles exponentielle et affine fractionnaire. Les
anciens moteurs limités à trois familles ne prennent pas en charge ces
sélections. Vérifier le moteur effectivement chargé par le serveur de test
et celui prévu pour la diffusion ; ne pas conclure à partir du seul
`static/moteur/manifest.json` d'un autre worktree.

La revue a utilisé huit graines par configuration. Ce nombre est un exemple
de contrôle, pas un seuil universel : explorer les branches qui peuvent
changer la difficulté ou les prérequis. Vérifier séparément les calculs des
exemples et des petites questions. Un parcours joué avec les réponses
attendues du moteur prouve leur acceptation dans l'interface, pas la justesse
mathématique de tous les tirages possibles.

Les réglages complets et les aperçus sont consignés dans
[la revue des parcours 4M1](../../../../docs/revue-parcours-4m1.md).
