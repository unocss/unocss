import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '../../../plugins-common'
import { IMPORT_CSS } from '../../../plugins-common'

export function ShadowDomModuleModePlugin({ uno }: UnocssPluginContext): Plugin {
  const partRegex = /^part-\[.*]:/
  const nameRegexp = /<([^\s>]+)\s*([^>]*)>/
  const cache = new Map<string, RegExp>()
  async function transformWebComponent(code: string) {
    const imported = code.match(IMPORT_CSS)
    if (!imported)
      return code

    // eslint-disable-next-line prefer-const
    let { css, matched } = await uno.generate(code, { preflights: false })

    if (css && matched) {
      const partsToApply = Array.from(matched).reduce((acc, e) => {
        if (e.match(partRegex)) {
          const cssEntryRegex = `\\\.${e.replace(
            /\[/g, '\\\\\\\[',
          ).replace(
            /]/g, '\\\\\\\]',
          ).replace(
            /:/g, '\\\\\\:')}`
          let element: RegExpExecArray | null
          let useCode = code
          // eslint-disable-next-line no-cond-assign
          while (element = nameRegexp.exec(useCode)) {
            if (element[2].includes(e)) {
              acc.set(
                cssEntryRegex,
                element[1],
              )
            }
            useCode = useCode.slice(element[0].length + 1)
          }
        }

        return acc
      }, new Map<string, string>())
      if (partsToApply) {
        css = Array.from(partsToApply.entries()).reduce((k, [r, name]) => {
          let regexp = cache.get(r)
          if (!regexp) {
            regexp = new RegExp(`(${r})`, 'g')
            cache.set(r, regexp)
          }
          return k.replace(regexp, name)
        }, css)
      }
    }

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
