import type { UnocssAutocomplete } from '@unocss/autocomplete'
import type { UnoGenerator } from '@unocss/core'
import type { UserConfig } from '../index'
import * as monaco from 'monaco-editor'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import vitesseDark from '../theme/vitesse-dark.json'
import vitesseLight from '../theme/vitesse-light.json'

/**
 * A live source of the UnoCSS generator + autocomplete used to back the editor
 * providers. Getters are invoked per request, so a host app can swap the
 * underlying instances when its config changes and the providers stay current.
 */
export interface UnoProviderSource {
  getGenerator: () => Promise<UnoGenerator>
  getAutocomplete: () => Promise<UnocssAutocomplete>
}

let setup = false

interface VSCodeTokenColor {
  scope?: string | string[]
  settings?: {
    foreground?: string
    fontStyle?: string
  }
}

interface VSCodeTheme {
  base: string
  colors: Record<string, string>
  tokenColors?: VSCodeTokenColor[]
}

function toMonacoTheme(theme: VSCodeTheme): monaco.editor.IStandaloneThemeData {
  const rules = (theme.tokenColors || []).flatMap((token) => {
    const scopes = Array.isArray(token.scope) ? token.scope : token.scope ? [token.scope] : []
    return scopes.map(scope => ({
      token: scope,
      foreground: token.settings?.foreground?.replace(/^#/, ''),
      fontStyle: token.settings?.fontStyle,
    }))
  })

  return {
    base: theme.base as monaco.editor.BuiltinTheme,
    inherit: true,
    rules,
    colors: theme.colors,
  }
}

async function formatHoverCSS(css: string) {
  try {
    return (await prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
      singleQuote: true,
      semi: false,
    })).trim()
  }
  catch {
    return css
  }
}

function getTokenAtPosition(model: monaco.editor.ITextModel, position: monaco.Position) {
  const line = model.getLineContent(position.lineNumber)
  const offset = position.column - 1
  const tokenRE = /[^\s"'`<>{}=]+/g
  let match: RegExpExecArray | null

  while ((match = tokenRE.exec(line))) {
    const rawStart = match.index
    const rawEnd = rawStart + match[0].length
    if (offset < rawStart || offset > rawEnd)
      continue

    const value = match[0].replace(/^[([,;]+|[\]),;]+$/g, '')
    if (!value)
      return null

    const trimStart = match[0].indexOf(value)
    const startColumn = rawStart + trimStart + 1
    return {
      value,
      range: {
        startLineNumber: position.lineNumber,
        startColumn,
        endLineNumber: position.lineNumber,
        endColumn: startColumn + value.length,
      },
    }
  }

  const wordInfo = model.getWordAtPosition(position)
  if (!wordInfo)
    return null

  const value = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: wordInfo.startColumn,
    endLineNumber: position.lineNumber,
    endColumn: wordInfo.endColumn,
  })

  return {
    value,
    range: {
      startLineNumber: position.lineNumber,
      startColumn: wordInfo.startColumn,
      endLineNumber: position.lineNumber,
      endColumn: wordInfo.endColumn,
    },
  }
}

/**
 * Define the `vitesse-dark` / `vitesse-light` themes once.
 *
 * Note: the Monaco web worker environment (`self.MonacoEnvironment`) must be
 * configured by the consuming application, since worker URLs are resolved by
 * the host bundler.
 */
export function ensureMonacoSetup() {
  if (setup)
    return
  setup = true

  monaco.editor.defineTheme('vitesse-dark', toMonacoTheme(vitesseDark))
  monaco.editor.defineTheme('vitesse-light', toMonacoTheme(vitesseLight))
}

/**
 * Build a provider source that lazily creates a generator + autocomplete from a
 * static config. Used by `UnoMonaco` when no live source is supplied.
 */
export function createConfigProviderSource(unocssConfig?: UserConfig): UnoProviderSource {
  let generator: Promise<UnoGenerator> | null = null
  let autoComplete: Promise<UnocssAutocomplete> | null = null

  function getGenerator() {
    if (!generator)
      generator = import('@unocss/core').then(m => m.createGenerator(unocssConfig))
    return generator
  }
  function getAutocomplete() {
    if (!autoComplete) {
      autoComplete = Promise.all([getGenerator(), import('@unocss/autocomplete')])
        .then(([gen, m]) => m.createAutocomplete(gen))
    }
    return autoComplete
  }
  return { getGenerator, getAutocomplete }
}

const registeredLanguages = new Set<string>()

/**
 * Register UnoCSS completion + hover providers for a Monaco language.
 *
 * Idempotent per language — the first registration wins, so a host that needs
 * live providers should register before any editor mounts.
 */
export function registerUnoProviders(language: string, source: UnoProviderSource) {
  if (registeredLanguages.has(language))
    return
  registeredLanguages.add(language)

  // Completion provider
  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters: ['-', ':', ' ', '"', '\''],
    async provideCompletionItems(model, position) {
      const code = model.getValue()
      const offset = model.getOffsetAt(position)

      try {
        const autoComplete = await source.getAutocomplete()
        const result = await autoComplete.suggestInFile(code, offset)

        if (!result?.suggestions?.length)
          return { suggestions: [] }

        const resolved = result.resolveReplacement(result.suggestions[0][0])
        const startPos = model.getPositionAt(resolved.start)
        const endPos = model.getPositionAt(resolved.end)
        const range = {
          startLineNumber: startPos.lineNumber,
          startColumn: startPos.column,
          endLineNumber: endPos.lineNumber,
          endColumn: endPos.column,
        }

        return {
          suggestions: result.suggestions.map(([value, label]: [string, string]) => ({
            label,
            insertText: value,
            kind: monaco.languages.CompletionItemKind.Value,
            range,
            sortText: '0',
          })),
        }
      }
      catch {
        return { suggestions: [] }
      }
    },
  })

  // Hover provider — shows generated CSS for the hovered utility
  monaco.languages.registerHoverProvider(language, {
    async provideHover(model, position) {
      try {
        const generator = await source.getGenerator()
        const token = getTokenAtPosition(model, position)
        if (!token)
          return null

        if (!token.value)
          return null

        const { css } = await generator.generate(new Set([token.value]), { preflights: false, safelist: false })
        if (!css)
          return null

        const formatted = await formatHoverCSS(css)
        return {
          range: token.range,
          contents: [
            { value: `\`\`\`css\n${formatted}\n\`\`\`` },
          ],
        }
      }
      catch {
        return null
      }
    },
  })
}
