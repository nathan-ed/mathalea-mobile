// Réponses qui ne sont ni un champ ni une case (première séance en classe,
// octobre 2026) : liste déroulante, champs multiples (encadrer et arrondir une
// racine), glisser-déposer, nombres sans espaces. Rejoué comme un élève :
// vrais touchers et vraie frappe, au téléphone et en fenêtre d'ordinateur,
// jusqu'à la vérification, au brouillon repris et au bilan.
// Prérequis : serveur de dev (pnpm dev) et static/moteur.
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const CAPTURES = process.env.CAPTURES
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

const etape = (uuid, nb = 2) => ({ uuid, id: uuid, nbQuestions: nb, titre: `Exercice ${uuid}` })
/** Deux ceintures : l'exercice essayé, puis une seconde (le nom de la ceinture s'affiche dès qu'il y en a plusieurs) */
const parcours = (id, uuid) => ({
  id,
  version: 1,
  presentation: 'une_question_par_page',
  correction: 'question',
  titre: `Réponses ${id}`,
  objectif: '',
  niveau: '9e',
  theme: 'Essai',
  difficulte: 1,
  icone: 'bx-calculator',
  style: 'ceintures',
  paliers: [
    { titre: `Ceinture ${id}`, nb: 1 },
    { titre: 'Suite', nb: 1 },
  ],
  etapes: [etape(uuid), etape('5d1e2')],
})

const appareils = {
  telephone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  bureau: { viewport: { width: 1280, height: 800 } },
}

async function eleve(nom, p, appareil, theme = 'light') {
  const ctx = await nav.newContext({ ...appareils[appareil], colorScheme: theme })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  const donnees = { profil: 'eleve', pays: 'CH', classes: [{ lien: 'http://127.0.0.1:9/essai/', nom: 'Essai', disponibles: ['Essai'], parcours: [p] }] }
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, donnees)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.goto(base)
  await page.getByRole('button', { name: new RegExp(`^\\s*${p.titre}`) }).first().click()
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(1500)
  return { ctx, page, touche: appareil === 'telephone' }
}

const lireSeance = (page, id) => page.evaluate((c) => JSON.parse(localStorage.getItem(`copie:seance:${c}`)), id)
const toucher = (e, loc) => (e.touche ? loc.tap() : loc.click())

/** Réponses attendues de l'étape, régénérées à part avec la graine de la séance */
async function attendues(e, id) {
  const s = await lireSeance(e.page, id)
  const autre = await e.ctx.newPage()
  await autre.goto(base)
  const r = await autre.evaluate(
    async ({ uuid, graine }) => {
      const m = await import('/moteur/moteur.js')
      await m.initialiser()
      const ex = await m.preparerExercice({ uuid, nbQuestions: 2, alea: graine }, 7)
      return ex.interne.autoCorrection.map((a) => ({ ...a?.valeur, statuts: a?.propositions?.map((x) => !!x.statut) }))
    },
    { uuid: s.contenu.etapes[0].uuid, graine: s.graines[0] },
  )
  await autre.close()
  return r
}

const verifier = async (e) => {
  const bouton = e.page.getByRole('button', { name: 'Vérifier' })
  const actif = !(await bouton.isDisabled())
  if (actif) await toucher(e, bouton)
  await e.page.waitForTimeout(800)
  return actif
}
const segment = (page, i) => page.locator('[role=tablist][aria-label=Questions] [role=tab]').nth(i)
const capture = async (page, nom) => CAPTURES && page.screenshot({ path: `${CAPTURES}/reponses-${nom}.png` })

/** Ceinture en cours en haut de la séance */
async function ceintureAffichee(e, id) {
  const texte = await e.page.locator('main').evaluate((m) => m.parentElement.innerText)
  ok(texte.includes(`Ceinture blanche · Ceinture ${id}`), `${e.touche ? "telephone" : "bureau"} ${id} : ceinture en cours affichée en haut`, texte.slice(0, 200))
}

for (const appareil of (process.env.APPAREILS ?? "telephone,bureau").split(",")) {
  // 1. Liste déroulante (préfixes : déci, hecto, kilo…)
  {
    const id = 'liste'
    const e = await eleve(`${appareil} ${id}`, parcours(id, '5d1e2'), appareil)
    await ceintureAffichee(e, id)
    const att = await attendues(e, id)
    const choisir = async (valeur) => {
      const liste = e.page.locator('main liste-deroulante').first()
      const choix = JSON.parse(decodeURIComponent(await liste.getAttribute('choices'))).filter((c) => c.value !== '')
      await toucher(e, liste)
      await toucher(e, e.page.locator('main liste-deroulante [role=option]').nth(choix.findIndex((c) => c.value === valeur)))
      await e.page.waitForTimeout(500)
    }
    ok(await e.page.getByRole('button', { name: 'Vérifier' }).isDisabled(), `${appareil} liste : Vérifier inactif sans réponse`)
    await choisir(att[0].reponse.value)
    ok(await verifier(e), `${appareil} liste : Vérifier actif après le choix`)
    let s = await lireSeance(e.page, id)
    ok(s.essais.length === 1 && s.essais[0].juste, `${appareil} liste : bonne réponse comptée correcte`, JSON.stringify(s.essais))
    ok((await segment(e.page, 0).locator('span').getAttribute('class')).includes('bg-coopmaths-warn'), `${appareil} liste : segment vert pour une réponse correcte`)
    await capture(e.page, `${appareil}-liste`)
    // Question 2 : un choix faux, gardé en brouillon si l'on quitte la question
    await toucher(e, e.page.getByRole('button', { name: 'Question suivante' }))
    await e.page.waitForTimeout(800)
    const faux = JSON.parse(decodeURIComponent(await e.page.locator('main liste-deroulante').first().getAttribute('choices'))).find((c) => c.value !== '' && c.value !== att[1].reponse.value).value
    await choisir(faux)
    await toucher(e, segment(e.page, 0))
    await e.page.waitForTimeout(800)
    await toucher(e, segment(e.page, 1))
    await e.page.waitForTimeout(1500)
    ok((await e.page.locator('main liste-deroulante').first().evaluate((l) => l.value)) === faux, `${appareil} liste : choix gardé en brouillon`)
    ok(await verifier(e), `${appareil} liste : Vérifier actif sur le brouillon repris`)
    s = await lireSeance(e.page, id)
    ok(s.essais.length === 2 && !s.essais[1].juste, `${appareil} liste : mauvaise réponse comptée incorrecte`)
    ok((await segment(e.page, 1).locator('span').getAttribute('class')).includes('bg-red-600'), `${appareil} liste : segment rouge pour une réponse incorrecte`)
    await toucher(e, e.page.getByRole('button', { name: 'Voir le bilan' }))
    await e.page.waitForTimeout(1200)
    const bilan = await e.page.locator('body').innerText()
    ok(/1\s*\/\s*2|50\s*%/.test(bilan), `${appareil} liste : bilan 1 sur 2`, bilan.slice(0, 300))
    await e.ctx.close()
  }

  // 2. Champs multiples : arrondir puis encadrer une racine carrée
  {
    const id = 'racines'
    const e = await eleve(`${appareil} ${id}`, parcours(id, '516d2'), appareil)
    const att = await attendues(e, id)
    for (let q = 0; q < 2; q++) {
      const champs = e.page.locator('main multi-mathfield math-field')
      const n = await champs.count()
      ok(n === Object.keys(att[q]).filter((k) => k.startsWith('champ')).length, `${appareil} racines Q${q + 1} : ${n} champ(s)`)
      ok(await e.page.getByRole('button', { name: 'Vérifier' }).isDisabled(), `${appareil} racines Q${q + 1} : Vérifier inactif sans réponse`)
      for (let k = 0; k < n; k++) {
        await toucher(e, champs.nth(k))
        await e.page.keyboard.type(String(att[q][`champ${k + 1}`].value).replace('.', ','))
      }
      await e.page.waitForTimeout(500)
      ok(await verifier(e), `${appareil} racines Q${q + 1} : Vérifier actif après la saisie`)
      const s = await lireSeance(e.page, id)
      ok(s.essais[q]?.juste === true, `${appareil} racines Q${q + 1} : réponse correcte`, JSON.stringify(s.essais[q]))
      if (q === 0) {
        await capture(e.page, `${appareil}-racines`)
        await toucher(e, e.page.getByRole('button', { name: 'Question suivante' }))
        await e.page.waitForTimeout(1200)
      }
    }
    await e.ctx.close()
  }

  // 3. Glisser-déposer (décomposer un nombre) : au doigt sur téléphone, à la souris sur ordinateur
  {
    const id = 'glisser'
    const e = await eleve(`${appareil} ${id}`, parcours(id, '6498e'), appareil)
    const att = await attendues(e, id)
    const largeur = await e.page.evaluate(() => {
      const r = document.querySelector('main .rectangles')
      return { contenu: r.scrollWidth, visible: r.clientWidth, droite: Math.max(...[...r.querySelectorAll('.rectangleDND')].map((x) => x.getBoundingClientRect().right)) }
    })
    ok(largeur.contenu <= largeur.visible && largeur.droite <= (appareil === 'telephone' ? 390 : 1280), `${appareil} glisser : cases entièrement à l'écran`, JSON.stringify(largeur))
    const cdp = e.touche ? await e.ctx.newCDPSession(e.page) : null
    const centre = async (loc) => {
      const b = await loc.boundingBox()
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
    }
    const glisser = async (de, vers) => {
      if (!cdp) return de.dragTo(vers)
      const a = await centre(de)
      const b = await centre(vers)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
      for (let k = 1; k <= 8; k++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * k) / 8, y: a.y + ((b.y - a.y) * k) / 8 }] })
        await e.page.waitForTimeout(30)
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await e.page.waitForTimeout(300)
    }
    ok(await e.page.getByRole('button', { name: 'Vérifier' }).isDisabled(), `${appareil} glisser : Vérifier inactif sans réponse`)
    const cases = Object.keys(att[0]).filter((k) => k.startsWith('rectangle'))
    for (const c of cases) {
      const n = c.slice('rectangle'.length)
      await glisser(e.page.locator(`main .etiquettes #etiquetteEx0Q0I${att[0][c].value}`), e.page.locator(`main #rectangleEx0Q0R${n}`))
    }
    const remplies = await e.page.locator('main .rectangleDND .etiquette').count()
    ok(remplies === cases.length, `${appareil} glisser : ${remplies}/${cases.length} étiquettes déposées`)
    ok(await verifier(e), `${appareil} glisser : Vérifier actif après le dépôt`)
    const s = await lireSeance(e.page, id)
    ok(s.essais[0]?.juste === true, `${appareil} glisser : décomposition correcte`, JSON.stringify(s.essais[0]))
    await capture(e.page, `${appareil}-glisser`)
    await e.ctx.close()
  }

  // 4. Nombre écrit sans espaces (les espaces ne se tapent pas dans un champ MathLive)
  {
    const id = 'espaces'
    const e = await eleve(`${appareil} ${id}`, parcours(id, '7efdf'), appareil)
    const att = await attendues(e, id)
    const texte = await e.page.locator('main').innerText()
    ok(!/espaces/i.test(texte), `${appareil} espaces : la consigne ne demande plus les espaces`, texte.slice(0, 200))
    const champ = e.page.locator('main math-field').first()
    await toucher(e, champ)
    await e.page.keyboard.type(att[0].reponse.value.replace(/\\,/g, ''))
    await e.page.waitForTimeout(400)
    ok(await verifier(e), `${appareil} espaces : Vérifier actif`)
    const s = await lireSeance(e.page, id)
    ok(s.essais[0]?.juste === true, `${appareil} espaces : nombre sans espaces compté correct`, JSON.stringify(s.essais[0]))
    await e.ctx.close()
  }
}

// 5. Plusieurs réponses dans une question (QCM du vocabulaire des angles, PR !1) :
// chaque question vérifie ses propres réponses, pas celles d'une autre
for (const appareil of (process.env.APPAREILS ?? 'telephone,bureau').split(',')) {
  const id = 'plusieurs'
  const e = await eleve(`${appareil} ${id}`, parcours(id, 'e8d33'), appareil)
  const att = await attendues(e, id)
  for (let q = 0; q < 2; q++) {
    const cases = e.page.locator('main input[type=checkbox][id^=checkEx0Q]')
    const n = await cases.count()
    for (let k = 0; k < n; k++) {
      const [, rang, prop] = /checkEx0Q(\d+)R(\d+)/.exec(await cases.nth(k).getAttribute('id'))
      if (att[rang].statuts?.[prop]) await toucher(e, cases.nth(k))
    }
    await e.page.waitForTimeout(300)
    ok(await verifier(e), `${appareil} plusieurs Q${q + 1} : Vérifier actif`)
    const s = await lireSeance(e.page, id)
    ok(s.essais[q]?.juste === true, `${appareil} plusieurs Q${q + 1} : toutes les bonnes cases comptées correctes`, JSON.stringify(s.essais[q]))
    if (q === 0) {
      await toucher(e, e.page.getByRole('button', { name: 'Question suivante' }))
      await e.page.waitForTimeout(1200)
    }
  }
  await e.ctx.close()
}

// 6. Quitter une séance (« Reprendre plus tard ») ramène à l'accueil ; la séance reprend
{
  const e = await eleve('quitter', parcours('quitter', '5d1e2'), 'telephone')
  await e.page.getByRole('button', { name: 'Quitter' }).tap()
  await e.page.getByRole('button', { name: 'Reprendre plus tard' }).tap()
  await e.page.waitForTimeout(800)
  ok(await e.page.getByRole('button', { name: 'Réglages' }).isVisible(), 'quitter : « Reprendre plus tard » ramène à l’accueil')
  await e.page.getByRole('button', { name: /^\s*Réponses quitter/ }).first().tap()
  await e.page.waitForTimeout(800)
  const boutons = await e.page.getByRole('button').allInnerTexts()
  ok(boutons.some((b) => b.trim() === 'Vérifier'), 'quitter : la tuile de l’accueil reprend la séance', JSON.stringify(boutons))
  await e.ctx.close()
}

// 7. Thème sombre : vert pour une réponse correcte, orange de MathALÉA pour les boutons
{
  const e = await eleve('sombre', parcours('sombre', '5d1e2'), 'telephone', 'dark')
  const couleur = await e.page.getByRole('button', { name: 'Passer' }).evaluate((b) => getComputedStyle(b).color)
  ok(couleur === 'rgb(241, 89, 41)', 'sombre : boutons à l’orange de MathALÉA', couleur)
  await capture(e.page, 'sombre')
  await e.ctx.close()
}

ok(erreurs.length === 0, 'aucune erreur JavaScript', erreurs.join('\n'))
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
