import fs from 'fs-extra'

const { copyFileSync, copySync, ensureDirSync } = fs

copySync('node_modules/shiki/', 'public/shiki/', {
  filter: src => src === 'node_modules/shiki/' || src.includes('languages') || src.includes('dist'),
})

copySync('node_modules/theme-vitesse/themes', 'public/shiki/themes')
copySync('node_modules/theme-vitesse/themes', 'node_modules/shiki/themes', { overwrite: true })

ensureDirSync('guides/vendor/')

copyFileSync('../packages/preset-uno/README.md', 'guides/vendor/preset-uno.md')
copyFileSync('../packages/preset-wind/README.md', 'guides/vendor/preset-wind.md')
copyFileSync('../packages/preset-icons/README.md', 'guides/vendor/preset-icons.md')
copyFileSync('../packages/preset-mini/README.md', 'guides/vendor/preset-mini.md')
copyFileSync('../packages/preset-attributify/README.md', 'guides/vendor/preset-attributify.md')
copyFileSync('../packages/preset-web-fonts/README.md', 'guides/vendor/preset-web-fonts.md')
copyFileSync('../packages/preset-typography/README.md', 'guides/vendor/preset-typography.md')

copyFileSync('../packages/vite/README.md', 'guides/vendor/vite.md')
copyFileSync('../packages/webpack/README.md', 'guides/vendor/webpack.md')
copyFileSync('../packages/runtime/README.md', 'guides/vendor/runtime.md')
copyFileSync('../packages/nuxt/README.md', 'guides/vendor/nuxt.md')

