#!/usr/bin/env node
// Dépose des fichiers (APK d'essai ou de release) dans la boîte de dépôt kDrive
// de Nathan, où vont toutes les versions. Lien de dépôt : on peut envoyer, pas lire.
// Les noms portent déjà version et commit (MathALEA-<version>-<commit>-android-<abi>.apk),
// donc rien ne s'écrase.
//   node scripts/deposer-apk.mjs releases/essai/MathALEA-0.7.3-5c5fb70-android-arm64.apk [autres…]
// Le formulaire exige prénom, nom et une vraie adresse : KDRIVE_EMAIL (Nathan a choisi
// hello@naths.ch, comme pour mynotes), KDRIVE_FIRST, KDRIVE_LAST.
import { existsSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const DEPOT = 'https://kdrive.infomaniak.com/app/collaborate/120240/f81bd324-02f6-4920-a236-a51bea3b7318'
const email = process.env.KDRIVE_EMAIL ?? 'hello@naths.ch'
const fichiers = process.argv.slice(2).map((f) => realpathSync(f))
if (!fichiers.length || !fichiers.every(existsSync)) {
  console.error('Fichiers à déposer attendus.')
  process.exit(2)
}

const nav = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium' })
try {
  const page = await nav.newPage({ viewport: { width: 1200, height: 900 } })
  const erreurs = []
  page.on('response', async (r) => {
    if (r.status() >= 400 && r.url().includes('/dropbox/')) erreurs.push(`${r.status()} ${await r.text().catch(() => '')}`)
  })
  await page.goto(DEPOT, { waitUntil: 'networkidle' })
  await page.getByText(/Import files|Importer des fichiers/).click()
  await page.locator('input[type=file]').setInputFiles(fichiers)
  await page.locator('input[name=firstName]').fill(process.env.KDRIVE_FIRST ?? 'Nathan')
  await page.locator('input[name=lastName]').fill(process.env.KDRIVE_LAST ?? 'Scheinmann')
  await page.locator('input[name=email]').fill(email)
  const envoyer = page.getByRole('button', { name: /Transfer|Transférer|Envoyer/ })
  await envoyer.click()
  const t0 = Date.now()
  while (Date.now() - t0 < 600_000) {
    if (erreurs.length) throw new Error(`kDrive refuse : ${erreurs.join(' | ').slice(0, 500)}`)
    // Le bouton disparaît dès le début de l'envoi : attendre le message de réussite
    if (await page.getByText(/imported successfully|importés avec succès/i).count()) break
    await page.waitForTimeout(2000)
  }
  await page.waitForTimeout(3000)
  if (erreurs.length) throw new Error(`kDrive refuse : ${erreurs.join(' | ').slice(0, 500)}`)
  console.log((await page.evaluate(() => document.body.innerText)).slice(0, 600))
  const capture = path.join(path.dirname(fichiers[0]), 'depot-kdrive.png')
  await page.screenshot({ path: capture })
  console.log(`Capture : ${capture}`)
} finally {
  await nav.close()
}
