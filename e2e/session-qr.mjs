// QR code de session (pnpm dev seulement, sans le serveur de dossier qui
// remplace l'Explorer). L'enseignant crée une session, affiche son QR code, la
// retrouve dans l'onglet En classe ; un élève qui n'a pas le parcours
// scanne le QR code (fausse caméra de Chromium) et arrive dans la session ; un
// élève dont l'app est plus ancienne est prévenu.
//   CAPTURES=<dossier> node e2e/session-qr.mjs
// Captures du guide (docs/guide/images/sessions-*.png) : GUIDE=docs/guide/images.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { rmSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'
import qrcode from 'qrcode-generator'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'session-qr-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcours = {
  id: 'session-qr-essai',
  version: 2,
  titre: 'Relatifs au tableau',
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [
    { uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 },
    { uuid: '36e2a', id: '5N2H', titre: 'Soustraire des relatifs', nbQuestions: 2 },
  ],
}

const lancer = (args = []) => chromium.launch({ executablePath: '/usr/bin/chromium', args })
const filtrer = (ctx) => ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))

async function contexte(nav, profil, explorer) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
  await filtrer(ctx)
  await ctx.addInitScript(
    ([profil, explorer]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('copie:profil', JSON.stringify(profil))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:explorer', JSON.stringify(explorer))
    },
    [profil, explorer],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${profil} : ${e.message}`))
  await page.goto(base)
  return page
}

/** Capture du guide avec un anneau autour de ce qu'on touche ensuite (comme reponses-session.mjs) */
async function guide(page, nomCapture, cible) {
  if (!process.env.GUIDE) return
  await page.waitForTimeout(500)
  if (cible) {
    const b = await cible.first().boundingBox()
    await page.evaluate((b) => {
      const marge = 5
      const anneau = document.createElement('div')
      anneau.id = 'repere-guide'
      Object.assign(anneau.style, {
        position: 'fixed', left: `${b.x - marge}px`, top: `${b.y - marge}px`, width: `${b.width + 2 * marge}px`, height: `${b.height + 2 * marge}px`,
        border: '3px solid var(--color-coopmaths-struct)', borderRadius: '14px', zIndex: 2147483647, pointerEvents: 'none',
      })
      const point = document.createElement('div')
      Object.assign(point.style, {
        position: 'absolute', left: '50%', top: '50%', width: '18px', height: '18px', margin: '-9px 0 0 -9px', borderRadius: '50%',
        background: 'color-mix(in srgb, var(--color-coopmaths-struct) 30%, transparent)', border: '2px solid var(--color-coopmaths-struct)',
      })
      anneau.append(point)
      document.body.append(anneau)
    }, b)
  }
  await page.screenshot({ path: join(process.env.GUIDE, `${nomCapture}.png`) })
  await page.evaluate(() => document.getElementById('repere-guide')?.remove())
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

// ---------- Enseignant : créer la session, afficher son QR code ----------
const navE = await lancer()
const prof = await contexte(navE, 'enseignant', [parcours])
await prof.getByRole('tab', { name: 'Explorer' }).or(prof.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
await prof.getByText('5e').first().click().catch(() => {})
await prof.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
await prof.getByRole('button', { name: /^Relatifs au tableau/ }).first().click({ timeout: 30_000 })
// Enseignant : un bouton visible sur la page du parcours, pas dans « Autres actions »
const boutonSession = prof.getByRole('button', { name: 'Session pour la classe' })
ok(await boutonSession.isVisible(), 'enseignant : « Session pour la classe » visible sur le parcours')
await guide(prof, 'sessions-1a-bouton', boutonSession)
await boutonSession.click()
ok(!(await prof.getByRole('button', { name: 'Commencer la session' }).count()), 'enseignant : pas de « Commencer la session », il ne fait pas la session')
await prof.getByRole('switch', { name: 'QR code des réponses pour l’enseignant' }).check()
const lancerSession = prof.getByRole('button', { name: 'Lancer la session' })
await lancerSession.click()
// Lancer mène directement à la page de la session : QR code et code
const qrPage = prof.locator('.qr-page')
await qrPage.waitFor()
const code = (await prof.locator('main .font-light').filter({ hasText: /^[2-9a-z]{5}$/ }).first().innerText()).trim()
ok(/^[2-9a-z]{5}$/.test(code) && (await prof.getByRole('heading', { name: 'Relatifs au tableau' }).isVisible()), `Lancer la session : page de la session, QR code et code ${code}`)
ok((await qrPage.boundingBox()).width > 250, 'QR code affiché sur la page de la session')
await guide(prof, 'sessions-2e-page')
await prof.screenshot({ path: `${captures}/session-qr-0-page.png` })
await prof.getByRole('button', { name: 'Plein écran', exact: true }).click()
const qr = prof.locator('.qr-session')
await qr.waitFor()
ok((await prof.locator('main', { has: qr }).innerText()).includes(code), 'QR code de la session en plein écran, avec son code')
ok((await qr.boundingBox()).width > 300, 'QR code assez grand pour être projeté')
await prof.screenshot({ path: `${captures}/session-qr-1-enseignant.png` })
// Image exportée (mail, drive) : c'est elle que l'élève scannera plus bas
const [telechargement] = await Promise.all([prof.waitForEvent('download'), prof.getByRole('button', { name: 'Exporter l’image' }).click()])
const imageQr = join(dossier, 'qr-session.png')
await telechargement.saveAs(imageQr)
await telechargement.saveAs(join(captures, 'session-qr-image.png'))
ok(telechargement.suggestedFilename() === `session-${code}.png` && readFileSync(imageQr).subarray(1, 4).toString() === 'PNG', `image exportée : ${telechargement.suggestedFilename()}`)
await prof.getByText('Image enregistrée.').waitFor()
await prof.goBack()
await prof.waitForTimeout(400)
ok(!(await qr.count()) && (await qrPage.isVisible()), 'retour : le plein écran se referme, la page de la session reste')
// Retour : onglet En classe, la session y est
await prof.goBack()
await prof.waitForTimeout(400)
ok((await prof.getByRole('tab', { name: 'En classe' }).getAttribute('aria-selected')) === 'true' && (await prof.getByRole('button', { name: /Relatifs au tableau/ }).isVisible()), 'retour : onglet En classe, avec la session')
await prof.reload()
await prof.getByRole('tab', { name: 'En classe' }).click({ timeout: 60_000 })
await prof.getByRole('button', { name: /Relatifs au tableau/ }).click()
await qrPage.waitFor()
ok((await prof.locator('main').innerText()).includes(code), 'En classe : la session et son QR code se réaffichent plus tard')
const invitation = await prof.evaluate(() => JSON.parse(localStorage.getItem('copie:releves'))[0].invitation)
ok(invitation?.startsWith('MASES1.'), 'session gardée avec son QR code')

// Même session, mais une app d'enseignant plus récente que celle de l'élève
const versB64 = (o) => Buffer.from(o).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const depuisB64 = (t) => new Uint8Array(Buffer.from(t.replace(/-/g, '+').replace(/_/g, '/'), 'base64'))
const contenu = JSON.parse(strFromU8(inflateSync(depuisB64(invitation.slice(7)))))
ok(contenu.c === code && contenu.p.id === parcours.id && contenu.p.version === 2 && /^\d{4}-\d{2}-\d{2}/.test(contenu.m), `QR code : code, parcours en version 2, version des exercices (${contenu.m})`)
const recente = 'MASES1.' + versB64(deflateSync(strToU8(JSON.stringify({ ...contenu, m: '2099-01-01+essai' })), { level: 9 }))
const q = qrcode(0, 'L')
q.addData(recente, 'Byte')
q.make()
const imageRecente = join(dossier, 'qr-recente.gif')
writeFileSync(imageRecente, Buffer.from(q.createDataURL(8, 16).split(',')[1], 'base64'))

// ---------- Élève qui n'a pas le parcours : scan, puis directement la session ----------
const navA = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageQr, 'a')}`])
const a = await contexte(navA, 'eleve', [])
await a.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
const scan = a.getByRole('button', { name: 'Scanner le QR code d’une session' })
await scan.waitFor({ timeout: 60_000 })
ok(!(await a.getByText('Relatifs au tableau').count()), 'élève : le parcours n’est pas dans son app')
await guide(a, 'sessions-2f-scanner', scan)
await a.screenshot({ path: `${captures}/session-qr-2-accueil-eleve.png` })
await scan.click()
await a.locator('main math-field').first().waitFor({ timeout: 60_000 })
const seance = await a.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), parcours.id)
ok(seance?.code === code && seance.contenu.version === 2 && seance.contenu.etapes.length === 2, `élève : image exportée scannée, dans la session ${seance?.code}, parcours en version 2`)
await a.screenshot({ path: `${captures}/session-qr-3-eleve-session.png` })
await a.getByRole('button', { name: /Quitter|Revenir en arrière/ }).first().click()
await a.waitForTimeout(800)
const ajoutes = await a.evaluate(() => JSON.parse(localStorage.getItem('copie:ajoutes') ?? '[]'))
ok(ajoutes.some((p) => p.id === parcours.id), 'élève : le parcours est ajouté à son accueil (bilan, QR code des réponses)')

// ---------- Élève dont l'app est plus ancienne que celle de l'enseignant ----------
const navB = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageRecente, 'b')}`])
const b = await contexte(navB, 'eleve', [])
await b.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
await b.getByRole('button', { name: 'Scanner le QR code d’une session' }).click({ timeout: 60_000 })
await b.getByText('Mets l’application à jour').waitFor({ timeout: 30_000 })
ok(true, 'app plus ancienne : l’élève est prévenu')
await guide(b, 'sessions-2g-ancienne', b.getByRole('button', { name: 'Continuer quand même' }))
await b.screenshot({ path: `${captures}/session-qr-4-ancienne.png` })
await b.getByRole('button', { name: 'Continuer quand même' }).click()
await b.locator('main math-field').first().waitFor({ timeout: 60_000 })
ok((await b.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`))?.code, parcours.id)) === code, 'Continuer quand même : dans la session')

// Thème sombre : accueil de l'élève et QR code de l'enseignant
await prof.evaluate(() => localStorage.setItem('theme', 'sombre'))
await prof.reload()
await prof.getByRole('tab', { name: 'En classe' }).click({ timeout: 60_000 })
await prof.screenshot({ path: `${captures}/session-qr-5-en-classe-sombre.png` })
await prof.getByRole('button', { name: /Relatifs au tableau/ }).click()
await qrPage.waitFor()
await prof.waitForTimeout(500)
await prof.screenshot({ path: `${captures}/session-qr-6-page-sombre.png` })

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await Promise.all([navE.close(), navA.close(), navB.close()])
// Vidéos et images de la fausse caméra : environ 200 Mo par passage
rmSync(dossier, { recursive: true, force: true })
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
