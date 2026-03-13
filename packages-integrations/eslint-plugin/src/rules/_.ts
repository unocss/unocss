import type { run } from '../worker'
import { join } from 'node:path'
import { RuleCreator } from '@typescript-eslint/utils/eslint-utils'
import { createSyncFn } from 'synckit'
import { distDir } from '../dirs'

export const syncAction = createSyncFn(join(distDir, 'worker.mjs')) as typeof run

export const createRule = RuleCreator(
  () => 'https://unocss.dev/integrations/eslint#rules',
)
