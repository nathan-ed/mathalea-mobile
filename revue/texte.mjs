// Contrôles du texte rejoués sur les sorties du banc (revue/sorties), pour
// profiter des contrôles ajoutés après le passage du banc. Écrit
// revue/texte.jsonl ; revue/rapport.mjs prend les règles de texte ici et non
// dans le journal du banc.
//   node revue/texte.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { controler, controlerSerie } from './controles.mjs'

const ici = dirname(fileURLToPath(import.meta.url))
const ref = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const parId = new Map(ref.map((e) => [e.id.replace(/[^\w-]+/g, '_'), e]))
const lignes = []
const dossier = join(ici, 'sorties')
for (const f of existsSync(dossier) ? readdirSync(dossier) : []) {
  const s = JSON.parse(readFileSync(join(dossier, f), 'utf8'))
  const e = parId.get(f.replace(/\.json$/, '')) ?? { id: s.id, uuid: s.uuid, niveau: '?', theme: '' }
  const base = { id: e.id, uuid: e.uuid, niveau: e.niveau, theme: e.theme, pays: e.pays, texte: true }
  const vus = new Set()
  const passe = (html, type, ou, ctx) => {
    if (!html || vus.has(type + html)) return
    vus.add(type + html)
    for (const c of controler(html, { type, pays: e.pays })) lignes.push(JSON.stringify({ ...base, ...ctx, ...c, ou }))
  }
  passe(s.titre, 'titre', 'titre', {})
  for (const v of s.variantes ?? []) {
    const ctx = { variante: v.variante, graine: v.graine }
    passe(v.consigne, 'consigne', 'consigne', ctx)
    passe(v.introduction, 'enonce', 'introduction', ctx)
    for (const c of controlerSerie(v.questions)) if (c.regle === 'X1') lignes.push(JSON.stringify({ ...base, ...ctx, ...c, ou: 'série' }))
    v.questions.forEach((q, i) => {
      passe(q.enonce, 'enonce', 'énoncé', { ...ctx, q: i })
      passe(q.correction, 'correction', 'correction', { ...ctx, q: i })
    })
  }
  ;(s.nonInteractif ?? []).forEach((q, i) => {
    passe(q.enonce, 'enonce', 'énoncé non interactif', { q: i })
    passe(q.correction, 'correction', 'correction non interactive', { q: i })
  })
}
writeFileSync(join(ici, 'texte.jsonl'), lignes.join('\n') + '\n')
console.log(`${lignes.length} constats de texte`)
