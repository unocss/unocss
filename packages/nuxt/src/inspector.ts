import { useLogger, useNuxt } from '@nuxt/kit'
import { withTrailingSlash, withoutTrailingSlash } from 'ufo'
import * as chalk from 'chalk'
import pluginInspector from '../../inspector/node'

export function addInspector() {
  const nuxt = useNuxt()
  const inspectorRoute = '/_unocss'

  if (nuxt.options.dev && nuxt.options.builder === '@nuxt/vite-builder') {
    nuxt.options.vite.plugins = nuxt.options.vite.plugins || []
    nuxt.options.vite.plugins.push(pluginInspector({} as never))

    nuxt.hook('listen', (_, listener) => {
      const logger = useLogger()

      const viewerUrl = `${withoutTrailingSlash(listener.url)}${inspectorRoute}`

      logger.info(`UnoCSS inspector available at: ${
        (chalk as any).underline.yellow(withTrailingSlash(viewerUrl))
      }`)
    })
  }
}
