// Le navigateur d'exercices de l'app suit le menu « Exercices aléatoires » du
// site : on déplie tout le menu du site, niveau par niveau, et on compare titres
// des nœuds et ordre des exercices à `listerExercices` du moteur. Les exercices
// présents d'un seul côté (référentiels de dates différentes) sont ignorés.
// Prérequis : pnpm dev (1420) et le site MathALÉA sur 5199
// (dans le dépôt mathalea : npx vite --port 5199).
//   node e2e/referentiel-site.mjs FR|CH
import { chromium } from 'playwright'
const pays = process.argv[2] ?? 'FR'
const lang = pays === 'CH' ? 'fr-CH' : 'fr-FR'
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

// Moteur (app)
const app = await (await nav.newContext()).newPage()
await app.goto('http://localhost:1420/')
const moteur = await app.evaluate(async (pays) => {
  const m = await import('/moteur/moteur.js')
  const l = await m.listerExercices(pays)
  return l.map((e) => ({ id: e.id, niveau: e.niveau, chemin: e.chemin.map((n) => n.titre.replace(/\$[^$]*\$/g, '§').replace(/\s+/g, ' ').trim()) }))
}, pays)
const niveaux = [...new Set(moteur.map((e) => e.niveau))].filter((n) => n !== 'Égalité filles-garçons')
const attendu = (niveau) => {
  const lignes = []
  let prec = []
  for (const e of moteur.filter((x) => x.niveau === niveau)) {
    let i = 0
    while (i < prec.length && i < e.chemin.length && prec[i] === e.chemin[i]) i++
    for (let j = Math.max(i, 1); j < e.chemin.length; j++) lignes.push('# ' + e.chemin[j])
    lignes.push(e.id)
    prec = e.chemin
  }
  return { titre: moteur.find((x) => x.niveau === niveau).chemin[0], lignes }
}

// Site
const site = await (await nav.newContext({ viewport: { width: 1300, height: 1400 } })).newPage()
await site.goto(`http://localhost:5199/alea/?lang=${lang}`, { timeout: 300000 })
await site.locator('[id^=titre-liste]').first().waitFor({ timeout: 300000 })
await site.waitForTimeout(1500)
await site.evaluate(() => document.querySelectorAll('.driver-overlay,.driver-popover').forEach((e) => e.remove()))
let ecarts = 0
for (const niveau of niveaux) {
  const { titre, lignes } = attendu(niveau)
  // Bouton du niveau dans « Exercices aléatoires » (titre-liste-1-<i>)
  const id = await site.evaluate((titre) => {
    const b = [...document.querySelectorAll('button[id^="titre-liste-1-"]')].find((b) => /^titre-liste-1-\d+$/.test(b.id) && b.innerText.trim() === titre)
    return b?.id
  }, titre)
  if (!id) { console.log('✘ niveau absent du site :', titre); ecarts++; continue }
  // Déplie tout sous le niveau
  for (let tour = 0; tour < 50; tour++) {
    const n = await site.evaluate((id) => {
      const racine = document.getElementById(id).parentElement
      const fermes = [...racine.querySelectorAll('button[id^="titre-liste-"]')].filter((b) => !b.id.endsWith('-content') && !b.disabled && !b.nextElementSibling?.querySelector('ul'))
      fermes.forEach((b) => b.click())
      return fermes.length
    }, id)
    if (!n) break
    await site.waitForTimeout(700)
  }
  const vu = await site.evaluate((id) => {
    const racine = document.getElementById(id).parentElement
    const out = []
    const sansMath = (el) => { const c = el.cloneNode(true); c.querySelectorAll('.katex').forEach((k) => k.replaceWith('§')); return c.innerText.replace(/\s+/g, ' ').trim() }
    // Parcours dans l'ordre du document : titres de nœuds et identifiants d'exercices
    const walker = document.createTreeWalker(racine.lastElementChild, NodeFilter.SHOW_ELEMENT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.tagName === 'BUTTON' && /^titre-liste-[\d-]+$/.test(n.id)) out.push('# ' + sansMath(n))
      else if (n.tagName === 'LI' && !n.querySelector('button[id^="titre-liste-"]')) {
        const t = sansMath(n)
        const m = /^(\S+) - /.exec(t)
        if (m) out.push(m[1])
      }
    }
    return out
  }, id)
  // Exercices et nœuds présents d'un seul côté : versions différentes du référentiel
  const communs = (l, autre) => { const e = new Set(autre); return l.filter((x) => e.has(x)) }
  const seulement = [...lignes.filter((x) => !vu.includes(x)), ...vu.filter((x) => !lignes.includes(x))]
  if (seulement.length) console.log('  (versions : ignorés', seulement.slice(0, 6).join(', '), seulement.length > 6 ? '…' : '', ')')
  const l1 = communs(lignes, vu), l2 = communs(vu, lignes)
  const a = l1.join('\n'), v = l2.join('\n')
  if (a === v) console.log('✔', titre, `(${l1.length} lignes)`)
  else {
    ecarts++
    let i = 0
    while (i < l1.length && l1[i] === l2[i]) i++
    console.log('✘', titre, `ligne ${i} : moteur « ${l1[i]} » / site « ${l2[i]} »`, `(${l1.length} / ${l2.length})`)
  }
}
console.log(ecarts ? `${ecarts} écart(s)` : 'identique')
await nav.close()
process.exit(ecarts ? 1 : 0)
