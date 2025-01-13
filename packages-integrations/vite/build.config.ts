import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/client',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
  ],
  alias: aliasVirtual,
})
