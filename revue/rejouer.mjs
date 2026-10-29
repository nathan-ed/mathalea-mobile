// Rejoue les constats d'interactif (I1 à I5, et M1 avec --m1) avec leur graine et leurs
// paramètres, dans une page neuve, pour ne garder comme tickets que ce qui se reproduit.
// Écrit revue/rejeu.jsonl (une ligne par clé, reprise possible), lu par classer.mjs.
//   node revue/rejouer.mjs [--m1] [--categorie tickets-interactif] [--limite n]
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { chromium } from 'playwright'

const ici = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const args = process.argv.slice(2)
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d)
const REGLES = args.includes('--m1') ? ['M1'] : ['I1', 'I2', 'I3', 'I4', 'I5']
const LIMITE = Number(opt('--limite', Infinity))
const FICHIER = join(ici, 'rejeu.jsonl')
const faits = new Set(existsSync(FICHIER) ? readFileSync(FICHIER, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).cle) : [])
const constats = gunzipSync(readFileSync(join(ici, 'classement', 'constats.jsonl.gz')))
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))
  .filter((c) => c.origine === 'banc' && REGLES.includes(c.regle) && c.categorie !== 'faux-positifs' && !faits.has(c.cle))
  .slice(0, LIMITE)
console.log(`${constats.length} constats à rejouer`)

const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
let page
async function nouvellePage() {
  if (page) await page.close().catch(() => {})
  page = await nav.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(BASE + 'revue-banc.html')
  await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
  await page.evaluate(() => window.sonde.init())
}
await nouvellePage()

const descs = new Map()
async function params(c, variante, graine) {
  if (!descs.has(c.uuid)) descs.set(c.uuid, await page.evaluate((u) => window.sonde.decrire(u), c.uuid))
  const d = descs.get(c.uuid)
  const p = { uuid: c.uuid, nbQuestions: d.nbQuestions, alea: graine }
  const nb = /(?:^| )nb=(\d+)/.exec(variante)
  if (nb) p.nbQuestions = Number(nb[1])
  for (const [, k, v] of variante.matchAll(/(?:^| )(sup\d?)=(.*?)(?= sup\d?=| nb=|$)/g)) p[k] = v
  return p
}
const avecDelai = (pr, ms) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('délai dépassé')), ms))])

async function essayer(c, o) {
  const [variante, graine, q] = o
  const p = await params(c, variante, graine)
  await page.evaluate((pays) => window.sonde.langue(pays), c.pays)
  await page.evaluate((pp) => window.sonde.preparer(pp, 0), p)
  if (c.regle === 'I5') {
    const total = async (g) => {
      await page.evaluate((pp) => window.sonde.preparer(pp, 0), { ...p, alea: g })
      const r = await page.evaluate(() => window.sonde.interactif('correcte'))
      return r.resultats.find((x) => x.q === q)?.total
    }
    const ta = await total(graine.replace(/-b$/, '-a'))
    const tb = await total(graine.replace(/-a$/, '-b'))
    return { reproduit: ta != null && tb != null && ta !== tb, detail: `barème ${ta} (graine ${graine.replace(/-b$/, '-a')}) et ${tb} (graine ${graine.replace(/-a$/, '-b')})`, params: p }
  }
  const saisie = { I1: 'correcte', I2: 'incorrecte', I3: 'vide', I4: 'correcte', M1: 'evidence' }[c.regle]
  const r = await page.evaluate((s) => window.sonde.interactif(s), saisie)
  const x = r.resultats.find((y) => y.q === q)
  if (!x) return { reproduit: false, detail: `question ${q + 1} absente`, params: p }
  const base = { params: p, saisie: x.valeurs ?? null, format: x.format, retour: x.retour ?? '' }
  if (c.regle === 'I4') return { ...base, reproduit: x.possible === false && /absent/.test(x.raison ?? ''), detail: x.raison ?? 'champ présent' }
  if (x.possible === false) return { ...base, reproduit: false, detail: `saisie impossible : ${x.raison}` }
  if (x.exception) return { ...base, reproduit: true, detail: `exception : ${x.exception}` }
  if (c.regle === 'I1' || c.regle === 'M1') {
    if (!x.juste && c.regle === 'M1' && x.format === 'mathlive') {
      // comme le banc : la réunion des morceaux mis en évidence peut être acceptée
      const evs = await page.evaluate((qq) => window.sonde.evidencesDe(qq), q)
      for (const v of [evs.join(''), evs[0]].filter(Boolean))
        if (await page.evaluate(([qq, vv]) => window.sonde.essai(qq, vv), [q, v])) return { ...base, reproduit: false, detail: `accepté sous la forme ${v}` }
      return { ...base, reproduit: true, detail: `mise en évidence ${JSON.stringify(evs)} refusée (${x.points}/${x.total})` }
    }
    return { ...base, reproduit: !x.juste, detail: x.juste ? 'accepté' : `refusé (${x.points}/${x.total})${x.retour ? ' : ' + x.retour : ''}` }
  }
  if (c.regle === 'I2') return { ...base, reproduit: x.verifie && x.juste, detail: x.juste ? `réponse fausse acceptée` : 'refusée' }
  if (c.regle === 'I3') return { ...base, reproduit: x.verifie && x.juste, detail: x.juste ? 'champ vide accepté' : 'champ vide refusé' }
  return { ...base, reproduit: false, detail: '?' }
}

let i = 0
for (const c of constats) {
  i++
  // trois occurrences au plus, de graines différentes
  const vues = new Set()
  const occs = c.occurrences.filter((o) => o[1] && !vues.has(o[0] + o[1]) && vues.add(o[0] + o[1])).slice(0, 3)
  let res = null
  const essais = []
  for (const o of occs) {
    try {
      const r = await avecDelai(essayer(c, o), 60_000)
      essais.push({ variante: o[0], graine: o[1], q: o[2], reproduit: r.reproduit, detail: r.detail })
      if (r.reproduit) {
        res = { ...r, occurrence: o }
        break
      }
      res ??= { ...r, occurrence: o }
    } catch (e) {
      essais.push({ variante: o[0], graine: o[1], q: o[2], erreur: String(e.message).slice(0, 200) })
      await nouvellePage()
    }
  }
  const ligne = { cle: c.cle, id: c.id, regle: c.regle, reproduit: !!res?.reproduit, detail: res?.detail ?? essais.at(-1)?.erreur ?? 'aucune occurrence', occurrence: res?.occurrence ?? occs[0] ?? null, params: res?.params ?? null, saisie: res?.saisie ?? null, retour: res?.retour ?? '', essais }
  appendFileSync(FICHIER, JSON.stringify(ligne) + '\n')
  if (i % 10 === 0 || i === constats.length) console.log(`[${i}/${constats.length}] ${c.id} ${c.regle} ${ligne.reproduit ? 'reproduit' : 'non reproduit'} : ${ligne.detail.slice(0, 80)}`)
}
await nav.close()
