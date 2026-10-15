// Récupère le moteur publié sur mathalea.fr (ou MATHALEA_MOTEUR_URL), vérifie
// sa signature (CLE_PUBLIQUE de src-tauri/src/moteur.rs), sa taille et son
// SHA-256, puis l'extrait dans static/moteur. Sert aux versions des boutiques,
// qui embarquent le moteur au lieu de le télécharger.
//   node scripts/moteur-publie.mjs            # écrit static/moteur, affiche la version
//   node scripts/moteur-publie.mjs --version  # affiche seulement la version publiée
import { createHash, createPublicKey, verify } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = (process.env.MATHALEA_MOTEUR_URL ?? 'https://mathalea.fr/releases/').replace(/\/?$/, '/')
const cle = /pub const CLE_PUBLIQUE: &str = "([^"]+)"/.exec(readFileSync('src-tauri/src/moteur.rs', 'utf8'))[1]
const telecharger = async (nom) => {
  const r = await fetch(base + nom, { cache: 'no-store' })
  if (!r.ok) throw new Error(`${nom} : HTTP ${r.status}`)
  return Buffer.from(await r.arrayBuffer())
}

const texte = await telecharger('mise-a-jour.json')
const signature = (await telecharger('mise-a-jour.json.sig')).toString('utf8').trim()
const publique = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(cle, 'base64')]), format: 'der', type: 'spki' })
if (!verify(null, texte, publique, Buffer.from(signature, 'base64'))) throw new Error('Signature de mise-a-jour.json invalide')
const annonce = JSON.parse(texte.toString('utf8'))
if (process.argv.includes('--version')) {
  console.log(annonce.version)
  process.exit(0)
}
const archive = await telecharger(annonce.archive)
if (archive.length !== annonce.taille) throw new Error('Taille de l’archive inattendue')
if (createHash('sha256').update(archive).digest('hex') !== annonce.sha256) throw new Error('Empreinte de l’archive inattendue')
const fichier = join(tmpdir(), annonce.archive)
writeFileSync(fichier, archive)
rmSync('static/moteur', { recursive: true, force: true })
mkdirSync('static/moteur', { recursive: true })
// Archive faite sur Mac : attributs étendus ignorés sans avertissement par le
// tar de GNU (celui de macOS les comprend et ne connaît pas l'option)
const options = process.platform === 'darwin' ? [] : ['--warning=no-unknown-keyword']
execFileSync('tar', [...options, '-xzf', fichier, '-C', 'static/moteur'])
readFileSync('static/moteur/manifest.json')
console.log(annonce.version)
