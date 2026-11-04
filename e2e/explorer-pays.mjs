// Le dossier décide du pays (Nathan, 4 novembre 2026 : un fichier déplacé
// dans FR restait dans l'Explorer suisse). Dossier kDrive de l'Explorer simulé
// (sous-dossiers FR et CH) ; l'app doit être construite SANS VITE_URL_EXPLORER
// (verifier-release.sh la construit ainsi pour cette suite). Élève suisse :
// seulement les parcours de CH, pas celui de 11e rangé par erreur dans FR ;
// programme changé en France dans les Réglages : seulement ceux de FR, sans
// rien de suisse ; hors connexion, la copie du pays reste, celle de l'autre
// pays n'est jamais montrée. Téléphone (clair) et bureau (sombre).
//   CAPTURES=<dossier> node e2e/explorer-pays.mjs
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { jusqua, pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}

const lire = (f) => JSON.parse(readFileSync(new URL(`../explorer/${f}`, import.meta.url), 'utf8'))
const fichierCH = lire('ch-4e-college.json')
const egare = lire('ch-11e-ls.json') // fichier suisse déposé par erreur dans FR
const francais = {
  format: 'classes-mathalea/1',
  exporteLe: '2026-11-04T00:00:00.000Z',
  classes: [
    {
      nom: '5e',
      parcours: [
        {
          id: 'essai-5e-relatifs', version: 1, titre: 'Nombres relatifs', objectif: 'Additionner des relatifs.', niveau: '5e', theme: 'Nombres relatifs', difficulte: 1,
          presentation: 'une_question_par_page', correction: 'question', auteurs: ['l’équipe CoopMaths'],
          etapes: [{ uuid: 'cbc26', id: '5N2G', nbQuestions: 2, titre: 'Additionner deux relatifs' }],
        },
      ],
    },
  ],
}

// API de la page de partage kDrive (partage.ts, lireKdrive), servie par le relais de téléchargement
const API = 'https://kdrive.infomaniak.com/2/app/120240/share/9635c7c9-5984-4278-a739-d9f8c7d69f50'
const reponses = {
  [`${API}/init`]: { data: { file_id: 7 } },
  [`${API}/files/7/files?per_page=200&page=1`]: { data: [{ id: 20, name: 'CH', type: 'dir' }, { id: 21, name: 'FR', type: 'dir' }] },
  [`${API}/files/20/files?per_page=200&page=1`]: { data: [{ id: 30, name: 'ch-4e-college.json', type: 'file' }] },
  [`${API}/files/21/files?per_page=200&page=1`]: { data: [{ id: 31, name: 'ch-11e-ls.json', type: 'file' }, { id: 32, name: 'fr-5e.json', type: 'file' }] },
  [`${API}/files/30/download`]: fichierCH,
  [`${API}/files/31/download`]: egare,
  [`${API}/files/32/download`]: francais,
}

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const texte = async (page) => (await page.locator('main').innerText()).replace(/\s+/g, ' ')
const onglet = (page, nom) => page.getByRole('tab', { name: nom, exact: true })
async function toucher(page, bouton) {
  await bouton.scrollIntoViewIfNeeded()
  await pointStable(bouton)
  await bouton.click()
  await pagePrete(page)
}

const appareils = [
  { nom: 'téléphone clair', theme: 'clair', options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  { nom: 'bureau sombre', theme: 'sombre', options: { viewport: { width: 1280, height: 800 } } },
]

for (const a of appareils) {
  const s = a.theme === 'sombre' ? '-sombre' : ''
  const ctx = await nav.newContext({ ...a.options, colorScheme: a.theme === 'sombre' ? 'dark' : 'light' })
  let enLigne = true
  const demandes = []
  await ctx.route('**/*', async (r) => {
    const url = new URL(r.request().url())
    if (url.pathname === '/__telecharger') {
      const cible = url.searchParams.get('url')
      demandes.push(cible)
      const corps = reponses[cible]
      if (!enLigne) return r.abort()
      return r.fulfill(corps ? { status: 200, contentType: 'application/json', body: JSON.stringify(corps) } : { status: 404, body: '' })
    }
    return ['localhost', '127.0.0.1'].includes(url.hostname) ? r.continue() : r.abort()
  })
  await ctx.addInitScript((theme) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', theme)
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('CH'))
  }, a.theme)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${a.nom}: ${e.message}`))
  await page.goto(base)
  await pagePrete(page)

  // Suisse : le sous-dossier CH seul
  await toucher(page, onglet(page, 'Explorer'))
  await page.getByRole('button', { name: /^4e Collège/ }).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  const ch = await texte(page)
  ok(!/\b11e\b/.test(ch) && !ch.includes('5e'), `${a.nom} : Suisse, seulement le dossier CH (rien du dossier FR)`, ch)
  ok(!demandes.some((d) => d.includes('/files/21/') || d.includes('/files/31/')), `${a.nom} : le dossier FR n'est pas lu en Suisse`)
  await page.screenshot({ path: `${captures}/explorer-pays-ch${s}.png` })

  // Programme changé en France dans les Réglages
  await toucher(page, page.getByRole('button', { name: 'Réglages' }))
  await toucher(page, page.getByRole('radio', { name: /France/ }))
  await toucher(page, page.getByRole('button', { name: 'Enregistrer et quitter' }))
  await toucher(page, onglet(page, 'Explorer'))
  await page.getByRole('button', { name: /^5e/ }).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  const fr = await texte(page)
  ok(!/Collège|\b11e\b|Préqualifiant/.test(fr), `${a.nom} : France, seulement le dossier FR, rien de suisse`, fr)
  ok((await page.evaluate(() => localStorage.getItem('copie:explorer-pays'))) === '"FR"', `${a.nom} : copie marquée France`)
  await page.screenshot({ path: `${captures}/explorer-pays-fr${s}.png` })

  // Hors connexion, relancée : la copie française reste
  enLigne = false
  await page.reload()
  await pagePrete(page)
  await toucher(page, onglet(page, 'Explorer'))
  await jusqua(async () => (await texte(page)).includes('recevoir les nouvelles versions'), { quoi: 'avis hors connexion' })
  ok((await page.getByRole('button', { name: /^5e/ }).isVisible()), `${a.nom} : hors connexion, copie du pays affichée avec l'avis`)

  // Retour en Suisse hors connexion : jamais la copie française
  await toucher(page, page.getByRole('button', { name: 'Réglages' }))
  await toucher(page, page.getByRole('radio', { name: /Suisse/ }))
  await toucher(page, page.getByRole('button', { name: 'Enregistrer et quitter' }))
  await toucher(page, onglet(page, 'Explorer'))
  await jusqua(async () => (await texte(page)).includes('Connecte-toi à internet pour télécharger les parcours'), { quoi: 'invitation à se connecter' })
  ok(!(await texte(page)).includes('5e'), `${a.nom} : Suisse hors connexion, aucun parcours de la copie française`)
  await page.screenshot({ path: `${captures}/explorer-pays-hors-ligne${s}.png` })

  // Connexion revenue : Réessayer lit le dossier CH
  enLigne = true
  await toucher(page, page.getByRole('button', { name: 'Réessayer' }))
  await page.getByRole('button', { name: /^4e Collège/ }).waitFor({ timeout: 60_000 })
  ok(!(await texte(page)).includes('5e'), `${a.nom} : Réessayer, dossier CH lu`)
  await ctx.close()
}
await nav.close()
ok(!erreurs.length, 'aucune erreur de page', erreurs.join('\n'))
console.log(echecs ? `${echecs} échec(s)` : 'Explorer par pays : tout vert')
process.exit(echecs ? 1 : 0)
