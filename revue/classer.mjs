// Classe tous les constats de la revue par type d'action (qui corrige, comment),
// sans en perdre aucun. Sources : revue/journal.jsonl (banc), revue/texte.jsonl
// (contrôles de texte rejoués), revue/source.jsonl (code), revue/relecture.jsonl
// (relecture), revue/ecartes.jsonl (faux positifs), revue/rejeu.jsonl (interactif
// rejoué) et revue/reclassement.jsonl (corrections du classement à la main).
//   node revue/classer.mjs     écrit revue/classement/ et docs/revue-exercices/classement/
// Chaque constat a une clé stable (A-… automatique regroupé, L-… relecture) ;
// revue/verifier-classement.mjs contrôle que chaque ligne source est comptée une fois.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ici = dirname(fileURLToPath(import.meta.url))
const lire = (f) =>
  existsSync(join(ici, f))
    ? readFileSync(join(ici, f), 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l))
    : []
const hache = (s) => createHash('sha1').update(s).digest('hex').slice(0, 10)
const referentiel = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const parId = new Map(referentiel.map((e) => [e.id, e]))

// ---------- catégories ----------
export const CATEGORIES = {
  'tickets-interactif': {
    titre: 'Interactif faux',
    qui: 'Développeur (ticket). Chaque constat donne la graine, les paramètres et la saisie qui reproduisent le défaut.',
  },
  'tickets-rendu': {
    titre: 'Rendu cassé, exception, question vide ou en double',
    qui: 'Développeur (ticket).',
  },
  'maths-formulation': {
    titre: 'Contenu mathématique et formulation',
    qui: "Avis d'un enseignant-développeur : erreur ou ambiguïté mathématique, titre sans rapport avec l'exercice, explication à reprendre.",
  },
  decisions: {
    titre: 'Décisions à prendre',
    qui: 'Développeur MathALÉA : harmonisations (tutoiement, notation, orthographe), paramètres sans effet ou absurdes, doublons, figures trop larges.',
  },
  'mise-en-evidence': {
    titre: 'Mise en évidence à aligner sur le champ',
    qui: 'Correction à la chaîne : ce qui est mis en évidence doit être exactement ce que le champ attend, sans texte ni unité.',
  },
  francais: {
    titre: 'Français : fautes, coquilles, accords, tournures',
    qui: 'Correction à la chaîne.',
  },
  typographie: {
    titre: 'Typographie et écriture des nombres',
    qui: 'Correction à la chaîne (espaces, $, séparateurs, points de suspension, point final).',
  },
  'app-mobile': {
    titre: "Défauts de l'app MathALÉA mobile",
    qui: 'Nathan (moteur de l’app, pas les exercices).',
  },
  'a-ecarter': {
    titre: 'Exercices de test, modèles ou inutilisables',
    qui: 'Mis de côté : à retirer du référentiel ou à terminer, rien à corriger dans le détail.',
  },
  'a-tester-main': {
    titre: 'Interactif à tester à la main',
    qui: 'Pas une erreur : format que le banc ne sait pas remplir (glisser-déposer, figure, clic).',
  },
  'pour-memoire': {
    titre: 'Pour mémoire',
    qui: 'Information sur la couverture du banc, aucune action.',
  },
  'faux-positifs': {
    titre: 'Faux positifs écartés',
    qui: 'Constats automatiques reconnus faux à la relecture, gardés pour la traçabilité.',
  },
}

const NOMS = {
  I1: 'Bonne réponse refusée', I2: 'Réponse fausse acceptée', I3: 'Champ vide accepté ou en erreur', I4: 'Question interactive sans champ',
  I5: 'Barème qui change selon le tirage', IM: 'Interactif à tester à la main', M1: 'Valeur mise en évidence refusée par le champ',
  M2: 'Unité dans miseEnEvidence', M3: 'QCM : bonne proposition pas mise en évidence telle quelle', M4: 'QCM : mise en évidence et bonne proposition différentes',
  M5: 'Texte dans miseEnEvidence', M6: 'Pas de mise en évidence du résultat', M7: 'Explication en orange', M8: 'Nombre de mises en évidence et de champs différents',
  C1: 'Contenu mathématique faux ou ambigu', C2: 'Paramètre sans effet ou correction incomplète', N1: 'Nombre hors $', N2: 'Séparateur des milliers',
  N3: 'Point décimal', N4: 'Flottant ou notation scientifique', N5: 'Négatif sans parenthèses', N6: 'Écriture algébrique (1x, +-, -0…)',
  N7: 'Zéros significatifs', T1: 'Espace avant %', T2: 'Unité (espace, \\text)', T3: 'Espace avant : ; ! ?', T4: 'Guillemets', T5: 'Espaces en trop',
  T6: 'Points de suspension', T8: 'Commande LaTeX collée', T9: 'Mot non écrit en \\text dans une formule', R1: 'Titre', R2: 'Impératif ou tutoiement',
  R3: 'Point final', R4: 'Dernière phrase en saisie libre', R5: 'Virgule (soit, alors, or)', R6: 'Majuscule sans accent', R7: 'Arrondi',
  R8: 'Orthographe uniformisée', R9: 'Notation des probabilités', R10: 'Français (accords, fautes, coquilles)', R11: 'Calcul rédigé faux (signes, parenthèses)',
  R12: 'Notation incohérente', R13: 'Accord, majuscule, unité', R14: 'Contenu manquant ou en double', R15: 'Affichage (tableau, figure)',
  R16: 'Relecture : français, titre ou contenu', X1: 'Erreur ou exception', X2: 'Formule cassée (KaTeX, $)', X3: 'undefined, NaN…',
  X4: 'Question en double ou vide', X5: 'Débordement à 390 px', X6: 'Même graine, exercice différent', X7: 'Combinaisons de paramètres non toutes passées',
}

/** Catégorie d'un constat automatique, d'après sa règle */
function categorieAuto(c) {
  const r = c.regle
  if (/^I[1-5]$/.test(r)) return 'tickets-interactif'
  if (r === 'IM') return 'a-tester-main'
  if (/^M/.test(r)) return 'mise-en-evidence'
  if (/^X[1-46]$/.test(r)) return 'tickets-rendu'
  if (r === 'X5') return 'decisions'
  if (r === 'X7') return 'pour-memoire'
  if (/^(N\d|T\d|R3|R6)$/.test(r)) return 'typographie'
  if (r === 'R2') return 'decisions'
  if (r === 'R9' || /^C/.test(r)) return 'maths-formulation'
  return 'francais' // R1, R4, R5, R8, R10
}

/** Catégorie proposée pour un constat de relecture (mots-clés, puis règle) */
function categorieRelu(c) {
  const t = `${c.extrait ?? ''} ${c.correction ?? ''}`
  const r = c.regle
  if (/Nom de l'exercice|Titre de l'exercice|Titre à modifier|Test MultiMathfield|exercice (modèle|de test)|placeholder exposé|Exercice modèle|n'a pas pu être conservé|Exercice inutilisable|outil sans question|exemple-qcm|testEEE/i.test(t)) return 'a-ecarter'
  if (/moteur de l'app|preparerExercice|ajusterFigures|interactifReady|dans l'app\b|de l'app\b|l'app (rend|ne|affiche)/i.test(t)) return 'app-mobile'
  if (/^I[1-5]$/.test(r)) return 'tickets-interactif'
  if (/^M\d$/.test(r)) return 'mise-en-evidence'
  if (/^X[1-46]$/.test(r) || r === 'R14' || r === 'R15') return 'tickets-rendu'
  if (r === 'X5') return 'decisions'
  if (/^C\d$/.test(r) || r === 'R7' || r === 'R9' || r === 'R11') return 'maths-formulation'
  if (/^Titre « .* » (mais|alors que)|sans rapport|titre cohérent|Titre cohérent/i.test(t)) return 'maths-formulation'
  if (/tutoiement|vouvoiement|harmonis|uniformis|non uniformisée|\\times.*\\cdot|\\cdot.*\\times|doublon (CH|FR)|même énoncé que|même texte que|valeur de paramètre|paramètre .*sans effet|n'a plus de sens|(ancien exercice)/i.test(t)) return 'decisions'
  if (r === 'R12') return 'decisions'
  if (/^(N\d|T\d|R3|R6)$/.test(r)) return 'typographie'
  if (r === 'R2') return 'decisions'
  return 'francais'
}

// ---------- chargement ----------
const journal = lire('journal.jsonl')
const texte = lire('texte.jsonl')
const source = lire('source.jsonl')
const relecture = lire('relecture.jsonl')
const ecartes = lire('ecartes.jsonl')
const rejeu = new Map(lire('rejeu.jsonl').map((x) => [x.cle, x]))
const reclassement = new Map(lire('reclassement.jsonl').map((x) => [x.cle, x]))
// Reclassement par exercice : { id, categorie, regles (regex, facultatif), precision }
const parExercice = lire('reclassement-exercices.jsonl')

const deTexte = (c) => /^(N[1-7]|T\d|R\d+|M5|M7|X3)$/.test(c.regle) || (c.regle === 'X2' && /^nombre impair/.test(c.extrait ?? ''))
const motif = (s) => String(s ?? '').replace(/\d+/g, '#').replace(/\s+/g, ' ').slice(0, 140)
const estEcarte = (c) => ecartes.find((e) => e.id === c.id && e.regle === c.regle && (!e.motif || motif(c.extrait).includes(e.motif)))

// Lignes du journal remplacées par texte.jsonl (contrôles de texte rejoués) : comptées à part
// sauf quand le contrôle rejoué ne couvre pas l'endroit (variantes non interactives non
// gardées dans les sorties, par exemple) : ces lignes restent, origine « banc ».
const couverts = new Set(texte.map((c) => `${c.id}|${c.regle}|${c.ou ?? ''}`))
const remplacees = journal.filter((c) => deTexte(c) && couverts.has(`${c.id}|${c.regle}|${c.ou ?? ''}`))
const gardees = journal.filter((c) => deTexte(c) && !couverts.has(`${c.id}|${c.regle}|${c.ou ?? ''}`))
const i1SansSaisie = journal.filter((c) => !deTexte(c) && c.regle === 'I1' && c.saisie && !Object.keys(c.saisie).length)
const auto = [
  ...journal.filter((c) => !deTexte(c) && !(c.regle === 'I1' && c.saisie && !Object.keys(c.saisie).length)),
  ...gardees,
  ...texte,
  ...source,
]

// ---------- regroupement des constats automatiques (même clé que rapport.mjs) ----------
const groupes = new Map()
for (const c of auto) {
  const e = estEcarte(c)
  const detail = c.source ? c.ou : /^[IMX]/.test(c.regle) ? motif(c.extrait) : ''
  const cle0 = `${c.id}|${c.regle}|${c.ou ?? ''}|${detail}`
  const cle = 'A-' + hache(cle0 + (e ? '|écarté' : ''))
  let g = groupes.get(cle)
  if (!g) {
    g = {
      cle, origine: c.source ? 'code' : c.texte ? 'texte' : 'banc', id: c.id, uuid: c.uuid, niveau: c.niveau, theme: c.theme, pays: c.pays,
      regle: c.regle, ou: c.ou ?? '', n: 0, exemples: [], motifs: new Set(), occurrences: [], ecarte: e ? e.motif ?? true : false,
    }
    groupes.set(cle, g)
  }
  g.n++
  const m = motif(c.extrait)
  if (!g.motifs.has(m)) {
    g.motifs.add(m)
    if (g.exemples.length < 5) g.exemples.push(c.extrait)
  }
  g.occurrences.push([c.variante ?? '', c.graine ?? '', c.q ?? null, c.saisie ?? null, c.format ?? null])
}

// ---------- constats ----------
const constats = []
for (const g of groupes.values()) {
  const cat = g.ecarte ? 'faux-positifs' : categorieAuto(g)
  constats.push({ ...g, motifs: g.motifs.size, categorie: cat, statut: g.ecarte ? 'écarté à la relecture' : 'détection automatique' })
}
relecture.forEach((c, i) => {
  const cle = 'L-' + hache(`${c.id}|${c.regle}|${c.extrait}|${c.correction ?? ''}`)
  constats.push({
    cle, origine: 'relecture', ligne: i + 1, id: c.id, uuid: c.uuid, niveau: c.niveau, theme: c.theme, pays: c.pays, regle: c.regle,
    ou: c.ou ?? '', n: 1, exemples: [c.extrait], correction: c.correction ?? '', motifs: 1, occurrences: [], categorie: categorieRelu(c),
    statut: 'confirmé à la relecture',
  })
})
// Clés de relecture en double (même ligne notée deux fois) : suffixe pour rester uniques
const vues = new Map()
for (const c of constats) {
  const k = vues.get(c.cle) ?? 0
  vues.set(c.cle, k + 1)
  if (k) c.cle = `${c.cle}-${k + 1}`
}
// Rejeu de l'interactif et reclassement à la main
for (const c of constats) {
  const rj = rejeu.get(c.cle)
  if (rj) {
    c.rejeu = rj
    c.statut = rj.reproduit ? 'rejoué : reproduit' : 'rejoué : non reproduit'
  }
  const rc = reclassement.get(c.cle)
  if (rc) {
    if (rc.categorie) c.categorie = rc.categorie
    if (rc.precision) c.precision = rc.precision
    if (rc.statut) c.statut = rc.statut
  }
}

// Exercices entiers mis de côté (relecture) ou règles par exercice
const ecartesExo = new Set(constats.filter((c) => c.origine === 'relecture' && c.categorie === 'a-ecarter').map((c) => c.id))
for (const c of constats) {
  if (c.categorie === 'faux-positifs') continue
  if (ecartesExo.has(c.id) && c.categorie !== 'a-ecarter') {
    c.categorie = 'a-ecarter'
    c.precision ??= 'Exercice mis de côté (test, modèle ou outil) : constat gardé pour mémoire'
  }
  for (const r of parExercice)
    if ((r.id === c.id || (r.motifId && new RegExp(r.motifId).test(c.id))) && (!r.regles || new RegExp(r.regles).test(c.regle)) && c.origine !== 'relecture') {
      c.categorie = r.categorie
      if (r.precision) c.precision ??= r.precision
    }
}

// ---------- liens de reproduction (site MathALÉA) ----------
function lien(c) {
  const o = c.rejeu?.occurrence ?? c.occurrences[0]
  if (!o || !o[1] || !c.uuid) return ''
  const [variante, graine] = o
  const p = new URLSearchParams({ uuid: c.uuid, id: c.id })
  const nb = /nb=(\d+)/.exec(variante)
  if (nb) p.set('n', nb[1])
  for (const [, k, v] of variante.matchAll(/\b(sup\d?)=(\S*)/g)) p.set(k === 'sup' ? 's' : 's' + k.slice(3), v)
  p.set('alea', graine)
  p.set('i', '1')
  p.set('cd', '1')
  return `https://coopmaths.fr/alea/?${p.toString()}`
}

// ---------- écriture ----------
const dossierData = join(ici, 'classement')
const dossierDoc = join(ici, '..', 'docs', 'revue-exercices', 'classement')
mkdirSync(dossierData, { recursive: true })
mkdirSync(dossierDoc, { recursive: true })
const ordre = Object.keys(CATEGORIES)
const parCat = Object.fromEntries(ordre.map((k) => [k, []]))
for (const c of constats) parCat[c.categorie].push(c)
const rNum = (r) => (/^[A-Z]\d/.test(r) ? r[0] + String(Number(r.slice(1))).padStart(2, '0') : r)
for (const l of Object.values(parCat))
  l.sort((a, b) => rNum(a.regle).localeCompare(rNum(b.regle)) || String(a.niveau).localeCompare(String(b.niveau)) || a.id.localeCompare(b.id) || a.cle.localeCompare(b.cle))

// Archive complète (toutes les occurrences) et une liste par catégorie sans les occurrences au-delà de 5
writeFileSync(join(dossierData, 'constats.jsonl.gz'), gzipSync(constats.map((c) => JSON.stringify(c)).join('\n') + '\n'))
const echapper = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/</g, '&lt;')
const resume = []
for (const k of ordre) {
  const l = parCat[k]
  writeFileSync(
    join(dossierData, `${k}.jsonl`),
    l.map((c) => JSON.stringify({ ...c, occurrences: c.occurrences.slice(0, 5), nOccurrences: c.occurrences.length, lien: lien(c) })).join('\n') + (l.length ? '\n' : ''),
  )
  const exos = new Set(l.map((c) => c.id))
  resume.push([k, l.length, exos.size, l.reduce((s, c) => s + c.n, 0)])
  let md = `# ${CATEGORIES[k].titre}\n\n${CATEGORIES[k].qui}\n\n${l.length} constats, ${exos.size} exercices. Données complètes : \`revue/classement/${k}.jsonl\` (clé, graines, saisies). Fichier produit par \`node revue/classer.mjs\`.\n`
  const parRegle = new Map()
  for (const c of l) parRegle.set(c.regle, [...(parRegle.get(c.regle) ?? []), c])
  md += '\n| Règle | Constats | Exercices |\n| --- | ---: | ---: |\n'
  for (const [r, lr] of parRegle) md += `| [${r} ${NOMS[r] ?? ''}](#${r.toLowerCase()}) | ${lr.length} | ${new Set(lr.map((c) => c.id)).size} |\n`
  for (const [r, lr] of parRegle) {
    md += `\n## ${r}\n\n**${NOMS[r] ?? r}**\n\n| Clé | Exercice | Où | Constat | Statut | Reproduire |\n| --- | --- | --- | --- | --- | --- |\n`
    for (const c of lr) {
      const o = c.rejeu?.occurrence ?? c.occurrences[0]
      const rep = o && o[1] ? `${o[0] || 'défaut'}, graine ${o[1]}${o[2] != null ? `, q${o[2] + 1}` : ''}${o[3] && Object.keys(o[3]).length ? `, saisie ${JSON.stringify(o[3]).slice(0, 80)}` : ''}${lien(c) ? ` ([site](${lien(c)}))` : ''}` : ''
      const texteC = [c.precision ? `**${c.precision}**` : '', ...c.exemples.slice(0, 3)].filter(Boolean).join(' ‖ ') + (c.correction ? ` → ${c.correction}` : '')
      md += `| ${c.cle} | ${c.id} (${echapper(c.niveau)}${c.pays === 'CH' ? ', CH' : ''}) | ${echapper(c.ou)} | ${echapper(texteC)}${c.n > 1 ? ` (×${c.n})` : ''} | ${c.statut}${c.rejeu?.detail ? ` : ${echapper(c.rejeu.detail)}` : ''} | ${echapper(rep)} |\n`
    }
  }
  writeFileSync(join(dossierDoc, `${k}.md`), md)
}

// Index et bilan de correspondance
const total = constats.length
const lignes = { journal: journal.length, remplacees: remplacees.length, textesGardes: gardees.length, i1SansSaisie: i1SansSaisie.length, texte: texte.length, source: source.length, relecture: relecture.length }
let md = `# Classement des constats par type d'action

Tous les constats de la revue (banc, contrôles de texte, code, relecture),
classés selon qui doit agir et comment. Chaque constat a une clé stable
(\`A-…\` regroupement automatique, \`L-…\` constat de relecture) et une seule
catégorie. Fichier produit par \`node revue/classer.mjs\`, contrôlé par
\`node revue/verifier-classement.mjs\`.

| Catégorie | Qui, comment | Constats | Exercices | Occurrences |
| --- | --- | ---: | ---: | ---: |
`
for (const [k, n, e, o] of resume) md += `| [${CATEGORIES[k].titre}](${k}.md) | ${CATEGORIES[k].qui} | ${n} | ${e} | ${o} |\n`
md += `| **Total** | | **${total}** | | **${resume.reduce((s, r) => s + r[3], 0)}** |\n`
md += `
## Correspondance avec les sources

- Relecture (\`revue/relecture.jsonl\`) : ${lignes.relecture} lignes, une clé \`L-…\` chacune.
- Code (\`revue/source.jsonl\`) : ${lignes.source} lignes.
- Contrôles de texte rejoués (\`revue/texte.jsonl\`) : ${lignes.texte} lignes.
- Banc (\`revue/journal.jsonl\`) : ${lignes.journal} lignes, dont ${lignes.remplacees} de texte
  remplacées par les contrôles rejoués (même sortie, contrôles plus récents),
  ${lignes.textesGardes} de texte gardées telles quelles (endroit que le contrôle rejoué ne
  couvre pas, par exemple les variantes non interactives) et
  ${lignes.i1SansSaisie} « bonne réponse refusée » sans saisie (question absente,
  relevée en X4).
- Les constats automatiques sont regroupés comme dans \`trouvailles.md\` (même
  exercice, même règle, même endroit, même extrait aux nombres près) ;
  « Occurrences » compte les lignes sources.
- Archive complète, avec toutes les occurrences (variante, graine, question,
  saisie) : \`revue/classement/constats.jsonl.gz\`.
`
writeFileSync(join(dossierDoc, 'README.md'), md)
writeFileSync(join(dossierData, 'bilan.json'), JSON.stringify({ total, lignes, resume }, null, 1))
console.log(resume.map((r) => r.join(' ')).join('\n'))
console.log('total', total, JSON.stringify(lignes))
