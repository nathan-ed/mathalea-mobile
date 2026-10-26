# Format des parcours (technique)

Cette page décrit le fichier JSON que lit l'application. Elle sert à générer des parcours par un script ou avec un assistant (IA), sans passer par l'éditeur. Les champs, les valeurs permises et les règles sont ceux que l'application contrôle : un fichier qui ne les respecte pas est refusé en entier.

Fichiers à télécharger :

- [parcours-mathalea.schema.json](parcours-mathalea.schema.json) : le schéma JSON (draft 2020-12), à donner à un outil de validation ou à un assistant.
- [exemple-parcours.json](exemple-parcours.json) : un fichier complet (liste simple, ceintures avec pause et ressource, parcours sans classe, objectifs).

## Le plus petit fichier

Une classe, un parcours, un exercice :

```json
{
  "format": "classes-mathalea/1",
  "exporteLe": "2026-10-16T08:00:00.000Z",
  "classes": [
    {
      "nom": "5e A",
      "parcours": [
        {
          "id": "relatifs-5e",
          "version": 1,
          "titre": "Nombres relatifs",
          "objectif": "Additionner deux nombres relatifs sans hésiter.",
          "niveau": "5e",
          "theme": "Nombres relatifs",
          "difficulte": 1,
          "presentation": "une_question_par_page",
          "correction": "question",
          "etapes": [
            { "uuid": "cbc26", "id": "5N2G", "nbQuestions": 3, "titre": "Additionner deux relatifs" }
          ]
        }
      ]
    }
  ]
}
```

## Utiliser le fichier

- **Pour les élèves** : déposez-le à la racine du dossier partagé de la classe. Tous les fichiers `.json` de la racine sont lus. Un parcours présent dans plusieurs fichiers est gardé à sa version la plus haute.
- **Pour le modifier ensuite dans l'application** : onglet Parcours, « Éditer un parcours existant », importer le fichier. Les parcours entrent dans votre bibliothèque avec leurs classes.
- **Sur le site** : page « Parcours pour l'application » (`?v=parcours`), bouton Ouvrir.

## Le fichier

| Champ | Valeur |
| --- | --- |
| `format` | **obligatoire** ; toujours `classes-mathalea/1` |
| `exporteLe` | **obligatoire** ; date ISO 8601 |
| `classes` | **obligatoire** ; liste de `{ "nom", "parcours" }` ; noms uniques ; les parcours dans l'ordre vu par les élèves |
| `banque` | facultatif ; `true` : publication complète ; dans un dossier, seule la banque la plus récente compte et un parcours retiré disparaît |
| `bibliotheque` | facultatif ; `{ "parcours", "objectifs" }` : parcours sans classe et objectifs ; les élèves l'ignorent |

## Un parcours

| Champ | Valeur |
| --- | --- |
| `id` | **obligatoire** ; lettres minuscules, chiffres et tirets ; stable : il relie les résultats des élèves au parcours |
| `version` | **obligatoire** ; entier à partir de 1 ; à augmenter à chaque modification diffusée |
| `titre` | **obligatoire** ; texte |
| `objectif` | **obligatoire** ; une phrase vue par les élèves (peut être vide) |
| `niveau` | **obligatoire** ; texte ; l'éditeur propose 6e à Terminale (France), 9e à 4e Collège (Suisse) |
| `theme` | **obligatoire** ; chapitre ; regroupe les parcours chez l'élève |
| `difficulte` | **obligatoire** ; `1` Découverte, `2` Entraînement, `3` Approfondissement |
| `icone` | facultatif ; classe boxicons, par exemple `bx-calculator` |
| `presentation` | **obligatoire** ; `une_question_par_page`, `un_exo_par_page` ou `liste_exos` (tout sur une page) |
| `correction` | **obligatoire** ; `question`, `page` ou `parcours` (à la fin, ou à la fin du palier) |
| `enTetesMasques` | facultatif ; `true` : ni numéro ni titre d'exercice, les questions s'enchaînent |
| `melanger` | facultatif ; `true` : questions des exercices mélangées (sans effet avec `un_exo_par_page`) |
| `fiche` | facultatif ; fiche de cours d'un parcours sans paliers, voir « Fiches de cours » |
| `etapes` | **obligatoire** ; liste d'exercices, dans l'ordre |
| `paliers` | facultatif ; découpe en paliers, voir plus bas |
| `style` | facultatif ; `paliers` ou `ceintures` |
| `premiereCeinture` | facultatif ; de `0` (blanche) à `6` (noire) |

Sans `enTetesMasques` ni `melanger`, l'affichage est celui des versions précédentes : en-têtes visibles, ordre des exercices. Un champ inconnu est ignoré.

## Un exercice (étape)

Une étape reprend les paramètres de l'adresse de l'exercice sur le site MathALÉA. Réglez l'exercice sur le site, puis recopiez son adresse :

| Adresse du site | Champ de l'étape |
| --- | --- |
| `uuid=cbc26` | `"uuid": "cbc26"` (obligatoire) |
| `id=5N2G` | `"id": "5N2G"` |
| `n=3` | `"nbQuestions": 3` |
| `s=2` | `"sup": "2"` |
| `s2=1-3` | `"sup2": "1-3"` |
| `s3=true` | `"sup3": "true"` |
| `s4=…` | `"sup4": "…"` |

Une adresse avec plusieurs exercices répète `uuid=…&id=…&n=…` : une étape par `uuid`, dans l'ordre. Un paramètre absent prend la valeur par défaut du site, qui suit ses évolutions.

Autres champs : `titre` (obligatoire, vu par l'élève, LaTeX entre `$` permis), `titreMasque` (`true` : exercice absent de la liste vue par l'élève, sans titre pendant l'activité), `objectifs` (libellés, voir plus bas). Le même exercice peut figurer deux fois avec des réglages différents.

Choisissez des exercices interactifs : ce sont ceux que l'application corrige. L'éditeur de l'application ne propose qu'eux.

## Paliers et ceintures

`paliers` découpe les étapes dans l'ordre : chaque palier prend `nb` étapes. Ils comptent seulement s'il y en a au moins deux et si la somme des `nb` est égale au nombre d'étapes ; sinon, le parcours est une liste simple.

| Champ du palier | Valeur |
| --- | --- |
| `titre` | texte (obligatoire) |
| `nb` | nombre d'étapes (obligatoire) |
| `acces` | `libre` ou `seuil` ; ignoré pour le premier palier |
| `seuil` | pourcentage à atteindre au palier précédent, de 0 à 100 (80 par défaut) |
| `ressource` | `{ "titre", "lien" }` : pour revoir la notion, proposée tant que le palier n'est pas réussi |
| `pause` | `{ "texte", "ressource" }` : affichée après le palier |
| `fiche` | fiche de cours du palier, voir plus bas |

`style` : `paliers` (Palier 1, 2…) ou `ceintures`. `premiereCeinture` : rang de la première ceinture, de `0` à `6` (blanche, jaune, orange, verte, bleue, marron, noire). Au-delà de la noire viennent les dan.

## Fiches de cours

Une fiche est une page de cours lue dans l'application : texte, formules, graphiques que l'élève manipule, exemples résolus pas à pas, petites questions avec un retour immédiat, qui ne comptent pas. Elle se place dans un palier (`fiche` du palier) ou dans un parcours sans paliers (`fiche` du parcours). Avec `"avant": true`, elle s'affiche d'office avant la première séance, avec « Commencer l'entraînement » en bas ; sinon, et ensuite, elle reste accessible depuis la page du parcours (« Fiche : … ») et depuis le bilan quand le palier n'est pas réussi.

| Champ de la fiche | Valeur |
| --- | --- |
| `titre` | texte (obligatoire) |
| `avant` | `true` : montrée d'office la première fois |
| `blocs` | liste de blocs, dans l'ordre (obligatoire) |

Dans les textes : `**gras**`, `*italique*`, listes (lignes commençant par `- `, une ligne sans tiret continue l'élément), formules LaTeX entre `$` (dans la ligne) ou `$$` (centrées, sur leur ligne). Un paragraphe vide sépare deux paragraphes. Les titres des blocs acceptent aussi des formules entre `$`.

| Bloc (`type`) | Champs |
| --- | --- |
| `texte` | `texte` |
| `retenir` | `texte`, `titre` (« À retenir » par défaut) : encadré |
| `exemple` | `enonce`, `etapes` (dévoilées une à une), `titre` (« Exemple » par défaut) |
| `question` | `enonce`, `explication`, et soit `choix` (au moins deux) avec `bonne` (rang, 0 pour la première), soit `reponse` (nombre) |
| `graphique` | `fonctions` (expressions en `x` : `x^2/4+1/2`, `2e^(-x)`, `a*sin(x)`), `x` et `y` (fenêtre `[min, max]`), facultatifs : `aire` (`de`, `a`, `fonction`, `entre`), `curseurs` (`{ "a": [min, max, valeur, pas] }`), `valeur` (`true` : valeur de l'intégrale), `legende` |
| `image` | `src` (`data:image/svg+xml…` ou PNG, dans le fichier), `alt`, `legende` |
| `lien` | `titre`, `lien` (https : PDF, vidéo) |

Graphiques : fonctions `sin`, `cos`, `tan`, `exp`, `ln`, `log`, `sqrt`, `abs`, constantes `pi` et `e`, multiplication sous-entendue (`2x`, `3(x+1)`). Une borne d'`aire` est un nombre ou le nom d'un curseur (une lettre, ni `x` ni `e`). Une expression qui ne se calcule pas rend le fichier invalide. Pour une figure plus riche, produisez une image SVG ou PNG (Typst, TikZ…) et mettez-la dans un bloc `image`.

```json
{
  "titre": "Calculer une intégrale",
  "avant": true,
  "blocs": [
    { "type": "retenir", "titre": "Théorème fondamental", "texte": "$$\\int_a^b f(x)\\,\\mathrm{d}x=F(b)-F(a)$$" },
    { "type": "graphique", "fonctions": ["x^2/4+1/2"], "x": [0, 4], "y": [0, 5], "aire": { "de": "a", "a": "b" }, "curseurs": { "a": [0, 4, 1, 0.5], "b": [0, 4, 3, 0.5] }, "valeur": true },
    { "type": "exemple", "enonce": "Calculer $\\int_1^3 2x\\,\\mathrm{d}x$.", "etapes": ["Une primitive : $x^2$.", "$3^2-1^2=8$."] },
    { "type": "question", "enonce": "Que vaut $\\int_0^2 3x^2\\,\\mathrm{d}x$ ?", "reponse": 8, "explication": "$\\big[x^3\\big]_0^2=8$." }
  ]
}
```

## Objectifs

Dans `bibliotheque.objectifs` : `{ "libelle", "niveau", "theme", "code" }`. Le libellé sert d'identifiant (unique dans la liste) ; `code` est facultatif (objectif du programme, par exemple `5N2G`). Une étape cite ses objectifs par leur libellé dans `objectifs`. Le suivi de l'élève montre alors sa maîtrise de chaque objectif.

## Règles à respecter

1. JSON valide, en UTF-8.
2. `id` de parcours unique dans chaque classe et dans `bibliotheque.parcours` ; noms de classe uniques.
3. Un même parcours dans plusieurs classes : même `id`, même contenu.
4. Ne jamais changer l'`id` d'un parcours déjà diffusé ; augmenter `version` à chaque modification, sinon les élèves gardent l'ancienne.
5. Valeurs exactes pour `presentation`, `correction`, `difficulte`, `acces`, `style`.
6. Une liste vide d'`etapes` est acceptée, mais un parcours sans exercice n'a pas d'intérêt.

## Générer avec un assistant

Donnez-lui le schéma et l'exemple, puis une consigne de ce genre :

```text
Tu génères un fichier de parcours pour l'application MathALÉA.
Respecte exactement le schéma joint (parcours-mathalea.schema.json) et
inspire-toi de l'exemple (exemple-parcours.json).
Classe : 5e B. Deux parcours sur les fractions, de difficulté 1 et 2.
Utilise seulement ces exercices du site (adresse recopiée) :
https://coopmaths.fr/alea/?uuid=f8f4e&id=5N13&n=3&uuid=5f429&id=4C21&n=3
Pour chaque exercice : uuid, id et nbQuestions tirés de l'adresse, titre en français.
Identifiants en minuscules avec tirets, version 1, exporteLe à la date du jour.
Réponds uniquement avec le JSON.
```

N'inventez pas d'`uuid` : un exercice inconnu affiche une erreur chez l'élève. Prenez-les sur le site.

## Vérifier

Importez le fichier dans l'application (onglet Parcours, « Éditer un parcours existant »). S'il est refusé, le message dit pourquoi : fichier illisible, parcours invalide (avec son `id`), classe ou parcours en double. Ouvrez ensuite le parcours et touchez « Aperçu élève » pour l'essayer.
