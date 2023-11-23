import process from 'node:process'
import { loadConfig } from '@unocss/config'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { runAsWorker } from 'synckit'
import { sortRules } from '../../shared-integration/src/sort-rules'

let promise: Promise<UnoGenerator<any>> | undefined

// bypass icon rules in ESLint
process.env.ESLINT ||= 'true'

async function _getGenerator() {
  const { config, sources } = await loadConfig()
  if (!sources.length)
    throw new Error('[@unocss/eslint-plugin] No config file found, create a `uno.config.ts` file in your project root and try again.')
  return createGenerator({
    ...config,
    warn: false,
  })
}

export async function getGenerator() {
  promise = promise || _getGenerator()
  return await promise
}

export function setGenerator(generator: Awaited<UnoGenerator<any>>) {
  promise = Promise.resolve(generator)
}

async function actionSort(classes: string) {
  return await sortRules(classes, await getGenerator())
}

async function actionBlocklist(classes: string, id?: string) {
  const uno = await getGenerator()
  const blocked = new Set<string>()

  const extracted = await uno.applyExtractors(classes, id)
  const values = [...extracted.values()]

  const matchBlocked = async (raw: string) => {
    if (blocked.has(raw))
      return
    if (uno.isBlocked(raw)) {
      blocked.add(raw)
      return
    }
    let current = raw
    for (const p of uno.config.preprocess)
      current = p(raw)!
    const applied = await uno.matchVariants(raw, current)
    if (applied && uno.isBlocked(applied[1]))
      blocked.add(raw)
  }

  await Promise.all(values.map(matchBlocked))

  return [...blocked]
}

export function runAsync(action: 'sort', classes: string): Promise<string>
export function runAsync(action: 'blocklist', classes: string, id?: string): Promise<string[]>
export async function runAsync(action: string, ...args: any[]): Promise<any> {
  switch (action) {
    case 'sort':
      // @ts-expect-error cast
      return actionSort(...args)
    case 'blocklist':
      // @ts-expect-error cast
      return actionBlocklist(...args)
  }
}

export function run(action: 'sort', classes: string): string
export function run(action: 'blocklist', classes: string, id?: string): string[]
export function run(action: string, ...args: any[]): any {
  // @ts-expect-error cast
  return runAsync(action, ...args)
}

runAsWorker(run as any)
