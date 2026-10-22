// import { defineConfig } from 'eslint/config'
// import unocss from '../src'
//
// export default defineConfig([
//   unocss.configs.flat,
//   {
//     rules: {
//       'unocss/blocklist': 'error',
//     },
//   },
// ])

import antfu from '@antfu/eslint-config'
import unocss from '../src'

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
