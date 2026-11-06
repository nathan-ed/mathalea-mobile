// Aides des suites de scan (classe-qr.mjs, session-qr.mjs) : image d'un QR
// code, fausse caméra de Chromium qui la filme, drive kDrive simulé et
// appareil d'élève.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import qrcode from 'qrcode-generator'
import { pagePrete, SANS_BRIDAGE } from './attente.mjs'

export const base = process.env.BASE ?? 'http://localhost:1420/'
export const SCANNER = 'Scanner le QR code d’une session ou d’une classe'

/** Lien kDrive d'un dossier partagé (simulé par drive()) */
export const lienKdrive = (uuid) => `https://kdrive.infomaniak.com/app/share/481516/${uuid}`

/** Image GIF du QR code d'un texte, comme l'app la dessine (correction L) */
export function imageQr(texte, chemin) {
  const q = qrcode(0, 'L')
  q.addData(texte, 'Byte')
  q.make()
  writeFileSync(chemin, Buffer.from(q.createDataURL(8, 16).split(',')[1], 'base64'))
  return chemin
}

/** Vidéo de la fausse caméra : une image de QR code sur un fond gris, filmée en continu */
export function videoDe(image, dossier, nom) {
  const fond = join(dossier, `${nom}.png`)
  execFileSync('python3', [
    '-I', '-c',
    `
import sys
from PIL import Image
fond = Image.new('RGB', (1280, 720), (90, 90, 95))
qr = Image.open(sys.argv[1]).convert('RGB')
qr.thumbnail((640, 640))
fond.paste(qr, ((1280 - qr.width) // 2, (720 - qr.height) // 2))
fond.save(sys.argv[2])
`,
    image, fond,
  ])
  const video = join(dossier, `${nom}.y4m`)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-t', '4', '-i', fond, '-vf', 'fps=15,format=yuv420p', video])
  return video
}

/**
 * Drive kDrive simulé derrière le relais de téléchargement de l'app
 * (/__telecharger) : contenus[uuid] = texte de parcours-mathalea.json. Aucun
 * autre accès réseau.
 */
async function drive(ctx, contenus) {
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.route('**/__telecharger?**', async (route) => {
    const url = new URL(route.request().url()).searchParams.get('url') ?? ''
    if (!url.startsWith('https://kdrive.infomaniak.com/2/app/481516/share/')) return route.fulfill({ status: 404, body: '' })
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    const contenu = contenus[/\/share\/([^/]+)\//.exec(url)?.[1]]
    if (!contenu) return route.fulfill({ status: 404, body: '' })
    if (url.endsWith('/init')) return json({ data: { file_id: 1 } })
    if (url.includes('/files/1/files')) return json({ data: [{ id: 2, name: 'parcours-mathalea.json', type: 'file' }] })
    if (url.endsWith('/files/2/download')) return route.fulfill({ status: 200, contentType: 'application/json', body: contenu() })
    return route.fulfill({ status: 404, body: '' })
  })
}

/**
 * Appareil d'élève (téléphone clair, ou bureau sombre) dont la caméra filme
 * `video` (aucune caméra sans vidéo). `stockage` : état de départ (clés copie:…).
 */
export async function appareil({ nom, video, contenus, stockage = {}, bureau = false, erreurs }) {
  const nav = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: [...SANS_BRIDAGE, ...(video ? ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${video}`] : [])],
  })
  const ctx = await nav.newContext({
    locale: 'fr-FR',
    acceptDownloads: true,
    ...(bureau ? { viewport: { width: 1280, height: 800 } } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }),
  })
  await drive(ctx, contenus)
  await ctx.grantPermissions(['camera'], { origin: new URL(base).origin })
  await ctx.addInitScript(
    ([stockage, sombre]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      const depart = { profil: 'eleve', pays: 'FR', explorer: [], ...stockage }
      for (const [k, v] of Object.entries(depart)) localStorage.setItem(`copie:${k}`, JSON.stringify(v))
      if (sombre) localStorage.setItem('theme', 'sombre')
    },
    [stockage, bureau],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  await page.goto(base)
  await page.getByRole('button', { name: SCANNER }).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  return { nav, page }
}

export const lireStockage = (page, cle, defaut = null) => page.evaluate(([k, d]) => JSON.parse(localStorage.getItem(`copie:${k}`) ?? JSON.stringify(d)), [cle, defaut])
