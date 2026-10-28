// Fabrique docs/revue-exercices/trouvailles.md à partir de revue/journal.jsonl
// (constats automatiques) et de revue/relecture.jsonl (constats de lecture,
// captures et code, confirmés à la main). Regroupe les constats répétés d'une
// variante ou d'une graine à l'autre.
//   node revue/rapport.mjs            écrit le fichier
//   node revue/rapport.mjs --resume   résumé dans le terminal
//   node revue/rapport.mjs --exo <id> tous les constats d'un exercice
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const lire = (f) =>
  existsSync(f)
    ? readFileSync(f, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l))
    : []
const journal = lire(join(ici, 'journal.jsonl'))
const relecture = [...lire(join(ici, 'relecture.jsonl')), ...lire(join(ici, 'source.jsonl')), ...lire(join(ici, 'texte.jsonl'))]
// Règles de texte : prises dans texte.jsonl (rejoué avec les derniers contrôles), pas dans le journal
const deTexte = (c) => /^(N[1-7]|T\d|R\d+|M5|M7|X3)$/.test(c.regle) || (c.regle === 'X2' && /^nombre impair/.test(c.extrait ?? ''))
const journalBanc = journal.filter((c) => !deTexte(c))
const referentiel = existsSync(join(ici, 'referentiel.json')) ? JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8')) : []
const fait = existsSync(join(ici, 'fait.txt')) ? new Set(readFileSync(join(ici, 'fait.txt'), 'utf8').split('\n').filter(Boolean)) : new Set()
// Constats écartés à la relecture (faux positifs) : { id, regle, motif }
const ecartes = lire(join(ici, 'ecartes.jsonl'))

const NOMS = {
  I1: 'Bonne réponse refusée',
  I2: 'Réponse fausse acceptée',
  I3: 'Champ vide accepté ou en erreur',
  I4: 'Question interactive sans champ',
  I5: 'Barème qui change selon le tirage',
  IM: 'Interactif à tester à la main',
  M1: 'Valeur mise en évidence refusée par le champ',
  M2: 'Unité dans miseEnEvidence',
  M3: 'QCM : la bonne proposition n’est pas mise en évidence telle quelle (à vérifier)',
  M4: 'QCM : mise en évidence et bonne proposition différentes',
  M5: 'Texte dans miseEnEvidence',
  M6: 'Pas de mise en évidence du résultat',
  M7: 'Explication en orange',
  M8: 'Nombre de mises en évidence et de champs différents',
  C1: 'Contenu mathématique faux ou ambigu',
  N7: 'Zéros significatifs (prix…)',
  T9: 'Mot non écrit en \\text dans une formule',
  N1: 'Nombre hors $',
  N2: 'Séparateur des milliers',
  N3: 'Point décimal',
  N4: 'Flottant ou notation scientifique',
  N5: 'Négatif sans parenthèses',
  N6: 'Écriture algébrique (1x, +-, -0…)',
  T1: 'Espace avant %',
  T2: 'Unité (espace, \\text)',
  T3: 'Espace avant : ; ! ?',
  T4: 'Guillemets',
  T5: 'Espaces en trop',
  T6: 'Points de suspension',
  T8: 'Commande LaTeX collée',
  R1: 'Titre',
  R2: 'Impératif ou tutoiement',
  R3: 'Point final',
  R4: 'Dernière phrase en saisie libre',
  R5: 'Virgule (soit, alors, or)',
  R6: 'Majuscule sans accent',
  R8: 'Orthographe uniformisée (en dessous, au-dessus…)',
  R9: 'Notation des probabilités',
  R10: 'Français (accords, fautes, coquilles)',
  X1: 'Erreur ou exception',
  X2: 'Formule cassée (KaTeX, $)',
  X3: 'undefined, NaN…',
  X4: 'Question en double ou vide',
  X5: 'Débordement à 390 px',
  X6: 'Même graine, exercice différent',
  X7: 'Combinaisons de paramètres non toutes passées',
}
const GRAVITES = { 1: 'Interactif faux', 2: 'Rendu cassé', 3: 'Mise en évidence', 4: 'Typographie', 5: 'Rédaction', 6: 'Pour mémoire' }

// Regroupement : même exercice, même règle, même extrait aux nombres près
const motif = (s) => String(s ?? '').replace(/\d+/g, '#').replace(/\s+/g, ' ').slice(0, 140)
const groupes = new Map()
for (const c of [...journalBanc, ...relecture]) {
  if (ecartes.some((e) => e.id === c.id && e.regle === c.regle && (!e.motif || motif(c.extrait).includes(e.motif)))) continue
  const detail = c.source ? c.ou : /^[IMX]/.test(c.regle) ? motif(c.extrait) : ''
  const cle = `${c.id}|${c.regle}|${c.ou ?? ''}|${detail}`
  const g = groupes.get(cle) ?? { ...c, n: 0, variantes: new Set(), exemples: [] }
  g.n++
  if (c.variante) g.variantes.add(c.variante)
  if (g.exemples.length < 3 && !g.exemples.some((x) => motif(x) === motif(c.extrait))) g.exemples.push(c.extrait)
  groupes.set(cle, g)
}
const liste = [...groupes.values()].sort(
  (a, b) => a.gravite - b.gravite || a.regle.localeCompare(b.regle) || a.niveau.localeCompare(b.niveau) || a.id.localeCompare(b.id),
)

const args = process.argv.slice(2)
if (args.includes('--exo')) {
  const id = args[args.indexOf('--exo') + 1]
  for (const g of liste.filter((g) => g.id === id))
    console.log(`${g.regle} [${g.ou ?? ''}] ×${g.n} (${[...g.variantes].slice(0, 3).join(' ; ')}) ${g.exemples.join(' ‖ ')}${g.saisie ? ' saisie ' + JSON.stringify(g.saisie) : ''}`)
  process.exit(0)
}
if (args.includes('--resume')) {
  const parRegle = {}
  for (const g of liste) {
    parRegle[g.regle] ??= { exos: new Set(), groupes: 0 }
    parRegle[g.regle].exos.add(g.id)
    parRegle[g.regle].groupes++
  }
  console.log(`${fait.size}/${referentiel.length} exercices passés, ${liste.length} constats regroupés`)
  for (const [r, v] of Object.entries(parRegle).sort()) console.log(`${r.padEnd(4)} ${String(v.exos.size).padStart(5)} exercices ${String(v.groupes).padStart(6)} constats  ${NOMS[r] ?? ''}`)
  process.exit(0)
}

const echapper = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/</g, '&lt;')
let md = `# Revue des exercices : trouvailles

Fichier produit par \`node revue/rapport.mjs\` à partir du journal du banc
(\`revue/journal.jsonl\`) et de la relecture (\`revue/relecture.jsonl\`).
Règles : [regles.md](regles.md). État : [etat.md](etat.md).

Avancement : **${fait.size} exercices passés sur ${referentiel.length}**.
Constats regroupés : ${liste.length} (un groupe = même exercice, même règle,
même extrait aux nombres près ; « ×n » = nombre de tirages concernés).

Tri : gravité, puis règle, puis niveau et exercice. Les constats
automatiques de typographie et de rédaction (gravité 4 et 5) sont des
candidats : une partie est écartée à la relecture (\`revue/ecartes.jsonl\`).

## Sommaire

| Gravité | Règle | Exercices | Constats |
| --- | --- | ---: | ---: |
`
const resume = {}
for (const g of liste) {
  const k = `${g.gravite}|${g.regle}`
  resume[k] ??= { exos: new Set(), n: 0 }
  resume[k].exos.add(g.id)
  resume[k].n++
}
for (const [k, v] of Object.entries(resume).sort()) {
  const [grav, r] = k.split('|')
  md += `| ${grav} ${GRAVITES[grav]} | [${r} ${NOMS[r] ?? ''}](#${r.toLowerCase()}) | ${v.exos.size} | ${v.n} |\n`
}
let regleCourante = ''
for (const g of liste) {
  if (g.regle !== regleCourante) {
    regleCourante = g.regle
    md += `\n## ${g.regle}\n\n**${NOMS[g.regle] ?? g.regle}** (gravité ${g.gravite} : ${GRAVITES[g.gravite]})\n\n| Exercice | Où | Constat | Tirages |\n| --- | --- | --- | --- |\n`
  }
  const vs = [...g.variantes]
  md += `| ${g.id} (${echapper(g.niveau)}) | ${echapper(g.ou ?? '')}${g.q != null && g.q >= 0 ? ` q${g.q + 1}` : ''}${g.format ? ` ${g.format}` : ''} | ${echapper(g.exemples.join(' ‖ '))}${g.correction ? ` → ${echapper(g.correction)}` : ''} | ×${g.n}${vs.length ? ` ; ${echapper(vs.slice(0, 2).join(' ; '))}${vs.length > 2 ? '…' : ''}` : ''}${g.graine ? ` (${g.graine})` : ''} |\n`
}
writeFileSync(join(ici, '..', 'docs', 'revue-exercices', 'trouvailles.md'), md)
console.log(`${liste.length} constats regroupés écrits`)
