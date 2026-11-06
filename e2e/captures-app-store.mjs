// Captures habillées de la fiche App Store : au-dessus de chaque écran, une
// phrase qui dit ce qu'il montre ; la première reprend l'image de présentation
// de Google Play (logo de MathALÉA, niveaux de la France et de la Suisse
// romande). Les premières captures sont aussi celles des résultats de
// recherche : elles tiennent lieu d'image de présentation, qu'Apple n'a pas.
// Écrans bruts : APPAREILS=iphone-6-9,ipad-13 node e2e/fiche-play.mjs <brutes>
// (pnpm dev, ou BASE=… pour un autre serveur).
//   node e2e/captures-app-store.mjs [brutes] [sortie]
// Défauts : docs/app-store et docs/app-store/habillees. Écrit les tailles
// exactes d'Apple : iPhone 6,9 pouces 1320 × 2868, iPhone 6,3 pouces
// 1206 × 2622 (réduction de la 6,9 pouces, mêmes proportions), iPad 13 pouces
// 2064 × 2752.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { SANS_BRIDAGE } from './attente.mjs'

const brutes = process.argv[2] ?? 'docs/app-store'
const sortie = process.argv[3] ?? `${brutes}/habillees`
const base = process.env.BASE ?? 'http://localhost:1420/'
mkdirSync(sortie, { recursive: true })

// Taille en points CSS et échelle : le produit donne la taille d'Apple
const APPAREILS = {
  'iphone-6-9': { width: 440, height: 956, echelle: 3, titre: 30, texte: 18, marge: 28, coin: 30 },
  'ipad-13': { width: 1032, height: 1376, echelle: 2, titre: 64, texte: 32, marge: 64, coin: 24 },
}
const ECRANS = [
  { nom: '1-accueil', presentation: true },
  {
    nom: '2-paliers',
    titre: 'Des paliers à franchir',
    texte: 'Seuil de réussite fixé par l’enseignant, pauses et ressources pour revoir',
  },
  { nom: '3-ceintures', titre: 'Des ceintures, objectif par objectif', texte: 'Ce qui est réussi, ce qui reste à revoir' },
  {
    nom: '4-question',
    titre: 'Corrigé aussitôt',
    texte: 'Chaque exercice est généré au hasard : on le refait avec de nouvelles questions',
  },
  {
    nom: '5-session',
    titre: 'Une session partagée',
    texte: 'Toute la classe fait exactement les mêmes exercices, avec un simple code',
  },
  {
    nom: '6-qr-session',
    titre: 'Un QR code à scanner',
    texte: 'Pour rejoindre la session ou sa classe, sans compte ni inscription',
  },
]

const drapeauFrance = (h) =>
  `<svg height="${h}" viewBox="0 0 3 2" style="flex:none;border:1px solid #c8c8c8"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>`
const drapeauSuisse = (h) =>
  `<svg height="${h}" viewBox="0 0 32 32" style="flex:none;margin:0 ${h * 0.22}px"><rect width="32" height="32" fill="#D52B1E"/><path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff"/></svg>`

function entete(ecran, a, logo) {
  if (!ecran.presentation)
    return `<p style="margin:0;font-size:${a.titre}px;line-height:1.15;font-weight:700;color:#1f2429">${ecran.titre}</p>
      <p style="margin:${a.texte * 0.5}px 0 0;font-size:${a.texte}px;line-height:1.3;color:#45505b">${ecran.texte}</p>`
  const ligne = (drapeau, texte) =>
    `<div style="display:flex;align-items:center;gap:${a.texte * 0.6}px;margin-top:${a.texte * 0.3}px">${drapeau}<span>${texte}</span></div>`
  return `<div style="zoom:${a.titre / 22};margin-left:-6px">${logo}</div>
    <p style="margin:${a.texte * 0.7}px 0 0;font-size:${a.titre * 0.85}px;line-height:1.2;font-weight:700;color:#1f2429">Parcours d’exercices de maths corrigés</p>
    <div style="margin-top:${a.texte * 0.4}px;font-size:${a.texte}px;line-height:1.3;color:#45505b">
      ${ligne(drapeauFrance(a.texte * 0.9), 'France : de la 6e à la Terminale')}
      ${ligne(drapeauSuisse(a.texte * 0.9), 'Suisse romande : de la 9e à la 4e du Collège')}
    </div>`
}

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
for (const [appareil, a] of Object.entries(APPAREILS)) {
  const ctx = await nav.newContext({ viewport: { width: a.width, height: a.height }, deviceScaleFactor: a.echelle })
  await ctx.route('**/*', (q) => (['localhost', '127.0.0.1'].includes(new URL(q.request().url()).hostname) ? q.continue() : q.abort()))
  const page = await ctx.newPage()
  await page.goto(base)
  const logo = await page.locator('.logo-entete').first().evaluate((e) => e.outerHTML)
  for (const ecran of ECRANS) {
    const image = `data:image/png;base64,${readFileSync(`${brutes}/${appareil}-${ecran.nom}.png`).toString('base64')}`
    const html = `
      <style>.logo-entete,.logo-entete span{overflow:visible!important;text-overflow:clip!important;white-space:nowrap!important;flex:none!important}</style>
      <div style="box-sizing:border-box;width:${a.width}px;height:${a.height}px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:${a.marge * 1.6}px ${a.marge}px ${a.marge}px;background:#f6f6f6;font-family:'Source Sans Pro',sans-serif">
        <div style="align-self:stretch;flex:none">${entete(ecran, a, logo)}</div>
        <div style="flex:1;min-height:0;margin-top:${a.marge}px;display:flex;justify-content:center">
          <img src="${image}" style="height:100%;width:auto;box-sizing:border-box;border:1px solid #c8c8c8;border-radius:${a.coin}px;box-shadow:0 4px 18px rgba(0,0,0,.10)">
        </div>
      </div>`
    await page.evaluate((html) => {
      document.body.style.margin = '0'
      document.body.innerHTML = html
    }, html)
    await page.waitForTimeout(500)
    const fichier = `${sortie}/${appareil}-${ecran.nom}.png`
    await page.screenshot({ path: fichier, clip: { x: 0, y: 0, width: a.width, height: a.height } })
    // App Store Connect refuse la transparence : PNG en RGB
    execFileSync('magick', [fichier, '-background', '#f6f6f6', '-alpha', 'remove', '-alpha', 'off', fichier])
    if (appareil === 'iphone-6-9')
      execFileSync('magick', [fichier, '-resize', '1206x2622!', `${sortie}/iphone-6-3-${ecran.nom}.png`])
  }
  await ctx.close()
}
await nav.close()
