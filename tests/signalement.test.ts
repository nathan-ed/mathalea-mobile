// Signalement d'un parcours (App Store, règle 1.2) : le mail porte de quoi
// retrouver le parcours et le relire, et reste assez court pour s'ouvrir.
import { describe, expect, it } from 'vitest'
import { CONTACT, contenuSignale, mailSignalement } from '../src/lib/signalement'
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
