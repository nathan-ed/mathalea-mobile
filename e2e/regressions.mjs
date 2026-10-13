// Défauts corrigés après l'audit d'octobre 2026, rejoués dans le navigateur.
// Prérequis : serveur de dev (pnpm dev). Aucun dossier partagé : les données
// de l'élève sont écrites directement dans le stockage du navigateur.
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

const etape = (id, uuid) => ({ uuid, id, nbQuestions: 2, titre: `Exercice ${id}` })
const parcours = (id, correction, etapes) => ({
  id,
  version: 1,
  presentation: 'une_question_par_page',
  correction,
  titre: `Audit ${id}`,
  objectif: '',
  niveau: '5e',
  theme: 'Audit',
  difficulte: 1,
  icone: 'bx-calculator',
  etapes,
})

/** Élève avec une seule classe (contenu affiché directement) ; stockage préparé avant le chargement */
async function eleve(nom, liste, extra = {}) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  const donnees = {
    profil: 'eleve',
    pays: 'FR',
    classes: [{ lien: 'http://127.0.0.1:9/audit/', nom: 'Audit', disponibles: ['Audit'], parcours: liste }],
    ...extra,
  }
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, donnees)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.goto(base)
  return page
}
const lire = (page, cle) => page.evaluate((c) => JSON.parse(localStorage.getItem(`copie:${c}`)), cle)
const ouvrir = async (page, titre) => {
  await page.getByRole('button', { name: new RegExp(`^\\s*${titre}`) }).first().click()
  await page.getByRole('button', { name: /^(Commencer|Continuer)$/ }).click()
  await page.locator('main math-field').first().waitFor({ timeout: 20000 })
}
// Vraie frappe clavier dans le champ MathLive, répétée tant que le champ n'est pas prêt
const taper = async (page, texte) => {
  const champ = page.locator('main math-field').first()
  for (let i = 0; i < 20; i++) {
    await champ.click()
    await page.keyboard.type(texte)
    if ((await champ.evaluate((el) => el.value)) === texte) return
    await champ.evaluate((el) => el.setValue(''))
    await page.waitForTimeout(250)
  }
  throw new Error('Champ de réponse jamais prêt')
}

// 1. Réponse tapée puis question quittée aussitôt : le brouillon est gardé
{
  const page = await eleve('brouillon', [parcours('brouillon', 'parcours', [etape('5R20', 'cbc26')])])
  await ouvrir(page, 'Audit brouillon')
  await taper(page, '42')
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await page.waitForTimeout(400)
  const s = await lire(page, 'seance:brouillon')
  ok(Object.values(s.brouillons['0-0'] ?? {}).includes('42'), 'brouillon enregistré malgré un changement de question immédiat', JSON.stringify([s.position, s.brouillons]))
}

// 2. Correction à la fin du parcours : Entrée ne révèle rien
{
  const page = await eleve('entree', [parcours('entree', 'parcours', [etape('5R20', 'cbc26')])])
  await ouvrir(page, 'Audit entree')
  await taper(page, '42')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(600)
  const s = await lire(page, 'seance:entree')
  ok(s.essais.length === 0, 'Entrée ne vérifie pas la réponse avant la soumission')
  ok((await page.getByText('Correction', { exact: true }).count()) === 0, 'aucune correction affichée avant la soumission')
  ok(s.position === 1, 'Entrée passe à la question suivante', JSON.stringify([s.position, s.brouillons]))
}

// 3. Suivi : séance d'une ancienne version plus longue, et même exercice deux fois
{
  const ancienne = parcours('suivi', 'question', [etape('5R20', 'cbc26'), etape('5R21', 'b6982'), etape('5R20', 'cbc26')])
  const actuelle = { ...ancienne, version: 2, etapes: [ancienne.etapes[0]] }
  const essai = (e, q) => ({ etape: e, question: q, juste: false, points: 0, total: 1, reponses: {}, le: new Date().toISOString() })
  const seance = {
    parcours: 'suivi',
    contenu: ancienne,
    type: 'complet',
    etapes: [0, 1, 2],
    moteur: 'essai',
    graines: { 0: 'a', 1: 'b', 2: 'c' },
    nbQuestions: { 0: 2, 1: 2, 2: 2 },
    position: 0,
    brouillons: {},
    essais: [essai(0, 0), essai(1, 0), essai(2, 0)],
    debut: new Date().toISOString(),
    fin: new Date().toISOString(),
  }
  const page = await eleve('suivi', [actuelle], { 'historique:suivi': [seance] })
  await page.getByRole('tab', { name: 'Suivi' }).click()
  await page.getByText('À retravailler').waitFor({ timeout: 10000 })
  const t = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  ok(t.includes('Exercice 5R21'), 'le suivi lit les exercices dans la copie figée de la séance')
  ok((t.match(/Exercice 5R20/g) ?? []).length === 2, 'un même exercice présent deux fois a deux lignes')
}

ok(erreurs.length === 0, `aucune erreur JS ${erreurs.slice(0, 3).join(' | ')}`)
console.log(echecs ? `${echecs} échec(s)` : 'TOUT VERT')
await nav.close()
if (echecs) process.exitCode = 1
