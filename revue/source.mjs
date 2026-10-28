// Contrôles sur le code source des exercices de MathALÉA (src/exercices),
// pour les règles qui se lisent mieux dans le code que dans la sortie :
// texte dans miseEnEvidence, texteEnCouleur sans couleur, % sans espace,
// orthographe uniformisée, « ... », titres. Chaque constat porte le fichier
// et la ligne. Écrit revue/source.jsonl (relu par revue/rapport.mjs).
//   MATHALEA=~/mathalea-main node revue/source.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const MATHALEA = process.env.MATHALEA ?? '/home/user/mathalea-main'
const racine = join(MATHALEA, 'src', 'exercices')
const referentiel = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const parUuid = new Map(referentiel.map((e) => [e.uuid, e]))

function* fichiers(d) {
  for (const n of readdirSync(d)) {
    const c = join(d, n)
    if (statSync(c).isDirectory()) yield* fichiers(c)
    else if (/\.(ts|js)$/.test(n) && !/\.test\.|-old\d*\.|Old\d*\./.test(n)) yield c
  }
}

/** Argument d'un appel f( … ) à partir de l'indice de la parenthèse, équilibré */
function argument(s, i) {
  let prof = 0
  let quote = null
  for (let j = i; j < s.length; j++) {
    const ch = s[j]
    if (quote) {
      if (ch === '\\') j++
      else if (ch === quote) quote = null
      else if (quote === '`' && ch === '$' && s[j + 1] === '{') {
        // gabarit imbriqué : on compte l'accolade
      }
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if (ch === '(') prof++
    else if (ch === ')') {
      prof--
      if (prof === 0) return s.slice(i + 1, j)
    }
  }
  return s.slice(i + 1, i + 200)
}

const sortie = []
for (const f of fichiers(racine)) {
  const code = readFileSync(f, 'utf8')
  const uuid = /export const uuid\s*=\s*['"]([^'"]+)/.exec(code)?.[1]
  const e = uuid ? parUuid.get(uuid) : undefined
  const chemin = relative(MATHALEA, f)
  const ligne = (i) => code.slice(0, i).split('\n').length
  const note = (i, regle, gravite, extrait) =>
    sortie.push({
      id: e?.id ?? chemin.replace(/^src\/exercices\//, ''),
      uuid: uuid ?? '',
      niveau: e?.niveau ?? 'hors référentiel',
      theme: e?.theme ?? '',
      regle,
      gravite,
      ou: `${chemin}:${ligne(i)}`,
      extrait: extrait.replace(/\s+/g, ' ').slice(0, 220),
      source: true,
    })
  // Lignes de commentaire retirées des recherches de texte
  const sansCommentaires = code.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:\\'"`])\/\/[^\n]*/g, (m, a) => a + ' '.repeat(m.length - a.length))

  for (const m of sansCommentaires.matchAll(/miseEnEvidence\(/g)) {
    const arg = argument(sansCommentaires, m.index + m[0].length - 1)
    for (const t of arg.matchAll(/\\\\text\{([^}]*)\}/g)) {
      const mot = t[1].trim()
      if (/^(cm|mm|dm|km|hm|dam|m|g|kg|mg|L|mL|cL|dL|h|min|s|ms|€|%|°|ha|a|t|q|cm\^2|m\^2|km\/h|m\/s)?[²³]?$/i.test(mot) || /^(c|m|d|k)?m\^?[23]?$/.test(mot)) note(m.index, 'M2', 3, `unité dans miseEnEvidence : ${arg.slice(0, 160)}`)
      else if (/\p{L}{2,}/u.test(mot)) note(m.index, 'M5', 3, `texte dans miseEnEvidence : \\text{${mot}}`)
    }
  }
  for (const m of sansCommentaires.matchAll(/texteEnCouleur\(/g)) {
    const arg = argument(sansCommentaires, m.index + m[0].length - 1)
    // un seul argument au premier niveau : couleur par défaut (orange)
    let prof = 0
    let quote = null
    let virgule = false
    for (let j = 0; j < arg.length; j++) {
      const ch = arg[j]
      if (quote) {
        if (ch === '\\') j++
        else if (ch === quote) quote = null
        continue
      }
      if (ch === "'" || ch === '"' || ch === '`') quote = ch
      else if ('([{'.includes(ch)) prof++
      else if (')]}'.includes(ch)) prof--
      else if (ch === ',' && prof === 0) virgule = true
    }
    if (!virgule) note(m.index, 'M7', 3, `texteEnCouleur sans couleur (orange par défaut) : ${arg.slice(0, 140)}`)
  }
  // Chaînes du fichier (hors imports)
  for (const m of sansCommentaires.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*?)\1/g)) {
    const s = m[2]
    if (/^\.\.?\//.test(s) || /^[\w./-]+\.(ts|js|json|svelte)$/.test(s)) continue
    if (/en-dessous|\bau dessus|\bau dessous|\bci dessous|\bci dessus|\bpar dessus/i.test(s)) note(m.index, 'R8', 5, s.slice(0, 160))
    const sansTrous = s.replace(/%\{\w+\}|%[\p{L}\w]+%|\$\{[^}]*%[^}]*\}/gu, '')
    if (/(\d|\})\s?%(?![\w{])/.test(sansTrous) && !/(\\\\,|~|\$\{sp\(\)\}|&nbsp;|\\\\ )\\{0,2}%/.test(sansTrous) && !/width|height|left|top|%\s*;|calc\(/.test(s)) note(m.index, 'T1', 4, `% sans espace insécable : ${s.slice(0, 160)}`)
    if (/\w\.\.\.(?!\.)|\s\.\.\.\s/.test(s) && !/\.\.\.\w/.test(s.replace(/\w\.\.\./g, ''))) note(m.index, 'T6', 5, `« ... » : ${s.slice(0, 160)}`)
  }
  const titre = /export const titre\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/.exec(code)
  if (titre) {
    const t = titre[2]
    if (/\.\s*$/.test(t)) note(titre.index, 'R1', 5, `titre terminé par un point : ${t}`)
    const premier = t.replace(/^[^\p{L}]+/u, '').split(/[\s']/)[0]
    if (premier && !/(er|ir|re|oir|ire)$/i.test(premier) && !/^(CAN|Course|Problème|Problèmes|QCM|Vrai|Exercice|Questions?|Automatismes?|Sujet|Annales?|Brevet|Bac|Labyrinthe|Énigme|Jeu)$/i.test(premier))
      note(titre.index, 'R1', 6, `titre sans infinitif en tête : ${t}`)
  }
  const consigne = sansCommentaires.matchAll(/this\.consigne\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/g)
  for (const c of consigne) {
    if (/(^|[.!?]\s+)(Calcule|Donne|Écris|Complète|Trouve|Détermine|Résous|Place|Trace|Construis|Indique|Coche|Choisis|Range|Développe|Factorise|Simplifie|Réduis|Recopie|Justifie|Exprime|Convertis|Compare|Lis|Associe|Relie|Entoure)\b/.test(c[2])) note(c.index, 'R2', 5, `consigne à l'impératif : ${c[2].slice(0, 160)}`)
  }
}
writeFileSync(join(ici, 'source.jsonl'), sortie.map((x) => JSON.stringify(x)).join('\n') + '\n')
const compte = {}
for (const x of sortie) compte[x.regle] = (compte[x.regle] ?? 0) + 1
console.log(sortie.length, 'constats', compte)
