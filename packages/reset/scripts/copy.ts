import fs from 'fs'

fs.copyFileSync(
  'node_modules/@csstools/normalize.css/normalize.css',
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
    `node_modules/sanitize.css/${stylesheet}`,
    `sanitize/${stylesheet}`,
  )
}
