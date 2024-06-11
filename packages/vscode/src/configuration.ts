import { toArray } from '@unocss/core'
import type { ExtensionContext } from 'vscode'
import { workspace } from 'vscode'
import type { AutoCompleteMatchType } from '@unocss/autocomplete'
import { createNanoEvents } from '../../core/src/utils/events'

export interface UseConfigurationOptions<Init> {
  ext?: ExtensionContext
  scope?: string
  initialValue: Init
  alias?: Partial<Record<keyof Init, string>>
}

export type ConfigurationListenerMap<Init> = Map<keyof Init, WatchConfigurationHandler<Init, keyof Init>>

export type WatchConfigurationHandler<Init, K extends keyof Init> = (value: Init[K]) => void

export function getConfigurations<Init extends Record<string, unknown>>(options: UseConfigurationOptions<Init>) {
  const { initialValue, alias, scope, ext } = options
  const configuration = {} as Init

  const getConfigurationKey = (key: keyof Init) => {
    key = alias?.[key] ?? key
    return [scope, key].filter(Boolean).join('.')
  }

  const reload = () => {
    const _config = workspace.getConfiguration()
    for (const key in initialValue) {
      const configurationKey = getConfigurationKey(key)
      configuration[key] = _config.get(configurationKey, initialValue[key])
    }
  }

  const reset = () => {
    const _config = workspace.getConfiguration()
    for (const key in initialValue) {
      configuration[key] = initialValue[key]
      const configurationKey = getConfigurationKey(key)
      _config.update(configurationKey, initialValue[key], true)
    }
  }

  reload()

  const emitter = createNanoEvents()

  const watchChanged = <K extends keyof Init>(key: K | K[], fn: WatchConfigurationHandler<Init, K>) => {
    const keys = toArray(key)
    const unsubscribes = keys.map(key => emitter.on(`update:${String(key)}`, fn))
    return () => unsubscribes.forEach(fn => fn())
  }

  const disposable = workspace.onDidChangeConfiguration((e) => {
    const _config = workspace.getConfiguration()
    const changedKeys = new Set<keyof Init>()

    for (const key in initialValue) {
      const configurationKey = getConfigurationKey(key)
      if (e.affectsConfiguration(configurationKey)) {
        const value = _config.get(configurationKey, initialValue[key])
        configuration[key as keyof Init] = value as Init[keyof Init]
        changedKeys.add(key)
      }
    }
    for (const key of changedKeys)
      emitter.emit(`update:${String(key)}`, configuration[key])
  })

  if (ext)
    ext.subscriptions.push(disposable)

  return {
    configuration,
    watchChanged,
    disposable,
    reload,
    reset,
  }
}

export function useConfigurations(ext: ExtensionContext) {
  return getConfigurations({
    ext,
    scope: 'unocss',
    initialValue: {
      colorPreview: true,
      colorPreviewRadius: '50%',
      languagesIds: <string[]>[],
      matchType: <AutoCompleteMatchType>'prefix',
      maxItems: 1000,
      remToPxPreview: false,
      remToPxRatio: 16,
      underline: true,
      selectionStyle: true,
      strictAnnotationMatch: true,
    },
    alias: {
      matchType: 'autocomplete.matchType',
      maxItems: 'autocomplete.maxItems',
    },
  })
}
