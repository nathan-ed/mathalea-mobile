// Auteurs et descriptions d'un parcours (pnpm dev seulement). Enseignant : les
// trois champs remplis au clavier dans l'éditeur (virgule finale tapable),
// enregistrés, puis affichés sur la page du parcours ; repris à la
// modification ; vidés, ils disparaissent du fichier. Élève : « Rédigé par » et
// la description pour les élèves, jamais celle des enseignants. Téléphone
// (clair, sombre) et bureau. Captures : CAPTURES=<dossier>.
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
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
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

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
const texte = async (page) => (await page.locator('main').innerText()).replace(/\s+/g, ' ')
const retour = async (page) => {
  await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(400)
}
const enregistre = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')).parcours[0].parcours)

for (const [appareil, sombre] of [['telephone', false], ['telephone', true], ['bureau', false]]) {
  const s = `${appareil}-${sombre ? 'sombre' : 'clair'}`
  // ---------- Enseignant ----------
  const { ctx, page: t } = await ouvrir(appareil, sombre, {
    profil: 'enseignant',
    pays: 'FR',
    bibliotheque: { classes: [{ nom: '5e A' }], parcours: [{ parcours, classes: ['5e A'], exportee: {} }] },
  })
  const surFiche = () => t.getByRole('button', { name: 'Lancer une session' }).isVisible()
  await t.getByRole('button', { name: /^\s*Relatifs express/ }).first().click({ timeout: 60_000 })
  await t.getByRole('button', { name: 'Lancer une session' }).waitFor()
  ok(!(await texte(t)).includes('Rédigé par'), `${s} : sans auteur, rien d’écrit`)

  const modifier = async () => {
    await t.getByRole('button', { name: 'Modifier' }).click()
    await t.getByRole('heading', { name: 'Modifier le parcours' }).waitFor()
  }
  const enregistrer = async () => {
    await t.getByRole('button', { name: 'Enregistrer et quitter' }).click()
    await t.waitForTimeout(600)
    // Panneau d'export proposé après l'enregistrement : refermé par retour
    for (let i = 0; i < 3 && !(await surFiche()); i++) await retour(t)
  }

  await modifier()
  const auteurs = t.getByLabel('Auteurs (séparés par des virgules)')
  await auteurs.click()
  await t.keyboard.type('Ana, Ben; ')
  ok((await auteurs.inputValue()) === 'Ana, Ben; ', `${s} : la virgule finale reste dans le champ`, await auteurs.inputValue())
  await t.keyboard.type('Ana')
  await t.getByLabel('Description pour les élèves').fill(ELEVES)
  await t.getByLabel(/Description pour les enseignants/).fill(PROFS)
  await t.waitForTimeout(200)
  if (appareil === 'telephone') await t.screenshot({ path: `${captures}/auteurs-1-editeur-${s}.png` })
  await enregistrer()
  ok(await surFiche(), `${s} : retour à la page du parcours après l’enregistrement`)
  let p = await enregistre(t)
  ok(JSON.stringify(p.auteurs) === '["Ana","Ben"]', `${s} : auteurs enregistrés sans doublon`, JSON.stringify(p.auteurs))
  ok(p.descriptionEleves === ELEVES && p.descriptionEnseignant === PROFS, `${s} : descriptions enregistrées`)
  const fiche = await texte(t)
  ok(fiche.includes('Rédigé par Ana et Ben'), `${s} : page du parcours, « Rédigé par Ana et Ben »`, fiche.slice(0, 300))
  ok(fiche.includes(`Pour les élèves ${ELEVES}`) && fiche.includes(`Pour les enseignants ${PROFS}`), `${s} : page du parcours, les deux descriptions`)
  await t.screenshot({ path: `${captures}/auteurs-2-fiche-${s}.png` })

  // Reprise à la modification, puis champs vidés
  await modifier()
  ok((await t.getByLabel('Auteurs (séparés par des virgules)').inputValue()) === 'Ana, Ben', `${s} : auteurs repris dans l’éditeur`)
  ok((await t.getByLabel('Description pour les élèves').inputValue()) === ELEVES, `${s} : description reprise dans l’éditeur`)
  await t.getByLabel('Auteurs (séparés par des virgules)').fill('')
  await t.getByLabel('Description pour les élèves').fill('   ')
  await t.getByLabel(/Description pour les enseignants/).fill('')
  await enregistrer()
  p = await enregistre(t)
  ok(!('auteurs' in p) && !('descriptionEleves' in p) && !('descriptionEnseignant' in p), `${s} : champs vidés absents du parcours`, JSON.stringify(Object.keys(p)))
  ok(!(await texte(t)).includes('Rédigé par'), `${s} : plus de « Rédigé par » une fois vidé`)
  await ctx.close()

  // ---------- Élève ----------
  const complet = { ...parcours, auteurs: ['l’équipe CoopMaths', 'Nathan Scheinmann'], descriptionEleves: ELEVES, descriptionEnseignant: PROFS }
  const { ctx: ce, page: e } = await ouvrir(appareil, sombre, {
    profil: 'eleve',
    pays: 'FR',
    classes: [{ lien: 'https://kdrive.infomaniak.com/app/share/1/essai', nom: '5e A', disponibles: ['5e A'], parcours: [complet] }],
  })
  await e.getByRole('button', { name: /^\s*Relatifs express/ }).first().click({ timeout: 60_000 })
  await e.getByRole('button', { name: /Commencer/ }).first().waitFor()
  const vue = await texte(e)
  ok(vue.includes('Rédigé par l’équipe CoopMaths et Nathan Scheinmann'), `${s} : élève, « Rédigé par »`, vue.slice(0, 300))
  ok(vue.includes(ELEVES), `${s} : élève, description pour les élèves`)
  ok(!vue.includes(PROFS) && !vue.includes('Pour les enseignants'), `${s} : élève, jamais la description des enseignants`)
  await e.screenshot({ path: `${captures}/auteurs-3-eleve-${s}.png` })
  await ce.close()
}
ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
