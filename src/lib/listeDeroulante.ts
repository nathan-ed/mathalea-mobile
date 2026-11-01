// Liste déroulante de MathALÉA (<liste-deroulante>) : ouverte, sa liste est en
// position fixed et descend jusqu'au bas de l'écran (ListeDeroulante._replace,
// recalculé à chaque défilement). Dans l'app, la barre du bas la recouvre : ses
// derniers choix restaient derrière « Passer », impossibles à toucher même en
// faisant défiler la liste (1mG1-3, novembre 2026). On l'arrête au-dessus de la
// barre, ou on l'ouvre vers le haut quand la place manque en dessous.

const MARGE = 8

/** Bas utilisable de l'écran : haut de la barre du bas fixe, s'il y en a une */
function basUtile(): number {
  let bas = innerHeight
  for (const f of document.querySelectorAll('footer')) {
    if (getComputedStyle(f).position !== 'fixed') continue
    const r = f.getBoundingClientRect()
    if (r.height > 0 && r.top < bas) bas = r.top
  }
  return bas
}

/** Haut utilisable : bas de la barre de titre */
function hautUtile(): number {
  const h = document.querySelector('header')
  return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0
}

function borner(ul: HTMLElement) {
  if (!ul.classList.contains('visible') || getComputedStyle(ul).position !== 'fixed') return
  const champ = ul.parentElement
  if (!champ) return
  const r = champ.getBoundingClientRect()
  const dessous = basUtile() - r.bottom - MARGE
  const dessus = r.top - hautUtile() - MARGE
  const hauteur = ul.scrollHeight
  let top: number
  let max: number
  if (dessous >= Math.min(hauteur, 160) || dessous >= dessus) {
    top = r.bottom
    max = Math.max(dessous, 0)
  } else {
    max = Math.min(hauteur, dessus)
    top = r.top - max
  }
  // Écrire seulement ce qui change : l'observateur est rappelé par nos écritures
  const t = `${Math.round(top)}px`
  const m = `${Math.round(max)}px`
  if (ul.style.top !== t) ul.style.top = t
  if (ul.style.maxHeight !== m) ul.style.maxHeight = m
}

/** Surveille les listes déroulantes de la zone ; renvoie de quoi arrêter */
export function bornerListes(zone: HTMLElement): () => void {
  const suivies = new WeakSet<Node>()
  const surListe = new MutationObserver((ms) => {
    for (const m of ms) if (m.target instanceof HTMLElement && m.target.tagName === 'UL') borner(m.target)
  })
  const chercher = () => {
    for (const hote of zone.querySelectorAll('liste-deroulante')) {
      const racine = hote.shadowRoot ?? hote
      if (suivies.has(racine)) continue
      suivies.add(racine)
      surListe.observe(racine, { subtree: true, attributes: true, attributeFilter: ['style', 'class'] })
    }
  }
  chercher()
  const surZone = new MutationObserver(chercher)
  surZone.observe(zone, { childList: true, subtree: true })
  return () => {
    surListe.disconnect()
    surZone.disconnect()
  }
}
