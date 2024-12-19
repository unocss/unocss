import type { BlocklistMeta, ResolvedConfig, UnoGenerator } from '@unocss/core'
import process from 'node:process'
import { loadConfig } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import { runAsWorker } from 'synckit'
import { sortRules } from '../../shared-integration/src/sort-rules'

const promises = new Map<string | undefined, Promise<UnoGenerator<any>> | undefined>()

// bypass icon rules in ESLint
process.env.ESLINT ||= 'true'

async function _getGenerator(configPath?: string) {
  const { config, sources } = await loadConfig(
    process.cwd(),
    configPath,
  )
  if (!sources.length)
    throw new Error('[@unocss/eslint-plugin] No config file found, create a `uno.config.ts` file in your project root and try again.')
  return createGenerator({
    ...config,
    warn: false,
  })
}

export async function getGenerator(configPath?: string) {
  let promise = promises.get(configPath)
  if (!promise) {
    promise = _getGenerator(configPath)
    promises.set(configPath, promise)
  }
  return await promise
}

export function setGenerator(generator: Awaited<UnoGenerator<any>>, configPath?: string | undefined) {
  promises.set(configPath, Promise.resolve(generator))
}

async function actionSort(configPath: string | undefined, classes: string, attribute = 'class') {
  const prefix = attribute.replace(/class(name)?/i, '')
  if (prefix) {
    classes = classes.split(/\s+/g).map(i => `${prefix}-${i}`).join(' ')
  }
  let sorted = await sortRules(classes, await getGenerator(configPath))
  if (prefix) {
    sorted = sorted.split(/\s+/g).map(i => i.replace(new RegExp(`^${prefix}-`), '')).join(' ')
  }
  return sorted
}

async function actionBlocklist(configPath: string | undefined, classes: string, id?: string): Promise<[string, BlocklistMeta | undefined][]> {
  const uno = await getGenerator(configPath)
  const blocked = new Map<string, BlocklistMeta | undefined>()

  const extracted = await uno.applyExtractors(classes, id)
  const values = [...extracted.values()]

  const getMeta = (raw: string, meta?: BlocklistMeta) => {
    return meta?.message
      ? {
          ...meta,
          message: typeof meta.message === 'function' ? meta.message(raw) : meta.message,
        }
      : meta
  }

  const matchBlocked = async (raw: string) => {
    if (blocked.has(raw))
      return
    const rule = uno.getBlocked(raw)
    if (rule) {
      blocked.set(raw, getMeta(raw, rule[1]))
      return
    }
    let current = raw
    for (const p of uno.config.preprocess)
      current = p(raw)!
    const results = await uno.matchVariants(raw, current)
    const rules = results.map(r => r && uno.getBlocked(r[1]))

    for (const rule of rules) {
      if (rule)
        blocked.set(raw, getMeta(raw, rule[1]))
    }
  }

  await Promise.all(values.map(matchBlocked))

  return [...blocked]
}

async function actionUnoConfig(configPath: string | undefined): Promise<ResolvedConfig> {
  const uno = await getGenerator(configPath)
  return uno.config
}

export function runAsync(configPath: string | undefined, action: 'sort', classes: string, attribute?: string): Promise<string>
export function runAsync(configPath: string | undefined, action: 'blocklist', classes: string, id?: string): Promise<[string, BlocklistMeta | undefined][]>
export function runAsync(configPath: string | undefined, action: 'config'): Promise<ResolvedConfig>
export async function runAsync(configPath: string | undefined, action: string, ...args: any[]): Promise<any> {
  switch (action) {
    case 'sort':
      // @ts-expect-error cast
      return actionSort(configPath, ...args)
    case 'blocklist':
      // @ts-expect-error cast
      return actionBlocklist(configPath, ...args)
    case 'config':
      // @ts-expect-error cast
      return actionUnoConfig(configPath, ...args)
  }
}

export function run(configPath: string | undefined, action: 'sort', classes: string, attribute?: string): string
export function run(configPath: string | undefined, action: 'blocklist', classes: string, id?: string): [string, BlocklistMeta | undefined][]
export function run(configPath: string | undefined, action: 'config'): ResolvedConfig
export function run(configPath: string | undefined, action: string, ...args: any[]): any {
  // @ts-expect-error cast
  return runAsync(configPath, action, ...args)
}

runAsWorker(run as any)
