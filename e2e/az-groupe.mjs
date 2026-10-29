// Répartit tous les parcours proposés en trois groupes joués en parallèle de A
// à Z : chaque fichier de explorer/ et la démonstration, sans liste à tenir à
// jour (un parcours ajouté est testé d'office). GROUPE=1, 2 ou 3.
import { readdirSync, readFileSync } from 'node:fs'

const fichiers = [...readdirSync('explorer').filter((f) => f.endsWith('.json')).map((f) => `explorer/${f}`), 'static/demo/parcours-demonstration.json']
const parcours = fichiers.flatMap((f) => {
  const d = JSON.parse(readFileSync(f, 'utf8'))
  return (d.classes ?? []).flatMap((c) => c.parcours.map((p) => ({ f, id: p.id, n: p.etapes.length })))
})
// Groupes équilibrés par nombre d'étapes
const groupes = [[], [], []]
for (const p of [...parcours].sort((a, b) => b.n - a.n)) groupes.sort((a, b) => a.reduce((s, x) => s + x.n, 0) - b.reduce((s, x) => s + x.n, 0))[0].push(p)
const g = groupes.sort((a, b) => a.map((x) => x.id).join().localeCompare(b.map((x) => x.id).join()))[Number(process.env.GROUPE ?? 1) - 1]
console.log(`Groupe ${process.env.GROUPE} : ${g.map((x) => x.id).join(', ')}`)
if (process.env.LISTE) process.exit(0) // seulement la répartition
process.env.PARCOURS = g.map((x) => x.id).join(',')
process.argv.push(...new Set(g.map((x) => x.f)))
await import('./parcours-az.mjs')
