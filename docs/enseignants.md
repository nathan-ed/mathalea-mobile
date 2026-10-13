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

Un seul fichier contient toutes vos classes : un seul dossier, un seul lien
pour tous vos élèves. Si le fichier contient plusieurs classes, chaque élève
choisit la sienne la première fois.

## Dossiers partagés

Un dossier partagé est un dossier de drive ouvert en lecture par un lien public.
L'application lit tous les fichiers `.json` de parcours placés directement dans
ce dossier (les sous-dossiers ne sont pas lus) : la banque complète
`parcours-mathalea.json`, des parcours seuls… Un parcours présent dans plusieurs
fichiers n'apparaît qu'une fois, dans sa version la plus récente.

- Un élève peut suivre plusieurs dossiers (changement d'enseignant en cours
  d'année, ressources d'un autre collègue) : Réglages, « Dossiers partagés ».
  Le premier s'ajoute aussi depuis l'accueil.
- Un enseignant peut ajouter les dossiers de ses collègues (Réglages,
  « Dossiers partagés ») : leurs parcours apparaissent dans « Éditer un parcours
  existant », prêts à être repris.
- Retirer un dossier ne supprime ni les résultats ni le suivi de l'élève.

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

## Créer ou modifier un parcours

« Créer un parcours » ouvre un seul écran, à remplir dans l'ordre que vous
voulez. Pour modifier un parcours, touchez-le dans votre liste : tout est
déjà rempli, chaque réglage se change sur place.

- **Classes** : touchez une classe pour la cocher (les vôtres et celles des
  dossiers partagés que vous suivez), ou ajoutez-en une. Un même parcours peut
  aller à plusieurs classes.
- **Chapitre** : touchez un chapitre existant ou tapez-en un nouveau. Les
  chapitres des classes cochées viennent en premier.
- **Parcours** : titre, objectif, niveau, type (Découverte, Entraînement,
  Approfondissement).
- **Exercices** : « Ajouter des exercices » ouvre le référentiel comme sur le
  site (niveau, puis chapitre, ou recherche par identifiant ou titre). Touchez
  un exercice : nombre de questions, paramètres du site et aperçu, puis
  « Ajouter au parcours ». Un lien MathALÉA collé ajoute ses exercices avec
  leurs réglages. Dans la liste, touchez un exercice pour changer ses réglages,
  le titre vu par les élèves (ou le masquer avec l'icône œil) ; les flèches
  changent l'ordre.
- **Pages et validation**
  - Pages : une page par question, une page par exercice, ou tous les
    exercices sur une page.
  - Validation et correction : après chaque question, à la fin de chaque
    page, ou à la fin du parcours. Dans ce dernier cas, rien n'est corrigé
    avant que l'élève soumette sa tentative, même en changeant de page.

En bas : « Aperçu élève » pour essayer, et « Valider le parcours » (ou
« Enregistrer et quitter »). Tant qu'il manque une information, la ligne
« À compléter » dit laquelle.

Après l'enregistrement, l'accueil propose :

- **Télécharger tous les parcours** : `parcours-mathalea.json`, à déposer dans
  votre dossier partagé en remplaçant l'ancien ;
- **Télécharger ce parcours seul** : un fichier avec ce seul parcours, à
  déposer à côté des autres ou à donner à un collègue.

« Éditer un parcours existant » reprend un parcours des dossiers partagés que
vous suivez (collègue, ressources) ou d'un fichier importé, avec ses classes
et ses réglages, sous le même identifiant.

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
- L'onglet Explorer propose les parcours de l'équipe MathALÉA ; l'élève peut
  en ajouter à son accueil.

## Sessions communes

Dans un parcours, « Session partagée » donne un code (ex. `1k3lr`). Toutes les
personnes qui entrent ce code avec « Rejoindre une session » ont exactement les
mêmes exercices : utile pour corriger ensemble au tableau ou travailler en
groupe.

## Sauvegarde

Réglages, « Exporter une sauvegarde » : un fichier avec les réglages, les liens,
vos parcours et le suivi. « Restaurer une sauvegarde » le recharge sur un
autre appareil. Une sauvegarde invalide ne modifie rien.
