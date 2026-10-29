# Revue des exercices : Suisse

Résumé intermédiaire produit par `node revue/degres.mjs` (revue en cours).
Exercices relus : **1168 sur 1168**. Constats confirmés : **475**.

Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.

| Nature | Constats |
| --- | ---: |
| Interactif faux (la bonne réponse est refusée, ou pas de champ) | 3 |
| Contenu mathématique faux | 19 |
| Rendu cassé (formule, débordement, erreur) | 64 |
| Mise en évidence (miseEnEvidence et champs) | 21 |
| Typographie (nombres, espaces, notations) | 38 |
| Rédaction (français, titres, consignes) | 330 |

## Interactif faux (la bonne réponse est refusée, ou pas de champ)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 9e17a | I1 Bonne réponse refusée | Interactif : seule la saisie « \mathbb{R}\backslash\{-2025\} » est acceptée ; « \setminus » et « \smallsetminus » (ceux de la correction) sont refusés | Accepter \setminus et \smallsetminus (réponse attendue \mathbb{R}\setminus\{…\}) | relecture |
| 16c6f | I1 Bonne réponse refusée | Interactif : la réponse attendue est une chaîne vide (this.reponse = ''), la valeur de la correction (3√2/2 + 3√2/2 i) est refusée ; consigne « forme trigonométrique algébrique » contradictoire, « sous  forme » deux espaces (le titre est « à partir de son expression trigonométrique ») | Renseigner this.reponse (forme algébrique) ; « sous forme algébrique » | src/exercices/can/Ex/canTEC2-06.ts:26,35 |
| afd39 | I2 Réponse fausse acceptée | Titre « Questions de cours » trop vague ; réponse fausse acceptée (1 I2) ; énoncé « avec a&lt;b et a,b∈I » : $a, b\in I$ virgule sans espace fine ; 8 T5, 6 T6, 1 X2. | Titre précis ; comparaison. | src/exercices/CH/afd39.ts |

## Contenu mathématique faux

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 29202 | C1 Contenu mathématique faux | Énoncé : le champ est libellé « f'(6)= » alors que la question porte sur f'(8) ; correction : « entre 6 et 6+h » alors que les calculs sont faits en 8 (valeur 6 codée en dur) | Utiliser la même valeur a dans les trois libellés | relecture |
| 448b5 | C1 Contenu mathématique faux | Correction : « Pour obtenir 2 025, on a ajouté 1 600 à 425 » raisonnement inversé (même défaut que 6fmcu) | On retranche 425 à 2 025 : 1 600 | relecture |
| 50ee5 | C1 Contenu mathématique faux | Correction : « x_M=(2+-4)/2 » signe +- au lieu de 2+(-4) | \dfrac{2+(-4)}{2} | relecture |
| 6fmcu | C1 Contenu mathématique faux | Correction : « Pour obtenir 2 026, on a ajouté 1 600 à 426 » : raisonnement inversé (on a soustrait 426 à 2 026 pour obtenir 1 600) | Pour trouver ce nombre, on commence par retrancher 426 à 2 026 : 1 600 | relecture |
| 7b6ee | C1 Contenu mathématique faux | Correction : « 2 025-(-20)=2 025+(--20) » double signe moins | 2\,025+20 | relecture |
| 82a41 | C1 Contenu mathématique faux | Correction : « 3² est positif (puissance paire d'un nombre négatif) » alors que 3 est positif ; titre « Calculer un prix après des évolutions successives » sans rapport | 3² est positif (puissance d'un nombre positif) ; titre cohérent | relecture |
| 9efa5 | C1 Contenu mathématique faux | Correction : A(-5;0) et B(0;2) → « \dfrac{2-0}{0-5}=\dfrac{2}{+5} » : x_A=-5 est écrit sans parenthèses (0-(-5)), le calcul affiché est faux ; « Son pente » | \dfrac{2-0}{0-(-5)}=\dfrac{2}{5} ; Sa pente | relecture |
| a01f3 | C1 Contenu mathématique faux | Titre « Trouver le plus grand nombre (QCM) » alors que la question est « Quel est le plus petit nombre ? » ; QCM à 2 propositions seulement ; bonne réponse non mise en évidence (10 M3). | Titre « le plus petit ». | src/exercices/CH/a01f3.ts |
| a309b | C1 Contenu mathématique faux | Exercice modèle laissé dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », question « Question 1 » (texte de remplissage) : à retirer de la liste ou de l'app (règle : aucun placeholder). | Retirer de la liste. | src/exercices/CH/a309b.ts |
| a343n | C1 Contenu mathématique faux | Titre « Multiplication par 100 de nombres décimaux » alors que l'exercice multiplie par 1 000 ; correction juste (3 400). | Titre « par 1 000 ». | src/exercices/CH/a343n.ts |
| aaaaa | C1 Contenu mathématique faux | Exercice modèle laissé dans le référentiel : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) » et question « 5+6 » (texte de remplissage) : à retirer (règle : aucun placeholder). | Retirer de la liste. | src/exercices/CH/aaaaa.ts |
| AchangerOBLIGATOIREMENT | C1 Contenu mathématique faux | Deuxième exercice modèle (id « AchangerOBLIGATOIREMENT ») : titre « Mettre le titre souhaité (assez descriptif mais pas trop long) », question « 5+6 », 2 X1 : à retirer de la liste (règle : aucun placeholder). | Retirer de la liste. | src/exercices/CH/AchangerOBLIGATOIREMENT.ts |
| addd5 | C1 Contenu mathématique faux | Titre « Reconnaitre » (Reconnaître) ; correction : « Vous avez choisi : . » (la valeur choisie n'apparaît pas : phrase vide) ; vouvoiement « Vous avez choisi » seule occurrence ; 2 M6. | Afficher la bonne expression ; reconnaître. | src/exercices/CH/addd5.ts |
| af0yk | C1 Contenu mathématique faux | Titre vide (« CH — ») : exercice sans titre ; énoncé juste (2 025). | Ajouter un titre. | src/exercices/CH/af0yk.ts |
| aModifier | C1 Contenu mathématique faux | Troisième exercice modèle (id « aModifier ») : titre « Nom de l'exercice », question « Question 1 de type 2 », correction « Correction 1 de type 2 » : texte de remplissage à retirer de la liste. | Retirer de la liste. | src/exercices/CH/aModifier.ts |
| bc570 | C1 Contenu mathématique faux | « Trouver un nombre inférieur à 100 et supérieur à 10, divisible par 2 et dont le chiffre des unités est 7 » : il n'en existe aucun ; l'énoncé demande de « trouver » un nombre alors que la réponse est « aucun » (champ numérique) ; 90 phrases sans virgule, 288 N1, 25 R10. | Reformuler (« existe-t-il… ? ») ; champ texte. | src/exercices/CH/bc570.ts |
| bcfc8 | C1 Contenu mathématique faux | Titre vide (« CH — ») ; énoncé « À quel nombre décimal est égal 2 025 centièmes ? » (« Quel nombre décimal est égal à… ») ; correction juste (20,25). | Ajouter un titre. | src/exercices/CH/bcfc8.ts |
| bd063 | C1 Contenu mathématique faux | Titre « Factoriser ou développer une différence de deux carrés » alors que l'exercice développe (6x−4)² (identité remarquable (a−b)², pas une différence de carrés) ; titre avec espace final ; QCM juste (36x²−48x+16). | Titre « Développer avec une identité remarquable ». | src/exercices/CH/bd063.ts |
| c9ba3 | C1 Contenu mathématique faux | Titre « Calculer le périmètre d'un rectangle » alors que la question porte sur la tangente d'un angle dans un triangle rectangle (titre copié de c9aa3) ; correction vide (12 X4). | Titre « Calculer une tangente » ; correction. | src/exercices/CH/c9ba3.ts |

## Rendu cassé (formule, débordement, erreur)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 31049 | X4  | Titre « Calculer avec un pourcentage » terminé par une espace alors que l'exercice porte sur un arbre de probabilités | Titre cohérent | relecture |
| 35553 | X4  | Titre « Effectuer un calcul avec des fractions » alors que l'exercice porte sur la probabilité d'un dé truqué ; terminé par une espace | Titre cohérent | relecture |
| 39232 | X4  | Titre « Compléter un tableau de variations (démo) » : mention interne « (démo) » visible | Retirer « (démo) » | relecture |
| 3a275 | X4  | Titre « Factoriser ou développer une différence de deux carrés » alors que l'exercice compare des fractions de numérateur 1 ; terminé par une espace | Titre cohérent | relecture |
| 3acd6 | X4  | Titre avec mention interne « (année de transition) » | Retirer | relecture |
| 3c098 | X4  | Titre « Développer une identité remarquable » alors que la question demande la solution de $9x+1=5x+9$ (même défaut que d7202, f43d1, daf1d : titres recopiés dans la série EAM) | Titre cohérent | relecture |
| 4c7ca | X4  | Correction vide (aucun texte de correction) | Ajouter la correction | relecture |
| 4ed52 | X3  | Énoncé : « undefined » devant le QCM ; correction : proposition mise en évidence « Il y a 7 fois 5 et il reste 2 » avec nombres hors $ et texte dans miseEnEvidence | Initialiser la question ; $7$ fois $5$ | relecture |
| 5b767 | X4  | Correction vide (aucun texte de correction) | Ajouter la correction | relecture |
| 884fe | X3  | Énoncé : « undefined » devant le QCM (aucune consigne) ; même défaut que 83789 et 4ed52 | Initialiser la question du qcm | relecture |
| c5503 | X4  | QCM interactif : consigne « Entoure la bonne réponse. » sans l'affirmation (les deux fractions manquent, présentes en non interactif) | Afficher l'affirmation dans la question QCM | relecture |
| c9893 | X4  | Correction vide (QCM notation scientifique) | Ajouter une correction | relecture |
| c9c44 | X4  | QCM « Ordre de grandeur » sans énoncé affiché | Ajouter la consigne | relecture |
| cce0c | X4  | Exercice bêta : énoncé « patronEnT » (identifiant interne) et correction « Correction 1 de type 2 » sans contenu | Texte réel ou exercice à retirer du référentiel | relecture |
| cd736 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| d631d | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| d7fe8 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| da2fc | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| e3045 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| f08fe | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| f9915 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| fgfq3 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| fhmbj | X4  | Titre « Question 22 » non descriptif (idem pour les autres « Question n ») | Titre sur le contenu | relecture |
| gk9zv | X4  | Titre « Question 24 » non descriptif ; réponses « OUI » / « NON » en majuscules ; ⟦colinéaires (OUI)⟧ texte en miseEnEvidence | Titre sur le contenu ; « oui » / « non » | relecture |
| hug50 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| jj1hp | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| m650d | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| mmqav | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| ncr2v | X4  | Titre vide ; énoncé « $251\,224 $ » espace avant $ de fermeture | Ajouter un titre ; $251\,224$ | relecture |
| qdfhv | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| qe7q9 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| rda48 | X4  | Titres « Question 26 » (rda48) et « Question 25 » (sbr6q) non descriptifs | Titres sur le contenu | relecture |
| ree46 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| t25p6 | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| ukg9g | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| x1fxq | X4  | Titre vide dans le référentiel | Ajouter un titre | relecture |
| jnapmep0 | X4  | Exercice modèle dans le référentiel : « Trouver un titre pertinent », énoncé « 2+3 » | Retirer du référentiel | src/exercices/ |
| jnapmep1 | X4  | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Consigne », « Question 1 de type 2 » | Retirer du référentiel | src/exercices/ |
| sebseb | X4  | Titre « Schemas en boite » (accents) ; énoncé « 28 bonbons » hors $ ; correction vide | « Schémas en boîte » ; $28$ ; ajouter une correction | src/exercices/ |
| testEEE | X4  | Exercice de test dans le référentiel : titre « Eric fait ses tests interactifs. », consigne (fraction égale, racine carrée du dénominateur) sans rapport avec la question « $-2(x-4)$ » | Retirer du référentiel | src/exercices/ |
| jltht | X4  | Titre « Calculer des sommes avec annee » : nom de variable interne (annee) | Titre avec l'année | src/exercices/can/ |
| 83789 | X3  | Énoncé : « undefined » devant le QCM (this.question += qcm.texte sans question initialisée) | this.question = qcm.texte | src/exercices/can/canc3a-CM1-2025/canc3a-CM1-2025-Q25.ts:52 |
| ff4cc | X4  | Titre : « Calculer des sommes et des différences avec annee2 et annee1 » : noms de variables internes (annee1, annee2) affichés dans le titre | Titre avec 2025 et 2026 ou formulation générique | src/exercices/can/canNY-2026/ |
| a1e38 | X4  | Exercice « Consulter la liste des patterns disponibles pour différents exercices » : outil de développeur/enseignant exposé dans l'app, énoncé de 15 606 nombres hors des $ (N1), 972 guillemets T4, 96 X4 (énoncé vide), « Pour le motif 43, il y a 87 soleils » (nombres hors $) : sans intérêt pour un élève. | Retirer des exercices proposés aux élèves. | src/exercices/CH/a1e38.ts |
| a343t | X2 Formule cassée | Énoncé : « $25$; $50$; $75$; $$ [champ] » : $$ vide (délimiteur de mode display sans formule) → 14 X2 ; correction « Ainsi, ? = 75+25 » avec « ? » non défini ; « Complète » ; 26 R2. | Remplacer $$ par $\dots$. | src/exercices/CH/a343t.ts |
| a9f31 | X4  | « Créer une animation de construction aux instruments (Instrumenpoche) » : outil d'enseignant (éditeur IEP) sans question ni correction (4 X4) : à retirer des exercices proposés aux élèves ; 2 pages > 390 px. | Retirer pour les élèves. | src/exercices/CH/a9f31.ts |
| a9f71 | X4  | « Produire un diagramme » : outil diagram-builder sans consigne (énoncé vide, 4 X4, 2 IM) ; à tester à la main. | Ajouter une consigne ; tester à la main. | src/exercices/CH/a9f71.ts |
| a9f82 | X4  | « Illustrer le crible d'Ératosthène » : outil d'illustration sans consigne ni correction (4 X4) ; non évaluable. | Retirer ou ajouter une consigne. | src/exercices/CH/a9f82.ts |
| a9f83 | X4  | « Créer un schéma en barre » : outil schema-en-barre sans consigne ni correction (20 X4) ; non évaluable. | Ajouter une consigne. | src/exercices/CH/a9f83.ts |
| acb80 | X1 Erreur | Pyramide à base triangulaire : 64 X1 (exécution interrompue du banc, à repasser), 160 M1 ; correction juste (V≈41 cm³) ; « arrondi au $\text{ cm}^3$ près » unité sans nombre ; 73 pages > 390 px. | Repasser le banc ; « à l'unité de cm³ près ». | src/exercices/CH/acb80.ts |
| acbb6 | X3  | Identifiants « cols-responsive…-undefined » et bloc &lt;style> dans l'énoncé (52 X3, même défaut que 6N4A-1) ; « les élèves qui ont choisi la réponse D » lettre D non rappelée dans la légende affichée ; « 20 élèves » hors des $. | Numéro d'exercice dans les id ; $20$. | src/exercices/CH/acbb6.ts |
| ad5f5 | X4  | « Tracer des droites graduées » : outil de dessin (figure seule, énoncé et correction vides, 98 X4) : n'est pas un exercice évaluable pour un élève. | Retirer pour les élèves ou ajouter consigne. | src/exercices/CH/ad5f5.ts |
| ad5f6 | X4  | « Construire des droites graduées avec zoom » : outil sans consigne ni correction (22 X4). | Idem. | src/exercices/CH/ad5f6.ts |
| ad5f7 | X4  | « Utiliser des grilles décimales » : outil sans consigne (28 X4). | Idem. | src/exercices/CH/ad5f7.ts |
| ad5f8 | X4  | « Fabriquer des pavages pour travailler les transformations » : outil sans consigne (28 X4). | Idem. | src/exercices/CH/ad5f8.ts |
| ae7c2 | X4  | QCM « Ordre de grandeur » dont l'énoncé est vide (14 X4) : seules les trois propositions 0,4 cm / 0,4 km / 0,4 m sont affichées, la phrase « Un terrain de foot est un rectangle… » n'apparaît que dans la correction : l'élève ne sait pas ce qu'on mesure. | Mettre la question dans l'énoncé. | src/exercices/CH/ae7c2.ts |
| b1e01 | X4  | Tracé apigeom : « la demi-droite d'origine G passant par H » ; énoncé sur 3 lignes sans ponctuation entre (virgule, « et ») ; 2 X4 ; 2 IM : à tester à la main. | Phrase complète ; tester à la main. | src/exercices/CH/b1e01.ts |
| b5324 | X3  | L'énoncé du QCM affiche littéralement « undefined » avant les propositions (23 X3 : texte de la question non défini) ; 10 M3. | Renseigner la question (« Quel est le résultat de 70·96 ? »). | src/exercices/CH/b5324.ts |
| b7773 | X4  | QCM probabilité « Sachant que toutes les boules ont la même… » : correction vide (12 X4, 12 M3). | Rédiger la correction (8+6+5=19 …). | src/exercices/CH/b7773.ts |
| b949c | X4  | QCM « Trouver la figure avec deux angles droits » sans énoncé (14 X4) : seules les cases « Figure 1 à 4 » sont affichées (les figures ne sont pas dans le texte) ; 70 N1. | Ajouter la consigne et les figures. | src/exercices/CH/b949c.ts |
| babybel | X4  | Exercice « TITRE » : titre de remplissage, figure apigeom sans consigne ni correction (24 X4, 12 IM) : exercice de test laissé dans la liste. | Retirer de la liste. | src/exercices/CH/babybel.ts |
| bc372 | X1 Erreur | « Simuler des lancers de dés » : le banc a échoué 3 fois (X1) : l'exercice n'a pas pu être passé ; à repasser et à tester à la main (simulation aléatoire). | Repasser le banc. | src/exercices/CH/bc372.ts |
| c9aa3 | X4  | QCM « Calculer le périmètre d'un rectangle » : correction vide (12 X4) ; propositions « $38\text{ mm}^2$ » vs « $38\text{ mm}$ » ; 12 M3. | Rédiger la correction. | src/exercices/CH/c9aa3.ts |
| f9261 | X4  | Exercice modèle dans le référentiel : titre « Nom de l'exercice », consigne « Calcule » sans point, énoncé « $11 + 5 $ » | Retirer du référentiel ou compléter | src/exercices/modèlesExos/21_parametrable.ts |

## Mise en évidence (miseEnEvidence et champs)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 10QCM-1 | M2 Unité en évidence | Correction : ⟦45⟧ ⟦minutes⟧ unité (mot) en miseEnEvidence séparée | miseEnEvidence(45) puis minutes hors mise en évidence | relecture |
| 5120f | M5 Texte en évidence | Consigne : « Sujet inspiré d'un exercice du sujet Bac Asie Juin 2021 » entouré de miseEnEvidence dans l'énoncé (mise en couleur injustifiée) ; titre terminé par un point ; « 10 lettres », « 4 voyelles » hors $ | texteEnCouleur ou texte simple ; $10$ | relecture |
| 6cc79 | M2 Unité en évidence | Correction : ⟦315\textbf{ m}^3⟧ unité en \textbf dans miseEnEvidence (champ attend 315 + unité) | Vérifier que la mise en évidence correspond au champ (unité incluse) | relecture |
| 90671 | M2 Unité en évidence | Correction : ⟦70\textbf{ km}⟧ unité en \textbf dans miseEnEvidence ; consigne « Coche » (tutoiement) alors que d'autres consignes disent « Cocher » | miseEnEvidence(70) + unité ; harmoniser | relecture |
| 92572 | M5 Texte en évidence | Correction : ⟦10\textbf{ est un diviseur de }90⟧ texte dans miseEnEvidence, et phrase différente de la bonne proposition « 90 est un multiple de 10. » | texteEnCouleurEtGras ; reprendre la proposition correcte | relecture |
| a2ac2 | M6  | Résolution graphique f(x)=k : correction « Il y en a 1 (tracé rouge en pointillés) » : couleur pour désigner un tracé ; 2 M6 ; 12 figures > 390 px. | Désigner par le nom du tracé. | src/exercices/CH/a2ac2.ts |
| a3870 | M1 Évidence refusée par le champ | Labyrinthe de multiples : 289 M1 (deux champs sortie / nombre de cases, ordre inverse de la correction : même défaut que 6N3autoD-2) ; 995 N1. | Même ordre champs/correction. | src/exercices/CH/a3870.ts |
| a55d2 | M3  | QCM à réponses multiples : correction sans l'ensemble des bonnes propositions en évidence (30 M3, 30 M6) ; 293 N1 ; réponses justes (2, 5, 10 ; 3 non : somme 28). | Évidence des propositions. | src/exercices/CH/a55d2.ts |
| a8c21 | M1 Évidence refusée par le champ | Encadrement : correction en trois évidences « $⟦9\,858,9⟧&lt;9\,858,⟦9⟧99&lt;⟦9\,859⟧$ » dont le chiffre « 9 » au milieu du nombre (évidence parasite, 33 M1) ; « au dixième: » sans espace avant les deux-points (42 T3) ; 208 « Choisir… ». | Deux évidences (borne inférieure, borne supérieure). | src/exercices/CH/a8c21.ts |
| ac571 | M1 Évidence refusée par le champ | « Donner une valeur approchée au dixième de cm pour l'un et au dixième de cm² pour l'autre » : unités exigées par les champs mais absentes des évidences (112 M1) ; « \approx31,416\text{ cm} » trois décimales alors que l'approximation demandée est au dixième ; « 2·5·π cm » unité dans le produit. | Unités dans l'évidence ; arrondir à 31,4. | src/exercices/CH/ac571.ts |
| ad8c8 | M1 Évidence refusée par le champ | Même défaut que acd4a (abscisse entière, grands nombres) : « A( [champ] ) » comme point du plan ; 29 M1 ; correction faite de figures sans texte. | Idem acd4a. | src/exercices/CH/ad8c8.ts |
| ae01d | M1 Évidence refusée par le champ | Équation x²−400=0 : correction « S={−20 ; 20} » en évidence refusée (3 M1 : accolades) ; « Solution(s) de l'équation » ; « soit −20 et 20 » en maths ; $\sqrt{400}$ non simplifié en premier. | Évidence sans accolades. | src/exercices/CH/ae01d.ts |
| aeca7 | M1 Évidence refusée par le champ | Clone de BP1AUTO091 : cube de 15 dm, unité cubique en évidence refusée (42 M1) ; 15 pages > 390 px. | Voir BP1AUTO091. | src/exercices/CH/aeca7.ts |
| b4e86 | M8 Évidences et champs | Doublon de TSG2-10 (coordonnées dans le repère du cube) : 36 M8, 12 M1 ; « $C(⟦1~⟧;~⟦1~⟧;~⟦1⟧)$ » insécable dans l'évidence. | Fusionner avec TSG2-10. | src/exercices/CH/b4e86.ts |
| b6250 | M7  | Diagramme circulaire de vols : 36 M7, 12 M6 (corrections en figures) ; « l'angle rouge apparaît 3 fois » (3 hors des $) ; 24 phrases sans virgule. | Texte de correction. | src/exercices/CH/b6250.ts |
| b6cbe | M1 Évidence refusée par le champ | Clone de acb80 (pyramide, volume) : unité cubique en évidence refusée (90 M1) ; 44 pages > 390 px ; calcul juste (12 dm³). | Voir acb80. | src/exercices/CH/b6cbe.ts |
| b7662 | M1 Évidence refusée par le champ | Quartiles lus sur graphique : « serait acceptée toute valeur entre … » phrase de tolérance affichée à l'élève dans la correction ; 34 N2 ; 9 M1. | Reformuler. | src/exercices/CH/b7662.ts |
| b9a52 | M3  | « Justifier que deux triangles sont égaux » : QCM sans la justification demandée (le titre promet une justification, l'exercice est un QCM) ; 58 M3. | Titre « Reconnaître des triangles égaux ». | src/exercices/CH/b9a52.ts |
| bd726 | M6  | Exercice « relier-etiquettes » sans énoncé (14 X4) ; correction « 3+4=7 ; 7+2=9 ; 9+2=11 » ; à tester à la main (14 IM). | Ajouter la consigne. | src/exercices/CH/bd726.ts |
| c6fb2 | M1 Évidence refusée par le champ | Clone de 6M2C / BP2AutoV3 (aire du carré, unité d'aire attendue) : unité absente de l'évidence (16 M1). | Voir 6M2C. | src/exercices/CH/c6fb2.ts |
| c8ee7 | M3  | QCM de droites : propositions = SVG en HTML échappé (« &lt;div class= »), 12 M3, 14 M6, X6 (figure illisible) ; « $(O⍽; \vec{\imath}, \vec{\jmath})$ » insécable ; correction sans la proposition. | Alt-text aux SVG ; évidence. | src/exercices/CH/c8ee7.ts |

## Typographie (nombres, espaces, notations)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 01607 | N1 Nombre hors $ | Énoncé : « carré ABCD de côté 4 » nombre hors $ (aussi 02d8w : « 9 boules rouges… ») | $4$ | relecture |
| 065cf | N1 Nombre hors $ | Énoncé : « 40° » hors $ | $40^\circ$ | relecture |
| 0a113 | T2  | Énoncé : « $1,75$€ » et « $13,91$€ » sans espace avant € ; « 5 pains », « 4 tartelettes » hors $ | $1,75$ € ; $5$ pains | relecture |
| 10QCM-18 | T6 Points de suspension | Correction : « 0,0.... 0 » points de suspension écrits avec des points | \ldots | relecture |
| 10QCM-43 | T5 Espaces | QCM : « 4 \,\% » espace avant la fine insécable (espace superflue) ; correction « 10\, \% » | 10\,\% | relecture |
| 11QCM-14 | T3  | Correction : intervalle « ]0\,;+\infty[ » espace fine d'un seul côté du point-virgule | ]0\,;\,+\infty[ | relecture |
| 11QCM-18 | T3  | Énoncé : « est égale $…$? » point d'interrogation sans espace insécable | $…$⍽? | relecture |
| 1474f | T2  | Énoncé et correction : « $3$€ », « $2$€ » sans espace avant € ; tutoiement (« Tu dois ») | $3$ € | relecture |
| 19b3f | N1 Nombre hors $ | Consigne : le texte « Quatre cent soixante-dix » est écrit dans $\textit{…}$ (texte en mode maths) | Texte hors $ avec texteEnCouleur/italique | relecture |
| 1b8d1 | N1 Nombre hors $ | Correction : « Pour tout entier n strictement positif » n hors $ ; e^{-n} (e italique) dans 1b8d0 au lieu de \mathrm{e} | $n$ ; \mathrm{e} | relecture |
| 1mQCM-22 | N1 Nombre hors $ | Correction : « égal à 0 » zéro hors $ | $0$ | relecture |
| 2mLogExp-11 | T2  | Correction : $\textbf{Domaine :}$ texte gras dans un environnement mathématique (aussi uuid 2mLogExp-12 « rvjcl » non hexadécimal) | texteGras hors maths | relecture |
| 46bae | N1 Nombre hors $ | Énoncé : « ici 35 », « 28 » nombres hors $ | $35$ | relecture |
| 47u56 | T3  | Énoncé : « du triangle $ABC$? » sans espace insécable avant ? ; correction de 47d56 réduite à « Une translation » sans justification | ⍽? | relecture |
| 4f2a3 | T3  | Énoncé : « $A\left(5\,800\right).$ » point final dans les maths | Point hors $ | relecture |
| 4mProbStat-9 | T6 Points de suspension | Tableau : cellule inconnue « $....$ » au lieu de \ldots ou ? | \ldots | relecture |
| 4pvxi | T2  | Énoncé et correction : durées écrites de deux façons ($20\text{h}26\text{min}$ puis $1$ h $46$ min) | Uniformiser les durées | relecture |
| 54140 | N1 Nombre hors $ | Énoncé : « inférieur à 100 et supérieur à 10 » nombres hors $ | $100$ et $10$ | relecture |
| 5b60d | N1 Nombre hors $ | Énoncé : « par 89 », « 81 479=88$\cdot$925 $+$ 79 » nombres hors $ et équation coupée en morceaux de $ (opérateurs seuls dans $) | $81\,479=88\cdot925+79$ | relecture |
| 5c854 | T3  | Correction : « J'ai donné: » sans espace insécable avant les deux-points | donné⍽: | relecture |
| 5e90f | N1 Nombre hors $ | Énoncé et correction : « 8 boules », « 7 boules », « 7 tirages », « 7-uplets » nombres hors $ ; ensemble « {1;2;....;8} » points de suspension mal écrits | $8$ boules… ; \ldots | relecture |
| 65bd7 | T5 Espaces | Énoncé : « $BG=4,7\ \text{cm}$ . » espace avant le point final | Retirer l'espace | relecture |
| 691a7 | N1 Nombre hors $ | Énoncé : « dé à 6 faces 10 000 fois » nombres hors $ | $6$ faces $10\,000$ fois | relecture |
| 6ca15 | T3  | Énoncé : « 2 024 · 3 » année écrite avec espace fine des milliers (les années s'écrivent 2024) ; titre « CAN Spéciale année 2024 » | Écrire 2024 sans espace | relecture |
| 6fdab | T3  | Énoncé : « Tracer $[FG$], $[GH$) et $(HF$). » crochets et parenthèses fermants hors des $ | $[FG]$, $[GH)$ et $(HF)$ | relecture |
| 72e9d | T3  | Énoncé : « en grammes? » sans espace insécable avant ? ; « une étoile en gramme » (grammes) | en grammes⍽? ; en grammes | relecture |
| 76230 | T4  | Énoncé : «Pile» sans espaces insécables ; nombres de boules (1, 2, 3) hors $ | « Pile » ; $1$ boule bleue… | relecture |
| 83800 | T3  | Correction : $[f(x)=a(x-\alpha)^2+\beta]$ crochets au lieu de \[ \] | \[ … \] | relecture |
| 88021 | N1 Nombre hors $ | Énoncé et correction : « 5 amis », « 12 jours », « 38 et 30 » nombres hors $ | Mettre les nombres entre $ | relecture |
| 8802x | N1 Nombre hors $ | Énoncé : « 15 pirates », « 149 pièces d'or » nombres hors $ | $15$ pirates | relecture |
| 88488 | N1 Nombre hors $ | Énoncé : « 19 fois » hors $ ; correction : « n= 19 » espace et 19 hors maths, « p=0,4.$ » point dans les maths | $19$ fois ; n=19 ; $p=0,4$. | relecture |
| 88a60 | N1 Nombre hors $ | Titre « Numeration » sans accent ; énoncé « entre 128 et 200 », « dizaines est 2 » nombres hors $ (aussi 85dfc : « point 22 ») | Numération ; $128$ | relecture |
| 8ac2d | T3  | Énoncé : « $355 -11 =$ » espace avant le moins et pas après | $355-11=$ | relecture |
| 90fd5 | T3  | Énoncé et correction : « triangle BEC », « la droite (CE) » sans $ ; « un sommet , » espace avant la virgule | $BEC$ ; $(CE)$ ; sommet, | relecture |
| 9e8ae | T5 Espaces | Titre terminé par un point ; « ... » au lieu de \ldots (aussi 9af48 : espaces parasites « $ 7,99+5,8$ ») | Retirer le point ; \ldots | relecture |
| a3f3b | T6 Points de suspension | « $0,3\text{ L}=0,3\cdot1\,000\text{ cm}^3$ » \cdot CH conforme ; 11 T6 (« Choisir… ») ; correction juste. | RAS. | src/exercices/CH/a3f3b.ts |
| ae872 | T4  | Clone de BP1SP02 (134 T4, 23 phrases sans virgule) ; « Nombre de femmes employées » en \text dans une fraction ; effectifs identiques. | Fusionner avec BP1SP02. | src/exercices/CH/ae872.ts |
| b2b79 | T4  | 138 T4 : guillemets « face » sans insécables ; « pile , » espace avant virgule ; \text{Nombre de « face »} dans une fraction ; calcul juste (5/12). | Insécables ; fréquence 5/12. | src/exercices/CH/b2b79.ts |

## Rédaction (français, titres, consignes)

| Exercice | Règle | Constat | Correction proposée | Fichier |
| --- | --- | --- | --- | --- |
| 0ff6a | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 10QCM-15 | R1 Titre | Titre : espaces en trop, astérisque ou point final : « . » (balayage automatique) | nettoyer le titre |  |
| 11QCM-77 | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 1972e | R10 Français | Mot répété : « le le » (balayage automatique) | supprimer le doublon |  |
| 1mQCM-2 | R10 Français | Coquille : « coeffcient » (balayage automatique) | corriger la coquille |  |
| 2102b | R1 Titre | Titre : espaces en trop, astérisque ou point final : «    » (balayage automatique) | nettoyer le titre |  |
| 2mIneq-13 | R1 Titre | Titre : espaces en trop, astérisque ou point final : «    » (balayage automatique) | nettoyer le titre |  |
| 3a64e | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 49275 | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 5120f | R1 Titre | Titre : espaces en trop, astérisque ou point final : « . » (balayage automatique) | nettoyer le titre |  |
| 5e11f | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 6ca15 | R10 Français | Coquille : « coeffcient » (balayage automatique) | corriger la coquille |  |
| 6e534 | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 9b70b | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 9QCM-2 | R1 Titre | Titre : espaces en trop, astérisque ou point final : « . » (balayage automatique) | nettoyer le titre |  |
| bc570 | R10 Français | Mot répété : « par par » (balayage automatique) | supprimer le doublon |  |
| brlw7 | R10 Français | Accord : « pente » est féminin : « ce pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| c8ee7 | R10 Français | Accord : « pente » est féminin : « Le pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| psq07 | R10 Français | Accord : « pente » est féminin : « Son pente » (balayage automatique) | la pente, sa pente, donnée, égale |  |
| 0021e | R1 Titre | Titre : « dixèmes » (dixièmes) | dixièmes | relecture |
| 046ba | R10 Français | Correction : « on multiplie le volume visible par par 5 » (doublon) | par | relecture |
| 05b52 | R10 Français | Consigne : « …la représentation graphique.` » accent grave parasite en fin de phrase | Supprimer le caractère parasite | relecture |
| 0ff6a | R1 Titre | Titre « Tracer une droite à partir de son équation » mais l'exercice (QCM) demande de lire l'équation d'une droite représentée | Titre cohérent avec la variante QCM | relecture |
| 10NO3D-11 | R12  | Proposition du QCM « N=125\times 15^{2} » avec \times alors que l'énoncé et la correction (version CH) utilisent \cdot | \cdot dans les propositions | relecture |
| 10QCM-47 | R10 Français | Énoncé : « connait » (connaît) | connaît | relecture |
| 11FA2A-6 | R10 Français | Correction : « Dans une 1 heure, il y a » (Dans 1 heure) | Dans $1$ heure | relecture |
| 11FA4E-2 | R10 Français | Énoncé : « Le périmètre P d'un rectangle est donnée » (donné) | est donné | relecture |
| 11QCM-5 | R1 Titre | Énoncé et correction : « Le pente m » (La pente) ; titre « coefficient directeur » mais texte « pente » | La pente | relecture |
| 11QCM-80 | R1 Titre | Énoncé et correction : « Le pente m … est égal » (La pente … est égale) ; titre « coefficient directeur » (même défaut que 11QCM-5) | La pente … égale | relecture |
| 1380f | R1 Titre | Titre contenant « (ancien exercice) » (comme 25143) | Retirer la mention ou l'exercice | relecture |
| 18559 | R1 Titre | Titre : « … le chiffre des unités devienne le chiffre des ... ? » titre inachevé avec « ... » et espace avant ? | Titre complet | relecture |
| 1a8c6 | R1 Titre | Titre « Développer une identité remarquable » mais l'exercice calcule une moyenne pondérée ; « devoir coefficienté » (coefficient) | Titre : Calculer une moyenne pondérée | relecture |
| 1b8d4 | R10 Français | Correction : « forme indeterminée » (indéterminée) | forme indéterminée | relecture |
| 1b8d5 | R10 Français | Correction : « forme indeterminée » (indéterminée) | forme indéterminée | relecture |
| 1b8d6 | R10 Français | Correction : « forme indeterminée » (indéterminée) | forme indéterminée | relecture |
| 1bb30 | R1 Titre | Titre « à partir de deux points » mais l'énoncé donne un point et un vecteur normal (doublon CH de 1G21-1) | Titre cohérent | relecture |
| 1eb36 | R1 Titre | Exercice modèle exposé : titre « Nom de l'exercice », consigne « consigne » | Compléter le titre et la consigne ou retirer l'exercice du référentiel | relecture |
| 1ho0q | R10 Français | Correction : « Le total des coefficents » (coefficients) | coefficients | relecture |
| 1mCL4-2 | R10 Français | Consigne : « Résoudre $\mathbb{R}$ les équations » (manque « dans ») | Résoudre, dans $\mathbb{R}$, | relecture |
| 1mF3-16 | R1 Titre | Titre « Trouver l'extremum à partir d'une forme canonique » mais l'exercice demande l'axe de symétrie de la parabole (forme développée) | Titre : Déterminer l'axe de symétrie d'une parabole | relecture |
| 225c1 | R12  | QCM : propositions « 4\times 5 » (\times) alors que la correction de la même version CH écrit « 4\cdot 5 » (même défaut que 10NO3D-11) | \cdot dans les propositions pour la Suisse | relecture |
| 23241 | R1 Titre | Titre : « probabilté » (probabilité) | probabilité | relecture |
| 23b3e | R1 Titre | Titre « Déterminer un encadrement avec la fonction carré » mais l'exercice demande l'écriture décimale de 7,2·10^{-4} | Titre cohérent | relecture |
| 25143 | R1 Titre | Titre contenant « (ancien exercice) » visible dans le référentiel | Retirer la mention ou retirer l'exercice du référentiel | relecture |
| 26434 | R1 Titre | Titre « Effectuer un calcul avec des fractions » mais l'exercice porte sur un pourcentage d'élèves | Titre : Calculer un pourcentage | relecture |
| 29957 | R10 Français | Exercice de test « Test MultiMathfield » exposé dans le référentiel | Retirer du référentiel | relecture |
| 2cdd4 | R1 Titre | Titre « (QCM) » sans intitulé ; correction : « 170 \textbf{ cm} » texte gras dans miseEnEvidence ; consigne « Entoure » (tutoiement) | Renseigner le titre | relecture |
| 2guhi | R1 Titre | Titre « Trouver un inverse ou un opposé » mais l'exercice demande la valeur décimale de 2 026 + 1/2 | Titre : Convertir une somme avec une fraction en écriture décimale | relecture |
| 2mEqCar-1 | R10 Français | Énoncé : « du cercle de rayon 9 est de centre » (et) ; 9 hors $ | rayon $9$ et de centre | relecture |
| 2mEqCar-3 | R1 Titre | uuid « asdea » non hexadécimal (valeur de saisie au clavier) | Vrai uuid | relecture |
| 2mFctPoly1-1 | R10 Français | Correction : « à l'aide du critères des racines rationnelles » (du critère) ; polynômes « 5 x^3-23 x^2 + 27 x-9 » avec espaces irréguliers | du critère ; écriture normalisée | relecture |
| 2mFctRat-1 | R1 Titre | Titre : « homographiquee » (homographique) ; uuid « 2rgct » non hexadécimal | homographique | relecture |
| 2mLogExp-7 | R12  | Correction : \text{e}^{rn} (e droit en \text) au lieu de \mathrm{e} | \mathrm{e} | relecture |
| 2mLogExp-8 | R1 Titre | Titre : « croissance  et » deux espaces | Un espace | relecture |
| 2mLogExp-9 | R1 Titre | uuid « 2l9cb » non hexadécimal (aussi 2mLogExp-10 « 2l10e ») | Vrai uuid | relecture |
| 317bd | R1 Titre | Titre « Calculer la longueur d'un segment par comparaison » mais l'exercice porte sur un prix (proportionnalité) | Titre : Calculer un prix par comparaison | relecture |
| 34aa9 | R5 Virgule | Énoncé : « Dans 30 combien de fois 5 ? » (virgule et verbe manquants) | Dans $30$, combien de fois $5$ y a-t-il ? | relecture |
| 35e0b | R10 Français | Énoncé : « Les valeurs d'angle seront arrondis » (arrondies) ; même énoncé que 2G11-3 | seront arrondies | relecture |
| 365f4 | R10 Français | Correction : la solution est donnée comme $\sqrt{2\,025}$ sans la calculer (45) alors que la saisie 45 est acceptée | Conclure avec $45$ | relecture |
| 37e37 | R10 Français | Correction : « n'est pas un paraléllogramme particulier » (parallélogramme) et phrase entière dans miseEnEvidence | parallélogramme ; texteEnCouleurEtGras | relecture |
| 3a071 | R1 Titre | Énoncé et correction : « 50 fois », « $n=$ 50 » : nombre hors $ | $50$ | relecture |
| 3a384 | R1 Titre | Correction : « 6 adhérents parmi 38 » hors $ ; « Conseil d'Administration » (majuscule) | $6$, $38$ ; « conseil d'administration » | relecture |
| 3c2cb | R16  | Titre « Convertir kg &lt;--> g (QCM) » flèche ASCII ; consigne tutoyée « Coche la bonne réponse. » | « Convertir des kg et des g » ; infinitif | relecture |
| 3cde4 | R10 Français | Énoncé : « à 2 025 pout obtenir » (pour) | pour | relecture |
| 3wv4j | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 3wx9f | R1 Titre | Titre « Question 24 » (titre de CAN/test, pas un intitulé d'exercice) | Renseigner le titre | relecture |
| 41d8d | R1 Titre | Titre : « Effetuer » (Effectuer) | Effectuer | relecture |
| 43cd9 | R1 Titre | Titre : « dixèmes/centièmes » (dixièmes), même faute que 0021e | dixièmes | relecture |
| 446ba | R1 Titre | Titre vide dans le référentiel (aussi 603f6) | Renseigner le titre | relecture |
| 45d05 | R1 Titre | Titre : « Calculer Le volume » majuscule à Le | Calculer le volume | relecture |
| 45dad | R10 Français | Énoncé : « Combien de fois 1/4 d'unité dans 1 unité ? » verbe manquant | Combien de fois $\dfrac14$ d'unité y a-t-il dans $1$ unité ? | relecture |
| 471c3 | R1 Titre | Titre tronqué : « Exprimer en fonction de » (de quoi ?) | Titre complet | relecture |
| 47d36 | R10 Français | Correction : « le prix d'un papayes » (d'une papaye) ; « 3 papayes » hors $ | le prix d'une papaye | relecture |
| 47f36 | R1 Titre | Titre : « Aumentation » (Augmentation) ; énoncé « 280 € » hors $ | Augmentation | relecture |
| 47v56 | R10 Français | Énoncé : « Quelle est lle volume » (le volume ; coquille et accord) ; correction \frac au lieu de \dfrac | Quel est le volume | relecture |
| 4af87 | R10 Français | Correction : « soustraire -2 des deux membres » (tournure maladroite) | ajouter $2$ aux deux membres | relecture |
| 4c0a8 | R1 Titre | Titre : « ECalculer un rendu de monnaie » (Calculer) ; énoncé « billet de $5$ euros » après « $1,50$ € » (euros/€ mélangés) | Calculer ; € partout | relecture |
| 4e684 | R1 Titre | Titre : « valeurs remarquables  du » deux espaces | Un espace | relecture |
| 4ih30 | R1 Titre | Titre « Calculer le périmètre d'un rectangle » mais l'exercice est un rendu de monnaie | Titre : Calculer un rendu de monnaie | relecture |
| 4mProbStat-11 | R1 Titre | Énoncé : « club du 3ème age » (3e âge) ; titre « l'union et l'intersection  de » deux espaces | 3e âge | relecture |
| 4mProbStat-8 | R1 Titre | Titre : « coefficcient » (coefficient) | coefficient | relecture |
| 4r5kj | R1 Titre | Titre « Question 12 » (titre de CAN/test, pas un intitulé) | Renseigner le titre | relecture |
| 4vfug | R10 Français | Correction : « L'préimage est la solution » (La préimage) | La préimage | relecture |
| 51fac | R10 Français | Énoncé : « La moitié de 100 » sans verbe ni consigne (que faut-il faire ?) | Calculer la moitié de $100$. | relecture |
| 5494d | R1 Titre | Titre « Calculer une dérivée » mais l'exercice porte sur l'orthogonalité de deux vecteurs | Titre cohérent | relecture |
| 565f3 | R1 Titre | Titre « Convertir des heures en heures/minutes » mais l'exercice convertit des minutes en heures et minutes | Titre cohérent | relecture |
| 56772 | R10 Français | Correction b : « 83·9·1 000 = 83·9·1 000 = 747·1 000 » étape répétée | Supprimer le doublon | relecture |
| 5ab89 | R1 Titre | Titre : « astucieusment » (astucieusement) | astucieusement | relecture |
| 5aece | R1 Titre | Titre « Enlever une centaine » alors que l'énoncé demande d'enlever une dizaine | Titre : Enlever une dizaine | relecture |
| 5b0ab | R10 Français | Correction : « son pente est égal à » (sa pente est égale) | sa pente est égale | relecture |
| 5e041 | R10 Français | Correction : « La figure A est composé de » (composée) | composée | relecture |
| 5fe2c | R10 Français | Énoncé : « Quel est la pente » (Quelle est) ; correction : « coeffcient » (coefficient) | Quelle ; coefficient | relecture |
| 603f6 | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 61geo | R1 Titre | Titre vide dans le référentiel (même énoncé que 6c365, année 2025) | Renseigner le titre | relecture |
| 63ec7 | R1 Titre | Titre « Trouver la moitié d'un nombre » mais l'exercice porte sur les pattes de vaches (multiplication) | Titre cohérent | relecture |
| 667d9 | R12  | Correction : « \int_{0}^{5}f(x).dx » point au lieu de \,\mathrm{d}x | \int_0^5 f(x)\,\mathrm{d}x | relecture |
| 67a5b | R1 Titre | Titre « Résoudre une équation graphiquement » mais la correction traite une inéquation | Résoudre une inéquation graphiquement | relecture |
| 67e15 | R1 Titre | Titre « Titre à modifier » (placeholder exposé) | Renseigner le titre (Calculer une image par une fonction affine) | relecture |
| 6a336 | R12  | Énoncé : « (d_3)//(d_2) » barres obliques au lieu de \parallel | (d_3)\parallel(d_2) | relecture |
| 6c365 | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 6d56a | R1 Titre | Titre « Calculer une dérivée » mais l'exercice demande de simplifier (e^x+3)(e^x-3) | Titre : Simplifier une expression avec des exponentielles | relecture |
| 6dff5 | R1 Titre | Titre « Développer une identité remarquable » mais l'exercice porte sur un pourcentage (élèves externes) | Titre : Calculer un pourcentage d'une quantité | relecture |
| 6e82d | R10 Français | Correction : « comme axe de symétries » (symétrie) | axe de symétrie | relecture |
| 7057b | R10 Français | Énoncé : « évènements » alors que d'autres exercices écrivent « événements » (orthographe non uniformisée) | Uniformiser | relecture |
| 71b1f | R1 Titre | Titre : « Mltiplier astucieusement » (Multiplier) | Multiplier | relecture |
| 7522d | R10 Français | Énoncé : « figure d'aire 5 unités d'aire (ua) » répétition | figure d'aire $5$ ua | relecture |
| 75f89 | R1 Titre | Titre : « Générer dees pyramides » (des) | Générer des pyramides | relecture |
| 76efb | R1 Titre | Titre : « Numeration » sans accent | Numération | relecture |
| 77432 | R1 Titre | Titre vide dans le référentiel (aucun intitulé affiché) | Renseigner le titre (ex. Calculer la moyenne d'une série) | relecture |
| 77d18 | R10 Français | Exercice inutilisable exposé : « Cet exercice n'a pas pu être conservé pour des raisons techniques. Vous trouverez dans la section 3F1 ne nombreux exercices… » (coquille « ne nombreux »), aucune question | Retirer l'exercice du référentiel ou corriger « de nombreux » | relecture |
| 784a7 | R10 Français | Correction : « Un parallélogramme est un quadrilatère qui a ses côtés opposés deux à deux. » mot « parallèles » manquant (définition incomplète) | ses côtés opposés parallèles deux à deux | relecture |
| 79fdf | R1 Titre | Titre tronqué : « équation produit mul » | produit nul | relecture |
| 7k09a | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 80a7b | R10 Français | Énoncé : « Combien en reste-il ? » (reste-t-il) | reste-t-il | relecture |
| 82a2f | R1 Titre | Correction : renvoie à « la décomposition » jamais donnée ; titre « multiple » mais la phrase conclut sur « diviseur » | Formuler avec multiple : $2\,025=25\cdot81$ | relecture |
| 82d4a | R1 Titre | Titre contenant « (ancien exercice) » (comme 25143, 1380f) | Retirer la mention | relecture |
| 845fa | R1 Titre | Titre « Tracer une figure avec une aire donnée » mais l'exercice demande de lire un nombre sur une droite graduée | Titre cohérent | relecture |
| 89710 | R1 Titre | Titre « Ordre de grandeur » sans rapport avec l'exercice (figure sans axe de symétrie) ; consigne « n' ayant » espace après l'apostrophe | Titre « Reconnaître une figure sans axe de symétrie » ; n'ayant | relecture |
| 8e7a5 | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 8f060 | R1 Titre | Titre terminé par un astérisque « * » | Retirer l'astérisque | relecture |
| 8u8my | R12  | Titre : « e^(x+a) = 1 » écrit avec des parenthèses au lieu de LaTeX ; énoncé \text{e} au lieu de \mathrm{e} | $\mathrm{e}^{x+a}=1$ | relecture |
| 90ae3 | R1 Titre | Titre : « Trouver une longuer » (longueur) | longueur | relecture |
| 91304 | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 936a4 | R1 Titre | Titre « Trouver un inverse ou un opposé » alors que la question porte sur la valeur décimale de 2 025 + 1/2 (même défaut que 2guhi) ; correction « 2025 » sans espace puis « 2 025,5 » | Titre cohérent | relecture |
| 97290 | R1 Titre | Titre : « Différence de fracion » (fraction) | fractions | relecture |
| 986cd | R1 Titre | Titre vide dans le référentiel | Renseigner le titre | relecture |
| 9b8f9 | R1 Titre | Titre : « Dtéreminer un reste à payer » (Déterminer) | Déterminer | relecture |
| 9eaa5 | R10 Français | Énoncé et correction : « Le pente de la droite … est donné » (La pente … donnée), même défaut que 11QCM-5 et 11QCM-80 | La pente … donnée | relecture |
| 9ES1D-15 | R16  | Titre « Connaitre » | « Connaître » | relecture |
| 9f6e6 | R1 Titre | Exercice modèle exposé : « Titre de l'exercice », « Consigne », « Question 1 de type 2 » | Retirer du référentiel | relecture |
| 9f722 | R1 Titre | Titre : « astucieusment » (astucieusement), même faute que 5ab89 | astucieusement | relecture |
| 9t36i | R1 Titre | Titre vide dans le référentiel (doublon CH de 91304) | Renseigner le titre | relecture |
| c3202 | R10 Français | Correction : exposant vide « x^{} » dans $\dfrac{-2x^{}}{x^{4}}$ | Écrire $\dfrac{-2x}{x^{4}}$ (x^1 non affiché) | relecture |
| c35c9 | R16  | Correction : « Il faur donc » | « Il faut donc » | relecture |
| c52a3 | R16  | Titre « Reconnaitre » sans accent | « Reconnaître » | relecture |
| c5503 | R16  | Correction : « commmun » (trois m) | « commun » | relecture |
| c8515 | R16  | Titre « Trouver la moitié d'un nombre » mais la question est $3\cdot ?=18$ (division) | Titre à revoir | relecture |
| c9016 | R1 Titre | Correction : « le quart de 80 » : 80 hors $ | $80$ | relecture |
| ca8a9 | R16  | Titre « un nouveaux prix » ; correction « appliquant la augmente de $20\,\%$ au prix initial » (phrase cassée) | « un nouveau prix » ; « en appliquant l'augmentation de $20\,\%$ » | relecture |
| cbaad | R16  | Correction : « L'préimage est… » (élision fautive, féminin) | « La préimage » | relecture |
| cc23e | R16  | Titre « Effetuer une multiplication avec 25 » | « Effectuer » | relecture |
| ccf1d | R16  | Titre « Mulitiplier des mutiples de dix » | « Multiplier des multiples de dix » | relecture |
| cd32b | R16  | Correction : « $2,7 = 2 \text{ h } + …$ » sans unité à gauche | $2,7\text{ h}=…$ | relecture |
| cd736 | R16  | Énoncé : « retranchant $3$ dixièmes à $2\,025$ » (retrancher … de) ; correction « $2\,025 -0,3$ » espace asymétrique | « à partir de » / $2\,025-0,3$ | relecture |
| cd8eb | R2 Tutoiement, impératif | Correction : unités \textbf{h} et \textbf{min} dans miseEnEvidence | miseEnEvidence(21) \text{h} … | relecture |
| ce3da | R16  | Titre terminé par « ** » et apostrophe typographique « d’un » | Retirer « ** » | relecture |
| cea02 | R1 Titre | Nombres hors $ : « motif n° 6 », « 2 colonnes », « 1 ligne » (correction) | Nombres entre $ | relecture |
| cee5d | R16  | Guillemets droits \x27Pile\x27 / \x27Face\x27 | Guillemets français « Pile » | relecture |
| ch2pn | R16  | Titre « littéralee » | « littérale » | relecture |
| d077f | R16  | Intervalles $[-1;4]$, $]-\infty;0]$ sans espaces autour de « ; » (déjà vu : ~;~) | Utiliser $[-1\,;\,4]$ | relecture |
| d136e | R16  | Titre terminé par une espace | Retirer | relecture |
| d7202 | R16  | Titre « Développer une identité remarquable » alors que la question porte sur un tableau de signes ; correction « abscisses.On lit » (espace manquante) | Corriger le titre ; ajouter l'espace | relecture |
| d88d6 | R10 Français | Correction : « $25≠24$ » caractère Unicode dans les maths | $25\neq 24$ | relecture |
| d8ef1 | R16  | Correction : « soit $4+2$ » sans unité | $4+2=6\text{ kg}$ | relecture |
| d9c51 | R16  | Titre terminé par une espace | Retirer l'espace finale | relecture |
| d9p5e | R16  | Énoncé : « Combien de fois $\dfrac{5}{6}$ dans $\dfrac{5}{2}$ ? » (verbe manquant) | « Combien de fois $\dfrac{5}{6}$ y a-t-il dans … ? » | relecture |
| dabbf | R16  | Titre terminé par un point | Retirer le point | relecture |
| debc6 | R16  | Exponentielle « e » en romain absente : $ke^{-ax}$, $ke^0$ (pas $\mathrm{e}$), contrairement à d2a2d | Utiliser \mathrm{e} | relecture |
| e1938 | R1 Titre | Énoncé : « 18 yaourts », « 5 », « 7 », « 6 » hors $ | Nombres entre $ | relecture |
| e6bf9 | R16  | Énoncé : « Dans $24$, combien de fois $4$ ? » (verbe manquant) | « Dans $24$, combien de fois y a-t-il $4$ ? » | relecture |
| e70ce | R16  | Titre terminé par une espace | Retirer | relecture |
| e7bad | R16  | Correction : « 4 angles droits… quatre côtés… 3 angles droits » : chiffres et lettres mêlés | Harmoniser | relecture |
| e9cf0 | R1 Titre | Énoncé : « 15 € », « 1 billet de 20 € » hors $ ; correction « $20$ € - $15$ € $ = 5$ € » (trait d'union au lieu de −, $ mal placés) ; titre « Ordre de grandeur » sans rapport | $15$ €, $20$ € ; $20-15=5$ ; titre « Rendre la monnaie » | relecture |
| ea772 | R3  | Correction : « $10~€ -1,30~€$ » (« € » dans les maths, espace asymétrique avant « - ») | $10\text{ €}-1,30\text{ €}$ | relecture |
| exemple-qcm-json | R16  | Exercice modèle : « 3,14159... » (trois points tapés), e en italique, retours « Correct ! », « vous avez inversé » ; exemple visible dans le référentiel | \ldots ; \mathrm{e} | relecture |
| f0064 | R16  | Titre terminé par une espace | Retirer | relecture |
| f0cad | R16  | Titre « Somme de nombre relatifs » | « nombres relatifs » | relecture |
| f13e3 | R16  | Titre « Résoudre une équation trigonométrique » alors que l'on calcule une longueur | « Calculer une longueur avec le sinus » | relecture |
| f5a23 | R16  | Énoncé : « connaitre l'aire du triangle $UVW$ » sans point final ; titre « Connaitre »; propositions en \times, correction en \cdot | Point final ; Connaître ; \cdot ou \times partout | relecture |
| f6jd7 | R16  | Titre « Visualisation 3d » (3D) | « Visualisation 3D » | relecture |
| f9a02 | R3  | Unités « \text{ cm}^2 » avec espace dans \text pour l'aire mais pas pour le périmètre (« \text{cm} ») | Harmoniser \text{ cm}^2 | relecture |
| faacc | R16  | Titre « Calculer  une probabilité » : deux espaces | Une seule espace | relecture |
| fj2ix | R3  | Correction : « $2026$ » sans espace fine alors que l'énoncé écrit $2\,026$ ; réponse ⟦\dfrac{-1}{3}⟧ (signe au numérateur) | $2\,026$ ; $-\dfrac{1}{3}$ | relecture |
| gc360 | R16  | Titre « Completer un encadrement » (accent) | « Compléter » | relecture |
| gnx1c | R12  | Titre en \times mais énoncé en \cdot ($f(1)\cdot f'(1)$) | Un seul symbole | relecture |
| hbp7h | R16  | Titre « Multiplier un nombre décimalpar 0,2 » : espace manquante | « décimal par » | relecture |
| lvquc | R16  | Titre « Réesoudre » (Résoudre) | « Résoudre » | relecture |
| nlcug | R16  | Titre « Dtéreminer un reste à payer » (Déterminer) | « Déterminer » | relecture |
| ob9in | R16  | Titre « Convertir m$^3$ et Litres » : majuscule à « Litres » et $ dans le titre | « Convertir des m³ et des litres » | relecture |
| olnpp | R16  | Titre « Trouver une longuer » (longueur) | « longueur » | relecture |
| PR-9 | R16  | Titre « Numeration simple » (Numération) ; réponse ⟦8272⟧ sans espace fine (attendu 8\,272) | « Numération » ; 8\,272 | relecture |
| ps266 | R12  | QCM en \times (« $4\times10^{8}$ ») et correction en \cdot (« $4\cdot10^{8}$ ») | Un seul symbole | relecture |
| ps267 | R16  | Correction : « la pente est négatif » (négative) | « négative » | relecture |
| psq05 | R16  | Correction : « $30$ km correspond à le quart de $120$ km » (au quart) | « correspond au quart de » | relecture |
| se7mc | R16  | Titre « Completer une égalité du type $a\times ?-b=c$ » (accent) et exercice en \cdot | « Compléter » ; \cdot | relecture |
| t6gg0 | R3  | Correction : « $3^{2026}$ » sans espace fine (énoncé $3^{2\,026}$) | Harmoniser | relecture |
| ttsnc | R16  | Titre « Calculer 10, 20 ou 30  $\%$ d'un nombre » : deux espaces avant $\%$ | Une seule espace | relecture |
| vv2yb | R16  | Énoncé : « pout obtenir l'abscisse » (pour) | « pour » | relecture |
| zqf0m | R16  | Titre « Déteterminer une heure de départ… » (Déterminer) | « Déterminer » | relecture |
| 3G95-1 | R16  | Correction : « orthogonaux , je déduis que… » espace avant la virgule ; première personne « je déduis » alors que les autres corrections utilisent « on » | « orthogonaux, on en déduit » | src/exercices/ |
| 3G98-7 | R16  | Correction : « $4x-y+1=0\iff y=4x-1$ » et « $3x-y+3=0\iff y=3x-3$ » : erreurs de signe (il faut y=4x+1 et y=3x+3) ; le résultat final 4,4° reste juste | Corriger les deux équivalences | src/exercices/ |
| 3G99-3b | R3  | Énoncé : « $A(4⍽; -1⍽; 4)$ » espaces insécables à l'intérieur des formules | Utiliser $A(4\,;\,-1\,;\,4)$ | src/exercices/ |
| 3mA2-14 | R3  | Énoncé : $D_h=]0;+\infty[$ sans espaces autour de « ; » (même défaut général) | $]0\,;\,+\infty[$ | src/exercices/ |
| 3mComb-2 | R1 Titre | Correction : « de 0 à 9, soit 10 possibilités » : nombres hors $ | Nombres entre $ | src/exercices/ |
| 3mComb-4 | R16  | Énoncé : « former un équipe » (une équipe) et « ce équipe » (cette équipe) | « une équipe », « cette équipe » | src/exercices/ |
| 9ES1E-18 | R16  | Correction : « tous les côtés du losange mesure environ » (mesurent) | « mesurent » | src/exercices/ |
| 9ES1E-20 | R16  | Énoncé : « Tracer un rectangle $ABCD$ tel que $AB=5$ et $BC=3$ » : unité manquante (cm) | $AB=5\text{ cm}$ | src/exercices/ |
| 9ES1E-8 | R3  | Correction : « [$JL$] » crochets hors de la formule alors que « $[LK]$ » les inclut | $[JL]$ | src/exercices/ |
| 9FA2B-15 | R16  | Énoncé et correction : « cacahuètes fraiches » (fraîches) | « fraîches » | src/exercices/ |
| 9FA2B-16 | R16  | Énoncé : « une cagette de abricots » (d'abricots) ; la correction recopie les libellés en vrac ($17$ € $7$ € $10$ € une cagette de…) | « d'abricots » ; supprimer le doublon | src/exercices/ |
| 9FA2B-17 | R16  | Énoncé : « Chloé revient du marché. Il a acheté… » (pronom masculin pour un prénom féminin ; prénom tiré au hasard, accord à faire dépendre du genre) | « Elle a acheté » | src/exercices/ |
| 9QCM-2 | R16  | Correction : « Les cinq sixièmes d'un quart est égal à » (sont égaux à / correspondent à) | « correspondent à » | src/exercices/ |
| 9QCM-8 | R3  | QCM : « $42 $ € », « $39,80 $ € » espace avant le $ de fermeture ; correction « $⟦38~ €⟧$ » : € dans la formule | $42$ € | src/exercices/ |
| j3wun | R16  | Correction : « Un polynome du second degré » (polynôme) ; titre terminé par une espace | « polynôme » | src/exercices/ |
| js3qp | R16  | Titre « Donner la nature d'un triangle » alors que la question porte sur « tous les carrés sont des rectangles » | Titre cohérent | src/exercices/ |
| k7omv | R16  | Énoncé : « $]0;+\infty[$ » sans espaces autour de « ; » | $]0\,;\,+\infty[$ | src/exercices/ |
| labyvec | R5 Virgule | Consigne « Trouver le chemin qui ne passe que par des coordonnées de vecteurs colinéaires » sans point final | Ajouter le point | src/exercices/ |
| ltsv8 | R16  | Correction : « Longueur $\cdot$ largeur $\cdot$ hauteur » majuscule initiale incohérente et mots hors formule | « longueur × largeur × hauteur » | src/exercices/ |
| ps263 | R12  | Correction : « $16\div 0.5$ » : point décimal au lieu de la virgule | $16\div 0,5$ | src/exercices/ |
| ebd89 | R16  | Titre « Calculer la dérivée de $\lambda u$ » alors que la question est une dérivée d'une fonction affine | Corriger le titre | src/exercices/1e/1AN14-1Old.ts |
| e46e6 | R16  | Correction : intervalle $[-7;1[$ sans espaces autour de « ; » | $[-7\,;\,1[$ | src/exercices/2e/200F3-02.ts |
| cee5d | R1 Titre | Énoncé et correction : nombres hors $ (« 1 boule bleue », « 2 boules vertes ») | Nombres entre $ | src/exercices/2e/2P10-4Old.ts |
| e1938 | R16  | Énoncé : « cette experience aléatoire » (accent) | « expérience » | src/exercices/2e/2P10-5Old.ts |
| dc3d2 | R1 Titre | Énoncé et correction : nombres hors $ (« 10 + 9 + 4 + 6 + 8 = 37 », « 0,243 ») | Nombres entre $ | src/exercices/2e/2S20-1Old.ts |
| e564b | R5 Virgule | Consigne « Calculer » sans point final | « Calculer. » | src/exercices/4e/4G20-3Old.ts |
| fa2eb | R1 Titre | Propositions QCM « 2 », « 3 », « 5 », « 9 » hors $ | Nombres entre $ | src/exercices/5e/5A11Old.ts |
| dc629 | R16  | Correction : « $R = diametre \div 2$ » (sans accent, en italique) ; énoncé « arrondi au $\text{ dm}^3$ près » (espace dans \text) | $R=\text{diamètre}\div 2$ ; « au $\text{dm}^3$ près » | src/exercices/5e/5G2E-6Old.ts |
| d88d6 | R2 Tutoiement, impératif | Correction : « l'égalité n'est pas vraie » (texte) en miseEnEvidence | texteEnCouleurEtGras | src/exercices/5e/5L15-Old.ts |
| fb238 | R3  | Consigne « Quelle fraction de la figure est colorée ? » : espace ordinaire (sécable) avant « ? » | Espace insécable | src/exercices/6e/6N3autoA-old.ts |
| fa2ec | R1 Titre | Énoncé : suite « 5 13 21 29 » hors $ ; titre avec deux espaces (« patterns numériques  (divisibilité) ») ; "Est-ce que" lourd | Nombres entre $ ; une seule espace | src/exercices/6e/6N43-1.ts |
| eb45a | R6  | Une unité est attendue (attendu 10\operatorname{cm^2}) mais la correction ne met en évidence que ⟦10⟧, l'unité « cm² » reste hors de la couleur | miseEnEvidence(10\text{ cm}^2) (comme c188c) | src/exercices/bp2/BP2AutoV3Old.ts |
| ity6q | R16  | Correction : « La moitié de $44$ dixièmes est $22$ » (22 dixièmes) puis « est $2,2$ unités » : unité manquante dans la première phrase | « est $22$ dixièmes, soit $2,2$ unités » | src/exercices/can/ |
| xbhcx | R15  | Énoncé : le tableau de proportionnalité s'affiche sous forme de texte brut « 3 ? 10 20 » (pas de tableau) ; titre terminé par une espace | Utiliser tableau-mathlive | src/exercices/can/ |
| e7919 | R5 Virgule | Énoncé : « …a pour équation : $7x-2y+4=0$ Donner les coordonnées… » (point manquant avant « Donner ») | Ajouter un point | src/exercices/can/1e/can1G08-old.ts |
| daf1d | R16  | Titre « Trouver l'extremum à partir d'une forme canonique » alors que la question est un produit scalaire de deux vecteurs | Corriger le titre (ou la question) | src/exercices/can/can1a-2025/can1a-2025-Q28.ts |
| f0e17 | R16  | Énoncé : « deux notes ($11$ et $10$) coefficient $1$ » (de coefficient) | « de coefficient $1$ » | src/exercices/can/can2a-2025/can2a-2025-Q21.ts |
| f3208 | R16  | Correction : « Le terme constant vient de $-2\cdot 3=6$ » (erreur de signe : $-2\cdot 3=-6$) | $-2\cdot 3=-6$ | src/exercices/can/can2a-2025/can2a-2025-Q3.ts |
| f3a3e | R16  | Titre « Nombre de dizaines » alors que la question porte sur les centaines | « Nombre de centaines » | src/exercices/can/can6a-2025/can6a-2025-Q3.ts |
| f6jd7 | R10 Français | Énoncé : le mot « undefined » s'affiche devant le QCM (`this.question += monQcm.texte` alors que this.question n'est pas initialisé) | this.question = monQcm.texte (ou initialiser à "") | src/exercices/can/canCE2a-2025/canCE2-2025-Q11.ts:369 |
| e9cf0 | R13  | Correction : « J'ai donné $1$ billets de $20$ € » (accord) | « $1$ billet » | src/exercices/can/canCE2a-2025/canCE2-2025-Q13.ts |
| evon2 | R16  | Énoncé : « Quel est la pente… » ; correction : « coeffcient » (déjà vu dans can2L2-03) | « Quelle est la pente » ; « coefficient » | src/exercices/can/canNY-2026/canTNY-2026-Q13.ts |
| a09e5 | R16  | Limite en +∞ : « lim (-2-5x)/(4x-7) = lim -5x/4x » sans justification (équivalent des termes de plus haut degré non nommé) ; titre « Calculer une limite » ; résultat -5/4 juste. | Citer la règle (termes de plus haut degré). | src/exercices/CH/a09e5.ts |
| a0d16 | R10 Français | « $300\,000$$⍽=$ » : deux $ collés ($$ = mode display) avant l'égal ; titre « Associer un nombre décimal à sa notation scientifique » alors que la consigne demande de donner la notation ; 8 N6. | $300\,000=$ en un dollar ; titre cohérent. | src/exercices/CH/a0d16.ts |
| a12ef | R16  | Correction : « et $452$ est vient juste après $428$ » (faute de frappe : « est » en trop) ; « Entoure » (consigne papier dans une app tactile ; « Choisir ») ; énoncé « qui vient juste après 428 » ambigu (432 serait le suivant) ; 26 R2. | « 452 vient juste après 428 » ; « Choisir ». | src/exercices/CH/a12ef.ts |
| a2993 | R3  | Titre « Trouve l'heure sur une horloge (QCM) » (tutoiement) ; propositions « Pendule 1/2/3 » sans l'image dans le texte (15 X4 : énoncé vide, 6 R2) ; correction « 15h15 » écrit sans espaces ni $. | « Trouver l'heure » ; « 15 h 15 ». | src/exercices/CH/a2993.ts |
| a2b75 | R5 Virgule | Correction : « on peut procéder par élimination : • Les Berlines occupent exactement la moitié du disque, soit 50 % » ; 23 phrases sans virgule ; « $50 \,\%$ » espace avant \, ; lecture visuelle seule : valeur à lire, pas de mesure. | « $50\,\%$ » ; virgules. | src/exercices/CH/a2b75.ts |
| a343a | R16  | « Détermine le reste » (tutoiement CH) ; 26 R2 (« reste » en évidence) ; correction juste (40=7·5+5). | Voir règle tutoiement/infinitif. | src/exercices/CH/a343a.ts |
| a343b | R16  | « 4 gommes coûtent 7 euros » nombres en dollars mais unité « euros » en texte ; correction : « 7+3,50 » ; prix « 3,50 » avec zéro final contre « 10,50 » : cohérent ; 12 T6. | RAS (CH : francs). | src/exercices/CH/a343b.ts |
| a343i | R16  | Correction : « La moitié de 24 est égal à » (est égale à) ; énoncé « La moitié de 24 » sans verbe. | « est égale à » ; « Calculer la moitié de 24 ». | src/exercices/CH/a343i.ts |
| a343m | R3  | « $3$ min $30$ s » unités hors des $ ; « $3$ min $ + $ $0,5$ min » espaces autour du + ; 11 T6. | $3\text{ min}$. | src/exercices/CH/a343m.ts |
| a343q | R13  | Titre « Ecriture décimale » sans accent (É) ; correction « $3\cdot1000+5\cdot0,1$ » : 1000 sans espace fine (1 000). | Écriture ; 1\,000. | src/exercices/CH/a343q.ts |
| a343s | R3  | Calcul juste (5 700) ; $\cdot$ CH conforme. | RAS. | src/exercices/CH/a343s.ts |
| a343u | R16  | Titre « Répartition » pour un exercice de périmètre de rectangle (titre copié d'a343p) ; correction juste (2·(5+4)=18). | Titre « Périmètre d'un rectangle ». | src/exercices/CH/a343u.ts |
| a343v | R3  | Tableau « 21 42 3 ? » en texte brut (nombres hors des $, 78 N1) ; $\text{⍽? }=$ ; correction juste. | Vrai tableau. | src/exercices/CH/a343v.ts |
| a343w | R3  | Conversion juste (43 m) ; 12 T6 ; « dam » unité peu courante à ce niveau (CH). | RAS. | src/exercices/CH/a343w.ts |
| a343x | R3  | Correction : « égale à $180$° » (° hors du dollar) puis « $90^\circ+40^\circ+\text{⍽? }=180^\circ$ » ; « ?= » mis en évidence 50 ; 8 T6. | $180^\circ$. | src/exercices/CH/a343x.ts |
| a3bc7 | R3  | « $⟦\dfrac{2}{4}⟧$$=⟦\dfrac{1}{2}⟧$ » : deux dollars collés ; réponse attendue 2/4 ou 1/2 : les deux acceptées ? (« coloriée » -> « coloriée »). | Un seul dollar. | src/exercices/CH/a3bc7.ts |
| a3x3b | R3  | « une religieuse à $2$ euros et $6$ cookies à $40$ centimes » : unités en toutes lettres hors des $ ; « $2,40+2=⟦4,40⟧$ » ; calcul juste. | $2\text{ euros}$ ou « francs » ? (CH : francs). | src/exercices/CH/a3x3b.ts |
| a3y3b | R16  | « $\dfrac{4}{6}=\dfrac{?}{12}$ » : point d'interrogation en italique dans le dollar ; « $\text{? }=$ » ; correction « ?=2·4=8 » : le « ? » devient inconnue sans nom. | Nommer l'inconnue (x). | src/exercices/CH/a3y3b.ts |
| a49d5 | R3  | Proposition « $a^{6{n}}$ » (accolades autour de n inutiles) ; « Soient a un nombre réel non nul et n un entier » (n∈ℕ dans la correction) ; 13 doubles espaces. | $a^{6n}$ ; n entier naturel. | src/exercices/CH/a49d5.ts |
| a4cb3 | R3  | Calcul juste (A/B+1=7/3) ; titre avec espace final ; \cdot (CH) ; QCM sans évidence. | RAS. | src/exercices/CH/a4cb3.ts |
| a4cbf | R16  | Titre « Calculer avec les chiffres » pour $2+0+2+5$ (clin d'œil à l'année) ; réponse 9 juste ; exercice trivial. | RAS. | src/exercices/CH/a4cbf.ts |
| a5300 | R3  | « Calculer la température moyenne , au dixième près » (espace avant la virgule) ; 78 T3 (espaces avant deux-points) ; « 13,8 °C » : °C hors du dollar sans espace (comme BP2AutoD2) ; calcul juste. | Espace ; $13,8~\text{°C}$. | src/exercices/CH/a5300.ts |
| a59w1 | R3  | Propositions « OUI » / « NON » en majuscules ; « ⟦n'est pas un multiple⟧ » texte dans l'évidence ; 3 M3. | Oui/Non en minuscule ; texteEnCouleurEtGras. | src/exercices/CH/a59w1.ts |
| a5ab7 | R3  | « Voici la série de nombres : $5$; $6$; … » : point-virgule collé aux dollars, 30 valeurs sans espace ; 1 920 N1 (nombres hors des $ dans la correction « 1, 2, 2, … ») ; « valeurs aberrantes » (critères non rappelés). | Séparateurs ~;~ ; nombres entre $. | src/exercices/CH/a5ab7.ts |
| a6e9f | R3  | Correction juste (médiane 11) ; « $4^{\text{e}}$ » ; liste « $2 \,;\, 11 …$ » espace fine ; \text{e} correct. | RAS. | src/exercices/CH/a6e9f.ts |
| a7515 | R16  | Titre « …(ancien exercice) » : mention interne affichée aux élèves ; 16 M3 : proposition non mise en évidence ; 4 phrases sans virgule. | Retirer « (ancien exercice) ». | src/exercices/CH/a7515.ts |
| a8e1d | R3  | Titre « Convertir m$^3$ et Litres » (dollar dans le titre, « Litres » majuscule) ; conversion juste (20,25 m³) ; « $1\text{ L} =0,001\text{ m}^3$ » espaces. | « litres » ; titre sans LaTeX. | src/exercices/CH/a8e1d.ts |
| a9046 | R16  | « le nombre de préimage(s) de $-4$ » (« nombre d'antécédent(s) » dans le titre : deux vocabulaires) ; « a $0$ préimage » ; correction juste. | Un seul terme : antécédent. | src/exercices/CH/a9046.ts |
| aa613 | R3  | « $u_{2\,025}$ » : indice avec espace fine (année) ; correction juste (suite constante 1). | $u_{2025}$. | src/exercices/CH/aa613.ts |
| ab0ff | R3  | « Complète : » (tutoiement) ; 23 R2 ; 11 T6 ; correction juste (800 cm). | RAS. | src/exercices/CH/ab0ff.ts |
| acd4a | R3  | Abscisses « A( [champ] ) B( [champ] ) C( [champ] ) » : coordonnées d'un point sur une droite graduée écrites comme des points du plan ; 25 M1 ; correction faite de 9 figures sans texte. | Écrire « A: [champ] » ; texte de correction. | src/exercices/CH/acd4a.ts |
| admww | R3  | Doublon de a343h (« Somme de deux nombres décimaux » 0,24+0,3) : même énoncé dans deux exercices ; « $0,24 + 0,3$ $=$ » deux dollars. | Fusionner les doublons. | src/exercices/CH/admww.ts |
| ae51e | R3  | Titre avec espace final ; correction juste (A=23/4) ; QCM sans évidence (12 M3). | RAS. | src/exercices/CH/ae51e.ts |
| ae85a | R3  | Titre avec espace final « Retrouver l'égalité correcte avec des puissances » ; « Une seule de ces égalités est vraie. Laquelle ? » ; 12 N6 ; 5 M3. | RAS. | src/exercices/CH/ae85a.ts |
| aeba5 | R3  | Diagramme circulaire : somme 18,6+24,8+16,7=60,1 % correcte ; 10 figures ; « plus de $24$ ans » ; pas de point final. | RAS. | src/exercices/CH/aeba5.ts |
| afrce | R3  | Titre « Probabilités » trop vague ; énoncé et correction justes (15/22). | Titre précis. | src/exercices/CH/afrce.ts |
| agjju | R16  | Titre « Calculer une limite avec l'infini » ; limite en 2 026 d'une fonction avec exposants 2 026 : année utilisée comme paramètre (clin d'œil) mais « x^{2\,026} » avec espace fine dans l'exposant ; correction juste (+∞). | x^{2026}. | src/exercices/CH/agjju.ts |
| aqed6 | R3  | « $2\,026$⍽⍽⍽; ⍽⍽⍽$2\,030$ » suite avec six insécables autour des points-virgules (mise en page à l'espace) ; correction juste (+4). | ~;~. | src/exercices/CH/aqed6.ts |
| autres-1 | R16  | Correction : « il avance de $2$ fois de $15$ pas » (« il avance 2 fois de 15 pas ») ; programme Scratch en texte brut « répéter [2] fois avancer de [15] pas » ; 208 doubles espaces ; exercice CH sans équivalent FR (périmètre : CH only). | « 2 fois 15 pas ». | src/exercices/CH/autres-1.ts |
| autres-13 | R3  | Suite de décimaux « 2,50 ; 2,75 ; 3 » : le 3 devrait s'écrire 3,00 ; « Complète » (tutoiement CH) ; « 3+0,25 » ; 21 R2. | 3,00 ; vouvoiement/infinitif selon l'app. | src/exercices/CH/autres-13.ts |
| ayxrt | R16  | Titre « Compter les sommets d'un prisme » : l'exercice interroge un cube ; correction « car il possède deux bases opposées à 4 sommets chacune » (4 hors des $). | Titre « d'un cube ». | src/exercices/CH/ayxrt.ts |
| ayxru | R3  | « $\dfrac{1}{5}$ d'heure » : texte « d'heure » hors du dollar mais « \text{ d'heure }» dans la correction ; « min » ; 11 T6 ; calcul juste (12 min). | Uniformiser. | src/exercices/CH/ayxru.ts |
| az45m | R3  | « $\text{ min }$ » avec espaces dans \text ; « 60 min ÷ 3 » ; doublon avec ayxru (fraction d'heure) ; calcul juste. | Fusionner. | src/exercices/CH/az45m.ts |
| b0353 | R3  | Doublon de autres-13 (« Compléter une suite » à pas 0,3) : « Complète » (tutoiement), 23 R2, séparateurs « ⍽⍽⍽; ⍽⍽ ». | Fusionner ; ~;~. | src/exercices/CH/b0353.ts |
| b03f0 | R3  | Doublon de a343i (« Calculer la moitié d'un nombre » ; correction « est » correcte ici) ; titre avec espace final. | Fusionner. | src/exercices/CH/b03f0.ts |
| b0611 | R3  | Correction juste (2 025 = 25×81) ; notation « \underbrace{5\cdot5}_{25} » ; « ~25 » espace insécable ; 1 T3. | RAS. | src/exercices/CH/b0611.ts |
| b18a9 | R16  | Correction : « Le pente $m$ de la droite (AB) est donné par » : genre faux (La pente … donnée) ; titre « coefficient directeur », consigne « Coefficient directeur », correction « pente » : deux termes ; 16 figures. | « La pente … est donnée » ; un seul terme. | src/exercices/CH/b18a9.ts |
| b1f2a | R3  | Correction juste (7/6) ; « On réduit au même dénominateur, puis on additionne les numérateurs : » ; réponse attendue 7/6 (7/6 ≈ 1,17 non demandé). | RAS. | src/exercices/CH/b1f2a.ts |
| b26na | R3  | Correction juste (0) ; « En additionnant les deux chiffres des unités, on trouve 6+4=10 » ; 8 T6. | RAS. | src/exercices/CH/b26na.ts |
| b2be1 | R3  | Correction juste (0,5) ; « Quel nombre repère le point A » (repère = repérer) ; 5 figures. | « Quel nombre est repéré par le point A ». | src/exercices/CH/b2be1.ts |
| b2fb3 | R3  | Calcul juste (100 km) ; « mètres » en toutes lettres dans l'énoncé et « m » dans la correction ; \cdot. | Unités uniformes. | src/exercices/CH/b2fb3.ts |
| b343g | R3  | Correction juste (5) ; « Le plus petit entier supérieur à 23/5 » (strictement supérieur) ; titre « Majoration de fraction » imprécis. | « le plus petit entier supérieur ou égal ». | src/exercices/CH/b343g.ts |
| b34re | R3  | Suite d'heures « $20⍽\text{h}⍽26⍽\text{min}$ ⍽⍽⍽; » (six insécables autour des points-virgules) ; évidence « ⟦21⍽\textbf{h}⍽11⍽\textbf{min}⟧ » avec \textbf (texte) ; 12 T6. | Mise en page ; format 21 h 11. | src/exercices/CH/b34re.ts |
| b44a5 | R3  | Correction « $299 + 5 dizaines = 299 + 50$ » : « dizaines » dans un dollar sans \text (lettres en italique) ; « Quel nombre j'obtiens » (que j'obtiens). | \text{ dizaines} ; « Quel nombre obtient-on ». | src/exercices/CH/b44a5.ts |
| b44b5 | R3  | Correction juste (30 images/s) ; propositions « $24$ images/seconde » ; 12 M3. | RAS. | src/exercices/CH/b44b5.ts |
| b5563 | R16  | Titre « Trouver la la fraction un demi (QCM) » (mot répété) ; QCM sans énoncé (14 X4) ; « Barre 1/2/3 » non légendées. | « Trouver la fraction un demi » ; ajouter la consigne. | src/exercices/CH/b5563.ts |
| b799f | R16  | Doublon de a343h et admww (somme de décimaux) ; énoncé $20+26$ trivial. | Fusionner. | src/exercices/CH/b799f.ts |
| b7a43 | R16  | Titre « Calculer une somme astucieusment » (astucieusement) ; correction juste. | astucieusement. | src/exercices/CH/b7a43.ts |
| b7d33 | R3  | Titre « Donner une écriture scientifique » vs consigne « Écriture scientifique de » vs correction « notation scientifique » : trois termes ; \underbrace sous l'évidence ; calcul juste (2,24·10^5). | Un seul terme. | src/exercices/CH/b7d33.ts |
| b7f1a | R3  | « \widehat{ABC}=60° » : ° en texte dans un dollar ; « BC=6 cm » unité hors des $ ; « 60° 6 cm » étiquettes de figure répétées dans le texte ; correction juste ; 9 M3. | 60^\circ ; $6\text{ cm}$. | src/exercices/CH/b7f1a.ts |
| b81d0 | R3  | Résolution détaillée juste ; « {\color{#216D9A}\boldsymbol{-7x}} » ; 26 N6 ; « Résoudre » sans consigne. | RAS. | src/exercices/CH/b81d0.ts |
| b8afd | R16  | Tableau d'effectifs (A) « \begin{array}{\|c\|c\|…\|c}\hline » : dernière colonne sans barre ; calcul de la moyenne juste (1 988/52≈38,2) ; 759 T2 (unités hors \text), 295 T6 ; 47 M1 ; 60 pages > 390 px (tableau à 9 colonnes). | Tableau défilant ; unités en \text. | src/exercices/CH/b8afd.ts |
| b8e36 | R3  | Correction juste (x¹⁰−4x⁵+4) ; QCM sans évidence ; « x^{9} - 4x^{5} + 4 » distracteur. | RAS. | src/exercices/CH/b8e36.ts |
| b8fc6 | R16  | Titre « Effetuer une multiplication avec $25$ » (Effectuer) ; correction juste (400). | Effectuer. | src/exercices/CH/b8fc6.ts |
| b926b | R3  | Doublon de a59w1 (« Déterminer un multiple ») avec 2 025 ; « OUI » / « NON » en majuscules ; 3 M3. | Oui/Non ; fusionner. | src/exercices/CH/b926b.ts |
| b9935 | R16  | Énoncé « $3+5$ [champ] » sans consigne ni « = » ; correction « 3 + 5 = 8 » ; titre « Somme de deux entiers » ; 12 M6. | Ajouter « = ». | src/exercices/CH/b9935.ts |
| ba520 | R3  | « Soit $f: x\longmapsto5x+4$ » (« f : x ↦ 5x+4 ») ; correction « f(x)=5x+4 donc ici on a » ; 25 N6, 2 X4 ; 14 pages > 390 px. | $f:x\mapsto5x+4$. | src/exercices/CH/ba520.ts |
| ba521 | R16  | Doublon exact de ba520 (même titre, même énoncé f:x↦5x+4, même correction). | Retirer un des deux. | src/exercices/CH/ba521.ts |
| baeec | R16  | « Entoure le nombre qui est entre 654 et 667 » (consigne papier, tutoiement) ; « 692, 545, 656 » ; 26 R2 ; 10 M3. | « Choisir ». | src/exercices/CH/baeec.ts |
| bb6cd | R16  | Titre « Calculer une somme astucieusment » (astucieusement) : même faute que b7a43 ; correction juste (35,8). | astucieusement. | src/exercices/CH/bb6cd.ts |
| bbdca | R3  | « $P_{\bar A}(\bar B)$ » : \bar au lieu de \overline ; « Soient A et B deux événements » ($A$ et $B$ hors des $ ? non : dans les $) ; 23 phrases sans virgule ; titre avec espace final. | \overline{A}. | src/exercices/CH/bbdca.ts |
| bc613 | R3  | « $6+6+6+6+6+6=6\cdot6$ » : addition répétée → produit : 6·6 ; correction juste. | « 6×6 ». | src/exercices/CH/bc613.ts |
| bc9a6 | R16  | Titre « Soustraire 19, 29, ...., 99 à un entier » : quatre points au lieu de « … » ; correction « 123−99=123−100+1=24 » : chaîne d'égalités fausse (123−100+1=24 mais « 123−99 » égale « 123−100+1 » sans ligne intermédiaire). | \ldots ; séparer. | src/exercices/CH/bc9a6.ts |
| bdaaf | R3  | Correction « Si n est pair cos(nπ)=1 et si n est impair, cos(nπ)=−1 » : virgule manquante après « pair » et n hors des $ ; juste (99). | Virgule ; $n$. | src/exercices/CH/bdaaf.ts |
| bee6d | R16  | « je donne 2 billets de 20 € » : 20,25 € ne se paie pas en billets de 20 € suisses (francs) ; énoncé en euros pour un exercice CH ; « Combien me rend-on ? » ; calcul juste (19,75). | CHF ; « Combien me rend-on ? ». | src/exercices/CH/bee6d.ts |
| bf899 | R3  | Correction juste (9x²−9/25) ; titre « Factoriser ou développer… » avec espace final ; fractions \dfrac dans les propositions. | RAS. | src/exercices/CH/bf899.ts |
| br9n6 | R16  | Consigne « Complète. » seule (aucune indication de l'objet : abscisses des flèches) ; 26 R2, 14 IM. | « Compléter les abscisses ». | src/exercices/CH/br9n6.ts |
| brlw7 | R16  | Titre « Question 30 » (titre de remplissage) ; correction : « est égal au pente de la tangente » (à la pente : genre) ; 12 T6. | Titre propre ; « à la pente ». | src/exercices/CH/brlw7.ts |
| byxrt | R3  | Titre « Distance sur un segment » ; « x= [champ] » ; correction « x=14-6=8 » sans unité ; 12 T6. | Unité. | src/exercices/CH/byxrt.ts |
| c0436 | R3  | « $ 3,48\cdot0,8$ = » espace dans le dollar et égal hors du dollar ; calcul juste (2,784). | $3,48\cdot0,8=$. | src/exercices/CH/c0436.ts |
| c0979 | R16  | Titre « Déterminer le plus nombre possible » (mot manquant : « le plus petit ») ; consigne « Écris … les chiffres suivants : $7; 4; 3$ » (liste dans un seul dollar avec espaces insécables, points-virgules collés) ; correction juste (347) ; 26 R2. | « le plus petit nombre possible » ; $7~;~4~;~3$. | src/exercices/CH/c0979.ts |
| c0f91 | R3  | « définie pour tout $n$ dans $\N$ » (\N : macro) ; correction juste (limite −∞ de (3/2)^n×(−1)) ; 16 M3/M6 ; 4 guillemets T4. | $n\in\mathbb{N}$. | src/exercices/CH/c0f91.ts |
| c2a4b | R3  | Correction juste (31,50 €) ; « $35 ~\text{€}\cdot0,10$ » espace avant ~ ; « Un article coûte $35~\text{€}$ ». | $35\,\text{€}$. | src/exercices/CH/c2a4b.ts |
| c5f04 | R3  | Doublon de b799f (somme) ; énoncé $3\,372+600=$ trivial. | Fusionner. | src/exercices/CH/c5f04.ts |
| c5kkh | R3  | Titre « Compléter un encadrement de $\dfrac{n}{\text{e}}$ par deux entiers consécutifs » avec LaTeX ; encadrement 1 ⩽ 4/e ⩽ 2 (4/e≈1,47) correct ; 20 T6. | Titre en texte. | src/exercices/CH/c5kkh.ts |
| c6cbe | R16  | Titre « Trouver un inverse ou un opposé » alors que l'exercice ne demande que l'opposé de −2 025 ; correction juste. | Titre « l'opposé ». | src/exercices/CH/c6cbe.ts |
| c8a2b | R3  | « Donner un diviseur de 213 autre que 1 et lui-même » : plusieurs réponses valables (3, 71) : le champ n'accepte que ? (à tester) ; correction juste. | Accepter 3 et 71. | src/exercices/CH/c8a2b.ts |
| c8fe9 | R16  | Programme Scratch « Aller en bas :: motion stack » (même défaut que 6I1B) ; 144 T3 ; 120 N1 ; 26 pages > 390 px. | Vérifier le rendu. | src/exercices/CH/c8fe9.ts |
| d3b6c | R2 Tutoiement, impératif | Correction : « un parallélogramme quelconque » (texte) en miseEnEvidence | texteEnCouleurEtGras | src/exercices/dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q3.ts |
| f5a23 | R16  | Correction : « en prenant $[UW]$ comme base, la hauteur correspondante est $[VW]$ » alors que la bonne réponse utilise $VH$ (la hauteur est $[VH]$) | « la hauteur correspondante est $[VH]$ » | src/exercices/dnbAutomatismes/dnb-2026-06-antilles-Q3.ts |
| cea02 | R2 Tutoiement, impératif | Correction : « ⟦n°7⟧ » texte dans miseEnEvidence alors que le champ attend 7 | n° 7 avec seul 7 en évidence | src/exercices/dnbAutomatismes/dnb-2026-06-centres-etrangers-Q2.ts |
| eed49 | R12  | Énoncé en \cdot, propositions du QCM en \times ; correction ⟦9\cdot 2^{5}⟧ différente de la proposition cochée « 9\times 2^{5} » | Un seul symbole | src/exercices/EAMPremiere/EAM-ANnonSpe-2026-Q3.ts |
| eb3f5 | R12  | QCM : propositions en \times (« $960 \times 0,2$ ») alors que la correction utilise \cdot : multiplication notée de deux façons dans le même exercice | Un seul symbole | src/exercices/EAMPremiere/EAM-CETechno-2026-Q3.ts |
| f43d1 | R16  | Énoncé et correction : « Son pente », « Le pente » (genre : la pente) ; titre « Développer une identité remarquable » alors que la question porte sur une pente | « Sa pente », « La pente » ; titre à corriger | src/exercices/EAMPremiere/EAM-FMnonSpe-2026-Q7.ts |
| deriv | R16  | Exercice modèle : $\frac$ au lieu de $\dfrac$ ; retours « Correct ! » / « vous n'avez pas… » (vouvoiement, voir tutoiement ailleurs) ; exemple visible dans le référentiel | \dfrac ; formulation neutre ; ou retirer du référentiel | src/exercices/modèlesExos/ExempleQcmDerivation.ts |
| e6d46 | R16  | Correction : la phrase « On peut par exemple dire que la courbe… deux points d'intersection » est répétée deux fois, collée sans espace (« $[0~;~2\pi]$.On peut ») | Supprimer le doublon | src/exercices/QCMBac/A2024/sujetzero2024Ex5Q1.ts |
| croiss | R2 Tutoiement, impératif | Correction : « croissante sur ]0 ; +∞[ » (texte) en miseEnEvidence | texteEnCouleurEtGras | src/exercices/QCMBrevet/A2019/CroissanceFonctions.ts |
| ff9d1 | R10 Français | Correction : « $\lim\limits_{n\to+\infty} 5n^{}+4=+\infty$ » : exposant vide « n^{} » | $5n+4$ | src/exercices/TSpe/ |
| dabbf | R1 Titre | Énoncé et correction : nombres hors $ (« 10 boules rouges », « 9 boules bleues », « 4 tirages ») | Nombres entre $ | src/exercices/TSpe/TSP2-02Old.ts |

## Constats graves du banc, à confirmer

| Exercice | Règle | Tirages | Exemple |
| --- | --- | ---: | --- |
| 014a4 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Il y a une erreur avec la valeur : $-\frac12$.Il y a une erreur avec la valeur : $+\infty$.Il y a une erreur avec la valeur : $-\fra |
| 0716b | I1 Bonne réponse refusée | 5 | bonne réponse refusée (0/1) Il y a une erreur avec la valeur : $-\frac34$.Il y a une erreur avec la valeur : $+\infty$.Il y a une erreur avec la valeur : $-\fra |
| 0f2d1 | I1 Bonne réponse refusée | 4 | bonne réponse refusée (0/1) Résultat incorrect car le numérateur doit être un nombre entier. |
| 10FA4C-9 | I1 Bonne réponse refusée | 10 | bonne réponse refusée (0/1) La valeur est correcte. Cette expression n'est pas assez réduite : un calcul numérique reste à effectuer. |
| 10FA4F-10 | I1 Bonne réponse refusée | 2 | bonne réponse refusée (0/1) La valeur est correcte. Cette expression n'est pas assez réduite : elle contient un facteur trivial ou un terme nul. |
| 11FA4A-5 | I1 Bonne réponse refusée | 8 | bonne réponse refusée (0/1) Incorrect car cette expression n'est pas égale à celle attendue. |
| 11NO3A-2 | I1 Bonne réponse refusée | 14 | bonne réponse refusée (0/1) La réponse fournie est bien égale à celle attendue mais la réponse fournie n'est pas en notation scientifique. |
| 16c6f | I1 Bonne réponse refusée | 12 | bonne réponse refusée (0/1) Vous devez saisir une réponse. |
| 1mCL4-1 | I1 Bonne réponse refusée | 1 | bonne réponse refusée (1/2) Les nombres doivent tous être séparés par un point-virgule. |
| 227f0 | I1 Bonne réponse refusée | 4 | bonne réponse refusée (0/1) Résultat incorrect car majuscules ou minuscules non respectées. |
| 28997 | I1 Bonne réponse refusée | 4 | bonne réponse refusée (0/1) L'ensemble est vide. |
| 2mTrigoFct-6 | I1 Bonne réponse refusée | 66 | bonne réponse refusée (0/1) Les nombres doivent tous être séparés par un point-virgule. |
| 3G98-5 | I1 Bonne réponse refusée | 14 | bonne réponse refusée (0/1) Une seule variable de paramétrage doit être utilisée. Une seule variable de paramétrage doit être utilisée. Par exemple, utilisez se |
| 3mLimCont-1 | I1 Bonne réponse refusée | 13 | bonne réponse refusée (0/1) Résultat incorrect car majuscules ou minuscules non respectées. |
| 6ca15 | I1 Bonne réponse refusée | 2 | bonne réponse refusée (0/1)  |
| 7f0dc | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Les nombres doivent tous être séparés par un point-virgule. |
| 9e17a | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| 9ES1C-1 | I1 Bonne réponse refusée | 8 | bonne réponse refusée (0/1) Il manque 1 réponse. |
| k2mzc | I1 Bonne réponse refusée | 1 | bonne réponse refusée (0/1) Il faut donner un intervalle ou une réunion d'intervalles. |
| testEEE | I1 Bonne réponse refusée | 20 | bonne réponse refusée (0/1) Cette expression est bien égale à celle attendue mais n'est pas assez réduite. |
| 10FA1B-1 | I2 Réponse fausse acceptée | 4 | réponse fausse acceptée |
| 28997 | I2 Réponse fausse acceptée | 5 | réponse fausse acceptée |
| 4mExpLog-2 | I2 Réponse fausse acceptée | 18 | réponse fausse acceptée |
| 4mInt-1 | I2 Réponse fausse acceptée | 16 | réponse fausse acceptée |
| 4mInt-2 | I2 Réponse fausse acceptée | 16 | réponse fausse acceptée |
| 95adb | I2 Réponse fausse acceptée | 4 | réponse fausse acceptée |
| afd39 | I2 Réponse fausse acceptée | 4 | réponse fausse acceptée |
| 0e6bd | I4 Question sans champ | 36 | champ absent de la page |
| 1871d | I4 Question sans champ | 70 | champ absent de la page |
| 1mCL4-2 | I4 Question sans champ | 53 | champ absent de la page |
| 2mTrigoFct-6 | I4 Question sans champ | 4 | champ absent de la page |
| 2mTrigoFct-7 | I4 Question sans champ | 4 | champ absent de la page |
| 3ca3e | I4 Question sans champ | 1 | champ absent de la page |
| 3f39d | I4 Question sans champ | 6 | champ absent de la page |
| 612b9 | I4 Question sans champ | 70 | champ absent de la page |
| 665a0 | I4 Question sans champ | 36 | champ absent de la page |
| 2mFctRat-1 | X1 Erreur | 2 | arrêt : page.evaluate: Target page, context or browser has been closed |
| 8cd45 | X1 Erreur | 99 | interactif (vide) : page.evaluate: Target page, context or browser has been closed |
| 9b8f9 | X1 Erreur | 5 | interactif (vide) : page.evaluate: Target page, context or browser has been closed |
| 9ES1C-1 | X1 Erreur | 1 | console : {"positionLabel":"above","color":["black","{black}"],"style":"","epaisseur":1,"opacite":1,"id":21811,"pointilles":0,"bordures":[-7.8,-7.8,7.8,7.8],"ce |
| 9NO1G-9 | X1 Erreur | 3 | console : texNombre : Trop de chiffres le nombre passé à la fonction a trop de chiffres significatifs, soit c'est un bug à corriger, soit il faut utiliser un De |
| acb80 | X1 Erreur | 64 | interactif (incorrecte) : page.evaluate: Target page, context or browser has been closed |
| AchangerOBLIGATOIREMENT | X1 Erreur | 1 | console : Un exercice simple doit avoir un this.reponse sauf si c'est un qcm ou un MathaleaCustomElement avec sa propre autoCorrection |
| bc372 | X1 Erreur | 16 | génération : page.evaluate: TypeError: this.sup.split is not a function     at SimulateurDes.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/profs/P01 |
| de353 | X1 Erreur | 24 | génération : page.evaluate: TypeError: this.sup.replaceAll is not a function     at EncodeurTexte.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/prof |
| de363 | X1 Erreur | 24 | génération : page.evaluate: TypeError: this.sup.replaceAll is not a function     at EncodeurTexte.nouvelleVersion (http://127.0.0.1:5173/alea/src/exercices/prof |
| 1mG3-6 | X2 Formule cassée | 18 | nombre impair de $ : {EB}^2} = \sqrt{49 + 84} = \sqrt{133}\text{ cm}$, d'où $AE = {\color{#F15929}\boldsymbol{\sqrt{133}\textbf{ cm}}}. |
| a343t | X2 Formule cassée | 14 | nombre impair de $ : ique de nombres&nbsp;: $25$&nbsp;; $50$&nbsp;; $75$&nbsp;; $$&lt;label>&lt;/label> [champ] &lt;span>&nbsp;.&lt;/span> &lt;div class ="m |
| afd39 | X2 Formule cassée | 2 | nombre impair de $ : $P(x)=a(x-\alpha)^2+\beta)$, avec $a&lt;0$ est croissant sur $$&lt;label>&lt;/label> [champ] &lt;div class ="ml-2 py-2 italic text- |
| PR-32 | X2 Formule cassée | 11 | « $ » visible : 000 100000 8 , 164 ÷ 8 ≈ 8 ÷ 8 , soit 1 8,164÷8≈8÷8, soit 1 $\text{{\color{#F15929}\boldsymbol{X}}$  |
| 12a46 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| 1474f | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| 23241 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| 9daa5 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| c8ee7 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| d7202 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| efab7 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |
| f6jd7 | X6  | 1 | même graine, énoncés différents (aléa hors nouvelleVersion ?) |

## Typographie et rédaction détectées automatiquement

Volume par règle (détail dans [trouvailles.md](../trouvailles.md)) : N1 Nombre hors $ 40251 ; T6 Points de suspension 6914 ; T5 Espaces 2971 ; T4  2018 ; R2 Tutoiement, impératif 946 ; T3  816 ; M7  792 ; R5 Virgule 651 ; T2  371 ; N6 Écriture algébrique 299 ; N2 Séparateur des milliers 276 ; R10 Français 257 ; N3  132 ; R9  94 ; X3  83 ; T1 Espace avant % 41 ; N5 Négatif sans parenthèses 23 ; X2 Formule cassée 19 ; R1 Titre 6 ; N4  2 ; R6  1.
