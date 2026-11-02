# Historique du projet

Ce qui a été vrai à un moment et ne l'est plus, ou des faits datés sans
conséquence sur le travail actuel. Les règles en vigueur sont dans le skill
`.claude/skills/mathalea-mobile/SKILL.md` et dans `AGENTS.md`.

## Mises à jour du moteur téléchargées (désactivées le 2026-10-29)

Mises à jour du moteur sans mise à jour de l'app (`src-tauri/src/moteur.rs`)
- Publication : par le site, à chaque mise en ligne, sur
  `https://mathalea.fr/releases/` (`URL_MISES_A_JOUR`). Scripts dans
  `moteur/fichiers/tasks/` (entrent dans MathALÉA avec la MR) :
  `pnpm build:moteur` puis `pnpm deploy:moteur` (`deploy_moteur.sh` :
  `publier_moteur.mjs` signe, rsync de l'archive puis de `mise-a-jour.json`
  et `.sig` vers `REMOTE_RELEASES_PATH`, trois archives gardées ; sans
  `REMOTE_SERVER`, dossier local pour les essais) ; `build:deploy` enchaîne
  site et moteur. Deux scripts séparés voulus : publier le moteur seul, et
  un échec du moteur ne bloque pas le site. Mode d'emploi des clés pour qui
  publie : `moteur/fichiers/documentation/developpement/maintenance-moteur/architecture/publication-moteur.md`
  (`node tasks/cles_moteur.mjs <.pem>`, la clé publique revient à l'app dans
  `CLE_PUBLIQUE`). Clé actuelle = clé de mathalea.fr (Rémi Angot, depuis
  0.1.5) ; la clé de test (`~/.local/share/mathalea-mobile/moteur-ed25519.pem`)
  ne signe plus que des publications locales, refusées par `CLE_PUBLIQUE`.
  Contrôle sur la vraie publication : copier `mise-a-jour.json`, `.sig` et
  l'archive de mathalea.fr/releases dans un dossier, puis
  `MOTEUR_PUBLICATION=<dossier> cargo test moteur -- --include-ignored`.
- Format : `moteur-<v>.tar.gz`, `mise-a-jour.json` (format `moteur-mathalea/1`,
  version, api, publieLe, archive, taille, sha256), `mise-a-jour.json.sig`
  (Ed25519, base64). La signature protège les apps d'un serveur web
  compromis (le moteur a les droits de l'app) ; la clé privée n'est pas sur
  le serveur.
- App : signature, même API, plus récent (`publieLe`), taille et SHA-256,
  extraction à part, activation au lancement suivant (jamais en séance),
  recherche au lancement, au retour dans l'app et toutes les 10 min comme
  les dossiers suivis et l'Explorer (`actualiser()`),
  servi par `moteur://`, repli sur le moteur livré. Réglages : version et
  « Rechercher une mise à jour ».

## Feuille de route des premières versions

- 0.1.1 : publiée (éditeur sur un écran, navigateur d'exercices, plusieurs
  fichiers par dossier, téléchargements après validation, partage Android,
  mises à jour du moteur et Explorer avec adresses provisoires).
- À fixer avec Coopmaths : adresse du catalogue servi (`VITE_URL_EXPLORER`,
  le catalogue est intégré à l'app en attendant),
  vraie clé de signature du moteur et de l'APK, projet de la forge public,
  MR du moteur dans MathALÉA (puis supprimer `moteur/` et la release `moteur`
  du miroir GitHub).
- 0.1.2 (publiée) : fiabilité (sauvegardes, brouillons, Entrée, suivi).
- 0.1.3 (publiée) : espace enseignant réorganisé (Publier et état « à jour chez les
  élèves », mise en route, « Éditer un parcours existant » pour tous les
  parcours, « Exporter ce parcours », Dupliquer, ordre par classe,
  correction invisible pour les élèves : `reprendreResultats`), relecture
  des dossiers et du moteur à chaque retour dans l'app.
- 0.1.4 : interface d'app, APK plus compatible, écran WebView ancien.
- 0.1.5 : dictionnaire de compétences par chapitre (édité dans l'app ou
  importé en JSON), étiquetage rapide des exercices, suivi par compétence.
- Idées notées par Nathan (docs/developpement.md, « À faire ») : création
  de parcours depuis le site MathALÉA (et édition d'un `.json` chargé),
  retour élève vers enseignant (QR ou fichier `bilan-mathalea/1` avec
  statistiques et réponses des tentatives dernière et meilleure, graines
  pour régénérer les questions ; tailles mesurées dans la doc).
- Plus tard : moteur en ressource Android (une copie), iOS sur TestFlight,
  Wi-Fi seulement pour le moteur, version minimale du moteur par parcours,
  clé Google Drive, ressources (PDF, images) à côté des parcours.

## Forge et Google Play, octobre 2026

- Historique réécrit le 15 octobre 2026 (adresse personnelle retirée de deux
  commits) : tags `v*` et releases de la forge recréés, tag `moteur` supprimé.
- Google Play (15 octobre 2026) : 0.2.4 (code 26101518) envoyée en
  production, en examen. Bundle : `google-play.yml` (signé `CN=CoopMaths`,
  vérifier `keytool -printcert -jarfile`). Exigence des pages de 16 Ko :
  `-Wl,-z,max-page-size=16384` dans `src-tauri/build.rs` (Tauri impose
  RUSTFLAGS, `.cargo/config.toml` ne marcherait pas) ; contrôle
  `readelf -lW` sur le `.so`, segments `LOAD` à `0x4000`. Un code de version
  déjà importé est refusé : « Ajouter à partir de la bibliothèque ».
  Bêta-testeurs (inscription par Mattermost auprès de Nathan) : piste
  « Tests fermés » avec liste d'adresses Gmail, pas « Tests ouverts ».
  Avertissements Play sur `setStatusBarColor` : viennent d'androidx
  (`enableEdgeToEdge`), rien à faire. Envoi automatique : secret
  `GOOGLE_PLAY_SERVICE_ACCOUNT` posé, API « Google Play Android Developer »
  activée le 16 octobre 2026 (projet 922562518325). Envoi à la main :
  `gh workflow run google-play.yml --repo nathan-ed/mathalea-mobile -f forcer=true -f piste=internal`.
  0.3.0 envoyée en « Test interne » le 16 octobre 2026, puis 0.3.1. Le
  `versionCode` est daté à l'heure (`AAMMJJHH`, UTC) : deux envois dans la
  même heure sont refusés (« Version code … has already been used ») ;
  relancer après l'heure pleine. Test fermé (liste « Test 1 ») = piste
  `alpha` ; une version pour le test interne et le fermé = deux envois dans
  deux heures différentes (0.3.2, 17 octobre 2026). Attention : le
  lundi, sans `piste`, l'envoi part en **production** (dernier tag `v*`, si
  nouveau moteur publié). Le `.aab` (70 Mo) ne va pas sur la forge ; trop
  gros pour SendUserFile (30 Mo).

## Envois Google Play à la main

  Envoi automatique du lundi (`google-play.yml`) **désactivé** sur GitHub
  le 2026-10-19 pendant cet examen ; le réactiver seulement sur demande de
  Nathan (`gh workflow enable google-play.yml --repo nathan-ed/mathalea-mobile`).
  Pour un envoi à la main pendant la pause : `enable`, `workflow run … -f
  piste=internal`, puis `disable` aussitôt (un run lancé continue). 0.4.0
  (code 26101907), 0.4.1 et 0.4.2 envoyées ainsi en test interne le 2026-10-19,
  0.4.5 (code 26102520) le 2026-10-25. Le run sans `piste` part en production.
