---
name: revue-exercices
description: Refaire la revue complète des exercices MathALÉA (banc automatique dans un navigateur, relecture exercice par exercice, rapport, classement des constats par type d'action) ou en reprendre une étape. À charger pour « repasse tous les exercices », « relis les exercices de 6e », « reclasse les trouvailles », « vérifie qu'on n'a rien perdu », « prépare les tickets ».
---

# Revue des exercices MathALÉA

Procédure suivie les 28 et 29 octobre 2026 sur les 4 190 exercices
(référentiel FR, CAN comprises, et exercices CH absents du FR). Tout se passe
dans `revue/` (scripts, données) et `docs/revue-exercices/` (rapports). Aucun
exercice ni le moteur de l'app ne sont modifiés pendant la revue.

## Ce que Nathan attend

- **Chaque** exercice passé dans le moteur de l'app : énoncé, correction,
  interactif (réponse correcte, incorrecte, vide, valeur mise en évidence),
  pour **tous** les paramètres. Puis relu à la main, texte et code.
- Règles contrôlées : `docs/revue-exercices/regles.md` (conventions de
  MathALÉA et de « l'œil de Lynx » : nombres en `$` sauf années, pas de texte
  dans `miseEnEvidence`, espaces typographiques, `miseEnEvidence` identique à
  ce que le champ attend pour chaque variante d'interactivité).
- Tout consigné au fil de l'eau, poussé souvent sur la branche de travail,
  français partout, pas de tiret cadratin.
- **Ne rien perdre** : chaque constat garde une clé, une catégorie, et le
  moyen de le reproduire (graine, paramètres, question, saisie).

## 1. Environnement (conteneur neuf)

```bash
git clone --filter=blob:none https://forge.apps.education.fr/coopmaths/mathalea.git /home/user/mathalea-main
```

```bash
cd /home/user/mathalea-main && git checkout 0509fdbbd
```

Si `git.sesamath.net` est refusé : paquet `instrumenpoche` factice dans
`/home/user/stub-iep` (`package.json` avec `"name": "instrumenpoche"`,
`index.js` qui rejette), et dans `pnpm-workspace.yaml` de MathALÉA
`frozenLockfile: false` et `instrumenpoche: file:../stub-iep` sous `overrides`.

```bash
cd /home/user/mathalea-main && pnpm install && cp /home/user/mathalea-mobile/moteur/fichiers/src/moteur/index.ts src/moteur/index.ts && pnpm makeJson
```

```bash
cd /home/user/mathalea-main && (setsid nohup npx vite --port 5173 --host 127.0.0.1 > /tmp/vite.log 2>&1 < /dev/null &)
```

Le serveur répond quand `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/alea/revue-banc.html` donne 200
(la page et la sonde sont écrites dans MathALÉA par le banc au premier lancement).

## 2. Banc automatique (`revue/banc.mjs`)

- Pour chaque exercice : `decrireExercice` donne les paramètres
  (`valeursDe`) ; toutes les combinaisons si leur nombre reste sous
  `MAX_VARIANTES` (50), sinon chaque valeur seule plus toutes les paires ;
  deux graines (`revue-<k>-a`, `revue-<k>-b`) ; nombre de questions par défaut
  et 10.
- La sonde (`revue/sonde.ts`, copiée dans MathALÉA en `revue-sonde.ts`)
  prépare l'exercice avec le moteur de l'app, le rend à 390 px, saisit au
  clavier (`clavier()` : MathLive retire les accolades d'un argument d'un seul
  caractère), vérifie avec `verifier`, lit les mises en évidence.
- Contrôles du texte : `revue/controles.mjs`. Contrôles du code :
  `node revue/source.mjs` (`revue/source.jsonl`).
- Sorties : `revue/journal.jsonl` (une ligne par constat), `revue/fait.txt`
  (reprise), `revue/sorties/<id>.json` (textes et attendus de chaque
  variante), `revue/captures/`. Journal, sorties et captures sont **hors Git** :
  l'archive à garder est `revue/classement/constats.jsonl.gz` (voir 5).
- Lancement par morceaux disjoints, deux travailleurs chacun :

```bash
cd /home/user/mathalea-mobile && (setsid nohup node revue/banc.mjs --filtre '^(?!can)[0-3]' --travailleurs 2 >> revue/banc-b.log 2>&1 < /dev/null &)
```

  Autres options : `--refaire` (ignore `fait.txt`), `--limite n`,
  `--sans-captures`, `--extra` (valeurs 1 à 6 et « 1-2 » pour les paramètres
  texte que `decrireExercice` ne détaille pas ; sortie `sorties/<id>_extra.json`,
  reprise `fait-extra.txt`).
- Après un arrêt (conteneur relancé) : retirer du journal les lignes dont
  l'uuid n'est pas dans `fait.txt`, puis relancer les mêmes filtres.
- Pièges : ne jamais `pkill -f banc` (tue son propre shell ; prendre les PID
  avec `ps -eo pid,args | awk '$2=="node" && $3=="revue/banc.mjs" {print $1}'`) ;
  deux instances ne doivent pas passer le même exercice (« Target page
  closed ») ; le banc n'avance que pendant que la session travaille.

## 3. Relecture exercice par exercice

```bash
node revue/suivants.mjs 14
```

Pour chaque exercice, dans l'ordre du référentiel :

- `node revue/lire.mjs <id>` : titre, paramètres, chaque variante (énoncé,
  correction, attendus, mises en évidence marquées ⟦…⟧). `EXTRA=1` pour les
  seules variantes de la passe `--extra`.
- Le code source quand un doute existe (`grep -n` ciblé dans
  `/home/user/mathalea-main/src/exercices`), les captures quand la figure ou la
  mise en page compte.
- Confirmer un refus de l'interactif :
  `node revue/essayer.mjs <id> <graine> '<paramètres JSON>' <nb> <question> <saisie>…`
  (graine de la variante dans `sorties/<id>.json`). Champ texte brut :
  `node revue/saisir.mjs`.
- Consigner : `node revue/noter.mjs <id> <règle> <gravité> "<constat>" "<correction>" "<fichier:ligne>"`
  (règles : codes de `rapport.mjs`, `NOMS`) ; faux positif du banc : ligne
  `{ "id", "regle", "motif" }` dans `revue/ecartes.jsonl`.
- Marquer relu : id ajouté à `revue/relus.txt`.
- Tous les ~20 exercices : `node revue/texte.mjs && node revue/rapport.mjs && node revue/degres.mjs`,
  commit, push (`timeout 90` sur le push).

## 4. Passes complémentaires

- `node revue/flottants.mjs` puis `node revue/flottants-essai.mjs` :
  réponses attendues écrites en flottant, la bonne réponse arrondie est-elle
  acceptée ? Confirmer chaque refus avec `essayer.mjs` et la bonne graine.
- `node revue/balayage.mjs [--noter]` : fautes vues à la relecture cherchées
  dans toutes les sorties (« Le pente », mots répétés, titres de travail…).
- Banc `--extra` sur les exercices dont un paramètre texte n'a pas d'options.

## 5. Classement par type d'action

```bash
node --max-old-space-size=6000 revue/classer.mjs && node --max-old-space-size=6000 revue/verifier-classement.mjs
```

- Unités : constats automatiques regroupés comme dans `trouvailles.md`
  (exercice, règle, endroit, extrait aux nombres près), clé `A-…` ; chaque
  ligne de relecture garde sa clé `L-…`.
- Catégories (une seule par constat) : `tickets-interactif`,
  `tickets-rendu`, `maths-formulation` (avis d'un enseignant-développeur),
  `decisions`, `mise-en-evidence`, `francais`, `typographie` (ces trois-là à
  corriger à la chaîne), `app-mobile`, `a-ecarter` (tests, modèles),
  `a-tester-main`, `pour-memoire`, `faux-positifs`.
- Rejeu de l'interactif : `node revue/rejouer.mjs` (I1 à I5) et
  `node revue/rejouer.mjs --m1` ; écrit `revue/rejeu.jsonl` (reproduit ou non,
  graine, paramètres, saisie), repris par `classer.mjs`.
- Corrections du classement à la main : `revue/reclassement.jsonl`, une ligne
  `{ "cle", "categorie", "precision" }` par constat (la source n'est jamais
  réécrite).
- `verifier-classement.mjs` doit répondre « aucune perte » : une clé par
  ligne de relecture, somme des occurrences égale aux lignes sources
  retenues, aucune ligne de texte du journal sans constat.
- Rendus : `docs/revue-exercices/classement/` (un fichier par catégorie, lien
  de reproduction vers le site avec la graine) ; données :
  `revue/classement/<catégorie>.jsonl` et l'archive complète
  `revue/classement/constats.jsonl.gz`.

## 6. Après

- Tickets sur la forge depuis l'ordinateur de Nathan, à partir de
  `tickets-*.md` et `maths-formulation.md`.
- Corrections à la chaîne (mise en évidence, français, typographie) dans
  MathALÉA, une MR par catégorie et par lot, à partir des fichiers `.jsonl`.
- Règles à proposer à MathALÉA : `docs/revue-exercices/propositions.md`.
