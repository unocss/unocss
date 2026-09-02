import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import { defineConfig } from 'unocss'

export default defineConfig({
  // This vanilla app keeps its markup in plain `.ts` modules, which UnoCSS
  // skips by default — opt them in so the inspector's module tree reflects
  // the whole app (and not just `index.html`).
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|mdx?|astro|html)($|\?)/, /\.[jt]s($|\?)/],
      exclude: [/\.css($|\?)/, /node_modules/],
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 cursor-pointer',
    'text-title': 'text-2xl font-bold',
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons(),
  ],
})
