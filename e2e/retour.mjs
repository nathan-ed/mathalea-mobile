// Bouton retour du téléphone (simulé par « précédent » du navigateur), élève
// (pnpm dev seulement). Chaque niveau se referme et ramène où il faut : page
// d'un parcours, fiche de cours, panneau du bas, onglets, Réglages ; la séance
// demande confirmation. Nathan (2026-10-20) : on repasse toujours par
// l'accueil, d'où seul le retour quitte l'app (aucune entrée en attente).
// L'enseignant : e2e/en-classe.mjs.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
let echecs = 0
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const parcours = demo.classes.flatMap((c) => c.parcours)
// Une fiche de cours sur la première ceinture, pour éprouver Cours
const ceintures = parcours.find((p) => p.id === 'relatifs-ceintures-5e')
ceintures.paliers[0].fiche = { titre: 'Additionner deux relatifs', avant: false, blocs: [{ type: 'retenir', texte: 'Deux nombres de même signe : on ajoute leurs distances à zéro.' }] }
const classe = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours }

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const erreurs = []
for (const [nomAppareil, options] of [
  ['téléphone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ['bureau', { viewport: { width: 1100, height: 800 } }],
]) {
  const ctx = await nav.newContext(options)
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((classe) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', '"eleve"')
    localStorage.setItem('copie:pays', '"FR"')
    localStorage.setItem('copie:classes', JSON.stringify([classe]))
  }, classe)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nomAppareil} : ${e.message}`))
  const retour = async () => {
    await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(400)
  }
  const visible = (role, name) => page.getByRole(role, { name }).first().isVisible()
  const ongletActif = () => page.locator('nav [role=tab][aria-selected=true]').innerText().then((t) => t.trim(), () => '')
  const surAccueil = async () => (await ongletActif()) === 'Mes parcours' && (await visible('button', /^\s*Nombres relatifs/))
  const enAttente = () => page.evaluate(() => JSON.stringify(history.state ?? {}).includes('"retour":true'))
  const n = (msg) => `${nomAppareil} : ${msg}`

  await page.goto(base)
  await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().waitFor({ timeout: 60_000 })
  ok(!(await enAttente()), n('accueil au lancement : aucune entrée de retour en attente'))

  // Page d'un parcours → accueil
  await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().click()
  await page.getByRole('button', { name: /Commencer|Continuer/ }).first().waitFor()
  await retour()
  ok(await surAccueil(), n('page du parcours → accueil'))
  ok(page.url() === base, n(`adresse inchangée (${page.url()})`))

  // Fiche de cours → page du parcours → accueil
  await page.getByRole('button', { name: /^\s*Relatifs en ceintures/ }).first().click()
  await page.getByRole('button', { name: /^\s*Fiche :/ }).first().click()
  await page.getByText('Deux nombres de même signe').first().waitFor()
  await retour()
  ok(await visible('button', /^\s*Fiche :/), n('fiche de cours → page du parcours'))
  await retour()
  ok(await surAccueil(), n('puis → accueil'))

  // Panneau du bas : refermé d'abord, l'écran reste
  await page.getByRole('button', { name: /^\s*Relatifs en ceintures/ }).first().click()
  await page.getByRole('button', { name: 'Autres actions' }).first().click()
  await page.locator('.feuille').waitFor()
  await retour()
  ok(!(await page.locator('.feuille').count()) && (await visible('button', 'Autres actions')), n('panneau du bas refermé, la page du parcours reste'))
  await retour()
  ok(await surAccueil(), n('puis → accueil'))

  // Onglets : Explorer et Suivi ramènent à Mes parcours
  for (const nom of ['Explorer', 'Suivi']) {
    await page.getByRole('tab', { name: nom }).click()
    await page.waitForTimeout(300)
    await retour()
    ok(await surAccueil(), n(`onglet ${nom} → Mes parcours`))
  }

  // Explorer : sous-niveau (Teste ton niveau), puis l'onglet, puis l'accueil
  await page.getByRole('tab', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: /^\s*Teste ton niveau/ }).click()
  await page.waitForTimeout(400)
  await retour()
  ok((await ongletActif()) === 'Explorer' && (await visible('button', /^\s*Teste ton niveau/)), n('Teste ton niveau → Explorer'))
  await retour()
  ok(await surAccueil(), n('Explorer → Mes parcours'))

  // Séance : retour demande confirmation, un second retour la referme
  await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().click()
  await page.getByRole('button', { name: /Commencer|Continuer/ }).first().click()
  await page.locator('main math-field, main input').first().waitFor({ timeout: 60_000 })
  await retour()
  ok(await page.getByText('Quitter l’activité ?').isVisible(), n('séance : confirmation au retour'))
  await retour()
  ok(!(await page.getByText('Quitter l’activité ?').isVisible()) && (await page.locator('main math-field, main input').first().isVisible()), n('séance : second retour, on reste dans la séance'))
  await retour()
  await page.getByRole('button', { name: 'Reprendre plus tard' }).click()
  await page.waitForTimeout(400)
  ok(await surAccueil(), n('séance laissée → accueil'))

  // Réglages → accueil
  await page.getByRole('button', { name: 'Réglages' }).first().click()
  await page.getByRole('heading', { name: 'Sauvegarde' }).waitFor()
  await retour()
  ok(await surAccueil(), n('Réglages → accueil'))
  ok(!(await enAttente()), n('accueil : aucune entrée de retour en attente, le retour suivant quitte l’app'))
  await ctx.close()
}
ok(erreurs.length === 0, `aucune erreur JavaScript${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
