import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'
import { beforeEach, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({ writeFile: vi.fn() }))
vi.mock('tinyexec', () => ({ x: vi.fn() }))

const collectionsPath = fileURLToPath(new URL('../packages-presets/preset-icons/src/collections.ts', import.meta.url))

beforeEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
})

it('writes the collection list and formats only the generated file', async () => {
  vi.mocked(x).mockResolvedValue({ stdout: '["carbon","mdi"]', stderr: '', exitCode: 0 })

  await import('../scripts/update-iconify-collections')

  expect(x).toHaveBeenNthCalledWith(1, 'gh', [
    'api',
    'repos/iconify/icon-sets/contents/json',
    '--jq',
    '[.[] | select(.type == "file" and (.name | endswith(".json"))) | .name | rtrimstr(".json")]',
  ], { throwOnError: true })
  expect(writeFile).toHaveBeenCalledExactlyOnceWith(collectionsPath, 'export default ["carbon","mdi"]', 'utf-8')
  expect(x).toHaveBeenNthCalledWith(2, 'eslint', ['--fix', '--no-ignore', collectionsPath], { throwOnError: true })
})

it.each(['HTTP 403: API rate limit exceeded', 'spawn gh ENOENT'])('fails without writing when gh fails with %s', async (message) => {
  vi.mocked(x).mockRejectedValue(new Error(message))

  await expect(import('../scripts/update-iconify-collections')).rejects.toThrow(message)

  expect(writeFile).not.toHaveBeenCalled()
  expect(x).toHaveBeenCalledTimes(1)
})

it.each(['not json', '{}', '[]', '[1]', '[""]'])('rejects an invalid collection list %s without writing', async (stdout) => {
  vi.mocked(x).mockResolvedValue({ stdout, stderr: '', exitCode: 0 })

  await expect(import('../scripts/update-iconify-collections')).rejects.toThrow()

  expect(writeFile).not.toHaveBeenCalled()
  expect(x).toHaveBeenCalledTimes(1)
})

it('fails when the generated file cannot be written', async () => {
  vi.mocked(x).mockResolvedValue({ stdout: '["carbon"]', stderr: '', exitCode: 0 })
  vi.mocked(writeFile).mockRejectedValue(new Error('write failed'))

  await expect(import('../scripts/update-iconify-collections')).rejects.toThrow('write failed')

  expect(x).toHaveBeenCalledTimes(1)
})

it('fails when ESLint fails', async () => {
  vi.mocked(x)
    .mockResolvedValueOnce({ stdout: '["carbon"]', stderr: '', exitCode: 0 })
    .mockRejectedValueOnce(new Error('ESLint failed'))

  await expect(import('../scripts/update-iconify-collections')).rejects.toThrow('ESLint failed')

  expect(writeFile).toHaveBeenCalledOnce()
})
