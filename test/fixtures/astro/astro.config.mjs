import Unocss from 'unocss/vite'

// @ts-check
export default /** @type {import('astro').AstroUserConfig} */ ({
  vite: {
    plugins: [Unocss()],
  },
})
