import type { Disposable } from 'vscode'
import type { ConfigShorthandTypeMap } from './generated/meta'
import { languages, window, workspace } from 'vscode'
import { defaultLanguageIds } from './constants'
import { configs } from './generated/meta'

export function getConfig(): ConfigShorthandTypeMap & {
  watchChanged: (keys: (keyof ConfigShorthandTypeMap)[], callback: () => void) => Disposable
} {
  function watchChanged(keys: (keyof ConfigShorthandTypeMap)[], callback: () => void) {
    const fullKeys = keys.map(key => configs[key].key)
    return workspace.onDidChangeConfiguration((e) => {
      if (fullKeys.some(key => e.affectsConfiguration(key))) {
        callback()
      }
    })
  }

  const object = {
    watchChanged,
  } as any

  const config = workspace.getConfiguration()

  for (const [key, value] of Object.entries(configs) as any) {
    Object.defineProperty(object, key, {
      get() {
        return config.get(value.key, value.default)
      },
    })
  }

  return object
}

async function validateLanguages(targets: string[], allLanguages: string[]) {
  const invalidLanguages: string[] = []
  const validLanguages = targets.filter((language) => {
    if (!allLanguages.includes(language)) {
      invalidLanguages.push(language)
      return false
    }
    return true
  })
  if (invalidLanguages.length)
    window.showWarningMessage(`These language configurations are illegal: ${invalidLanguages.join(',')}`)

  return validLanguages
}

export async function getLanguageIds() {
  const allLanguages = await languages.getLanguages()
  const languagesIds: string[] = getConfig().languageIds || []

  return Array.from(
    new Set(
      [
        ...defaultLanguageIds,
        ...await validateLanguages(languagesIds, allLanguages),
      ]
        .filter(i => allLanguages.includes(i)),
    ),
  )
}
