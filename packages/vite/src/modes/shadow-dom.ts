import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '../../../plugins-common'
import { IMPORT_CSS } from '../../../plugins-common'

export function ShadowDomModuleModePlugin({ uno }: UnocssPluginContext): Plugin {
  const partRegex = /^part-\[.*]:/
  const partExtractorRegex = /^part-\[(.+)]:/
  const nameRegexp = /<([^\s>]+)\s*([^>]*)>/
  async function transformWebComponent(code: string) {
    const imported = code.match(IMPORT_CSS)
    if (!imported)
      return code

    // eslint-disable-next-line prefer-const
    let { css, matched } = await uno.generate(code, { preflights: false })

    if (css && matched) {
      let i = 1
      // check if we need to apply some ::part
      const partsToApply = Array.from(matched).reduce((acc, e) => {
        if (e.match(partRegex)) {
          let element: RegExpExecArray | null
          let useCode = code
          // eslint-disable-next-line no-cond-assign
          while (element = nameRegexp.exec(useCode)) {
            if (element[2].includes(e)) {
              const part = e.match(partExtractorRegex)![1]
              const cssEntryRegex = `${i}-.${e.replace(
                /\[/g, '\\[',
              ).replace(
                /]/g, '\\]',
              ).replace(
                /:/g, '\\:')}::part(${part})`
              acc.set(
                cssEntryRegex,
                `${element[1]}:nth-of-type(${i})::part(${part})`,
              )
              i++
            }
            useCode = useCode.slice(element[0].length + 1)
          }
        }

        return acc
      }, new Map<string, string>())
      if (partsToApply.size > 0) {
        css = Array.from(partsToApply.entries()).reduce((k, [r, name]) => {
          return k.replace(r.slice(r.indexOf('-') + 1), name)
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
