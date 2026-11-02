// Toute clé de stockage écrite par l'app doit avoir son contrôle dans
// sauvegarde.ts : sinon une sauvegarde qui la contient est refusée en entier
// (« Récupérer mes données » échoue) ou passe sans contrôle.
import { describe, expect, it } from 'vitest'
import { cleConnue } from '../src/lib/sauvegarde'

const fs = 'node:fs'
const { readFileSync, readdirSync } = await import(/* @vite-ignore */ fs)

const sources = (dossier: string): string[] =>
  (readdirSync(dossier, { withFileTypes: true }) as { name: string; isDirectory(): boolean }[]).flatMap((e) =>
    e.isDirectory() ? sources(`${dossier}/${e.name}`) : /\.(ts|svelte)$/.test(e.name) ? [`${dossier}/${e.name}`] : [],
  )

// Clés littérales passées au stockage, préfixes des clés par parcours
// (`seance:${id}`), constantes CLE des modules qui écrivent par elle
function clesDuCode() {
  const cles = new Set<string>()
  for (const f of sources('src')) {
    const code = readFileSync(f, 'utf8') as string
    for (const m of code.matchAll(/\.(?:ecrire|lire|effacer)(?:<[^>]*>)?\(\s*'([^']+)'/g)) cles.add(m[1])
    for (const m of code.matchAll(/`([a-z-]+:)\$\{/g)) if (m[1] !== 'copie:' && m[1] !== 'titre:') cles.add(m[1] + 'x')
    const constante = /const CLE = '([^']+)'/.exec(code)
    if (constante && /\.ecrire\(CLE\b/.test(code)) cles.add(constante[1])
  }
  return [...cles].sort()
}

describe('clés de stockage', () => {
  it('le relevé trouve les clés connues (le test lui-même marche)', () => {
    const cles = clesDuCode()
    for (const c of ['profil', 'classes', 'bibliotheque', 'seance:x', 'resultats:x', 'historique:x']) expect(cles, c).toContain(c)
  })

  it('chaque clé écrite par l’app a son contrôle dans la sauvegarde', () => {
    expect(clesDuCode().filter((c) => !cleConnue(c))).toEqual([])
  })
})
