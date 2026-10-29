# EVACOM 11LC, 11LS et TAF : couverture et lacunes

Ce bilan accompagne `evacom-revisions.json` (version 2 des trois parcours). Il repose sur l'archive `Archives EVACOM-20261028T185951Z-1-001.zip`. Les corrigés LC et LS des années 2019 à 2024 sont en grande partie numérisés en images ; une reconnaissance de texte a servi au repérage, puis les sujets lisibles et les champs ont servi à confirmer les familles de questions. La date du sujet TAF rangé dans « TAF 2021 » est bien 2020 sur sa couverture.

| Filière | Années présentes dans l'archive | Ceintures | Couverture interactive principale |
| --- | --- | ---: | --- |
| TAF | 2018, 2019, 2020 | 7 | Nombres, fractions, calcul et priorités, substitution, proportionnalité, pourcentages, conversions, figures planes, angles, Pythagore, volumes simples et reconnaissance de solides. |
| 11LC | Corrigés 2020, 2021, 2022 ; sujets 2018 à 2020 dans `Anciennes Evacom` | 7 | Fractions, puissances, notation scientifique, substitution, réduction, développement, équations, formules, Pythagore, aires et problèmes de grandeurs. |
| 11LS | Corrigés 2019 à 2025 ; sujets 2018 à 2020 dans `Anciennes Evacom` | 7 | Fractions, racines carrées, notation scientifique, calcul littéral, identités remarquables, factorisation simple, équations, formules, Pythagore, solides usuels et volumes. |

Chaque exercice est étiqueté avec le savoir-faire effectivement interrogé. Le seuil de 80 % commande l'ouverture de la ceinture suivante. Le pourcentage par objectif est affiché séparément, sans seuil de validation autonome dans le format JSON.

## Manques à combler dans MathALÉA

| Priorité | Filière | Savoir-faire observé dans les sujets | Couverture actuelle et exercice à créer |
| --- | --- | --- | --- |
| Partiel | 11LS | Calculer le volume ou l'aire extérieure d'un assemblage de solides, parfois avec une partie retirée (2019, 2022, 2025). | Le nouvel exercice `11GM2-3` (`8473d`, branche `feat-evacom-lacunes` du dépôt MathALÉA, pas encore fusionné) couvre le volume de cinq assemblages, par ajout ou retrait, décrits sans figure. Il reste à créer l'aire extérieure d'un assemblage et une version avec figure. |
| Couvert | 11LS | Factoriser au maximum un trinôme tel que $x^2+13x+40$ (2019 et 2025). | L'exercice `3L12-4` (`8cb63`, cas « somme-produit », réglé sans mise en évidence) est ajouté à la ceinture « Factoriser et résoudre ». Sa correction nomme la quatrième identité sans détailler la recherche des deux nombres : la fiche de la ceinture explique la méthode. |
| Haute | TAF | Tracer une parallèle ou une hauteur, compléter un patron, mesurer un angle avec un véritable instrument (2018 et 2020). | L'application entraîne le vocabulaire, le choix d'un patron de cube et la lecture d'un rapporteur intégré. Il manque une interaction de construction et une vérification du tracé. Prévoir une figure manipulable sur quadrillage, avec tolérance géométrique et étapes de correction. |
| Haute | 11LC et 11LS | Justifier qu'un triangle est rectangle ou non et rédiger une preuve algébrique ou géométrique (plusieurs années). | Le QCM ou la réponse courte vérifie la conclusion, pas la chaîne d'arguments. Créer des questions à étapes : choix du plus grand côté, deux calculs séparés, propriété applicable, conclusion rédigée à trous. |
| Moyenne | 11LS | Comparer, encadrer et calculer aussi avec des racines cubiques ; extraction d'entiers de racines cubiques (champs 2021). | Le parcours entraîne les racines carrées. Créer une famille cubique : cubes parfaits, encadrement entre deux entiers, produit de radicaux et écriture simplifiée. |
| Moyenne | 11LS | Reconnaître et dessiner les patrons de cône, cylindre et pyramide ; calculer l'aire de leurs faces (champs 2021, sujet 2025). | Le parcours reconnaît des solides et un patron de cube, puis calcule leurs volumes. Créer des patrons à choisir ou compléter et le calcul guidé des surfaces latérales et totales. |
| Moyenne | 11LC | Transformer une formule géométrique précise, notamment $A=bh/2$, et représenter une aire par une expression littérale (2019 à 2022). | Les exercices de transformation utilisent des contextes variés, parfois éloignés des figures d'EVACOM. Créer une famille paramétrée par figure, grandeur à isoler, présence de fractions et longueur manquante. |
| Moyenne | 11LC et TAF | Lire un graphique de deux tarifs, comparer des offres et expliquer le choix (TAF 2018 et 2019). | Les tableaux de proportionnalité et les problèmes de pourcentage entraînent une partie du raisonnement. Créer un graphique interactif avec lecture de deux valeurs, calcul d'un seuil et choix de l'offre la moins chère. |
| Moyenne | TAF et 11LC | Résoudre un problème de plusieurs étapes en expliquant les calculs et les unités (toutes années). | Les exercices de calcul contrôlent surtout le résultat. Créer des problèmes courts à étapes indépendantes : données utiles, opération, résultat avec unité, contrôle de plausibilité. |

## Paramètres et limites de la version 1

- Trois questions sont demandées pour chaque étape. Les 101 étapes ont produit 303 questions interactives avec chacune des deux graines testées, sans erreur de génération ni question non interactive. Les trois parcours ont été ouverts sur un écran de 390 px : fiche initiale, questions et bilan. Les questions ont été passées lors de ce contrôle d'interface ; une vérification avec de vraies réponses reste utile avant diffusion à une classe.
- La réciproque de Pythagore emploie un exercice classé en Suisse et un exercice interactif supplémentaire non classé en `fr-CH`. Le paramètre `sup2=true` nomme la contraposée dans la correction du premier.
- L'exercice de développement LC est réglé pour une seule variable, des coefficients entiers et un degré maximal de 1 dans chaque facteur : le produit est donc au plus du degré 2. En LS, le réglage par défaut mélange distributivité simple et double.
- La réduction d'une somme de racines LS emploie des valeurs adaptées au calcul mental (`sup2=true`). La mesure d'angle TAF présente un seul angle par question (`sup3=1`).
- Les fiches servent à reprendre la méthode avant l'entraînement. Elles ne valident pas seules la rédaction, le dessin ou l'usage d'un instrument.
- Nathan a autorisé l'emploi des exercices non classés en `fr-CH`. Le fichier contient `fb422` sur le complément à 100 % (TAF) et `5344c` sur la reconnaissance d'un triangle rectangle (LC et LS). Leur classement suisse est à proposer, sans bloquer leur emploi ici.
