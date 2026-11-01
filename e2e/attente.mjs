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
  await page.waitForFunction(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))).then(
        () =>
          document.readyState === 'complete' &&
          document.fonts.status === 'loaded' &&
          !document.querySelector('[aria-busy="true"]') &&
          !document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity),
      ),
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
 * Options de Chromium : aucune page bridée parce qu'une autre est devant.
 * parcours-az ouvre une page de calcul à côté de celle de l'élève : la page
 * de l'élève tombait à une image par seconde, et chaque toucher attendait
 * 2 à 7 s (novembre 2026).
 */
export const SANS_BRIDAGE = ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows']
