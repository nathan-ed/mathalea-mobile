# MathALÉA sur iPhone et iPad

Un iPhone n'installe que des apps signées par Apple. La voie simple pour les
collègues est **TestFlight** : ils ouvrent un lien, l'app s'installe et se met
à jour seule. Tout se fait depuis un ordinateur sans Mac (Linux, Windows) : le
site d'Apple dans le navigateur, l'onglet Actions de GitHub. La compilation et
la signature tournent sur un Mac de GitHub (`.github/workflows/ios.yml`),
gratuit pour un dépôt public.

## Ce qui ne marche pas pour les collègues

- **Sideloadly, AltStore** avec un identifiant Apple gratuit (`.ipa` non
  signée de `ios.yml`, case « ipa ») : il faut un ordinateur et l'app expire
  au bout de 7 jours.
- **Xcode** avec l'iPhone branché : réservé à un Mac de développeur.
- Le **simulateur** (workflow `emulateurs`) sert aux tests : rien ne s'installe
  sur un vrai iPhone par ce chemin.

## Une fois : compte et clés

1. **Programme développeur Apple**, au nom de l'association CoopMaths
   (organisation, numéro D-U-N-S) : developer.apple.com/programs/enroll.
   Apple vérifie l'entité juridique, souvent par un appel à son représentant
   (quelques jours à deux semaines). Exonération des 99 $ par an pour
   association à but non lucratif demandée en octobre 2026 : réponse en
   quelques semaines.
2. **Team ID** : developer.apple.com, « Membership ».
3. **App Store Connect** (appstoreconnect.apple.com) :
   - « Apps », « + », « Nouvelle app » : plateforme iOS, nom « MathALÉA »,
     identifiant de lot `fr.coopmaths.mathalea`, langue française.
   - « Utilisateurs et accès », « Intégrations », « Clés d'API App Store
     Connect » : créer une clé, rôle **App Manager**. Télécharger le fichier
     `.p8` (possible une seule fois), noter l'**ID de la clé** et l'**ID de
     l'émetteur** (Issuer ID, en haut de la page).
4. **Secrets GitHub** : dépôt `nathan-ed/mathalea-mobile`, « Settings »,
   « Secrets and variables », « Actions », « New repository secret » :

   | Secret | Valeur |
   | --- | --- |
   | `APPLE_API_KEY_P8` | tout le contenu du fichier `.p8` |
   | `APPLE_API_KEY_ID` | l'ID de la clé |
   | `APPLE_API_ISSUER` | l'ID de l'émetteur |
   | `APPLE_DEVELOPMENT_TEAM` | le Team ID |

## À chaque version : envoi à TestFlight

1. GitHub, onglet « Actions », workflow **ios**, « Run workflow » : choisir le
   tag de la version (par exemple `v0.4.10`) et cocher **« Signer et envoyer à
   TestFlight »**.
2. Le Mac de GitHub construit le moteur (le nôtre, `scripts/moteur.sh`), signe
   l'app avec la clé d'API (certificats et profils créés automatiquement) et
   l'envoie. Numéro de compilation daté, toujours croissant.
3. La version apparaît dans App Store Connect, « TestFlight », après le
   traitement d'Apple (de quelques minutes à une heure).

## Le lien pour les collègues

1. App Store Connect, « TestFlight », « Testeurs externes », « + » : créer un
   groupe (par exemple « Enseignants »), y ajouter la version.
2. Remplir ce que demande la vérification d'Apple : description courte,
   adresse de contact, **politique de confidentialité** (page publique de
   `docs/confidentialite.md`). La première version d'un groupe externe passe
   une vérification (en général un jour), les suivantes presque jamais.
3. Activer le **lien public** du groupe et le diffuser.
4. Chez un collègue : installer l'app **TestFlight** depuis l'App Store,
   ouvrir le lien sur l'iPhone, « Accepter », « Installer ». Les nouvelles
   versions arrivent seules (notification TestFlight).

Une version TestFlight reste valable 90 jours : en envoyer une nouvelle avant.

## Le jour où le compte est ouvert

1. Team ID, clé d'API et secrets GitHub (plus haut, « Une fois »).
2. App Store Connect, « Nouvelle app » : nom, identifiant de lot, et la fiche
   de `docs/fiche-boutiques.md`, section « App Store » (sous-titre, mots-clés,
   classification 4+, « Données non collectées », notes pour la
   vérification).
3. Captures iPhone 6,9 pouces et iPad 13 pouces :
   `APPAREILS=iphone-6-9,ipad-13 node e2e/fiche-play.mjs <dossier>`.
4. Workflow **ios** sur le dernier tag, case « Signer et envoyer à
   TestFlight » ; essayer la version TestFlight sur un vrai iPhone (caméra
   des QR codes comprise).
5. « Distribution » : choisir cette compilation, « Soumettre pour
   vérification ». Compter un à deux jours ; une première app est souvent
   refusée une fois (réponse dans le « Resolution Center », puis nouvel
   envoi).
Pour l'App Store ensuite : même version, « Distribution », fiche de
`docs/fiche-boutiques.md` (catégorie Éducation, 4+, pas la catégorie
Enfants).

## Tests sur iPhone avant d'envoyer

Le workflow **emulateurs** joue un élève dans l'app sur le simulateur iPhone
(Appium, `e2e/appareil-ios.mjs`) : premier lancement, défilement au doigt,
parcours de démonstration répondu juste au clavier de MathALÉA jusqu'au bilan,
« Quitter », thème sombre. Captures du vrai écran dans les artefacts
(`captures-iphone`) et dans le journal.
