// Dossier partagé fictif des vidéos de présentation (mode Suisse) : deux
// classes (9A, 9B) avec les parcours de démonstration de l'app, simples, pour
// montrer les fonctionnalités, rangés en 9e. « Relatifs en ceintures » reçoit une fiche par ceinture
// (règle, exemple, petite question). Écrit le fichier de parcours à
// l'adresse donnée.
//   npx tsx e2e/video/dossier.mts <dossier.json> [<catalogue.json>]
import { readFileSync, writeFileSync } from 'node:fs'
import { creerFichier } from '../../src/lib/partage.ts'
import type { Fiche, Parcours } from '../../src/lib/catalogue.ts'

const demo = JSON.parse(readFileSync(new URL('../../static/demo/parcours-demonstration.json', import.meta.url), 'utf8'))
const parcours: Parcours[] = demo.classes[0].parcours
const parId = (id: string) => ({ ...structuredClone(parcours.find((p) => p.id === id)!), niveau: '9e' })

const fiches: Fiche[] = [
  {
    titre: 'Additionner deux relatifs',
    avant: true,
    blocs: [
      {
        type: 'retenir',
        titre: 'Addition de deux relatifs',
        texte:
          '- Même signe : on additionne les distances à zéro et on garde le signe.\n- Signes contraires : on soustrait la petite distance à zéro de la grande, et on prend le signe du nombre le plus loin de zéro.',
      },
      {
        type: 'exemple',
        enonce: 'Calculer $(-7)+(+3)$.',
        etapes: ['Les signes sont contraires : $7-3=4$.', '$-7$ est plus loin de zéro que $+3$ : le résultat est négatif.', '$(-7)+(+3)=-4$'],
      },
      {
        type: 'question',
        enonce: 'Combien vaut $(-5)+(-2)$ ?',
        choix: ['$-7$', '$+7$', '$-3$'],
        bonne: 0,
        explication: 'Les deux nombres sont négatifs : on ajoute 5 et 2, et le résultat reste négatif. Donc $-7$.',
      },
    ],
  },
  {
    titre: 'Soustraire un relatif',
    avant: true,
    blocs: [
      { type: 'retenir', titre: 'Soustraction', texte: 'Soustraire un nombre, c’est ajouter son opposé. On écrit l’addition, puis on calcule comme avant.' },
      {
        type: 'exemple',
        enonce: 'Calculer $(+2)-(+6)$.',
        etapes: ['On remplace $-(+6)$ par $+(-6)$ : on calcule $(+2)+(-6)$.', 'Signes contraires : $6-2=4$, et $-6$ est plus loin de zéro.', '$(+2)-(+6)=-4$'],
      },
      {
        type: 'question',
        enonce: '$(+3)-(-4)$ est égal à :',
        choix: ['$+7$', '$-1$', '$+1$'],
        bonne: 0,
        explication: 'Enlever $-4$, c’est ajouter $+4$. On calcule $(+3)+(+4)=+7$.',
      },
    ],
  },
  {
    titre: 'Enchaîner les additions',
    avant: true,
    blocs: [
      { type: 'retenir', titre: 'Somme de plusieurs relatifs', texte: 'Dans une longue somme, on regroupe les positifs d’un côté, les négatifs de l’autre, puis on fait une seule addition.' },
      {
        type: 'exemple',
        enonce: 'Calculer $(+4)+(-3)+(+5)+(-6)$.',
        etapes: ['Les positifs : $4+5=9$.', 'Les négatifs : $3+6=9$, donc $-9$.', '$(+9)+(-9)=0$'],
      },
      {
        type: 'question',
        enonce: 'Combien vaut $(-2)+(+5)+(-1)$ ?',
        choix: ['$+2$', '$-8$', '$+8$'],
        bonne: 0,
        explication: 'Les positifs donnent $+5$, les négatifs $-3$. Il reste $+2$.',
      },
    ],
  },
]
const ceintures = parId('relatifs-ceintures-5e')
ceintures.paliers = ceintures.paliers!.map((p, i) => ({ ...p, fiche: fiches[i] }))
ceintures.version += 1

// Catalogue de l'Explorer (2e argument) : les parcours de explorer/, servis
// par la vidéo comme s'ils étaient en ligne (rien n'est encore publié)
if (process.argv[3]) {
  const classes = ['prequalifiant.json', 'ch-4e-college.json', 'evacom-revisions.json'].flatMap(
    (f) => JSON.parse(readFileSync(new URL(`../../explorer/${f}`, import.meta.url), 'utf8')).classes,
  )
  writeFileSync(process.argv[3], creerFichier(classes))
}

writeFileSync(
  process.argv[2],
  creerFichier([
    { nom: '9A', parcours: [ceintures, parId('relatifs-5e'), parId('relatifs-paliers-5e')] },
    { nom: '9B', parcours: [parId('relatifs-5e'), parId('fractions-4e')] },
  ]),
)
