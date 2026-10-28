// Recette : un enseignant crée cinq parcours variés sur le site MathALÉA
// (?v=parcours, serveur local), les donne à deux classes et publie le fichier.
//   SITE=http://localhost:5197/alea/ node e2e/.recette-site.mjs <sortie.json>
import { chromium } from 'playwright'
import { rmSync } from 'node:fs'

const site = process.env.SITE ?? 'http://localhost:5197/alea/'
const sortie = process.argv[2] ?? '/tmp/recette/parcours-mathalea.json'
const caps = process.env.CAPTURES ?? '/tmp/recette'
const profil = '/tmp/recette/profil-site'
rmSync(profil, { recursive: true, force: true })
const ctx = await chromium.launchPersistentContext(profil, { executablePath: '/usr/bin/chromium', viewport: { width: 1280, height: 900 }, acceptDownloads: true })
const p = ctx.pages()[0] ?? (await ctx.newPage())
const erreurs = []
p.on('pageerror', (e) => erreurs.push(e.message))
let echecs = 0
const ok = (c, m) => {
  if (!c) echecs++
  console.log(c ? '✔' : '✘', m)
}

const PARCOURS = [
  {
    titre: 'Relatifs : additions et comparaisons', niveau: '5e', chapitre: 'Nombres relatifs', type: 'Entraînement', but: 'Additionner et comparer des nombres relatifs.',
    organisation: 'Liste simple', pages: 'Une page par question', correction: 'Après chaque question', entetes: true, melanger: true,
    groupes: [{ exos: [['5N1D', 3], ['5N2A', 2], ['5N2F', 2], ['5N2B', 2]] }],
  },
  {
    titre: 'Puissances en trois paliers', niveau: '4e', chapitre: 'Puissances', type: 'Approfondissement', but: 'Calculer avec des puissances.',
    organisation: 'Paliers', pages: 'Une page par exercice', correction: 'À la fin de chaque page', entetes: true, melanger: false,
    groupes: [
      { titre: 'Échauffement', exos: [['4C10', 2], ['4C10-0', 2]], ressource: ['Revoir les relatifs', 'https://coopmaths.fr/alea/'], pause: 'Bravo ! Le palier suivant demande au moins 80 %.' },
      { titre: 'Calculs', acces: '80', exos: [['4C11', 2], ['4C21', 2]] },
      { titre: 'Défi', acces: 'libre', exos: [['4C22', 2]] },
    ],
  },
  {
    titre: 'Géométrie à ceintures', niveau: '6e', chapitre: 0, type: 'Découverte', but: 'Lire des figures.',
    organisation: 'Ceintures', premiere: 'Jaune', pages: 'Une page par question', correction: 'Après chaque question', entetes: false, melanger: true,
    groupes: [
      { titre: 'Angles et droites', exos: [['6AutoG1', 2]] },
      { titre: 'Figures à compléter', acces: '60', exos: [['6AutoG3', 2]] },
      { titre: 'Aires', acces: '60', exos: [['6AutoA1-1', 2]] },
    ],
  },
  {
    titre: 'Dates d’ouverture', niveau: '3e', chapitre: 0, type: 'Entraînement', but: 'Un palier par semaine.',
    organisation: 'Paliers', pages: 'Une page par question', correction: 'Après chaque question', entetes: true, melanger: true,
    groupes: [
      { titre: 'Tout de suite', exos: [['3AutoN01', 2]] },
      { titre: 'Demain', acces: 'libre', date: '2026-10-28', exos: [['3AutoG02', 2]] },
      { titre: 'Depuis hier', acces: '50', date: '2026-10-26', exos: [['3A10-7', 2]] },
    ],
  },
  {
    titre: 'Seconde : tout sur une page', niveau: '2e', chapitre: 0, type: 'Entraînement', but: 'Réviser l’année de seconde.',
    organisation: 'Liste simple', pages: 'Tous les exercices sur une page', correction: 'À la fin du parcours', entetes: true, melanger: false,
    fiche: { titre: 'Rappels de seconde', texte: 'Une fraction s’écrit $\\dfrac{a}{b}$ avec $b \\neq 0$.', retenir: 'On ne divise jamais par zéro.', question: 'Combien vaut $2 \\times 3$ ?', choix: ['5', '6'] },
    groupes: [{ exos: [['2A-N2-1', 2], ['2A-A01-1', 2], ['2N12-3', 2], ['2A-A01-3', 1]] }],
  },
]

await p.goto(site + '?v=parcours', { timeout: 240000 })
await p.getByRole('button', { name: /Créer un parcours|Nouveau parcours/ }).first().waitFor({ timeout: 240000 })

async function ajouterExercices(groupe, exos) {
  await groupe.getByRole('button', { name: 'Ajouter des exercices' }).click()
  for (const [id] of exos) {
    await p.getByPlaceholder(/Thème, identifiant/).fill(id)
    const ligne = p.locator(`xpath=//*[normalize-space(text())="${id}"]/ancestor::*[.//button[starts-with(@title,"Ajouter cet exercice")]][1]//button[starts-with(@title,"Ajouter cet exercice")]`).first()
    await ligne.waitFor({ timeout: 30000 })
    await p.waitForTimeout(800)
    await ligne.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await p.waitForTimeout(300)
    await ligne.click()
    await p.waitForTimeout(400)
    console.log('  +', id)
  }
  await p.getByRole('button', { name: 'Valider', exact: true }).click()
  for (const [id, nb] of exos) {
    const champ = p.getByLabel(`Nombre de questions de l’exercice ${id}`, { exact: true })
    await champ.waitFor({ timeout: 15000 })
    await champ.fill(String(nb))
    await champ.press('Tab')
  }
}

for (const [n, d] of PARCOURS.entries()) {
  await p.getByRole('button', { name: /Créer un parcours|Nouveau parcours/ }).first().click()
  await p.locator('label:has-text("Titre") input').first().fill(d.titre)
  await p.locator('label:has-text("Niveau") select').first().selectOption(d.niveau)
  await p.waitForTimeout(500)
  const puces = p.getByRole('radiogroup', { name: `Chapitres de MathALÉA en ${d.niveau}` }).getByRole('radio')
  if (typeof d.chapitre === 'number') await puces.nth(d.chapitre).click()
  else await puces.filter({ hasText: new RegExp(`^${d.chapitre}$`) }).click()
  await p.getByRole('radiogroup', { name: 'Type' }).getByRole('radio', { name: d.type }).click()
  await p.locator('label:has-text("But du parcours") input').fill(d.but)
  await p.getByRole('radiogroup', { name: 'Organisation des exercices' }).getByRole('radio', { name: d.organisation }).click()
  if (d.premiere) await p.getByRole('radiogroup', { name: 'Première ceinture' }).getByRole('radio', { name: d.premiere }).click()
  const avecPaliers = d.organisation !== 'Liste simple'
  const groupes = avecPaliers ? p.locator('[role=group][aria-label^="Palier "]') : p.locator('[role=group][aria-label="Exercices du parcours"]')
  for (let i = 0; avecPaliers && (await groupes.count()) < d.groupes.length && i < 6; i++) {
    await p.getByRole('button', { name: /^\s*Ajouter (un palier|la )/ }).click()
    await p.waitForTimeout(200)
  }
  for (const [k, g] of d.groupes.entries()) {
    const groupe = groupes.nth(k)
    await ajouterExercices(groupe, g.exos)
    if (!avecPaliers) continue
    await groupe.locator('input').first().fill(g.titre)
    if (g.acces) await groupe.locator('select[aria-label^="Accès à"]').selectOption(g.acces)
    if (g.date) await groupe.locator('input[type=date]').fill(g.date)
    if (g.ressource) {
      await groupe.locator('summary', { hasText: 'Ressource pour revoir' }).click()
      const champs = groupe.locator('details input')
      await champs.nth(0).fill(g.ressource[0])
      await champs.nth(0).press('Tab')
      await champs.nth(1).fill(g.ressource[1])
      await champs.nth(1).press('Tab')
    }
    if (g.pause) {
      await p.getByRole('button', { name: `Ajouter une pause après le palier ${k + 1}` }).click()
      await p.locator(`#pause-${k} textarea`).fill(g.pause)
    }
  }
  if (d.fiche) {
    await p.getByRole('button', { name: 'Ajouter une fiche de cours' }).first().click()
    await p.locator('label:has-text("Titre de la fiche") input').fill(d.fiche.titre)
    await p.getByRole('button', { name: 'Texte', exact: true }).click()
    await p.getByRole('textbox', { name: 'Texte', exact: true }).last().fill(d.fiche.texte)
    await p.getByRole('textbox', { name: 'Texte', exact: true }).last().press('Tab')
    await p.getByRole('button', { name: 'À retenir', exact: true }).click()
    await p.getByRole('textbox', { name: 'Contenu', exact: true }).last().fill(d.fiche.retenir)
    await p.getByRole('textbox', { name: 'Contenu', exact: true }).last().press('Tab')
    await p.getByRole('button', { name: 'Question', exact: true }).click()
    await p.getByRole('textbox', { name: 'Question (non notée)' }).last().fill(d.fiche.question)
    await p.getByRole('textbox', { name: 'Question (non notée)' }).last().press('Tab')
    await p.getByRole('textbox', { name: 'Proposition 1' }).fill(d.fiche.choix[0])
    await p.getByRole('textbox', { name: 'Proposition 2' }).fill(d.fiche.choix[1])
    await p.getByRole('radio', { name: 'Bonne réponse : proposition 2' }).check()
    await p.waitForTimeout(600)
    await p.screenshot({ path: `${caps}/site-fiche.png` })
    const reste = await p.getByText('À compléter', { exact: true }).isVisible().catch(() => false)
    ok(!reste, `fiche complète${reste ? ' : ' + (await p.locator('body').innerText()).match(/À compléter[\s\S]{0,200}/)?.[0] : ''}`)
    await p.getByRole('button', { name: 'Fermer', exact: true }).click()
  }
  await p.locator('label:has-text("Pages") select').selectOption({ label: d.pages })
  await p.locator('label:has-text("Validation et correction") select').selectOption({ label: d.correction })
  await p.locator('label:has-text("Afficher les exercices") input').setChecked(d.entetes)
  if (d.pages !== 'Une page par exercice') await p.locator('label:has-text("Mélanger les questions") input').setChecked(d.melanger)
  await p.waitForTimeout(500)
  const statut = await p.locator('footer [role=status]').innerText()
  ok(statut.includes('Prêt'), `${d.titre} : ${statut.trim()}`)
  const ids = d.groupes.flatMap((g) => g.exos.map(([id]) => id))
  for (const id of ids) ok(await p.getByRole('button', { name: `Retirer l’exercice ${id}` }).count(), `${d.titre} : ${id} présent`)
  await p.screenshot({ path: `${caps}/site-parcours-${n + 1}.png`, fullPage: true })
}

// Classes : « 5e A » reçoit le premier parcours, « Groupe test » tous
await p.getByRole('tab', { name: 'Classes' }).or(p.getByRole('button', { name: 'Classes', exact: true })).first().click()
for (const [classe, choix] of [['5e A', [0]], ['Groupe test', [0, 1, 2, 3, 4]]]) {
  await p.getByLabel('Nom de la nouvelle classe').fill(classe)
  await p.getByRole('button', { name: /Classe$/ }).first().click()
  await p.getByRole('button', { name: `Choisir les parcours de ${classe}` }).click()
  for (const i of choix) await p.getByRole('checkbox', { name: new RegExp(PARCOURS[i].titre.replace(/[()’]/g, '.')) }).check()
  await p.getByRole('button', { name: 'Fermer', exact: true }).click()
  ok((await p.getByRole('tab', { name: new RegExp(classe) }).innerText()).includes(`${choix.length} parcours`), `${classe} : ${choix.length} parcours`)
}
await p.screenshot({ path: `${caps}/site-classes.png`, fullPage: true })
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.getByRole('button', { name: /Publier/ }).first().click()])
await dl.saveAs(sortie)
ok(true, `publié : ${dl.suggestedFilename()} → ${sortie}`)
ok(!erreurs.length, `aucune erreur JS ${erreurs.join(' | ')}`)
await ctx.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
