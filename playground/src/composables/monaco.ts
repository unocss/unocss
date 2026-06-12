import type { ReplStore } from '@unocss/repl'
import { ensureMonacoSetup, registerUnoProviders } from '@unocss/repl/monaco'
// Monaco web workers — resolved by the playground's Vite (the `?worker` suffix
// only works in the consuming app, since `@unocss/repl` externalizes monaco-editor).
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

let initialized = false

/**
 * One-time Monaco setup for the playground: configure the worker environment,
 * define the editor themes, and register UnoCSS providers backed by the live
 * generator/autocomplete (so completions track the user's evolving config).
 */
export function setupMonaco(store?: ReplStore) {
  if (initialized)
    return
  initialized = true

  self.MonacoEnvironment = {
    getWorker(_, label) {
      switch (label) {
        case 'json':
          return new JsonWorker()
        case 'css':
        case 'scss':
        case 'less':
          return new CssWorker()
        case 'html':
        case 'handlebars':
        case 'razor':
          return new HtmlWorker()
        case 'typescript':
        case 'javascript':
          return new TsWorker()
        default:
          return new EditorWorker()
      }
    },
  }

  ensureMonacoSetup()

  if (store) {
    registerUnoProviders('html', {
      getGenerator: () => store.getUno(),
      getAutocomplete: () => store.getAutocomplete(),
    })
  }
}
