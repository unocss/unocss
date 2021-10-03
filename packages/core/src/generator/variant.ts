import { Variant, ResolvedConfig, ApplyVariantResult } from '../types'

export function applyVariants(config: ResolvedConfig, raw: string): ApplyVariantResult {
  // process variants
  const variants: Variant[] = []
  let processed = raw
  let applied = false
  while (true) {
    applied = false
    for (const v of config.variants) {
      const result = v.match(processed, config.theme)
      if (result && result !== processed) {
        processed = result
        variants.push(v)
        applied = true
        break
      }
    }
    if (!applied)
      break
  }

  return [raw, processed, variants]
}
