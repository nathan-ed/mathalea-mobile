// Consigne un constat de relecture (lecture du texte, des captures ou du code)
// dans revue/relecture.jsonl, repris par revue/rapport.mjs.
//   node revue/noter.mjs <id> <règle> <gravité> "<constat>" ["<correction proposée>"] ["<fichier:ligne>"]
import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const [id, regle, gravite, extrait, correction, ou] = process.argv.slice(2)
if (!extrait) {
  console.error('usage : node revue/noter.mjs <id> <règle> <gravité> "<constat>" ["<correction>"] ["<fichier:ligne>"]')
  process.exit(1)
}
const ref = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const e = ref.find((x) => x.id === id) ?? { id, uuid: '', niveau: '?', theme: '' }
appendFileSync(
  join(ici, 'relecture.jsonl'),
  JSON.stringify({ id: e.id, uuid: e.uuid, niveau: e.niveau, theme: e.theme, pays: e.pays, regle, gravite: Number(gravite), extrait, correction, ou: ou ?? 'relecture', relu: true }) + '\n',
)
