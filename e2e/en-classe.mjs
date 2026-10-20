// Onglets de l'enseignant (pnpm dev seulement) : Parcours, Classes, En classe,
// Explorer. Nouvelle session depuis En classe (classe choisie, sessions rangées
// par classe) ou depuis un parcours de la vue élève ; « Lancer la session » mène
// à sa page ; le bouton retour repasse toujours par l'accueil (Parcours) avant
// de quitter l'app, et sort de la vue élève. Un élève n'a que ses onglets.
// Captures : CAPTURES=<dossier>.
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
      localStorage.setItem('copie:bibliotheque', JSON.stringify({ classes: [{ nom: '5e A' }, { nom: '5e B' }], parcours: [{ parcours: p, classes: ['5e B'], exportee: {} }] }))
    },
    [parcours, profil],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${profil} : ${e.message}`))
  await page.goto(base)
  await page.locator('nav [role=tab]').first().waitFor({ timeout: 60_000 })
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
  const onglets = (await t.locator('nav [role=tab]').allInnerTexts()).map((x) => x.trim()).join(',')
  ok(onglets === 'Parcours,Classes,En classe,Explorer', `${suffixe || 'clair'} : onglets de l'enseignant (${onglets})`)
  ok((await actif(t)) === 'Parcours', 'l’enseignant arrive sur Parcours')
  ok(!(await t.getByRole('button', { name: /Sessions partagées/ }).count()), 'plus de « Sessions partagées » dans Parcours')

  // Nouvelle session depuis l'onglet
  await t.getByRole('tab', { name: 'En classe' }).click()
  await t.waitForTimeout(300)
  await t.screenshot({ path: `${captures}/en-classe-1-onglet${suffixe}.png` })
  await t.getByRole('button', { name: 'Nouvelle session' }).click()
  await t.getByRole('dialog').getByRole('button', { name: /Relatifs au tableau/ }).click()
  // Classe proposée : la seule qui reçoit le parcours
  ok((await t.getByRole('radio', { name: '5e B' }).getAttribute('aria-checked')) === 'true' && (await t.getByRole('radio', { name: '5e A' }).getAttribute('aria-checked')) === 'false', 'classe proposée : celle du parcours (5e B)')
  await t.getByRole('switch', { name: /QR code des réponses/ }).check()
  await t.waitForTimeout(300)
  await t.screenshot({ path: `${captures}/en-classe-2-reglage${suffixe}.png` })
  await t.getByRole('button', { name: 'Lancer la session' }).click()
  await t.locator('.qr-page').waitFor()
  await t.waitForTimeout(300)
  ok((await t.getByRole('heading', { name: 'Relatifs au tableau' }).isVisible()) && (await t.getByRole('button', { name: 'Lire les QR codes' }).isVisible()) && (await t.locator('main').innerText()).includes('5e B · QR code'), 'Nouvelle session → page de la session (classe, QR code, lecture des réponses)')
  await t.screenshot({ path: `${captures}/en-classe-3-session${suffixe}.png` })

  // Retours : En classe, puis Créer (accueil), puis l'app se ferme
  await retour(t)
  ok((await actif(t)) === 'En classe' && (await t.locator('main ul > li').count()) === 1 && (await t.getByRole('heading', { name: '5e B' }).isVisible()), 'retour : En classe, la session rangée sous 5e B')
  await t.screenshot({ path: `${captures}/en-classe-4-liste${suffixe}.png` })
  await retour(t)
  ok((await actif(t)) === 'Parcours' && !(await sentinelle(t)), 'retour : Parcours, accueil de l’enseignant (le retour suivant quitte)')

  // Classes : les sessions de la classe
  await t.getByRole('tab', { name: 'Classes' }).click()
  await t.getByRole('tab', { name: '5e B' }).click()
  ok(await t.getByRole('heading', { name: 'Sessions de 5e B' }).isVisible(), 'onglet Classes : les sessions de 5e B')
  await t.screenshot({ path: `${captures}/en-classe-5-classes${suffixe}.png` })
  await t.getByRole('button', { name: /^\s*Relatifs au tableau.*Session/ }).click()
  await t.locator('.qr-page').waitFor()
  await retour(t)
  ok((await actif(t)) === 'Classes', 'session ouverte depuis Classes : retour à Classes')

  // Vue élève : Mes parcours et Suivi, puis Session pour la classe sur un parcours
  await t.getByRole('tab', { name: 'Parcours' }).click()
  await t.getByRole('button', { name: /^\s*Vue élève/ }).click()
  await t.waitForTimeout(300)
  const ongletsEleve = (await t.locator('nav [role=tab]').allInnerTexts()).map((x) => x.trim()).join(',')
  ok(ongletsEleve === 'Mes parcours,Explorer,Suivi' && (await t.getByText('Vue élève : l’app comme vos élèves la voient').isVisible()), `vue élève : onglets des élèves et bandeau (${ongletsEleve})`)
  await t.screenshot({ path: `${captures}/en-classe-6-vue-eleve${suffixe}.png` })
  await t.getByRole('button', { name: /^\s*Relatifs au tableau/ }).first().click()
  await t.getByRole('button', { name: 'Session pour la classe' }).click()
  await t.getByRole('radio', { name: '5e A' }).click()
  await t.getByRole('button', { name: 'Lancer la session' }).click()
  await t.locator('.qr-page').waitFor()
  ok((await t.locator('main').innerText()).includes('5e A · Sans QR code des réponses'), 'Session pour la classe (vue élève) → page de la session, classe 5e A')
  await retour(t)
  ok((await actif(t)) === 'En classe' && (await t.getByRole('heading', { name: '5e A' }).isVisible()) && (await t.getByRole('heading', { name: '5e B' }).isVisible()), 'retour : En classe, sessions rangées par classe')
  // Classes, En classe, Explorer : retour vers Parcours, jamais hors de l'app
  for (const o of ['Classes', 'En classe', 'Explorer']) {
    await t.getByRole('tab', { name: o }).click()
    await retour(t)
    ok((await actif(t)) === 'Parcours', `${o} : retour vers Parcours`)
  }
  // Vue élève : Suivi → Mes parcours → sortie de la vue élève (Parcours)
  await t.getByRole('button', { name: /^\s*Vue élève/ }).click()
  await t.getByRole('tab', { name: 'Suivi' }).click()
  await retour(t)
  ok((await actif(t)) === 'Mes parcours', 'vue élève : Suivi → Mes parcours')
  await retour(t)
  ok((await actif(t)) === 'Parcours' && !(await t.getByText('Vue élève : l’app comme vos élèves la voient').count()), 'vue élève : retour → espace enseignant (Parcours)')
  // « Quitter » du bandeau
  await t.getByRole('button', { name: /^\s*Vue élève/ }).click()
  await t.getByRole('button', { name: 'Quitter', exact: true }).click()
  ok((await actif(t)) === 'Parcours', 'bandeau « Quitter » : espace enseignant')
  // Retours rapprochés (double appui) depuis un parcours de la vue élève : on s'arrête à Parcours
  await t.getByRole('button', { name: /^\s*Vue élève/ }).click()
  await t.getByRole('button', { name: /^\s*Relatifs au tableau/ }).first().click()
  await t.waitForTimeout(400)
  await t.goBack({ waitUntil: 'commit' }).catch(() => {})
  await t.waitForTimeout(60)
  await t.goBack({ waitUntil: 'commit' }).catch(() => {})
  await t.waitForTimeout(600)
  ok((await actif(t)) === 'Parcours', `double retour rapide depuis un parcours de la vue élève : Parcours (${await actif(t)})`)
  await t.context().close()
}

// Élève : ni En classe ni Créer, retour vers Mes parcours
const e = await ouvrir('eleve')
ok((await e.locator('nav [role=tab]').allInnerTexts()).map((x) => x.trim()).join(',') === 'Mes parcours,Explorer,Suivi', 'élève : Mes parcours, Explorer, Suivi seulement')
await e.getByRole('tab', { name: 'Suivi' }).click()
await retour(e)
ok((await actif(e)) === 'Mes parcours' && !(await sentinelle(e)), 'élève : Suivi → Mes parcours, accueil')

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
