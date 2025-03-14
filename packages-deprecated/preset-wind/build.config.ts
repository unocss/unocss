import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/theme',
    'src/utils',
    'src/colors',
  ],
  clean: true,
  declaration: true,
  alias: aliasVirtual,
})
