import fs from 'fs-extra'

await fs.copy('node_modules/shiki/', 'public/shiki/', {
  filter: src => src === 'node_modules/shiki/' || src.includes('languages') || src.includes('dist'),
})

await fs.copy('node_modules/theme-vitesse/themes', 'public/shiki/themes')
