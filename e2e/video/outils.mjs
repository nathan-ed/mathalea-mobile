// Outils des vidéos de présentation (video-eleve.mjs, video-enseignant.mjs) :
// app construite servie sur 1420, téléphone filmé, rythme d'une personne qui
// montre l'app (ni pressé, ni lent), un rond là où le doigt touche.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pagePrete, SANS_BRIDAGE } from '../attente.mjs'

export const BASE = 'http://localhost:1420/'
export const SORTIE = process.env.SORTIE ?? 'videos'
const LARGEUR = 390
const HAUTEUR = 844

/** Lien de partage kDrive fictif : son contenu est servi par la vidéo, rien ne part en ligne */
export const LIEN_KDRIVE = 'https://kdrive.infomaniak.com/app/share/481516/2b7e1d4c-5a3f-4e9b-8c21-6f0d9a7b3e52'

/** Rond du doigt : apparaît au toucher, s'efface doucement */
const DOIGT = () => {
  const poser = (x, y) => {
    const d = document.createElement('div')
    d.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(120,120,120,.35);border:2px solid rgba(255,255,255,.8);box-shadow:0 0 0 1px rgba(0,0,0,.15);pointer-events:none;z-index:2147483647;transition:opacity .45s ease-out, transform .45s ease-out`
    document.documentElement.appendChild(d)
    requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = '0'; d.style.transform = 'scale(1.4)' }))
    setTimeout(() => d.remove(), 600)
  }
  addEventListener('pointerdown', (e) => poser(e.clientX, e.clientY), true)
}

/**
 * Téléphone filmé. `fichierDossier` : contenu du dossier kDrive fictif ;
 * `fichierCatalogue` : catalogue de l'Explorer, servi comme s'il était en
 * ligne. `init` : réglages posés avant le premier lancement, si besoin.
 *
 * Images : capture d'écran native de Chromium (Page.startScreencast), à la
 * taille exacte de l'écran en pixels réels (780 × 1688). La vidéo de
 * Playwright posait l'écran dans un coin d'un fond gris, sans le mettre à
 * l'échelle (1er novembre 2026). Images en PNG : le JPEG brouillait les
 * formules et les petits textes.
 */
export async function telephone(nom, { fichierDossier, fichierCatalogue, init } = {}) {
  mkdirSync(SORTIE, { recursive: true })
  const brut = join(SORTIE, `.${nom}`)
  rmSync(brut, { recursive: true, force: true })
  mkdirSync(brut, { recursive: true })
  // Fenêtre réelle dans un écran virtuel (filmer.sh, Xvfb) : sans fenêtre, les
  // images de Chromium ne font que 390 × 844, la moitié des pixels de l'écran
  if (!process.env.VIDEO_XVFB) throw new Error('Lancer par e2e/video/filmer.sh (écran virtuel)')
  const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: false, args: [...SANS_BRIDAGE, '--force-device-scale-factor=2'] })
  const ctx = await nav.newContext({
    viewport: { width: LARGEUR, height: HAUTEUR },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    acceptDownloads: true,
    locale: 'fr-FR',
  })
  await ctx.addInitScript(DOIGT)
  if (init) await ctx.addInitScript(init)
  // Dossier kDrive et catalogue fictifs, par le relais de téléchargement de
  // l'app (version construite en développement) : rien ne part en ligne
  const dossier = fichierDossier ? readFileSync(fichierDossier) : null
  const catalogue = fichierCatalogue ? readFileSync(fichierCatalogue) : null
  await ctx.route('**/__telecharger?**', async (route) => {
    const url = new URL(route.request().url()).searchParams.get('url') ?? ''
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (catalogue && url.startsWith('https://coopmaths.fr/alea/parcours/')) {
      return url.endsWith('/parcours-mathalea.json') ? route.fulfill({ status: 200, contentType: 'application/json', body: catalogue }) : route.fulfill({ status: 404, body: '' })
    }
    if (!dossier || !url.startsWith('https://kdrive.infomaniak.com/2/app/481516/share/')) return route.continue()
    if (url.endsWith('/init')) return json({ data: { file_id: 1 } })
    if (url.includes('/files/1/files')) return json({ data: [{ id: 2, name: 'parcours-mathalea.json', type: 'file' }] })
    if (url.endsWith('/files/2/download')) return route.fulfill({ status: 200, contentType: 'application/json', body: dossier })
    return route.fulfill({ status: 404, body: '' })
  })
  const page = await ctx.newPage()
  // Horloge du navigateur : la vidéo peut avancer de quelques jours (révisions espacées)
  await page.clock.install()
  const erreurs = []
  page.on('pageerror', (e) => erreurs.push(e.message))

  // Une image à chaque changement de l'écran, avec son heure : la durée de
  // chaque image est l'écart jusqu'à la suivante
  const images = []
  const cdp = await ctx.newCDPSession(page)
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const fichier = join(brut, `${String(images.length).padStart(6, '0')}.png`)
    writeFileSync(fichier, Buffer.from(data, 'base64'))
    images.push({ fichier, t: metadata.timestamp })
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: LARGEUR * 2, maxHeight: HAUTEUR * 2 })

  /** Fin : images assemblées en MP4 (H.264, 30 images/s), sans son */
  async function finir() {
    await calme(page, 1500)
    // Une dernière image : la fin de la vidéo dure jusqu'à maintenant
    await page.evaluate(() => document.documentElement.appendChild(document.createElement('i')).remove())
    await new Promise((r) => setTimeout(r, 300))
    const fin = Date.now() / 1000
    await cdp.send('Page.stopScreencast').catch(() => {})
    await ctx.close()
    await nav.close()
    const liste = images
      .map((im, k) => `file '${im.fichier}'\nduration ${Math.max(0.001, ((images[k + 1]?.t ?? fin) - im.t)).toFixed(3)}`)
      .concat(`file '${images.at(-1).fichier}'`)
      .join('\n')
    writeFileSync(join(brut, 'images.txt'), liste)
    const mp4 = join(SORTIE, `${nom}.mp4`)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(brut, 'images.txt'), '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-an', '-movflags', '+faststart', mp4])
    rmSync(brut, { recursive: true, force: true })
    if (erreurs.length) console.log('Erreurs de la page :', erreurs)
    return mp4
  }
  return { page, finir, erreurs }
}

/** Pause de lecture : la page prête, puis le temps de regarder (voix off) */
export async function calme(page, ms = 1200) {
  await pagePrete(page)
  await page.waitForTimeout(ms)
}

/** Un toucher comme une personne : on vise, on touche, on regarde le résultat */
export async function toucher(page, cible, apres = 1100) {
  const c = cible.first()
  await c.waitFor({ state: 'visible', timeout: 30_000 }).catch(async (err) => {
    // Écran au moment de l'échec : capture et boutons visibles
    await page.screenshot({ path: join(SORTIE, 'erreur.png') })
    const boutons = (await page.locator('button:visible').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean)
    throw new Error(`${err.message.split('\n')[0]}\nBoutons visibles : ${boutons.join(' | ')}`)
  })
  await c.scrollIntoViewIfNeeded()
  await page.waitForTimeout(450)
  await c.tap()
  await calme(page, apres)
}

/** Texte tapé au clavier, lettre par lettre (réponse d'un élève) */
export async function taper(page, champ, texte, apres = 700) {
  await toucher(page, champ, 500)
  await page.keyboard.type(texte, { delay: 170 })
  await calme(page, apres)
}

/** Texte collé d'un coup (un lien reçu par messagerie) */
export async function coller(page, champ, texte, apres = 900) {
  await toucher(page, champ, 600)
  await champ.first().fill(texte)
  await calme(page, apres)
}

/** Défilement doux de la page (molette), pour montrer la suite d'un écran */
export async function defiler(page, dy, apres = 900) {
  const pas = Math.sign(dy) * 40
  for (let fait = 0; Math.abs(fait) < Math.abs(dy); fait += pas) {
    await page.mouse.wheel(0, pas)
    await page.waitForTimeout(16)
  }
  await calme(page, apres)
}
