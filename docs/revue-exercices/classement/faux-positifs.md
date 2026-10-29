# Faux positifs écartés

Constats automatiques reconnus faux à la relecture, gardés pour la traçabilité.

1158 constats, 226 exercices. Données complètes : `revue/classement/faux-positifs.jsonl` (clé, graines, saisies). Fichier produit par `node revue/classer.mjs`.

| Règle | Constats | Exercices |
| --- | ---: | ---: |
| I1 Bonne réponse refusée : [liste](faux-positifs/I1.md) | 15 | 15 |
| I2 Réponse fausse acceptée : [liste](faux-positifs/I2.md) | 3 | 3 |
| I4 Question interactive sans champ : [liste](faux-positifs/I4.md) | 42 | 42 |
| M1 Valeur mise en évidence refusée par le champ : [partie 1](faux-positifs/M1-1.md), [partie 2](faux-positifs/M1-2.md) | 839 | 127 |
| M8 Nombre de mises en évidence et de champs différents : [liste](faux-positifs/M8.md) | 1 | 1 |
| N1 Nombre hors $ : [liste](faux-positifs/N1.md) | 25 | 16 |
| R5 Virgule (soit, alors, or) : [liste](faux-positifs/R5.md) | 3 | 3 |
| R10 Français (accords, fautes, coquilles) : [liste](faux-positifs/R10.md) | 2 | 1 |
| T3 Espace avant : ; ! ? : [liste](faux-positifs/T3.md) | 37 | 21 |
| T5 Espaces en trop : [liste](faux-positifs/T5.md) | 22 | 14 |
| T6 Points de suspension : [liste](faux-positifs/T6.md) | 5 | 4 |
| X2 Formule cassée (KaTeX, $) : [liste](faux-positifs/X2.md) | 160 | 6 |
| X3 undefined, NaN… : [liste](faux-positifs/X3.md) | 4 | 1 |
