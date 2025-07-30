import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@nuxt/schema',
    '@unocss/preset-attributify',
    '@unocss/preset-icons',
    '@unocss/preset-tagify',
    '@unocss/preset-typography',
    '@unocss/preset-web-fonts',
    '@unocss/preset-wind3',
    '@unocss/preset-wind4',
  ],
  alias: aliasVirtual,
})
