// Recette : les parcours créés sur le site (fichier publié, déposé dans un
// dossier partagé) faits dans l'app comme un élève, avec de vraies réponses
// (saisie, QCM, texte à trous) calculées par le moteur.
//   FICHIER=<parcours-mathalea.json> LIEN=<lien du dossier> node e2e/.recette-app.mjs
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const lien = process.env.LIEN ?? 'http://127.0.0.1:8702/s/Xk42demo/recette/'
const caps = process.env.CAPTURES ?? '/tmp/recette'
const fichier = JSON.parse(readFileSync(process.env.FICHIER ?? '/tmp/recette/parcours-mathalea.json', 'utf8'))
const tous = fichier.classes.flatMap((c) => c.parcours).filter((p) => typeof p === 'object')
const parcoursDe = (titre) => tous.find((p) => p.titre === titre)
let echecs = 0
const erreurs = []
const ok = (c, m) => {
  if (!c) echecs++
  console.log(c ? '✔' : '✘', m)
}
const texte = async (page, sel = 'main') => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ')

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
async function telephone(nom, options = {}) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Europe/Zurich', ...options })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  return page
}

/** Réponses justes de la question qui porte ce champ, d'après le moteur (mêmes graines que la séance) */
const attendu = (page, id, idChamp) =>
  page.evaluate(
    async ({ id, idChamp }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      window.__exos ??= {}
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      for (const e of s.etapes) {
        const cle = `${id}|${s.debut}|${e}|${s.graines[e]}`
        window.__exos[cle] ??= await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, e)
        const ex = window.__exos[cle]
        // QCM : propositions hors de l'énoncé, étape et question lues dans l'id (checkEx<e>Q<q>R<r>)
        const qcm = idChamp.match(/^checkEx(\d+)Q(\d+)R\d+$/)
        const q = qcm ? (Number(qcm[1]) === e ? Number(qcm[2]) : -1) : ex.questions.findIndex((x) => (x.enonce ?? '').includes(`id="${idChamp}"`))
        if (q < 0) continue
        const a = ex.interne.autoCorrection[q]
        if (!a) return { type: 'rien', e, q }
        if (a.propositions) return { type: 'qcm', e, q, bons: a.propositions.map((p, r) => (p.statut ? r : -1)).filter((r) => r >= 0) }
        const v = a.valeur ?? {}
        const champs = Object.keys(v).filter((k) => /^champ\d+$/.test(k))
        if (champs.length) return { type: 'blancs', e, q, champs: Object.fromEntries(champs.map((k) => [k, String(v[k].value)])) }
        const cellule = idChamp.match(/(L\d+C\d+)$/)?.[1]
        if (cellule && v[cellule]) return { type: 'saisie', e, q, v: String(v[cellule].value) }
        // Unité : saisie comme la touche du clavier (\operatorname{m})
        if (v.reponse && ['string', 'number'].includes(typeof v.reponse.value)) return { type: 'saisie', e, q, v: v.reponse.options?.unite ? String(v.reponse.value).replace(/([a-zA-Z]+)$/, '\\operatorname{$1}') : String(v.reponse.value) }
        return { type: 'inconnu', e, q, cles: Object.keys(v) }
      }
      return null
    },
    { id, idChamp },
  )

/** Remplit les questions affichées, juste (ou faux pour les clés de `faux`), sans les vérifier */
async function remplir(page, id, faux = new Set()) {
  await page.waitForTimeout(600)
  const formes = []
  const champs = await page.locator('math-field[id^="champTexteEx"]').evaluateAll((l) => l.filter((el) => el.offsetParent && (!el.readOnly || el.getPrompts?.().length)).map((el) => el.id))
  for (const idChamp of champs) {
    const a = await attendu(page, id, idChamp)
    formes.push(a?.type ?? 'introuvable')
    const mauvais = a && faux.has(`${a.e}-${a.q}`)
    await page.locator(`#${idChamp}`).evaluate(
      (el, { a, mauvais }) => {
        if (a?.type === 'blancs') for (const [k, v] of Object.entries(a.champs)) el.setPromptValue(k, mauvais ? '999' : v)
        else el.setValue(mauvais || a?.type !== 'saisie' ? '999' : a.v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      },
      { a, mauvais },
    )
  }
  const cases = await page.locator('input[type=checkbox][id^="checkEx"], input[type=radio][id^="checkEx"]').evaluateAll((l) => l.filter((el) => el.offsetParent && !el.disabled && !el.checked).map((el) => el.id))
  const vus = new Set()
  for (const idCase of cases) {
    const r = Number(idCase.match(/R(\d+)$/)[1])
    const a = await attendu(page, id, idCase)
    const k = a ? `${a.e}-${a.q}` : idCase
    if (!vus.has(k)) formes.push(a?.type ?? 'introuvable')
    vus.add(k)
    const cocher = faux.has(k) ? !a?.bons?.includes(r) && r === (a?.bons?.[0] === 0 ? 1 : 0) : a?.bons?.includes(r)
    if (cocher) await page.locator(`#${idCase}`).click()
  }
  return formes
}

const visible = (page, nom) => page.getByRole('button', { name: nom, exact: true }).first().isVisible().catch(() => false)
const actif = async (page, nom) => (await visible(page, nom)) && (await page.getByRole('button', { name: nom, exact: true }).first().isEnabled())

/** Fait la séance ouverte jusqu'au bilan ; rend le score affiché */
async function faireSeance(page, id, faux = new Set(), nom = '') {
  await page.locator('main math-field, main input[type=checkbox], main input[type=radio]').first().waitFor({ timeout: 60_000 }).catch(async (err) => {
    await page.screenshot({ path: `${caps}/echec-${nom}.png` })
    console.log('  page :', (await texte(page, 'body')).slice(0, 400))
    throw err
  })
  const formes = []
  for (let tour = 0; tour < 80; tour++) {
    if (await visible(page, 'Retour à l’accueil')) break
    if ((await visible(page, 'Voir la carte du parcours')) || (await visible(page, 'Refaire'))) break
    // Garde-fou ouvert : continuer
    for (const l of ['Soumettre quand même', 'Continuer quand même', 'Terminer quand même']) if (await visible(page, l)) await page.getByRole('button', { name: l }).click()
    const f = await remplir(page, id, faux)
    if (process.env.TRACE) console.log('  tour', tour, f, (await texte(page)).slice(0, 80))
    formes.push(...f)
    // Vérification question par question sur une page à plusieurs questions
    for (const b of await page.locator('main button', { hasText: /^\s*Vérifier\s*$/ }).all()) if (await b.isEnabled().catch(() => false)) await b.click().catch(() => {})
    let clic = false
    for (const l of ['Soumettre la tentative', 'Vérifier', 'Soumettre l’exercice', 'Soumettre', 'Question suivante', 'Exercice suivant', 'Voir le bilan']) {
      if (await actif(page, l)) {
        await page.getByRole('button', { name: l, exact: true }).first().click()
        clic = true
        break
      }
    }
    if (!clic) await page.waitForTimeout(500)
    await page.waitForTimeout(500)
  }
  await page.waitForTimeout(800)
  const bilan = await texte(page, 'body')
  const score = bilan.match(/(\d+(?:[.,]\d+)?) \/ (\d+)/)
  console.log(`  ${nom} formes : ${[...new Set(formes)].join(', ')} ; ${score?.[0]}`)
  return { bilan, points: score ? Number(score[1].replace(',', '.')) : NaN, sur: score ? Number(score[2]) : NaN, formes }
}

async function accueil(page) {
  for (let i = 0; i < 8 && !(await page.getByRole('tab', { name: 'Mes parcours' }).isVisible().catch(() => false)); i++) {
    if (await visible(page, 'Retour à l’accueil')) await page.getByRole('button', { name: 'Retour à l’accueil' }).click()
    else await page.getByRole('button', { name: 'Revenir en arrière' }).first().click().catch(() => {})
    await page.waitForTimeout(300)
  }
  await page.getByRole('tab', { name: 'Mes parcours' }).click()
}
async function ouvrir(page, titre) {
  await accueil(page)
  const tuile = page.getByRole('button', { name: new RegExp(`^\\s*${titre.replace(/[()’?]/g, '.')}`) }).first()
  await tuile.scrollIntoViewIfNeeded()
  await tuile.click()
  await page.waitForTimeout(800)
}

// ---------- Élève : dossier de la classe ----------
const e = await telephone('élève')
await e.goto(base)
await e.getByRole('button', { name: /France/ }).click({ timeout: 60_000 })
await e.getByLabel('Lien de partage donné par ton enseignant').fill(lien)
await e.getByRole('button', { name: 'Ajouter le dossier' }).click()
await e.getByText('Choisis ta classe').waitFor({ timeout: 30_000 })
ok((await texte(e)).includes('5e A') && (await texte(e)).includes('Groupe test'), 'dossier publié par le site : deux classes proposées')
await e.getByRole('button', { name: /Groupe test/ }).click()
await e.waitForTimeout(1500)
const accueilTexte = await texte(e)
for (const p of tous.filter((p, i, l) => l.findIndex((x) => x.id === p.id) === i)) ok(accueilTexte.includes(p.titre), `accueil : ${p.titre}`)
await e.screenshot({ path: `${caps}/app-accueil.png`, fullPage: true })

export { e, ok, texte, faireSeance, ouvrir, accueil, parcoursDe, visible, actif, remplir, attendu, telephone, nav, caps, erreurs, base, lien }
const fin = async () => {
  ok(!erreurs.length, `aucune erreur JS ${erreurs.join(' | ')}`)
  await nav.close()
  console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
  process.exit(echecs ? 1 : 0)
}

// ---------- 1. Liste simple, une question par page ----------
{
  const p = parcoursDe('Relatifs : additions et comparaisons')
  await ouvrir(e, p.titre)
  await e.getByRole('button', { name: 'Commencer' }).click()
  const r = await faireSeance(e, p.id, new Set(), 'relatifs').catch(async (err) => {
    await e.screenshot({ path: `${caps}/echec-relatifs.png` })
    console.log('  clavier :', await e.evaluate(() => { const k = document.getElementById('mathalea-virtual-keyboard'); const out = []; const vis = (x, d) => { if (d > 5) return; const r = x.getBoundingClientRect(); const c = getComputedStyle(x); out.push(`${'  '.repeat(d)}${x.tagName}.${String(x.className).slice(0, 70)} ${Math.round(r.width)} ox=${c.overflowX} minw=${c.minWidth} wrap=${c.flexWrap}`); for (const y of [...x.children].slice(0, 2)) vis(y, d + 1) }; vis(k, 0); let a = k.parentElement; while (a) { const c = getComputedStyle(a); if (c.transform !== 'none' || c.contain !== 'none' || c.willChange !== 'auto') out.push('ancêtre ' + a.className + ' transform=' + c.transform); a = a.parentElement } return out.join('\n   ') }))
    console.log('  échec :', err.message.split('\n')[0], '|', (await texte(e)).slice(0, 300))
    return { points: NaN, sur: NaN }
  })
  ok(r.points === r.sur && r.sur === 9, `relatifs : toutes justes (${r.points} / ${r.sur})`)
  await e.screenshot({ path: `${caps}/app-1-bilan.png` })
}

await fin()
