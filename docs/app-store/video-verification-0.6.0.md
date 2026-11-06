# Vidéo pour la vérification d'Apple (0.6.0)

Apple demande (refus 2.1 du 0.5.0) un enregistrement d'écran fait sur un
vrai iPhone à jour, qui commence au lancement de l'app et montre le
parcours habituel, avec le signalement et le blocage du contenu publié par
des utilisateurs. Durée visée : 2 à 3 minutes, sans son.

## Avant d'enregistrer

- iPhone sur la dernière version d'iOS (noter le numéro pour les notes :
  Réglages, Général, Informations).
- Build 0.6.0 installé depuis TestFlight. Supprimer puis réinstaller l'app
  pour partir d'un premier lancement.
- App Mail configurée avec un compte : sinon « Écrire le signalement »
  n'ouvre rien d'utile.
- Sur l'ordinateur, ouvrir en grand `docs/app-store/qr-classe-demonstration.png`
  (QR code de la classe « Démonstration » du dossier de démonstration).
- Optionnel, pour la session : le téléphone Android avec l'APK d'essai,
  dossier de démonstration ajouté.
- Centre de contrôle : ajouter « Enregistrement de l'écran ».

## Déroulé

1. Lancer l'enregistrement, puis ouvrir MathALÉA (l'app doit démarrer à
   l'écran).
2. Choisir « France ».
3. « Je n'ai pas de lien ».
4. Onglet Explorer : ouvrir la 5e, puis « Additionner et soustraire des
   relatifs » (il faut que `explorer/fr-college.json` soit déjà dans le
   sous-dossier FR du kDrive). « Commencer » : la fiche de la ceinture
   s'affiche, puis « Commencer l'entraînement ».
5. Répondre à deux questions avec le clavier mathématique (une juste, une
   fausse pour montrer la correction), puis quitter : « Reprendre plus
   tard ».
6. Retour à « Mes parcours ». Toucher l'icône QR code en haut, autoriser la
   caméra, viser le QR code affiché sur l'ordinateur : la classe
   « Démonstration » et ses quatre parcours apparaissent.
7. Ouvrir « Relatifs en ceintures ». « Autres actions », « Signaler un
   problème » : laisser lire la feuille deux secondes.
8. « Écrire le signalement » : Mail s'ouvre avec le parcours dans le
   message. Faire défiler un peu, puis annuler sans envoyer et revenir à
   l'app.
9. Rouvrir « Autres actions », « Signaler un problème », « Cacher ce
   parcours » : retour à l'accueil, le parcours est rangé dans « Parcours
   cachés ». Ouvrir « Parcours cachés » pour le montrer.
10. Réglages (roue dentée) : faire défiler jusqu'à « Dossiers partagés »
    (le bouton qui retire le dossier, sans le toucher), puis jusqu'à
    « À propos » (contact@coopmaths.fr).
11. Retour. Ouvrir « Nombres relatifs », « Autres actions », « Session
    partagée » : le code et le QR code s'affichent. Si le téléphone Android
    est là, le scanner avec lui (hors champ, ce n'est pas obligatoire).
12. Arrêter l'enregistrement.

## Ensuite

- Couper le début et la fin dans Photos si besoin (sans couper le
  lancement).
- Envoyer la vidéo dans App Store Connect (pièce jointe de la section
  « Informations pour la vérification ») ou la mettre en ligne (lien non
  répertorié) et coller le lien à la place de `[LINK]` dans
  `docs/app-store/notes-verification-0.6.0.txt`, avec la version d'iOS à la
  place de `[VERSION]`.
