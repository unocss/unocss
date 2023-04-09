import fs from 'node:fs'
import { dirname } from 'node:path'

fs.copyFileSync(
  require.resolve('@csstools/normalize.css'),
  'normalize.css',
)

if (!fs.existsSync('sanitize'))
  fs.mkdirSync('sanitize')

for (const stylesheet of [
  'sanitize.css',
  'forms.css',
  'assets.css',
  'typography.css',
  'reduce-motion.css',
  'system-ui.css',
  'ui-monospace.css',
]) {
  fs.copyFileSync(
    `${dirname(require.resolve('sanitize.css'))}/${stylesheet}`,
    `sanitize/${stylesheet}`,
  )
}
