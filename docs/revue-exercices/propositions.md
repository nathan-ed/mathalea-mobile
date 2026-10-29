# Revue des exercices : propositions pour MathALÉA

Ce que la revue de 4 190 exercices (référentiel FR, CAN comprises, et
exercices CH absents du FR) suggère d'ajouter aux consignes de rédaction et
aux contrôles automatiques. Les constats eux-mêmes sont dans
[trouvailles.md](trouvailles.md) et par degré dans [par-degre/](par-degre/).
Aucun exercice ni le moteur de l'app n'a été modifié.

## 1. Règles à ajouter ou à rappeler aux auteurs

Chaque règle donne le nombre d'exercices concernés dans la revue (ordre de
grandeur : un exercice peut cumuler plusieurs constats).

1. **Titre.** Un titre est renseigné, sans double espace, sans astérisque ni
   point final, sans « (ancien exercice) », sans « Titre à modifier » ni
   « Nom de l'exercice ». Il décrit ce que l'élève fait (près de 800 titres à
   revoir : vides, tronqués, fautes, LaTeX brut, sans rapport avec le contenu).
2. **Un seul uuid hexadécimal par exercice** (quelques uuid contiennent des
   lettres hors a à f : `asdea`, `2rgct`, `fe4dg`, `2l9cb`).
3. **Nombres dans `$…$`** dans l'énoncé comme dans la correction (« 8 boules »,
   « 40 tomates », « 4 pains »). Environ 1 000 exercices.
4. **`miseEnEvidence` ne contient ni texte ni unité** : texte avec
   `texteEnCouleurEtGras`, valeur avec `miseEnEvidence`. Et ce qui est mis en
   évidence est exactement ce que le champ attend (sans lettre, sans
   parenthèses, sans matrice entière quand les champs sont séparés).
5. **Réponse attendue propre** : pas de flottant (`50.400000000000006`,
   `5609999.999999999`), pas de chaîne vide, pas de forme que la saisie au
   clavier ne peut produire (`\backslash` seul accepté pour un complémentaire).
   Arrondir avant d'écrire la réponse (`arrondi`, `texNombre`).
6. **Question initialisée avant `question += qcm.texte`** (sinon « undefined »
   en tête de l'énoncé : plusieurs CAN, `4ed52`, `83789`, `884fe`).
7. **Espaces insécables** avant `: ; ! ?` et dans « « » ; coordonnées et
   intervalles avec `\,;\,` des deux côtés ; espace avant `€`, `%` et les
   unités (`$3$ €`, pas `$3$€`) ; espace fine des milliers dans l'énoncé comme
   dans la correction (`texNombre`).
8. **Points de suspension** en `\ldots` (ou `…`), jamais `...` ni `....`.
9. **Notation d'une même opération cohérente** : en version suisse `\cdot`
   partout, y compris dans les propositions d'un QCM ; `\mathrm{e}` pour
   l'exponentielle ; `\parallel` et non `//`.
10. **Accord et orthographe** : « la pente » (féminin, 17 exercices à
    corriger), « connaît » ou « connaitre » mais pas les deux selon
    l'exercice, « Étudier », « Équation » (majuscule accentuée), « évènement »
    ou « événement » (choisir), « indéterminée », « coefficient ».
11. **Tutoiement ou vouvoiement** : une seule forme par lot d'exercices
    (« Coche », « Écris » dans des exercices qui disent « Cocher »).
12. **Pas d'exercice modèle ni de test dans le référentiel** : `f9261`,
    `jnapmep0/1`, `testEEE`, `exemple-qcm-json`, `deriv`, `sebseb`,
    « Test MultiMathfield », `1eb36`, `9f6e6`, `77d18`.
13. **Correction non vide** et sans « Pas de correction pour l'instant »
    (2G21-2, 4c7ca, 5b767…).
14. **Signes et parenthèses dans les calculs rédigés** : `2+(-4)`, `0-(-5)`,
    `1-(-0,5)^2`, jamais `2+-4`, `0-5` pour `0-(-5)`, `1--0,5^2`.
15. **Paramètres** : une valeur de paramètre ne doit pas rendre l'exercice
    absurde (« multiple de 1 », nombre à décomposer égal à 0, dividende
    aléatoire sans sens).

## 2. Contrôles automatiques à rejouer avant fusion

Le banc (`revue/banc.mjs`) et le balayage (`revue/balayage.mjs`) font déjà
ces contrôles sur la sortie des exercices. À brancher sur les exercices
modifiés d'une MR :

- `undefined`, `NaN`, `[object`, `-0`, `+-`, `--`, `1x`, `0x`, `$$` vide,
  erreur KaTeX ;
- réponse attendue en flottant ou vide, valeur mise en évidence refusée par le
  champ (on la saisit et `verifier` doit répondre « correcte »), réponse
  correcte écrite autrement (virgule, fraction, espace) également acceptée ;
- titre vide, double espace, uuid non hexadécimal ;
- mots répétés (« de de », « par par », « est est »), fautes fréquentes
  (liste dans `revue/balayage.mjs`) ;
- nombres hors `$`, espaces avant `: ; ! ?`, `...`.

## 3. Défauts de l'app trouvés pendant la revue

À signaler à Nathan avant toute correction (voir aussi `etat.md`) :

- `preparerExercice` rend interactif des exercices que MathALÉA déclare non
  interactifs (`interactifReady = false`), avec des champs à attente vide.
- Les exercices à questions chargées de façon asynchrone (`meta-custom` : 6A,
  `can6a-Aléa`, automatismes) restent à « chargement… ».
- `ajusterFigures` lit `data-top` et `data-left` absents des figures apigeom
  statiques : les étiquettes se placent en haut à gauche.
- Comparaison « +1 » et références de tableur contenant des `$`.
- Identifiants indéfinis dans certaines sorties du moteur.

## 4. Exercices dont l'interactif refuse la bonne réponse (confirmés)

`can2N4-02`, `can5C4-02`, `3AutoG12`, `4C32-3` (réponse en flottant),
`9e17a` (`\setminus` et `\smallsetminus` refusés), `16c6f` (réponse attendue
vide), `29202` (champ libellé avec une autre valeur que l'énoncé), et les
exercices listés en I1 dans `trouvailles.md`.
