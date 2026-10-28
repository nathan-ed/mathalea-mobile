# Revue des exercices : état et reprise

Fichier lu à chaque réveil (tâches planifiées « Reprise de la revue des
exercices », minutes 3, 23 et 43 de chaque heure). Plan : voir
`regles.md` (règles) et `trouvailles.md` (constats triés).

## Avancement

- Étape 0 (sources, règles) : faite. MathALÉA `main` à `0509fdbbd`
  (28 octobre 2026), moteur de l'app (`moteur/fichiers/src/moteur/index.ts`)
  posé par-dessus.
- Étape 1 (banc) : `revue/banc.mjs`, `revue/sonde.ts`, `revue/controles.mjs`,
  validation sur un échantillon en cours.
- Étape 2 (relecture captures et code) : pas commencée.
- Étape 3 (rapport) : pas commencée.

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
