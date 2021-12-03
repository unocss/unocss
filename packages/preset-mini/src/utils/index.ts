export * from './mappings'
export * from './handlers'
export * from './variants'

export function capitalize<T extends string>(str: T) {
  return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>
}
