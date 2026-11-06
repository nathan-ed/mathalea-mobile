// Session partagée par QR code court (MATHALEA-SESSION?…). Un élève de la 5A
// crée la session depuis la page du parcours et exporte l'image de son QR
// code ; un camarade de la même classe la scanne depuis l'accueil (fausse
// caméra de Chromium) et a les mêmes questions ; un élève sans classe la
// scanne : la classe du QR code est ajoutée, puis la session commence. Une
// version différente du parcours est refusée, une app plus ancienne prévient.
//   CAPTURES=<dossier> node e2e/session-qr.mjs
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pagePrete, pointStable } from './attente.mjs'
import { appareil, imageQr, lienKdrive, lireStockage, SCANNER, videoDe } from './camera-qr.mjs'

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
const UUID = '7f3a9c2e-1b4d-4e8f-a6c5-0d2e9b8a7c61'
const lien = lienKdrive(UUID)
const contenus = {
  [UUID]: () =>
    JSON.stringify({ format: 'classes-mathalea/1', exporteLe: new Date().toISOString(), classes: [{ nom: '5A', parcours: [parcours] }, { nom: '5B', parcours: [] }] }),
}
const classe5A = [{ lien, nom: '5A', disponibles: [], parcours: [] }]
const navs = []
async function eleve(nom, options) {
  const r = await appareil({ nom, contenus, erreurs, ...options })
  navs.push(r.nav)
  return r.page
}
const seance = (page) => lireStockage(page, `seance:${parcours.id}`)
const premiereQuestion = async (page) => {
  const q = page.locator('main .question-eleve').first()
  await q.waitFor({ timeout: 60_000 })
  await pagePrete(page)
  return (await q.innerText()).replace(/\s+/g, ' ').trim()
}
const toucher = async (page, cible) => {
  await pagePrete(page)
  await pointStable(cible.first())
  await cible.first().click()
  await pagePrete(page)
}

// ---------- Élève A (5A) : crée la session, montre et exporte son QR code ----------
const a = await eleve('a', { stockage: { classes: classe5A } })
await toucher(a, a.getByRole('button', { name: /Relatifs au tableau/ }))
await toucher(a, a.getByRole('button', { name: 'Autres actions' }))
await toucher(a, a.getByRole('button', { name: 'Session partagée' }))
const code = (await a.locator('main').innerText()).match(/\b[a-z0-9]{5}\b(?=\s*Montre le QR code)/)?.[0]
ok(!!code, `session créée : code ${code}`)
await a.screenshot({ path: `${captures}/session-qr-1-creee.png` })
await toucher(a, a.getByRole('button', { name: 'Afficher le QR code de la session' }))
const qr = a.locator('.qr-session')
await qr.waitFor()
ok((await qr.boundingBox()).width > 300, 'QR code de la session en grand, avec son code')
await a.screenshot({ path: `${captures}/session-qr-2-qr.png` })
const [telechargement] = await Promise.all([a.waitForEvent('download'), a.getByRole('button', { name: 'Exporter l’image' }).click()])
const image = join(dossier, 'session.png')
await telechargement.saveAs(image)
ok(telechargement.suggestedFilename() === `session-${code}.png` && readFileSync(image).subarray(1, 4).toString() === 'PNG', `image exportée : ${telechargement.suggestedFilename()}`)
await a.goBack()
await qr.waitFor({ state: 'detached' })
ok(await a.getByRole('button', { name: 'Commencer la session' }).isVisible(), 'retour : le QR code se referme, la session reste prête')
await toucher(a, a.getByRole('button', { name: 'Commencer la session' }))
const questionA = await premiereQuestion(a)
const seanceA = await seance(a)
ok(seanceA?.code === code, 'élève A : dans sa session')

// ---------- Élève B (même classe) : scanne l'image exportée ----------
const b = await eleve('b', { stockage: { classes: classe5A }, video: videoDe(image, dossier, 'b') })
await b.getByText('Relatifs au tableau').first().waitFor({ timeout: 30_000 })
await toucher(b, b.getByRole('button', { name: SCANNER }))
const questionB = await premiereQuestion(b)
const seanceB = await seance(b)
ok(seanceB?.code === code && JSON.stringify(seanceB.graines) === JSON.stringify(seanceA.graines), 'élève B : même code, mêmes graines que A')
ok(questionB === questionA, `élève B : même première question que A (« ${questionB.slice(0, 40)}… »)`)
await b.screenshot({ path: `${captures}/session-qr-3-camarade.png` })

// ---------- Élève C (aucune classe, bureau sombre) : la classe du QR code est ajoutée ----------
const c = await eleve('c', { video: videoDe(image, dossier, 'c'), bureau: true })
ok(!(await c.getByText('Relatifs au tableau').count()), 'élève C : ni classe ni parcours au départ')
await toucher(c, c.getByRole('button', { name: SCANNER }))
const questionC = await premiereQuestion(c)
const cc = await lireStockage(c, 'classes', [])
ok(cc.length === 1 && cc[0].lien === lien && cc[0].nom === '5A', `élève C : classe ${cc[0]?.nom} ajoutée par le QR code de la session`)
ok((await seance(c))?.code === code && questionC === questionA, 'élève C : dans la session, même première question')
await c.screenshot({ path: `${captures}/session-qr-4-sans-classe-bureau-sombre.png` })
await toucher(c, c.getByRole('button', { name: 'Quitter' }))
if (await c.getByRole('button', { name: 'Reprendre plus tard' }).count()) await toucher(c, c.getByRole('button', { name: 'Reprendre plus tard' }))
if (await c.getByRole('button', { name: 'Revenir en arrière' }).count()) await toucher(c, c.getByRole('button', { name: 'Revenir en arrière' }))
await c.getByRole('button', { name: /Relatifs au tableau/ }).first().waitFor({ timeout: 30_000 })
ok(await c.getByRole('button', { name: SCANNER }).isVisible(), 'élève C : de retour à l’accueil, le parcours y est, avec sa classe')

// QR codes écrits ici, indépendamment de l'app : même format que le site et les autres apps
const texteSession = (o) => 'MATHALEA-SESSION?' + new URLSearchParams({ c: code, p: parcours.id, v: '2', l: `${lien}?classe=5A`, ...o }).toString()

// ---------- Élève D : QR code d'une autre version du parcours ----------
const d = await eleve('d', { stockage: { classes: classe5A }, video: videoDe(imageQr(texteSession({ v: '1' }), join(dossier, 'v1.gif')), dossier, 'd') })
await d.getByText('Relatifs au tableau').first().waitFor({ timeout: 30_000 })
await toucher(d, d.getByRole('button', { name: SCANNER }))
await d.getByText(/n’est pas à la même version que dans la session/).waitFor({ timeout: 30_000 })
ok(!(await seance(d)), 'autre version : l’élève est prévenu, aucune séance')
await d.screenshot({ path: `${captures}/session-qr-5-version.png` })
await d.getByRole('button', { name: 'Annuler' }).click()

// ---------- Élève E : app plus ancienne que celle de qui a créé la session ----------
const e = await eleve('e', { stockage: { classes: classe5A }, video: videoDe(imageQr(texteSession({ m: '2099-01-01' }), join(dossier, 'recente.gif')), dossier, 'e') })
await e.getByText('Relatifs au tableau').first().waitFor({ timeout: 30_000 })
await toucher(e, e.getByRole('button', { name: SCANNER }))
await e.getByText('Mets l’application à jour').waitFor({ timeout: 30_000 })
ok(true, 'app plus ancienne : l’élève est prévenu')
await pagePrete(e)
await e.screenshot({ path: `${captures}/session-qr-6-ancienne.png` })
await toucher(e, e.getByRole('button', { name: 'Continuer quand même' }))
await premiereQuestion(e)
ok((await seance(e))?.code === code, 'Continuer quand même : dans la session')

// ---------- Élève F (aucune classe) : session sur un parcours de l'Explorer, sans lien de dossier ----------
const explorer = { ...parcours, id: 'session-qr-explorer', version: 1, titre: 'Relatifs de l’Explorer' }
const texteExplorer = 'MATHALEA-SESSION?' + new URLSearchParams({ c: 'k3lr2', p: explorer.id, v: '1' }).toString()
const f = await eleve('f', { stockage: { explorer: [explorer] }, video: videoDe(imageQr(texteExplorer, join(dossier, 'explorer.gif')), dossier, 'f') })
await toucher(f, f.getByRole('button', { name: SCANNER }))
await premiereQuestion(f)
ok((await lireStockage(f, `seance:${explorer.id}`))?.code === 'k3lr2' && !(await lireStockage(f, 'classes', [])).length, 'Explorer : session commencée sans classe')
await f.screenshot({ path: `${captures}/session-qr-7-explorer.png` })

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await Promise.all(navs.map((n) => n.close()))
// Vidéos et images de la fausse caméra : environ 200 Mo par passage
rmSync(dossier, { recursive: true, force: true })
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
