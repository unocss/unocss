import type { MaybeRefOrGetter } from 'vue'
import { computedAsync } from '@vueuse/core'
import parserBabel from 'prettier/parser-babel'
import parserHTML from 'prettier/parser-html'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { toValue } from 'vue'

export async function prettify(content: string | undefined, type: 'css' | 'babel' | 'html') {
  const plugins = {
    css: parserCSS,
    html: parserHTML,
    babel: parserBabel,
  }
  try {
    return await prettier.format(content || '', {
      parser: type,
      plugins: [plugins[type]],
      singleQuote: true,
      semi: false,
    })
  }
  catch (e: any) {
    console.error(e)
    return `/* Error on prettifying: ${e.message} */\n${content || ''}`
  }
}

export function usePrettify(content: MaybeRefOrGetter<string | undefined>, toggle: MaybeRefOrGetter<boolean>, type: 'css' | 'babel' | 'html') {
  return computedAsync(async () => {
    if (!toValue(toggle))
      return toValue(content) || '/* empty */'

    return prettify(toValue(content), type)
  })
}

export function useCSSPrettify(content: MaybeRefOrGetter<string | undefined>, toggle: MaybeRefOrGetter<boolean> = true) {
  return usePrettify(content, toggle, 'css')
}

export function useHTMLPrettify(content: MaybeRefOrGetter<string | undefined>, toggle: MaybeRefOrGetter<boolean> = true) {
  return usePrettify(content, toggle, 'html')
}

export function useJSPrettify(content: MaybeRefOrGetter<string | undefined>, toggle: MaybeRefOrGetter<boolean> = true) {
  return usePrettify(content, toggle, 'babel')
}
