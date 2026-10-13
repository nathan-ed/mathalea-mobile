// Affiche ce que l'app lit dans un dossier partagé (classes, parcours, versions).
//   npx tsx scripts/verifier-dossier.mts <lien de partage>
import { lireFichierDistant } from '../src/lib/partage.ts'

const lien = process.argv[2]
if (!lien) throw new Error('Lien de partage attendu')
const f = await lireFichierDistant(lien, (url, init) => fetch(url, init))
for (const c of f.classes) {
  console.log(`${c.nom} : ${c.parcours.length} parcours`)
  for (const p of c.parcours) console.log(`  ${p.id} V${p.version} · ${p.titre}`)
}
