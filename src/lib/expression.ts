// Expressions des graphiques des fiches (« x^2/4+1/2 », « a*sin(x) », « 2e^(-x) »).
// Petit analyseur sans eval : nombres, variables, + - * / ^, parenthèses,
// multiplication sous-entendue (2x, 3(x+1), x sin(x)), fonctions usuelles.

export type Fonction = (variables: Record<string, number>) => number

const FONCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
}
const CONSTANTES: Record<string, number> = { pi: Math.PI, e: Math.E }

type Jeton = { t: 'nombre'; v: number } | { t: 'nom'; v: string } | { t: 'op'; v: string }

function decouper(texte: string): Jeton[] | null {
  const jetons: Jeton[] = []
  let i = 0
  while (i < texte.length) {
    const c = texte[i]
    if (/\s/.test(c)) i++
    else if (/[0-9.]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]+|^[0-9]+\.?/.exec(texte.slice(i))!
      jetons.push({ t: 'nombre', v: Number(m[0]) })
      i += m[0].length
    } else if (/[a-zA-Z]/.test(c)) {
      const m = /^[a-zA-Z]+/.exec(texte.slice(i))![0]
      // « xsin » ou « ex » : une fonction connue d'abord, sinon lettre par lettre
      let reste = m
      while (reste) {
        const f = Object.keys(FONCTIONS).find((n) => reste.startsWith(n)) ?? (reste.startsWith('pi') ? 'pi' : reste[0])
        jetons.push({ t: 'nom', v: f })
        reste = reste.slice(f.length)
      }
      i += m.length
    } else if ('+-*/^()'.includes(c)) {
      jetons.push({ t: 'op', v: c })
      i++
    } else return null
  }
  return jetons
}

/** Fonction des variables, ou null si l'expression est mal écrite ou cite une variable inconnue */
export function compiler(texte: string, variables: string[] = ['x']): Fonction | null {
  const lus = decouper(texte)
  if (!lus || !lus.length) return null
  const jetons: Jeton[] = lus
  let i = 0
  const voir = () => jetons[i]
  const estOp = (v: string) => voir()?.t === 'op' && voir()!.v === v

  // somme := produit (('+'|'-') produit)*
  function somme(): Fonction | null {
    let g = produit()
    while (g && (estOp('+') || estOp('-'))) {
      const op = (jetons[i++] as { v: string }).v
      const d = produit()
      if (!d) return null
      const a = g
      g = op === '+' ? (v) => a(v) + d(v) : (v) => a(v) - d(v)
    }
    return g
  }
  // produit := signe (('*'|'/'|implicite) signe)*
  function produit(): Fonction | null {
    let g = signe()
    while (g) {
      let op = '*'
      if (estOp('*') || estOp('/')) op = (jetons[i++] as { v: string }).v
      else if (!(voir()?.t === 'nombre' || voir()?.t === 'nom' || estOp('('))) break
      const d = signe()
      if (!d) return null
      const a = g
      g = op === '*' ? (v) => a(v) * d(v) : (v) => a(v) / d(v)
    }
    return g
  }
  // signe := '-' signe | puissance
  function signe(): Fonction | null {
    if (estOp('-') || estOp('+')) {
      const op = (jetons[i++] as { v: string }).v
      const d = signe()
      return d && (op === '-' ? (v) => -d(v) : d)
    }
    return puissance()
  }
  // puissance := atome ('^' signe)?  (associative à droite : 2^3^2 = 2^9)
  function puissance(): Fonction | null {
    const b = atome()
    if (!b || !estOp('^')) return b
    i++
    const e = signe()
    return e && ((v) => Math.pow(b(v), e(v)))
  }
  function atome(): Fonction | null {
    const j = jetons[i++]
    if (!j) return null
    if (j.t === 'nombre') return () => j.v
    if (j.t === 'op' && j.v === '(') {
      const d = somme()
      if (!d || !estOp(')')) return null
      i++
      return d
    }
    if (j.t === 'nom') {
      const f = FONCTIONS[j.v]
      if (f) {
        // sin(x) ou sin x
        const d = estOp('(') ? atome() : puissance()
        return d && ((v) => f(d(v)))
      }
      if (variables.includes(j.v)) return (v) => v[j.v]
      if (j.v in CONSTANTES) return () => CONSTANTES[j.v]
    }
    return null
  }

  const f = somme()
  return f && i === jetons.length ? f : null
}

/** Intégrale de a à b par la méthode de Simpson (n pair) */
export function integrale(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h)
  return (s * h) / 3
}
