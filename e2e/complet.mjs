// Parcours complet de l'app sur trois appareils simulés (format téléphone).
// Prérequis : serveur de dev (pnpm dev) et dossier partagé local
// (cd ../spike-sync && pnpm server <DOSSIER>), DOSSIER étant passé en variable.
import { chromium } from 'playwright'
import { copyFileSync } from 'node:fs'

const base = 'http://localhost:1420/'
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
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

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
      await page.waitForTimeout(200)
    }
    await page.getByRole('button', { name: /Revenir en arrière|Quitter/ }).first().click()
    await page.waitForTimeout(200)
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
await a.waitForTimeout(500)
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
await a.waitForTimeout(300)
// Le clic de fin de toucher peut déjà avoir quitté le mode « Organiser »
if (await a.getByRole('button', { name: 'Terminé' }).isVisible()) await a.getByRole('button', { name: 'Terminé' }).click()
await a.waitForTimeout(300)
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
await a.waitForTimeout(400)
ok((await a.evaluate(() => document.activeElement?.closest('[id^=champTexteEx]')?.id ?? document.activeElement?.id)) === 'champTexteEx0Q0', 'garde-fou : curseur dans le premier champ vide')
await cap(a, '2b-garde-fou')
await cap(a, '2-page')
await accueil(a)

// Tous les exercices sur une page, validation par question (Décimaux)
await parcoursDeTest(a, 'Décimaux')
await a.getByRole('button', { name: 'Commencer' }).click()
await a.locator('main math-field').first().waitFor()
await a.waitForTimeout(600)
const liens = await a.locator('main').getByRole('button', { name: 'Vérifier' }).count()
ok(liens >= 3, `Décimaux : un « Vérifier » sous chaque question (${liens})`)
const hauteur = (await a.locator('main').getByRole('button', { name: 'Vérifier' }).first().boundingBox()).height
ok(hauteur >= 44, `bouton « Vérifier » de question assez grand (${Math.round(hauteur)} px)`)
await saisir(a, 0, '1')
await a.waitForTimeout(400)
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
  await a.waitForTimeout(200)
}
await a.getByRole('button', { name: 'Soumettre la tentative' }).click()
ok((await a.getByRole('alert').innerText()).includes('questions sans réponse'), 'garde-fou : tentative avec questions sans réponse')
await a.getByRole('button', { name: 'Soumettre quand même' }).click()
await a.waitForTimeout(2500)
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
await a.waitForTimeout(500)
ok((await texte(a)).includes('Session 1k3lr'), 'session 1k3lr affichée dans la séance')
await a.goBack({ waitUntil: 'commit' })
await a.waitForTimeout(300)
ok((await a.getByRole('alert').innerText()).includes('Quitter l’activité'), 'retour du téléphone pendant une séance : confirmation demandée')
ok(
  (await a.getByRole('button', { name: 'Reprendre plus tard' }).isVisible()) && (await a.getByRole('button', { name: 'Supprimer la tentative' }).isVisible()),
  'sortie : reprendre plus tard ou supprimer la tentative',
)
await a.goBack({ waitUntil: 'commit' })
await a.waitForTimeout(300)
ok(!(await a.getByRole('button', { name: 'Reprendre plus tard' }).isVisible()), 'second retour : le panneau se referme, on reste')
const enonceA = await enonce(a)
await cap(a, '4-session')
for (let n = 0; n < 9; n++) {
  const e = Math.floor(n / 3)
  const q = n % 3
  await saisir(a, 0, await reponseAttendue(a, 'relatifs-5e', e, q))
  await a.getByRole('button', { name: 'Vérifier' }).click()
  await a.waitForTimeout(350)
  await a.getByRole('button', { name: n < 8 ? 'Question suivante' : 'Voir le bilan' }).click()
  await a.waitForTimeout(350)
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
await b.waitForTimeout(500)
ok((await enonce(b)) === enonceA, 'élève B, code 1K3LR : exactement les mêmes exercices que A')
await b.getByRole('button', { name: 'Passer' }).click()
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
ok(!(await b.getByRole('button', { name: 'Terminer maintenant' }).isVisible()), 'sortie sans aucune réponse : pas de « Terminer maintenant »')
await b.getByRole('button', { name: 'Reprendre plus tard' }).click()
// Quitter ramène à l'accueil ; la tentative se reprend depuis le parcours
await parcoursDeTest(b, 'Nombres relatifs')
await b.getByRole('button', { name: 'Continuer', exact: true }).waitFor()
ok((await b.locator('main button').count()) <= 4, `détail : un seul bouton principal (${await b.locator('main button').count()} boutons)`)
await b.getByRole('button', { name: 'Autres actions' }).click()
await b.waitForTimeout(400)
await cap(b, '4c-autres-actions')
ok(await b.getByRole('button', { name: 'Supprimer la tentative en cours' }).isVisible(), 'autres actions : tentative en cours supprimable')
await b.goBack({ waitUntil: 'commit' })
await b.waitForTimeout(300)

// Terminer tout de suite : bilan avec ce qui est fait
await b.getByRole('button', { name: 'Continuer', exact: true }).click()
await b.locator('main math-field').first().waitFor()
await b.waitForTimeout(500)
await saisir(b, 0, '1')
await b.getByRole('button', { name: 'Vérifier' }).click()
await b.waitForTimeout(350)
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
await b.waitForTimeout(400)
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
await b.waitForTimeout(500)
await saisir(b, 0, '2')
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
await b.getByRole('button', { name: 'Supprimer la tentative' }).click()
await b.getByRole('button', { name: 'Supprimer', exact: true }).click()
await b.getByRole('button', { name: 'Recommencer' }).waitFor()
await b.waitForTimeout(800)
ok(
  !(await b.getByRole('button', { name: 'Continuer', exact: true }).isVisible()) &&
    (await b.evaluate(() => Object.keys(localStorage).filter((c) => c.startsWith('copie:seance:')).length)) === 0,
  'séance supprimée juste après une saisie : rien ne reste',
)
await b.getByRole('button', { name: 'Recommencer' }).click()
await b.locator('main math-field').first().waitFor()
await b.getByRole('button', { name: 'Quitter', exact: true }).click()
await b.getByRole('button', { name: 'Reprendre plus tard' }).click()
await b.getByRole('button', { name: 'Autres actions' }).click()
await b.getByRole('button', { name: 'Supprimer la tentative en cours' }).click()
await b.getByRole('button', { name: 'Supprimer', exact: true }).click()
await b.waitForTimeout(500)
ok(
  (await b.getByRole('button', { name: 'Recommencer' }).isVisible()) &&
    !(await b.getByRole('button', { name: 'Continuer', exact: true }).isVisible()) &&
    (await b.locator('main').getByRole('button', { name: /%/ }).count()) === 1,
  'détail : tentative supprimée, passage terminé gardé',
)
await b.reload()
await b.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().waitFor()
await parcoursDeTest(b, 'Nombres relatifs')
ok(!(await b.getByRole('button', { name: 'Continuer', exact: true }).isVisible()), 'après relance : la tentative supprimée ne revient pas')

// Relecture, suivi
await a.getByRole('button', { name: 'Retour à l’accueil' }).click()
ok(await a.getByRole('tab', { name: 'Mes parcours' }).isVisible(), 'bilan : retour à l’accueil')
await parcoursDeTest(a, 'Nombres relatifs')
await a.locator('main').getByRole('button', { name: /%/ }).last().click()
await a.waitForTimeout(1500)
ok((await a.locator('main').getByText('Correction', { exact: true }).count()) === 9, 'relecture de la session : 9 corrections')
await accueil(a)
await a.getByRole('tab', { name: 'Suivi' }).click()
await a.waitForTimeout(400)
ok((await a.getByRole('button', { name: /questions, \d+ correctes?/ }).count()) > 0, 'suivi : calendrier')
await cap(a, '6-suivi')
await a.getByRole('button', { name: 'Graphique' }).click()
ok((await a.locator('main svg rect').count()) > 0, 'suivi : graphique')

// Explorer : catalogue de l'équipe MathALÉA, ajout à l'accueil
await a.getByRole('tab', { name: 'Explorer' }).click()
await a.getByText('Parcours proposés par l’équipe MathALÉA').waitFor({ timeout: 10000 })
await cap(a, '6b-explorer')
ok(await a.getByRole('button', { name: /^Teste ton niveau/ }).isVisible(), 'explorer : Teste ton niveau en tête')
// Explorer rangé par degré puis par chapitre : on descend jusqu'au parcours
// (la tuile « Teste ton niveau » vient avant les degrés)
for (let i = 0; i < 3 && !(await a.getByRole('button', { name: /Fractions : les bases/ }).isVisible()); i++) {
  await a.locator('main').getByRole('button').filter({ hasNotText: 'Teste ton niveau' }).first().click()
  await a.waitForTimeout(400)
}
await a.getByRole('button', { name: /Fractions : les bases/ }).click()
await a.getByRole('button', { name: 'Ajouter à l’accueil' }).click()
ok(await a.getByRole('button', { name: 'Ajouté à l’accueil' }).isVisible(), 'explorer : ajouté à l’accueil')
await cap(a, '6c-explorer-detail')
await accueil(a)
await a.getByRole('tab', { name: 'Mes parcours' }).click()
await a.waitForTimeout(300)
await cap(a, '6d-accueil-ajout')
ok(await a.getByText('Ajoutés depuis Explorer').isVisible(), 'explorer : section à l’accueil')
ok(await a.getByRole('button', { name: /Fractions : les bases/ }).isVisible(), 'explorer : parcours à l’accueil')

// ---------- Enseignant ----------
const t = await appareil('enseignant')
await t.getByRole('button', { name: /France/ }).click()
ok(!(await t.getByRole('tab', { name: 'Parcours', exact: true }).isVisible()), 'premier lancement : pas d’onglet Parcours (enseignant) sans le réglage Enseignant')
await t.getByRole('button', { name: 'Réglages' }).click()
await t.getByRole('switch', { name: /Je suis enseignant/ }).check()
await cap(t, '8b-reglage-enseignant')
await t.getByRole('button', { name: 'Enregistrer et quitter' }).click()
ok((await t.getByRole('tab', { name: 'Parcours', exact: true }).getAttribute('aria-selected')) === 'true', 'réglage Enseignant : onglet Parcours ouvert')
ok((await t.locator('nav [role=tab]').allInnerTexts()).map((x) => x.trim()).join(',') === 'Parcours,Classes,En classe,Explorer', 'enseignant : onglets Parcours, Classes, En classe, Explorer')
await t.getByRole('button', { name: 'Créer un parcours' }).click()
// Un seul écran : niveau, chapitre, parcours, exercices, pages et validation ; les classes viennent après
ok(await t.getByText('À compléter : un niveau, un chapitre, un titre, un exercice').isVisible(), 'création : ce qui manque est indiqué')
ok((await t.getByLabel(/Nouvelle classe/).count()) === 0, 'création : pas de classes dans l’éditeur (on crée pour un niveau)')
await t.getByRole('radio', { name: '4e' }).click()
await t.getByLabel('Nom du chapitre').fill('Fractions')
await t.getByLabel('Nom du chapitre').press('Enter')
ok(await t.getByLabel('Titre', { exact: true }).evaluate((el) => el === document.activeElement), 'Entrée : passage au champ suivant')
await t.getByLabel('Titre', { exact: true }).fill('Fractions express')
await t.getByRole('radio', { name: 'Entraînement' }).click()
await cap(t, '7-editeur')
// Navigateur d'exercices : niveau puis chapitre, comme sur le site
await t.getByRole('button', { name: 'Ajouter des exercices' }).click()
ok(await t.getByRole('heading', { name: 'Quatrième' }).isVisible(), 'navigateur : ouvert au niveau du parcours')
await t.locator('main').getByRole('button').nth(1).click()
ok((await t.locator('main li').count()) > 0, 'navigateur : exercices du chapitre')
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
ok(await t.getByRole('heading', { name: 'Ajouter des exercices' }).isVisible(), 'navigateur : retour aux niveaux')
await t.getByLabel(/Rechercher un exercice/).fill('4C21')
await t.waitForTimeout(300)
const premier = t.locator('main li').first()
ok((await premier.innerText()).startsWith('4C21'), 'recherche : identifiant exact en premier')
await premier.getByRole('button').first().click()
await t.getByLabel('Nombre de questions').waitFor()
await t.locator('main ol li').first().waitFor({ timeout: 15000 })
await t.getByLabel('Nombre de questions').fill('2')
await t.locator('main ol li').nth(1).waitFor({ timeout: 15000 })
await t.waitForTimeout(500)
ok((await t.locator('main ol > li').count()) === 2, 'aperçu : 2 questions, selon le réglage')
await cap(t, '8-navigateur')
await t.getByRole('button', { name: 'Ajouter au parcours' }).click()
await t.getByRole('button', { name: /Revenir au parcours \(1 exercice\)/ }).click()
ok(/4C21/.test(await texte(t)) && (await texte(t)).includes('2 questions'), 'exercice ajouté avec ses réglages')
await t.getByRole('button', { name: /Icône, pages et correction/ }).click()
await t.getByLabel('Une page par exercice').check()
await t.getByLabel('À la fin de chaque page').check()
await cap(t, '9-editeur-complet')
await t.getByRole('button', { name: 'Aperçu élève' }).click()
await t.locator('main math-field').first().waitFor()
ok(await t.getByRole('button', { name: 'Soumettre l’exercice' }).isVisible(), 'aperçu élève du parcours en cours de création')
await t.getByRole('button', { name: 'Quitter', exact: true }).click()
ok(!(await t.getByRole('button', { name: 'Reprendre plus tard' }).isVisible()), 'aperçu : la croix quitte directement')
await t.getByRole('button', { name: 'Valider le parcours' }).click()
ok(await t.getByText('« Fractions express » enregistré (V1)').isVisible(), 'après validation : panneau enregistré')
ok((await t.getByLabel(/Nouvelle classe/).count()) === 0, 'après validation : aucune classe à choisir (attribution à part)')
await cap(t, '9c-enregistre')
ok(await t.getByRole('button', { name: 'Exporter tous les parcours', exact: true }).isVisible(), 'après validation : export complet proposé')
await t.getByRole('button', { name: 'Choisir les parcours à exporter' }).click()
ok(await t.getByRole('checkbox', { name: /Fractions express/, checked: true }).isVisible(), 'choix des parcours : celui enregistré coché')
// Un seul parcours dans la bibliothèque : le choix revient au fichier complet
const [complet] = await Promise.all([t.waitForEvent('download'), t.getByRole('dialog').getByRole('button', { name: 'Exporter tous les parcours', exact: true }).click()])
ok(/^parcours-mathalea-\d{4}-\d{2}-\d{2}-\d{2}h\d{2}-\d{2}\.json$/.test(complet.suggestedFilename()), 'export complet, nom horodaté : ' + complet.suggestedFilename())
ok(!(await t.getByText('Version différente de celle du drive').isVisible()), 'rappel : disparu après l’export complet')
ok(await t.getByText('Drive pas encore configuré').isVisible(), 'rappel : drive à configurer (pas de lien)')
await t.getByRole('button', { name: 'Configurer', exact: true }).click()
await t.waitForTimeout(600)
ok(await t.evaluate(() => document.activeElement?.id === 'lien-dossier'), 'rappel : « Configurer » ouvre le champ du lien')
// Attribution dans l'onglet Classes (clavier refermé : la barre d'onglets revient)
await t.evaluate(() => (document.activeElement)?.blur())
await t.getByRole('tab', { name: 'Classes', exact: true }).click()
await t.getByLabel(/Nouvelle classe/).fill('3e A')
await t.getByRole('button', { name: 'Ajouter', exact: true }).click()
await t.getByRole('button', { name: 'Nouvelle classe' }).click()
await t.getByLabel('Nom affiché aux élèves').fill('3e B')
await t.getByRole('button', { name: 'Ajouter la classe' }).click()
for (const c of ['3e B', '3e A']) {
  await t.getByRole('tab', { name: c, exact: true }).click()
  await t.getByRole('button', { name: `Choisir les parcours de ${c}` }).click()
  await t.getByRole('checkbox', { name: /Fractions express/ }).click()
  await t.getByRole('button', { name: /^Enregistrer \(1 parcours\)/ }).click()
}
ok((await texte(t)).includes('3e A · 1 parcours'), 'classes : parcours donné à la classe')
await t.getByRole('tab', { name: 'Parcours', exact: true }).click()
ok((await texte(t)).includes('3e A, 3e B') || (await texte(t)).includes('3e B, 3e A'), 'bibliothèque : parcours donné à 3e A et 3e B')
ok(await t.getByText('Mise en route').isVisible(), 'sans dossier partagé : mise en route proposée')
await t.getByLabel('Lien du dossier partagé', { exact: true }).fill(lienClasse)
await t.getByRole('button', { name: 'Enregistrer le lien' }).click()
ok(await t.getByRole('button', { name: /Dossier partagé/ }).isVisible(), 'lien du dossier enregistré pour la classe')
await t.getByRole('button', { name: /Dossier partagé/ }).click()
ok(await t.getByRole('button', { name: 'Ouvrir le dossier' }).isVisible(), 'dossier partagé : ouvrir ou changer le lien')
await t.goBack({ waitUntil: 'commit' })
await t.waitForTimeout(300)
ok(await t.getByText('Version différente de celle du drive').isVisible(), 'rappel : modifications pas encore exportées')

async function exporterVersDossier() {
  // Juste après un enregistrement, le panneau du bas propose l'export complet ; sinon le rappel sous la barre
  const panneau = t.getByRole('button', { name: 'Exporter tous les parcours', exact: true })
  const bouton = (await panneau.isVisible()) ? panneau : t.getByRole('button', { name: 'Mettre à jour', exact: true })
  const [dl] = await Promise.all([t.waitForEvent('download'), bouton.click()])
  ok(/^parcours-mathalea-\d{4}-\d{2}-\d{2}-\d{2}h\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), 'publication horodatée : ' + dl.suggestedFilename())
  // Serveur local de test : il ne sait pas lister un dossier, nom fixe
  const chemin = `${dossierPartage}/classe-3a/parcours-mathalea.json`
  await dl.saveAs(chemin)
  return chemin
}
await exporterVersDossier()
ok(await t.getByText('Fichier exporté : déposez-le sur le drive').isVisible(), 'rappel : fichier à déposer sur le drive')
await t.getByRole('button', { name: 'Vérifier le dossier partagé' }).click()
await t.getByText('Fichier exporté : déposez-le sur le drive').waitFor({ state: 'hidden', timeout: 10000 })
ok(!(await t.getByText('Fichier exporté : déposez-le sur le drive').isVisible()), 'rappel : disparu quand le drive a le fichier')
await cap(t, '10-enseignant')

// L'élève ajoute la classe par le lien du dossier partagé
await a.getByRole('button', { name: 'Réglages' }).click()
ok((await texte(a)).includes('licence AGPL-3.0') && (await a.getByRole('link', { name: 'coopmaths.fr' }).isVisible()), 'réglages : licence et coopmaths.fr')
await a.getByLabel('Sombre').check()
ok(await a.evaluate(() => document.documentElement.classList.contains('dark')), 'réglages : thème sombre appliqué aussitôt')
await a.getByLabel('Comme le téléphone').check()
await a.getByLabel('Lien de partage du dossier').fill(lienClasse)
await a.getByRole('button', { name: 'Ajouter le dossier' }).click()
await a.getByLabel('3e A').check({ timeout: 10000 })
await a.waitForTimeout(500)
await a.getByRole('button', { name: 'Revenir en arrière' }).click()
ok(!(await a.getByRole('tab', { name: 'Parcours', exact: true }).isVisible()) && !(await a.getByRole('tab', { name: 'En classe' }).isVisible()), 'élève : jamais d’onglet enseignant')
await a.getByRole('tab', { name: '3e A' }).click()
ok((await texte(a)).includes('Fractions express'), 'élève : parcours de la classe reçu (pastilles de classes)')
await cap(a, '6e-classes')

// L'enseignant modifie : V2 ; l'élève la reçoit
await t.getByRole('button', { name: /Fractions express/ }).first().click()
// La tuile ouvre la page du parcours ; « Modifier » ouvre l'éditeur
await t.getByRole('button', { name: 'Modifier' }).click()
ok((await t.getByLabel('Titre', { exact: true }).inputValue()) === 'Fractions express', 'modification : tout est déjà rempli')
await t.getByLabel('Titre', { exact: true }).fill('Fractions express (corrigé)')
// Réglages de l'exercice repris tels qu'ils ont été choisis, modifiables sur place
await t.getByRole('button', { name: /^4C21/ }).click()
ok((await t.getByLabel('Nombre de questions').inputValue()) === '2', 'modification : réglages de l’exercice repris')
await t.getByLabel('Nombre de questions').fill('3')
await t.getByRole('button', { name: 'Autres actions' }).click()
ok(await t.getByRole('button', { name: 'Dupliquer' }).isDisabled(), 'modification en cours : dupliquer attend l’enregistrement')
await t.goBack({ waitUntil: 'commit' })
await t.waitForTimeout(300)
await cap(t, '9b-modification')
await t.getByRole('button', { name: 'Enregistrer et quitter' }).click()
await t.waitForTimeout(400)
{ const f = await texte(t); ok(/V2 à publier pour/.test(f), `modification enregistrée : retour à la page du parcours, V2 à publier (${f.replace(/\s+/g, ' ').slice(0, 160)})`) }
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
await t.waitForTimeout(400)
ok((await texte(t)).includes('V2'), 'modification après export : V2')
ok(await t.getByText('Version différente de celle du drive').isVisible(), 'rappel : V2 pas encore exportée')
await exporterVersDossier()
await a.getByRole('button', { name: 'Réglages' }).click()
await a.getByRole('button', { name: 'Mettre à jour les parcours' }).click()
await a.waitForTimeout(800)
await a.getByRole('button', { name: 'Revenir en arrière' }).click()
await a.getByRole('tab', { name: '3e A' }).click()
ok((await texte(a)).includes('Fractions express (corrigé)'), 'élève : V2 reçue après mise à jour')

// Suisse : niveaux et référentiel suisses, notations fr-CH
await t.getByRole('button', { name: 'Réglages' }).click()
ok((await t.getByRole('button', { name: 'Enregistrer et quitter' }).count()) === 0, 'réglages : pas de bouton sans changement')
await t.getByLabel('Suisse').check()
await t.getByRole('button', { name: 'Enregistrer et quitter' }).click()
ok(await t.getByRole('button', { name: 'Créer un parcours' }).isVisible(), 'réglages : enregistrer et quitter ramène à l’accueil')
await t.getByRole('button', { name: 'Créer un parcours' }).click()
ok(await t.getByRole('radio', { name: 'Fractions' }).isVisible(), 'création : chapitre existant proposé')
await t.getByRole('radio', { name: 'Fractions' }).click()
ok((await t.getByLabel('Nom du chapitre').inputValue()) === 'Fractions', 'création : chapitre choisi d’un geste')
ok((await t.getByRole('radio', { name: '9e' }).count()) === 1 && (await t.getByRole('radio', { name: '6e' }).count()) === 0, 'Suisse : niveaux 9e à 4e Collège')
await t.getByRole('radio', { name: '9e' }).click()
await t.getByRole('button', { name: 'Ajouter des exercices' }).click()
await t.getByLabel(/Rechercher un exercice/).fill('9NO1A')
await t.waitForTimeout(300)
ok((await texte(t)).includes('9NO1A'), 'Suisse : exercices du référentiel suisse')
const notation = await t.evaluate(async () => {
  const man = await (await fetch('/moteur/manifest.json')).json()
  const m = await import('/moteur/' + man.entree)
  const ex = await m.preparerExercice({ uuid: '72ce7', nbQuestions: 4, alea: 'ch' }, 80)
  return ex.questions.map((q) => q.enonce + q.correction).join(' ')
})
ok(notation.includes('\\cdot') && !notation.includes('\\times'), 'Suisse : \\cdot à la place de \\times (fr-CH)')

// Édition d'un parcours d'un dossier partagé : classes, chapitre, tout est repris
for (let i = 0; i < 6 && !(await t.getByRole('button', { name: 'Réglages' }).isVisible()); i++) {
  // Éditeur modifié : le panneau de confirmation s'ouvre
  if (await t.getByRole('button', { name: 'Quitter sans enregistrer' }).isVisible()) await t.getByRole('button', { name: 'Quitter sans enregistrer' }).click()
  else await t.getByRole('button', { name: 'Revenir en arrière' }).click()
  await t.waitForTimeout(150)
}
await t.getByRole('button', { name: 'Réglages' }).click()
await t.getByLabel('Lien de partage du dossier').fill(lienTest)
await t.getByRole('button', { name: 'Ajouter le dossier' }).click()
await t.waitForTimeout(1500)
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
// L'enseignant voit toutes les classes du dossier, sans choisir (vue élève)
await t.getByRole('tab', { name: 'Parcours', exact: true }).click()
await t.getByRole('button', { name: /^\s*Vue élève/ }).click()
ok(
  (await t.getByRole('tab', { name: 'Classe test' }).isVisible()) && (await t.getByRole('tab', { name: 'Autre classe' }).isVisible()),
  'enseignant : toutes les classes du dossier en pastilles',
)
await t.getByRole('tab', { name: 'Autre classe' }).click()
await t.waitForTimeout(300)
await cap(t, '10c-enseignant-classes')
await t.getByRole('button', { name: 'Quitter', exact: true }).click()
await t.getByRole('button', { name: /Éditer un parcours existant/ }).click()
await t.getByRole('button', { name: /Nombres relatifs/ }).first().click()
ok(
  (await t.getByLabel('Nom du chapitre').inputValue()) === 'Nombres et calculs' && (await t.getByRole('radio', { name: '5e', checked: true }).count()) === 1,
  'édition : chapitre et niveau repris',
)
ok(await t.getByRole('button', { name: 'Enregistrer et quitter' }).isEnabled(), 'édition : enregistrable sans rien ressaisir')
await cap(t, '10b-edition-dossier')
await t.getByRole('button', { name: 'Revenir en arrière' }).click()
ok((await texte(t)).includes('Classe test'), 'édition : classes d’origine reprises dans la bibliothèque')

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
// Restauration : aperçu et confirmation avant de remplacer quoi que ce soit
await c.getByText('Remplacer les données de cet appareil ?').waitFor()
ok(/Sauvegarde du .*passage/.test(await texte(c, '[role=dialog]')), 'restauration : aperçu de la sauvegarde avant de remplacer')
await cap(c, '11-restauration')
await c.getByRole('button', { name: 'Remplacer', exact: true }).click()
await c.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 10000 })
await c.getByRole('tab', { name: 'Suivi' }).click()
await c.waitForTimeout(500)
ok((await texte(c)).includes('Nombres relatifs') && (await texte(c)).includes('3e A') === false, 'sauvegarde restaurée : suivi retrouvé')
await c.getByRole('tab', { name: 'Mes parcours' }).click()
ok((await texte(c)).includes('Classe test') && (await texte(c)).includes('3e A'), 'sauvegarde restaurée : dossiers retrouvés')

ok((await a.evaluate(() => [document.documentElement.scrollWidth - innerWidth, innerWidth])).join() === '0,390', 'aucun débordement horizontal')
ok(erreurs.length === 0, `aucune erreur JS ${erreurs.slice(0, 3).join(' | ')}`)
console.log(echecs ? `${echecs} échec(s)` : 'TOUT VERT')
await nav.close()
// Code de sortie non nul : un script ou une CI ne prend pas un échec pour un succès
if (echecs) process.exitCode = 1
