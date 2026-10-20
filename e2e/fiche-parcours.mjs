// Page d'un parcours pour l'enseignant (pnpm dev seulement) : la tuile de la
// bibliothèque ouvre la page du parcours ; classes au toucher, état de
// publication, Essayer, Modifier, Lancer une session, Autres actions ; chaque
// retour revient à la page, puis à Créer. Captures : CAPTURES=<dossier>.
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const parcours = {
  id: 'fiche-essai', version: 1, titre: 'Relatifs express', objectif: 'Additionner des relatifs sans hésiter.', niveau: '5e', theme: 'Nombres relatifs', difficulte: 2, icone: 'bx-math',
  presentation: 'une_question_par_page', correction: 'question',
  etapes: [
    { uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 },
    { uuid: '36e2a', id: '5N2H', titre: 'Soustraire des relatifs', nbQuestions: 2 },
  ],
}
const bibliotheque = { lien: 'https://kdrive.infomaniak.com/app/share/1/essai', classes: [{ nom: '5e A' }, { nom: '5e B' }], parcours: [{ parcours, classes: ['5e A'], exportee: { '5e A': 1 } }] }

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
for (const sombre of [false, true]) {
  const s = sombre ? '-sombre' : ''
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: sombre ? 'dark' : 'light' })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((bib) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('enseignant'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
    localStorage.setItem('copie:bibliotheque', JSON.stringify(bib))
  }, bibliotheque)
  const t = await ctx.newPage()
  t.on('pageerror', (e) => erreurs.push(e.message))
  await t.goto(base)
  const retour = async () => {
    await t.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
    await t.waitForTimeout(400)
  }
  const surFiche = () => t.getByRole('button', { name: 'Lancer une session' }).isVisible()
  const ouvrirFiche = async () => {
    await t.getByRole('button', { name: /^\s*Relatifs express/ }).first().click({ timeout: 60_000 })
    await t.getByRole('button', { name: 'Lancer une session' }).waitFor()
    await t.waitForTimeout(300)
  }

  await ouvrirFiche()
  const texte = (await t.locator('main').innerText()).replace(/\s+/g, ' ')
  ok(texte.includes('V1 publiée pour 5e A') && texte.includes('5N2G') && texte.includes('Additionner des relatifs sans hésiter.'), `${sombre ? 'sombre' : 'clair'} : la tuile ouvre la page du parcours (état, exercices, but)`)
  await t.screenshot({ path: `${captures}/fiche-1${s}.png` })

  // Classes au toucher : 5e B ajoutée, donc à publier pour elle
  await t.getByRole('button', { name: '5e B' }).click()
  await t.waitForTimeout(200)
  ok((await t.getByRole('button', { name: '5e B' }).getAttribute('aria-pressed')) === 'true' && (await t.locator('main').innerText()).includes('V1 à publier pour 5e B'), '5e B touchée : donnée à la classe, à publier')
  const classes = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')).parcours[0].classes)
  ok(classes.join() === '5e A,5e B', `bibliothèque enregistrée (${classes})`)
  await t.getByRole('button', { name: 'Nouvelle classe' }).click()
  await t.getByLabel('Nom de la classe').fill('5e C')
  await t.getByRole('button', { name: 'Donner à cette classe' }).click()
  await t.waitForTimeout(300)
  ok((await t.getByRole('button', { name: '5e C' }).getAttribute('aria-pressed')) === 'true', 'nouvelle classe 5e C créée et cochée')
  await t.screenshot({ path: `${captures}/fiche-2-classes${s}.png` })

  // Essayer : l'aperçu, puis retour à la page
  await t.getByRole('button', { name: 'Essayer' }).click()
  await t.locator('main math-field').first().waitFor({ timeout: 60_000 })
  ok(true, 'Essayer : le parcours comme un élève')
  await retour()
  ok(await surFiche(), 'retour de l’essai : page du parcours')

  // Modifier : l'éditeur, retour sans rien changer, puis Valider après un changement
  await t.getByRole('button', { name: 'Modifier' }).click()
  await t.getByRole('heading', { name: 'Modifier le parcours' }).waitFor()
  await retour()
  ok(await surFiche(), 'retour de l’éditeur : page du parcours')

  // Lancer une session : page de la session, retour à la page du parcours, session listée
  await t.getByRole('button', { name: 'Lancer une session' }).click()
  await t.getByRole('button', { name: 'Lancer la session' }).click()
  await t.locator('.qr-page').waitFor()
  ok(true, 'Lancer une session : page de la session')
  await retour()
  ok((await surFiche()) && (await t.locator('main').innerText()).includes('Session '), 'retour de la session : page du parcours, la session y est listée')
  await t.screenshot({ path: `${captures}/fiche-3-sessions${s}.png` })

  // Autres actions
  await t.getByRole('button', { name: 'Autres actions' }).click()
  ok(
    (await t.getByRole('button', { name: 'Exporter ce parcours seul' }).isVisible()) && (await t.getByRole('button', { name: 'Dupliquer' }).isVisible()) && (await t.getByRole('button', { name: 'Supprimer le parcours' }).isVisible()),
    'Autres actions : exporter, dupliquer, supprimer',
  )
  await t.screenshot({ path: `${captures}/fiche-4-actions${s}.png` })
  await retour()

  // Retour : Créer, accueil de l'enseignant
  await retour()
  ok((await t.locator('nav [role=tab][aria-selected=true]').innerText()).trim() === 'Créer', 'retour de la page : Créer')

  // Classes : la tuile ouvre aussi la page ; suppression confirmée
  await t.getByRole('tab', { name: 'Classes' }).click()
  await ouvrirFiche()
  await t.getByRole('button', { name: 'Autres actions' }).click()
  await t.getByRole('button', { name: 'Supprimer le parcours' }).click()
  ok(await t.getByText('Supprimer « Relatifs express » ?').isVisible(), 'suppression : confirmation d’abord')
  await t.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await t.waitForTimeout(400)
  ok(!(await t.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')).parcours.length)), 'parcours supprimé, retour à Créer')
  await ctx.close()
}
// Sans dossier partagé : rien n'arrive aux élèves, la page le dit
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((bib) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('enseignant'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
    localStorage.setItem('copie:bibliotheque', JSON.stringify({ ...bib, lien: undefined }))
  }, bibliotheque)
  const t = await ctx.newPage()
  await t.goto(base)
  await t.getByRole('button', { name: /^\s*Relatifs express/ }).first().click({ timeout: 60_000 })
  await t.getByRole('button', { name: 'Lancer une session' }).waitFor()
  ok((await t.locator('main').innerText()).includes('Drive pas encore configuré : les élèves ne le reçoivent pas.'), 'sans dossier partagé : « Drive pas encore configuré » sur la page')
  await ctx.close()
}
ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
