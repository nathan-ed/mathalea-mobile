// Données laissées par les versions publiées (e2e/donnees, écrites par
// e2e/donnees/creer.mjs) : la sauvegarde de la version courante les accepte
// telles quelles. Une clé refusée ici serait perdue à l'export ou bloquerait
// la restauration chez l'élève après la mise à jour. Parcours d'écrans :
// e2e/mise-a-jour.mjs.
import { describe, expect, it } from 'vitest'
import { CLES_DE_L_APPAREIL, cleInvalide } from '../src/lib/sauvegarde'

const fs = 'node:fs'
const { readdirSync, readFileSync } = await import(/* @vite-ignore */ fs)
const DONNEES = (readdirSync('e2e/donnees') as string[]).filter((f) => f.endsWith('.json'))

describe('données des versions publiées', () => {
  it('au moins une version publiée est couverte', () => {
    expect(DONNEES.length).toBeGreaterThan(0)
  })
  it.each(DONNEES)('%s : toutes les clés sont reconnues par la sauvegarde', (f) => {
    const { donnees } = JSON.parse(readFileSync(`e2e/donnees/${f}`, 'utf8') as string)
    // Comme exporterSauvegarde : les clés propres à l'appareil (ecran…) ne partent jamais
    const exportees = Object.fromEntries(Object.entries(donnees as Record<string, unknown>).filter(([k]) => !CLES_DE_L_APPAREIL.includes(k)))
    expect(cleInvalide(exportees)).toBeUndefined()
  })
})
