# Vérification complète avant la release Android et iOS (nuit du 4 au 5 novembre 2026)

Branche `ccr-181cf388-top1fw`, partie de `main` à 96e237c (« Retours des
testeurs » 5685170 et la note sur l'Explorer). Rien n'est sur `main` : à
fusionner après relecture. Aucun tag, aucun envoi à la Play Console.

## En bref

L'app est prête pour la release, à cinq conditions, dans l'ordre :

1. **Drive de l'Explorer** : déposer tous les fichiers de `explorer/`
   (versions de ce soir), et **`ch-4e-college.json` dans `CH`**. Depuis ce
   soir, le dossier décide du pays : un fichier suisse rangé dans `FR`
   n'apparaît plus nulle part (avant, il restait visible en Suisse). Le
   4 novembre, le drive avait 6 parcours sur 30 et `ch-4e-college.json`
   dans `FR`. C'est aussi pour ça que tu as encore vu « 7^8 est-il
   positif ? » : le dépôt n'utilise plus cet exercice depuis le 3 novembre,
   le drive a l'ancien fichier.
2. **Rejouer sur ta machine**, avec le moteur à jour (`pnpm moteur`),
   `node e2e/catalogue-moteur.mjs` et
   `PARCOURS=ch-1c-calcul-litteral,ch-1c-equations,ch-1c-preuves node e2e/parcours-az.mjs explorer/ch-1re-college.json`.
   Ici, la forge de Sésamath était injoignable (`instrumenpoche`,
   `sesajstools`) : seul le moteur de la 0.4.12 (2 novembre) était
   disponible, et six exercices de 1re Collège n'y sont pas encore
   interactifs (détail plus bas). Tout le reste a été vérifié.
3. **Lancer `emulateurs.yml`** (Android 11, Android récent, simulateur
   iPhone) et `ios.yml` avec `ipa=true` : cette session n'a pas le droit de
   lancer un workflow (403). Dernier passage des émulateurs : 31 octobre.
4. **Politique de confidentialité** : ajouter, avec ton feu vert (règle :
   jamais pendant un examen Google Play), que l'Explorer lit le dossier
   kDrive (Infomaniak) de CoopMaths du programme choisi. Phrase proposée
   plus bas.
5. **Version et notes** : numéro à choisir (gros changements : Explorer
   hors de l'app, onglet Fiches ; 0.5.0 me semble juste), monter
   `package.json`, `tauri.conf.json`, `Cargo.toml`, écrire
   `docs/notes-de-version/<v>.md` et `.play.txt` (brouillons plus bas), puis
   `bash scripts/publier.sh <v>`.

## Corrigé cette nuit (5 commits)

| Commit | Quoi |
| --- | --- |
| c3e4fcf | **Fiches** : un chapitre seul ne se repliait pas (ta capture) ; le titre du parcours n'est plus répété sous chaque fiche ; « · 3 fiches » ne se sépare plus de son point. Nouvelle suite `e2e/fiches.mjs` (repli, parcours dépliables, fiche puis retour, Mes fiches, recherche). |
| 4acbe5a | **Explorer : le dossier décide du pays** (note du skill « à reprendre demain ») : seul `FR` ou `CH` est lu, relu au changement de pays ; la copie de l'autre pays n'est jamais montrée. `pnpm test` vérifie qu'un fichier relève d'un seul pays. Nouvelle suite `e2e/explorer-pays.mjs` (kDrive simulé). **Lien de classe** : `classe=3a` trouve « 3A » ; un lien avec classe reprend aussi le premier dossier de l'enseignant. Onglets des questions lus « Question 3, correcte ». |
| 32ecda8 | **Docs** (voir « Plus d'actualité ») ; 165 captures et deux JSON versionnés par erreur à la racine retirés. |
| 3f36ca7 | **Exercice inconnu du moteur** : un parcours écrit avec un MathALÉA plus récent que l'app donnait un écran vide ; l'élève lit maintenant « Ces exercices demandent une version plus récente de MathALÉA : mets l'application à jour, puis reviens. » (suite `e2e/exercice-inconnu.mjs`). Important depuis que l'Explorer change sans mise à jour de l'app. **Listes des fiches** juste après une phrase rendues en liste. **Migration des données** (prioritaire depuis le 30 octobre, jamais écrite) : données créées dans la 0.4.7 (Google Play, moteur extrait du binaire) et la 0.4.12 (forge), suite `e2e/mise-a-jour.mjs` et test unitaire. |
| 5c20bdf | **Puissances** (11e, v3) : ceinture blanche avec au moins deux questions où le signe compte. **Primes** : 29 `\prime` seuls rendus « (u+v)ı » dans Calcul intégral et Exp-log. **Prérequis pour l'analyse** : listes en tirets bruts. |

### Puissances : ce qui a changé

- Avant (dépôt depuis le 3 novembre) : 10NO3D-1 ×4 et 10NO3D-5 ×3. Avec 3
  questions tirées parmi 10 types, il pouvait n'y avoir aucune base négative.
- Maintenant : 10NO3D-1 ×2 (bases positives), 10NO3D-5 ×6 (avec nombres
  négatifs : $-a^n$, $(-a)^n$, exposant pair ou impair, positif ou négatif,
  $a^0$ et $a^1$ de base négative une fois sur deux). Au moins deux questions
  où le signe compte, souvent quatre. Exemple tiré : $-12^0$, $4^2$, $14^1$,
  $5^3$, $-3^2$, $(-3)^{-2}$, $2^{-5}$, $8^3$.
- 10NO3D-6 (« Déterminer le signe d'une puissance ») n'est pas repris : une
  question sur quatre demande le signe de $a^n$ avec $a>0$. Demande ajoutée
  à `explorer/11ls-chapitres-proposition.md` : une option « bases négatives
  seulement » dans MathALÉA.
- Planche de la ceinture blanche : `apercus/ch-11ls-puissances-racines/planche-1.png`.

## Résultats

### Première vérification complète (commit 4acbe5a, 21 h 34 à 22 h 30)

Toutes les suites qui testent l'app sont vertes, y compris les nouvelles
(fiches, explorer-pays) et `complet`, `explorer`, `defilement-ecrans`. Cinq
échecs, chacun dû à l'environnement de la session :

| Étape | Cause | Suite |
| --- | --- | --- |
| cargo | bibliothèques GTK absentes du conteneur | installées : `cargo test` vert (12 passés, 3 ignorés : réseau) |
| az-1, az-3 | `ch-1c-preuves` (1mCL1-16 absent du moteur 0.4.12) et `ch-1c-equations` (1mCL4-4 interactif depuis dadcacf80) | à rejouer avec le moteur à jour |
| catalogue-moteur | 66 défauts, tous dans `ch-1re-college.json` : 2N21-1, 3L12-3, 1mCL1-16, 2L22-5, 1mCL4-4, 3A10, tous modifiés dans MathALÉA après le moteur 0.4.12 | idem |
| impression | Typst absent | Typst 0.15.1 compilé depuis crates.io : vert |

### Après les corrections

- `pnpm check` : 0 erreur ; `pnpm test` : 336 tests verts ; `cargo test` vert.
- `exercice-inconnu`, `fiches`, `mise-a-jour`, `impression` : verts.
- Migration : élève et enseignant de la 0.4.7 et de la 0.4.12, téléphone
  clair et bureau sombre : parcours, « Fractions » reprise à l'exercice 2,
  passages dans le suivi, ceinture orange gardée, bibliothèque (4 parcours)
  et classes, sauvegarde exportée sans clé perdue, aucune erreur.
- `catalogue-moteur` : tout vert hors 1re Collège (moteur).
- `parcours-az` de A à Z : Puissances et racines, Prérequis pour l'analyse,
  Calcul intégral, Exponentielle et logarithme : verts.
- Contrôle de toutes les formules des fiches par KaTeX (3 685) : aucune
  erreur hors les primes corrigées.

### Seconde vérification complète (état final)

RÉSULTATS_FINAUX

## Constaté, pas corrigé (à décider)

Contenu (règles de rédaction du projet) :

- **Préqualifiant** : fiches minces. « Lire un diagramme » : exemple vague
  (« Une barre atteint 12. Que lit-on ? ») et leurres absurdes (« Le nom de
  l'auteur », « La couleur du fond ») ; « Nommer les figures » : question
  triviale ; plusieurs fiches répètent dans la question ce que dit
  l'exemple (« Comparer 4 305 et 4 350 », puis « Quel nombre est le plus
  grand ? »). Pas de générateur dans le dépôt. À réécrire comme celles de
  11e.
- **EVACOM** : fiches sans LaTeX (« Calculer 2/3 + 1/6 », « x² + 2x − 15 »),
  contre la ligne éditoriale. Le générateur demande le catalogue JSON de
  MathALÉA (non constructible ici).
- MathALÉA : la consigne de 10NO3D-1 finit par « sans exposant et sans · »
  (× rendu en point avec la locale suisse) ; la consigne de la figure du
  guide-âne (4G30-0) est coupée à 390 px.

Interface (mineur) :

- Suivi en clair : la ceinture blanche obtenue se distingue mal des
  ceintures non obtenues (seule l'étiquette change de couleur) ; « noire,
  2e dan » a le même rendu que « noire ».
- Réglages : vouvoiement (« exportez », « touchez ») alors que l'élève est
  tutoyé partout ailleurs.
- Capacité Tauri `http://*:8702/*` inutile en production (le module HTTP ne
  sert qu'à l'heure) : à restreindre à `127.0.0.1`, essai sur téléphone.

## Plus d'actualité (corrigé dans les docs)

- `docs/developpement.md` : les quatre fonctionnalités du 30 octobre
  (grands écrans, fiches au même endroit, ceinture par chapitre, plusieurs
  appareils) étaient « à faire », elles sont faites (sauf une vraie mise en
  page de tablette) ; 0.4.12 « en cours » alors que publiée ; « réactiver
  google-play.yml » contraire à ta décision du 2 novembre.
- `docs/confidentialite.md` : sans la caméra, le prénom ni l'heure
  (la page publiée les a) ; `docs/confidentialite-brouillon.html` identique
  à la page publiée : retiré.
- Notes pour Apple (`fiche-boutiques.md`) : décrivaient l'Explorer comme la
  liste de tous les exercices ; « Teste ton niveau » n'existe qu'en France.
- Guides élève et complet : bouton « ⋯ » et panneau « Ajouter plusieurs
  parcours » disparus ; onglet Fiches, boussole, ceintures colorées absents.
- README : ligne iOS « aucun » (il y a une `.ipa` non signée), miroir GitHub
  « privé » (public), procédure de release manuelle (seulement
  `publier.sh`).
- Racine du dépôt : 165 captures de suites versionnées par erreur.

## Inventaire : ce que l'app doit avoir, et ce qui le vérifie

| Fonctionnalité | Vérifiée par |
| --- | --- |
| Premier lancement, programme, Réglages, thème | `complet`, `changer-appareil`, `defilement-ecrans` |
| Dossier de classe : lien, QR code, `?classe=`, plusieurs classes | `classe-qr`, `complet`, `tests/partage` (drives simulés) |
| Élève sans lien, Explorer seul | `explorer`, `exercice-inconnu` (accueil sans lien) |
| Explorer : degrés, chapitres, + / ✓, Tout ajouter, épingler, cacher, pays | `explorer`, `explorer-pays` |
| Séance : tous les formats de réponse, correction à chaque question et à la fin | `formats`, `formats-fin`, `reponses-elements`, `couleurs-reponse`, `champs-visibles` |
| Parcours en paliers et ceintures, dates d'ouverture, pauses, fiches d'office | `paliers`, `ouverture-paliers`, `parcours-az` (tous les parcours) |
| Bilan, refaire, questions passées, reprise | `terminer-passees`, `reprise-ecran`, `correction-parcours` |
| Suivi : activité, objectifs, ceintures par chapitre | `parcours-az`, `revisions`, `mise-a-jour` |
| Onglet Fiches | `fiches` |
| Révisions espacées | `revisions` |
| Teste ton niveau (France) | `test-niveau`, `test-niveau-reel` |
| Impression (Typst embarqué) | `impression` |
| Sessions de classe, QR des réponses | `session-qr`, `session-qr-long`, `reponses-session`, `en-classe` |
| Enseignant : bibliothèque, éditeur, publication, classes, objectifs | `fiche-parcours`, `paliers`, `eleve-puis-enseignant`, `auteurs`, `recherche` |
| Sauvegarde, restauration, fusion de deux appareils | `changer-appareil`, `tests/fusion`, `tests/sauvegarde` |
| Mise à jour depuis 0.4.7 et 0.4.12 | `mise-a-jour`, `tests/mise-a-jour` (nouveau) |
| Exercice inconnu du moteur | `exercice-inconnu` (nouveau) |
| Bouton retour, défilement au doigt, un seul toucher | `retour`, `defilement`, `defilement-ecrans`, `un-toucher`, `barre-clavier` |
| Catalogue de l'Explorer (moteur, interactif) | `catalogue-moteur`, `tests/catalogues` |
| Android 11 et récent, iPhone (vraie WebView) | `emulateurs.yml` (à lancer) |

Pas couvert par une suite : bannière « Nouvelle version de l'app » (pas
encore faite, liste « À faire ») ; lecture réelle du kDrive de l'Explorer
(réseau refusé à la session : simulée par `explorer-pays`).

## Proposition pour la politique de confidentialité

Dans « Connexions à Internet », remplacer la ligne de l'Explorer par :

> **afficher le catalogue de parcours proposés par l'équipe MathALÉA**
> (onglet Explorer) : l'application télécharge les fichiers de parcours,
> publics, du dossier kDrive (Infomaniak) de CoopMaths pour le programme
> choisi (France ou Suisse) ; aucune donnée de l'élève n'est envoyée ;

## Brouillon de notes de version

`docs/notes-de-version/<v>.md` :

```
- Explorer : les parcours de l'équipe MathALÉA arrivent sans mise à jour de
  l'app, selon le programme choisi (France ou Suisse) ; hors connexion,
  l'app garde la dernière copie.
- Sans lien de classe : « Je n'ai pas de lien », l'élève travaille avec
  l'Explorer et ajoute le lien plus tard. Lien de classe et « Copier le
  lien » sous le QR code de chaque classe.
- Onglet Fiches : toutes les fiches de cours, par chapitre, avec recherche
  et fiches enregistrées.
- Suivi : ceintures en couleur, pour les parcours commencés.
- Correction : pastilles « Correcte » et « Incorrecte ».
- Ordinateur : lecture plus large en plein écran.
- Un parcours qui demande une version plus récente de l'app le dit.
- Parcours de l'Explorer : puissances (11e), fiches de 4e Collège corrigées.
```

`.play.txt` (moins de 500 caractères) :

```
<fr-FR>
- Explorer : les parcours de l'équipe MathALÉA arrivent sans mise à jour, selon le programme choisi.
- Sans lien de classe, l'élève travaille avec l'Explorer.
- Onglet Fiches : toutes les fiches de cours, avec recherche.
- Suivi : ceintures en couleur.
- Pastilles « Correcte » et « Incorrecte ».
</fr-FR>
```

## Limites de cette session

- Moteur : celui de la 0.4.12 (forge de Sésamath injoignable) ; le moteur
  courant (afce197) n'a pas pu être construit ni récupéré (l'artefact de
  l'APK d'essai 5685170 est sur un stockage refusé par le réseau).
- Pas de vrai téléphone ni d'émulateur Android ou iOS ; pas d'accès au
  kDrive réel de l'Explorer.
- Typst et GTK installés pour la session (Typst compilé depuis crates.io ;
  un binaire téléchargé a été refusé).
