// Impression d'un parcours : le moteur MathALÉA écrit la fiche en Typst
// (sourceTypst, même mise en page que le site), le compilateur Typst de l'app
// (src-tauri/src/impression.rs) en fait un PDF, hors ligne.
import { flushSync, mount, unmount } from 'svelte'
import type { Etape, Fiche, Parcours } from './catalogue'
import type { BlocCoursImprime, CoursImprime, Moteur } from './moteur'
import { dansTauri } from './stockage'
import { texteRiche, type RenduFormule } from './texteRiche'
import GraphiqueCours from './ui/GraphiqueCours.svelte'

export interface ChoixImpression {
  etapes: number[] // rangs des exercices, dans l'ordre du parcours
  cours: boolean // fiches de cours avant les exercices
  corrections: boolean // corrections en fin de document
  versions: number // sujets différents (mêmes exercices, autres valeurs)
}

/** Compilation possible : dans l'app (compilateur embarqué), ou fournie par les tests (`__compilerPdf`) */
export const impressionPossible = () => dansTauri || typeof window.__compilerPdf === 'function'

declare global {
  interface Window {
    /** Suites e2e : compilation par le Typst de l'ordinateur (même version que celui de l'app) */
    __compilerPdf?: (source: string, fichiers: Record<string, string>) => Promise<string>
  }
}

/** Fiches de cours du parcours, dans l'ordre : générale, puis celles des paliers */
export function fichesDe(p: Parcours, etapes?: number[]): Fiche[] {
  const fiches: Fiche[] = p.fiche ? [p.fiche] : []
  let debut = 0
  for (const palier of p.paliers ?? []) {
    const rangs = Array.from({ length: palier.nb }, (_, k) => debut + k)
    debut += palier.nb
    if (palier.fiche && (!etapes || rangs.some((r) => etapes.includes(r)))) fiches.push(palier.fiche)
  }
  return fiches
}

// Formules gardées en LaTeX entre $ : le moteur les convertit en Typst
const formuleLatex: RenduFormule = (latex, centree) => (centree ? `<br>$\\displaystyle ${latex}$<br>` : `$${latex}$`)
const html = (t: string) => texteRiche(t, formuleLatex)
const titre = (t: string) => t.replace(/</g, '&lt;')

/** Couleurs du thème clair : une feuille imprimée ne suit pas le thème sombre */
const COULEURS_CLAIRES: Record<string, string> = {
  fond: 'canvas',
  presse: 'canvas-darkest',
  action: 'action',
  struct: 'struct',
  discret: 'corpus-lightest',
  vert: 'warn',
  gris: 'corpus-light',
}

/** Graphique tracé par l'app, en SVG autonome (couleurs résolues, étiquettes en texte) */
function graphiqueSvg(bloc: Extract<Fiche['blocs'][number], { type: 'graphique' }>): string {
  const hote = document.createElement('div')
  hote.style.cssText = 'position: fixed; left: -10000px; top: 0; width: 600px'
  document.body.appendChild(hote)
  const composant = mount(GraphiqueCours, { target: hote, props: { graphique: bloc, formule: (l: string) => l } })
  flushSync()
  try {
    const svg = hote.querySelector('svg')
    if (!svg) return ''
    const copie = svg.cloneNode(true) as SVGSVGElement
    const [, , L, H] = (svg.getAttribute('viewBox') ?? '0 0 600 400').split(/\s+/).map(Number)
    copie.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    copie.setAttribute('width', String(L))
    copie.setAttribute('height', String(H))
    copie.removeAttribute('class')
    // Étiquettes (points, textes) posées en HTML par-dessus : reprises en texte SVG
    const boite = svg.getBoundingClientRect()
    for (const e of hote.querySelectorAll<HTMLElement>('.etiquette-graphique')) {
      const r = e.getBoundingClientRect()
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      t.setAttribute('x', String(((r.left + r.width / 2 - boite.left) * L) / boite.width))
      t.setAttribute('y', String(((r.top + r.height * 0.75 - boite.top) * H) / boite.height))
      t.setAttribute('text-anchor', 'middle')
      t.setAttribute('font-size', '12')
      t.setAttribute('fill', e.style.color || 'var(--app-discret)')
      t.textContent = (e.textContent ?? '').trim()
      copie.appendChild(t)
    }
    const racine = getComputedStyle(document.documentElement)
    return new XMLSerializer()
      .serializeToString(copie)
      .replace(/var\(--app-([a-z]+)\)/g, (m, nom: string) => racine.getPropertyValue(`--color-coopmaths-${COULEURS_CLAIRES[nom] ?? 'corpus'}`).trim() || '#333')
  } finally {
    void unmount(composant)
    hote.remove()
  }
}

/** Octets d'une image `data:` (base64 ou texte) */
function octetsData(src: string): { octets: Uint8Array; extension: string } | null {
  const m = /^data:image\/(png|jpeg|svg\+xml)(;base64)?,(.*)$/s.exec(src)
  if (!m) return null
  const extension = m[1] === 'svg+xml' ? 'svg' : m[1] === 'jpeg' ? 'jpg' : 'png'
  const octets = m[2] ? Uint8Array.from(atob(m[3]), (c) => c.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(m[3]))
  return { octets, extension }
}

/** Fiche de cours pour l'impression ; images et graphiques en fichiers à part */
export function coursImprime(fiche: Fiche, fichiers: Record<string, Uint8Array>): CoursImprime {
  const blocs: BlocCoursImprime[] = []
  const fichier = (octets: Uint8Array, extension: string) => {
    const nom = `cours/image-${Object.keys(fichiers).length + 1}.${extension}`
    fichiers[nom] = octets
    return nom
  }
  for (const b of fiche.blocs) {
    if (b.type === 'texte') blocs.push({ type: 'texte', html: html(b.texte) })
    else if (b.type === 'retenir') blocs.push({ type: 'encadre', titre: titre(b.titre ?? 'À retenir'), html: html(b.texte) })
    else if (b.type === 'exemple') blocs.push({ type: 'exemple', titre: titre(b.titre ?? 'Exemple'), html: html(b.enonce), etapes: b.etapes.map(html) })
    else if (b.type === 'question') {
      // Réponses proposées « a) … b) … », sur une ligne chacune
      const choix = b.choix ? `<p>${b.choix.map((c, k) => `${'abcdefgh'[k]}) ${html(c).replace(/^<p>|<\/p>$/g, '')}`).join('<br>')}</p>` : ''
      blocs.push({ type: 'encadre', titre: 'À toi', html: html(b.enonce) + choix })
    } else if (b.type === 'graphique') {
      const svg = graphiqueSvg(b)
      if (svg) blocs.push({ type: 'image', fichier: fichier(new TextEncoder().encode(svg), 'svg'), legende: b.legende ? html(b.legende) : undefined })
    } else if (b.type === 'image') {
      const image = octetsData(b.src)
      if (image) blocs.push({ type: 'image', fichier: fichier(image.octets, image.extension), legende: b.legende ? html(b.legende) : undefined })
    } else if (b.type === 'lien') {
      blocs.push({ type: 'texte', html: `<p><strong>${titre(b.titre)}</strong> : ${titre(b.lien)}</p>` })
    }
  }
  return { titre: fiche.titre, blocs }
}

const enBase64 = (o: Uint8Array) => {
  let s = ''
  for (let i = 0; i < o.length; i += 0x8000) s += String.fromCharCode(...o.subarray(i, i + 0x8000))
  return btoa(s)
}

/** Paramètres d'un exercice pour le moteur (sans graine : nouvelles valeurs) */
const params = (e: Etape) => ({ uuid: e.uuid, id: e.id, nbQuestions: e.nbQuestions, sup: e.sup, sup2: e.sup2, sup3: e.sup3, sup4: e.sup4 })

/** PDF du parcours, en base64 */
export async function pdfDuParcours(moteur: Moteur, p: Parcours, choix: ChoixImpression): Promise<string> {
  if (!moteur.sourceTypst) throw new Error('Le moteur de cette version ne sait pas préparer une impression.')
  const fichiers: Record<string, Uint8Array> = {}
  const cours = choix.cours ? fichesDe(p, choix.etapes).map((f) => coursImprime(f, fichiers)) : []
  const source = await moteur.sourceTypst(
    choix.etapes.map((i) => params(p.etapes[i])),
    { titre: p.titre, sousTitre: p.niveau, versions: choix.versions, corrections: choix.corrections, cours },
  )
  if (typeof window.__compilerPdf === 'function') {
    return window.__compilerPdf(source, Object.fromEntries(Object.entries(fichiers).map(([k, v]) => [k, enBase64(v)])))
  }
  const { invoke } = await import('@tauri-apps/api/core')
  const pdf = await invoke<ArrayBuffer>('compiler_pdf', { source, fichiers: Object.fromEntries(Object.entries(fichiers).map(([k, v]) => [k, Array.from(v)])) })
  return enBase64(new Uint8Array(pdf))
}

/** Nom du fichier : titre du parcours sans caractères gênants */
export const nomPdf = (p: Parcours) =>
  `${(p.titre || 'parcours')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()}.pdf`
