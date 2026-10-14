// Thème clair ou sombre. Sans choix de l'élève, celui du téléphone.
const CLE = 'theme'

function lirePreference(): 'clair' | 'sombre' | null {
  try {
    const v = localStorage.getItem(CLE)
    return v === 'clair' || v === 'sombre' ? v : null
  } catch {
    return null
  }
}

export type PreferenceTheme = 'telephone' | 'clair' | 'sombre'
export const theme = $state({ sombre: false, preference: 'telephone' as PreferenceTheme })

let appliquer = () => {}

export function initialiserTheme() {
  const systeme = matchMedia('(prefers-color-scheme: dark)')
  appliquer = () => {
    const pref = lirePreference()
    theme.preference = pref ?? 'telephone'
    theme.sombre = pref ? pref === 'sombre' : systeme.matches
    document.documentElement.classList.toggle('dark', theme.sombre)
  }
  appliquer()
  systeme.addEventListener('change', appliquer)
  return () => systeme.removeEventListener('change', appliquer)
}

/** Réglage « Apparence » : appliqué aussitôt et mémorisé sur l'appareil */
export function choisirTheme(p: PreferenceTheme) {
  try {
    if (p === 'telephone') localStorage.removeItem(CLE)
    else localStorage.setItem(CLE, p)
  } catch {
    /* préférence non mémorisée */
  }
  appliquer()
}
