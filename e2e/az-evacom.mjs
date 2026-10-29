// Parcours EVACOM (11LC, 11LS, TAF) et 4e Collège de l'Explorer joués de A à Z, voir parcours-az.mjs
process.argv.push('explorer/evacom-revisions.json', 'explorer/ch-4e-college.json')
await import('./parcours-az.mjs')
