import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '../../../plugins-common'
import { IMPORT_CSS } from '../../../plugins-common'

export function ShadowDomModuleModePlugin({ uno }: UnocssPluginContext): Plugin {
  const partExtractorRegex = /^part-\[(.+)]:/
  const nameRegexp = /<([^\s^!>]+)\s*([^>]*)>/
  type PartData = {
    part: string
    rule: string
  }
  const checkElement = (useParts: PartData[], idxResolver: (name: string) => number, element: RegExpExecArray | null) => {
    if (!element)
      return null

    return useParts.filter(p => element[2].includes(p.rule)).map(({ rule, part }) => {
      const idx = idxResolver(element[1])
      return [
        element[1],
        `.${rule.replace(
          /\[/g, '\\[',
        ).replace(
          /]/g, '\\]',
        ).replace(
          /:/g, '\\:')}::part(${part})`,
        `${element[1]}:nth-of-type(${idx})::part(${part})`,
      ]
    })
  }
  async function transformWebComponent(code: string) {
    const imported = code.match(IMPORT_CSS)
    if (!imported)
      return code

    // eslint-disable-next-line prefer-const
    let { css, matched } = await uno.generate(code, { preflights: false })

    if (css && matched) {
      // filter only parts from the result reported from the generator
      const useParts = Array.from(matched).reduce((acc, rule) => {
        const matcher = rule.match(partExtractorRegex)
        if (matcher)
          acc.push({ part: matcher[1], rule })

        return acc
      }, new Array<PartData>())
      const partsToApply = new Map<string, Array<string>>()
      if (useParts.length > 0) {
        let useCode = code
        let element: RegExpExecArray | null
        const elementIdxMap = new Map<string, number>()
        // We need to traverse the code to find the web components using the original class/attr part.
        // We need traverse the code to apply the same order the components are on the code.
        // A web component can have multiple parts, and so, we need to collect all of them: see checkElement above.
        const idxResolver = (name: string): number => {
          let idx = elementIdxMap.get(name)
          if (!idx) {
            idx = 1
            elementIdxMap.set(name, idx)
          }
          return idx
        }
        // eslint-disable-next-line no-cond-assign
        while (element = nameRegexp.exec(useCode)) {
          const result = checkElement(
            useParts,
            idxResolver,
            element,
          )
          if (result && result.length > 0) {
            // the first element is the web component name
            result.forEach(([, name, replacement]) => {
              let list = partsToApply.get(name)
              if (!list) {
                list = []
                partsToApply.set(name, list)
              }
              list.push(replacement)
            })
            const [name] = result[0]
            elementIdxMap.set(name, elementIdxMap.get(name)! + 1)
          }
          useCode = useCode.slice(element[0].length + 1)
        }
        if (partsToApply.size > 0) {
          css = Array.from(partsToApply.entries()).reduce((k, [r, name]) => {
            return k.replace(r, name.join(',\n'))
          }, css)
        }
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
