// Chaque paquet Typst importé par le moteur construit ou par l'app doit être
// embarqué dans src-tauri/typst/paquets : sans lui, le PDF échoue chez l'élève
// (« file not found (searched at typst.toml) », figures apigeom qui importent
// @preview/cetz:0.3.4, 26 novembre 2026). Sans static/moteur (pnpm moteur), la
// partie du moteur est sautée ; verifier-release.sh la joue toujours.
import { describe, expect, it } from 'vitest'

// Modules de Node chargés à l'exécution (comme catalogues.test.ts) : le
// contrôle des types de l'app ne connaît pas Node
const { existsSync, readdirSync, readFileSync, statSync } = await import(/* @vite-ignore */ 'node:' + 'fs')
const { join } = await import(/* @vite-ignore */ 'node:' + 'path')
const outil = '../scripts/typst/paquets-moteur.mjs'
const { paquetsDuMoteur } = await import(/* @vite-ignore */ outil)

const racine: string = decodeURIComponent(new URL('..', import.meta.url).pathname)
const paquets: string = join(racine, 'src-tauri/typst/paquets/preview')
const moteur: string = join(racine, 'static/moteur')
const IMPORT = /@preview\/([a-z0-9-]+):(\d+\.\d+\.\d+)/g

function fichiers(dossier: string, extensions: string[]): string[] {
  return (readdirSync(dossier) as string[]).flatMap((nom: string) => {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) return fichiers(chemin, extensions)
    return extensions.some((e) => nom.endsWith(e)) ? [chemin] : []
  })
}

function imports(liste: string[]): string[] {
  const vus = new Set<string>()
  for (const f of liste) for (const m of (readFileSync(f, 'utf8') as string).matchAll(IMPORT)) vus.add(`${m[1]}:${m[2]}`)
  return [...vus].sort()
}

const manquants = (liste: string[]) => liste.filter((p) => {
  const [nom, version] = p.split(':')
  return !existsSync(join(paquets, nom, version, 'typst.toml'))
})

describe('paquets Typst embarqués', () => {
  it('ceux de l’app (impression.rs, src/lib)', () => {
    const liste = imports([join(racine, 'src-tauri/src/impression.rs'), ...fichiers(join(racine, 'src/lib'), ['.ts', '.svelte'])])
    expect(liste.length).toBeGreaterThan(0)
    expect(manquants(liste)).toEqual([])
  })

  it('leurs dépendances', () => {
    const liste = imports(fichiers(paquets, ['.typ']).filter((f) => !f.includes('/examples/') && !f.includes('/tests/')))
      // seulement les vrais #import (les commentaires d'exemple citent d'autres versions)
      .filter((p) => fichiers(paquets, ['.typ']).some((f) => new RegExp(`^#import "@preview/${p.replace('.', '\\.')}`, 'm').test(readFileSync(f, 'utf8') as string)))
    expect(manquants(liste)).toEqual([])
  })

  it.skipIf(!existsSync(join(moteur, 'manifest.json')))('ceux du moteur construit (figures, exercices)', () => {
    // Table des versions de MathALÉA et imports en toutes lettres (apigeom)
    const liste: string[] = paquetsDuMoteur(moteur)
    expect(liste).toContain('cetz:0.3.4')
    expect(liste).toContain('exercise-bank:0.8.0')
    expect(manquants(liste)).toEqual([])
  })
})
