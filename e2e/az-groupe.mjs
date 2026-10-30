// Répartit tous les parcours proposés en GROUPES groupes (5 par défaut) joués
// en parallèle de A à Z par scripts/verifier-release.sh : chaque fichier de
// explorer/ et la démonstration, sans liste à tenir à jour (un parcours ajouté
// est testé d'office).
//   GROUPE=2 GROUPES=5 node e2e/az-groupe.mjs   (LISTE=1 : la répartition seule)
import { readdirSync, readFileSync } from 'node:fs'

const fichiers = [...readdirSync('explorer').filter((f) => f.endsWith('.json')).map((f) => `explorer/${f}`), 'static/demo/parcours-demonstration.json']
const parcours = fichiers.flatMap((f) => {
  const d = JSON.parse(readFileSync(f, 'utf8'))
  return (d.classes ?? []).flatMap((c) => c.parcours.map((p) => ({ f, id: p.id, n: p.etapes.reduce((s, e) => s + (Number(e.nbQuestions) || 3), 0) })))
})
// Groupes équilibrés par nombre de questions (le temps de jeu en dépend)
const groupes = Array.from({ length: Number(process.env.GROUPES ?? 5) }, () => [])
for (const p of [...parcours].sort((a, b) => b.n - a.n)) groupes.sort((a, b) => a.reduce((s, x) => s + x.n, 0) - b.reduce((s, x) => s + x.n, 0))[0].push(p)
const g = groupes.sort((a, b) => a.map((x) => x.id).join().localeCompare(b.map((x) => x.id).join()))[Number(process.env.GROUPE ?? 1) - 1]
console.log(`Groupe ${process.env.GROUPE ?? 1}/${groupes.length} : ${g.map((x) => x.id).join(', ')}`)
if (process.env.LISTE) process.exit(0) // seulement la répartition
process.env.PARCOURS = g.map((x) => x.id).join(',')
process.argv.push(...new Set(g.map((x) => x.f)))
await import('./parcours-az.mjs')
