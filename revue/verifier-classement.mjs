// Vérifie que le classement (revue/classement/constats.jsonl.gz) ne perd rien :
// chaque ligne de relecture a sa clé L-…, chaque ligne automatique est comptée dans
// exactement un regroupement, chaque constat a une seule catégorie connue, et les
// lignes de texte du journal remplacées par texte.jsonl y ont bien un équivalent.
//   node revue/verifier-classement.mjs
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const ici = dirname(fileURLToPath(import.meta.url))
const lire = (f) => (existsSync(join(ici, f)) ? readFileSync(join(ici, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : null)
const constats = gunzipSync(readFileSync(join(ici, 'classement', 'constats.jsonl.gz'))).toString().split('\n').filter(Boolean).map((l) => JSON.parse(l))
const bilan = JSON.parse(readFileSync(join(ici, 'classement', 'bilan.json'), 'utf8'))
const CATS = ['tickets-interactif', 'tickets-rendu', 'maths-formulation', 'decisions', 'mise-en-evidence', 'francais', 'typographie', 'app-mobile', 'a-ecarter', 'a-tester-main', 'pour-memoire', 'faux-positifs']
let erreurs = 0
const ko = (m) => (erreurs++, console.log('ERREUR', m))

// 1. Clés uniques, une catégorie connue
const cles = new Set()
for (const c of constats) {
  if (cles.has(c.cle)) ko(`clé en double ${c.cle}`)
  cles.add(c.cle)
  if (!CATS.includes(c.categorie)) ko(`catégorie inconnue ${c.categorie} (${c.cle})`)
}
// 2. Relecture : une clé par ligne
const relecture = lire('relecture.jsonl')
const lues = constats.filter((c) => c.origine === 'relecture')
if (lues.length !== relecture.length) ko(`relecture : ${relecture.length} lignes, ${lues.length} constats`)
const lignes = new Set(lues.map((c) => c.ligne))
for (let i = 1; i <= relecture.length; i++) if (!lignes.has(i)) ko(`ligne de relecture ${i} absente`)
// 3. Automatique : la somme des occurrences égale le nombre de lignes retenues
const autos = constats.filter((c) => c.origine !== 'relecture')
const occ = autos.reduce((s, c) => s + c.n, 0)
const attendu = bilan.lignes.journal - bilan.lignes.remplacees - bilan.lignes.i1SansSaisie + bilan.lignes.texte + bilan.lignes.source
if (occ !== attendu) ko(`occurrences automatiques ${occ}, lignes sources retenues ${attendu}`)
for (const c of autos) if (c.n !== c.occurrences.length) ko(`occurrences incomplètes ${c.cle}`)
// 4. Les sources vivantes (si présentes) donnent les mêmes nombres
const journal = lire('journal.jsonl')
if (journal && journal.length !== bilan.lignes.journal) ko(`journal modifié depuis le classement (${journal.length} contre ${bilan.lignes.journal}) : relancer classer.mjs`)
// 5. Lignes de texte du journal remplacées : chaque (exercice, règle) a un équivalent rejoué ou est consigné
if (journal) {
  const deTexte = (c) => /^(N[1-7]|T\d|R\d+|M5|M7|X3)$/.test(c.regle) || (c.regle === 'X2' && /^nombre impair/.test(c.extrait ?? ''))
  const rejoues = new Set(autos.map((c) => `${c.id}|${c.regle}|${c.ou}`))
  const manquants = new Map()
  for (const c of journal.filter(deTexte)) {
    const k = `${c.id}|${c.regle}|${c.ou ?? ''}`
    if (!rejoues.has(k)) manquants.set(k, (manquants.get(k) ?? 0) + 1)
  }
  if (manquants.size) ko(`${manquants.size} (exercice, règle, endroit) du journal sans constat`)
  console.log(`lignes de texte du journal sans équivalent rejoué : ${manquants.size} (exercice, règle)`)
  for (const [k, n] of [...manquants].slice(0, 30)) console.log('  ', k, n)
}
// 6. Totaux par catégorie
const parCat = {}
for (const c of constats) parCat[c.categorie] = (parCat[c.categorie] ?? 0) + 1
const somme = Object.values(parCat).reduce((a, b) => a + b, 0)
if (somme !== constats.length) ko('somme des catégories')
console.log(JSON.stringify(parCat))
console.log(`${constats.length} constats, ${occ} occurrences automatiques, ${lues.length} constats de relecture : ${erreurs ? erreurs + ' erreur(s)' : 'aucune perte'}`)
process.exit(erreurs ? 1 : 0)
