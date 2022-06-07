import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import type { MaybeRef } from '@vueuse/core'
import { computed, unref } from 'vue'

export function useCSSPrettify(mod: MaybeRef<any>, toggle: MaybeRef<boolean>) {
  return computed(() => {
    if (!unref(toggle))
      return unref(mod)?.css || '/* empty */'
    try {
      return prettier.format(unref(mod)?.css || '', {
        parser: 'css',
        plugins: [parserCSS],
      })
    }
    catch (e: any) {
      console.error(e)
      return `/* Error on prettifying: ${e.message} */\n${unref(mod)?.css || ''}`
    }
  })
}
