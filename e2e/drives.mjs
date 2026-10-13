// Lecture des vrais dossiers de démonstration dans le navigateur (pnpm dev),
// par le relais du serveur Vite. Réseau nécessaire.
//   node e2e/drives.mjs
import { chromium } from 'playwright'

const base = process.env.BASE ?? 'http://localhost:1420'
const liens = {
  kDrive: 'https://kdrive.infomaniak.com/app/share/120240/ba6c0e4d-4386-4789-80f5-8d824146b723',
  Dropbox: 'https://www.dropbox.com/scl/fo/61ukfii2ul7wygvtn480a/AMdjmMSWDB0y5U5-HVi2oCU?rlkey=japzwkf6z8n5ocnc0ovxi4lrj&dl=0',
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
let echecs = 0
for (const [nom, lien] of Object.entries(liens)) {
  const page = await (await nav.newContext({ viewport: { width: 390, height: 844 } })).newPage()
  await page.goto(base)
  await page.getByRole('button', { name: /France/ }).click()
  await page.getByRole('button', { name: /Élève/ }).click()
  await page.getByLabel('Lien de partage donné par ton enseignant').fill(lien)
  await page.getByRole('button', { name: 'Ajouter le dossier' }).click()
  const ok = await page
    .getByText('Classe test')
    .first()
    .waitFor({ timeout: 20000 })
    .then(() => true)
    .catch(() => false)
  console.log(`${ok ? '✔' : '✘'} ${nom} : ${ok ? 'dossier lu dans le navigateur' : await page.locator('main').innerText()}`)
  if (!ok) echecs++
}
await nav.close()
process.exit(echecs ? 1 : 0)
