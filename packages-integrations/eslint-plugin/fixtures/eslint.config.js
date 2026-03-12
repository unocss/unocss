import antfu from '@antfu/eslint-config'
// eslint-disable-next-line antfu/no-import-dist
import unocss from '../dist/index.mjs'

export default antfu(
  {
    unocss: false,
    svelte: false,
  },
  unocss.configs.flat,
  {
    rules: {
      'unocss/blocklist': 'error',
    },
  },
)
