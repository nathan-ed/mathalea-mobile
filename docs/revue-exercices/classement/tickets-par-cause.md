# Tickets par cause

Constats des catégories `tickets-interactif`, `tickets-rendu`, `app-mobile` regroupés par cause :
un ticket par cause, avec la liste des exercices touchés. Chaque constat
apparaît une seule fois (812 constats). Généré par
`node revue/tickets.mjs` à partir de `revue/classement/*.jsonl` ; la clé
renvoie au constat complet (graine, paramètres, saisie) dans ces fichiers.

| Cause | Constats | Exercices |
| --- | --- | --- |
| 1. App : questions à plusieurs champs numérotés sur tout l'exercice | 3 | 3 |
| 2. App : exercices à questions chargées après coup (meta-custom) | 11 | 5 |
| 3. App : exercices non interactifs sur le site rendus interactifs | 9 | 7 |
| 4. Comparaison : ce qui suit une matrice est ignoré | 15 | 9 |
| 5. Comparaison : ce qui suit l'unité est ignoré | 13 | 10 |
| 6. Comparaison : seul le premier intervalle est lu | 6 | 6 |
| 7. Comparaison : intervalle privé d'un point, réunion à bornes fractionnaires | 6 | 3 |
| 8. Comparaison : l'ensemble vide | 1 | 1 |
| 9. Comparaison : notation scientifique d'une somme calculée en flottants | 1 | 1 |
| 10. MonomePlusieursVariables : exposant ≥ 10 sans accolades | 19 | 4 |
| 11. 3G32 : parenthèse ouvrante en trop dans la réponse attendue | 7 | 7 |
| 12. CAN « Spéciale année » 2025 et 2026, question 24 : ℝ privé de b | 5 | 4 |
| 13. TTE-11 (et TSA5-30, qui le reprend) : ensemble de définition illisible, balises visibles | 14 | 2 |
| 14. Réponse attendue vide | 4 | 3 |
| 15. Réponse attendue calculée en flottant | 7 | 7 |
| 16. Nombre fractionnaire dont la fraction vaut 1 | 2 | 2 |
| 17. Texte « undefined » en tête de question (QCM) | 18 | 5 |
| 18. Identifiant « undefined » dans deuxColonnesResp (invisible pour l'élève) | 118 | 23 |
| 19. App : étiquettes des figures réduites | 3 | 3 |
| 20. Texte « undefined », « NaN » ou « [object Object] » visible | 16 | 7 |
| 21. Valeur approchée : seul l'arrondi est accepté | 2 | 2 |
| 22. Nombres en lettres : une seule orthographe acceptée | 3 | 3 |
| 23. Forme de la réponse : consigne et contrôle ne vont pas ensemble | 5 | 4 |
| 24. Moins de questions que demandé | 4 | 4 |
| 25. Questions en double dans une même série | 87 | 81 |
| 26. Énoncé ou correction vide | 121 | 96 |
| 27. Aucune question produite pour une combinaison de réglages | 12 | 7 |
| 28. Même graine, énoncés différents | 24 | 24 |
| 29. Erreurs d'exécution signalées pendant la génération | 43 | 24 |
| 30. Exercices trop lents pour le banc | 5 | 5 |
| 31. Formules mal fermées (« $ » visible, nombre impair de $) | 168 | 28 |
| Autres tickets (un par exercice) | 60 | 56 |

## 1. App : questions à plusieurs champs numérotés sur tout l'exercice

- Où : moteur/fichiers/src/moteur/index.ts:227 (verifier), src/lib/ui/BlocQuestion.svelte:173 ; site : QuestionParPage.svelte:116
- Ce qui se passe : verifier(exercice, question) ne lit que autoCorrection[question]. Quand une question contient les champs Q0, Q1, Q2… (indices à la suite sur tout l'exercice), seul le champ qui porte l'indice de la question est vérifié, et la question suivante est notée sur un champ de la précédente. 176 exercices bâtis ainsi : revue/champs-decales.json.
- Correction proposée : Vérifier tous les autoCorrection dont le champ est dans le bloc de la question (score = somme). À décider avec Nathan (app) et à proposer pour la vue « une question par page » du site.
- Exercices (3) : 3F13-1, CM2N1D-2, TEM1-14

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-4f31daf857 | 3F13-1 | app-mobile | Vérifié (revue/trier-i4.mjs) : question à plusieurs champs numérotés à la suite sur l'exercice ; le champ portant l'indice de la question est dans une autre question. Même cause q… (×4) | [site](https://coopmaths.fr/alea/?uuid=4b122&id=3F13-1&s=2&alea=revue-2-a&i=1&cd=1) |
| A-a9c9891c92 | CM2N1D-2 | app-mobile | Vérifié (revue/trier-i4.mjs) : question à plusieurs champs numérotés à la suite sur l'exercice ; le champ portant l'indice de la question est dans une autre question. Même cause q… (×110) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=1&s4=1&s5=true&alea=revue-1-a&i=1&cd=1) |
| L-cbabfe9715 | TEM1-14 | app-mobile | Défaut de l'app (et de la vue « une question par page » du site) : une question qui contient plusieurs champs numérotés à la suite sur tout l'exercice (champTexteEx0Q0, Q1, Q2… da… |  |

## 2. App : exercices à questions chargées après coup (meta-custom)

- Où : moteur de l'app (preparerExercice)
- Ce qui se passe : Les exercices 6A, 2A, 1A, 3Auto, can6a-Aléa et automatismes chargent leurs questions de façon asynchrone ; dans l'app elles restent à « chargement… », sans champ.
- Correction proposée : Attendre la fin du chargement dans preparerExercice (décision de Nathan).
- Exercices (5) : 1A, 2A, 3Auto, 6A, can6a-Aléa

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-3c46903c88 | 1A | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×74) | [site](https://coopmaths.fr/alea/?uuid=ce2ea&id=1A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-b1200b5542 | 1A | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×2) | [site](https://coopmaths.fr/alea/?uuid=ce2ea&id=1A&s2=false&s3=true&alea=revue-3-b&i=1&cd=1) |
| A-46ce8e9a57 | 2A | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×2) | [site](https://coopmaths.fr/alea/?uuid=2a1c7&id=2A&s2=true&s3=true&alea=revue-1-a&i=1&cd=1) |
| A-daea5dc33b | 2A | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×56) | [site](https://coopmaths.fr/alea/?uuid=2a1c7&id=2A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-086685d18d | 3Auto | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=true&s3=true&alea=revue-1-b&i=1&cd=1) |
| A-608ef9a405 | 3Auto | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×45) | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-26486656ca | 6A | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×5) | [site](https://coopmaths.fr/alea/?uuid=c6cd6&id=6A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-f1fc4d2eaa | 6A | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×62) | [site](https://coopmaths.fr/alea/?uuid=c6cd6&id=6A&s2=false&s3=false&alea=revue-0-b&i=1&cd=1) |
| A-d671ff1f0d | can6a-Aléa | app-mobile | Vérifié (revue/trier-i4.mjs) : exercice à questions chargées après coup (meta-custom : 6A, 2A, 1A, 3Auto, can6a-Aléa) ; la question reste à « chargement… » dans le moteur de l'app… (×87) | [site](https://coopmaths.fr/alea/?uuid=315b6&id=can6a-Al%C3%A9a&s=All&alea=revue-0-a&i=1&cd=1) |
| L-7e6427e9f6 | 2A | app-mobile | Questions chargées de façon asynchrone : restent à « chargement… » dans l'app |  |
| L-a37c0760cb | can6a-Aléa | app-mobile | Dans l'app (moteur), toutes les questions restent à « chargement... » : l'exercice charge ses questions de façon asynchrone (loadAllQuests) après nouvelleVersion, et preparerExerc… |  |

## 3. App : exercices non interactifs sur le site rendus interactifs

- Où : moteur de l'app (preparerExercice)
- Ce qui se passe : Exercices déclarés interactifReady = false sur le site, que l'app prépare quand même en interactif : champs dont la réponse attendue est vide ou absente.
- Correction proposée : Respecter interactifReady (exercice « sur papier » dans l'app).
- Exercices (7) : 6G1autoB, canTEC2-02, 7f0dc, TSA4-41, TSP3-01, moteur-app, 1mCL4-2

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-b252e5e52c | 6G1autoB | app-mobile | Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app (×8) | [site](https://coopmaths.fr/alea/?uuid=b5eaf&id=6G1autoB&s=true&s2=true&alea=revue-1-a&i=1&cd=1) |
| A-4092369f8b | canTEC2-02 | app-mobile | Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app (×12) | [site](https://coopmaths.fr/alea/?uuid=9772d&id=canTEC2-02&alea=revue-0-a&i=1&cd=1) |
| A-6b50c9fa2d | 7f0dc | app-mobile | Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app | [site](https://coopmaths.fr/alea/?uuid=7f0dc&id=7f0dc&s=2&s2=false&alea=revue-4-b&i=1&cd=1) |
| A-e59b32a564 | TSA4-41 | app-mobile | Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app (×12) | [site](https://coopmaths.fr/alea/?uuid=5d294&id=TSA4-41&alea=revue-0-a&i=1&cd=1) |
| L-065418541c | TSA4-41 | app-mobile | Exercice non interactif (interactifReady=false) rendu interactif par l'app : le champ attend la correction entière en HTML (&lt;ol class='nombres'>…), aucune réponse n'est jamais cor… |  |
| A-0baca1ccc4 | TSP3-01 | app-mobile | Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app (×12) | [site](https://coopmaths.fr/alea/?uuid=d5829&id=TSP3-01&alea=revue-0-a&i=1&cd=1) |
| L-3d2614fc38 | TSP3-01 | app-mobile | Exercice non interactif (interactifReady=false) rendu interactif par l'app (défaut connu) : le champ a pour attendu tout le HTML de la correction et une réponse fausse (la correct… |  |
| L-3b496dfcbc | moteur-app | app-mobile | App (moteur/fichiers/src/moteur/index.ts:135) : preparerExercice met interactif à vrai pour tout exercice, même ceux que MathALÉA déclare non interactifs (export interactifReady =… |  |
| A-5a3096d37a | 1mCL4-2 | app-mobile | Exercice non interactif sur le site (interactifReady = false) rendu interactif par l'app (×53) | [site](https://coopmaths.fr/alea/?uuid=5f5fa&id=1mCL4-2&s=3&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |

## 4. Comparaison : ce qui suit une matrice est ignoré

- Où : src/lib/interactif/comparisonFunctions.ts (matrices)
- Ce qui se passe : La matrice juste suivie de « +1 » ou de « \times2 » est acceptée.
- Correction proposée : Refuser la saisie quand il reste du texte après \end{pmatrix}.
- Exercices (9) : TEG1-21, TEM1-14, TEM1-15, TEM1-22, TEM1-23, TEM1-24, TEM1-25, TEM1-31, TEM1-32

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-6a3eb0a102 | TEG1-21 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×46) | [site](https://coopmaths.fr/alea/?uuid=ecca7&id=TEG1-21&s=3&s2=3&s3=false&alea=revue-0-a&i=1&cd=1) |
| L-47f3204da9 | TEG1-21 | tickets-interactif | Même défaut (46 I2 : matrice + 1 acceptée) ; matrice d'adjacence vérifiée plausible ; guillemets sans insécables (92 T4). |  |
| A-d7add37aa0 | TEM1-14 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×60) | [site](https://coopmaths.fr/alea/?uuid=be473&id=TEM1-14&s=5&s2=3&alea=revue-0-a&i=1&cd=1) |
| L-69310e31a0 | TEM1-14 | tickets-interactif | Rejoué (graine revue-0-a, sup=5 sup2=3, 1 question) : la matrice juste suivie de « +1 » est acceptée (A-d7add37aa0) ; mises en évidence refusées sur 8 questions de revue-15-a (A-2… |  |
| A-a688fc3a26 | TEM1-15 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×48) | [site](https://coopmaths.fr/alea/?uuid=32fa9&id=TEM1-15&s=3&alea=revue-0-a&i=1&cd=1) |
| L-a2e5657b10 | TEM1-15 | tickets-interactif | Même défaut (matrice + 1 acceptée, 48 I2) ; « $1,30~\text{€}$ » ; 32 T4. |  |
| A-79597cb958 | TEM1-22 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×68) | [site](https://coopmaths.fr/alea/?uuid=ff4b8&id=TEM1-22&s=true&s2=false&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-98eb75e7de | TEM1-23 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×34) | [site](https://coopmaths.fr/alea/?uuid=1b8e7&id=TEM1-23&s=true&s2=false&s3=2&alea=revue-0-a&i=1&cd=1) |
| L-6ba12222b3 | TEM1-23 | tickets-interactif | Même défaut que TEM1-14/15/22 (34 I2 : matrice + 1 acceptée) ; calculs vérifiés (A²=[[7,6],[-6,-5]] ; A²-2A=-I₂) ; guillemets « Matrice » sans insécables (68 T4). |  |
| A-3270896733 | TEM1-24 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×136) | [site](https://coopmaths.fr/alea/?uuid=196c4&id=TEM1-24&s=true&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-5ff5300eeb | TEM1-25 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×84) | [site](https://coopmaths.fr/alea/?uuid=a7896&id=TEM1-25&s=3&s2=3&alea=revue-0-a&i=1&cd=1) |
| L-10cb748e38 | TEM1-25 | tickets-interactif | Même défaut (84 I2 : matrice + 1 acceptée) ; 56 guillemets/T4 ; système résolu correctement (x=2, y=1). |  |
| A-aec2cb39e9 | TEM1-31 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×56) | [site](https://coopmaths.fr/alea/?uuid=6ddf1&id=TEM1-31&s=3&s2=1&alea=revue-0-a&i=1&cd=1) |
| L-3ab661a2da | TEM1-31 | tickets-interactif | Même défaut (56 I2 : matrice + 1 acceptée) ; consigne « touche « Matrice » » guillemets sans insécables (56 T4). |  |
| A-dec3cffb20 | TEM1-32 | tickets-interactif | Cause commune (comparaison des matrices de MathALÉA, pas l'exercice) : tout ce qui suit \end{pmatrix} est ignoré. Vérifié à la main (TEM1-24 revue-0-a sup=true sup2=false sup3=1, … (×64) | [site](https://coopmaths.fr/alea/?uuid=ba1c6&id=TEM1-32&s=3&alea=revue-0-a&i=1&cd=1) |

## 5. Comparaison : ce qui suit l'unité est ignoré

- Où : src/lib/interactif/comparisonFunctions.ts (grandeurs avec unité)
- Ce qui se passe : « 44°+1 », « 44+1° », « 300s+1 », « 48€+1 » sont acceptés pour 44°, 300 s, 48 €.
- Correction proposée : Refuser toute saisie dont il reste quelque chose après l'unité (ou qui place l'unité au milieu d'un calcul).
- Exercices (10) : 10FA1B-1, 3G22-1, 5G3B-2, 5G4autoA-1, 6G5A, 6G5A-1, 6G7B-9, 6M4A, 6M4C, can5a-CoopMaths

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-a395b538b6 | 10FA1B-1 | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×4) | [site](https://coopmaths.fr/alea/?uuid=b428f&id=10FA1B-1&s=4&alea=revue-0-b&i=1&cd=1) |
| A-50a7067305 | 3G22-1 | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×19) | [site](https://coopmaths.fr/alea/?uuid=a0ad1&id=3G22-1&s=9&alea=revue-0-a&i=1&cd=1) |
| A-2036a19b82 | 5G3B-2 | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×47) | [site](https://coopmaths.fr/alea/?uuid=64099&id=5G3B-2&s=5&s2=true&s3=3&alea=revue-0-b&i=1&cd=1) |
| A-c8bddc2c6a | 5G4autoA-1 | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×33) | [site](https://coopmaths.fr/alea/?uuid=ed9f4&id=5G4autoA-1&s=4&alea=revue-0-a&i=1&cd=1) |
| A-f4cbc56e8b | 6G5A | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×58) | [site](https://coopmaths.fr/alea/?uuid=01875&id=6G5A&s=3&s2=4&s4=false&alea=revue-0-a&i=1&cd=1) |
| L-d748f82de5 | 6G5A | tickets-interactif | Réponse fausse acceptée par la sonde : « 20^\circ+1 » jugé correct pour la bissectrice de 40° (58 cas ; même défaut que 6M4C, confirmé là-bas : le « +1 » sans unité est ignoré) ; … |  |
| A-aca67bc5ce | 6G5A-1 | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×82) | [site](https://coopmaths.fr/alea/?uuid=91875&id=6G5A-1&s=3&s2=4&alea=revue-0-a&i=1&cd=1) |
| A-7f1846b120 | 6G7B-9 | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×18) | [site](https://coopmaths.fr/alea/?uuid=493cf&id=6G7B-9&s=5&s2=true&alea=revue-0-b&i=1&cd=1) |
| A-898e3c74f9 | 6M4A | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×2) | [site](https://coopmaths.fr/alea/?uuid=5f315&id=6M4A&s=5&alea=revue-5-a&i=1&cd=1) |
| L-05831076d7 | 6M4A | tickets-interactif | Même défaut : « 14h24min1s+1 » accepté comme bonne réponse (2 cas) ; mise en évidence « 1 h 33 min 57 s » refusée par le champ (80 cas M1, attendu 1h33min57s). |  |
| A-4f8561f864 | 6M4C | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×14) | [site](https://coopmaths.fr/alea/?uuid=8b0f9&id=6M4C&s=5&alea=revue-0-a&i=1&cd=1) |
| L-e3dbf05736 | 6M4C | tickets-interactif | Réponse fausse acceptée : « 300s+1 » est jugé correct (alors que « 301s » est refusé) pour « Convertir $05\text{ min}$ en secondes » (essayer.mjs, sup=5, graine revue-0-a, questio… |  |
| A-87b7208961 | can5a-CoopMaths | tickets-interactif | Cause commune (comparaison des grandeurs avec unité de MathALÉA) : ce qui suit l'unité est ignoré. Vérifié à la main : « 44°+1 » et « 44+1° » acceptés pour 44° (3G22-1 revue-0-a s… (×4) | [site](https://coopmaths.fr/alea/?uuid=9e40d&id=can5a-CoopMaths&s=31&alea=revue-0-a&i=1&cd=1) |

## 6. Comparaison : seul le premier intervalle est lu

- Où : src/lib/interactif/comparisonFunctions.ts (intervalles)
- Ce qui se passe : « ]-2020;4]+1 » et « ]-2020;4]\cup[7;8] » sont acceptés pour ]-2020;4].
- Correction proposée : Lire toute la saisie (réunion comprise) et refuser ce qui reste.
- Exercices (6) : can1a-NY2025, can1a-NY2026, canTSpea-NY2025, canTSpea-NY2026, 28997, afd39

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-e235a051a5 | can1a-NY2025 | tickets-interactif | Cause commune (comparaison des intervalles de MathALÉA) : seul le premier intervalle est lu, la suite est ignorée. Vérifié à la main (can1a-NY2025 revue-0-a sup=false, 30 question… (×2) | [site](https://coopmaths.fr/alea/?uuid=7244e&id=can1a-NY2025&s=false&alea=revue-0-a&i=1&cd=1) |
| A-efbc99f66b | can1a-NY2026 | tickets-interactif | Cause commune (comparaison des intervalles de MathALÉA) : seul le premier intervalle est lu, la suite est ignorée. Vérifié à la main (can1a-NY2025 revue-0-a sup=false, 30 question… (×3) | [site](https://coopmaths.fr/alea/?uuid=214cd&id=can1a-NY2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-89ee598a87 | canTSpea-NY2025 | tickets-interactif | Cause commune (comparaison des intervalles de MathALÉA) : seul le premier intervalle est lu, la suite est ignorée. Vérifié à la main (can1a-NY2025 revue-0-a sup=false, 30 question… (×2) | [site](https://coopmaths.fr/alea/?uuid=90dad&id=canTSpea-NY2025&s=false&alea=revue-0-a&i=1&cd=1) |
| A-90e7c0c2f2 | canTSpea-NY2026 | tickets-interactif | Cause commune (comparaison des intervalles de MathALÉA) : seul le premier intervalle est lu, la suite est ignorée. Vérifié à la main (can1a-NY2025 revue-0-a sup=false, 30 question… (×3) | [site](https://coopmaths.fr/alea/?uuid=91563&id=canTSpea-NY2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-16304cb62f | 28997 | tickets-interactif | Cause commune (comparaison des intervalles de MathALÉA) : seul le premier intervalle est lu, la suite est ignorée. Vérifié à la main (can1a-NY2025 revue-0-a sup=false, 30 question… (×5) | [site](https://coopmaths.fr/alea/?uuid=28997&id=28997&s=2&s2=2&alea=revue-11-b&i=1&cd=1) |
| A-c4dee2a39c | afd39 | tickets-interactif | Cause commune (comparaison des intervalles de MathALÉA) : seul le premier intervalle est lu, la suite est ignorée. Vérifié à la main (can1a-NY2025 revue-0-a sup=false, 30 question… (×4) | [site](https://coopmaths.fr/alea/?uuid=afd39&id=afd39&s=&alea=revue-0-b&i=1&cd=1) |

## 7. Comparaison : intervalle privé d'un point, réunion à bornes fractionnaires

- Où : src/lib/interactif/comparisonFunctions.ts (intervalles)
- Ce qui se passe : La bonne réponse est refusée avec « Il y a une erreur avec la valeur … » : [-2/5;+∞[ \ {3/8}, ]-∞;1/3] \ {-5/4}, [-13/11;-4/7] ∪ [-1/2;+∞[.
- Correction proposée : Prendre en charge \backslash, \setminus et les bornes en \frac dans la comparaison d'intervalles.
- Exercices (3) : 2L31-2, 014a4, 0716b

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-88ac5e037a | 2L31-2 | tickets-interactif | Vérifié à la main : un intervalle privé d'un point est toujours refusé, que l'on écrive \backslash ou \setminus, \dfrac ou \frac (2L31-2 revue-6-a sup=4 sup2=true, 4 questions, qu… | [site](https://coopmaths.fr/alea/?uuid=0c09b&id=2L31-2&s=4&s2=false&alea=revue-7-a&i=1&cd=1) |
| A-d1fc97779f | 2L31-2 | tickets-interactif | Vérifié à la main : un intervalle privé d'un point est toujours refusé, que l'on écrive \backslash ou \setminus, \dfrac ou \frac (2L31-2 revue-6-a sup=4 sup2=true, 4 questions, qu… (×3) | [site](https://coopmaths.fr/alea/?uuid=0c09b&id=2L31-2&s=4&s2=true&alea=revue-6-a&i=1&cd=1) |
| A-bff9221463 | 014a4 | tickets-interactif | Vérifié à la main (014a4 revue-3-b sup=4, 4 questions, question 4 : (-11x-13)(-7x-4)(4x+2) ≥ 0, S recalculée = [-13/11;-4/7] ∪ [-1/2;+∞[) : la bonne réponse est refusée avec ou sa… | [site](https://coopmaths.fr/alea/?uuid=014a4&id=014a4&s=4&alea=revue-3-b&i=1&cd=1) |
| A-83e7f7a92d | 0716b | tickets-interactif | Vérifié à la main : un intervalle privé d'un point est toujours refusé, que l'on écrive \backslash ou \setminus, \dfrac ou \frac (2L31-2 revue-6-a sup=4 sup2=true, 4 questions, qu… (×2) | [site](https://coopmaths.fr/alea/?uuid=0716b&id=0716b&s=4&alea=revue-3-a&i=1&cd=1) |
| A-c08a1c3232 | 0716b | tickets-interactif | Vérifié à la main : un intervalle privé d'un point est toujours refusé, que l'on écrive \backslash ou \setminus, \dfrac ou \frac (2L31-2 revue-6-a sup=4 sup2=true, 4 questions, qu… (×2) | [site](https://coopmaths.fr/alea/?uuid=0716b&id=0716b&s=4&alea=revue-3-a&i=1&cd=1) |
| A-c3103b1562 | 0716b | tickets-interactif | Vérifié à la main (014a4 revue-3-b sup=4, 4 questions, question 4 : (-11x-13)(-7x-4)(4x+2) ≥ 0, S recalculée = [-13/11;-4/7] ∪ [-1/2;+∞[) : la bonne réponse est refusée avec ou sa… | [site](https://coopmaths.fr/alea/?uuid=0716b&id=0716b&s=3&alea=revue-2-b&i=1&cd=1) |

## 8. Comparaison : l'ensemble vide

- Où : src/lib/interactif/comparisonFunctions.ts
- Ce qui se passe : L'ensemble vide n'est accepté sous aucune forme (\emptyset, \varnothing, \{\}).
- Correction proposée : Accepter \emptyset et \varnothing quand la réponse est vide.
- Exercices (1) : 28997

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-03026bf285 | 28997 | tickets-interactif | Vérifié à la main (28997 revue-4-b sup=1 sup2=4, 1 question) : l'ensemble vide n'est accepté sous aucune forme (\emptyset, \varnothing, \{\}) ; la réponse attendue est « \{\} », r… (×3) | [site](https://coopmaths.fr/alea/?uuid=28997&id=28997&s=1&s2=4&alea=revue-4-b&i=1&cd=1) |

## 9. Comparaison : notation scientifique d'une somme calculée en flottants

- Où : src/lib/interactif/comparisonFunctions.ts:1000 (handleEcritureScientifique)
- Ce qui se passe : La bonne réponse 4,980411·10⁻² est refusée sous toutes les formes (11NO3A-2).
- Correction proposée : Comparer les valeurs (avec tolérance) et la forme, pas les chaînes mises en forme ; arrondir la réponse attendue.
- Exercices (1) : 11NO3A-2

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-bc714f805d | 11NO3A-2 | tickets-interactif | Vérifié à la main (11NO3A-2 revue-3-a sup=1 sup2=3 sup3=1 sup4=3, 4 questions, question 1 : 4,98·10⁻² + 4,11·10⁻⁶) : la bonne réponse 4,980411·10⁻² est refusée sous toutes les for… (×14) | [site](https://coopmaths.fr/alea/?uuid=0ec6a&id=11NO3A-2&s=1&s2=3&s3=1&s4=3&alea=revue-3-a&i=1&cd=1) |

## 10. MonomePlusieursVariables : exposant ≥ 10 sans accolades

- Où : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419
- Ce qui se passe : `${variable}^${exposant}` donne « r^10 » : la correction affiche r¹0 et la réponse attendue ne peut pas être saisie (10FA4C-9, 10FA4F-10, 11FA4A-5).
- Correction proposée : `${variable}^{${exposant}}`.
- Exercices (4) : 10FA4C-9, 10FA4F-10, 11FA4A-5, ae85a

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-c8942ed562 | 10FA4C-9 | tickets-interactif | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… (×9) | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=3&s3=4&s4=1&s5=2&alea=revue-9-b&i=1&cd=1) |
| A-f8db01238d | 10FA4C-9 | tickets-interactif | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=3&s3=4&s4=1&s5=2&alea=revue-9-b&i=1&cd=1) |
| A-1cc991f5ec | 10FA4F-10 | tickets-interactif | Même cause que 10FA4C-9 (MonomePlusieursVariables.ts:348, 383, 419, exposant ≥ 10 sans accolades, repris par PolynomePlusieursVariables). Vérifié à la main (10FA4F-10 revue-15-a, … (×2) | [site](https://coopmaths.fr/alea/?uuid=1cd08&id=10FA4F-10&s=3&s2=2&s3=5&s4=1&s5=true&alea=revue-15-a&i=1&cd=1) |
| A-0de597ac64 | 10FA4C-9 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=3&s3=4&s4=1&s5=2&alea=revue-9-b&i=1&cd=1) |
| A-1835d0b35d | 10FA4C-9 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… (×4) | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=3&s3=4&s4=1&s5=2&alea=revue-9-b&i=1&cd=1) |
| A-458b8e50ab | 10FA4C-9 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… (×2) | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=6&s3=5&s4=1&s5=2&alea=revue-12-a&i=1&cd=1) |
| A-d139b99b44 | 10FA4C-9 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… (×2) | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=6&s3=5&s4=1&s5=2&alea=revue-12-a&i=1&cd=1) |
| A-ef5c88b316 | 10FA4C-9 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=62111&id=10FA4C-9&s=3&s2=6&s3=5&s4=1&s5=2&alea=revue-12-a&i=1&cd=1) |
| A-bae13e0732 | 10FA4F-10 | tickets-rendu | Même cause que 10FA4C-9 : MonomePlusieursVariables.ts:348, 383, 419 écrit l'exposant ≥ 10 sans accolades, la correction affiche x¹0. | [site](https://coopmaths.fr/alea/?uuid=1cd08&id=10FA4F-10&s=3&s2=2&s3=5&s4=1&s5=true&alea=revue-15-a&i=1&cd=1) |
| A-c099aaa956 | 10FA4F-10 | tickets-rendu | Même cause que 10FA4C-9 : MonomePlusieursVariables.ts:348, 383, 419 écrit l'exposant ≥ 10 sans accolades, la correction affiche x¹0. | [site](https://coopmaths.fr/alea/?uuid=1cd08&id=10FA4F-10&s=3&s2=2&s3=5&s4=1&s5=true&alea=revue-15-b&i=1&cd=1) |
| A-67275bc21a | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-a&i=1&cd=1) |
| A-83b78cca84 | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-b&i=1&cd=1) |
| A-98664204bc | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-a&i=1&cd=1) |
| A-af16cce993 | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-a&i=1&cd=1) |
| A-df636dc2c1 | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-b&i=1&cd=1) |
| A-ebf86bd999 | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-b&i=1&cd=1) |
| A-ed8973a00b | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-b&i=1&cd=1) |
| A-f36fdf716b | 11FA4A-5 | tickets-rendu | Cause commune : src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419 écrit ${variable}^${exposant} sans accolades ; dès que l'exposant atteint 10, le LaTeX devient « r^… | [site](https://coopmaths.fr/alea/?uuid=6e472&id=11FA4A-5&s=5&s2=3&s3=5&s4=1&alea=revue-12-a&i=1&cd=1) |
| A-a83cb25b4f | ae85a | tickets-rendu | Revu : la proposition du QCM et la correction écrivent « a^11 » sans accolades (affiché a¹1) ; en plus, la proposition juste est écrite avec \times et la mise en évidence avec \cd… (×3) | [site](https://coopmaths.fr/alea/?uuid=ae85a&id=ae85a&n=10&s3=true&alea=revue-2-a&i=1&cd=1) |

## 11. 3G32 : parenthèse ouvrante en trop dans la réponse attendue

- Où : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5 et 3G32-dereference)
- Ce qui se passe : La réponse attendue « AB\times(\tan(…) » n'est pas fermée : la bonne réponse est refusée et l'écriture mal parenthésée est acceptée, suivie de n'importe quoi.
- Correction proposée : « ${AB}\times\tan(…) ».
- Exercices (7) : 3G32-0, 3G32-1, 3G32-2, 3G32-3, 3G32-4, 3G32-5, 95adb

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-95a5c6ca0a | 3G32-0 | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×6) | [site](https://coopmaths.fr/alea/?uuid=2045e&id=3G32-0&s=true&s2=4&alea=revue-4-a&i=1&cd=1) |
| A-1fd348f939 | 3G32-1 | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×4) | [site](https://coopmaths.fr/alea/?uuid=e0287&id=3G32-1&s2=4&alea=revue-3-a&i=1&cd=1) |
| A-e46abca57d | 3G32-2 | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×4) | [site](https://coopmaths.fr/alea/?uuid=5986b&id=3G32-2&s2=4&alea=revue-3-a&i=1&cd=1) |
| A-7a1c2d2dce | 3G32-3 | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×14) | [site](https://coopmaths.fr/alea/?uuid=e42e0&id=3G32-3&s2=4&alea=revue-0-a&i=1&cd=1) |
| A-e16079feb9 | 3G32-4 | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×4) | [site](https://coopmaths.fr/alea/?uuid=3cb52&id=3G32-4&s2=4&alea=revue-4-a&i=1&cd=1) |
| A-ffe74421bd | 3G32-5 | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×2) | [site](https://coopmaths.fr/alea/?uuid=8ba77&id=3G32-5&s2=4&alea=revue-4-a&i=1&cd=1) |
| A-503ee2fab3 | 95adb | tickets-interactif | Cause vérifiée : src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5, 3G32-dereference) attend « ${AB}\times(\tan(…) » avec une parenthèse ouvrante en trop. La bonne réponse e… (×4) | [site](https://coopmaths.fr/alea/?uuid=95adb&id=95adb&s2=4&alea=revue-4-a&i=1&cd=1) |

## 12. CAN « Spéciale année » 2025 et 2026, question 24 : ℝ privé de b

- Où : src/exercices/can/canNY-2025/can1NY-2025-Q24.ts:50-54 et canNY-2026/can1NY-2026-Q24.ts
- Ce qui se passe : Réponses acceptées : « \mathbb{R}\\{b\} » (mal formée) et une réunion d'intervalles écrite avec le coefficient a au lieu de b. La forme mise en évidence (\smallsetminus) et \setminus sont refusées.
- Correction proposée : Reprendre la liste de CANSpeciale2024.ts:1461-1467 (\backslash, \setminus, \smallsetminus, réunion avec b).
- Exercices (4) : can1a-NY2025, canTSpea-NY2025, 9e17a, k2mzc

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-4c058d8742 | can1a-NY2025 | tickets-interactif | Vérifié à la main et dans le code (can/canNY-2025/can1NY-2025-Q24.ts:50-54, même code dans can/canNY-2026/can1NY-2026-Q24.ts) : réponses acceptées « \mathbb{R}\\{b\} » (chaîne mal… | [site](https://coopmaths.fr/alea/?uuid=7244e&id=can1a-NY2025&s=true&alea=revue-1-a&i=1&cd=1) |
| A-a139a74e98 | canTSpea-NY2025 | tickets-interactif | Vérifié à la main et dans le code (can/canNY-2025/can1NY-2025-Q24.ts:50-54, même code dans can/canNY-2026/can1NY-2026-Q24.ts) : réponses acceptées « \mathbb{R}\\{b\} » (chaîne mal… | [site](https://coopmaths.fr/alea/?uuid=90dad&id=canTSpea-NY2025&s=true&alea=revue-1-a&i=1&cd=1) |
| A-0a9a469420 | 9e17a | tickets-interactif | Vérifié à la main et dans le code (can/canNY-2025/can1NY-2025-Q24.ts:50-54, même code dans can/canNY-2026/can1NY-2026-Q24.ts) : réponses acceptées « \mathbb{R}\\{b\} » (chaîne mal… | [site](https://coopmaths.fr/alea/?uuid=9e17a&id=9e17a&alea=revue-0-a&i=1&cd=1) |
| L-eacac27015 | 9e17a | tickets-interactif | Interactif : seule la saisie « \mathbb{R}\backslash\{-2025\} » est acceptée ; « \setminus » et « \smallsetminus » (ceux de la correction) sont refusés |  |
| A-65374ea982 | k2mzc | tickets-interactif | Vérifié à la main et dans le code (can/canNY-2025/can1NY-2025-Q24.ts:50-54, même code dans can/canNY-2026/can1NY-2026-Q24.ts) : réponses acceptées « \mathbb{R}\\{b\} » (chaîne mal… | [site](https://coopmaths.fr/alea/?uuid=k2mzc&id=k2mzc&alea=revue-0-a&i=1&cd=1) |

## 13. TTE-11 (et TSA5-30, qui le reprend) : ensemble de définition illisible, balises visibles

- Où : src/exercices/TT/TTE-11.ts:428
- Ce qui se passe : Réponse attendue « \mathbb{R}\backslash{\{…\}} » (accolades en trop) : aucune saisie n'est acceptée. Dans la correction, des balises « </div> </div> » s'affichent en texte devant « Le discriminant est null ». Fautes : « défine », « dégré », « null ».
- Correction proposée : « \mathbb{R}\backslash\{…\} » ; corriger les trois fautes.
- Exercices (2) : TSA5-30, TTE-11

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-1587c8773a | TSA5-30 | tickets-interactif | Vérifié à la main (TSA5-30 revue-4-a sup=3 sup2=true, 2 questions, question 1, f(x)=ln(2x²-8x+8)) : aucune forme n'est acceptée (\mathbb{R}\backslash\{2\}, \setminus, réunion d'in… (×3) | [site](https://coopmaths.fr/alea/?uuid=a3016&id=TSA5-30&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-0cf1e4ae49 | TTE-11 | tickets-interactif | Vérifié à la main (TSA5-30 revue-4-a sup=3 sup2=true, 2 questions, question 1, f(x)=ln(2x²-8x+8)) : aucune forme n'est acceptée (\mathbb{R}\backslash\{2\}, \setminus, réunion d'in… (×4) | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=true&alea=revue-4-b&i=1&cd=1) |
| A-043e7ca370 | TSA5-30 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $2x^2-8x+8$ s'annule en $2$ et est du s | [site](https://coopmaths.fr/alea/?uuid=a3016&id=TSA5-30&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-1bb1cae0a6 | TSA5-30 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $2x^2-8x+8$ s'annule en $2$ et est du s | [site](https://coopmaths.fr/alea/?uuid=a3016&id=TSA5-30&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-a2c0be15cb | TSA5-30 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-27x^2+162x-243$ s'annule en $3$ et es | [site](https://coopmaths.fr/alea/?uuid=a3016&id=TSA5-30&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-d76b181f8a | TSA5-30 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-27x^2+162x-243$ s'annule en $3$ et es | [site](https://coopmaths.fr/alea/?uuid=a3016&id=TSA5-30&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| L-e42a786828 | TSA5-30 | tickets-rendu | Correction : balises « &lt;/div> &lt;/div> » affichées en texte devant « Le discriminant est null » (7 cas X3) ; « null » (nul) ; « La fonction log est défine » (définie, ln) ; $\mathca… |  |
| A-0f6a674ae6 | TTE-11 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-3x^2-18x-27$ s'annule en $-3$ et est | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-2c43599551 | TTE-11 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-3x^2+30x-75$ s'annule en $5$ et est d | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=false&alea=revue-5-a&i=1&cd=1) |
| A-6f1fa914f5 | TTE-11 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-12x^2-72x-108$ s'annule en $-3$ et es | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-829ff6ba63 | TTE-11 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-3x^2+30x-75$ s'annule en $5$ et est d | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=false&alea=revue-5-a&i=1&cd=1) |
| A-9a58838d72 | TTE-11 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-12x^2-72x-108$ s'annule en $-3$ et es | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| A-d1499fe568 | TTE-11 | tickets-rendu | ] &lt;/div> &lt;/div>Le discriminant est null, donc $-3x^2-18x-27$ s'annule en $-3$ et est | [site](https://coopmaths.fr/alea/?uuid=450e7&id=TTE-11&s=3&s2=true&alea=revue-4-a&i=1&cd=1) |
| L-4ae35bfc0c | TTE-11 | tickets-rendu | Reprend TSA5-30 (domaine de définition de \log) : balises « &lt;/div> &lt;/div> » affichées en texte dans la correction (11 X3) ; $\mathcal{f}_0$ ; réponse ℝ\{a} refusée avec « Il faut … |  |

## 14. Réponse attendue vide

- Où : exercices listés
- Ce qui se passe : La réponse attendue est une chaîne vide : aucune saisie ne peut être correcte (« Vous devez saisir une réponse »).
- Correction proposée : Renseigner la réponse, ou rendre la question non interactive.
- Exercices (3) : canTEC2-05, 16c6f, 28997

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-f090f703db | canTEC2-05 | tickets-interactif | Revu : la réponse attendue est une chaîne vide (« Vous devez saisir une réponse » pour la bonne réponse) : aucune saisie ne peut être jugée correcte. (×12) | [site](https://coopmaths.fr/alea/?uuid=16c5f&id=canTEC2-05&alea=revue-0-a&i=1&cd=1) |
| A-20f2e1bf43 | 16c6f | tickets-interactif | Revu : la réponse attendue est une chaîne vide (« Vous devez saisir une réponse » pour la bonne réponse) : aucune saisie ne peut être jugée correcte. (×12) | [site](https://coopmaths.fr/alea/?uuid=16c6f&id=16c6f&alea=revue-0-a&i=1&cd=1) |
| L-566431e5a7 | 16c6f | tickets-interactif | Interactif : la réponse attendue est une chaîne vide (this.reponse = ''), la valeur de la correction (3√2/2 + 3√2/2 i) est refusée ; consigne « forme trigonométrique algébrique » … |  |
| A-29b54daad0 | 28997 | tickets-interactif | Revu : la réponse attendue est une chaîne vide (« Vous devez saisir une réponse » pour la bonne réponse) : aucune saisie ne peut être jugée correcte. | [site](https://coopmaths.fr/alea/?uuid=28997&id=28997&s=3&s2=10&alea=revue-29-b&i=1&cd=1) |

## 15. Réponse attendue calculée en flottant

- Où : exercices listés
- Ce qui se passe : La réponse attendue porte une erreur d'arrondi binaire (50.400000000000006, 456.99999999999994, 5609999.999999999) : la bonne réponse est refusée.
- Correction proposée : Arrondir avant d'écrire la réponse (arrondi, texNombre).
- Exercices (7) : 3AutoG12, 4C32-3, 6AutoL3-2, can2N4-02, can5C4-02, 0f2d1, 5G2E-3

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-53299c7235 | 3AutoG12 | tickets-interactif | Interactif : réponse attendue en flottant (2,1 × 24 = 50.400000000000006) : « 50,4 » est refusé, seule la chaîne « 50.400000000000006 » est acceptée (confirmé avec revue/essayer.m… |  |
| L-fead56118d | 4C32-3 | tickets-interactif | Interactif (sup=2) : 3,3×10^8 × 17 Mo = 5 610 000 Go, attendu 5609999.999999999 : « 5610000 » et « 5,61\times10^{6} » refusés, seule la chaîne flottante passe (confirmé avec revue… |  |
| L-599bf2d14d | 6AutoL3-2 | tickets-interactif | Périmètres avec des longueurs décimales : réponse attendue en flottant (« 26,200000000000003 cm », « 24,000000000000004 cm ») avec precisionUnite 0 : « 26,2 cm » et « 24 cm » sais… |  |
| L-894241a502 | can2N4-02 | tickets-interactif | Réponse attendue calculée en flottant : 5^4×0,2^4 donne 1.0000000000000002 ; la bonne réponse « 1 » saisie par l'élève est refusée (vu au banc : la mise en évidence ⟦1⟧ est refusé… |  |
| L-be470f8582 | can5C4-02 | tickets-interactif | Réponse attendue calculée en flottant (a + b/100 + c/1000 = 12.135000000000002) : « 12,135 » tapé par l'élève est refusé (confirmé avec revue/essayer.mjs, graine revue-1-a, q10) |  |
| A-d79df152f6 | 0f2d1 | tickets-interactif | Revu : la réponse attendue est écrite en flottant (\dfrac{456.99999999999994}{100}) ; le contrôle « numérateur entier » refuse la bonne réponse. Arrondir avant d'écrire la fractio… (×4) | [site](https://coopmaths.fr/alea/?uuid=0f2d1&id=0f2d1&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| L-173a698847 | 5G2E-3 | tickets-interactif | Arrondi attendu faux : la bonne valeur arrondie est refusée |  |

## 16. Nombre fractionnaire dont la fraction vaut 1

- Où : exercices listés (2N30-1, CM1N2B)
- Ce qui se passe : « 3 et 1/1 » attendu : la bonne réponse est refusée par « la fraction doit être inférieure à 1 ».
- Correction proposée : Reporter l'unité (4) dans le générateur.
- Exercices (2) : 2N30-1, CM1N2B

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-593ed9c5fd | 2N30-1 | tickets-interactif | Revu : la réponse attendue est un nombre fractionnaire dont la partie fractionnaire vaut 1 (« 3 et 1/1 », « 1 et 1/1 ») ; la bonne réponse est refusée par le contrôle « la fractio… (×36) | [site](https://coopmaths.fr/alea/?uuid=45726&id=2N30-1&s=1&s2=1-2-3&s3=false&alea=revue-9-a&i=1&cd=1) |
| A-7e4f17596f | CM1N2B | tickets-interactif | Revu : la réponse attendue est un nombre fractionnaire dont la partie fractionnaire vaut 1 (« 3 et 1/1 », « 1 et 1/1 ») ; la bonne réponse est refusée par le contrôle « la fractio… (×40) | [site](https://coopmaths.fr/alea/?uuid=6c8a1&id=CM1N2B&s=1&s2=1-2-3&s3=false&alea=revue-8-a&i=1&cd=1) |

## 17. Texte « undefined » en tête de question (QCM)

- Où : exercices listés (question += qcm.texte sans initialisation)
- Ce qui se passe : « undefined » visible avant les propositions du QCM.
- Correction proposée : Initialiser la question à '' avant d'y ajouter le QCM.
- Exercices (5) : 4ed52, 83789, 884fe, b5324, f6jd7

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-153016170e | 4ed52 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> |  |
| A-78eca964c7 | 4ed52 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> [champ] &lt;/mathal (×9) | [site](https://coopmaths.fr/alea/?uuid=4ed52&id=4ed52&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-cc57159f04 | 4ed52 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> (×3) | [site](https://coopmaths.fr/alea/?uuid=4ed52&id=4ed52&s=false&alea=revue-0-a&i=1&cd=1) |
| L-ffae033e7d | 4ed52 | tickets-rendu | Énoncé : « undefined » devant le QCM ; correction : proposition mise en évidence « Il y a 7 fois 5 et il reste 2 » avec nombres hors $ et texte dans miseEnEvidence |  |
| A-927880a6ef | 83789 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> | [site](https://coopmaths.fr/alea/?uuid=83789&id=83789&alea=revue-0-a&i=1&cd=1) |
| A-aab3cefb04 | 83789 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> [champ] &lt;/mathal (×5) | [site](https://coopmaths.fr/alea/?uuid=83789&id=83789&n=10&alea=revue-1-a&i=1&cd=1) |
| A-d6f5c9a49b | 83789 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> |  |
| L-936cb4c689 | 83789 | tickets-rendu | Énoncé : « undefined » devant le QCM (this.question += qcm.texte sans question initialisée) |  |
| A-04992588ac | 884fe | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> (×2) | [site](https://coopmaths.fr/alea/?uuid=884fe&id=884fe&alea=revue-0-a&i=1&cd=1) |
| A-90ee83fea9 | 884fe | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> [champ] &lt;/mathal (×9) | [site](https://coopmaths.fr/alea/?uuid=884fe&id=884fe&n=10&alea=revue-1-a&i=1&cd=1) |
| A-f80ae11860 | 884fe | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> |  |
| L-741fc6d09b | 884fe | tickets-rendu | Énoncé : « undefined » devant le QCM (aucune consigne) ; même défaut que 83789 et 4ed52 |  |
| A-059a41cbb8 | b5324 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> |  |
| A-2e9418017c | b5324 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> [champ] &lt;/mathal (×9) | [site](https://coopmaths.fr/alea/?uuid=b5324&id=b5324&n=10&alea=revue-1-a&i=1&cd=1) |
| A-ea7125865d | b5324 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> (×2) | [site](https://coopmaths.fr/alea/?uuid=b5324&id=b5324&alea=revue-0-a&i=1&cd=1) |
| A-384b547df0 | f6jd7 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> |  |
| A-6e6a1150b7 | f6jd7 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> (×3) | [site](https://coopmaths.fr/alea/?uuid=f6jd7&id=f6jd7&s=false&alea=revue-0-a&i=1&cd=1) |
| A-f0227699ad | f6jd7 | tickets-rendu | undefined [champ] &lt;/mathalea-qcm> [champ] &lt;/mathal (×9) | [site](https://coopmaths.fr/alea/?uuid=f6jd7&id=f6jd7&n=10&s=false&alea=revue-2-a&i=1&cd=1) |

## 18. Identifiant « undefined » dans deuxColonnesResp (invisible pour l'élève)

- Où : src/lib/format/miseEnPage.ts:145-148
- Ce qui se passe : id='cols-responsive1-undefined' quand eleId n'est pas fourni (identifiants en double), et pas d'espace avant style=.
- Correction proposée : Identifiant par défaut unique ; espace avant style.
- Exercices (23) : 2F21-9, 3Auto, 3AutoDNB2026-3, 3AutoDNB2026-4, 3AutoDNB2026-5, 3AutoDNB2026-6, 3AutoG03-3, 3AutoG13-3, 3AutoI01, 3AutoM06-2, 3AutoP02-2, 3AutoS01-3, 3F23-2, 3Z1DNB-11, 3Z1DNB-19, 3Z1DNB-20, 3Z1DNB-22, 6A, 6AutoG2, 6AutoS1-4, 6I1B-8, 6N4A-1, acbb6

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-4ed676b615 | 2F21-9 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:200px;' > $\begin (×11) | [site](https://coopmaths.fr/alea/?uuid=99d4e&id=2F21-9&alea=revue-0-a&i=1&cd=1) |
| A-c76bccf8bc | 2F21-9 | tickets-rendu | ed}$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > De mêm (×11) | [site](https://coopmaths.fr/alea/?uuid=99d4e&id=2F21-9&alea=revue-0-a&i=1&cd=1) |
| A-00fc728e96 | 3Auto | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:100px;' > &lt;pre c | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=true&s3=true&alea=revue-1-a&i=1&cd=1) |
| A-1a93777349 | 3Auto | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > Une élè | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=true&s3=true&alea=revue-1-a&i=1&cd=1) |
| A-b811df7faf | 3Auto | tickets-rendu | tes) &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=false&s3=true&alea=revue-3-a&i=1&cd=1) |
| A-f92ecf703a | 3Auto | tickets-rendu | ta-largeur1='70'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Le quad | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=false&s3=true&alea=revue-3-a&i=1&cd=1) |
| A-5096a1205f | 3AutoDNB2026-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Quel es (×3) | [site](https://coopmaths.fr/alea/?uuid=8db52&id=3AutoDNB2026-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-5caf9ce229 | 3AutoDNB2026-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Une rou (×3) | [site](https://coopmaths.fr/alea/?uuid=8db52&id=3AutoDNB2026-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-731a131868 | 3AutoDNB2026-3 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×6) | [site](https://coopmaths.fr/alea/?uuid=8db52&id=3AutoDNB2026-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-8f96190824 | 3AutoDNB2026-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Quel es |  |
| A-9d02b37779 | 3AutoDNB2026-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Une rou |  |
| A-b2abc8da76 | 3AutoDNB2026-3 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×2) |  |
| A-196905d1a2 | 3AutoDNB2026-4 | tickets-rendu | ..}$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c |  |
| A-36b03df57a | 3AutoDNB2026-4 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Complét |  |
| A-d89a5b1a4c | 3AutoDNB2026-4 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Complét (×3) | [site](https://coopmaths.fr/alea/?uuid=8db53&id=3AutoDNB2026-4&s=false&alea=revue-0-a&i=1&cd=1) |
| A-efd500548d | 3AutoDNB2026-4 | tickets-rendu | ..}$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c (×3) | [site](https://coopmaths.fr/alea/?uuid=8db53&id=3AutoDNB2026-4&s=false&alea=revue-0-a&i=1&cd=1) |
| A-06076158b3 | 3AutoDNB2026-5 | tickets-rendu | ta-largeur1='70'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Le quad (×3) | [site](https://coopmaths.fr/alea/?uuid=8de53&id=3AutoDNB2026-5&s=false&alea=revue-0-a&i=1&cd=1) |
| A-4bc01beecb | 3AutoDNB2026-5 | tickets-rendu | tes) &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-578eba6847 | 3AutoDNB2026-5 | tickets-rendu | sp;: &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c |  |
| A-58052083f8 | 3AutoDNB2026-5 | tickets-rendu | sp;: &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c (×3) | [site](https://coopmaths.fr/alea/?uuid=8de53&id=3AutoDNB2026-5&s=false&alea=revue-0-a&i=1&cd=1) |
| A-8681fdaf3f | 3AutoDNB2026-5 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Calcule |  |
| A-d2fd1b34b3 | 3AutoDNB2026-5 | tickets-rendu | tes) &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×3) | [site](https://coopmaths.fr/alea/?uuid=8de53&id=3AutoDNB2026-5&s=false&alea=revue-0-a&i=1&cd=1) |
| A-d8a33f9012 | 3AutoDNB2026-5 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Calcule (×3) | [site](https://coopmaths.fr/alea/?uuid=8de53&id=3AutoDNB2026-5&s=false&alea=revue-0-a&i=1&cd=1) |
| A-dd4aa8b867 | 3AutoDNB2026-5 | tickets-rendu | ta-largeur1='70'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Le quad |  |
| A-01715777c4 | 3AutoDNB2026-6 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > On cons (×3) | [site](https://coopmaths.fr/alea/?uuid=867be&id=3AutoDNB2026-6&s=false&alea=revue-0-a&i=1&cd=1) |
| A-02cba8009d | 3AutoDNB2026-6 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > Le diag (×3) | [site](https://coopmaths.fr/alea/?uuid=867be&id=3AutoDNB2026-6&s=false&alea=revue-0-a&i=1&cd=1) |
| A-0ef118ec99 | 3AutoDNB2026-6 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;table (×3) | [site](https://coopmaths.fr/alea/?uuid=867be&id=3AutoDNB2026-6&s=false&alea=revue-0-a&i=1&cd=1) |
| A-172d13bcfc | 3AutoDNB2026-6 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×3) | [site](https://coopmaths.fr/alea/?uuid=867be&id=3AutoDNB2026-6&s=false&alea=revue-0-a&i=1&cd=1) |
| A-3ad728dcf6 | 3AutoDNB2026-6 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-4700ea8863 | 3AutoDNB2026-6 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;table |  |
| A-72b91d74ec | 3AutoDNB2026-6 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > On cons |  |
| A-77975047ef | 3AutoDNB2026-6 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > Le diag |  |
| A-009abeefce | 3AutoG03-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Quel es (×12) | [site](https://coopmaths.fr/alea/?uuid=cfbaa&id=3AutoG03-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-54d09e2571 | 3AutoG03-3 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-b114103198 | 3AutoG03-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Quel es |  |
| A-b7369119b0 | 3AutoG03-3 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×12) | [site](https://coopmaths.fr/alea/?uuid=cfbaa&id=3AutoG03-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-2ec3970e57 | 3AutoG13-3 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Complét (×12) | [site](https://coopmaths.fr/alea/?uuid=cea04&id=3AutoG13-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-96df8735a0 | 3AutoG13-3 | tickets-rendu | ..}$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c |  |
| A-afd05fc5af | 3AutoG13-3 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Complét |  |
| A-dc263e9bd3 | 3AutoG13-3 | tickets-rendu | ..}$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c (×12) | [site](https://coopmaths.fr/alea/?uuid=cea04&id=3AutoG13-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-6d237f7df4 | 3AutoI01 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > Une élè |  |
| A-d7f4fd0d74 | 3AutoI01 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:100px;' > &lt;pre c |  |
| A-e6d99a4431 | 3AutoI01 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:100px;' > &lt;pre c (×2) | [site](https://coopmaths.fr/alea/?uuid=33c9b&id=3AutoI01&s=false&alea=revue-0-a&i=1&cd=1) |
| A-eb52b6f78c | 3AutoI01 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > Une élè (×2) | [site](https://coopmaths.fr/alea/?uuid=33c9b&id=3AutoI01&s=false&alea=revue-0-a&i=1&cd=1) |
| A-2219ca5e4a | 3AutoM06-2 | tickets-rendu | sp;: &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c (×8) | [site](https://coopmaths.fr/alea/?uuid=cea14&id=3AutoM06-2&s=false&alea=revue-0-a&i=1&cd=1) |
| A-90ce69a67f | 3AutoM06-2 | tickets-rendu | sp;: &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:180px;' > &lt;div c |  |
| A-b310415f5d | 3AutoM06-2 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Calcule |  |
| A-b7e397d550 | 3AutoM06-2 | tickets-rendu | ta-largeur1='65'> &lt;div id='cols-responsive1-undefined'style='min-width:320px;' > Calcule (×8) | [site](https://coopmaths.fr/alea/?uuid=cea14&id=3AutoM06-2&s=false&alea=revue-0-a&i=1&cd=1) |
| A-c3ef77b328 | 3AutoP02-2 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > On cons (×12) | [site](https://coopmaths.fr/alea/?uuid=acaa5&id=3AutoP02-2&s=false&alea=revue-0-a&i=1&cd=1) |
| A-df711446ad | 3AutoP02-2 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > On cons |  |
| A-dfe38aa73b | 3AutoP02-2 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;table |  |
| A-ea9980ba66 | 3AutoP02-2 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;table (×12) | [site](https://coopmaths.fr/alea/?uuid=acaa5&id=3AutoP02-2&s=false&alea=revue-0-a&i=1&cd=1) |
| A-432556dd0b | 3AutoS01-3 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-60c2c3d7dd | 3AutoS01-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Une rou |  |
| A-d561bf6142 | 3AutoS01-3 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×12) | [site](https://coopmaths.fr/alea/?uuid=cfaaa&id=3AutoS01-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-fca390ec2d | 3AutoS01-3 | tickets-rendu | ta-largeur1='80'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Une rou (×12) | [site](https://coopmaths.fr/alea/?uuid=cfaaa&id=3AutoS01-3&s=false&alea=revue-0-a&i=1&cd=1) |
| A-72685f1a32 | 3F23-2 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:200px;' > $\begin (×11) | [site](https://coopmaths.fr/alea/?uuid=d451f&id=3F23-2&alea=revue-0-a&i=1&cd=1) |
| A-f0640977b9 | 3F23-2 | tickets-rendu | ed}$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > De mêm (×11) | [site](https://coopmaths.fr/alea/?uuid=d451f&id=3F23-2&alea=revue-0-a&i=1&cd=1) |
| A-06c3ad4905 | 3Z1DNB-11 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > (×4) | [site](https://coopmaths.fr/alea/?uuid=fb6ee&id=3Z1DNB-11&s=false&alea=revue-0-a&i=1&cd=1) |
| A-29c34a28ff | 3Z1DNB-11 | tickets-rendu | s h$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-4b97723fef | 3Z1DNB-11 | tickets-rendu | ol> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-7a34aaf6da | 3Z1DNB-11 | tickets-rendu | m}$. &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-87fa155c64 | 3Z1DNB-11 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > (×2) |  |
| A-8a1b55f6c8 | 3Z1DNB-11 | tickets-rendu | ol> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×2) | [site](https://coopmaths.fr/alea/?uuid=fb6ee&id=3Z1DNB-11&s=false&alea=revue-0-a&i=1&cd=1) |
| A-9aa5321433 | 3Z1DNB-11 | tickets-rendu | m}$. &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×2) | [site](https://coopmaths.fr/alea/?uuid=fb6ee&id=3Z1DNB-11&s=false&alea=revue-0-a&i=1&cd=1) |
| A-a692459e8a | 3Z1DNB-11 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:200px;' > Il a re (×2) | [site](https://coopmaths.fr/alea/?uuid=fb6ee&id=3Z1DNB-11&s=false&alea=revue-0-a&i=1&cd=1) |
| A-ced24b6145 | 3Z1DNB-11 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:200px;' > Il a re |  |
| A-f215194dff | 3Z1DNB-11 | tickets-rendu | s h$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×2) | [site](https://coopmaths.fr/alea/?uuid=fb6ee&id=3Z1DNB-11&s=false&alea=revue-0-a&i=1&cd=1) |
| A-97063c88a5 | 3Z1DNB-19 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > La pre (×2) | [site](https://coopmaths.fr/alea/?uuid=fc6ad&id=3Z1DNB-19&s=false&alea=revue-0-a&i=1&cd=1) |
| A-bbc740f57c | 3Z1DNB-19 | tickets-rendu | t 5. &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-c76704bf16 | 3Z1DNB-19 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > La pre |  |
| A-e437d5724d | 3Z1DNB-19 | tickets-rendu | t 5. &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×2) | [site](https://coopmaths.fr/alea/?uuid=fc6ad&id=3Z1DNB-19&s=false&alea=revue-0-a&i=1&cd=1) |
| A-274c7ff8a4 | 3Z1DNB-20 | tickets-rendu | div> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:300px;' > &lt;div c |  |
| A-79efe96a2d | 3Z1DNB-20 | tickets-rendu | div> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:300px;' > &lt;div c (×2) | [site](https://coopmaths.fr/alea/?uuid=ec6ad&id=3Z1DNB-20&s=false&alea=revue-0-a&i=1&cd=1) |
| A-8cc53cd575 | 3Z1DNB-20 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > &lt;div cl (×2) | [site](https://coopmaths.fr/alea/?uuid=ec6ad&id=3Z1DNB-20&s=false&alea=revue-0-a&i=1&cd=1) |
| A-cfe668c4c0 | 3Z1DNB-20 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > &lt;div cl |  |
| A-4fa1028496 | 3Z1DNB-22 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > Schéma |  |
| A-5f0c3a8a18 | 3Z1DNB-22 | tickets-rendu | &lt;br> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:300px;' > &lt;div c |  |
| A-d0c8e1d5e4 | 3Z1DNB-22 | tickets-rendu | &lt;br> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:300px;' > &lt;div c (×2) | [site](https://coopmaths.fr/alea/?uuid=bc6ad&id=3Z1DNB-22&s=false&alea=revue-0-a&i=1&cd=1) |
| A-fdc9f51996 | 3Z1DNB-22 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > Schéma (×2) | [site](https://coopmaths.fr/alea/?uuid=bc6ad&id=3Z1DNB-22&s=false&alea=revue-0-a&i=1&cd=1) |
| A-17ff594321 | 6A | tickets-rendu | div> &lt;/div> &lt;div id='cols-responsive2-undefined_0' style='min-width:300px;' > Comp |  |
| A-c14207344f | 6A | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined_0'style='min-width:500px;' > &lt;div |  |
| A-36c296ae93 | 6AutoG2 | tickets-rendu | tes) &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×11) | [site](https://coopmaths.fr/alea/?uuid=b6c33&id=6AutoG2&alea=revue-0-a&i=1&cd=1) |
| A-4fd2fdbd52 | 6AutoG2 | tickets-rendu | ta-largeur1='70'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Le quad (×11) | [site](https://coopmaths.fr/alea/?uuid=b6c33&id=6AutoG2&alea=revue-0-a&i=1&cd=1) |
| A-c395ba7ef0 | 6AutoG2 | tickets-rendu | ta-largeur1='70'> &lt;div id='cols-responsive1-undefined'style='min-width:400px;' > Le quad |  |
| A-e5744524b5 | 6AutoG2 | tickets-rendu | tes) &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-1f571f9b21 | 6AutoS1-4 | tickets-rendu | ta-largeur1='40'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > On repo | [site](https://coopmaths.fr/alea/?uuid=b74c8&id=6AutoS1-4&s=2&alea=revue-2-a&i=1&cd=1) |
| A-5b01e30238 | 6AutoS1-4 | tickets-rendu | ta-largeur1='40'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > &lt;b>Tour | [site](https://coopmaths.fr/alea/?uuid=b74c8&id=6AutoS1-4&s=2&alea=revue-2-a&i=1&cd=1) |
| A-78a1dbbdc3 | 6AutoS1-4 | tickets-rendu | }}$. &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:250px;' > &lt;table | [site](https://coopmaths.fr/alea/?uuid=b74c8&id=6AutoS1-4&s=2&alea=revue-2-a&i=1&cd=1) |
| A-98aa7891ae | 6AutoS1-4 | tickets-rendu | $12$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:250px;' > [champ] &lt;/ta | [site](https://coopmaths.fr/alea/?uuid=b74c8&id=6AutoS1-4&s=2&alea=revue-2-a&i=1&cd=1) |
| A-999dcc867b | 6AutoS1-4 | tickets-rendu | $12$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:250px;' > &lt;table | [site](https://coopmaths.fr/alea/?uuid=b74c8&id=6AutoS1-4&s=2&alea=revue-2-a&i=1&cd=1) |
| A-eb0a76ff61 | 6AutoS1-4 | tickets-rendu | ta-largeur1='40'> &lt;div id='cols-responsive1-undefined'style='min-width:100px;' > &lt;b>Tour | [site](https://coopmaths.fr/alea/?uuid=b74c8&id=6AutoS1-4&s=2&alea=revue-2-a&i=1&cd=1) |
| A-0d59836061 | 6I1B-8 | tickets-rendu | eft$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:50%;' > &lt;div cla (×18) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-18caa2655d | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\leftarr (×15) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-2a5a7efcc3 | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\rightar (×13) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-333e4ceda7 | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\downarr (×17) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=2&s2=false&s3=1&s4=1&alea=revue-4-a&i=1&cd=1) |
| A-39593eb480 | 6I1B-8 | tickets-rendu | ght$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:50%;' > &lt;div cla (×24) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-4cb4f34c77 | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\rightar (×13) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-5b44f07628 | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\uparrow (×15) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-7c2e777131 | 6I1B-8 | tickets-rendu | eft$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:50%;' > &lt;div cla (×18) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-823fd10b65 | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\leftarr (×15) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-87fd989e30 | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\uparrow (×15) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-b664f0e015 | 6I1B-8 | tickets-rendu | ows$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:50%;' > &lt;div cla (×18) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=3&s2=true&s3=1&s4=2&alea=revue-5-a&i=1&cd=1) |
| A-dc618e1afc | 6I1B-8 | tickets-rendu | ta-largeur1='30'> &lt;div id='cols-responsive1-undefined'style='min-width:50%;' > $\downarr (×17) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=2&s2=false&s3=1&s4=1&alea=revue-4-a&i=1&cd=1) |
| A-e687a61ca3 | 6I1B-8 | tickets-rendu | ght$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:50%;' > &lt;div cla (×24) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=1&s2=true&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-e82a03821a | 6I1B-8 | tickets-rendu | ows$ &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:50%;' > &lt;div cla (×18) | [site](https://coopmaths.fr/alea/?uuid=e9dac&id=6I1B-8&s=3&s2=true&s3=1&s4=2&alea=revue-5-a&i=1&cd=1) |
| L-0950adab97 | 6I1B-8 | tickets-rendu | Identifiants HTML « cols-responsive1-undefined » (360 X3, même défaut que 6N4A-1) ; la mise en évidence donne le numéro de case 13 alors que le champ attend la flèche (← : 190 M1)… |  |
| A-5df2c4df39 | 6N4A-1 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:0px;' > &lt;sty (×8) | [site](https://coopmaths.fr/alea/?uuid=4e89b&id=6N4A-1&s=2&s2=3&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-6b15f81f7a | 6N4A-1 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:0px;' > &lt;br> (×2) | [site](https://coopmaths.fr/alea/?uuid=4e89b&id=6N4A-1&s=1&s2=1&s3=3&alea=revue-3-a&i=1&cd=1) |
| A-7411d9402b | 6N4A-1 | tickets-rendu | div> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:0px;' > &lt;div cla (×14) | [site](https://coopmaths.fr/alea/?uuid=4e89b&id=6N4A-1&s=2&s2=3&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-980a725835 | 6N4A-1 | tickets-rendu | iv> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:0px;' > &lt;st (×8) | [site](https://coopmaths.fr/alea/?uuid=4e89b&id=6N4A-1&s=2&s2=3&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-b3f899ef62 | 6N4A-1 | tickets-rendu | &lt;br> &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:0px;' > &lt;div cla (×2) | [site](https://coopmaths.fr/alea/?uuid=4e89b&id=6N4A-1&s=1&s2=1&s3=3&alea=revue-3-a&i=1&cd=1) |
| A-f22978adc8 | 6N4A-1 | tickets-rendu | ta-largeur1='50'> &lt;div id='cols-responsive1-undefined'style='min-width:0px;' > &lt;div clas (×14) | [site](https://coopmaths.fr/alea/?uuid=4e89b&id=6N4A-1&s=2&s2=3&s3=3&alea=revue-0-a&i=1&cd=1) |
| L-367a8ab393 | 6N4A-1 | tickets-rendu | Introduction : identifiants HTML « cols-responsive1-undefined » (numéro d'exercice indéfini) et bloc &lt;style> répété deux fois ; les schémas A à H sont dans le désordre (A, E, B, F… |  |
| A-120dfcffc0 | acbb6 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > Le diag |  |
| A-c4fe6cf53c | acbb6 | tickets-rendu | ta-largeur1='60'> &lt;div id='cols-responsive1-undefined'style='min-width:300px;' > Le diag (×12) | [site](https://coopmaths.fr/alea/?uuid=acbb6&id=acbb6&s=false&alea=revue-0-a&i=1&cd=1) |
| A-d66e272026 | acbb6 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c |  |
| A-ed834a1632 | acbb6 | tickets-rendu | sp;? &lt;/div> &lt;div id='cols-responsive2-undefined' style='min-width:200px;' > &lt;div c (×12) | [site](https://coopmaths.fr/alea/?uuid=acbb6&id=acbb6&s=false&alea=revue-0-a&i=1&cd=1) |

## 19. App : étiquettes des figures réduites

- Où : moteur de l'app (ajusterFigures)
- Ce qui se passe : Les étiquettes sans data-top ni data-left (figures apigeom statiques) se placent en haut à gauche après réduction de la figure.
- Correction proposée : Ne pas déplacer une étiquette sans position (décision de Nathan).
- Exercices (3) : moteur-app, 6N1G, 6N1H-4

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-c58e79cd37 | moteur-app | app-mobile | ajusterFigures (moteur de l'app) replace les étiquettes d'une figure réduite avec Number(etiquette.dataset.top ?? 0) : les étiquettes sans data-top/data-left (figures apigeom stat… |  |
| L-477ef98f4c | 6N1G | app-mobile | Étiquettes empilées après réduction de la figure (ajusterFigures, défaut de l'app) |  |
| L-88e91dec29 | 6N1H-4 | app-mobile | Étiquettes empilées après réduction de la figure (ajusterFigures, défaut de l'app) |  |

## 20. Texte « undefined », « NaN » ou « [object Object] » visible

- Où : exercices listés
- Ce qui se passe : Une valeur non calculée s'affiche dans l'énoncé ou la correction.
- Correction proposée : Corriger la variable non définie (souvent un cas non prévu par le générateur).
- Exercices (7) : 6N3autoD-5, de353, de363, 3A10, 5N1L, canc3a-2023, b5324

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-d87cefcf1b | 6N3autoD-5 | tickets-rendu | Phrases à encoder : un caractère absent de la grille (la table n'a qu'une quarantaine de produits distincts) est codé « $NaN$ » dans le message (produitPourCaractere renvoie NaN) … |  |
| A-165fed5bf6 | de353 | tickets-rendu | , décoder le message suivant&nbsp;:&lt;br>$NaN$ $4$ $NaN$ &lt;br>&lt;br> | [site](https://coopmaths.fr/alea/?uuid=de353&id=de353&s=1-2&s2=false&alea=revue-15-a&i=1&cd=1) |
| A-5d890d1969 | de353 | tickets-rendu | ci-dessus, décoder le message suivant&nbsp;:&lt;br>$NaN$ $35$ $NaN$ &lt;br>&lt;br> (×2) | [site](https://coopmaths.fr/alea/?uuid=de353&id=de353&s=1-2&s2=true&alea=revue-14-a&i=1&cd=1) |
| A-a15199186a | de353 | tickets-rendu | décoder le message suivant&nbsp;:&lt;br>$NaN$ $35$ $NaN$ &lt;br>&lt;br> | [site](https://coopmaths.fr/alea/?uuid=de353&id=de353&s=1-2&s2=true&alea=revue-14-a&i=1&cd=1) |
| A-190b058c8f | de363 | tickets-rendu | décoder le message suivant&nbsp;:&lt;br>$NaN$ $35$ $NaN$ &lt;br>&lt;br> | [site](https://coopmaths.fr/alea/?uuid=de363&id=de363&s=1-2&s2=true&alea=revue-14-a&i=1&cd=1) |
| A-b3274b580c | de363 | tickets-rendu | ci-dessus, décoder le message suivant&nbsp;:&lt;br>$NaN$ $35$ $NaN$ &lt;br>&lt;br> (×2) | [site](https://coopmaths.fr/alea/?uuid=de363&id=de363&s=1-2&s2=true&alea=revue-14-a&i=1&cd=1) |
| A-db8b8ec119 | de363 | tickets-rendu | , décoder le message suivant&nbsp;:&lt;br>$NaN$ $4$ $NaN$ &lt;br>&lt;br> | [site](https://coopmaths.fr/alea/?uuid=de363&id=de363&s=1-2&s2=false&alea=revue-15-a&i=1&cd=1) |
| A-6bd71bffb6 | 3A10 | tickets-rendu | Si on divise par $32$, undefined | [site](https://coopmaths.fr/alea/?uuid=42d20&id=3A10&s=1&s2=1&s3=1&s4=11&alea=revue-39-a&i=1&cd=1) |
| A-7557e346fc | 3A10 | tickets-rendu | Quel est le plus grand undefined possible dans une division euclidienne p | [site](https://coopmaths.fr/alea/?uuid=42d20&id=3A10&s=1&s2=1&s3=1&s4=11&alea=revue-39-a&i=1&cd=1) |
| L-c4ddce3baf | 3A10 | tickets-rendu | Texte « undefined » / NaN visible : « undefined » (balayage automatique) |  |
| A-0777b32858 | 5N1L | tickets-rendu | est inférieur à $2$, c'est-à-dire par les nombres undefined, le reste n'est jamais nul.&lt;br>&lt;span sty | [site](https://coopmaths.fr/alea/?uuid=36074&id=5N1L&alea=revue-0-a&i=1&cd=1) |
| L-7f601afb2c | 5N1L | tickets-rendu | Texte « undefined » / NaN visible : « undefined » (balayage automatique) |  |
| A-438980e04f | 6N3autoD-5 | tickets-rendu | $45$ $16$ $60$ $16$ $1$ $45$ $5$ $63$ $16$ $72$ $NaN$ $54$ $40$ $12$ &lt;br>&lt;br> | [site](https://coopmaths.fr/alea/?uuid=fe6e1&id=6N3autoD-5&s3=2&alea=revue-2-a&i=1&cd=1) |
| A-8bacb91ed4 | 6N3autoD-5 | tickets-rendu | $100$ $63$ $100$ $10$ $48$ $40$ $49$ $100$ $10$ $NaN$ $81$ $9$ $20$ &lt;br>&lt;br> | [site](https://coopmaths.fr/alea/?uuid=fe6e1&id=6N3autoD-5&s3=3&alea=revue-3-a&i=1&cd=1) |
| A-dfabd04447 | canc3a-2023 | tickets-rendu | que Zacharie. Combien de billes a Zacharie&nbsp;? [object Object] |  |
| L-66724ab12a | b5324 | tickets-rendu | L'énoncé du QCM affiche littéralement « undefined » avant les propositions (23 X3 : texte de la question non défini) ; 10 M3. |  |

## 21. Valeur approchée : seul l'arrondi est accepté

- Où : exercices listés
- Ce qui se passe : « Donner une valeur approchée au centième (millième) près » : la valeur approchée par défaut, juste aussi, est refusée.
- Correction proposée : Accepter les deux valeurs approchées, ou demander « l'arrondi ».
- Exercices (2) : 6N2H, 6N3A-1

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-d984dcc6cf | 6N2H | tickets-interactif | « Donner une valeur approchée de leur quotient au millième près » : seul l'arrondi est accepté ; $65\div7\approx9,285$ (valeur approchée par défaut au millième) et $16,6\div9\appr… |  |
| L-9f4319f64b | 6N3A-1 | tickets-interactif | « Calculer une valeur approchée au centième près » : seul l'arrondi est accepté ; $\dfrac{23}{7}\approx3,28$ (valeur approchée par défaut) est refusé (revue/saisir.mjs, graine rev… |  |

## 22. Nombres en lettres : une seule orthographe acceptée

- Où : exercices listés
- Ce qui se passe : « mille six cents » (orthographe traditionnelle) ou « vingt virgule zéro deux » sont refusés ; seule la forme à traits d'union de 1990 passe, sans que la consigne le dise.
- Correction proposée : Accepter les deux orthographes, ou l'annoncer dans la consigne.
- Exercices (3) : 6N0A-6, 6N0A-7, 6N1F-2

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-60816b3656 | 6N0A-6 | tickets-interactif | Écriture en lettres au clavier : « mille six cents » (orthographe traditionnelle, toujours correcte) est refusée, seul « mille-six-cents » est accepté ; la consigne ne parle pas d… |  |
| L-c6f0d016d2 | 6N0A-7 | tickets-interactif | Écriture en lettres : « cent quatre-vingt-treize mille vingt » (orthographe traditionnelle, correcte) refusée, seul « cent-quatre-vingt-treize-mille-vingt » est accepté, sans que … |  |
| L-d9683d0d76 | 6N1F-2 | tickets-interactif | « vingt virgule zéro deux » refusé : seule la forme « zéro-deux » est acceptée, alors que « zéro » est un nom et ne se lie pas par un trait d'union au numéral suivant (la correcti… |  |

## 23. Forme de la réponse : consigne et contrôle ne vont pas ensemble

- Où : exercices listés
- Ce qui se passe : Une fraction est demandée mais l'écriture décimale est acceptée, ou l'inverse : une valeur exacte décimale est refusée sans que la consigne impose une fraction.
- Correction proposée : Aligner le contrôle sur la consigne.
- Exercices (4) : 1A-E05-1, 3AutoDNB2026-6, 3AutoN01, 6N3G-1

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-74798ed0ee | 1A-E05-1 | tickets-interactif | Question « Quel est le taux à appliquer… ? » : seule la fraction exacte 11/39 est acceptée ; « 28,2 \% » et « 0,282 » sont refusés (testé) alors que la consigne n'impose ni fracti… |  |
| L-aee255d94c | 3AutoDNB2026-6 | tickets-interactif | Question « Donner une écriture du nombre $2,4$ sous la forme d'une fraction » : la saisie « 2,4 » (écriture décimale, pas une fraction) est acceptée (testé avec essayer.mjs ; 24/1… |  |
| L-011f3c505d | 3AutoN01 | tickets-interactif | Même défaut que 3AutoDNB2026-6 : la question demande une fraction pour 2,5 ; la saisie décimale « 2,5 » est probablement acceptée |  |
| L-76de56f094 | 3AutoN01 | tickets-interactif | Confirmé avec essayer.mjs : « 2,5 » est accepté comme réponse à « sous la forme d'une fraction » |  |
| L-47b583f7c2 | 6N3G-1 | tickets-interactif | « Calculer $5\times\dfrac{1}{2}$ » : « 2,5 » (valeur exacte) est refusé, seules les fractions sont acceptées, sans que la consigne demande une fraction (revue/saisir.mjs, graine r… |  |

## 24. Moins de questions que demandé

- Où : exercices listés
- Ce qui se passe : Avec certains réglages, il n'y a pas assez de cas différents : la série est plus courte que demandé (questionJamaisPosee échoue).
- Correction proposée : Limiter le nombre de questions ou élargir les tirages.
- Exercices (4) : CM2N3A-14, CM2N3A-2, CM2N3A-3, 6N3autoD-6

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-919640a542 | CM2N3A-14 | tickets-rendu | Types « 10 - n » et « n + … = 10 » seuls : moins de cas possibles que les $10$ questions par défaut, la série est plus courte que l'autoCorrection (champs absents) |  |
| L-d0eba4edbf | CM2N3A-2 | tickets-rendu | Valeur maximale 1 : une seule question produite au lieu des $10$ demandées, avec des nombres au-delà du maximum (« $2+2$ ») ; autoCorrection plus longue que la liste (champs absen… |  |
| L-12907bef87 | CM2N3A-3 | tickets-rendu | Valeur maximale 1 : une seule question produite au lieu des $10$ demandées, avec des nombres au-delà du maximum (« $2+2$ ») ; autoCorrection plus longue que la liste (champs absen… |  |
| L-fde41e4eb1 | 6N3autoD-6 | tickets-rendu | Avec une valeur maximale du multiplicande petite (sup2=4), il n'y a pas assez de produits distincts : questionJamaisPosee échoue et l'exercice rend moins de questions que demandé … |  |

## 25. Questions en double dans une même série

- Où : exercices listés (questionJamaisPosee absent ou mal utilisé)
- Ce qui se passe : Deux questions identiques dans la même série, avec le nombre de questions par défaut ou 10.
- Correction proposée : questionJamaisPosee sur les valeurs tirées.
- Exercices (81) : 6AutoE1-1, 6N0A-7, 6N1A-1, 6N1C-2, 6N1E, 6N1E-1, 6N1F-2, 6N1F-3, TSA1-11, TSA2-QCM07, 2F23-2, 2I10-5, 2L12-3, 2L12-9, 2N13-1, 2N41-4, 2N43-1, 2N51-2, 2P10-3, 2mLogExp-5, 2mLogExp-7, 2mLogExp-8, 3G22-1, 4C10-3, 4C32-0, 4P12-1, 4S20-1, 5G2D, 5N1autoC-1, 5N2G-2, 5N2I-3, 5N2K, 5N4C, 5N5F-4, 6AutoF3-2, 6AutoN1, 6AutoP1, 6AutoP1-1, 6AutoP1-2, 6N1A-5, 6N2B-5, 6P3C, BP1AUTO087, BP2FONC32, can6a-Aléa, can6C52-02, canc3a, CM1N3K, CM2N3A-1, CM2N3A-10, CM2N3A-12, CM2N3A-14Old, CM2N3A-7, CM2N3J-1, CM2N3J-2, EgaliteFG5-2de-6, 02d8w, 0e6bd, 1473g, 225c1, 3a071, 665a0, 6ea89, a2993, ba520, ba521, c938e, cf880, d077f, d6f1f, f5d8e, f6413, gc360, jjs2e, pp1p2, upkts, y75un, TEA1-22, TSA1-13, TSA1-44, TSG1-01

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-65f1ee6a0b | 6AutoE1-1 | tickets-rendu | Avec un seul type de solide coché (sup=1), les cinq questions sont identiques (« Je suis un pavé droit dont toutes les arêtes sont de même longueur », graine revue-1-a). |  |
| L-52b4e1e77a | 6N0A-7 | tickets-rendu | Questions en double en interactif ($20$ en Q2 et Q3, sup2=1) : le test de doublon compare texte, qui contient l'identifiant du champ, propre à chaque question. |  |
| L-1c6de6ee3e | 6N1A-1 | tickets-rendu | Questions en double (« 7 centièmes » en Q1 et Q4, sup=3) : le test questionJamaisPosee(i, a, b, c) porte sur b et c, inutilisés dans ce cas, et ignore le choix dixièmes/centièmes/… |  |
| L-ddbe890339 | 6N1C-2 | tickets-rendu | Questions en double en interactif : G(610) et J(610) sur le même axe (sup=1, graine revue-1-a). |  |
| L-58f6bf6f15 | 6N1E | tickets-rendu | Plusieurs questions : tous les tableaux reprennent les mêmes six nombres (tableauDeNombres tiré une fois hors de la boucle, indexé par k de 0 à 5), seules les cases masquées chang… |  |
| L-2e6fd8a3a0 | 6N1E-1 | tickets-rendu | Plusieurs questions : les tableaux reprennent les six mêmes nombres, seulement mélangés (numerateur tiré une fois avant la boucle). |  |
| L-3a90f860db | 6N1F-2 | tickets-rendu | Questions en double : « 20,02 » en Q2 et Q5 (sup3=1, graine revue-1-a). |  |
| L-598120cc67 | 6N1F-3 | tickets-rendu | Questions en double ($\dfrac{80}{100}$ en Q2 et Q3, sup=2, graine revue-1-a). |  |
| L-9661b12ad6 | TSA1-11 | tickets-rendu | Plusieurs questions : la même fonction revient (Q3 et Q7, Q6 et Q8, Q1 et Q4, graine revue-1-a) ; « $f'(x)=\dfrac{2}{4}x$ » non simplifié ; question 2 sans point final. |  |
| L-74512484c0 | TSA2-QCM07 | tickets-rendu | Exercice « _alea » mais toujours les mêmes valeurs : avec 10 questions, dix fois la même question (A(0;5), B(1;20)). Sans le préambule (paramètre décoché), l'énoncé se réduit à « … |  |
| A-675df406eb | 2F23-2 | tickets-rendu | question 8 identique à la question 6 | [site](https://coopmaths.fr/alea/?uuid=277d3&id=2F23-2&n=10&alea=revue-1-a&i=1&cd=1) |
| A-9f67eb3d23 | 2I10-5 | tickets-rendu | question 3 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=c988f&id=2I10-5&s=2&alea=revue-1-a&i=1&cd=1) |
| A-2c5388688d | 2L12-3 | tickets-rendu | question 2 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=5a4ad&id=2L12-3&s=1&alea=revue-1-b&i=1&cd=1) |
| A-16a6aa55eb | 2L12-9 | tickets-rendu | question 8 identique à la question 4 (×2) | [site](https://coopmaths.fr/alea/?uuid=0bd00&id=2L12-9&n=10&s=1&s2=false&alea=revue-8-a&i=1&cd=1) |
| A-92fd04bf2f | 2N13-1 | tickets-rendu | question 4 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=0d8b3&id=2N13-1&alea=revue-0-a&i=1&cd=1) |
| A-8651036255 | 2N41-4 | tickets-rendu | question 3 identique à la question 2 (×2) | [site](https://coopmaths.fr/alea/?uuid=8f56f&id=2N41-4&s=3&s2=false&alea=revue-6-b&i=1&cd=1) |
| A-86d34859e3 | 2N43-1 | tickets-rendu | question 3 identique à la question 2 (×10) | [site](https://coopmaths.fr/alea/?uuid=a9198&id=2N43-1&s=1&s2=1&s3=true&alea=revue-1-a&i=1&cd=1) |
| A-6dedbc92e7 | 2N51-2 | tickets-rendu | question 4 identique à la question 3 (×2) | [site](https://coopmaths.fr/alea/?uuid=d9495&id=2N51-2&s=1&alea=revue-1-a&i=1&cd=1) |
| A-2f63247679 | 2P10-3 | tickets-rendu | question 9 identique à la question 1 | [site](https://coopmaths.fr/alea/?uuid=0cf54&id=2P10-3&n=10&s=6&alea=revue-6-a&i=1&cd=1) |
| A-65e4a6ac0c | 2mLogExp-5 | tickets-rendu | question 3 identique à la question 1 | [site](https://coopmaths.fr/alea/?uuid=bfd77&id=2mLogExp-5&s=6&alea=revue-6-b&i=1&cd=1) |
| A-2a26cb45ce | 2mLogExp-7 | tickets-rendu | question 8 identique à la question 5 | [site](https://coopmaths.fr/alea/?uuid=bfce3&id=2mLogExp-7&n=10&s=6&alea=revue-6-a&i=1&cd=1) |
| A-15c66661b2 | 2mLogExp-8 | tickets-rendu | question 2 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=bfc77&id=2mLogExp-8&s=5&s2=3&alea=revue-23-a&i=1&cd=1) |
| A-1555cba4b7 | 3G22-1 | tickets-rendu | question 7 identique à la question 5 | [site](https://coopmaths.fr/alea/?uuid=a0ad1&id=3G22-1&s=8&alea=revue-8-b&i=1&cd=1) |
| A-f76c766d0c | 4C10-3 | tickets-rendu | question 2 identique à la question 1 (×23) | [site](https://coopmaths.fr/alea/?uuid=153b9&id=4C10-3&s=1&s2=true&alea=revue-1-a&i=1&cd=1) |
| A-c6ba6351e3 | 4C32-0 | tickets-rendu | question 3 identique à la question 1 | [site](https://coopmaths.fr/alea/?uuid=5d72b&id=4C32-0&s=2&s2=false&alea=revue-4-a&i=1&cd=1) |
| A-d1fcdbee6e | 4P12-1 | tickets-rendu | question 4 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=0a637&id=4P12-1&s=1&s2=5&alea=revue-4-a&i=1&cd=1) |
| A-dfd0afd14e | 4S20-1 | tickets-rendu | question 6 identique à la question 3 (×5) | [site](https://coopmaths.fr/alea/?uuid=4703c&id=4S20-1&n=10&alea=revue-1-a&i=1&cd=1) |
| A-99ddec4127 | 5G2D | tickets-rendu | question 6 identique à la question 2 (×2) | [site](https://coopmaths.fr/alea/?uuid=33ac2&id=5G2D&s=1&s2=false&s3=2&s4=false&s5=false&alea=revue-0-b&i=1&cd=1) |
| A-2831a45855 | 5N1autoC-1 | tickets-rendu | question 8 identique à la question 4 (×2) | [site](https://coopmaths.fr/alea/?uuid=717cb&id=5N1autoC-1&s=2-3-4-5-6-7-8-9-10&s2=2&s3=false&s4=false&alea=revue-2-a&i=1&cd=1) |
| A-8e6b1fdc86 | 5N2G-2 | tickets-rendu | question 4 identique à la question 2 (×5) | [site](https://coopmaths.fr/alea/?uuid=9c5e2&id=5N2G-2&s=1&s2=2&s3=false&alea=revue-2-a&i=1&cd=1) |
| A-b065cf4487 | 5N2I-3 | tickets-rendu | question 4 identique à la question 2 (×5) | [site](https://coopmaths.fr/alea/?uuid=47868&id=5N2I-3&s=1&s2=2&s3=false&alea=revue-2-a&i=1&cd=1) |
| A-2cc71f0353 | 5N2K | tickets-rendu | question 4 identique à la question 2 (×5) | [site](https://coopmaths.fr/alea/?uuid=6510a&id=5N2K&s=1&s2=2&s3=false&alea=revue-2-a&i=1&cd=1) |
| A-effa727d08 | 5N4C | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=57538&id=5N4C&n=10&s=10&s2=false&alea=revue-22-a&i=1&cd=1) |
| A-b11fb3f983 | 5N5F-4 | tickets-rendu | question 7 identique à la question 6 (×7) | [site](https://coopmaths.fr/alea/?uuid=e2e64&id=5N5F-4&s=2&s2=true&s3=false&alea=revue-6-a&i=1&cd=1) |
| A-b024fe4be9 | 6AutoE1-1 | tickets-rendu | question 2 identique à la question 1 (×100) | [site](https://coopmaths.fr/alea/?uuid=95371&id=6AutoE1-1&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-9d0bd2b6b7 | 6AutoF3-2 | tickets-rendu | question 4 identique à la question 3 | [site](https://coopmaths.fr/alea/?uuid=7367d&id=6AutoF3-2&s=false&s2=2&alea=revue-7-a&i=1&cd=1) |
| A-c4d088fa39 | 6AutoN1 | tickets-rendu | question 5 identique à la question 3 (×2) | [site](https://coopmaths.fr/alea/?uuid=65ce1&id=6AutoN1&n=10&s=3&s2=4&s3=false&alea=revue-24-a&i=1&cd=1) |
| A-9e84c62196 | 6AutoP1 | tickets-rendu | question 9 identique à la question 8 (×2) | [site](https://coopmaths.fr/alea/?uuid=6a3de&id=6AutoP1&alea=revue-0-a&i=1&cd=1) |
| A-32574c3970 | 6AutoP1-1 | tickets-rendu | question 6 identique à la question 3 | [site](https://coopmaths.fr/alea/?uuid=b434c&id=6AutoP1-1&alea=revue-0-b&i=1&cd=1) |
| A-29476510b2 | 6AutoP1-2 | tickets-rendu | question 3 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=26a94&id=6AutoP1-2&alea=revue-0-a&i=1&cd=1) |
| A-4353e590c3 | 6N0A-7 | tickets-rendu | question 3 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=6babf&id=6N0A-7&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-b57fd07b04 | 6N1A-1 | tickets-rendu | question 3 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=e8e24&id=6N1A-1&s=2&alea=revue-2-b&i=1&cd=1) |
| A-b64db47199 | 6N1A-5 | tickets-rendu | question 5 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=7efdf&id=6N1A-5&s=true&s2=true&s3=3&s4=3&alea=revue-9-b&i=1&cd=1) |
| A-30083e58d0 | 6N1F-2 | tickets-rendu | question 5 identique à la question 2 (×2) | [site](https://coopmaths.fr/alea/?uuid=5eb83&id=6N1F-2&s=1&s2=1&s3=1&alea=revue-1-a&i=1&cd=1) |
| A-a0f5b0351e | 6N1F-3 | tickets-rendu | question 3 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=0e58f&id=6N1F-3&s=2&alea=revue-1-a&i=1&cd=1) |
| A-93fe60117b | 6N2B-5 | tickets-rendu | question 10 identique à la question 8 (×9) | [site](https://coopmaths.fr/alea/?uuid=5d146&id=6N2B-5&s=2-3-4-5-6-7-8-9&s2=2&alea=revue-0-b&i=1&cd=1) |
| A-c3d4ca24bd | 6P3C | tickets-rendu | question 3 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=f7a14&id=6P3C&s=false&s2=3&alea=revue-10-b&i=1&cd=1) |
| A-b5901d5715 | BP1AUTO087 | tickets-rendu | question 2 identique à la question 1 (×6) | [site](https://coopmaths.fr/alea/?uuid=fbd2b&id=BP1AUTO087&s2=false&alea=revue-0-b&i=1&cd=1) |
| A-cf0a487c85 | BP2FONC32 | tickets-rendu | question 8 identique à la question 6 | [site](https://coopmaths.fr/alea/?uuid=9fbff&id=BP2FONC32&n=10&alea=revue-1-a&i=1&cd=1) |
| A-1c9d42e5a2 | can6a-Aléa | tickets-rendu | question 2 identique à la question 1 (×72) | [site](https://coopmaths.fr/alea/?uuid=315b6&id=can6a-Al%C3%A9a&s=All&alea=revue-0-a&i=1&cd=1) |
| A-4d41bbb75e | can6C52-02 | tickets-rendu | question 9 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=b0fc5&id=can6C52-02&n=10&alea=revue-1-a&i=1&cd=1) |
| A-176fc661bf | canc3a | tickets-rendu | question 17 identique à la question 11 | [site](https://coopmaths.fr/alea/?uuid=32a0f&id=canc3a&s=15&alea=revue-15-a&i=1&cd=1) |
| A-2838d70071 | CM1N3K | tickets-rendu | question 2 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=46mp9&id=CM1N3K&s=2&s2=1&s3=1&alea=revue-30-b&i=1&cd=1) |
| A-1cf6ad9a1b | CM2N3A-1 | tickets-rendu | question 8 identique à la question 7 | [site](https://coopmaths.fr/alea/?uuid=4e27f&id=CM2N3A-1&s=2-3-4-5-6-7-8-9-10&s2=2&s3=false&s4=false&alea=revue-1-a&i=1&cd=1) |
| A-011f8cea9f | CM2N3A-10 | tickets-rendu | question 10 identique à la question 7 (×14) | [site](https://coopmaths.fr/alea/?uuid=9db38&id=CM2N3A-10&s=2&s2=2&alea=revue-7-a&i=1&cd=1) |
| A-8306b01376 | CM2N3A-12 | tickets-rendu | question 10 identique à la question 9 | [site](https://coopmaths.fr/alea/?uuid=9fe43&id=CM2N3A-12&alea=revue-0-b&i=1&cd=1) |
| A-9e86bbea7b | CM2N3A-14Old | tickets-rendu | question 8 identique à la question 3 | [site](https://coopmaths.fr/alea/?uuid=67962&id=CM2N3A-14Old&s=1&alea=revue-0-a&i=1&cd=1) |
| A-5d8a5b38c1 | CM2N3A-7 | tickets-rendu | question 6 identique à la question 1 (×272) | [site](https://coopmaths.fr/alea/?uuid=6d698&id=CM2N3A-7&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-3d38e86655 | CM2N3J-1 | tickets-rendu | question 10 identique à la question 9 | [site](https://coopmaths.fr/alea/?uuid=30800&id=CM2N3J-1&alea=revue-0-b&i=1&cd=1) |
| A-862f2c88c9 | CM2N3J-2 | tickets-rendu | question 8 identique à la question 5 (×3) | [site](https://coopmaths.fr/alea/?uuid=d8a39&id=CM2N3J-2&alea=revue-0-a&i=1&cd=1) |
| A-33536419eb | EgaliteFG5-2de-6 | tickets-rendu | question 9 identique à la question 6 (×4) | [site](https://coopmaths.fr/alea/?uuid=d5005&id=EgaliteFG5-2de-6&s=true&alea=revue-0-a&i=1&cd=1) |
| A-2137bda38e | 02d8w | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=02d8w&id=02d8w&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-051fc028bd | 0e6bd | tickets-rendu | question 8 identique à la question 7 | [site](https://coopmaths.fr/alea/?uuid=0e6bd&id=0e6bd&s=2-3-4-5-6-7-8-9-10&s2=2&s3=false&s4=false&alea=revue-1-a&i=1&cd=1) |
| A-2b579ade18 | 1473g | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=1473g&id=1473g&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-42247691ba | 225c1 | tickets-rendu | question 10 identique à la question 4 | [site](https://coopmaths.fr/alea/?uuid=225c1&id=225c1&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-6bad751fef | 3a071 | tickets-rendu | question 3 identique à la question 2 | [site](https://coopmaths.fr/alea/?uuid=3a071&id=3a071&n=10&alea=revue-1-a&i=1&cd=1) |
| A-189e698b25 | 665a0 | tickets-rendu | question 4 identique à la question 3 | [site](https://coopmaths.fr/alea/?uuid=665a0&id=665a0&s=2-3-4-5-6-7-8-9&s2=2&s3=false&s4=false&alea=revue-1-a&i=1&cd=1) |
| A-a46d46d52c | 6ea89 | tickets-rendu | question 3 identique à la question 2 (×40) | [site](https://coopmaths.fr/alea/?uuid=6ea89&id=6ea89&s=1&s2=true&s3=1&alea=revue-1-a&i=1&cd=1) |
| A-b75c76114a | a2993 | tickets-rendu | question 9 identique à la question 3 | [site](https://coopmaths.fr/alea/?uuid=a2993&id=a2993&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-d0ca3b0845 | ba520 | tickets-rendu | question 2 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=ba520&id=ba520&s=1&s2=1&s3=1&alea=revue-1-b&i=1&cd=1) |
| A-5bea98c07a | ba521 | tickets-rendu | question 2 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=ba521&id=ba521&s=1&s2=1&s3=1&alea=revue-1-b&i=1&cd=1) |
| A-08f7acc1f0 | c938e | tickets-rendu | question 2 identique à la question 1 (×2) | [site](https://coopmaths.fr/alea/?uuid=c938e&id=c938e&s=1&s2=1&s3=1&alea=revue-1-b&i=1&cd=1) |
| A-89e6ba6a2e | cf880 | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=cf880&id=cf880&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-ede90fa000 | d077f | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=d077f&id=d077f&n=10&alea=revue-1-a&i=1&cd=1) |
| A-74ea336ec2 | d6f1f | tickets-rendu | question 3 identique à la question 1 | [site](https://coopmaths.fr/alea/?uuid=d6f1f&id=d6f1f&n=10&alea=revue-1-a&i=1&cd=1) |
| A-349b687b38 | f5d8e | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=f5d8e&id=f5d8e&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-de73496224 | f6413 | tickets-rendu | question 4 identique à la question 3 | [site](https://coopmaths.fr/alea/?uuid=f6413&id=f6413&s=1&s2=1&s3=1&s4=1&alea=revue-1-a&i=1&cd=1) |
| A-e47f3e054b | gc360 | tickets-rendu | question 6 identique à la question 2 (×3) | [site](https://coopmaths.fr/alea/?uuid=gc360&id=gc360&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-07f8f81dc7 | jjs2e | tickets-rendu | question 2 identique à la question 1 (×8) | [site](https://coopmaths.fr/alea/?uuid=jjs2e&id=jjs2e&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-2842a3c482 | pp1p2 | tickets-rendu | question 2 identique à la question 1 (×8) | [site](https://coopmaths.fr/alea/?uuid=pp1p2&id=pp1p2&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-607a0513bd | upkts | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=upkts&id=upkts&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-074e4b8173 | y75un | tickets-rendu | question 2 identique à la question 1 (×9) | [site](https://coopmaths.fr/alea/?uuid=y75un&id=y75un&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-4f09ed385d | TEA1-22 | tickets-rendu | question 2 identique à la question 1 (×7) | [site](https://coopmaths.fr/alea/?uuid=568c2&id=TEA1-22&n=10&alea=revue-1-a&i=1&cd=1) |
| A-d6666dff24 | TSA1-11 | tickets-rendu | question 7 identique à la question 3 (×4) | [site](https://coopmaths.fr/alea/?uuid=787b5&id=TSA1-11&n=10&alea=revue-1-a&i=1&cd=1) |
| A-2f06826d8f | TSA1-13 | tickets-rendu | question 10 identique à la question 8 | [site](https://coopmaths.fr/alea/?uuid=4c1f5&id=TSA1-13&n=10&alea=revue-1-a&i=1&cd=1) |
| A-53c7ac66d7 | TSA1-44 | tickets-rendu | question 9 identique à la question 5 (×2) | [site](https://coopmaths.fr/alea/?uuid=87fb7&id=TSA1-44&n=10&alea=revue-1-a&i=1&cd=1) |
| A-e5fea5b5a0 | TSG1-01 | tickets-rendu | question 9 identique à la question 2 (×2) | [site](https://coopmaths.fr/alea/?uuid=5e90e&id=TSG1-01&n=10&s=1&alea=revue-6-a&i=1&cd=1) |

## 26. Énoncé ou correction vide

- Où : exercices listés
- Ce qui se passe : Une question sans énoncé ou sans correction pour certains réglages.
- Correction proposée : Écrire la correction manquante, ou interdire la combinaison de réglages.
- Exercices (96) : 6AutoT1-6, TSA2-QCM06, 1A, 2A, 2G21-2, 2L21-3, 2L21-4, 2L21-5, 2L21-6, 2N10-2, 2N10-3, 2N14-4, 2N21-1, 2N30-4, 2N41-4, 2N50-2, 3Auto, 3AutoDNB2026-5, 3AutoDNB2026-6, 3AutoL04, 3G20-3, 3L13, 3L13-1, 3L15-3, 4C20-3, 4C30-1, 4C30-1b, 4G20-6, 4L15-1, 4L20, 4L20-1, 4L24, 5G1B-3, 5G5B-1, 5N1autoA, 5N1J-1, 5N1L-3, 5N1L-5, 5N2C, 5N3autoE-2, 6A, 6AutoG2, 6G2B, 6G6A-5, 6G6A-6, 6M1autoE-1, 6M2C-1, 6M3B, 6N1F, 6N2D, 6N2F-1, 6N3I-1, BP1AUTO087, BP2AutoK1, BP2AutoV4, can6a-Aléa, EN-EtoileCalculs, EN-Gratte-ciel, EN-Grimuku, EN-Juniper-Green, EN-KenKen, EN-KillerSudoku, EN-Monnaie, EN-Pyramide, EN-Shikaku, EN-SquarO, EN-TablesEffacees, 19b3f, 4c7ca, 58286, 5b767, 5bd1f, 62f5e, 691a6, 691a7, 697a7, 6b74b, 6fdab, 89710, 9552b, a2993, ae7c2, b1e01, b5563, b7773, b949c, bd726, c9893, c9aa3, c9ba3, c9c44, cf880, f5d8e, labyvec, TEA1-22, TEC1-41

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| L-620c8f2e47 | 6AutoT1-6 | tickets-rendu | Consigne vide (une espace) quand sup2 ou sup3 : l'exercice s'affiche sans aucune consigne. |  |
| L-a00facc16b | TSA2-QCM06 | tickets-rendu | Correction vide (this.correction = '') : l'élève n'a aucune explication, ni la bonne réponse en mode non interactif. |  |
| A-bc2161d00e | 1A | tickets-rendu | correction vide (×96) | [site](https://coopmaths.fr/alea/?uuid=ce2ea&id=1A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-3063b8dec1 | 2A | tickets-rendu | correction vide (×80) | [site](https://coopmaths.fr/alea/?uuid=2a1c7&id=2A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| L-113af15089 | 2G21-2 | tickets-rendu | Correction vide : « Pas de correction pour l'instant » pour toutes les questions |  |
| A-557abf088e | 2L21-3 | tickets-rendu | énoncé vide (×74) | [site](https://coopmaths.fr/alea/?uuid=2e46e&id=2L21-3&s=1&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-4d11e1742a | 2L21-4 | tickets-rendu | énoncé vide (×250) | [site](https://coopmaths.fr/alea/?uuid=14c8b&id=2L21-4&s=true&s2=5-6-7&s3=false&s4=false&s5=1&alea=revue-0-a&i=1&cd=1) |
| A-fcabb7c60b | 2L21-5 | tickets-rendu | énoncé vide (×250) | [site](https://coopmaths.fr/alea/?uuid=1dc40&id=2L21-5&s=0&s2=false&s3=false&s4=1&alea=revue-0-a&i=1&cd=1) |
| A-75c92b1466 | 2L21-6 | tickets-rendu | énoncé vide (×18) | [site](https://coopmaths.fr/alea/?uuid=45156&id=2L21-6&s=false&s2=1&alea=revue-0-a&i=1&cd=1) |
| A-e7dc8223e2 | 2N10-2 | tickets-rendu | correction vide (×48) | [site](https://coopmaths.fr/alea/?uuid=d6d2a&id=2N10-2&s=2&s2=1&s3=false&s4=false&s5=false&alea=revue-8-a&i=1&cd=1) |
| A-43b9464e83 | 2N10-3 | tickets-rendu | correction vide (×24) | [site](https://coopmaths.fr/alea/?uuid=b5a46&id=2N10-3&s=2&s2=1&s3=false&s4=false&s5=true&alea=revue-7-a&i=1&cd=1) |
| A-f74284ceae | 2N10-3 | tickets-rendu | énoncé vide (×24) | [site](https://coopmaths.fr/alea/?uuid=b5a46&id=2N10-3&s=2&s2=1&s3=false&s4=false&s5=true&alea=revue-7-a&i=1&cd=1) |
| A-2a85c84cec | 2N14-4 | tickets-rendu | énoncé vide (×10) | [site](https://coopmaths.fr/alea/?uuid=abdef&id=2N14-4&s=5&alea=revue-0-a&i=1&cd=1) |
| A-bd098d1de4 | 2N21-1 | tickets-rendu | correction vide | [site](https://coopmaths.fr/alea/?uuid=3ec5c&id=2N21-1&alea=revue-0-b&i=1&cd=1) |
| A-e295c480ac | 2N30-4 | tickets-rendu | énoncé vide (×452) | [site](https://coopmaths.fr/alea/?uuid=d309b&id=2N30-4&s2=10&s3=true&s4=true&alea=revue-0-a&i=1&cd=1) |
| A-14b64e8b46 | 2N41-4 | tickets-rendu | énoncé vide (×90) | [site](https://coopmaths.fr/alea/?uuid=8f56f&id=2N41-4&s=4&s2=false&alea=revue-0-a&i=1&cd=1) |
| A-dc3e2418d5 | 2N50-2 | tickets-rendu | énoncé vide (×41) | [site](https://coopmaths.fr/alea/?uuid=99c85&id=2N50-2&s=3&s2=1&alea=revue-0-a&i=1&cd=1) |
| A-098bc59a3c | 3Auto | tickets-rendu | correction vide (×80) | [site](https://coopmaths.fr/alea/?uuid=a531a&id=3Auto&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-75873831b0 | 3AutoDNB2026-5 | tickets-rendu | correction vide (×5) | [site](https://coopmaths.fr/alea/?uuid=8de53&id=3AutoDNB2026-5&s=false&alea=revue-0-a&i=1&cd=1) |
| A-6d659e0664 | 3AutoDNB2026-6 | tickets-rendu | correction vide (×25) | [site](https://coopmaths.fr/alea/?uuid=867be&id=3AutoDNB2026-6&s=false&alea=revue-0-a&i=1&cd=1) |
| A-6fd44ef4e8 | 3AutoL04 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=b9893&id=3AutoL04&alea=revue-0-a&i=1&cd=1) |
| L-04f87df466 | 3AutoL04 | tickets-rendu | Correction vide (QCM « solution de l'équation ») |  |
| A-21ef57ba78 | 3G20-3 | tickets-rendu | énoncé vide (×74) | [site](https://coopmaths.fr/alea/?uuid=1aaa0&id=3G20-3&s=1&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-f3ed6003b0 | 3L13 | tickets-rendu | énoncé vide (×226) | [site](https://coopmaths.fr/alea/?uuid=23bdc&id=3L13&s=true&s2=8&s3=false&s4=false&s5=1&alea=revue-0-a&i=1&cd=1) |
| A-8a36be8d29 | 3L13-1 | tickets-rendu | énoncé vide (×202) | [site](https://coopmaths.fr/alea/?uuid=b9e01&id=3L13-1&s=0&s2=false&s3=false&s4=1&alea=revue-0-a&i=1&cd=1) |
| A-91da715acd | 3L15-3 | tickets-rendu | énoncé vide (×112) | [site](https://coopmaths.fr/alea/?uuid=bff54&id=3L15-3&s=1&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-f423ab9714 | 4C20-3 | tickets-rendu | énoncé vide (×74) | [site](https://coopmaths.fr/alea/?uuid=ed0de&id=4C20-3&s=1&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-963f323ec1 | 4C30-1 | tickets-rendu | énoncé vide (×50) | [site](https://coopmaths.fr/alea/?uuid=760d8&id=4C30-1&s=4&alea=revue-0-a&i=1&cd=1) |
| A-7e5627e0c6 | 4C30-1b | tickets-rendu | énoncé vide (×50) | [site](https://coopmaths.fr/alea/?uuid=4068c&id=4C30-1b&s=4&alea=revue-0-a&i=1&cd=1) |
| A-7411837a43 | 4G20-6 | tickets-rendu | énoncé vide (×41) | [site](https://coopmaths.fr/alea/?uuid=516d2&id=4G20-6&s=3&s2=1&alea=revue-0-a&i=1&cd=1) |
| A-5bab9dbb46 | 4L15-1 | tickets-rendu | énoncé vide (×74) | [site](https://coopmaths.fr/alea/?uuid=6463b&id=4L15-1&s=1&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-d26e666dac | 4L20 | tickets-rendu | énoncé vide (×250) | [site](https://coopmaths.fr/alea/?uuid=5772b&id=4L20&s=true&s2=1-2-3-4-5&s3=true&s4=false&s5=1&alea=revue-0-a&i=1&cd=1) |
| A-85da567129 | 4L20-1 | tickets-rendu | énoncé vide (×42) | [site](https://coopmaths.fr/alea/?uuid=c19b6&id=4L20-1&s=false&s2=1&alea=revue-0-a&i=1&cd=1) |
| A-6c27a2f78e | 4L24 | tickets-rendu | énoncé vide (×16) | [site](https://coopmaths.fr/alea/?uuid=1b7c9&id=4L24&alea=revue-0-a&i=1&cd=1) |
| A-670a7fd585 | 5G1B-3 | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=4dadb&id=5G1B-3&alea=revue-0-a&i=1&cd=1) |
| A-6160d3745b | 5G5B-1 | tickets-rendu | correction vide (×18) | [site](https://coopmaths.fr/alea/?uuid=6a1a2&id=5G5B-1&s=true&s2=false&s3=1&alea=revue-4-a&i=1&cd=1) |
| A-0eb66f3006 | 5N1autoA | tickets-rendu | énoncé vide (×340) | [site](https://coopmaths.fr/alea/?uuid=9ca7f&id=5N1autoA&s=4&s2=5&s3=7&alea=revue-0-a&i=1&cd=1) |
| A-97c0191e38 | 5N1autoA | tickets-rendu | correction vide (×340) | [site](https://coopmaths.fr/alea/?uuid=9ca7f&id=5N1autoA&s=4&s2=5&s3=7&alea=revue-0-a&i=1&cd=1) |
| A-071ca09e62 | 5N1J-1 | tickets-rendu | énoncé vide (×10) | [site](https://coopmaths.fr/alea/?uuid=424b2&id=5N1J-1&s=5&alea=revue-0-a&i=1&cd=1) |
| A-2ec6ad5a75 | 5N1J-1 | tickets-rendu | correction vide (×10) | [site](https://coopmaths.fr/alea/?uuid=424b2&id=5N1J-1&s=5&alea=revue-0-a&i=1&cd=1) |
| L-d9d6298a28 | 5N1J-1 | tickets-rendu | Labyrinthe interactif (10 IM, 20 X4 : énoncé de série vide) ; titre très long « …basé sur des critères de divisibilité de 2, 3, 5 ou 9 ». |  |
| A-1cbe867bee | 5N1L-3 | tickets-rendu | énoncé vide (×26) | [site](https://coopmaths.fr/alea/?uuid=b7aee&id=5N1L-3&s=100&alea=revue-0-a&i=1&cd=1) |
| A-4a988b4092 | 5N1L-3 | tickets-rendu | correction vide (×26) | [site](https://coopmaths.fr/alea/?uuid=b7aee&id=5N1L-3&s=100&alea=revue-0-a&i=1&cd=1) |
| A-5d519da975 | 5N1L-5 | tickets-rendu | énoncé vide (×42) | [site](https://coopmaths.fr/alea/?uuid=984fb&id=5N1L-5&s=2&s2=2&alea=revue-0-a&i=1&cd=1) |
| A-fc19bd99d2 | 5N1L-5 | tickets-rendu | correction vide (×42) | [site](https://coopmaths.fr/alea/?uuid=984fb&id=5N1L-5&s=2&s2=2&alea=revue-0-a&i=1&cd=1) |
| A-1c70f603fb | 5N2C | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=7f3d1&id=5N2C&s=true&alea=revue-0-a&i=1&cd=1) |
| A-a19e756fa0 | 5N2C | tickets-rendu | correction vide (×14) | [site](https://coopmaths.fr/alea/?uuid=7f3d1&id=5N2C&s=true&alea=revue-0-a&i=1&cd=1) |
| A-4c75f7f35c | 5N3autoE-2 | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=e1a0a&id=5N3autoE-2&alea=revue-0-a&i=1&cd=1) |
| A-634f3fd657 | 5N3autoE-2 | tickets-rendu | énoncé vide (×2) | [site](https://coopmaths.fr/alea/?uuid=e1a0a&id=5N3autoE-2&alea=revue-0-a&i=1&cd=1) |
| A-33d818ce08 | 6A | tickets-rendu | correction vide (×80) | [site](https://coopmaths.fr/alea/?uuid=c6cd6&id=6A&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-99edcec3f0 | 6AutoG2 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=b6c33&id=6AutoG2&alea=revue-0-a&i=1&cd=1) |
| L-ab549f1a13 | 6AutoG2 | tickets-rendu | Correction vide pour toutes les questions (this.correction = ``) ; l'élève qui se trompe n'a aucune explication |  |
| A-3a6a73dd81 | 6G2B | tickets-rendu | correction vide (×34) | [site](https://coopmaths.fr/alea/?uuid=f8dee&id=6G2B&s=3&s2=2&alea=revue-0-a&i=1&cd=1) |
| A-cfbf89ff27 | 6G6A-5 | tickets-rendu | correction vide (×6) | [site](https://coopmaths.fr/alea/?uuid=1ad45&id=6G6A-5&s=true&alea=revue-1-a&i=1&cd=1) |
| A-a86a12c5be | 6G6A-6 | tickets-rendu | correction vide (×18) | [site](https://coopmaths.fr/alea/?uuid=73630&id=6G6A-6&s=true&s2=false&s3=1&alea=revue-4-a&i=1&cd=1) |
| L-65809d5cac | 6G6A-6 | tickets-rendu | Énoncé de série vide (18 X4) ; mise en évidence « 3,6 cm », « 6,1 cm » avec ≈ dans le dollar ; valeurs vérifiées (KM≈3,6 ; LM≈6,1 ; angle 53°) ; unité mm à préciser. |  |
| A-30b64bf497 | 6M1autoE-1 | tickets-rendu | énoncé vide (×24) | [site](https://coopmaths.fr/alea/?uuid=ab280&id=6M1autoE-1&s=1&s2=1&s3=false&alea=revue-2-a&i=1&cd=1) |
| A-83edc57204 | 6M2C-1 | tickets-rendu | énoncé vide (×30) | [site](https://coopmaths.fr/alea/?uuid=5e598&id=6M2C-1&s=1-2&s2=1&s3=false&alea=revue-2-a&i=1&cd=1) |
| A-4d1d8400f3 | 6M3B | tickets-rendu | énoncé vide (×18) | [site](https://coopmaths.fr/alea/?uuid=5f117&id=6M3B&s2=1&s3=true&alea=revue-1-a&i=1&cd=1) |
| A-d01c21a1da | 6N1F | tickets-rendu | énoncé vide (×170) | [site](https://coopmaths.fr/alea/?uuid=67f4a&id=6N1F&s=5&s2=false&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-296fa81a22 | 6N2D | tickets-rendu | énoncé vide (×154) | [site](https://coopmaths.fr/alea/?uuid=56773&id=6N2D&s=4&s2=1&s3=false&s4=false&alea=revue-0-a&i=1&cd=1) |
| A-aab986ea4f | 6N2F-1 | tickets-rendu | énoncé vide (×310) | [site](https://coopmaths.fr/alea/?uuid=6e828&id=6N2F-1&s=3&s2=1&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-3ab2ee17ee | 6N3I-1 | tickets-rendu | énoncé vide (×298) | [site](https://coopmaths.fr/alea/?uuid=1f5de&id=6N3I-1&s2=11&s3=true&s4=true&alea=revue-0-a&i=1&cd=1) |
| L-f8cf18a35b | BP1AUTO087 | tickets-rendu | 6 X4 (énoncé de série vide) ; « $x^2-9$ $=$ » deux dollars ; correction absente de la sortie. |  |
| A-0997d292d4 | BP2AutoK1 | tickets-rendu | énoncé vide (×138) | [site](https://coopmaths.fr/alea/?uuid=5a644&id=BP2AutoK1&s=true&s3=true&s4=false&s5=1&alea=revue-0-a&i=1&cd=1) |
| L-cc3ec535a5 | BP2AutoK1 | tickets-rendu | Solveur interactif (138 IM, 138 X4) : énoncé de série vide, à tester à la main. |  |
| A-006e06d105 | BP2AutoV4 | tickets-rendu | énoncé vide (×24) | [site](https://coopmaths.fr/alea/?uuid=d1514&id=BP2AutoV4&s=1&s2=1&s3=false&alea=revue-2-a&i=1&cd=1) |
| A-ddc796968d | can6a-Aléa | tickets-rendu | correction vide (×92) | [site](https://coopmaths.fr/alea/?uuid=315b6&id=can6a-Al%C3%A9a&s=All&alea=revue-0-a&i=1&cd=1) |
| A-a3d1259e5b | EN-EtoileCalculs | tickets-rendu | énoncé vide (×130) | [site](https://coopmaths.fr/alea/?uuid=e7f3a&id=EN-EtoileCalculs&s=5&s2=8&alea=revue-0-a&i=1&cd=1) |
| A-e3bad8b0f9 | EN-Gratte-ciel | tickets-rendu | énoncé vide (×18) | [site](https://coopmaths.fr/alea/?uuid=74d07&id=EN-Gratte-ciel&s=3&alea=revue-0-a&i=1&cd=1) |
| A-4a8269d60a | EN-Grimuku | tickets-rendu | énoncé vide (×58) | [site](https://coopmaths.fr/alea/?uuid=01def&id=EN-Grimuku&s=2&s2=1&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-5773240ad2 | EN-Juniper-Green | tickets-rendu | énoncé vide (×2) | [site](https://coopmaths.fr/alea/?uuid=cc308&id=EN-Juniper-Green&alea=revue-0-a&i=1&cd=1) |
| A-ef96f2a90a | EN-KenKen | tickets-rendu | énoncé vide (×240) | [site](https://coopmaths.fr/alea/?uuid=5b4fa&id=EN-KenKen&s=2&s2=1-2-3-4&s3=1&s4=true&alea=revue-0-a&i=1&cd=1) |
| A-5782401c4d | EN-KillerSudoku | tickets-rendu | énoncé vide (×36) | [site](https://coopmaths.fr/alea/?uuid=4f449&id=EN-KillerSudoku&s=2&s2=1&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-2a511f3d76 | EN-Monnaie | tickets-rendu | énoncé vide (×22) | [site](https://coopmaths.fr/alea/?uuid=2ead3&id=EN-Monnaie&s=3&alea=revue-0-a&i=1&cd=1) |
| A-e0b1f030a5 | EN-Pyramide | tickets-rendu | énoncé vide (×116) | [site](https://coopmaths.fr/alea/?uuid=fa607&id=EN-Pyramide&s=1&s2=false&s3=99&alea=revue-0-a&i=1&cd=1) |
| A-afaca45fb0 | EN-Shikaku | tickets-rendu | énoncé vide (×100) | [site](https://coopmaths.fr/alea/?uuid=ccf19&id=EN-Shikaku&s=5&s2=5&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-69c3224095 | EN-SquarO | tickets-rendu | énoncé vide (×38) | [site](https://coopmaths.fr/alea/?uuid=e2024&id=EN-SquarO&s=5&s2=5&s3=false&s4=1&alea=revue-7-a&i=1&cd=1) |
| A-de965728ab | EN-TablesEffacees | tickets-rendu | énoncé vide (×20) | [site](https://coopmaths.fr/alea/?uuid=eb23a&id=EN-TablesEffacees&s=3&alea=revue-0-a&i=1&cd=1) |
| A-6875367cd9 | 19b3f | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=19b3f&id=19b3f&s=false&alea=revue-0-a&i=1&cd=1) |
| A-d653e8c09e | 4c7ca | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=4c7ca&id=4c7ca&s=%28-3%3B-2%29%2F%28-1%3B0%29%2F%281%3B-3%29%2F%283%3B4%29&s2=%282%3B2%29%2F%280%3B0%29%2F%280%3B0%29%2F%281%3B1%29&s3=1%2F1%2F1%2F1&alea=revue-0-a&i=1&cd=1) |
| L-a5f49f39d3 | 4c7ca | tickets-rendu | Correction vide (aucun texte de correction) |  |
| A-2cbd5b9ee2 | 58286 | tickets-rendu | énoncé vide (×42) | [site](https://coopmaths.fr/alea/?uuid=58286&id=58286&s=true&s2=false&s3=1&alea=revue-0-a&i=1&cd=1) |
| A-db6b90ae2d | 5b767 | tickets-rendu | correction vide (×60) | [site](https://coopmaths.fr/alea/?uuid=5b767&id=5b767&s=%28-5%3B0%29%2F%280%3B5%29%2F%285%3B0%29&s2=true&s3=1&s4=3&alea=revue-0-a&i=1&cd=1) |
| L-46d6777e88 | 5b767 | tickets-rendu | Correction vide (aucun texte de correction) |  |
| A-81cd2d954d | 5bd1f | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=5bd1f&id=5bd1f&s=false&alea=revue-0-a&i=1&cd=1) |
| A-543f58168a | 62f5e | tickets-rendu | correction vide (×116) | [site](https://coopmaths.fr/alea/?uuid=62f5e&id=62f5e&s=2-3-4-5&s2=5&alea=revue-0-a&i=1&cd=1) |
| A-949dc0ebeb | 691a6 | tickets-rendu | correction vide (×164) | [site](https://coopmaths.fr/alea/?uuid=691a6&id=691a6&s=1&s2=1234.5-789.2&s3=0&alea=revue-0-a&i=1&cd=1) |
| A-5f76ce106c | 691a7 | tickets-rendu | correction vide (×26) | [site](https://coopmaths.fr/alea/?uuid=691a7&id=691a7&s=2&s2=10000&s3=1&alea=revue-13-a&i=1&cd=1) |
| A-10f6bc998c | 697a7 | tickets-rendu | énoncé vide (×2) | [site](https://coopmaths.fr/alea/?uuid=697a7&id=697a7&alea=revue-0-a&i=1&cd=1) |
| A-3316c6ec8b | 697a7 | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=697a7&id=697a7&alea=revue-0-a&i=1&cd=1) |
| A-70c986adf3 | 6b74b | tickets-rendu | correction vide (×260) | [site](https://coopmaths.fr/alea/?uuid=6b74b&id=6b74b&s=&s2=5&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-7f504ac7da | 6b74b | tickets-rendu | énoncé vide (×260) | [site](https://coopmaths.fr/alea/?uuid=6b74b&id=6b74b&s=&s2=5&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-b3b232c918 | 6fdab | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=6fdab&id=6fdab&alea=revue-0-a&i=1&cd=1) |
| A-3005a374dc | 89710 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=89710&id=89710&s=false&alea=revue-0-a&i=1&cd=1) |
| A-27f6e9dd33 | 9552b | tickets-rendu | énoncé vide (×10) | [site](https://coopmaths.fr/alea/?uuid=9552b&id=9552b&s=false&alea=revue-0-a&i=1&cd=1) |
| A-0c7d28fb44 | a2993 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=a2993&id=a2993&s=false&alea=revue-0-a&i=1&cd=1) |
| A-e5119118aa | ae7c2 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=ae7c2&id=ae7c2&s=false&alea=revue-0-a&i=1&cd=1) |
| L-985d96269f | ae7c2 | tickets-rendu | QCM « Ordre de grandeur » dont l'énoncé est vide (14 X4) : seules les trois propositions 0,4 cm / 0,4 km / 0,4 m sont affichées, la phrase « Un terrain de foot est un rectangle… »… |  |
| A-09c549dd0e | b1e01 | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=b1e01&id=b1e01&alea=revue-0-a&i=1&cd=1) |
| A-6016aba176 | b5563 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=b5563&id=b5563&s=false&alea=revue-0-a&i=1&cd=1) |
| A-c00439863e | b7773 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=b7773&id=b7773&alea=revue-0-a&i=1&cd=1) |
| L-64ab3ff331 | b7773 | tickets-rendu | QCM probabilité « Sachant que toutes les boules ont la même… » : correction vide (12 X4, 12 M3). |  |
| A-2bf8e301ed | b949c | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=b949c&id=b949c&s=false&alea=revue-0-a&i=1&cd=1) |
| L-2724f091eb | b949c | tickets-rendu | QCM « Trouver la figure avec deux angles droits » sans énoncé (14 X4) : seules les cases « Figure 1 à 4 » sont affichées (les figures ne sont pas dans le texte) ; 70 N1. |  |
| A-1acf69c505 | bd726 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=bd726&id=bd726&alea=revue-0-a&i=1&cd=1) |
| A-26c7772033 | c9893 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=c9893&id=c9893&alea=revue-0-a&i=1&cd=1) |
| L-528b0d8682 | c9893 | tickets-rendu | Correction vide (QCM notation scientifique) |  |
| A-22a1568254 | c9aa3 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=c9aa3&id=c9aa3&alea=revue-0-a&i=1&cd=1) |
| L-2ff06660bf | c9aa3 | tickets-rendu | QCM « Calculer le périmètre d'un rectangle » : correction vide (12 X4) ; propositions « $38\text{ mm}^2$ » vs « $38\text{ mm}$ » ; 12 M3. |  |
| A-de92796ac2 | c9ba3 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=c9ba3&id=c9ba3&alea=revue-0-a&i=1&cd=1) |
| A-6ffa1c460b | c9c44 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=c9c44&id=c9c44&s=false&alea=revue-0-a&i=1&cd=1) |
| L-84679ae3ca | c9c44 | tickets-rendu | QCM « Ordre de grandeur » sans énoncé affiché |  |
| A-245995d2af | cf880 | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=cf880&id=cf880&s=false&alea=revue-0-a&i=1&cd=1) |
| A-619e52f6f1 | f5d8e | tickets-rendu | énoncé vide (×14) | [site](https://coopmaths.fr/alea/?uuid=f5d8e&id=f5d8e&s=false&alea=revue-0-a&i=1&cd=1) |
| A-16fbb67123 | labyvec | tickets-rendu | énoncé vide (×2) | [site](https://coopmaths.fr/alea/?uuid=labyvec&id=labyvec&alea=revue-0-a&i=1&cd=1) |
| A-9cef620d61 | labyvec | tickets-rendu | correction vide (×2) | [site](https://coopmaths.fr/alea/?uuid=labyvec&id=labyvec&alea=revue-0-a&i=1&cd=1) |
| L-68d82c2943 | TEA1-22 | tickets-rendu | Énoncé de série vide dans 7 cas (X4) ; correction par disjonction de cas r=0…6 (« Si r=0, alors q=… ») sans tableau ; solution « n=8q » non mise en évidence. |  |
| A-4d7bd49664 | TEC1-41 | tickets-rendu | énoncé vide (×26) | [site](https://coopmaths.fr/alea/?uuid=8e72e&id=TEC1-41&s=false&s2=1&alea=revue-0-a&i=1&cd=1) |
| L-edc9bf7756 | TEC1-41 | tickets-rendu | Exercice « mathalea-solveur » (26 IM) : énoncé de série vide (26 X4) ; 26 phrases sans virgule ; à tester à la main. |  |
| A-efb8313984 | TSA2-QCM06 | tickets-rendu | correction vide (×12) | [site](https://coopmaths.fr/alea/?uuid=90af7&id=TSA2-QCM06&alea=revue-0-a&i=1&cd=1) |

## 27. Aucune question produite pour une combinaison de réglages

- Où : exercices listés
- Ce qui se passe : L'exercice ne produit aucune question avec ces réglages.
- Correction proposée : Interdire la combinaison ou produire au moins une question.
- Exercices (7) : 3A11-0, 4C24, 5G4A-4, 6N1A-7, 6N1B, CM1N1E, EN-CompteBon

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-c4b24ab2a4 | 3A11-0 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×35) | [site](https://coopmaths.fr/alea/?uuid=61835&id=3A11-0&s=1&s2=1&s3=2&alea=revue-2-a&i=1&cd=1) |
| A-96970789e9 | 4C24 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×42) | [site](https://coopmaths.fr/alea/?uuid=554bf&id=4C24&s=1-2&s2=1&s3=2&alea=revue-2-a&i=1&cd=1) |
| A-10cfcac091 | 3A11-0 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×70) | [site](https://coopmaths.fr/alea/?uuid=61835&id=3A11-0&s=1&s2=1&s3=2&alea=revue-2-a&i=1&cd=1) |
| A-e4816c0375 | 4C24 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×84) | [site](https://coopmaths.fr/alea/?uuid=554bf&id=4C24&s=1-2&s2=1&s3=2&alea=revue-2-a&i=1&cd=1) |
| A-a343952700 | 5G4A-4 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×6) | [site](https://coopmaths.fr/alea/?uuid=am8cs&id=5G4A-4&s=3&s3=true&s4=3&s5=false&alea=revue-5-a&i=1&cd=1) |
| A-f852d6b593 | 5G4A-4 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×3) | [site](https://coopmaths.fr/alea/?uuid=am8cs&id=5G4A-4&s=3&s3=true&s4=3&s5=false&alea=revue-5-a&i=1&cd=1) |
| A-60ddc0e828 | 6N1A-7 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×83) | [site](https://coopmaths.fr/alea/?uuid=a41ba&id=6N1A-7&s=1&s2=6&s3=7&s4=true&s5=true&alea=revue-7-a&i=1&cd=1) |
| A-cd5233bcb1 | 6N1A-7 | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×42) | [site](https://coopmaths.fr/alea/?uuid=a41ba&id=6N1A-7&s=1&s2=6&s3=7&s4=true&s5=true&alea=revue-7-a&i=1&cd=1) |
| A-05719f96bb | 6N1B | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×29) | [site](https://coopmaths.fr/alea/?uuid=bc1e0&id=6N1B&s=4&s2=1&s3=true&s4=true&alea=revue-37-a&i=1&cd=1) |
| A-8f16b97d16 | 6N1B | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×15) | [site](https://coopmaths.fr/alea/?uuid=bc1e0&id=6N1B&s=4&s2=1&s3=true&s4=true&alea=revue-37-a&i=1&cd=1) |
| A-7e935fd8aa | CM1N1E | tickets-rendu | aucune question générée pour cette combinaison de paramètres (×24) | [site](https://coopmaths.fr/alea/?uuid=ff08e&id=CM1N1E&s=3&s2=6&s3=7&s4=true&s5=true&alea=revue-20-a&i=1&cd=1) |
| A-32aa5f188b | EN-CompteBon | tickets-rendu | aucune question générée pour cette combinaison de paramètres | [site](https://coopmaths.fr/alea/?uuid=dcef5&id=EN-CompteBon&s=1&s2=1&s3=1&s4=true&s5=true&alea=revue-1-a&i=1&cd=1) |

## 28. Même graine, énoncés différents

- Où : exercices listés (aléa tiré hors de nouvelleVersion)
- Ce qui se passe : Avec la même graine, l'exercice ne redonne pas le même énoncé : une séance ne peut pas être reprise à l'identique.
- Correction proposée : Tirer tout l'aléa dans nouvelleVersion avec les fonctions de MathALÉA (randint, choice).
- Exercices (24) : 1A-F03-7, 1A-F05-4, 1A-F07-2, 2A-S1-1, 2F22-3, 2F22-5, 2F33-2, 3G1QCM-3, 3G40, 3G4QCM-2, 6AutoF3-3, can1SD22-04, can2F21-02, canCE2a-2025, CM2N2A-4, 12a46, 1474f, 23241, 9daa5, c8ee7, d7202, efab7, f6jd7, TSA3-46

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-0e40615203 | 1A-F03-7 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=6e14c&id=1A-F03-7&alea=revue-0-a&i=1&cd=1) |
| A-f49038e95f | 1A-F05-4 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=f8b6d&id=1A-F05-4&alea=revue-0-a&i=1&cd=1) |
| A-b01ac54218 | 1A-F07-2 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=35c0e&id=1A-F07-2&alea=revue-0-a&i=1&cd=1) |
| A-cf5adcfce6 | 2A-S1-1 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=q5c12f&id=2A-S1-1&alea=revue-0-a&i=1&cd=1) |
| A-dfe15e47cc | 2F22-3 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=4f213&id=2F22-3&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-7d8859ca18 | 2F22-5 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=c7d91&id=2F22-5&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-403715035f | 2F33-2 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=49fca&id=2F33-2&s=3&s2=3&alea=revue-0-a&i=1&cd=1) |
| A-2b22caf38a | 3G1QCM-3 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=39ed1&id=3G1QCM-3&alea=revue-0-a&i=1&cd=1) |
| A-77d3489e8b | 3G40 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=75ea2&id=3G40&s=3&s2=false&s3=false&s4=false&alea=revue-0-a&i=1&cd=1) |
| A-c636687d24 | 3G4QCM-2 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=f6fd7&id=3G4QCM-2&alea=revue-0-a&i=1&cd=1) |
| A-2f704ebd33 | 6AutoF3-3 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=1574f&id=6AutoF3-3&s=1&alea=revue-0-a&i=1&cd=1) |
| A-9cd71f0447 | can1SD22-04 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=131bd&id=can1SD22-04&alea=revue-0-a&i=1&cd=1) |
| A-a70129d7d7 | can2F21-02 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=73ab4&id=can2F21-02&alea=revue-0-a&i=1&cd=1) |
| A-d9f86085cc | canCE2a-2025 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=ad71f&id=canCE2a-2025&s=false&alea=revue-0-a&i=1&cd=1) |
| A-cf5a4e5bd0 | CM2N2A-4 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=1574a&id=CM2N2A-4&s=1&s2=true&s3=2&alea=revue-0-a&i=1&cd=1) |
| A-143891e9a7 | 12a46 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=12a46&id=12a46&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-19e55dceec | 1474f | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=1474f&id=1474f&s=false&alea=revue-0-a&i=1&cd=1) |
| A-cd088c52e4 | 23241 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=23241&id=23241&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-273bb4b950 | 9daa5 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=9daa5&id=9daa5&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-eed93acb7f | c8ee7 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=c8ee7&id=c8ee7&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-1d9329d347 | d7202 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=d7202&id=d7202&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-a3a9f8d9e3 | efab7 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=efab7&id=efab7&s3=true&alea=revue-0-a&i=1&cd=1) |
| A-d7ad79ce6a | f6jd7 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=f6jd7&id=f6jd7&s=false&alea=revue-0-a&i=1&cd=1) |
| A-9a3b1e5f4e | TSA3-46 | tickets-rendu | même graine, énoncés différents (aléa hors nouvelleVersion ?) | [site](https://coopmaths.fr/alea/?uuid=faf4b&id=TSA3-46&s=7&alea=revue-0-a&i=1&cd=1) |

## 29. Erreurs d'exécution signalées pendant la génération

- Où : exercices listés
- Ce qui se passe : Exception (TypeError…) ou erreur de rendu KaTeX dans la console ; « [bugsnag] Event failed to send » signale une erreur que MathALÉA a voulu remonter.
- Correction proposée : Corriger l'erreur indiquée.
- Exercices (24) : 1AL23-23, 3G44, 3I12-2, 3I12-4, 5G5autoA, 5I1C, 5I1D, 6AutoA2, 6AutoF1-7, 6G1autoB, 6I1B-4, 6I1D, 6N0A-12, 6N1A-3, 9ES1C-1, 9NO1G-9, can6a-Aléa, canCE2-2026, CM2N1D-1, CM2N1D-2, bc372, de353, de363, TEC1-51

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-4510a2ec69 | 1AL23-23 | tickets-rendu | console : KaTeX auto-render: Failed to parse `\Delta = (2m-2)^2-4\error{\blacksquare} \error{(}` with  ParseError: KaTeX parse error: Undefined control sequence: \error at positio… |  |
| A-57f233b6e2 | 1AL23-23 | tickets-rendu | console : KaTeX auto-render: Failed to parse `\Delta = (-m-1)^2-4\error{\blacksquare} \error{(}` with  ParseError: KaTeX parse error: Undefined control sequence: \error at positio… |  |
| A-14d4f789fa | 3G44 | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-517980f871 | 3G44 | tickets-rendu | console : {"positionLabel":"above","color":["black","{black}"],"style":"","epaisseur":1,"opacite":1,"id":3281584,"pointilles":0,"bordures":[0.27,4.11,0.56,4.11],"x1":0.27,"x2":0.5… |  |
| A-9325cb18a0 | 3G44 | tickets-rendu | console : {"positionLabel":"above","color":["black","{black}"],"style":"","epaisseur":1,"opacite":1,"id":3282717,"pointilles":0,"bordures":[0.27,-4.11,0.56,-4.11],"x1":0.27,"x2":0… |  |
| A-a6a58c8bf6 | 3I12-2 | tickets-rendu | génération : page.evaluate: TypeError: Cannot read properties of undefined (reading '0')     at ComprendreScriptMultiples.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices… (×10) | [site](https://coopmaths.fr/alea/?uuid=defeb&id=3I12-2&s=6&s2=1&s3=1&s4=1&alea=revue-26-a&i=1&cd=1) |
| A-36bc78b10d | 3I12-4 | tickets-rendu | génération : page.evaluate: TypeError: Cannot read properties of undefined (reading '0')     at ComprendreScriptListeMultiples.nouvelleVersion (http://127.0.0.1:5173/alea/src/exer… (×10) | [site](https://coopmaths.fr/alea/?uuid=9a1a9&id=3I12-4&s=6&s2=1&s3=1&alea=revue-26-a&i=1&cd=1) |
| A-3807ea465c | 5G5autoA | tickets-rendu | console : {"positionLabel":"above","color":["black","{black}"],"style":"","epaisseur":1,"opacite":1,"id":80895,"pointilles":0,"bordures":[-7.8,-7.8,7.8,7.8],"centre":{"positionLab… |  |
| A-4c2da417d3 | 5G5autoA | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-898e9acb5d | 5I1C | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-ba287ab152 | 5I1C | tickets-rendu | console : Cannot read properties of undefined (reading 'style') |  |
| A-a80aae98a9 | 5I1D | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-b3e3e79fc9 | 5I1D | tickets-rendu | console : Cannot read properties of undefined (reading 'style') |  |
| A-9691d816ba | 6AutoA2 | tickets-rendu | console : [bugsnag] Session failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=… |  |
| A-5644a77410 | 6AutoF1-7 | tickets-rendu | console : Point : les coordonnées ne sont pas valides |  |
| A-ef8b9dde34 | 6AutoF1-7 | tickets-rendu | console : choice a éliminé toutes les possibilités, il ne reste rien à choisir !  |  |
| A-f002a26b37 | 6AutoF1-7 | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| L-4d085985e6 | 6AutoF1-7 | tickets-rendu | Grilles : un dénominateur 10 est tiré (choice([4, 6, 8, 9, 10, 12])) mais aucun nombre de lignes de 2 à 4 ne donne au plus 4 colonnes : nbDiv vide, « choice a éliminé toutes les p… |  |
| A-1053ef9d27 | 6G1autoB | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-9f81a071e9 | 6G1autoB | tickets-rendu | console : {"positionLabel":"above","color":["black","{black}"],"style":"","epaisseur":1,"opacite":1,"id":505246,"pointilles":0,"bordures":[-7.8,-7.8,7.8,7.8],"centre":{"positionLa… |  |
| A-54109faab7 | 6I1B-4 | tickets-rendu | génération : page.evaluate: TypeError: Cannot read properties of undefined (reading 'oldn')     at ExerciceTableur.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/6e/6I1… (×5) | [site](https://coopmaths.fr/alea/?uuid=ae07c&id=6I1B-4&s=1&s2=4&alea=revue-4-a&i=1&cd=1) |
| A-b947f1b5f0 | 6I1D | tickets-rendu | console : The AudioContext encountered an error from the audio device or the WebAudio renderer. |  |
| A-230f73ba44 | 6N0A-12 | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-8c1a23a49e | 6N0A-12 | tickets-rendu | console : AfficherNombre : Le nombre n'en est pas un |  |
| A-2378bc0b20 | 6N1A-3 | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-6ab4cd88e0 | 6N1A-3 | tickets-rendu | console : boucle sans fin detectée case 14 6N10-7 |  |
| A-5a5d6ec087 | 9ES1C-1 | tickets-rendu | console : {"positionLabel":"above","color":["black","{black}"],"style":"","epaisseur":1,"opacite":1,"id":21811,"pointilles":0,"bordures":[-7.8,-7.8,7.8,7.8],"centre":{"positionLab… |  |
| A-b3932c35ef | 9ES1C-1 | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-1bb01471f5 | 9NO1G-9 | tickets-rendu | console : [bugsnag] Event failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=d5… |  |
| A-537cd54b12 | 9NO1G-9 | tickets-rendu | console : texNombre : Trop de chiffres le nombre passé à la fonction a trop de chiffres significatifs, soit c'est un bug à corriger, soit il faut utiliser un Decimal ! Il y a un r… (×3) |  |
| A-516d5bcfd4 | can6a-Aléa | tickets-rendu | énoncé resté à « chargement... » (questions chargées après la génération) (×148) | [site](https://coopmaths.fr/alea/?uuid=315b6&id=can6a-Al%C3%A9a&s=All&alea=revue-0-a&i=1&cd=1) |
| A-0fffff5bc6 | canCE2-2026 | tickets-rendu | interactif (correcte) : page.evaluate: Error: aucun exercice préparé     at Module.interactif (http://127.0.0.1:5173/alea/revue-sonde.ts?t=1793185166125:349:18)     at eval (eval … | [site](https://coopmaths.fr/alea/?uuid=189f8&id=canCE2-2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-187a0195ad | canCE2-2026 | tickets-rendu | interactif (vide) : page.evaluate: Error: aucun exercice préparé     at Module.interactif (http://127.0.0.1:5173/alea/revue-sonde.ts?t=1793185166125:349:18)     at eval (eval at e… | [site](https://coopmaths.fr/alea/?uuid=189f8&id=canCE2-2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-3e548653e8 | canCE2-2026 | tickets-rendu | console : [bugsnag] Session failed to send… Error: Request failed with status 0     at req.onreadystatechange (http://127.0.0.1:5173/alea/node_modules/.vite/deps/@bugsnag_js.js?v=… |  |
| A-9eaeb94871 | canCE2-2026 | tickets-rendu | rendu correction : page.evaluate: Error: aucun exercice préparé     at Module.rendre (http://127.0.0.1:5173/alea/revue-sonde.ts?t=1793185166125:127:18)     at eval (eval at evalua… | [site](https://coopmaths.fr/alea/?uuid=189f8&id=canCE2-2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-a9ff702bd8 | canCE2-2026 | tickets-rendu | interactif (incorrecte) : page.evaluate: Error: aucun exercice préparé     at Module.interactif (http://127.0.0.1:5173/alea/revue-sonde.ts?t=1793185166125:349:18)     at eval (eva… | [site](https://coopmaths.fr/alea/?uuid=189f8&id=canCE2-2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-ac3a8bf31a | canCE2-2026 | tickets-rendu | interactif (evidence) : page.evaluate: Error: aucun exercice préparé     at Module.interactif (http://127.0.0.1:5173/alea/revue-sonde.ts?t=1793185166125:349:18)     at eval (eval … | [site](https://coopmaths.fr/alea/?uuid=189f8&id=canCE2-2026&s=false&alea=revue-0-a&i=1&cd=1) |
| A-b8959a10d9 | CM2N1D-1 | tickets-rendu | console : KaTeX auto-render: Failed to parse `0}}` with  ParseError: KaTeX parse error: Expected 'EOF', got '}' at position 4: {0}}̲}     at _Parser.expect (http://127.0.0.1:5173/… |  |
| A-e192ed035b | CM2N1D-2 | tickets-rendu | console : KaTeX auto-render: Failed to parse `0}}` with  ParseError: KaTeX parse error: Expected 'EOF', got '}' at position 4: {0}}̲}     at _Parser.expect (http://127.0.0.1:5173/… |  |
| A-7c41c17d44 | bc372 | tickets-rendu | génération : page.evaluate: TypeError: this.sup.split is not a function     at SimulateurDes.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/profs/P016.ts:34:29)     at … (×3) | [site](https://coopmaths.fr/alea/?uuid=bc372&id=bc372&s=6&alea=revue-0-a&i=1&cd=1) |
| A-e255d47da3 | de353 | tickets-rendu | génération : page.evaluate: TypeError: this.sup.replaceAll is not a function     at EncodeurTexte.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/profs/P020-old.ts:105:3… (×24) | [site](https://coopmaths.fr/alea/?uuid=de353&id=de353&s=1&s2=true&alea=revue-2-a&i=1&cd=1) |
| A-ba3347966a | de363 | tickets-rendu | génération : page.evaluate: TypeError: this.sup.replaceAll is not a function     at EncodeurTexte.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/profs/P020.ts:141:36)  … (×24) | [site](https://coopmaths.fr/alea/?uuid=de363&id=de363&s=1&s2=true&alea=revue-2-a&i=1&cd=1) |
| A-03d9510b1f | TEC1-51 | tickets-rendu | console : KaTeX auto-render: Failed to parse `z\neqi` with  ParseError: KaTeX parse error: Undefined control sequence: \neqi at position 3: {z\̲n̲e̲q̲i̲}     at _Parser.parseGroup… |  |

## 30. Exercices trop lents pour le banc

- Où : exercices listés
- Ce qui se passe : Le banc s'est arrêté après 10 minutes sur l'exercice (toutes variantes) : il n'a pas été testé automatiquement.
- Correction proposée : À tester à la main ; vérifier la durée de génération.
- Exercices (5) : 2mFctRat-1, 5N1B-1, 6M2autoC, 6N3M, EN-CompteBon

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-e5baa2e7c0 | 2mFctRat-1 | tickets-rendu | arrêt : délai de 10 min dépassé |  |
| A-a344518719 | 5N1B-1 | tickets-rendu | arrêt : délai de 10 min dépassé |  |
| A-6cd164720f | 6M2autoC | tickets-rendu | arrêt : délai de 10 min dépassé |  |
| A-bc001bb9f6 | 6N3M | tickets-rendu | arrêt : délai de 10 min dépassé |  |
| A-08ff7468c0 | EN-CompteBon | tickets-rendu | arrêt : délai de 10 min dépassé |  |

## 31. Formules mal fermées (« $ » visible, nombre impair de $)

- Où : exercices listés
- Ce qui se passe : Un « $ » reste visible ou une formule n'est pas fermée : le LaTeX s'affiche brut.
- Correction proposée : Fermer la formule (souvent un $ en trop ou manquant autour d'une mise en évidence).
- Exercices (28) : 1AL23-23, 1P10-3, 1mG3-6, 2L30-5, 3AutoP04-3, 3F14-1, 5G3A-2, 6AutoF3, 6N0B-1, can1D3-03, can2a-2024, can2a-2025, can2N5-05, can5a-2025, can5D-01, CM2N1D-1, CM2N1D-2, a343t, afd39, PET12, PET13, PET14, PET15, PET16, PR-32, TEC1-51, TEG1-11, TSA5-42

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-93177599e5 | 1AL23-23 | tickets-rendu | « $ » visible : −m−1) 2 −4×(m+)×(−2m−3). Ou encore, sous forme développée : $\Delta = (-m-1)^2-4\error{\blacksquare} \error{(}$ Cherchon | [site](https://coopmaths.fr/alea/?uuid=fe4dg&id=1AL23-23&s=3&alea=revue-2-b&i=1&cd=1) |
| A-f9f0c8e35b | 1AL23-23 | tickets-rendu | « $ » visible : (2m−2) 2 −4×(m−)×(−m−3). Ou encore, sous forme développée : $\Delta = (2m-2)^2-4\error{\blacksquare} \error{(}$ Cherchon | [site](https://coopmaths.fr/alea/?uuid=fe4dg&id=1AL23-23&s=3&alea=revue-2-b&i=1&cd=1) |
| A-19ce0260f8 | 1P10-3 | tickets-rendu | « $ » visible :  3 ​ = 100 87 ​ ​ Ainsi, 𝑃 ( 𝑇 ) = 87 100 P(T)= 100 87 ​ .$. | [site](https://coopmaths.fr/alea/?uuid=233ef&id=1P10-3&s=2&s2=true&alea=revue-3-b&i=1&cd=1) |
| A-2f8ec3b050 | 1P10-3 | tickets-rendu | nombre impair de $ : Ainsi, $P(T)={\color{#F15929}\boldsymbol{\dfrac{87}{100}}}$.$. | [site](https://coopmaths.fr/alea/?uuid=233ef&id=1P10-3&s=2&s2=true&alea=revue-3-b&i=1&cd=1) |
| A-0d65d2e774 | 1mG3-6 | tickets-rendu | nombre impair de $ : EB}^2} = \sqrt{121 + 66} = \sqrt{187}\text{ cm}$, d'où $AE = {\color{#F15929}\boldsymbol{\sqrt{187}\textbf{ cm}}}. (×3) | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=2&s2=false&s3=true&alea=revue-4-a&i=1&cd=1) |
| A-13d4b8d736 | 1mG3-6 | tickets-rendu | « $ » visible :  + 30 = 130 cm IM= IJ 2 +MJ 2 ​ = 100+30 ​ = 130 ​ cm, d'où $IM = {\color{#F15929}\boldsymbol{\sqrt{130}\textbf{ cm}}}. (×2) | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=3&s2=true&s3=true&alea=revue-5-a&i=1&cd=1) |
| A-3cf055a1b2 | 1mG3-6 | tickets-rendu | nombre impair de $ : {EB}^2} = \sqrt{49 + 84} = \sqrt{133}\text{ cm}$, d'où $AE = {\color{#F15929}\boldsymbol{\sqrt{133}\textbf{ cm}}}. (×2) | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=13&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-655dae076d | 1mG3-6 | tickets-rendu | « $ » visible :  = 4 + 30 = 34 cm AE= AB 2 +EB 2 ​ = 4+30 ​ = 34 ​ cm, d'où $AE = {\color{#F15929}\boldsymbol{\sqrt{34}\textbf{ cm}}}. | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=3&s2=false&s3=false&alea=revue-6-b&i=1&cd=1) |
| A-786889a738 | 1mG3-6 | tickets-rendu | « $ » visible :  25 + 45 = 70 cm IM= IJ 2 +MJ 2 ​ = 25+45 ​ = 70 ​ cm, d'où $IM = {\color{#F15929}\boldsymbol{\sqrt{70}\textbf{ cm}}}. | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=2&s2=true&s3=false&alea=revue-3-b&i=1&cd=1) |
| A-e0415c51b7 | 1mG3-6 | tickets-rendu | « $ » visible :  + 66 = 187 cm AE= AB 2 +EB 2 ​ = 121+66 ​ = 187 ​ cm, d'où $AE = {\color{#F15929}\boldsymbol{\sqrt{187}\textbf{ cm}}}. (×3) | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=2&s2=false&s3=true&alea=revue-4-a&i=1&cd=1) |
| A-e29b368614 | 1mG3-6 | tickets-rendu | « $ » visible : 9 + 84 = 133 cm AE= AB 2 +EB 2 ​ = 49+84 ​ = 133 ​ cm, d'où $AE = {\color{#F15929}\boldsymbol{\sqrt{133}\textbf{ cm}}}. (×2) | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=13&s2=false&s3=false&alea=revue-0-a&i=1&cd=1) |
| A-f6f7efcf17 | 1mG3-6 | tickets-rendu | nombre impair de $ : MJ}^2} = \sqrt{100 + 30} = \sqrt{130}\text{ cm}$, d'où $IM = {\color{#F15929}\boldsymbol{\sqrt{130}\textbf{ cm}}}. (×2) | [site](https://coopmaths.fr/alea/?uuid=4f81e&id=1mG3-6&s=3&s2=true&s3=true&alea=revue-5-a&i=1&cd=1) |
| A-37ff7e3f2d | 2L30-5 | tickets-rendu | « $ » visible : 8. a) Résolution de l'inéquation : $\begin{aligned} -3x-8&\dfrac{6}{-4} \end{aligned}$ Comme 6  | [site](https://coopmaths.fr/alea/?uuid=53e8f&id=2L30-5&n=10&s=1&s2=1&alea=revue-6-a&i=1&cd=1) |
| A-44a07cfb1c | 2L30-5 | tickets-rendu | « $ » visible : 3. a) Résolution de l'inéquation : $\begin{aligned} -6x+9&\dfrac{-12}{-7} \end{aligned}$ Comme  | [site](https://coopmaths.fr/alea/?uuid=53e8f&id=2L30-5&n=10&s=1&s2=1&alea=revue-6-a&i=1&cd=1) |
| A-37e61c2956 | 3AutoP04-3 | tickets-rendu | nombre impair de $ : tel que $Aire_{ADEF} = 20\text{ cm}^2$.&lt;br> On trouve $AD={\color{#F15929}\boldsymbol{4}}\text{ cm}. (×5) | [site](https://coopmaths.fr/alea/?uuid=5bc80&id=3AutoP04-3&alea=revue-0-a&i=1&cd=1) |
| A-4264edb87a | 3AutoP04-3 | tickets-rendu | « $ » visible : � 𝑒 𝐴 𝐷 𝐸 𝐹 = 10 cm 2 Aire ADEF ​ =10 cm 2 . On trouve $AD={\color{#F15929}\boldsymbol{1,3}}\text{ cm}. (×4) | [site](https://coopmaths.fr/alea/?uuid=5bc80&id=3AutoP04-3&alea=revue-0-b&i=1&cd=1) |
| A-47c74ccd91 | 3AutoP04-3 | tickets-rendu | « $ » visible : � 𝑒 𝐴 𝐷 𝐸 𝐹 = 20 cm 2 Aire ADEF ​ =20 cm 2 . On trouve $AD={\color{#F15929}\boldsymbol{4}}\text{ cm}. (×5) | [site](https://coopmaths.fr/alea/?uuid=5bc80&id=3AutoP04-3&alea=revue-0-a&i=1&cd=1) |
| A-778f0883a7 | 3AutoP04-3 | tickets-rendu | nombre impair de $ : tel que $Aire_{ADEF} = 10\text{ cm}^2$.&lt;br> On trouve $AD={\color{#F15929}\boldsymbol{0,8}}\text{ cm}. (×3) | [site](https://coopmaths.fr/alea/?uuid=5bc80&id=3AutoP04-3&n=10&alea=revue-1-a&i=1&cd=1) |
| A-e67f5abf10 | 3AutoP04-3 | tickets-rendu | nombre impair de $ : tel que $Aire_{ADEF} = 20\text{ cm}^2$.&lt;br> On trouve $AD={\color{#F15929}\boldsymbol{4}}\text{ cm}. |  |
| A-9a59fde078 | 3F14-1 | tickets-rendu | « $ » visible :  × × Nombre de séances. a) La fonction 𝑓 f est définie par $f(x)={\color{#F15929}\boldsymbol{13+6,30x}}. b) La fonction (×4) | [site](https://coopmaths.fr/alea/?uuid=5622b&id=3F14-1&s=1&alea=revue-1-a&i=1&cd=1) |
| A-0765381152 | 5G3A-2 | tickets-rendu | nombre impair de $ : $N$.$&lt;br>Les cercles tracés en pointillés sont centrés en $N$.&lt;br>&lt;br>&lt;br>&lt;div class="svgContainer" style="display: bloc | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=3&s2=1&alea=revue-10-a&i=1&cd=1) |
| A-0accf965c4 | 5G3A-2 | tickets-rendu | nombre impair de $ : $.$&lt;br>Les demi-droites tracées en pointillés passent par $T$.&lt;br>&lt;br>&lt;br>&lt;div class="svgContainer" style="display: bloc | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=2&s2=1&alea=revue-5-a&i=1&cd=1) |
| A-14a872f26f | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐴 ′ A ′ du point 𝐴 A par rapport au point 𝐸 E.$ Les cercles tracés en pointillés sont centrés en 𝐸 E. 𝐸  | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=3&s2=1&alea=revue-10-b&i=1&cd=1) |
| A-22f8229453 | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐵 ′ B ′ du point 𝐵 B par rapport au point 𝑈 U.$ 𝑈 U 𝐵 B | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=1&s2=1&alea=revue-1-b&i=1&cd=1) |
| A-32afe454da | 5G3A-2 | tickets-rendu | nombre impair de $ : e le symétrique $A' $ du point $A$ par rapport au point $T$.$&lt;br>&lt;br>&lt;br> [champ] &lt;div class="m-6 leading-none" id="apig | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=4&s2=1&alea=revue-15-a&i=1&cd=1) |
| A-33b57ed132 | 5G3A-2 | tickets-rendu | nombre impair de $ : $N$.$&lt;br>Les cercles tracés en pointillés sont centrés en $N$.&lt;br>&lt;br>&lt;br> [champ] &lt;div class="m-6 leading-none" id="api | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=3&s2=1&alea=revue-10-a&i=1&cd=1) |
| A-3faec2a3a2 | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐸 ′ E ′ du point 𝐸 E par rapport au point 𝑁 N.$ Les cercles tracés en pointillés sont centrés en 𝑁 N. 𝑁  | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=3&s2=1&alea=revue-10-a&i=1&cd=1) |
| A-4dced1125c | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐴 ′ A ′ du point 𝐴 A par rapport au point 𝑇 T.$ 𝑇 T 𝐴 A | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=4&s2=1&alea=revue-15-a&i=1&cd=1) |
| A-5fabf6e979 | 5G3A-2 | tickets-rendu | nombre impair de $ : r le symétrique $H' $ du point $H$ par rapport au point $R$.$&lt;br>&lt;br>&lt;br>&lt;div class="svgContainer" style="display: block | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-64769b9a59 | 5G3A-2 | tickets-rendu | nombre impair de $ : e le symétrique $A' $ du point $A$ par rapport au point $T$.$&lt;br>&lt;br>&lt;br>&lt;div class="svgContainer" style="display: block | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=4&s2=1&alea=revue-15-a&i=1&cd=1) |
| A-71653f0803 | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐻 ′ H ′ du point 𝐻 H par rapport au point 𝑅 R.$ 𝑅 R 𝐻 H | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-7c62a3a501 | 5G3A-2 | tickets-rendu | nombre impair de $ : $.$&lt;br>Les demi-droites tracées en pointillés passent par $T$.&lt;br>&lt;br>&lt;br> [champ] &lt;div class="m-6 leading-none" id="api | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=2&s2=1&alea=revue-5-a&i=1&cd=1) |
| A-841978d6aa | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐾 ′ K ′ du point 𝐾 K par rapport au point 𝑇 T.$ Les demi-droites tracées en pointillés passent par 𝑇 T. � | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=2&s2=1&alea=revue-5-a&i=1&cd=1) |
| A-9087f4fdf4 | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐼 ′ I ′ du point 𝐼 I par rapport au point 𝐷 D.$ Les demi-droites tracées en pointillés passent par 𝐷 D. � | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=2&s2=1&alea=revue-5-b&i=1&cd=1) |
| A-91b3245e2b | 5G3A-2 | tickets-rendu | nombre impair de $ : r le symétrique $H' $ du point $H$ par rapport au point $R$.$&lt;br>&lt;br>&lt;br> [champ] &lt;div class="m-6 leading-none" id="apig | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-a909e2917c | 5G3A-2 | tickets-rendu | « $ » visible : symétrique 𝐵 ′ B ′ du point 𝐵 B par rapport au point 𝐻 H.$ 𝐻 H 𝐵 B | [site](https://coopmaths.fr/alea/?uuid=67c96&id=5G3A-2&s=4&s2=1&alea=revue-15-b&i=1&cd=1) |
| A-486b929b79 | 6AutoF3 | tickets-rendu | nombre impair de $ : &lt;label>$$&lt;/label> [champ] &lt;span>&nbsp;$+\dfrac{1}{4}=1$&lt;/span> &lt;div class ="ml-2 py-2 italic text-coopmaths-warn-d (×2) | [site](https://coopmaths.fr/alea/?uuid=e32d0&id=6AutoF3&s=3&alea=revue-0-a&i=1&cd=1) |
| A-9cd072f6e7 | 6AutoF3 | tickets-rendu | nombre impair de $ : l>$$&lt;/label> [champ] &lt;span>&nbsp;$+\dfrac{1}{4}=\dfrac{1}{2}$&lt;/span> &lt;div class ="ml-2 py-2 italic text-coopmaths-warn-d | [site](https://coopmaths.fr/alea/?uuid=e32d0&id=6AutoF3&n=10&s=3&alea=revue-3-a&i=1&cd=1) |
| A-b882a50bbb | 6AutoF3 | tickets-rendu | nombre impair de $ : l>$$&lt;/label> [champ] &lt;span>&nbsp;$-\dfrac{1}{2}=\dfrac{1}{4}$&lt;/span> &lt;div class ="ml-2 py-2 italic text-coopmaths-warn-d (×4) | [site](https://coopmaths.fr/alea/?uuid=e32d0&id=6AutoF3&s=2&alea=revue-2-a&i=1&cd=1) |
| L-8149ae72ab | 6AutoF3 | tickets-rendu | Champ en début d'égalité : libellé « $$ » vide avant le champ (formule vide, $ en nombre impair dans la ligne) |  |
| L-0217ea3a5b | 6N0B-1 | tickets-rendu | Propositions du QCM « $$9$-$7$$ » : les nombres déjà entourés de $ sont remis dans '$§+£$', d'où une formule cassée en morceaux (chiffres en police du texte, signe en police des m… |  |
| A-2233b452d7 | can1D3-03 | tickets-rendu | nombre impair de $ : a fonction définie par $f(x)=\dfrac{3}{-3x+5}$.&lt;br> f'(x)=$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&alea=revue-0-a&i=1&cd=1) |
| A-2b44627173 | can1D3-03 | tickets-rendu | nombre impair de $ : la fonction définie par $f(x)=\dfrac{2}{x+1}$.&lt;br> f'(x)=$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&n=10&alea=revue-1-a&i=1&cd=1) |
| A-5869caca6b | can1D3-03 | tickets-rendu | « $ » visible : tion définie par 𝑓 ( 𝑥 ) = 2 𝑥 + 1 f(x)= x+1 2 ​ . f'(x)=$ | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&n=10&alea=revue-1-a&i=1&cd=1) |
| A-5ad8beebab | can1D3-03 | tickets-rendu | « $ » visible : éfinie par 𝑓 ( 𝑥 ) = 5 − 3 𝑥 − 5 f(x)= −3x−5 5 ​ . f'(x)=$ | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&alea=revue-0-b&i=1&cd=1) |
| A-5e4b336bdb | can1D3-03 | tickets-rendu | « $ » visible : n définie par 𝑓 ( 𝑥 ) = 5 4 𝑥 − 4 f(x)= 4x−4 5 ​ . f'(x)=$ (×2) | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&n=10&alea=revue-1-a&i=1&cd=1) |
| A-953c6fdf91 | can1D3-03 | tickets-rendu | nombre impair de $ : la fonction définie par $f(x)=\dfrac{5}{4x-4}$.&lt;br> f'(x)=$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- (×2) | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&n=10&alea=revue-1-a&i=1&cd=1) |
| A-a483f1265f | can1D3-03 | tickets-rendu | « $ » visible : éfinie par 𝑓 ( 𝑥 ) = 3 − 3 𝑥 + 5 f(x)= −3x+5 3 ​ . f'(x)=$ | [site](https://coopmaths.fr/alea/?uuid=c4251&id=can1D3-03&alea=revue-0-a&i=1&cd=1) |
| L-d13327560f | can1D3-03 | tickets-rendu | Un des cas écrit « f'(x)=$ » sans $ ouvrant : « f'(x)= » s'affiche en texte et le $ final ouvre une formule avec la suite |  |
| L-3aef49417b | can2a-2024 | tickets-rendu | Q8 : $ mal placé, « $4  ;  14$ » : le séparateur et $sp$ passent dans la formule |  |
| L-9d0f4b1952 | can2a-2025 | tickets-rendu | Q12 (aléatoire) : apostrophe parasite « \hline ' » dans le tableau du script ; sujet officiel « \hline\\ » ajoute une ligne vide |  |
| L-a9e905e5fd | can2N5-05 | tickets-rendu | « Calculer $-$$\sqrt{64}$ » : signe moins dans une formule à part, collée à la suivante ($$ consécutifs) ; double espace « Calculer  » |  |
| A-11a4d87ad7 | can5a-2025 | tickets-rendu | nombre impair de $ : ue de nombres&nbsp;: $75$&nbsp;; $150$&nbsp;; $225$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m | [site](https://coopmaths.fr/alea/?uuid=d6d89&id=can5a-2025&s=false&alea=revue-0-a&i=1&cd=1) |
| A-29b8920773 | can5D-01 | tickets-rendu | nombre impair de $ : nsi, $2$ h $45$ min $=$ ${\color{#F15929}\boldsymbol{2,75}}$ h. (×3) | [site](https://coopmaths.fr/alea/?uuid=d8797&id=can5D-01&alea=revue-0-a&i=1&cd=1) |
| A-79c57034ef | can5D-01 | tickets-rendu | nombre impair de $ : insi, $5$ h $30$ min $=$ ${\color{#F15929}\boldsymbol{5,5}}$ h. (×2) | [site](https://coopmaths.fr/alea/?uuid=d8797&id=can5D-01&n=10&alea=revue-1-a&i=1&cd=1) |
| A-fae1f07e90 | can5D-01 | tickets-rendu | « $ » visible : 1. 45 45 min = 45 60 = 60 45 ​ h = 3 4 = 4 3 ​ h = =0,75$ h. Ainsi, 2 2 h 45 45 min = = 2 , 75 2,75 h. (×5) | [site](https://coopmaths.fr/alea/?uuid=d8797&id=can5D-01&alea=revue-0-a&i=1&cd=1) |
| A-047712512d | CM2N1D-1 | tickets-rendu | « $ » visible : 1. {\color{#F15929}\boldsymbol{$0}}$ (×14) | [site](https://coopmaths.fr/alea/?uuid=6498e&id=CM2N1D-1&s=true&s2=1&s4=2&s5=false&alea=revue-2-a&i=1&cd=1) |
| A-0a4b513f1a | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $977= ~unités+ ~centaines+ ~dizaines$ (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=1&s4=1&s5=true&alea=revue-25-a&i=1&cd=1) |
| A-0bcf371ad7 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $5\,099= ~dizaines+ ~mille+ ~unités$ (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=1&s4=2&s5=true&alea=revue-28-a&i=1&cd=1) |
| A-0befa1accb | CM2N1D-2 | tickets-rendu | « $ » visible : er le nombre correspondant au premier membre de l'égalité. =$  (×4) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=3&s4=2&s5=false&alea=revue-19-a&i=1&cd=1) |
| A-0e77da7558 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $5\,945= ~unités+ ~mille+ ~centaines+ ~dizaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=5&s4=1&s5=true&alea=revue-30-b&i=1&cd=1) |
| A-2243c006e9 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $3\,009\,991= ~millions+ ~mille+ ~centaines+ ~dizaines+ ~uni | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=1&s4=3&s5=false&alea=revue-7-a&i=1&cd=1) |
| A-25980a7f53 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $657= ~dizaines+ ~unités+ ~centaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=1&s4=1&s5=true&alea=revue-25-a&i=1&cd=1) |
| A-266379a2bd | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $9\,008\,162= ~millions+ ~mille+ ~centaine+ ~dizaines+ ~unit | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=1&s4=3&s5=false&alea=revue-7-a&i=1&cd=1) |
| A-2d1575e4cf | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $833\,365\,839= ~dizaines de millions+ ~dizaines+ ~centaines | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-b&i=1&cd=1) |
| A-31c98d885c | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $29\,154\,046= ~dizaines de millions+ ~millions+ ~centaine d | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=8&s3=1&s4=4&s5=false&alea=revue-8-a&i=1&cd=1) |
| A-36d1d2cacc | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $295\,447\,578= ~dizaines de mille+ ~unités+ ~centaines+ ~di | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-b&i=1&cd=1) |
| A-42e2ede05c | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $1\,055= ~unités+ ~mille+ ~dizaines$ (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=1&s4=2&s5=true&alea=revue-28-a&i=1&cd=1) |
| A-4d5ab6b2d3 | CM2N1D-2 | tickets-rendu | « $ » visible : 1. ={\color{#F15929}\boldsymbol{0}}$ (×4) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=3&s4=2&s5=false&alea=revue-19-a&i=1&cd=1) |
| A-5467d9e678 | CM2N1D-2 | tickets-rendu | « $ » visible : 1. {\color{#F15929}\boldsymbol{$0}}$ (×4) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=false&s2=1&s3=2&s4=3&s5=true&alea=revue-10-a&i=1&cd=1) |
| A-564e1f9526 | CM2N1D-2 | tickets-rendu | nombre impair de $ : le nombre correspondant au premier membre de l'égalité.&lt;br>=$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=3&s4=2&s5=false&alea=revue-19-a&i=1&cd=1) |
| A-565ed60500 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $617\,639\,147= ~unités+ ~centaines de millions+ ~mille+ ~di | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-a&i=1&cd=1) |
| A-58d509b060 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $542= ~dizaines+ ~centaines+ ~unités$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=5&s4=1&s5=true&alea=revue-27-a&i=1&cd=1) |
| A-5e81c55988 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $307\,384= ~dizaines+ ~unités+ ~centaines de mille+ ~centain | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-a&i=1&cd=1) |
| A-5ed56adc8d | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $7\,827\,118= ~millions+ ~dizaines de mille+ ~centaines de m | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=5&s4=1&s5=true&alea=revue-39-b&i=1&cd=1) |
| A-67360c5eb4 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $88\,818\,517= ~dizaine+ ~centaines de mille+ ~dizaines de m | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=8&s3=5&s4=1&s5=true&alea=revue-42-b&i=1&cd=1) |
| A-79e95c7872 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $92\,464= ~dizaines de mille+ ~mille+ ~centaines+ ~dizaines+ (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=5&s3=5&s4=1&s5=false&alea=revue-5-a&i=1&cd=1) |
| A-7bd0dfcad9 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $3= ~unités$ (×7) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=1&s4=1&s5=true&alea=revue-1-a&i=1&cd=1) |
| A-7c81aa12cb | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $612\,606= ~centaines de mille+ ~dizaine de mille+ ~centaine | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-b&i=1&cd=1) |
| A-83f93549dc | CM2N1D-2 | tickets-rendu | nombre impair de $ : espondant au premier membre de l'égalité.&lt;br> = ............$&lt;div id=divDuSmiley0Q2 style= "display: inline-block">&lt;/div | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=5&s4=4&s5=true&alea=revue-21-a&i=1&cd=1) |
| A-848c9099b0 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $1\,548\,008= ~million+ ~centaines de mille+ ~dizaines de mi | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=1&s4=3&s5=false&alea=revue-7-b&i=1&cd=1) |
| A-85d26040cd | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $345\,337\,686= ~centaines de millions+ ~dizaines+ ~millions | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=5&s4=1&s5=true&alea=revue-45-a&i=1&cd=1) |
| A-8759d1b29f | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $9\,505= ~unités+ ~centaines+ ~mille$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=1&s4=2&s5=true&alea=revue-28-b&i=1&cd=1) |
| A-8871f7bbdb | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $593= ~unités+ ~dizaines+ ~centaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=1&s4=1&s5=true&alea=revue-25-a&i=1&cd=1) |
| A-8f5ffbf661 | CM2N1D-2 | tickets-rendu | nombre impair de $ : ={\color{#F15929}\boldsymbol{0}}$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=3&s4=2&s5=false&alea=revue-19-a&i=1&cd=1) |
| A-92861f7f16 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $875\,763\,644= ~dizaines+ ~dizaines de mille+ ~centaines+ ~ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=5&s4=1&s5=true&alea=revue-45-b&i=1&cd=1) |
| A-93f17bbb52 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $60= ~dizaines$ (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=2&s3=5&s4=2&s5=true&alea=revue-24-a&i=1&cd=1) |
| A-9dc71c957e | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $2\,438\,334= ~centaines de mille+ ~unités+ ~dizaines+ ~mill | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=5&s4=1&s5=true&alea=revue-39-a&i=1&cd=1) |
| A-9feeb8fd1d | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $283\,155\,219= ~millions+ ~centaines de millions+ ~centaine | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-a&i=1&cd=1) |
| A-a20007785e | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $713= ~centaines+ ~dizaine+ ~unités$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=5&s4=1&s5=true&alea=revue-27-b&i=1&cd=1) |
| A-a954298fb0 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $578\,994\,158= ~centaine+ ~centaines de millions+ ~unités+  | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-a&i=1&cd=1) |
| A-aa074dda8a | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $30\,038\,379= ~dizaines de millions+ ~dizaines de mille+ ~m | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=8&s3=1&s4=4&s5=false&alea=revue-8-b&i=1&cd=1) |
| A-b05a1926ba | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $607\,193= ~centaines de mille+ ~centaine+ ~dizaines+ ~mille | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-a&i=1&cd=1) |
| A-b5047b603d | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $4\,723= ~dizaines+ ~mille+ ~unités+ ~centaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=5&s4=1&s5=true&alea=revue-30-a&i=1&cd=1) |
| A-b63e756ac2 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $89\,452\,007= ~dizaines de millions+ ~millions+ ~centaines  (×6) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=8&s3=1&s4=4&s5=false&alea=revue-8-a&i=1&cd=1) |
| A-b8724cab6e | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $769\,991\,596= ~dizaines de mille+ ~centaines+ ~dizaines+ ~ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-b&i=1&cd=1) |
| A-bbb87fd340 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $609\,337= ~unités+ ~centaines+ ~mille+ ~dizaines+ ~centaine | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-b&i=1&cd=1) |
| A-bce5345064 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $403\,854= ~mille+ ~centaines de mille+ ~dizaines+ ~centaine | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-a&i=1&cd=1) |
| A-bffcbb74bf | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $209\,981= ~centaines+ ~mille+ ~dizaines+ ~unité+ ~centaines | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-b&i=1&cd=1) |
| A-c06e93c773 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $616\,276\,567= ~centaines+ ~dizaines+ ~dizaine de millions+ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-b&i=1&cd=1) |
| A-c5fe381cdf | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $1= ~unité$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=1&s4=1&s5=true&alea=revue-1-a&i=1&cd=1) |
| A-c6e9b1555c | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $1\,117\,003= ~million+ ~centaine de mille+ ~dizaine de mill | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=1&s4=3&s5=false&alea=revue-7-b&i=1&cd=1) |
| A-c7cb667643 | CM2N1D-2 | tickets-rendu | nombre impair de $ : respondant au premier membre de l'égalité.&lt;br>= ............$&lt;div id=divDuSmiley0Q0 style= "display: inline-block">&lt;/div | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=1&s3=3&s4=2&s5=false&alea=revue-19-a&i=1&cd=1) |
| A-c910647652 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $6\,300\,356= ~millions+ ~centaines de mille+ ~centaines+ ~d (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=1&s4=3&s5=false&alea=revue-7-a&i=1&cd=1) |
| A-cbc3d9f138 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $3\,909= ~centaines+ ~unités+ ~mille$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=1&s4=2&s5=true&alea=revue-28-b&i=1&cd=1) |
| A-cc373ae049 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $369\,046= ~mille+ ~dizaines de mille+ ~unités+ ~dizaines+ ~ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-b&i=1&cd=1) |
| A-ccec160190 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $618= ~dizaine+ ~unités+ ~centaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=1&s4=1&s5=true&alea=revue-25-b&i=1&cd=1) |
| A-ce0e7e28ee | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $172\,893\,498= ~centaines+ ~centaine de millions+ ~mille+ ~ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=9&s3=1&s4=1&s5=true&alea=revue-9-a&i=1&cd=1) |
| A-d3b59ae1f8 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $968= ~centaines+ ~unités+ ~dizaines$ (×3) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=3&s3=1&s4=1&s5=true&alea=revue-25-a&i=1&cd=1) |
| A-d8c704641d | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $9\,906= ~mille+ ~unités+ ~centaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=1&s4=2&s5=true&alea=revue-28-a&i=1&cd=1) |
| A-de20ba3708 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $8\,420\,026= ~millions+ ~centaines de mille+ ~dizaines de m (×2) | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=7&s3=1&s4=3&s5=false&alea=revue-7-a&i=1&cd=1) |
| A-eb55889bf4 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $44\,636\,522= ~centaines de mille+ ~dizaines de mille+ ~mil | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=8&s3=5&s4=1&s5=true&alea=revue-42-a&i=1&cd=1) |
| A-ebabb0301b | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $841\,503= ~mille+ ~dizaines de mille+ ~unités+ ~centaines+  | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=6&s3=1&s4=2&s5=true&alea=revue-6-a&i=1&cd=1) |
| A-eff154b839 | CM2N1D-2 | tickets-rendu | « $ » visible : étant avec les nombres (à un seul chiffre) qui conviennent. $6\,505= ~unités+ ~mille+ ~centaines$ | [site](https://coopmaths.fr/alea/?uuid=c96de&id=CM2N1D-2&s=true&s2=4&s3=1&s4=2&s5=true&alea=revue-28-a&i=1&cd=1) |
| L-a74318ff5f | CM2N1D-2 | tickets-rendu | Type « Donner le nombre » avec 1 chiffre (sup2=1) : énoncé « … de l'égalité. =$ » ($ visible) et correction « {\color…\boldsymbol{$0}}$ » (erreur KaTeX « 0}} ») ; mises en évidenc… |  |
| A-4b6899938f | a343t | tickets-rendu | nombre impair de $ : ique de nombres&nbsp;: $25$&nbsp;; $50$&nbsp;; $75$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m (×3) | [site](https://coopmaths.fr/alea/?uuid=a343t&id=a343t&s=false&alea=revue-0-a&i=1&cd=1) |
| A-74f1dd8c7f | a343t | tickets-rendu | nombre impair de $ : que de nombres&nbsp;: $50$&nbsp;; $75$&nbsp;; $100$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m (×2) | [site](https://coopmaths.fr/alea/?uuid=a343t&id=a343t&s=true&alea=revue-1-a&i=1&cd=1) |
| A-8d7a14a09e | a343t | tickets-rendu | nombre impair de $ : e de nombres&nbsp;: $130$&nbsp;; $195$&nbsp;; $260$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m (×3) | [site](https://coopmaths.fr/alea/?uuid=a343t&id=a343t&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| A-db9e49a868 | a343t | tickets-rendu | nombre impair de $ : ue de nombres&nbsp;: $75$&nbsp;; $150$&nbsp;; $225$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m (×4) | [site](https://coopmaths.fr/alea/?uuid=a343t&id=a343t&n=10&s=false&alea=revue-2-a&i=1&cd=1) |
| L-a4902749c6 | a343t | tickets-rendu | Énoncé : « $25$; $50$; $75$; $$ [champ] » : $$ vide (délimiteur de mode display sans formule) → 14 X2 ; correction « Ainsi, ? = 75+25 » avec « ? » non défini ; « Complète » ; 26 R… |  |
| A-3ea12a43bc | afd39 | tickets-rendu | nombre impair de $ : $P(x)=a(x-\alpha)^2+\beta)$, avec $a&lt;0$ est croissant sur $$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- (×2) | [site](https://coopmaths.fr/alea/?uuid=afd39&id=afd39&s=&alea=revue-0-b&i=1&cd=1) |
| A-8fcb68744f | PET12 | tickets-rendu | « $ » visible : 4. La formule =$B$2*C2 =$B$2*C2 est fausse : le signe $ $ bloque la cellule | [site](https://coopmaths.fr/alea/?uuid=c98bc&id=PET12&s=1&alea=revue-1-b&i=1&cd=1) |
| L-ebed150558 | PET12 | tickets-rendu | Références absolues de tableur « =$B$2*C2 » écrites sans protection dans le texte : les « $ » sont pris pour des délimiteurs de maths, la formule s'affiche en double (« =$B$2*C2 =… |  |
| A-93b1fef98c | PET13 | tickets-rendu | « $ » visible : 3. La formule =$B$2*C2 =$B$2*C2 est fausse : le signe $ $ bloque la cellule (×2) | [site](https://coopmaths.fr/alea/?uuid=b6f2a&id=PET13&s=1&alea=revue-1-a&i=1&cd=1) |
| L-1bfaff7cee | PET13 | tickets-rendu | Même défaut (26 X2 : « $B$2 »), 94 pages > 390 px ; « B2×C2/100 » ; « retire C2 % de B2 » : « 2 % » sans insécable (2 T1) ; 64 IM (tableur) à tester à la main. |  |
| L-7fdb55e3da | PET14 | tickets-rendu | Même défaut que PET12/13 (14 X2 : « $B$2 » pris pour des délimiteurs) ; 64 IM ; 94 pages > 390 px ; « D'autres écritures sont possibles, par exemple $\text{=B2+B3+B4+B5+B6}$ » (\t… |  |
| A-10423e236d | PET15 | tickets-rendu | « $ » visible :  est décalée de 3 colonnes vers la droite et devient F4 F4. $B$8 $B$8 est bloquée en colonne et en ligne : elle reste $B (×3) | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=1&s2=3&alea=revue-3-a&i=1&cd=1) |
| A-173bc08c6f | PET15 | tickets-rendu | « $ » visible :  elle est décalée de 3 lignes vers le bas et devient E5 E5. $C$4 $C$4 est bloquée en colonne et en ligne : elle reste $C | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=2&s2=4&alea=revue-8-a&i=1&cd=1) |
| A-240e41545a | PET15 | tickets-rendu | « $ » visible :  elle est décalée de 3 lignes vers le bas et devient F4 F4. $B$1 $B$1 est bloquée en colonne et en ligne : elle reste $B | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=2&s2=3&alea=revue-7-a&i=1&cd=1) |
| A-275e9c655e | PET15 | tickets-rendu | « $ » visible : nes vers la droite et 1 ligne vers le bas et devient E2 E2. $A$2 $A$2 est bloquée en colonne et en ligne : elle reste $A | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=3&s2=3&alea=revue-11-a&i=1&cd=1) |
| A-5a2c45b110 | PET15 | tickets-rendu | « $ » visible :  elle est décalée de 3 lignes vers le bas et devient C4 C4. $C$4 $C$4 est bloquée en colonne et en ligne : elle reste $C | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=4&s2=3&alea=revue-15-b&i=1&cd=1) |
| A-5cd1b7c6d9 | PET15 | tickets-rendu | « $ » visible : : elle est décalée de 1 ligne vers le bas et devient B5 B5. $B$6 $B$6 est bloquée en colonne et en ligne : elle reste $B | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=2&s2=4&alea=revue-8-b&i=1&cd=1) |
| A-635bdfd950 | PET15 | tickets-rendu | « $ » visible : rmule, les références sont modifiées de la façon suivante : $A$2 $A$2 est bloquée en colonne et en ligne : elle reste $A (×12) | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=4&s2=4&alea=revue-0-b&i=1&cd=1) |
| A-68e9a8843b | PET15 | tickets-rendu | « $ » visible : rmule, les références sont modifiées de la façon suivante : $D$5 $D$5 est bloquée en colonne et en ligne : elle reste $D (×4) | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=1&s2=3&alea=revue-3-b&i=1&cd=1) |
| A-72e44abf65 | PET15 | tickets-rendu | « $ » visible : ne vers la droite et 3 lignes vers le bas et devient C8 C8. $E$3 $E$3 est bloquée en colonne et en ligne : elle reste $E | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=3&s2=3&alea=revue-11-b&i=1&cd=1) |
| A-757569c95d | PET15 | tickets-rendu | « $ » visible :  est décalée de 3 colonnes vers la droite et devient D7 D7. $C$5 $C$5 est bloquée en colonne et en ligne : elle reste $C | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=1&s2=3&alea=revue-3-a&i=1&cd=1) |
| A-82b655e4bb | PET15 | tickets-rendu | « $ » visible : rmule, les références sont modifiées de la façon suivante : $B$2 $B$2 est bloquée en colonne et en ligne : elle reste $B (×6) | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=1&s2=3&alea=revue-3-b&i=1&cd=1) |
| A-86b8fa3441 | PET15 | tickets-rendu | « $ » visible : es vers la droite et 2 lignes vers le bas et devient F4 F4. $A$6 $A$6 est bloquée en colonne et en ligne : elle reste $A | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&n=10&s=4&s2=4&alea=revue-16-a&i=1&cd=1) |
| A-889abc966d | PET15 | tickets-rendu | « $ » visible : rmule, les références sont modifiées de la façon suivante : $C$3 $C$3 est bloquée en colonne et en ligne : elle reste $C (×3) | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=4&s2=4&alea=revue-0-a&i=1&cd=1) |
| A-9728494d39 | PET15 | tickets-rendu | « $ » visible : rmule, les références sont modifiées de la façon suivante : $E$2 $E$2 est bloquée en colonne et en ligne : elle reste $E | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&n=10&s=4&s2=4&alea=revue-16-a&i=1&cd=1) |
| A-a04c254d17 | PET15 | tickets-rendu | « $ » visible :  elle est décalée de 3 lignes vers le bas et devient E8 E8. $B$3 $B$3 est bloquée en colonne et en ligne : elle reste $B | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=2&s2=3&alea=revue-7-a&i=1&cd=1) |
| A-ad1c42680d | PET15 | tickets-rendu | « $ » visible :  elle est décalée de 2 lignes vers le bas et devient B5 B5. $B$3 $B$3 est bloquée en colonne et en ligne : elle reste $B | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=2&s2=3&alea=revue-7-b&i=1&cd=1) |
| A-af7739a661 | PET15 | tickets-rendu | « $ » visible : nne vers la droite et 1 ligne vers le bas et devient B6 B6. $B$5 $B$5 est bloquée en colonne et en ligne : elle reste $B | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=4&s2=3&alea=revue-15-b&i=1&cd=1) |
| A-c530b708d1 | PET15 | tickets-rendu | « $ » visible : e est décalée de 1 colonne vers la droite et devient E1 E1. $A$7 $A$7 est bloquée en colonne et en ligne : elle reste $A | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=4&s2=3&alea=revue-15-a&i=1&cd=1) |
| A-cc34d65751 | PET15 | tickets-rendu | « $ » visible : es vers la droite et 2 lignes vers le bas et devient F8 F8. $C$3 $C$3 est bloquée en colonne et en ligne : elle reste $C | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=3&s2=3&alea=revue-11-b&i=1&cd=1) |
| A-e83e7a48be | PET15 | tickets-rendu | « $ » visible :  elle est décalée de 3 lignes vers le bas et devient A8 A8. $D$3 $D$3 est bloquée en colonne et en ligne : elle reste $D (×2) | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=2&s2=3&alea=revue-7-b&i=1&cd=1) |
| A-efbbeea3ae | PET15 | tickets-rendu | « $ » visible : es vers la droite et 3 lignes vers le bas et devient E6 E6. $A$1 $A$1 est bloquée en colonne et en ligne : elle reste $A | [site](https://coopmaths.fr/alea/?uuid=46e40&id=PET15&s=3&s2=3&alea=revue-11-a&i=1&cd=1) |
| L-4a3aef9745 | PET15 | tickets-rendu | Même défaut (182 X2 : les « $ » des références absolues cassent le rendu) ; 138 M1 : mise en évidence de la formule refusée par le champ texte ; 212 phrases sans virgule ; « Cette… |  |
| A-180f3cef43 | PET16 | tickets-rendu | « $ » visible : on A : =B3*(1+B1/100) =B3*(1+B1/100) Proposition B : =B3*(1+$B$1) =B3*(1+$B$1) Proposition C : =B3+B3*$B$1/100 =B3+B3*$B | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&n=10&s=4&alea=revue-4-a&i=1&cd=1) |
| A-950b694cc6 | PET16 | tickets-rendu | « $ » visible : les références qui ne sont pas bloquées par le signe dollar $ $ sont modifiées. La cellule E6 contient donc la formule = (×3) | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&s=4&alea=revue-0-a&i=1&cd=1) |
| A-a4d2fd861c | PET16 | tickets-rendu | « $ » visible : er fixe lors de l’étirement est bloquée par le signe dollar $ $, alors que les autres références sont décalées. La propo (×12) | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&s=4&alea=revue-0-a&i=1&cd=1) |
| A-c73349922a | PET16 | tickets-rendu | « $ » visible : les références qui ne sont pas bloquées par le signe dollar $ $ sont modifiées. La cellule F5 contient donc la formule = (×2) | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&s=2&alea=revue-2-b&i=1&cd=1) |
| A-e0d8ea415b | PET16 | tickets-rendu | « $ » visible : les références qui ne sont pas bloquées par le signe dollar $ $ sont modifiées. La cellule D3 contient donc la formule = (×4) | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&s=4&alea=revue-0-b&i=1&cd=1) |
| A-e20bb1c92f | PET16 | tickets-rendu | « $ » visible : les références qui ne sont pas bloquées par le signe dollar $ $ sont modifiées. La cellule B5 contient donc la formule = | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&n=10&s=4&alea=revue-4-a&i=1&cd=1) |
| A-fdaba2f5aa | PET16 | tickets-rendu | « $ » visible : les références qui ne sont pas bloquées par le signe dollar $ $ sont modifiées. La cellule C4 contient donc la formule = | [site](https://coopmaths.fr/alea/?uuid=aa5b6&id=PET16&s=2&alea=revue-2-a&i=1&cd=1) |
| A-06bd8fc759 | PR-32 | tickets-rendu | « $ » visible : 000 100000 8 , 164 ÷ 8 ≈ 8 ÷ 8 , soit 1 8,164÷8≈8÷8, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$  (×2) | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&s=5&s2=1&alea=revue-16-a&i=1&cd=1) |
| A-0b2bf128a5 | PR-32 | tickets-rendu | « $ » visible : t 800 𝑋 X 9 , 469 ÷ 9 ≈ 9 ÷ 9 , soit 1 9,469÷9≈9÷9, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 767 − 15 , 7 ≈ 800 − | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&n=10&s=6&s2=3&alea=revue-25-a&i=1&cd=1) |
| A-2de51cb96b | PR-32 | tickets-rendu | « $ » visible : t 100 𝑋 X 8 , 294 ÷ 8 ≈ 8 ÷ 8 , soit 1 8,294÷8≈8÷8, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$  | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&s=5&s2=3&alea=revue-18-a&i=1&cd=1) |
| A-50cca7dd4b | PR-32 | tickets-rendu | « $ » visible : it 10 𝑋 X 8 , 121 ÷ 8 ≈ 8 ÷ 8 , soit 1 8,121÷8≈8÷8, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 3 156 ÷ 3 ≈ 3 000 ÷  | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&s=5&s2=4&alea=revue-19-b&i=1&cd=1) |
| A-811bd20fdc | PR-32 | tickets-rendu | « $ » visible :  1000 𝑋 X 3 , 147 ÷ 3 ≈ 3 ÷ 3 , soit 1 3,147÷3≈3÷3, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 733 − 2 , 24 ≈ 700 − | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&n=10&s=6&s2=3&alea=revue-25-a&i=1&cd=1) |
| A-ac2ef9f6ec | PR-32 | tickets-rendu | « $ » visible : t 100 𝑋 X 7 , 113 ÷ 7 ≈ 7 ÷ 7 , soit 1 7,113÷7≈7÷7, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 7 353 ÷ 7 ≈ 7 000 ÷  | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&s=5&s2=5&alea=revue-20-b&i=1&cd=1) |
| A-c8215634ce | PR-32 | tickets-rendu | « $ » visible : oit 8 𝑋 X 3 , 499 ÷ 3 ≈ 3 ÷ 3 , soit 1 3,499÷3≈3÷3, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 881 − 42 , 5 ≈ 900 − (×2) | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&n=10&s=6&s2=3&alea=revue-25-a&i=1&cd=1) |
| A-cc142cc43c | PR-32 | tickets-rendu | « $ » visible : 40000 𝑋 X 9 , 147 ÷ 9 ≈ 9 ÷ 9 , soit 1 9,147÷9≈9÷9, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 25 , 4 + 934 ≈ 30 +  | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&s=6&s2=5&alea=revue-24-b&i=1&cd=1) |
| A-e23b9e5576 | PR-32 | tickets-rendu | « $ » visible : 000 100000 3 , 368 ÷ 3 ≈ 3 ÷ 3 , soit 1 3,368÷3≈3÷3, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$ 3 413 ÷ 3 ≈ 3 000 ÷  | [site](https://coopmaths.fr/alea/?uuid=843e5&id=PR-32&s=5&s2=2&alea=revue-17-b&i=1&cd=1) |
| A-9c68e7617d | TEC1-51 | tickets-rendu | « $ » visible : quent, on a 𝑍 ∈ 𝑅 Z∈R si et seulement si 𝑥 = 0 x=0, avec $z\neqi$. 𝑥 = 0 ⟺ 𝑥 = 0 x=0⟺x=0. Ainsi, les solutions sont | [site](https://coopmaths.fr/alea/?uuid=df2d2&id=TEC1-51&n=10&alea=revue-1-a&i=1&cd=1) |
| A-99afb7263d | TEG1-11 | tickets-rendu | nombre impair de $ : c la réponse est ${\color{#F15929}\boldsymbol{\textbf{oui}}}$.&lt;/li> &lt;/ol> (×6) | [site](https://coopmaths.fr/alea/?uuid=b1ba7&id=TEG1-11&s=3&s2=3&alea=revue-0-a&i=1&cd=1) |
| A-ba9bbdc128 | TEG1-11 | tickets-rendu | nombre impair de $ : c la réponse est ${\color{#F15929}\boldsymbol{\textbf{non}}}$.&lt;/li> &lt;/ol> (×4) | [site](https://coopmaths.fr/alea/?uuid=b1ba7&id=TEG1-11&s=1&s2=1&alea=revue-1-a&i=1&cd=1) |
| A-0386c14838 | TSA5-42 | tickets-rendu | « $ » visible :  ≈ 12 , 33 &lt; 25 u 1 ​ =ln(3×25+1)+8=ln(76)+8≈12,33&lt;25, donc $u_1Montrons par récurrence que, pour tout entier naturel 𝑛 | [site](https://coopmaths.fr/alea/?uuid=c7b07&id=TSA5-42&n=10&alea=revue-1-a&i=1&cd=1) |

## Autres tickets (un par exercice)

Constats sans cause commune repérée : un ticket par exercice.

| Clé | Exercice | Catégorie | Constat | Reproduire |
| --- | --- | --- | --- | --- |
| A-c2eed3e89e | 1A | tickets-interactif | cellule L1C3 absente | [site](https://coopmaths.fr/alea/?uuid=ce2ea&id=1A&s2=false&s3=true&alea=revue-3-b&i=1&cd=1) |
| L-c026cd48ae | 1A-F02-7 | tickets-rendu | Correction : la dernière ligne « $x>-3$ » est répétée deux fois dans le bloc aligné |  |
| L-a8a7b66c28 | 2F21-9 | tickets-rendu | Correction : « $g(0)=\dfrac{3}{5}\times +\dfrac{3}{2}$ » et « $g(4)=\dfrac{3}{5}\times +4 +\dfrac{3}{2}$ » : le facteur x est écrit avec ecritureAlgebrique (« +4 », valeur 0 vide)… |  |
| A-0148a8db23 | 2mTrigoFct-6 | tickets-interactif | Vérifié à la main (2mTrigoFct-6 revue-1-b sup=1 sup2=true sup3=1, 5 questions, question 2 : sin(x)=0) : « \{0;\pi\} », « \left\{0;\pi\right\} » et « 0;\pi » sont tous refusés, alo… (×66) | [site](https://coopmaths.fr/alea/?uuid=a7c64&id=2mTrigoFct-6&s=1&s2=true&s3=1&alea=revue-1-b&i=1&cd=1) |
| A-3a001d97c9 | 2mTrigoTri-6 | tickets-interactif | champ vide accepté (×5) | [site](https://coopmaths.fr/alea/?uuid=b7e2d&id=2mTrigoTri-6&s=1&alea=revue-1-a&i=1&cd=1) |
| A-9291748427 | 2N51-6 | tickets-interactif | Vérifié à la main (2N51-6 revue-3-a sup=4, 1 question : A = 6/(6+3√2)) : la forme la plus simple, « 2-\sqrt{2} », est refusée (« la réponse attendue est une fraction ») alors que … | [site](https://coopmaths.fr/alea/?uuid=4771d&id=2N51-6&s=4&alea=revue-3-a&i=1&cd=1) |
| L-208c938477 | 3AutoG03-3 | tickets-rendu | Énoncé : bloc &lt;style> .cols-responsive… inséré dans le texte de la question |  |
| A-c0f37bd00b | 3G13 | tickets-interactif | champ vide accepté (×3) | [site](https://coopmaths.fr/alea/?uuid=6f383&id=3G13&s=10&s2=2&s3=2&s4=false&alea=revue-29-a&i=1&cd=1) |
| A-4cdb7d1275 | 3G21 | tickets-rendu | .getElementById('M2D_0_Q0_t1').dataset.colorie == undefined \|\| (document.getElementById('M2D_0_Q0_t1 (×64) | [site](https://coopmaths.fr/alea/?uuid=3451c&id=3G21&s=1&s2=3&s3=3&alea=revue-0-a&i=1&cd=1) |
| A-5e22a612f3 | 3G21 | tickets-rendu | .getElementById('M2D_0_Q0_t1').dataset.colorie == undefined \|\| (document.getElementById('M2D_0_Q0_t1 (×3) |  |
| A-ae471e9a23 | 3I12-6 | tickets-interactif | champ absent de la page | [site](https://coopmaths.fr/alea/?uuid=eacaf&id=3I12-6&n=10&s=1&alea=revue-8-a&i=1&cd=1) |
| L-e1ff82ec9d | 3L13-0 | tickets-rendu | Correction : le texte de la question (avec le champ de saisie interactif et « La solution est : x= ») est recopié dans texteCorr, d'où un second champ MathLive (et id en double ch… |  |
| L-68352f69bc | 3L14DNB-1 | tickets-rendu | Correction : « En résultat1 : $-9 + 6 = …$ » : nom de variable interne (résultat1) affiché |  |
| A-77fb290222 | 3L15-2 | tickets-interactif | Vérifié à la main (3L15-2 revue-0-a sup=4, 3 questions, question 2 : 3x²-16=0) : la réponse attendue elle-même, « -\dfrac{4}{3}\sqrt{3};\dfrac{4}{3}\sqrt{3} », est refusée (« sépa… (×2) | [site](https://coopmaths.fr/alea/?uuid=0f844&id=3L15-2&s=4&alea=revue-0-a&i=1&cd=1) |
| A-3a27a6d702 | 3mLimCont-1 | tickets-interactif | Vérifié à la main (3mLimCont-1 revue-7-a sup=4 sup2=true sup3=true sup4=true, 3 questions, question 2 : lim en 4 de (x-4)/((x-2)(x-4)) = 1/2) : « \dfrac12 », « \frac{1}{2} » et « … (×13) | [site](https://coopmaths.fr/alea/?uuid=04b1e&id=3mLimCont-1&s=4&s2=true&s3=true&s4=true&alea=revue-7-a&i=1&cd=1) |
| L-24cfab44cb | 3Z1DNB-09 | tickets-rendu | La correction recopie le bloc &lt;style> .cols-responsive de l'énoncé (dupliqué) |  |
| L-d53e2ab69e | 4G15 | tickets-rendu | Correction : bouton d'animation (&lt;button class="ui mini compact button"… onclick=document.getElementById) en HTML brut avec classes « ui » (Semantic UI) hors charte MathALÉA |  |
| A-242a184f66 | 4G31 | tickets-rendu | .getElementById('M2D_0_Q0_t1').dataset.colorie == undefined \|\| (document.getElementById('M2D_0_Q0_t1 (×3) |  |
| A-c879c16457 | 4G31 | tickets-rendu | .getElementById('M2D_0_Q0_t1').dataset.colorie == undefined \|\| (document.getElementById('M2D_0_Q0_t1 (×28) | [site](https://coopmaths.fr/alea/?uuid=4dce8&id=4G31&s=1&s2=3&alea=revue-0-a&i=1&cd=1) |
| L-7b0b610170 | 4L14-2 | tickets-rendu | Énoncé : la valeur « x=9 » est proposée deux fois (« pour $x=9$, pour $x=5$ puis pour $x=9$ ») |  |
| L-bb6b4f3b4d | 5N1B-1 | tickets-rendu | Correction : « $39 \times 2 = $$⟦78⟧$ » deux $ collés ($$ vide) autour du résultat |  |
| A-1e5f636f08 | 5N1E-1 | tickets-interactif | Confirmé à la main (essayer.mjs 5N1E-1 revue-0-b sup=false sup2=false, 4 questions, question 3, cible 36) : « 3\times(4+9-8\div8) » est accepté, mais la première forme mise en évi… (×9) | [site](https://coopmaths.fr/alea/?uuid=3406a&id=5N1E-1&s=false&s2=false&alea=revue-0-b&i=1&cd=1) |
| A-d5387f5ee5 | 5N1G-2 | tickets-interactif | champ vide accepté (×21) | [site](https://coopmaths.fr/alea/?uuid=e2a95&id=5N1G-2&s=3&s2=false&alea=revue-0-a&i=1&cd=1) |
| A-3e48049e9d | 6A | tickets-rendu | v> &lt;/div> &lt;div id='cols-responsive2-s-undefined_0' style='min-width:300px;' > &lt;spa |  |
| A-f6fe7b8351 | 6A | tickets-rendu | -largeur1='60'> &lt;div id='cols-responsive1-s-undefined_0'style='min-width:500px;' > &lt;div |  |
| L-7d1817a91a | 6AutoN4-1 | tickets-interactif | « Multiplier par $0,001$ revient à diviser par … » : le choix de la liste a la valeur « 1 000 » (avec espace) alors que la réponse attendue est 1000 : la bonne réponse choisie par… |  |
| L-d04c66fdd3 | 6G5A-1 | tickets-interactif | Même défaut que 6G5A et 6M4C : des réponses fausses avec « +1 » sont acceptées dans les cases du tableau (82 cas I2) ; 108 pages > 390 px (le tableau de 6 colonnes dépasse l'écran… |  |
| L-2a495637ca | 6G7B-9 | tickets-interactif | Même défaut que 6M4C/6G5A : des réponses fausses avec « +1 » sont acceptées (18 I2) ; mise en évidence de la valeur sans unité refusée alors que l'unité est exigée (69 M1) ; « BG=… |  |
| L-e0e67258b3 | 6M1autoE-1 | tickets-rendu | Seul « a) » est en gras et en couleur, « b) » et « c) » sont en texte simple ; les figures (carré, rectangle, triangle) sont dans l'ordre inverse des questions (rectangle, carré, … |  |
| L-c18dcc897d | 6N0A-1 | tickets-interactif | Valeur maximale 1 (réglage permis, minimum 1) : randint(2, 1) donne des questions sans champ ni réponse. |  |
| L-7b6c68cf44 | 6N0B-1 | tickets-rendu | Double numérotation « 1. a) », « 2. b) » : numAlpha(i) ajouté à la numérotation de l'exercice. |  |
| L-8fd715629b | 6N2J-3 | tickets-interactif | Phrases négatives (« … n'est pas un diviseur de … », « n'est pas divisible par », « n'est pas un multiple de ») : seules deux combinaisons sont acceptées (16 ou 45 avec 734), alor… |  |
| L-8c7759d9dc | 6N3O | tickets-rendu | Thèmes à peu de pourcentages possibles (10 : 20, 40 ou 60 ; 13 : quatre valeurs) avec multiple et diviseur fixés : questionJamaisPosee échoue 50 fois et l'exercice rend 3 question… |  |
| A-fa4ca966b8 | 6N5-3 | tickets-interactif | champ vide accepté (×74) | [site](https://coopmaths.fr/alea/?uuid=7fb24&id=6N5-3&s=1&s2=1&s3=true&alea=revue-1-a&i=1&cd=1) |
| L-41f3a6c285 | 6N5-3 | tickets-interactif | Variantes à QCM dont aucune proposition n'est cochée dans la réponse attendue (cas « informations inutiles » ou problème insoluble) : le champ vide est accepté comme correct (I3 s… |  |
| L-b11e7384b5 | acbb6 | tickets-rendu | Identifiants « cols-responsive…-undefined » et bloc &lt;style> dans l'énoncé (52 X3, même défaut que 6N4A-1) ; « les élèves qui ont choisi la réponse D » lettre D non rappelée dans l… |  |
| L-c3a2dba4b3 | addd5 | tickets-rendu | Titre « Reconnaitre » (Reconnaître) ; correction : « Vous avez choisi : . » (la valeur choisie n'apparaît pas : phrase vide) ; vouvoiement « Vous avez choisi » seule occurrence ; … |  |
| L-44a50fc050 | afd39 | tickets-interactif | Titre « Questions de cours » trop vague ; réponse fausse acceptée (1 I2) ; énoncé « avec a&lt;b et a,b∈I » : $a, b\in I$ virgule sans espace fine ; 8 T5, 6 T6, 1 X2. |  |
| L-6590525758 | b1e01 | tickets-rendu | Tracé apigeom : « la demi-droite d'origine G passant par H » ; énoncé sur 3 lignes sans ponctuation entre (virgule, « et ») ; 2 X4 ; 2 IM : à tester à la main. |  |
| L-ff0010bb11 | c5503 | tickets-rendu | QCM interactif : consigne « Entoure la bonne réponse. » sans l'affirmation (les deux fractions manquent, présentes en non interactif) |  |
| L-30c25d446a | c8ee7 | tickets-rendu | QCM de droites : propositions = SVG en HTML échappé (« &lt;div class= »), 12 M3, 14 M6, X6 (figure illisible) ; « $(O⍽; \vec{\imath}, \vec{\jmath})$ » insécable ; correction sans … |  |
| L-34bfbc019d | can2a-2025C | tickets-rendu | Q24 : « Membre de gauche : $(-2)^2-\times (-2)$ » (ecritureAlgebriqueSauf1(-1) donne « - » suivi de \times) |  |
| L-4d47b078d9 | can2N4-02 | tickets-interactif | Confirmé avec revue/essayer.mjs : « 32 » refusé pour $5^{5}\times 0,4^{5}$ (attendu 32.00000000000001), « 1 » refusé pour $5^{4}\times 0,2^{4}$ |  |
| L-c46626bf01 | can3a-2022 | tickets-interactif | Q26 : quand b − a = 1 (ex. 6 et 7), $\sqrt{b^2-a^2}$ et $\sqrt{a+b}$ sont égales : la même proposition « $IJ=\sqrt{13}$ » apparaît deux fois (lignes 1008 à 1010 et 1064 à 1066). |  |
| L-2d62a90d84 | can5a-2020 | tickets-rendu | Q18 (conversion d'heures décimales) : en interactif, la correction reste « cas non traité » (texteCorr n'est écrit que dans la branche non interactive). |  |
| L-1bb6daa16b | can5a-CoopMaths | tickets-interactif | Q27 : l'énoncé dit « en ${b} h et 20 min », la réponse attendue est calculée pour 15 min (a×(b+0,25)) et la correction affiche « $60\times 1.5$ » (b+0,5, point décimal) : 60 km/h … |  |
| L-afc9071c93 | can6G1-01 | app-mobile | Aides de paramètres « 1 & 2 : … » non lues par decrireExercice : options manquantes dans l'éditeur de l'app |  |
| L-8316e40d02 | canc3C12 | tickets-interactif | Réponse négative possible (a jusqu'à 20, b×res dès 6 : « J'ajoute $20$, … j'obtiens $7$ » → $-6$) en CM1/CM2, avec le clavier clavierNumbers sans signe moins : l'élève ne peut pas… |  |
| L-aa4b9ee883 | canCE2a-2025 | tickets-rendu | Version non interactive : Q5 « Le triple de $23$ » et Q16 « Le triple de $25$ est : » s'arrêtent sans demande ni pointillés (énoncé incomplet hors interactif). |  |
| L-0631c32741 | cce0c | tickets-rendu | Exercice bêta : énoncé « patronEnT » (identifiant interne) et correction « Correction 1 de type 2 » sans contenu |  |
| L-30502c8207 | CM1N1E | tickets-rendu | 24 combinaisons de paramètres sur 71 ne génèrent aucune question (exemples : sup=3 sup2=6 sup3=7 ; sup=4 sup2=1 sup3=3 ; sup=5 sup2=1 sup3=4) : l'exercice reste vide (aucune boucl… |  |
| L-64c00c85a1 | CM2N1D-2 | tickets-interactif | Puissances de 10 en lettres (sup coché), type « Décomposer » : le champ est inséré à l'intérieur de la formule (`${ajouteChampTexteMathLive(…)}~unité+` dans $…$) : aucun champ n'a… |  |
| L-bc1c51bef6 | CM2N3G-1 | tickets-rendu | Cas « facteur manquant » (champ avant le produit) : l'énoncé affiche la fraction deux fois, « $\dfrac{99}{100}\times$ [champ] $\times\dfrac{99}{100}=\dfrac{990}{100}$ », alors que… |  |
| L-8d9f561042 | CM2N3G-2 | tickets-rendu | Cas « facteur manquant » (champ avant le produit) : l'énoncé affiche la fraction deux fois, « $\dfrac{99}{100}\times$ [champ] $\times\dfrac{99}{100}=\dfrac{990}{100}$ », alors que… |  |
| L-ca843deb17 | EN-Juniper-Green | app-mobile | Consigne : « Cliquer sur « Vérifier les réponses » arrête la partie en cours et affiche le score » : ce bouton est celui du site (l'app n'a pas de bouton « Vérifier les réponses »… |  |
| L-f77e3f5413 | ff4cc | tickets-rendu | Titre : « Calculer des sommes et des différences avec annee2 et annee1 » : noms de variables internes (annee1, annee2) affichés dans le titre |  |
| L-146a157b67 | jltht | tickets-rendu | Titre « Calculer des sommes avec annee » : nom de variable interne (annee) |  |
| L-6880daa09f | TEM1-22 | tickets-interactif | Même défaut (68 I2) ; consigne « Saisir la matrice à l'aide de la touche « Matrice » » : guillemets sans insécables (68 T4) ; AB=-9I_2 : calcul vérifié ; 8 pages > 390 px. |  |
| L-eb36418574 | TEM1-24 | tickets-interactif | Même défaut (136 I2) ; système (S) imbriqué \begin{cases}\begin{aligned}…\end{aligned}\end{cases} ; A, X, B en évidence en bloc. |  |
| L-d01c64fef8 | xbhcx | tickets-rendu | Énoncé : le tableau de proportionnalité s'affiche sous forme de texte brut « 3 ? 10 20 » (pas de tableau) ; titre terminé par une espace |  |
