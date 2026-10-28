// Sonde de la revue des exercices, chargée dans le serveur de dev de MathALÉA
// (copiée à la racine sous revue-sonde.ts par revue/banc.mjs). Elle passe par
// l'API du moteur de l'app (src/moteur/index.ts) : mêmes exercices, même
// rendu, même vérification que dans l'app.
import * as m from './src/moteur/index'
import {
  grandeurStringToLatex,
  toCompareInput,
} from './tests/integration/helpers/verifier-shared'

type Params = Record<string, string | number | boolean | undefined>
type Ex = Awaited<ReturnType<typeof m.preparerExercice>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AC = any

let ex: Ex | null = null
const zone = () => document.getElementById('zone') as HTMLElement
const ORANGE = /\\color\{#?f15929\}\s*(?:\\(?:normalsize|scriptsize|small|large)\s*\{?\s*)?\\boldsymbol\{/gi

const texte = (v: unknown) => (Array.isArray(v) ? String(v[0]) : String(v))

/** Contenus des miseEnEvidence() d'une chaîne LaTeX/HTML, accolades équilibrées */
export function evidences(s: string): string[] {
  const sortie: string[] = []
  for (const r of s.matchAll(ORANGE)) {
    let i = (r.index ?? 0) + r[0].length
    let prof = 1
    const debut = i
    while (i < s.length && prof > 0) {
      if (s[i] === '\\') {
        i += 2
        continue
      }
      if (s[i] === '{') prof++
      else if (s[i] === '}') prof--
      i++
    }
    sortie.push(s.slice(debut, i - 1).replace(/\\textbf\{/g, '\\text{'))
  }
  return sortie
}

/** Textes en orange et gras hors maths (texteEnCouleurEtGras) */
export function evidencesTexte(s: string): string[] {
  return [
    ...s.matchAll(
      /<span style="color:\s*#f15929;\s*font-weight:\s*bold;?">([\s\S]*?)<\/span>/gi,
    ),
  ].map((r) => r[1])
}

export async function init() {
  await m.initialiser()
  const fr = await m.listerExercices('FR')
  const ch = await m.listerExercices('CH')
  const vus = new Set<string>()
  const liste: (m.ExerciceDuReferentiel & { pays: string })[] = []
  for (const [pays, l] of [
    ['FR', fr],
    ['CH', ch],
  ] as const) {
    for (const e of l) {
      if (vus.has(e.uuid)) continue
      vus.add(e.uuid)
      liste.push({ ...e, pays })
    }
  }
  return liste.map((e) => ({
    uuid: e.uuid,
    id: e.id,
    titre: e.titre,
    niveau: e.niveau,
    theme: e.theme,
    pays: e.pays,
    interactif: e.interactif,
    chemin: (e.chemin ?? []).map((n) => n.code).join(' › '),
  }))
}

export const decrire = (uuid: string) => m.decrireExercice(uuid)

export function langue(pays: string) {
  m.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
}

function format(ac: AC, exo: AC): string {
  if (ac == null) return 'aucun'
  return (
    ac.formatInteractif ??
    ac.reponse?.param?.formatInteractif ??
    (ac.propositions ? 'qcm' : (exo.formatInteractif ?? 'mathlive'))
  )
}

export async function preparer(params: Params, numero: number) {
  ex = await m.preparerExercice(params as never, numero)
  const exo = ex.interne as AC
  return {
    titre: ex.titre,
    graine: ex.graine,
    consigne: String(exo.consigne ?? ''),
    introduction: String(exo.introduction ?? ''),
    questions: ex.questions.map((q, i) => ({
      enonce: q.enonce,
      correction: q.correction,
      interactive: q.interactive,
      format: format(exo.autoCorrection?.[i], exo),
    })),
  }
}

/** Contrôles de rendu dans la page : erreurs KaTeX, débordements, $ restants */
function controlesRendu(racine: HTMLElement) {
  const largeur = racine.clientWidth
  const problemes: { regle: string; extrait: string; q: number }[] = []
  racine.querySelectorAll<HTMLElement>('[data-q]').forEach((bloc) => {
    const q = Number(bloc.dataset.q)
    bloc.querySelectorAll('.katex-error').forEach((e) =>
      problemes.push({
        regle: 'X2',
        q,
        extrait: `Erreur KaTeX : ${(e.getAttribute('title') ?? e.textContent ?? '').slice(0, 200)}`,
      }),
    )
    // $ restés dans le texte rendu : formule non fermée ou mal écrite
    const brut = (bloc.innerText ?? '').replace(/\s+/g, ' ')
    if (/\$/.test(brut))
      problemes.push({
        regle: 'X2',
        q,
        extrait: `« $ » visible : ${brut.slice(Math.max(0, brut.indexOf('$') - 60), brut.indexOf('$') + 60)}`,
      })
    for (const el of bloc.querySelectorAll<HTMLElement>(
      'table, .katex-display, svg.mathalea2d, img, .svgContainer',
    )) {
      const w = el.getBoundingClientRect().width
      if (w > largeur + 2)
        problemes.push({
          regle: 'X5',
          q,
          extrait: `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} de ${Math.round(w)} px pour ${largeur} px`,
        })
    }
  })
  if (racine.scrollWidth > largeur + 2)
    problemes.push({
      regle: 'X5',
      q: -1,
      extrait: `page de ${racine.scrollWidth} px pour ${largeur} px`,
    })
  return problemes
}

export async function rendre(quoi: 'enonce' | 'correction') {
  if (!ex) throw new Error('aucun exercice préparé')
  const z = zone()
  const contexte = ex.questions[0]?.contexte ?? ''
  z.innerHTML =
    (quoi === 'enonce' && contexte ? `<div data-q="-1">${contexte}</div>` : '') +
    ex.questions
      .map(
        (q, i) =>
          `<div class="question" data-q="${i}"><b>${i + 1}.</b> ${quoi === 'enonce' ? q.enonce : q.correction}</div>`,
      )
      .join('')
  await m.afficher(z)
  // MathLive et les figures finissent leur rendu après coup
  await new Promise((r) => setTimeout(r, 150))
  return controlesRendu(z)
}

// --- Saisie des réponses dans les vrais éléments de la page ---

type Saisie = 'vide' | 'correcte' | 'incorrecte' | 'evidence'

const nombre = (s: string) => {
  const t = s
    .replace(/\{,\}/g, '.')
    .replace(/\\[,;!: ]|~/g, '')
    .replace(/,/g, '.')
    .trim()
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null
}

/** Une réponse fausse à partir de la bonne */
function fausse(v: string): string {
  const n = nombre(v)
  if (n != null) {
    // Loin de la bonne réponse : n+1 peut être juste aussi (« un nombre entre… »)
    const loin = n === 0 ? 7 : Math.abs(n) < 1 ? n + 13 : n * 10 + 7
    return String(Math.round(loin * 1e6) / 1e6).replace('.', '{,}')
  }
  return v === '' ? '7' : `${v}+1`
}

/** Valeur LaTeX que le champ doit recevoir pour une bonne réponse */
function bonne(r: AC): string {
  const raw = texte(r?.value)
  const opts = r?.options ?? {}
  const v = opts.unite ? grandeurStringToLatex(raw) : toCompareInput(raw, opts)
  return clavier(v)
}

/** Forme que produit le clavier MathLive : \sqrt3 → \sqrt{3}, \frac12 → \frac{1}{2}.
 * Une attente écrite sans accolades et comparée en texte refuse la saisie réelle. */
function clavier(v: string): string {
  return v
    .replace(/\\(d?frac)(\d)(\d)/g, '\\$1{$2}{$3}')
    .replace(/\\(d?frac)(\{[^{}]*\})(\d)/g, '\\$1$2{$3}')
    .replace(/\\sqrt(\d|[a-z](?![a-z]))/g, '\\sqrt{$1}')
}

/** Nettoie une valeur mise en évidence pour la saisir dans un champ */
function depuisEvidence(s: string): string {
  return s
    .replace(/\\boldsymbol\{([^{}]*)\}/g, '$1')
    .replace(/\\mathbf\{([^{}]*)\}/g, '$1')
    .trim()
}

function mf(id: string): AC {
  return document.getElementById(id) as AC
}

interface Remplissage {
  q: number
  format: string
  possible: boolean
  valeurs: Record<string, string>
  raison?: string
}

function remplir(i: number, saisie: Saisie, corr: string): Remplissage {
  const exo = ex!.interne as AC
  const n = ex!.numero
  const ac = exo.autoCorrection?.[i]
  const f = (
    {
      'mathalea-mathfield': 'mathlive',
      texte: 'mathlive',
      'mathalea-textfield': 'mathlive',
      'fill-in-the-blank': 'fillInTheBlank',
      'tableau-mathlive': 'tableauMathlive',
      'mathalea-qcm': 'qcm',
      listeDeroulante: 'liste-deroulante',
    } as Record<string, string>
  )[format(ac, exo)] ?? format(ac, exo)
  const valeur = ac?.reponse?.valeur ?? ac?.valeur
  const ev = evidences(corr).map(depuisEvidence)
  const res: Remplissage = { q: i, format: f, possible: true, valeurs: {} }
  const non = (raison: string) => ({ ...res, possible: false, raison })
  try {
    switch (f) {
      case 'mathlive': {
        if (typeof valeur?.callback === 'function')
          return non('réponse par fonction (callback)')
        const r = valeur?.reponse
        if (r?.value == null) return non('aucune valeur attendue')
        const el = mf(`champTexteEx${n}Q${i}`)
        if (!el) return non('champ absent de la page')
        let v = ''
        if (saisie === 'correcte') v = bonne(r)
        else if (saisie === 'incorrecte') v = fausse(bonne(r))
        else if (saisie === 'evidence') {
          if (ev.length === 0) return non('aucune mise en évidence')
          v = ev[ev.length - 1]
        }
        if (el.tagName === 'MATH-FIELD') el.value = v
        else el.value = v
        el.dispatchEvent(new Event('input', { bubbles: true }))
        res.valeurs.champ = v
        return res
      }
      case 'fillInTheBlank': {
        const el = mf(`champTexteEx${n}Q${i}`)
        if (!el) return non('champ absent de la page')
        const champs = Object.entries(valeur ?? {}).filter(
          ([k, a]) => k.startsWith('champ') && (a as AC)?.value != null,
        ) as [string, AC][]
        if (champs.length === 0) return non('aucune valeur attendue')
        if (saisie === 'evidence' && ev.length < champs.length)
          return non(
            `${ev.length} mise(s) en évidence pour ${champs.length} trou(s)`,
          )
        champs.forEach(([k, a], j) => {
          let v = ''
          if (saisie === 'correcte') v = bonne(a)
          else if (saisie === 'incorrecte') v = fausse(bonne(a))
          else if (saisie === 'evidence')
            v = ev[ev.length - champs.length + j]
          el.setPromptValue(k, v, {})
          res.valeurs[k] = v
        })
        return res
      }
      case 'multi-mathfield': {
        const hote = mf(`multi-mathfieldEx${n}Q${i}`) ?? mf(`multiMathfieldEx${n}Q${i}`)
        const champs = Object.entries(valeur ?? {}).filter(
          ([k, a]) =>
            k !== 'bareme' && k !== 'feedback' && (a as AC)?.value != null,
        ) as [string, AC][]
        if (!hote) return non('champ absent de la page')
        if (champs.length === 0) return non('aucune valeur attendue')
        if (saisie === 'evidence' && ev.length < champs.length)
          return non(
            `${ev.length} mise(s) en évidence pour ${champs.length} champ(s)`,
          )
        const valeurs: Record<string, string> = {}
        champs.forEach(([k, a], j) => {
          let v = ''
          if (saisie === 'correcte') v = bonne(a)
          else if (saisie === 'incorrecte') v = fausse(bonne(a))
          else if (saisie === 'evidence')
            v = ev[ev.length - champs.length + j]
          valeurs[k] = v
        })
        hote.value = valeurs
        res.valeurs = valeurs
        return res
      }
      case 'tableauMathlive': {
        const cellules = Object.entries(valeur ?? {}).filter(
          ([k, a]) => /^L\d+C\d+$/.test(k) && (a as AC)?.value != null,
        ) as [string, AC][]
        if (cellules.length === 0) return non('aucune valeur attendue')
        if (saisie === 'evidence') return non('tableau : évidence non comparée')
        for (const [k, a] of cellules) {
          const el = mf(`champTexteEx${n}Q${i}${k}`)
          if (!el) return non(`cellule ${k} absente`)
          const v =
            saisie === 'correcte'
              ? bonne(a)
              : saisie === 'incorrecte'
                ? fausse(bonne(a))
                : ''
          el.value = v
          res.valeurs[k] = v
        }
        return res
      }
      case 'qcm': {
        const props = (ac?.propositions ?? valeur?.qcm?.propositions ?? []) as AC[]
        if (props.length === 0) return non('aucune proposition')
        const fausses = props
          .map((p, j) => [p, j] as const)
          .filter(([p]) => !p.statut)
        props.forEach((p, j) => {
          const c = document.getElementById(
            `checkEx${n}Q${i}R${j}`,
          ) as HTMLInputElement | null
          if (!c) return
          let coche = false
          if (saisie === 'correcte') coche = !!p.statut
          else if (saisie === 'incorrecte')
            coche = fausses.length > 0 && fausses[0][1] === j
          c.checked = coche
          if (coche) res.valeurs[`R${j}`] = String(p.texte ?? '').slice(0, 80)
        })
        if (saisie === 'evidence') return non('QCM : comparé au texte')
        if (saisie === 'incorrecte' && fausses.length === 0)
          return non('aucune proposition fausse')
        return res
      }
      case 'liste-deroulante': {
        const el = mf(`ex${n}Q${i}`)
        const r = valeur?.reponse?.value
        if (!el || r == null) return non('liste absente ou sans valeur')
        if (saisie === 'evidence') return non('liste : évidence non comparée')
        const v =
          saisie === 'correcte' ? texte(r) : saisie === 'incorrecte' ? '__faux__' : ''
        el.value = v
        res.valeurs.liste = v
        return res
      }
      default:
        return non(`format ${f} : à tester à la main`)
    }
  } catch (e) {
    return non(`erreur de saisie : ${(e as Error).message}`)
  }
}

/** QCM : la proposition juste est-elle celle mise en évidence ? */
function qcmEvidence(i: number, corr: string) {
  const exo = ex!.interne as AC
  const ac = exo.autoCorrection?.[i]
  const props = (ac?.propositions ?? (ac?.valeur ?? ac?.reponse?.valeur)?.qcm?.propositions ?? []) as AC[]
  const norm = (s: string) =>
    s
      .replace(/<[^>]+>/g, '')
      .replace(/\\color\{[^}]*\}|\\boldsymbol|\\mathbf|\\textbf|\\text/g, '')
      .replace(/[\s${}~]|&nbsp;|\\,/g, '')
      .toLowerCase()
  const enEvidence = norm(
    [...evidences(corr), ...evidencesTexte(corr)].join(''),
  )
  const justes = props.filter((p) => p.statut).map((p) => norm(String(p.texte ?? '')))
  const fausses = props.filter((p) => !p.statut).map((p) => norm(String(p.texte ?? '')))
  return {
    enEvidence,
    justes,
    trouvee: justes.some((j) => j !== '' && enEvidence.includes(j)),
    fausseEnEvidence: fausses.filter((f) => f !== '' && f.length > 1 && enEvidence === f),
  }
}

/** Essai d'une seule question avec une valeur donnée (champ unique) */
export async function essai(i: number, v: string) {
  if (!ex) throw new Error('aucun exercice préparé')
  await rendre('enonce')
  const el = mf(`champTexteEx${ex.numero}Q${i}`)
  if (!el) return null
  el.value = v
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await new Promise((r) => setTimeout(r, 60))
  try {
    return m.verifier(ex, i).juste
  } catch {
    return null
  }
}

/** Toutes les mises en évidence d'une question, nettoyées */
export function evidencesDe(i: number) {
  return evidences(ex?.questions[i]?.correction ?? '').map(depuisEvidence)
}

export async function interactif(saisie: Saisie) {
  if (!ex) throw new Error('aucun exercice préparé')
  await rendre('enonce')
  const exo = ex.interne as AC
  const nbAC = exo.autoCorrection?.length ?? 0
  const remplis: Remplissage[] = []
  for (let i = 0; i < nbAC; i++) {
    if (exo.autoCorrection[i] == null) continue
    remplis.push(remplir(i, saisie, ex.questions[i]?.correction ?? ''))
  }
  await new Promise((r) => setTimeout(r, 60))
  const resultats = []
  for (const r of remplis) {
    if (!r.possible) {
      resultats.push({ ...r, verifie: false })
      continue
    }
    try {
      const v = m.verifier(ex, r.q)
      resultats.push({
        ...r,
        verifie: true,
        juste: v.juste,
        points: v.points,
        total: v.total,
        retour: String(v.retour ?? '').replace(/<[^>]+>/g, '').slice(0, 200),
      })
    } catch (e) {
      resultats.push({
        ...r,
        verifie: true,
        exception: String((e as Error).message ?? e).slice(0, 300),
      })
    }
  }
  const qcm =
    saisie === 'evidence'
      ? remplis
          .filter((r) => r.format === 'qcm' && r.possible !== false || /qcm/.test(r.format))
          .map((r) => ({ q: r.q, ...qcmEvidence(r.q, ex!.questions[r.q]?.correction ?? '') }))
      : []
  return { resultats, qcm }
}
