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

Le banc reprend seul (`revue/fait.txt`). Journal : `revue/journal.jsonl`.
Captures et sorties texte (`revue/captures`, `revue/sorties`) hors Git :
perdues avec le conteneur, elles se refont avec `--refaire` sur un filtre.
