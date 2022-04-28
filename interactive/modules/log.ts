/* eslint-disable no-console */
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup(_, nuxt) {
    console.log({
      modules: nuxt.options.modules,
      _layers: nuxt.options._layers,
    })

    nuxt.hook('app:resolve', (app) => {
      console.log({
        plugins: app.plugins,
      })
    })
  },
})
