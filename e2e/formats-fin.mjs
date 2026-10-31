// Les formats de réponse de e2e/formats-reponse.json, avec la correction à la
// fin (comme Teste ton niveau) : la réponse de chaque question doit survivre
// au passage à la question suivante et à la soumission (Nathan, 31 octobre
// 2026 : figure tracée « non prise en compte »).
process.env.FORMATS = '1'
process.env.CORRECTION = 'parcours'
process.argv.push('e2e/formats-reponse.json')
await import('./parcours-az.mjs')
