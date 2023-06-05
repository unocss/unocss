// postcss.config.cjs
module.exports = {
  plugins: {
    '@unocss/postcss': {
      // Optional
      content: ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}'],
    },
  },
}
