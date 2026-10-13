// Dossier de démonstration à déposer tel quel sur kDrive ou Dropbox : il exerce
// la lecture de plusieurs fichiers, des sous-dossiers et des versions.
//   npx tsx scripts/dossier-test.mts <dossier de sortie>
// Résultat attendu dans l'app :
//   « Classe test » : 7 parcours, dont « Nombres relatifs » en V2 (fichier seul, plus récent que la banque) ;
//   « Autre classe » : 1 parcours ; « 3e B » (sous-dossier) : 1 parcours ; notes.json ignoré.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { creerFichier } from '../src/lib/partage.ts'
import { catalogue } from '../tests/parcours-de-test.ts'

const sortie = process.argv[2]
if (!sortie) throw new Error('Dossier de sortie attendu')
mkdirSync(join(sortie, '3e B'), { recursive: true })
const relatifs = catalogue.find((p) => p.id === 'relatifs-5e')!

writeFileSync(
  join(sortie, 'parcours-mathalea.json'),
  creerFichier([
    { nom: 'Classe test', parcours: catalogue },
    { nom: 'Autre classe', parcours: [{ ...relatifs, id: 'autre-relatifs', titre: 'Relatifs (autre classe)' }] },
  ]),
)
writeFileSync(
  join(sortie, 'parcours-nombres-relatifs-v2.json'),
  creerFichier([{ nom: 'Classe test', parcours: [{ ...relatifs, version: 2, titre: 'Nombres relatifs (V2)' }] }]),
)
writeFileSync(
  join(sortie, '3e B', 'parcours-3e-b.json'),
  creerFichier([{ nom: '3e B', parcours: [{ ...catalogue.find((p) => p.id === 'pythagore-4e')!, id: 'pythagore-3e-b', titre: 'Pythagore (3e B)' }] }]),
)
writeFileSync(join(sortie, 'notes.json'), JSON.stringify({ note: 'Ce fichier n’est pas un parcours : il est ignoré.' }, null, 2))
console.log(`Dossier de test écrit dans ${sortie}`)
