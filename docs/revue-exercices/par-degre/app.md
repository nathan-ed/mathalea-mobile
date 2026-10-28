# Revue des exercices : App

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **0 sur 0**. Constats confirmés : **1**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Interactif faux (la bonne réponse est refusée, ou pas de champ) | 1 |

## Interactif faux (la bonne réponse est refusée, ou pas de champ)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| moteur-app | I4 Question sans champ | App (moteur/fichiers/src/moteur/index.ts:135) : preparerExercice met interactif à vrai pour tout exercice, même ceux que MathALÉA déclare non interactifs (export interactifReady = false), alors que le site n'active l'interactif que si interactifReady est vrai. Effet : un champ apparaît avec une attente vide ou absurde (TSA4-41 : la correction HTML entière ; canTEC2-02, canTEC2-05 : chaîne vide ; canTEC2-03), la question compte dans le score et l'élève ne peut pas réussir. 4 exercices sur les ~1 000 déjà passés au banc | const interactif = params.interactif !== false && exercice.interactifReady !== false (puis pnpm moteur, e2e complets) | moteur/fichiers/src/moteur/index.ts:135 |
