---
name: generer-parcours
description: Générer ou modifier un fichier de parcours MathALÉA (format classes-mathalea/1) pour l'application mobile, sans passer par l'éditeur - à partir d'adresses d'exercices du site, d'une progression ou d'une demande d'enseignant. À charger pour « génère / écris un parcours JSON », « convertis cette feuille MathALÉA en parcours », « ajoute des ceintures à ce fichier ».
---

# Générer un fichier de parcours MathALÉA

Référence complète (champs, règles, exemple, consigne pour un assistant) :
`docs/guide/format-parcours.md`, publiée dans le guide en ligne
(https://coopmaths.forge.apps.education.fr/mathalea-mobile/format-parcours.html).
Schéma : `docs/guide/parcours-mathalea.schema.json`. Exemple complet :
`docs/guide/exemple-parcours.json`. La vérité reste le contrôle de l'app
(`src/lib/validation.ts`, `lireFichier` dans `src/lib/partage.ts`) : si l'un
change, mettre à jour la page, le schéma et l'exemple (un test les compare,
`tests/testNiveau.test.ts`, « format des parcours »).

## Méthode

1. Exercices : uniquement des `uuid` réels, pris d'une adresse du site
   (`uuid=`, `id=`, `n=` → `nbQuestions`, `s`… `s4` → `sup`… `sup4`, en
   chaînes). Ne jamais inventer d'uuid. Dans ce dépôt, le référentiel est
   lisible par le moteur (`listerExercices`) ou dans le clone
   `~/.cache/mathalea-mobile/mathalea/src/json/referentiel2022FR.json`.
   Exercices interactifs seulement.
2. Parcours : `id` en minuscules et tirets, stable ; `version` 1 pour un
   nouveau, +1 pour toute modification d'un parcours diffusé ; `titre`,
   `objectif` (une phrase pour l'élève), `niveau`, `theme`, `difficulte`
   1 à 3, `presentation`, `correction`. Nouveaux parcours de l'app :
   `enTetesMasques` et `melanger` à `true`.
3. Paliers : somme des `nb` = nombre d'étapes, au moins deux paliers ;
   `style: "ceintures"` et `premiereCeinture` 0 à 6 pour des ceintures.
4. Fichier : `format`, `exporteLe` (ISO), `classes` (noms uniques) ;
   parcours sans classe dans `bibliotheque.parcours` ; objectifs dans
   `bibliotheque.objectifs` (libellé = identifiant, cité par les étapes).
5. Vérifier avant de rendre :
   `npx tsx -e "import('./src/lib/partage.ts').then(m => m.lireFichier(require('fs').readFileSync('<fichier>','utf8')))"`
   ne doit rien afficher ; sinon le message dit quel parcours est invalide.

## Rédaction

Français, titres d'élève courts (sans la référence du site), aucun tiret
cadratin, objectif concret (« Additionner deux relatifs sans hésiter »).
