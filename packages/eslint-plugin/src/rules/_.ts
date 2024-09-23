import type { run } from '../worker'
import { join } from 'node:path'
import { ESLintUtils } from '@typescript-eslint/utils'
import { createSyncFn } from 'synckit'
import { distDir } from '../dirs'

export const syncAction = createSyncFn(join(distDir, 'worker.mjs')) as typeof run

export const createRule = ESLintUtils.RuleCreator(
  () => 'https://unocss.dev/integrations/eslint#rules',
)
