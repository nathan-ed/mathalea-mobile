# Revue des exercices : état et reprise

Fichier lu à chaque réveil (tâches planifiées « Reprise de la revue des
exercices », minutes 3, 23 et 43 de chaque heure). Plan : voir
`regles.md` (règles) et `trouvailles.md` (constats triés).

## Avancement

- Étape 0 (sources, règles) : faite. MathALÉA `main` à `0509fdbbd`
  (28 octobre 2026), moteur de l'app (`moteur/fichiers/src/moteur/index.ts`)
  posé par-dessus.
- Étape 1 (banc) : lancé sur tout le référentiel le 28 octobre 2026 vers
  8 h 30 UTC (`revue/banc.log`, environ 5 s par exercice, 4 190 exercices :
  3 022 du référentiel FR, 1 168 propres au référentiel CH). Contrôles du
  code source : `node revue/source.mjs` (`revue/source.jsonl`).
- Étape 2 (relecture) : dans l'ordre du banc. Pour chaque exercice :
  `node revue/lire.mjs <id>` (texte de chaque variante, attendus, mises en
  évidence ⟦…⟧), le code source si besoin, les captures quand la figure ou
  la mise en page compte. Constat : `node revue/noter.mjs <id> <règle>
  <gravité> "<constat>" "<correction>" "<fichier:ligne>"`. Faux positif du
  banc : une ligne `{ "id", "regle", "motif" }` dans `revue/ecartes.jsonl`.
  Exercice relu : son id ajouté à `revue/relus.txt`.
- Étape 3 (rapport) : `node revue/rapport.mjs` réécrit `trouvailles.md`
  (à faire à chaque reprise, puis commit et push).

## Prochaine étape (à chaque réveil)

1. Banc en marche ? CAN : fini le 28 octobre. Hors CAN, deux instances
   aux filtres disjoints (`tail -1 revue/banc.log revue/banc-b.log`) :
   `--filtre '^(?!can)[0-9]' --travailleurs 3` (journal `banc.log`) et
   `--filtre '^(?!can)[^0-9]' --travailleurs 2` (`banc-b.log`), lancées par
   `setsid nohup … < /dev/null &`. Arrêtée : la relancer (elle reprend) ;
   avant, retirer du journal les lignes des exercices absents de `fait.txt`.
   Saisie « comme au clavier » (`clavier()` dans `sonde.ts`) : MathLive
   retire les accolades des arguments d'un seul caractère quand l'élève tape
   (`\frac34`, `\sqrt2`, `x^2`, mais `\frac{13}{4}`), mesuré sur un champ
   réel le 28 octobre. Le banc saisit les bonnes réponses et les mises en
   évidence sous cette forme. Les CAN ont été repassées avec (`--refaire`,
   journal des CAN vidé avant) : une attente `\sqrt3` n'est pas un défaut.
2. Relire les exercices suivants dans l'ordre de `revue/referentiel.json`,
   en sautant ceux de `revue/relus.txt` et ceux pas encore passés au banc.
   `node revue/suivants.mjs 20` donne les suivants. Le sujet aléatoire
   `canc3a` (très long) se relit par le code (`src/exercices/can/c3/_Canc3a.ts`).
   Confirmer un refus à la main : `node revue/essayer.mjs <id> <graine>
   '<paramètres>' <nb> <question> <saisie>…` (graine et paramètres dans la
   sortie du banc).
3. Trier les constats graves du banc (I1, I2, I4, M1, X1, X3, X6) : faux
   positif → `revue/ecartes.jsonl`, vrai → laissé ou précisé avec noter.mjs.
4. Après le banc : passe complémentaire pour les options de paramètres que
   `optionsDe` ne lit pas (aides « 1 & 2 : … » ; lire les besoinFormulaire
   bruts dans la sonde).
5. `node revue/flottants.mjs` : réponses attendues écrites en flottant
   (`12.135000000000002`) ; confirmer chacune avec `essayer.mjs` (certaines
   comparaisons tolèrent l'écart, d'autres refusent la bonne réponse).
6. `node revue/texte.mjs && node revue/rapport.mjs`, commit, push.

## Remettre l'environnement en place (conteneur neuf)

```bash
git clone --filter=blob:none https://forge.apps.education.fr/coopmaths/mathalea.git /home/user/mathalea-main
```

```bash
cd /home/user/mathalea-main && git checkout 0509fdbbd
```

`git.sesamath.net` peut être refusé par le réseau : paquet `instrumenpoche`
factice (animations seulement) dans `/home/user/stub-iep` (`package.json` avec
`"name": "instrumenpoche"`, `index.js` qui rejette), puis dans
`pnpm-workspace.yaml` de MathALÉA : `frozenLockfile: false` et
`instrumenpoche: file:../stub-iep` sous `overrides`.

```bash
cd /home/user/mathalea-main && pnpm install && cp /home/user/mathalea-mobile/moteur/fichiers/src/moteur/index.ts src/moteur/index.ts && pnpm makeJson
```

```bash
cd /home/user/mathalea-main && npx vite --port 5173 --host 127.0.0.1
```

```bash
cd /home/user/mathalea-mobile && node revue/banc.mjs --travailleurs 3
```

Arrêter le banc sans tuer son propre shell (ne jamais `pkill -f banc`) :
`ps -eo pid,args | awk '$2=="node" && $3=="revue/banc.mjs" {print $1}' | xargs -r kill`.
Relancé de zéro le 28 octobre vers 8 h 37 UTC après corrections du banc.

Le banc reprend seul (`revue/fait.txt`). Journal : `revue/journal.jsonl`.
Captures et sorties texte (`revue/captures`, `revue/sorties`) hors Git :
perdues avec le conteneur, elles se refont avec `--refaire` sur un filtre.
