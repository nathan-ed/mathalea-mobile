# Fiche des boutiques (Google Play, App Store)

Textes et réponses à reprendre dans la Play Console (et plus tard dans App
Store Connect). Captures : `node e2e/fiche-play.mjs <dossier>` (pnpm dev,
parcours de démonstration ; téléphone 1620 × 2880, tablette 7 pouces
1440 × 2304, tablette 10 pouces 1600 × 2560 : accueil, paliers, ceintures,
question, bibliothèque, éditeur) ; image de présentation 1024 × 500 :
`node e2e/image-presentation.mjs docs/play-store` (en-tête de l'app agrandi,
niveaux de la France et de la Suisse romande, deux écrans) ; icône 512 × 512 :
`src-tauri/icons/icon.png`.

Images de la fiche du 28 octobre 2026 (version 0.4.6) : `docs/play-store/`
(téléphone 9:16 : accueil avec l'icône de scan, paliers, ceintures, question,
fiche de cours et ceintures de « Primitives » rognées depuis les captures
d'Explorer ; image de présentation).

## Fiche

- **Nom** : MathALÉA
- **Description courte** (80 caractères au plus) :
  Parcours d’exercices de maths corrigés, pour la France et la Suisse, hors ligne.
- **Description complète** :

```
MathALÉA, par CoopMaths, propose des parcours d’exercices de mathématiques corrigés aussitôt : de la 6e à la Terminale (programmes de France) et de la 9e à la 4e du Collège (programmes de Suisse romande). Chaque exercice est généré au hasard : on peut le refaire autant de fois qu’on veut, avec de nouvelles questions.

Pour les élèves
- Les parcours de la classe arrivent du dossier partagé de l’enseignant (kDrive, Dropbox, Nextcloud…).
- Paliers et ceintures : on avance à son rythme, avec le seuil de réussite fixé par l’enseignant, des pauses et des ressources pour revoir.
- Correction immédiate, clavier mathématique, figures.
- Suivi par objectif : ce qui est réussi, ce qui reste à revoir.
- Révisions espacées : les exercices déjà faits reviennent au bon moment, mélangés, en séances courtes de 3, 6 ou 10 questions.
- Sessions de classe : l’enseignant projette un QR code, l’élève le scanne avec la caméra, et toute la classe a les mêmes questions.
- Fonctionne hors ligne une fois les parcours reçus.

Pour les enseignants
- Créer un parcours en quelques minutes à partir des exercices de MathALÉA, ou d’un lien du site.
- Bibliothèque rangée par niveau et chapitre, parcours donnés aux classes.
- Objectifs du programme posés automatiquement, liste d’objectifs importable (CSV).
- Publication en un fichier dans un dossier partagé : aucun compte, aucune inscription.
- Réponses de la classe relevées par QR code (l’élève le montre, l’enseignant le scanne avec la caméra), revérifiées par l’application : réussite, erreurs fréquentes, détail par élève.

Respect de la vie privée
Aucun compte, aucune publicité, aucun outil de suivi. Les réponses et les résultats des élèves restent sur leur appareil.

Logiciel libre (licence AGPL), développé par des enseignants de l’association CoopMaths.
```

- **Catégorie** : Éducation. **Adresse e-mail** : contact@coopmaths.fr.
  **Site web** : https://coopmaths.fr.
- **Politique de confidentialité** :
  https://coopmaths.forge.apps.education.fr/mathalea-mobile/confidentialite.html
  (Pages de la forge, job `pages` de `.gitlab-ci.yml`, copie de
  `static/confidentialite.html` ; seules les Pages sont publiques, le dépôt
  reste privé).

## Contenu de l'application (Play Console)

- **Accès** : toutes les fonctionnalités sans identifiant ni accès particulier.
- **Annonces** : aucune.
- **Classification du contenu** (questionnaire IARC) : catégorie « Référence,
  actualités ou éducation » ; aucune violence, sexualité, langage grossier,
  substance, jeu d'argent ; pas d'échange entre utilisateurs ; pas d'achat.
- **Public cible** : 9 à 12 ans, 13 à 15 ans, 16 à 17 ans, 18 ans et plus
  (élèves de 6e à la Terminale, enseignants). Moins de 13 ans : règlement
  Familles de Google Play (aucune publicité, aucune donnée collectée, aucun
  SDK tiers).
- **Sécurité des données** : aucune donnée collectée, aucune donnée partagée.
  Données chiffrées en transit : oui (HTTPS). Suppression : rien n'est
  collecté ; tout disparaît à la désinstallation. La fiche du Play Store
  affichait pourtant que le développeur n'explique pas comment supprimer les
  données (Nathan, 1er novembre 2026). À faire par Nathan dans la Play Console
  (Contenu de l'application › Sécurité des données), quand Google le
  permettra : si une question porte sur la suppression, répondre que
  l'utilisateur peut supprimer ses données (désinstallation ou « Effacer les
  données » d'Android) et donner le lien
  https://coopmaths.forge.apps.education.fr/mathalea-mobile/confidentialite.html#supprimer
  (section « Supprimer vos données » de la politique).
  Caméra (QR codes de session scannés par l'élève, QR codes de réponses scannés par l'enseignant) : image lue sur l'appareil, rien n'est envoyé, aucune
  déclaration. L'analyse des réponses par une IA est mise de côté (branche
  locale `analyse-ia`, avec ce qu'il faudrait alors déclarer à Google) :
  « aucune donnée collectée » reste exact.
- **Application gouvernementale, financière, de santé, d'actualités** : non.

## App Store (App Store Connect)

À remplir une fois le compte de l'association ouvert (marche à suivre :
`docs/iphone.md`). Description complète : celle de Google Play ci-dessus,
précédée de ce paragraphe, qui répond d'avance à la règle 4.2 d'Apple (une
app doit faire plus qu'un site) :

```
Ce que le site ne fait pas : l’application garde la progression de chaque élève sur son appareil, parcours par parcours, ceinture par ceinture, et fonctionne sans connexion une fois les parcours reçus.
```

- **Nom** (30 caractères au plus) : MathALÉA. Si Apple le refuse (nom déjà
  pris) : « MathALÉA CoopMaths ».
- **Sous-titre** (30 au plus) : Exercices de maths hors ligne
- **Texte promotionnel** (170 au plus, modifiable sans nouvelle version) :
  Des parcours d’exercices de maths corrigés aussitôt, qui gardent la
  progression de chaque élève sur son appareil, même sans connexion.
- **Mots-clés** (100 au plus, sans espace après les virgules) :
  `maths,mathématiques,exercices,collège,lycée,brevet,bac,révisions,calcul,géométrie,algèbre,ceintures`
- **URL d'assistance** : https://coopmaths.fr. **URL marketing** :
  https://coopmaths.fr. **Politique de confidentialité** : la même adresse
  que pour Google Play.
- **Catégorie** : Éducation (principale), aucune secondaire. Pas la catégorie
  « Pour les enfants » (Made for Kids) : l'app sert aussi aux enseignants et
  aux lycéens, et cette catégorie impose des règles propres à Apple.
- **Copyright** : 2026 CoopMaths (nom du compte Apple : COOPMATHS).
- **Droits sur le contenu** : l'app ne contient que du contenu de CoopMaths
  (exercices MathALÉA, licence AGPL) : « Non » à la question sur le contenu
  de tiers.
- **Classification par âge** (questionnaire d'Apple) : « Aucun » partout,
  pas d'accès libre au Web, pas de contenu généré par les utilisateurs, pas
  de jeux d'argent : 4+.
- **Confidentialité de l'app** (étiquettes) : « Données non collectées ».
  Le manifeste `src-tauri/PrivacyInfo.xcprivacy` dit la même chose (aucun
  suivi, aucune donnée collectée), avec les API système déclarées.
- **Chiffrement (export)** : réglé dans `src-tauri/Info.ios.plist`
  (`ITSAppUsesNonExemptEncryption` à faux, HTTPS du système seulement) : pas
  de question à l'envoi.
- **Appareils** : iPhone et iPad. Captures exigées (App Store Connect,
  novembre 2026) : « iPhone avec Dynamic Island (écran moyen) », 6,1 ou
  6,3 pouces (1206 × 2622 : captures 6,9 pouces réduites par
  `magick <f> -resize '1206x2622!'`, mêmes proportions) et iPad 13 pouces
  (2064 × 2752). Captures 6,9 pouces :
  `APPAREILS=iphone-6-9,ipad-13 node e2e/fiche-play.mjs <dossier>` (pnpm
  dev), mêmes écrans que pour Google Play. Captures du 31 octobre 2026
  (version 0.4.10) : `docs/app-store/`.
- **Captures habillées** (à envoyer à Apple, qui n'a pas d'image de
  présentation : les trois premières captures iPhone s'affichent dans les
  résultats de recherche) : `node e2e/captures-app-store.mjs` (pnpm dev, ou
  `BASE=…`) lit les captures brutes de `docs/app-store/` et écrit
  `docs/app-store/habillees/` : une phrase au-dessus de chaque écran, et sur la
  première le logo et les niveaux de la France et de la Suisse romande avec
  leurs drapeaux, comme l'image de présentation de Google Play. Tailles
  exactes : `iphone-6-9-*` (1320 × 2868), `iphone-6-3-*` (1206 × 2622) et
  `ipad-13-*` (2064 × 2752), PNG sans transparence.
- **En-tête et résultats de recherche** (Creative assets, iOS 27, section
  « En-tête et résultats de recherche » de la page produit) :
  `node e2e/visuels-app-store.mjs` (pnpm dev, ou `BASE=…`) écrit
  `docs/app-store/visuels/en-tete.png` (21:9, 3840 × 1646) et
  `resultats-recherche.png` (3:2, 3840 × 2560). Au centre, dans la zone
  qu'Apple ne rogne jamais (1646 × 661 pour l'en-tête, 2168 × 1030 pour la
  recherche) : logo, phrase, niveaux de la France et de la Suisse romande avec
  leurs drapeaux. Sur les côtés, des écrans de l'app, qui peuvent être coupés.
  `ZONE=1` trace la zone sûre pour vérifier. Pas de prix, d'adresse web ni de
  symbole de copyright dans ces images (règles d'Apple).

### Informations pour la vérification d'Apple

Aucun compte de démonstration : l'app n'a pas de compte. Notes, en anglais
(langue des vérificateurs) :

```
MathALÉA is a free, open-source maths practice app made by CoopMaths, a non-profit association of maths teachers (France and French-speaking Switzerland). No account, no login, no ads, no tracking, no in-app purchase.

What the app does beyond the MathALÉA website: it stores each student's progress on the device (paths, levels and belts, results per learning objective, spaced revision) and works fully offline once a path has been received. The website only generates exercises; it keeps no progress over time.

How to test without a class:
1. Open the app and choose a curriculum ("France" or "Suisse").
2. Open Settings ("Réglages"), turn on "Je suis enseignant" (I am a teacher) and go back. In the "Parcours" tab, tap "Parcours de démonstration", then "Charger les parcours de démonstration" (load the demonstration paths). A class "Démonstration" appears.
3. In the teacher space, tap "Vue élève" (student view) and open a path, for example "Relatifs en ceintures". Answer the questions with the maths keyboard: each answer is corrected immediately and the progress is saved on the device.
4. The "Explorer" tab lists the paths proposed by the MathALÉA team for the chosen curriculum, by grade and chapter (downloaded from CoopMaths' public kDrive folder, so the first opening needs an internet connection; afterwards the copy works offline). The ⊕ button next to a path adds it to the student's home screen; "Tout ajouter" (add all) adds every path of the grade. With the "France" curriculum, "Teste ton niveau" gives a 15-question test with a report.
5. A student without a class link taps "Je n'ai pas de lien" on the home screen and works with the Explorer paths. The "Fiches" tab gathers the lesson sheets of all the student's paths (search, bookmarks).

Camera: used only to read QR codes (a student scans the code projected by the teacher to join a class session; the teacher scans the QR codes of students' answers). Images stay on the device.

Exercises are generated by the MathALÉA engine bundled in the app; the app never downloads executable code.
Contact: contact@coopmaths.fr
```

## Notes de version

Version 0.4.7 (production, depuis la 0.2.4, 500 caractères au plus) :

```
<fr-FR>
- Rejoindre sa classe en scannant un QR code : l'enseignant le projette, l'élève le vise depuis son accueil, sans lien à saisir.
- Sessions de classe : QR code projeté par l'enseignant, réponses relevées par QR code.
- Espace enseignant en quatre onglets, avec « Vue élève ».
- Teste ton niveau, fiches de cours, révisions espacées, paliers ouverts à une date.
- Tous les exercices du site, explorés par degré et chapitre.
- Changer d'appareil : « Récupérer mes données ».
</fr-FR>
```

Version 0.4.8 (depuis la 0.2.4 : les 0.4.6 et 0.4.7 ne sont pas parties en
production ; texte dans `docs/notes-de-version/v0.4.8.play.txt`) :

```
<fr-FR>
- Rejoindre sa classe en scannant un QR code projeté par l'enseignant.
- Sessions de classe : QR code projeté, réponses relevées par QR code.
- Espace enseignant en quatre onglets, avec « Vue élève ».
- Teste ton niveau : 15 questions et un bilan.
- Fiches de cours, révisions espacées, paliers ouverts à une date.
- Tous les exercices du site, explorés par degré et chapitre.
- Changer d'appareil : « Récupérer mes données ».
- Les écrans défilent de nouveau au doigt.
</fr-FR>
```

Version 0.4.6 (depuis la 0.2.4, 500 caractères au plus) :

```
<fr-FR>
- Sessions de classe : l'enseignant projette un QR code, les élèves le scannent avec la caméra, puis il relève les réponses de la classe par QR code.
- Espace enseignant en quatre onglets, avec « Vue élève ».
- Teste ton niveau : 15 questions et un bilan.
- Fiches de cours avant l'entraînement, révisions espacées, paliers ouverts à une date.
- Tous les exercices du site, explorés par degré et chapitre.
- Changer d'appareil : « Récupérer mes données ».
</fr-FR>
```

Version 0.4.4 :

```
<fr-FR>
- Enseignant : quatre onglets, Parcours, Classes, En classe et Explorer. « Vue élève » montre l'application comme vos élèves.
- Chaque parcours a sa page : classes, publication, lancer une session, essayer, modifier.
- Les sessions se rangent par classe.
</fr-FR>
```

Version 0.4.3 :

```
<fr-FR>
- Enseignant : nouvel onglet En classe, qui regroupe les sessions. « Lancer la session » affiche directement son QR code et son code.
- Le bouton retour repasse toujours par l'accueil avant de quitter l'application.
</fr-FR>
```

Version 0.4.2 :

```
<fr-FR>
- Révisions espacées : les exercices déjà faits reviennent au bon moment, mélangés, en séances de 3, 6 ou 10 questions.
- Sessions de classe : QR code à projeter ou à envoyer en image ; les élèves le scannent depuis l'accueil.
- Réponses de la classe relevées par QR code, analyse des erreurs par une IA au choix, sans prénom envoyé.
</fr-FR>
```

Première version :

```
<fr-FR>
Première version sur Google Play.
- Parcours MathALÉA hors ligne, reçus depuis le dossier partagé de l'enseignant (kDrive, Dropbox, Nextcloud…).
- Paliers et ceintures, seuil de réussite, pauses et ressources pour revoir.
- Espace enseignant : bibliothèque de parcours, classes, objectifs et suivi par objectif.
- Aucun compte, aucune publicité : aucune donnée de l'élève ne quitte l'appareil.
</fr-FR>
```
