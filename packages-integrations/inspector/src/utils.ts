import { dynamicUtilities, staticUtilities } from './categories'

export function getSelectorCategory(selector: string) {
  return staticUtilities[selector]
    || Object.entries(dynamicUtilities).find(([name]) => new RegExp(`^${name}+(-.+|[0-9]+)$`).test(selector))?.[1]
}

export function intersect<T>(a: T[], b: T[]) {
  return a.filter(item => b.includes(item))
}

export function getIntersections(items: string[][]) {
  const itemGroups: Record<string, string[]> = {}

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const common = intersect(items[i], items[j])
      if (common.length > 1) {
        const key = [...common].sort().join(' ')
        if (!itemGroups[key])
          itemGroups[key] = common
      }
    }
  }

  return Object.values(itemGroups)
}
