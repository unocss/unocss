import type { Compiler, Module } from '@rspack/core'
import type { NativeContext } from './context'
import { Buffer } from 'node:buffer'
import { expect, it } from 'vitest'
import { restoreCachedModules } from './cache'

it('deduplicates physical files and bounds concurrent cache reads', async () => {
  let activeReads = 0
  let maxActiveReads = 0
  const transformed: string[] = []
  const compiler = {
    options: { cache: true },
    inputFileSystem: {
      readFile(file: string, callback: (error: Error | null, content?: Buffer) => void) {
        activeReads += 1
        maxActiveReads = Math.max(maxActiveReads, activeReads)
        setTimeout(() => {
          activeReads -= 1
          callback(null, Buffer.from(file))
        }, 5)
      },
    },
  } as unknown as Compiler
  const context = {
    filter: { shouldExtract: () => true },
    hasModule: () => false,
    async transformModule(_source: string, id: string) {
      transformed.push(id)
    },
  } as unknown as NativeContext
  const modules = Array.from({ length: 20 }, (_, index) => ({ resource: `/src/module-${index}.ts` }))
  modules.push({ resource: '/src/module-0.ts?query' })

  await restoreCachedModules(compiler, context, modules as Module[])

  expect(transformed).toHaveLength(20)
  expect(new Set(transformed).size).toBe(20)
  expect(transformed).toContain('/src/module-0.ts')
  expect(transformed).not.toContain('/src/module-0.ts?query')
  expect(maxActiveReads).toBeLessThanOrEqual(8)
})
