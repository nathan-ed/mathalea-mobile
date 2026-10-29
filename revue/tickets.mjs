// Regroupe les constats à ticket (tickets-interactif, tickets-rendu, app-mobile) par cause,
// pour ouvrir un ticket par cause plutôt qu'un par exercice. Chaque constat apparaît une
// seule fois : dans la première cause qui le reconnaît, sinon dans « Autres tickets ».
// Écrit docs/revue-exercices/classement/tickets-par-cause.md et vérifie le compte.
//   node revue/tickets.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const CATS = ['tickets-interactif', 'tickets-rendu', 'app-mobile']
const constats = CATS.flatMap((cat) =>
  readFileSync(join(ici, 'classement', `${cat}.jsonl`), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l)),
)
const texte = (c) => `${c.precision ?? ''} ${c.exemples.join(' ')} ${c.correction ?? ''}`
const saisie = (c) => JSON.stringify(c.rejeu?.saisie ?? c.occurrences?.[0]?.[3] ?? '')

// Une cause : où est le défaut, ce qu'il fait, la correction proposée, et le test qui la reconnaît
const CAUSES = [
  {
    titre: "App : questions à plusieurs champs numérotés sur tout l'exercice",
    ou: 'moteur/fichiers/src/moteur/index.ts:227 (verifier), src/lib/ui/BlocQuestion.svelte:173 ; site : QuestionParPage.svelte:116',
    quoi: "verifier(exercice, question) ne lit que autoCorrection[question]. Quand une question contient les champs Q0, Q1, Q2… (indices à la suite sur tout l'exercice), seul le champ qui porte l'indice de la question est vérifié, et la question suivante est notée sur un champ de la précédente. 176 exercices bâtis ainsi : revue/champs-decales.json.",
    correction: "Vérifier tous les autoCorrection dont le champ est dans le bloc de la question (score = somme). À décider avec Nathan (app) et à proposer pour la vue « une question par page » du site.",
    test: (c) => c.categorie === 'app-mobile' && /plusieurs champs numérotés|champs-decales/.test(texte(c)),
  },
  {
    titre: 'App : exercices à questions chargées après coup (meta-custom)',
    ou: 'moteur de l\'app (preparerExercice)',
    quoi: 'Les exercices 6A, 2A, 1A, 3Auto, can6a-Aléa et automatismes chargent leurs questions de façon asynchrone ; dans l\'app elles restent à « chargement… », sans champ.',
    correction: 'Attendre la fin du chargement dans preparerExercice (décision de Nathan).',
    test: (c) => c.categorie === 'app-mobile' && /meta-custom|chargement/.test(texte(c)),
  },
  {
    titre: "App : exercices non interactifs sur le site rendus interactifs",
    ou: 'moteur de l\'app (preparerExercice)',
    quoi: "Exercices déclarés interactifReady = false sur le site, que l'app prépare quand même en interactif : champs dont la réponse attendue est vide ou absente.",
    correction: 'Respecter interactifReady (exercice « sur papier » dans l\'app).',
    test: (c) => c.categorie === 'app-mobile' && /interactifReady/.test(texte(c)),
  },
  {
    titre: 'Comparaison : ce qui suit une matrice est ignoré',
    ou: 'src/lib/interactif/comparisonFunctions.ts (matrices)',
    quoi: 'La matrice juste suivie de « +1 » ou de « \\times2 » est acceptée.',
    correction: 'Refuser la saisie quand il reste du texte après \\end{pmatrix}.',
    test: (c) => /comparaison des matrices|matrice \+ 1|matrice juste suivie/.test(texte(c)) || (c.regle === 'I2' && /pmatrix/.test(saisie(c))),
  },
  {
    titre: "Comparaison : ce qui suit l'unité est ignoré",
    ou: 'src/lib/interactif/comparisonFunctions.ts (grandeurs avec unité)',
    quoi: "« 44°+1 », « 44+1° », « 300s+1 », « 48€+1 » sont acceptés pour 44°, 300 s, 48 €.",
    correction: "Refuser toute saisie dont il reste quelque chose après l'unité (ou qui place l'unité au milieu d'un calcul).",
    test: (c) => /grandeurs avec unité/.test(texte(c)) || (c.regle === 'I2' && /°|circ|€|s\+1|min/.test(saisie(c) + texte(c))),
  },
  {
    titre: "Comparaison : seul le premier intervalle est lu",
    ou: 'src/lib/interactif/comparisonFunctions.ts (intervalles)',
    quoi: "« ]-2020;4]+1 » et « ]-2020;4]\\cup[7;8] » sont acceptés pour ]-2020;4].",
    correction: 'Lire toute la saisie (réunion comprise) et refuser ce qui reste.',
    test: (c) => /seul le premier intervalle/.test(texte(c)) || (c.regle === 'I2' && /\]|\[/.test(saisie(c))),
  },
  {
    titre: "Comparaison : intervalle privé d'un point, réunion à bornes fractionnaires",
    ou: 'src/lib/interactif/comparisonFunctions.ts (intervalles)',
    quoi: "La bonne réponse est refusée avec « Il y a une erreur avec la valeur … » : [-2/5;+∞[ \\ {3/8}, ]-∞;1/3] \\ {-5/4}, [-13/11;-4/7] ∪ [-1/2;+∞[.",
    correction: 'Prendre en charge \\backslash, \\setminus et les bornes en \\frac dans la comparaison d\'intervalles.',
    test: (c) => /intervalle privé d'un point|famille que 0716b/.test(texte(c)),
  },
  {
    titre: "Comparaison : l'ensemble vide",
    ou: 'src/lib/interactif/comparisonFunctions.ts',
    quoi: "L'ensemble vide n'est accepté sous aucune forme (\\emptyset, \\varnothing, \\{\\}).",
    correction: 'Accepter \\emptyset et \\varnothing quand la réponse est vide.',
    test: (c) => /ensemble vide n'est accepté/.test(texte(c)),
  },
  {
    titre: 'Comparaison : notation scientifique d\'une somme calculée en flottants',
    ou: 'src/lib/interactif/comparisonFunctions.ts:1000 (handleEcritureScientifique)',
    quoi: 'La bonne réponse 4,980411·10⁻² est refusée sous toutes les formes (11NO3A-2).',
    correction: 'Comparer les valeurs (avec tolérance) et la forme, pas les chaînes mises en forme ; arrondir la réponse attendue.',
    test: (c) => c.id === '11NO3A-2' && c.regle === 'I1',
  },
  {
    titre: 'MonomePlusieursVariables : exposant ≥ 10 sans accolades',
    ou: 'src/lib/mathFonctions/MonomePlusieursVariables.ts:348, 383, 419',
    quoi: "`${variable}^${exposant}` donne « r^10 » : la correction affiche r¹0 et la réponse attendue ne peut pas être saisie (10FA4C-9, 10FA4F-10, 11FA4A-5).",
    correction: '`${variable}^{${exposant}}`.',
    test: (c) => /MonomePlusieursVariables/.test(texte(c)) || /a\^11/.test(texte(c)),
  },
  {
    titre: '3G32 : parenthèse ouvrante en trop dans la réponse attendue',
    ou: 'src/exercices/3e/3G32-0.ts:1033 (repris par 3G32-1 à -5 et 3G32-dereference)',
    quoi: "La réponse attendue « AB\\times(\\tan(…) » n'est pas fermée : la bonne réponse est refusée et l'écriture mal parenthésée est acceptée, suivie de n'importe quoi.",
    correction: '« ${AB}\\times\\tan(…) ».',
    test: (c) => /3G32-0\.ts:1033/.test(texte(c)),
  },
  {
    titre: 'CAN « Spéciale année » 2025 et 2026, question 24 : ℝ privé de b',
    ou: 'src/exercices/can/canNY-2025/can1NY-2025-Q24.ts:50-54 et canNY-2026/can1NY-2026-Q24.ts',
    quoi: "Réponses acceptées : « \\mathbb{R}\\\\{b\\} » (mal formée) et une réunion d'intervalles écrite avec le coefficient a au lieu de b. La forme mise en évidence (\\smallsetminus) et \\setminus sont refusées.",
    correction: 'Reprendre la liste de CANSpeciale2024.ts:1461-1467 (\\backslash, \\setminus, \\smallsetminus, réunion avec b).',
    test: (c) => /can1NY-2025-Q24|\\mathbb\{R\}\\backslash\\\{-2025\\\} » est acc/.test(texte(c)),
  },
  {
    titre: 'TTE-11 (et TSA5-30, qui le reprend) : ensemble de définition illisible, balises visibles',
    ou: 'src/exercices/TT/TTE-11.ts:428',
    quoi: "Réponse attendue « \\mathbb{R}\\backslash{\\{…\\}} » (accolades en trop) : aucune saisie n'est acceptée. Dans la correction, des balises « </div> </div> » s'affichent en texte devant « Le discriminant est null ». Fautes : « défine », « dégré », « null ».",
    correction: '« \\mathbb{R}\\backslash\\{…\\} » ; corriger les trois fautes.',
    test: (c) => /TTE-11\.ts:428/.test(texte(c)) || ['TTE-11', 'TSA5-30'].includes(c.id),
  },
  {
    titre: 'Réponse attendue vide',
    ou: 'exercices listés',
    quoi: "La réponse attendue est une chaîne vide : aucune saisie ne peut être correcte (« Vous devez saisir une réponse »).",
    correction: 'Renseigner la réponse, ou rendre la question non interactive.',
    test: (c) => /chaîne vide|réponse attendue vide/.test(texte(c)),
  },
  {
    titre: 'Réponse attendue calculée en flottant',
    ou: 'exercices listés',
    quoi: 'La réponse attendue porte une erreur d\'arrondi binaire (50.400000000000006, 456.99999999999994, 5609999.999999999) : la bonne réponse est refusée.',
    correction: 'Arrondir avant d\'écrire la réponse (arrondi, texNombre).',
    test: (c) => /flottant|456\.9999|Arrondi attendu faux/.test(texte(c)),
  },
  {
    titre: 'Nombre fractionnaire dont la fraction vaut 1',
    ou: 'exercices listés (2N30-1, CM1N2B)',
    quoi: '« 3 et 1/1 » attendu : la bonne réponse est refusée par « la fraction doit être inférieure à 1 ».',
    correction: "Reporter l'unité (4) dans le générateur.",
    test: (c) => /partie fractionnaire vaut 1/.test(texte(c)),
  },
  {
    titre: 'Texte « undefined » en tête de question (QCM)',
    ou: 'exercices listés (question += qcm.texte sans initialisation)',
    quoi: '« undefined » visible avant les propositions du QCM.',
    correction: "Initialiser la question à '' avant d'y ajouter le QCM.",
    test: (c) => /undefined \[champ\] <\/mathalea-qcm>|question \+= qcm|undefined.{0,40}QCM/i.test(texte(c)),
  },
  {
    titre: 'Identifiant « undefined » dans deuxColonnesResp (invisible pour l\'élève)',
    ou: "src/lib/format/miseEnPage.ts:145-148",
    quoi: "id='cols-responsive1-undefined' quand eleId n'est pas fourni (identifiants en double), et pas d'espace avant style=.",
    correction: 'Identifiant par défaut unique ; espace avant style.',
    test: (c) => /cols-responsive\d?-undefined/.test(texte(c)),
  },
  {
    titre: 'App : étiquettes des figures réduites',
    ou: 'moteur de l\'app (ajusterFigures)',
    quoi: 'Les étiquettes sans data-top ni data-left (figures apigeom statiques) se placent en haut à gauche après réduction de la figure.',
    correction: 'Ne pas déplacer une étiquette sans position (décision de Nathan).',
    test: (c) => c.categorie === 'app-mobile' && /ajusterFigures/.test(texte(c)),
  },
  {
    titre: 'Texte « undefined », « NaN » ou « [object Object] » visible',
    ou: 'exercices listés',
    quoi: "Une valeur non calculée s'affiche dans l'énoncé ou la correction.",
    correction: "Corriger la variable non définie (souvent un cas non prévu par le générateur).",
    test: (c) => c.regle !== 'X1' && /\bundefined\b|\$NaN\$|\bNaN\b|\[object Object\]/.test(c.exemples.join(' ') + (c.precision ?? '')) && !/cols-responsive|dataset\.colorie/.test(texte(c)),
  },
  {
    titre: 'Valeur approchée : seul l\'arrondi est accepté',
    ou: 'exercices listés',
    quoi: "« Donner une valeur approchée au centième (millième) près » : la valeur approchée par défaut, juste aussi, est refusée.",
    correction: 'Accepter les deux valeurs approchées, ou demander « l\'arrondi ».',
    test: (c) => /seul l'arrondi est accepté/.test(texte(c)),
  },
  {
    titre: 'Nombres en lettres : une seule orthographe acceptée',
    ou: 'exercices listés',
    quoi: "« mille six cents » (orthographe traditionnelle) ou « vingt virgule zéro deux » sont refusés ; seule la forme à traits d'union de 1990 passe, sans que la consigne le dise.",
    correction: 'Accepter les deux orthographes, ou l\'annoncer dans la consigne.',
    test: (c) => /Écriture en lettres|zéro-deux/.test(texte(c)),
  },
  {
    titre: 'Forme de la réponse : consigne et contrôle ne vont pas ensemble',
    ou: 'exercices listés',
    quoi: "Une fraction est demandée mais l'écriture décimale est acceptée, ou l'inverse : une valeur exacte décimale est refusée sans que la consigne impose une fraction.",
    correction: 'Aligner le contrôle sur la consigne.',
    test: (c) => /sous la forme d'une fraction|seules les fractions sont acceptées|seule la fraction exacte|demande une fraction/.test(texte(c)),
  },
  {
    titre: 'Moins de questions que demandé',
    ou: 'exercices listés',
    quoi: "Avec certains réglages, il n'y a pas assez de cas différents : la série est plus courte que demandé (questionJamaisPosee échoue).",
    correction: 'Limiter le nombre de questions ou élargir les tirages.',
    test: (c) => /moins de questions que demandé|une seule question produite|série est plus courte/.test(texte(c)),
  },
  {
    titre: 'Questions en double dans une même série',
    ou: 'exercices listés (questionJamaisPosee absent ou mal utilisé)',
    quoi: 'Deux questions identiques dans la même série, avec le nombre de questions par défaut ou 10.',
    correction: 'questionJamaisPosee sur les valeurs tirées.',
    test: (c) => /identique à la question|[Qq]uestions en double|questions sont identiques|même fonction revient|dix fois la même question|reprennent les (six )?mêmes/.test(texte(c)),
  },
  {
    titre: 'Énoncé ou correction vide',
    ou: 'exercices listés',
    quoi: 'Une question sans énoncé ou sans correction pour certains réglages.',
    correction: 'Écrire la correction manquante, ou interdire la combinaison de réglages.',
    test: (c) => /énoncé (de série )?vide|énoncé est vide|sans énoncé|consigne vide|correction vide|pas de correction|correction absente/i.test(texte(c)),
  },
  {
    titre: 'Aucune question produite pour une combinaison de réglages',
    ou: 'exercices listés',
    quoi: "L'exercice ne produit aucune question avec ces réglages.",
    correction: 'Interdire la combinaison ou produire au moins une question.',
    test: (c) => /aucune question générée/.test(texte(c)),
  },
  {
    titre: 'Même graine, énoncés différents',
    ou: 'exercices listés (aléa tiré hors de nouvelleVersion)',
    quoi: "Avec la même graine, l'exercice ne redonne pas le même énoncé : une séance ne peut pas être reprise à l'identique.",
    correction: 'Tirer tout l\'aléa dans nouvelleVersion avec les fonctions de MathALÉA (randint, choice).',
    test: (c) => /même graine, énoncés différents/.test(texte(c)),
  },
  {
    titre: "Erreurs d'exécution signalées pendant la génération",
    ou: 'exercices listés',
    quoi: 'Exception (TypeError…) ou erreur de rendu KaTeX dans la console ; « [bugsnag] Event failed to send » signale une erreur que MathALÉA a voulu remonter.',
    correction: 'Corriger l\'erreur indiquée.',
    test: (c) => c.regle === 'X1' && !/délai de \d+ min/.test(texte(c)),
  },
  {
    titre: 'Exercices trop lents pour le banc',
    ou: 'exercices listés',
    quoi: "Le banc s'est arrêté après 10 minutes sur l'exercice (toutes variantes) : il n'a pas été testé automatiquement.",
    correction: 'À tester à la main ; vérifier la durée de génération.',
    test: (c) => /délai de \d+ min/.test(texte(c)),
  },
  {
    titre: 'Formules mal fermées (« $ » visible, nombre impair de $)',
    ou: 'exercices listés',
    quoi: "Un « $ » reste visible ou une formule n'est pas fermée : le LaTeX s'affiche brut.",
    correction: 'Fermer la formule (souvent un $ en trop ou manquant autour d\'une mise en évidence).',
    test: (c) => c.regle === 'X2',
  },
]

const parCause = CAUSES.map(() => [])
const autres = []
for (const c of constats) {
  const k = CAUSES.findIndex((g) => g.test(c))
  if (k === -1) autres.push(c)
  else parCause[k].push(c)
}
const total = parCause.reduce((s, l) => s + l.length, 0) + autres.length
if (total !== constats.length) throw new Error(`perte : ${total} contre ${constats.length}`)

const echapper = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/</g, '&lt;')
const court = (s, n = 180) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const ligne = (c) => {
  const t = court(c.precision ?? c.exemples[0] ?? '')
  return `| ${c.cle} | ${c.id} | ${c.categorie} | ${echapper(t)}${c.n > 1 ? ` (×${c.n})` : ''} | ${c.lien ? `[site](${c.lien})` : ''} |\n`
}
const exos = (l) => new Set(l.map((c) => c.id)).size
let md = `# Tickets par cause

Constats des catégories ${CATS.map((c) => `\`${c}\``).join(', ')} regroupés par cause :
un ticket par cause, avec la liste des exercices touchés. Chaque constat
apparaît une seule fois (${constats.length} constats). Généré par
\`node revue/tickets.mjs\` à partir de \`revue/classement/*.jsonl\` ; la clé
renvoie au constat complet (graine, paramètres, saisie) dans ces fichiers.

| Cause | Constats | Exercices |
| --- | --- | --- |
`
CAUSES.forEach((g, k) => {
  if (parCause[k].length) md += `| ${k + 1}. ${echapper(g.titre)} | ${parCause[k].length} | ${exos(parCause[k])} |\n`
})
md += `| Autres tickets (un par exercice) | ${autres.length} | ${exos(autres)} |\n\n`
CAUSES.forEach((g, k) => {
  const l = parCause[k]
  if (!l.length) return
  md += `## ${k + 1}. ${g.titre}\n\n- Où : ${g.ou}\n- Ce qui se passe : ${g.quoi}\n- Correction proposée : ${g.correction}\n- Exercices (${exos(l)}) : ${[...new Set(l.map((c) => c.id))].join(', ')}\n\n| Clé | Exercice | Catégorie | Constat | Reproduire |\n| --- | --- | --- | --- | --- |\n`
  for (const c of l) md += ligne(c)
  md += '\n'
})
md += `## Autres tickets (un par exercice)\n\nConstats sans cause commune repérée : un ticket par exercice.\n\n| Clé | Exercice | Catégorie | Constat | Reproduire |\n| --- | --- | --- | --- | --- |\n`
for (const c of autres.sort((a, b) => a.id.localeCompare(b.id))) md += ligne(c)
writeFileSync(join(ici, '..', 'docs', 'revue-exercices', 'classement', 'tickets-par-cause.md'), md)
CAUSES.forEach((g, k) => console.log(String(parCause[k].length).padStart(4), g.titre))
console.log(String(autres.length).padStart(4), 'autres')
console.log(`${constats.length} constats, aucun perdu`)
