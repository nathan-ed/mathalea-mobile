// Télécharge les parcours officiels de l'Explorer (dossier kDrive partagé,
// sous-dossiers FR et CH), comme l'app les lit (lireKdrive de partage.ts).
//   node scripts/claviers/telecharger-explorer.mjs <dossier de sortie>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sortie = process.argv[2]
if (!sortie) throw new Error('Dossier de sortie manquant.')
const source = readFileSync(new URL('../../src/lib/partage.ts', import.meta.url), 'utf8')
const lien = /DOSSIER_EXPLORER = '([^']+)'/.exec(source)?.[1]
const m = lien?.match(/share\/(\d+)\/([0-9a-f-]{36})/i)
if (!m) throw new Error('DOSSIER_EXPLORER introuvable dans partage.ts.')
const api = `https://kdrive.infomaniak.com/2/app/${m[1]}/share/${m[2]}`

async function json(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`kDrive ${r.status} : ${url}`)
  return r.json()
}
async function lister(dossier) {
  const tout = []
  for (let page = 1; ; page++) {
    const liste = (await json(`${api}/files/${dossier}/files?per_page=200&page=${page}`)).data
    tout.push(...liste)
    if (liste.length < 200) break
  }
  return tout
}

const racine = (await json(`${api}/init`)).data.file_id
let n = 0
for (const d of (await lister(racine)).filter((x) => x.type === 'dir')) {
  const pays = d.name.toUpperCase()
  mkdirSync(join(sortie, pays), { recursive: true })
  for (const f of (await lister(d.id)).filter((x) => x.type !== 'dir' && /\.json$/i.test(x.name))) {
    const r = await fetch(`${api}/files/${f.id}/download`)
    if (!r.ok) throw new Error(`kDrive ${r.status} : ${f.name}`)
    writeFileSync(join(sortie, pays, f.name), Buffer.from(await r.arrayBuffer()))
    n++
  }
}
console.log(`${n} fichiers de l'Explorer dans ${sortie}`)
