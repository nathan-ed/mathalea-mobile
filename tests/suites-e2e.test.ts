// Chaque suite e2e qui vérifie l'app tourne avant chaque release : une suite
// écrite mais oubliée ne protège rien (Explorer et bouton retour n'étaient pas
// dans release.yml en 0.4.9). Elle est lancée par release.yml (CI), par
// emulateurs.yml (vrais Android et iPhone) ou par scripts/verifier-release.sh
// (longues suites, sur l'ordinateur de qui publie). Les scripts qui ne
// vérifient rien (captures, sondes, réseau réel) sont listés à part.
import { describe, expect, it } from 'vitest'

const fs = 'node:fs'
const { readFileSync, readdirSync, existsSync } = await import(/* @vite-ignore */ fs)

const HORS_CI: Record<string, string> = {
  'apercu-parcours': 'planches de relecture d’un parcours',
  'az-groupe': 'module importé par az-1, az-2 et az-3',
  'parcours-az': 'module importé par formats et az-groupe',
  'captures-enseignant': 'captures pour la documentation',
  'fiche-play': 'captures des boutiques',
  guide: 'captures du guide',
  'guide-site': 'captures du site MathALÉA (autre dépôt)',
  'image-presentation': 'image de la fiche Google Play',
  drives: 'vrais drives : réseau nécessaire',
  'referentiel-site': 'site MathALÉA servi en local (autre dépôt)',
  'sonde-can': 'sonde du moteur, sans vérification de l’app',
  complet: 'dossier partagé servi par spike-sync (hors dépôt)',
}

const suites = (readdirSync('e2e') as string[]).filter((f) => f.endsWith('.mjs') && !f.startsWith('.')).map((f) => f.replace(/\.mjs$/, ''))
const lancees = (fichier: string) => {
  const yml = readFileSync(fichier, 'utf8') as string
  return [...yml.matchAll(/^\s+- ([a-z0-9 -]+)$/gm)].flatMap((m) => m[1].trim().split(/\s+/)).filter((s) => suites.includes(s))
}

// Suites citées par le script local, commentaires retirés (ils nomment
// « formats » ou « complet » sans les lancer)
const lanceesLocalement = () => {
  const code = (readFileSync('scripts/verifier-release.sh', 'utf8') as string).replace(/(^|\s)#.*$/gm, '')
  return [...new Set(code.match(/[a-z0-9-]+/g) ?? [])].filter((s) => suites.includes(s))
}

describe('suites e2e de la release', () => {
  const ci = lancees('.github/workflows/release.yml')
  const emulateurs = suites.filter((s) => (readFileSync('.github/workflows/emulateurs.yml', 'utf8') as string).includes(`e2e/${s}.mjs`))
  const locales = lanceesLocalement()

  it('chaque suite de vérification est lancée avant une release', () => {
    const oubliees = suites.filter((s) => !ci.includes(s) && !emulateurs.includes(s) && !locales.includes(s) && !(s in HORS_CI))
    expect(oubliees).toEqual([])
  })

  it('verifier-release.sh rejoue aussi chaque suite de release.yml', () => {
    expect(ci.filter((s) => !locales.includes(s))).toEqual([])
  })

  it('aucune suite lancée deux fois, aucune suite absente', () => {
    expect(ci.length).toBe(new Set(ci).size)
    for (const s of ci) expect(existsSync(`e2e/${s}.mjs`), s).toBe(true)
  })

  it('la liste à part ne cite que des scripts existants', () => {
    for (const s of Object.keys(HORS_CI)) expect(suites, s).toContain(s)
  })

  it('google-play.yml lance aussi des suites avant l’envoi', () => {
    expect(readFileSync('.github/workflows/google-play.yml', 'utf8')).toMatch(/e2e-ci\.sh \S+/)
  })
})
