// QR codes de session et de classe : aller-retour du texte, refus des textes
// abîmés, et place dans un QR code pour chaque parcours livré. Un texte trop
// long fait lever qrcode-generator : la page de la session ne s'afficherait pas.
import { describe, expect, it } from 'vitest'
import { decoderClasse, decoderInvitation, encoderClasse, encoderInvitation, PREFIXE_CLASSE, PREFIXE_SESSION, TAILLE_QR } from '../src/lib/invitation'
import { dessinerQr } from '../src/lib/qr'
import { lireFichier } from '../src/lib/partage'
import { paliersDe } from '../src/lib/catalogue'
import { catalogue as parcoursDeTest } from './parcours-de-test'

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

describe('invitation de session', () => {
  it('aller-retour : code, parcours, palier et moteur', () => {
    const p = livres[0]
    const texte = encoderInvitation({ c: 'k3lr2', p, m: MOTEUR, e: [0, 1] })
    expect(texte.startsWith(PREFIXE_SESSION)).toBe(true)
    const i = decoderInvitation(`  ${texte}\n`)
    expect(i?.c).toBe('k3lr2')
    expect(i?.m).toBe(MOTEUR)
    expect(i?.e).toEqual([0, 1])
    expect(i?.p.id).toBe(p.id)
    expect(i?.p.etapes).toEqual(p.etapes)
  })

  it('refuse les textes abîmés ou d’un autre format', () => {
    const bon = encoderInvitation({ c: 'k3lr2', p: livres[0], m: MOTEUR })
    expect(decoderInvitation('')).toBeNull()
    expect(decoderInvitation('https://mathalea.fr')).toBeNull()
    expect(decoderInvitation(PREFIXE_SESSION)).toBeNull()
    expect(decoderInvitation(bon.slice(0, -10))).toBeNull()
    expect(decoderInvitation(PREFIXE_SESSION + 'pas-du-base64!')).toBeNull()
    expect(decoderInvitation(encoderClasse({ l: 'https://x.fr', c: 'A' }))).toBeNull()
  })

  it('refuse un palier hors du parcours', () => {
    const p = livres[0]
    expect(decoderInvitation(encoderInvitation({ c: 'k3lr2', p, m: MOTEUR, e: [p.etapes.length] }))).toBeNull()
    expect(decoderInvitation(encoderInvitation({ c: 'k3lr2', p, m: MOTEUR, e: [] }))).toBeNull()
    expect(decoderInvitation(encoderInvitation({ c: 'k3lr2', p, m: MOTEUR, e: [-1] }))).toBeNull()
  })

  it.each(livres.map((p) => [p.id, p] as const))('%s : la session tient dans un QR code, exercices intacts', (_, p) => {
    const texte = encoderInvitation({ c: 'k3lr2', p, m: MOTEUR })
    expect(texte.length).toBeLessThanOrEqual(TAILLE_QR)
    expect(dessinerQr(texte)).toMatch(/^<svg/)
    const recu = decoderInvitation(texte)!
    // Exercices, réglages et paliers toujours là : la séance est la même pour tous
    expect(recu.p.etapes.map(({ objectifs: _o, ...e }) => e)).toEqual(p.etapes.map(({ objectifs: _o, ...e }) => e))
    expect(recu.p.paliers?.map((x) => [x.nb, x.acces, x.seuil])).toEqual(p.paliers?.map((x) => [x.nb, x.acces, x.seuil]))
    expect(recu.p.version).toBe(p.version)
    // Session d'un seul palier : chaque palier aussi
    for (const x of paliersDe(p)) expect(dessinerQr(encoderInvitation({ c: 'k3lr2', p, m: MOTEUR, e: x.etapes }))).toMatch(/^<svg/)
  })

  it('garde les fiches quand elles tiennent, les retire sinon', () => {
    // Préqualifiant : fiches en texte seul, le parcours entier tient
    const petit = livres.find((p) => p.id === 'prq-grandeurs-conversions')!
    expect(decoderInvitation(encoderInvitation({ c: 'k3lr2', p: petit, m: MOTEUR }))!.p.paliers!.some((x) => x.fiche)).toBe(true)
    // Octets pseudo-aléatoires, peu compressibles comme une vraie image
    let graine = 7
    const octets = Array.from({ length: 6000 }, () => String.fromCharCode(65 + ((graine = (graine * 1103515245 + 12345) % 2147483648) % 58)))
    const image = { type: 'image', src: `data:image/png;base64,${octets.join('')}`, alt: 'figure' }
    const gros = { ...petit, paliers: petit.paliers!.map((x) => ({ ...x, fiche: { titre: 'Fiche', blocs: [image] } })) } as typeof petit
    const recu = decoderInvitation(encoderInvitation({ c: 'k3lr2', p: gros, m: MOTEUR }))!
    expect(recu.p.paliers!.some((x) => x.fiche)).toBe(false)
    expect(recu.p.etapes.length).toBe(gros.etapes.length)
  })

  it('un texte trop long ne fait pas planter l’écran : QR code vide', () => {
    expect(dessinerQr('x'.repeat(TAILLE_QR + 100))).toBe('')
    expect(dessinerQr('x'.repeat(TAILLE_QR))).toMatch(/^<svg/)
  })

  it('parcours de test : chaque session tient dans un QR code', () => {
    for (const p of parcoursDeTest) expect(dessinerQr(encoderInvitation({ c: 'k3lr2', p, m: MOTEUR }))).toMatch(/^<svg/)
  })
})

describe('invitation de classe', () => {
  it('aller-retour, espaces retirés', () => {
    const t = encoderClasse({ l: 'https://kdrive.infomaniak.com/app/share/1/abc', c: '11LC 2' })
    expect(t.startsWith(PREFIXE_CLASSE)).toBe(true)
    expect(decoderClasse(` ${t} `)).toEqual({ l: 'https://kdrive.infomaniak.com/app/share/1/abc', c: '11LC 2' })
    expect(decoderClasse(encoderClasse({ l: 'https://x.fr/d', c: '' }))).toEqual({ l: 'https://x.fr/d', c: '' })
  })

  it('noms accentués et emoji conservés', () => {
    const i = { l: 'https://x.fr/d', c: 'Préqualifiant – groupe é ✓' }
    expect(decoderClasse(encoderClasse(i))).toEqual(i)
  })

  it('refuse un lien qui n’est pas une adresse web', () => {
    expect(decoderClasse(encoderClasse({ l: 'javascript:alert(1)', c: 'A' }))).toBeNull()
    expect(decoderClasse(encoderClasse({ l: 'file:///etc/passwd', c: 'A' }))).toBeNull()
    expect(decoderClasse(PREFIXE_CLASSE + 'xxx')).toBeNull()
    expect(decoderClasse('')).toBeNull()
  })

  it('tient dans un QR code avec un long lien', () => {
    expect(dessinerQr(encoderClasse({ l: `https://drive.google.com/drive/folders/${'a'.repeat(200)}`, c: 'Classe' }))).toMatch(/^<svg/)
  })
})
