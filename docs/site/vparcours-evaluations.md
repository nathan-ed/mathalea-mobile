# Évaluations annoncées : à faire sur la page `?v=parcours` de MathALÉA

Fiche de travail à copier dans le dépôt de MathALÉA (branche depuis
`origin/main`, MR `coopmaths/mathalea`). L'app mobile lit déjà ce format
(côté élève, novembre 2026) ; il reste à l'écrire depuis le site. Écrite sans
accès au dépôt de MathALÉA : les noms de fichiers sont ceux de
`docs/a-reporter-site-parcours.md`, les extraits de code sont à ajuster au
code en place (identifiants en anglais, règle du dépôt).

## Ce que voit l'élève

L'enseignant annonce une évaluation à une classe : un jour, des parcours, un
titre facultatif. Dans l'app, l'accueil de l'élève propose « Préparer
l'évaluation ». Un toucher, et jusqu'au jour de l'évaluation ses révisions ne
portent que sur ces parcours ; les parcours pas terminés sont rappelés sous
« À finir avant l'évaluation ». Rien ne revient à l'enseignant.

## Format

Champ facultatif `evaluations` dans une classe du fichier `classes-mathalea/1`,
à côté de `parcours` :

```json
{
  "format": "classes-mathalea/1",
  "exporteLe": "2026-11-15T10:00:00.000Z",
  "classes": [
    {
      "nom": "5e A",
      "parcours": [],
      "evaluations": [
        {
          "id": "eval-relatifs",
          "date": "2026-11-20",
          "titre": "Évaluation sur les relatifs",
          "parcours": ["additions-relatifs", "soustractions-relatifs"]
        }
      ]
    }
  ]
}
```

| Champ | Obligatoire | Type | Règle |
|---|---|---|---|
| `id` | oui | texte | Non vide, unique dans la classe, inchangé pendant toute la vie de l'évaluation |
| `date` | oui | texte | Jour de l'évaluation, `AAAA-MM-JJ`, sans heure |
| `parcours` | oui | liste de textes | `id` de parcours de la classe ; au moins un, sinon l'app ne la propose pas |
| `titre` | non | texte | Affiché à l'élève ; sans lui, l'app affiche le jour seul |

Règles que le site doit respecter :

- **Garder l'`id` à la modification.** Les élèves qui préparent l'évaluation
  suivent un changement de jour ou de parcours. Un nouvel `id` leur serait
  proposé comme une nouvelle évaluation.
- **Retirer une évaluation** du fichier arrête la préparation des élèves qui
  ne l'ont pas modifiée.
- **Une entrée mal formée fait refuser tout le fichier** par l'app : contrôler
  avant l'export.
- **Un `id` de parcours inconnu est ignoré** : ne proposer que les parcours de
  la classe ; retirer d'une évaluation un parcours enlevé à la classe.
- **Classe sans évaluation : ne pas écrire le champ** (ni liste vide), le
  fichier reste identique à celui d'avant.
- Plusieurs fichiers dans le dossier : pour un même `id`, le fichier exporté
  le plus récemment l'emporte ; une publication complète (`banque: true`)
  plus récente sans l'évaluation la retire.
- Les apps d'avant ignorent le champ.

## Types (`parcoursTypes.ts`)

```ts
/** Evaluation announced to a class: its day and the parcours it covers */
export interface AnnouncedEvaluation {
  id: string // stable: editing the date or the parcours keeps it
  date: string // YYYY-MM-DD
  parcours: string[] // ids of parcours of the class
  titre?: string
}
```

Et sur le type d'une classe du fichier : `evaluations?: AnnouncedEvaluation[]`.
Les clés JSON restent en français (`titre`, `parcours`, `evaluations`), comme
le reste du format.

## Contrôle (`parcoursFile.ts`)

Même règle que `evaluationsAnnoncees` de l'app (`src/lib/validation.ts`) :

```ts
const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

export function isAnnouncedEvaluations(v: unknown): v is AnnouncedEvaluation[] {
  if (!Array.isArray(v)) return false
  const ids = new Set<string>()
  for (const e of v) {
    if (typeof e !== 'object' || e === null) return false
    const { id, date, parcours, titre } = e as Record<string, unknown>
    if (typeof id !== 'string' || id === '' || ids.has(id)) return false
    if (!isDay(date)) return false
    if (!Array.isArray(parcours) || !parcours.every((p) => typeof p === 'string')) return false
    if (titre !== undefined && typeof titre !== 'string') return false
    ids.add(id)
  }
  return true
}
```

À appeler dans le contrôle d'une classe : `evaluations` absent, ou
`isAnnouncedEvaluations(c.evaluations)`.

## Bibliothèque et export (`parcoursLibrary.ts`)

- Les évaluations se gardent par classe, à côté de l'attribution des parcours.
- Nouvelle évaluation : `id` créé une fois (par exemple `eval-` suivi d'un
  identifiant aléatoire court), jamais recalculé d'après le titre ou la date.
- Parcours retiré d'une classe : le retirer des évaluations de cette classe.
- Classe renommée : ses évaluations la suivent.
- Export : écrire `evaluations` dans la classe seulement s'il y en a. Les
  évaluations passées peuvent rester dans le fichier (l'app les ignore) ; les
  retirer à l'export un mois après leur date évite que le fichier grossisse.
- Un changement d'évaluation compte comme un changement à publier (même
  rappel que pour un parcours modifié).

## Interface (vue Classes de `?v=parcours`)

Sous les parcours d'une classe, un bloc « Évaluations » :

- liste des évaluations à venir, la plus proche d'abord : titre (ou
  « Évaluation »), jour en toutes lettres, nombre de parcours ; actions
  modifier et supprimer ;
- « Annoncer une évaluation » : titre (facultatif), jour (champ date, pas
  avant aujourd'hui), parcours de la classe à cocher (au moins un) ;
- bouton d'enregistrement éteint tant qu'il manque le jour ou un parcours,
  avec la ligne « À compléter : … » déjà utilisée par l'éditeur ;
- rappel sous le bloc : les élèves voient l'évaluation quand le fichier
  exporté est déposé dans le dossier partagé.

Pas d'évaluation commune à plusieurs classes dans un premier temps : une
évaluation appartient à une classe (la dupliquer suffit).

## Tests (`tests/unit/parcours.test.ts`)

```ts
describe('announced evaluations', () => {
  const e = { id: 'e1', date: '2026-11-20', parcours: ['fractions-4e'], titre: 'Fractions' }

  it('accepts a well-formed list', () => {
    expect(isAnnouncedEvaluations([e, { id: 'e2', date: '2026-12-01', parcours: [] }])).toBe(true)
    expect(isAnnouncedEvaluations([])).toBe(true)
  })

  it('rejects what the app would refuse', () => {
    for (const bad of [[{ ...e, date: 'vendredi' }], [{ ...e, date: '20/11/2026' }], [{ ...e, id: '' }], [e, e], [{ ...e, parcours: 'fractions-4e' }], [{ ...e, titre: 3 }], 'e1'])
      expect(isAnnouncedEvaluations(bad)).toBe(false)
  })
})
```

À ajouter aussi, selon les fonctions du site :

- l'export d'une classe avec une évaluation contient `evaluations`, celui
  d'une classe sans évaluation ne contient pas le champ ;
- modifier le jour ou les parcours garde l'`id` ;
- retirer un parcours d'une classe le retire de ses évaluations ;
- un fichier exporté par le site est relu sans erreur (aller-retour).

## Vérifier avec l'app

1. Exporter depuis le site un fichier avec une évaluation à venir et le
   déposer dans un dossier partagé suivi par l'app.
2. Dans l'app (élève de cette classe) : l'accueil propose « Préparer
   l'évaluation », le titre et le jour sont ceux du site.
3. Changer le jour sur le site, réexporter, redéposer : l'app suit au
   prochain lancement.
4. Côté app, la suite `node e2e/evaluation-annoncee.mjs` joue ce parcours
   avec un dossier simulé ; le format y est celui de cette fiche.

Références dans l'app : `EvaluationAnnoncee` et `fusionner`
(`src/lib/partage.ts`), `evaluationsAnnoncees` (`src/lib/validation.ts`),
`annonceAProposer`, `preparerAnnonce`, `suivreAnnonces`
(`src/lib/revisions.ts`), tests `tests/partage.test.ts` et
`tests/revisions.test.ts`.
