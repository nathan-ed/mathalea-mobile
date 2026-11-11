// Signalement d'un parcours à l'équipe MathALÉA (bug, erreur dans un exercice,
// contenu inapproprié) : un mail prêt à envoyer, avec le contenu du parcours tel que
// l'élève le voit. Les parcours des enseignants viennent de leurs drives :
// c'est du contenu publié par des utilisateurs (App Store, règle 1.2).
import { titreEleve, type Bloc, type Parcours } from './catalogue'

export const CONTACT = 'contact@coopmaths.fr'
// Une adresse mailto trop longue ne s'ouvre pas partout : le contenu est coupé
const LONGUEUR_MAX = 6000

function texteBloc(b: Bloc): string {
  switch (b.type) {
    case 'texte':
      return b.texte
    case 'retenir':
      return [b.titre, b.texte].filter(Boolean).join(' : ')
    case 'exemple':
      return [b.titre, b.enonce, ...b.etapes].filter(Boolean).join(' / ')
    case 'question':
      return [b.enonce, ...(b.choix ?? []), b.explication].filter(Boolean).join(' / ')
    case 'graphique':
      return b.legende ?? ''
    case 'image':
      return [b.alt, b.legende].filter(Boolean).join(' : ')
    case 'lien':
      return `${b.titre} : ${b.lien}`
  }
}

/** Corps du mail : ce qui permet de retrouver et de relire le parcours */
export function contenuSignale(p: Parcours, source: string, moteur?: string): string {
  const lignes = [
    `Parcours : ${p.titre}`,
    `Identifiant : ${p.id}, version ${p.version}`,
    `Niveau : ${p.niveau} · ${p.theme}`,
    `Provenance : ${source}`,
  ]
  if (moteur) lignes.push(`Moteur MathALÉA : ${moteur}`)
  if (p.auteurs?.length) lignes.push(`Auteurs : ${p.auteurs.join(', ')}`)
  if (p.objectif) lignes.push(`Objectif : ${p.objectif}`)
  if (p.descriptionEleves) lignes.push(`Description : ${p.descriptionEleves}`)
  lignes.push('', 'Exercices :', ...p.etapes.map((e, i) => `- ${titreEleve({ titresVisibles: true }, e, i)} (${e.id ?? e.uuid})`))
  for (const x of p.paliers ?? []) {
    if (x.pause?.texte) lignes.push('', `Pause après « ${x.titre} » : ${x.pause.texte}`)
    for (const r of [x.ressource, x.pause?.ressource]) if (r) lignes.push(`Ressource « ${r.titre} » : ${r.lien}`)
  }
  const fiches = [p.fiche, ...(p.paliers ?? []).map((x) => x.fiche)].filter((f) => !!f)
  for (const f of fiches) lignes.push('', `Fiche « ${f.titre} » :`, ...f.blocs.map(texteBloc).filter(Boolean))
  return lignes.join('\n')
}

/** Adresse mailto du signalement, coupée pour rester ouvrable */
export function mailSignalement(p: Parcours, source: string, moteur?: string): string {
  const debut = 'Bonjour,\n\nJe signale un problème dans ce parcours de l’application MathALÉA (bug, erreur dans un exercice, contenu inapproprié). Ce qui ne va pas :\n\n\n\n---\n'
  const sujet = `Signalement : ${p.titre}`
  const adresse = (corps: string) => `mailto:${CONTACT}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(debut + corps)}`
  let corps = contenuSignale(p, source, moteur)
  if (adresse(corps).length <= LONGUEUR_MAX) return adresse(corps)
  // Coupé à la ligne, avec une marque : l'identifiant et la provenance restent en tête
  const lignes = corps.split('\n')
  while (lignes.length > 4 && adresse(lignes.join('\n') + '\n[…]').length > LONGUEUR_MAX) lignes.pop()
  corps = lignes.join('\n') + '\n[…]'
  return adresse(corps).length <= LONGUEUR_MAX ? adresse(corps) : adresse(corps.slice(0, 1500) + '\n[…]')
}
