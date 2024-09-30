import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  preflights: [
    {
      getCSS() {
        return `body { @apply bg-red/10; }`
      },
      layer: 'base',
    },
    {
      getCSS() {
        return `body { @apply bg-blue/10; }`
      },
    },
  ],
  presets: [
    presetAttributify(),
    presetUno(),
    presetIcons(),
  ],
  transformers: [
    transformerCompileClass(),
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
