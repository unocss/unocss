import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICONIFY_COLLECTION = path.resolve(__dirname, '../packages-presets/preset-icons/src/collections.ts')

async function update() {
  try {
    const collections: string[] = []
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'unocss-update-script',
    }

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch('https://api.github.com/repos/iconify/icon-sets/contents/json', {
      headers,
      signal: AbortSignal.timeout(30000), // 30秒超时
    })

    if (!res.ok) {
      throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error('Unexpected response format:', data)

      if (data && typeof data === 'object' && 'message' in data) {
        const message = data.message as string
        if (message.includes('rate limit') || message.includes('API rate limit')) {
          throw new Error(`GitHub API rate limit exceeded. Please try again later or set a GITHUB_TOKEN environment variable for higher limits. Response: ${JSON.stringify(data, null, 2)}`)
        }
      }

      throw new Error(`Expected array but got ${typeof data}. Response: ${JSON.stringify(data, null, 2)}`)
    }

    for (const item of data) {
      if (item.type === 'file' && item.name.endsWith('.json')) {
        collections.push(item.name.replace(/\.json$/, ''))
      }
    }

    console.log(`Found ${collections.length} icon collections`)

    await writeFile(
      ICONIFY_COLLECTION,
      `export default ${JSON.stringify(collections)}`,
      'utf-8',
    )
    await execa('eslint', ['--fix', '--no-ignore', ICONIFY_COLLECTION])
  }
  catch (err) {
    console.error('Error updating iconify collections:', err)
    process.exit(1)
  }
}

update()
