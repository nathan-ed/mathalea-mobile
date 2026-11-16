# Report sur la page « Parcours pour l'application » du site

Fiches de cours (octobre 2026) : faites dans MathALÉA, branche
`parcours-fiches` (worktree `mathalea-tickets`), MR à ouvrir après
validation de sa description par Nathan.

Principe : les fiches et les parcours proposés vivent dans l'app (dépôt
`explorer/`, dossiers des enseignants). Le site n'en garde aucune ; sa page
`?v=parcours` est seulement l'éditeur.

Ce que fait la branche :

- Types `Lesson`, `LessonBlock`, `LessonGraph` (`parcoursTypes.ts`), `fiche`
  sur un palier et sur un parcours.
- Contrôle identique à `estFiche` de l'app (`lessonFile.ts`, analyseur
  d'expressions `lessonExpression.ts`, même grammaire que `expression.ts`).
- Fiches gardées quand on supprime un palier ou qu'on passe en liste simple
  (`parcoursEditing.ts`).
- Éditeur (`LessonEditor.svelte`) : blocs repliables, barre de mise en forme,
  formulaires par type (graphique : courbes, fenêtre, curseurs, aire), JSON
  modifiable, « À compléter », aperçu rendu comme dans l'app
  (`LessonPreview.svelte`, `LessonGraph.svelte`, KaTeX).
- Onglet « Fiches » (fiche seule, `fiche-mathalea/1`) et, sous chaque
  palier, ajout, import, modification en plein écran, téléchargement.

À garder synchronisé : un changement du format des fiches dans l'app
(`catalogue.ts`, `validation.ts`, `expression.ts`, `texteRiche.ts`,
`Cours.svelte`, `GraphiqueCours.svelte`) se reporte dans ces fichiers du
site, et inversement.

## Date d'ouverture d'un palier (0.4.5, à reporter)

L'app lit `ouverture` sur un palier (voir `catalogue.ts`, `estOuverture`,
`ouvertureDuJour`) : instant « AAAA-MM-JJT08:00:00 » avec le décalage horaire de
l'enseignant, valable aussi pour le premier palier. L'éditeur du site ne la
connaît pas : ni champ « À partir d'une date » (sous « Pour y accéder »), ni
conservation du champ quand on modifie un parcours déjà daté (à vérifier :
`parcoursEditing.ts` reconstruit des objets de palier). À faire dans la même
branche que les fiches : type `ouverture?: string` (`parcoursTypes.ts`),
contrôle (`parcoursFile.ts`), champ jour dans `ParcoursEditor.svelte`
(« À partir d'une date », 8 h affichées), schéma `ParcoursSchema.svelte` (palier
fermé avant la date).

## Repartir de zéro pour un exercice (à reporter)

Un exercice transformé en profondeur peut porter `remiseAZero` (`Etape`, voir
`catalogue.ts`) : dans la version qui le porte, l'élève n'y reprend pas son
ancien résultat (`reprendreResultats`). Case à cocher « Les élèves repartent de
zéro » dans l'éditeur de l'app ; `enregistrer()` remplace `true` par le numéro
de la version ouverte et efface le marqueur d'une version antérieure. À faire
sur le site : type `remiseAZero?: boolean | number` (`parcoursTypes.ts`),
contrôle (`parcoursFile.ts`), conservation par `parcoursEditing.ts`. Côté
élève, la fiche du parcours affiche « Parcours mis à jour » tant qu'aucun
passage n'a été terminé dans la nouvelle version.

## Réessayer avec d'autres valeurs (novembre 2026, à reporter)

L'app lit `reessayer` sur un parcours (`catalogue.ts`, `reessaiPropose`) :
après une réponse incorrecte, « Réessayer avec d'autres valeurs » repose la
même question avec de nouvelles valeurs, sous la correction, hors score.
Absent ou `true` : proposé ; `false` : jamais. Sans effet avec la correction
à la fin du parcours (`correction: "parcours"`).

À faire sur le site : type `reessayer?: boolean` (`parcoursTypes.ts`),
contrôle (`parcoursFile.ts`), valeur par défaut `true` pour un nouveau
parcours (`parcoursLibrary.ts`, `Parcours.svelte`), case « Proposer de
réessayer après une erreur » dans `ParcoursEditor.svelte`, cochée par
défaut et masquée quand la correction est à la fin du parcours, test
`tests/unit/parcours.test.ts`.

## Évaluation annoncée à une classe (novembre 2026, à faire sur le site)

L'app (côté élève, fait) lit dans chaque classe du fichier `classes-mathalea/1`
un champ facultatif `evaluations` :

```json
{
  "format": "classes-mathalea/1",
  "exporteLe": "2026-11-15T10:00:00.000Z",
  "classes": [
    {
      "nom": "5e A",
      "parcours": [],
      "evaluations": [
        { "id": "eval-relatifs", "date": "2026-11-20", "titre": "Évaluation sur les relatifs", "parcours": ["additions-relatifs", "soustractions-relatifs"] }
      ]
    }
  ]
}
```

- `id` : texte non vide, unique dans la classe, **stable** : changer la date ou
  les parcours garde le même `id` (les élèves qui la préparent suivent le
  changement ; un nouvel `id` serait proposé comme une nouvelle évaluation).
- `date` : jour de l'évaluation, `AAAA-MM-JJ`. Le lendemain, la préparation
  des élèves prend fin toute seule.
- `parcours` : `id` de parcours de la classe (au moins un pour qu'elle soit
  proposée ; un `id` inconnu de l'élève est ignoré).
- `titre` : facultatif, affiché à l'élève.
- Retirer une évaluation du fichier arrête la préparation des élèves qui ne
  l'ont pas modifiée.
- Une app d'avant ignore le champ. Un champ mal formé fait refuser le fichier
  (`evaluationsAnnoncees` dans `validation.ts`).

À faire sur le site : type `evaluations?` sur une classe (`parcoursTypes.ts`),
contrôle (`parcoursFile.ts`), écriture à l'export, et dans la vue Classes de
`?v=parcours` un bloc « Évaluations » par classe : titre, jour, parcours de la
classe à cocher. Test `tests/unit/parcours.test.ts`. Rien ne revient des
élèves : l'enseignant ne sait pas qui la prépare.
