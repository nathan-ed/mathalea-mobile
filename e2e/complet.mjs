// Parcours complet de l'app sur trois appareils d'élèves simulés (format
// téléphone) ; le fichier de l'enseignant est celui que prépare le site.
// Prérequis : serveur de dev (pnpm dev) et dossier partagé local
// (cd ../spike-sync && pnpm server <DOSSIER>), DOSSIER étant passé en variable.
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { pagePrete, SANS_BRIDAGE, jusqua } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossierPartage = process.env.DOSSIER // racine servie par le lien public local
const lienClasse = 'http://127.0.0.1:8702/s/Xk42demo/classe-3a/'
const lienTest = 'http://127.0.0.1:8702/s/Xk42demo/test/'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

async function appareil(nom) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.goto(base)
  return page
}
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const cap = (page, n) => page.screenshot({ path: `${captures}/complet-${n}.png` })

/** Réponse attendue par MathALÉA (exercice régénéré avec la graine de la séance) */
const reponseAttendue = (page, parcours, e, q) =>
  page.evaluate(
    async ({ parcours, e, q }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${parcours}`))
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { parcours, e, q },
  )
const saisir = (page, i, latex) =>
  page.locator('main math-field').nth(i).evaluate((el, v) => {
    el.setValue(v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, latex)
// Une seule classe : ses parcours sont directement à l'accueil, par chapitre
const parcoursDeTest = async (page, nom) => {
  await page.getByRole('button', { name: new RegExp(`^\\s*${nom}`) }).first().click()
}
const rejoindreClasseTest = async (page) => {
  await page.getByLabel('Lien de partage donné par ton enseignant').fill(lienTest)
  await page.getByRole('button', { name: 'Ajouter le dossier' }).click()
  await page.getByRole('button', { name: /^\s*Classe test/ }).click()
  await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().waitFor()
}
const accueil = async (page) => {
  // Accueil : la barre porte le bouton Réglages (les onglets du bas restent visibles partout)
  for (let i = 0; i < 5 && !(await page.getByRole('button', { name: 'Réglages' }).isVisible().catch(() => false)); i++) {
    // Panneau du bas ouvert : un toucher à côté le referme
    if (await page.locator('.feuille-fond').isVisible()) {
      await page.locator('.feuille-fond').click({ position: { x: 20, y: 20 } })
      await pagePrete(page)
    }
    await page.getByRole('button', { name: /Revenir en arrière|Quitter/ }).first().click()
    await pagePrete(page)
    // Séance : la croix propose de reprendre plus tard
    if (await page.getByRole('button', { name: 'Reprendre plus tard' }).isVisible()) await page.getByRole('button', { name: 'Reprendre plus tard' }).click()
  }
}
const enonce = (page) => page.locator('main').innerText().then((t) => t.replace(/\s+/g, ' ').slice(0, 160))

// ---------- Élève A ----------
const a = await appareil('A')
await a.getByRole('button', { name: /France/ }).click()
await a.getByRole('tab', { name: 'Mes parcours' }).waitFor()
ok(await a.getByLabel('Lien de partage donné par ton enseignant').isVisible(), 'sans dossier : lien à coller sur l’accueil')
await a.getByLabel('Lien de partage donné par ton enseignant').fill(lienTest)
await a.getByRole('button', { name: 'Ajouter le dossier' }).click()
await a.getByText('Choisis ta classe').waitFor()
ok((await texte(a)).includes('Autre classe'), 'dossier à deux classes : choix de la classe')
await a.getByRole('button', { name: /^\s*Classe test/ }).click()
await a.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().waitFor()
ok((await texte(a)).includes('Nombres et calculs') && (await texte(a)).includes('Géométrie'), 'une seule classe : chapitres directement à l’accueil')
await a.getByRole('button', { name: /^\s*Géométrie/ }).click()
ok(!(await a.getByRole('button', { name: /^\s*Théorème de Pythagore/ }).isVisible()), 'chapitre replié')
await a.getByRole('button', { name: 'Organiser' }).click()
await a.getByRole('button', { name: 'Monter le chapitre Fonctions' }).click()
await a.getByRole('button', { name: 'Terminé' }).click()
await a.reload()
await a.getByRole('tab', { name: 'Mes parcours' }).waitFor()
await pagePrete(a)
const ordre = (await texte(a)).match(/(Nombres et calculs|Algèbre|Géométrie|Fonctions) ·/g)
// Glisser au doigt : Géométrie remonte en tête (événements tactiles bruts)
await a.getByRole('button', { name: 'Organiser' }).click()
const poignees = a.locator('[role=presentation].cursor-grab')
const depart = await poignees.nth(3).boundingBox()
const arrivee = await poignees.nth(0).boundingBox()
const cdp = await a.context().newCDPSession(a)
const toucher = (type, y) =>
  cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: depart.x + depart.width / 2, y }] })
await toucher('touchStart', depart.y + depart.height / 2)
for (let k = 1; k <= 8; k++) await toucher('touchMove', depart.y + depart.height / 2 + ((arrivee.y - depart.y - 10) * k) / 8)
await toucher('touchEnd')
await pagePrete(a)
// Le clic de fin de toucher peut déjà avoir quitté le mode « Organiser »
if (await a.getByRole('button', { name: 'Terminé' }).isVisible()) await a.getByRole('button', { name: 'Terminé' }).click()
await pagePrete(a)
const ordreDoigt = (await texte(a)).match(/(Nombres et calculs|Algèbre|Géométrie|Fonctions) ·/g)
ok(ordreDoigt?.[0] === 'Géométrie ·', `glisser au doigt : Géométrie en tête (${ordreDoigt})`)
ok(ordre?.join(',') === 'Nombres et calculs ·,Algèbre ·,Fonctions ·,Géométrie ·' && !(await a.getByRole('button', { name: /^\s*Théorème de Pythagore/ }).isVisible()), `chapitres réordonnés et repliés, mémorisés (${ordre})`)
const polices = await a.evaluate(async () => {
  await document.fonts.ready
  return ['16px jelleebold', '16px "Source Sans Pro"'].map((f) => document.fonts.check(f))
})
ok(polices.every(Boolean), 'polices MathALÉA chargées')
await cap(a, '1-accueil')

// Une page par exercice, validation par page (Fractions)
await parcoursDeTest(a, 'Fractions')
await a.getByRole('button', { name: 'Commencer' }).click()
await a.locator('main math-field').first().waitFor()
ok((await a.locator('main math-field').count()) === 3, 'Fractions : 3 questions sur la page de l’exercice')
ok(await a.getByRole('button', { name: 'Soumettre l’exercice' }).isVisible(), 'Fractions : « Soumettre l’exercice »')
await a.locator('main math-field').first().evaluate((el) => el.blur())
await a.getByRole('button', { name: 'Soumettre l’exercice' }).click()
ok((await a.getByRole('alert').innerText()).includes('3 questions sans réponse'), 'garde-fou : 3 questions sans réponse signalées')
await a.getByRole('button', { name: /^Aller à Ex 1 · Q1/ }).click()
await pagePrete(a)
ok(await jusqua(() => a.evaluate(() => (document.activeElement?.closest('[id^=champTexteEx]')?.id ?? document.activeElement?.id) === 'champTexteEx0Q0'), { timeout: 5_000 }).then(() => true, () => false), 'garde-fou : curseur dans le premier champ vide')
await cap(a, '2b-garde-fou')
await cap(a, '2-page')
await accueil(a)

// Tous les exercices sur une page, validation par question (Décimaux)
await parcoursDeTest(a, 'Décimaux')
await a.getByRole('button', { name: 'Commencer' }).click()
await a.locator('main math-field').first().waitFor()
await pagePrete(a)
const liens = await a.locator('main').getByRole('button', { name: 'Vérifier' }).count()
ok(liens >= 3, `Décimaux : un « Vérifier » sous chaque question (${liens})`)
const hauteur = (await a.locator('main').getByRole('button', { name: 'Vérifier' }).first().boundingBox()).height
ok(hauteur >= 44, `bouton « Vérifier » de question assez grand (${Math.round(hauteur)} px)`)
await saisir(a, 0, '1')
await pagePrete(a)
ok((await a.evaluate(() => innerWidth)) === 390, 'figure large : la zone d’affichage reste à la largeur de l’écran')
const figures = await a.evaluate(() =>
  [...document.querySelectorAll('main svg.mathalea2d')].map((svg) => {
    const r = svg.getBoundingClientRect()
    const etiquettes = [...(svg.parentElement?.querySelectorAll('div.divLatex') ?? [])].map((e) => e.getBoundingClientRect())
    return { dansEcran: r.right <= innerWidth + 1, etiquettesDedans: etiquettes.every((e) => e.left >= r.left - 20 && e.right <= r.right + 20) }
  }),
)
ok(figures.length > 0 && figures.every((f) => f.dansEcran && f.etiquettesDedans), `figures réduites avec leurs étiquettes (${figures.length})`)
await a.getByRole('button', { name: 'Voir le bilan' }).click()
ok((await a.getByRole('alert').innerText()).includes('pas encore vérifiée'), 'garde-fou : réponse saisie mais pas vérifiée signalée')
await cap(a, '3-par-question')
await accueil(a)

// Validation à la fin du parcours (Puissances)
await parcoursDeTest(a, 'Puissances')
await a.getByRole('button', { name: 'Commencer' }).click()
await a.locator('main math-field, main input').first().waitFor()
ok(!(await a.getByRole('button', { name: 'Vérifier' }).isVisible().catch(() => false)), 'Puissances : pas de vérification avant la fin')
for (let i = 0; i < 12 && !(await a.getByRole('button', { name: 'Soumettre la tentative' }).isVisible().catch(() => false)); i++) {
  await a.getByRole('button', { name: 'Question suivante' }).click()
  await pagePrete(a)
}
await a.getByRole('button', { name: 'Soumettre la tentative' }).click()
ok((await a.getByRole('alert').innerText()).includes('questions sans réponse'), 'garde-fou : tentative avec questions sans réponse')
await a.getByRole('button', { name: 'Soumettre quand même' }).click()
await pagePrete(a)
ok((await a.locator('main').getByText('Correction', { exact: true }).count()) === 6, 'Puissances : 6 corrections après soumission')
await a.getByRole('button', { name: 'Voir le bilan' }).click()
await accueil(a)

// Session partagée 1k3lr, faite en entier avec les bonnes réponses (Nombres relatifs)
await parcoursDeTest(a, 'Nombres relatifs')
await a.getByRole('button', { name: 'Autres actions' }).click()
await a.getByRole('button', { name: 'Rejoindre une session' }).click()
await a.getByLabel('Code de session').fill('1k3lr')
await a.getByRole('button', { name: 'Rejoindre la session' }).click()
await a.locator('main math-field').first().waitFor()
await pagePrete(a)
ok((await texte(a)).includes('Session 1k3lr'), 'session 1k3lr affichée dans la séance')
await a.goBack({ waitUntil: 'commit' })
await pagePrete(a)
ok((await a.getByRole('alert').innerText()).includes('Quitter l’activité'), 'retour du téléphone pendant une séance : confirmation demandée')
ok(
  (await a.getByRole('button', { name: 'Reprendre plus tard' }).isVisible()) && (await a.getByRole('button', { name: 'Supprimer la tentative' }).isVisible()),
  'sortie : reprendre plus tard ou supprimer la tentative',
)
await a.goBack({ waitUntil: 'commit' })
await pagePrete(a)
ok(!(await a.getByRole('button', { name: 'Reprendre plus tard' }).isVisible()), 'second retour : le panneau se referme, on reste')
const enonceA = await enonce(a)
await cap(a, '4-session')
for (let n = 0; n < 9; n++) {
  const e = Math.floor(n / 3)
  const q = n % 3
  await saisir(a, 0, await reponseAttendue(a, 'relatifs-5e', e, q))
  await a.getByRole('button', { name: 'Vérifier' }).click()
  await pagePrete(a)
  await a.getByRole('button', { name: n < 8 ? 'Question suivante' : 'Voir le bilan' }).click()
  await pagePrete(a)
}
ok((await texte(a)).includes('9 / 9'), `session 1k3lr terminée : ${(await texte(a)).match(/\d+ \/ \d+/)?.[0]}`)
ok(await a.getByRole('button', { name: 'Retour à l’accueil' }).isVisible(), 'bilan : bouton « Retour à l’accueil »')
ok(!(await a.locator('body').innerText()).includes('licence AGPL-3.0'), 'pas de pied de page')
await cap(a, '5-bilan-session')

// ---------- Élève B : même code, mêmes exercices ----------
const b = await appareil('B')
await b.getByRole('button', { name: /France/ }).click()
await rejoindreClasseTest(b)
await parcoursDeTest(b, 'Nombres relatifs')
await b.getByRole('button', { name: 'Autres actions' }).click()
await b.getByRole('button', { name: 'Rejoindre une session' }).click()
await b.getByLabel('Code de session').fill('1K3LR')
await b.getByRole('button', { name: 'Rejoindre la session' }).click()
await b.locator('main math-field').first().waitFor()
await pagePrete(b)
ok((await enonce(b)) === enonceA, 'élève B, code 1K3LR : exactement les mêmes exercices que A')
await b.getByRole('button', { name: 'Passer' }).click()
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
ok(!(await b.getByRole('button', { name: 'Terminer maintenant' }).isVisible()), 'sortie sans aucune réponse : pas de « Terminer maintenant »')
await b.getByRole('button', { name: 'Reprendre plus tard' }).click()
// Quitter ramène à l'accueil ; la ligne du parcours ouvre sa page (la tuile « En cours » reprendrait la séance)
await b.getByRole('button', { name: /^\s*Nombres relatifs/ }).last().click()
await b.getByRole('button', { name: 'Continuer', exact: true }).waitFor()
ok((await b.locator('main button').count()) <= 4, `détail : un seul bouton principal (${await b.locator('main button').count()} boutons)`)
await b.getByRole('button', { name: 'Autres actions' }).click()
await pagePrete(b)
await cap(b, '4c-autres-actions')
ok(await b.getByRole('button', { name: 'Supprimer la tentative en cours' }).isVisible(), 'autres actions : tentative en cours supprimable')
await b.goBack({ waitUntil: 'commit' })
await pagePrete(b)

// Terminer tout de suite : bilan avec ce qui est fait
await b.getByRole('button', { name: 'Continuer', exact: true }).click()
await b.locator('main math-field').first().waitFor()
await pagePrete(b)
await saisir(b, 0, '1')
await b.getByRole('button', { name: 'Vérifier' }).click()
await pagePrete(b)
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
await pagePrete(b)
await cap(b, '4b-sortie')
await b.getByRole('button', { name: 'Terminer maintenant' }).click()
await b.getByRole('button', { name: 'Retour à l’accueil' }).waitFor()
ok(/\d+ \/ 9/.test(await texte(b)), `terminer maintenant : bilan (${(await texte(b)).match(/\d+ \/ \d+/)?.[0]})`)
await b.getByRole('button', { name: 'Retour à l’accueil' }).click()
await parcoursDeTest(b, 'Nombres relatifs')
const passagesB = await b.locator('main').getByRole('button', { name: /%/ }).count()
ok(passagesB === 1, `passage terminé gardé (${passagesB})`)

// Supprimer depuis la séance (juste après une saisie : le brouillon en attente
// ne doit pas la recréer), puis depuis le détail ; les passages terminés restent
await b.getByRole('button', { name: 'Recommencer' }).click()
await b.locator('main math-field').first().waitFor()
await pagePrete(b)
await saisir(b, 0, '2')
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
await b.getByRole('button', { name: 'Supprimer la tentative' }).click()
await b.getByRole('button', { name: 'Supprimer', exact: true }).click()
await b.getByRole('button', { name: 'Recommencer' }).waitFor()
await pagePrete(b)
ok(
  !(await b.getByRole('button', { name: 'Continuer', exact: true }).isVisible()) &&
    (await b.evaluate(() => Object.keys(localStorage).filter((c) => c.startsWith('copie:seance:')).length)) === 0,
  'séance supprimée juste après une saisie : rien ne reste',
)
await b.getByRole('button', { name: 'Recommencer' }).click()
await b.locator('main math-field').first().waitFor()
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
await b.getByRole('button', { name: 'Reprendre plus tard' }).click()
await b.getByRole('button', { name: /^\s*Nombres relatifs/ }).last().click()
await b.getByRole('button', { name: 'Autres actions' }).click()
await b.getByRole('button', { name: 'Supprimer la tentative en cours' }).click()
await b.getByRole('button', { name: 'Supprimer', exact: true }).click()
await pagePrete(b)
ok(
  (await b.getByRole('button', { name: 'Recommencer' }).isVisible()) &&
    !(await b.getByRole('button', { name: 'Continuer', exact: true }).isVisible()) &&
    (await b.locator('main').getByRole('button', { name: /%/ }).count()) === 1,
  'détail : tentative supprimée, passage terminé gardé',
)
// Relancement : l'app rouvre la page du parcours, où l'on était
await b.reload()
await b.getByRole('button', { name: 'Recommencer' }).waitFor({ timeout: 60_000 })
ok(!(await b.getByRole('button', { name: 'Continuer', exact: true }).isVisible()), 'après relance : la tentative supprimée ne revient pas')

// Relecture, suivi
await a.getByRole('button', { name: 'Retour à l’accueil' }).click()
ok(await a.getByRole('tab', { name: 'Mes parcours' }).isVisible(), 'bilan : retour à l’accueil')
await parcoursDeTest(a, 'Nombres relatifs')
await a.locator('main').getByRole('button', { name: /%/ }).last().click()
await pagePrete(a)
ok((await a.locator('main').getByText('Correction', { exact: true }).count()) === 9, 'relecture de la session : 9 corrections')
await accueil(a)
await a.getByRole('tab', { name: 'Suivi' }).click()
await pagePrete(a)
ok((await a.getByRole('button', { name: /questions, \d+ correctes?/ }).count()) > 0, 'suivi : calendrier')
await cap(a, '6-suivi')
await a.getByRole('button', { name: 'Graphique' }).click()
ok((await a.locator('main svg rect').count()) > 0, 'suivi : graphique')

// Explorer : catalogue de l'équipe MathALÉA, ajout à l'accueil
await a.getByRole('tab', { name: 'Explorer' }).click()
await a.getByText('Parcours proposés par l’équipe MathALÉA').waitFor({ timeout: 60_000 })
await cap(a, '6b-explorer')
ok(await a.getByRole('button', { name: /^Teste ton niveau/ }).isVisible(), 'explorer : Teste ton niveau en tête')
// Explorer rangé par degré, les parcours sous leur chapitre : on ouvre le degré
// (la tuile « Teste ton niveau » vient avant les degrés)
for (let i = 0; i < 2 && !(await a.getByRole('button', { name: /^\s*Fractions : les bases/ }).isVisible()); i++) {
  await a.locator('main .tuile').filter({ hasNotText: 'Teste ton niveau' }).first().click()
  await pagePrete(a)
}
await a.getByRole('button', { name: /^\s*Fractions : les bases/ }).click()
await a.getByRole('button', { name: 'Ajouter à l’accueil' }).click()
ok(await a.getByRole('button', { name: 'Ajouté à l’accueil' }).isVisible(), 'explorer : ajouté à l’accueil')
await cap(a, '6c-explorer-detail')
await accueil(a)
await a.getByRole('tab', { name: 'Mes parcours' }).click()
await pagePrete(a)
await cap(a, '6d-accueil-ajout')
// Rangé avec les parcours de la classe, par chapitre, boussole sur sa tuile
const ajout = a.getByRole('button', { name: /^\s*Fractions : les bases/ }).first()
ok(await ajout.isVisible(), 'explorer : parcours à l’accueil')
ok((await ajout.innerText()).length > 0 && (await ajout.locator('.bx-compass').count()) === 1, 'explorer : boussole sur la tuile du parcours ajouté')

// ---------- Fichier de l'enseignant, préparé sur le site MathALÉA ----------
// Le site exporte parcours-mathalea.json, que l'enseignant dépose sur son drive :
// écrit ici tel quel dans le dossier partagé de test (classes 3e A et 3e B)
const fractionsExpress = (titre, version) => ({
  id: 'fractions-express',
  version,
  titre,
  objectif: 'Additionner des fractions',
  niveau: '4e',
  theme: 'Fractions',
  difficulte: 2,
  icone: 'bx-math',
  presentation: 'un_exo_par_page',
  correction: 'page',
  etapes: [{ uuid: '5f429', id: '4C21', titre: 'Additionner des fractions', nbQuestions: 2 }],
})
const deposer = (titre, version) =>
  writeFileSync(
    `${dossierPartage}/classe-3a/parcours-mathalea.json`,
    JSON.stringify({
      format: 'classes-mathalea/1',
      exporteLe: new Date().toISOString(),
      classes: ['3e A', '3e B'].map((nom) => ({ nom, parcours: [fractionsExpress(titre, version)] })),
    }),
  )
deposer('Fractions express', 1)

// L'élève ajoute la classe par le lien du dossier partagé
await accueil(a)
await a.getByRole('button', { name: 'Réglages' }).click()
ok((await texte(a)).includes('licence AGPL-3.0') && (await a.getByRole('link', { name: 'coopmaths.fr', exact: true }).isVisible()), 'réglages : licence et coopmaths.fr')
ok(!(await a.getByRole('switch', { name: /enseignant/i }).count()), 'réglages : plus de mode enseignant')
await a.getByLabel('Sombre').check()
ok(await a.evaluate(() => document.documentElement.classList.contains('dark')), 'réglages : thème sombre appliqué aussitôt')
await a.getByLabel('Comme le téléphone').check()
await a.getByLabel('Lien de partage du dossier').fill(lienClasse)
await a.getByRole('button', { name: 'Ajouter le dossier' }).click()
await a.getByLabel('3e A').check({ timeout: 10000 })
await pagePrete(a)
await a.getByRole('button', { name: 'Revenir en arrière' }).click()
ok((await a.locator('nav [role=tab]').allInnerTexts()).map((x) => x.trim()).join(',') === 'Mes parcours,Explorer,Suivi,Fiches', 'élève : onglets Mes parcours, Explorer, Suivi, Fiches')
await a.getByRole('tab', { name: '3e A' }).click()
ok((await texte(a)).includes('Fractions express'), 'élève : parcours de la classe reçu (pastilles de classes)')
await cap(a, '6e-classes')

// L'enseignant corrige le parcours sur le site et dépose la V2 ; l'élève la reçoit
deposer('Fractions express (corrigé)', 2)
await a.getByRole('button', { name: 'Réglages' }).click()
await a.getByRole('button', { name: 'Mettre à jour les parcours' }).click()
await pagePrete(a)
await a.getByRole('button', { name: 'Revenir en arrière' }).click()
await a.getByRole('tab', { name: '3e A' }).click()
ok((await texte(a)).includes('Fractions express (corrigé)'), 'élève : V2 reçue après mise à jour')

// Suisse : notations fr-CH du moteur (le programme choisi règle le moteur)
await a.getByRole('button', { name: 'Réglages' }).click()
await a.getByLabel('Suisse').check()
await pagePrete(a)
const notation = await a.evaluate(async () => {
  const man = await (await fetch('/moteur/manifest.json')).json()
  const m = await import('/moteur/' + man.entree)
  const ex = await m.preparerExercice({ uuid: '72ce7', nbQuestions: 4, alea: 'ch' }, 80)
  return ex.questions.map((q) => q.enonce + q.correction).join(' ')
})
ok(notation.includes('\\cdot') && !notation.includes('\\times'), 'Suisse : \\cdot à la place de \\times (fr-CH)')
await a.getByLabel('France').check()
await pagePrete(a)

// Sauvegarde complète, restaurée sur un nouvel appareil
await accueil(a)
await a.getByRole('button', { name: 'Réglages' }).click()
const [sauvegarde] = await Promise.all([a.waitForEvent('download'), a.getByRole('button', { name: 'Exporter une sauvegarde' }).click()])
const fichierSauvegarde = `${dossierPartage}/sauvegarde.json`
await sauvegarde.saveAs(fichierSauvegarde)
const c = await appareil('C')
await c.getByRole('button', { name: /France/ }).click()
await c.getByRole('button', { name: 'Réglages' }).click()
await c.locator('input[type=file]').setInputFiles(fichierSauvegarde)
// Restauration : aperçu et confirmation avant de remplacer quoi que ce soit ;
// la fusion avec cet appareil est proposée d'abord
await c.getByText('Ajouter cette sauvegarde à cet appareil ?').waitFor()
ok(/Sauvegarde du .*passage/.test(await texte(c, '[role=dialog]')), 'restauration : aperçu de la sauvegarde avant de remplacer')
await cap(c, '11-restauration')
await c.getByRole('button', { name: 'Tout remplacer', exact: true }).click()
await c.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 10000 })
await c.getByRole('tab', { name: 'Suivi' }).click()
await pagePrete(c)
ok((await texte(c)).includes('Nombres relatifs') && (await texte(c)).includes('3e A') === false, 'sauvegarde restaurée : suivi retrouvé')
await c.getByRole('tab', { name: 'Mes parcours' }).click()
ok((await texte(c)).includes('Classe test') && (await texte(c)).includes('3e A'), 'sauvegarde restaurée : dossiers retrouvés')

ok((await a.evaluate(() => [document.documentElement.scrollWidth - innerWidth, innerWidth])).join() === '0,390', 'aucun débordement horizontal')
ok(erreurs.length === 0, `aucune erreur JS ${erreurs.slice(0, 3).join(' | ')}`)
console.log(echecs ? `${echecs} échec(s)` : 'TOUT VERT')
await nav.close()
// Code de sortie non nul : un script ou une CI ne prend pas un échec pour un succès
if (echecs) process.exitCode = 1
