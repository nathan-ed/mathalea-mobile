// Un exercice par format de réponse de MathALÉA (e2e/formats-reponse.json),
// joué comme un élève (voir parcours-az.mjs). Lancé par la CI avant chaque release.
process.env.FORMATS = '1'
process.argv.push('e2e/formats-reponse.json')
await import('./parcours-az.mjs')
