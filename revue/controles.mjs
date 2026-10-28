// Contrôles automatiques sur le texte produit par un exercice (énoncé ou
// correction, HTML avec formules entre $). Règles : docs/revue-exercices/regles.md.
// Chaque constat : { regle, gravite, extrait }. Gravité : 1 interactif faux,
// 2 rendu cassé, 3 mise en évidence, 4 typographie, 5 rédaction.

const NBSP = ' '
const FINE = ' '

/** Découpe en morceaux de texte et de maths (indices pairs : texte) */
export function morceaux(s) {
  const parts = []
  let cur = ''
  let enMaths = false
  let affichee = false
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && !enMaths && (s[i + 1] === '[' || s[i + 1] === ']')) {
      // \[ … \] : formule affichée, comme $$ … $$
      parts.push(cur)
      cur = ''
      enMaths = s[i + 1] === '['
      affichee = enMaths
      i++
      continue
    }
    if (s[i] === '\\' && enMaths && affichee && s[i + 1] === ']') {
      parts.push(cur)
      cur = ''
      enMaths = false
      affichee = false
      i++
      continue
    }
    if (s[i] === '\\') {
      // \$ : dollar échappé ; \\ : retour à la ligne LaTeX (le $ qui suit ferme)
      cur += s[i] + (s[i + 1] ?? '')
      i++
      continue
    }
    if (s[i] === '$') {
      // « $$ » : fin puis début de formule (deux formules accolées) quand on
      // est déjà en maths, formule affichée sinon
      if (s[i + 1] === '$' && (!enMaths || affichee)) {
        affichee = !enMaths
        i++
      } else affichee = false
      parts.push(cur)
      cur = ''
      enMaths = !enMaths
      continue
    }
    cur += s[i]
  }
  parts.push(cur)
  return parts
}

/** Texte visible d'un morceau HTML (balises retirées, entités décodées) */
export function visible(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li|tr|td|th|h\d)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;|&#xa0;/gi, NBSP)
    .replace(/&#8239;|&#x202f;|&thinsp;/gi, FINE)
    .replace(/&emsp;|&ensp;|&#8195;|&#8194;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, '’')
}

const extrait = (s, i, l = 50) =>
  s.slice(Math.max(0, i - l), i + l).replace(/\s+/g, ' ').trim()

/** Retire un élément et tout son contenu (balises de même nom équilibrées) */
export function retirer(html, ouverture, balise) {
  let sortie = html
  for (;;) {
    const m = ouverture.exec(sortie)
    if (!m) return sortie
    const re = new RegExp(`<${balise}\\b|</${balise}>`, 'gi')
    re.lastIndex = m.index + m[0].length
    let prof = 1
    let fin = sortie.length
    for (let r; (r = re.exec(sortie)); ) {
      prof += r[0][1] === '/' ? -1 : 1
      if (prof === 0) {
        fin = r.index + r[0].length
        break
      }
    }
    sortie = sortie.slice(0, m.index) + ' [figure] ' + sortie.slice(fin)
  }
}

/** Retire le contenu des éléments qui ne sont pas du texte d'énoncé */
function sansChamps(html) {
  let h = retirer(html, /<div class="divLatex"/i, 'div')
  h = retirer(h, /<span class="katex"/i, 'span')
  return h
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(math-field|mathalea-mathfield|fill-in-the-blank|liste-deroulante|multi-mathfield)[\s\S]*?<\/\1>/gi, ' [champ] ')
    .replace(/<(math-field|mathalea-mathfield|input)[^>]*>/gi, ' [champ] ')
    .replace(/<[a-z]+(?:-[a-z0-9]+)+(?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/gi, ' [champ] ')
    .replace(/\s*\[champ\]\s*/g, ' [champ] ')
    .replace(/<span id="resultatCheck[^"]*"><\/span>/gi, '')
}

const ANNEE = /^(1[5-9]\d\d|20\d\d|21\d\d)$/

/**
 * @param {string} html énoncé ou correction
 * @param {{ type: 'enonce'|'correction'|'titre'|'consigne', pays?: string }} o
 */
export function controler(html, o) {
  const constats = []
  const ajoute = (regle, gravite, ext) => constats.push({ regle, gravite, extrait: ext })
  const source = sansChamps(html ?? '')
  const parts = morceaux(source)

  // X3 sorties parasites, partout
  for (const m of source.matchAll(/undefined|NaN|Infinity|\[object [A-Za-z]+\]|\bnull\b/g)) {
    ajoute('X3', 2, extrait(source, m.index))
  }
  if (parts.length % 2 === 0) ajoute('X2', 2, 'nombre impair de $ : ' + extrait(source, source.lastIndexOf('$'), 60))

  parts.forEach((p, k) => {
    if (k % 2 === 0) {
      // ---- texte ----
      const t = visible(p)
      // N1 nombres hors $ (sauf années, références d'exercices, numéros de niveaux)
      for (const m of t.matchAll(/(^|[^\p{L}\d_\\#-])(\d+(?:[,.]\d+)?)(?![\p{L}\d_])/gu)) {
        const n = m[2]
        if (ANNEE.test(n)) continue
        ajoute('N1', 4, `« ${n} » hors $ : ${extrait(t, m.index + m[1].length)}`)
      }
      for (const m of t.matchAll(/(^|[^\p{L}\d])(\d+)(e|er|re|ème|nd|nde)(?![\p{L}])/gu)) {
        ajoute('N1', 5, `ordinal « ${m[2]}${m[3]} » hors $ : ${extrait(t, m.index)}`)
      }
      // T1 pourcentage
      for (const m of t.matchAll(/(\S)( ?)%/g)) {
        if (m[1] === NBSP || m[1] === FINE) continue
        ajoute('T1', 4, `« ${m[1]}${m[2]}% » sans espace insécable : ${extrait(t, m.index)}`)
      }
      // T3 ponctuation haute
      for (const m of t.matchAll(/([^\s  (])([:;!?])(?=\s|$| )/g)) {
        if (m[2] === ':' && /\d/.test(m[1])) continue // heures 10:30
        if (/https?$/.test(t.slice(Math.max(0, m.index - 6), m.index + 1))) continue
        ajoute('T3', 4, `« ${m[1]}${m[2]} » sans espace insécable : ${extrait(t, m.index)}`)
      }
      for (const m of t.matchAll(/ ([:;!?])/g)) {
        ajoute('T3', 4, `espace ordinaire (sécable) avant « ${m[1]} » : ${extrait(t, m.index)}`)
      }
      // T4 guillemets
      for (const m of t.matchAll(/«(?![  ])|(?<![  ])»/g)) {
        ajoute('T4', 4, `guillemet sans insécable : ${extrait(t, m.index)}`)
      }
      for (const m of t.matchAll(/"[^"\n]{1,60}"/g)) ajoute('T4', 5, `guillemets droits : ${extrait(t, m.index)}`)
      // T5 espaces
      for (const m of t.replace(/ \[champ\] /g, '[champ]').matchAll(/[^\s\n] {2,}[^\s\n]/g)) ajoute('T5', 5, `double espace : ${extrait(t, m.index)}`)
      for (const m of t.matchAll(/\p{L} +[.,](?!\d)/gu)) ajoute('T5', 5, `espace avant ponctuation : ${extrait(t, m.index)}`)
      // T6 points de suspension
      for (const m of t.matchAll(/\.\.\.|…/g)) ajoute('T6', 5, `points de suspension : ${extrait(t, m.index)}`)
      // R5 virgules
      for (const m of t.matchAll(/[^,\s(] +(soit|alors)\b/g)) {
        const avant = t.slice(Math.max(0, m.index - 12), m.index + 1)
        if (/\b(et|ou|si|est|sont|que|qu'|qu’)\s*\S?$/.test(avant)) continue
        ajoute('R5', 5, `pas de virgule avant « ${m[1]} » : ${extrait(t, m.index)}`)
      }
      for (const m of t.matchAll(/(^|[.!?]\s+|\n)Or(?!,)\s/g)) ajoute('R5', 5, `pas de virgule après « Or » : ${extrait(t, m.index)}`)
      // R6 majuscules sans accent
      for (const m of t.matchAll(/(^|[.!?:]\s+|\n|«\s?)(A|Etant|Ecri\p{L}*|Evalu\p{L}*|Egal\p{L}*|Equation\p{L}*|Etudi\p{L}*|Elev\p{L}*|Etape\p{L}*|Etat\p{L}*|Enonc\p{L}*|Evenement\p{L}*|Evén\p{L}*)\s/gu)) {
        if (m[2] === 'A' && !/^A (la|l’|l'|partir|chaque|quel|quelle|quoi|nouveau|noter|retenir|droite|gauche|l’aide|l'aide|cette|ce|ces|un|une)\b/.test(t.slice(m.index + m[1].length))) continue
        ajoute('R6', 5, `majuscule sans accent : ${extrait(t, m.index)}`)
      }
      // R8 orthographe uniformisée
      for (const m of t.matchAll(/en-dessous|au dessus|au dessous|ci dessous|ci dessus|par dessus|là dessus|en dessus/gi)) {
        ajoute('R8', 5, `« ${m[0]} » : ${extrait(t, m.index)}`)
      }
      // R10 fautes fréquentes repérables automatiquement
      for (const m of t.matchAll(/\b(\p{L}{2,}) \1\b/giu)) {
        if (/^(nous|vous|tout|bien|si|très|plus|fort|sur)$/i.test(m[1])) continue
        ajoute('R10', 5, `mot répété « ${m[0]} » : ${extrait(t, m.index)}`)
      }
      for (const m of t.matchAll(/\b\p{L}*[aeé]-(il|elle|on|ils|elles)\b/giu)) {
        if (/-t-/.test(t.slice(m.index - 3, m.index + m[0].length))) continue
        ajoute('R10', 5, `t euphonique manquant « ${m[0]} » : ${extrait(t, m.index)}`)
      }
      for (const m of t.matchAll(/\b(oeu\p{L}*|coeur\p{L}*|soeur\p{L}*|noeud\p{L}*|voeu\p{L}*|boeuf\p{L}*|oe(?=il))/giu)) {
        ajoute('R10', 5, `ligature œ manquante « ${m[0]} » : ${extrait(t, m.index)}`)
      }
      for (const m of t.matchAll(/\b(que|de|Que|De) (?=[AEIOUYÉÈÊÂÎ][a-zéèêàâîïôûç]+\b)/gu)) ajoute('R10', 5, `élision manquante « ${m[1]} ${t.slice(m.index + m[0].length).split(/\s/)[0]} » : ${extrait(t, m.index)}`)
      for (const m of t.matchAll(/\p{L}- \p{L}|\p{L} -\p{L}/gu)) ajoute('R10', 5, `trait d'union et espace : ${extrait(t, m.index)}`)
      // R2 consignes à l'impératif (deuxième personne)
      if (o.type === 'consigne' || o.type === 'titre' || o.type === 'enonce') {
        for (const m of t.matchAll(/(^|[.!?]\s+|\n)(Calcule|Donne|Écris|Ecris|Complète|Trouve|Détermine|Résous|Place|Trace|Construis|Indique|Coche|Choisis|Range|Développe|Factorise|Simplifie|Réduis|Recopie|Justifie|Exprime|Convertis|Compare|Lis|Associe|Relie|Mesure|Colorie|Entoure|Souligne|Déduis|Montre|Vérifie|Additionne|Soustrais|Multiplie|Divise|Arrondis|Encadre|Décompose|Résume|Observe|Utilise)\b/g)) {
          ajoute('R2', 5, `impératif : ${extrait(t, m.index)}`)
        }
        for (const m of t.matchAll(/\b(tu|ton|ta|tes|toi)\b/gi)) ajoute('R2', 5, `deuxième personne : ${extrait(t, m.index)}`)
      }
      // R1 titre
      if (o.type === 'titre' && /\.\s*$/.test(t)) ajoute('R1', 5, `titre terminé par un point : ${t.trim()}`)
      // Orange non gras : texteEnCouleur par défaut (M7)
      for (const m of p.matchAll(/<span style="color:\s*#f15929;?\s*">/gi)) ajoute('M7', 3, `texte orange (texteEnCouleur sans couleur) : ${extrait(visible(p.slice(m.index)), 0, 80)}`)
    } else {
      // ---- maths ----
      const s = p.replace(/\\color\{[^}]*\}/g, '\\color{}').replace(/\\\\\[[\d.]+(em|ex|pt|cm|mm)\]/g, '\\\\')
      for (const m of s.matchAll(/(?<![\d\\{a-zA-Z])\d+\.\d+(?!\d)/g)) ajoute('N3', 4, `point décimal : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/\d(?:\{,\}|,)\d{9,}|\d\.\d{9,}|\d[eE][+-]\d/g)) ajoute('N4', 2, `flottant ou notation scientifique : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/(?<![\d,}.])\d{5,}(?![\d,]|\{,\})/g)) ajoute('N2', 4, `nombre sans séparateur de milliers : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/(?<![\d,}.\\])\d{4}(?![\d]|\{,\}|,\d)/g)) {
        if (ANNEE.test(m[0])) continue
        ajoute('N2', 5, `nombre à 4 chiffres sans séparateur : $${extrait(s, m.index, 30)}$`)
      }
      for (const m of s.matchAll(/\+\s*-|-\s*\+|-\s*-(?!>)|\+\s*\+/g)) ajoute('N6', 4, `signes accolés : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/(\\times|\\div|\\cdot|\^)\s*-\s*\d/g)) ajoute('N5', 4, `négatif sans parenthèses : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/(?<![\d,.}{\\])(-?1)\s*([a-z])(?![a-z])/g)) {
        if (/\\[a-zA-Z]*$/.test(s.slice(0, m.index))) continue
        ajoute('N6', 4, `coefficient 1 écrit : $${extrait(s, m.index, 30)}$`)
      }
      for (const m of s.matchAll(/(?<![\d,.}{])0\s*([a-z])(?![a-z])/g)) ajoute('N6', 5, `coefficient 0 : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/\^\{?1\}?(?![\d,])/g)) ajoute('N6', 5, `exposant 1 : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/(^|[=(\s,])-0(?![\d,.]|\{,\})/g)) ajoute('N6', 4, `« -0 » : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/\.\.\.|\.\.\.\./g)) ajoute('T6', 5, `points de suspension en maths (\\ldots) : $${extrait(s, m.index, 30)}$`)
      for (const m of s.matchAll(/\d\s*\\?%/g)) {
        const avant = s.slice(m.index, m.index + m[0].length)
        if (/\\,|~|\\ /.test(s.slice(Math.max(0, m.index - 2), m.index + m[0].length))) continue
        ajoute('T1', 4, `« % » sans espace en maths : $${extrait(s, m.index, 30)}$ (${avant})`)
      }
      // T2 unités en italique (lettres d'unité collées à un nombre hors \text)
      for (const m of s.matchAll(/\d\s*(?:\\,|~|\\ )?\s*(cm|mm|dm|km|hm|dam|kg|mg|hg|dag|mL|cL|dL|hL|min)(\^[23])?(?![a-zA-Z{])/g)) {
        ajoute('T2', 4, `unité hors \\text : $${extrait(s, m.index, 30)}$`)
      }
      for (const m of s.matchAll(/\d\\text\{(cm|mm|dm|km|m|g|kg|mg|L|mL|cL|dL|h|min|s|€)(?![a-zA-Z])/g)) ajoute('T2', 4, `unité sans espace : $${extrait(s, m.index, 30)}$`)
      // T8 commande collée à une lettre
      for (const m of s.matchAll(/\\(times|div|cdot|approx)(?=[a-zA-Z])/g)) ajoute('T8', 2, `commande collée : $${extrait(s, m.index, 30)}$`)
      // M5 texte dans miseEnEvidence
      for (const m of s.matchAll(/\\color\{#f15929\}\\boldsymbol\{([^$]*?)\\textbf\{([^}]*)\}/gi)) {
        if (/^\s*(cm|mm|dm|km|m|g|kg|L|mL|cL|h|min|s|€|%|°)?[\s²³^{}23]*$/.test(m[2])) {
          ajoute('M2', 3, `unité dans miseEnEvidence : \\text{${m[2]}}`)
        } else ajoute('M5', 3, `texte dans miseEnEvidence : \\text{${m[2]}}`)
      }
      // R9 probabilités
      if (/\bp\s*\(\s*[A-Z]|\bp_\{?[A-Z]/.test(s)) ajoute('R9', 5, `p minuscule : $${extrait(s, s.search(/\bp\s*\(|\bp_/), 30)}$`)
    }
  })
  return constats
}

/** Contrôles portant sur un exercice entier (toutes ses questions) */
export function controlerSerie(questions) {
  const constats = []
  const vus = new Map()
  questions.forEach((q, i) => {
    const cle = (q.enonce ?? '').replace(/Ex\d+Q\d+/g, '')
    if (/^\s*chargement\.\.\.\s*$/i.test(q.enonce ?? '')) constats.push({ regle: 'X1', gravite: 1, q: i, extrait: 'énoncé resté à « chargement... » (questions chargées après la génération)' })
    if (cle && vus.has(cle)) constats.push({ regle: 'X4', gravite: 5, q: i, extrait: `question ${i + 1} identique à la question ${vus.get(cle) + 1}` })
    else vus.set(cle, i)
    if (!visible(q.enonce ?? '').trim() && !/<svg|<img|math-field/.test(q.enonce ?? '')) constats.push({ regle: 'X4', gravite: 2, q: i, extrait: 'énoncé vide' })
    if (!visible(q.correction ?? '').trim() && !/<svg|<img/.test(q.correction ?? '')) constats.push({ regle: 'X4', gravite: 2, q: i, extrait: 'correction vide' })
    else if (!/\\color\{#?f15929\}|color:\s*#f15929;\s*font-weight/i.test(q.correction ?? '')) constats.push({ regle: 'M6', gravite: 3, q: i, extrait: 'aucune mise en évidence dans la correction' })
  })
  return constats
}
