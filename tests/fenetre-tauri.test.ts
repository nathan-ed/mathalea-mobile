import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Tauri capte par défaut le glisser-déposer de la fenêtre (dépôt de
// fichiers) : sous Windows, les étiquettes des exercices à glisser-déposer
// de MathALÉA ne se déplaçaient plus dans l'app de bureau. Les suites e2e
// jouent dans Chromium, hors de la fenêtre Tauri : seul ce test le garde.
describe('fenêtres de Tauri', () => {
  const config = JSON.parse(
    readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8')
  )
  it('laissent le glisser-déposer aux exercices', () => {
    expect(config.app.windows.length).toBeGreaterThan(0)
    for (const fenetre of config.app.windows) {
      expect(fenetre.dragDropEnabled).toBe(false)
    }
  })
})
