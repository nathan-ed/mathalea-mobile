# Moteur MathALÉA embarquable

Code du moteur ajouté à MathALÉA, en attendant sa fusion dans le dépôt de
Coopmaths (MR !9394, branche `moteur-app-mobile`) :

- `COMMIT` : commit de MathALÉA de référence ;
- `fichiers/` : fichiers ajoutés tels quels (`src/moteur/`,
  `vite.moteur.config.ts`, `tasks/` et `documentation/` pour la publication
  sur https://mathalea.fr/releases/ à chaque mise en ligne du site) ;
- `mathalea.patch` : `src/lib/components/version.ts` (pas d'appel réseau
  dans le moteur), `package.json` (`build:moteur`, `deploy:moteur`, ajoutés
  à `build:deploy`), `.env.example` et `.gitignore`.

`pnpm moteur` (scripts/moteur.sh) clone MathALÉA à ce commit, y copie ces
fichiers, applique le correctif et construit le moteur dans `static/moteur`.
La CI fait de même : chaque commit de l'app porte exactement son moteur.

Modifier le moteur : éditer ces fichiers, puis `pnpm moteur`. Changer de
version de MathALÉA : mettre le nouveau commit dans `COMMIT` (le correctif doit
encore s'appliquer). Une fois la MR fusionnée, supprimer ce dossier et
construire depuis MathALÉA directement.

Publication du moteur avec le site : voir
`fichiers/documentation/developpement/maintenance-moteur/architecture/publication-moteur.md`.
