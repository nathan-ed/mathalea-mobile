# Défauts de l'app MathALÉA mobile

Nathan (moteur de l’app, pas les exercices).

9 constats, 9 exercices. Données complètes : `revue/classement/app-mobile.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [C1 Contenu mathématique faux ou ambigu](#c1) | 1 | 1 |
| [I1 Bonne réponse refusée](#i1) | 1 | 1 |
| [I2 Réponse fausse acceptée](#i2) | 1 | 1 |
| [I4 Question interactive sans champ](#i4) | 1 | 1 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 1 | 1 |
| [R16 Relecture : français, titre ou contenu](#r16) | 2 | 2 |
| [X4 Question en double ou vide](#x4) | 2 | 2 |

## C1

**Contenu mathématique faux ou ambigu**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-7b4717f50a | 6I1B-2 (6e) | src/exercices/6e/6I1B-2.ts | L'énoncé contient un lien externe (&lt;a href="https://www.monclasseurdemaths.fr/…" target="_blank">Note la couleur&lt;/a>) et un éloge (« l'excellente activité débranchée … de Jean-Yves Labouche ») : dans l'app hors ligne, le lien ne mène nulle part (règle : aucune donnée de l'élève ne quitte l'appareil) ; 471 T3 / 969 T5 : espaces avant deux-points et doubles espaces. → Retirer le lien de l'énoncé élève (ou le mettre en commentaire) ; remplacer l'éloge par une référence. | confirmé à la relecture |  |

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
| L-91287bebe7 | canCE1a-2026 (CAN) | src/exercices/can/canCE1a-2026 | Q1, Q2, Q5, Q6, Q8, Q9 : « Entoure » alors que l'élève coche une case dans l'app (QCM). → Coche / Cocher | confirmé à la relecture |  |

## R16

**Relecture : français, titre ou contenu**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-ca843deb17 | EN-Juniper-Green (EN) | src/exercices/EN/EN-Juniper-Green.ts | Consigne : « Cliquer sur « Vérifier les réponses » arrête la partie en cours et affiche le score » : ce bouton est celui du site (l'app n'a pas de bouton « Vérifier les réponses » : « Valider » ou équivalent) ; guillemets français ok ; « à tour de rôle » : le jeu se joue seul ? (2 IM). → Nom du bouton de l'app ; préciser le joueur. | confirmé à la relecture |  |
| L-b2678d6d2d | EN-SquarO (EN) | src/exercices/EN/EN-SquarO.ts | Consigne au vouvoiement (« Si vous le souhaitez, vous pouvez placer… ») alors que toutes les autres consignes de l'app sont à l'infinitif/impératif ; « parmi les 4 sommets » : 4 hors des $. → « Il est possible de placer… » ; $4$. | confirmé à la relecture |  |

## X4

**Question en double ou vide**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-d04da0a3c8 | 6N2autoE (6e) | beta/outilGlisseNombre.ts | « Glisse-nombre » est un outil (src/exercices/beta/outilGlisseNombre.ts) rangé comme exercice : ni consigne ni question, correction vide ; dans un parcours de l'app, l'élève voit une question sans rien à faire. → Le retirer des listes d'exercices (ou le marquer comme outil) ; côté app, l'exclure de l'éditeur de parcours. | confirmé à la relecture |  |
| L-5131dd5139 | a1e38 (Non classés, CH) | src/exercices/CH/a1e38.ts | Exercice « Consulter la liste des patterns disponibles pour différents exercices » : outil de développeur/enseignant exposé dans l'app, énoncé de 15 606 nombres hors des $ (N1), 972 guillemets T4, 96 X4 (énoncé vide), « Pour le motif 43, il y a 87 soleils » (nombres hors $) : sans intérêt pour un élève. → Retirer des exercices proposés aux élèves. | confirmé à la relecture |  |
