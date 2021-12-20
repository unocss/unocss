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

    const applyParts = useParts.filter(p => element[2].includes(p.rule))
    if (applyParts.length === 0)
      return null

    const name = element[1]
    return {
      name,
      entries: applyParts.map(({ rule, part }) => {
        const idx = idxResolver(name)
        return [
          `.${rule.replace(
            /\[/g, '\\[',
          ).replace(
            /]/g, '\\]',
          ).replace(
            /:/g, '\\:')}::part(${part})`,
          `${name}:nth-of-type(${idx})::part(${part})`,
        ]
      }),
    }
  }
  const idxMapFactory = () => {
    const elementIdxMap = new Map<string, number>()
    return {
      elementIdxMap,
      idxResolver: (name: string) => {
        let idx = elementIdxMap.get(name)
        if (!idx) {
          idx = 1
          elementIdxMap.set(name, idx)
        }
        return idx
      },
    }
  }
  const transformWebComponent = async(code: string) => {
    if (!code.match(IMPORT_CSS))
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
      if (useParts.length > 0) {
        let useCode = code
        let element: RegExpExecArray | null
        const partsToApply = new Map<string, Array<string>>()
        const { elementIdxMap, idxResolver } = idxMapFactory()
        // We need to traverse the code to find the web components using the original class/attr part.
        // We need traverse the code to apply the same order the components are on the code: we are using nth-of-type.
        // A web component can have multiple parts, and so, we need to collect all of them: see checkElement above.
        // eslint-disable-next-line no-cond-assign
        while (element = nameRegexp.exec(useCode)) {
          const result = checkElement(
            useParts,
            idxResolver,
            element,
          )
          if (result) {
            result.entries.forEach(([name, replacement]) => {
              let list = partsToApply.get(name)
              if (!list) {
                list = []
                partsToApply.set(name, list)
              }
              list.push(replacement)
            })
            elementIdxMap.set(result.name, elementIdxMap.get(result.name)! + 1)
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
