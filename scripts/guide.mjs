// Pages web du guide (Pages de la forge) depuis docs/guide/*.md : titres,
// paragraphes, listes, tableaux, images, liens, gras et code. Rien d'autre :
// le guide s'écrit en Markdown simple, lisible aussi dans le dépôt.
//   node scripts/guide.mjs <sortie>
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const source = 'docs/guide'
const sortie = process.argv[2] ?? 'public'
mkdirSync(join(sortie, 'images'), { recursive: true })

const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function enLigne(t) {
  const codes = []
  t = t.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
  t = echapper(t)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, texte, lien) => `<a href="${lien.replace(/^(?:\.\.\/)?([\w-]+)\.md$/, '$1.html')}">${texte}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/([\w.+-]+@[\w-]+\.[\w.]+\w)/g, '<a href="mailto:$1">$1</a>')
  // Typographie française : pas de guillemet ni de deux-points seul en début de ligne
  t = t.replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»').replace(/ ([:;?!])/g, '\u00a0$1')
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${echapper(codes[i])}</code>`)
}

function convertir(md) {
  const lignes = md.split('\n')
  const html = []
  let titre = ''
  for (let i = 0; i < lignes.length; ) {
    const l = lignes[i]
    if (!l.trim()) {
      i++
      continue
    }
    // Bloc de code (exemples JSON) : tel quel
    if (l.startsWith('```')) {
      const code = []
      i++
      while (i < lignes.length && !lignes[i].startsWith('```')) code.push(lignes[i++])
      i++
      html.push(`<pre><code>${echapper(code.join('\n'))}</code></pre>`)
      continue
    }
    const h = /^(#{1,3}) (.*)$/.exec(l)
    if (h) {
      if (h[1] === '#') titre = h[2]
      html.push(`<h${h[1].length}>${enLigne(h[2])}</h${h[1].length}>`)
      i++
      continue
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(l.trim())
    if (image) {
      html.push(`<figure><img src="${image[2]}" alt="${echapper(image[1])}" loading="lazy"></figure>`)
      i++
      continue
    }
    if (l.startsWith('|')) {
      const rangs = []
      while (i < lignes.length && lignes[i].startsWith('|')) rangs.push(lignes[i++])
      const cellules = (r) => r.slice(1, -1).split('|').map((c) => c.trim())
      const [entete, , ...corps] = rangs
      html.push(
        `<div class="tableau"><table><thead><tr>${cellules(entete).map((c) => `<th>${enLigne(c)}</th>`).join('')}</tr></thead><tbody>` +
          corps.map((r) => `<tr>${cellules(r).map((c) => `<td>${enLigne(c)}</td>`).join('')}</tr>`).join('') +
          '</tbody></table></div>',
      )
      continue
    }
    const liste = /^(\d+\.|-) /.exec(l)
    if (liste) {
      const ordonnee = liste[1] !== '-'
      const elements = []
      while (i < lignes.length && /^(\d+\.|-) /.test(lignes[i])) {
        let texte = lignes[i++].replace(/^(\d+\.|-) /, '')
        while (i < lignes.length && /^ {2,}\S/.test(lignes[i])) texte += ' ' + lignes[i++].trim()
        elements.push(`<li>${enLigne(texte)}</li>`)
      }
      html.push(`<${ordonnee ? 'ol' : 'ul'}>${elements.join('')}</${ordonnee ? 'ol' : 'ul'}>`)
      continue
    }
    let texte = l
    i++
    while (i < lignes.length && lignes[i].trim() && !/^(#|!\[|\||\d+\. |- |```)/.test(lignes[i])) texte += ' ' + lignes[i++].trim()
    html.push(`<p>${enLigne(texte)}</p>`)
  }
  return { titre, corps: html.join('\n') }
}

const page = ({ titre, corps }) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echapper(titre)} · MathALÉA</title>
<link rel="icon" href="favicon.png">
<link rel="stylesheet" href="guide.css">
</head>
<body>
<header><a href="index.html"><img src="favicon.png" alt=""> MathALÉA <span>par CoopMaths</span></a></header>
<main>
${corps}
</main>
</body>
</html>
`

for (const f of readdirSync(source).filter((f) => f.endsWith('.md'))) {
  writeFileSync(join(sortie, f.replace(/\.md$/, '.html')), page(convertir(readFileSync(join(source, f), 'utf8'))))
}
for (const f of readdirSync(join(source, 'images'))) copyFileSync(join(source, 'images', f), join(sortie, 'images', f))
copyFileSync(join(source, 'guide.css'), join(sortie, 'guide.css'))
// Fichiers téléchargeables (schéma et exemple du format des parcours)
for (const f of readdirSync(source).filter((f) => f.endsWith('.json'))) copyFileSync(join(source, f), join(sortie, f))
console.log(`Guide : ${readdirSync(source).filter((f) => f.endsWith('.md')).length} pages dans ${sortie}`)
