# Parcours de révision EVACOM : journal de travail

## Périmètre demandé

- Source prioritaire : `/home/nathan/Documents/projets/Archives EVACOM-20261028T185951Z-1-001.zip`.
- Trois parcours importables, un pour chaque filière : 11LC, 11LS et TAF.
- Retenir les épreuves de 2018 à 2025 présentes dans l'archive. Écarter 2017.
- Organiser chaque parcours en ceintures progressives et fiches de remédiation courtes. Suivre les objectifs par exercice, séparément du seuil des ceintures.

## Inventaire initial de l'archive

- 11LC : corrigés des parties 1 et 2 pour 2020, 2021 et 2022. Les PDF sont des images ; leur texte est à reconnaître par OCR.
- 11LS : corrigés des parties 1 et 2 pour 2019 à 2025. Ceux de 2025 ont du texte sélectionnable ; la plupart des autres sont des images.
- TAF : épreuves et critères pour 2018, 2019 et 2020. Le dossier est nommé 2021, mais la couverture du sujet indique le mercredi 18 mars 2020.
- Complément à confronter avec l'archive : `Anciennes Evacom/EVACOM 2017-18`, `EVACOM 2018-19`, `EVACOM 2019-2020`, `EVACOM 20-21`, qui contiennent des épreuves 11LC et 11LS ainsi que les champs publiés.

## Travail réalisé

- Archive extraite dans `/tmp/evacom_archive` ; texte PDF dans `/tmp/evacom_archive_text`.
- OCR français des corrigés numérisés dans `/tmp/evacom_ocr`. Pour TAF, lecture des sujets 2018, 2019 et 2020. Pour 11LS, lecture des corrigés jusqu'en 2025. Pour 11LC, lecture des corrigés 2020 à 2022 et des sujets 2018 à 2020 conservés dans `Anciennes Evacom`.
- Les sujets lisibles de 2019 montrent notamment : fractions, puissances, calcul littéral, équations, Pythagore et aires en LC ; racines, notation scientifique, factorisation, équations, solides et volumes en LS.
- Les champs 2020-2021 distinguent les exigences par filière. Le champ n'est pas une preuve qu'une question a effectivement figuré dans une épreuve.
- `explorer/evacom-revisions.json` contient trois parcours indépendants, chacun avec sept ceintures, une fiche par ceinture et des objectifs étiquetés par exercice. Générateur reproductible : `explorer/evacom-gen.py` ; il lit les catalogues du dépôt MathALÉA voisin et reprend les paramètres éprouvés de `explorer/prequalifiant.json`.
- `explorer/evacom-manques.md` décrit les savoir-faire seulement partiellement entraînés et les exercices à créer.
- La version actuelle (2) contient 103 étapes et 52 objectifs : elle ajoute `3L12-4` (trinôme, somme et produit) à la ceinture 11LS « Factoriser et résoudre » et `11GM2-3` (volume d'un solide composé, nouvel exercice de la branche `feat-evacom-lacunes`, non fusionné) à « Solides et volumes ». Le générateur lit le catalogue du worktree `mathalea-evacom`, plus récent que celui du dépôt principal. Pour la version 1, deux graines ont produit 303 questions interactives chacune, sans erreur ni question non interactive ; la version 2 n'a pas été balayée de la même façon (les deux ajouts ont été générés et saisis séparément). Résultats bruts : `/tmp/evacom_smoke.jsonl` et `/tmp/evacom_smoke_b.jsonl`.
- Le schéma JSON et la lecture par `lireFichier` de l'application acceptent le fichier. `pnpm test` : 9 fichiers et 145 tests réussis. Une tentative de ceinture blanche a été menée dans l'interface mobile pour chaque filière, avec ouverture de la fiche et arrivée au bilan. Les questions ont été passées, sans réponse saisie.

## Repères de provenance pour reprendre

| Filière | Questions qui ont guidé les ceintures | Point de vigilance |
| --- | --- | --- |
| TAF | 2018 : calcul, conversions, patron, Pythagore, rabais, graphique de tarifs et angles. 2019 : fractions, nombres premiers, placement, cylindre, pourcentages, périmètre avec arc et mesures. 2020 : fractions, priorités, racine carrée, conversion et tracés. | Le dossier de l'archive nommé « TAF 2021 » contient en réalité le sujet daté 2020. |
| 11LC | 2019 : fractions, puissances, valeur numérique, expression d'aire, transformation de formule, équations, Pythagore et disque. Corrigés 2020 à 2022 : mêmes familles avec problèmes de partage, notation scientifique et comparaison de figures. | Les corrigés OCR donnent des intitulés fiables, mais certaines valeurs et formules manuscrites sont mal reconnues. |
| 11LS | 2019 : racines, scientifique, identités, factorisation, équations, preuve, volumes composés. 2022 à 2024 : mêmes familles et problèmes de surfaces ou solides assemblés. 2025 : racines et encadrements, calcul littéral, cônes, boules et triangle rectangle. | Les exercices de solides usuels ne remplacent pas les questions d'assemblage ni la rédaction des justifications. |

## Règles de couverture

- Un exercice MathALÉA doit entraîner le savoir-faire annoncé. Un prérequis révisé garde son propre objectif. Nathan autorise explicitement les exercices non classés en `fr-CH` ; conserver leur UUID et signaler le classement manquant.
- Les actions sur instrument, le dessin et la justification rédigée peuvent être seulement approchés sur mobile. Les signaler dans le bilan, même si un calcul connexe est entraîné.
- Dans chaque ceinture : plusieurs exercices interactifs et assez de questions réellement générées. Vérifier les paramètres `sup` à `sup4`, plusieurs graines et l'interface élève.
- Le passage d'une ceinture à l'autre dépend de son seuil. L'application affiche aussi un pourcentage par objectif, sans seuil autonome de validation dans le JSON.

## À faire pour reprendre

1. Avant diffusion à une classe, répondre réellement à quelques questions des trois filières dans l'interface mobile, y compris une réponse mathématique saisie et une question de figure. Vérifier le score et la liste des objectifs après la tentative.
2. Relire les fiches et les questions de la ceinture noire avec Nathan pour juger la charge de travail par tentative.
3. Pour modifier le JSON, changer `explorer/evacom-gen.py`, relancer `python3 explorer/evacom-gen.py`, puis répéter les contrôles moteur. Augmenter `version` des parcours déjà importés avant redistribution.

Ce journal est un état de travail, pas une couverture validée.
