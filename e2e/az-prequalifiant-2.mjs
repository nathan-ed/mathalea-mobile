// Parcours Préqualifiant de l'Explorer joués de A à Z (seconde moitié), voir parcours-az.mjs
process.env.PARCOURS = 'prq-figures-angles-solides,prq-perimetres-aires-volumes,prq-divisibilite-decomposition,prq-fractions-representer-calculer'
process.argv.push('explorer/prequalifiant.json')
await import('./parcours-az.mjs')
