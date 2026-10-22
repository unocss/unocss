import { defineConfig, presetWind3, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  blocklist: [
    [i => i.includes('blocked'), { message: 'use non-blocked-rule' }],
  ],
})
