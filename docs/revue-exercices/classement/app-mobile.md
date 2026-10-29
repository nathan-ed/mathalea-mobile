# Défauts de l'app MathALÉA mobile

Nathan (moteur de l’app, pas les exercices).

10 constats, 9 exercices. Données complètes : `revue/classement/app-mobile.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [I1 Bonne réponse refusée](#i1) | 1 | 1 |
| [I2 Réponse fausse acceptée](#i2) | 1 | 1 |
| [I4 Question interactive sans champ](#i4) | 1 | 1 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 1 | 1 |
| [R16 Relecture : français, titre ou contenu](#r16) | 1 | 1 |
| [X1 Erreur ou exception](#x1) | 1 | 1 |
| [X3 undefined, NaN…](#x3) | 3 | 3 |
| [X7 Combinaisons de paramètres non toutes passées](#x7) | 1 | 1 |

## I1

**Bonne réponse refusée**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-065418541c | TSA4-41 (Terminale) | src/exercices/TSpe/TSA4-41.ts | Exercice non interactif (interactifReady=false) rendu interactif par l'app : le champ attend la correction entière en HTML (&lt;ol class='nombres'>…), aucune réponse n'est jamais correcte ; connu (voir état : défauts de l'app, interactifReady ignoré). « Calculer la valeur de ℓ. [champ] » : le champ ne correspond à aucune question. → Côté app : tenir compte d'exercice.interactifReady. Côté exercice : retirer le champ quand il est non interactif. | confirmé à la relecture |  |

## I2

**Réponse fausse acceptée**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-3d2614fc38 | TSP3-01 (Terminale) | src/exercices/TSpe/TSP3-01.ts | Exercice non interactif (interactifReady=false) rendu interactif par l'app (défaut connu) : le champ a pour attendu tout le HTML de la correction et une réponse fausse (la correction suivie de « x ») est acceptée (12 I2) ; 230 guillemets sans insécables (« l'évènement : « le candidat … » ») ; « évènement » (événement, rectification) ; 23 phrases sans virgule. → Côté app : respecter interactifReady ; côté exercice : guillemets français insécables. | confirmé à la relecture |  |

## I4

**Question interactive sans champ**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-3b496dfcbc | moteur-app (?) | moteur/fichiers/src/moteur/index.ts:135 | App (moteur/fichiers/src/moteur/index.ts:135) : preparerExercice met interactif à vrai pour tout exercice, même ceux que MathALÉA déclare non interactifs (export interactifReady = false), alors que le site n'active l'interactif que si interactifReady est vrai. Effet : un champ apparaît avec une attente vide ou absurde (TSA4-41 : la correction HTML entière ; canTEC2-02, canTEC2-05 : chaîne vide ; canTEC2-03), la question compte dans le score et l'élève ne peut pas réussir. 4 exercices sur les ~1 000 déjà passés au banc → const interactif = params.interactif !== false && exercice.interactifReady !== false (puis pnpm moteur, e2e complets) | confirmé à la relecture |  |

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
