import { toArray } from '@unocss/core'
import type { AutoCompleteMatchType } from '@unocss/autocomplete'
import type { Connection, Disposable } from 'vscode-languageserver'
import type { Emitter } from './integration'
import { createNanoEvents } from './integration'
import type { ConfigurationService } from './types'
import { getValue } from './utils'

export interface UseConfigurationOptions<Config> {
  scope?: string
  initialValue: Config
  alias?: Partial<Record<keyof Config, string>>
  events?: Emitter<{
    serviceReady: () => void
    configChanged: (changedKeys: (keyof Config)[]) => void
  }>
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

  const events = options.events ?? createNanoEvents()

  const reload = async () => {
    const changedSettings = await workspace.getConfiguration()
    for (const key in initialValue) {
      const configurationKey = getConfigurationKey(key)
      configuration[key] = getValue(changedSettings, configurationKey, initialValue[key]) as Config[typeof key]
    }
  }

  const waitServiceReady = async () => {
    return new Promise<void>((resolve) => {
      events.on('serviceReady', () => {
        resolve()
      })
    })
  }

  const ready = (async () => {
    await waitServiceReady()
    await reload()
    return configuration
  })()

  const watchChanged = (
    key: any,
    fn: (value: any) => void,
    options: { immediate?: boolean } = {},
  ) => {
    const isArray = Array.isArray(key)
    const keys = toArray(key)
    const off = events.on('configChanged', (changedKeys: (keyof Config)[]) => {
      const changed = keys.some(k => changedKeys.includes(k))
      if (changed)
        fn(isArray ? keys.map(k => configuration[k]) : configuration)
    })
    if (options.immediate) {
      ready.then(() => {
        events.emit('configChanged', keys)
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
        events.emit('configChanged', Array.from(changedKeys))
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

export function useConfigurations(connection: Connection, events?: ReturnType<typeof createNanoEvents>) {
  return getConfigurations(connection, {
    events,
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
