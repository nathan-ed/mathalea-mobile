// Signaler un problème dans un parcours (App Store, règle 1.2 : les parcours viennent du drive
// de n'importe quel enseignant). Page du parcours › Autres actions › Signaler
// un problème (bug, erreur, contenu inapproprié) : le mail à contact@coopmaths.fr porte le contenu du parcours ;
// « Cacher ce parcours » le retire de l'accueil (Parcours cachés). Contact dans
// les Réglages. Téléphone (clair) et bureau (sombre), bouton retour.
//   CAPTURES=<dossier> node e2e/signalement.mjs
import { chromium } from 'playwright'
import { pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const parcours = {
  id: 'signalement-essai', version: 4, titre: 'Relatifs express', objectif: 'Additionner des relatifs.', niveau: '5e', theme: 'Nombres relatifs', difficulte: 1, icone: 'bx-math',
  presentation: 'une_question_par_page', correction: 'question', auteurs: ['Ana'],
  etapes: [{ uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 }],
}
const LIEN = 'https://kdrive.infomaniak.com/app/share/1/essai'
const appareils = [
  { nom: 'téléphone clair', theme: 'clair', options: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  { nom: 'bureau sombre', theme: 'sombre', options: { viewport: { width: 1280, height: 800 } } },
]
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const texte = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
async function toucher(page, cible) {
  await pagePrete(page)
  await cible.first().scrollIntoViewIfNeeded()
  await pointStable(cible.first())
  await cible.first().click()
  await pagePrete(page)
}

for (const a of appareils) {
  const ctx = await nav.newContext({ locale: 'fr-FR', ...a.options })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(
    ([theme, classe]) => {
      // Liens ouverts hors de l'app (navigateur, messagerie) : relevés, pas ouverts
      window.__ouverts = []
      window.open = (url) => (window.__ouverts.push(String(url)), null)
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      for (const [k, v] of Object.entries({ profil: 'eleve', pays: 'FR', explorer: [], classes: [classe] })) localStorage.setItem(`copie:${k}`, JSON.stringify(v))
    },
    [a.theme, { lien: LIEN, nom: '5e A', disponibles: ['5e A'], parcours: [parcours] }],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${a.nom} : ${e.message}`))
  await page.goto(base)
  const tuile = page.getByRole('button', { name: /^\s*Relatifs express/ })
  await tuile.first().waitFor({ timeout: 60_000 })
  await toucher(page, tuile)
  await toucher(page, page.getByRole('button', { name: 'Autres actions' }))
  await toucher(page, page.getByRole('button', { name: 'Signaler un problème' }))
  ok((await texte(page)).includes('contact@coopmaths.fr'), `${a.nom} : panneau du signalement, adresse de l’équipe écrite`)
  await page.screenshot({ path: `${captures}/signalement-1-${a.theme}.png` })
  await toucher(page, page.getByRole('button', { name: 'Écrire le signalement' }))
  const ouverts = await page.evaluate(() => window.__ouverts)
  const mail = ouverts.find((u) => u.startsWith('mailto:'))
  const corps = mail ? new URLSearchParams(mail.slice(mail.indexOf('?') + 1)).get('body') : ''
  ok(mail?.startsWith('mailto:contact@coopmaths.fr?subject='), `${a.nom} : mail à contact@coopmaths.fr`, ouverts.join(' | '))
  ok(corps.includes('Identifiant : signalement-essai, version 4') && corps.includes(LIEN) && corps.includes('classe 5e A') && corps.includes('Additionner des relatifs (5N2G)'), `${a.nom} : le mail contient le parcours et sa provenance`, corps)
  // Bouton retour : le panneau se referme, la page du parcours reste
  await page.goBack({ waitUntil: 'commit' }).catch(() => {})
  await pagePrete(page)
  ok(!(await page.getByRole('button', { name: 'Écrire le signalement' }).count()) && (await page.getByRole('button', { name: 'Autres actions' }).isVisible()), `${a.nom} : retour referme le panneau`)
  // Signaler un exercice pendant l'activité : drapeau de l'en-tête, mail avec
  // l'uuid, les paramètres, la graine, la plateforme et le moteur
  await toucher(page, page.getByRole('button', { name: 'Commencer', exact: true }))
  const drapeau = page.getByRole('button', { name: 'Signaler un problème dans cet exercice' })
  await drapeau.first().waitFor({ timeout: 60_000 })
  await toucher(page, drapeau)
  await page.screenshot({ path: `${captures}/signalement-3-exercice-${a.theme}.png` })
  await page.evaluate(() => (window.__ouverts.length = 0))
  await toucher(page, page.getByRole('button', { name: 'Écrire le signalement' }))
  const mailEx = (await page.evaluate(() => window.__ouverts)).find((u) => u.startsWith('mailto:')) ?? ''
  const corpsEx = new URLSearchParams(mailEx.slice(mailEx.indexOf('?') + 1)).get('body') ?? ''
  const seanceEx = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:signalement-essai') ?? 'null'))
  const graineEx = seanceEx?.graines?.[0]
  ok(
    mailEx.startsWith('mailto:contact@coopmaths.fr?subject=') &&
      ['UUID : cbc26', 'Référence : 5N2G', 'nbQuestions = 2', 'Exercice 1, question 1', 'Moteur MathALÉA : ', 'Plateforme : ', 'Navigateur intégré : Mozilla', 'Ce qui ne va pas', 'https://coopmaths.fr/alea/?uuid=cbc26'].every((t) => corpsEx.includes(t)) &&
      !!graineEx,
    `${a.nom} : mail d’un exercice avec uuid, paramètres, plateforme et moteur`,
    corpsEx,
  )
  // Graine absente : l'élève ne peut pas rouvrir son tirage sur le site pour y lire la correction
  ok(!corpsEx.includes(graineEx) && !corpsEx.includes('alea='), `${a.nom} : aucune graine dans le mail`, corpsEx)
  ok(!(await page.getByRole('button', { name: 'Écrire le signalement' }).count()), `${a.nom} : le panneau se referme après l’envoi`)
  // Bouton retour : referme le panneau sans quitter l'activité
  await toucher(page, drapeau)
  await page.goBack({ waitUntil: 'commit' }).catch(() => {})
  await pagePrete(page)
  ok(!(await page.getByRole('button', { name: 'Écrire le signalement' }).count()) && (await drapeau.first().isVisible()), `${a.nom} : retour referme le panneau de l’exercice`)
  await page.screenshot({ path: `${captures}/signalement-4-seance-${a.theme}.png` })
  // Quitter en supprimant la tentative (une tentative en cours se reprendrait
  // d'un toucher sur la tuile), puis rouvrir la page du parcours
  await toucher(page, page.getByRole('button', { name: 'Quitter' }))
  await toucher(page, page.getByRole('button', { name: 'Supprimer la tentative' }))
  await toucher(page, page.getByRole('button', { name: 'Supprimer', exact: true }))
  // On arrive à la page du parcours ou à l'accueil selon l'origine de l'activité
  const actions = page.getByRole('button', { name: 'Autres actions' })
  await actions.or(tuile.first()).first().waitFor({ timeout: 30_000 })
  if (!(await actions.count())) await toucher(page, tuile)
  await page.getByRole('button', { name: 'Autres actions' }).waitFor({ timeout: 30_000 })
  // Cacher : retour à l'accueil, rangé dans « Parcours cachés »
  await toucher(page, page.getByRole('button', { name: 'Autres actions' }))
  await toucher(page, page.getByRole('button', { name: 'Signaler un problème' }))
  await toucher(page, page.getByRole('button', { name: 'Cacher ce parcours' }))
  await page.getByRole('button', { name: /Parcours cachés/ }).waitFor({ timeout: 30_000 })
  const caches = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:caches') ?? '[]'))
  ok(caches.includes(parcours.id) && /Parcours cachés · 1/.test(await texte(page)), `${a.nom} : parcours caché, rangé en bas de l’accueil`)
  await page.screenshot({ path: `${captures}/signalement-2-cache-${a.theme}.png` })
  // Contact dans les Réglages
  await toucher(page, page.getByRole('button', { name: 'Réglages' }))
  ok((await texte(page)).includes('Contact, bug ou contenu à signaler : contact@coopmaths.fr'), `${a.nom} : contact dans les Réglages`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
