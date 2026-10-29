# Exercices de test, modèles ou inutilisables

Mis de côté : à retirer du référentiel ou à terminer, rien à corriger dans le détail.

18 constats, 18 exercices. Données complètes : `revue/classement/a-ecarter.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [C1 Contenu mathématique faux ou ambigu](#c1) | 4 | 4 |
| [R1 Titre](#r1) | 3 | 3 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 2 | 2 |
| [R16 Relecture : français, titre ou contenu](#r16) | 2 | 2 |
| [X1 Erreur ou exception](#x1) | 1 | 1 |
| [X3 undefined, NaN…](#x3) | 1 | 1 |
| [X4 Question en double ou vide](#x4) | 5 | 5 |

## C1

**Contenu mathématique faux ou ambigu**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-0cd903bed7 | a309b (Non classés, CH) | src/exercices/CH/a309b.ts | Exercice modèle laissé dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », question « Question 1 » (texte de remplissage) : à retirer de la liste ou de l'app (règle : aucun placeholder). → Retirer de la liste. | confirmé à la relecture |  |
| L-954f6adbae | aaaaa (Non classés, CH) | src/exercices/CH/aaaaa.ts | Exercice modèle laissé dans le référentiel : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) » et question « 5+6 » (texte de remplissage) : à retirer (règle : aucun placeholder). → Retirer de la liste. | confirmé à la relecture |  |
| L-5ade56fc35 | AchangerOBLIGATOIREMENT (Non classés, CH) | src/exercices/CH/AchangerOBLIGATOIREMENT.ts | Deuxième exercice modèle (id « AchangerOBLIGATOIREMENT ») : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) », question « 5+6 », 2 X1 : à retirer de la liste (règle : aucun placeholder). → Retirer de la liste. | confirmé à la relecture |  |
| L-4ed21d0d52 | aModifier (Non classés, CH) | src/exercices/CH/aModifier.ts | Troisième exercice modèle (id « aModifier ») : titre « Nom de l'exercice », question « Question 1 de type 2 », correction « Correction 1 de type 2 » : texte de remplissage à retirer de la liste. → Retirer de la liste. | confirmé à la relecture |  |

## R1

**Titre**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-ae25ec0d4c | 1eb36 (Non classés, CH) | relecture | Exercice modèle exposé : titre « Nom de l'exercice », consigne « consigne » → Compléter le titre et la consigne ou retirer l'exercice du référentiel | confirmé à la relecture |  |
| L-58f92f0012 | 67e15 (Non classés, CH) | relecture | Titre « Titre à modifier » (placeholder exposé) → Renseigner le titre (Calculer une image par une fonction affine) | confirmé à la relecture |  |
| L-fa3c82a60f | 9f6e6 (Non classés, CH) | relecture | Exercice modèle exposé : « Titre de l'exercice », « Consigne », « Question 1 de type 2 » → Retirer du référentiel | confirmé à la relecture |  |

## R10

**Français (accords, fautes, coquilles)**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-a51f6cdc89 | 29957 (Non classés, CH) | relecture | Exercice de test « Test MultiMathfield » exposé dans le référentiel → Retirer du référentiel | confirmé à la relecture |  |
| L-2ddc6838ff | 77d18 (Non classés, CH) | relecture | Exercice inutilisable exposé : « Cet exercice n'a pas pu être conservé pour des raisons techniques. Vous trouverez dans la section 3F1 ne nombreux exercices… » (coquille « ne nombreux »), aucune question → Retirer l'exercice du référentiel ou corriger « de nombreux » | confirmé à la relecture |  |

## R16

**Relecture : français, titre ou contenu**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-f3108c69c4 | deriv (Non classés, CH) | src/exercices/modèlesExos/ExempleQcmDerivation.ts | Exercice modèle : $\frac$ au lieu de $\dfrac$ ; retours « Correct ! » / « vous n'avez pas… » (vouvoiement, voir tutoiement ailleurs) ; exemple visible dans le référentiel → \dfrac ; formulation neutre ; ou retirer du référentiel | confirmé à la relecture |  |
| L-041d4de05c | exemple-qcm-json (Non classés, CH) | relecture | Exercice modèle : « 3,14159... » (trois points tapés), e en italique, retours « Correct ! », « vous avez inversé » ; exemple visible dans le référentiel → \ldots ; \mathrm{e} | confirmé à la relecture |  |

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

## X4

**Question en double ou vide**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-59d57f8a07 | babybel (Non classés, CH) | src/exercices/CH/babybel.ts | Exercice « TITRE » : titre de remplissage, figure apigeom sans consigne ni correction (24 X4, 12 IM) : exercice de test laissé dans la liste. → Retirer de la liste. | confirmé à la relecture |  |
| L-4405262b89 | f9261 (Non classés, CH) | src/exercices/modèlesExos/21_parametrable.ts | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Calcule » sans point, énoncé « $11 + 5 $ » → Retirer du référentiel ou compléter | confirmé à la relecture |  |
| L-fff4b5bc7d | jnapmep0 (Non classés, CH) | src/exercices/ | Exercice modèle dans le référentiel : « Trouver un titre pertinent », énoncé « 2+3 » → Retirer du référentiel | confirmé à la relecture |  |
| L-11dc9aa815 | jnapmep1 (Non classés, CH) | src/exercices/ | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », « Question 1 de type 2 » → Retirer du référentiel | confirmé à la relecture |  |
| L-3a4e20bf4f | testEEE (Non classés, CH) | src/exercices/ | Exercice de test dans le référentiel : titre « Eric fait ses tests interactifs. », consigne (fraction égale, racine carrée du dénominateur) sans rapport avec la question « $-2(x-4)$ » → Retirer du référentiel | confirmé à la relecture |  |
