// Crée la paire de clés Ed25519 qui signe les publications du moteur.
// La clé privée ne doit jamais être versionnée ; la clé publique (base64,
// 32 octets) va dans src-tauri/src/moteur.rs (CLE_PUBLIQUE).
//   node scripts/cles-moteur.mjs ~/.local/share/mathalea-mobile/moteur-ed25519.pem
import { generateKeyPairSync } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'

const sortie = process.argv[2]
if (!sortie) throw new Error('Chemin de la clé privée attendu')
if (existsSync(sortie)) throw new Error(`${sortie} existe déjà`)
const { privateKey, publicKey } = generateKeyPairSync('ed25519')
writeFileSync(sortie, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 })
// Les 32 derniers octets du SPKI DER sont la clé publique brute
const brute = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32)
console.log(`Clé privée : ${sortie}`)
console.log(`CLE_PUBLIQUE = "${brute.toString('base64')}"`)
