import { copyFileSync, ensureDirSync } from 'fs-extra'

ensureDirSync('presets')
ensureDirSync('integrations')

copyFileSync('../packages/preset-uno/README.md', 'presets/uno.md')
copyFileSync('../packages/preset-wind/README.md', 'presets/wind.md')
copyFileSync('../packages/preset-icons/README.md', 'presets/icons.md')
copyFileSync('../packages/preset-mini/README.md', 'presets/mini.md')
copyFileSync('../packages/preset-attributify/README.md', 'presets/attributify.md')
copyFileSync('../packages/preset-web-fonts/README.md', 'presets/web-fonts.md')

copyFileSync('../packages/vite/README.md', 'integrations/vite.md')
copyFileSync('../packages/webpack/README.md', 'integrations/webpack.md')
copyFileSync('../packages/runtime/README.md', 'integrations/runtime.md')
copyFileSync('../packages/nuxt/README.md', 'integrations/nuxt.md')
