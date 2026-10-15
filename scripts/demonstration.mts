// Parcours de démonstration chargés depuis les Réglages (enseignant seulement,
// sur demande) : une liste simple, des paliers, des ceintures. Fichier au
// format des dossiers partagés, écrit dans static/demo.
//   npx tsx scripts/demonstration.mts
import { mkdirSync, writeFileSync } from 'node:fs'
import { creerFichier } from '../src/lib/partage.ts'
import { catalogue } from '../tests/parcours-de-test.ts'

const ids = ['relatifs-5e', 'relatifs-paliers-5e', 'relatifs-ceintures-5e', 'fractions-4e']
const parcours = ids.map((id) => catalogue.find((p) => p.id === id)!)
mkdirSync('static/demo', { recursive: true })
writeFileSync('static/demo/parcours-demonstration.json', creerFichier([{ nom: 'Démonstration', parcours }], true))
console.log(`${parcours.length} parcours écrits dans static/demo/parcours-demonstration.json`)
