// Défilement de la page : en 0.4.6 et 0.4.7, `overflow-x: clip` sur html avec
// `overflow-x: hidden` sur body a bloqué le défilement au doigt de tous les
// écrans, sur Android comme ailleurs. Avec le clip de html, le body ne
// transmet plus son overflow à la fenêtre : toute valeur qui en fait un
// conteneur de défilement (hidden, auto, scroll) prend le geste sans défiler.
// Contrôle bout en bout, au doigt : node e2e/defilement.mjs (aussi dans release.yml).
import { describe, expect, it } from 'vitest'

// Lu sur le disque : sous Vitest, un import `?raw` d'un .css donne une chaîne
// vide. Module de Node importé par son nom en variable : le projet n'a pas ses types.
const fs = 'node:fs'
const { readFileSync } = await import(/* @vite-ignore */ fs)
const css = (readFileSync('src/app.css', 'utf8') as string).replace(/\/\*[\s\S]*?\*\//g, '')

/** Déclarations des règles de premier niveau dont un sélecteur est exactement `nom` */
function declarations(nom: string): Record<string, string> {
  const resultat: Record<string, string> = {}
  for (const m of css.matchAll(/(?<=^|\})\s*([^{}@]+)\{([^{}]*)\}/g)) {
    const [selecteurs, corps] = [m[1], m[2]]
    if (!selecteurs.split(',').some((s: string) => s.trim() === nom)) continue
    for (const d of corps.split(';')) {
      const [prop, ...val] = d.split(':')
      if (prop.trim() && val.length) resultat[prop.trim()] = val.join(':').trim()
    }
  }
  return resultat
}

const creeUnDefilement = (v?: string) => !!v && /\b(hidden|auto|scroll)\b/.test(v)

// Composants : un écran (min-h-screen) qui coupe son débordement devient un
// conteneur et prend le geste ; touch-action none bloque le doigt. Permis
// seulement sur une poignée de déplacement, annoncée dans un commentaire.
const { readdirSync } = await import(/* @vite-ignore */ fs)
const composants = (readdirSync('src', { recursive: true }) as string[])
  .filter((f) => f.endsWith('.svelte'))
  .map((f) => ({ f, texte: readFileSync(`src/${f}`, 'utf8') as string }))

describe('défilement des écrans (composants)', () => {
  it('les composants sont bien lus', () => {
    expect(composants.length).toBeGreaterThan(20)
  })

  it('aucun écran entier ne coupe son débordement vertical', () => {
    const fautifs = composants.flatMap(({ f, texte }) =>
      [...texte.matchAll(/class="([^"]*\bmin-h-screen\b[^"]*)"/g)].filter((m) => /\b(overflow-hidden|overflow-y-hidden|overflow-auto|overflow-y-auto|overflow-scroll|touch-none)\b/.test(m[1])).map(() => f),
    )
    expect(fautifs).toEqual([])
  })

  it('touch-action none seulement sur une poignée, annoncée', () => {
    const fautifs = composants.flatMap(({ f, texte }) =>
      texte
        .split('\n')
        .map((l, i, lignes) => ({ l, avant: lignes.slice(Math.max(0, i - 5), i).join('\n') }))
        .filter(({ l }) => /touch-action:\s*none|\btouch-none\b/.test(l) && !/<!--/.test(l))
        .filter(({ avant }) => !/Poignée/.test(avant))
        .map(({ l }) => `${f} : ${l.trim()}`),
    )
    expect(fautifs).toEqual([])
  })
})

describe('défilement de la page', () => {
  const html = declarations('html')
  const body = declarations('body')

  it('les règles de html et body sont bien lues', () => {
    expect(html['overflow-x']).toBeDefined()
    expect(body['min-height']).toBe('100dvh')
  })

  it('html et body ne bloquent pas le défilement vertical', () => {
    for (const d of [html, body]) {
      expect(d['overflow-y'] ?? '').not.toMatch(/hidden|clip/)
      expect(d['overflow'] ?? '').not.toMatch(/hidden|clip/)
      expect(d['touch-action'] ?? 'auto').not.toMatch(/none|pan-x(?!.*pan-y)/)
    }
  })

  it('avec le clip de html, body ne devient pas un conteneur de défilement', () => {
    if (!/clip/.test(html['overflow-x'] ?? html['overflow'] ?? '')) return
    expect(creeUnDefilement(body['overflow-x'])).toBe(false)
    expect(creeUnDefilement(body['overflow-y'])).toBe(false)
    expect(creeUnDefilement(body['overflow'])).toBe(false)
  })
})
