import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import type { MaybeRef } from '@vueuse/core'
import { computed, unref } from 'vue'

export function useCSSPrettify(mod: MaybeRef<any>, toggle: MaybeRef<boolean>) {
  return computed(() => {
    if (!unref(toggle))
      return mod.value?.css || '/* empty */'
    try {
      return prettier.format(mod.value?.css || '', {
        parser: 'css',
        plugins: [parserCSS],
      })
    }
    catch (e: any) {
      console.error(e)
      return `/* Error on prettifying: ${e.message} */\n${mod.value?.css || ''}`
    }
  })
}
