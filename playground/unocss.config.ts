import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export function createConfig({ strict = true, dev = true } = {}) {
  return defineConfig({
    envMode: dev ? 'dev' : 'build',
    theme: {
      fontFamily: {
        sans: '\'Inter\', sans-serif',
        mono: '\'Fira Code\', monospace',
      },
    },
    presets: [
      presetAttributify({ strict }),
      presetUno(),
      presetIcons({
        scale: 1.2,
      }),
    ],
    transformers: [
      transformerVariantGroup(),
      transformerDirectives(),
      transformerCompileClass(),
    ],
  })
}

export default createConfig()
