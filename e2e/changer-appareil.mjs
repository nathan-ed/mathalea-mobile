// Changement de téléphone, comme un élève (pnpm dev seulement). Sur l'ancien
// téléphone : un parcours terminé au clavier, un autre commencé puis laissé
// (« Reprendre plus tard »), puis « Exporter une sauvegarde ». Sur un
// téléphone neuf : « Récupérer mes données » dès le premier écran, aperçu,
// puis la séance en cours reprend à la bonne question et se termine ;
// suivi et parcours terminés retrouvés. Fichier invalide : rien ne change.
//   CAPTURES=<dossier> node e2e/changer-appareil.mjs
// Autre serveur que celui de pnpm dev : BASE=http://localhost:1431/.
import { chromium } from 'playwright'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(tmpdir(), 'changer-appareil-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcours = (id, titre, uuid, exo, objectif, nbQuestions) => ({
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
  melanger: true,
  etapes: [{ uuid, id: exo, titre: `${exo} - ${objectif}`, nbQuestions, objectifs: [objectif] }],
})
const additions = parcours('ca-additions', 'Additions de relatifs', 'cbc26', '5N2G', 'Additionner des relatifs', 2)
const soustractions = parcours('ca-soustractions', 'Soustractions de relatifs', '36e2a', '5N2H', 'Soustraire des relatifs', 3)

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
async function telephone(nom, avant, sombre = false) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true, colorScheme: sombre ? 'dark' : 'light' })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  if (avant) await ctx.addInitScript(avant[0], avant[1])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  await page.goto(base)
  return page
}
const texte = async (p, sel = 'main') => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ')

/** Réponse attendue par MathALÉA pour la question affichée (rang dans l'ordre mélangé) */
const reponseAttendue = (page, id, rang) =>
  page.evaluate(
    async ({ id, rang }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      const [e, q] = s.ordre[rang].split('-').map(Number)
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { id, rang },
  )

async function saisir(page, latex) {
  await page
    .waitForFunction(() => document.querySelectorAll('main math-field').length === 1 && !!document.querySelector('main math-field[data-listener-added]'), null, { timeout: 15_000 })
    .catch(() => {})
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
    if (pris && (await page.waitForTimeout(300), await page.locator('main math-field').last().evaluate((el, v) => el.value === v, latex).catch(() => false))) return
    await page.waitForTimeout(250)
  }
  throw new Error(`saisie impossible : ${latex}`)
}

/** Répond aux questions de `debut` à `fin` (exclue) d'une séance de `total` questions */
async function repondre(page, id, debut, fin, total, faux = []) {
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await page.waitForTimeout(500)
  for (let rang = debut; rang < fin; rang++) {
    await page.getByText(`Question ${rang + 1} sur ${total}`).waitFor({ timeout: 30_000 })
    await saisir(page, faux.includes(rang) ? '999' : await reponseAttendue(page, id, rang))
    await page.getByRole('button', { name: 'Vérifier' }).click()
    await page.waitForTimeout(400)
    if (rang < total - 1) {
      const btn = page.getByRole('button', { name: 'Question suivante' })
      for (let essai = 0; essai < 20 && !(await page.getByText(`Question ${rang + 2} sur ${total}`).isVisible().catch(() => false)); essai++) {
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {})
        await page.waitForTimeout(400)
      }
    } else await page.getByRole('button', { name: 'Voir le bilan' }).click()
  }
}

async function ouvrir(page, p) {
  await page.getByRole('tab', { name: 'Explorer' }).click({ timeout: 60_000 })
  await page.getByText('5e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
  await page.getByRole('button', { name: new RegExp(`^${p.titre}`) }).first().click({ timeout: 30_000 })
}

// ---------- Ancien téléphone ----------
const a = await telephone('ancien', [
  (explorer) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
    localStorage.setItem('copie:explorer', JSON.stringify(explorer))
  },
  [additions, soustractions],
])
await ouvrir(a, additions)
await a.getByRole('button', { name: 'Commencer' }).click()
await repondre(a, additions.id, 0, 2, 2, [1])
await a.getByText('1 / 2').first().waitFor({ timeout: 30_000 })
ok(true, 'ancien téléphone : additions terminées (1 / 2)')
await a.getByRole('button', { name: 'Retour à l’accueil' }).click()
await a.waitForTimeout(500)
// Soustractions : deux questions sur trois, puis « Reprendre plus tard »
await ouvrir(a, soustractions)
await a.getByRole('button', { name: 'Commencer' }).click()
await repondre(a, soustractions.id, 0, 2, 3)
await a.getByText('Question 3 sur 3').waitFor()
const ordreAncien = await a.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).ordre, soustractions.id)
await a.getByRole('button', { name: 'Quitter', exact: true }).click()
await a.getByRole('button', { name: 'Reprendre plus tard' }).click()
await a.waitForTimeout(500)
for (let i = 0; i < 5 && !(await a.getByRole('button', { name: 'Réglages' }).isVisible().catch(() => false)); i++) {
  await a.getByRole('button', { name: 'Revenir en arrière' }).first().click().catch(() => {})
  await a.waitForTimeout(300)
}
await a.getByRole('button', { name: 'Réglages' }).click()
ok((await texte(a)).includes('Pour changer d’appareil : exportez une sauvegarde'), 'réglages : la marche à suivre pour changer d’appareil')
await a.getByRole('heading', { name: 'Sauvegarde' }).scrollIntoViewIfNeeded()
await a.screenshot({ path: `${captures}/changer-1-reglages.png` })
const [dl] = await Promise.all([a.waitForEvent('download'), a.getByRole('button', { name: 'Exporter une sauvegarde' }).click()])
const fichier = join(dossier, dl.suggestedFilename())
await dl.saveAs(fichier)
ok(/^sauvegarde-mathalea-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), `sauvegarde exportée (${dl.suggestedFilename()})`)
ok((await a.getByRole('status').first().innerText()).includes('enregistré'), 'export : confirmation affichée')

// ---------- Téléphone neuf : fichier invalide d'abord ----------
const b = await telephone('neuf')
await b.getByRole('button', { name: /France/ }).waitFor({ timeout: 60_000 })
ok(await b.getByRole('button', { name: /Récupérer mes données/ }).isVisible(), 'premier lancement : « Récupérer mes données » proposé')
await b.screenshot({ path: `${captures}/changer-2-premier-lancement.png` })
const faux = join(dossier, 'pas-une-sauvegarde.json')
writeFileSync(faux, JSON.stringify({ format: 'parcours-mathalea/1' }))
let [choix] = await Promise.all([b.waitForEvent('filechooser'), b.getByRole('button', { name: /Récupérer mes données/ }).click()])
await choix.setFiles(faux)
await b.getByRole('alert').waitFor()
ok((await b.getByRole('alert').innerText()).includes('n’est pas une sauvegarde MathALÉA') && (await b.getByRole('button', { name: /France/ }).isVisible()), 'fichier invalide : message, on reste au premier écran')
const abime = join(dossier, 'abimee.json')
writeFileSync(abime, JSON.stringify({ format: 'sauvegarde-mathalea/1', creeeLe: '2026-10-27T10:00:00Z', donnees: { profil: 'eleve', 'seance:x': { contenu: 1 } } }))
;[choix] = await Promise.all([b.waitForEvent('filechooser'), b.getByRole('button', { name: /Récupérer mes données/ }).click()])
await choix.setFiles(abime)
await b.waitForTimeout(300)
ok((await b.getByRole('alert').innerText()).includes('Sauvegarde endommagée') && !(await b.getByRole('dialog').count()), 'sauvegarde endommagée : refusée avant tout aperçu')
// Vraie sauvegarde : aperçu, puis Annuler, puis Récupérer
;[choix] = await Promise.all([b.waitForEvent('filechooser'), b.getByRole('button', { name: /Récupérer mes données/ }).click()])
await choix.setFiles(fichier)
await b.getByText('Récupérer ces données ?').waitFor()
const apercu = await texte(b, '[role=dialog]')
ok(/Sauvegarde du .* : 1 passage terminé, 1 séance en cours\./.test(apercu) && !apercu.includes('0 dossier') && !apercu.includes('remplacé'), `aperçu : passages et séance en cours, rien à remplacer (${apercu})`)
ok(!(await b.getByRole('alert').count()), 'aperçu : ancien message d’erreur effacé')
await b.screenshot({ path: `${captures}/changer-3-apercu.png` })
await b.getByRole('button', { name: 'Annuler', exact: true }).click()
ok(await b.getByRole('button', { name: /France/ }).isVisible(), 'annuler : rien ne change')
;[choix] = await Promise.all([b.waitForEvent('filechooser'), b.getByRole('button', { name: /Récupérer mes données/ }).click()])
await choix.setFiles(fichier)
await b.getByRole('button', { name: 'Récupérer', exact: true }).click()
await b.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
ok(true, 'récupéré : l’accueil de l’élève s’ouvre')

// La séance en cours reprend où elle en était, avec les mêmes questions
await ouvrir(b, soustractions)
// Page du parcours en cours : « Continuer » rouvre sa séance
await b.getByRole('button', { name: 'Continuer', exact: true }).click({ timeout: 30_000 })
await b.getByText('Question 3 sur 3').waitFor({ timeout: 60_000 })
ok((await texte(b, 'body')).includes('2/3'), 'soustractions : la séance reprend à la question 3, deux réponses déjà faites')
await b.screenshot({ path: `${captures}/changer-4-reprise.png` })
const ordreNeuf = await b.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).ordre, soustractions.id)
ok(JSON.stringify(ordreNeuf) === JSON.stringify(ordreAncien), 'mêmes questions dans le même ordre que sur l’ancien téléphone')
await repondre(b, soustractions.id, 2, 3, 3)
await b.getByText('3 / 3').first().waitFor({ timeout: 30_000 })
ok(true, 'séance terminée sur le nouveau téléphone (3 / 3)')
await b.getByRole('button', { name: 'Retour à l’accueil' }).click()
await b.waitForTimeout(500)
// Parcours terminé sur l'ancien téléphone : retrouvé
await ouvrir(b, additions)
ok((await texte(b)).includes('50 %') || (await texte(b)).includes('1 / 2'), `additions : résultat de l’ancien téléphone retrouvé (${(await texte(b)).slice(0, 160)})`)
for (let i = 0; i < 5 && !(await b.getByRole('tab', { name: 'Suivi' }).isVisible().catch(() => false)); i++) {
  await b.getByRole('button', { name: 'Revenir en arrière' }).first().click().catch(() => {})
  await b.waitForTimeout(300)
}
await b.getByRole('tab', { name: 'Suivi' }).click()
await b.waitForTimeout(800)
const suivi = await texte(b)
ok(suivi.includes('Additions de relatifs') && suivi.includes('Soustractions de relatifs'), 'suivi : les deux parcours')
await b.screenshot({ path: `${captures}/changer-5-suivi.png` })

// Sombre : premier écran et aperçu
const s = await telephone('sombre', null, true)
await s.getByRole('button', { name: /France/ }).waitFor({ timeout: 60_000 })
await s.screenshot({ path: `${captures}/changer-2-premier-lancement-sombre.png` })
;[choix] = await Promise.all([s.waitForEvent('filechooser'), s.getByRole('button', { name: /Récupérer mes données/ }).click()])
await choix.setFiles(fichier)
await s.getByText('Récupérer ces données ?').waitFor()
await s.screenshot({ path: `${captures}/changer-3-apercu-sombre.png` })

ok(!erreurs.length, `aucune erreur JS ${erreurs.join(' | ')}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
