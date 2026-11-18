# Moteur MathALÉA embarquable

Le moteur est dans MathALÉA depuis la MR !9394 (`src/moteur/`,
`vite.moteur.config.ts`, `tasks/`, scripts de `package.json`). Ce dossier
garde les fichiers de moteur de l'app, en avance sur ceux de MathALÉA
(`chemin` du menu du site, `titreHtml`, conteneur `appMathalea`), en
attendant de les y reverser :

- `COMMIT` : commit de MathALÉA de référence ;
- `fichiers/` : fichiers copiés tels quels par-dessus MathALÉA (`src/moteur/`,
  `vite.moteur.config.ts`, `tasks/` et `documentation/` pour la publication
  sur https://mathalea.fr/releases/ à chaque mise en ligne du site).

`pnpm moteur` (scripts/moteur.sh) clone MathALÉA à ce commit, y copie ces
fichiers et construit le moteur dans `static/moteur`.
La CI fait de même : chaque commit de l'app porte exactement son moteur.

Modifier le moteur : éditer ces fichiers, puis `pnpm moteur`. Changer de
version de MathALÉA : mettre le nouveau commit dans `COMMIT` et comparer
`fichiers/` à ce qu'il contient (fusion à trois voies si MathALÉA a modifié
`src/moteur/index.ts`). Une fois nos ajouts reversés dans MathALÉA, supprimer
ce dossier et construire depuis MathALÉA directement.

Publication du moteur avec le site : voir
`fichiers/documentation/developpement/maintenance-moteur/architecture/publication-moteur.md`.
