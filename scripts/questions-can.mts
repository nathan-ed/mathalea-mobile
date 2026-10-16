// Questions des sujets de la Course aux nombres (CAN) pour « Teste ton
// niveau » : pour chaque sujet officiel de 2024 et après, la source, le titre
// et le domaine de chacune de ses questions. Une question reprise par
// plusieurs sujets (les 10 premières sont souvent communes à deux niveaux)
// garde la même source : le tirage ne la prend qu'une fois.
// Le domaine vient de mots-clés du titre (DOMAINES) ; un titre sans domaine
// est signalé, à classer en ajoutant un mot-clé ou dans CORRECTIONS.
//   npx tsx scripts/questions-can.mts [clone de MathALÉA]
// Par défaut : le clone de pnpm moteur (MATHALEA_CACHE ou ~/.cache/mathalea-mobile/mathalea).
// Écrit src/lib/questionsCan.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'

const depot = resolve(process.argv[2] ?? process.env.MATHALEA_CACHE ?? join(homedir(), '.cache/mathalea-mobile/mathalea'))
const exercices = join(depot, 'src/exercices')
const sortie = resolve(import.meta.dirname, '../src/lib/questionsCan.json')

// Mêmes sujets que l'app (testNiveau.ts) : officiels, 2024 et après
const SUJET = /^can(.+)a-(\d{4})[a-zA-Z]?$/
const ANNEE_MINIMUM = 2024

export type Domaine = 'nombres' | 'mesures' | 'geometrie' | 'proportionnalite' | 'donnees' | 'algebre'

// Premier domaine dont un mot-clé figure dans le titre (sans accents, en minuscules)
const DOMAINES: [Domaine, RegExp][] = [
  ['donnees', /probabil|statisti|moyenne|mediane|effectif|frequence|diagramme|tableau(?! de proportionnalite)|esperance|binomial|denombr|arbre|variance|ecart.type|issue|tirage|lancer|hasard|evenement|independ|etendue/],
  ['proportionnalite', /proportion|pourcent|pour cent|%|echelle|vitesse|taux|evolution|reduction|augment|remise|prix|coefficient multiplicateur|regle de trois|quatrieme proportionnelle|partage|repartition|\bratio|consommation|debit|recette|majoration/],
  ['algebre', /equation|inequation|fonction|derive|primitive|suite(?! logique)|limite|expression|developp|factoris|litteral|variable|affine|lineaire|antecedent|image|courbe|tangente|second degre|polynom|discriminant|canonique|extremum|exponentiel|logarithme|\bln\b|\bexp\b|integrale|vecteur|colinea|produit scalaire|coordonnee|repere|coefficient directeur|ordonnee a l.origine|parabole|signe|variation|racine carree|programme de calcul|formule|systeme|cosinus|sinus|trigono|radian|identite|graphiquement|lecture graphique|scratch|python|script|algorithm|boucle/],
  ['geometrie', /angle|triangle|\bcarres?\b|rectangle|losange|parallelogramme|polygone|quadrilatere|cercle|disque|rayon|diametre|symetr|translation|rotation|homothet|thales|pythagore|solide|cube|pave|prisme|pyramide|cylindre|cone|sphere|patron|\bfaces?\b|arete|sommet|droite|segment|milieu|parallele|perpendiculaire|figure|quadrillage|geometr|construire|tracer|abscisse|graduee|graduation|\bpoints?\b|agrandissement|visualisation|\b3d\b/],
  ['mesures', /longueur|\baires?\b|perimetre|volume|contenance|masse|duree|heure|minute|seconde|horaire|temps|convertir|conversion|mesure|metre|litre|gramme|\bkg\b|\bcm\b|monnaie|euro|argent|carreau|bande|calendrier|\bjours?\b|\bmois\b|\bannees?\b|\bdates?\b|\bages?\b/],
  ['nombres', /calcul|somme|difference|produit|quotient|addition|soustr|ajout|multipl|mulitipl|divis|nombre|entier|decimal|fraction|chiffre|dizaine|centaine|unite|millier|dixieme|centieme|rang|arrondi|encadr|ordre de grandeur|compar|ranger|puissance|scientifique|relatif|oppose|inverse|double|triple|moitie|quart|tiers|reste|multiple|diviseur|premier|pgcd|ppcm|irreductible|simplifi|numerat|denominat|complet|complement|suite logique|egalite|astuc|mental|operation|resultat|manquant|combien de fois|numeration|ecriture|valeur|tables?\b|resoudre|priorit/],
]

// Classement à la main, prioritaire (fichier source → domaine)
const CORRECTIONS: Record<string, Domaine> = {}

const sansAccents = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export const domaineDe = (titre: string): Domaine | null => DOMAINES.find(([, re]) => re.test(sansAccents(titre)))?.[0] ?? null

interface Noeud {
  uuid?: string
  id?: string
  url?: string
  [cle: string]: unknown
}

const referentiel = JSON.parse(readFileSync(join(depot, 'src/json/referentiel2022FR.json'), 'utf8')).CAN as Noeud
const sujets: Noeud[] = []
const parcourir = (n: unknown) => {
  if (!n || typeof n !== 'object') return
  const x = n as Noeud
  if (typeof x.uuid === 'string' && typeof x.id === 'string') {
    const m = SUJET.exec(x.id)
    if (m && Number(m[2]) >= ANNEE_MINIMUM) sujets.push(x)
    return
  }
  for (const v of Object.values(x)) parcourir(v)
}
parcourir(referentiel)

const titreDe = (fichier: string) => /export const titre\s*=\s*(['"`])(.*?)\1\s*$/m.exec(readFileSync(fichier, 'utf8'))?.[2] ?? ''

const resultat: Record<string, { n: number; source: string; titre: string; domaine: Domaine | null }[]> = {}
const sansDomaine = new Map<string, string>()
for (const s of sujets) {
  const principal = join(exercices, s.url!)
  const texte = readFileSync(principal, 'utf8')
  // Ordre des questions : le tableau `questions` du sujet (MetaExerciceCan)
  const tableau = /const questions\s*=\s*\[([\s\S]*?)\]/.exec(texte)
  if (!tableau) {
    console.warn(`${s.id} : pas de tableau de questions, ignoré`)
    continue
  }
  const imports = new Map([...texte.matchAll(/^import (\w+) from '([^']+)'/gm)].map((m) => [m[1], m[2]]))
  const noms = tableau[1].split(',').map((x) => x.trim()).filter(Boolean)
  resultat[s.id!] = noms.map((nom, i) => {
    const chemin = imports.get(nom)
    if (!chemin) throw new Error(`${s.id} : import de ${nom} introuvable`)
    const fichier = resolve(dirname(principal), chemin) + '.ts'
    const source = relative(exercices, fichier).replace(/\.ts$/, '')
    const titre = titreDe(fichier)
    const domaine = CORRECTIONS[source] ?? domaineDe(titre)
    if (!domaine) sansDomaine.set(source, titre)
    return { n: i + 1, source, titre, domaine }
  })
}

writeFileSync(sortie, JSON.stringify(resultat, null, 1) + '\n')
const toutes = Object.values(resultat).flat()
const parDomaine = new Map<string, Set<string>>()
for (const q of toutes) parDomaine.set(q.domaine ?? '(sans domaine)', (parDomaine.get(q.domaine ?? '(sans domaine)') ?? new Set()).add(q.source))
console.log(`${Object.keys(resultat).length} sujets, ${toutes.length} questions, ${new Set(toutes.map((q) => q.source)).size} sources distinctes`)
for (const [d, e] of parDomaine) console.log(`  ${d} : ${e.size}`)
for (const [source, titre] of sansDomaine) console.log(`  sans domaine : ${source} « ${titre} »`)
