import { describe, expect, it } from 'vitest'

// Module de Node importé par son nom en variable : le projet n'a pas ses types
const fs = 'node:fs'
const { readFileSync } = await import(/* @vite-ignore */ fs)

// Tauri capte par défaut le glisser-déposer de la fenêtre (dépôt de
// fichiers) : sous Windows et macOS, le glisser-déposer HTML des exercices
// de MathALÉA (étiquettes, Compte est bon) ne marchait plus dans l'app de
// bureau. Les suites e2e
// jouent dans Chromium, hors de la fenêtre Tauri : seul ce test le garde.
describe('fenêtres de Tauri', () => {
  const config = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8') as string)
  it('laissent le glisser-déposer aux exercices', () => {
    expect(config.app.windows.length).toBeGreaterThan(0)
    for (const fenetre of config.app.windows) {
      expect(fenetre.dragDropEnabled).toBe(false)
    }
  })
})

// Mise à jour des apps de bureau (src-tauri/src/maj.rs) : les apps installées
// n'acceptent que ce qui est signé par cette clé, lue à cette adresse. Changer
// l'une ou l'autre coupe la mise à jour de toutes les apps déjà installées.
describe('mise à jour des apps de bureau', () => {
  const config = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8') as string)
  it('garde la clé publique et le latest.json de la forge', () => {
    expect(config.plugins.updater.pubkey).toBe(
      'dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEQwNDI3RkVEOUExOTM2QUIKUldTck5obWE3WDlDMEMvTVRWZUhtTEg3ZzlFcDlwd09YbkdCQUpGWTA3WTNzLy9RRm5Xd2Z2MEIK'
    )
    expect(config.plugins.updater.endpoints).toEqual([
      'https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/raw/main/releases/latest.json'
    ])
    expect(config.plugins.updater.dangerousInsecureTransportProtocol).toBeUndefined()
  })
})
