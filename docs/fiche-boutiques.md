# Fiche des boutiques (Google Play, App Store)

Textes et réponses à reprendre dans la Play Console (et plus tard dans App
Store Connect). Captures : `node e2e/fiche-play.mjs <dossier>` (pnpm dev,
parcours de démonstration ; téléphone 1620 × 2880, tablette 7 pouces
1440 × 2304, tablette 10 pouces 1600 × 2560 : accueil, paliers, ceintures,
question, bibliothèque, éditeur) ; image de présentation 1024 × 500 :
logo de l'en-tête de l'app agrandi ; icône 512 × 512 : `src-tauri/icons/icon.png`.

## Fiche

- **Nom** : MathALÉA
- **Description courte** (80 caractères au plus) :
  Parcours d’exercices de maths corrigés, du collège au lycée, même hors ligne.
- **Description complète** :

```
MathALÉA, par CoopMaths, propose des parcours d’exercices de mathématiques corrigés aussitôt, du collège au lycée (programmes de France et de Suisse romande). Chaque exercice est généré au hasard : on peut le refaire autant de fois qu’on veut, avec de nouvelles questions.

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
  Données chiffrées en transit : oui (HTTPS). Suppression : sans objet (rien
  n'est collecté ; tout disparaît à la désinstallation).
  Caméra (QR codes de session scannés par l'élève, QR codes de réponses scannés par l'enseignant) : image lue sur l'appareil, rien n'est envoyé, aucune
  déclaration. L'analyse des réponses par une IA est mise de côté (branche
  locale `analyse-ia`, avec ce qu'il faudrait alors déclarer à Google) :
  « aucune donnée collectée » reste exact.
- **Application gouvernementale, financière, de santé, d'actualités** : non.

## Notes de version

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
