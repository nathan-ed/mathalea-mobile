---
name: fiches-cours
description: Écrire, relire ou modifier une fiche de cours de l'application MathALÉA mobile (bloc `fiche` d'un palier ou d'un parcours, ou fichier `fiche-mathalea/1`) selon la ligne éditoriale de Nathan - structure, ton, notations, exemples, questions, graphiques - puis la contrôler. À charger pour « écris / génère la fiche de … », « ajoute une fiche à ce palier », « relis cette fiche », ou avant de proposer une fiche à une IA.
---

# Fiches de cours : ligne éditoriale

Une fiche se lit **sur un téléphone, avant de s'entraîner** (d'office la
première fois avec `"avant": true`, puis depuis la page du parcours et le
bilan d'un palier raté). Elle prépare les exercices du palier, rien de plus.

## But : de la remédiation, pas un cours (Nathan, 2026-10-28)

- L'élève a déjà suivi le cours et fait des exercices en classe. Il vient
  sur l'app pour s'entraîner (préparer une évaluation) ou parce qu'il n'a pas
  compris. La fiche est une **aide à la résolution des exercices
  interactifs du palier**, brève, à la manière d'Alloprof (s'en inspirer,
  sans copier). Ce n'est ni un cours numérique ni un substitut du cours.
- Le cours de Nathan (cours2627, par ex. `4M1/theorie/`) sert de
  **référence de vocabulaire, de notations et de syntaxe** : mêmes noms de
  propriétés, mêmes écritures. On ne le recopie pas.
- Contenu : théorie minimale (formules et règles utiles au palier), un
  exemple ou un exercice résolu représentatif des exercices interactifs qui
  suivent, la méthode. Pas de preuve, pas de remarque historique, pas de
  section entière du cours.
- Pas d'exercices papier-crayon dans la fiche : ni listes d'exercices à
  calculer, ni exercices des séries. Les exercices, ce sont les étapes
  MathALÉA interactives du palier.
- Écarté : générer les fiches en convertissant le cours Typst
  (`skill-sort/skills/cours-mathalea/parcours.py`, essai du 2026-10-28) ;
  le résultat recopiait le cours, trop long, avec les séries.

Format exact (blocs, champs, expressions des graphiques) :
`docs/guide/format-parcours.md`, « Fiches de cours ». Vérité : `estFiche`
dans `src/lib/validation.ts`. Modèle de référence : les fiches de
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
- Pour 4M1, `explorer/ch-4e-college.json` contient les parcours complets,
  les paramètres des exercices et les fiches dans les paliers. Le YAML de
  `cours2627/4M1/mathalea/parcours.yml` conserve le plan pédagogique et les
  repères du cours ; les fiches sont maintenues dans le catalogue JSON.
- Un fichier modifié dans `explorer/` reste local tant qu'il n'a pas été
  déposé dans le dossier partagé de l'Explorer. Dans le compte rendu,
  distinguer fichier prêt, vérification locale et publication effective.
  Une modification de skill ou de contenu ne vaut pas demande de publication.

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
- Style des courbes (`styles`) : couleurs de la charte (`bleu`, `orange`,
  `vert`, `gris`), trait `plein`, `tirets` ou `pointilles` ; par exemple la
  tangente en tirets gris, la courbe en bleu.
- Points (`points`) : `plein`, `vide` (borne exclue, point à placer) ou
  `croix` ; `nom` court (« A ») et `coordonnees: true` si la valeur compte.
  Un point dont `x` est un curseur et posé `sur` une courbe la parcourt.
- Textes (`textes`) : nom d'une courbe (« $\mathcal{C}_f$ ») ou d'une zone,
  posés là où ils ne cachent rien.
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

## Progression et paramètres des exercices

Pour les parcours 4M1 d'intégration et d'exp-log, lire aussi
[les paramètres et pièges vérifiés](references/parametres-4m1.md).

- Respecter les prérequis du chapitre dans les questions et dans la fiche.
  Pour 4M1, le rappel de dérivation en intégration reste algébrique et
  trigonométrique ; ln et exp se travaillent après leur introduction.
- Fixer les familles explicitement, puis lire le formulaire du moteur
  réellement utilisé et plusieurs tirages. Une case cochée peut autoriser
  un type sans en garantir la présence : dans les produits de dérivées,
  les types des deux facteurs sont tirés indépendamment. Étiqueter ce qui
  est effectivement évalué, y compris une éventuelle révision.
- Quand les exercices sont gradués au sein d'une ceinture, conserver leur
  ordre avec `melanger: false`. Commencer par un cas simple garanti avant
  d'autoriser plusieurs familles ou un calcul plus long : calcul direct
  avant composition, données utiles fournies avant leur recherche,
  coefficients simples avant coefficients fractionnaires.
- Vérifier les limites des filtres dans le générateur : par exemple,
  « puissance » peut inclure des exposants négatifs et une famille de
  primitives peut mélanger exp et ln. Choisir un autre exercice si le
  paramètre ne permet pas d'isoler le savoir-faire annoncé.
- Contrôler les champs effectivement lus : ordre et longueur des listes,
  liste binaire ou pondérée, nombres et booléens. Un paramètre mal formé ou
  une sélection vide peut réactiver des valeurs par défaut. Vérifier aussi
  les compléments automatiques et les paramètres sans effet sur certaines
  familles.
- Si les exercices d'une ceinture n'interrogent pas tout ce que dit sa
  fiche (ou son titre), ne pas réduire la fiche pour masquer le manque :
  l'écrire dans le tableau « Exercices à créer ou à étendre » de
  `explorer/<catalogue>-manques.md` (règle et format : skill
  `generer-parcours`, « Exercices manquants »).
- Identifier le moteur réellement servi pendant les essais, par son
  `manifest.json`. Un serveur déjà lancé peut venir d'un autre worktree.
  Comparer ses familles à celles du moteur destiné aux élèves ; consigner
  une dépendance à une version plus récente.

## Contrôler avant de rendre

1. `npx tsx scripts/verifier-fiche.mts <fichier>` : fiche seule, fiche nue ou
   fichier de parcours. Code 1 et bloc fautif si l'app la refuserait.
2. `pnpm test` : les fichiers de `explorer/` sont contrôlés.
3. Relire dans l'aperçu du site (onglet Fiches) puis dans l'app (« Éditer un
   parcours existant », « Aperçu élève ») : formules rendues, graphique
   lisible à 390 px, étapes et questions qui répondent.
4. Parcours déjà diffusé : `version` + 1 ; garder son `id` stable et les
   métadonnées d'auteur. Si le plan YAML est maintenu, vérifier sa concordance
   avec les étapes JSON (références, paramètres, ordre, nombres de questions).
5. Générer plusieurs tirages de chaque configuration finale : relire les
   énoncés et corrections pour vérifier les prérequis et le savoir-faire
   annoncé. Distinguer génération sans erreur, contrôle mathématique des
   exemples et acceptation des réponses dans l'interface.
6. Lancer `node e2e/apercu-parcours.mjs <fichier> <id>`, relire les planches
   et les transmettre à Nathan. Puis `PARCOURS=<id> node e2e/parcours-az.mjs
   <fichier>` : vérifier les bonnes réponses, l'ouverture de la ceinture
   suivante et les ceintures obtenues dans le suivi. Après une correction
   des paramètres, contrôler la configuration finale.

## Faire écrire une fiche par une IA

Lui donner ce skill (ou `format-parcours.md`), une fiche de
`explorer/ch-4e-college.json` comme modèle, les exercices du palier et les
points du cours à couvrir. Consigne : « Réponds uniquement avec le JSON
d'une fiche (format fiche-mathalea/1). » Puis contrôler et relire comme
ci-dessus : une fiche n'est jamais déposée sans relecture.
