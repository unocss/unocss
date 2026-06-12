import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { UserConfig } from '../index'

/**
 * Create a CodeMirror completion source backed by UnoCSS autocomplete.
 */
export function createUnoCompletionSource(unocssConfig?: UserConfig) {
  let autoComplete: any = null
  let generator: any = null

  async function ensureAutocomplete() {
    if (!generator) {
      const { createGenerator } = await import('@unocss/core')
      generator = await createGenerator(unocssConfig)
    }
    if (!autoComplete) {
      const { createAutocomplete } = await import('@unocss/autocomplete')
      autoComplete = createAutocomplete(generator)
    }
    return { autoComplete, generator }
  }

  return async function unoCompletionSource(context: CompletionContext): Promise<CompletionResult | null> {
    try {
      const { autoComplete } = await ensureAutocomplete()
      const code = context.state.doc.toString()
      const offset = context.pos

      const result = await autoComplete.suggestInFile(code, offset)

      if (!result?.suggestions?.length)
        return null

      const resolved = result.resolveReplacement(result.suggestions[0][0])
      return {
        from: resolved.start,
        to: resolved.end,
        options: result.suggestions.map(([value, label]: [string, string]) => ({
          label,
          type: 'value',
          apply: value,
        })),
      }
    }
    catch {
      return null
    }
  }
}
