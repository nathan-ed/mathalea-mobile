// Prochains exercices à relire : ordre du référentiel, passés au banc, pas
// encore dans revue/relus.txt (passés = dans revue/fait.txt et avec une sortie).   node revue/suivants.mjs [nombre] [regex]
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ici = dirname(fileURLToPath(import.meta.url))
const [n = '15', motif = '.'] = process.argv.slice(2)
const ref = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const relus = new Set(existsSync(join(ici, 'relus.txt')) ? readFileSync(join(ici, 'relus.txt'), 'utf8').split('\n') : [])
const fait = new Set(existsSync(join(ici, 'fait.txt')) ? readFileSync(join(ici, 'fait.txt'), 'utf8').split('\n') : [])
const re = new RegExp(motif)
console.log(ref.filter((e) => re.test(e.id) && !relus.has(e.id) && fait.has(e.uuid) && existsSync(join(ici, 'sorties', `${e.id.replace(/[^\w-]+/g, '_')}.json`))).slice(0, Number(n)).map((e) => e.id).join(' '))
