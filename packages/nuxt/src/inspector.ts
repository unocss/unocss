import { useLogger, useNuxt } from '@nuxt/kit'
import { withTrailingSlash, withoutTrailingSlash } from 'ufo'
import * as chalk from 'chalk'

export function addInspector() {
  const nuxt = useNuxt()
  const inspectorRoute = '/__unocss'

  if (nuxt.options.dev && nuxt.options.builder === '@nuxt/vite-builder') {
    nuxt.hook('listen', (_, listener) => {
      const logger = useLogger()

      const viewerUrl = `${withoutTrailingSlash(listener.url)}${inspectorRoute}`

      logger.info(`UnoCSS inspector available at: ${
        (chalk as any).underline.yellow(withTrailingSlash(viewerUrl))
      }`)
    })
  }
}
