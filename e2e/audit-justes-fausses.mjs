// Audit de MathALÉA par l'API du moteur (pnpm dev seulement) : pour chaque
// exercice interactif, toutes ses questions affichées ensemble, chaque élément
// corrigé (autoCorrection[k]) rempli en entier deux fois, avec la bonne
// réponse tirée de la correction automatique (doit être acceptée), puis avec
// une réponse fausse (doit être refusée). Une ligne JSON par exercice.
//   SORTIE=<fichier.jsonl> PARALLELE=4 [PAYS=FR|CH] [UUIDS=a,b] [DEBUT= FIN=] node e2e/audit-justes-fausses.mjs
import { chromium } from 'playwright'
import { appendFileSync, writeFileSync } from 'node:fs'

const sortie = process.env.SORTIE ?? '/tmp/audit-justes-fausses.jsonl'
const GRAINE = process.env.GRAINE ?? 'audit-jf'
const N = 3
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

async function nouvellePage(pays) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  const page = await ctx.newPage()
  page.journal = []
  page.on('pageerror', (e) => page.journal.push('pageerror: ' + e.message.slice(0, 200)))
  await page.goto('http://localhost:1420/sonde-vide-404')
  await page.evaluate(async (pays) => {
    document.body.innerHTML = '<div id="appMathalea" hidden></div><div id="z" class="contenu-mathalea" style="width:358px"></div>'
    const man = await (await fetch('/moteur/manifest.json')).json()
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/moteur/' + man.css; document.head.prepend(l)
    window.M = await import('/moteur/' + man.entree)
    await M.initialiser()
    M.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
  }, pays)
  return page
}

async function auditer(page, e) {
  return page.evaluate(async ([uuid, graine, N]) => {
    const delai = (p, ms, quoi) => Promise.race([p, new Promise((_, ko) => setTimeout(() => ko(new Error('délai dépassé : ' + quoi)), ms))])
    const attendre = (ms) => new Promise((ok) => setTimeout(ok, ms))
    // Préparation comme l'app (exercices qui chargent leurs questions après coup)
    async function preparer() {
      let ex = await M.preparerExercice({ uuid, alea: graine }, N)
      if (ex.interne.generationStatus === 'loading') {
        const t = Date.now()
        while (ex.interne.generationStatus === 'loading' && Date.now() - t < 30000) await attendre(100)
        ex = await M.preparerExercice({ uuid, alea: ex.graine }, N)
      }
      return ex
    }
    const z = document.getElementById('z')
    async function afficherTout(ex) {
      z.innerHTML = ex.questions.map((q, i) => (i === 0 && q.contexte.trim() ? `<div>${q.contexte}</div>` : '') + `<div class="q">${q.enonce}</div>`).join('')
      await delai(M.afficher(z), 20000, 'affichage')
      // Figures à cliquer : élément <clique-figure> créé comme le fait l'app
      // (absent du HTML du moteur)
      const listes = ex.interne.cliqueFiguresArray
      ;(listes ?? []).forEach((l, k) => {
        if (!Array.isArray(l) || !l.length || document.getElementById(`clique-figureEx${N}Q${k}`)) return
        const el = document.createElement('clique-figure')
        el.id = `clique-figureEx${N}Q${k}`
        el.setAttribute('numero-exercice', String(N))
        el.setAttribute('question-index', String(k))
        el.setAttribute('figures', JSON.stringify(l))
        const r = document.getElementById(`resultatCheckEx${N}Q${k}`)
        if (r) r.before(el); else z.append(el)
      })
      await attendre(150)
    }
    const brut = (v) => {
      if (v == null) return null
      if (Array.isArray(v)) return brut(v[0])
      if (typeof v === 'object') return v.texFraction ?? v.texFSD ?? (typeof v.toLatex === 'function' ? v.toLatex() : null) ?? (v.toString !== Object.prototype.toString ? String(v) : null)
      return String(v)
    }
    // Réponse fausse plausible : nombre décalé, fraction décalée, sinon texte faux
    function fausse(latex) {
      const t = String(latex ?? '')
      const nombre = t.replace(/\{,\}/g, ',').replace(/[\s  ]|\\[,;: !]/g, '')
      if (/^-?\d+([.,]\d+)?$/.test(nombre)) {
        const n = Number(nombre.replace(',', '.')) + 1
        return String(Math.round(n * 1e6) / 1e6).replace('.', ',')
      }
      const f = /^\\[dt]?frac\{(-?\d+)\}\{(\d+)\}$/.exec(nombre)
      if (f) return `\\dfrac{${Number(f[1]) + 1}}{${f[2]}}`
      if (/\d/.test(t)) return t.replace(/(\d+)(?!.*\d)/, (m) => String(Number(m) + 1))
      return 'zzz'
    }
    const champ = (id) => document.getElementById(id)
    /** Saisie d'un élève pour une valeur attendue et ses options (juste ou fausse) */
    function saisie(spec, juste) {
      const options = spec?.options ?? {}
      let rep = brut(spec?.value)
      if (rep == null) return null
      if (Array.isArray(spec?.value) && (options.fractionIrreductible || options.fractionReduite || options.fractionSimplifiee)) {
        // Liste de formes admises : la forme réduite (la dernière)
        rep = brut(spec.value[spec.value.length - 1])
      }
      const intervalle = /^([\[\]])\s*(-?[\d.,]+)\s*;\s*(-?[\d.,]+)\s*([\[\]])$/.exec(rep)
      const unite = /^(-?[\d\s\u202f\u00a0.,{}]+?|-?\d+(?:\\,\d{3})+(?:[.,]\d+)?)\s*(?:\\text\{\s*)?([A-Za-zµ°]+)\}?\s*(\^\{?\d\}?)?$/.exec(rep)
      const sci = /^(-?\d+(?:[.,]\d+)?)e(-?\d+)$/.exec(rep)
      const frac = /^\\[dt]?frac\{(-?\d+)\}\{(\d+)\}$/.exec(rep)
      if (options.estDansIntervalle && intervalle) {
        const a = Number(intervalle[2].replace(',', '.')), b = Number(intervalle[3].replace(',', '.'))
        return String(juste ? (a + b) / 2 : b + (b - a) + 1).replace('.', ',')
      }
      if (options.unite && unite) {
        const n = unite[1].replace(/[\s\u202f\u00a0{}]|\\,/g, '')
        return `${juste ? n : fausse(n)}\\operatorname{\\mathrm{${unite[2]}}}${unite[3] ?? ''}`
      }
      if (sci) {
        // Écriture scientifique tapée comme un élève : 9,03 × 10^{-3}
        return `${juste ? sci[1] : fausse(sci[1])}\\times10^{${sci[2]}}`
      }
      if (frac && (options.fractionIrreductible || options.fractionReduite || options.fractionSimplifiee)) {
        const pgcd = (a, b) => (b ? pgcd(b, a % b) : Math.abs(a))
        const d = pgcd(Number(frac[1]), Number(frac[2]))
        const num = Number(frac[1]) / d, den = Number(frac[2]) / d
        return den === 1 ? String(juste ? num : num + 1) : `\\dfrac{${juste ? num : num + 1}}{${den}}`
      }
      return juste ? rep : fausse(rep)
    }
    const formats = (ex) => (ex.interne.autoCorrection ?? []).map((a) => a?.formatInteractif ?? null)

    /** Remplit l'élément k ; renvoie la façon, ou null si on ne sait pas le remplir */
    function remplir(ex, k, juste) {
      const a = ex.interne.autoCorrection[k] ?? {}
      const v = a.valeur ?? {}
      const f = a.formatInteractif
      const saisis = []
      const val = (x) => (juste ? x : fausse(x))
      const cles = Object.keys(v)
      const cellules = cles.filter((c) => /^L\d+C\d+$/.test(c))
      const trous = cles.filter((c) => /^champ\d+$/.test(c))
      const surFigure = cles.filter((c) => /^field\d+$/.test(c))
      if (a.propositions?.length && (f === 'qcm' || f === 'mathalea-qcm' || f === 'cliqueFigure' || f === 'clique-figure')) {
        const statuts = a.propositions.map((p) => !!p.statut)
        const choix = juste ? statuts : (() => { const k0 = statuts.findIndex((s) => !s); return statuts.map((_, j) => j === k0) })()
        if (!juste && !choix.some(Boolean)) return { comment: 'aucune proposition fausse', saisis }
        if (f === 'cliqueFigure' || f === 'clique-figure') {
          choix.forEach((c, j) => { if (c) { const el = champ(`cliquefigure${j}Ex${N}Q${k}`); if (el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); saisis.push(`figure ${j}`) } } })
          return { comment: 'figures touchées', saisis }
        }
        choix.forEach((c, j) => {
          const el = champ(`checkEx${N}Q${k}R${j}`)
          if (!el) return
          if (el.checked !== c) { el.checked = c; el.dispatchEvent(new Event('change', { bubbles: true })) }
          if (c) saisis.push(`case ${j}`)
        })
        return { comment: saisis.length ? 'cases cochées' : 'cases introuvables', saisis }
      }
      if (cellules.length) {
        for (const c of cellules) {
          // Case MathLive, ou liste déroulante d'un tableau hybride
          const el = champ(`champTexteEx${N}Q${k}${c}`) ?? z.querySelector(`liste-deroulante#tableau-hybrideEx${N}Q${k}${c}`)
          let x = saisie(v[c], juste)
          if (el?.tagName === 'LISTE-DEROULANTE') {
            let options = []
            try { options = JSON.parse(decodeURIComponent(el.getAttribute('choices') ?? '[]')).map((o) => String(typeof o === 'object' ? o.value ?? o.label : o)) } catch { /* rien */ }
            x = juste ? brut(v[c]?.value) : options.find((o) => o && o !== brut(v[c]?.value))
          }
          if (el && x != null) { el.value = x; saisis.push(`${c}=${x}`) } else saisis.push(`${c} introuvable`)
        }
        return { comment: 'cases du tableau', saisis }
      }
      const multiPrecoce = champ(`multi-mathfieldEx${N}Q${k}`)
      if (multiPrecoce && (surFigure.length || trous.length || cles.some((c) => /^champ\d+$/.test(c)))) {
        const cs = cles.filter((c) => /^(champ|field)\d+$/.test(c))
        const vals = Object.fromEntries(cs.map((c) => [c, saisie(v[c], juste)]))
        multiPrecoce.value = JSON.stringify(vals)
        saisis.push(JSON.stringify(vals))
        return { comment: 'multi-mathfield', saisis }
      }
      if (surFigure.length) {
        for (const c of surFigure) {
          const el = champ(`MetaInteractif2dEx${N}Q${k}${c}`)
          const liste = champ(`liste-deroulanteEx${N}Q${k}${c}`)
          const x = saisie(v[c], juste)
          if (el?.setPromptValue && x != null) { el.setPromptValue('champ1', x, {}); saisis.push(`${c}=${x}`) } else if (liste) {
            // Liste déroulante posée sur la figure : bonne option, ou une autre
            let options = []
            try { options = JSON.parse(decodeURIComponent(liste.getAttribute('choices') ?? '[]')).map((o) => String(typeof o === 'object' ? o.value ?? o.label : o)) } catch { /* rien */ }
            const attendu = brut(v[c]?.value)
            const choix = juste ? attendu : options.find((o) => o && o !== attendu)
            if (choix != null) { liste.value = choix; saisis.push(`${c}=${choix}`) }
          } else saisis.push(`${c} introuvable`)
        }
        return { comment: 'champs sur la figure', saisis }
      }
      if (trous.length) {
        const multi = champ(`multi-mathfieldEx${N}Q${k}`)
        const vals = Object.fromEntries(trous.map((c) => [c, saisie(v[c], juste)]))
        if (multi) { multi.value = JSON.stringify(vals); saisis.push(JSON.stringify(vals)); return { comment: 'multi-mathfield', saisis } }
        const el = champ(`champTexteEx${N}Q${k}`)
        if (!el?.setPromptValue) return { comment: 'trous introuvables', saisis }
        for (const [c, x] of Object.entries(vals)) { if (x != null) { el.setPromptValue(c, x, {}); saisis.push(`${c}=${x}`) } }
        return { comment: 'trous', saisis }
      }
      const rep = brut(v.reponse?.value)
      if (rep != null) {
        const el = champ(`champTexteEx${N}Q${k}`)
        let x = saisie(v.reponse, juste)
        if (el && 'value' in el) { el.value = x; saisis.push(x); return { comment: 'champ', saisis } }
        // Élément de MathALÉA dont la valeur est la réponse (liste déroulante…)
        const perso = [...z.querySelectorAll(`[id$="Ex${N}Q${k}"]`)].find((c) => c.tagName.includes('-') && c.tagName !== 'MATH-FIELD')
        if (perso && f === 'liste-deroulante') {
          let options = []
          try { options = JSON.parse(decodeURIComponent(perso.getAttribute('choices') ?? '[]')).map((o) => String(typeof o === 'object' ? o.value ?? o.label : o)) } catch { /* rien */ }
          const x = juste ? rep : options.find((o) => o && o !== rep)
          if (x == null) return { comment: 'aucune autre option', saisis }
          perso.value = x
          saisis.push(x)
          return { comment: 'liste', saisis }
        }
        if (perso) {
          // Valeur de l'élément = réponse (objet en JSON : chaque case faussée)
          let x = rep
          if (f === 'interactive-clock') {
            // « 7 h 10 min » : l'horloge prend { hour, minute }
            const h = /(\d+)\s*h\s*(\d+)?/.exec(rep)
            if (!h) return { comment: `horloge, réponse illisible ${rep}`, saisis }
            const o = { hour: Number(h[1]), minute: Number(h[2] ?? 0) + (juste ? 0 : 1), second: 0 }
            perso.value = o
            saisis.push(JSON.stringify(o))
            return { comment: 'horloge', saisis }
          }
          if (!juste) {
            try {
              const o = JSON.parse(rep)
              if (Array.isArray(o) && o.length && o.every((p) => p && typeof p === 'object' && 'etat' in p)) {
                // Points à cliquer : chaque état inversé
                x = JSON.stringify(o.map((p) => ({ ...p, etat: !p.etat })))
              } else if (Array.isArray(o) && o.length > 1 && o.every((p) => p && typeof p === 'object' && 'droite' in p)) {
                // Étiquettes à relier : chaque gauche reliée à la droite suivante
                x = JSON.stringify(o.map((p, j) => ({ ...p, droite: o[(j + 1) % o.length].droite })))
              } else if (o && typeof o === 'object' && !Array.isArray(o)) {
                const inverse = { haut: 'bas', bas: 'haut', '+': '-', '-': '+' }
                x = JSON.stringify(Object.fromEntries(Object.entries(o).map(([c, w]) => [c, inverse[w] ?? fausse(w)])))
              } else x = fausse(rep)
            } catch { x = fausse(rep) }
          }
          perso.value = x
          saisis.push(String(x).slice(0, 120))
          return { comment: `élément ${perso.tagName.toLowerCase()}`, saisis }
        }
        return { comment: `élément introuvable (${f})`, saisis }
      }
      return null
    }

    const res = { etapes: [] }
    let ex
    try { ex = await delai(preparer(), 40000, 'préparation') } catch (err) { return { erreur: 'préparation : ' + String(err).slice(0, 300) } }
    res.graine = ex.graine
    res.nbQuestions = ex.questions.length
    res.formats = formats(ex)
    res.elements = []
    for (const passage of ['juste', 'fausse']) {
      if (passage === 'fausse') {
        try { ex = await delai(preparer(), 40000, 'préparation 2') } catch (err) { res.erreur2 = String(err).slice(0, 200); break }
      }
      try { await afficherTout(ex) } catch (err) { res.erreurAffichage = String(err).slice(0, 200); break }
      const nb = (ex.interne.autoCorrection ?? []).length
      for (let k = 0; k < nb; k++) {
        if (ex.interne.autoCorrection[k] == null) continue
        const el = (res.elements[k] ??= { k, format: res.formats[k] })
        let r
        try { r = remplir(ex, k, passage === 'juste') } catch (err) { r = { comment: 'erreur au remplissage : ' + String(err).slice(0, 150), saisis: [] } }
        el[passage] = { comment: r?.comment ?? 'non rempli (format non géré)', saisis: (r?.saisis ?? []).join(' | ').slice(0, 300) }
        if (!r) continue
      }
      await attendre(120)
      for (const el of res.elements) {
        if (!el?.[passage] || el[passage].comment.startsWith('non rempli')) continue
        try {
          const v = M.verifier(ex, el.k)
          el[passage].accepte = v.juste
          el[passage].points = `${v.points}/${v.total}`
        } catch (err) { el[passage].erreurVerif = String(err).slice(0, 200) }
      }
      if (passage === 'juste') {
        // Valeurs attendues lisibles (pour le rapport)
        for (const el of res.elements) {
          if (!el) continue
          const a = ex.interne.autoCorrection[el.k] ?? {}
          el.attendu = JSON.stringify(a.valeur ?? a.propositions?.map((p) => [p.statut, String(p.texte ?? '').slice(0, 40)]) ?? null, (c, x) => (typeof x === 'function' ? 'fn' : x))?.slice(0, 300)
        }
      }
    }
    res.elements = res.elements.filter(Boolean)
    z.innerHTML = ''
    return res
  }, [e.uuid, GRAINE, N])
}

const page0 = await nouvellePage('FR')
let liste = []
for (const pays of process.env.PAYS ? [process.env.PAYS] : ['FR', 'CH']) {
  const l = await page0.evaluate(async (pays) => (await M.listerExercices(pays)).filter((e) => e.interactif).map((e) => ({ uuid: e.uuid, id: e.id, titre: e.titre, niveau: e.niveau })), pays)
  for (const e of l) if (!liste.some((x) => x.uuid === e.uuid)) liste.push({ ...e, pays })
}
await page0.context().close()
if (process.env.UUIDS) liste = liste.filter((e) => process.env.UUIDS.split(',').includes(e.uuid))
liste = liste.slice(Number(process.env.DEBUT ?? 0), Number(process.env.FIN ?? 1e9))
console.log(liste.length, 'exercices')
if (!process.env.AJOUTER) writeFileSync(sortie, '')

let suivant = 0
let faits = 0
await Promise.all(Array.from({ length: Number(process.env.PARALLELE ?? 4) }, async () => {
  let page = null, pays = null, n = 0
  while (suivant < liste.length) {
    const e = liste[suivant++]
    if (!page || pays !== e.pays || n >= 40) { await page?.context().close(); page = await nouvellePage(e.pays); pays = e.pays; n = 0 }
    page.journal.length = 0
    let r
    try { r = await Promise.race([auditer(page, e), new Promise((_, ko) => setTimeout(() => ko(new Error('bloqué')), 120000))]) } catch (err) {
      r = { erreur: 'harnais : ' + String(err).slice(0, 150) }
      await page.context().close().catch(() => {}); page = null
    }
    appendFileSync(sortie, JSON.stringify({ ...e, ...r, journal: page ? [...new Set(page.journal)].slice(0, 5) : [] }) + '\n')
    n++
    if (++faits % 100 === 0) console.log(faits)
  }
  await page?.context().close()
}))
await nav.close()
console.log('fini', faits)
