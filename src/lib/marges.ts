// Android : hauteur des barres du système (état, navigation) que l'app
// recouvre en affichage bord à bord. Le WebView ne la donne pas toujours par
// safe-area-inset-* : on la demande à l'app et on la pose en variables CSS
// (--marge-haut, --marge-bas, utilisées par app.css).
import { partageNatif } from './fichiers'

async function poser() {
  const { invoke } = await import('@tauri-apps/api/core')
  const m = await invoke<{ haut: number; bas: number }>('marges')
  const style = document.documentElement.style
  style.setProperty('--marge-haut', `${m.haut}px`)
  style.setProperty('--marge-bas', `${m.bas}px`)
}

/** À appeler au démarrage ; suit les rotations de l'écran */
export function suivreMarges(): () => void {
  if (!partageNatif) return () => {}
  const relire = () => void poser().catch((e) => console.warn('Marges', e))
  relire()
  addEventListener('orientationchange', relire)
  return () => removeEventListener('orientationchange', relire)
}
