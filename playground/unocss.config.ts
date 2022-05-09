import {
  defineConfig,
  presetAttributify,
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
    ],
    transformers: [
      transformerVariantGroup(),
      transformerDirectives(),
      transformerCompileClass(),
    ],
  })
}

export default createConfig()
