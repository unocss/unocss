import { useLogger, useNuxt } from '@nuxt/kit'
import pluginInspector from '@unocss/inspector'
import { withTrailingSlash, withoutTrailingSlash } from 'ufo'
import * as chalk from 'chalk'

export function addInspector() {
  const nuxt = useNuxt()
  const inspectorRoute = '/_unocss'

  if (nuxt.options.dev && nuxt.options.builder === '@nuxt/vite-builder') {
    nuxt.options.vite.plugins = nuxt.options.vite.plugins || []
    nuxt.options.vite.plugins.push(pluginInspector({} as never))

    nuxt.hook('listen', (_, listener) => {
      const logger = useLogger()

      const viewerUrl = `${withoutTrailingSlash(listener.url)}${inspectorRoute}`

      logger.info(`UnoCSS inspector: ${(chalk as any).underline.yellow(withTrailingSlash(viewerUrl))}`)
    })
  }
}
