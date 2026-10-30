// Chaque suite e2e qui vérifie l'app tourne avant chaque release : une suite
// écrite mais oubliée ne protège rien (Explorer et bouton retour n'étaient pas
// dans release.yml en 0.4.9 ; quatre suites manquaient à verifier-release.sh
// en 0.4.10). Liste unique : e2e/suites.json, lue par verifier-release.sh ;
// release.yml (matrice) et emulateurs.yml doivent la suivre à l'identique.
import { describe, expect, it } from 'vitest'

const fs = 'node:fs'
const { readFileSync, readdirSync, existsSync } = await import(/* @vite-ignore */ fs)

interface Suites {
  groupes: string[][]
  longues: string[]
  port8702: string[]
  emulateurs: string[]
  horsCi: Record<string, string>
}
const liste: Suites = JSON.parse(readFileSync('e2e/suites.json', 'utf8'))
const suites = (readdirSync('e2e') as string[]).filter((f) => f.endsWith('.mjs') && !f.startsWith('.')).map((f) => f.replace(/\.mjs$/, ''))

// Matrice de release.yml : une ligne « - suite suite … » par groupe
const matrice = (readFileSync('.github/workflows/release.yml', 'utf8') as string)
  .split('\n')
  .flatMap((l) => {
    const m = /^\s+- ([a-z0-9 -]+)$/.exec(l)
    const mots = m ? m[1].trim().split(/\s+/) : []
    return mots.length && mots.every((s) => suites.includes(s)) ? [mots] : []
  })

describe('suites e2e de la release', () => {
  const classees = [...liste.groupes.flat(), ...liste.longues, ...liste.emulateurs, ...Object.keys(liste.horsCi)]

  it('chaque script de e2e/ est classé dans e2e/suites.json', () => {
    expect(suites.filter((s) => !classees.includes(s))).toEqual([])
  })

  it('aucun script classé deux fois, aucun absent', () => {
    expect(classees.length).toBe(new Set(classees).size)
    for (const s of [...classees, ...liste.port8702]) expect(existsSync(`e2e/${s}.mjs`), s).toBe(true)
  })

  it('la matrice de release.yml est celle de e2e/suites.json', () => {
    expect(matrice).toEqual(liste.groupes)
  })

  it('emulateurs.yml lance les suites des vrais appareils', () => {
    const yml = readFileSync('.github/workflows/emulateurs.yml', 'utf8') as string
    for (const s of liste.emulateurs) expect(yml, s).toContain(`e2e/${s}.mjs`)
  })

  it('verifier-release.sh joue la liste, sans en tenir une à lui', () => {
    const script = readFileSync('scripts/verifier-release.sh', 'utf8') as string
    expect(script).toContain('e2e/suites.json')
    expect(script).toContain('s.groupes.flat()')
    for (const s of liste.longues) expect(script, s).toContain(s === 'az-groupe' ? 'e2e/az-groupe.mjs' : s)
  })

  it('google-play.yml lance aussi des suites avant l’envoi', () => {
    const yml = readFileSync('.github/workflows/google-play.yml', 'utf8') as string
    const lancees = /e2e-ci\.sh ([a-z0-9 -]+)/.exec(yml)![1].trim().split(/\s+/)
    for (const s of lancees) expect(liste.groupes.flat(), s).toContain(s)
  })
})
