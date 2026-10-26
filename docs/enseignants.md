# MathALÉA : guide enseignant

L'application permet de préparer des parcours d'exercices MathALÉA et de les
donner à une ou plusieurs classes. Les élèves travaillent hors connexion ;
leurs réponses et leurs scores restent sur leur appareil. Personne n'a de
compte, et l'application ne demande aucun mot de passe.

## Principe

1. Vous créez vos parcours dans l'application (onglet Parcours).
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
« Mes parcours » (Vue élève).

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
dentée), cochez **Je suis enseignant** : l'application passe aux onglets de
l'enseignant, **Parcours** (bibliothèque et objectifs), **Classes**, **En
classe** (sessions) et **Explorer**. « Vue élève » (onglet Parcours) montre
Mes parcours et Suivi comme les élèves ; « Quitter » ou le bouton retour en
sort. Les élèves ne voient jamais ces onglets.

En Suisse, l'éditeur propose les niveaux 9e à 4e Collège et le référentiel
suisse de MathALÉA ; les exercices utilisent les notations suisses.

## Créer ou modifier un parcours

On crée un parcours pour un **niveau** ; on le donne ensuite à des classes,
dans la vue Classes. « Créer un parcours » ouvre un seul écran, à remplir dans
l'ordre que vous voulez ; niveau, type, pages et correction reprennent vos
derniers choix (modifiables dans les Réglages, « Nouveau parcours »). Toucher
un parcours de la bibliothèque ouvre sa page : état chez les élèves, classes
(pastilles), « Lancer une session », « Essayer », « Modifier » (tout est déjà
rempli), ses sessions, et dans « Autres actions » exporter, dupliquer,
supprimer.

- **Niveau** et **Chapitre** : les chapitres déjà utilisés à ce niveau
  viennent en premier ; touchez-en un ou tapez-en un nouveau.
- **Parcours** : titre, but (une phrase vue par les élèves), type
  (Découverte, Entraînement, Approfondissement).
- **Exercices** : « Ajouter des exercices » ouvre le référentiel comme sur le
  site (mêmes niveaux, chapitres et sous-chapitres, dans le même ordre, ou
  recherche), avec réglages et aperçu. Un
  exercice non interactif se fait sur papier : l'élève ouvre lui-même la
  correction et l'exercice ne compte pas dans le score. « Importer
  depuis un lien MathALÉA » reprend une feuille du site. Touchez un exercice
  pour ses réglages, son titre vu par les élèves (ou le masquer : l'exercice n'apparaît plus dans la
  liste des élèves) et ses
  objectifs ; les flèches changent l'ordre.
- **Organisation** : liste simple, paliers ou ceintures (voir plus bas).
- **Icône, pages et correction** (replié) : l'icône est proposée d'après le
  chapitre et se change d'un geste ; une page par question, par exercice ou
  tout sur une page ; correction après chaque question, à la fin de chaque
  page, ou à la fin du parcours (« à la fin du palier » avec des paliers).
  « Afficher les exercices » montre le numéro et le titre de chaque exercice ;
  désactivé (par défaut), les questions s'enchaînent, numérotées 1, 2, 3…
  « Mélanger les questions » (activé par défaut) mêle les questions des
  différents exercices, dans un ordre propre à chaque élève (le même pour
  toute une session commune) ; sans effet avec une page par exercice.

En bas : « Aperçu élève » pour essayer, et « Valider le parcours ». Tant
qu'il manque une information, la ligne « À compléter » dit laquelle. Le
parcours entre dans votre bibliothèque ; le panneau qui s'ouvre propose
d'exporter tous les parcours (le fichier du drive), d'en choisir quelques-uns,
ou de le donner à des classes.

« Autres actions », en bas d'un parcours enregistré : **Dupliquer**,
**Exporter ce parcours seul** et **Supprimer le parcours**.

### Paliers, ceintures et pauses (facultatif)

« Paliers » découpe le parcours, un palier par objectif au départ ; vous
ajustez ensuite. « Ceintures » fait de même avec des ceintures de couleur ; la
**première ceinture** se choisit (une 5e peut commencer à l'orange). Les
flèches d'un exercice le font passer au palier voisin. Pour chaque palier à
partir du deuxième :

- **Pour y accéder** : réussir le palier précédent avec le seuil choisi (50 à
  100 %, 80 % par défaut), ou « Ouvert à tout moment ».
- **Ressource pour revoir** : lien vers un PDF ou une vidéo de votre drive,
  mise en avant tant que le palier n'est pas réussi.
- **Pause après le palier** : un contenu entre deux paliers (point de cours,
  consigne, mise en commun, encouragement), avec un document lié si vous
  voulez. L'élève la lit à la fin du palier.

Chaque palier se fait en une séance. L'élève voit une carte par palier (état
écrit en toutes lettres, objectifs, exercices, un seul bouton sur le palier à
faire) ; à la fin d'un palier, son bilan affiche la pause et propose de
continuer au suivant, ou dit ce qu'il manque pour l'ouvrir.

### Objectifs

Chaque exercice ajouté reçoit l'objectif du programme sous lequel MathALÉA le
range (par exemple « Additionner deux nombres décimaux relatifs », 5N2G).
Vous pouvez en retirer, en ajouter ou créer les vôtres ; un exercice ajouté
plus tard avec les mêmes réglages reprend ses objectifs.

La vue **Objectifs** de l'onglet Parcours les liste par niveau et chapitre, avec
les exercices qui les travaillent. « Importer des objectifs » accepte un
tableau CSV (colonnes code ; libellé ; niveau ; chapitre, en-tête facultatif),
un texte collé (un objectif par ligne) ou le fichier d'un collègue, à répéter
au fil de l'année sans doublon. « Exporter la liste » produit un CSV.

### Bibliothèque et classes

- **Onglet Parcours**, vue Bibliothèque : vos parcours, par niveau puis
  chapitre, avec les classes de chaque parcours. « Éditer un parcours
  existant » reprend un parcours d'un collègue (dossier suivi ou fichier).
  Vue Objectifs : voir plus haut.
- **Onglet Classes** : ce que reçoit chaque classe, dans l'ordre vu par les
  élèves, et ses sessions. « Choisir les parcours de… » coche les parcours de
  la bibliothèque ; « + » ajoute une classe ; « … » la renomme ou la retire
  (ses parcours restent).

### Démonstration

Réglages, « Parcours de démonstration » (enseignant seulement) : une liste
simple, des paliers et des ceintures, avec objectifs et pauses. Une classe
« Démonstration » apparaît dans Mes parcours (Vue élève) pour essayer comme un élève, et
les mêmes parcours entrent dans votre bibliothèque. Un bouton les retire.

### Page du site

La même bibliothèque se prépare sur le site MathALÉA (« Plus d'exports »,
« Parcours pour l'application ») : même format, même fichier. Publier sur le
site, puis « Reprendre les parcours du dossier » dans l'app, ou l'inverse.

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

Tant que le dossier partagé n'est pas renseigné, l'onglet Parcours affiche une
« Mise en route » :

1. Créez un dossier sur votre drive et partagez-le par lien public, en lecture
   seule.
2. Collez ce lien dans « Lien du dossier partagé », puis
   « Enregistrer le lien ».
3. **Exporter tous les parcours** enregistre `parcours-mathalea-<date>.json`. Sur Android,
   choisissez « Envoyer vers une app » (l'app de votre drive) ou
   « Enregistrer sur le téléphone » (Téléchargements, par exemple). Déposez-le
   dans le dossier ; inutile de supprimer les anciens.
4. Donnez le lien aux élèves (projection, QR code, ENT…).

Ensuite, une petite bannière sous la barre de chaque écran rappelle où en est
le drive :

- « Version différente de celle du drive » dès qu'un parcours, une classe ou
  un objectif a changé dans l'app, parcours sans classe compris ;
  **Mettre à jour** exporte le fichier complet ;
- « Drive pas encore configuré » tant qu'aucun lien de dossier partagé n'est
  enregistré ; **Configurer** ouvre le champ du lien ;
- « Fichier exporté : déposez-le sur le drive » tant que l'app ne l'a pas
  trouvé dans le dossier partagé (relu au retour dans l'app, ou avec
  « Vérifier le dossier partagé » dans l'onglet Parcours). L'app ne peut pas
  savoir si chaque élève l'a reçu.

La croix ferme la bannière jusqu'au prochain lancement de l'app.

« Exporter des parcours » (onglet Parcours) propose tous les parcours cochés :
c'est le fichier complet. En décocher donne un fichier avec les seuls parcours
choisis, pour un collègue ; déposé dans le dossier, il s'ajoute au fichier
complet. « Dossier partagé » ouvre le dossier sur votre
drive ou change le lien (celui des élèves ne change pas tant que vous gardez
le même dossier).

Le fichier complet contient toute votre bibliothèque : classes et ordre pour
les élèves, mais aussi les parcours sans classe et vos objectifs (les élèves
ne voient que les parcours de leur classe). Sur un autre appareil, « Reprendre
ma bibliothèque publiée » (Mise en route) avec le lien de votre dossier, ou le
dernier fichier publié, retrouve tout et règle le dossier. Après des
modifications faites ailleurs, « Dossier partagé », puis « Reprendre les
parcours du dossier ». Rien n'est jamais effacé par une reprise ; un parcours
plus récent remplace l'ancien.

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
  chapitres, et épingler un parcours sur l'accueil d'un geste (l'épingle de
  sa tuile). Un parcours à paliers affiche sa progression (« 1/3 »).
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
- L'icône QR code en haut de l'accueil lit le QR code d'une session projeté
  par l'enseignant : l'élève arrive directement dans la session.
- L'onglet Explorer propose les parcours de l'équipe MathALÉA du programme
  choisi (France ou Suisse), par degré puis par chapitre, avec les noms du
  référentiel de MathALÉA ; seuls les degrés qui ont des parcours apparaissent.
  Un parcours commencé rejoint Mes parcours. L'enseignant le reprend avec
  « Donner à des classes » : il entre dans sa bibliothèque, puis il choisit
  les classes sur sa page.
- Un palier peut avoir sa fiche de cours (formules, graphiques à manipuler,
  exemples pas à pas, questions qui ne comptent pas). Elle s'affiche d'office
  avant la première séance si elle est prévue ainsi, puis reste sur la page
  du parcours et revient au bilan quand le palier n'est pas réussi. Format :
  guide, « Format des parcours ».
- « Teste ton niveau », en tête de l'Explorer, est ouvert à tous : questions
  des sujets de la Course aux nombres, du CM1 à la Terminale. Par niveau,
  15 questions de tous les domaines (nombres et calcul, mesures, géométrie,
  proportionnalité, données, algèbre), jamais deux fois la même, corrigées à
  la fin ; 80 % (12 sur 15) donnent la ceinture du niveau (CM1 blanche, CM2 jaune, 6e orange,
  5e verte, 4e bleue, 3e marron, 2de noire, puis les dan). Chaque essai tire
  de nouvelles questions.

## Sessions communes

Enseignant : « Lancer une session » sur la page d'un parcours, ou
« Nouvelle session » dans l'onglet En classe. Un panneau règle la session
(classe, facultative : les sessions sont rangées par classe dans En classe et
dans l'onglet Classes),
puis « Lancer la session » ouvre sa page : un code (ex. `1k3lr`) et un QR code
à projeter. L'enseignant ne fait pas la session lui-même : il la montre, puis
la relève. Avec des paliers, la session porte sur un palier, choisi au
lancement. Un élève crée une session avec « Session partagée » dans « Autres
actions ». Toutes les
personnes qui entrent ce code avec « Rejoindre une session » ont exactement les
mêmes exercices : utile pour corriger ensemble au tableau ou travailler en
groupe.

### Relever les réponses de la classe

Dans le panneau de la session, allumez « QR code des réponses
pour l'enseignant » et choisissez le moment :

- **après la correction** : les élèves voient la correction comme d'habitude,
  puis montrent leur QR code depuis leur bilan (« Montrer mes réponses à
  l'enseignant ») ;
- **avant la correction** : aucune correction pendant la session ; à la fin,
  le QR code s'affiche d'abord, et l'élève voit ses résultats après « C'est
  fait : voir mes résultats ».

« Avec le prénom des élèves » (facultatif) : l'élève tape son prénom une fois,
il ne va que sur l'appareil de l'enseignant et n'est jamais envoyé à une IA ;
sinon, « Élève 1, 2, 3… ».

Le réglage est caché dans le code (une empreinte du code entier) : il suffit
de le donner. Le QR code de la page de la session (« Plein écran » pour le
projeter) : l'élève touche l'icône QR code en haut de son accueil et arrive
directement dans la session, même sans avoir le parcours (le QR code en porte
une copie). Une app aux exercices plus anciens que les vôtres le prévient. Un élève ne peut pas changer le réglage en modifiant une
lettre, qui donnerait un réglage imprévisible et d'autres questions. Sans QR
code demandé, rien ne change pour les élèves.

Onglet En classe (enseignant) : chaque session lancée y est gardée, même sans
réponse : la préparer avant le cours, réafficher son QR code, la relever plus
tard (code, date, réglage, nombre d'élèves ; croix pour la supprimer, après
confirmation). Une session s'ouvre sur sa page : QR code et code, lecture des
réponses, puis les réponses de la classe.

- **Lire les QR codes** : passez dans les rangs, les codes se lisent un par un à
  la caméra ; un même élève n'est compté qu'une fois.
- **Importer des photos ou des fichiers** : une photo peut montrer plusieurs
  téléphones posés sur la table ; un élève peut aussi vous envoyer un fichier
  (« Envoyer un fichier à la place »).

L'app regénère les questions de la session et revérifie elle-même chaque
réponse : un QR code modifié ne fausse rien. En tête, un résumé (réussite
moyenne, répartition des élèves, questions à reprendre). Vue Questions : des
moins réussies aux plus réussies, taux de réussite et mauvaises réponses
regroupées (« 999 : 2 élèves »), ou toutes les réponses avec qui a donné
quoi. Vue Élèves : score de chacun, toutes ses réponses au toucher.

Analyse par une IA : les élèves y sont « Élève 1, 2… », jamais un prénom ;
l'app remet les prénoms dans la réponse, à l'affichage. « Copier pour une
IA » prépare le texte pour l'assistant de votre choix, « Coller la réponse
d'une IA » le relit. Pour l'analyse dans l'app, « Réglages de l'IA » : Claude,
Mistral ou OpenAI (clé d'API, chaque analyse facturée sur son compte), IA
locale (Ollama, LM Studio, gratuite) ou autre adresse compatible OpenAI.
Réglages gardés sur l'appareil, jamais dans une sauvegarde ; `http://`
seulement sur le réseau local. Pas à pas avec images : guide en ligne,
« Sessions partagées et réponses de la classe ».

## Sauvegarde

Réglages, « Exporter une sauvegarde » : un fichier avec les réglages, les liens,
vos parcours et le suivi. « Restaurer une sauvegarde » montre d'abord ce qu'elle
contient (date, dossiers, passages) et demande confirmation ; l'état remplacé
est gardé, et « Annuler la dernière restauration » le rétablit. Une sauvegarde
invalide ne modifie rien.
