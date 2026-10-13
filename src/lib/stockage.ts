// Copies des élèves : SQLite dans Tauri, localStorage dans un simple navigateur
// (ce second cas ne sert qu'aux essais automatisés du spike).
import Database from '@tauri-apps/plugin-sql'

export interface Stockage {
  lire<T>(cle: string): Promise<T | null>
  ecrire(cle: string, valeur: unknown): Promise<void>
  effacer(cle: string): Promise<void>
  cles(): Promise<string[]>
}

export const dansTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

async function stockageSqlite(): Promise<Stockage> {
  const db = await Database.load('sqlite:parcours.db')
  await db.execute(
    'CREATE TABLE IF NOT EXISTS copies (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL, maj TEXT NOT NULL)',
  )
  return {
    async lire(cle) {
      const lignes = await db.select<{ valeur: string }[]>('SELECT valeur FROM copies WHERE cle = $1', [cle])
      return lignes.length ? JSON.parse(lignes[0].valeur) : null
    },
    async ecrire(cle, valeur) {
      await db.execute(
        'INSERT INTO copies (cle, valeur, maj) VALUES ($1, $2, $3) ON CONFLICT(cle) DO UPDATE SET valeur = $2, maj = $3',
        [cle, JSON.stringify(valeur), new Date().toISOString()],
      )
    },
    async effacer(cle) {
      await db.execute('DELETE FROM copies WHERE cle = $1', [cle])
    },
    async cles() {
      return (await db.select<{ cle: string }[]>('SELECT cle FROM copies')).map((l) => l.cle)
    },
  }
}

function stockageNavigateur(): Stockage {
  return {
    async lire(cle) {
      const v = localStorage.getItem(`copie:${cle}`)
      return v ? JSON.parse(v) : null
    },
    async ecrire(cle, valeur) {
      localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
    },
    async effacer(cle) {
      localStorage.removeItem(`copie:${cle}`)
    },
    async cles() {
      return Object.keys(localStorage)
        .filter((k) => k.startsWith('copie:'))
        .map((k) => k.slice('copie:'.length))
    },
  }
}

export const ouvrirStockage = (): Promise<Stockage> =>
  dansTauri ? stockageSqlite() : Promise.resolve(stockageNavigateur())
