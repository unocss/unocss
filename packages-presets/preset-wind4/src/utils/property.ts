import type { Postprocessor } from '@unocss/core'
import { symbols } from '@unocss/core'

// Shared definition provenance only. Used-state belongs to resolved metadata.
const definitions = new WeakMap<object, Readonly<{ property: string, fallback: string }>>()

export function describeProperty(control: object, property: string, fallback: string) {
  definitions.set(control, { property, fallback })
}

export function collectProperties(properties: Map<string, string>): Postprocessor {
  return (util) => {
    const control = util.entries.find(([key]) => Object.is(key, symbols.variants))?.[1]
    const definition = typeof control === 'function' ? definitions.get(control) : undefined
    if (definition && !properties.has(definition.property))
      properties.set(definition.property, definition.fallback)
  }
}
