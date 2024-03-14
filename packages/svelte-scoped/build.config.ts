import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/preprocess',
    'src/vite',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@ampproject/remapping',
    '@jridgewell/trace-mapping',
    '@jridgewell/gen-mapping',
    '@jridgewell/set-array',
    '@jridgewell/sourcemap-codec',
    '@jridgewell/resolve-uri',
    '@unocss/core',
    '@unocss/config',
    '@unocss/preset-uno',
    '@unocss/reset',
    'css-tree',
    'svelte',
    'vite',
  ],
  replace: {
    'import.meta.vitest': 'undefined',
  },
})
