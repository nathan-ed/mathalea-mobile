# MathALÉA : guide enseignant

Depuis la version 0.6, l'application est celle des élèves. Vous préparez les
parcours sur le site MathALÉA ; les élèves travaillent hors connexion, leurs
réponses et leurs scores restent sur leur appareil. Personne n'a de compte.
Guide illustré : https://coopmaths.forge.apps.education.fr/mathalea-mobile/
(source `docs/guide/`).

## Principe

1. Vous créez vos parcours sur le site MathALÉA, page « Parcours pour
   l'application » (`?v=parcours`), et vous les donnez à vos classes.
2. « Publier » télécharge un fichier daté, par exemple
   `parcours-mathalea-2026-10-14-15h32.json`.
3. Vous le déposez dans un dossier de votre drive partagé par lien public
   (lecture seule).
4. Les élèves ajoutent ce lien une fois, ou scannent le QR code de leur
   classe. À chaque lancement, leur application récupère les nouveaux
   parcours et les nouvelles versions.

Un seul fichier contient toutes vos classes : un seul dossier, un seul lien
pour tous vos élèves. Si le fichier contient plusieurs classes, chaque élève
choisit la sienne la première fois.

## Dossiers partagés

Un dossier partagé est un dossier de drive ouvert en lecture par un lien public.
L'application lit tous les fichiers `.json` de parcours placés directement dans
ce dossier, quel que soit leur nom (les sous-dossiers ne sont pas lus). Parmi
vos publications, seule la plus récente compte : les anciennes peuvent rester
dans le dossier, un parcours retiré ne revient pas. Un parcours présent dans
plusieurs fichiers n'apparaît qu'une fois, dans sa version la plus récente.

- Un élève peut suivre plusieurs dossiers (changement d'enseignant en cours
  d'année, ressources d'un autre collègue) : Réglages, « Dossiers partagés ».
  Le premier s'ajoute aussi depuis l'accueil.
- Retirer un dossier ne supprime ni les résultats ni le suivi de l'élève.

## Essayer avec le dossier de démonstration

Dans l'application, collez ce lien sur l'accueil, puis « Ajouter le dossier » :
https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/raw/main/static/demo/parcours-demonstration.json

### Drives pris en charge

| Drive | Lien à donner |
| --- | --- |
| kDrive | lien de partage du dossier |
| Dropbox | lien de partage du dossier |
| Nextcloud (dont le Nuage d'apps.education.fr) | lien de partage du dossier |
| Google Drive | lien de partage du **fichier** (Google ne permet pas de lire un dossier sans clé) ; pour une nouvelle publication, « Gérer les versions », puis importer le nouveau fichier : le lien reste le même |
| Autres serveurs | lien d'un fichier, ou d'un dossier qui contient `parcours-mathalea.json` |

Lien d'une classe : ajoutez `?classe=` et le nom de la classe à la fin du lien
du dossier (`…/share/120240/a9e2…?classe=3A`, ou `&classe=3A` si le lien a
déjà un `?`). L'élève qui le colle, ou qui scanne un QR code de ce lien, arrive
directement dans sa classe.


## QR code de la classe

Faites un QR code du lien de la classe (lien du dossier suivi de
`?classe=…`) avec n'importe quel générateur (Chrome et Edge : « Créer un code
QR pour cette page »). Les élèves le scannent avec l'icône QR code en haut de
leur accueil, ou avec « Scanner le QR code de ma classe » sur l'accueil vide.
Les QR codes de classe affichés par l'app jusqu'à la 0.5 (`MACLA1.…`) restent
lisibles.

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

## Ce que voient les élèves

- Leurs parcours par chapitre ; ils peuvent replier et réordonner les
  chapitres ; l'épingle d'une tuile met le parcours en haut de l'accueil,
  l'œil le cache (il est rangé dans « Parcours cachés », en bas, d'où l'œil
  ouvert le remet ; ses ceintures sont gardées). Dans l'Explorer, le « + »
  d'un parcours l'ajoute à l'accueil, « ✓ » l'en retire. Un parcours à
  paliers affiche sa progression (« 1/3 »).
- Pendant le travail : clavier mathématique de MathALÉA, sauvegarde
  automatique, reprise exacte après fermeture. « Vérifier » et « Passer »
  restent en bas, sous le clavier. Avant de soumettre, ou en touchant
  « Terminer » après des questions passées, l'application signale les
  questions sans réponse ou non vérifiées et propose d'y revenir.
- En quittant une activité : reprendre plus tard, terminer tout de suite
  (bilan avec ce qui est fait) ou supprimer la tentative. Les passages
  terminés restent.
- Le score retient la première vérification de chaque question.
- Le bilan permet de revoir chaque exercice, de tout refaire avec de nouvelles
  valeurs ou de reprendre seulement les exercices à améliorer.
- L'onglet Suivi montre l'activité et les passages successifs, les
  **objectifs** travaillés (meilleur niveau atteint, de « Insuffisante » à
  « Très bonne maîtrise », et la dernière fois travaillé, au toucher) et les
  **ceintures** obtenues.
- **Révisions**, en haut de « Mes parcours » : les exercices des parcours
  terminés reviennent au bon moment (le lendemain, dans 3 jours, une semaine,
  puis plus espacés s'ils sont réussis), avec de nouvelles valeurs, mélangés
  entre chapitres et sans titre. L'élève choisit 3, 6 ou 10 questions et les
  chapitres à réviser ; aucun nombre d'exercices en retard n'est affiché. Rien à
  régler côté enseignant. Les révisions comptent dans le suivi des objectifs.
- L'icône QR code en haut de l'accueil lit le QR code d'une session (l'élève
  arrive directement dans la session) ou d'une classe (le dossier est
  ajouté, sa classe choisie).
- L'onglet Explorer propose les parcours de l'équipe MathALÉA du programme
  choisi (France ou Suisse), par degré puis par chapitre, avec les noms du
  référentiel de MathALÉA ; seuls les degrés qui ont des parcours apparaissent.
  Ces parcours sont lus sur un dossier kDrive de CoopMaths (sous-dossier du
  programme choisi) : la première ouverture demande une connexion, l'app
  garde ensuite sa copie. Un parcours commencé rejoint Mes parcours.
- Un palier peut avoir sa fiche de cours (formules, graphiques à manipuler,
  exemples pas à pas, questions qui ne comptent pas). Elle s'affiche d'office
  avant la première séance si elle est prévue ainsi, puis reste sur la page
  du parcours et revient au bilan quand le palier n'est pas réussi. Format :
  guide, « Format des parcours ».
- L'onglet **Fiches** rassemble les fiches de cours de tous les parcours de
  l'élève, par chapitre (chapitres et parcours dépliables), avec une
  recherche ; l'élève enregistre les siennes dans « Mes fiches », dans
  l'ordre qu'il choisit.
- Un parcours qui utilise un exercice plus récent que le moteur de l'app
  (exercice ajouté à MathALÉA après la version installée) : ses autres
  exercices se font ; si aucun n'est connu, l'élève lit qu'il faut mettre
  l'application à jour.
- « Teste ton niveau », en tête de l'Explorer, est ouvert à tous avec le
  programme France (absent en Suisse : ses niveaux sont ceux de la France) : questions
  des sujets de la Course aux nombres, du CM1 à la Terminale. Par niveau,
  15 questions de tous les domaines (nombres et calcul, mesures, géométrie,
  proportionnalité, données, algèbre), jamais deux fois la même, corrigées à
  la fin ; 80 % (12 sur 15) donnent la ceinture du niveau (CM1 blanche, CM2 jaune, 6e orange,
  5e verte, 4e bleue, 3e marron, 2de noire, puis les dan). Chaque essai tire
  de nouvelles questions.

## Sessions partagées

Sur la page d'un parcours, « Autres actions », « Session partagée » : un code
(ex. `1k3lr`) et son QR code. N'importe qui peut la créer : vous au tableau,
ou un élève pour travailler avec ses camarades. Avec des paliers, la session
porte sur un palier, choisi à la création. Toutes les personnes qui scannent
le QR code ou entrent le code avec « Rejoindre une session » ont exactement
les mêmes exercices. Le QR code contient le lien du dossier de la classe : un
élève qui n'avait pas la classe la reçoit en même temps. Il ne contient
aucune donnée d'élève.

## Signaler un problème

Sur la page de chaque parcours, « Autres actions », « Signaler un problème » :
un mail à contact@coopmaths.fr s'ouvre, avec le parcours et le lien de son
dossier (bug, erreur dans un exercice, contenu inapproprié). L'élève peut
aussi cacher le parcours, ou retirer le dossier dans les Réglages.

## Ancienne bibliothèque (mode enseignant jusqu'à la 0.5)

Les parcours préparés dans l'application restent sur l'appareil. Réglages,
« Bibliothèque d'enseignant », « Exporter ma bibliothèque » : le fichier se
reprend sur la page « Parcours pour l'application » du site.

## Sauvegarde

Réglages, « Exporter une sauvegarde » : un fichier avec les réglages, les liens,
les parcours et le suivi. « Restaurer une sauvegarde » montre d'abord ce qu'elle
contient (date, dossiers, passages) et demande confirmation ; l'état remplacé
est gardé, et « Annuler la dernière restauration » le rétablit. Une sauvegarde
invalide ne modifie rien.

Nouvel appareil : au premier lancement, « Récupérer mes données » (sous le
choix du programme) restaure une sauvegarde directement, après le même
aperçu. Un élève qui change de téléphone garde ainsi ses séances en cours et
son suivi.
