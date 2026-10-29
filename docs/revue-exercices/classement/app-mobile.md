# Défauts de l'app MathALÉA mobile

Nathan (moteur de l’app, pas les exercices).

28 constats, 19 exercices. Données complètes : `revue/classement/app-mobile.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [I1 Bonne réponse refusée](#i1) | 5 | 4 |
| [I2 Réponse fausse acceptée](#i2) | 2 | 1 |
| [I4 Question interactive sans champ](#i4) | 14 | 10 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 1 | 1 |
| [R16 Relecture : français, titre ou contenu](#r16) | 1 | 1 |
| [X1 Erreur ou exception](#x1) | 1 | 1 |
| [X3 undefined, NaN…](#x3) | 3 | 3 |
| [X7 Combinaisons de paramètres non toutes passées](#x7) | 1 | 1 |

## I1

**Bonne réponse refusée**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-b252e5e52c | 6G1autoB (6e) |  | **Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app** ‖ bonne réponse refusée (0/1) Il manque 1 réponse. (×8) | rejoué : reproduit : refusé (0/1) : Il manque 1 réponse. | sup=true sup2=true, graine revue-1-a, q1, saisie {"field0":"isocèleetrectangle","field1":"O"} ([site](https://coopmaths.fr/alea/?uuid=b5eaf&id=6G1autoB&s=true&s2=true&alea=revue-1-a&i=1&cd=1)) |
| A-4092369f8b | canTEC2-02 (CAN) |  | **Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app** ‖ bonne réponse refusée (0/1) Vous devez saisir une réponse. (×12) | rejoué : reproduit : refusé (0/1) : Vous devez saisir une réponse. | défaut, graine revue-0-a, q1, saisie {"champ":""} ([site](https://coopmaths.fr/alea/?uuid=9772d&id=canTEC2-02&alea=revue-0-a&i=1&cd=1)) |
| A-6b50c9fa2d | 7f0dc (Non classés, CH) |  | **Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app** ‖ bonne réponse refusée (0/1) Les nombres doivent tous être séparés par un point-virgule. | rejoué : reproduit : refusé (0/1) : Les nombres doivent tous être séparés par un point-virgule. | sup=2 sup2=false, graine revue-4-b, q2, saisie {"champ":"\\{-1-\\dfrac23\\sqrt3;-1+\\dfrac23\\sqrt3\\}"} ([site](https://coopmaths.fr/alea/?uuid=7f0dc&id=7f0dc&s=2&s2=false&alea=revue-4-b&i=1&cd=1)) |
| A-e59b32a564 | TSA4-41 (Terminale) |  | **Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app** ‖ bonne réponse refusée (0/1) Résultat incorrect car cet ensemble doit commencer par une accolade ou bien être l'ensemble vide. (×12) | rejoué : reproduit : refusé (0/1) : Résultat incorrect car cet ensemble doit commencer par une accolade ou bien être l'ensemble vide. | défaut, graine revue-0-a, q1, saisie {"champ":"\n&lt;ol class='nombres'>\n\t&lt;li>\n&lt;ol class='alpha'>\n\t&lt;li>Pour tout $x ([site](https://coopmaths.fr/alea/?uuid=5d294&id=TSA4-41&alea=revue-0-a&i=1&cd=1)) |
| L-065418541c | TSA4-41 (Terminale) | src/exercices/TSpe/TSA4-41.ts | Exercice non interactif (interactifReady=false) rendu interactif par l'app : le champ attend la correction entière en HTML (&lt;ol class='nombres'>…), aucune réponse n'est jamais correcte ; connu (voir état : défauts de l'app, interactifReady ignoré). « Calculer la valeur de ℓ. [champ] » : le champ ne correspond à aucune question. → Côté app : tenir compte d'exercice.interactifReady. Côté exercice : retirer le champ quand il est non interactif. | confirmé à la relecture |  |

## I2

**Réponse fausse acceptée**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-0baca1ccc4 | TSP3-01 (Terminale) |  | **Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app** ‖ réponse fausse acceptée (×12) | rejoué : reproduit : réponse fausse acceptée | défaut, graine revue-0-a, q1, saisie {"champ":"Chaque question est notée sur un point. \n&lt;ul class='fleches'>\n\t&lt;li> ([site](https://coopmaths.fr/alea/?uuid=d5829&id=TSP3-01&alea=revue-0-a&i=1&cd=1)) |
| L-3d2614fc38 | TSP3-01 (Terminale) | src/exercices/TSpe/TSP3-01.ts | Exercice non interactif (interactifReady=false) rendu interactif par l'app (défaut connu) : le champ a pour attendu tout le HTML de la correction et une réponse fausse (la correction suivie de « x ») est acceptée (12 I2) ; 230 guillemets sans insécables (« l'évènement : « le candidat … » ») ; « évènement » (événement, rectification) ; 23 phrases sans virgule. → Côté app : respecter interactifReady ; côté exercice : guillemets français insécables. | confirmé à la relecture |  |

## I4

**Question interactive sans champ**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-3b496dfcbc | moteur-app (?) | moteur/fichiers/src/moteur/index.ts:135 | App (moteur/fichiers/src/moteur/index.ts:135) : preparerExercice met interactif à vrai pour tout exercice, même ceux que MathALÉA déclare non interactifs (export interactifReady = false), alors que le site n'active l'interactif que si interactifReady est vrai. Effet : un champ apparaît avec une attente vide ou absurde (TSA4-41 : la correction HTML entière ; canTEC2-02, canTEC2-05 : chaîne vide ; canTEC2-03), la question compte dans le score et l'élève ne peut pas réussir. 4 exercices sur les ~1 000 déjà passés au banc → const interactif = params.interactif !== false && exercice.interactifReady !== false (puis pnpm moteur, e2e complets) | confirmé à la relecture |  |
| A-3c46903c88 | 1A (1e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ champ absent de la page (×74) | rejoué : reproduit : champ absent de la page | sup2=false sup3=false, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=ce2ea&id=1A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1)) |
| A-b1200b5542 | 1A (1e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ liste absente de la page (×2) | rejoué : reproduit : liste absente de la page | sup2=false sup3=true, graine revue-3-b, q2 ([site](https://coopmaths.fr/alea/?uuid=ce2ea&id=1A&s2=false&s3=true&alea=revue-3-b&i=1&cd=1)) |
| A-5a3096d37a | 1mCL4-2 (1re Collège, CH) |  | **Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app** ‖ champ absent de la page (×53) | rejoué : reproduit : champ absent de la page | sup=3 sup2=false sup3=false, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=5f5fa&id=1mCL4-2&s=3&s2=false&s3=false&alea=revue-0-a&i=1&cd=1)) |
| A-46ce8e9a57 | 2A (2e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ liste absente de la page (×2) | rejoué : reproduit : liste absente de la page | sup2=true sup3=true, graine revue-1-a, q3 ([site](https://coopmaths.fr/alea/?uuid=2a1c7&id=2A&s2=true&s3=true&alea=revue-1-a&i=1&cd=1)) |
| A-daea5dc33b | 2A (2e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ champ absent de la page (×56) | rejoué : reproduit : champ absent de la page | sup2=false sup3=false, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=2a1c7&id=2A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1)) |
| A-086685d18d | 3Auto (3e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ liste absente de la page | rejoué : reproduit : liste absente de la page | sup2=true sup3=true, graine revue-1-b, q7 ([site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=true&s3=true&alea=revue-1-b&i=1&cd=1)) |
| A-608ef9a405 | 3Auto (3e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ champ absent de la page (×45) | rejoué : reproduit : champ absent de la page | sup2=false sup3=false, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=false&s3=false&alea=revue-0-a&i=1&cd=1)) |
| A-4f31daf857 | 3F13-1 (3e) |  | **Vérifié (revue/trier-i4.mjs) : question à plusieurs champs numérotés à la suite sur l'exercice ; le champ portant l'indice de la question est dans une autre question. Même cause que le constat de relecture sur la vérification question par question (TEM1-14, revue/champs-decales.json).** ‖ champ absent de la page (×4) | rejoué : reproduit : champ absent de la page | sup=2, graine revue-2-a, q1 ([site](https://coopmaths.fr/alea/?uuid=4b122&id=3F13-1&s=2&alea=revue-2-a&i=1&cd=1)) |
| A-26486656ca | 6A (6e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ liste absente de la page (×5) | rejoué : non reproduit : format meta-custom : à tester à la main | sup2=false sup3=false, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=c6cd6&id=6A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1)) |
| A-f1fc4d2eaa | 6A (6e) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ champ absent de la page (×62) | rejoué : reproduit : champ absent de la page | sup2=false sup3=false, graine revue-0-b, q1 ([site](https://coopmaths.fr/alea/?uuid=c6cd6&id=6A&s2=false&s3=false&alea=revue-0-b&i=1&cd=1)) |
| A-d671ff1f0d | can6a-Aléa (CAN) |  | **Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app, sans champ. Défaut de l'app déjà noté dans propositions.md.** ‖ champ absent de la page (×87) | rejoué : reproduit : champ absent de la page | sup=All, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=315b6&id=can6a-Al%C3%A9a&s=All&alea=revue-0-a&i=1&cd=1)) |
| A-a9c9891c92 | CM2N1D-2 (cm2) |  | **Vérifié (revue/trier-i4.mjs) : question à plusieurs champs numérotés à la suite sur l'exercice ; le champ portant l'indice de la question est dans une autre question. Même cause que le constat de relecture sur la vérification question par question (TEM1-14, revue/champs-decales.json).** ‖ champ absent de la page (×110) | rejoué : reproduit : champ absent de la page | sup=true sup2=1 sup3=1 sup4=1 sup5=true, graine revue-1-a, q2 ([site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=1&s4=1&s5=true&alea=revue-1-a&i=1&cd=1)) |
| L-cbabfe9715 | TEM1-14 (Terminale) | moteur/fichiers/src/moteur/index.ts:227 | Défaut de l'app (et de la vue « une question par page » du site) : une question qui contient plusieurs champs numérotés à la suite sur tout l'exercice (champTexteEx0Q0, Q1, Q2… dans la même question) n'est vérifiée que sur le champ qui porte son propre indice : moteur.verifier(exercice, question) lit autoCorrection[question] (moteur/fichiers/src/moteur/index.ts:227, src/lib/ui/BlocQuestion.svelte:173 ; site : QuestionParPage.svelte:116). Les autres champs ne comptent pas, et la question suivante est notée sur un champ de la précédente. Exemple : TEM1-14, graine revue-15-a, sup=5 sup2=3, 10 questions : la question 3 (M=…) est comparée à la matrice A de la question 2 (« 4 coefficients sont incorrects » pour la bonne réponse). 176 exercices bâtis ainsi (liste : revue/champs-decales.json, produite par revue/champs-decales.mjs), dont 13 où aucun champ d'une question ne porte son indice (10FA1B-1, 12afc, 1G11-2, 1mCL4-2, 2N33-1, 2P10-4, 4C25-0, 5N1I-5, 5N3C, 6N4B, 6N4B-1, 6N4B-2, EgaliteFG5-2de-6). Preuve : node revue/un-champ.mjs 3G32-0 revue-4-a {"sup":"true","sup2":"4"} 2 1 : la question 1 a six champs (Q0 à Q5) et moteur.verifier la juge correcte avec le seul champ Q0 rempli. → Vérifier dans l'app tous les autoCorrection dont le champ est dans le bloc de la question (score = somme), et lire la correction de la question qui contient le champ ; même chose à proposer pour QuestionParPage.svelte. | confirmé à la relecture |  |

## R10

**Français (accords, fautes, coquilles)**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-7e6427e9f6 | 2A (2e) | relecture | **Questions chargées de façon asynchrone : restent à « chargement… » dans l'app** ‖ Énoncé : « chargement... » (meta-custom jamais rempli dans le banc, voir 3Auto) → Voir bug meta-custom | confirmé à la relecture |  |

## R16

**Relecture : français, titre ou contenu**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-ca843deb17 | EN-Juniper-Green (EN) | src/exercices/EN/EN-Juniper-Green.ts | Consigne : « Cliquer sur « Vérifier les réponses » arrête la partie en cours et affiche le score » : ce bouton est celui du site (l'app n'a pas de bouton « Vérifier les réponses » : « Valider » ou équivalent) ; guillemets français ok ; « à tour de rôle » : le jeu se joue seul ? (2 IM). → Nom du bouton de l'app ; préciser le joueur. | confirmé à la relecture |  |

## X1

**Erreur ou exception**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-a37c0760cb | can6a-Aléa (CAN) | src/exercices/can/6e/can6a-alea.ts:143 | Dans l'app (moteur), toutes les questions restent à « chargement... » : l'exercice charge ses questions de façon asynchrone (loadAllQuests) après nouvelleVersion, et preparerExercice ne l'attend pas. Exercice inutilisable dans l'app ; même mécanisme dans src/exercices/_automatismesCan.ts. → Côté moteur : attendre la promesse de chargement (exposer une promesse dans nouvelleVersionWrapper et l'attendre dans preparerExercice), ou exclure ces exercices du référentiel de l'app. | confirmé à la relecture |  |

## X3

**undefined, NaN…**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-c58e79cd37 | moteur-app (?) | moteur/fichiers/src/moteur/index.ts:183 | ajusterFigures (moteur de l'app) replace les étiquettes d'une figure réduite avec Number(etiquette.dataset.top ?? 0) : les étiquettes sans data-top/data-left (figures apigeom statiques, apigeomZoom.ts) partent toutes en (0, 0) et s'empilent en haut à gauche. Sur téléphone, 6N3D (énoncé : noms des points et graduations illisibles, exercice inutilisable) et la correction de 6N1G. Le site garde leur position (Number(undefined) donne NaN, ignoré). → Dans ajusterFigures, si data-top/data-left manquent, les initialiser depuis style.top/style.left (parseFloat) avant de multiplier par coef. Pas modifié sans accord de Nathan. | confirmé à la relecture |  |
| L-477ef98f4c | 6N1G (6e) | 6e/6N1G.ts | **Étiquettes empilées après réduction de la figure (ajusterFigures, défaut de l'app)** ‖ Correction à 390 px : toutes les étiquettes (graduations et noms des points) sont empilées au début de l'axe, illisibles (capture 000-a-correction). → Corriger le placement des étiquettes de la figure de correction quand elle est réduite. | confirmé à la relecture |  |
| L-88e91dec29 | 6N1H-4 (6e) | 6e/6N1H-4.ts | **Étiquettes empilées après réduction de la figure (ajusterFigures, défaut de l'app)** ‖ À 390 px, les noms des points des zooms se chevauchent (« EGK », « A GP », G et C confondus, capture 000-a-enonce), alors que le point à lire est l'un d'eux. → Écarter les étiquettes (positions alternées au-dessus et en dessous) sur petit écran. | confirmé à la relecture |  |

## X7

**Combinaisons de paramètres non toutes passées**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-afc9071c93 | can6G1-01 (CAN) | src/exercices/6e/_Transformations.ts:77 | **Aides de paramètres « 1 & 2 : … » non lues par decrireExercice : options manquantes dans l'éditeur de l'app** ‖ App et banc : l'aide du paramètre écrit « 1 & 2 : Symétries obliques », « 3 & 4 : … », « 5 & 6 : … » ; optionsDe (moteur/fichiers/src/moteur/index.ts) ne lit que « n : libellé » : l'éditeur de parcours ne propose que 7 à 10 et le banc n'a pas passé 1 à 6 (même chose pour tous les exercices tirés de 6e/_Transformations.ts). → optionsDe : accepter « n & m : libellé » (une option par numéro) ; banc : passe complémentaire sur ces options. | confirmé à la relecture |  |
