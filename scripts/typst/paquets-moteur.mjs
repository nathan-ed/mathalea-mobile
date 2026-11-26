// Paquets @preview demandés par le moteur construit (static/moteur) : imports
// écrits en toutes lettres (« @preview/cetz:0.3.4 » des figures apigeom) et
// table des versions de MathALÉA (VERSIONS de typstPackages.ts, compilée en
// { "exercise-bank": "0.8.0", taskize: "0.2.12", … }). Une ligne nom:version
// par paquet. Utilisé par scripts/typst-ressources.sh et tests/paquets-typst.test.ts.
//   node scripts/typst/paquets-moteur.mjs [dossier du moteur]
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

export function paquetsDuMoteur(dossier) {
  const vus = new Set()
  const parcourir = (d) => {
    for (const nom of readdirSync(d)) {
      const chemin = join(d, nom)
      if (statSync(chemin).isDirectory()) parcourir(chemin)
      else if (nom.endsWith('.js')) lire(readFileSync(chemin, 'utf8'))
    }
  }
  const lire = (js) => {
    for (const m of js.matchAll(/@preview\/([a-z0-9-]+):(\d+\.\d+\.\d+)/g)) vus.add(`${m[1]}:${m[2]}`)
    // Table des versions : un objet littéral qui contient "exercise-bank"
    for (const m of js.matchAll(/\{[^{}]*"exercise-bank"\s*:\s*"\d+\.\d+\.\d+"[^{}]*\}/g)) {
      for (const e of m[0].matchAll(/"?([a-z][a-z0-9-]*)"?\s*:\s*"(\d+\.\d+\.\d+)"/g)) vus.add(`${e[1]}:${e[2]}`)
    }
  }
  parcourir(dossier)
  return [...vus].sort()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(paquetsDuMoteur(process.argv[2] ?? 'static/moteur').join('\n'))
}
