// Chaque type de réponse de MathALÉA dans une vraie séance à 390 px (pnpm dev
// seulement), correction à la fin, en deux passages : bonne réponse donnée
// comme un élève (touche, clavier, case à cocher, liste), puis réponse fausse.
// Départ vers l'autre question puis retour, soumission, bilan. Pour chaque
// exercice : la réponse reste après le retour, la bonne compte juste et la
// fausse compte faux, le bilan la relit. Exercices qui chargent leurs questions
// après coup compris (Automatismes 6e, 1re).
//   CAPTURES=<dossier> THEME=clair|sombre [FILTRE=6A] node e2e/types.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
mkdirSync(captures, { recursive: true })
let echecs = 0
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const liste = [
  ['FR', '385b7', 'canc3C01 calcul'],
  ['FR', 'd0287', 'canc3C05 QCM à boutons radio'],
  ['FR', 'f7ad2', 'canc3N01 QCM'],
  ['CH', '569e1', '9QCM-10 QCM (CH)'],
  ['FR', '4f8ee', 'canc3C16 texte à trous'],
  ['FR', 'bdb11', 'canc3C03 texte à trous'],
  ['FR', '85dfd', 'can6G1-03 plusieurs champs'],
  ['FR', 'e791a', 'can1G1-05 plusieurs champs'],
  ['FR', 'f36d5', '6M2B-1 champ sur une figure'],
  ['FR', 'bc788', '5G2B champs sur une figure'],
  ['FR', 'f57fe', 'CM2G5C-1 figure à cliquer'],
  ['FR', 'ad915', 'can1D3-05 liste déroulante'],
  ['FR', 'c19b6', '4L20-1 solveur'],
  ['FR', 'f7a15', '6P3D-2 tableau'],
  ['FR', '2359a', '6N1E tableau'],
  ['FR', '95371', '6AutoE1-1 texte'],
  ['FR', '5e37d', 'CM2N4B-1 calcul en lignes'],
  ['FR', 'c6cd6', '6A automatismes (chargement différé)'],
  ['FR', 'ce2ea', '1A automatismes (chargement différé)'],
]
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
if (process.env.FILTRE) liste.splice(0, liste.length, ...liste.filter(([, , nom]) => nom.includes(process.env.FILTRE)))

async function seance(pays, uuid) {
  const p = {
    id: 'types', version: 1, titre: 'Types', objectif: '', niveau: '6e', theme: 'Divers', difficulte: 1, icone: 'bx-shape-triangle',
    presentation: 'une_question_par_page', correction: 'parcours',
    etapes: [{ uuid, id: 'x', titre: 'Exercice', nbQuestions: 1 }, { uuid: '385b7', id: 'canc3C01', titre: 'Calcul', nbQuestions: 1 }],
  }
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(([p, pays, theme]) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify(pays))
    localStorage.setItem('copie:explorer', JSON.stringify([p]))
    localStorage.setItem('theme', theme)
  }, [p, pays, process.env.THEME ?? 'clair'])
  const page = await ctx.newPage()
  page.erreurs = []
  page.on('pageerror', (e) => page.erreurs.push(e.message.slice(0, 200)))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
  await page.getByText('6e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Types/ }).first().click({ timeout: 30_000 })
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 120_000 })
  await page.waitForTimeout(2500)
  return page
}

/** Correction automatique de la question affichée (exercice régénéré par sa graine) */
const attendue = (page) =>
  page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem('copie:seance:types'))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    const ex = await m.preparerExercice({ ...s.contenu.etapes[0], alea: s.graines[0] }, 70)
    const a = ex.interne.autoCorrection[0] ?? {}
    const brut = (v) => (v == null ? null : typeof v === 'object' && !Array.isArray(v) ? (v.texFraction ?? v.texFSD ?? v.toString?.() ?? null) : Array.isArray(v) ? String(v[0]) : String(v))
    const valeur = a.valeur ?? {}
    return {
      type: a.formatInteractif ?? null,
      reponse: brut(valeur.reponse?.value),
      cellules: Object.fromEntries(Object.entries(valeur).filter(([k]) => /^L\d+C\d+$/.test(k)).map(([k, v]) => [k, brut(v?.value)])),
      fields: Object.fromEntries(Object.entries(valeur).filter(([k]) => /^field\d+$/.test(k)).map(([k, v]) => [k, brut(v?.value)])),
      champs: Object.fromEntries(Object.entries(valeur).filter(([k]) => /^champ\d+$/.test(k)).map(([k, v]) => [k, brut(v?.value)])),
      propositions: (a.propositions ?? []).map((p) => !!p.statut),
    }
  })

/** Ce qu'un élève tape pour une réponse LaTeX simple, sinon null */
function aTaper(latex) {
  if (latex == null) return null
  let t = String(latex)
  const iv = /^\[(-?[\d.,]+);(-?[\d.,]+)[\[\]]$/.exec(t)
  if (iv) return String((Number(iv[1].replace(',', '.')) + Number(iv[2].replace(',', '.'))) / 2).replace('.', ',')
  t = t.replace(/\\[dt]?frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)').replace(/\((\d+)\)\/\((\d+)\)/g, '$1/$2')
  t = t.replace(/\{,\}/g, ',').replace(/[  ]|\\[,;: ]|\\!/g, '').replace(/\\text\{\s*([^{}]*)\}/g, '$1').replace(/\\times/g, '*').replace(/\\cdot/g, '*')
  t = t.replace(/\./g, ',').replace(/^\{(.*)\}$/, '$1')
  if (/[\\{}^_]/.test(t)) return null
  return t.trim()
}

async function taperDans(page, champ, texte, latex) {
  await champ.click()
  await page.waitForTimeout(300)
  if (texte != null) await page.keyboard.type(texte, { delay: 25 })
  else await champ.evaluate((mf, l) => mf.executeCommand(['insert', l]), latex)
  await page.keyboard.press('ArrowRight')
}

/** Répond comme un élève ; renvoie la façon dont on a répondu */
/** Réponse fausse plausible : nombre décalé, fraction décalée, sinon texte faux */
function fausse(latex) {
  const t = String(latex ?? '')
  const nombre = t.replace(/\{,\}/g, ',').replace(/[\s\u202f\u00a0]|\\[,;: !]/g, '')
  if (/^-?\d+([.,]\d+)?$/.test(nombre)) return String(Math.round((Number(nombre.replace(',', '.')) + 1) * 1e6) / 1e6).replace('.', ',')
  const f = /^\\[dt]?frac\{(-?\d+)\}\{(\d+)\}$/.exec(nombre)
  if (f) return `\\dfrac{${Number(f[1]) + 1}}{${f[2]}}`
  if (/\d/.test(t)) return t.replace(/(\d+)(?!.*\d)/, (m) => String(Number(m) + 1))
  return 'zzz'
}
/** La même question, mais avec des réponses fausses partout */
function fausser(a) {
  const tout = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, fausse(v)]))
  const premiereFausse = a.propositions.findIndex((p) => !p)
  return {
    ...a,
    reponse: a.type === 'liste-deroulante' ? a.reponse : a.reponse == null ? null : fausse(a.reponse),
    eviter: a.type === 'liste-deroulante' ? a.reponse : undefined,
    champs: tout(a.champs),
    cellules: tout(a.cellules),
    fields: tout(a.fields),
    propositions: a.propositions.map((_, j) => j === premiereFausse),
  }
}

async function repondre(page, a) {
  const main = page.locator('main .contenu-mathalea').first()
  const t = a.type
  if (['mathlive', 'mathalea-mathfield', 'possible-multi-lines-answer', 'mathalea-solveur', 'mathalea-textfield'].includes(t) && a.reponse != null) {
    const champ = main.locator('math-field[id], input[id^=champTexte]').first()
    if (!(await champ.count())) return 'champ introuvable'
    const texte = aTaper(a.reponse)
    if (t === 'mathalea-textfield' || (await champ.evaluate((c) => c.tagName)) === 'INPUT') {
      await champ.click(); await page.keyboard.type(String(a.reponse).replace(/\\text\{(.*)\}/, '$1'), { delay: 25 })
      return 'texte tapé'
    }
    if (t === 'mathalea-solveur') {
      // Le solveur montre l'énoncé dans un premier champ : la réponse va dans
      // l'étape vide, puis « Évaluer »
      const etape = main.locator('math-field').last()
      await taperDans(page, etape, texte, a.reponse)
      await main.getByRole('button', { name: 'Évaluer' }).last().click().catch(() => {})
      return `étape « ${texte ?? a.reponse} » évaluée`
    }
    await taperDans(page, champ, texte, a.reponse)
    return texte != null ? `tapé « ${texte} »` : `inséré ${a.reponse}`
  }
  if (Object.keys(a.cellules ?? {}).length) {
    // Tableau MathLive : toucher chaque case, taper
    let n = 0
    for (const [k, v] of Object.entries(a.cellules)) {
      const champ = main.locator(`math-field[id$="Q0${k}"]`).first()
      if (await champ.count()) { await taperDans(page, champ, aTaper(v), v); n++ }
    }
    return `${n}/${Object.keys(a.cellules).length} case(s) du tableau`
  }
  if (Object.keys(a.fields ?? {}).length) {
    // Champs posés sur une figure (MetaInteractif2d) : toucher, taper
    let n = 0
    for (const [k, v] of Object.entries(a.fields)) {
      const champ = main.locator(`math-field[id$="Q0${k}"]`).first()
      if (await champ.count()) { await taperDans(page, champ, aTaper(v), v); n++ }
    }
    return `${n} champ(s) sur la figure`
  }
  if (t === 'clique-figure' && a.propositions.length) {
    let n = 0
    for (const [k, juste] of a.propositions.entries()) {
      if (!juste) continue
      const b = await main.locator(`[id^="cliquefigure${k}Ex"]`).first().boundingBox()
      if (b) { await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); n++ }
    }
    return `${n} figure(s) touchée(s)`
  }
  if (t === 'multi-mathfield' && Object.keys(a.champs).length) {
    // Champs dans l'ombre de <multi-mathfield> : toucher chacun, taper
    const champs = main.locator('multi-mathfield math-field')
    const n = await champs.count()
    for (let k = 0; k < n; k++) {
      const v = a.champs[`champ${k + 1}`]
      if (v != null) await taperDans(page, champs.nth(k), aTaper(v), v)
    }
    return `${n} champ(s) multi-mathfield`
  }
  if ((t === 'fill-in-the-blank' || t === 'fillInTheBlank' || t === 'meta-custom') && Object.keys(a.champs).length) {
    const champ = main.locator('math-field').first()
    if (!(await champ.count())) return 'trous introuvables'
    await champ.click()
    await page.waitForTimeout(300)
    const ids = await champ.evaluate((mf) => mf.getPrompts?.() ?? [])
    let n = 0
    for (const id of ids) {
      const v = a.champs[id]
      if (v == null) continue
      // Toucher la case à trous, puis taper
      await champ.evaluate((mf, id) => { mf.focus(); mf.selection = mf.getPromptRange(id) }, id)
      const texte = aTaper(v)
      if (texte != null) await page.keyboard.type(texte, { delay: 25 })
      else await champ.evaluate((mf, l) => mf.executeCommand(['insert', l]), v)
      n++
    }
    return `${n}/${ids.length} trous remplis`
  }
  if ((t === 'qcm' || t === 'mathalea-qcm') && a.propositions.length) {
    const cases = main.locator('input[type=checkbox][id], input[type=radio][id]')
    const ids = await cases.evaluateAll((l) => l.map((c) => c.id))
    let n = 0
    for (const id of ids) {
      const k = Number(/R(\d+)$/.exec(id)?.[1])
      if (a.propositions[k]) { await page.locator('#' + id).click(); n++ }
    }
    return `${n} case(s) cochée(s) sur ${ids.length}`
  }
  if (t === 'liste-deroulante' && a.reponse != null) {
    const l = main.locator('liste-deroulante').first()
    if (!(await l.count())) {
      const s = main.locator('select').first()
      await s.selectOption({ label: a.reponse }).catch(async () => s.selectOption(a.reponse))
      return 'select'
    }
    await l.click()
    await page.waitForTimeout(300)
    if (a.eviter != null) {
      // Réponse fausse : la première option qui n'est pas la bonne
      const options = page.locator('main [role="option"]')
      for (let j = 0; j < (await options.count()); j++) {
        const texte = (await options.nth(j).innerText()).trim()
        if (texte && texte !== a.eviter && !texte.startsWith('Choisir')) { await options.nth(j).click(); return `autre option « ${texte} »` }
      }
      return 'aucune autre option'
    }
    const opt = page.locator('main [role="option"]').filter({ hasText: new RegExp(`^\\s*${a.reponse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) })
    if (await opt.count()) { await opt.first().click(); return `option « ${a.reponse} »` }
    await page.locator('main [role="option"]').nth(1).click()
    return `option introuvable (${a.reponse}), 2e choisie`
  }
  // Autres types : un geste au centre de l'élément interactif
  const cible = main.locator('svg, canvas, apigeom-figure, [draggable=true], liste-deroulante, select, math-field, input, button').first()
  if (!(await cible.count())) return 'rien à toucher'
  const b = await cible.boundingBox()
  if (!b) return 'élément invisible'
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  return 'geste au centre'
}

const etat = (page) =>
  page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('copie:seance:types'))
    return { essai: s.essais?.find((e) => e.etape === 0 && e.question === 0) ?? null }
  })
/** Valeurs visibles des champs de la question (réponse de l'élève à l'écran) */
const valeurs = (page, sel) =>
  page.evaluate((sel) => {
    const z = document.querySelector(sel)
    if (!z) return null
    return [...z.querySelectorAll('math-field, input, select, liste-deroulante, multi-mathfield, interactive-clock, my-spreadsheet, clique-figure, points-cliquables, labyrinthe-element, relier-etiquettes, echiquier-probleme, tableau-signes-variations, couteau-suisse, mathalea-qcm, fill-in-the-blank')].map((c) => {
      if (c.type === 'checkbox' || c.type === 'radio') return c.checked ? 'x' : '.'
      return String(c.value ?? '').slice(0, 30)
    }).join(' | ')
  }, sel)

for (const [pays, uuid, nom] of liste) {
  for (const juste of [true, false]) {
    const quoi = juste ? 'bonne réponse' : 'réponse fausse'
    let page
    try {
      page = await seance(pays, uuid)
      let a = await attendue(page)
      // Automatismes : leurs questions sont tirées au hasard ; ces entrées
      // vérifient le chargement différé, sur une question de calcul ou un QCM
      for (let essai = 0; nom.includes('automatismes') && !['mathalea-mathfield', 'mathlive', 'mathalea-qcm'].includes(a.type) && essai < 8; essai++) {
        await page.context().close()
        page = await seance(pays, uuid)
        a = await attendue(page)
      }
      const geste = await repondre(page, juste ? a : fausser(a))
      await page.waitForTimeout(800)
      const affiche = await valeurs(page, 'main .contenu-mathalea')
      ok(!!affiche?.replace(/[\s|.]/g, ''), `${nom}, ${quoi} : affichée (${geste})`)
      const onglets = page.getByRole('tablist', { name: 'Questions' }).getByRole('tab')
      await onglets.nth(1).click()
      await page.waitForTimeout(1200)
      await onglets.nth(0).click()
      await page.waitForTimeout(2000)
      ok((await valeurs(page, 'main .contenu-mathalea')) === affiche, `${nom}, ${quoi} : gardée après un aller-retour`)
      if (juste) await page.screenshot({ path: `${captures}/types-${uuid}.png` })
      await onglets.last().click()
      await page.waitForTimeout(800)
      await page.getByRole('button', { name: 'Soumettre la tentative' }).click()
      await page.getByRole('button', { name: 'Soumettre quand même' }).click({ timeout: 3000 }).catch(() => {})
      await page.getByRole('button', { name: 'Voir le bilan' }).click({ timeout: 60_000 })
      await page.waitForTimeout(1500)
      const e = (await etat(page)).essai
      ok(e?.juste === juste, `${nom}, ${quoi} : comptée ${juste ? 'juste' : 'fausse'} (${e ? `${e.points}/${e.total}` : 'aucun essai'})`)
      await page.locator('main li button').first().click()
      await page.waitForTimeout(3000)
      const relue = (await valeurs(page, 'main li')) ?? ''
      ok(relue.startsWith(affiche.slice(0, 20)), `${nom}, ${quoi} : relue au bilan`)
      ok(page.erreurs.length === 0, `${nom}, ${quoi} : aucune erreur de page${page.erreurs.length ? ' : ' + page.erreurs.join(' | ') : ''}`)
    } catch (err) {
      ok(false, `${nom}, ${quoi} : ${String(err).split('\n')[0].slice(0, 150)}`)
    }
    await page?.context().close()
  }
}
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
