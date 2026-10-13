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

export const theme = $state({ sombre: false })

export function initialiserTheme() {
  const systeme = matchMedia('(prefers-color-scheme: dark)')
  const appliquer = () => {
    const pref = lirePreference()
    theme.sombre = pref ? pref === 'sombre' : systeme.matches
    document.documentElement.classList.toggle('dark', theme.sombre)
  }
  appliquer()
  systeme.addEventListener('change', appliquer)
  return () => systeme.removeEventListener('change', appliquer)
}

export function basculerTheme() {
  theme.sombre = !theme.sombre
  document.documentElement.classList.toggle('dark', theme.sombre)
  try {
    localStorage.setItem(CLE, theme.sombre ? 'sombre' : 'clair')
  } catch {
    /* préférence non mémorisée */
  }
}
