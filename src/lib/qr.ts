// QR codes : dessin (qrcode-generator) et lecture (jsQR), sans réseau, la même
// sur toutes les plateformes. Pas de BarcodeDetector : dans le WebView
// d'Android, il passe par les services Google Play et fait planter l'app
// (GooglePlayServicesMissingManifestValueException, constaté sur Android 16).
import jsQR from 'jsqr'
import qrcode from 'qrcode-generator'

/**
 * SVG d'un QR code, à la taille de son conteneur (correction L : un écran est
 * net, des modules plus gros se lisent mieux de loin). Vide si le texte ne
 * tient pas dans un QR code : l'écran le dit au lieu de ne rien afficher.
 */
export function dessinerQr(texte: string) {
  try {
    const qr = qrcode(0, 'L')
    qr.addData(texte, 'Byte')
    qr.make()
    return qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true })
  } catch {
    return ''
  }
}

/**
 * Image PNG d'un QR code (octets en base64), à envoyer par mail ou à déposer
 * sur un drive pour la projeter : modules nets, fond blanc, et sous le code
 * des lignes de texte (code de session, titre du parcours).
 */
export function imageQr(texte: string, lignes: { texte: string; taille: number; espace?: number }[] = []) {
  const qr = qrcode(0, 'L')
  qr.addData(texte, 'Byte')
  qr.make()
  const n = qr.getModuleCount()
  const marge = 4
  const cellule = Math.max(4, Math.ceil(1000 / (n + 2 * marge)))
  const cote = (n + 2 * marge) * cellule
  const hauteurTexte = lignes.reduce((h, l) => h + l.taille * 1.5, lignes.length ? cellule * 2 : 0)
  const canvas = document.createElement('canvas')
  canvas.width = cote
  canvas.height = cote + hauteurTexte
  const c = canvas.getContext('2d')!
  c.fillStyle = '#fff'
  c.fillRect(0, 0, canvas.width, canvas.height)
  c.fillStyle = '#000'
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (qr.isDark(i, j)) c.fillRect((j + marge) * cellule, (i + marge) * cellule, cellule, cellule)
  // Police de l'app (celle de MathALÉA), texte centré, coupé s'il est trop long
  const police = getComputedStyle(document.body).fontFamily || 'sans-serif'
  let y = cote
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  for (const l of lignes) {
    y += l.taille * 1.5
    c.font = `${l.taille}px ${police}`
    c.letterSpacing = `${l.espace ?? 0}px`
    let t = l.texte
    while (t.length > 1 && c.measureText(t).width > cote - 2 * marge * cellule) t = t.slice(0, -2) + '…'
    c.fillText(t, cote / 2, y - l.taille * 0.6)
  }
  return canvas.toDataURL('image/png').split(',')[1]
}

type Lu = { texte: string; coins: { x: number; y: number }[] }

const lireAvecJsQR = (c: CanvasRenderingContext2D, x: number, y: number, l: number, h: number): Lu | null => {
  const image = c.getImageData(x, y, l, h)
  const r = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
  if (!r) return null
  const l_ = r.location
  const coins = [l_.topLeftCorner, l_.topRightCorner, l_.bottomRightCorner, l_.bottomLeftCorner].map((p) => ({ x: p.x + x, y: p.y + y }))
  return { texte: r.data, coins }
}

/** Efface un code déjà lu (blanc, un peu plus grand) : la lecture suivante en trouve un autre */
function masquer(c: CanvasRenderingContext2D, coins: Lu['coins']) {
  const cx = coins.reduce((a, p) => a + p.x, 0) / 4
  const cy = coins.reduce((a, p) => a + p.y, 0) / 4
  c.fillStyle = '#fff'
  c.beginPath()
  coins.forEach((p, i) => {
    const x = cx + (p.x - cx) * 1.25
    const y = cy + (p.y - cy) * 1.25
    if (i) c.lineTo(x, y)
    else c.moveTo(x, y)
  })
  c.closePath()
  c.fill()
}

/** Codes lus dans une image de la caméra (le plus souvent un seul) */
export async function lireImageVideo(canvas: HTMLCanvasElement): Promise<string[]> {
  const c = canvas.getContext('2d', { willReadFrequently: true })!
  const t = lireAvecJsQR(c, 0, 0, canvas.width, canvas.height)
  return t ? [t.texte] : []
}

/**
 * Codes lus dans une photo, qui peut montrer plusieurs téléphones. jsQR ne lit
 * qu'un code à la fois : chaque code lu est effacé avant de chercher le suivant.
 */
export async function lireImage(source: Blob): Promise<string[]> {
  const bitmap = await createImageBitmap(source)
  const echelle = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * echelle)
  canvas.height = Math.round(bitmap.height * echelle)
  const c = canvas.getContext('2d', { willReadFrequently: true })!
  c.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  const lus = new Set<string>()
  // Chaque code lu est effacé, puis on relit : image entière, puis zones qui
  // se chevauchent (2 × 2, 3 × 3), jusqu'à ne plus rien trouver
  for (let tour = 0; tour < 40; tour++) {
    let trouve: Lu | null = lireAvecJsQR(c, 0, 0, canvas.width, canvas.height)
    for (const n of [2, 3]) {
      if (trouve) break
      const l = canvas.width / n
      const h = canvas.height / n
      for (let i = 0; i < n && !trouve; i++)
        for (let j = 0; j < n && !trouve; j++) {
          // Zones élargies de moitié pour ne pas couper un code à cheval
          const x = Math.max(0, Math.round(i * l - l / 4))
          const y = Math.max(0, Math.round(j * h - h / 4))
          trouve = lireAvecJsQR(c, x, y, Math.min(canvas.width - x, Math.round(l * 1.5)), Math.min(canvas.height - y, Math.round(h * 1.5)))
        }
    }
    if (!trouve) break
    lus.add(trouve.texte)
    masquer(c, trouve.coins)
  }
  return [...lus]
}
