// Auteurs et descriptions d'un parcours (fichier préparé sur le site
// MathALÉA) : l'élève voit « Rédigé par » et la description pour les élèves,
// jamais celle des enseignants ; sans auteur, rien d'écrit. Téléphone (clair,
// sombre) et bureau. Captures : CAPTURES=<dossier>.
import { chromium } from 'playwright'
import { SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const parcours = {
  id: 'auteurs-essai', version: 1, titre: 'Relatifs express', objectif: 'Additionner des relatifs sans hésiter.', niveau: '5e', theme: 'Nombres relatifs', difficulte: 2, icone: 'bx-math',
  presentation: 'une_question_par_page', correction: 'question',
  etapes: [{ uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 }],
}
const ELEVES = 'Deux exercices pour additionner des relatifs.'
const PROFS = 'Prérequis : droite graduée. Compter 15 minutes.'
const appareils = {
  telephone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  bureau: { viewport: { width: 1100, height: 800 } },
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

async function ouvrir(appareil, sombre, stockage) {
  const ctx = await nav.newContext({ ...appareils[appareil], colorScheme: sombre ? 'dark' : 'light' })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((stockage) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(stockage)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, stockage)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${appareil} : ${e.message}`))
  await page.goto(base)
  return { ctx, page }
}
// Capture après le glissement d'entrée de l'écran (180 ms, app.css). Une
// animation annulée (élément retiré, machine chargée) rejette `finished` : elle
// est finie aussi
const finAnimations = (p) => p.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))))
const texte = async (page) => (await page.locator('main').innerText()).replace(/\s+/g, ' ')

const lienEssai = 'https://kdrive.infomaniak.com/app/share/1/essai'
for (const [appareil, sombre] of [['telephone', false], ['telephone', true], ['bureau', false]]) {
  const s = `${appareil}-${sombre ? 'sombre' : 'clair'}`
  // Sans auteur ni description : rien d'écrit
  const { ctx: c0, page: e0 } = await ouvrir(appareil, sombre, {
    profil: 'eleve',
    pays: 'FR',
    classes: [{ lien: lienEssai, nom: '5e A', disponibles: ['5e A'], parcours: [parcours] }],
  })
  await e0.getByRole('button', { name: /^\s*Relatifs express/ }).first().click({ timeout: 60_000 })
  await e0.getByRole('button', { name: /Commencer/ }).first().waitFor()
  ok(!(await texte(e0)).includes('Rédigé par'), `${s} : sans auteur, rien d’écrit`)
  await c0.close()

  // Fichier du site avec auteurs et les deux descriptions
  const complet = { ...parcours, auteurs: ['l’équipe CoopMaths', 'Nathan Scheinmann'], descriptionEleves: ELEVES, descriptionEnseignant: PROFS }
  const { ctx: ce, page: e } = await ouvrir(appareil, sombre, {
    profil: 'eleve',
    pays: 'FR',
    classes: [{ lien: lienEssai, nom: '5e A', disponibles: ['5e A'], parcours: [complet] }],
  })
  await e.getByRole('button', { name: /^\s*Relatifs express/ }).first().click({ timeout: 60_000 })
  await e.getByRole('button', { name: /Commencer/ }).first().waitFor()
  const vue = await texte(e)
  ok(vue.includes('Rédigé par l’équipe CoopMaths et Nathan Scheinmann'), `${s} : élève, « Rédigé par »`, vue.slice(0, 300))
  ok(vue.includes(ELEVES), `${s} : élève, description pour les élèves`)
  ok(!vue.includes(PROFS) && !vue.includes('Pour les enseignants'), `${s} : élève, jamais la description des enseignants`)
  await finAnimations(e)
  await e.screenshot({ path: `${captures}/auteurs-eleve-${s}.png` })
  await ce.close()
}
ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
