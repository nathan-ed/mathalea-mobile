/**
 * Formules sécables dans une correction.
 *
 * MathALÉA entoure chaque formule d'accolades avant KaTeX (`preProcess` de
 * `renderKatex.ts`) : la formule devient un seul groupe, jamais coupé en fin
 * de ligne. Sur un téléphone, une correction comme
 * (−2)⁸ = (−2)·(−2)·…·(−2) = 256 sortait du cadre (qui défile, mais rien ne
 * l'indique ; Nathan, 17 novembre 2026). Le code de MathALÉA n'est jamais
 * modifié : après le rendu, chaque formule est découpée en morceaux insécables
 * qui se terminent après un signe de relation (=, <…) ou d'opération (+, ·…)
 * du premier niveau. Le navigateur passe à la ligne entre deux morceaux, et
 * seulement si la formule ne tient pas : rien ne change ailleurs.
 */
export function formulesSecables(racine: HTMLElement) {
  for (const base of racine.querySelectorAll<HTMLElement>('.katex-html > .katex-base')) {
    if (base.classList.contains('katex-secable')) continue
    // Sous la base : la jambe de force (hauteur de la ligne), puis le groupe des accolades
    const contenu = [...base.children].filter((e) => !e.classList.contains('katex-strut'))
    const groupe = contenu.length === 1 && contenu[0].classList.contains('mord') && contenu[0].children.length > 1 ? (contenu[0] as HTMLElement) : base
    const enfants = [...groupe.children].filter((e) => !e.classList.contains('katex-strut'))
    const morceaux: Element[][] = [[]]
    for (let i = 0; i < enfants.length; i++) {
      const e = enfants[i]
      morceaux.at(-1)!.push(e)
      if (!e.classList.contains('mrel') && !e.classList.contains('mbin')) continue
      // L'espace qui suit le signe reste avec lui : la ligne finit sur le signe
      if (enfants[i + 1]?.classList.contains('mspace')) morceaux.at(-1)!.push(enfants[++i])
      if (i < enfants.length - 1) morceaux.push([])
    }
    if (morceaux.length < 2) continue
    for (const m of morceaux) {
      const span = document.createElement('span')
      span.className = 'katex-morceau'
      m[0].before(span)
      span.append(...m)
    }
    base.classList.add('katex-secable')
    if (groupe !== base) groupe.classList.add('katex-secable')
  }
}
