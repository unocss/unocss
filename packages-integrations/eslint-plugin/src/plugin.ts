import type { UnoCSSEslintPlugin } from './types'
import { version } from '../package.json'
import blocklist from './rules/blocklist'
import enforceClassCompile from './rules/enforce-class-compile'
import order from './rules/order'
import orderAttributify from './rules/order-attributify'

export const plugin: UnoCSSEslintPlugin = {
  // `name` is used by ESLint for caching and by Oxlint as the rule prefix for `jsPlugins`.
  // It is `unocss` rather than the package name, as ESLint recommends, so the prefix
  // matches the flat config key and rule IDs stay the same when migrating to Oxlint.
  // Oxlint does not read `meta.namespace`. Renaming this changes every Oxlint rule ID.
  meta: {
    name: 'unocss',
    version,
  },
  rules: {
    order,
    'order-attributify': orderAttributify,
    blocklist,
    'enforce-class-compile': enforceClassCompile,
  },
}
