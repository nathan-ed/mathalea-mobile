# Installer l'application

[Retour aux guides](index.md)

## Android

### Par le Play Store

L'application arrive bientôt sur le Play Store. En attendant, elle est en test. Pour faire partie des bêta-testeurs, écrivez sur Mattermost à Nathan Scheinmann avec l'adresse mail de votre compte Google. Vous recevrez un lien d'inscription.

Une fois inscrit, ou une fois l'application publiée :

1. Ouvrez le Play Store et cherchez « MathALÉA », ou suivez [ce lien](https://play.google.com/store/apps/details?id=fr.coopmaths.mathalea).
2. Touchez « Installer ».

Elle se met ensuite à jour comme les autres applications. Chaque semaine, une nouvelle version apporte les derniers exercices du site.

En attendant, tout se fait aussi sur ordinateur (voir plus bas).

### Sans le Play Store (fichier APK)

Cette solution sert pour un appareil sans Play Store, ou pour essayer une version avant sa sortie.

1. Sur le téléphone, ouvrez la [dernière version](https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/releases/permalink/latest).
2. Touchez `MathALEA-…-android-arm64.apk`. C'est le bon fichier pour presque tous les téléphones récents. Sur un vieux téléphone, prenez `…-android-armv7.apk`.
3. Ouvrez le fichier téléchargé. Android demande d'autoriser l'installation depuis votre navigateur. Acceptez, puis touchez « Installer ».

Une application installée de cette façon ne se met pas à jour par le Play Store. Pour passer à la version du Play Store, faites d'abord une sauvegarde dans les Réglages (« Exporter une sauvegarde »), désinstallez, installez l'autre version, puis « Restaurer une sauvegarde ».

## Ordinateur

Sur la [dernière version](https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/releases/permalink/latest), prenez le fichier qui correspond à votre ordinateur.

- **Windows** : `…-windows-setup.exe`. Ouvrez-le d'un double-clic. Si Windows affiche un avertissement, cliquez sur « Informations complémentaires » puis « Exécuter quand même ».
- **Mac récent (puce Apple)** : `…-macos-apple-silicon.dmg`. Voir plus bas.
- **Mac Intel** : `…-macos-intel.dmg`. Voir plus bas.
- **Linux** : prenez le `.deb`, le `.rpm` ou l'`.AppImage`, selon votre distribution.

### Mac : premier lancement

L'application n'est pas encore notariée par Apple. Au premier lancement, macOS peut dire qu'elle « est endommagée et ne peut pas être ouverte » ou qu'elle « ne peut pas être vérifiée ». Le fichier n'est pas abîmé : macOS bloque simplement les applications téléchargées hors de l'App Store qu'Apple n'a pas vérifiées.

1. Ouvrez le `.dmg` et glissez MathALEA dans le dossier Applications.
2. Ouvrez l'application Terminal (dans Applications, Utilitaires).
3. Copiez la ligne `xattr -cr /Applications/MathALEA.app`, collez-la dans le Terminal et appuyez sur Entrée.
4. Lancez MathALEA normalement. Cette manipulation ne se fait qu'une fois par version installée.

Sans Terminal, il existe une autre solution, qui ne fonctionne pas toujours : lancez l'application une fois, puis ouvrez Réglages Système, « Confidentialité et sécurité », et cliquez sur « Ouvrir quand même » en bas de la page.

Si macOS refuse déjà d'ouvrir le `.dmg`, tapez d'abord `xattr -c ` dans le Terminal, glissez le fichier `.dmg` dans la fenêtre du Terminal, puis appuyez sur Entrée.

## iPhone et iPad

L'application n'est pas encore sur l'App Store. La version de test s'installe dès maintenant avec un ordinateur : tout est expliqué pas à pas dans [Installer sur iPhone ou iPad](iphone.md).
