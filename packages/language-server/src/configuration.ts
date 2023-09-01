import { toArray } from '@unocss/core'
import type { AutoCompleteMatchType } from '@unocss/autocomplete'
import { type Connection, type Disposable } from 'vscode-languageserver'
import { createNanoEvents } from '../../core/src/utils/events'
import type { ConfigurationService } from './types'
import { getValue } from './utils'

export interface UseConfigurationOptions<Config> {
  scope?: string
  initialValue: Config
  alias?: Partial<Record<keyof Config, string>>
}

export function getConfigurations<Config extends Record<string, unknown>>(connection: Connection, options: UseConfigurationOptions<Config>): ConfigurationService<Config> {
  const { initialValue, alias, scope } = options
  const configuration = {
    ...initialValue,
  } as Config

  const workspace = connection.workspace

  const disposables: Disposable[] = []

  const getConfigurationKey = (key: keyof Config) => {
    key = alias?.[key] ?? key
    return [scope, key].filter(Boolean).join('.')
  }

  const events = createNanoEvents()

  let isReady = false

  const ready = new Promise<Config>((resolve) => {
    events.on('ready', resolve)
  })

  const reload = async () => {
    const changedSettings = await workspace.getConfiguration()
    for (const key in initialValue) {
      const configurationKey = getConfigurationKey(key)
      configuration[key] = getValue(changedSettings, configurationKey, initialValue[key]) as Config[typeof key]
    }
    if (!isReady) {
      isReady = true
      events.emit('ready', configuration)
    }
  }

  const watchChanged = (
    key: any,
    fn: (value: any) => void,
    options: { immediate?: boolean } = {},
  ) => {
    const isArray = Array.isArray(key)
    const keys = toArray(key)
    const off = events.on('update', (changedKeys: (keyof Config)[]) => {
      const changed = keys.some(k => changedKeys.includes(k))
      if (changed)
        fn(isArray ? keys.map(k => configuration[k]) : configuration)
    })
    if (options.immediate) {
      ready.then(() => {
        events.emit('update', keys)
      })
    }
    return off
  }

  disposables.push(
    connection.onDidChangeConfiguration(async () => {
      const changedSettings = await workspace.getConfiguration()
      const changedKeys = new Set<keyof Config>()

      for (const key in initialValue) {
        const configurationKey = getConfigurationKey(key)
        const lastValue = configuration[configurationKey]
        const value = getValue(changedSettings, configurationKey, initialValue[key])
        if (lastValue !== value) {
          configuration[key as keyof Config] = value as Config[keyof Config]
          changedKeys.add(key)
        }
      }
      if (changedKeys.size > 0)
        events.emit('update', Array.from(changedKeys))
    }),
  )

  const dispose = () => {
    disposables.forEach(fn => fn.dispose())
  }

  return {
    configuration,
    events,
    ready,
    watchChanged,
    reload,
    dispose,
  }
}

export function useConfigurations(connection: Connection) {
  return getConfigurations(connection, {
    scope: 'unocss',
    initialValue: {
      colorPreview: true,
      languagesIds: <string[]>[],
      matchType: <AutoCompleteMatchType>'prefix',
      maxItems: 1000,
      remToPxPreview: false,
      remToPxRatio: 16,
      underline: true,
    },
    alias: {
      matchType: 'autocomplete.matchType',
      maxItems: 'autocomplete.maxItems',
    },
  })
}
