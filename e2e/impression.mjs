// Imprimer un parcours (élève) : imprimante de la barre du haut, à côté de l'épingle, exercices
// choisis, fiches de cours, corrections, deux versions, puis le PDF.
// Dans l'app, le PDF est compilé par le Typst embarqué (src-tauri/src/impression.rs) ;
// ici, par le Typst de l'ordinateur (même version), avec les mêmes paquets et
// les mêmes polices seulement (src-tauri/typst/), sans réseau.
// Sur l'app construite (vite preview, port 1420), téléphone (clair) et bureau (sombre).
//   CAPTURES=<dossier> node e2e/impression.mjs
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

/** Compilation comme dans l'app : seulement les paquets et les polices embarqués */
function compiler(source, fichiers) {
  const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'impression-'))
  writeFileSync(join(dossier, 'fiche.typ'), source)
  for (const [nom, b64] of Object.entries(fichiers)) {
    mkdirSync(dirname(join(dossier, nom)), { recursive: true })
    writeFileSync(join(dossier, nom), Buffer.from(b64, 'base64'))
  }
  const vide = join(dossier, 'cache-vide')
  mkdirSync(vide)
  execFileSync('typst', ['compile', '--root', dossier, '--ignore-system-fonts', '--ignore-embedded-fonts',
    '--font-path', join(racine, 'src-tauri/typst/polices'),
    '--package-path', join(racine, 'src-tauri/typst/paquets'), '--package-cache-path', vide,
    join(dossier, 'fiche.typ'), join(dossier, 'fiche.pdf')], { stdio: ['ignore', 'ignore', 'pipe'] })
  return readFileSync(join(dossier, 'fiche.pdf')).toString('base64')
}

const fiche = {
  titre: 'Le codage des figures',
  blocs: [
    { type: 'texte', texte: 'Deux segments de **même longueur** portent le même codage.' },
    { type: 'retenir', texte: 'Un angle droit se code par un petit carré.\n\n$$\\widehat{ABC} = 90^\\circ$$' },
    { type: 'exemple', titre: 'Exemple', enonce: 'Le triangle $ABC$ a deux côtés codés.', etapes: ['On lit le codage.', 'Il est **isocèle** en $A$.'] },
    { type: 'question', enonce: 'Combien de traits sur un segment ?', choix: ['Un', 'Deux'], bonne: 0, explication: 'Un seul.' },
    { type: 'graphique', fonctions: ['x^2/4'], x: [-3, 3], y: [-1, 3], legende: 'Une parabole', points: [{ x: 2, sur: 0, nom: 'A' }] },
  ],
}
const parcours = {
  id: 'impression-essai', version: 1, titre: 'Parcours à imprimer', objectif: '', niveau: '6e', theme: 'Géométrie', difficulte: 1, icone: 'bx-shape-triangle',
  presentation: 'une_question_par_page', correction: 'question', style: 'paliers',
  paliers: [{ titre: 'Figures', nb: 1, fiche }, { titre: 'Calcul', nb: 2, acces: 'libre' }],
  etapes: [
    { uuid: 'e8f0b', id: '6G0-3', titre: 'Utiliser le codage pour décrire ou illustrer une figure', nbQuestions: 2 },
    { uuid: 'cbc26', id: '5R20', titre: 'Additionner deux relatifs', nbQuestions: 3 },
    { uuid: 'f8f4e', id: '5N13', titre: 'Simplifier une fraction', nbQuestions: 3 },
  ],
}

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const appareils = [
  { nom: 'telephone', theme: 'clair', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { nom: 'bureau', theme: 'sombre', viewport: { width: 1200, height: 800 }, isMobile: false, hasTouch: false },
]

for (const a of appareils) {
  const ctx = await nav.newContext({ viewport: a.viewport, isMobile: a.isMobile, hasTouch: a.hasTouch, acceptDownloads: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(([p, theme]) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', theme)
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
    localStorage.setItem('copie:explorer', JSON.stringify([p]))
  }, [parcours, a.theme])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${a.nom} : ${e.message}`))
  await page.exposeFunction('__compilerPdf', (source, fichiers) => compiler(source, fichiers))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
  await page.getByText('6e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Parcours à imprimer/ }).first().click({ timeout: 30_000 })
  await pagePrete(page)

  // Imprimante dans la barre du haut, plus dans « Autres actions »
  const autres = page.getByRole('button', { name: 'Autres actions' })
  await autres.scrollIntoViewIfNeeded()
  const point = await pointStable(autres)
  if (a.hasTouch) await page.touchscreen.tap(point.x, point.y)
  else await page.mouse.click(point.x, point.y)
  await page.getByRole('dialog').waitFor()
  ok(!(await page.getByRole('dialog').getByRole('button', { name: 'Imprimer' }).count()), `${a.nom} : « Imprimer » n'est plus dans « Autres actions »`)
  await page.goBack()
  await page.getByRole('dialog').waitFor({ state: 'detached' })
  const imprimante = page.locator('header').getByRole('button', { name: 'Imprimer' })
  ok(await imprimante.isVisible(), `${a.nom} : imprimante dans la barre du haut`)
  await imprimante.click()
  const panneau = page.getByRole('dialog')
  await panneau.getByText('Corrections à la fin').waitFor()
  const interrupteurs = panneau.getByRole('switch')
  ok((await interrupteurs.count()) === 5, `${a.nom} : 3 exercices, fiches de cours et corrections proposés`)
  // Sans le deuxième exercice, en deux versions
  await panneau.getByRole('switch').nth(1).uncheck()
  await panneau.getByRole('radio', { name: '2' }).click()
  ok(await panneau.getByText('sujets A à B').isVisible(), `${a.nom} : deux versions annoncées`)
  await page.screenshot({ path: `${captures}/impression-${a.nom}-${a.theme}-panneau.png` })
  const telechargement = page.waitForEvent('download', { timeout: 120_000 })
  await panneau.getByRole('button', { name: 'Créer le PDF' }).click()
  const fichier = await telechargement
  ok(fichier.suggestedFilename() === 'parcours-a-imprimer.pdf', `${a.nom} : nom du fichier (${fichier.suggestedFilename()})`)
  const chemin = join(captures, `impression-${a.nom}.pdf`)
  await fichier.saveAs(chemin)
  const texte = execFileSync('pdftotext', ['-layout', chemin, '-'], { encoding: 'utf8' })
  const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [chemin], { encoding: 'utf8' }))?.[1])
  ok(texte.includes('Parcours à imprimer'), `${a.nom} : titre du parcours en tête`)
  ok(texte.includes('Le codage des figures') && texte.includes('petit carré') && texte.includes('isocèle'), `${a.nom} : fiche de cours imprimée`)
  ok(texte.includes('Sujet A') && texte.includes('Sujet B'), `${a.nom} : deux sujets`)
  ok(texte.includes('Corrections'), `${a.nom} : corrections à la fin`)
  ok(!texte.includes('relatifs') && /fraction/i.test(texte), `${a.nom} : seulement les exercices choisis`)
  ok(!/non convertie|image non/i.test(texte), `${a.nom} : aucune figure non convertie`)
  ok(pages >= 3, `${a.nom} : ${pages} pages`)
  execFileSync('pdftoppm', ['-r', '50', '-png', '-f', '1', '-l', '2', chemin, join(captures, `impression-${a.nom}-page`)])
  ok(!(await panneau.count()), `${a.nom} : panneau refermé après l'enregistrement`)

  // Depuis l'accueil : la tuile ouvre le parcours › imprimante de la barre du haut
  // (plus de « ⋯ » sur les tuiles : épingle et œil à la place)
  await page.getByRole('button', { name: 'Ajouter à l’accueil' }).click()
  await page.getByRole('button', { name: 'Ajouté à l’accueil' }).waitFor()
  await page.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(page)
  await page.getByRole('tab', { name: 'Mes parcours' }).click()
  await pagePrete(page)
  ok(!(await page.getByRole('button', { name: /^Actions pour/ }).count()), `${a.nom} : pas de « ⋯ » sur les tuiles de l'accueil`)
  await page.getByRole('button', { name: /^Parcours à imprimer/ }).first().click()
  await pagePrete(page)
  await page.locator('header').getByRole('button', { name: 'Imprimer' }).click()
  await page.getByRole('dialog').getByText('Corrections à la fin').waitFor()
  ok((await page.getByRole('dialog').getByRole('switch').count()) === 5, `${a.nom} : impression ouverte depuis l'accueil`)
  await page.screenshot({ path: `${captures}/impression-${a.nom}-${a.theme}-accueil.png` })
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
