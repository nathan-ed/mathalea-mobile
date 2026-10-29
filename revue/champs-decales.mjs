// Repère les exercices dont les champs d'une question portent l'indice d'une autre question
// (champs numérotés à la suite sur tout l'exercice). La vérification question par question
// (moteur de l'app, vue « une question par page » du site) lit autoCorrection[i] : elle
// compare alors la question i à un champ d'une autre question.
//   node revue/champs-decales.mjs > revue/champs-decales.json
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const res = []
for (const f of readdirSync(join(ici, 'sorties')).filter((x) => x.endsWith('.json'))) {
  let s
  try {
    s = JSON.parse(readFileSync(join(ici, 'sorties', f), 'utf8'))
  } catch {
    continue
  }
  const cas = []
  for (const v of s.variantes ?? []) {
    v.questions?.forEach((q, i) => {
      const ks = new Set([...String(q.enonce ?? '').matchAll(/id=["'](?:champTexte|MetaInteractif2d|resultatCheck)?Ex\d+Q(\d+)/g)].map((m) => Number(m[1])))
      const autres = [...ks].filter((k) => k !== i)
      if (autres.length) cas.push({ variante: v.variante, graine: v.graine, question: i + 1, champs: [...ks] })
    })
  }
  if (cas.length) res.push({ id: s.id, uuid: s.uuid, chemin: s.chemin, cas: cas.length, exemple: cas[0] })
}
console.log(JSON.stringify(res, null, 1))
console.error(`${res.length} exercices`)
