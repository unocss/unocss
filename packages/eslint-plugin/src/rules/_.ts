import { join } from 'node:path'
import { createSyncFn } from 'synckit'
import { ESLintUtils } from '@typescript-eslint/utils'
import { distDir } from '../dirs'
import type { run } from '../worker'

export const syncAction = createSyncFn(join(distDir, 'worker.mjs')) as typeof run

export const createRule = ESLintUtils.RuleCreator(
  () => 'https://unocss.dev/integrations/eslint#rules',
)
