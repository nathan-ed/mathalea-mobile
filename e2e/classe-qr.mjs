// QR code de classe : le lien du dossier partagé de l'enseignant (avec
// « ?classe=… »), préparé sur le site MathALÉA. Un élève qui n'a rien ajouté le
// scanne depuis l'accueil (fausse caméra de Chromium) : le dossier est ajouté,
// sa classe déjà choisie. Sans classe dans le lien, l'élève choisit. L'ancien
// format MACLA1. (QR codes de l'app enseignant jusqu'à la 0.5) est encore lu.
// Une classe absente du drive est signalée sans rien ajouter.
//   CAPTURES=<dossier> node e2e/classe-qr.mjs
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pagePrete } from './attente.mjs'
import { appareil, imageQr, lienKdrive, lireStockage, SCANNER, videoDe } from './camera-qr.mjs'

const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(process.env.TMPDIR_E2E ?? tmpdir(), 'classe-qr-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcoursDe = (id, titre) => ({
  id,
  version: 1,
  titre,
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [{ uuid: 'cbc26', id: '5N2G', titre: 'Additionner des relatifs', nbQuestions: 2 }],
})
// Dossier partagé de l'enseignant : deux classes dans le même fichier
const UUID = '2b7e1d4c-5a3f-4e9b-8c21-6f0d9a7b3e52'
const lien = lienKdrive(UUID)
const contenus = {
  [UUID]: () =>
    JSON.stringify({
      format: 'classes-mathalea/1',
      exporteLe: new Date().toISOString(),
      classes: [
        { nom: '5A', parcours: [parcoursDe('classe-qr-a', 'Relatifs de la 5A')] },
        { nom: '5B', parcours: [parcoursDe('classe-qr-b', 'Relatifs de la 5B')] },
      ],
    }),
}
const ancien = (o) => 'MACLA1.' + Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const camera = (texte, nom) => videoDe(imageQr(texte, join(dossier, `${nom}.gif`)), dossier, nom)
const navs = []
async function eleve(nom, texte, options = {}) {
  const r = await appareil({ nom, video: camera(texte, nom), contenus, erreurs, ...options })
  navs.push(r.nav)
  return r.page
}
const classes = (page) => lireStockage(page, 'classes', [])

// ---------- Lien du dossier avec ?classe=5B : directement la 5B ----------
const a = await eleve('a', `${lien}?classe=5B`)
await a.screenshot({ path: `${captures}/classe-qr-1-accueil.png` })
await a.getByRole('button', { name: SCANNER }).click()
await a.getByText('Relatifs de la 5B').first().waitFor({ timeout: 30_000 })
let ca = await classes(a)
ok(ca.length === 1 && ca[0].lien === lien && ca[0].nom === '5B', `lien avec classe : dossier ajouté, classe ${ca[0]?.nom} choisie`)
ok(!(await a.getByText('Relatifs de la 5A').count()) && !(await a.getByRole('dialog').count()), 'seulement les parcours de sa classe, scanner refermé')
await pagePrete(a)
await a.screenshot({ path: `${captures}/classe-qr-2-classe-ajoutee.png` })
await a.reload()
await a.getByText('Relatifs de la 5B').first().waitFor({ timeout: 30_000 })
ok(true, 'la classe reste après un nouveau lancement')
// Le même QR code scanné à nouveau : rien en double
await a.getByRole('button', { name: SCANNER }).click()
await a.getByRole('dialog').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {})
await pagePrete(a)
ca = await classes(a)
ok(ca.length === 1 && ca[0].nom === '5B', 'scanné une seconde fois : toujours une seule classe')

// ---------- Lien du dossier sans classe : l'élève choisit ----------
// Depuis le bouton de l'écran vide, sous le champ du lien
const d = await eleve('d', lien)
await d.getByRole('button', { name: 'Scanner le QR code de ma classe' }).click()
await d.getByRole('button', { name: '5A', exact: true }).first().waitFor({ timeout: 30_000 })
let cd = await classes(d)
ok(cd.length === 1 && cd[0].lien === lien && cd[0].nom === '' && cd[0].disponibles.join() === '5A,5B', 'dossier sans classe : ajouté, l’élève choisit sa classe')
await pagePrete(d)
await d.screenshot({ path: `${captures}/classe-qr-3-choix.png` })
await d.getByRole('button', { name: '5A', exact: true }).first().click()
await d.getByText('Relatifs de la 5A').first().waitFor({ timeout: 30_000 })
cd = await classes(d)
ok(cd[0]?.nom === '5A' && !(await d.getByText('Relatifs de la 5B').count()), 'classe 5A choisie, ses parcours seulement')

// ---------- Ancien QR code (MACLA1.), bureau en sombre ----------
const m = await eleve('m', ancien({ l: lien, c: '5A' }), { bureau: true })
await m.getByRole('button', { name: SCANNER }).click()
await m.getByText('Relatifs de la 5A').first().waitFor({ timeout: 30_000 })
const cm = await classes(m)
ok(cm.length === 1 && cm[0].lien === lien && cm[0].nom === '5A', 'ancien QR code de classe (MACLA1.) : classe 5A ajoutée')
await pagePrete(m)
await m.screenshot({ path: `${captures}/classe-qr-4-ancien-bureau-sombre.png` })

// ---------- Classe pas encore sur le drive ----------
const c = await eleve('c', `${lien}?classe=5C`)
await c.getByRole('button', { name: SCANNER }).click()
await c.getByText('La classe 5C n’est pas encore sur le drive de l’enseignant.').waitFor({ timeout: 30_000 })
await c.screenshot({ path: `${captures}/classe-qr-5-absente.png` })
await c.goBack()
await c.getByRole('dialog').waitFor({ state: 'detached' })
ok(!(await classes(c)).length, 'classe absente du drive : l’élève est prévenu, rien n’est ajouté ; retour referme le scanner')

// ---------- Un QR code qui n'est pas de MathALÉA ----------
const x = await eleve('x', 'Bonjour, ceci n’est pas un QR code de MathALÉA')
await x.getByRole('button', { name: SCANNER }).click()
await x.getByText('Ce n’est pas un QR code de session ou de classe MathALÉA.').waitFor({ timeout: 30_000 })
await x.getByRole('button', { name: 'Annuler' }).click()
ok(!(await classes(x)).length && !(await x.getByRole('dialog').count()), 'autre QR code : message, Annuler referme, rien n’est ajouté')

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await Promise.all(navs.map((n) => n.close()))
rmSync(dossier, { recursive: true, force: true })
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
