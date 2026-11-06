// Mise à jour de l'app : les données laissées par une version publiée
// (e2e/donnees/<version>-<qui>.json, écrites par e2e/donnees/creer.mjs dans
// cette version) sont ouvertes par la version courante. Rien de perdu, comme
// un élève le verrait : parcours du dossier, séance quittée en cours reprise
// à sa question, parcours terminé et ceinture obtenue dans le suivi ;
// ancien enseignant : ouverte en élève, bibliothèque exportable depuis les
// Réglages. La sauvegarde exportée garde
// toutes les clés. Aucune erreur de page. Téléphone (clair), bureau (sombre).
// Le stockage sert seulement à poser l'état de départ (règle des suites).
//   CAPTURES=<dossier> node e2e/mise-a-jour.mjs [fichiers…]
import { readdirSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { jusqua, pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = new URL('./donnees/', import.meta.url)
const fichiers = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dossier).filter((f) => f.endsWith('.json')).map((f) => new URL(f, dossier).pathname)
let echecs = 0
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const texte = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
async function toucher(page, bouton) {
  await bouton.scrollIntoViewIfNeeded()
  await pointStable(bouton)
  await bouton.click()
  await pagePrete(page)
}
const onglet = (page, nom) => page.getByRole('tab', { name: nom, exact: true })
const titreDe = (d, id) => {
  for (const c of d.classes ?? []) for (const p of c.parcours ?? []) if (p.id === id) return p.titre
  for (const pe of d.bibliotheque?.parcours ?? []) if (pe.parcours.id === id) return pe.parcours.titre
  return d[`seance:${id}`]?.contenu?.titre ?? id
}

const appareils = [
  { nom: 'téléphone clair', theme: 'clair', options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  { nom: 'bureau sombre', theme: 'sombre', options: { viewport: { width: 1280, height: 800 } } },
]

for (const f of fichiers) {
  const { version, qui, donnees } = JSON.parse(readFileSync(f, 'utf8'))
  for (const a of appareils) {
    const nom = `${version} ${qui}, ${a.nom}`
    const s = `${version}-${qui}${a.theme === 'sombre' ? '-sombre' : ''}`
    const ctx = await nav.newContext({ ...a.options, colorScheme: a.theme === 'sombre' ? 'dark' : 'light', acceptDownloads: true })
    // Aucun réseau : le drive de l'élève est injoignable, sa copie fait foi
    await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) && !new URL(r.request().url()).pathname.startsWith('/__telecharger') ? r.continue() : r.abort()))
    await ctx.addInitScript(([theme, d]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      for (const [cle, valeur] of Object.entries(d)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
    }, [a.theme, donnees])
    const page = await ctx.newPage()
    const erreurs = []
    page.on('pageerror', (e) => erreurs.push(e.message))
    await page.goto(base)
    await pagePrete(page)
    await page.getByRole('button', { name: 'Réglages' }).first().waitFor({ timeout: 60_000 })
    await pagePrete(page)

    if (qui === 'eleve') {
      const accueil = await texte(page)
      const ids = (donnees.classes ?? []).flatMap((c) => (c.parcours ?? []).map((p) => p.id))
      const absents = ids.filter((id) => !accueil.includes(titreDe(donnees, id)))
      ok(!absents.length, `${nom} : les parcours du dossier sont sur l'accueil`, absents.join(', '))
      await page.screenshot({ path: `${captures}/mise-a-jour-${s}-accueil.png` })

      // Séance quittée en cours : reprise à sa question
      // En cours : séance sans fin (comme resumes de +page.svelte)
      const enCours = Object.entries(donnees).filter(([k, v]) => k.startsWith('seance:') && v && !v.fin)
      for (const [cle, seance] of enCours) {
        const id = cle.slice('seance:'.length)
        const titre = titreDe(donnees, id)
        ok(/En cours/.test(accueil), `${nom} : « ${titre} » en cours sur l'accueil`)
        // Tuile « En cours » : droit dans la séance ; sinon la page du parcours et « Continuer »
        await toucher(page, page.getByRole('button', { name: new RegExp(`^\\s*${titre}`) }).first())
        const question = page.locator('main .contenu-mathalea').first()
        const continuer = page.getByRole('button', { name: /^(Continuer|Reprendre)/ }).first()
        await question.or(continuer).waitFor({ timeout: 60_000 })
        if (!(await question.isVisible().catch(() => false))) await toucher(page, continuer)
        await question.waitFor({ timeout: 60_000 })
        await pagePrete(page)
        const rang = (seance.position ?? 0) + 1
        const t = await texte(page)
        if (seance.contenu?.presentation === 'une_question_par_page') {
          ok(new RegExp(`Question ${rang} sur \\d+`).test(t), `${nom} : « ${titre} » reprend à la question ${rang}`, t.slice(0, 160))
        } else {
          // Un exercice par page : l'onglet de l'exercice qui contient la question
          let reste = seance.position ?? 0
          let exo = 0
          for (const etape of seance.etapes) {
            if (reste < (seance.nbQuestions?.[etape] ?? 0)) break
            reste -= seance.nbQuestions?.[etape] ?? 0
            exo++
          }
          const actif = await page.locator('[role=tab][aria-selected=true]').first().getAttribute('aria-label').catch(() => '')
          ok(actif === `Exercice ${exo + 1}`, `${nom} : « ${titre} » reprend à l'exercice ${exo + 1} (question ${rang})`, `onglet actif : ${actif}`)
        }
        await page.screenshot({ path: `${captures}/mise-a-jour-${s}-reprise.png` })
        await toucher(page, page.getByRole('button', { name: 'Quitter' }))
        const plusTard = page.getByRole('button', { name: 'Reprendre plus tard' })
        if (await plusTard.isVisible().catch(() => false)) await toucher(page, plusTard)
        for (let i = 0; i < 3 && !(await onglet(page, 'Suivi').isVisible().catch(() => false)); i++) {
          await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
          await pagePrete(page)
        }
      }

      // Suivi : parcours terminés et ceintures
      await toucher(page, onglet(page, 'Suivi'))
      const suivi = await texte(page)
      const termines = Object.entries(donnees).filter(([k, v]) => k.startsWith('historique:') && Array.isArray(v) && v.length).map(([k]) => titreDe(donnees, k.slice('historique:'.length)))
      const manquants = termines.filter((t) => !suivi.includes(t))
      ok(termines.length > 0 && !manquants.length, `${nom} : passages terminés dans le suivi (${termines.join(', ')})`, manquants.join(', '))
      await page.screenshot({ path: `${captures}/mise-a-jour-${s}-suivi.png` })
      const ceintures = page.getByRole('tab', { name: 'Ceintures' }).or(page.getByRole('button', { name: 'Ceintures', exact: true })).first()
      if (await ceintures.isVisible().catch(() => false)) {
        await toucher(page, ceintures)
        await page.screenshot({ path: `${captures}/mise-a-jour-${s}-ceintures.png` })
        // Ceinture obtenue dans l'ancienne version (résultat complet d'un palier)
        const obtenue = Object.entries(donnees).some(([k, v]) => k.startsWith('resultats:') && Object.values(v).some((r) => r.complet && r.points / r.sur >= 0.8))
        if (obtenue) ok(/Ceinture la plus haute : \S+/.test(await texte(page)), `${nom} : ceinture obtenue gardée (${/Ceinture la plus haute : (\S+)/.exec(await texte(page))?.[1]})`)
      }
    } else {
      // Ancien enseignant (mode retiré en 0.6) : l'app s'ouvre en élève et sa
      // bibliothèque s'exporte depuis les Réglages, pour le site MathALÉA
      const bib = (donnees.bibliotheque?.parcours ?? []).map((pe) => pe.parcours.titre)
      ok(await onglet(page, 'Mes parcours').isVisible(), `${nom} : ouverte en élève`)
      await page.screenshot({ path: `${captures}/mise-a-jour-${s}-accueil.png` })
      await toucher(page, page.getByRole('button', { name: 'Réglages' }).first())
      const bouton = page.getByRole('button', { name: 'Exporter ma bibliothèque' })
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), toucher(page, bouton)])
      const fichier = readFileSync(await dl.path(), 'utf8')
      const exportes = (JSON.parse(fichier).bibliotheque?.parcours ?? []).map((pe) => pe.parcours?.titre ?? pe.titre)
      const absents = bib.filter((x) => !exportes.includes(x))
      ok(bib.length > 0 && !absents.length, `${nom} : bibliothèque exportée entière (${bib.length} parcours, ${dl.suggestedFilename()})`, absents.join(', '))
      await page.screenshot({ path: `${captures}/mise-a-jour-${s}-reglages.png` })
      await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
      await pagePrete(page)
    }

    // Sauvegarde exportée : toutes les clés d'origine y sont
    await toucher(page, page.getByRole('button', { name: 'Réglages' }).first())
    const exporter = page.getByRole('button', { name: 'Exporter une sauvegarde' })
    const [telechargement] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), toucher(page, exporter)])
    const sauvegarde = JSON.parse(readFileSync(await telechargement.path(), 'utf8'))
    const gardees = Object.keys(sauvegarde.donnees ?? {})
    const perdues = Object.keys(donnees).filter((k) => !gardees.includes(k) && !['cle-ia', 'ecran'].includes(k))
    ok(!perdues.length, `${nom} : sauvegarde exportée, aucune clé perdue (${gardees.length})`, perdues.join(', '))
    ok(!erreurs.length, `${nom} : aucune erreur de page`, erreurs.join(' | '))
    await ctx.close()
  }
}
await nav.close()
console.log(echecs ? `${echecs} échec(s)` : 'Mise à jour : tout vert')
process.exit(echecs ? 1 : 0)
