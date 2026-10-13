# MathALÉA mobile : consignes

Application Tauri 2 (Svelte 5, SvelteKit statique) de parcours MathALÉA.
Détails : `docs/developpement.md` ; guide enseignant : `docs/enseignants.md`.

## Règles

- Français partout (interface, commentaires, documentation). Pas de tiret cadratin.
- Design : uniquement les composants et classes Tailwind de MathALÉA (compilées
  dans `static/moteur/moteur.css`, voir `src/lib/ui/classes.ts`). Aucun style
  « maquette IA » (dégradés, pastilles décoratives, slogans), aucun texte de
  remplissage ni placeholder : chaque texte porte une information ou une action.
- Icônes boxicons avec `aria-hidden="true"`.
- Aucune donnée de l'élève ne quitte l'appareil ; l'app ne stocke aucun
  identifiant. Les parcours arrivent par les dossiers partagés
  (`parcours-mathalea.json`), aucun n'est intégré à l'app.
- Une séance garde une copie figée de son parcours (`contenu`) : ne jamais lire
  la version courante pour rejouer, relire ou reprendre.
- Moteur : chargé à l'exécution depuis `static/moteur` (`pnpm moteur`), jamais
  importé dans le code de l'app. Contrat : `src/lib/moteur.ts` (`API_ATTENDUE`).

## Vérifier avant de rendre

- `pnpm check` et `pnpm test` ; `cargo test` dans `src-tauri`.
- Changement d'interface : `pnpm e2e` (voir README) et un coup d'œil aux
  captures, en clair et en sombre, à 390 px de large.
- Ne rien commiter ni pousser sans demande explicite.
