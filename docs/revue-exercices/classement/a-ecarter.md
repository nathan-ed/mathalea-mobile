# Exercices de test, modèles ou inutilisables

Mis de côté : à retirer du référentiel ou à terminer, rien à corriger dans le détail.

129 constats, 26 exercices. Données complètes : `revue/classement/a-ecarter.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| [C1 Contenu mathématique faux ou ambigu](#c1) | 4 | 4 |
| [I1 Bonne réponse refusée](#i1) | 1 | 1 |
| [IM Interactif à tester à la main](#im) | 2 | 2 |
| [M1 Valeur mise en évidence refusée par le champ](#m1) | 1 | 1 |
| [M2 Unité dans miseEnEvidence](#m2) | 3 | 1 |
| [M3 QCM : bonne proposition pas mise en évidence telle quelle](#m3) | 12 | 2 |
| [M6 Pas de mise en évidence du résultat](#m6) | 11 | 11 |
| [N1 Nombre hors $](#n1) | 21 | 9 |
| [R1 Titre](#r1) | 12 | 10 |
| [R2 Impératif ou tutoiement](#r2) | 4 | 2 |
| [R10 Français (accords, fautes, coquilles)](#r10) | 2 | 2 |
| [R16 Relecture : français, titre ou contenu](#r16) | 2 | 2 |
| [T3 Espace avant : ; ! ?](#t3) | 1 | 1 |
| [T4 Guillemets](#t4) | 2 | 1 |
| [T5 Espaces en trop](#t5) | 3 | 3 |
| [T6 Points de suspension](#t6) | 4 | 2 |
| [X1 Erreur ou exception](#x1) | 2 | 1 |
| [X4 Question en double ou vide](#x4) | 37 | 17 |
| [X5 Débordement à 390 px](#x5) | 4 | 4 |
| [X7 Combinaisons de paramètres non toutes passées](#x7) | 1 | 1 |

## C1

**Contenu mathématique faux ou ambigu**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| L-0cd903bed7 | a309b (Non classés, CH) | src/exercices/CH/a309b.ts | Exercice modèle laissé dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », question « Question 1 » (texte de remplissage) : à retirer de la liste ou de l'app (règle : aucun placeholder). → Retirer de la liste. | confirmé à la relecture |  |
| L-954f6adbae | aaaaa (Non classés, CH) | src/exercices/CH/aaaaa.ts | Exercice modèle laissé dans le référentiel : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) » et question « 5+6 » (texte de remplissage) : à retirer (règle : aucun placeholder). → Retirer de la liste. | confirmé à la relecture |  |
| L-5ade56fc35 | AchangerOBLIGATOIREMENT (Non classés, CH) | src/exercices/CH/AchangerOBLIGATOIREMENT.ts | Deuxième exercice modèle (id « AchangerOBLIGATOIREMENT ») : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) », question « 5+6 », 2 X1 : à retirer de la liste (règle : aucun placeholder). → Retirer de la liste. | confirmé à la relecture |  |
| L-4ed21d0d52 | aModifier (Non classés, CH) | src/exercices/CH/aModifier.ts | Troisième exercice modèle (id « aModifier ») : titre « Nom de l'exercice », question « Question 1 de type 2 », correction « Correction 1 de type 2 » : texte de remplissage à retirer de la liste. → Retirer de la liste. | confirmé à la relecture |  |

## I1

**Bonne réponse refusée**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-4381d99272 | testEEE (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ bonne réponse refusée (0/1) Cette expression est bien égale à celle attendue mais n'est pas assez réduite. (×20) | rejoué : reproduit : refusé (0/1) : Cette expression est bien égale à celle attendue mais n'est pas assez réduite. | défaut, graine revue-0-a, q1, saisie {"champ":"-2(x-4)"} ([site](https://coopmaths.fr/alea/?uuid=testEEE&id=testEEE&alea=revue-0-a&i=1&cd=1)) |

## IM

**Interactif à tester à la main**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-984d40d06b | a9f71 (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ format diagram-builder : à tester à la main (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f71&id=a9f71&alea=revue-0-a&i=1&cd=1)) |
| A-f75d70d7c0 | babybel (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ format apigeom-figure : à tester à la main (×12) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=babybel&id=babybel&alea=revue-0-a&i=1&cd=1)) |

## M1

**Valeur mise en évidence refusée par le champ**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-ce74633e8f | 29957 (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ valeur en évidence refusée par le champ : {"champ2":"22\\text{ cm}","champ3":"100\\text{ cm}","champ4":"244\\text{ cm}"} ; attendu : {"champ2":"22\\operatorname{cm}","champ3":"100\\operatorname{cm}","champ4":"244\\operatorname{cm}"} (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=29957&id=29957&alea=revue-0-a&i=1&cd=1)) |

## M2

**Unité dans miseEnEvidence**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-2913fcc0e9 | 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:58 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ unité dans miseEnEvidence : `${texNombre(c * 10, 0)}\\text{ cm}` | détection automatique |  |
| A-60674333dc | 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:59 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ unité dans miseEnEvidence : `${texNombre(2 * (a * 10 + b + c * 10), 0)}\\text{ cm}` | détection automatique |  |
| A-97f5a0ceb8 | 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:57 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ unité dans miseEnEvidence : `${texNombre(a * 10 + b, 0)}\\text{ cm}` | détection automatique |  |

## M3

**QCM : bonne proposition pas mise en évidence telle quelle**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-141da7c382 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (h'(x)=\frac-15(8x+3)^2) absente de la mise en évidence () | détection automatique | défaut, graine revue-0-b, q9 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-b&i=1&cd=1)) |
| A-29ddc8b13c | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (f'(x)=1) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q3 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-66a4968aa5 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (h'(x)=-\frac1x^2) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q9 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-6e4c25346f | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (2) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q8 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-9bc19a6fd5 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (f'(x)=\frac52\sqrtx-10x+5) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q4 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-9c8dcffd93 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (g'(x)=-\frac59x^2) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q2 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-dcc153d3d6 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (h'(x)=27x^2+16x-6) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q6 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-de5d29f8e8 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (g'(x)=-16x) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q7 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-e8084e4dd6 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (f'(x)=8x+\frac3x^2) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-face350766 | deriv (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (f'(x)=-\frac12) absente de la mise en évidence () (×2) | détection automatique | défaut, graine revue-0-a, q5 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-3dd9ac6661 | exemple-qcm-json (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (4) absente de la mise en évidence () (×6) | détection automatique | défaut, graine revue-0-a, q2 ([site](https://coopmaths.fr/alea/?uuid=exemple-qcm-json&id=exemple-qcm-json&alea=revue-0-a&i=1&cd=1)) |
| A-5d27e720d8 | exemple-qcm-json (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ QCM : bonne proposition (3,14) absente de la mise en évidence () (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=exemple-qcm-json&id=exemple-qcm-json&alea=revue-0-a&i=1&cd=1)) |

## M6

**Pas de mise en évidence du résultat**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-7984f436d1 | 1eb36 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×12) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=1eb36&id=1eb36&alea=revue-0-a&i=1&cd=1)) |
| A-0d5778090b | 9f6e6 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×20) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=9f6e6&id=9f6e6&alea=revue-0-a&i=1&cd=1)) |
| A-fba9409c80 | a309b (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×6) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a309b&id=a309b&alea=revue-0-a&i=1&cd=1)) |
| A-ddea9acdff | aaaaa (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=aaaaa&id=aaaaa&alea=revue-0-a&i=1&cd=1)) |
| A-0906b691f5 | AchangerOBLIGATOIREMENT (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=AchangerOBLIGATOIREMENT&id=AchangerOBLIGATOIREMENT&alea=revue-0-a&i=1&cd=1)) |
| A-a75df0c97d | aModifier (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×20) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=aModifier&id=aModifier&alea=revue-0-a&i=1&cd=1)) |
| A-0f44a07485 | deriv (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×19) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-a&i=1&cd=1)) |
| A-d6afcb805b | exemple-qcm-json (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×9) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=exemple-qcm-json&id=exemple-qcm-json&alea=revue-0-a&i=1&cd=1)) |
| A-d0e73d3ed5 | f9261 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×60) | détection automatique | sup=2, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=f9261&id=f9261&s=2&alea=revue-0-a&i=1&cd=1)) |
| A-bc2d5fdd13 | jnapmep0 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=jnapmep0&id=jnapmep0&alea=revue-0-a&i=1&cd=1)) |
| A-6686cc6feb | jnapmep1 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ aucune mise en évidence dans la correction (×200) | détection automatique | sup=false sup2=4  , graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=jnapmep1&id=jnapmep1&s=false&s2=4&alea=revue-0-a&i=1&cd=1)) |

## N1

**Nombre hors $**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-2903d7f4df | 9f6e6 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Question 1 de type 2 (×20) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=9f6e6&id=9f6e6&alea=revue-0-a&i=1&cd=1)) |
| A-8bb9f6317b | 9f6e6 (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Correction 1 de type 2 (×20) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=9f6e6&id=9f6e6&alea=revue-0-a&i=1&cd=1)) |
| A-16158cb55b | a1e38 (Non classés, CH) | énoncé non interactif | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Motif 1 : Pour le motif 43, il y a 87 soleils. Pour le m ‖ « 43 » hors $ : Motif 1 : Pour le motif 43, il y a 87 soleils. Pour le motif ‖ « 2 » hors $ : Motif 2 : Pour le motif 43, il y a 85 carrés. Pour le mo (×147) | détection automatique |  |
| A-7aad928ae3 | a1e38 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Motif 1 : Pour le motif 43, il y a 87 soleils. Pour le m ‖ « 43 » hors $ : Motif 1 : Pour le motif 43, il y a 87 soleils. Pour le motif ‖ « 2 » hors $ : Motif 2 : Pour le motif 43, il y a 85 carrés. Pour le mo (×5202) | détection automatique | sup=1 sup3=4, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a1e38&id=a1e38&s=1&s3=4&alea=revue-0-a&i=1&cd=1)) |
| A-0df8522cc5 | a309b (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Question 1 (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a309b&id=a309b&alea=revue-0-a&i=1&cd=1)) |
| A-7e39ddb470 | a309b (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Correction 1 (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a309b&id=a309b&alea=revue-0-a&i=1&cd=1)) |
| A-543fd8fe9e | aaaaa (Non classés, CH) | énoncé non interactif | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 5 » hors $ : 5+6 (×2) | détection automatique |  |
| A-9033ade96d | aaaaa (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 5 » hors $ : 5+6=11 (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=aaaaa&id=aaaaa&alea=revue-0-a&i=1&cd=1)) |
| A-b7470e9108 | aaaaa (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 5 » hors $ : 5+6 [champ] (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=aaaaa&id=aaaaa&alea=revue-0-a&i=1&cd=1)) |
| A-5e8980ce73 | AchangerOBLIGATOIREMENT (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 5 » hors $ : 5+6 [champ] (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=AchangerOBLIGATOIREMENT&id=AchangerOBLIGATOIREMENT&alea=revue-0-a&i=1&cd=1)) |
| A-6ae0f13c7e | AchangerOBLIGATOIREMENT (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 5 » hors $ : 5+6=11 (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=AchangerOBLIGATOIREMENT&id=AchangerOBLIGATOIREMENT&alea=revue-0-a&i=1&cd=1)) |
| A-dbcc44db5e | AchangerOBLIGATOIREMENT (Non classés, CH) | énoncé non interactif | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 5 » hors $ : 5+6 (×2) | détection automatique |  |
| A-99f3a229ca | aModifier (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Correction 1 de type 2 (×20) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=aModifier&id=aModifier&alea=revue-0-a&i=1&cd=1)) |
| A-efb9b44d73 | aModifier (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Question 1 de type 2 ‖ « 2 » hors $ : Question 2 de type 1 avec 5 ‖ « 5 » hors $ : Question 5 de type 1 avec -4 (×22) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=aModifier&id=aModifier&alea=revue-0-a&i=1&cd=1)) |
| A-7d53cd18ba | jnapmep0 (Non classés, CH) | énoncé non interactif | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 2 » hors $ : 2+3 (×2) | détection automatique |  |
| A-dda4974f7a | jnapmep0 (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 2 » hors $ : 2+3=5 (×3) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=jnapmep0&id=jnapmep0&alea=revue-0-a&i=1&cd=1)) |
| A-eb6531020a | jnapmep0 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 2 » hors $ : 2+3 [champ] (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=jnapmep0&id=jnapmep0&alea=revue-0-a&i=1&cd=1)) |
| A-836e2032d5 | jnapmep1 (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Correction 1 de type 2 (×60) | détection automatique | sup=false sup2=4  , graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=jnapmep1&id=jnapmep1&s=false&s2=4&alea=revue-0-a&i=1&cd=1)) |
| A-9ec5d56752 | jnapmep1 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Question 1 de type 2 [champ] ‖ « 2 » hors $ : Question 2 de type 1 avec 3 [champ] ‖ « 3 » hors $ : Question 3 de type 1 avec -1 [champ] (×127) | détection automatique | sup=false sup2=4  , graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=jnapmep1&id=jnapmep1&s=false&s2=4&alea=revue-0-a&i=1&cd=1)) |
| A-af92f2cf2f | jnapmep1 (Non classés, CH) | énoncé non interactif | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 1 » hors $ : Question 1 de type 2 ‖ « 2 » hors $ : Question 2 de type 1 avec 3 (×24) | détection automatique |  |
| A-f6a60bf293 | sebseb (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « 28 » hors $ : Magalie a 28 bonbons et Fernando a 28 bonbons. Combien ont-i ‖ « 28 » hors $ : Magalie a 28 bonbons et Fernando a 28 bonbons. Combien ont-ils de bonbons en tout ? ‖ « 7 » hors $ : Nathalie a distribué 7 bonbons à chacun de ses élèves. En tout, elle a (×304) | détection automatique | sup=13, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=sebseb&id=sebseb&s=13&alea=revue-0-a&i=1&cd=1)) |

## R1

**Titre**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-f46a7a532c | 1eb36 (Non classés) | src/exercices/modèlesExos/30_constructions_géométriques.ts:16 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Nom de l'exercice | détection automatique |  |
| L-ae25ec0d4c | 1eb36 (Non classés, CH) | relecture | Exercice modèle exposé : titre « Nom de l'exercice », consigne « consigne » → Compléter le titre et la consigne ou retirer l'exercice du référentiel | confirmé à la relecture |  |
| A-6f5af89f82 | 29957 (Non classés) | src/exercices/can/c3/canc3C26.ts:8 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Test MultiMathfield | détection automatique |  |
| L-fa3c82a60f | 9f6e6 (Non classés, CH) | relecture | Exercice modèle exposé : « Titre de l'exercice », « Consigne », « Question 1 de type 2 » → Retirer du référentiel | confirmé à la relecture |  |
| A-2df5c5a2a9 | a309b (Non classés) | src/exercices/modèlesExos/30_questions_differentes_chronologiquesy.ts:3 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Nom de l'exercice | détection automatique |  |
| A-2afc298cbf | aModifier (Non classés) | src/exercices/modèlesExos/20_plusieurs_types.ts:4 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Nom de l'exercice | détection automatique |  |
| A-eacc1b0c41 | exemple-qcm-json (Non classés) | src/exercices/modèlesExos/ExempleQcmJson.ts:65 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Exemple QCM JSON | détection automatique |  |
| A-ce1594c181 | f9261 (Non classés) | src/exercices/modèlesExos/21_parametrable.ts:3 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Nom de l'exercice | détection automatique |  |
| A-b07f0b1c3b | jnapmep1 (Non classés) | src/exercices/modèlesExos/JNAPMEP_parametrage.ts:14 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Nom de l'exercice | détection automatique |  |
| A-e2131cfb0d | sebseb (Non classés) | src/exercices/modèlesExos/ExempleSchemaEnBoite.ts:10 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre sans infinitif en tête : Schemas en boite | détection automatique |  |
| A-6fb87258e8 | testEEE (Non classés, CH) | titre | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre terminé par un point : Eric fait ses tests interactifs. | détection automatique |  |
| A-baa69d42d2 | testEEE (Non classés) | src/exercices/profs/test.ts:8 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ titre terminé par un point : Eric fait ses tests interactifs. ‖ titre sans infinitif en tête : Eric fait ses tests interactifs. (×2) | détection automatique |  |

## R2

**Impératif ou tutoiement**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-2a9bf85d89 | f9261 (Non classés, CH) | consigne | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ impératif : Calcule | détection automatique | sup=2, graine revue-0-a ([site](https://coopmaths.fr/alea/?uuid=f9261&id=f9261&s=2&alea=revue-0-a&i=1&cd=1)) |
| A-9de92dcc8c | f9261 (Non classés) | src/exercices/modèlesExos/21_parametrable.ts:23 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ consigne à l'impératif : Calcule | détection automatique |  |
| A-31d0f258ec | testEEE (Non classés) | src/exercices/profs/test.ts:182 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ consigne à l'impératif : Donne un ensemble de nombres égal à :  | détection automatique |  |
| A-a2b7414f8d | testEEE (Non classés) | src/exercices/profs/test.ts:181 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ consigne à l'impératif : Recopie exactement une de ces deux propositions. | détection automatique |  |

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

## T3

**Espace avant : ; ! ?**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-7fcf834dcb | sebseb (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ espace ordinaire (sécable) avant « ? » : Combien d'élèves a-t-elle ? ? fois ‖ espace ordinaire (sécable) avant « ? » : ? € Argent sur le compte au départ ‖ espace ordinaire (sécable) avant « ? » : ? (×58) | détection automatique | sup=13, graine revue-0-a, q2 ([site](https://coopmaths.fr/alea/?uuid=sebseb&id=sebseb&s=13&alea=revue-0-a&i=1&cd=1)) |

## T4

**Guillemets**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-f7e8ba5cd9 | a1e38 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ guillemets droits : éléments dans le ratio "carré bleu : carré gris : rond" de ‖ guillemets droits : , le ratio "carré bleu : carré gris : rond" est de ‖ guillemets droits : éléments dans le ratio "soleil : étoile : hexagone" de (×324) | détection automatique | sup=5 sup3=1, graine revue-24-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a1e38&id=a1e38&s=5&s3=1&alea=revue-24-a&i=1&cd=1)) |
| A-fe1def06b1 | a1e38 (Non classés, CH) | énoncé non interactif | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ guillemets droits : éléments dans le ratio "carré bleu : carré gris : rond" de ‖ guillemets droits : , le ratio "carré bleu : carré gris : rond" est de ‖ guillemets droits : éléments dans le ratio "soleil : étoile : hexagone" de (×324) | détection automatique | sup=5 sup3=1, graine revue-24-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a1e38&id=a1e38&s=5&s3=1&alea=revue-24-a&i=1&cd=1)) |

## T5

**Espaces en trop**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-6465a307ed | deriv (Non classés, CH) | correction non interactive | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ double espace : réponse A : Correct ! ‖ double espace : . réponse B : Erreur : vous n'avez pas correctement dérivé ‖ double espace : . réponse C : Erreur : (×36) | détection automatique |  |
| A-b3c3a26c53 | exemple-qcm-json (Non classés, CH) | correction non interactive | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ double espace : réponse A : Correct ! ‖ double espace : réponse B : Erreur : c'est l'approximation de ‖ double espace : réponse C : Erreur : c'est l'approximation de (×12) | détection automatique |  |
| A-c69c7cda88 | sebseb (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ double espace : ues. Il y a trois fois plus de billes rouges que de billes vertes et il y a 2 billes vertes de moin (×13) | détection automatique | sup=13, graine revue-0-a, q5 ([site](https://coopmaths.fr/alea/?uuid=sebseb&id=sebseb&s=13&alea=revue-0-a&i=1&cd=1)) |

## T6

**Points de suspension**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-25cc476a16 | exemple-qcm-json (Non classés) | src/exercices/modèlesExos/ExempleQcmJson.ts:54 | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ « ... » : Correct ! $\\pi \\approx 3,14159...$ | détection automatique |  |
| A-3265768d74 | exemple-qcm-json (Non classés, CH) | correction non interactive | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ points de suspension en maths (\ldots) : $\pi \approx 3,14159...$ | détection automatique |  |
| A-36c4c5dce5 | exemple-qcm-json (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ points de suspension en maths (\ldots) : $\pi \approx 3,14159...$ (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=exemple-qcm-json&id=exemple-qcm-json&alea=revue-0-a&i=1&cd=1)) |
| A-13e0983248 | sebseb (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ points de suspension : .... ‖ points de suspension : ? .... ? (×52) | détection automatique | sup=13, graine revue-0-a, q2 ([site](https://coopmaths.fr/alea/?uuid=sebseb&id=sebseb&s=13&alea=revue-0-a&i=1&cd=1)) |

## X1

**Erreur ou exception**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-1dc81ceae2 | AchangerOBLIGATOIREMENT (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ console : Un exercice simple doit avoir un this.reponse sauf si c'est un qcm ou un MathaleaCustomElement avec sa propre autoCorrection | détection automatique |  |
| A-47d0720e69 | AchangerOBLIGATOIREMENT (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d560f057:1928:32) | détection automatique |  |

## X4

**Question en double ou vide**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-638d4a852e | 6N2autoE (6e) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=fe783&id=6N2autoE&alea=revue-0-a&i=1&cd=1)) |
| A-b010c8c6e0 | 6N2autoE (6e) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ énoncé vide (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=fe783&id=6N2autoE&alea=revue-0-a&i=1&cd=1)) |
| L-d04da0a3c8 | 6N2autoE (6e) | beta/outilGlisseNombre.ts | **Outil rangé comme exercice** ‖ « Glisse-nombre » est un outil (src/exercices/beta/outilGlisseNombre.ts) rangé comme exercice : ni consigne ni question, correction vide ; dans un parcours de l'app, l'élève voit une question sans rien à faire. → Le retirer des listes d'exercices (ou le marquer comme outil) ; côté app, l'exclure de l'éditeur de parcours. | confirmé à la relecture |  |
| A-ca49f31575 | 77d18 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×10) | détection automatique | sup=5, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=77d18&id=77d18&s=5&alea=revue-0-a&i=1&cd=1)) |
| A-8877fc7e08 | a1e38 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×96) | détection automatique | sup=1 sup3=4, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a1e38&id=a1e38&s=1&s3=4&alea=revue-0-a&i=1&cd=1)) |
| L-5131dd5139 | a1e38 (Non classés, CH) | src/exercices/CH/a1e38.ts | **Outil rangé comme exercice** ‖ Exercice « Consulter la liste des patterns disponibles pour différents exercices » : outil de développeur/enseignant exposé dans l'app, énoncé de 15 606 nombres hors des $ (N1), 972 guillemets T4, 96 X4 (énoncé vide), « Pour le motif 43, il y a 87 soleils » (nombres hors $) : sans intérêt pour un élève. → Retirer des exercices proposés aux élèves. | confirmé à la relecture |  |
| A-163b15b9d4 | a9f31 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ énoncé vide (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f31&id=a9f31&alea=revue-0-a&i=1&cd=1)) |
| A-5ac2d4fab6 | a9f31 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f31&id=a9f31&alea=revue-0-a&i=1&cd=1)) |
| L-ca8632a123 | a9f31 (Non classés, CH) | src/exercices/CH/a9f31.ts | **Outil rangé comme exercice** ‖ « Créer une animation de construction aux instruments (Instrumenpoche) » : outil d'enseignant (éditeur IEP) sans question ni correction (4 X4) : à retirer des exercices proposés aux élèves ; 2 pages > 390 px. → Retirer pour les élèves. | confirmé à la relecture |  |
| A-121014601f | a9f71 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f71&id=a9f71&alea=revue-0-a&i=1&cd=1)) |
| A-509bf74d9b | a9f71 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ énoncé vide (×2) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f71&id=a9f71&alea=revue-0-a&i=1&cd=1)) |
| L-4b27f8724b | a9f71 (Non classés, CH) | src/exercices/CH/a9f71.ts | **Outil rangé comme exercice** ‖ « Produire un diagramme » : outil diagram-builder sans consigne (énoncé vide, 4 X4, 2 IM) ; à tester à la main. → Ajouter une consigne ; tester à la main. | confirmé à la relecture |  |
| A-06b0e9752a | a9f82 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ énoncé vide (×2) | détection automatique | sup=100, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f82&id=a9f82&s=100&alea=revue-0-a&i=1&cd=1)) |
| A-67f1b11c4b | a9f82 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×2) | détection automatique | sup=100, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f82&id=a9f82&s=100&alea=revue-0-a&i=1&cd=1)) |
| L-688a16a0d0 | a9f82 (Non classés, CH) | src/exercices/CH/a9f82.ts | **Outil rangé comme exercice** ‖ « Illustrer le crible d'Ératosthène » : outil d'illustration sans consigne ni correction (4 X4) ; non évaluable. → Retirer ou ajouter une consigne. | confirmé à la relecture |  |
| A-7cf72416a9 | a9f83 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×10) | détection automatique | sup=0, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f83&id=a9f83&s=0&alea=revue-0-a&i=1&cd=1)) |
| A-bb85d434fd | a9f83 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ énoncé vide (×10) | détection automatique | sup=0, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=a9f83&id=a9f83&s=0&alea=revue-0-a&i=1&cd=1)) |
| L-9d93a2f33e | a9f83 (Non classés, CH) | src/exercices/CH/a9f83.ts | **Outil rangé comme exercice** ‖ « Créer un schéma en barre » : outil schema-en-barre sans consigne ni correction (20 X4) ; non évaluable. → Ajouter une consigne. | confirmé à la relecture |  |
| A-ccbce89b3a | ad5f5 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×98) | détection automatique | sup=10, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=ad5f5&id=ad5f5&s=10&alea=revue-0-a&i=1&cd=1)) |
| L-2a5ad5ba2d | ad5f5 (Non classés, CH) | src/exercices/CH/ad5f5.ts | **Outil rangé comme exercice** ‖ « Tracer des droites graduées » : outil de dessin (figure seule, énoncé et correction vides, 98 X4) : n'est pas un exercice évaluable pour un élève. → Retirer pour les élèves ou ajouter consigne. | confirmé à la relecture |  |
| A-dccc60d114 | ad5f6 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×22) | détection automatique | sup=1, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=ad5f6&id=ad5f6&s=1&alea=revue-0-a&i=1&cd=1)) |
| L-02da496865 | ad5f6 (Non classés, CH) | src/exercices/CH/ad5f6.ts | **Outil rangé comme exercice** ‖ « Construire des droites graduées avec zoom » : outil sans consigne ni correction (22 X4). → Idem. | confirmé à la relecture |  |
| A-7bcd94aa98 | ad5f7 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×28) | détection automatique | sup=1, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=ad5f7&id=ad5f7&s=1&alea=revue-0-a&i=1&cd=1)) |
| L-f3653a1e6f | ad5f7 (Non classés, CH) | src/exercices/CH/ad5f7.ts | **Outil rangé comme exercice** ‖ « Utiliser des grilles décimales » : outil sans consigne (28 X4). → Idem. | confirmé à la relecture |  |
| A-36bc886003 | ad5f8 (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×140) | détection automatique | sup=4 sup2=1-1 sup3=true, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=ad5f8&id=ad5f8&s=4&s2=1-1&s3=true&alea=revue-0-a&i=1&cd=1)) |
| L-6832c8b050 | ad5f8 (Non classés, CH) | src/exercices/CH/ad5f8.ts | **Outil rangé comme exercice** ‖ « Fabriquer des pavages pour travailler les transformations » : outil sans consigne (28 X4). → Idem. | confirmé à la relecture |  |
| A-638fea88ed | babybel (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×12) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=babybel&id=babybel&alea=revue-0-a&i=1&cd=1)) |
| A-8ee2c94a47 | babybel (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ énoncé vide (×12) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=babybel&id=babybel&alea=revue-0-a&i=1&cd=1)) |
| L-59d57f8a07 | babybel (Non classés, CH) | src/exercices/CH/babybel.ts | Exercice « TITRE » : titre de remplissage, figure apigeom sans consigne ni correction (24 X4, 12 IM) : exercice de test laissé dans la liste. → Retirer de la liste. | confirmé à la relecture |  |
| L-4405262b89 | f9261 (Non classés, CH) | src/exercices/modèlesExos/21_parametrable.ts | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Calcule » sans point, énoncé « $11 + 5 $ » → Retirer du référentiel ou compléter | confirmé à la relecture |  |
| L-fff4b5bc7d | jnapmep0 (Non classés, CH) | src/exercices/ | Exercice modèle dans le référentiel : « Trouver un titre pertinent », énoncé « 2+3 » → Retirer du référentiel | confirmé à la relecture |  |
| L-11dc9aa815 | jnapmep1 (Non classés, CH) | src/exercices/ | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », « Question 1 de type 2 » → Retirer du référentiel | confirmé à la relecture |  |
| A-43d9c9f268 | sebseb (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×312) | détection automatique | sup=13, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=sebseb&id=sebseb&s=13&alea=revue-0-a&i=1&cd=1)) |
| L-e3c6fa341b | sebseb (Non classés, CH) | src/exercices/ | **Exercice de test** ‖ Titre « Schemas en boite » (accents) ; énoncé « 28 bonbons » hors $ ; correction vide → « Schémas en boîte » ; $28$ ; ajouter une correction | confirmé à la relecture |  |
| A-5a9ed3edea | testEEE (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ correction vide (×20) | détection automatique | défaut, graine revue-0-a, q1 ([site](https://coopmaths.fr/alea/?uuid=testEEE&id=testEEE&alea=revue-0-a&i=1&cd=1)) |
| A-dd8e8c7eab | testEEE (Non classés, CH) | série | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ question 2 identique à la question 1 (×18) | détection automatique | défaut, graine revue-0-a, q2 ([site](https://coopmaths.fr/alea/?uuid=testEEE&id=testEEE&alea=revue-0-a&i=1&cd=1)) |
| L-3a4e20bf4f | testEEE (Non classés, CH) | src/exercices/ | Exercice de test dans le référentiel : titre « Eric fait ses tests interactifs. », consigne (fraction égale, racine carrée du dénominateur) sans rapport avec la question « $-2(x-4)$ » → Retirer du référentiel | confirmé à la relecture |  |

## X5

**Débordement à 390 px**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-cbfbf066c5 | a9f31 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ page de 490 px pour 390 px (×2) | détection automatique | défaut, graine revue-0-a, q0 ([site](https://coopmaths.fr/alea/?uuid=a9f31&id=a9f31&alea=revue-0-a&i=1&cd=1)) |
| A-eeb3a90fb5 | a9f71 (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ page de 491 px pour 390 px (×2) | détection automatique | défaut, graine revue-0-a, q0 ([site](https://coopmaths.fr/alea/?uuid=a9f71&id=a9f71&alea=revue-0-a&i=1&cd=1)) |
| A-7c9c51d51c | deriv (Non classés, CH) | correction | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ page de 427 px pour 390 px | détection automatique | défaut, graine revue-0-b, q0 ([site](https://coopmaths.fr/alea/?uuid=deriv&id=deriv&alea=revue-0-b&i=1&cd=1)) |
| A-3ddbc98687 | sebseb (Non classés, CH) | énoncé | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ page de 688 px pour 390 px (×12) | détection automatique | sup=13, graine revue-0-a, q0 ([site](https://coopmaths.fr/alea/?uuid=sebseb&id=sebseb&s=13&alea=revue-0-a&i=1&cd=1)) |

## X7

**Combinaisons de paramètres non toutes passées**

| Clé | Exercice | Où | Constat | Statut | Reproduire |
| --- | --- | --- | --- | --- | --- |
| A-ce47574a91 | ad5f8 (Non classés, CH) |  | **Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire** ‖ 112 combinaisons : 56 passées (couverture par paires) | détection automatique |  |
