# Exercices de test, modèles ou inutilisables

Mis de côté : à retirer du référentiel ou à terminer, rien à corriger dans le détail.

26 constats, 26 exercices. Données complètes : `revue/classement/a-ecarter.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [C1 Contenu mathématique faux ou ambigu](#c1) | 4 | 4 |
| [R1 Titre](#r1) | 2 | 2 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 2 | 2 |
| [R16 Relecture : français, titre ou contenu](#r16) | 2 | 2 |
| [X4 Question en double ou vide](#x4) | 16 | 16 |

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

## X4

**Question en double ou vide**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-d04da0a3c8 | 6N2autoE (6e) | beta/outilGlisseNombre.ts | **Outil rangé comme exercice** ‖ « Glisse-nombre » est un outil (src/exercices/beta/outilGlisseNombre.ts) rangé comme exercice : ni consigne ni question, correction vide ; dans un parcours de l'app, l'élève voit une question sans rien à faire. → Le retirer des listes d'exercices (ou le marquer comme outil) ; côté app, l'exclure de l'éditeur de parcours. | confirmé à la relecture |  |
| L-5131dd5139 | a1e38 (Non classés, CH) | src/exercices/CH/a1e38.ts | **Outil rangé comme exercice** ‖ Exercice « Consulter la liste des patterns disponibles pour différents exercices » : outil de développeur/enseignant exposé dans l'app, énoncé de 15 606 nombres hors des $ (N1), 972 guillemets T4, 96 X4 (énoncé vide), « Pour le motif 43, il y a 87 soleils » (nombres hors $) : sans intérêt pour un élève. → Retirer des exercices proposés aux élèves. | confirmé à la relecture |  |
| L-ca8632a123 | a9f31 (Non classés, CH) | src/exercices/CH/a9f31.ts | **Outil rangé comme exercice** ‖ « Créer une animation de construction aux instruments (Instrumenpoche) » : outil d'enseignant (éditeur IEP) sans question ni correction (4 X4) : à retirer des exercices proposés aux élèves ; 2 pages > 390 px. → Retirer pour les élèves. | confirmé à la relecture |  |
| L-4b27f8724b | a9f71 (Non classés, CH) | src/exercices/CH/a9f71.ts | **Outil rangé comme exercice** ‖ « Produire un diagramme » : outil diagram-builder sans consigne (énoncé vide, 4 X4, 2 IM) ; à tester à la main. → Ajouter une consigne ; tester à la main. | confirmé à la relecture |  |
| L-688a16a0d0 | a9f82 (Non classés, CH) | src/exercices/CH/a9f82.ts | **Outil rangé comme exercice** ‖ « Illustrer le crible d'Ératosthène » : outil d'illustration sans consigne ni correction (4 X4) ; non évaluable. → Retirer ou ajouter une consigne. | confirmé à la relecture |  |
| L-9d93a2f33e | a9f83 (Non classés, CH) | src/exercices/CH/a9f83.ts | **Outil rangé comme exercice** ‖ « Créer un schéma en barre » : outil schema-en-barre sans consigne ni correction (20 X4) ; non évaluable. → Ajouter une consigne. | confirmé à la relecture |  |
| L-2a5ad5ba2d | ad5f5 (Non classés, CH) | src/exercices/CH/ad5f5.ts | **Outil rangé comme exercice** ‖ « Tracer des droites graduées » : outil de dessin (figure seule, énoncé et correction vides, 98 X4) : n'est pas un exercice évaluable pour un élève. → Retirer pour les élèves ou ajouter consigne. | confirmé à la relecture |  |
| L-02da496865 | ad5f6 (Non classés, CH) | src/exercices/CH/ad5f6.ts | **Outil rangé comme exercice** ‖ « Construire des droites graduées avec zoom » : outil sans consigne ni correction (22 X4). → Idem. | confirmé à la relecture |  |
| L-f3653a1e6f | ad5f7 (Non classés, CH) | src/exercices/CH/ad5f7.ts | **Outil rangé comme exercice** ‖ « Utiliser des grilles décimales » : outil sans consigne (28 X4). → Idem. | confirmé à la relecture |  |
| L-6832c8b050 | ad5f8 (Non classés, CH) | src/exercices/CH/ad5f8.ts | **Outil rangé comme exercice** ‖ « Fabriquer des pavages pour travailler les transformations » : outil sans consigne (28 X4). → Idem. | confirmé à la relecture |  |
| L-59d57f8a07 | babybel (Non classés, CH) | src/exercices/CH/babybel.ts | Exercice « TITRE » : titre de remplissage, figure apigeom sans consigne ni correction (24 X4, 12 IM) : exercice de test laissé dans la liste. → Retirer de la liste. | confirmé à la relecture |  |
| L-4405262b89 | f9261 (Non classés, CH) | src/exercices/modèlesExos/21_parametrable.ts | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Calcule » sans point, énoncé « $11 + 5 $ » → Retirer du référentiel ou compléter | confirmé à la relecture |  |
| L-fff4b5bc7d | jnapmep0 (Non classés, CH) | src/exercices/ | Exercice modèle dans le référentiel : « Trouver un titre pertinent », énoncé « 2+3 » → Retirer du référentiel | confirmé à la relecture |  |
| L-11dc9aa815 | jnapmep1 (Non classés, CH) | src/exercices/ | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », « Question 1 de type 2 » → Retirer du référentiel | confirmé à la relecture |  |
| L-e3c6fa341b | sebseb (Non classés, CH) | src/exercices/ | **Exercice de test** ‖ Titre « Schemas en boite » (accents) ; énoncé « 28 bonbons » hors $ ; correction vide → « Schémas en boîte » ; $28$ ; ajouter une correction | confirmé à la relecture |  |
| L-3a4e20bf4f | testEEE (Non classés, CH) | src/exercices/ | Exercice de test dans le référentiel : titre « Eric fait ses tests interactifs. », consigne (fraction égale, racine carrée du dénominateur) sans rapport avec la question « $-2(x-4)$ » → Retirer du référentiel | confirmé à la relecture |  |
