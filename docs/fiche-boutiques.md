# Fiche des boutiques (Google Play, App Store)

Textes et réponses à reprendre dans la Play Console (et plus tard dans App
Store Connect). Captures : `node e2e/fiche-play.mjs <dossier>` (pnpm dev,
parcours de démonstration ; téléphone 1620 × 2880, tablette 7 pouces
1440 × 2304, tablette 10 pouces 1600 × 2560 : accueil, paliers, ceintures,
question, session partagée, QR code de la session) ; image de présentation 1024 × 500 :
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

- Explorer : des parcours proposés par l’équipe MathALÉA, rangés par niveau et par chapitre, utilisables par tous, sans enseignant.
- Les parcours de la classe arrivent du dossier partagé de l’enseignant (kDrive, Dropbox, Nextcloud…) : il suffit de scanner le QR code de la classe ou de coller son lien.
- Paliers et ceintures : on avance à son rythme, avec des fiches de cours, des pauses et des ressources pour revoir.
- Correction immédiate, clavier mathématique, figures.
- Suivi par objectif : ce qui est réussi, ce qui reste à revoir.
- Révisions espacées : les exercices déjà faits reviennent au bon moment, mélangés, en séances courtes de 3, 6 ou 10 questions.
- Sessions partagées : un code ou un QR code, et tout le groupe a les mêmes questions.
- Fonctionne hors ligne une fois les parcours reçus.

Pour les enseignants : les parcours se préparent sur le site MathALÉA (page « Parcours pour l’application ») et se publient en un fichier dans un dossier partagé. Aucun compte, aucune inscription.

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
  (élèves de 6e à la Terminale). Moins de 13 ans : règlement
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
  Caméra (QR codes de classe et de session, scannés par l'élève) : image lue sur l'appareil, rien n'est envoyé, aucune
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
  « Pour les enfants » (Made for Kids) : l'app sert aussi aux lycéens, et
  cette catégorie impose des règles propres à Apple.
- **Copyright** : 2026 CoopMaths (nom du compte Apple : COOPMATHS).
- **Droits sur le contenu** : l'app ne contient que du contenu de CoopMaths
  (exercices MathALÉA, licence AGPL) : « Non » à la question sur le contenu
  de tiers.
- **Classification par âge** (questionnaire d'Apple) : « Aucun » partout,
  pas d'accès libre au Web, pas de jeux d'argent : 4+. Contenu généré par les
  utilisateurs : oui, depuis la 0.6 (parcours des dossiers partagés des
  enseignants), avec les moyens exigés par la règle 1.2 : « Signaler un
  problème » sur chaque parcours (mail à contact@coopmaths.fr avec son
  contenu), cacher le parcours, retirer le dossier, contact dans les Réglages.
  Limite et piste : `docs/avenir-espace-enseignant.md`.
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
  dev), mêmes écrans que pour Google Play. Captures du 6 novembre 2026
  (version 0.6.0, élève seul) : `docs/app-store/` (`iphone-6-9-*`,
  `iphone-6-3-*` réduites à 1206 × 2622, `ipad-13-*`). Notes pour la
  vérification et déroulé de la vidéo : `docs/app-store/notes-verification-0.6.0.txt`,
  `docs/app-store/video-verification-0.6.0.md`.

### Informations pour la vérification d'Apple

Aucun compte de démonstration : l'app n'a pas de compte. Notes, en anglais
(langue des vérificateurs) :

```
MathALÉA is a free, open-source maths practice app for students, made by CoopMaths, a non-profit association of maths teachers (France and French-speaking Switzerland). No account, no login, no ads, no tracking, no in-app purchase.

What the app does beyond the MathALÉA website: it stores each student's progress on the device (paths, levels and belts, results per learning objective, spaced revision) and works fully offline once a path has been received. The website only generates exercises; it keeps no progress over time.

Since version 0.6 the app is for students only. Teachers prepare paths on the MathALÉA website and publish them as a file in a shared folder of their own cloud drive; students add that folder with its link or by scanning a QR code.

How to test without a class:
1. Open the app and choose a curriculum ("France" or "Suisse").
2. Explorer tab: paths proposed by the MathALÉA team, by grade and chapter (downloaded from CoopMaths' public kDrive folder, so the first opening needs an internet connection; afterwards the copy works offline). Open a path, for example "Additionner et soustraire des relatifs" (5e, France), tap "Commencer" and answer with the maths keyboard: each answer is corrected immediately and the progress is saved on the device. With "France", "Teste ton niveau" gives a 15-question test.
3. To see a teacher's class, paste this demonstration folder link in the field "Lien de partage donné par ton enseignant" on the home screen ("Mes parcours"), then tap "Ajouter le dossier":
https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/raw/main/static/demo/parcours-demonstration.json
A class "Démonstration" with four paths appears. The QR code icon at the top of the home screen does the same by scanning the QR code of such a link.
4. Shared session: on a path page, "Autres actions" > "Session partagée" shows a 5-character code and its QR code. Another device scans it from its home screen (QR code icon) and gets exactly the same questions.

User-generated content (Guideline 1.2): paths from a teacher's folder are shown to students. Every path page has "Autres actions" > "Signaler un problème" (report a problem): it opens an email to contact@coopmaths.fr containing the path and the link of the folder it comes from, for any bug, error or inappropriate content. The same sheet lets the student hide the path ("Cacher ce parcours"); a folder can be removed in Settings ("Réglages" > "Dossiers partagés"), which blocks everything from that teacher. The contact address is also shown in Settings ("À propos").

Camera: used only to read QR codes (the link of a class folder, or a shared session code). Images stay on the device and are never stored or sent.

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
