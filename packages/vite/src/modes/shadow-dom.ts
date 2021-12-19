import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '../../../plugins-common'
import { IMPORT_CSS } from '../../../plugins-common'

export function ShadowDomModuleModePlugin({ uno }: UnocssPluginContext): Plugin {
  async function transformWebComponent(code: string) {
    const imported = code.match(IMPORT_CSS)
    if (!imported)
      return code

    const { css } = await uno.generate(code, { preflights: false })
    return code.replace(IMPORT_CSS, css || '')
  }

  return {
    name: 'unocss:shadow-dom',
    enforce: 'pre',
    async transform(code) {
      return transformWebComponent(code)
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      ctx.read = async() => {
        const code = await read()
        return await transformWebComponent(code)
      }
    },
  }
}
