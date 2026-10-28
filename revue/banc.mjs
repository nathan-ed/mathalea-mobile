// Banc de la revue des exercices : chaque exercice du référentiel, chaque
// variante de ses paramètres, deux graines ; captures de l'énoncé, de la
// correction et des réponses vérifiées ; test de l'interactif (vide,
// correcte, incorrecte, valeur mise en évidence) ; contrôles du texte.
// Journal : revue/journal.jsonl (une ligne par constat), reprise par revue/fait.txt.
//
//   MATHALEA=~/mathalea-main node revue/banc.mjs [--filtre <regex>] [--limite n]
//     [--travailleurs n] [--sans-captures] [--refaire]
// Serveur de dev de MathALÉA lancé sur 5173 (npx vite --port 5173).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { controler, controlerSerie } from './controles.mjs'

const ici = dirname(fileURLToPath(import.meta.url))
const MATHALEA = process.env.MATHALEA ?? '/home/user/mathalea-main'
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const args = process.argv.slice(2)
const opt = (nom, def) => {
  const i = args.indexOf(nom)
  return i >= 0 ? args[i + 1] : def
}
const FILTRE = new RegExp(opt('--filtre', '.'))
const LIMITE = Number(opt('--limite', Infinity))
const TRAVAILLEURS = Number(opt('--travailleurs', 3))
const CAPTURES = !args.includes('--sans-captures')
const REFAIRE = args.includes('--refaire')
const MAX_VARIANTES = 50
const GRAINES = ['a', 'b']

const JOURNAL = join(ici, 'journal.jsonl')
const FAIT = join(ici, 'fait.txt')
const DOSSIER_CAPTURES = join(ici, 'captures')
const DOSSIER_SORTIES = join(ici, 'sorties')
mkdirSync(DOSSIER_CAPTURES, { recursive: true })
mkdirSync(DOSSIER_SORTIES, { recursive: true })

// Écrire seulement si le contenu change : une écriture fait recharger par vite
// les pages des autres instances du banc en cours (exercices interrompus).
const ecrireSiChange = (f, contenu) => {
  if (!existsSync(f) || readFileSync(f, 'utf8') !== contenu) writeFileSync(f, contenu)
}
ecrireSiChange(join(MATHALEA, 'revue-sonde.ts'), readFileSync(join(ici, 'sonde.ts'), 'utf8'))
ecrireSiChange(
  join(MATHALEA, 'revue-banc.html'),
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Banc</title>
<style>body{margin:0;background:#fff;font-family:system-ui,sans-serif}#zone{width:390px;padding:12px 16px;box-sizing:border-box}#zone .question{margin:0 0 14px}</style></head>
<body><div id="zone"></div><script type="module">import * as s from './revue-sonde.ts'; window.sonde = s; window.pret = true</script></body></html>`,
)

// ---------- variantes des paramètres ----------

function valeursDe(p) {
  switch (p.type) {
    case 'liste':
      return p.options.map((o) => o.valeur)
    case 'case':
      return ['true', 'false']
    case 'nombre': {
      if (!p.max) return [p.defaut || '1']
      const l = []
      for (let v = 1; v <= Math.min(p.max, 12); v++) l.push(String(v))
      if (p.max > 12) l.push(String(p.max))
      return l
    }
    case 'texte': {
      if (!p.options?.length) return [p.defaut]
      const l = p.options.map((o) => o.valeur)
      if (p.defaut && !l.includes(p.defaut)) l.unshift(p.defaut)
      return l
    }
  }
  return [p.defaut]
}

/** Toutes les combinaisons, ou une couverture par paires au-delà de MAX_VARIANTES */
export function variantes(desc) {
  const params = desc.parametres.filter((p) => valeursDe(p).length > 0)
  const vals = params.map(valeursDe)
  const defaut = Object.fromEntries(params.map((p) => [p.cle, p.defaut]))
  const total = vals.reduce((a, v) => a * v.length, 1)
  let combis = []
  let mode = 'complet'
  if (total <= MAX_VARIANTES) {
    combis = [[]]
    for (const v of vals) combis = combis.flatMap((c) => v.map((x) => [...c, x]))
  } else {
    mode = 'paires'
    // Paires à couvrir
    const reste = new Set()
    for (let i = 0; i < vals.length; i++)
      for (let j = i + 1; j < vals.length; j++)
        for (const a of vals[i]) for (const b of vals[j]) reste.add(`${i}=${a}|${j}=${b}`)
    // Chaque valeur seule au moins une fois
    const seules = new Set(vals.flatMap((v, i) => v.map((x) => `${i}=${x}`)))
    while (reste.size || seules.size) {
      const c = params.map((p) => p.defaut)
      // On part de la première paire ou valeur non couverte puis on complète gloutonnement
      const [premier] = reste.size ? reste : seules
      for (const part of premier.split('|')) {
        const [i, x] = part.split(/=(.*)/s)
        c[Number(i)] = x
      }
      const fixes = new Set(premier.split('|').map((part) => Number(part.split('=')[0])))
      for (let i = 0; i < vals.length; i++) {
        if (fixes.has(i)) continue
        let meilleur = c[i]
        let score = -1
        for (const x of vals[i]) {
          let s = 0
          for (let j = 0; j < vals.length; j++) {
            if (j === i || !fixes.has(j)) continue
            const cle = i < j ? `${i}=${x}|${j}=${c[j]}` : `${j}=${c[j]}|${i}=${x}`
            if (reste.has(cle)) s++
          }
          if (s > score) (score = s), (meilleur = x)
        }
        c[i] = meilleur
        fixes.add(i)
      }
      for (let i = 0; i < c.length; i++) {
        seules.delete(`${i}=${c[i]}`)
        for (let j = i + 1; j < c.length; j++) reste.delete(`${i}=${c[i]}|${j}=${c[j]}`)
      }
      combis.push(c)
    }
  }
  const liste = combis.map((c) => Object.fromEntries(params.map((p, i) => [p.cle, c[i]])))
  // Réglages par défaut en premier
  const cle = (o) => JSON.stringify(o)
  const sansDefaut = liste.filter((o) => cle(o) !== cle(defaut))
  const toutes = [defaut, ...sansDefaut]
  return { mode, total, variantes: toutes }
}

const etiquette = (v) =>
  Object.entries(v)
    .map(([k, x]) => `${k}=${x}`)
    .join(' ') || 'défaut'

// ---------- journal ----------

const fait = new Set(existsSync(FAIT) && !REFAIRE ? readFileSync(FAIT, 'utf8').split('\n').filter(Boolean) : [])
function noter(e, c) {
  appendFileSync(JOURNAL, JSON.stringify({ id: e.id, uuid: e.uuid, niveau: e.niveau, theme: e.theme, pays: e.pays, ...c }) + '\n')
}

// ---------- passage d'un exercice ----------

async function passer(page, e) {
  const constats = []
  const c = (o) => constats.push(o)
  const sortie = { id: e.id, uuid: e.uuid, titre: e.titre, chemin: e.chemin, pays: e.pays, variantes: [] }
  await page.evaluate((pays) => window.sonde.langue(pays), e.pays)
  let desc
  try {
    desc = await page.evaluate((u) => window.sonde.decrire(u), e.uuid)
  } catch (err) {
    c({ regle: 'X1', gravite: 2, extrait: `decrireExercice : ${err.message.slice(0, 300)}` })
    return { constats, sortie }
  }
  for (const k of controler(e.titre, { type: 'titre' })) c({ ...k, ou: 'titre' })
  const { mode, total, variantes: vs } = variantes(desc)
  sortie.parametres = desc.parametres
  sortie.couverture = { mode, total, passees: vs.length }
  if (mode === 'paires') c({ regle: 'X7', gravite: 6, extrait: `${total} combinaisons : ${vs.length} passées (couverture par paires)` })
  const extra = desc.nbQuestionsModifiable && desc.nbQuestions < 10 ? [{ ...vs[0], __nb: 10 }] : []
  const totaux = new Map()
  const dossier = join(DOSSIER_CAPTURES, e.niveau.replace(/[^\w-]+/g, '_'), e.id.replace(/[^\w-]+/g, '_'))
  if (CAPTURES) mkdirSync(dossier, { recursive: true })
  const deja = new Set()
  for (const [k, v] of [...vs, ...extra].entries()) {
    const { __nb, ...sup } = v
    const lib = etiquette(sup) + (__nb ? ` nb=${__nb}` : '')
    for (const g of GRAINES) {
      if (__nb && g === 'b') continue
      const params = { uuid: e.uuid, nbQuestions: __nb ?? desc.nbQuestions, alea: `revue-${k}-${g}`, ...sup }
      const ctx = { variante: lib, graine: params.alea }
      let prep
      try {
        prep = await page.evaluate((p) => window.sonde.preparer(p, 0), params)
      } catch (err) {
        c({ ...ctx, regle: 'X1', gravite: 2, extrait: `génération : ${err.message.slice(0, 300)}` })
        continue
      }
      if (g === 'a' && k === 0) {
        const bis = await page.evaluate((p) => window.sonde.preparer(p, 0), params).catch(() => null)
        const norme = (x) => JSON.stringify(x.questions.map((q) => q.enonce.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/\b(id|data-[\w-]+)="[^"]*"/g, '')))
        if (bis && norme(bis) !== norme(prep))
          c({ ...ctx, regle: 'X6', gravite: 2, extrait: 'même graine, énoncés différents (aléa hors nouvelleVersion ?)' })
        await page.evaluate((p) => window.sonde.preparer(p, 0), params)
      }
      if (!prep.questions.length) c({ ...ctx, regle: 'X4', gravite: 2, extrait: 'aucune question générée pour cette combinaison de paramètres' })
      // Contrôles du texte
      const vu = (cle) => (deja.has(cle) ? true : (deja.add(cle), false))
      if (!vu('consigne:' + prep.consigne)) for (const x of controler(prep.consigne, { type: 'consigne' })) c({ ...ctx, ...x, ou: 'consigne' })
      if (prep.introduction && !vu('intro:' + prep.introduction)) for (const x of controler(prep.introduction, { type: 'enonce' })) c({ ...ctx, ...x, ou: 'introduction' })
      prep.questions.forEach((q, i) => {
        for (const x of controler(q.enonce, { type: 'enonce', pays: e.pays })) c({ ...ctx, ...x, q: i, ou: 'énoncé' })
        for (const x of controler(q.correction, { type: 'correction', pays: e.pays })) c({ ...ctx, ...x, q: i, ou: 'correction' })
      })
      for (const x of controlerSerie(prep.questions)) c({ ...ctx, ...x, ou: 'série' })
      // Rendu et captures
      const base = join(dossier, `${String(k).padStart(3, '0')}-${g}`)
      for (const quoi of ['enonce', 'correction']) {
        try {
          const pb = await page.evaluate((qq) => window.sonde.rendre(qq), quoi)
          for (const x of pb) c({ ...ctx, ...x, gravite: x.regle === 'X5' ? 4 : 2, ou: quoi === 'enonce' ? 'énoncé' : 'correction' })
          if (CAPTURES && g === 'a') await page.locator('#zone').screenshot({ path: `${base}-${quoi}.png` })
        } catch (err) {
          c({ ...ctx, regle: 'X1', gravite: 2, extrait: `rendu ${quoi} : ${err.message.slice(0, 300)}` })
        }
      }
      // Interactif
      const inter = {}
      for (const s of ['vide', 'incorrecte', 'evidence', 'correcte']) {
        try {
          inter[s] = await page.evaluate((ss) => window.sonde.interactif(ss), s)
        } catch (err) {
          c({ ...ctx, regle: 'X1', gravite: 1, extrait: `interactif (${s}) : ${err.message.slice(0, 300)}` })
        }
      }
      if (CAPTURES && g === 'a' && inter.correcte?.resultats.length) await page.locator('#zone').screenshot({ path: `${base}-reponses.png` }).catch(() => {})
      const res = (s) => inter[s]?.resultats ?? []
      for (const r of res('vide')) {
        if (r.exception) c({ ...ctx, q: r.q, regle: 'I3', gravite: 1, extrait: `champ vide : exception ${r.exception}`, format: r.format })
        else if (r.verifie && r.juste) c({ ...ctx, q: r.q, regle: 'I3', gravite: 1, extrait: 'champ vide accepté', format: r.format })
      }
      for (const r of res('correcte')) {
        if (!r.possible) {
          if (/absent/.test(r.raison)) c({ ...ctx, q: r.q, regle: 'I4', gravite: 1, extrait: r.raison, format: r.format })
          else c({ ...ctx, q: r.q, regle: 'IM', gravite: 6, extrait: r.raison, format: r.format })
          continue
        }
        if (r.exception) c({ ...ctx, q: r.q, regle: 'I1', gravite: 1, extrait: `exception ${r.exception}`, format: r.format, saisie: r.valeurs })
        else if (!r.juste) c({ ...ctx, q: r.q, regle: 'I1', gravite: 1, extrait: `bonne réponse refusée (${r.points}/${r.total}) ${r.retour ?? ''}`, format: r.format, saisie: r.valeurs })
        if (k === 0 && !__nb) {
          const t = totaux.get(r.q)
          if (t != null && t !== r.total) c({ ...ctx, q: r.q, regle: 'I5', gravite: 1, extrait: `barème ${t} puis ${r.total} selon la graine`, format: r.format })
          totaux.set(r.q, r.total)
        }
      }
      for (const r of res('incorrecte')) {
        if (r.exception) c({ ...ctx, q: r.q, regle: 'I2', gravite: 1, extrait: `exception ${r.exception}`, format: r.format, saisie: r.valeurs })
        else if (r.verifie && r.juste) c({ ...ctx, q: r.q, regle: 'I2', gravite: 1, extrait: 'réponse fausse acceptée', format: r.format, saisie: r.valeurs })
      }
      const bonnes = new Map(res('correcte').map((r) => [r.q, r.valeurs]))
      for (const r of res('evidence')) {
        if (!r.possible) {
          if (/évidence pour/.test(r.raison ?? '')) c({ ...ctx, q: r.q, regle: 'M8', gravite: 3, extrait: r.raison, format: r.format })
          continue
        }
        if (r.exception) c({ ...ctx, q: r.q, regle: 'M1', gravite: 3, extrait: `exception ${r.exception}`, format: r.format, saisie: r.valeurs })
        else if (!r.juste && r.format === 'mathlive') {
          // Mise en évidence en plusieurs morceaux : on essaie aussi leur réunion
          const evs = await page.evaluate((q) => window.sonde.evidencesDe(q), r.q)
          const autres = [evs.join(''), evs[0]].filter((v, j, t) => v && t.indexOf(v) === j && v !== r.valeurs.champ)
          let ok = false
          for (const v of autres) if (await page.evaluate(([q, vv]) => window.sonde.essai(q, vv), [r.q, v])) (ok = true)
          if (!ok) c({ ...ctx, q: r.q, regle: 'M1', gravite: 3, extrait: `valeur en évidence refusée par le champ : ${JSON.stringify(evs)} ; attendu : ${JSON.stringify(bonnes.get(r.q) ?? {})}`, format: r.format })
        } else if (!r.juste) c({ ...ctx, q: r.q, regle: 'M1', gravite: 3, extrait: `valeur en évidence refusée par le champ : ${JSON.stringify(r.valeurs)} ; attendu : ${JSON.stringify(bonnes.get(r.q) ?? {})}`, format: r.format })
      }
      for (const qc of inter.evidence?.qcm ?? []) {
        if (qc.fausseEnEvidence.length) c({ ...ctx, q: qc.q, regle: 'M4', gravite: 1, extrait: `QCM : proposition fausse en évidence (${qc.fausseEnEvidence[0]})`, format: 'qcm' })
        else if (!qc.trouvee) c({ ...ctx, q: qc.q, regle: 'M3', gravite: 5, extrait: `QCM : bonne proposition (${qc.justes.join(' / ').slice(0, 80)}) absente de la mise en évidence (${qc.enEvidence.slice(0, 80)})`, format: 'qcm' })
      }
      // Version non interactive : corrections et énoncés propres à elle
      if (g === 'a') {
        try {
          const ni = await page.evaluate((p) => window.sonde.preparer({ ...p, interactif: false }, 0), params)
          ni.questions.forEach((q, i) => {
            if (q.enonce !== prep.questions[i]?.enonce) for (const x of controler(q.enonce, { type: 'enonce' })) c({ ...ctx, ...x, q: i, ou: 'énoncé non interactif' })
            if (q.correction !== prep.questions[i]?.correction) for (const x of controler(q.correction, { type: 'correction' })) c({ ...ctx, ...x, q: i, ou: 'correction non interactive' })
          })
          if (k === 0) sortie.nonInteractif = ni.questions.map((q) => ({ enonce: q.enonce, correction: q.correction }))
        } catch (err) {
          c({ ...ctx, regle: 'X1', gravite: 2, extrait: `non interactif : ${err.message.slice(0, 300)}` })
        }
        sortie.variantes.push({
          variante: lib,
          graine: params.alea,
          consigne: prep.consigne,
          introduction: prep.introduction,
          questions: prep.questions,
          reponses: Object.fromEntries((inter.correcte?.resultats ?? []).map((r) => [r.q, r.valeurs])),
        })
      }
    }
  }
  return { constats, sortie }
}

// ---------- boucle ----------

const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
async function nouvellePage() {
  const page = await nav.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  page.on('dialog', (d) => d.dismiss().catch(() => {}))
  page.erreurs = []
  page.on('pageerror', (err) => page.erreurs.push(err.message))
  page.on('console', (m) => m.type() === 'error' && page.erreurs.push(m.text().slice(0, 300)))
  await page.goto(BASE + 'revue-banc.html')
  await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
  return page
}

const p0 = await nouvellePage()
const tous = await p0.evaluate(() => window.sonde.init())
writeFileSync(join(ici, 'referentiel.json'), JSON.stringify(tous))
const aFaire = tous.filter((e) => FILTRE.test(e.id) && !fait.has(e.uuid)).slice(0, LIMITE)
console.log(`${tous.length} exercices, ${aFaire.length} à passer`)

let suivant = 0
let termines = 0
const debut = Date.now()
async function travailleur(n) {
  let page = n === 0 ? p0 : await nouvellePage()
  if (n !== 0) await page.evaluate(() => window.sonde.init())
  while (suivant < aFaire.length) {
    const e = aFaire[suivant++]
    page.erreurs = []
    let resultat
    try {
      resultat = await Promise.race([
        passer(page, e),
        new Promise((_, ko) => setTimeout(() => ko(new Error('délai de 10 min dépassé')), 600_000)),
      ])
    } catch (err) {
      noter(e, { regle: 'X1', gravite: 2, extrait: `arrêt : ${err.message.slice(0, 300)}` })
      await page.close().catch(() => {})
      page = await nouvellePage()
      await page.evaluate(() => window.sonde.init())
      appendFileSync(FAIT, e.uuid + '\n')
      continue
    }
    for (const x of resultat.constats) noter(e, x)
    for (const msg of new Set(page.erreurs)) {
      if (/favicon|Failed to load resource/.test(msg)) continue
      noter(e, { regle: 'X1', gravite: 2, extrait: `console : ${msg}` })
    }
    writeFileSync(join(DOSSIER_SORTIES, `${e.id.replace(/[^\w-]+/g, '_')}.json`), JSON.stringify(resultat.sortie))
    appendFileSync(FAIT, e.uuid + '\n')
    termines++
    const s = (Date.now() - debut) / 1000
    console.log(`[${termines}/${aFaire.length}] ${e.id} : ${resultat.constats.length} constats (${Math.round(s / termines)} s/ex.)`)
  }
}
await Promise.all(Array.from({ length: TRAVAILLEURS }, (_, n) => travailleur(n)))
await nav.close()
process.exit(0)
