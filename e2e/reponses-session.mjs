// Réponses d'une session partagée relevées par l'enseignant (pnpm dev seulement,
// sans le serveur de dossier qui remplace l'Explorer).
// Quatre élèves rejoignent la même session et répondent pour de vrai (bonnes et
// mauvaises réponses), puis montrent leur QR code ; l'enseignant les lit à la
// caméra (fausse caméra de Chromium qui filme les QR codes), revoit les
// réponses de la classe revérifiées par son app, copie le texte pour une IA,
// importe une photo de quatre téléphones et le fichier d'un cinquième élève.
//   CAPTURES=<dossier> node e2e/reponses-session.mjs
// Moteur WebKit (Safari, iPhone, Mac, WebView de Linux) : NAVIGATEUR=webkit.
// Captures du guide (docs/guide/images/sessions-*.png) : GUIDE=docs/guide/images.
// Sans fausse caméra dans WebKit, les QR codes y sont relevés par une photo.
import { chromium, webkit } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'reponses-'))
const code = 'r54z4' // QR code après la correction, avec le prénom (empreinte du code, reglageQr)
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcours = {
  id: 'releve-essai',
  version: 1,
  titre: 'Relatifs en classe',
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  melanger: true,
  enTetesMasques: true,
  etapes: [
    { uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 3 },
    { uuid: '36e2a', id: '5N2H', titre: 'Soustraire des relatifs', nbQuestions: 3 },
  ],
}

const avecWebkit = process.env.NAVIGATEUR === 'webkit'
const lancer = (args = []) => (avecWebkit ? webkit.launch() : chromium.launch({ executablePath: '/usr/bin/chromium', args }))
const nom = avecWebkit ? 'webkit' : 'chromium'
console.log(`Navigateur : ${nom}`)
const nav = await lancer()

async function eleve(nom, theme = 'clair', bureau = false) {
  const ctx = await nav.newContext(
    bureau
      ? { viewport: { width: 1200, height: 800 }, acceptDownloads: true }
      : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true },
  )
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(
    ([p, theme]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      localStorage.setItem('copie:profil', JSON.stringify('eleve'))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:explorer', JSON.stringify([p]))
    },
    [parcours, theme],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}${process.env.PILE ? ' @ ' + (e.stack ?? '').split('\n').slice(0, 6).join(' < ') : ''}`))
  await page.goto(base)
  return page
}

/** Capture du guide : `cible`, ce qu'on touche ensuite, entourée d'un anneau (comme guide.mjs) */
async function guide(page, nomCapture, cible) {
  if (!process.env.GUIDE || avecWebkit) return
  await page.waitForTimeout(500)
  if (cible) {
    const c = cible.first()
    await c.evaluate((el) => {
      if (getComputedStyle(el.closest('nav, footer, header') ?? el).position !== 'fixed') el.scrollIntoView({ block: 'center' })
    })
    await page.waitForTimeout(200)
    const b = await c.boundingBox()
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

/** Réponse attendue par MathALÉA pour la question affichée (rang dans l'ordre mélangé) */
const reponseAttendue = (page, rang) =>
  page.evaluate(
    async ({ id, rang }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      const [e, q] = s.ordre[rang].split('-').map(Number)
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { id: parcours.id, rang },
  )
/** Passe à la question suivante et attend qu'elle soit affichée (un toucher trop rapide est ignoré exprès) */
async function suivante(page, rang, bouton = 'Question suivante') {
  const cible = page.getByText(`Question ${rang + 2} sur 6`)
  const btn = page.getByRole('button', { name: bouton })
  const diagnostic = async (quoi) => {
    await page.screenshot({ path: `${captures}/${nom}-echec-${quoi}-${rang}.png` })
    const dessus = await btn.evaluate((b) => {
      const r = b.getBoundingClientRect()
      const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return `sous le doigt : ${e?.tagName}.${String(e?.className).slice(0, 60)} ; bouton ${Math.round(r.top)}-${Math.round(r.bottom)} / ${innerHeight}`
    }).catch(() => 'bouton absent')
    return new Error(`${quoi} « ${bouton} » (question ${rang + 1}) : ${dessus} ; ${(await page.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 160)}`)
  }
  if (!(await btn.waitFor({ timeout: 15_000 }).then(() => true, () => false))) throw await diagnostic('absent')
  if (!(await btn.click({ timeout: 10_000 }).then(() => true, () => false))) throw await diagnostic('clic')
  for (let essai = 0; essai < 20; essai++) {
    if (await cible.isVisible().catch(() => false)) return
    await page.waitForTimeout(500)
    // Toucher ignoré (trop tôt après « Vérifier ») : le bouton est encore là, on retouche
    if (essai % 4 === 3 && (await btn.isVisible().catch(() => false))) await btn.click({ timeout: 5000 }).catch(() => {})
  }
  throw await diagnostic('suite')
}
/** Saisie dans le champ de la question affichée (attend la fin de l'animation : l'ancienne question quitte la page) */
async function saisir(page, latex) {
  // Question montée par MathALÉA (écouteurs posés) et seule dans la page
  await page
    .waitForFunction(() => document.querySelectorAll('main math-field').length === 1 && !!document.querySelector('main math-field[data-listener-added]'), null, { timeout: 15_000 })
    .catch(() => {})
  // Champ que MathLive n'a pas fini de préparer : la valeur ne prend pas, on recommence
  for (let essai = 0; essai < 20; essai++) {
    const pris = await page
      .locator('main math-field')
      .last()
      .evaluate((el, v) => {
        el.setValue(v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        return el.value === v
      }, latex)
      .catch(() => false)
    // La valeur tient (le champ n'a pas été remplacé entre-temps)
    if (pris && (await page.waitForTimeout(300), await page.locator('main math-field').last().evaluate((el, v) => el.value === v, latex).catch(() => false))) return
    await page.waitForTimeout(250)
  }
  throw new Error(`saisie impossible : ${latex}`)
}

/**
 * Un élève fait la session : `faux[rang]` donne sa réponse fausse à cette
 * question (rang dans l'ordre vu), sinon il répond juste.
 */
async function faireSession(page, faux) {
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
  await page.getByText('5e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Relatifs en classe/ }).first().click({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Autres actions' }).click()
  await page.getByRole('button', { name: 'Rejoindre une session' }).click()
  await page.getByLabel('Code de session').fill(code.toUpperCase())
  await page.getByRole('button', { name: 'Rejoindre la session' }).click()
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await page.waitForTimeout(500)
  for (let rang = 0; rang < 6; rang++) {
    await saisir(page, faux[rang] ?? (await reponseAttendue(page, rang)))
    await page.getByRole('button', { name: 'Vérifier' }).click()
    await page.waitForTimeout(400)
    if (rang < 5) await suivante(page, rang)
    else await page.getByRole('button', { name: 'Voir le bilan' }).click()
  }
  const bouton = page.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' })
  if (!(await bouton.waitFor({ timeout: 30_000 }).then(() => true, () => false))) {
    await page.screenshot({ path: `${captures}/${nom}-echec-bilan.png`, fullPage: true })
    throw new Error(`bilan sans QR code : ${(await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300)}`)
  }
}

/** QR code de l'élève, en image (ce que filme l'enseignant) */
/** Prénom demandé par la session : saisi avant le premier QR code */
async function donnerPrenom(page, prenom, premier = false) {
  const champ = page.getByLabel('Ton prénom')
  await champ.waitFor({ timeout: 10_000 })
  await champ.fill(prenom)
  if (premier) await guide(page, 'sessions-4a-prenom', page.getByRole('button', { name: 'Afficher mon QR code' }))
  await page.getByRole('button', { name: 'Afficher mon QR code' }).click()
}

async function qrDe(page, fichier, premier = false, prenom) {
  if (premier) await guide(page, 'sessions-3-bilan', page.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }))
  await page.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }).click()
  if (prenom) await donnerPrenom(page, prenom, premier)
  const qr = page.locator('.qr-reponses')
  await qr.waitFor()
  await page.waitForTimeout(200)
  await qr.screenshot({ path: fichier })
  return fichier
}

// ---------- Quatre élèves, même session ----------
// A : tout juste ; B : faux aux questions 1 et 2 ; C : faux aux 1 et 2 (autre erreur en 2) ; D : faux à la 3
const plans = [
  { nom: 'A', prenom: 'Léa', faux: {} },
  { nom: 'B', prenom: 'Tom', faux: { 0: '999', 1: '999' } },
  { nom: 'C', prenom: 'Inès', faux: { 0: '999', 1: '-5' } },
  { nom: 'D', prenom: 'Noé', faux: { 2: '0' } },
]
const qrs = []
const pages = {}
for (const [i, p] of plans.entries()) {
  const page = await eleve(p.nom, i === 3 ? 'sombre' : 'clair')
  pages[p.nom] = page
  await faireSession(page, p.faux)
  const t = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  const attendu = 6 - Object.keys(p.faux).length
  ok(t.includes(`${attendu} / 6`), `élève ${p.nom} : bilan ${attendu} / 6 (${t.match(/\d+ \/ 6/)?.[0]})`)
  qrs.push(await qrDe(page, join(dossier, `qr-${p.nom}.png`), i === 0, p.prenom))
  const ecranQr = await page.locator('main', { has: page.locator('.qr-reponses') }).innerText()
  ok(ecranQr.includes('avec ton prénom') && ecranQr.includes(p.prenom), `élève ${p.nom} : QR code avec son prénom (${p.prenom})`)
  if (i === 0) await guide(page, 'sessions-4-qr')
  if (i === 0) await page.screenshot({ path: `${captures}/${nom}-reponses-1-qr-eleve-clair.png` })
  if (i === 3) await page.screenshot({ path: `${captures}/${nom}-reponses-1-qr-eleve-sombre.png` })
  ok((await page.locator('.qr-reponses').boundingBox()).width > 300, `élève ${p.nom} : QR code assez grand pour être lu`)
}
// Le prénom est gardé : le QR code suivant ne le redemande pas
await pages.A.getByRole('button', { name: 'Revenir en arrière' }).first().click()
await pages.A.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }).click()
ok((await pages.A.locator('.qr-reponses').count()) === 1 && !(await pages.A.getByLabel('Ton prénom').count()), 'prénom gardé : le QR code s’affiche directement')

// Retour du téléphone : le QR code se referme, le bilan reste
await pages.A.goBack({ waitUntil: 'commit' })
await pages.A.waitForTimeout(300)
ok(!(await pages.A.locator('.qr-reponses').count()) && (await pages.A.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }).isVisible()), 'retour : QR code refermé, bilan affiché')

// Un cinquième élève (sur ordinateur) envoie un fichier au lieu du QR code
const e = await eleve('E', 'clair', true)
await faireSession(e, { 0: '7' })
await e.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }).click()
await donnerPrenom(e, 'Eva')
const [telechargement] = await Promise.all([e.waitForEvent('download'), e.getByRole('button', { name: 'Envoyer un fichier à la place' }).click()])
const fichierE = join(dossier, telechargement.suggestedFilename())
await telechargement.saveAs(fichierE)
ok(/^reponses-r54z4-[a-z0-9]+\.txt$/.test(telechargement.suggestedFilename()), `fichier de l’élève : ${telechargement.suggestedFilename()}`)
ok(readFileSync(fichierE, 'utf8').startsWith('MAREP1.'), 'fichier : même contenu que le QR code')
await e.screenshot({ path: `${captures}/${nom}-reponses-1-qr-eleve-bureau.png` })

// ---------- Vidéo de la fausse caméra : les QR codes des élèves, l'un après l'autre ----------
const video = join(dossier, 'camera.y4m')
execFileSync('python3', [
  '-I',
  '-c',
  `
import sys
from PIL import Image
images = sys.argv[2:]
out = []
for i, f in enumerate(images):
    fond = Image.new('RGB', (1280, 720), (90, 90, 95))
    qr = Image.open(f).convert('RGB')
    qr.thumbnail((560, 560))
    fond.paste(qr, ((1280 - qr.width) // 2, (720 - qr.height) // 2))
    p = sys.argv[1] + f'/image-{i}.png'
    fond.save(p)
`,
  dossier,
  ...qrs,
])
// 2 s par téléphone, puis un écran vide
execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  ...qrs.flatMap((_, i) => ['-loop', '1', '-t', '2', '-i', join(dossier, `image-${i}.png`)]),
  '-f', 'lavfi', '-t', '2', '-i', 'color=c=0x5a5a5f:s=1280x720',
  '-filter_complex', `${qrs.map((_, i) => `[${i}:v]`).join('')}[${qrs.length}:v]concat=n=${qrs.length + 1}:v=1:a=0,fps=15,format=yuv420p`,
  video,
])

// ---------- Enseignant ----------
const camera = await lancer(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${video}`])
const ctxT = await camera.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: !avecWebkit, hasTouch: true })
await ctxT.grantPermissions(avecWebkit ? [] : ['camera', 'clipboard-read', 'clipboard-write'], { origin: 'http://localhost:1420' }).catch(() => {})
await ctxT.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
await ctxT.addInitScript(() => {
  if (sessionStorage.getItem('pret')) return
  sessionStorage.setItem('pret', '1')
  localStorage.setItem('copie:profil', JSON.stringify('enseignant'))
  localStorage.setItem('copie:pays', JSON.stringify('FR'))
})
const t = await ctxT.newPage()
t.on('pageerror', (e) => erreurs.push(`enseignant : ${e.message}`))
await t.goto(base)
await guide(t, 'sessions-6-espace', t.getByRole('button', { name: /Sessions partagées/ }))
await t.getByRole('button', { name: /Sessions partagées/ }).click({ timeout: 60_000 })
await guide(t, 'sessions-7-lire', t.getByRole('button', { name: 'Lire les QR codes' }))
await t.getByRole('button', { name: 'Lire les QR codes' }).click()
const compteur = t.getByText(/\d+ réponses? reçues?/)
await compteur.waitFor()
if (!avecWebkit) {
  await t.waitForFunction(() => /4 réponses reçues/.test(document.body.innerText), null, { timeout: 60_000 }).catch(() => {})
  ok((await compteur.innerText()).includes('4 réponses reçues'), `caméra : les quatre QR codes lus (${await compteur.innerText()})`)
  await t.waitForTimeout(2500)
  ok((await compteur.innerText()).includes('4 réponses reçues'), 'la vidéo repasse : aucun élève compté deux fois')
} else {
  await t.waitForTimeout(1500)
  const etat = await t.locator('[role=dialog] [role=status]').last().innerText()
  ok(/Vise un QR code|caméra/i.test(etat), `WebKit : lecteur ouvert (${etat})`)
}
await t.screenshot({ path: `${captures}/${nom}-reponses-2-camera.png` })
await guide(t, 'sessions-8-camera', t.getByRole('button', { name: 'Terminer' }))
await t.getByRole('button', { name: 'Terminer' }).click()
if (!avecWebkit) {
  ok((await t.locator('main').innerText()).includes('4 réponses ajoutées'), 'retour de la caméra : « 4 réponses ajoutées »')
  ok((await t.locator('main').innerText()).includes('Session r54z4'), 'session listée avec son code')
}

// Fichier du cinquième élève, photo de quatre téléphones, image sans QR code
const photo = join(dossier, 'photo-table.jpg')
execFileSync('python3', [
  '-I',
  '-c',
  `
import sys
from PIL import Image, ImageFilter
qrs = sys.argv[2:6]
table = Image.new('RGB', (3000, 2250), (150, 120, 90))
for i, f in enumerate(qrs):
    tel = Image.new('RGB', (620, 1100), (20, 20, 20))
    qr = Image.open(f).convert('RGB')
    qr.thumbnail((560, 560))
    ecran = Image.new('RGB', (580, 1000), (255, 255, 255))
    ecran.paste(qr, (10, 220))
    tel.paste(ecran, (20, 50))
    tel = tel.rotate([4, -6, -3, 7][i], expand=True, fillcolor=(150, 120, 90))
    table.paste(tel, (300 + (i % 2) * 1350, 60 + (i // 2) * 1100))
table = table.filter(ImageFilter.GaussianBlur(1.2))
table.save(sys.argv[1], quality=80)
`,
  photo,
  ...qrs,
])
const vide = join(dossier, 'sans-qr.png')
execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.new("RGB", (400, 300), (200, 200, 200)).save(sys.argv[1])', vide])
await t.locator('input[type=file]').setInputFiles([photo, fichierE, vide])
await t.getByText(avecWebkit ? /5 réponses ajoutées/ : /déjà reçue/).waitFor({ timeout: 60_000 })
const bilanImport = await t.locator('main [role=status]').first().innerText()
ok(
  (avecWebkit ? /5 réponses ajoutées/.test(bilanImport) : /1 réponse ajoutée/.test(bilanImport) && /4 déjà reçues/.test(bilanImport)) && /1 fichier sans QR code/.test(bilanImport),
  `import : photo de 4 téléphones, fichier, image vide (${bilanImport})`,
)
await t.screenshot({ path: `${captures}/${nom}-reponses-3-liste.png` })

// ---------- Réponses de la classe, revérifiées par l'app de l'enseignant ----------
await t.getByRole('button', { name: /Relatifs en classe/ }).click()
await t.getByRole('button', { name: 'Copier pour une IA' }).waitFor({ timeout: 120_000 })
const vueClasse = (await t.locator('body').innerText()).replace(/\s+/g, ' ')
ok(vueClasse.includes('5 élèves'), 'cinq élèves comptés')
// Résumé : Léa 6/6, Tom 4/6, Inès 4/6, Noé 5/6, Eva 5/6
const resumeClasse = (await t.locator('section[aria-label="Résumé de la classe"]').innerText()).replace(/\s+/g, ' ')
ok(resumeClasse.includes('80 % de réussite en moyenne'), `résumé : réussite moyenne (${resumeClasse.match(/\d+ % de réussite/)?.[0]})`)
ok(resumeClasse.includes('0 élève : moins de 50 %') && resumeClasse.includes('2 élèves : de 50 à 79 %') && resumeClasse.includes('3 élèves : 80 % et plus'), 'résumé : répartition des élèves')
ok(resumeClasse.includes('À reprendre : question 1 (40 %), question 2 (60 %)'), 'résumé : questions à reprendre')
await guide(t, 'sessions-9a-resume', t.locator('section[aria-label="Résumé de la classe"]'))
// Toutes les réponses d'une question, avec les prénoms
await t.locator('section[aria-label="Question 1"]').getByRole('button', { name: 'Toutes les réponses' }).click()
const toutesQ1 = (await t.locator('section[aria-label="Question 1"]').innerText()).replace(/\s+/g, ' ')
ok(
  /Correcte · 2 (Léa, Noé|Noé, Léa)/.test(toutesQ1) && /Incorrecte · 2 (Tom, Inès|Inès, Tom)/.test(toutesQ1) && /Incorrecte · 1 Eva/.test(toutesQ1),
  `question 1, toutes les réponses : qui a répondu quoi (${toutesQ1.slice(0, 200)})`,
)
await guide(t, 'sessions-9b-toutes', t.locator('section[aria-label="Question 1"]'))
await t.locator('section[aria-label="Question 1"]').getByRole('button', { name: 'Mauvaises réponses seulement' }).click()
const sections = t.locator('main section[aria-label^="Question"]')
const titres = await sections.locator('h2').allInnerTexts()
ok(titres.length === 6, `six questions (${titres.join(', ')})`)
// Question 1 : A, D juste ; B, C : 999 ; E : 7 → 40 %
const q1 = (await t.locator('section[aria-label="Question 1"]').innerText()).replace(/\s+/g, ' ')
ok(q1.includes('40 %') && q1.includes('5 réponses'), `question 1 : 40 % sur 5 réponses (${q1.match(/\d+ % · \d+ réponses?/)?.[0]})`)
ok(/999\s*2 élèves/.test(q1) && /7\s*1 élève/.test(q1), 'question 1 : mauvaises réponses regroupées (999 : 2 élèves, 7 : 1 élève)')
const q2 = (await t.locator('section[aria-label="Question 2"]').innerText()).replace(/\s+/g, ' ')
ok(q2.includes('60 %') && /999\s*1 élève/.test(q2) && /[-−]5\s*1 élève/.test(q2), `question 2 : 60 %, 999 et -5 (${q2.match(/\d+ %/)?.[0]})`)
const q3 = (await t.locator('section[aria-label="Question 3"]').innerText()).replace(/\s+/g, ' ')
ok(q3.includes('80 %') && /0\s*1 élève/.test(q3), `question 3 : 80 % (${q3.match(/\d+ %/)?.[0]})`)
ok(titres[0] === 'Question 1', 'les moins réussies d’abord')
const q4 = (await t.locator('section[aria-label="Question 4"]').innerText()).replace(/\s+/g, ' ')
ok(q4.includes('100 %') && q4.includes('Aucune mauvaise réponse'), 'question 4 : 100 %, aucune mauvaise réponse')
ok(!(await t.locator('.zone-verif math-field').count()), 'zone de vérification vidée')
await t.screenshot({ path: `${captures}/${nom}-reponses-4-classe.png` })
await guide(t, 'sessions-9-classe', t.locator('section[aria-label="Question 1"]'))
await t.screenshot({ path: `${captures}/${nom}-reponses-4-classe-tout.png`, fullPage: true })

// Vue par élève : les plus en difficulté d'abord, toutes ses réponses au toucher
await t.getByRole('tab', { name: /Élèves/ }).click()
const lignes = await t.locator('ul[aria-label="Élèves"] > li > button').allInnerTexts()
ok(lignes.length === 5 && /^(Tom|Inès)\s+4\/6/.test(lignes[0].trim()) && /^Léa\s+6\/6/.test(lignes[4].trim()), `élèves : du plus faible au meilleur (${lignes.map((l) => l.replace(/\s+/g, ' ').trim()).join(' | ')})`)
await t.locator('ul[aria-label="Élèves"] > li > button', { hasText: 'Tom' }).click()
const tom = (await t.locator('ul[aria-label="Élèves"] > li', { hasText: 'Tom' }).innerText()).replace(/\s+/g, ' ')
ok(/Q1 (999 )+Incorrecte/.test(tom) && /Q2 (999 )+Incorrecte/.test(tom) && (tom.match(/\bCorrecte/g) ?? []).length === 4, `élève Tom : ses six réponses, correctes et incorrectes (${tom.slice(0, 160)})`)
await guide(t, 'sessions-9c-eleves', t.locator('ul[aria-label="Élèves"] > li', { hasText: 'Tom' }))
await t.getByRole('tab', { name: 'Questions' }).click()

// Correction affichée à la demande
await t.locator('section[aria-label="Question 1"]').getByRole('button', { name: 'Voir la correction' }).click()
ok((await t.locator('section[aria-label="Question 1"] .katex').count()) > 0, 'correction de la question 1 affichée (formules rendues)')

// Texte pour une IA
await t.getByRole('button', { name: 'Copier pour une IA' }).click()
ok(await t.getByText('Copié.', { exact: true }).waitFor({ timeout: 10_000 }).then(() => true, () => false), 'copie : confirmation affichée')
if (!avecWebkit) {
  const copie = await t.evaluate(() => navigator.clipboard.readText())
  ok(copie.includes('5 élèves') && copie.includes('Question 1 (réussite : 40 %, 5 réponses)'), 'texte copié : élèves et réussite')
  ok(copie.includes('999 (2)') && copie.includes('-5 (1)'), 'texte copié : mauvaises réponses avec leur nombre')
  ok(copie.includes('Correction :') && copie.includes('conception erronée'), 'texte copié : corrections et consigne pour l’IA')
  ok(!/r54z4-|MAREP1/.test(copie) && !/Léa|Tom|Inès|Noé|Eva/.test(copie), 'texte copié : aucun prénom')
  ok(copie.includes('Élève 1 (6/6)') && copie.includes('Élève 2 (4/6) : Q1 999 (incorrecte)') && copie.includes('Élève N'), 'texte copié : élèves en « Élève N », avec la consigne de garder ces numéros')
  writeFileSync(`${captures}/reponses-texte-ia.txt`, copie)
}

// ---------- Analyse par Claude (API simulée : aucun appel réel, aucun crédit) ----------
const requetesIA = []
let reponseIA = 'ok'
await ctxT.route('https://api.anthropic.com/**', async (route) => {
  const req = route.request()
  requetesIA.push({ entetes: await req.allHeaders(), corps: req.postDataJSON() })
  if (reponseIA === 'refus') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }) })
  const texte = '## Erreur fréquente\n- **999** : réponse au hasard, à revoir avec $(-18)+(+16)$.\n- Activité de 5 minutes : additionner deux relatifs sur une droite graduée.\n## Par élève\n- Élève 2 : répond au hasard, à interroger.\n- Élève 3 : confond les signes.'
  const ev = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
  const morceaux = texte.match(/.{1,40}/gs)
  const corps =
    ev('message_start', { message: { id: 'msg_essai', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } }) +
    ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }) +
    morceaux.map((m) => ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: m } })).join('') +
    ev('content_block_stop', { index: 0 }) +
    ev('message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 50 } }) +
    ev('message_stop', {})
  return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body: corps })
})
await guide(t, 'sessions-10-copier', t.locator('section[aria-label="Analyse par une IA"]'))
await t.getByRole('button', { name: 'Analyser dans l’app avec une IA' }).click()
ok(await t.getByRole('radio', { name: 'Claude (Anthropic)' }).isChecked(), 'réglages de l’IA : Claude par défaut')
ok(await t.getByRole('button', { name: 'Enregistrer', exact: true }).isDisabled(), 'réglages de l’IA : rien d’enregistrable sans clé')
await t.getByLabel('Clé d’API', { exact: true }).fill('sk-ant-essai-123')
await guide(t, 'sessions-11-cle', t.getByRole('button', { name: 'Enregistrer', exact: true }))
await t.screenshot({ path: `${captures}/${nom}-reponses-5-cle-ia.png` })
await t.getByRole('button', { name: 'Enregistrer', exact: true }).click()
const blocIA = t.locator('section[aria-label="Analyse par une IA"]')
await blocIA.getByText('Activité de 5 minutes').waitFor({ timeout: 30_000 })
ok(requetesIA.length === 1, 'analyse : une requête à l’API')
const { entetes, corps } = requetesIA[0]
ok(corps.model === 'claude-opus-5-5' && corps.fallbacks === 'default' && corps.stream === true, `requête : modèle ${corps.model}, repli « default », en flux`)
ok(entetes['x-api-key'] === 'sk-ant-essai-123' && /server-side-fallback-2026-07-01/.test(entetes['anthropic-beta'] ?? ''), 'requête : clé de l’enseignant et en-tête du repli')
const envoye = JSON.stringify(corps.messages)
ok(envoye.includes('999 (2)') && !/MAREP1|r54z4-|champTexte|Ex0Q/.test(envoye), 'requête : erreurs de la classe, aucune donnée technique')
ok(!/Léa|Tom|Inès|Noé|Eva/.test(JSON.stringify(corps)) && envoye.includes('Élève 3 (4/6)'), 'requête : aucun prénom, élèves en « Élève N »')
ok(/Élève N/.test(JSON.stringify(corps.system ?? '')), 'requête : consigne système de garder « Élève N »')
// Correspondance réelle « Élève N » → prénom : ordre de réception gardé par l'app
const prenoms = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:releves'))[0].recues.map((r) => r.n))
await blocIA.getByText(prenoms[1]).first().waitFor({ timeout: 10_000 })
const affichee = (await blocIA.innerText()).replace(/\s+/g, ' ')
ok(affichee.includes(`${prenoms[1]} : répond au hasard`) && affichee.includes(`${prenoms[2]} : confond les signes`) && !/Élève [23]/.test(affichee), `analyse affichée : « Élève 2 » et « Élève 3 » redeviennent ${prenoms[1]} et ${prenoms[2]}`)
ok((await blocIA.locator('ul li').count()) === 4 && (await blocIA.locator('strong').innerText()) === '999', 'analyse affichée : puces et gras')
ok((await blocIA.locator('.katex').count()) > 0, 'analyse affichée : formule rendue')
await blocIA.scrollIntoViewIfNeeded()
await t.screenshot({ path: `${captures}/${nom}-reponses-5-analyse.png` })
await guide(t, 'sessions-12-analyse', blocIA)
// Clé refusée : message clair, l'analyse précédente reste
reponseIA = 'refus'
await blocIA.getByRole('button', { name: 'Refaire l’analyse' }).click()
await blocIA.getByRole('alert').waitFor({ timeout: 30_000 })
ok((await blocIA.getByRole('alert').innerText()).includes('Clé d’API refusée'), 'clé refusée : message clair')
ok(await blocIA.getByText('Activité de 5 minutes').isVisible(), 'clé refusée : l’analyse précédente reste affichée')
reponseIA = 'ok'
// La clé n'est jamais dans une sauvegarde
const sauvegarde = await t.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('copie:')).map((k) => k.slice(6)))
ok(sauvegarde.includes('cle-ia'), 'clé gardée sur l’appareil')

// Réouverture : verdicts gardés, rien à revérifier
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
await t.getByRole('button', { name: /Relatifs en classe/ }).click()
const debut = Date.now()
await t.getByRole('button', { name: 'Copier pour une autre IA' }).waitFor({ timeout: 30_000 })
ok(Date.now() - debut < 5000, `réouverture sans revérification (${Date.now() - debut} ms)`)
ok(await t.locator('section[aria-label="Analyse par une IA"]').getByText('Activité de 5 minutes').isVisible(), 'réouverture : analyse gardée, sans nouvel appel')
ok(requetesIA.length === 2, 'aucun appel à l’API à la réouverture')
ok(await t.getByRole('button', { name: 'Refaire l’analyse' }).isVisible(), 'avec une clé : l’analyse par Claude est le bouton principal')
// Réponse d'une autre IA, collée : les numéros redeviennent des prénoms
await t.getByRole('button', { name: 'Coller la réponse d’une IA' }).click()
await t.getByRole('textbox', { name: 'Réponse de l’IA' }).fill('## Bilan\nÉlève 5 doit revoir l’addition. Élève 1 peut aider Élève 4.')
await guide(t, 'sessions-12b-coller', t.getByRole('button', { name: 'Enregistrer', exact: true }))
await t.getByRole('button', { name: 'Enregistrer', exact: true }).click()
const colle = (await t.locator('section[aria-label="Analyse par une IA"]').innerText()).replace(/\s+/g, ' ')
ok(colle.includes(`${prenoms[4]} doit revoir l’addition. ${prenoms[0]} peut aider ${prenoms[3]}.`) && colle.includes('Analyse de l’IA'), `réponse collée : prénoms remis (${prenoms[4]}, ${prenoms[0]}, ${prenoms[3]})`)

// ---------- IA locale (Ollama simulé sur localhost:11434) ----------
const requetesLocales = []
await ctxT.route('http://localhost:11434/**', async (route) => {
  const req = route.request()
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST' }
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
  if (req.url().endsWith('/v1/models')) return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify({ object: 'list', data: [{ id: 'qwen3:8b' }, { id: 'llama3.2' }] }) })
  requetesLocales.push({ entetes: await req.allHeaders(), corps: req.postDataJSON() })
  const texte = '<think>Je regarde les erreurs.</think>\n## Bilan local\n- Élève 4 : bien, peut expliquer $-5$ à Élève 5.'
  const corps = texte.match(/.{1,25}/gs).map((m) => `data: ${JSON.stringify({ choices: [{ delta: { content: m } }] })}\n\n`).join('') + 'data: [DONE]\n\n'
  return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'text/event-stream' }, body: corps })
})
await t.getByRole('button', { name: 'Réglages de l’IA' }).click()
await t.getByRole('radio', { name: /IA locale/ }).check()
ok((await t.getByLabel('Adresse de l’API').inputValue()) === 'http://localhost:11434/v1', 'IA locale : adresse d’Ollama proposée')
ok(await t.getByText('À compléter : Modèle manquant.').isVisible(), 'IA locale : modèle à choisir')
await t.getByRole('group', { name: 'Modèles disponibles' }).getByRole('button', { name: 'qwen3:8b' }).click({ timeout: 10_000 })
ok((await t.getByLabel('Modèle', { exact: true }).inputValue()) === 'qwen3:8b', 'IA locale : modèles installés proposés au toucher')
await guide(t, 'sessions-11b-locale', t.getByRole('button', { name: 'Enregistrer', exact: true }))
await t.screenshot({ path: `${captures}/${nom}-reponses-5-ia-locale.png` })
// Une adresse http:// hors du réseau local est refusée
await t.getByLabel('Adresse de l’API').fill('http://api.exemple.fr/v1')
ok(await t.getByText(/n’est acceptée que sur le réseau local/).isVisible(), 'adresse http:// sur internet refusée')
await t.getByLabel('Adresse de l’API').fill('http://localhost:11434/v1')
await t.getByRole('button', { name: 'Enregistrer', exact: true }).click()
await blocIA.getByText('Bilan local').waitFor({ timeout: 30_000 })
ok(requetesLocales.length === 1 && requetesLocales[0].corps.model === 'qwen3:8b' && requetesLocales[0].corps.stream === true, 'IA locale : une requête, modèle choisi, en flux')
ok(!/Léa|Tom|Inès|Noé|Eva/.test(JSON.stringify(requetesLocales[0].corps)) && JSON.stringify(requetesLocales[0].corps).includes('Élève 3 (4/6)'), 'IA locale : aucun prénom envoyé')
ok(!requetesLocales[0].entetes.authorization, 'IA locale : aucune clé envoyée')
const locale = (await blocIA.innerText()).replace(/\s+/g, ' ')
ok(locale.includes('Analyse par l’IA locale') && locale.includes(`${prenoms[3]} : bien, peut expliquer`) && locale.includes(prenoms[4]) && !locale.includes('Je regarde'), `IA locale : prénoms remis, raisonnement masqué (${locale.slice(0, 120)})`)
ok(await blocIA.getByRole('button', { name: 'Refaire l’analyse' }).isVisible(), 'IA locale : analyse gardée, bouton principal')

// Bureau, puis thème sombre (choisi dans les réglages, comme un utilisateur)
await t.setViewportSize({ width: 1200, height: 800 })
await t.waitForTimeout(300)
await t.screenshot({ path: `${captures}/${nom}-reponses-4-classe-bureau.png` })
await t.setViewportSize({ width: 390, height: 844 })
await t.evaluate(() => localStorage.setItem('theme', 'sombre'))
await t.reload()
await t.getByRole('button', { name: /Sessions partagées/ }).click({ timeout: 60_000 })
await t.getByRole('button', { name: /Relatifs en classe/ }).click()
await t.getByRole('button', { name: 'Copier pour une autre IA' }).waitFor({ timeout: 30_000 })
await t.waitForTimeout(800)
await t.screenshot({ path: `${captures}/${nom}-reponses-4-classe-sombre.png` })

// Suppression d'une session relevée
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
await t.getByRole('button', { name: 'Supprimer la session r54z4' }).click()
ok(await t.getByText('Supprimer la session r54z4 ?').isVisible(), 'session avec réponses : suppression confirmée d’abord')
await t.getByRole('button', { name: 'Supprimer', exact: true }).click()
await t.waitForTimeout(300)
ok((await t.locator('main').innerText()).includes('Aucune session.'), 'session supprimée')

// Caméra refusée : message clair, import toujours possible
const ctxR = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: !avecWebkit, hasTouch: true })
await ctxR.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
await ctxR.addInitScript(() => {
  if (sessionStorage.getItem('pret')) return
  sessionStorage.setItem('pret', '1')
  localStorage.setItem('copie:profil', JSON.stringify('enseignant'))
  localStorage.setItem('copie:pays', JSON.stringify('FR'))
  navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('refus', 'NotAllowedError'))
})
const r = await ctxR.newPage()
await r.goto(base)
await r.getByRole('button', { name: /Sessions partagées/ }).click({ timeout: 60_000 })
await r.getByRole('button', { name: 'Lire les QR codes' }).click()
await r.getByText(/Accès à la caméra refusé/).waitFor()
ok(true, 'caméra refusée : message qui propose d’importer des photos')
await r.getByRole('button', { name: 'Terminer' }).click()
ok(await r.getByRole('button', { name: 'Importer des photos ou des fichiers' }).isVisible(), 'import toujours proposé')

// ---------- Réglage de la session par l'enseignant, porté par le code ----------
async function avecParcours(profil) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: !avecWebkit, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(
    ([p, profil]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('copie:profil', JSON.stringify(profil))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:explorer', JSON.stringify([p]))
    },
    [parcours, profil],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${profil} : ${e.message}${process.env.PILE ? ' @ ' + (e.stack ?? '').split('\n').slice(0, 6).join(' < ') : ''}`))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
  await page.getByText('5e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Relatifs en classe/ }).first().click({ timeout: 30_000 })
  return page
}
const prof = await avecParcours('enseignant')
await prof.getByRole('button', { name: 'Autres actions' }).click()
await prof.getByRole('button', { name: 'Session partagée' }).click()
const interrupteur = prof.getByRole('switch', { name: 'QR code des réponses pour l’enseignant' })
ok(!(await interrupteur.isChecked()), 'enseignant : pas de QR code par défaut')
await guide(prof, 'sessions-1-interrupteur', interrupteur.locator('xpath=..'))
const codeDe = async () => (await prof.locator('main .font-light').filter({ hasText: /^[2-9a-z]{5}$/ }).first().innerText()).trim()
const codeSansQr = await codeDe()
await interrupteur.check()
ok(await prof.getByRole('radio', { name: 'Après la correction' }).isChecked(), 'QR code demandé : après la correction par défaut')
const casePrenom = prof.getByRole('switch', { name: 'Avec le prénom des élèves' })
ok(!(await casePrenom.isChecked()), 'enseignant : sans prénom par défaut')
const codeSansPrenom = await codeDe()
await casePrenom.check()
await prof.getByText(/jamais envoyé à une IA/).waitFor()
ok((await codeDe()) !== codeSansPrenom, 'avec le prénom : nouveau code')
await guide(prof, 'sessions-2c-prenom', casePrenom.locator('xpath=..'))
await casePrenom.uncheck()
await guide(prof, 'sessions-2-moment', prof.getByText('Avant la correction'))
await prof.getByText('Avant la correction').click()
await prof.getByText(/Pas de correction pendant la session/).waitFor()
await guide(prof, 'sessions-2b-code')
const codeAvant = await codeDe()
ok(codeAvant !== codeSansQr, `le choix change le code (${codeSansQr} → ${codeAvant})`)
ok(await prof.getByRole('button', { name: 'Relever les réponses des élèves' }).isVisible(), 'enseignant : « Relever les réponses des élèves » sous le code')

// La session créée est gardée : on peut partir et la relever plus tard
await prof.getByRole('button', { name: 'Revenir en arrière' }).click()
await prof.waitForTimeout(500)
await prof.reload()
await prof.getByRole('button', { name: /Sessions partagées/ }).click({ timeout: 60_000 })
const lignesSessions = prof.locator('main ul > li')
ok((await lignesSessions.count()) === 1, `une seule session gardée, celle du dernier réglage (${await lignesSessions.count()})`)
const ligneSession = (await lignesSessions.first().innerText()).replace(/\s+/g, ' ')
ok(ligneSession.includes(`Session ${codeAvant}`) && ligneSession.includes('Relatifs en classe') && ligneSession.includes('QR code avant la correction') && ligneSession.includes('Aucune réponse'), `session gardée après la sortie et le redémarrage (${ligneSession})`)
await guide(prof, 'sessions-6b-liste', lignesSessions.first())
await prof.screenshot({ path: `${captures}/${nom}-reponses-6b-sessions.png` })
await lignesSessions.first().getByRole('button', { name: /Relatifs en classe/ }).click()
const feuilleSession = prof.getByRole('dialog')
await feuilleSession.waitFor()
ok((await feuilleSession.innerText()).includes(codeAvant) && (await feuilleSession.getByRole('button', { name: 'Lire les QR codes' }).isVisible()), 'session sans réponse : son code et « Lire les QR codes »')
await guide(prof, 'sessions-6c-code', feuilleSession.getByRole('button', { name: 'Lire les QR codes' }))
await prof.screenshot({ path: `${captures}/${nom}-reponses-6c-code.png` })
await prof.goBack()
await prof.waitForTimeout(400)
await prof.evaluate(() => localStorage.setItem('theme', 'sombre'))
await prof.reload()
await prof.getByRole('button', { name: /Sessions partagées/ }).click({ timeout: 60_000 })
await prof.waitForTimeout(500)
await prof.screenshot({ path: `${captures}/${nom}-reponses-6b-sessions-sombre.png` })
await prof.getByRole('button', { name: `Supprimer la session ${codeAvant}` }).click()
await prof.waitForTimeout(300)
ok((await prof.locator('main').innerText()).includes('Aucune session.'), 'session sans réponse : supprimée d’un toucher sur la croix')
await prof.screenshot({ path: `${captures}/${nom}-reponses-6-session-enseignant.png` })
const eleveSession = await avecParcours('eleve')
await eleveSession.getByRole('button', { name: 'Autres actions' }).click()
await eleveSession.getByRole('button', { name: 'Session partagée' }).click()
ok(!(await eleveSession.getByRole('switch', { name: /QR code des réponses/ }).count()), 'élève qui crée une session : pas de réglage de QR code')

// Élève F : QR code avant la correction
const f = await avecParcours('eleve')
await f.getByRole('button', { name: 'Autres actions' }).click()
await f.getByRole('button', { name: 'Rejoindre une session' }).click()
await f.getByLabel('Code de session').fill(codeAvant)
await f.getByRole('button', { name: 'Rejoindre la session' }).click()
await f.locator('main math-field').first().waitFor({ timeout: 60_000 })
await f.waitForTimeout(500)
ok(!(await f.getByRole('button', { name: 'Vérifier' }).isVisible().catch(() => false)), 'avant la correction : aucune vérification pendant la session')
for (let rang = 0; rang < 6; rang++) {
  await saisir(f, rang === 0 ? '999' : await reponseAttendue(f, rang))
  await f.waitForTimeout(300)
  if (rang < 5) await suivante(f, rang)
  else await f.getByRole('button', { name: 'Soumettre la tentative' }).click()
}
await f.getByText('Avant tes résultats').waitFor({ timeout: 60_000 })
ok(!/\d+ \/ 6|Correction/.test(await f.locator('body').innerText()), 'après la soumission : QR code d’abord, ni score ni correction')
await f.screenshot({ path: `${captures}/${nom}-reponses-7-avant-qr.png` })
await guide(f, 'sessions-5-avant', f.getByRole('button', { name: 'C’est fait : voir mes résultats' }))
// Le retour ne dévoile rien : on revient au parcours, le QR code revient à la relecture
await f.getByRole('button', { name: 'Revenir en arrière' }).click()
await f.waitForTimeout(500)
ok(!(await f.getByText('Avant tes résultats').count()) && !/\d+ \/ 6/.test(await f.locator('main').innerText()), 'retour : pas de résultats dévoilés')
const passage = f.getByRole('button', { name: /QR code à montrer/ })
ok((await passage.count()) === 1, 'passages : « QR code à montrer » au lieu du score')
await passage.click()
await f.getByText('Avant tes résultats').waitFor({ timeout: 30_000 })
ok(true, 'relecture : le QR code passe d’abord')
await f.getByRole('button', { name: 'C’est fait : voir mes résultats' }).click()
await f.waitForTimeout(800)
ok(!(await f.getByText('Avant tes résultats').count()), 'C’est fait : résultats et corrections visibles')
ok(await f.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }).isVisible(), 'ensuite : le QR code reste disponible')
await f.screenshot({ path: `${captures}/${nom}-reponses-8-apres-qr.png` })

// Élève G : session sans QR code
const g = await avecParcours('eleve')
await g.getByRole('button', { name: 'Autres actions' }).click()
await g.getByRole('button', { name: 'Rejoindre une session' }).click()
await g.getByLabel('Code de session').fill(codeSansQr)
await g.getByRole('button', { name: 'Rejoindre la session' }).click()
await g.locator('main math-field').first().waitFor({ timeout: 60_000 })
await g.waitForTimeout(500)
for (let rang = 0; rang < 6; rang++) {
  await saisir(g, '1')
  const verif = g.getByRole('button', { name: 'Vérifier' })
  if (!(await verif.waitFor({ timeout: 15_000 }).then(() => true, () => false))) {
    await g.screenshot({ path: `${captures}/${nom}-echec-g-${rang}.png` })
    console.log(`  (élève G, question ${rang + 1} : ${(await g.locator('button:visible').allInnerTexts()).map((x) => x.trim()).filter(Boolean).slice(0, 6).join(' / ')})`)
  }
  await verif.click()
  await g.waitForTimeout(400)
  if (rang < 5) await suivante(g, rang)
  else await g.getByRole('button', { name: 'Voir le bilan' }).click()
}
await g.getByText(/\d+ \/ 6/).first().waitFor({ timeout: 30_000 })
ok(!(await g.getByRole('button', { name: 'Montrer mes réponses à l’enseignant' }).count()), 'session sans QR code : aucun bouton pour l’enseignant')

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
await camera.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
