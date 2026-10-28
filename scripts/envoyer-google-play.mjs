// Envoie un .aab à la Play Console par l'API Google Play (sans action tierce :
// le compte de service ne passe que par ce script et les modules de Node).
//   GOOGLE_PLAY_SERVICE_ACCOUNT='<json>' node scripts/envoyer-google-play.mjs \
//     <fichier.aab> <piste> <fichier-note> [--essai]
// --essai : fait tout sauf valider (la modification est abandonnée).
import { createSign } from 'node:crypto'
import { readFileSync } from 'node:fs'

const PAQUET = 'fr.coopmaths.mathalea'
const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PAQUET}`
const [aab, piste, fichierNote] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const essai = process.argv.includes('--essai')
if (!aab || !piste || !fichierNote) throw new Error('Usage : envoyer-google-play.mjs <aab> <piste> <fichier-note> [--essai]')

const note = readFileSync(fichierNote, 'utf8').trim()
if (!note || [...note].length > 500) throw new Error('La note de version doit faire de 1 à 500 caractères')

const compte = JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT ?? '')
const b64url = (x) => Buffer.from(x).toString('base64url')
const jeton = async () => {
  const maintenant = Math.floor(Date.now() / 1000)
  const corps = b64url(JSON.stringify({
    iss: compte.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: maintenant,
    exp: maintenant + 600
  }))
  const entete = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const signature = createSign('RSA-SHA256').update(`${entete}.${corps}`).sign(compte.private_key, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${entete}.${corps}.${signature}`
    })
  })
  if (!r.ok) throw new Error(`Jeton : HTTP ${r.status}`)
  return (await r.json()).access_token
}

const acces = await jeton()
const appeler = async (url, options = {}) => {
  const r = await fetch(url, { ...options, headers: { Authorization: `Bearer ${acces}`, ...options.headers } })
  if (!r.ok) throw new Error(`${options.method ?? 'GET'} ${url.split('?')[0]} : HTTP ${r.status} ${await r.text()}`)
  return r.status === 204 ? null : r.json()
}
const json = (corps) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) })

const modification = (await appeler(`${API}/edits`, { method: 'POST', ...json({}) })).id
try {
  const envoi = await appeler(
    `https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${PAQUET}/edits/${modification}/bundles?uploadType=media`,
    { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: readFileSync(aab) }
  )
  console.log(`Bundle envoyé : versionCode ${envoi.versionCode}`)
  await appeler(`${API}/edits/${modification}/tracks/${piste}`, {
    method: 'PUT',
    ...json({
      track: piste,
      releases: [{
        status: 'completed',
        versionCodes: [String(envoi.versionCode)],
        releaseNotes: [{ language: 'fr-FR', text: note }]
      }]
    })
  })
  if (essai) {
    await appeler(`${API}/edits/${modification}`, { method: 'DELETE' })
    console.log('Essai : modification abandonnée, rien n\'est publié')
  } else {
    await appeler(`${API}/edits/${modification}:commit`, { method: 'POST' })
    console.log(`Publié sur la piste ${piste}`)
  }
} catch (e) {
  await appeler(`${API}/edits/${modification}`, { method: 'DELETE' }).catch(() => {})
  throw e
}
