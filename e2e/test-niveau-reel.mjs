// « Teste ton niveau » parcouru comme un élève (pnpm dev seulement) : chaque
// question reçoit une vraie réponse (case cochée ou saisie au clavier), puis
// on touche « Question suivante ». À chaque question : bouton du bas visible
// et non recouvert, pas de score affiché avant la correction. Sur téléphone
// et dans une fenêtre de bureau. Puis bilan, suivi et suppression d'une
// tentative (retour aux niveaux, jamais la fiche d'un parcours). Enfin un
// parcours de l'Explorer : suivi sans être ajouté, exercice masqué absent.
//   CAPTURES=<dossier> NIVEAU=CM1 THEME=clair|sombre node e2e/test-niveau-reel.mjs
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const niveau = process.env.NIVEAU ?? 'CM1'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')

/** Le bouton est-il à l'écran et touchable (rien posé dessus) ? */
const touchable = (bouton) =>
  bouton.evaluate((b) => {
    const r = b.getBoundingClientRect()
    if (!r.width || !r.height || r.bottom > innerHeight || r.top < 0) return false
    const dessus = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!dessus && (dessus === b || b.contains(dessus))
  })

/** Une réponse à la question affichée : une case, un champ, sinon rien */
async function repondre(page, i) {
  const caseACocher = page.locator('main input[type="checkbox"]:visible, main input[type="radio"]:visible')
  if (await caseACocher.count()) return caseACocher.nth(i % (await caseACocher.count())).click({ force: true }), 'case'
  const champ = page.locator('main math-field:visible')
  if (await champ.count()) {
    await champ.first().click()
    await page.keyboard.type(String(i + 2))
    return 'champ'
  }
  const liste = page.locator('main select:visible')
  if (await liste.count()) return (await liste.first().selectOption({ index: 1 }).catch(() => {}), 'liste')
  return 'aucune'
}

const appareils = [
  { nom: 'telephone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { nom: 'bureau', viewport: { width: 900, height: 760 }, isMobile: false, hasTouch: false },
]

for (const a of appareils) {
  const ctx = await nav.newContext({ viewport: a.viewport, isMobile: a.isMobile, hasTouch: a.hasTouch })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((theme) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', theme)
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
  }, process.env.THEME ?? 'clair')
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${a.nom}: ${e.message}`))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click()
  await page.getByRole('button', { name: /^Teste ton niveau/ }).click({ timeout: 60_000 })
  const textesNiveaux = await texte(page)
  ok(!/course aux nombres|CAN/i.test(textesNiveaux), `${a.nom} : aucune mention de la CAN dans les niveaux`)
  await page.getByRole('button', { name: new RegExp(`^${niveau} · ceinture`) }).click({ timeout: 60_000 })
  await page.getByRole('dialog').getByRole('button', { name: 'Commencer' }).click()
  const onglets = page.getByRole('tablist', { name: 'Questions' })
  await onglets.waitFor({ timeout: 120_000 })
  const n = await onglets.getByRole('tab').count()
  const types = []
  for (let i = 0; i < n; i++) {
    await page.waitForTimeout(700)
    ok((await texte(page, 'body')).includes(`Question ${i + 1} sur ${n}`), `${a.nom} : question ${i + 1} affichée`)
    const score = await page.locator('header .pastille, header [class*="rounded-full"]').count()
    if (i === 0) ok(score === 0, `${a.nom} : pas de score avant la correction`)
    types.push(await repondre(page, i))
    await page.waitForTimeout(500)
    const libelle = i === n - 1 ? 'Soumettre la tentative' : 'Question suivante'
    const bouton = page.getByRole('button', { name: libelle })
    const visible = (await bouton.count()) === 1 && (await touchable(bouton))
    ok(visible, `${a.nom} : « ${libelle} » touchable après une réponse (${types[i]}) à la question ${i + 1}`)
    if (!visible) await page.screenshot({ path: `${captures}/reel-${a.nom}-q${i + 1}.png` })
    if (i < n - 1) {
      if (visible) await bouton.click()
      else await onglets.getByRole('tab').nth(i + 1).click()
    }
  }
  console.log(`  réponses : ${types.join(', ')}`)
  await page.getByRole('button', { name: 'Soumettre la tentative' }).click()
  const garde = page.getByRole('button', { name: 'Soumettre quand même' })
  await garde.click({ timeout: 3000 }).catch(() => {})
  await page.getByText(/obtenue|Il faut/).first().waitFor({ timeout: 120_000 })
  const bilan = await texte(page)
  ok(!/CAN|Course aux nombres|sujet 20/.test(bilan), `${a.nom} : bilan sans nom de sujet`)
  await page.screenshot({ path: `${captures}/reel-${a.nom}-bilan.png`, fullPage: true })

  // Suivi : le test y figure, avec sa ceinture
  await page.getByRole('button', { name: 'Retour aux niveaux' }).click()
  await page.goBack()
  await page.getByRole('tab', { name: 'Suivi' }).or(page.getByRole('button', { name: 'Suivi' })).first().click()
  await page.waitForTimeout(500)
  const suivi = await texte(page)
  ok(suivi.includes(`Teste ton niveau : ${niveau}`), `${a.nom} : le test figure dans le suivi`)
  await page.screenshot({ path: `${captures}/reel-${a.nom}-suivi.png`, fullPage: true })
  await page.getByRole('tab', { name: 'Ceintures' }).click()
  ok((await texte(page)).includes('Teste ton niveau'), `${a.nom} : ceintures du test dans le suivi`)
  await page.screenshot({ path: `${captures}/reel-${a.nom}-ceintures.png`, fullPage: true })

  // Nouvelle tentative supprimée : retour aux niveaux, pas la fiche d'un parcours
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click()
  await page.getByRole('button', { name: /^Teste ton niveau/ }).click()
  await page.getByRole('button', { name: new RegExp(`^${niveau} · ceinture`) }).click()
  await page.getByRole('dialog').getByRole('button').first().click()
  await onglets.waitFor({ timeout: 120_000 })
  await page.getByRole('button', { name: 'Quitter' }).click()
  await page.getByRole('button', { name: 'Supprimer la tentative' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click()
  await page.waitForTimeout(500)
  const apres = await texte(page, 'body')
  ok(apres.includes(`${niveau} · ceinture`) && !/Ajouter à l’accueil|sujet 20/.test(apres), `${a.nom} : après suppression, retour aux niveaux`)
  await ctx.close()
}

// Explorer : un parcours fait depuis l'Explorer compte dans le suivi ;
// un exercice masqué n'apparaît pas dans la fiche ; un test ajouté à l'accueil
// par la 0.3.1 en disparaît
{
  const etape = { uuid: '098c5', id: 'can6a-2026', titre: 'CAN 6e sujet 2026', nbQuestions: 1, sup: 'false', sup2: '1', sup3: 'false' }
  const p = {
    id: 'explorer-essai', version: 1, titre: 'Parcours Explorer', objectif: '', niveau: '6e', theme: 'Calcul', difficulte: 1, icone: 'bx-calculator',
    presentation: 'une_question_par_page', correction: 'parcours', enTetesMasques: true,
    etapes: [{ ...etape, titre: 'Calcul visible' }, { ...etape, sup2: '2', titreMasque: true }],
  }
  const test = { ...p, id: 'test-niveau-cm2', titre: 'Teste ton niveau : CM2', objectif: '15 questions de la Course aux nombres' }
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(([p, test]) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:explorer', JSON.stringify([p]))
    localStorage.setItem('copie:ajoutes', JSON.stringify([test]))
  }, [p, test])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`explorer: ${e.message}`))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Mes parcours' }).or(page.getByRole('button', { name: 'Mes parcours' })).first().waitFor({ timeout: 60_000 })
  await page.waitForTimeout(800)
  ok(!(await texte(page, 'body')).includes('Teste ton niveau : CM2'), 'ancien test ajouté à l’accueil : retiré')
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click()
  await page.getByText('6e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Calcul/ }).first().click()
  await page.getByRole('button', { name: /^Parcours Explorer/ }).first().click({ timeout: 30_000 })
  const fiche = await texte(page)
  ok(fiche.includes('Calcul visible') && !/Exercice 2|CAN 6e/.test(fiche), 'fiche : exercice masqué absent')
  await page.screenshot({ path: `${captures}/reel-fiche-masque.png` })
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  const onglets = page.getByRole('tablist', { name: 'Questions' })
  await onglets.waitFor({ timeout: 120_000 })
  await onglets.getByRole('tab').last().click()
  await page.getByRole('button', { name: 'Soumettre la tentative' }).click()
  await page.getByRole('button', { name: 'Soumettre quand même' }).click({ timeout: 5000 }).catch(() => {})
  await page.getByRole('button', { name: 'Voir le bilan' }).click({ timeout: 120_000 })
  await page.waitForTimeout(500)
  // Un retour à la fois : l'app remet son entrée d'historique entre deux
  await page.goBack()
  await page.waitForTimeout(300)
  await page.goBack()
  await page.waitForTimeout(300)
  await page.getByRole('tab', { name: 'Suivi' }).or(page.getByRole('button', { name: 'Suivi' })).first().click()
  await page.waitForTimeout(500)
  ok((await texte(page)).includes('Parcours Explorer'), 'suivi : parcours fait depuis l’Explorer')
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
