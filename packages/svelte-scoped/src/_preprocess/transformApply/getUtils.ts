import type { StringifiedUtil, UnoGenerator } from '@unocss/core'
import { expandVariantGroup, warnOnce } from '@unocss/core'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export async function getUtils(body: string, uno: UnoGenerator): Promise<StringifiedUtil[]> {
  const classNames = expandVariantGroup(body)
    .split(/\s+/g)
    .map(className => className.trim().replace(/\\/, ''))

  const utils = await parseUtils(classNames, uno)
  const sortedByRankIndex = utils.sort(([aIndex], [bIndex]) => aIndex - bIndex)
  const sortedByParentOrders = sortedByRankIndex.sort(([, , , aParent], [, , , bParent]) => (aParent ? uno.parentOrders.get(aParent) ?? 0 : 0) - (bParent ? uno.parentOrders.get(bParent) ?? 0 : 0))

  return sortedByParentOrders
    .reduce((acc, item) => {
      const [, selector, body, parent] = item
      const sibling = acc.find(([, targetSelector, , targetParent]) => targetSelector === selector && targetParent === parent)
      if (sibling)
        sibling[2] += body
      else
        // use spread operator to prevent reassign to uno internal cache
        acc.push([...item] as Writeable<StringifiedUtil>)
      return acc
    }, [] as Writeable<StringifiedUtil>[])
}

async function parseUtils(classNames: string[], uno: UnoGenerator<{}>) {
  const foundUtils: StringifiedUtil[][] = []

  for (const token of classNames) {
    const util = await uno.parseToken(token, '-')
    if (util)
      foundUtils.push(util)
    else
      warnOnce(`'${token}' not found. You have a typo or need to add a preset.`)
  }

  return foundUtils.flat()
}
