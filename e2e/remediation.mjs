// Remédiation et positionnement (docs/remediation.md), joués comme un élève.
// Nathan, 5 novembre 2026 : « on prend le premier champ de réponse qui ne
// marche pas et on leur donne des exercices sur ce champ de réponse-là »,
// « ensuite, une fois qu'ils réussissent, ils font la suite ».
//   1. Test de positionnement : première ceinture réussie, la jaune s'ouvre
//      sans être obtenue, l'élève commence à la jaune.
//   2. Étude de fonction manquée sur la dérivée seulement (premier point) :
//      le bilan propose « Dériver une fonction composée », pas le tableau de
//      variations réussi ; la remédiation (exemple corrigé de l'étude, exercice
//      plus simple, puis l'étude avec de nouvelles valeurs) réussie ramène à la
//      ceinture.
//   3. Remédiation encore manquée : le prérequis prévu par l'enseignant.
//   4. Reprise d'une remédiation quittée depuis la page du parcours ; bouton
//      retour ; maîtrise de l'objectif dans le suivi point par point.
//   5. Exercice qui vise deux objectifs, une seule réponse : « Qu'est-ce qui
//      t'a bloqué ? » (panneau du bas), le choix de l'élève lance sa remédiation.
//   6. Progression adaptée (`adaptatif`) : « Exercice suivant » commence au plus
//      simple, reste au niveau jusqu'à deux réussites, monte, redescend après
//      un échec (progressionAdaptee.ts).
//   7. Remédiation automatique, sans rien de prévu par l'enseignant : un
//      objectif du programme prend des exercices du référentiel de MathALÉA
//      rangés sous ce même objectif.
// Téléphone (390 px, clair) et bureau (1280 px, sombre) ; réponses saisies
// au toucher et au clavier (e2e/eleve-repond.mjs).
// App construite servie sur 1420 :
//   CAPTURES=<dossier> node e2e/remediation.mjs   (TELEPHONE_SOMBRE=1 : téléphone en sombre)
import { chromium } from 'playwright'
import { jusqua, pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'
import { jouerSeance, lireSeance, toucher } from './eleve-repond.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const CAPTURES = process.env.CAPTURES
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
  return cond
}

const DERIVER = 'Dériver une fonction composée'
const TABLEAU = 'Dresser un tableau de variations'
const USUELLE = 'Dériver une fonction usuelle'
export const PARCOURS = {
  id: 'variations-composees-t',
  version: 1,
  titre: 'Variations d’une fonction composée',
  objectif: 'Étudier les variations de uⁿ, eᵘ et √u',
  niveau: 'Terminale',
  theme: 'Dérivation',
  difficulte: 2,
  icone: 'bx-line-chart',
  presentation: 'une_question_par_page',
  correction: 'question',
  style: 'ceintures',
  positionnement: true,
  paliers: [
    { titre: 'Dériver', nb: 1 },
    { titre: 'Étudier les variations', nb: 1, acces: 'seuil', seuil: 80 },
  ],
  etapes: [
    { uuid: '5fe20', id: 'TSA3-30', titre: 'Dériver une fonction du type $u^n$, $\\mathrm{e}^u$ ou $\\sqrt{u}$', nbQuestions: 2, objectifs: [DERIVER, USUELLE] },
    {
      uuid: '4336f',
      id: 'TSA3-32',
      titre: 'Étudier les variations d’une fonction du type $u^n$, $\\mathrm{e}^u$ ou $\\sqrt{u}$',
      nbQuestions: 1,
      objectifs: [DERIVER, TABLEAU],
      // Point 0 : la dérivée ; point 1 : le tableau de variations
      points: { 0: [DERIVER], 1: [TABLEAU] },
    },
  ],
  remediations: [
    { objectif: DERIVER, etapes: [{ uuid: '3391d', id: '1AN14-7', titre: 'Dériver une fonction du type $u(ax + b)$', nbQuestions: 2, objectifs: [DERIVER] }], prerequis: [USUELLE] },
    { objectif: USUELLE, etapes: [{ uuid: 'ec088', id: '1AN14-3', titre: 'Dériver un polynôme', nbQuestions: 2, objectifs: [USUELLE] }] },
  ],
}

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

async function eleve(nom, bureau, parcours = PARCOURS) {
  // TELEPHONE_SOMBRE=1 : téléphone en sombre aussi (captures des deux thèmes à 390 px)
  const telephone = process.env.TELEPHONE_SOMBRE ? 'dark' : 'light'
  const options = bureau ? { viewport: { width: 1280, height: 800 }, colorScheme: 'dark' } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: telephone }
  const ctx = await nav.newContext({ locale: 'fr-FR', ...options })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  // État de départ : un élève dont la classe a ce parcours (jamais une réponse)
  const donnees = { profil: 'eleve', pays: 'FR', classes: [{ lien: 'http://127.0.0.1:9/remediation/', nom: 'TS1', disponibles: ['TS1'], parcours: [parcours] }] }
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, donnees)
  const page = await ctx.newPage()
  page.on('pageerror', (err) => erreurs.push(`${nom} : ${err.message}`))
  await page.goto(base)
  const contexteCalcul = await nav.newContext()
  const calcul = await contexteCalcul.newPage()
  await calcul.goto(`${base}moteur/manifest.json`)
  await calcul.evaluate(async () => {
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    await m.initialiser()
    window.__moteur = m
  })
  const fermer = ctx.close.bind(ctx)
  ctx.close = async () => {
    await contexteCalcul.close().catch(() => {})
    return fermer()
  }
  await pagePrete(page)
  return { ctx, page, calcul, touche: !bureau, nom }
}

let n = 0
const capture = async (e, ecran) => {
  if (!CAPTURES) return
  await pagePrete(e.page)
  const theme = !e.touche || process.env.TELEPHONE_SOMBRE ? 'sombre' : 'clair'
  await e.page.screenshot({ path: `${CAPTURES}/remediation-${String(++n).padStart(2, '0')}-${ecran}-${e.touche ? 'telephone' : 'bureau'}-${theme}.png`, fullPage: true })
}
const texte = async (e) => (await e.page.locator('body').innerText()).replace(/\s+/g, ' ')
/** Touche un bouton immobile et visible, puis attend que l'écran soit prêt */
async function appuyer(e, bouton) {
  const b = bouton.first()
  await b.scrollIntoViewIfNeeded()
  await pointStable(b)
  await toucher(e, b)
  await pagePrete(e.page)
}
/** Rien ne doit masquer le bouton : il est touchable à l'endroit où il s'affiche */
async function touchable(e, bouton) {
  const b = bouton.first()
  await b.scrollIntoViewIfNeeded()
  return b.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!x && (x === el || el.contains(x))
  })
}
const bouton = (e, nom) => e.page.getByRole('button', { name: nom })

/** Ouvre le parcours depuis l'accueil */
async function ouvrirParcours(e) {
  await appuyer(e, bouton(e, /^\s*Variations d’une fonction composée/))
  await jusqua(async () => (await texte(e)).includes('Test de positionnement') || (await texte(e)).includes('Ceinture blanche'), { quoi: 'page du parcours' })
}

/** Joue la séance ouverte ; `fausser(etape, rang, attendu)` change une réponse saisie */
async function jouer(e, id, fausser = null) {
  // Fiche de cours d'abord, s'il y en a une
  const fiche = bouton(e, 'Commencer l’entraînement')
  if (await fiche.count()) await appuyer(e, fiche)
  const problemes = await jouerSeance(e, { id }, '', { fausser })
  await jusqua(async () => !(await e.page.locator('main .contenu-mathalea').count()), { quoi: 'arrivée au bilan', timeout: 60_000 })
  return problemes
}

// Réponse incorrecte à la dérivée (premier point de l'étude de fonction)
const dériveeFausse = (etapeEtude) => (etape, rang, a) => {
  if (etape !== etapeEtude || rang % 2 !== 0) return a
  a.valeur = { ...a.valeur, reponse: { ...a.valeur.reponse, value: '7' } }
  return a
}
// Toutes les réponses incorrectes d'un exercice (remédiation manquée)
const toutFaux = (etapes) => (etape, rang, a) => {
  if (!etapes.includes(etape) || !a.valeur?.reponse) return a
  a.valeur = { ...a.valeur, reponse: { ...a.valeur.reponse, value: '7' } }
  return a
}

async function scenario(bureau) {
  const e = await eleve(bureau ? 'bureau' : 'téléphone', bureau)
  const ecran = bureau ? 'bureau' : 'téléphone'
  const page = e.page

  // ---------- 1. Positionnement ----------
  await ouvrirParcours(e)
  ok((await texte(e)).includes('Test de positionnement'), `${ecran} : test de positionnement proposé avant de commencer`)
  ok(await touchable(e, bouton(e, 'Faire le test')), `${ecran} : « Faire le test » touchable`)
  await capture(e, 'positionnement-propose')
  await appuyer(e, bouton(e, 'Faire le test'))
  // Ceinture blanche réussie, étude de fonction manquée : la jaune s'ouvre, la seule à faire
  let problemes = await jouer(e, 'positionnement-variations-composees-t', dériveeFausse(1))
  ok(problemes.length === 0, `${ecran} : test joué`, problemes.join(' | '))
  let t = await texte(e)
  ok(t.includes('Tu commences à : ceinture jaune.'), `${ecran} : le test place à la ceinture jaune`, t.slice(0, 300))
  ok(!t.includes('À retravailler'), `${ecran} : pas de remédiation au bilan d'un test de positionnement`)
  await capture(e, 'positionnement-bilan')
  // Retour : la page du parcours, la jaune ouverte, la blanche ouverte par le test (pas obtenue)
  await appuyer(e, bouton(e, 'Revenir au parcours'))
  t = await texte(e)
  ok(t.includes('Ouvert par le test de positionnement'), `${ecran} : ceinture blanche « Ouvert par le test de positionnement »`, t.slice(0, 400))
  ok(!t.includes('Test de positionnement Une question'), `${ecran} : le test n'est plus proposé`)
  await capture(e, 'parcours-apres-test')

  // ---------- 2. Étude manquée sur la dérivée, remédiation réussie ----------
  // Le bouton plein est sur la ceinture à faire : la jaune
  const jaune = page.getByRole('region', { name: /^Ceinture jaune/ })
  const commencer = jaune.getByRole('button', { name: /^Commencer/ })
  ok((await commencer.getAttribute('class'))?.includes('bg-coopmaths-action'), `${ecran} : la ceinture à faire est la jaune (bouton plein)`)
  await appuyer(e, commencer)
  problemes = await jouer(e, PARCOURS.id, dériveeFausse(1))
  t = await texte(e)
  ok(t.includes('À retravailler'), `${ecran} : le bilan dit quoi retravailler`, t.slice(0, 400))
  ok(t.includes(DERIVER) && !t.includes(`${TABLEAU} Manqué`), `${ecran} : objectif du premier point manqué (la dérivée), pas celui du tableau réussi`)
  const parObjectif = (await page.getByRole('region', { name: 'Par objectif' }).innerText().catch(() => '')).replace(/\s+/g, ' ')
  ok(parObjectif.includes(`${DERIVER} 0 %`) && parObjectif.includes(`${TABLEAU} 100 %`), `${ecran} : bilan par objectif, réponse par réponse (dérivée 0 %, tableau 100 %)`, parObjectif)
  const retravailler = bouton(e, `Retravailler : ${DERIVER}`)
  ok(await touchable(e, retravailler), `${ecran} : « Retravailler : ${DERIVER} » touchable`)
  await capture(e, 'bilan-a-retravailler')
  const seanceBilan = await lireSeance(page, PARCOURS.id)
  const essai = seanceBilan.essais.find((x) => x.etape === 1)
  ok(essai?.detail && essai.detail['0'] < 1 && essai.detail['1'] === 1, `${ecran} : résultat par point enregistré (dérivée manquée, tableau correct)`, JSON.stringify(essai?.detail))
  await appuyer(e, retravailler)
  // Remédiation : exercice plus simple, puis l'étude avec de nouvelles valeurs
  t = await texte(e)
  ok(t.includes(`Retravailler : ${DERIVER}`), `${ecran} : séance de remédiation ouverte`, t.slice(0, 200))
  await capture(e, 'remediation-seance')
  const s0 = await lireSeance(page, 'remediation-variations-composees-t')
  ok(s0?.contenu.etapes.map((x) => x.id).join() === 'TSA3-32,1AN14-7,TSA3-32' && s0.contenu.etapes[0].interactif === false, `${ecran} : exemple corrigé, exercice de remédiation, puis exercice manqué`, JSON.stringify(s0?.contenu.etapes.map((x) => x.id)))
  // Exemple corrigé : rien à saisir, la correction au toucher
  ok((await bouton(e, 'Voir la correction').count()) > 0 && !(await page.locator('footer').getByRole('button', { name: 'Vérifier' }).isEnabled().catch(() => false)), `${ecran} : exemple corrigé, « Voir la correction » et rien à vérifier`)
  ok(s0?.remediation?.objectif === DERIVER && s0.remediation.etape === 1, `${ecran} : la séance garde son origine`)
  // Bouton retour pendant la séance : la séance se quitte, la page du parcours propose de continuer
  if (!bureau) {
    await page.goBack()
    await pagePrete(page)
    const quitter = bouton(e, 'Reprendre plus tard')
    if (await quitter.count()) await appuyer(e, quitter)
    await jusqua(async () => !(await page.locator('main .contenu-mathalea').count()), { quoi: 'séance quittée' })
    // Retour à l'accueil puis au parcours : la remédiation se reprend
    for (let i = 0; i < 3 && !(await bouton(e, /^\s*Variations d’une fonction composée/).count()); i++) {
      await page.goBack()
      await pagePrete(page)
    }
    await ouvrirParcours(e)
    t = await texte(e)
    ok(t.includes(`Retravailler : ${DERIVER}`) && (await bouton(e, 'Continuer').count()) > 0, `${ecran} : remédiation commencée reprise depuis la page du parcours`, t.slice(0, 300))
    await capture(e, 'parcours-remediation-en-cours')
    await appuyer(e, bouton(e, 'Continuer'))
  }
  problemes = await jouer(e, 'remediation-variations-composees-t')
  ok(problemes.length === 0, `${ecran} : remédiation jouée juste`, problemes.join(' | '))
  t = await texte(e)
  ok(t.includes('Exercice réussi : tu peux reprendre le parcours.'), `${ecran} : remédiation réussie`, t.slice(0, 300))
  ok(await touchable(e, bouton(e, 'Continuer : ceinture jaune')), `${ecran} : « Continuer : ceinture jaune » touchable`)
  await capture(e, 'remediation-reussie')
  await appuyer(e, bouton(e, 'Continuer : ceinture jaune'))
  ok((await page.locator('main .contenu-mathalea').count()) > 0, `${ecran} : retour à la ceinture jaune`)
  problemes = await jouer(e, PARCOURS.id)
  ok(problemes.length === 0, `${ecran} : ceinture jaune réussie après la remédiation`, problemes.join(' | '))
  t = await texte(e)
  ok(!t.includes('À retravailler'), `${ecran} : rien à retravailler quand tout est correct`)

  // ---------- 3. Remédiation encore manquée : le prérequis ----------
  await appuyer(e, bouton(e, /^Refaire : ceinture jaune$/))
  await jouer(e, PARCOURS.id, dériveeFausse(1))
  await appuyer(e, bouton(e, `Retravailler : ${DERIVER}`))
  await jouer(e, 'remediation-variations-composees-t', toutFaux([1, 2]))
  t = await texte(e)
  ok(t.includes(`Prochaine étape : ${USUELLE}`), `${ecran} : remédiation manquée, le prérequis prévu est proposé`, t.slice(0, 300))
  await capture(e, 'remediation-manquee')
  await appuyer(e, bouton(e, `Retravailler : ${USUELLE}`))
  const s2 = await lireSeance(page, 'remediation-variations-composees-t')
  ok(s2?.remediation?.profondeur === 2 && s2.contenu.etapes.map((x) => x.id).join() === 'TSA3-32,1AN14-3,TSA3-32', `${ecran} : deuxième remédiation (exemple, prérequis), puis encore l'exercice manqué`, JSON.stringify([s2?.remediation, s2?.contenu.etapes.map((x) => x.id)]))
  // Quitter le bilan par le bouton retour : la page du parcours d'origine
  await jouer(e, 'remediation-variations-composees-t')
  await page.goBack()
  await pagePrete(page)
  t = await texte(e)
  ok(t.includes('Ceinture blanche') && t.includes('Ceinture jaune'), `${ecran} : retour du bilan de remédiation vers la page du parcours`, t.slice(0, 200))

  // ---------- 4. Suivi : maîtrise point par point ----------
  for (let i = 0; i < 3 && !(await page.getByRole('tab', { name: /Suivi/ }).count()); i++) {
    await page.goBack()
    await pagePrete(page)
  }
  const onglet = page.getByRole('tab', { name: /Suivi/ }).or(bouton(e, /^Suivi$/))
  if (ok(await onglet.count(), `${ecran} : onglet Suivi`)) {
    await appuyer(e, onglet)
    await appuyer(e, bouton(e, 'Objectifs').or(page.getByRole('tab', { name: 'Objectifs' })))
    t = await texte(e)
    ok(t.includes(TABLEAU) && t.includes(DERIVER), `${ecran} : les deux objectifs de l'étude de fonction dans le suivi`, t.slice(0, 500))
    ok(!t.includes(USUELLE), `${ecran} : les remédiations ne comptent pas dans la maîtrise`)
    await capture(e, 'suivi')
  }
  await e.ctx.close()
}

/** 5. Deux objectifs, une seule réponse par question : l'élève dit ce qui l'a bloqué */
async function preciser(bureau) {
  const e = await eleve(bureau ? 'bureau (préciser)' : 'téléphone (préciser)', bureau)
  const ecran = bureau ? 'bureau' : 'téléphone'
  const page = e.page
  await ouvrirParcours(e)
  // Sans le test : la ceinture blanche, réponses incorrectes
  await appuyer(e, page.getByRole('region', { name: /^Ceinture blanche/ }).getByRole('button', { name: /^Commencer/ }))
  await jouer(e, PARCOURS.id, toutFaux([0]))
  let t = await texte(e)
  const ligne = bouton(e, /Qu’est-ce qui t’a bloqué \?/)
  ok((await ligne.count()) === 1 && !t.includes(`Retravailler : ${DERIVER}`), `${ecran} : deux objectifs sans résultat par réponse, l'élève précise`, t.slice(0, 400))
  await capture(e, 'preciser-bilan')
  await appuyer(e, ligne)
  const feuille = page.getByRole('dialog')
  ok((await feuille.getByRole('button', { name: DERIVER }).count()) === 1 && (await feuille.getByRole('button', { name: USUELLE }).count()) === 1, `${ecran} : panneau avec les deux objectifs`)
  await capture(e, 'preciser-panneau')
  // Bouton retour : le panneau se ferme, le bilan reste
  await page.goBack()
  await pagePrete(page)
  ok(!(await page.getByRole('dialog').count()) && (await ligne.count()) === 1, `${ecran} : bouton retour, panneau fermé, bilan gardé`)
  await appuyer(e, ligne)
  await appuyer(e, page.getByRole('dialog').getByRole('button', { name: USUELLE }))
  const s = await lireSeance(page, 'remediation-variations-composees-t')
  ok(s?.remediation?.objectif === USUELLE && s.contenu.etapes.map((x) => x.id).join() === 'TSA3-30,1AN14-3,TSA3-30', `${ecran} : remédiation de l'objectif choisi`, JSON.stringify([s?.remediation, s?.contenu.etapes.map((x) => x.id)]))
  await e.ctx.close()
}

/** 6. Progression adaptée : l'app choisit l'exercice suivant */
const ADAPTE = {
  ...PARCOURS,
  id: 'variations-adapte-t',
  titre: 'Variations, entraînement adapté',
  positionnement: undefined,
  adaptatif: true,
  etapes: [{ ...PARCOURS.etapes[0], objectifs: [DERIVER] }, PARCOURS.etapes[1]],
  remediations: undefined,
}
async function adapte(bureau) {
  const e = await eleve(bureau ? 'bureau (adapté)' : 'téléphone (adapté)', bureau, ADAPTE)
  const ecran = bureau ? 'bureau' : 'téléphone'
  const page = e.page
  await appuyer(e, bouton(e, /^\s*Variations, entraînement adapté/))
  const section = page.getByRole('region', { name: 'Entraînement adapté' })
  ok((await section.innerText()).includes(`Pour commencer : ${DERIVER}`), `${ecran} : entraînement adapté, le plus simple d'abord`, await section.innerText().catch(() => ''))
  await capture(e, 'adapte-parcours')
  const attendu = [
    ['commencer', 0, null],
    ['continuer', 0, null],
    ['monter', 1, dériveeFausse(0)],
    ['consolider', 0, null],
  ]
  for (const [k, [raison, niveau, fausser]] of attendu.entries()) {
    await appuyer(e, k === 0 ? section.getByRole('button', { name: 'Exercice suivant' }) : bouton(e, 'Exercice suivant'))
    const s = await lireSeance(page, 'adapte-variations-adapte-t')
    ok(s?.adapte?.raison === raison && s.adapte.niveau === niveau, `${ecran} : exercice ${k + 1}, ${raison} au niveau ${niveau}`, JSON.stringify(s?.adapte))
    await jouer(e, 'adapte-variations-adapte-t', fausser)
    const t = await texte(e)
    ok(t.includes(fausser ? 'Exercice manqué : le suivant reprend plus simplement.' : 'Exercice réussi.'), `${ecran} : bilan de l'exercice ${k + 1}`, t.slice(0, 200))
    if (k === 2) await capture(e, 'adapte-bilan-manque')
  }
  await e.ctx.close()
}

/** 7. Objectif du programme sans remédiation prévue : exercices du référentiel */
const PROGRAMME = 'Additionner deux nombres décimaux relatifs'
const AUTOMATIQUE = {
  id: 'relatifs-auto-5e',
  version: 1,
  titre: 'Relatifs, remédiation automatique',
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-calculator',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [{ uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2, objectifs: [PROGRAMME] }],
}
async function automatique(bureau) {
  const e = await eleve(bureau ? 'bureau (automatique)' : 'téléphone (automatique)', bureau, AUTOMATIQUE)
  const ecran = bureau ? 'bureau' : 'téléphone'
  const page = e.page
  await appuyer(e, bouton(e, /^\s*Relatifs, remédiation automatique/))
  await appuyer(e, bouton(e, /^Commencer/))
  await jouer(e, AUTOMATIQUE.id, toutFaux([0]))
  const retravailler = bouton(e, `Retravailler : ${PROGRAMME}`)
  ok(await touchable(e, retravailler), `${ecran} : objectif du programme sans remédiation prévue, « Retravailler » proposé`, (await texte(e)).slice(0, 300))
  await appuyer(e, retravailler)
  const s = await lireSeance(page, `remediation-${AUTOMATIQUE.id}`)
  // Exemple corrigé, deux exercices du référentiel sous le même objectif (dans l'ordre du menu), puis l'exercice manqué
  ok(s?.contenu.etapes.map((x) => x.uuid).join() === 'cbc26,61b4a,9c5e2,cbc26', `${ecran} : exercices du référentiel sous « ${PROGRAMME} »`, JSON.stringify(s?.contenu.etapes.map((x) => `${x.id} ${x.uuid}`)))
  const problemes = await jouer(e, `remediation-${AUTOMATIQUE.id}`)
  ok(problemes.length === 0 && (await texte(e)).includes('Exercice réussi : tu peux reprendre le parcours.'), `${ecran} : remédiation automatique jouée et réussie`, problemes.join(' | '))
  await e.ctx.close()
}

await scenario(false)
await scenario(true)
await automatique(false)
await automatique(true)
await preciser(false)
await preciser(true)
await adapte(false)
await adapte(true)
ok(erreurs.length === 0, 'aucune erreur de page', erreurs.slice(0, 5).join('\n'))
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
