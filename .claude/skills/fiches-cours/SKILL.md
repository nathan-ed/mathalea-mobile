---
name: fiches-cours
description: Écrire, relire ou modifier une fiche de cours de l'application MathALÉA mobile (bloc `fiche` d'un palier ou d'un parcours, ou fichier `fiche-mathalea/1`) selon la ligne éditoriale de Nathan - structure, ton, notations, exemples, questions, graphiques - puis la contrôler. À charger pour « écris / génère la fiche de … », « ajoute une fiche à ce palier », « relis cette fiche », ou avant de proposer une fiche à une IA.
---

# Fiches de cours : ligne éditoriale

Une fiche se lit **sur un téléphone, avant de s'entraîner** (d'office la
première fois avec `"avant": true`, puis depuis la page du parcours et le
bilan d'un palier raté). Elle prépare les exercices du palier, rien de plus.

Format exact (blocs, champs, expressions des graphiques) :
`docs/guide/format-parcours.md`, « Fiches de cours ». Vérité : `estFiche`
dans `src/lib/validation.ts`. Modèle de référence : les six fiches de
`explorer/ch-4e-college.json` (Intégration, 4e Collège).

## Où l'écrire

- Les fiches et les parcours proposés vivent **dans l'app** (dépôt :
  `explorer/`, ou les dossiers partagés des enseignants). Le site n'en garde
  aucune : sa page `?v=parcours` sert seulement d'éditeur.
- Sur le site : onglet **Fiches** (ouvrir un fichier de fiche, modifier,
  télécharger) ou, dans un parcours ouvert, sous chaque palier : « Ajouter une
  fiche de cours », « Importer une fiche », « Fiche : … » (plein écran, blocs
  et aperçu), « Télécharger ». Puis « Publier » : le fichier du parcours garde
  toutes ses fiches.
- À la main ou par une IA : écrire le JSON, le contrôler (plus bas), puis
  l'importer sur le site pour le relire dans l'aperçu.

## Structure d'une fiche (8 à 15 blocs)

L'ordre des fiches existantes, à suivre sauf raison :

1. `texte` d'accroche, deux ou trois phrases : d'où vient la notion, à quoi
   elle sert (« Dériver, c'est passer de $F$ à $F'$. Chercher une
   **primitive**, c'est faire le chemin inverse »). Pas de slogan.
2. `retenir` « Définition » (ou l'énoncé central), mot clé en **gras**.
3. Un `exemple` immédiat, le plus simple possible, qui applique la définition.
4. Les propriétés ou formules, chacune dans un `retenir` titré par ce qu'il
   contient (« Primitives à connaître », « Somme et multiple », « Théorème
   fondamental »), en liste quand il y en a plusieurs.
5. Des `exemple` gradués, un cas nouveau à chaque fois, titrés par ce cas
   (« Avec une racine », « Avec une condition », « Il manque un facteur
   constant »). Ce sont les situations des exercices du palier.
6. Un `graphique` quand la notion se voit (aire, signe, valeur moyenne) :
   curseurs sur ce que l'élève doit faire varier, `valeur: true` si le nombre
   compte.
7. Deux `question` : une à choix qui piège l'erreur classique, une à réponse
   numérique qui fait faire le calcul type du palier.
8. `retenir` « Pièges » en dernier : les erreurs vues en classe, en liste.

Un `texte` court peut relier deux blocs (« La fonction $G(x)=x^3+5$
convient aussi… »). Pas plus d'une idée par bloc.

## Ton et rédaction

- Français, phrases courtes, impersonnel (« on », infinitif). Le tutoiement
  est réservé aux questions (titre « À toi » mis par l'app) et à leurs
  explications si besoin.
- Chaque phrase apporte une information. Aucun texte de remplissage, aucune
  formule d'encouragement, aucun émoji, aucun style « IA ». Pas de tiret
  cadratin.
- Vocabulaire du cours de Nathan et du programme (suisse pour un degré
  suisse : « degré », notations des moyens romands si ce sont celles du
  chapitre).
- Exemples : `enonce` = la consigne comme dans un exercice ; chaque `etapes`
  = une étape de calcul ou de raisonnement, dévoilée au toucher, la dernière
  donne le résultat. Trois à cinq étapes.
- Questions : `explication` = le calcul ou la raison en une ou deux lignes,
  qui sert aussi à qui a répondu juste. Propositions d'une question à choix :
  les erreurs réellement commises, pas des leurres absurdes. Réponse
  numérique : un nombre exact simple (l'élève tape `8`, `0,5`, `-3`).
- Longueur : une fiche se lit en cinq minutes environ. Au-delà, la notion
  est à couper sur deux paliers.

## Notations (LaTeX dans `$…$`)

- `\mathrm{e}`, `\mathrm{d}x`, `\ln`, `\dfrac` dans le texte,
  `\displaystyle\int_a^b` dans une ligne, `$$…$$` pour une formule centrée.
- Intervalles à la française : `]0;+\infty[`, `[a;b]` ; virgule décimale :
  `0{,}5` ; `\geqslant`, `\leqslant`.
- Dans le JSON, doubler les barres obliques inverses (`"\\dfrac"`).

## Graphiques

- Expressions en `x` : `x^2/4+1/2`, `2e^(-x)`, `a*sin(x)` ; fonctions `sin`,
  `cos`, `tan`, `exp`, `ln`, `log`, `sqrt`, `abs` ; au plus trois courbes
  (f, g, h).
- Fenêtre (`x`, `y`) serrée autour de ce qu'il faut voir, axes inclus si
  utiles.
- Aire : bornes sur des curseurs (`"de": "a", "a": "b"`) pour que l'élève les
  déplace ; `entre` pour une aire entre deux courbes.
- Figure plus riche (solide, tableau, schéma) : image SVG ou PNG produite par
  Typst ou TikZ, dans un bloc `image` (`data:` dans le fichier, `alt` qui
  décrit vraiment la figure). Garder les fichiers légers (SVG de préférence,
  moins de 500 Ko).

## Liens et ressources externes

Bloc `lien` (`titre`, `lien` en https) : vidéo, PDF du cours, page d'un
manuel. Il s'ouvre hors de l'app ; le titre dit ce que l'élève va trouver
(« Vidéo : l'aire sous une courbe, 4 min »). Pour revoir la notion après un
palier raté, préférer la `ressource` du palier (mise en avant au bilan).

## Contrôler avant de rendre

1. `npx tsx scripts/verifier-fiche.mts <fichier>` : fiche seule, fiche nue ou
   fichier de parcours. Code 1 et bloc fautif si l'app la refuserait.
2. `pnpm test` : les fichiers de `explorer/` sont contrôlés.
3. Relire dans l'aperçu du site (onglet Fiches) puis dans l'app (« Éditer un
   parcours existant », « Aperçu élève ») : formules rendues, graphique
   lisible à 390 px, étapes et questions qui répondent.
4. Parcours déjà diffusé : `version` + 1.

## Faire écrire une fiche par une IA

Lui donner ce skill (ou `format-parcours.md`), une fiche de
`explorer/ch-4e-college.json` comme modèle, les exercices du palier et les
points du cours à couvrir. Consigne : « Réponds uniquement avec le JSON
d'une fiche (format fiche-mathalea/1). » Puis contrôler et relire comme
ci-dessus : une fiche n'est jamais déposée sans relecture.
