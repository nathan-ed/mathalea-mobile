// Parcours écrit avec un MathALÉA plus récent que le moteur de l'app (Explorer
// lu sur le drive, parcours d'un enseignant fait sur le site) : MathALÉA rend
// un exercice inconnu vide. Aucune question connue : l'élève lit qu'il faut
// mettre l'app à jour (avant : écran vide), Quitter et le bouton retour le
// ramènent à la page du parcours, sans tentative « en cours ». Une partie
// connue : ses questions se font normalement. Téléphone (clair), bureau (sombre).
//   CAPTURES=<dossier> node e2e/exercice-inconnu.mjs
import { chromium } from 'playwright'
import { jusqua, pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const parcours = (id, titre, etapes) => ({
  id, version: 1, titre, objectif: 'Essai.', niveau: '5e', theme: 'Nombres relatifs', difficulte: 1, icone: 'bx-math',
  presentation: 'une_question_par_page', correction: 'question', auteurs: ['essai'], etapes,
})
const INCONNU = { uuid: 'zz9zz', id: 'ZZ-1', nbQuestions: 3, titre: 'Exercice d’un MathALÉA plus récent' }
const CONNU = { uuid: 'cbc26', id: '5N2G', nbQuestions: 2, titre: 'Additionner des relatifs' }
const tout = parcours('essai-inconnu', 'Exercices récents', [INCONNU])
const moitie = parcours('essai-moitie', 'Exercices mêlés', [CONNU, INCONNU])

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const texte = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
async function toucher(page, bouton) {
  await bouton.scrollIntoViewIfNeeded()
  await pointStable(bouton)
  await bouton.click()
  await pagePrete(page)
}
async function ouvrir(page, titre) {
  await toucher(page, page.getByRole('button', { name: new RegExp(`^\\s*${titre}`) }).first())
  await toucher(page, page.getByRole('button', { name: /^Commencer/ }).first())
}

const appareils = [
  { nom: 'téléphone clair', theme: 'clair', options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  { nom: 'bureau sombre', theme: 'sombre', options: { viewport: { width: 1280, height: 800 } } },
]
for (const a of appareils) {
  const s = a.theme === 'sombre' ? '-sombre' : ''
  const ctx = await nav.newContext({ ...a.options, colorScheme: a.theme === 'sombre' ? 'dark' : 'light' })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(([theme, liste]) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', theme)
    localStorage.setItem('copie:profil', '"eleve"')
    localStorage.setItem('copie:pays', '"FR"')
    localStorage.setItem('copie:sans-lien', 'true')
    localStorage.setItem('copie:ajoutes', JSON.stringify(liste))
  }, [a.theme, [tout, moitie]])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${a.nom}: ${e.message}`))
  await page.goto(base)
  await pagePrete(page)

  // Aucun exercice connu : message, pas d'écran vide
  await ouvrir(page, tout.titre)
  await jusqua(async () => (await texte(page)).includes('demandent une version plus récente de MathALÉA'), { quoi: 'message de mise à jour' })
  ok(!(await page.locator('main .contenu-mathalea').count()), `${a.nom} : exercices inconnus, l'élève lit qu'il faut mettre l'app à jour`)
  await page.screenshot({ path: `${captures}/inconnu-message${s}.png` })
  await toucher(page, page.getByRole('button', { name: 'Quitter' }))
  ok(await page.getByRole('button', { name: /^Commencer/ }).first().isVisible(), `${a.nom} : Quitter ramène à la page du parcours, sans question à confirmer`)
  ok(!(await page.evaluate((id) => localStorage.getItem(`copie:seance:${id}`), tout.id)), `${a.nom} : aucune tentative vide gardée`)

  // Bouton retour du téléphone : même chose
  await toucher(page, page.getByRole('button', { name: /^Commencer/ }).first())
  await jusqua(async () => (await texte(page)).includes('demandent une version plus récente'), { quoi: 'message, deuxième fois' })
  await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
  await pagePrete(page)
  ok(await page.getByRole('button', { name: /^Commencer/ }).first().isVisible(), `${a.nom} : bouton retour, page du parcours`)
  await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
  await pagePrete(page)
  ok(!(await texte(page)).includes('En cours'), `${a.nom} : rien « En cours » sur l'accueil`)

  // Partie connue : ses questions seulement
  await ouvrir(page, moitie.titre)
  await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 60_000 })
  await pagePrete(page)
  ok((await texte(page)).includes(`sur ${CONNU.nbQuestions}`) && !(await texte(page)).includes('version plus récente'), `${a.nom} : exercices mêlés, les ${CONNU.nbQuestions} questions connues se font`, (await texte(page)).slice(0, 200))
  await page.screenshot({ path: `${captures}/inconnu-moitie${s}.png` })
  await ctx.close()
}
await nav.close()
ok(!erreurs.length, 'aucune erreur de page', erreurs.join('\n'))
console.log(echecs ? `${echecs} échec(s)` : 'Exercice inconnu : tout vert')
process.exit(echecs ? 1 : 0)
