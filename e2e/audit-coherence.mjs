// Audit de MathALÉA (pnpm dev seulement) : pour chaque question à réponse
// numérique qui affiche son propre champ, la valeur attendue par la
// vérification (autoCorrection) doit être le résultat mis en évidence dans la
// correction (\color{#F15929}\boldsymbol{…}). Les désaccords sont listés :
// clé de réponse fausse (élève juste compté faux) ou correction fausse.
//   [SORTIE=fichier.json] node e2e/audit-coherence.mjs
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await nav.newPage()
await page.goto('http://localhost:1420/sonde-vide-404')
const res = await page.evaluate(async () => {
  document.body.innerHTML = '<div id="appMathalea" hidden></div>'
  const man = await (await fetch('/moteur/manifest.json')).json(); window.M = await import('/moteur/' + man.entree); await M.initialiser()
  const nombre = (t) => {
    const s = String(t).replace(/\\[,;: !]|~|\{,\}|\s| /g, (m) => (m === '{,}' ? ',' : '')).replace(/^\{(.*)\}$/, '$1')
    const f = /^(-?)\\[dt]?frac\{(-?\d+)\}\{(\d+)\}$/.exec(s)
    if (f) return (f[1] ? -1 : 1) * Number(f[2]) / Number(f[3])
    return /^-?\d+([.,]\d+)?$/.test(s) ? Number(s.replace(',', '.')) : null
  }
  const out = []
  let n = 0
  for (const pays of ['FR', 'CH']) {
    M.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
    const liste = (await M.listerExercices(pays)).filter((e) => e.interactif)
    for (const e of liste) {
      if (pays === 'CH' && out.some((x) => x.uuid === e.uuid)) continue
      let ex
      try { ex = await Promise.race([M.preparerExercice({ uuid: e.uuid, alea: 'coherence' }, 3), new Promise((_, ko) => setTimeout(() => ko(new Error('délai')), 15000))]) } catch { continue }
      n++
      ex.questions.forEach((q, i) => {
        const a = ex.interne.autoCorrection?.[i]
        const v = a?.valeur?.reponse?.value
        if (v == null || Array.isArray(v) || typeof v === 'object' || a.valeur.reponse.options?.estDansIntervalle || a.valeur.reponse.options?.unite) return
        const attendu = nombre(v)
        if (attendu == null) return
        // Question qui affiche son propre champ (pas d'élément d'un autre rang)
        if (!q.enonce.includes(`champTexteEx3Q${i}"`)) return
        if ([...q.enonce.matchAll(/champTexteEx3Q(\d+)"/g)].some((m) => Number(m[1]) !== i)) return
        const mis = [...q.correction.matchAll(/\\color\{#F15929\}\\boldsymbol\{((?:[^{}]|\{[^{}]*\})*)\}/g)].map((m) => m[1])
        if (!mis.length) return
        const nums = mis.map(nombre)
        if (nums.some((x) => x == null)) return
        const egal = (x) => x != null && Math.abs(x - attendu) < 1e-9 * Math.max(1, Math.abs(attendu))
        // Fraction mise en évidence en deux morceaux (numérateur, dénominateur)
        const paires = nums.slice(1).map((d, j) => (d ? nums[j] / d : null))
        if (!nums.some(egal) && !paires.some(egal) && !nums.some((x) => egal(-x))) out.push({ pays, id: e.id, uuid: e.uuid, q: i + 1, attendu: String(v), correction: mis.join(' ; ').slice(0, 80) })
      })
    }
  }
  return { n, out }
})
writeFileSync(process.env.SORTIE ?? '/tmp/audit-coherence.json', JSON.stringify(res, null, 1))
console.log(res.n, 'exercices,', res.out.length, 'désaccords')
for (const x of res.out.slice(0, 80)) console.log(x.pays, x.id, x.uuid, 'Q' + x.q, 'attendu', x.attendu, '| correction', x.correction)
await nav.close()
