// Parcours Préqualifiant de l'Explorer joués de A à Z (première moitié), voir parcours-az.mjs
process.env.PARCOURS = 'prq-nombres-ecritures-reperage,prq-calculs-decimaux-relatifs,prq-puissances-carres-racines,prq-donnees-raisonnement,prq-grandeurs-conversions'
process.argv.push('explorer/prequalifiant.json')
await import('./parcours-az.mjs')
