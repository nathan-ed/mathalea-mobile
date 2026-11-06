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

/** Code lu dans une image de la caméra */
export async function lireImageVideo(canvas: HTMLCanvasElement): Promise<string[]> {
  const c = canvas.getContext('2d', { willReadFrequently: true })!
  const image = c.getImageData(0, 0, canvas.width, canvas.height)
  const r = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
  return r ? [r.data] : []
}
