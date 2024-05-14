import { defineConfig, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Montserrat',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
    }),
  ], // presets: [] -  disable default presets - includes preflight layer
  rules: [
    ['h-1', { 'font-size': '20px', 'color': '#daa420' }],
    [/^m-([.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
  ],
  cli: {
    entry: {
      /**
       * Glob patterns to match files
       * Include HTML and inline templates in components.
       */
      patterns: ['src/**/*.html', 'src/**/*.ts'],
      /**
       * The output filename for the generated UnoCSS file
       */
      outFile: './src/uno.css',
    },
  },
})
