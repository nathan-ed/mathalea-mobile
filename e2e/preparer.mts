// Dépose les parcours de test dans le dossier partagé local (deux classes)
import { mkdirSync, writeFileSync } from 'node:fs'
import { creerFichier } from '../src/lib/partage.ts'
import { catalogue } from '../tests/parcours-de-test.ts'

const dossier = process.argv[2]
mkdirSync(`${dossier}/test`, { recursive: true })
writeFileSync(
  `${dossier}/test/parcours-mathalea.json`,
  creerFichier([
    { nom: 'Classe test', parcours: catalogue },
    { nom: 'Autre classe', parcours: [{ ...catalogue[0], id: 'autre-relatifs', titre: 'Relatifs (autre classe)' }] },
  ]),
)
