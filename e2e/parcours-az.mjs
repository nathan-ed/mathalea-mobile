// Parcours de l'Explorer joués de A à Z comme un élève qui répond juste :
// fiche de cours, chaque question de chaque ceinture (bonne réponse saisie au
// toucher et au clavier, quel que soit le format : champ, trous, tableau,
// QCM, liste, champs multiples, glisser-déposer, figure à cliquer, sélection,
// champ dans une figure…), vérification, ceinture suivante ouverte par le vrai
// seuil, jusqu'au suivi. Un échec dit la question, son format, la réponse
// attendue et ce qui a été enregistré.
// La réponse attendue vient du moteur, régénérée à part avec la graine de la séance.
// Prérequis : pnpm dev et static/moteur.
//   node e2e/parcours-az.mjs [fichiers…]   (défaut : les parcours de explorer/)
//   PARCOURS=<id>[,<id>…] pour quelques parcours, APPAREIL=bureau pour une fenêtre d'ordinateur
//   CEINTURES=<n> : seulement les n premières ceintures (suivi avec des ceintures à obtenir)
//   FORMATS=1 node e2e/parcours-az.mjs e2e/formats-reponse.json : un exercice
//   par format de réponse de MathALÉA (docs/types-de-reponse.md)
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { pagePrete, SANS_BRIDAGE } from './attente.mjs'
import { attendues, bilanFormats, jouerSeance, lireSeance, raisonDe, repondre, toucher } from './eleve-repond.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const CAPTURES = process.env.CAPTURES
const fichiers = process.argv.slice(2).length ? process.argv.slice(2) : ['explorer/prequalifiant.json', 'explorer/evacom-revisions.json', 'explorer/ch-4e-college.json']
const appareil = process.env.APPAREIL ?? 'telephone'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
  return cond
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
// Après une action : on attend que la page soit prête (e2e/attente.mjs), jamais une durée
const pause = (page) => pagePrete(page)


async function eleve(nom, classe, parcours) {
  const options = appareil === 'bureau' ? { viewport: { width: 1280, height: 800 } } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  const ctx = await nav.newContext(options)
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  // Essai d'un moteur construit ailleurs (MOTEUR=<dossier>), sans toucher à static/moteur
  if (process.env.MOTEUR) await ctx.route('**/moteur/**', (r) => r.fulfill({ path: `${process.env.MOTEUR}/${new URL(r.request().url()).pathname.replace(/^\/moteur\//, '')}` }))
  const donnees = { profil: 'eleve', pays: 'CH', classes: [{ lien: 'http://127.0.0.1:9/az/', nom: classe, disponibles: [classe], parcours }] }
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, donnees)
  const page = await ctx.newPage()
  if (process.env.DEBUG) page.on('console', (m) => m.text().startsWith('[trace]') && console.log(m.text()))
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.goto(base)
  // Page séparée pour régénérer les exercices (réponses attendues) : son propre
  // contexte et le moteur seul, sans l'app. Une seconde app ouverte dans le
  // même contexte bridait la page de l'élève à une image par seconde
  // (chaque toucher attendait 2 à 7 s, novembre 2026)
  const contexteCalcul = await nav.newContext()
  const calcul = await contexteCalcul.newPage()
  await calcul.goto(`${base}moteur/manifest.json`)
  await calcul.evaluate(async () => {
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    await m.initialiser()
    m.definirLangue('fr-CH')
    window.__moteur = m
  })
  // Fermer l'élève ferme aussi sa page de calcul
  const fermer = ctx.close.bind(ctx)
  ctx.close = async () => {
    await contexteCalcul.close().catch(() => {})
    return fermer()
  }
  return { ctx, page, calcul, touche: appareil !== 'bureau' }
}


const capture = async (page, nom) => CAPTURES && page.screenshot({ path: `${CAPTURES}/${nom}.png` })

/** Délai maximal d'une séance : un format qui bloque ne bloque pas tout le reste */
const avecDelai = (promesse, ms, quoi) => Promise.race([promesse, new Promise((_, rejeter) => setTimeout(() => rejeter(new Error(`délai dépassé : ${quoi}`)), ms))])

// Mode formats (FORMATS=1) : chaque exercice du fichier joué seul, un résultat par format
if (process.env.FORMATS) {
  const tableau = []
  for (const f of fichiers)
    for (const classe of JSON.parse(readFileSync(f, 'utf8')).classes)
      for (const p of classe.parcours)
        for (const etape of p.etapes) {
          // FORMAT=dnd,qcm : seulement ces formats (premier mot du titre)
          if (process.env.FORMAT && !process.env.FORMAT.split(',').includes(etape.titre.split(' ')[0])) continue
          // CORRECTION=parcours : correction à la fin, la réponse doit survivre au
          // changement de question et à la soumission (brouillon puis relecture)
          const seul = { ...p, id: `format-${etape.uuid}`, titre: `Format ${etape.uuid}`, paliers: undefined, style: undefined, etapes: [etape], correction: process.env.CORRECTION ?? p.correction }
          const e = await eleve(seul.id, classe.nom, [seul])
          const erreursAvant = erreurs.length
          let problemes
          try {
            await toucher(e, e.page.getByRole('button', { name: new RegExp(`^\\s*${seul.titre}`) }).first())
            await pause(e.page, 600)
            await toucher(e, e.page.getByRole('button', { name: /^Commencer/ }).first())
            await e.page.locator('main .contenu-mathalea').first().waitFor({ timeout: 30000 })
            await pause(e.page, 1500)
            await capture(e.page, `format-${etape.titre.split(' ')[0]}`)
            // Largeur : rien ne doit dépasser l'écran (sinon une partie de la réponse est hors d'atteinte)
            // Ce qui dépasse doit rester atteignable : dans un cadre qui défile (la question, un tableau)
            const deborde = await e.page.evaluate(() =>
              [...document.querySelectorAll('main .contenu-mathalea *')]
                .filter((x) => x.getBoundingClientRect().right > innerWidth + 2)
                .filter((x) => { for (let p = x.parentElement; p; p = p.parentElement) if (/auto|scroll/.test(getComputedStyle(p).overflowX)) return false; return true })
                .map((x) => x.tagName.toLowerCase() + (x.id ? '#' + x.id : ''))
                .slice(0, 3),
            )
            const avantProblemes = deborde.length ? [`dépasse de l'écran : ${deborde.join(', ')}`] : []
            problemes = [...avantProblemes, ...(await avecDelai(jouerSeance(e, seul, etape.titre), 600000, etape.titre))]
          } catch (err) {
            if (process.env.DEBUG) console.log(err.stack)
            // Ce que le test attendait (ligne « waiting for » de Playwright), pas seulement « Timeout »
            const attente = err.message.split('\n').find((l) => l.includes('waiting for'))?.replace(/\x1b\[\d+m/g, '').trim()
            problemes = [`erreur : ${err.message.split('\n')[0]}${attente ? ` (${attente})` : ''}`]
            await capture(e.page, `format-${etape.uuid}-erreur`)
          }
          // Séance relue même si la page vient de se recharger (sinon « 0/0 correctes » sans message)
          let s = null
          for (let essai = 0; essai < 3 && !s; essai++) {
            s = await lireSeance(e.page, seul.id).catch(async (err) => {
              if (essai === 2) problemes.push(`séance illisible (${err.message.split('\n')[0]})`)
              await e.page.waitForLoadState('load').catch(() => {})
              await pause(e.page, 1000).catch(() => {})
              return null
            })
          }
          const essais = s?.essais ?? []
          if (process.env.DEBUG) console.log('seance', JSON.stringify({ brouillons: s?.brouillons, essais: essais.map((x) => [x.question, x.reponses]) }).slice(0, 1500))
          // Format dont la bonne réponse ne se saisit pas automatiquement : il suffit que
          // la réponse soit prise en compte (Vérifier actif) et vérifiée sans erreur
          // Aucune exemption : chaque format doit être saisi juste et compté correct
          // (Nathan, 31 octobre 2026 : « validables et validés et pris en compte »)
          if (etape.verifie) problemes.push(`exemption « ${etape.verifie} » interdite`)
          // Correction à la fin : chaque question répondue garde sa réponse jusqu'à la soumission
          if (process.env.CORRECTION === 'parcours') {
            const sansReponse = essais.filter((x) => !Object.keys(x.reponses ?? {}).length && !e.videsAttendus?.has(`${x.etape}-${x.question}`)).map((x) => `Q${x.question + 1}`)
            if (sansReponse.length) problemes.push(`réponse perdue avant la soumission : ${sansReponse.join(', ')}`)
          }
          // Un format sans aucune vérification enregistrée n'a rien prouvé
          if (!essais.length && !problemes.length) problemes.push('aucune vérification enregistrée')
          // Erreurs JavaScript de la page pendant ce format (rechargement, module introuvable…)
          for (const err of erreurs.slice(erreursAvant)) problemes.push(`erreur JavaScript : ${err.split('\n')[0]}`)
          const statut = problemes.length ? '✘' : '✔'
          const mode = e.restaurees ? ' (toucher, puis réponse écrite dans l’élément comme MathALÉA la restaure)' : ''
          tableau.push(`${statut} ${etape.titre} : ${essais.filter((x) => x.juste).length}/${essais.length} correctes${mode}${problemes.length ? '\n    ' + problemes.join('\n    ') : ''}`)
          console.log(tableau.at(-1))
          if (problemes.length) echecs++
          await e.ctx.close().catch(() => {})
        }
  await nav.close()
  console.log(echecs ? `${echecs} FORMAT(S) EN ÉCHEC` : 'TOUT VERT')
  process.exit(echecs ? 1 : 0)
}

for (const f of fichiers) {
  const fichier = JSON.parse(readFileSync(f, 'utf8'))
  for (const classe of fichier.classes) {
    for (const p of classe.parcours) {
      if (process.env.PARCOURS && !process.env.PARCOURS.split(',').includes(p.id)) continue
      // Parcours sans paliers : un seul passage de tous ses exercices
      const tousPaliers = p.paliers?.length > 1 ? p.paliers : [{ titre: p.titre, nb: p.etapes.length }]
      const paliers = process.env.CEINTURES ? tousPaliers.slice(0, Number(process.env.CEINTURES)) : tousPaliers
      console.log(`\n=== ${p.titre} (${p.id}, ${paliers.length} ceinture${paliers.length > 1 ? 's' : ''}, ${appareil})`)
      const e = await eleve(p.id, classe.nom, [p])
      const page = e.page
      await toucher(e, page.getByRole('button', { name: new RegExp(`^\\s*${p.titre.replace(/[()]/g, '.')}`) }).first())
      await pause(page, 800)
      await toucher(e, page.getByRole('button', { name: /^Commencer/ }).first())
      for (let k = 0; k < paliers.length; k++) {
        const nom = `ceinture ${k + 1} « ${paliers[k].titre} »`
        await pause(page, 800)
        // Fiche de cours d'abord (première fois)
        const fiche = page.getByRole('button', { name: 'Commencer l’entraînement' })
        if (await fiche.count()) {
          if (k === 0) await capture(page, `az-${p.id}-fiche`)
          await toucher(e, fiche)
        }
        const problemes = await jouerSeance(e, p, nom)
        const texteBilan = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
        const pourcent = /(\d+)\s*%/.exec(texteBilan)?.[1]
        ok(problemes.length === 0, `${p.id} ${nom} : toutes les bonnes réponses acceptées (${pourcent ?? '?'} %)`, '\n    ' + problemes.join('\n    '))
        if (k === 0) await capture(page, `az-${p.id}-bilan`)
        if (k + 1 < paliers.length) {
          const continuer = page.getByRole('button', { name: /^Continuer : / })
          if (!ok(await continuer.count(), `${p.id} ${nom} : la ceinture suivante s'ouvre`, texteBilan.slice(0, 300))) break
          await toucher(e, continuer)
        }
      }
      // Suivi : les ceintures obtenues apparaissent
      for (let i = 0; i < 4 && !(await page.getByRole('tab', { name: /Suivi/ }).count()); i++) {
        await page.goBack()
        await pause(page, 500)
      }
      const onglet = page.getByRole('tab', { name: /Suivi/ }).or(page.getByRole('button', { name: /^Suivi$/ }))
      if (await onglet.count()) {
        await toucher(e, onglet.first())
        await pause(page, 800)
        const suivi = await page.locator('body').innerText()
        ok(suivi.includes(p.titre), `${p.id} : le parcours figure dans le suivi`)
        await capture(page, `az-${p.id}-suivi`)
        // Onglet Ceintures (parcours en ceintures seulement ; en paliers, pas de ceinture) :
        // obtenues en couleur, les autres en contour
        const ceintures = page.getByRole('button', { name: 'Ceintures', exact: true }).or(page.getByRole('tab', { name: 'Ceintures', exact: true }))
        if (p.style === 'ceintures' && tousPaliers.length > 1 && ok(await ceintures.count(), `${p.id} : onglet Ceintures du suivi`)) {
          await toucher(e, ceintures.first())
          await pause(page, 500)
          const obtenues = await page.locator('[aria-label$=" : obtenue"]').count()
          ok(obtenues === paliers.length, `${p.id} : ${paliers.length} ceinture(s) obtenue(s) dans le suivi (${obtenues})`)
          await capture(page, `az-${p.id}-ceintures`)
        }
      } else ok(false, `${p.id} : onglet Suivi introuvable`)
      await e.ctx.close()
    }
  }
}

console.log('\nFormats rencontrés :', JSON.stringify(bilanFormats))
ok(erreurs.length === 0, 'aucune erreur JavaScript', erreurs.slice(0, 10).join('\n'))
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
