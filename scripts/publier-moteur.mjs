// Prépare une publication du moteur pour la mise à jour des apps :
//   moteur-<version>.tar.gz   archive de dist-moteur (ou static/moteur)
//   mise-a-jour.json          version, api, archive, taille, sha256, publieLe
//   mise-a-jour.json.sig      signature Ed25519 (base64) du fichier ci-dessus
// À déposer tels quels à l'adresse URL_MISES_A_JOUR (src-tauri/src/moteur.rs).
//   node scripts/publier-moteur.mjs <dossier moteur> <dossier de sortie> <clé privée .pem>
import { createHash, createPrivateKey, sign } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const [source, sortie, cle] = process.argv.slice(2).map((a) => a && resolve(a))
if (!source || !sortie || !cle) throw new Error('Usage : publier-moteur.mjs <moteur> <sortie> <clé privée>')
const { version, api } = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'))
mkdirSync(sortie, { recursive: true })
const archive = `moteur-${version.replace(/[^\w.-]/g, '_')}.tar.gz`
execFileSync('tar', ['-czf', join(sortie, archive), '-C', source, '.'])
const octets = readFileSync(join(sortie, archive))
const miseAJour = {
  format: 'moteur-mathalea/1',
  version,
  api,
  publieLe: new Date().toISOString(),
  archive,
  taille: octets.length,
  sha256: createHash('sha256').update(octets).digest('hex'),
}
const texte = JSON.stringify(miseAJour, null, 2)
writeFileSync(join(sortie, 'mise-a-jour.json'), texte)
const signature = sign(null, Buffer.from(texte), createPrivateKey(readFileSync(cle)))
writeFileSync(join(sortie, 'mise-a-jour.json.sig'), signature.toString('base64'))
console.log(`Publication ${version} (API ${api}, ${(octets.length / 1e6).toFixed(1)} Mo) dans ${sortie}`)
