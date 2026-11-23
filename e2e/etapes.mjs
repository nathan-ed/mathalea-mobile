// Réponse en plusieurs étapes (possible-multi-lines-answer de MathALÉA, MR !10087
// de Rémi, novembre 2026) : l'élève détaille son calcul ligne par ligne avec le
// bouton ⊕. En vérification « à chaque étape » (valeur par défaut des exercices
// de calcul littéral), chaque ligne est corrigée dès son ajout puis verrouillée ;
// la question vaut 2 points, 1 si le résultat est juste malgré une étape fausse.
// Vérifié comme un élève, avec 3L11-3 (développer et réduire) :
// - téléphone (clair), correction à chaque question : étape fausse barrée,
//   verrouillée et sans bouton pour l'effacer ; elle revient après un
//   rechargement (brouillon) ; la question compte 1 / 2, les autres 2 / 2 ;
//   demi-point écrit avec une virgule (« 0,5/3 », « 2,5 / 3 ») ; couleurs et
//   taille du ⊕ de l'app ;
// - bureau (sombre), correction à la fin : les lignes de chaque question
//   survivent au changement de question et à la soumission, la relecture les
//   montre, le bilan compte 2,5 / 3.
//   CAPTURES=<dossier> node e2e/etapes.mjs   (app construite servie sur 1420, ou BASE)
import { chromium } from 'playwright'
import { jusqua, pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const CAPTURES = process.env.CAPTURES
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
  return cond
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

// Vert et orange de MathALÉA (vertMathalea, orangeMathalea) : ceux des pastilles « Correcte » / « Incorrecte »
const VERT = 'rgb(77, 134, 19)'
const ORANGE = 'rgb(241, 89, 41)'

const parcoursDe = (correction) => ({
  id: `etapes-${correction}`,
  version: 1,
  titre: 'Développer en plusieurs étapes',
  objectif: '',
  niveau: '3e',
  theme: 'Calcul littéral',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction,
  etapes: [{ uuid: '82313', id: '3L11-3', titre: 'Utiliser la distributivité et réduire', nbQuestions: 3 }],
})

async function eleve(nom, p, bureau) {
  const ctx = await nav.newContext(
    bureau ? { viewport: { width: 1280, height: 800 }, colorScheme: 'dark' } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'light' },
  )
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  const donnees = { profil: 'eleve', pays: 'FR', classes: [{ lien: 'http://127.0.0.1:9/etapes/', nom: '3A', disponibles: ['3A'], parcours: [p] }] }
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, donnees)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  await page.goto(base)
  await pagePrete(page)
  const toucher = async (cible) => {
    await pointStable(cible)
    await (bureau ? cible.click() : cible.tap())
    await pagePrete(page)
  }
  await toucher(page.getByRole('button', { name: /^\s*Développer en plusieurs étapes/ }).first())
  await toucher(page.getByRole('button', { name: /^Commencer/ }).first())
  await page.locator('main .question-eleve').first().waitFor({ timeout: 60_000 })
  await pagePrete(page)

  // Réponses attendues : l'exercice régénéré à part (même graine, même numéro), moteur seul
  const s0 = await page.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), p.id)
  const calcul = await (await nav.newContext()).newPage()
  await calcul.goto(`${base}moteur/manifest.json`)
  const attendues = await calcul.evaluate(
    async ({ etape, graine }) => {
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      await m.initialiser()
      const ex = await m.preparerExercice({ ...etape, alea: graine }, 0)
      return ex.interne.autoCorrection.map((a) => {
        const v = a?.valeur?.reponse?.value
        return String(Array.isArray(v) ? v[0] : v)
      })
    },
    { etape: s0.contenu.etapes[0], graine: s0.graines[0] },
  )
  await calcul.context().close()

  const question = () => page.locator('main .question-eleve').first()
  const champFinal = () => question().locator('[data-pmla-final] math-field')
  /** Touche le champ puis saisit l'expression comme le clavier de MathALÉA (insertion LaTeX) */
  const saisir = async (champ, latex) => {
    for (let essai = 0; ; essai++) {
      await (bureau ? champ.click() : champ.tap())
      try {
        await jusqua(() => champ.evaluate((el) => el.getRootNode().activeElement === el || document.activeElement === el), { timeout: 2_000, quoi: 'focus du champ' })
        break
      } catch (err) {
        if (essai >= 4) throw err
      }
    }
    await champ.evaluate((el, l) => el.executeCommand(['insert', l]), latex)
    await pagePrete(page)
  }
  /** Touche ⊕ et attend la nouvelle ligne */
  const ajouterLigne = async () => {
    const avant = await lignes().then((l) => l.length)
    const plus = question().locator('[data-pmla-add]')
    for (let essai = 0; essai < 3 && (await lignes()).length === avant; essai++) await toucher(plus)
    ok((await lignes()).length === avant + 1, `${nom} : ⊕ ajoute une ligne`)
  }
  const lignes = () =>
    question().evaluate((z) =>
      [...z.querySelectorAll('[data-pmla-lines] > .pmla-line')].map((l) => {
        const champ = l.querySelector('math-field')
        const marque = l.querySelector('[data-pmla-result]')
        return {
          valeur: champ?.value ?? '',
          marque: marque?.textContent ?? '',
          couleur: marque ? getComputedStyle(marque).color : '',
          barree: l.classList.contains('pmla-barre'),
          verrouillee: !!champ?.readOnly,
          effacable: !!l.querySelector('.pmla-remove'),
        }
      }),
    )
  const suivant = async (nom) => toucher(page.locator('footer').getByRole('button', { name: nom }).first())
  const seance = () => page.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), p.id)
  const capture = async (nomCapture) => CAPTURES && page.screenshot({ path: `${CAPTURES}/etapes-${nomCapture}-${bureau ? 'sombre' : 'clair'}.png` })
  return { ctx, page, attendues, toucher, question, champFinal, saisir, ajouterLigne, lignes, suivant, seance, capture }
}

const sansEspace = (t) => t.replace(/\s+/g, ' ')

// ---------- Téléphone (clair), correction à chaque question ----------
{
  const nom = 'téléphone'
  const e = await eleve(nom, parcoursDe('question'), false)
  const { page } = e
  ok((await e.question().locator('possible-multi-lines-answer[bareme="etapes"]').count()) === 1, `${nom} : réponse en plusieurs étapes, vérifiée à chaque étape`)
  // Le ⊕ se touche du doigt : au moins 40 px de côté
  const plus = await e.question().locator('[data-pmla-add]').boundingBox()
  ok(plus && plus.width >= 40 && plus.height >= 40, `${nom} : ⊕ assez grand pour le doigt`, JSON.stringify(plus))
  await e.capture('1-question')

  // Q1 : une étape fausse, puis le bon résultat
  await e.saisir(e.champFinal(), '0')
  await e.ajouterLigne()
  let l = await e.lignes()
  ok(l.length === 1 && l[0].marque === '✗' && l[0].barree, `${nom} : étape fausse barrée et marquée ✗`, JSON.stringify(l))
  ok(l[0]?.couleur === ORANGE, `${nom} : ✗ à l'orange de MathALÉA`, l[0]?.couleur)
  ok(l[0]?.verrouillee && !l[0]?.effacable, `${nom} : étape fausse verrouillée, sans bouton pour l'effacer`, JSON.stringify(l))
  const motif = await e.question().locator('[data-pmla-pourquoi]').first()
  ok((await motif.evaluate((x) => getComputedStyle(x).color)) === ORANGE, `${nom} : message de l'étape fausse à l'orange de MathALÉA`)
  await e.saisir(e.champFinal(), e.attendues[0])
  await e.capture('2-etape-fausse')

  // Rechargement avant de vérifier : l'étape fausse revient, toujours barrée et verrouillée
  // Brouillon qui porte l'étape et le résultat (celui d'avant le ⊕ n'a qu'une ligne)
  const lignesDuBrouillon = async () => Object.values((await e.seance()).brouillons ?? {}).map((b) => b['possible-multi-lines-answerEx0Q0']).find(Boolean)
  await jusqua(async () => (await lignesDuBrouillon()) === JSON.stringify(['0', e.attendues[0]]), { quoi: 'brouillon des deux lignes' })
  await page.reload()
  await e.question().waitFor({ timeout: 60_000 })
  await pagePrete(page)
  l = await e.lignes()
  ok(l.length === 1 && l[0].valeur === '0' && l[0].barree && l[0].verrouillee && !l[0].effacable, `${nom} : étape fausse retrouvée après rechargement`, JSON.stringify(l))
  ok((await e.champFinal().evaluate((c) => c.value)) === e.attendues[0], `${nom} : résultat retrouvé après rechargement`)

  await e.toucher(page.getByRole('button', { name: 'Vérifier' }).first())
  let s = await e.seance()
  let essai = s.essais.find((x) => x.question === 0)
  ok(essai && !essai.juste && essai.points === 1 && essai.total === 2, `${nom} : résultat juste malgré une étape fausse, 1 point sur 2`, JSON.stringify(essai))
  ok(sansEspace(await page.locator('main').innerText()).includes('Score : 1 / 2'), `${nom} : « Score : 1 / 2 » sous la question`)
  const entete = sansEspace(await page.locator('header').innerText())
  ok(entete.includes('0,5/3'), `${nom} : demi-point avec une virgule dans l'en-tête (0,5/3)`, entete)
  const coche = e.question().locator('[data-pmla-final] [id^="resultatCheck"]')
  ok((await coche.evaluate((x) => getComputedStyle(x).color)) === VERT, `${nom} : coche du résultat au vert de MathALÉA`)
  await e.capture('3-verifiee')

  // Q2 : une étape juste, puis le résultat : 2 / 2
  await e.suivant('Question suivante')
  await e.saisir(e.champFinal(), e.attendues[1])
  await e.ajouterLigne()
  l = await e.lignes()
  ok(l.length === 1 && l[0].marque === '✓' && !l[0].barree && l[0].couleur === VERT, `${nom} : étape juste cochée en vert`, JSON.stringify(l))
  await e.saisir(e.champFinal(), e.attendues[1])
  await e.toucher(page.getByRole('button', { name: 'Vérifier' }).first())
  essai = (await e.seance()).essais.find((x) => x.question === 1)
  ok(essai?.juste && essai.points === 2 && essai.total === 2, `${nom} : étapes et résultat justes, 2 points sur 2`, JSON.stringify(essai))
  ok((await e.question().getByText('Correcte', { exact: true }).count()) === 1, `${nom} : pastille « Correcte »`)

  // Q3 : résultat donné directement
  await e.suivant('Question suivante')
  await e.saisir(e.champFinal(), e.attendues[2])
  await e.toucher(page.getByRole('button', { name: 'Vérifier' }).first())
  essai = (await e.seance()).essais.find((x) => x.question === 2)
  ok(essai?.juste && essai.points === 2, `${nom} : résultat direct, 2 points sur 2`, JSON.stringify(essai))

  await e.suivant('Voir le bilan')
  await jusqua(async () => !(await page.locator('main .question-eleve').count()), { quoi: 'arrivée au bilan' })
  await pagePrete(page)
  const bilan = sansEspace(await page.locator('main').innerText())
  ok(/2,5 \/ 3/.test(bilan) && bilan.includes('83 %'), `${nom} : bilan 2,5 / 3 et 83 %`, bilan.slice(0, 300))
  ok(!/\d\.\d/.test(bilan), `${nom} : aucun nombre à point décimal au bilan`, bilan.slice(0, 300))
  await e.capture('4-bilan')
  await e.ctx.close()
}

// ---------- Bureau (sombre), correction à la fin ----------
{
  const nom = 'bureau'
  const e = await eleve(nom, parcoursDe('parcours'), true)
  const { page } = e
  await e.saisir(e.champFinal(), '0')
  await e.ajouterLigne()
  await e.saisir(e.champFinal(), e.attendues[0])
  await e.capture('5-correction-a-la-fin')
  await e.suivant('Question suivante')
  await e.saisir(e.champFinal(), e.attendues[1])
  await e.ajouterLigne()
  await e.saisir(e.champFinal(), e.attendues[1])
  await e.suivant('Question suivante')
  await e.saisir(e.champFinal(), e.attendues[2])
  await e.suivant('Soumettre la tentative')
  const garde = page.getByRole('button', { name: /quand même$/ })
  ok(!(await garde.count()), `${nom} : aucun garde-fou, tout est répondu`)
  const voirBilan = page.locator('footer').getByRole('button', { name: 'Voir le bilan' })
  await voirBilan.waitFor({ timeout: 60_000 })
  await pagePrete(page)
  const s = await e.seance()
  const pts = [0, 1, 2].map((q) => s.essais.find((x) => x.question === q)).map((x) => (x ? `${x.points}/${x.total}` : '?'))
  ok(pts.join(' ') === '1/2 2/2 2/2', `${nom} : chaque question comptée après la soumission (1/2, 2/2, 2/2)`, pts.join(' '))
  // Relecture : les lignes de chaque question, marquées
  const relues = await page.evaluate(() =>
    [...document.querySelectorAll('main possible-multi-lines-answer')].map((el) =>
      [...el.querySelectorAll('.pmla-line')].map((l) => (l.querySelector('math-field')?.value ?? '') + ' ' + (l.querySelector('[data-pmla-result], [id^="resultatCheck"]')?.textContent ?? '').trim()),
    ),
  )
  ok(relues[0]?.length === 2 && relues[0][0] === '0 ✗' && relues[0][1].endsWith('✓'), `${nom} : la relecture montre l'étape fausse et le résultat`, JSON.stringify(relues))
  ok(relues[1]?.length === 2 && relues[1][0].endsWith('✓') && relues[1][1].endsWith('Correcte'), `${nom} : la relecture montre l'étape juste`, JSON.stringify(relues))
  await e.capture('6-relecture')
  await e.toucher(voirBilan)
  const bilan = sansEspace(await page.locator('main').innerText())
  ok(/2,5 \/ 3/.test(bilan), `${nom} : bilan 2,5 / 3`, bilan.slice(0, 300))
  await e.capture('7-bilan')
  await e.ctx.close()
}

ok(erreurs.length === 0, 'aucune erreur de page', erreurs.slice(0, 5).join('\n'))
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
