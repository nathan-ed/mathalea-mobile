# Fiche des boutiques (Google Play, App Store)

Textes et réponses à reprendre dans la Play Console (et plus tard dans App
Store Connect). Captures : `node e2e/fiche-play.mjs <dossier>` (pnpm dev,
1080 × 1920, parcours de démonstration) ; image de présentation 1024 × 500 :
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
- Fonctionne hors ligne une fois les parcours reçus.

Pour les enseignants
- Créer un parcours en quelques minutes à partir des exercices de MathALÉA, ou d’un lien du site.
- Bibliothèque rangée par niveau et chapitre, parcours donnés aux classes.
- Objectifs du programme posés automatiquement, liste d’objectifs importable (CSV).
- Publication en un fichier dans un dossier partagé : aucun compte, aucune inscription.

Respect de la vie privée
Aucun compte, aucune publicité, aucun outil de suivi. Les réponses et les résultats des élèves restent sur leur appareil.

Logiciel libre (licence AGPL), développé par des enseignants de l’association CoopMaths.
```

- **Catégorie** : Éducation. **Adresse e-mail** : contact@coopmaths.fr.
  **Site web** : https://coopmaths.fr.
- **Politique de confidentialité** : `static/confidentialite.html`, publiée sur
  mathalea.fr (adresse à reporter ici et dans la Play Console).

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
- **Application gouvernementale, financière, de santé, d'actualités** : non.

## Notes de version

```
<fr-FR>
Première version sur Google Play.
- Parcours MathALÉA hors ligne, reçus depuis le dossier partagé de l'enseignant (kDrive, Dropbox, Nextcloud…).
- Paliers et ceintures, seuil de réussite, pauses et ressources pour revoir.
- Espace enseignant : bibliothèque de parcours, classes, objectifs et suivi par objectif.
- Aucun compte, aucune publicité : aucune donnée de l'élève ne quitte l'appareil.
</fr-FR>
```
