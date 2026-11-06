// Données de l'espace enseignant d'avant la 0.6 dans une sauvegarde : une
// sauvegarde d'enseignant reste restaurable ; la clé d'API d'une ancienne
// version n'est jamais exportée ; l'écran ouvert non plus.
import { describe, expect, it } from 'vitest'
import { cleInvalide, exporterSauvegarde, lireSauvegarde, restaurerSauvegarde } from '../src/lib/sauvegarde'
import type { Releve } from '../src/lib/releve'
import type { Stockage } from '../src/lib/stockage'

/** Stockage en mémoire, comme celui de l'app */
function memoire(depart: Record<string, unknown> = {}): Stockage & { donnees: Map<string, string> } {
  const donnees = new Map(Object.entries(depart).map(([k, v]) => [k, JSON.stringify(v)]))
  return {
    donnees,
    async lire(cle) {
      const v = donnees.get(cle)
      return v === undefined ? null : JSON.parse(v)
    },
    async ecrire(cle, valeur) {
      donnees.set(cle, JSON.stringify(valeur))
    },
    async effacer(cle) {
      donnees.delete(cle)
    },
    async cles() {
      return [...donnees.keys()]
    },
  }
}

describe('sauvegarde d’un enseignant d’avant la 0.6', () => {
  const recue = { c: 'vu5qx', p: 'fractions-5e', v: 1, t: 'Fractions', d: '2026-10-30T08:00:00Z', x: { 0: { u: 'abc' } }, r: { '0-0': { champ1: '3' } }, e: { 0: 'k2' } }
  const releves: Releve[] = [
    {
      cle: 'vu5qx|fractions-5e|1',
      code: 'vu5qx',
      parcours: 'fractions-5e',
      version: 1,
      titre: 'Fractions',
      le: '2026-10-30T08:00:00Z',
      recues: [recue],
      calcul: { moteur: 'm', verdicts: { [recue.d]: { '0-0': { juste: true, score: 1 } } }, hors: {} },
    },
  ]

  it('les relevés passent le contrôle, une forme abîmée non', () => {
    expect(cleInvalide({ releves })).toBeUndefined()
    expect(cleInvalide({ releves: [{ ...releves[0], recues: [{ c: 1 }] }] })).toBe('releves')
    expect(cleInvalide({ releves: 'non' })).toBe('releves')
  })

  it('la clé d’API n’est jamais exportée, et une restauration la garde', async () => {
    const st = memoire({ profil: 'enseignant', releves, 'cle-ia': 'sk-ant-secret' })
    const texte = await exporterSauvegarde(st)
    expect(texte).not.toContain('sk-ant-secret')
    expect(lireSauvegarde(texte).donnees.releves).toEqual(releves)
    // Restauration d'une autre sauvegarde : la clé reste, le reste est remplacé
    const autre = await exporterSauvegarde(memoire({ profil: 'eleve' }))
    await restaurerSauvegarde(st, autre)
    expect(await st.lire('cle-ia')).toBe('sk-ant-secret')
    expect(await st.lire('profil')).toBe('eleve')
    expect(await st.lire('releves')).toBeNull()
  })

  it('l’écran ouvert n’est pas exporté : la sauvegarde reste lisible', async () => {
    const st = memoire({ profil: 'eleve', ecran: { vue: 'accueil', onglet: 'suivi' } })
    const texte = await exporterSauvegarde(st)
    expect(lireSauvegarde(texte).donnees).not.toHaveProperty('ecran')
  })
})
