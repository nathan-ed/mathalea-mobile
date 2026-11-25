// Session partagée par QR code court (MATHALEA-SESSION?…). Un élève de la 5A
// crée la session depuis la page du parcours et exporte l'image de son QR
// code ; un camarade de la même classe la scanne depuis l'accueil (fausse
// caméra de Chromium) et a les mêmes questions ; un élève sans classe la
// scanne : la classe du QR code est ajoutée, puis la session commence. Une
// version différente du parcours est refusée, une app plus ancienne prévient.
// Rapidité (Nathan, 25 novembre 2026 : « ça reste chargement des données 5 à
// 10 secondes », alors qu'ajouter le lien est instantané) : un parcours absent
// ou plus ancien sur l'appareil fait lire le seul dossier du QR code, jamais
// tous les dossiers ni l'Explorer.
//   CAPTURES=<dossier> [LATENCE=300] node e2e/session-qr.mjs
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pagePrete, pointStable } from './attente.mjs'
import { appareil, ecranChargement, imageQr, lienKdrive, lireStockage, SCANNER, videoDe } from './camera-qr.mjs'

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
const requetes = new Map()
async function eleve(nom, options) {
  const r = await appareil({ nom, contenus, erreurs, ...options })
  navs.push(r.nav)
  requetes.set(r.page, r.requetes)
  return r.page
}
// Scanne, attend la première question, et rend les adresses lues aux drives pendant ce temps.
// Avec `chargement` (capture) : l'écran de chargement remplace la caméra pendant le téléchargement
async function scanner(page, chargement) {
  const lues = requetes.get(page)
  await pagePrete(page)
  const avant = lues.length
  const debut = Date.now()
  // Toucher sans attendre la fin du travail de l'app : l'écran de chargement est occupé (aria-busy)
  const bouton = page.getByRole('button', { name: SCANNER })
  await pointStable(bouton)
  await bouton.click()
  if (chargement) ok(await ecranChargement(page, chargement), 'QR code lu : caméra fermée, « Chargement des données… » avec la roue')
  const question = await premiereQuestion(page)
  const nouvelles = lues.slice(avant)
  console.log(`  ${((Date.now() - debut) / 1000).toFixed(1)} s du toucher à la première question, ${nouvelles.length} requête(s) aux drives`)
  return { question, requetes: nouvelles }
}
// Lecture d'un seul dossier kDrive : partage, liste, fichier
const unDossier = (lues, uuid) => lues.length === 3 && lues.every((u) => u.includes(`/share/${uuid}/`))
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
const c = await eleve('c', { video: videoDe(image, dossier, 'c'), bureau: true, latence: 1000 })
ok(!(await c.getByText('Relatifs au tableau').count()), 'élève C : ni classe ni parcours au départ')
const scanC = await scanner(c, `${captures}/session-qr-4a-chargement-bureau-sombre.png`)
const questionC = scanC.question
ok(unDossier(scanC.requetes, UUID), `élève C : seul le dossier du QR code est lu (${scanC.requetes.length} requête(s) : ${scanC.requetes.map((u) => u.replace(/^https:\/\/[^/]+/, '')).join(', ')})`)
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
await d.getByText(/La session a été créée avec une version plus ancienne/).waitFor({ timeout: 30_000 })
ok(!(await seance(d)), 'autre version : l’élève est prévenu, aucune séance')
ok(!(await d.locator('video').count()) && (await d.getByRole('button', { name: 'Scanner à nouveau' }).isVisible()), 'autre version : caméra fermée, « Scanner à nouveau » proposé')
await d.screenshot({ path: `${captures}/session-qr-5-version.png` })
await d.getByRole('button', { name: 'Annuler' }).click()

// ---------- Élève H : session sur une version que le drive n'a pas encore ----------
const h = await eleve('h', { stockage: { classes: classe5A }, video: videoDe(imageQr(texteSession({ v: '3' }), join(dossier, 'v3.gif')), dossier, 'h') })
await h.getByText('Relatifs au tableau').first().waitFor({ timeout: 30_000 })
await toucher(h, h.getByRole('button', { name: SCANNER }))
await h.getByText(/a été modifié : la session utilise la version 3, cet appareil a encore la version 2/).waitFor({ timeout: 30_000 })
ok(!(await seance(h)), 'version plus récente dans la session : l’élève est invité à vérifier sa connexion, aucune séance')
await h.screenshot({ path: `${captures}/session-qr-5b-version-recente.png` })
await h.getByRole('button', { name: 'Annuler' }).click()

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

// ---------- Élève G (5A) : le parcours a changé sur le drive depuis le lancement de l'app ----------
// Sa copie est en V1, la session en V2 : seul le dossier de la classe est relu, puis la session commence
const UUID_G = '2c9e4b1a-7d3f-4a6e-9b8c-5f1d0e2a3b4c'
let versionG = 1
contenus[UUID_G] = () =>
  JSON.stringify({ format: 'classes-mathalea/1', exporteLe: new Date().toISOString(), classes: [{ nom: '5A', parcours: [{ ...parcours, version: versionG }] }, { nom: '5B', parcours: [] }] })
const lienG = lienKdrive(UUID_G)
const texteG = 'MATHALEA-SESSION?' + new URLSearchParams({ c: code, p: parcours.id, v: '2', l: `${lienG}?classe=5A` }).toString()
const g = await eleve('g', { latence: 1000, stockage: { classes: [{ lien: lienG, nom: '5A', disponibles: [], parcours: [] }] }, video: videoDe(imageQr(texteG, join(dossier, 'g.gif')), dossier, 'g') })
await g.getByText('Relatifs au tableau').first().waitFor({ timeout: 30_000 })
versionG = 2
const scanG = await scanner(g, `${captures}/session-qr-8-chargement.png`)
ok(unDossier(scanG.requetes, UUID_G), `élève G : seul son dossier est relu (${scanG.requetes.length} requête(s))`)
ok((await seance(g))?.code === code && scanG.question === questionA, 'élève G : dans la session en V2, même première question')
ok((await lireStockage(g, 'classes', []))[0]?.nom === '5A', 'élève G : garde sa classe')

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await Promise.all(navs.map((n) => n.close()))
// Vidéos et images de la fausse caméra : environ 200 Mo par passage
rmSync(dossier, { recursive: true, force: true })
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
