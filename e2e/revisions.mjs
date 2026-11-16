// Révisions espacées, parcourues comme un élève (pnpm dev seulement, sans le
// serveur de dossier qui remplace l'Explorer). Deux parcours de chapitres
// différents faits au clavier (l'un réussi, l'autre manqué), puis l'horloge du
// navigateur avance d'une semaine : séance de révision mélangée, bilan, écran
// des révisions, choix des chapitres et suivi des objectifs. Puis une
// évaluation préparée : parcours et jour choisis au toucher, séance sur ces
// parcours sans attendre les dates de révision, modification, arrêt, et fin
// d'office le lendemain de l'évaluation.
//   CAPTURES=<dossier> node e2e/revisions.mjs
// Captures du guide (docs/guide/images/revisions-*.png) : GUIDE=docs/guide/images.
import { chromium } from 'playwright'
import { join } from 'node:path'
import { pagePrete, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcours = (id, titre, theme, uuid, exo, objectif) => ({
  id,
  version: 1,
  titre,
  objectif: '',
  niveau: '5e',
  theme,
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  melanger: true,
  etapes: [{ uuid, id: exo, titre: `${exo} - ${objectif}`, nbQuestions: 2, objectifs: [objectif] }],
})
const additions = parcours('rev-additions', 'Additions de relatifs', 'Nombres relatifs', 'cbc26', '5N2G', 'Additionner des relatifs')
const soustractions = parcours('rev-soustractions', 'Soustractions de relatifs', 'Calcul littéral', '36e2a', '5N2H', 'Soustraire des relatifs')

// Ajouté à l'accueil sans être commencé : à finir avant l'évaluation
const multiplications = parcours('rev-multiplications', 'Multiplications de relatifs', 'Nombres relatifs', 'cbc26', '5N2G', 'Multiplier des relatifs')

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
await ctx.addInitScript((explorer) => {
  if (sessionStorage.getItem('pret')) return
  sessionStorage.setItem('pret', '1')
  localStorage.setItem('copie:profil', JSON.stringify('eleve'))
  localStorage.setItem('copie:pays', JSON.stringify('FR'))
  localStorage.setItem('copie:explorer', JSON.stringify(explorer))
}, [additions, soustractions, multiplications])
const page = await ctx.newPage()
page.on('pageerror', (e) => erreurs.push(e.message))
await page.clock.install({ time: new Date('2026-10-19T09:00:00') })
await page.goto(base)

/** Capture du guide avec un anneau autour de ce qu'on touche ensuite */
async function guide(nom, cible) {
  if (!process.env.GUIDE) return
  await pagePrete(page)
  if (cible) {
    const b = await cible.first().boundingBox()
    await page.evaluate((b) => {
      const anneau = document.createElement('div')
      anneau.id = 'repere-guide'
      Object.assign(anneau.style, {
        position: 'fixed', left: `${b.x - 5}px`, top: `${b.y - 5}px`, width: `${b.width + 10}px`, height: `${b.height + 10}px`,
        border: '3px solid var(--color-coopmaths-struct)', borderRadius: '14px', zIndex: 2147483647, pointerEvents: 'none',
      })
      document.body.append(anneau)
    }, b)
  }
  await page.screenshot({ path: join(process.env.GUIDE, `${nom}.png`) })
  await page.evaluate(() => document.getElementById('repere-guide')?.remove())
}

/** Réponse attendue par MathALÉA pour la question affichée (rang dans l'ordre mélangé) */
const reponseAttendue = (id, rang) =>
  page.evaluate(
    async ({ id, rang }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      const [e, q] = s.ordre[rang].split('-').map(Number)
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { id, rang },
  )

async function saisir(latex) {
  await page
    .waitForFunction(() => document.querySelectorAll('main math-field').length === 1 && !!document.querySelector('main math-field[data-listener-added]'), null, { timeout: 15_000 })
    .catch(() => {})
  for (let essai = 0; essai < 20; essai++) {
    const pris = await page
      .locator('main math-field')
      .last()
      .evaluate((el, v) => {
        el.setValue(v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        return el.value === v
      }, latex)
      .catch(() => false)
    if (pris && (await pagePrete(page), await page.locator('main math-field').last().evaluate((el, v) => el.value === v, latex).catch(() => false))) return
    await pagePrete(page)
  }
  throw new Error(`saisie impossible : ${latex}`)
}

/** Répond à `total` questions (fausses aux rangs de `faux`), en vérifiant chacune, jusqu'au bilan */
async function repondre(id, total, faux = []) {
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await pagePrete(page)
  for (let rang = 0; rang < total; rang++) {
    await saisir(faux.includes(rang) ? '999' : await reponseAttendue(id, rang))
    await page.getByRole('button', { name: 'Vérifier' }).click()
    await pagePrete(page)
    if (rang < total - 1) {
      const btn = page.getByRole('button', { name: 'Question suivante' })
      for (let essai = 0; essai < 20 && !(await page.getByText(`Question ${rang + 2} sur ${total}`).isVisible().catch(() => false)); essai++) {
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {})
        await pagePrete(page)
      }
    } else await page.getByRole('button', { name: 'Voir le bilan' }).click()
  }
  await page.getByText(new RegExp(`\\d+ / ${total}`)).first().waitFor({ timeout: 30_000 })
}

async function faireParcours(p, faux) {
  await page.getByRole('tab', { name: 'Explorer' }).click({ timeout: 60_000 })
  await page.getByText('5e').first().click().catch(() => {})
  await page.getByRole('button', { name: new RegExp(`^${p.titre}`) }).first().click({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Commencer' }).click()
  await repondre(p.id, 2, faux)
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click()
  await pagePrete(page)
}

const tuile = page.getByRole('button', { name: /^Révisions/ })
await page.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
ok(!(await tuile.count()), 'rien de terminé : pas de tuile Révisions')

// Lundi : additions réussies (100 %), soustractions manquées (0 %)
await faireParcours(additions, [])
await faireParcours(soustractions, [0, 1])
await page.getByRole('tab', { name: 'Mes parcours' }).click()
await tuile.waitFor()
ok((await tuile.innerText()).includes('Prochaine révision demain'), `après les parcours : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)

// Mardi : les soustractions manquées reviennent
await page.clock.setSystemTime(new Date('2026-10-20T09:00:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
ok((await tuile.innerText()).includes('À revoir aujourd’hui'), `le lendemain : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)

// Lundi suivant : les deux exercices sont à revoir
await page.clock.setSystemTime(new Date('2026-10-26T09:00:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
ok((await tuile.innerText()).includes('À revoir aujourd’hui') && !/\d+ exercice/.test(await tuile.innerText()), `une semaine plus tard, sans nombre en attente : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)
await guide('revisions-1-tuile', tuile)
await page.screenshot({ path: `${captures}/revisions-1-accueil.png` })
await tuile.click()
const main = page.locator('main')
const texteMain = async () => (await main.innerText()).replace(/\s+/g, ' ')
const commencer = page.getByRole('button', { name: 'Commencer', exact: true })
await commencer.waitFor()
const ecran = (await main.innerText()).replace(/\s+/g, ' ')
ok(ecran.includes('Combien de questions ?') && !/à revoir/.test(ecran), `écran des révisions : choix du nombre de questions, aucun stock affiché (${ecran.slice(0, 90)})`)
ok(ecran.includes('Nombres relatifs') && ecran.includes('Calcul littéral'), 'les deux chapitres sont proposés')
ok(await page.getByRole('radio', { name: '6' }).isChecked(), '6 questions par défaut')
await page.getByRole('radio', { name: '3' }).click()
ok((await page.getByRole('radio', { name: '3' }).isChecked()) && (await page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')).taille)) === 3, '3 questions choisies, et retenues')
await guide('revisions-2-ecran', commencer)
await page.screenshot({ path: `${captures}/revisions-2-ecran.png`, fullPage: true })

// Choix des chapitres : un seul, puis les deux
const interrupteur = page.getByRole('switch', { name: 'Réviser Calcul littéral' })
const autre = page.getByRole('switch', { name: 'Réviser Nombres relatifs' })
await interrupteur.uncheck()
await pagePrete(page)
ok((await page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')).sansChapitres))?.join() === '5e|Calcul littéral' && (await commencer.isVisible()), 'un chapitre décoché : seul l’autre est révisé')
await guide('revisions-3-chapitres', interrupteur)
await autre.uncheck()
await pagePrete(page)
ok((await texteMain()).includes('Rien à revoir aujourd’hui') && !(await commencer.isVisible()), 'aucun chapitre : rien à revoir')
await interrupteur.check()
await autre.check()
await pagePrete(page)
ok(await commencer.isVisible(), 'chapitres recochés')
const choix = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')).sansChapitres)
ok(choix === undefined, 'tous cochés : aucun filtre gardé (les nouveaux chapitres seront inclus)')

// Séance de révision : 4 questions mélangées, sans titre d'exercice
await commencer.click()
await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
await pagePrete(page)
const pendant = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
ok(!/5N2G|5N2H|Additionner des relatifs|Soustraire des relatifs/.test(pendant), 'pendant la révision : aucun titre d’exercice')
ok(pendant.includes('Question 1 sur 2'), 'une question par exercice (2 exercices à revoir, 3 demandées)')
await page.screenshot({ path: `${captures}/revisions-3-seance.png` })
const s = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:revisions')))
const ordre = s.ordre.map((k) => Number(k.split('-')[0]))
ok(ordre.every((e, i) => i === 0 || e !== ordre[i - 1]), `jamais deux questions du même exercice à la suite (${ordre.join(' ')})`)
// Soustractions réussies cette fois ; additions : une erreur
const rangAddition = ordre.findIndex((e) => s.contenu.etapes[e].uuid === 'cbc26')
await repondre('revisions', 2, [rangAddition])
const bilan = (await main.innerText()).replace(/\s+/g, ' ')
ok(bilan.includes('Additionner des relatifs') && bilan.includes('Soustraire des relatifs'), 'bilan : les titres sont dévoilés')
ok(bilan.includes('Revient demain') && bilan.includes('Revient dans 3 jours'), `bilan : quand chaque exercice reviendra (${bilan.match(/Revient [^A-Z]*/g)?.join(' | ')})`)
await guide('revisions-4-bilan', page.getByRole('button', { name: 'Terminer' }))
await page.screenshot({ path: `${captures}/revisions-4-bilan.png`, fullPage: true })
const etat = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('copie:revisions')).elements).map((e) => `${e.etape.uuid}:${e.boite}:${e.prochaine}`).sort())
// additions : boîte 3, manquée → 2, de retour dès le lendemain ; soustractions : boîte 1, réussie → 2 (3 jours)
ok(etat.join(' ') === '36e2a:2:2026-10-29 cbc26:2:2026-10-27', `boîtes après la révision : ${etat.join(' ')}`)
await page.getByRole('button', { name: 'Terminer' }).click()
await pagePrete(page)
const apres = (await main.innerText()).replace(/\s+/g, ' ')
ok(apres.includes('Rien à revoir aujourd’hui') && apres.includes('Prochaine révision demain'), `retour à l’écran des révisions : ${apres.slice(0, 70)}`)
await page.screenshot({ path: `${captures}/revisions-5-fait.png` })

// Suivi : les objectifs gardent leur chapitre et montrent leur solidité dans le temps
await page.getByRole('button', { name: 'Revenir en arrière' }).click()
await page.getByRole('tab', { name: 'Suivi' }).click()
await page.getByRole('tab', { name: /Objectifs/ }).click().catch(() => {})
await pagePrete(page)
const suivi = (await main.innerText()).replace(/\s+/g, ' ')
ok(suivi.includes('révision : à consolider') && !suivi.includes('Sans niveau'), `suivi : solidité affichée, chapitres gardés (${suivi.slice(0, 160)})`)
await page.screenshot({ path: `${captures}/revisions-6-suivi.png`, fullPage: true })

// ---------- Préparer une évaluation ----------
// Lundi 26 : rien n'est à revoir avant demain. L'évaluation de jeudi porte sur les additions seulement.
// (mardi : additions à revoir, soustractions réussies la veille mais pas ce jour-là : 2 questions)
const stock = () => page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')))
await page.getByRole('tab', { name: 'Mes parcours' }).click()
await tuile.click()
await pagePrete(page)
ok((await texteMain()).includes('Rien à revoir aujourd’hui'), 'avant la préparation : rien à revoir aujourd’hui')
await page.getByRole('button', { name: 'Préparer une évaluation' }).click()
await pagePrete(page)
const demarrer = page.getByRole('button', { name: 'Commencer la préparation' })
const choisir = (await page.locator('footer').innerText()).replace(/\s+/g, ' ')
ok((await demarrer.isDisabled()) && choisir.includes('À choisir : les parcours, le jour'), `rien de choisi : bouton éteint (${choisir})`)
const ecranChoix = await texteMain()
ok(['Nombres relatifs', 'Calcul littéral', 'Additions de relatifs', 'Soustractions de relatifs'].every((t) => ecranChoix.includes(t)), 'parcours rangés par chapitre')
await page.getByRole('switch', { name: 'Réviser Additions de relatifs' }).check()
await page.getByRole('button', { name: 'jeudi 29 octobre' }).click()
await pagePrete(page)
ok((await page.locator('footer').innerText()).replace(/\s+/g, ' ').includes('1 parcours · jeudi 29 octobre'), 'choix résumé au-dessus du bouton')
await guide('revisions-5-evaluation', demarrer)
await page.screenshot({ path: `${captures}/revisions-8-preparer.png`, fullPage: true })
const b = await demarrer.boundingBox()
ok(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('button'), [b.x + b.width / 2, b.y + b.height / 2]), 'bouton du bas touchable')
await demarrer.click()
await pagePrete(page)
let ecranEval = await texteMain()
ok(ecranEval.includes('Évaluation jeudi') && ecranEval.includes('Additions de relatifs') && !ecranEval.includes('Chapitres'), `écran de la préparation : ${ecranEval.slice(0, 80)}`)
ok(await commencer.isVisible(), 'une série est proposée sans attendre la date de révision')
ok((await stock()).evaluation?.parcours.join() === 'rev-additions' && (await stock()).evaluation?.date === '2026-10-29', 'évaluation retenue : parcours et jour')
await guide('revisions-6-preparation', commencer)
await page.screenshot({ path: `${captures}/revisions-9-preparation.png`, fullPage: true })
// La série ne porte que sur le parcours choisi
await commencer.click()
await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
await pagePrete(page)
const serie = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:revisions')).contenu.etapes.map((e) => e.uuid))
ok(serie.join() === 'cbc26', `série de l’évaluation : seulement les additions (${serie.join()})`)
await repondre('revisions', 1)
const bilanEval = (await main.innerText()).replace(/\s+/g, ' ')
ok(bilanEval.includes('Réussi aujourd’hui') && !bilanEval.includes('Revient'), `bilan de la série : ${bilanEval.match(/Réussi aujourd’hui|Revient [^A-Z]*/)?.[0]}`)
const additionsApres = Object.values((await stock()).elements).find((e) => e.etape.uuid === 'cbc26')
// Manquée le matin, réussie le même jour : elle reste à revoir demain, sa boîte ne monte pas
ok(additionsApres.boite === 2 && additionsApres.prochaine === '2026-10-27' && additionsApres.reussiLe === '2026-10-26', `réussi en avance : boîte ${additionsApres.boite}, à revoir le ${additionsApres.prochaine}`)
await page.getByRole('button', { name: 'Terminer' }).click()
await pagePrete(page)
ecranEval = await texteMain()
ok(ecranEval.includes('Tout est revu pour aujourd’hui') && (await page.getByRole('button', { name: 'Refaire une série' }).isVisible()), 'tout revu : une autre série reste possible')
await page.screenshot({ path: `${captures}/revisions-10-tout-revu.png`, fullPage: true })
// Modifier : bouton retour, puis un parcours de plus
await page.getByRole('button', { name: 'Modifier' }).click()
await pagePrete(page)
ok(await page.getByRole('switch', { name: 'Réviser Additions de relatifs' }).isChecked(), 'modifier : le choix est repris')
await page.goBack()
await pagePrete(page)
ok((await texteMain()).includes('Évaluation jeudi'), 'bouton retour : retour à la préparation, rien de changé')
await page.getByRole('button', { name: 'Modifier' }).click()
await page.getByRole('switch', { name: 'Réviser Soustractions de relatifs' }).check()
await page.getByRole('button', { name: 'Enregistrer' }).click()
await pagePrete(page)
ok((await stock()).evaluation?.parcours.length === 2 && (await texteMain()).includes('Soustractions de relatifs'), 'modifier : deux parcours')
// Accueil : la tuile annonce l'évaluation
await page.getByRole('button', { name: 'Revenir en arrière' }).click()
await pagePrete(page)
ok((await tuile.innerText()).includes('Évaluation jeudi'), `accueil : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)
ok(!(await page.getByRole('button', { name: 'Réviser pour l’évaluation' }).count()), 'tout est revu : l’accueil ne relance pas')
// Arrêter : annuler, puis confirmer
await tuile.click()
await page.getByRole('button', { name: 'Arrêter la préparation' }).click()
await page.getByRole('dialog').waitFor()
await page.screenshot({ path: `${captures}/revisions-11-arreter.png` })
await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click()
ok(!!(await stock()).evaluation, 'arrêter, annuler : la préparation reste')
await page.getByRole('button', { name: 'Arrêter la préparation' }).click()
await page.getByRole('dialog').getByRole('button', { name: 'Arrêter la préparation' }).click()
await pagePrete(page)
ok(!(await stock()).evaluation && (await texteMain()).includes('Chapitres'), 'arrêtée : révisions habituelles, chapitres de retour')
// Un parcours ajouté à l'accueil mais pas commencé peut être choisi : il est à finir avant l'évaluation
await page.getByRole('button', { name: 'Revenir en arrière' }).click()
await page.getByRole('tab', { name: 'Explorer' }).click()
await page.getByText('5e').first().click().catch(() => {})
await page.getByRole('button', { name: /^Ajouter « Multiplications de relatifs »/ }).click()
await pagePrete(page)
await page.getByRole('tab', { name: 'Mes parcours' }).click()
await tuile.click()
// Nouvelle préparation (tout le chapitre des relatifs et les soustractions, vendredi)
await page.getByRole('button', { name: 'Préparer une évaluation' }).click()
await pagePrete(page)
ok((await texteMain()).includes('Multiplications de relatifs Pas encore commencé'), 'parcours pas commencé : proposé, et signalé')
await page.getByRole('switch', { name: 'Tout le chapitre Nombres relatifs' }).check()
ok(
  (await page.getByRole('switch', { name: 'Réviser Additions de relatifs' }).isChecked()) && (await page.getByRole('switch', { name: 'Réviser Multiplications de relatifs' }).isChecked()),
  'tout le chapitre : ses deux parcours sont cochés',
)
await page.getByRole('switch', { name: 'Réviser Soustractions de relatifs' }).check()
await page.getByRole('button', { name: 'vendredi 30 octobre' }).click()
await page.screenshot({ path: `${captures}/revisions-16-preparer-chapitre.png`, fullPage: true })
await demarrer.click()
await pagePrete(page)
ecranEval = await texteMain()
ok(ecranEval.includes('3 parcours') && ecranEval.includes('À finir avant l’évaluation') && ecranEval.includes('Multiplications de relatifs Pas encore commencé'), 'préparation : le parcours pas commencé est à finir avant l’évaluation')
ok(!/Additions de relatifs|Soustractions de relatifs/.test(ecranEval.split('À finir avant l’évaluation')[1]), 'les parcours terminés ne sont pas dans « À finir »')
await page.screenshot({ path: `${captures}/revisions-17-a-finir.png`, fullPage: true })
await page.getByRole('button', { name: /^Multiplications de relatifs/ }).click()
await pagePrete(page)
ok(await page.getByRole('button', { name: 'Commencer' }).isVisible(), '« À finir » ouvre le parcours')
await page.getByRole('button', { name: 'Revenir en arrière' }).click()
await pagePrete(page)
ok(await tuile.isVisible(), 'retour du parcours : accueil')
await page.clock.setSystemTime(new Date('2026-10-27T09:00:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
const proposee = (await page.getByRole('region', { name: 'À faire maintenant' }).innerText()).replace(/\s+/g, ' ')
ok(proposee.includes('Évaluation vendredi · 2 questions') && proposee.includes('Réviser pour l’évaluation'), `le lendemain, action proposée : ${proposee}`)
await page.screenshot({ path: `${captures}/revisions-12-accueil-evaluation.png` })
// Vendredi, jour de l'évaluation : encore là ; samedi : la préparation a pris fin toute seule
await page.clock.setSystemTime(new Date('2026-10-30T07:30:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
ok((await tuile.innerText()).includes('Évaluation aujourd’hui'), `le jour même : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)
await page.clock.setSystemTime(new Date('2026-10-31T09:00:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
ok(!(await tuile.innerText()).includes('Évaluation') && !(await stock()).evaluation, `le lendemain de l’évaluation : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)

// Sombre
await page.evaluate(() => localStorage.setItem('theme', 'sombre'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
await tuile.click()
await pagePrete(page)
await page.screenshot({ path: `${captures}/revisions-7-ecran-sombre.png`, fullPage: true })
await page.getByRole('button', { name: 'Préparer une évaluation' }).click()
await page.getByRole('switch', { name: 'Réviser Additions de relatifs' }).check()
ok(await page.getByRole('button', { name: 'lundi 26 octobre' }).isDisabled(), 'un jour passé ne se choisit pas')
await page.getByRole('button', { name: 'mercredi 4 novembre' }).click()
await pagePrete(page)
await page.screenshot({ path: `${captures}/revisions-13-preparer-sombre.png`, fullPage: true })
// Fenêtre de bureau
await page.setViewportSize({ width: 1280, height: 800 })
await pagePrete(page)
const bb = await demarrer.boundingBox()
ok(bb && bb.y + bb.height <= 800 && bb.width < 1100, 'bureau : bouton du bas visible, dans la colonne')
await page.screenshot({ path: `${captures}/revisions-14-preparer-bureau-sombre.png` })
await demarrer.click()
await pagePrete(page)
await page.screenshot({ path: `${captures}/revisions-15-preparation-bureau-sombre.png` })

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
