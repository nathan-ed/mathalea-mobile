# Publier depuis une session

Une session (cloud ou locale) peut publier sans l'ordinateur de Nathan. Elle
pousse sur sa branche GitHub un fichier `publication/demande.json`. La CI
vérifie tout, puis attend l'approbation de Nathan avant de signer ou de
publier quoi que ce soit (`.github/workflows/publication.yml`).

Ce que dit Nathan et la demande qui y correspond : tableau « Publier » de
`AGENTS.md`. Sans une de ces phrases, ne jamais écrire de demande.

## Moteur

Sans nouvelle version de l'app : les apps téléchargent le moteur au lancement.

1. Écrire `publication/demande.json` :

   ```json
   { "publier": "moteur", "commit": "main" }
   ```

   `"main"` : le dernier commit de `main` de MathALÉA, lu par la CI (une
   session cloud n'a pas besoin d'accès à la forge). Ou un commit complet
   (40 caractères) choisi par Nathan. Sans `commit` : `moteur/COMMIT` de la
   branche.
2. Commiter et pousser la branche. Le résumé du run donne le commit de
   MathALÉA retenu, sa date et son message.

## Version de l'app

1. Version montée dans `package.json`, `src-tauri/tauri.conf.json` et
   `src-tauri/Cargo.toml`, notes `docs/notes-de-version/vX.Y.Z.md` et
   `vX.Y.Z.play.txt` (`scripts/controler-version.sh vX.Y.Z` le vérifie).
2. Écrire `publication/demande.json` :

   ```json
   { "publier": "v0.7.6" }
   ```

   Le `.aab` part à la Play Console, piste production. Pour une autre piste :
   `"google_play": "internal"` (ou `alpha`, `beta`) ; pour ne rien envoyer :
   `"google_play": false`. Ajouter `"testflight": true` pour envoyer aussi la
   version iOS à TestFlight.
3. Commiter et pousser la branche.

## Ensuite

- La branche doit prolonger `main` de la forge, sinon la demande est refusée.
- La publication retire `publication/demande.json` de `main` : la demande
  suivante s'écrit de nouveau, même identique.
- La vérification complète (`scripts/verifier-release.sh`) tourne sur le
  commit poussé. Son résumé liste les commits qui arriveront sur `main`.
- Nathan approuve dans GitHub par le navigateur (l'app GitHub ne le permet
  pas) : lien et commande `gh` dans le résumé du run, « Review deployments ». Alors seulement le commit arrive sur `main` de la forge,
  avec le moteur signé ou le tag de la version.
- Pour une version : construction (`release.yml`, `ios.yml`), puis seconde
  approbation pour ranger les installateurs dans `releases/`, créer la
  release de la forge et envoyer le `.aab` à la Play Console. La soumission
  de la version iOS à Apple se fait à la main dans App Store Connect.
- Le miroir GitHub ne peut pas recevoir de la CI un commit qui modifie
  `.github/workflows` : dans ce cas, `git push github main` depuis un ordinateur.
