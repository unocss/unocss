import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import parserHTML from 'prettier/parser-html'
import parserBabel from 'prettier/parser-babel'
import type { MaybeRef } from '@vueuse/core'
import { computed, unref } from 'vue'

export function usePrettify(content: MaybeRef<string | undefined>, toggle: MaybeRef<boolean>, type: 'css' | 'babel' | 'html') {
  const plugins = {
    css: parserCSS,
    html: parserHTML,
    babel: parserBabel,
  }
  return computed(() => {
    if (!unref(toggle))
      return unref(content) || '/* empty */'

    try {
      return prettier.format(unref(content) || '', {
        parser: type,
        plugins: [plugins[type]],
        singleQuote: true,
        semi: false,
      })
    }
    catch (e: any) {
      console.error(e)
      return `/* Error on prettifying: ${e.message} */\n${unref(content) || ''}`
    }
  })
}

export function useCSSPrettify(content: MaybeRef<string | undefined>, toggle: MaybeRef<boolean> = true) {
  return usePrettify(content, toggle, 'css')
}

export function useHTMLPrettify(content: MaybeRef<string | undefined>, toggle: MaybeRef<boolean> = true) {
  return usePrettify(content, toggle, 'html')
}

export function useJSPrettify(content: MaybeRef<string | undefined>, toggle: MaybeRef<boolean> = true) {
  return usePrettify(content, toggle, 'babel')
}
