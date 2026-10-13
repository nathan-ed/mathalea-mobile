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

// Catalogue Explorer de test (VITE_URL_EXPLORER=http://127.0.0.1:8702/s/Xk42demo/explorer/)
mkdirSync(`${dossier}/explorer`, { recursive: true })
writeFileSync(
  `${dossier}/explorer/parcours-mathalea.json`,
  creerFichier([{ nom: 'Équipe MathALÉA', parcours: [{ ...catalogue[1], id: 'equipe-fractions', titre: 'Fractions : les bases' }] }]),
)
