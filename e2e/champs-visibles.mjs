// Critère commun aux suites : chaque champ de réponse d'une question est
// entièrement visible, aucun bord coupé par un cadre qui défile ou masque
// (Nathan, 31 octobre 2026 : bas du champ coupé par overflow-x de
// .question-eleve). Seule la hauteur compte : un élément plus large que
// l'écran défile volontairement dans la question. Le bord d'un champ est
// dessiné au bord de sa boîte : collé au bord du cadre (moins de 2 px), il
// est déjà coupé à l'écran, d'où la marge exigée.

/** Champs coupés de la page : liste de « id : n px coupés » (vide si tout est visible) */
export function champsCoupes(page) {
  return page.evaluate(() => {
    const SELECTEUR = 'math-field, input:not([type=hidden]), select, liste-deroulante, multi-mathfield'
    const MARGE = 2
    const coupes = []
    for (const zone of document.querySelectorAll('main .question-eleve')) {
      for (const champ of zone.querySelectorAll(SELECTEUR)) {
        const r = champ.getBoundingClientRect()
        if (!r.height || getComputedStyle(champ).visibility === 'hidden') continue
        // Ancêtres qui coupent leur contenu, jusqu'à la question comprise
        for (let a = champ.parentElement; a; a = a.parentElement) {
          const s = getComputedStyle(a)
          if ([s.overflowX, s.overflowY].some((o) => o !== 'visible')) {
            const c = a.getBoundingClientRect()
            const haut = c.top + a.clientTop
            const bas = haut + a.clientHeight
            const perte = Math.max(0, haut + MARGE - r.top) + Math.max(0, r.bottom - (bas - MARGE))
            if (perte > 0.5) {
              coupes.push(`${champ.id || champ.tagName.toLowerCase()} : ${Math.round(perte)} px trop près du bord`)
              break
            }
          }
          if (a === zone) break
        }
      }
    }
    return coupes
  })
}
