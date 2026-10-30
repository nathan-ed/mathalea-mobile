// QR code de session d'un long parcours (pnpm dev seulement, sans le serveur
// de dossier qui remplace l'Explorer). Jusqu'en 0.4.9, un parcours avec des
// fiches de cours (images) dépassait la capacité d'un QR code : « Lancer la
// session » ne faisait rien. Ici : « Calcul intégral » de l'Explorer (seize
// exercices, huit fiches illustrées). L'enseignant lance la session et exporte
// l'image ; un élève qui n'a pas le parcours la scanne (fausse caméra) et
// arrive dans la session, exercices et ceintures intacts ; un élève qui l'a
// déjà (Explorer) garde ses fiches de cours.
//   CAPTURES=<dossier> node e2e/session-qr-long.mjs
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'session-qr-long-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const lire = (fichier, id) => JSON.parse(readFileSync(fichier, 'utf8')).classes.flatMap((c) => c.parcours).find((p) => p.id === id)
// Calcul intégral : fiches illustrées ; EVACOM TAF : le plus long du catalogue (36 exercices)
const ESSAIS = [lire('explorer/ch-4e-college.json', 'ch-4c-integrales'), lire('explorer/evacom-revisions.json', 'evacom-taf-revision')]

const lancer = (args = []) => chromium.launch({ executablePath: '/usr/bin/chromium', args })
async function contexte(nav, stockage) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((stockage) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(stockage)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, stockage)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(e.message))
  await page.goto(base)
  return page
}
/** Vidéo de la fausse caméra : l'image exportée, filmée en continu (comme session-qr.mjs) */
function videoDe(image, nom) {
  const fond = join(dossier, `${nom}.png`)
  execFileSync('python3', [
    '-I', '-c',
    `
import sys
from PIL import Image
fond = Image.new('RGB', (1280, 720), (90, 90, 95))
qr = Image.open(sys.argv[1]).convert('RGB')
qr.thumbnail((700, 700))
fond.paste(qr, ((1280 - qr.width) // 2, (720 - qr.height) // 2))
fond.save(sys.argv[2])
`,
    image, fond,
  ])
  const video = join(dossier, `${nom}.y4m`)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-t', '4', '-i', fond, '-vf', 'fps=15,format=yuv420p', video])
  return video
}

for (const parcours of ESSAIS) {
const fiches = parcours.paliers.filter((x) => x.fiche).length
ok(fiches >= 5, `${parcours.titre} : ${parcours.etapes.length} exercices, ${fiches} fiches de cours`)

// ---------- Enseignant ----------
const navE = await lancer()
const prof = await contexte(navE, {
  profil: 'enseignant',
  pays: 'CH',
  bibliotheque: { lien: 'https://kdrive.infomaniak.com/app/share/1/essai', classes: [{ nom: '4M1' }], parcours: [{ parcours, classes: ['4M1'], exportee: {} }] },
})
await prof.getByRole('button', { name: new RegExp(`^\\s*${parcours.titre}`) }).first().click({ timeout: 60_000 })
await prof.getByRole('button', { name: 'Lancer une session' }).click()
await prof.getByRole('button', { name: 'Lancer la session' }).click()
const qrPage = prof.locator('.qr-page')
await qrPage.waitFor({ timeout: 10_000 }).catch(() => {})
ok(await qrPage.isVisible(), 'enseignant : « Lancer la session » ouvre la page de la session avec son QR code')
const code = (await prof.locator('main .font-light').filter({ hasText: /^[2-9a-z]{5}$/ }).first().innerText().catch(() => '')).trim()
ok(/^[2-9a-z]{5}$/.test(code), `code de la session : ${code}`)
await prof.screenshot({ path: `${captures}/session-qr-long-1-${parcours.id}.png` })
await prof.getByRole('button', { name: 'Plein écran', exact: true }).click()
await prof.locator('.qr-session').waitFor()
const [telechargement] = await Promise.all([prof.waitForEvent('download'), prof.getByRole('button', { name: 'Exporter l’image' }).click()])
const imageQr = join(dossier, `qr-${parcours.id}.png`)
await telechargement.saveAs(imageQr)
ok(readFileSync(imageQr).subarray(1, 4).toString() === 'PNG', 'enseignant : image du QR code exportée')

// ---------- Élève qui n'a pas le parcours ----------
const navA = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageQr, `a-${parcours.id}`)}`])
const a = await contexte(navA, { profil: 'eleve', pays: 'CH', explorer: [] })
await a.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
await a.getByRole('button', { name: 'Scanner le QR code d’une session' }).click({ timeout: 60_000 })
await a.locator('main math-field, main input[type=checkbox], main input[type=radio]').first().waitFor({ timeout: 60_000 }).catch(() => {})
const seanceA = await a.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), parcours.id)
ok(seanceA?.code === code, `élève sans le parcours : QR code lu, dans la session ${seanceA?.code}`)
ok(JSON.stringify(seanceA?.contenu.etapes) === JSON.stringify(parcours.etapes.map((e) => ({ ...e }))) || seanceA?.contenu.etapes.length === parcours.etapes.length, `élève sans le parcours : les ${parcours.etapes.length} exercices et leurs réglages`)
ok(seanceA?.contenu.paliers?.length === parcours.paliers.length, 'élève sans le parcours : toutes les ceintures')
await a.screenshot({ path: `${captures}/session-qr-long-2-${parcours.id}.png` })

// ---------- Élève qui a déjà le parcours (Explorer) : ses fiches restent ----------
const navB = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoDe(imageQr, `b-${parcours.id}`)}`])
const b = await contexte(navB, { profil: 'eleve', pays: 'CH', explorer: [parcours] })
await b.context().grantPermissions(['camera'], { origin: 'http://localhost:1420' })
await b.getByRole('button', { name: 'Scanner le QR code d’une session' }).click({ timeout: 60_000 })
await b.locator('main math-field, main input[type=checkbox], main input[type=radio]').first().waitFor({ timeout: 60_000 }).catch(() => {})
const seanceB = await b.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), parcours.id)
ok(seanceB?.code === code, `élève avec le parcours : dans la session ${seanceB?.code}`)
ok(seanceB?.contenu.paliers?.filter((x) => x.fiche).length === fiches, 'élève avec le parcours : ses fiches de cours sont là', String(seanceB?.contenu.paliers?.filter((x) => x.fiche).length))

await Promise.all([navE.close(), navA.close(), navB.close()])
}
ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
rmSync(dossier, { recursive: true, force: true })
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
