# Moteur MathALÉA embarquable

Code du moteur ajouté à MathALÉA, en attendant sa fusion dans le dépôt de
Coopmaths (branche `moteur-embarquable`, MR à venir) :

- `COMMIT` : commit de MathALÉA de référence ;
- `fichiers/` : fichiers ajoutés tels quels (`src/moteur/`, `vite.moteur.config.ts`) ;
- `version.patch` : modification de `src/lib/components/version.ts` (pas
  d'appel réseau dans le moteur).

`pnpm moteur` (scripts/moteur.sh) clone MathALÉA à ce commit, y copie ces
fichiers, applique le correctif et construit le moteur dans `static/moteur`.
La CI fait de même : chaque commit de l'app porte exactement son moteur.

Modifier le moteur : éditer ces fichiers, puis `pnpm moteur`. Changer de
version de MathALÉA : mettre le nouveau commit dans `COMMIT` (le correctif doit
encore s'appliquer). Une fois la MR fusionnée, supprimer ce dossier et
construire depuis MathALÉA directement.
