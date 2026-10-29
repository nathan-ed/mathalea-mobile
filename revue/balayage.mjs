// Balayage de toutes les sorties pour des fautes déjà vues pendant la relecture :
// signale les exercices où le motif apparaît (titre, énoncé ou correction).
//   node revue/balayage.mjs            affiche
//   node revue/balayage.mjs --noter    ajoute les nouveaux constats à relecture.jsonl
import { appendFileSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ici = dirname(fileURLToPath(import.meta.url))
const ref = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const relu = readFileSync(join(ici, 'relecture.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const NOTER = process.argv.includes('--noter')
const brut = (t) => String(t ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|\u00a0|\u202f/g, ' ').replace(/\s+/g, ' ')

// [identifiant, regle, motif, portée (t = titre, x = textes), constat, correction]
const MOTIFS = [
  ['pente-masc', 'R10', /\b(le|son|un|ce) pente\b|\bpente (est|sera) (donné|égal)\b/i, 'x', 'Accord : « pente » est féminin', 'la pente, sa pente, donnée, égale'],
  ['faute-titre', 'R1', /astucieusment|Mltiplier|dixèmes|Dtéreminer|longuer|probabilté|Effetuer|Aumentation|homographiquee|coeffcient|coefficents|paraléllogramme|indeterminée|Numeration|Résourdre|fracion|dees /, 't', 'Faute dans le titre', 'corriger la coquille'],
  ['faute-texte', 'R10', /astucieusment|Mltiplier|dixèmes|Dtéreminer|longuer|probabilté|Effetuer|Aumentation|homographiquee|coeffcient|coefficents|paraléllogramme|indeterminée|Résourdre|rasion|pout obtenir|\bne nombreux\b/, 'x', 'Coquille', 'corriger la coquille'],
  ['mot-double', 'R10', /\b(par par|de de|est est|la la|le le|des des|les les|que que|en en|sur sur|à à|du du)\b(?! ?[=\\])/i, 'x', 'Mot répété', 'supprimer le doublon'],
  ['maj-sans-accent', 'R6', /(^|[.?!:] )(Etudier|Equation|Egalité|Ecrire|Evaluer|Etablir|Eliminer|Etape)\b/, 'x', 'Majuscule sans accent', 'É'],
  ['titre-maj-sans-accent', 'R1', /^(Etudier|Equation|Egalité|Ecrire|Evaluer|Etablir|Etape)\b/, 't', 'Majuscule sans accent dans le titre', 'É'],
  ['titre-espaces', 'R1', /  |\*$|\.$/, 't', 'Titre : espaces en trop, astérisque ou point final', 'nettoyer le titre'],
  ['connait', 'R8', /\b(re)?connait(re)?\b|\bconnait\b/i, 'tx', 'Orthographe : « connaître » / « connaît » prend un accent circonflexe (Connaitre, Reconnaitre, connait)', 'Connaître, Reconnaître, connaît'],
  ['ancien-exercice', 'R1', /\(ancien exercice\)|Titre à modifier|Nom de l'exercice|Titre de l'exercice|Test /, 't', 'Titre de travail exposé dans le référentiel', 'titre définitif ou retrait du référentiel'],
  ['undefined', 'X3', /\bundefined\b|\bNaN\b|\[object/, 'x', 'Texte « undefined » / NaN visible', 'initialiser la question'],
  ['guillemets-droits', 'T4', /"[A-Za-zÀ-ÿ][^"<>]{2,40}"/, 'x', 'Guillemets droits (à remplacer par « »)', '« … »'],
  ['est-egal-pronom', 'R10', /\bcoefficent|\bcoeffi?cien\b/, 'x', 'Faute sur « coefficient »', 'coefficient'],
]
const sorties = readdirSync(join(ici, 'sorties')).filter((f) => !f.includes('_extra'))
const trouves = new Map()
for (const f of sorties) {
  const s = JSON.parse(readFileSync(join(ici, 'sorties', f), 'utf8'))
  const e = ref.find((x) => x.id === s.id)
  const titre = e?.titre ?? s.titre ?? ''
  const textes = brut([s.consigne, ...(s.variantes ?? []).flatMap((v) => [v.consigne, v.introduction, ...(v.questions ?? []).flatMap((q) => [q.enonce, q.correction])])].join(' '))
  for (const [cle, regle, re, portee, constat, corr] of MOTIFS) {
    const cible = (portee.includes('t') ? titre + ' ' : '') + (portee.includes('x') ? textes : '')
    const m = re.exec(portee === 't' ? titre : cible)
    if (!m) continue
    const deja = relu.some((r) => r.id === s.id && (r.regle === regle || r.extrait.includes(m[0]) || (r.correction ?? '').includes(m[0])) )
    const k = cle
    if (!trouves.has(k)) trouves.set(k, [])
    trouves.get(k).push({ id: s.id, uuid: s.uuid, niveau: e?.niveau ?? '?', theme: e?.theme ?? '', pays: s.pays, regle, motif: m[0], constat, corr, deja, contexte: (portee === 't' ? titre : textes).slice(Math.max(0, m.index - 40), m.index + 60) })
  }
}
let nouveaux = 0
for (const [k, l] of trouves) {
  const nv = l.filter((x) => !x.deja)
  console.log(`\n== ${k} : ${l.length} exercices (${nv.length} pas encore consignés)`)
  for (const x of nv.slice(0, 40)) console.log(`  ${x.id} « ${x.motif} » … ${x.contexte}`)
  if (NOTER && !['connait', 'guillemets-droits'].includes(k))
    for (const x of nv) {
      nouveaux++
      appendFileSync(join(ici, 'relecture.jsonl'), JSON.stringify({ id: x.id, uuid: x.uuid, niveau: x.niveau, theme: x.theme, pays: x.pays, regle: x.regle, gravite: 5, extrait: `${x.constat} : « ${x.motif} » (balayage automatique)`, correction: x.corr, ou: '', relu: true }) + '\n')
    }
}
if (NOTER) console.log(`\n${nouveaux} constats ajoutés`)
