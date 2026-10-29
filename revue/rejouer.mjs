// Rejoue les constats d'interactif (I1 à I5, et M1 avec --m1) avec leur graine et leurs
// paramètres, dans une page neuve, pour ne garder comme tickets que ce qui se reproduit.
// Écrit revue/rejeu.jsonl (une ligne par clé, reprise possible), lu par classer.mjs.
//   node revue/rejouer.mjs [--m1] [--categorie tickets-interactif] [--limite n]
// --decales : refait les M1 des exercices de revue/champs-decales.json (champs numérotés à
// la suite sur tout l'exercice) en comparant le champ k aux mises en évidence de la question
// qui le contient réellement (le banc prenait la correction de la question k).
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { chromium } from 'playwright'

const ici = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const args = process.argv.slice(2)
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d)
const DECALES = args.includes('--decales')
const REGLES = args.includes('--m1') || DECALES ? ['M1'] : ['I1', 'I2', 'I3', 'I4', 'I5']
const idsDecales = DECALES ? new Set(JSON.parse(readFileSync(join(ici, 'champs-decales.json'), 'utf8')).map((x) => x.id)) : null
const LIMITE = Number(opt('--limite', Infinity))
// --part k/n : ne rejoue qu'un constat sur n (k de 0 à n-1), pour lancer plusieurs instances
const PARTS = opt('--part', '0/1').split('/').map(Number)
const FICHIER = join(ici, 'rejeu.jsonl')
const lignesRejeu = existsSync(FICHIER) ? readFileSync(FICHIER, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []
// avec --decales, on reprend les constats déjà rejoués et reproduits, sauf ceux déjà refaits
const faits = new Set(DECALES ? lignesRejeu.filter((l) => l.decales).map((l) => l.cle) : lignesRejeu.map((l) => l.cle))
const constats = gunzipSync(readFileSync(join(ici, 'classement', 'constats.jsonl.gz')))
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))
  .filter((c) => c.origine === 'banc' && REGLES.includes(c.regle) && c.categorie !== 'faux-positifs' && !faits.has(c.cle))
  .filter((c) => !DECALES || idsDecales.has(c.id))
  .filter((c, i) => i % PARTS[1] === PARTS[0])
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
  if (DECALES) {
    // question qui contient réellement le champ k, et rang du champ dans cette question
    const lieu = await page.evaluate(async (k) => {
      await window.sonde.rendre('enonce')
      const el = document.getElementById(`champTexteEx0Q${k}`)
      const bloc = el?.closest('[data-q]')
      if (!bloc) return null
      const ids = [...bloc.querySelectorAll('[id^="champTexteEx0Q"]')].map((e) => e.id)
      return { q: Number(bloc.dataset.q), rang: ids.indexOf(el.id), nb: ids.length }
    }, q)
    if (!lieu) return { ...base, reproduit: false, detail: 'champ introuvable dans la page' }
    const evs = await page.evaluate((qq) => window.sonde.evidencesDe(qq), lieu.q)
    const candidats = [evs.length === lieu.nb ? evs[lieu.rang] : null, ...evs].filter(Boolean)
    for (const v of [...new Set(candidats)])
      if (await page.evaluate(([qq, vv]) => window.sonde.essai(qq, vv), [q, v]))
        return { ...base, reproduit: false, detail: `champ ${q} (question ${lieu.q + 1}, champ ${lieu.rang + 1}/${lieu.nb}) : mise en évidence ${v} acceptée` }
    return { ...base, reproduit: true, detail: `champ ${q} (question ${lieu.q + 1}, champ ${lieu.rang + 1}/${lieu.nb}) : mises en évidence ${JSON.stringify(evs)} refusées` }
  }
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
  const ligne = { ...(DECALES ? { decales: true } : {}), cle: c.cle, id: c.id, regle: c.regle, reproduit: !!res?.reproduit, detail: res?.detail ?? essais.at(-1)?.erreur ?? 'aucune occurrence', occurrence: res?.occurrence ?? occs[0] ?? null, params: res?.params ?? null, saisie: res?.saisie ?? null, retour: res?.retour ?? '', essais }
  appendFileSync(FICHIER, JSON.stringify(ligne) + '\n')
  if (i % 10 === 0 || i === constats.length) console.log(`[${i}/${constats.length}] ${c.id} ${c.regle} ${ligne.reproduit ? 'reproduit' : 'non reproduit'} : ${ligne.detail.slice(0, 80)}`)
}
await nav.close()
