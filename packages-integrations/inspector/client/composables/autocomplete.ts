import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { watch } from 'vue'
import { changeRevision, rpcCall } from './rpc'

const generatedCssCache = new Map<string, Promise<string | null>>()

watch(changeRevision, () => generatedCssCache.clear())

export async function getAutocompleteHint(context: CompletionContext): Promise<CompletionResult | null> {
  try {
    return await rpcCall<CompletionResult | null>(
      'get-autocomplete-suggestions',
      context.state.doc.toString(),
      context.pos,
    )
  }
  catch {
    // The inspector can render before its trusted RPC connection is ready.
    return null
  }
}

export async function getGeneratedCss(token: string): Promise<string | null> {
  let result = generatedCssCache.get(token)
  if (!result) {
    result = rpcCall<string | null>('get-generated-css', token).catch(() => {
      generatedCssCache.delete(token)
      return null
    })
    generatedCssCache.set(token, result)
  }
  return result
}
