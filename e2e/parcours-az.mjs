// Parcours de l'Explorer joués de A à Z comme un élève qui répond juste :
// fiche de cours, chaque question de chaque ceinture (bonne réponse saisie au
// toucher et au clavier, quel que soit le format : champ, trous, tableau,
// QCM, liste, champs multiples, glisser-déposer, figure à cliquer, sélection,
// champ dans une figure…), vérification, ceinture suivante ouverte par le vrai
// seuil, jusqu'au suivi. Un échec dit la question, son format, la réponse
// attendue et ce qui a été enregistré.
// La réponse attendue vient du moteur, régénérée à part avec la graine de la séance.
// Prérequis : pnpm dev et static/moteur.
//   node e2e/parcours-az.mjs [fichiers…]   (défaut : les parcours de explorer/)
//   PARCOURS=<id>[,<id>…] pour quelques parcours, APPAREIL=bureau pour une fenêtre d'ordinateur
//   FORMATS=1 node e2e/parcours-az.mjs e2e/formats-reponse.json : un exercice
//   par format de réponse de MathALÉA (docs/types-de-reponse.md)
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const CAPTURES = process.env.CAPTURES
const fichiers = process.argv.slice(2).length ? process.argv.slice(2) : ['explorer/prequalifiant.json', 'explorer/evacom-revisions.json', 'explorer/ch-4e-college.json']
const appareil = process.env.APPAREIL ?? 'telephone'
let echecs = 0
const erreurs = []
const bilanFormats = {}
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
  return cond
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const pause = (page, ms) => page.waitForTimeout(ms)


async function eleve(nom, classe, parcours) {
  const options = appareil === 'bureau' ? { viewport: { width: 1280, height: 800 } } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  const ctx = await nav.newContext(options)
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  // Essai d'un moteur construit ailleurs (MOTEUR=<dossier>), sans toucher à static/moteur
  if (process.env.MOTEUR) await ctx.route('**/moteur/**', (r) => r.fulfill({ path: `${process.env.MOTEUR}/${new URL(r.request().url()).pathname.replace(/^\/moteur\//, '')}` }))
  const donnees = { profil: 'eleve', pays: 'CH', classes: [{ lien: 'http://127.0.0.1:9/az/', nom: classe, disponibles: [classe], parcours }] }
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, donnees)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.goto(base)
  // Page séparée pour régénérer les exercices (réponses attendues)
  const calcul = await ctx.newPage()
  // Serveur de dev qui recharge la page au premier chargement : on réessaie
  for (let essai = 0; ; essai++) {
    try {
      await calcul.goto(base)
      await calcul.evaluate(async () => {
        const man = await (await fetch('/moteur/manifest.json')).json()
        const m = await import('/moteur/' + man.entree)
        await m.initialiser()
        m.definirLangue('fr-CH')
        window.__moteur = m
      })
      break
    } catch (err) {
      if (essai >= 2) throw err
      await calcul.waitForTimeout(3000)
    }
  }
  return { ctx, page, calcul, touche: appareil !== 'bureau' }
}

const toucher = (e, loc) => (e.touche ? loc.tap() : loc.click())
const lireSeance = (page, id) => page.evaluate((c) => JSON.parse(localStorage.getItem(`copie:seance:${c}`)), id)

/** autoCorrection de l'étape régénérée (même graine, même numéro que dans la séance) */
async function attendues(e, etape, graine, numero) {
  return e.calcul.evaluate(
    async ({ etape, graine, numero }) => {
      const ex = await window.__moteur.preparerExercice({ ...etape, alea: graine }, numero)
      return ex.interne.autoCorrection.map((a) =>
        a == null
          ? null
          : {
              format: a.formatInteractif ?? null,
              valeur: JSON.parse(JSON.stringify(a.valeur ?? null, (k, v) => (typeof v === 'function' ? undefined : v))),
              statuts: a.propositions?.map((p) => !!p.statut) ?? null,
            },
      )
    },
    { etape, graine, numero },
  )
}

/** Réponse texte d'une valeur attendue (nombre, chaîne, liste de réponses acceptées) */
function texteDe(v) {
  if (v == null) return ''
  if (Array.isArray(v)) return texteDe(v[0])
  if (typeof v === 'object' && 'value' in v) return texteDe(v.value)
  // Écriture scientifique : MathALÉA garde « 5,1e1 », l'élève tape 5,1 · 10¹
  const sci = /^(-?[\d,.]+)e(-?\d+)$/.exec(String(v))
  if (sci) return `${sci[1]}\\cdot 10^{${sci[2]}}`
  return String(v)
}
/** LaTeX → ce qu'un élève tape au clavier, si c'est un nombre simple */
const tapable = (latex) => {
  const t = latex.replace(/\\[,;!]|\{,\}|~/g, (m) => (m === '{,}' ? ',' : '')).replace(/\s+/g, '').replace('.', ',')
  return /^-?\d+(,\d+)?$/.test(t) ? t : null
}

/** Réponse attendue selon les options : une fraction à simplifier attend sa forme réduite */
function reponseDe(rep) {
  const t = texteDe(rep)
  const o = rep?.options ?? {}
  // Un nombre dans un intervalle (« intercaler ») : le milieu
  const intervalle = /^[\]\[](-?[\d.,]+);(-?[\d.,]+)[\]\[]$/.exec(t)
  if (intervalle && (o.estDansIntervalle || o.estDecimalDansIntervalle)) {
    const [a, b] = [intervalle[1], intervalle[2]].map((x) => Number(x.replace(',', '.')))
    const decimales = Math.max(...[intervalle[1], intervalle[2]].map((x) => (x.split(/[.,]/)[1] ?? '').length)) + 1
    return String(Number(((a + b) / 2).toFixed(decimales))).replace('.', ',')
  }
  const f = /^\\[dt]?frac\{(-?\d+)\}\{(\d+)\}$/.exec(t)
  if (f && (o.fractionReduite || o.fractionIrreductible || o.fractionSimplifiee)) {
    const pgcd = (a, b) => (b ? pgcd(b, a % b) : Math.abs(a))
    const g = pgcd(Number(f[1]), Number(f[2]))
    return Number(f[2]) / g === 1 ? String(Number(f[1]) / g) : `\\dfrac{${Number(f[1]) / g}}{${Number(f[2]) / g}}`
  }
  return t
}

/** Saisit une valeur dans un math-field : au clavier si c'est un nombre, sinon comme le clavier de MathALÉA (setValue) */
async function remplirChamp(e, champ, latex) {
  // Champ de texte (réponse en mots) : au clavier
  if ((await champ.evaluate((el) => el.tagName)) === 'INPUT') {
    await toucher(e, champ)
    await pause(e.page, 300)
    return e.page.keyboard.type(latex)
  }
  // Nombre suivi d'une unité (« 24cm », « 12cm^2 ») : chiffres au clavier, unité par sa touche du clavier de MathALÉA
  const unite = /^(-?[\d,.]+)\s*(?:\\,)?\s*(?:\\(?:text|mathrm|operatorname)\{)?([a-zA-Zµμ]+)\}?(\^\{?([23])\}?)?$/.exec(latex)
  if (unite) {
    await toucher(e, champ)
    await pause(e.page, 300)
    await e.page.keyboard.type(unite[1].replace('.', ','))
    // Texte d'une touche du clavier de MathALÉA : « cm », « cm² », ou « cm⁡3cm3 » pour cm³ (rendu MathLive doublé)
    const touche = unite[2] + (unite[4] ?? '')
    const rang = await e.page.locator('#mathalea-virtual-keyboard button:visible').evaluateAll(
      (bs, t) => bs.findIndex((b) => [t, t + t].includes(b.innerText.replace(/[\s\u2061]/g, '').replace('²', '2').replace('³', '3'))),
      touche
    )
    const bouton = e.page.locator('#mathalea-virtual-keyboard button:visible').nth(Math.max(rang, 0))
    if (rang >= 0) {
      await toucher(e, bouton)
      await pause(e.page, 200)
      return
    }
    await champ.evaluate((el) => el.setValue(''))
  }
  const t = tapable(latex)
  // Champ à trous dont la réponse n'est pas un nombre (vecteur, matrice) : l'élève remplit le premier trou
  if (t == null && (await champ.evaluate((el) => el.getPrompts?.().length ?? 0))) {
    await toucher(e, champ)
    await pause(e.page, 300)
    return e.page.keyboard.type('1')
  }
  if (t != null) {
    for (let i = 0; i < 10; i++) {
      await toucher(e, champ)
      // Le champ prend le focus à l'image suivante (MathLive) : un élève ne tape pas plus vite
      await pause(e.page, 300)
      await e.page.keyboard.type(t)
      const lu = await champ.evaluate((el) => el.value)
      if (lu.replace(/\{,\}/g, ',') === t) return
      await champ.evaluate((el) => el.setValue(''))
      await pause(e.page, 250)
    }
  }
  await champ.evaluate((el, v) => {
    el.setValue(v)
    el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
  }, latex)
}

/** Glisse une étiquette vers une case : au doigt (événements tactiles) ou à la souris */
async function glisser(e, de, vers, auBout = false) {
  // auBout : lâchée après la dernière étiquette déjà posée (réponse ordonnée), pas au centre
  const bout = auBout
    ? await vers.evaluate((r) => {
        const c = r.getBoundingClientRect()
        const d = [...r.children].at(-1)?.getBoundingClientRect()
        if (d && d.right + 12 < c.right) return { x: d.right + 8 - c.left, y: d.top + d.height / 2 - c.top }
        return { x: c.width - 6, y: c.height - 6 }
      })
    : null
  if (!e.touche) return de.dragTo(vers, bout ? { targetPosition: bout } : {})
  const cdp = (e.cdp ??= await e.ctx.newCDPSession(e.page))
  const centre = async (loc) => {
    const b = await loc.boundingBox()
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  }
  const a = await centre(de)
  const b = bout ? await vers.boundingBox().then((r) => ({ x: r.x + bout.x, y: r.y + bout.y })) : await centre(vers)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
  for (let k = 1; k <= 8; k++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * k) / 8, y: a.y + ((b.y - a.y) * k) / 8 }] })
    await pause(e.page, 25)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await pause(e.page, 250)
}

/** Donne la bonne réponse au rang k (format de autoCorrection[k]) de l'exercice numéro n affiché */
async function repondre(e, n, k, a) {
  const page = e.page
  const q = `Ex${n}Q${k}`
  const main = page.locator('main')
  const v = a.valeur ?? {}
  switch (a.format) {
    case 'qcm':
    case 'mathalea-qcm': {
      const cases = main.locator(`input[id^="check${q}R"]`)
      for (let j = 0; j < (await cases.count()); j++) {
        const r = Number(/R(\d+)$/.exec(await cases.nth(j).getAttribute('id'))[1])
        if (a.statuts?.[r]) await toucher(e, cases.nth(j))
      }
      return
    }
    case 'liste-deroulante': {
      const liste = main.locator(`#liste-deroulante${q}`)
      const choix = JSON.parse(decodeURIComponent(await liste.getAttribute('choices'))).filter((c) => (typeof c === 'string' ? c : c.value) !== '')
      const voulu = texteDe(v.reponse)
      await toucher(e, liste)
      await toucher(e, liste.locator('[role=option]').nth(choix.findIndex((c) => (typeof c === 'string' ? c : c.value) === voulu)))
      return
    }
    case 'multi-mathfield': {
      const hote = main.locator(`#multi-mathfield${q}`)
      for (const [nom, rep] of Object.entries(v)) {
        if (!rep || typeof rep !== 'object' || !('value' in rep)) continue
        const liste = hote.locator(`liste-deroulante[data-name="${nom}"]`)
        if (await liste.count()) {
          await liste.evaluate((l, val) => (l.value = val), texteDe(rep))
          continue
        }
        const qcm = hote.locator(`[data-type="qcm"][data-name="${nom}"] input[value="${texteDe(rep)}"]`)
        if (await qcm.count()) {
          await toucher(e, qcm.first())
          continue
        }
        await remplirChamp(e, hote.locator(`math-field[data-name="${nom}"]`), reponseDe(rep))
      }
      return
    }
    case 'dnd':
    case 'drag-and-drop': {
      for (const [cle, rep] of Object.entries(v)) {
        if (!cle.startsWith('rectangle')) continue
        for (const id of texteDe(rep).split(/[|;]/).filter(Boolean)) await glisser(e, main.locator(`#etiquettes${q} #etiquette${q}I${id}`).first(), main.locator(`#rectangle${q}R${cle.slice(9)}`), true)
      }
      return
    }
    case 'fillInTheBlank':
    case 'fill-in-the-blank': {
      const champ = main.locator(`#champTexte${q}`)
      for (const [nom, rep] of Object.entries(v)) {
        if (!/^champ\d+$/.test(nom)) continue
        await champ.evaluate((el, [p, val]) => el.setPromptValue(p, val, { mode: 'math' }), [nom, texteDe(rep)])
      }
      await champ.evaluate((el) => el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true })))
      return
    }
    case 'tableauMathlive':
    case 'tableau-mathlive': {
      for (const [cellule, rep] of Object.entries(v)) if (/^L\d+C\d+$/.test(cellule)) await remplirChamp(e, main.locator(`#champTexte${q}${cellule}`), reponseDe(rep))
      return
    }
    case 'MetaInteractif2d':
    case 'meta-interactif-2d': {
      for (const [nom, rep] of Object.entries(v)) {
        if (!/^field\d+$/.test(nom)) continue
        // 845fa reprend dans la question 2 les id de la question 1 (défaut de MathALÉA) : le champ affiché
        let champ = main.locator(`#MetaInteractif2d${q}${nom}`)
        if (!(await champ.count())) champ = main.locator(`math-field[id^="MetaInteractif2dEx${n}Q"][id$="${nom}"]`).last()
        await champ.evaluate((el, val) => el.setPromptValue('champ1', val, { mode: 'math' }), texteDe(rep))
        await champ.evaluate((el) => el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true })))
      }
      return
    }
    case 'clique-figure':
    case 'cliqueFigure': {
      for (let j = 0; j < (a.statuts?.length ?? 0); j++) if (a.statuts[j]) await toucher(e, main.locator(`#cliquefigure${j}${q}`))
      return
    }
    case 'svg-selection': {
      // « Sélectionner a/b de la plaque » : a cases parmi b (la réponse attendue est un rapport)
      const texte = await main.locator('.contenu-mathalea').evaluate((z) => z.querySelector('annotation')?.textContent ?? '')
      const [, num] = /\\[dt]?frac\{(\d+)\}\{(\d+)\}/.exec(texte) ?? /(\d+)\s*\/\s*(\d+)/.exec(texte) ?? []
      const boutons = main.locator(`#svg-selection${q}`).locator('button')
      const total = await boutons.count()
      if (num === undefined) {
        // Valeurs des images (pièces de monnaie…) : une sélection dont la somme est la réponse
        const valeurs = await main.locator(`#svg-selection${q}`).evaluate((x) => JSON.parse(decodeURIComponent(x.getAttribute('svgs'))).flat().map((o) => o.value))
        const cible = Number(texteDe(v.reponse).replace(',', '.'))
        for (let m = 1; m < 1 << valeurs.length; m++) {
          const choisis = valeurs.map((_, j) => j).filter((j) => m & (1 << j))
          if (Math.abs(choisis.reduce((t, j) => t + valeurs[j], 0) - cible) > 1e-9) continue
          for (const j of choisis) await toucher(e, boutons.nth(j))
          return
        }
      }
      const den = Number((/\\[dt]?frac\{\d+\}\{(\d+)\}/.exec(texte) ?? /\d+\s*\/\s*(\d+)/.exec(texte))?.[1] ?? total)
      for (let j = 0; j < Math.round((Number(num) * total) / den); j++) await toucher(e, boutons.nth(j))
      return
    }
    case 'mathalea-textfield': {
      const champ = main.locator(`#champTexte${q}`)
      await toucher(e, champ)
      await page.keyboard.type(texteDe(v.reponse))
      return
    }
    case 'mathalea-solveur': {
      const lignes = main.locator(`#mathalea-solveur${q} math-field`)
      await remplirChamp(e, lignes.last(), reponseDe(v.reponse))
      return
    }
    case 'apigeom-figure': {
      // Placer un point d'abscisse donnée sur une droite graduée : position
      // calculée d'après deux graduations affichées, puis un toucher sur l'axe
      const lire = () => main.locator(`[id^="apigeomEx${n}F"]`).first().evaluate((fig) => {
        const z = fig.closest('.contenu-mathalea')
        if (!z.innerText.includes('abscisse')) return null
        const nombre = (t) => Number(t.replace(/\\,/g, '').replace(/[{}\s]/g, '').replace(',', '.').replace('−', '-'))
        // Abscisse demandée : premier nombre de l'énoncé, hors de la figure
        const tex = [...z.querySelectorAll('annotation')].filter((a) => !fig.contains(a)).map((a) => a.textContent)
        const x = nombre(tex.find((t) => /^[-\d{},.\s\\]+$/.test(t) && /\d/.test(t)) ?? '')
        const graduations = [...fig.querySelectorAll('div')]
          .filter((d) => d.querySelectorAll('annotation').length === 1 && d.getBoundingClientRect().width < 100)
          .map((d) => ({ d, a: d.querySelector('annotation')?.textContent }))
          .filter(({ a }) => a && /^[-\d{},.\s]+$/.test(a))
          .map(({ d, a }) => { const r = d.getBoundingClientRect(); return { v: nombre(a), cx: r.x + r.width / 2 } })
        const axe = [...fig.querySelectorAll('svg line')].map((l) => l.getBoundingClientRect()).sort((p, q) => q.width - p.width)[0]
        if (graduations.length < 2 || !axe || !Number.isFinite(x)) return null
        const [g1, g2] = [graduations[0], graduations[graduations.length - 1]]
        return { x: g1.cx + ((x - g1.v) * (g2.cx - g1.cx)) / (g2.v - g1.v), y: axe.y + axe.height / 2, abscisse: x }
      })
      // Figure montée puis réduite à la largeur de l'écran : attendre une position stable
      let cible = null
      for (let i = 0, avant = null; i < 20; i++) {
        await pause(page, 300)
        const c = await lire()
        if (c && avant && Math.abs(c.x - avant.x) < 1) {
          cible = c
          break
        }
        avant = c
      }
      if (!cible) {
        // Autre figure (construction) : un toucher sur la figure
        const fig = main.locator(`[id^="apigeomEx${n}F"] svg`).last()
        const b = await fig.boundingBox()
        if (b) await (e.touche ? page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) : page.mouse.click(b.x + b.width / 2, b.y + b.height / 2))
        throw new Error('touché seulement : apigeom-figure (construction)')
      }
      await (e.touche ? page.touchscreen.tap(cible.x, cible.y) : page.mouse.click(cible.x, cible.y))
      return
    }
    default: {
      // mathlive, mathalea-mathfield, possible-multi-lines-answer : un champ
      // Champ visible seulement : la calculatrice (my-calculator) range sa réponse dans un champ caché
      const champ = main.locator(`#champTexte${q}:visible`)
      if (await champ.count()) return remplirChamp(e, champ, reponseDe(v.reponse ?? Object.values(v).find((x) => x && typeof x === 'object' && 'value' in x)))
      // Autre élément de MathALÉA (horloge, grille, tableau de signes…) : un toucher au centre
      const el = main.locator(`[id*="${q}"]:not([id^="resultatCheck"]):not([id^="feedback"])`).first()
      const b = (await el.count()) ? await el.boundingBox() : null
      if (!b) throw new Error(`format sans saisie connue : ${a.format}`)
      const x = Math.min(b.x + b.width / 2, b.x + (await page.evaluate(() => innerWidth)) / 3)
      await (e.touche ? page.touchscreen.tap(x, b.y + Math.min(b.height / 2, 40)) : page.mouse.click(x, b.y + Math.min(b.height / 2, 40)))
      // Une case de grille a pris le focus : l'élève y tape un chiffre
      await pause(page, 300)
      if (await page.evaluate(() => /^(INPUT|MATH-FIELD)$/.test(document.activeElement?.tagName ?? ''))) await page.keyboard.type('1')
      const verifier = page.getByRole('button', { name: 'Vérifier', exact: true }).last()
      const actif = async () => (await verifier.count()) && (await verifier.isEnabled())
      // Sinon un champ dans l'élément (tableau de valeurs d'un traceur) : l'élève y tape un nombre
      const dedans = el.locator('math-field:visible, input:visible').first()
      if (!(await actif()) && (await dedans.count())) {
        await toucher(e, dedans)
        await pause(page, 300)
        await page.keyboard.type('1')
        await pause(page, 300)
      }
      // Ou une case qui ouvre un pavé de chiffres propre à l'élément (pyramide de nombres)
      for (const f of [0.1, 0.3, 0.5]) {
        if (await actif()) break
        const y = b.y + b.height * f
        await (e.touche ? page.touchscreen.tap(b.x + b.width / 2, y) : page.mouse.click(b.x + b.width / 2, y))
        await pause(page, 400)
        const chiffre = page.locator('main button:visible', { hasText: /^\s*1\s*$/ }).last()
        if (await chiffre.count()) await toucher(e, chiffre)
        await pause(page, 300)
      }
      // Puis la réponse attendue, écrite dans l'élément comme MathALÉA réécrit une réponse enregistrée
      const heure = /^(\d+) h (\d+) min$/.exec(texteDe(v.reponse))
      const attendu = heure ? JSON.stringify({ hour: Number(heure[1]), minute: Number(heure[2]), second: 0 }) : typeof v.reponse?.value === 'string' ? v.reponse.value : JSON.stringify(Object.fromEntries(Object.entries(v).filter(([, x]) => x && typeof x === 'object' && 'value' in x).map(([k, x]) => [k, texteDe(x)])))
      const ecrit = await main.locator(`#${a.format}${q}`).evaluate((el, val) => {
        try {
          el.value = val
          return true
        } catch {
          return false
        }
      }, attendu).catch(() => false)
      e.restaurees = (e.restaurees ?? 0) + 1
      if (!ecrit) throw new Error(`touché seulement : ${a.format}`)
    }
  }
}

/** Joue la séance ouverte : chaque question avec la bonne réponse ; renvoie le détail de ce qui n'a pas été compté correct */
async function jouerSeance(e, p, nomCeinture) {
  const page = e.page
  await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 30000 })
  await pause(page, 800)
  const s0 = await lireSeance(page, p.id)
  const cache = {}
  const problemes = []
  for (let tour = 0; tour < 60; tour++) {
    await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 30000 })
    await pause(page, 600)
    // Étape et rangs affichés, lus dans les identifiants des éléments de réponse
    // Toutes les questions de la page (plusieurs par page selon la présentation), sans les corrections
    const ids = await page.locator('main').evaluate((m) =>
      [...m.querySelectorAll('.question-eleve')].flatMap((z) => [...z.querySelectorAll('[id]')].map((x) => x.id).concat([...z.querySelectorAll('*')].flatMap((x) => (x.shadowRoot ? [...x.shadowRoot.querySelectorAll('[id]')].map((y) => y.id) : [])))),
    )
    const rangs = new Map()
    for (const id of ids) {
      const m = /Ex(\d+)[QF](\d+)/.exec(id)
      if (m && !/^(resultatCheck|feedback)/.test(id)) rangs.set(`${m[1]}-${m[2]}`, [Number(m[1]), Number(m[2]), /F\d/.test(id.slice(m.index))])
    }
    const papier = await page.getByRole('button', { name: 'Voir la correction' }).count()
    if (papier) {
      await toucher(e, page.getByRole('button', { name: 'Voir la correction' }))
    } else {
      let etiquette = ''
      for (const [n, k, figure] of rangs.values()) {
        if (figure) continue
        cache[n] ??= await attendues(e, { ...s0.contenu.etapes[n] }, s0.graines[n], n)
        const a = cache[n][k]
        if (!a) continue
        // Figure apigeom : traitée une fois, par l'id de la figure (plus bas)
        if (a.format === 'apigeom-figure') continue
        bilanFormats[a.format] = (bilanFormats[a.format] ?? 0) + 1
        etiquette += `${s0.contenu.etapes[n].id} Q${k} ${a.format} `
        try {
          await repondre(e, n, k, a)
        } catch (err) {
          problemes.push(`${etiquette}: saisie impossible (${err.message.split('\n')[0]})`)
        }
      }
      // Figure apigeom seule (rang porté par l'exercice) : format apigeom-figure
      if ([...rangs.values()].some(([, , f]) => f)) {
        const [n] = [...rangs.values()].find(([, , f]) => f)
        try {
          await repondre(e, n, 0, { format: 'apigeom-figure' })
        } catch (err) {
          problemes.push(`${s0.contenu.etapes[n].id} apigeom-figure : saisie impossible (${err.message.split('\n')[0]})`)
        }
        bilanFormats['apigeom-figure'] = (bilanFormats['apigeom-figure'] ?? 0) + 1
        etiquette += `${s0.contenu.etapes[n].id} apigeom-figure `
      }
      await pause(page, 500)
      // Lien « Vérifier » sous chaque question (plusieurs questions par page, correction à la question)
      for (const lien of await page.locator('main').getByRole('button', { name: 'Vérifier', exact: true }).all()) {
        if (await lien.isEnabled()) await toucher(e, lien)
        else problemes.push(`${etiquette}: Vérifier reste inactif après la réponse`)
        await pause(page, 500)
      }
      // Bouton du bas : vérifier la question ou soumettre la page
      const bas = page.locator('footer').getByRole('button', { name: /^(Vérifier|Soumettre l’exercice|Soumettre)$/ })
      if (await bas.count()) {
        if (await bas.first().isDisabled()) {
          problemes.push(`${etiquette}: Vérifier reste inactif après la réponse`)
          await capture(page, `az-${p.id}-inactif-${tour}`)
          await toucher(e, page.getByRole('button', { name: /^(Passer|Terminer)$/ }))
        } else await toucher(e, bas.first())
        await pause(page, 900)
        const garde = page.getByRole('button', { name: /quand même$/ })
        if (await garde.count()) {
          problemes.push(`${etiquette}: garde-fou « ${(await garde.innerText()).trim()} » alors que tout est répondu`)
          await toucher(e, garde)
          await pause(page, 900)
        }
      }
    }
    await pause(page, 300)
    // Suite : question ou exercice suivant, soumission de la tentative (correction à la fin), bilan
    const suivant = page.locator('footer').getByRole('button', { name: /^(Question suivante|Exercice suivant|Soumettre la tentative|Voir le bilan)$/ })
    if (!(await suivant.count())) {
      // Question passée : on est déjà sur la suivante, ou au garde-fou, ou au bilan
      const garde = page.getByRole('button', { name: /quand même$/ })
      if (await garde.count()) await toucher(e, garde)
      await pause(page, 800)
      if (!(await page.locator('main .contenu-mathalea').count())) break
      continue
    }
    const libelle = (await suivant.first().innerText()).trim()
    await toucher(e, suivant.first())
    await pause(page, 900)
    if (libelle === 'Soumettre la tentative') {
      const garde = page.getByRole('button', { name: /quand même$/ })
      if (await garde.count()) {
        problemes.push(`garde-fou « ${(await garde.innerText()).trim()} » alors que tout est répondu`)
        await toucher(e, garde)
      }
      // Relecture corrigée, puis le bilan
      await pause(page, 3000)
      const bilan = page.locator('footer').getByRole('button', { name: 'Voir le bilan' })
      if (await bilan.count()) await toucher(e, bilan)
      break
    }
    if (libelle === 'Voir le bilan') break
  }
  // Chaque vérification enregistrée : une bonne réponse doit être comptée correcte
  const fin = await lireSeance(page, p.id).catch(() => null)
  for (const essai of fin?.essais ?? []) {
    if (essai.juste) continue
    const etape = s0.contenu.etapes[essai.etape]
    cache[essai.etape] ??= await attendues(e, { ...etape }, s0.graines[essai.etape], essai.etape)
    const att = cache[essai.etape][essai.question]
    problemes.push(`${etape.id} Q${essai.question} ${att?.format ?? ''} : bonne réponse comptée incorrecte. Attendu ${JSON.stringify(att?.valeur ?? att?.statuts).slice(0, 300)} ; enregistré ${JSON.stringify(essai.reponses).slice(0, 300)}`)
  }
  await pause(page, 1200)
  return problemes
}

const capture = async (page, nom) => CAPTURES && page.screenshot({ path: `${CAPTURES}/${nom}.png` })

/** Délai maximal d'une séance : un format qui bloque ne bloque pas tout le reste */
const avecDelai = (promesse, ms, quoi) => Promise.race([promesse, new Promise((_, rejeter) => setTimeout(() => rejeter(new Error(`délai dépassé : ${quoi}`)), ms))])

// Mode formats (FORMATS=1) : chaque exercice du fichier joué seul, un résultat par format
if (process.env.FORMATS) {
  const tableau = []
  for (const f of fichiers)
    for (const classe of JSON.parse(readFileSync(f, 'utf8')).classes)
      for (const p of classe.parcours)
        for (const etape of p.etapes) {
          // FORMAT=dnd,qcm : seulement ces formats (premier mot du titre)
          if (process.env.FORMAT && !process.env.FORMAT.split(',').includes(etape.titre.split(' ')[0])) continue
          const seul = { ...p, id: `format-${etape.uuid}`, titre: `Format ${etape.uuid}`, paliers: undefined, style: undefined, etapes: [etape] }
          const e = await eleve(seul.id, classe.nom, [seul])
          let problemes
          try {
            await toucher(e, e.page.getByRole('button', { name: new RegExp(`^\\s*${seul.titre}`) }).first())
            await pause(e.page, 600)
            await toucher(e, e.page.getByRole('button', { name: /^Commencer/ }).first())
            await e.page.locator('main .contenu-mathalea').first().waitFor({ timeout: 30000 })
            await pause(e.page, 1500)
            await capture(e.page, `format-${etape.titre.split(' ')[0]}`)
            // Largeur : rien ne doit dépasser l'écran (sinon une partie de la réponse est hors d'atteinte)
            // Ce qui dépasse doit rester atteignable : dans un cadre qui défile (la question, un tableau)
            const deborde = await e.page.evaluate(() =>
              [...document.querySelectorAll('main .contenu-mathalea *')]
                .filter((x) => x.getBoundingClientRect().right > innerWidth + 2)
                .filter((x) => { for (let p = x.parentElement; p; p = p.parentElement) if (/auto|scroll/.test(getComputedStyle(p).overflowX)) return false; return true })
                .map((x) => x.tagName.toLowerCase() + (x.id ? '#' + x.id : ''))
                .slice(0, 3),
            )
            const avantProblemes = deborde.length ? [`dépasse de l'écran : ${deborde.join(', ')}`] : []
            problemes = [...avantProblemes, ...(await avecDelai(jouerSeance(e, seul, etape.titre), 600000, etape.titre))]
          } catch (err) {
            if (process.env.DEBUG) console.log(err.stack)
            problemes = [`erreur : ${err.message.split('\n')[0]}`]
            await capture(e.page, `format-${etape.uuid}-erreur`)
          }
          const s = await lireSeance(e.page, seul.id).catch(() => null)
          const essais = s?.essais ?? []
          // Format dont la bonne réponse ne se saisit pas automatiquement : il suffit que
          // la réponse soit prise en compte (Vérifier actif) et vérifiée sans erreur
          if (etape.verifie === 'prise-en-compte') {
            problemes = problemes.filter((x) => !/comptée incorrecte|touché seulement/.test(x))
            if (!essais.length && !problemes.length) problemes.push('aucune vérification enregistrée')
          }
          const statut = problemes.length ? '✘' : '✔'
          const mode = e.restaurees ? ' (toucher, puis réponse écrite dans l’élément comme MathALÉA la restaure)' : ''
          tableau.push(`${statut} ${etape.titre} : ${essais.filter((x) => x.juste).length}/${essais.length} correctes${mode}${problemes.length ? '\n    ' + problemes.join('\n    ') : ''}`)
          console.log(tableau.at(-1))
          if (problemes.length) echecs++
          await e.ctx.close().catch(() => {})
        }
  await nav.close()
  console.log(echecs ? `${echecs} FORMAT(S) EN ÉCHEC` : 'TOUT VERT')
  process.exit(echecs ? 1 : 0)
}

for (const f of fichiers) {
  const fichier = JSON.parse(readFileSync(f, 'utf8'))
  for (const classe of fichier.classes) {
    for (const p of classe.parcours) {
      if (process.env.PARCOURS && !process.env.PARCOURS.split(',').includes(p.id)) continue
      // Parcours sans paliers : un seul passage de tous ses exercices
      const paliers = p.paliers?.length > 1 ? p.paliers : [{ titre: p.titre, nb: p.etapes.length }]
      console.log(`\n=== ${p.titre} (${p.id}, ${paliers.length} ceinture${paliers.length > 1 ? 's' : ''}, ${appareil})`)
      const e = await eleve(p.id, classe.nom, [p])
      const page = e.page
      await toucher(e, page.getByRole('button', { name: new RegExp(`^\\s*${p.titre.replace(/[()]/g, '.')}`) }).first())
      await pause(page, 800)
      await toucher(e, page.getByRole('button', { name: /^Commencer/ }).first())
      for (let k = 0; k < paliers.length; k++) {
        const nom = `ceinture ${k + 1} « ${paliers[k].titre} »`
        await pause(page, 800)
        // Fiche de cours d'abord (première fois)
        const fiche = page.getByRole('button', { name: 'Commencer l’entraînement' })
        if (await fiche.count()) {
          if (k === 0) await capture(page, `az-${p.id}-fiche`)
          await toucher(e, fiche)
        }
        const problemes = await jouerSeance(e, p, nom)
        const texteBilan = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
        const pourcent = /(\d+)\s*%/.exec(texteBilan)?.[1]
        ok(problemes.length === 0, `${p.id} ${nom} : toutes les bonnes réponses acceptées (${pourcent ?? '?'} %)`, '\n    ' + problemes.join('\n    '))
        if (k === 0) await capture(page, `az-${p.id}-bilan`)
        if (k + 1 < paliers.length) {
          const continuer = page.getByRole('button', { name: /^Continuer : / })
          if (!ok(await continuer.count(), `${p.id} ${nom} : la ceinture suivante s'ouvre`, texteBilan.slice(0, 300))) break
          await toucher(e, continuer)
        }
      }
      // Suivi : les ceintures obtenues apparaissent
      for (let i = 0; i < 4 && !(await page.getByRole('tab', { name: /Suivi/ }).count()); i++) {
        await page.goBack()
        await pause(page, 500)
      }
      const onglet = page.getByRole('tab', { name: /Suivi/ }).or(page.getByRole('button', { name: /^Suivi$/ }))
      if (await onglet.count()) {
        await toucher(e, onglet.first())
        await pause(page, 800)
        const suivi = await page.locator('body').innerText()
        ok(suivi.includes(p.titre), `${p.id} : le parcours figure dans le suivi`)
        await capture(page, `az-${p.id}-suivi`)
      } else ok(false, `${p.id} : onglet Suivi introuvable`)
      await e.ctx.close()
    }
  }
}

console.log('\nFormats rencontrés :', JSON.stringify(bilanFormats))
ok(erreurs.length === 0, 'aucune erreur JavaScript', erreurs.slice(0, 10).join('\n'))
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
