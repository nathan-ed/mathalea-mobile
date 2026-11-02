// Bouton retour du téléphone : le niveau le plus récent se referme d'abord, un
// panneau du bas passe avant tout, l'écran précédent ensuite ; plus rien à
// refermer, la sentinelle quitte l'historique et le retour suivant quitte
// l'app. À l'accueil, tout onglet ramène à l'onglet de départ.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const microtaches = () => new Promise((r) => queueMicrotask(() => r(undefined)))

describe('pile des retours', () => {
  let nav: typeof import('../src/lib/navigation.svelte')
  let historique: boolean[]
  beforeEach(async () => {
    vi.resetModules()
    nav = await import('../src/lib/navigation.svelte')
    historique = []
    nav.brancherHistorique((present) => historique.push(present))
  })

  it('le niveau le plus récent se referme d’abord, puis le précédent, puis l’écran précédent', async () => {
    const ordre: string[] = []
    nav.retourDeBase(() => ordre.push('écran précédent'))
    const retirerA = nav.surRetour(() => ordre.push('A'))
    const retirerB = nav.surRetour(() => ordre.push('B'))
    nav.revenir()
    retirerB()
    nav.revenir()
    retirerA()
    nav.revenir()
    expect(ordre).toEqual(['B', 'A', 'écran précédent'])
  })

  it('un panneau du bas (priorité 1) passe avant un onglet enregistré après lui', () => {
    const ordre: string[] = []
    nav.surRetour(() => ordre.push('panneau'), 1)
    nav.surRetour(() => ordre.push('onglet'))
    nav.revenir()
    expect(ordre).toEqual(['panneau'])
  })

  it('sentinelle posée tant qu’il reste à refermer, retirée ensuite : le retour suivant quitte l’app', async () => {
    const retirer = nav.surRetour(() => {})
    await microtaches()
    expect(historique).toEqual([true])
    nav.etatHistorique(true)
    retirer()
    await microtaches()
    expect(historique).toEqual([true, false])
  })

  it('« précédent » du navigateur (sentinelle consommée) referme un niveau', async () => {
    const fn = vi.fn()
    nav.surRetour(fn)
    await microtaches()
    nav.etatHistorique(true)
    nav.etatHistorique(false)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('la sentinelle retirée par l’app elle-même n’est ni reposée ni comptée comme un retour', async () => {
    const retirer = nav.surRetour(() => {})
    await microtaches()
    nav.etatHistorique(true)
    retirer()
    await microtaches()
    nav.etatHistorique(false) // l'historique confirme le retrait demandé par l'app
    await microtaches()
    expect(historique).toEqual([true, false])
    // Un nouveau niveau repose la sentinelle normalement
    nav.surRetour(() => {})
    await microtaches()
    expect(historique).toEqual([true, false, true])
  })
})

describe('retour à l’accueil', () => {
  let retourAccueil: typeof import('../src/lib/navigation.svelte').retourAccueil
  beforeEach(async () => {
    retourAccueil = (await import('../src/lib/navigation.svelte')).retourAccueil
  })
  const eleve = { chapitre: null, niveau: null, onglet: 'mes', depart: 'mes', enseignant: false, vueEleve: false }
  const prof = { ...eleve, onglet: 'creer', depart: 'creer', enseignant: true }

  it('élève : chapitre, puis degré de l’Explorer, puis onglet de départ, puis quitter l’app', () => {
    expect(retourAccueil({ ...eleve, onglet: 'explorer', niveau: '5e', chapitre: 'Relatifs' })).toBe('chapitre')
    expect(retourAccueil({ ...eleve, onglet: 'explorer', niveau: '5e' })).toBe('niveau')
    expect(retourAccueil({ ...eleve, onglet: 'explorer' })).toBe('depart')
    expect(retourAccueil({ ...eleve, onglet: 'suivi' })).toBe('depart')
    expect(retourAccueil(eleve)).toBeNull()
  })

  it('enseignant : tout onglet ramène à Parcours ; en vue élève, Mes parcours ramène à l’espace enseignant', () => {
    expect(retourAccueil({ ...prof, onglet: 'classes' })).toBe('depart')
    expect(retourAccueil({ ...prof, onglet: 'en-classe' })).toBe('depart')
    expect(retourAccueil(prof)).toBeNull()
    expect(retourAccueil({ ...prof, vueEleve: true, onglet: 'mes', depart: 'mes' })).toBe('quitterVueEleve')
    expect(retourAccueil({ ...prof, vueEleve: true, onglet: 'suivi', depart: 'mes' })).toBe('depart')
  })
})
