import type { TransformClassesOptions } from '../types'
import { hash } from './hash'

export function generateClassName(body: string, options: TransformClassesOptions, filename: string): string {
  const {
    classPrefix = 'uno-',
    combine = true,
    hashFn = hash,
  } = options

  if (combine) {
    const classPlusFilenameHash = hashFn(body + filename)
    return `${classPrefix}${classPlusFilenameHash}`
  }
  else {
    const filenameHash = hashFn(filename)
    return `_${body}_${filenameHash}` // certain classes (!mt-1, md:mt-1, space-x-1) break when coming at the beginning of a shortcut
  }
}
