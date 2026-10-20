// Onglet En classe de l'enseignant (pnpm dev seulement) : nouvelle session
// depuis l'onglet ou depuis un parcours, « Lancer la session » mène à sa page,
// et le bouton retour repasse toujours par l'accueil (Créer) avant de quitter
// l'app. Un élève n'a pas l'onglet. Captures : CAPTURES=<dossier>.
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
  id: 'en-classe-essai', version: 1, titre: 'Relatifs au tableau', objectif: '', niveau: '5e', theme: 'Nombres relatifs', difficulte: 1, icone: 'bx-math',
  presentation: 'une_question_par_page', correction: 'question',
  etapes: [{ uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 }],
}

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
async function ouvrir(profil, sombre = false) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: sombre ? 'dark' : 'light' })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(
    ([p, profil]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('copie:profil', JSON.stringify(profil))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:explorer', JSON.stringify([p]))
      localStorage.setItem('copie:ajoutes', JSON.stringify([p]))
    },
    [parcours, profil],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${profil} : ${e.message}`))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
  return page
}
const actif = (page) => page.locator('nav [role=tab][aria-selected=true]').innerText().then((t) => t.trim(), () => '')
const sentinelle = (page) => page.evaluate(() => !!history.state?.['sveltekit:states']?.retour)
const retour = async (page) => {
  await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(400)
}

for (const sombre of [false, true]) {
  const suffixe = sombre ? '-sombre' : ''
  const t = await ouvrir('enseignant', sombre)
  ok((await actif(t)) === 'Créer', `${suffixe || 'clair'} : l'enseignant arrive sur Créer`)
  ok(!(await t.getByRole('button', { name: /Sessions partagées/ }).count()), 'plus de « Sessions partagées » dans Créer')

  // Nouvelle session depuis l'onglet
  await t.getByRole('tab', { name: 'En classe' }).click()
  await t.waitForTimeout(300)
  await t.screenshot({ path: `${captures}/en-classe-1-onglet${suffixe}.png` })
  await t.getByRole('button', { name: 'Nouvelle session' }).click()
  await t.getByRole('dialog').getByRole('button', { name: /Relatifs au tableau/ }).click()
  await t.getByRole('switch', { name: /QR code des réponses/ }).check()
  await t.waitForTimeout(300)
  await t.screenshot({ path: `${captures}/en-classe-2-reglage${suffixe}.png` })
  await t.getByRole('button', { name: 'Lancer la session' }).click()
  await t.locator('.qr-page').waitFor()
  await t.waitForTimeout(300)
  ok((await t.getByRole('heading', { name: 'Relatifs au tableau' }).isVisible()) && (await t.getByRole('button', { name: 'Lire les QR codes' }).isVisible()), 'Nouvelle session → page de la session (QR code, lecture des réponses)')
  await t.screenshot({ path: `${captures}/en-classe-3-session${suffixe}.png` })

  // Retours : En classe, puis Créer (accueil), puis l'app se ferme
  await retour(t)
  ok((await actif(t)) === 'En classe' && (await t.locator('main ul > li').count()) === 1, 'retour : En classe, la session listée')
  await t.screenshot({ path: `${captures}/en-classe-4-liste${suffixe}.png` })
  await retour(t)
  ok((await actif(t)) === 'Créer' && !(await sentinelle(t)), 'retour : Créer, accueil de l’enseignant (le retour suivant quitte)')

  // Depuis un parcours de Mes parcours
  await t.getByRole('tab', { name: 'Mes parcours' }).click()
  await t.getByRole('button', { name: /^\s*Relatifs au tableau/ }).first().click()
  await t.getByRole('button', { name: 'Session pour la classe' }).click()
  await t.getByRole('button', { name: 'Lancer la session' }).click()
  await t.locator('.qr-page').waitFor()
  ok((await t.locator('main').innerText()).includes('Sans QR code des réponses'), 'Session pour la classe → Lancer → page de la session')
  await retour(t)
  ok((await actif(t)) === 'En classe' && (await t.locator('main ul > li').count()) === 2, 'retour : En classe, deux sessions')
  // Explorer, Suivi, Mes parcours : retour vers Créer, jamais hors de l'app
  for (const o of ['Mes parcours', 'Explorer', 'Suivi']) {
    await t.getByRole('tab', { name: o }).click()
    await retour(t)
    ok((await actif(t)) === 'Créer', `${o} : retour vers Créer`)
  }
  // Retours rapprochés (double appui) : on s'arrête à Créer
  await t.getByRole('tab', { name: 'Mes parcours' }).click()
  await t.getByRole('button', { name: /^\s*Relatifs au tableau/ }).first().click()
  await t.waitForTimeout(400)
  await t.goBack({ waitUntil: 'commit' }).catch(() => {})
  await t.waitForTimeout(60)
  await t.goBack({ waitUntil: 'commit' }).catch(() => {})
  await t.waitForTimeout(600)
  ok((await actif(t)) === 'Créer', `double retour rapide depuis un parcours : Créer (${await actif(t)})`)
  await t.context().close()
}

// Élève : ni En classe ni Créer, retour vers Mes parcours
const e = await ouvrir('eleve')
ok(!(await e.getByRole('tab', { name: 'En classe' }).count()) && !(await e.getByRole('tab', { name: 'Créer' }).count()), 'élève : pas d’onglet En classe ni Créer')
await e.getByRole('tab', { name: 'Suivi' }).click()
await retour(e)
ok((await actif(e)) === 'Mes parcours' && !(await sentinelle(e)), 'élève : Suivi → Mes parcours, accueil')

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
