import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    name: 'Dual',
    entry: [
      'src/webpack.ts',
      'src/postcss.ts',
    ],
    clean: true,
    dts: true,
    format: ['esm', 'cjs'],
    failOnWarn: false,
  },
  {
    name: 'ESM only',
    entry: [
      'src/index.ts',
      'src/vite.ts',
      'src/astro.ts',
      'src/preset-uno.ts',
      'src/preset-icons.ts',
      'src/preset-attributify.ts',
      'src/preset-tagify.ts',
      'src/preset-web-fonts.ts',
      'src/preset-typography.ts',
      'src/preset-wind.ts',
      'src/preset-mini.ts',
      'src/preset-wind3.ts',
      'src/preset-wind4.ts',
    ],
    clean: false,
    dts: true,
    external: ['astro'],
    attw: {
      profile: 'esm-only',
    },
  },
])
