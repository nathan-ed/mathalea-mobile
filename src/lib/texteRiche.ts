// Texte des fiches de cours en HTML : paragraphes, listes (lignes « - »,
// une ligne sans tiret continue l'élément précédent),
// **gras**, *italique*, formules entre $ (dans la ligne) et $$ (centrées).
// Tout le texte est échappé ; seules les formules passent par le rendu
// (KaTeX du moteur), qui ne produit pas de HTML actif.

export type RenduFormule = (latex: string, centree: boolean) => string

const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Sans moteur : la formule telle qu'écrite */
export const formuleBrute: RenduFormule = (latex, centree) => (centree ? `<span class="formule-centree">${echapper(latex)}</span>` : echapper(latex))

export function texteRiche(texte: string, formule: RenduFormule = formuleBrute): string {
  const formules: string[] = []
  const centrees = new Set<number>()
  // Formules mises de côté (elles peuvent contenir *, - ou des retours à la ligne)
  const sansFormules = texte.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, bloc: string | undefined, ligne: string | undefined) => {
    if (bloc !== undefined) centrees.add(formules.length)
    formules.push(bloc !== undefined ? `<span class="formule-centree">${formule(bloc.trim(), true)}</span>` : formule(ligne!, false))
    return `\u0000${formules.length - 1}\u0000`
  })
  const enLigne = (t: string) =>
    echapper(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\u0000(\d+)\u0000/g, (_, n) => formules[Number(n)])
  // Lignes d'un paragraphe : pas de saut de ligne autour d'une formule centrée (elle va déjà à la ligne)
  const centree = (l: string) => {
    const m = /^\u0000(\d+)\u0000$/.exec(l)
    return !!m && centrees.has(Number(m[1]))
  }
  const lignes = (ls: string[]) => ls.map((l, k) => (k > 0 && !centree(l) && !centree(ls[k - 1]) ? '<br>' : '') + enLigne(l)).join('')
  return sansFormules
    .split(/\n\s*\n/)
    .map((bloc) => bloc.trim())
    .filter(Boolean)
    .map((bloc) => {
      const ls = bloc.split('\n').map((l) => l.trim())
      // Liste : chaque « - » ouvre un élément, les lignes suivantes le continuent
      if (/^- /.test(ls[0])) {
        const elements: string[] = []
        for (const l of ls) {
          if (/^- /.test(l)) elements.push(l.slice(2))
          else elements[elements.length - 1] += `\n${l}`
        }
        return `<ul>${elements.map((e) => `<li>${lignes(e.split('\n'))}</li>`).join('')}</ul>`
      }
      return `<p>${lignes(ls)}</p>`
    })
    .join('')
}

/** Titre court (encadré, exemple) : texte échappé et formules entre $, sur une ligne */
export const titreRiche = (titre: string, formule: RenduFormule = formuleBrute) =>
  titre
    .split(/(\$[^$]+\$)/g)
    .map((m) => (/^\$[^$]+\$$/.test(m) ? formule(m.slice(1, -1), false) : echapper(m)))
    .join('')
