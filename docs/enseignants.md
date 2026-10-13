# MathALÉA : guide enseignant

L'application permet de préparer des parcours d'exercices MathALÉA et de les
donner à une ou plusieurs classes. Les élèves travaillent hors connexion ;
leurs réponses et leurs scores restent sur leur appareil. Personne n'a de
compte, et l'application ne demande aucun mot de passe.

## Principe

1. Vous créez vos parcours dans l'application.
2. Vous exportez un fichier, `parcours-mathalea.json`.
3. Vous le déposez dans un dossier de votre drive partagé par lien public
   (lecture seule).
4. Les élèves ajoutent ce lien une fois. À chaque lancement, leur application
   récupère les nouveaux parcours et les nouvelles versions.

Un seul fichier contient toutes vos classes. Si le fichier contient plusieurs
classes, chaque élève choisit la sienne la première fois.

## Essayer avec le dossier de démonstration

Ces deux dossiers contiennent la même classe de démonstration (sept parcours) :

- kDrive : https://kdrive.infomaniak.com/app/share/120240/ba6c0e4d-4386-4789-80f5-8d824146b723
- Dropbox : https://www.dropbox.com/scl/fo/61ukfii2ul7wygvtn480a/AMdjmMSWDB0y5U5-HVi2oCU?rlkey=japzwkf6z8n5ocnc0ovxi4lrj&dl=0

Dans l'application, profil Élève, collez ce lien sur l'accueil, puis
« Ajouter le dossier ».

## Premier lancement

Choisissez le programme (France ou Suisse), puis « Enseignant ». Les deux
réglages se modifient plus tard dans Réglages (roue dentée).

En Suisse, l'éditeur propose les niveaux 9e à 4e Collège et le référentiel
suisse de MathALÉA ; les exercices utilisent les notations suisses.

## Créer un parcours

« Créer un parcours », puis six étapes. La touche Entrée passe au champ
suivant, puis à l'étape suivante.

1. **Classes** : cochez une ou plusieurs classes, ou ajoutez-en une.
   Un même parcours peut être donné à plusieurs classes.
2. **Chapitre** : un chapitre existant ou un nouveau. Les élèves voient leurs
   parcours rangés par chapitre.
3. **Parcours** : titre, objectif, niveau, type (Découverte, Entraînement,
   Approfondissement).
4. **Exercices** : recherchez par identifiant ou par titre (ex. `4C21`,
   `fractions`), ou collez un lien MathALÉA : les exercices sont repris avec
   leurs réglages (nombre de questions, paramètres). L'ordre se change avec
   les flèches.
5. **Pages et validation**
   - Pages : une page par question, une page par exercice, ou tous les
     exercices sur une page.
   - Validation et correction : après chaque question, à la fin de chaque
     page, ou à la fin du parcours. Dans ce dernier cas, rien n'est corrigé
     avant que l'élève soumette sa tentative, même en changeant de page.
6. **Récapitulatif** : « Aperçu élève » pour essayer le parcours,
   puis « Valider le parcours ».

Pour modifier un parcours, touchez-le dans votre liste : l'assistant s'ouvre
sur le récapitulatif. « Éditer un parcours existant » reprend un parcours
d'un dossier partagé (collègue, ressources), sous le même identifiant.

## Versions

Un parcours exporté puis modifié passe à la version suivante (V1, V2…).
Les élèves reçoivent la nouvelle version au prochain lancement. Une séance
commencée garde sa version ; les anciennes tentatives restent consultables
telles qu'elles ont été faites.

## Partager avec les élèves

1. Créez un dossier sur votre drive et partagez-le par lien public, en lecture
   seule.
2. Collez ce lien dans « Lien du dossier partagé », puis
   « Enregistrer le lien ».
3. « Exporter » enregistre `parcours-mathalea.json`. « Ouvrir le dossier »
   ouvre votre drive : déposez-y le fichier en remplaçant l'ancien.
4. Donnez le lien aux élèves (projection, QR code, ENT…).

À chaque modification : Exporter, puis déposer le fichier en remplaçant
l'ancien. Le lien ne change pas.

### Drives pris en charge

| Drive | Lien à donner |
| --- | --- |
| kDrive | lien de partage du dossier |
| Dropbox | lien de partage du dossier |
| Google Drive | lien de partage du **fichier** `parcours-mathalea.json` (Google ne permet pas de lire un dossier sans clé) ; en remplaçant le fichier, choisir « Remplacer » pour garder le même lien |
| Nextcloud, autres | lien du dossier ou du fichier |

## Ce que voient les élèves

- Leurs parcours par chapitre ; ils peuvent replier et réordonner les
  chapitres, et épingler des parcours sur l'accueil.
- Pendant le travail : clavier mathématique de MathALÉA, sauvegarde
  automatique, reprise exacte après fermeture. Avant de soumettre, l'application
  signale les questions sans réponse ou non vérifiées et place le curseur sur
  la première.
- Le score retient la première vérification de chaque question.
- Le bilan permet de revoir chaque exercice, de tout refaire avec de nouvelles
  valeurs ou de reprendre seulement les exercices à améliorer.
- L'onglet Suivi montre l'activité et les passages successifs.

## Sessions communes

Dans un parcours, « Session partagée » donne un code (ex. `1k3lr`). Toutes les
personnes qui entrent ce code avec « Rejoindre une session » ont exactement les
mêmes exercices : utile pour corriger ensemble au tableau ou travailler en
groupe.

## Sauvegarde

Réglages, « Exporter une sauvegarde » : un fichier avec les réglages, les liens,
vos parcours et le suivi. « Restaurer une sauvegarde » le recharge sur un
autre appareil. Une sauvegarde invalide ne modifie rien.
