// Résumés intermédiaires par degré, pour commencer les corrections sans
// attendre la fin de la revue : docs/revue-exercices/par-degre/<degré>.md.
// Constats confirmés à la relecture d'abord (relecture.jsonl), triés par
// gravité puis fichier ; ensuite les constats graves du banc encore à
// confirmer ; enfin le volume des constats automatiques de typographie.
//   node revue/degres.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const sortie = join(ici, '..', 'docs', 'revue-exercices', 'par-degre')
mkdirSync(sortie, { recursive: true })
const lire = (f) =>
  existsSync(f)
    ? readFileSync(f, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l))
    : []
const relecture = lire(join(ici, 'relecture.jsonl'))
const journal = lire(join(ici, 'journal.jsonl'))
const texte = lire(join(ici, 'texte.jsonl'))
const ecartes = lire(join(ici, 'ecartes.jsonl'))
const relus = new Set(existsSync(join(ici, 'relus.txt')) ? readFileSync(join(ici, 'relus.txt'), 'utf8').split('\n') : [])
const referentiel = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const parId = new Map(referentiel.map((e) => [e.id, e]))

/** Degré d'un exercice : niveau du référentiel, ou déduit de l'identifiant pour les CAN */
function degre(id, niveau) {
  if (id === 'moteur-app') return 'App'
  const m = /^can(c3|CM|CE|6|5|4|3|2|1|T)/.exec(id)
  if (m) return { c3: 'Primaire', CM: 'Primaire', CE: 'Primaire', 6: '6e', 5: '5e', 4: '4e', 3: '3e', 2: '2de', 1: '1re', T: 'Terminale' }[m[1]]
  if (parId.get(id)?.pays === 'CH') return 'Suisse'
  const n = String(niveau ?? parId.get(id)?.niveau ?? '').toLowerCase()
  if (/^(cm1|cm2|ce1|ce2|cp)/.test(n)) return 'Primaire'
  if (/^6/.test(n)) return '6e'
  if (/^5/.test(n)) return '5e'
  if (/^4/.test(n)) return '4e'
  if (/^3/.test(n)) return '3e'
  if (/^2|seconde/.test(n)) return '2de'
  if (/^1|premi/.test(n)) return '1re'
  if (/termin|^t/.test(n)) return 'Terminale'
  if (parId.get(id)?.pays === 'CH') return 'Suisse'
  return 'Autres'
}
const ORDRE = ['App', 'Primaire', '6e', '5e', '4e', '3e', '2de', '1re', 'Terminale', 'Suisse', 'Autres']
// Sections par nature de correction, dans l'ordre d'urgence
const SECTIONS = [
  ['Interactif faux (la bonne réponse est refusée, ou pas de champ)', (c) => /^I/.test(c.regle)],
  ['Contenu mathématique faux', (c) => c.regle === 'C1'],
  ['Rendu cassé (formule, débordement, erreur)', (c) => /^X/.test(c.regle)],
  ['Mise en évidence (miseEnEvidence et champs)', (c) => /^M/.test(c.regle)],
  ['Typographie (nombres, espaces, notations)', (c) => /^[NT]/.test(c.regle)],
  ['Rédaction (français, titres, consignes)', () => true],
]
const section = (c) => SECTIONS.findIndex(([, f]) => f(c))
const NOMS = { C1: 'Contenu mathématique faux', I1: 'Bonne réponse refusée', I2: 'Réponse fausse acceptée', I4: 'Question sans champ', X1: 'Erreur', X2: 'Formule cassée', X5: 'Débordement à 390 px', M1: 'Évidence refusée par le champ', M2: 'Unité en évidence', M4: 'QCM : évidence ≠ proposition', M5: 'Texte en évidence', M8: 'Évidences et champs', N1: 'Nombre hors $', N2: 'Séparateur des milliers', N5: 'Négatif sans parenthèses', N6: 'Écriture algébrique', N7: 'Prix', R1: 'Titre', R2: 'Tutoiement, impératif', R5: 'Virgule', R10: 'Français', T1: 'Espace avant %', T5: 'Espaces', T6: 'Points de suspension', T9: 'Mot en italique' }
const ecarte = (c) => ecartes.some((e) => e.id === c.id && e.regle === c.regle && (!e.motif || String(c.extrait ?? '').includes(e.motif)))
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/</g, '&lt;')

const parDegre = new Map()
const ajoute = (d, cle, x) => {
  if (!parDegre.has(d)) parDegre.set(d, { confirmes: [], banc: new Map(), auto: {}, exos: new Set() })
  const g = parDegre.get(d)
  if (cle === 'confirmes') g.confirmes.push(x)
  return g
}
for (const c of relecture) if (!ecarte(c)) ajoute(degre(c.id, c.niveau), 'confirmes', c).exos.add(c.id)
// Graves du banc, pas encore confirmés : regroupés par exercice et règle
for (const c of journal) {
  if (!/^(I1|I2|I4|X1|X2|X6)$/.test(c.regle) || ecarte(c)) continue
  if (c.regle === 'X1' && /Execution context|reading 'preparer'|reading 'interactif'|bugsnag/.test(c.extrait ?? '')) continue
  if (c.regle === 'I1' && c.saisie && !Object.keys(c.saisie).length) continue
  const g = ajoute(degre(c.id, c.niveau))
  const k = `${c.id}|${c.regle}`
  const v = g.banc.get(k) ?? { id: c.id, regle: c.regle, n: 0, extrait: c.extrait }
  v.n++
  g.banc.set(k, v)
}
for (const c of texte) {
  if (ecarte(c)) continue
  const g = ajoute(degre(c.id, c.niveau))
  g.auto[c.regle] = (g.auto[c.regle] ?? 0) + 1
}

const index = []
for (const d of ORDRE) {
  const g = parDegre.get(d)
  if (!g) continue
  const exosRef = referentiel.filter((e) => degre(e.id, e.niveau) === d)
  const lus = exosRef.filter((e) => relus.has(e.id)).length
  const conf = g.confirmes.sort((a, b) => section(a) - section(b) || String(a.ou).localeCompare(String(b.ou)) || a.id.localeCompare(b.id))
  let md = `# Revue des exercices : ${d}\n\nRésumé intermédiaire produit par \`node revue/degres.mjs\` (revue en cours).\n`
  md += `Exercices relus : **${lus} sur ${exosRef.length}**. Constats confirmés : **${conf.length}**.\n\n`
  md += `Les constats confirmés ont été vus à la relecture (texte, code, essais de saisie) : on peut les corriger. Les constats du banc plus bas sont automatiques et restent à confirmer.\n\n`
  const parS = {}
  for (const c of conf) parS[section(c)] = (parS[section(c)] ?? 0) + 1
  md += `| Nature | Constats |\n| --- | ---: |\n${Object.entries(parS).map(([k, v]) => `| ${SECTIONS[k][0]} | ${v} |`).join('\n')}\n`
  let cour = -1
  for (const c of conf) {
    if (section(c) !== cour) {
      cour = section(c)
      md += `\n## ${SECTIONS[cour][0]}\n\n| Exercice | Règle | Constat | Correction proposée | Fichier |\n| --- | --- | --- | --- | --- |\n`
    }
    md += `| ${esc(c.id)} | ${c.regle} ${NOMS[c.regle] ?? ''} | ${esc(c.extrait)} | ${esc(c.correction)} | ${esc(c.ou)} |\n`
  }
  const banc = [...g.banc.values()].sort((a, b) => a.regle.localeCompare(b.regle) || a.id.localeCompare(b.id))
  if (banc.length) {
    md += `\n## Constats graves du banc, à confirmer\n\n| Exercice | Règle | Tirages | Exemple |\n| --- | --- | ---: | --- |\n`
    for (const b of banc) md += `| ${esc(b.id)} | ${b.regle} ${NOMS[b.regle] ?? ''} | ${b.n} | ${esc(String(b.extrait).slice(0, 160))} |\n`
  }
  const auto = Object.entries(g.auto).sort((a, b) => b[1] - a[1])
  if (auto.length) md += `\n## Typographie et rédaction détectées automatiquement\n\nVolume par règle (détail dans [trouvailles.md](../trouvailles.md)) : ${auto.map(([r, n]) => `${r} ${NOMS[r] ?? ''} ${n}`).join(' ; ')}.\n`
  const nom = d.toLowerCase().replace(/[^\w]+/g, '-')
  writeFileSync(join(sortie, `${nom}.md`), md)
  index.push(`| [${d}](${nom}.md) | ${lus} / ${exosRef.length} | ${conf.length} | ${conf.filter((c) => section(c) <= 1).length} | ${banc.length} |`)
}
writeFileSync(
  join(sortie, 'README.md'),
  `# Revue des exercices par degré\n\nRésumés intermédiaires (\`node revue/degres.mjs\`), mis à jour au fil de la revue.\n\n| Degré | Exercices relus | Constats confirmés | dont interactif faux ou maths fausses | Constats graves du banc à confirmer |\n| --- | ---: | ---: | ---: | ---: |\n${index.join('\n')}\n`,
)
console.log(index.join('\n'))
