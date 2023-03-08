import sveltePreprocess from 'svelte-preprocess'
import unocss from '@unocss/postcss'

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    postcss: {
      plugins: [unocss()],
    },
  }),
}
