# Piste pour l'avenir : un espace enseignant validé

Note du 6 novembre 2026 (version 0.6, app élève seule).

## Constat

Depuis la 0.6, l'app ne contient plus que le mode élève. Les parcours arrivent
du dossier partagé d'un enseignant (kDrive, Dropbox, Google Drive, Nextcloud,
tout lien https) ou de l'Explorer de l'équipe MathALÉA. N'importe qui peut
donc publier un parcours qu'un élève verra : pour les boutiques, c'est du
contenu publié par des utilisateurs (App Store, règle 1.2).

Ce que l'app fait pour cela (0.6) :

- « Signaler ce parcours » (page du parcours, Autres actions) : un mail à
  contact@coopmaths.fr avec le contenu du parcours et le lien de son dossier
  (`src/lib/signalement.ts`) ;
- blocage : cacher le parcours, ou retirer le dossier dans les Réglages ;
- contact publié dans les Réglages (À propos).

Limite : c'est un serpent qui se mord la queue. Le signalement donne un lien
de drive, pas une personne. L'équipe ne peut ni savoir qui a publié le
parcours, ni le retirer chez les élèves : seul le propriétaire du drive (ou
l'hébergeur du drive) le peut.

## Piste

L'app élève reste agnostique (elle lit des fichiers de parcours), mais les
parcours et les classes viennent d'un espace serveur où chaque enseignant est
identifié et validé (par exemple compte académique, ou validation par
l'équipe). Ce que cela permettrait :

- savoir qui est derrière un parcours signalé, et le joindre ;
- retirer un parcours ou suspendre un compte : les élèves ne le reçoivent plus
  à la synchronisation suivante ;
- QR code de classe et lien de dossier servis par cet espace (lien court,
  toujours le même) ;
- aucun changement pour les données des élèves : elles restent sur l'appareil.

À peser avant de s'y lancer : hébergement et maintenance d'un serveur, RGPD
(comptes des enseignants), validation des comptes, coût pour CoopMaths. La
page « Parcours pour l'application » du site MathALÉA serait le point de départ
naturel (elle prépare déjà les fichiers).
