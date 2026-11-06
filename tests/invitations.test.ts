// QR codes de session et de classe : aller-retour du texte, refus des textes
// abîmés, et texte court pour chaque parcours livré (un QR code dense ne se
// lisait pas à la caméra, novembre 2026).
import { describe, expect, it } from 'vitest'
import { decoderClasse, decoderInvitation, encoderInvitation, moteurPlusAncien, PREFIXE_SESSION } from '../src/lib/invitation'
import { dessinerQr } from '../src/lib/qr'
import { lienDeClasse, lireFichier } from '../src/lib/partage'
import { paliersDe } from '../src/lib/catalogue'

const fs = 'node:fs'
const { readFileSync, readdirSync } = await import(/* @vite-ignore */ fs)
const fichiers = [
  ...(readdirSync('explorer') as string[]).filter((f) => f.endsWith('.json')).map((f) => `explorer/${f}`),
  'static/demo/parcours-demonstration.json',
]
const livres = fichiers.flatMap((f) => {
  const d = lireFichier(readFileSync(f, 'utf8') as string)
  return [...d.classes.flatMap((c) => c.parcours), ...(d.bibliotheque?.parcours ?? [])]
})
const MOTEUR = '2026-10-28+abcdef0'
const LIEN = lienDeClasse('https://kdrive.infomaniak.com/app/share/120240/9635c7c9-5984-4278-a739-d9f8c7d69f50', '11LC 2')

describe('invitation de session', () => {
  it('aller-retour : code, parcours, version, palier, moteur et lien', () => {
    const texte = encoderInvitation({ c: 'k3lr2', p: 'relatifs-ceintures-5e', v: 3, e: [0, 1], m: MOTEUR, l: LIEN })
    expect(texte.startsWith(PREFIXE_SESSION)).toBe(true)
    expect(decoderInvitation(`  ${texte}\n`)).toEqual({ c: 'k3lr2', p: 'relatifs-ceintures-5e', v: 3, e: [0, 1], m: '2026-10-28', l: LIEN })
  })

  it('sans palier, moteur ni lien', () => {
    expect(decoderInvitation(encoderInvitation({ c: 'K3LR2', p: 'fractions-4e', v: 1 }))).toEqual({ c: 'k3lr2', p: 'fractions-4e', v: 1 })
  })

  it('refuse les textes abîmés ou d’un autre format', () => {
    const bon = encoderInvitation({ c: 'k3lr2', p: 'fractions-4e', v: 2 })
    expect(decoderInvitation('')).toBeNull()
    expect(decoderInvitation('https://mathalea.fr')).toBeNull()
    expect(decoderInvitation(PREFIXE_SESSION)).toBeNull()
    expect(decoderInvitation(bon.replace('v=2', 'v=0'))).toBeNull()
    expect(decoderInvitation(bon.replace('v=2', 'v=deux'))).toBeNull()
    expect(decoderInvitation(bon.replace('c=k3lr2', 'c=k3l'))).toBeNull()
    expect(decoderInvitation(bon.replace('p=fractions-4e', 'p=Fractions%204e'))).toBeNull()
    expect(decoderInvitation(`${bon}&e=`)).toBeNull()
    expect(decoderInvitation(`${bon}&e=0--1`)).toBeNull()
    expect(decoderInvitation(`${bon}&l=${encodeURIComponent('javascript:alert(1)')}`)).toBeNull()
    expect(decoderInvitation(`${bon}&l=${encodeURIComponent('file:///etc/passwd')}`)).toBeNull()
  })

  it('moteur plus ancien que celui de qui a créé la session', () => {
    expect(moteurPlusAncien('2026-10-01+abc', '2026-11-05')).toBe(true)
    expect(moteurPlusAncien('2026-11-05+abc', '2026-11-05')).toBe(false)
    expect(moteurPlusAncien('2026-11-05+abc', undefined)).toBe(false)
  })

  it.each(livres.map((p) => [p.id, p] as const))('%s : texte court, chaque palier compris', (_, p) => {
    for (const e of [undefined, ...paliersDe(p).map((x) => x.etapes)]) {
      const texte = encoderInvitation({ c: 'k3lr2', p: p.id, v: p.version, e, m: MOTEUR, l: LIEN })
      // Un QR code de version 10 au plus (57 modules) : lisible de loin
      expect(texte.length).toBeLessThanOrEqual(271)
      expect(dessinerQr(texte)).toMatch(/^<svg/)
      expect(decoderInvitation(texte)).toMatchObject({ p: p.id, v: p.version, ...(e ? { e } : {}) })
    }
  })

  it('un texte trop long ne fait pas planter l’écran : QR code vide', () => {
    expect(dessinerQr('x'.repeat(3100))).toBe('')
    expect(dessinerQr('x'.repeat(2953))).toMatch(/^<svg/)
  })
})

describe('ancien QR code de classe (MACLA1.)', () => {
  // Format écrit par l'app enseignant jusqu'à la 0.5 : JSON en base64 sûr dans une adresse
  const ancien = (o: object) => {
    const octets = new TextEncoder().encode(JSON.stringify(o))
    return 'MACLA1.' + btoa(String.fromCharCode(...octets)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  it('lu, espaces retirés, noms accentués conservés', () => {
    expect(decoderClasse(` ${ancien({ l: 'https://kdrive.infomaniak.com/app/share/1/abc', c: '11LC 2' })} `)).toEqual({
      l: 'https://kdrive.infomaniak.com/app/share/1/abc',
      c: '11LC 2',
    })
    expect(decoderClasse(ancien({ l: 'https://x.fr/d', c: '' }))).toEqual({ l: 'https://x.fr/d', c: '' })
    expect(decoderClasse(ancien({ l: 'https://x.fr/d', c: 'Préqualifiant – groupe é ✓' }))?.c).toBe('Préqualifiant – groupe é ✓')
  })

  it('refuse un lien qui n’est pas une adresse web', () => {
    expect(decoderClasse(ancien({ l: 'javascript:alert(1)', c: 'A' }))).toBeNull()
    expect(decoderClasse(ancien({ l: 'file:///etc/passwd', c: 'A' }))).toBeNull()
    expect(decoderClasse('MACLA1.xxx')).toBeNull()
    expect(decoderClasse('')).toBeNull()
  })
})
