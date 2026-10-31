// Critère commun : la réponse mise en évidence dans la correction est verte
// si et seulement si MathALÉA juge la question correcte (tous ses smileys 😎),
// orange sinon. Renvoie les écarts.
export function incoherencesVert(page) {
  return page.evaluate(() => {
    const ORANGE = 'rgb(241, 89, 41)'
    const VERTS = ['rgb(77, 134, 19)']
    const ecarts = []
    for (const zone of document.querySelectorAll('main .question-eleve')) {
      const smileys = [...zone.querySelectorAll('[id^="resultatCheck"]')].map((s) => s.textContent.trim()).filter(Boolean)
      if (!smileys.length) continue
      const juste = smileys.every((s) => s.includes('😎'))
      // Correction de la question : le bloc qui suit sa zone
      const bloc = zone.closest('.container')?.nextElementSibling
      const misEnEvidence = bloc ? [...bloc.querySelectorAll('.mathbf, [style*="color"]')].filter((x) => x.closest('.correction-juste') || x.style.color) : []
      const couleurs = new Set(misEnEvidence.map((x) => getComputedStyle(x).color).filter((c) => c === ORANGE || VERTS.includes(c)))
      if (!couleurs.size) continue
      const vert = [...couleurs].every((c) => VERTS.includes(c))
      if (juste !== vert) ecarts.push(`${zone.querySelector('[id]')?.id ?? 'question'} : ${smileys.join('')} mais réponse ${vert ? 'en vert' : 'en orange'}`)
    }
    return ecarts
  })
}
