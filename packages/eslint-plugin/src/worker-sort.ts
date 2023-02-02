import { loadConfig } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import { runAsWorker } from 'synckit'
import { sortRules } from '../../shared-integration/src/sort-rules'

runAsWorker(async (classes: string) => {
  const { config } = await loadConfig()
  const uno = createGenerator(config)

  return await sortRules(classes, uno)
})
