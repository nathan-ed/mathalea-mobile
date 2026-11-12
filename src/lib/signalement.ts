// Signalement d'un parcours à l'équipe MathALÉA (bug, erreur dans un exercice,
// contenu inapproprié) : un mail prêt à envoyer, avec le contenu du parcours tel que
// l'élève le voit. Les parcours des enseignants viennent de leurs drives :
// c'est du contenu publié par des utilisateurs (App Store, règle 1.2).
import { titreEleve, type Bloc, type Etape, type Parcours } from './catalogue'

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

/** Système de l'appareil, lu dans l'agent utilisateur du WebView (aucun identifiant) */
export function plateforme(ua: string, tactile = 0, app = true): string {
  const version = (re: RegExp) => ua.match(re)?.[1]?.replace(/_/g, '.')
  let systeme: string
  if (/Android/i.test(ua)) systeme = `Android ${version(/Android ([\d.]+)/) ?? ''}`.trim()
  else if (/iPhone|iPad|iPod/.test(ua)) systeme = `${/iPad/.test(ua) ? 'iPadOS' : 'iOS'} ${version(/OS ([\d_]+)/) ?? ''}`.trim()
  // iPad récent : se présente comme un Mac, mais tactile
  else if (/Macintosh/.test(ua)) systeme = tactile > 1 ? 'iPadOS' : 'macOS'
  else if (/Windows/.test(ua)) systeme = 'Windows'
  else if (/Linux/.test(ua)) systeme = 'Linux'
  else systeme = 'système inconnu'
  return `${systeme} (${app ? 'application' : 'navigateur'})`
}

/** Problèmes proposés à l'élève : chacun pose ses propres questions dans le mail */
export const TYPES_SIGNALEMENT = [
  { type: 'clavier', libelle: 'Clavier', icone: 'bxs-keyboard', demandes: ['Ce qui manque ou ne marche pas au clavier (touche, symbole, saisie) :'] },
  { type: 'reponse', libelle: 'Réponse correcte refusée', icone: 'bx-x-circle', demandes: ['La réponse que j’ai donnée :', 'La réponse attendue par la correction :'] },
  { type: 'enonce', libelle: 'Erreur dans l’énoncé', icone: 'bx-file', demandes: ['Ce qui est faux ou pas clair dans l’énoncé :'] },
  { type: 'correction', libelle: 'Erreur dans la correction', icone: 'bx-book-open', demandes: ['Ce qui est faux dans la correction :'] },
  { type: 'autre', libelle: 'Autre', icone: 'bx-message-detail', demandes: ['Ce que je veux signaler :'] },
] as const

export type TypeSignalement = (typeof TYPES_SIGNALEMENT)[number]['type']

export interface ExerciceSignale {
  parcours: Pick<Parcours, 'id' | 'version' | 'titre'>
  etape: Etape
  rang: number // place de l'exercice dans le parcours, à partir de 0
  question?: number // question affichée, à partir de 0
  versionApp: string
  moteur?: string
  plateforme: string
  navigateur: string // agent utilisateur : moteur du WebView et sa version
}

/**
 * Lien de l'exercice sur le site, avec les mêmes paramètres mais sans la graine :
 * avec elle, l'élève rouvrirait son tirage et y lirait la correction
 */
export function lienSite(e: Etape): string {
  const p = new URLSearchParams({ uuid: e.uuid })
  if (e.id) p.set('id', e.id)
  if (e.nbQuestions) p.set('n', String(e.nbQuestions))
  for (const [cle, url] of [['sup', 's'], ['sup2', 's2'], ['sup3', 's3'], ['sup4', 's4']] as const) if (e[cle] !== undefined && e[cle] !== '') p.set(url, String(e[cle]))
  p.set('i', '1')
  return `https://coopmaths.fr/alea/?${p}`
}

/** Corps du mail : de quoi retrouver l'exercice vu par l'élève (sans la graine) */
export function contenuExerciceSignale(x: ExerciceSignale): string {
  const e = x.etape
  const params = (['nbQuestions', 'sup', 'sup2', 'sup3', 'sup4'] as const).filter((k) => e[k] !== undefined && e[k] !== '').map((k) => `${k} = ${e[k]}`)
  const lignes = [
    `Parcours : ${x.parcours.titre} (${x.parcours.id}, version ${x.parcours.version})`,
    `Exercice ${x.rang + 1}${x.question !== undefined ? `, question ${x.question + 1}` : ''}`,
    `UUID : ${e.uuid}`,
  ]
  if (e.id) lignes.push(`Référence : ${e.id}`)
  lignes.push(`Paramètres : ${params.join(', ') || 'par défaut'}`)
  lignes.push(
    `Sur le site (autre tirage) : ${lienSite(e)}`,
    '',
    `Application MathALÉA ${x.versionApp}`,
    `Moteur MathALÉA : ${x.moteur ?? 'inconnu'}`,
    `Plateforme : ${x.plateforme}`,
    `Navigateur intégré : ${x.navigateur}`,
  )
  return lignes.join('\n')
}

/** Adresse mailto du signalement d'un exercice (toujours court : pas de coupure) */
export function mailSignalementExercice(x: ExerciceSignale, type: TypeSignalement): string {
  const t = TYPES_SIGNALEMENT.find((y) => y.type === type)!
  const debut =
    `Bonjour,\n\n${type === 'autre' ? 'Je vous écris au sujet de cet exercice de l’application MathALÉA.' : `Je signale un problème dans cet exercice de l’application MathALÉA : ${t.libelle.toLowerCase()}.`}\n\n` +
    t.demandes.map((d) => `${d}\n\n\n`).join('') +
    '---\n'
  const sujet = `${t.libelle} : ${x.etape.id ?? x.etape.uuid}`
  return `mailto:${CONTACT}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(debut + contenuExerciceSignale(x))}`
}
