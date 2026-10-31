// Capture d'une figure à champ, vue élève, thème sombre : node capture.mjs <port> <sortie>
import { chromium } from 'playwright'
const [port, sortie] = process.argv.slice(2)
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await nav.newPage({ viewport: { width: 700, height: 900 } })
await page.goto(`http://localhost:${port}/alea/?uuid=098c5&id=can6a-2026&n=1&s=false&s2=4&s3=false&i=1&alea=Ab12&v=eleve&title=&es=0111001`)
await page.locator('math-field').first().waitFor({ timeout: 120000 })
await page.evaluate(() => document.querySelector('#appComponent')?.classList.add('dark'))
await page.waitForTimeout(800)
await page.locator('math-field').first().click()
await page.locator('math-field').first().evaluate((m) => { m.value = '6'; m.dispatchEvent(new Event('input', { bubbles: true })) })
await page.waitForTimeout(500)
const b = await page.locator('.mathalea2d').first().boundingBox()
const clip = { x: 0, y: Math.max(0, b.y - 60), width: 460, height: b.height + 100 }
await page.screenshot({ path: sortie.replace('.png', '-saisie.png'), clip })
await page.getByRole('button', { name: /vérifier/i }).first().click()
await page.waitForTimeout(1000)
await page.screenshot({ path: sortie.replace('.png', '-verifiee.png'), clip })
await nav.close()
