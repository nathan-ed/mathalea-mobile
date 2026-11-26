// Impression de chaque parcours proposé (explorer/ et la démonstration), comme
// un élève : tuile de l'accueil, imprimante de la barre du haut, tout coché
// (exercices, fiches de cours, corrections), « Créer le PDF ». Le PDF est
// compilé par le Typst de l'ordinateur avec seulement les paquets et polices de
// l'app (comme impression.mjs) : un paquet manquant fait échouer la suite.
// Pourquoi (Nathan, 26 novembre 2026) : le PDF de « Additionner et soustraire
// des relatifs » échouait sur iPhone (« file not found (searched at
// typst.toml) », figures apigeom qui importent @preview/cetz:0.3.4), alors que
// impression.mjs ne jouait qu'un parcours de test sans figure.
//   CAPTURES=<dossier> [PARCOURS=id1,id2] node e2e/impression-parcours.mjs   (app construite sur 1420, typst 0.15.1 dans le PATH)
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

/** Typst sans réseau, comme l'app : aucun mandataire joignable */
const SANS_RESEAU = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/_proxy$/i.test(k)).concat(['HTTPS_PROXY', 'HTTP_PROXY', 'https_proxy', 'http_proxy', 'ALL_PROXY', 'all_proxy'].map((k) => [k, 'http://127.0.0.1:9'])))

/** Compilation comme dans l'app : seulement les paquets et les polices embarqués, sans réseau */
function compiler(source, fichiers) {
  const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'impression-parcours-'))
  writeFileSync(join(dossier, 'fiche.typ'), source)
  for (const [nom, b64] of Object.entries(fichiers)) {
    mkdirSync(dirname(join(dossier, nom)), { recursive: true })
    writeFileSync(join(dossier, nom), Buffer.from(b64, 'base64'))
  }
  const vide = join(dossier, 'cache-vide')
  mkdirSync(vide)
  try {
    execFileSync('typst', ['compile', '--root', dossier, '--ignore-system-fonts', '--ignore-embedded-fonts',
      '--font-path', join(racine, 'src-tauri/typst/polices'),
      '--package-path', join(racine, 'src-tauri/typst/paquets'), '--package-cache-path', vide,
      join(dossier, 'fiche.typ'), join(dossier, 'fiche.pdf')], { stdio: ['ignore', 'ignore', 'pipe'], env: SANS_RESEAU })
  } catch (e) {
    // Même message que l'app : la première erreur de Typst
    throw new Error(String(e.stderr ?? e.message).split('\n').find((l) => l.startsWith('error')) ?? 'compilation impossible')
  }
  // Typst télécharge en silence un paquet absent (c'est ainsi que le défaut est passé) : l'app, elle, échoue
  if (readdirSync(vide).length) throw new Error(`paquet absent de l'app, téléchargé par Typst : ${readdirSync(join(vide, 'preview')).join(', ')}`)
  return readFileSync(join(dossier, 'fiche.pdf')).toString('base64')
}

const fichiers = [...readdirSync(join(racine, 'explorer')).filter((f) => f.endsWith('.json')).map((f) => `explorer/${f}`), 'static/demo/parcours-demonstration.json']
const choisis = process.env.PARCOURS?.split(',')
const tous = fichiers.flatMap((f) =>
  (JSON.parse(readFileSync(join(racine, f), 'utf8')).classes ?? []).flatMap((c) => c.parcours.map((p) => ({ f, p }))),
).filter(({ p }) => !choisis || choisis.includes(p.id))
// Défauts déjà signalés (comme scripts/claviers/connus.json) : non bloquants
// pour les parcours listés, bloquants partout ailleurs
const connus = JSON.parse(readFileSync(join(racine, 'e2e/impression-connus.json'), 'utf8'))
const pays = (f) => (/explorer\/(ch-|evacom|prequalifiant)/.test(f) ? 'CH' : 'FR')

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
for (const { f, p } of tous) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(([p, pays]) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', 'clair')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify(pays))
    localStorage.setItem('copie:ajoutes', JSON.stringify([p]))
  }, [p, pays(f)])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${p.id} : ${e.message}`))
  await page.exposeFunction('__compilerPdf', (source, fichiers) => compiler(source, fichiers))
  try {
    await page.goto(base)
    await pagePrete(page)
    const tuile = page.getByRole('button', { name: new RegExp(`^${p.titre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).first()
    await tuile.waitFor({ timeout: 60_000 })
    await tuile.scrollIntoViewIfNeeded()
    const pt = await pointStable(tuile)
    await page.touchscreen.tap(pt.x, pt.y)
    await pagePrete(page)
    await page.locator('header').getByRole('button', { name: 'Imprimer' }).click()
    const panneau = page.getByRole('dialog')
    await panneau.getByText('Corrections à la fin').waitFor()
    const telechargement = page.waitForEvent('download', { timeout: 300_000 })
    await panneau.getByRole('button', { name: 'Créer le PDF' }).click()
    // Le PDF arrive, ou l'app affiche son message d'échec
    const echec = panneau.getByText(/n’a pas pu être créé|n'a pas pu être créé/)
    const issue = await Promise.race([telechargement.then(() => 'pdf'), echec.waitFor({ timeout: 300_000 }).then(() => 'echec')])
    if (issue === 'echec') {
      await page.screenshot({ path: `${captures}/impression-parcours-${p.id}-echec.png` })
      ok(false, `${p.id} : ${await echec.innerText()}`)
    } else {
      const fichier = await telechargement
      const chemin = join(captures, `impression-parcours-${p.id}.pdf`)
      await fichier.saveAs(chemin)
      const texte = execFileSync('pdftotext', ['-layout', chemin, '-'], { encoding: 'utf8' })
      const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [chemin], { encoding: 'utf8' }))?.[1])
      const defauts = [...new Set(texte.match(/[^\n]*(non convertie|image non)[^\n]*/gi) ?? [])].map((l) => l.trim())
      const nouveaux = defauts.filter((d) => !connus[d]?.parcours.includes(p.id))
      for (const d of defauts.filter((d) => !nouveaux.includes(d))) console.log(`  (défaut connu : ${d})`)
      ok(pages >= 1 && texte.includes('Corrections') && !nouveaux.length, `${p.id} : PDF de ${pages} page(s), corrections${nouveaux.length ? `, ${nouveaux.join(' ; ')}` : ', aucune nouvelle figure non convertie'}`)
    }
  } catch (e) {
    await page.screenshot({ path: `${captures}/impression-parcours-${p.id}-erreur.png` }).catch(() => {})
    ok(false, `${p.id} : ${e.message.split('\n')[0]}`)
  }
  await ctx.close()
}
ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(`${tous.length} parcours imprimés`)
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
