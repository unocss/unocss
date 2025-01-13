import antfu from '@antfu/eslint-config'
import unocss  from '@unocss/eslint-plugin'

export default antfu(
  {
    unocss: false,
    svelte: true
  },
  unocss.configs.flat,
  {
    rules: {
      'unocss/blocklist': 'error',
    }
  }
)
