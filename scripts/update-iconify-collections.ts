import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICONIFY_COLLECTION = path.resolve(__dirname, '../packages-presets/preset-icons/src/collections.ts')

const { stdout } = await x('gh', [
  'api',
  'repos/iconify/icon-sets/contents/json',
  '--jq',
  '[.[] | select(.type == "file" and (.name | endswith(".json"))) | .name | rtrimstr(".json")]',
], { throwOnError: true })

const collections: unknown = JSON.parse(stdout)
if (!Array.isArray(collections) || collections.length === 0 || collections.some(name => typeof name !== 'string' || !name))
  throw new Error('Expected a non-empty list of Iconify collection names')

await writeFile(
  ICONIFY_COLLECTION,
  `export default ${JSON.stringify(collections)}`,
  'utf-8',
)

await x('eslint', ['--fix', '--no-ignore', ICONIFY_COLLECTION], { throwOnError: true })
