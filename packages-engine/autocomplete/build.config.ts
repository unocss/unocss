import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  alias: aliasVirtual,
  clean: true,
  declaration: true,
  externals: [
    'pug',
    '@unocss/core',
  ],
})
