// Attentes communes des suites : on agit quand la page est prête, jamais
// après une durée fixe. Une durée fixe est trop longue quand l'app est rapide
// et trop courte quand la machine est chargée (échecs au hasard, novembre 2026).

/**
 * Page prête : chargée, polices prêtes, aucune question en cours de rendu par
 * le moteur (aria-busy, BlocQuestion.svelte) et aucune animation finie en
 * cours (changement d'écran, panneau du bas). Deux images d'abord : ce qu'un
 * toucher vient de déclencher a eu le temps de commencer.
 */
export async function pagePrete(page, timeout = 60_000) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  // Condition synchrone : une promesse renvoyée ici passerait pour vraie
  await page.waitForFunction(
    () =>
      document.readyState === 'complete' &&
      document.fonts.status === 'loaded' &&
      !document.querySelector('[aria-busy="true"]') &&
      !document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity),
    null,
    { timeout, polling: 'raf' },
  )
}

/** Attend qu'une condition (fonction asynchrone côté test) devienne vraie */
export async function jusqua(condition, { timeout = 30_000, quoi = 'condition' } = {}) {
  const fin = Date.now() + timeout
  for (;;) {
    if (await condition().catch(() => false)) return
    if (Date.now() > fin) throw new Error(`délai dépassé : ${quoi}`)
    await new Promise((r) => setTimeout(r, 50))
  }
}

/**
 * Options de Chromium pour toutes les suites :
 * - aucune page bridée parce qu'une autre est devant. parcours-az ouvre une
 *   page de calcul à côté de celle de l'élève : la page de l'élève tombait à
 *   une image par seconde, et chaque toucher attendait 2 à 7 s (novembre 2026) ;
 * - pas de « page précédente » au glissement horizontal du doigt (geste de
 *   Chromium sur ordinateur, absent des WebView Android et iOS) : un
 *   glisser-déposer parti d'une étiquette au bord gauche ouvrait « Quitter
 *   l'activité ? » sous charge (dnd, vérification du 1er novembre 2026).
 */
export const SANS_BRIDAGE = [
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  '--disable-features=OverscrollHistoryNavigation',
]

/** Le champ (math-field, input, même dans un shadow DOM) a le focus */
export const aLeFocus = (champ) => champ.evaluate((el) => el.getRootNode().activeElement === el || document.activeElement === el)

/**
 * Touche un champ, attend qu'il ait le focus, puis tape. Un champ MathLive
 * encore en train de se monter ne prend pas le focus au premier toucher, et la
 * frappe partait ailleurs (réponse vide, novembre 2026) : on retouche.
 */
export async function taperDans(page, champ, texte, toucher = (c) => c.click()) {
  for (let essai = 0; ; essai++) {
    await toucher(champ)
    try {
      await jusqua(() => aLeFocus(champ), { timeout: 2_000, quoi: 'focus du champ' })
      break
    } catch (err) {
      if (essai >= 4) throw err
    }
  }
  await page.keyboard.type(texte)
}

/**
 * Élément immobile et découvert : même position sur deux lectures espacées de
 * 150 ms (la barre du bas suit le clavier, mesuré par l'app toutes les 120 ms)
 * et c'est bien lui qui reçoit le toucher en son centre (lu dans son shadow DOM
 * s'il en a un : liste déroulante de MathALÉA). Renvoie ce centre.
 */
export async function pointStable(locator, timeout = 30_000) {
  const fin = Date.now() + timeout
  let avant = null
  for (;;) {
    const b = await locator.boundingBox().catch(() => null)
    if (b) {
      const point = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
      const meme = avant && Math.abs(avant.x - point.x) < 0.5 && Math.abs(avant.y - point.y) < 0.5
      if (meme && (await locator.evaluate((el, p) => el.contains((el.getRootNode().elementFromPoint ? el.getRootNode() : document).elementFromPoint(p.x, p.y)), point).catch(() => false))) return point
      avant = point
    }
    if (Date.now() > fin) throw new Error('délai dépassé : élément immobile et découvert')
    await new Promise((r) => setTimeout(r, 150))
  }
}
