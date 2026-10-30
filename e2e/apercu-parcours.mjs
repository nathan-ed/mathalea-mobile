// Aperçu d'un parcours pour le relire : pour chaque ceinture, dans l'ordre de
// passage, la fiche de cours (toutes ses étapes dévoilées) puis chaque question
// telle que l'élève la voit (téléphone, 390 px), avec la ceinture et l'exercice
// indiqués. Sert à valider la progression de la difficulté avant de diffuser.
// Prérequis : pnpm dev et static/moteur.
//   node e2e/apercu-parcours.mjs <fichier.json> [id du parcours…]
// Sortie (APERCUS, défaut apercus/) : <id>/NN-…png dans l'ordre, une planche
// par ceinture (<id>/planche-k.png) et <id>/index.html.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const [fichier, ...ids] = process.argv.slice(2)
if (!fichier) {
  console.log('node e2e/apercu-parcours.mjs <fichier.json> [id…]')
  process.exit(1)
}
const racine = process.env.APERCUS ?? 'apercus'
const pays = process.env.PAYS ?? 'CH'
const donnees = JSON.parse(readFileSync(fichier, 'utf8'))
const tous = donnees.classes ? donnees.classes.flatMap((c) => c.parcours) : donnees.parcours ? donnees.parcours : [donnees]
const choisis = ids.length ? tous.filter((p) => ids.includes(p.id)) : tous
const CEINTURES = ['blanche', 'jaune', 'orange', 'verte', 'bleue', 'marron', 'noire']
const COULEURS = ['#f5f5f4', '#facc15', '#f97316', '#16a34a', '#2563eb', '#78350f', '#1c1917']
const nomCeinture = (p, k) => {
  if (p.style !== 'ceintures') return `Palier ${k + 1}`
  const r = (p.premiereCeinture ?? 0) + k
  return r < CEINTURES.length ? `Ceinture ${CEINTURES[r]}` : `Ceinture noire ${r - CEINTURES.length + 2}e dan`
}
const couleur = (p, k) => COULEURS[Math.min((p.premiereCeinture ?? 0) + k, COULEURS.length - 1)]
const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const pause = (page, ms) => page.waitForTimeout(ms)

for (const original of choisis) {
  // Copie : toutes les ceintures ouvertes, pour les capturer sans les réussir
  const p = { ...original, paliers: (original.paliers ?? [{ titre: '', nb: original.etapes.length }]).map((x) => ({ ...x, acces: 'libre', ouverture: undefined })) }
  const dossier = `${racine}/${p.id}`
  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })
  console.log(`=== ${p.titre} (${p.id})`)
  const elements = [] // { ceinture, fichier, legende }
  let n = 0
  let debut = 0
  for (let k = 0; k < p.paliers.length; k++) {
    const palier = p.paliers[k]
    const etapes = p.etapes.slice(debut, debut + palier.nb)
    debut += palier.nb
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
    await ctx.addInitScript((d) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      for (const [c, v] of Object.entries(d)) localStorage.setItem(`copie:${c}`, JSON.stringify(v))
    }, { profil: 'eleve', pays, classes: [{ lien: 'http://127.0.0.1:9/apercu/', nom: 'Aperçu', disponibles: ['Aperçu'], parcours: [p] }] })
    const page = await ctx.newPage()
    await page.goto(base)
    await page.getByRole('button', { name: new RegExp(`^\\s*${p.titre.replace(/[()[\]]/g, '.')}`) }).first().click()
    await pause(page, 800)
    // Bouton de la ceinture k sur la page du parcours (un par carte de ceinture)
    await page.getByRole('button', { name: /^(Commencer|Refaire|Continuer)( cette ceinture| ce palier)?$/ }).nth(k).click()
    await pause(page, 1200)
    const ceinture = `${nomCeinture(p, k)} · ${palier.titre}`
    // Fiche de cours : toutes les étapes dévoilées
    const fiche = page.getByRole('button', { name: 'Commencer l’entraînement' })
    if (await fiche.count()) {
      for (let i = 0; i < 40; i++) {
        const suite = page.getByRole('button', { name: /^(Voir la première étape|Étape suivante)$/ })
        if (!(await suite.count())) break
        await suite.first().click()
        await pause(page, 150)
      }
      // Questions « À toi » : la bonne réponse, pour voir l'explication donnée à l'élève
      const questions = (palier.fiche?.blocs ?? []).filter((b) => b.type === 'question')
      const sections = page.getByRole('region', { name: 'À toi' })
      for (let i = 0; i < Math.min(questions.length, await sections.count()); i++) {
        const b = questions[i]
        const sct = sections.nth(i)
        if (b.choix) await sct.getByRole('radio').nth(b.bonne).click()
        else if (b.reponse !== undefined) {
          await sct.locator('input').fill(String(b.reponse).replace('.', ','))
          await sct.getByRole('button', { name: 'Vérifier' }).click()
        }
        await pause(page, 200)
      }
      const nom = `${String(++n).padStart(2, '0')}-${slug(nomCeinture(p, k))}-fiche.png`
      await page.screenshot({ path: `${dossier}/${nom}`, fullPage: true })
      elements.push({ k, ceinture, fichier: nom, legende: `Fiche : ${palier.fiche?.titre ?? palier.titre}` })
      await fiche.click()
    }
    await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 30000 })
    await pause(page, 1500)
    const s = await page.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), p.id)
    const total = await page.locator('[role=tablist][aria-label=Questions] [role=tab]').count() || 1
    for (let q = 0; q < total; q++) {
      if (q > 0) {
        await page.locator('[role=tablist][aria-label=Questions] [role=tab]').nth(q).click()
        await pause(page, 1500)
      }
      // Pas de clavier ouvert sur la capture
      await page.evaluate(() => document.activeElement?.blur?.())
      await pause(page, 400)
      // Exercice de la question, lu dans les identifiants (titres masqués pour l'élève)
      const rang = await page.locator('main .contenu-mathalea').first().evaluate((z) => {
        const m = /Ex(\d+)[QF]\d+/.exec([...z.querySelectorAll('[id]')].map((x) => x.id).join(' '))
        return m ? Number(m[1]) : -1
      })
      const e = s.contenu.etapes[rang] ?? etapes[0]
      const titre = (e.titre ?? '').replace(/\$/g, '')
      const nom = `${String(++n).padStart(2, '0')}-${slug(nomCeinture(p, k))}-q${String(q + 1).padStart(2, '0')}-${slug(e.id)}.png`
      await page.screenshot({ path: `${dossier}/${nom}`, fullPage: true })
      elements.push({ k, ceinture, fichier: nom, legende: `Question ${q + 1}/${total} · ${e.id} · ${titre}` })
    }
    console.log(`  ${ceinture} : ${total} questions`)
    await ctx.close()
  }

  // Index et planches : une section par ceinture, dans l'ordre de passage
  const sections = p.paliers.map((palier, k) => ({ k, titre: `${nomCeinture(p, k)} · ${palier.titre}`, items: elements.filter((x) => x.k === k) }))
  const page = (liste, avecTitre) => `<!doctype html><meta charset="utf-8"><title>${p.titre}</title>
<style>body{font-family:system-ui,sans-serif;margin:16px;background:#fff;color:#222}h1{font-size:20px}h2{font-size:17px;display:flex;align-items:center;gap:8px;margin-top:28px}
.c{display:inline-block;width:32px;height:14px;border:1px solid #999;border-radius:3px}.g{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
figure{margin:0;width:260px}img{width:260px;border:1px solid #ddd;border-radius:8px}figcaption{font-size:12px;margin-top:4px}</style>
${avecTitre ? `<h1>${p.titre} (${p.id}, version ${p.version})</h1>` : ''}
${liste.map((sct) => `<h2><span class="c" style="background:${couleur(p, sct.k)}"></span>${sct.titre}</h2><div class="g">${sct.items.map((x) => `<figure><img src="${x.fichier}"><figcaption>${x.legende}</figcaption></figure>`).join('')}</div>`).join('\n')}`
  writeFileSync(`${dossier}/index.html`, page(sections, true))
  const vue = await (await nav.newContext({ viewport: { width: 1400, height: 900 } })).newPage()
  for (const sct of sections) {
    writeFileSync(`${dossier}/planche-${sct.k + 1}.html`, page([sct], false))
    await vue.goto(`file://${process.cwd()}/${dossier}/planche-${sct.k + 1}.html`)
    await vue.waitForTimeout(300)
    await vue.screenshot({ path: `${dossier}/planche-${sct.k + 1}.png`, fullPage: true })
    rmSync(`${dossier}/planche-${sct.k + 1}.html`)
  }
  await vue.context().close()
  console.log(`  → ${dossier}/index.html, ${sections.length} planches`)
}
await nav.close()
