// Vue compacte d'un exercice pour la relecture : titre, consigne, énoncés et
// corrections de chaque variante (graine a), réponses attendues, valeurs mises
// en évidence « ⟦…⟧ », fichier source, captures, et constats automatiques.
//   node revue/lire.mjs <id> [--toutes] [--brut]
// Sans --toutes : la variante par défaut et celles dont le texte diffère
// vraiment (les autres sont résumées).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { retirer } from './controles.mjs'

const ici = dirname(fileURLToPath(import.meta.url))
const MATHALEA = process.env.MATHALEA ?? '/home/user/mathalea-main'
const [id, ...opts] = process.argv.slice(2)
const nom = id.replace(/[^\w-]+/g, '_')
const f = join(ici, 'sorties', `${nom}${process.env.EXTRA ? '_extra' : ''}.json`)
if (!existsSync(f)) {
  console.log(`pas encore passé au banc : ${id}`)
  process.exit(1)
}
const s = JSON.parse(readFileSync(f, 'utf8'))
// EXTRA=1 : seulement les variantes absentes de la sortie normale
if (process.env.EXTRA) {
  const g = join(ici, 'sorties', `${nom}.json`)
  if (existsSync(g)) {
    const vues = new Set(JSON.parse(readFileSync(g, 'utf8')).variantes.map((v) => v.variante))
    s.variantes = s.variantes.filter((v) => !vues.has(v.variante.replace(/ nb=\d+/, '')) && !vues.has(v.variante))
  }
}

/** {\color{#F15929}\boldsymbol{X}} → ⟦X⟧ (accolades équilibrées) */
function marquer(t) {
  const re = /\{\\color\{#?f15929\}\s*\\boldsymbol\{/i
  for (let m; (m = re.exec(t)); ) {
    let i = m.index + m[0].length
    let prof = 2
    const debut = i
    let finContenu = -1
    while (i < t.length && prof > 0) {
      if (t[i] === '\\') {
        i += 2
        continue
      }
      if (t[i] === '{') prof++
      else if (t[i] === '}') {
        prof--
        if (prof === 1) finContenu = i
      }
      i++
    }
    t = t.slice(0, m.index) + '⟦' + t.slice(debut, finContenu) + '⟧' + t.slice(i)
  }
  return t
}

const compact = (html) => {
  html = marquer(html ?? '')
  if (opts.includes('--brut')) return html
  let h = retirer(html ?? '', /<div class="divLatex"/i, 'div')
  h = retirer(h, /<span class="katex"/i, 'span')
  return h
    .replace(/<svg[\s\S]*?<\/svg>/gi, '[figure]')
    .replace(/<div class="svgContainer"[^>]*>/gi, '')
    .replace(/<(mathalea-mathfield|math-field)[^>]*>(<\/\1>)?/gi, '[champ]')
    .replace(/<mathalea-qcm[^>]*propositions="([^"]*)"[^>]*>(<\/mathalea-qcm>)?/gi, (_, p) => {
      try {
        const props = JSON.parse(p.replace(/&quot;/g, '"').replace(/&amp;/g, '&'))
        return `[QCM : ${props.map((x) => (x.statut ? '✔ ' : '✘ ') + x.texte).join(' | ')}]`
      } catch {
        return '[QCM]'
      }
    })
    .replace(/<([a-z]+-[a-z-]+)[^>]*>(<\/\1>)?/gi, '[$1]')
    .replace(/<input type="checkbox"[^>]*?( checked)?>/gi, (_, c) => (c ? '☑' : '☐'))
    .replace(/&emsp;/g, ' ')
    .replace(/<span id="resultatCheck[^"]*"><\/span>/gi, '')
    .replace(/<div class ?="ml-2 py-2 italic[^"]*"[^>]*><\/div>/gi, '')
    .replace(/<br\s*\/?>/gi, '⏎')
    .replace(/<span style="color:\s*#f15929;\s*font-weight:\s*bold;?">([\s\S]*?)<\/span>/gi, '⟦$1⟧')
    .replace(/<span style="color:\s*(#?\w+);?">([\s\S]*?)<\/span>/gi, '{$1:$2}')
    .replace(/<\/?(div|p|span|b|strong|em|i|u|table|tbody|thead|tr|td|th|ul|ol|li|label|center|sup|sub)\b[^>]*>/gi, ' ')
    .replace(/&nbsp;/g, '⍽')
    .replace(/[ \t\n]+/g, ' ')
    .trim()
}

console.log(`# ${s.id} (${s.uuid}) ${s.pays} — ${s.titre}`)
console.log(`menu : ${s.chemin}`)
try {
  const src = execSync(`grep -rl "export const uuid = '${s.uuid}'" ${MATHALEA}/src/exercices || true`).toString().trim()
  console.log(`source : ${src.replace(MATHALEA + '/', '')}${src ? ` (${readFileSync(src.split('\n')[0], 'utf8').split('\n').length} lignes)` : ''}`)
} catch {}
console.log(`paramètres : ${(s.parametres ?? []).map((p) => `${p.cle} « ${p.titre} » ${p.type}${p.options ? ' [' + p.options.map((o) => o.valeur + ':' + o.libelle).join(' ; ') + ']' : ''} défaut ${p.defaut}`).join(' ‖ ') || 'aucun'}`)
console.log(`couverture : ${JSON.stringify(s.couverture)}`)
const dossier = join(ici, 'captures', (s.niveau ?? '').replace(/[^\w-]+/g, '_'))
const vus = new Set()
for (const v of s.variantes ?? []) {
  const cle = JSON.stringify(v.questions.map((q) => compact(q.enonce).replace(/\d+/g, '#')).slice(0, 2))
  const repete = vus.has(cle)
  vus.add(cle)
  if (repete && !opts.includes('--toutes')) {
    console.log(`\n## ${v.variante} : même forme qu'une variante déjà montrée`)
    continue
  }
  console.log(`\n## ${v.variante} (graine ${v.graine})`)
  if (v.consigne) console.log(`consigne : ${compact(v.consigne)}`)
  if (v.introduction) console.log(`intro : ${compact(v.introduction)}`)
  const court = opts.includes('--court')
  v.questions.slice(0, court ? 2 : undefined).forEach((q, i) => {
    console.log(`Q${i + 1} [${q.format}${q.interactive ? '' : ', non interactive'}] ${compact(q.enonce)}`)
    console.log(`  → ${compact(q.correction)}`)
    const r = v.reponses?.[i]
    if (!court && r && Object.keys(r).length) console.log(`  attendu : ${JSON.stringify(r)}`)
  })
}
if (s.nonInteractif) {
  const diff = s.nonInteractif.filter((q, i) => q.enonce !== s.variantes[0]?.questions[i]?.enonce)
  if (diff.length) console.log(`\n## non interactif (défaut)\n${diff.map((q, i) => `Q${i + 1} ${compact(q.enonce)}\n  → ${compact(q.correction)}`).join('\n')}`)
}
const caps = existsSync(join(ici, 'captures')) ? execSync(`find ${join(ici, 'captures')} -path '*/${nom}/*' -name '*.png' | sort | head -3`).toString().trim() : ''
console.log(`\ncaptures : ${caps.split('\n')[0] ? dirname(caps.split('\n')[0]) : 'aucune'}`)
