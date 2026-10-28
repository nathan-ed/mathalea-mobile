// QR code de classe (pnpm dev). L'enseignant affiche le QR code d'une de ses
// classes ; un élève qui n'a rien ajouté le scanne (fausse caméra de
// Chromium) : le dossier partagé est ajouté, sa classe déjà choisie, sans lien
// à saisir. Une classe absente du drive est signalée sans rien ajouter.
//   CAPTURES=<dossier> node e2e/classe-qr.mjs
import { chromium } from 'playwright'
import { execFileSync, spawn } from 'node:child_process'
import { rmSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'classe-qr-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcoursDe = (id, titre) => ({
  id,
  version: 1,
  titre,
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [{ uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 }],
})
const pA = parcoursDe('classe-qr-a', 'Relatifs de la 5A')
const pB = parcoursDe('classe-qr-b', 'Relatifs de la 5B')

// Dossier partagé de l'enseignant : deux classes dans le même fichier
const drive = join(dossier, 'drive')
mkdirSync(drive)
writeFileSync(
  join(drive, 'parcours-mathalea.json'),
  JSON.stringify({ format: 'classes-mathalea/1', exporteLe: new Date().toISOString(), classes: [{ nom: '5A', parcours: [pA] }, { nom: '5B', parcours: [pB] }] }),
)
const port = 8713
const serveur = spawn('python3', ['-I', '-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', drive], { stdio: 'ignore' })
const lien = `http://127.0.0.1:${port}/`
await new Promise((r) => setTimeout(r, 800))

const lancer = (args = []) => chromium.launch({ executablePath: '/usr/bin/chromium', args })
const filtrer = (ctx) => ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))

async function contexte(nav, profil, bibliotheque) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
  await filtrer(ctx)
  await ctx.addInitScript(
    ([profil, bibliotheque]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('copie:profil', JSON.stringify(profil))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:explorer', JSON.stringify([]))
      if (bibliotheque) localStorage.setItem('copie:bibliotheque', JSON.stringify(bibliotheque))
    },
    [profil, bibliotheque],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${profil} : ${e.message}`))
  await page.goto(base)
  return page
}

/** Vidéo de la fausse caméra : une image de QR code, filmée en continu */
function videoDe(image, nom) {
  const fond = join(dossier, `${nom}.png`)
  execFileSync('python3', [
    '-I', '-c',
    `
import sys
from PIL import Image
fond = Image.new('RGB', (1280, 720), (90, 90, 95))
qr = Image.open(sys.argv[1]).convert('RGB')
qr.thumbnail((640, 640))
fond.paste(qr, ((1280 - qr.width) // 2, (720 - qr.height) // 2))
fond.save(sys.argv[2])
`,
    image, fond,
  ])
  const video = join(dossier, `${nom}.y4m`)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-t', '4', '-i', fond, '-vf', 'fps=15,format=yuv420p', video])
  return video
}

// ---------- Enseignant : QR code de la classe 5B ----------
const bibliotheque = {
  lien,
  classes: [{ nom: '5A' }, { nom: '5B' }, { nom: '5C' }],
  parcours: [
    { parcours: pA, classes: ['5A'], exportee: { '5A': 1 } },
    { parcours: pB, classes: ['5B'], exportee: { '5B': 1 } },
  ],
}
const navE = await lancer()
const prof = await contexte(navE, 'enseignant', bibliotheque)
await prof.getByRole('tab', { name: 'Classes' }).click({ timeout: 60_000 })
await prof.getByRole('tab', { name: '5B' }).click()
const boutonQr = prof.getByRole('button', { name: 'QR code de la classe 5B' })
ok(await boutonQr.isVisible(), 'enseignant : bouton du QR code à côté du nom de la classe')
await prof.screenshot({ path: `${captures}/classe-qr-0-classe.png` })
await boutonQr.click()
const qr = prof.locator('.qr-session')
await qr.waitFor()
ok((await qr.boundingBox()).width > 300 && (await prof.locator('main', { has: qr }).innerText()).includes('5B'), 'QR code de la classe en plein écran, avec son nom')
await prof.screenshot({ path: `${captures}/classe-qr-1-enseignant.png` })
const [telechargement] = await Promise.all([prof.waitForEvent('download'), prof.getByRole('button', { name: 'Exporter l’image' }).click()])
const imageB = join(dossier, 'qr-5b.png')
await telechargement.saveAs(imageB)
ok(telechargement.suggestedFilename() === 'classe-5B.png' && readFileSync(imageB).subarray(1, 4).toString() === 'PNG', `image exportée : ${telechargement.suggestedFilename()}`)
await prof.goBack()
await prof.waitForTimeout(400)
ok(!(await qr.count()) && (await prof.getByRole('tab', { name: '5B' }).isVisible()), 'retour : le QR code se referme, la classe reste affichée')
// Aussi dans les actions de la classe ; 5C n'est pas encore sur le drive
await prof.getByRole('tab', { name: '5C' }).click()
await prof.getByRole('button', { name: 'Actions sur la classe 5C' }).click()
await prof.getByRole('button', { name: 'QR code pour les élèves' }).click()
await qr.waitFor()
const [t2] = await Promise.all([prof.waitForEvent('download'), prof.getByRole('button', { name: 'Exporter l’image' }).click()])
const imageC = join(dossier, 'qr-5c.png')
await t2.saveAs(imageC)
ok(true, 'actions de la classe : « QR code pour les élèves »')
await prof.goBack()
await prof.waitForTimeout(400)
// QR code du dossier entier : dans la fiche « Dossier partagé » de l'onglet Parcours
await prof.getByRole('tab', { name: 'Parcours' }).click()
await prof.getByRole('button', { name: /^Dossier partagé/ }).click()
await prof.getByRole('button', { name: 'QR code pour les élèves' }).click()
await qr.waitFor()
ok((await prof.locator('main', { has: qr }).innerText()).includes('Toutes les classes'), 'dossier partagé : QR code du dossier entier')
await prof.screenshot({ path: `${captures}/classe-qr-1b-dossier.png` })
const [t3] = await Promise.all([prof.waitForEvent('download'), prof.getByRole('button', { name: 'Exporter l’image' }).click()])
const imageD = join(dossier, 'qr-dossier.png')
await t3.saveAs(imageD)
ok(t3.suggestedFilename() === 'dossier-mathalea.png', `image exportée : ${t3.suggestedFilename()}`)
// Sans dossier partagé : pas de QR code de classe (rien à ajouter chez l'élève)
await prof.evaluate(() => {
  const b = JSON.parse(localStorage.getItem('copie:bibliotheque'))
  delete b.lien
  localStorage.setItem('copie:bibliotheque', JSON.stringify(b))
})
await prof.reload()
await prof.getByRole('tab', { name: 'Classes' }).click({ timeout: 60_000 })
ok(!(await prof.getByRole('button', { name: /^QR code de la classe/ }).count()), 'sans dossier partagé : pas de QR code de classe')

// ---------- Élève sans aucune classe : scan, puis directement la 5B ----------
const navA = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageB, 'a')}`])
const a = await contexte(navA, 'eleve')
await a.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
const scan = a.getByRole('button', { name: 'Scanner le QR code d’une session ou d’une classe' })
await scan.waitFor({ timeout: 60_000 })
await a.screenshot({ path: `${captures}/classe-qr-2-accueil-eleve.png` })
await scan.click()
await a.getByText('Relatifs de la 5B').first().waitFor({ timeout: 30_000 })
const classes = await a.evaluate(() => JSON.parse(localStorage.getItem('copie:classes') ?? '[]'))
ok(classes.length === 1 && classes[0].lien === lien && classes[0].nom === '5B', `élève : dossier ajouté, classe ${classes[0]?.nom} choisie`)
ok(!(await a.getByText('Relatifs de la 5A').count()) && !(await a.getByRole('dialog').count()), 'élève : seulement les parcours de sa classe, scanner refermé')
await a.screenshot({ path: `${captures}/classe-qr-3-eleve.png` })
await a.reload()
await a.getByText('Relatifs de la 5B').first().waitFor({ timeout: 30_000 })
ok(true, 'élève : la classe reste après un nouveau lancement')

// ---------- Élève : QR code du dossier entier, puis choix de sa classe ----------
const navD = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageD, 'd')}`])
const d = await contexte(navD, 'eleve')
await d.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
await d.getByRole('button', { name: 'Scanner le QR code d’une session ou d’une classe' }).click({ timeout: 60_000 })
await d.getByRole('button', { name: '5A', exact: true }).first().waitFor({ timeout: 30_000 })
let cd = await d.evaluate(() => JSON.parse(localStorage.getItem('copie:classes') ?? '[]'))
ok(cd.length === 1 && cd[0].lien === lien && cd[0].nom === '' && cd[0].disponibles.join() === '5A,5B', 'dossier entier : dossier ajouté, l’élève choisit sa classe')
await d.screenshot({ path: `${captures}/classe-qr-3b-choix.png` })
await d.getByRole('button', { name: '5A', exact: true }).first().click()
await d.getByText('Relatifs de la 5A').first().waitFor({ timeout: 30_000 })
cd = await d.evaluate(() => JSON.parse(localStorage.getItem('copie:classes') ?? '[]'))
ok(cd[0]?.nom === '5A' && !(await d.getByText('Relatifs de la 5B').count()), 'dossier entier : classe 5A choisie, ses parcours seulement')

// ---------- Élève : classe pas encore sur le drive ----------
const navC = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageC, 'c')}`])
const c = await contexte(navC, 'eleve')
await c.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
await c.getByRole('button', { name: 'Scanner le QR code d’une session ou d’une classe' }).click({ timeout: 60_000 })
await c.getByText('La classe 5C n’est pas encore sur le drive de l’enseignant.').waitFor({ timeout: 30_000 })
await c.screenshot({ path: `${captures}/classe-qr-4-absente.png` })
await c.getByRole('button', { name: 'Annuler' }).click()
ok(!(await c.evaluate(() => JSON.parse(localStorage.getItem('copie:classes') ?? '[]').length)), 'classe absente du drive : l’élève est prévenu, rien n’est ajouté')

// Thème sombre : QR code de la classe
await prof.evaluate(() => {
  localStorage.setItem('theme', 'sombre')
  const b = JSON.parse(localStorage.getItem('copie:bibliotheque'))
  localStorage.setItem('copie:bibliotheque', JSON.stringify({ ...b, lien: 'http://127.0.0.1:8713/' }))
})
await prof.reload()
await prof.getByRole('tab', { name: 'Classes' }).click({ timeout: 60_000 })
await prof.getByRole('button', { name: /^QR code de la classe/ }).click()
await qr.waitFor()
await prof.waitForTimeout(400)
await prof.screenshot({ path: `${captures}/classe-qr-5-sombre.png` })

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await Promise.all([navE.close(), navA.close(), navC.close(), navD.close()])
serveur.kill()
rmSync(dossier, { recursive: true, force: true })
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
