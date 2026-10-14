# MathALÉA : guide enseignant

L'application permet de préparer des parcours d'exercices MathALÉA et de les
donner à une ou plusieurs classes. Les élèves travaillent hors connexion ;
leurs réponses et leurs scores restent sur leur appareil. Personne n'a de
compte, et l'application ne demande aucun mot de passe.

## Principe

1. Vous créez vos parcours dans l'application (onglet Créer).
2. Vous publiez : l'application enregistre un fichier daté, par exemple
   `parcours-mathalea-2026-10-14-15h32.json`.
3. Vous le déposez dans un dossier de votre drive partagé par lien public
   (lecture seule).
4. Les élèves ajoutent ce lien une fois. À chaque lancement, leur application
   récupère les nouveaux parcours et les nouvelles versions.

Un seul fichier contient toutes vos classes : un seul dossier, un seul lien
pour tous vos élèves. Si le fichier contient plusieurs classes, chaque élève
choisit la sienne la première fois ; vous, avec le réglage Enseignant, les
voyez toutes et passez de l'une à l'autre par les pastilles en haut de
« Mes parcours ».

## Dossiers partagés

Un dossier partagé est un dossier de drive ouvert en lecture par un lien public.
L'application lit tous les fichiers `.json` de parcours placés directement dans
ce dossier, quel que soit leur nom (les sous-dossiers ne sont pas lus). Parmi
vos publications, seule la plus récente compte : les anciennes peuvent rester
dans le dossier, un parcours retiré ne revient pas. Un parcours seul exporté
s'ajoute ; présent dans plusieurs fichiers, il n'apparaît qu'une fois, dans sa
version la plus récente.

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

Dans l'application, collez ce lien sur l'accueil, puis « Ajouter le dossier ».

## Premier lancement

Choisissez le programme (France ou Suisse). Puis, dans les Réglages (roue
dentée), cochez **Je suis enseignant** : l'onglet **Créer** s'ajoute aux
onglets des élèves (Mes parcours, Explorer, Suivi), que vous gardez pour
essayer les parcours comme eux. Les élèves ne voient jamais Créer.

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
  leurs réglages (« Importer depuis un lien MathALÉA »). Dans la liste, touchez un exercice pour changer ses réglages,
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

Après l'enregistrement, un panneau propose **Publier pour les élèves** (voir
plus bas) et **Exporter ce parcours seul** : un fichier
`parcours-<titre>-<date>.json` avec ce seul parcours, à déposer à côté des
autres ou à donner à un collègue.

En bas de l'éditeur d'un parcours enregistré, « Autres actions » propose
**Dupliquer** (une copie, nouveau parcours en V1, par exemple pour une autre
classe), **Exporter ce parcours seul** et **Supprimer le parcours**.

**Éditer un parcours existant** regroupe tout ce qui se modifie : vos
parcours, ceux des dossiers partagés que vous suivez (collègue, ressources)
et ceux d'un fichier importé. Un parcours repris garde ses classes, ses
réglages et son identifiant : vous le modifiez pour vos propres élèves. Un
fichier qui ne contient qu'un parcours s'ouvre directement dans l'éditeur.

Dans l'onglet Créer, les pastilles passent d'une classe à l'autre, et les
flèches à gauche d'un parcours changent sa place dans la classe : c'est
l'ordre que voient les élèves.

## Versions

Un parcours publié puis modifié passe à la version suivante (V1, V2…).
Les élèves reçoivent la nouvelle version au prochain lancement, sans rien
voir d'autre :

- corriger une erreur (titre, réglage, nombre de questions, ordre) ne remet
  pas leurs résultats à zéro : chaque exercice resté dans le parcours garde
  son dernier résultat, et seul un exercice ajouté part de zéro ;
- une séance commencée se termine dans sa version ;
- un passage déjà fait se relit tel qu'il a été fait (même version, mêmes
  questions, même nombre de questions).

## Partager avec les élèves

Tant que le dossier partagé n'est pas renseigné, l'onglet Créer affiche une
« Mise en route » :

1. Créez un dossier sur votre drive et partagez-le par lien public, en lecture
   seule.
2. Collez ce lien dans « Lien du dossier partagé », puis
   « Enregistrer le lien ».
3. **Publier** enregistre `parcours-mathalea-<date>.json` (sur Android : ouvre
   le partage, choisissez l'app de votre drive). Déposez-le dans le dossier ;
   inutile de supprimer les anciens.
4. Donnez le lien aux élèves (projection, QR code, ENT…).

Ensuite, une ligne en haut de l'onglet Créer dit si tout est à jour chez les
élèves, ou combien de parcours ne le sont pas encore, avec **Publier** s'il y
a quelque chose à envoyer. « Dossier partagé » ouvre le dossier sur votre
drive ou change le lien (celui des élèves ne change pas tant que vous gardez
le même dossier).

### Drives pris en charge

| Drive | Lien à donner |
| --- | --- |
| kDrive | lien de partage du dossier |
| Dropbox | lien de partage du dossier |
| Nextcloud (dont le Nuage d'apps.education.fr) | lien de partage du dossier |
| Google Drive | lien de partage du **fichier** (Google ne permet pas de lire un dossier sans clé) ; pour une nouvelle publication, « Gérer les versions », puis importer le nouveau fichier : le lien reste le même |
| Autres serveurs | lien d'un fichier, ou d'un dossier qui contient `parcours-mathalea.json` |

## Ce que voient les élèves

- Leurs parcours par chapitre ; ils peuvent replier et réordonner les
  chapitres, et épingler des parcours sur l'accueil.
- Pendant le travail : clavier mathématique de MathALÉA, sauvegarde
  automatique, reprise exacte après fermeture. Avant de soumettre, l'application
  signale les questions sans réponse ou non vérifiées et place le curseur sur
  la première.
- En quittant une activité : reprendre plus tard, terminer tout de suite
  (bilan avec ce qui est fait) ou supprimer la tentative. Les passages
  terminés restent.
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
