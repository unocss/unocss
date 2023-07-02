import { toArray } from '@unocss/core'
import type { ExtensionContext } from 'vscode'
import { workspace } from 'vscode'
import { createNanoEvents } from '../../core/src/utils/events'

export interface ReactiveConfigurationOptions<Init> {
  ext?: ExtensionContext
  scope?: string
  initValue: Init
  alias?: Partial<Record<keyof Init, string>>
}

export type ConfigurationListenerMap<Init> = Map<keyof Init, WatchConfigurationHandler<Init, keyof Init>>

export type WatchConfigurationHandler<Init, K extends keyof Init> = (value: Init[K]) => void

export function reactiveConfiguration<Init extends Record<string, unknown>>(options: ReactiveConfigurationOptions<Init>) {
  const { initValue, alias, scope, ext } = options
  const configuration = {} as Init

  const getConfigurationKey = (key: keyof Init) => {
    key = alias?.[key] ?? key
    return [scope, key].filter(Boolean).join('.')
  }

  const reload = () => {
    const _config = workspace.getConfiguration()
    for (const key in initValue) {
      const configurationKey = getConfigurationKey(key)
      configuration[key] = _config.get(configurationKey, initValue[key])
    }
  }

  const reset = () => {
    const _config = workspace.getConfiguration()
    for (const key in initValue) {
      configuration[key] = initValue[key]
      const configurationKey = getConfigurationKey(key)
      _config.update(configurationKey, initValue[key], true)
    }
  }

  reload()

  const emitter = createNanoEvents()

  const watchConfiguration = <K extends keyof Init>(key: K | K[], fn: WatchConfigurationHandler<Init, K>) => {
    const keys = toArray(key)
    const unsubscribes = keys.map(key => emitter.on(`update:${String(key)}`, fn))
    return () => unsubscribes.forEach(fn => fn())
  }

  const disposable = workspace.onDidChangeConfiguration((e) => {
    const _config = workspace.getConfiguration()
    const changedKeys = new Set<keyof Init>()

    for (const key in initValue) {
      const configurationKey = getConfigurationKey(key)
      if (e.affectsConfiguration(configurationKey)) {
        const value = _config.get(configurationKey, initValue[key])
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
    watchConfiguration,
    disposable,
    reload,
    reset,
  }
}
