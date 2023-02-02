import { loadConfig } from '@unocss/config'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { runAsWorker } from 'synckit'
import { sortRules } from '../../shared-integration/src/sort-rules'

async function getGenerator() {
  const { config } = await loadConfig()
  return createGenerator(config)
}

let promise: Promise<UnoGenerator<any>> | undefined

runAsWorker(async (classes: string) => {
  promise = promise || getGenerator()
  const uno = await promise
  return await sortRules(classes, uno)
})
