// Contrôle une fiche de cours comme l'app : fichier d'une fiche seule
// (`fiche-mathalea/1`, téléchargé depuis l'onglet Fiches du site), fiche
// nue, ou fichier de parcours (toutes ses fiches).
//   npx tsx scripts/verifier-fiche.mts <fichier.json>…
import { readFileSync } from 'node:fs'
import type { Fiche } from '../src/lib/catalogue.ts'
import { lireFichier } from '../src/lib/partage.ts'
import { estFiche } from '../src/lib/validation.ts'

const fichiers = process.argv.slice(2)
if (!fichiers.length) throw new Error('Fichier attendu')
let erreurs = 0

function decrire(f: Fiche, ou: string) {
  const types = f.blocs.map((b) => b.type)
  const compte = (t: string) => types.filter((x) => x === t).length
  console.log(
    `  ${ou} : « ${f.titre} »${f.avant ? ', montrée avant' : ''}, ${f.blocs.length} blocs` +
      ` (${['retenir', 'exemple', 'question', 'graphique'].map((t) => `${compte(t)} ${t}`).join(', ')})`,
  )
}

for (const chemin of fichiers) {
  const texte = readFileSync(chemin, 'utf8')
  const brut = JSON.parse(texte)
  console.log(chemin)
  if (brut?.format === 'classes-mathalea/1' || brut?.format === 'classe-mathalea/1') {
    try {
      const f = lireFichier(texte)
      const vus = new Set<string>()
      for (const p of [...f.classes.flatMap((c) => c.parcours), ...(f.bibliotheque?.parcours ?? [])]) {
        if (vus.has(p.id)) continue
        vus.add(p.id)
        if (p.fiche) decrire(p.fiche, p.titre)
        p.paliers?.forEach((l, k) => l.fiche && decrire(l.fiche, `${p.titre}, palier ${k + 1}`))
      }
    } catch (e) {
      erreurs++
      console.log(`  REFUSÉ : ${(e as Error).message}`)
    }
    continue
  }
  const fiche = brut?.format === 'fiche-mathalea/1' ? brut.fiche : brut
  if (estFiche(fiche)) decrire(fiche, 'fiche')
  else {
    erreurs++
    // Premier bloc refusé, pour corriger vite
    const k = Array.isArray(fiche?.blocs) ? fiche.blocs.findIndex((b: unknown) => !estFiche({ titre: '', blocs: [b] })) : -1
    console.log(`  REFUSÉE${k >= 0 ? ` : bloc ${k + 1} (${fiche.blocs[k]?.type})` : ' : titre ou blocs manquants'}`)
  }
}
process.exit(erreurs ? 1 : 0)
