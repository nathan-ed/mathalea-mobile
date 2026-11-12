// Signalement d'un parcours (App Store, règle 1.2) : le mail porte de quoi
// retrouver le parcours et le relire, et reste assez court pour s'ouvrir.
import { describe, expect, it } from 'vitest'
import { CONTACT, TYPES_SIGNALEMENT, contenuExerciceSignale, contenuSignale, lienSite, mailSignalement, mailSignalementExercice, plateforme } from '../src/lib/signalement'
import { lireFichier } from '../src/lib/partage'
import type { Parcours } from '../src/lib/catalogue'

const fs = 'node:fs'
const { readFileSync, readdirSync } = await import(/* @vite-ignore */ fs)
const livres: Parcours[] = [
  ...(readdirSync('explorer') as string[]).filter((f) => f.endsWith('.json')).map((f) => `explorer/${f}`),
  'static/demo/parcours-demonstration.json',
].flatMap((f) => {
  const d = lireFichier(readFileSync(f, 'utf8') as string)
  return [...d.classes.flatMap((c) => c.parcours), ...(d.bibliotheque?.parcours ?? [])]
})

const parcours: Parcours = {
  id: 'relatifs-essai',
  version: 3,
  titre: 'Relatifs & co',
  objectif: 'Additionner des relatifs',
  auteurs: ['Ana', 'Ben'],
  descriptionEleves: 'Deux exercices.',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [
    { uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 },
    { uuid: '36e2a', id: '5N2H', titre: 'Soustraire', nbQuestions: 2, titreMasque: true },
  ],
  paliers: [
    { titre: 'Additionner', nb: 1, pause: { texte: 'Mise en commun', ressource: { titre: 'Vidéo', lien: 'https://exemple.ch/v' } } },
    { titre: 'Soustraire', nb: 1, fiche: { titre: 'Soustraire un relatif', blocs: [{ type: 'retenir', titre: 'Règle', texte: 'Soustraire, c’est ajouter l’opposé.' }] } },
  ],
}

describe('signalement d’un parcours', () => {
  it('contenu : identifiant, version, provenance, auteurs, exercices tels que l’élève les voit, pauses, ressources, fiches', () => {
    const t = contenuSignale(parcours, 'dossier https://kdrive.infomaniak.com/app/share/1/abc (classe 5A)')
    for (const x of ['Relatifs & co', 'relatifs-essai, version 3', 'classe 5A', 'Ana, Ben', 'Deux exercices.', '- Additionner des relatifs (5N2G)', '- Exercice 2 (5N2H)', 'Mise en commun', 'https://exemple.ch/v', 'Soustraire, c’est ajouter l’opposé.'])
      expect(t).toContain(x)
  })

  it('adresse mailto vers l’équipe, sujet et corps encodés', () => {
    const m = mailSignalement(parcours, 'Explorer', '2026-11-05+abc1234')
    expect(m.startsWith(`mailto:${CONTACT}?subject=`)).toBe(true)
    const q = new URLSearchParams(m.slice(m.indexOf('?') + 1))
    expect(q.get('subject')).toBe('Signalement : Relatifs & co')
    expect(q.get('body')).toContain('Identifiant : relatifs-essai, version 3')
    expect(q.get('body')).toContain('Moteur MathALÉA : 2026-11-05+abc1234')
    expect(q.get('body')).toContain('bug, erreur dans un exercice, contenu inapproprié')
  })

  it.each(livres.map((p) => [p.id, p] as const))('%s : mail assez court pour s’ouvrir, identifiant gardé', (_, p) => {
    const m = mailSignalement(p, 'dossier https://kdrive.infomaniak.com/app/share/120240/9635c7c9-5984-4278-a739-d9f8c7d69f50 (classe 11LC 2)')
    expect(m.length).toBeLessThanOrEqual(6000)
    expect(decodeURIComponent(m)).toContain(`Identifiant : ${p.id}, version ${p.version}`)
  })
})

describe('signalement d’un exercice', () => {
  const x = {
    parcours,
    etape: { uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 4, sup: '2', sup2: 'true' },
    rang: 0,
    question: 2,
    versionApp: '0.6.3',
    moteur: '2026-11-10',
    plateforme: 'Android 11 (application)',
    navigateur: 'Mozilla/5.0 (Linux; Android 11) Chrome/120',
  }

  it('porte l’uuid, les paramètres, la graine, la plateforme et le moteur', () => {
    const c = contenuExerciceSignale(x)
    for (const t of ['UUID : cbc26', 'Référence : 5N2G', 'nbQuestions = 4, sup = 2, sup2 = true', 'Exercice 1, question 3', 'Application MathALÉA 0.6.3', 'Moteur MathALÉA : 2026-11-10', 'Plateforme : Android 11 (application)', 'Chrome/120'])
      expect(c).toContain(t)
    // Titre masqué par défaut aux élèves : il ne figure pas dans le mail
    expect(c).not.toContain('Additionner des relatifs')
    // Pas de graine en clair : le lien du site ouvre un autre tirage (sinon la correction est lisible)
    expect(c).not.toContain('alea=')
    expect(c).toContain('Sur le site (autre tirage) : https://coopmaths.fr/alea/?uuid=cbc26&id=5N2G&n=4&s=2&s2=true&i=1')
  })

  it('ouvre un mail à l’équipe qui demande les précisions du problème choisi', () => {
    const m = mailSignalementExercice(x, 'reponse')
    expect(m.startsWith(`mailto:${CONTACT}?subject=`)).toBe(true)
    expect(decodeURIComponent(m.split('?subject=')[1].split('&')[0])).toBe('Réponse correcte refusée : 5N2G')
    const corps = decodeURIComponent(m.split('&body=')[1])
    expect(corps).toContain('réponse correcte refusée')
    expect(corps).toContain('La réponse que j’ai donnée')
    expect(corps).toContain('La réponse attendue par la correction')
    expect(corps).toContain('UUID : cbc26')
    expect(m.length).toBeLessThan(6000)
  })

  it('chaque type de problème a son sujet et ses questions', () => {
    for (const t of TYPES_SIGNALEMENT) {
      const m = mailSignalementExercice(x, t.type)
      const corps = decodeURIComponent(m.split('&body=')[1])
      expect(decodeURIComponent(m.split('?subject=')[1].split('&')[0]).startsWith(t.libelle)).toBe(true)
      for (const d of t.demandes) expect(corps).toContain(d)
      expect(corps).toContain('UUID : cbc26')
    }
    expect(decodeURIComponent(mailSignalementExercice(x, 'autre'))).toContain('Je vous écris au sujet de cet exercice')
  })

  it('reconnaît la plateforme', () => {
    expect(plateforme('Mozilla/5.0 (Linux; Android 11; M2010J19SG) AppleWebKit/537.36 Chrome/120 Mobile')).toBe('Android 11 (application)')
    expect(plateforme('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15')).toBe('iOS 18.1 (application)')
    expect(plateforme('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 5)).toBe('iPadOS (application)')
    expect(plateforme('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 0)).toBe('macOS (application)')
    expect(plateforme('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15', 0, false)).toBe('Linux (navigateur)')
  })
})
