import type { UserConfig } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'

// Import presets from their own packages (instead of the `unocss` root
// export) so the Next bundler doesn't pull in Vite-only transformers
const config: UserConfig = {
  presets: [
    presetWind3({
      dark: 'media',
    }),
  ],
  shortcuts: {
    btn: 'px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer',
  },
}

export default config
