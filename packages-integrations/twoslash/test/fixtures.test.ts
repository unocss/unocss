/// <reference types="vite/client" />

import type { TwoslashGenericResult } from 'twoslash-protocol'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { createTwoslasher } from '../src/index'

// To add a test, create a file in the fixtures folder and it will will run through
// as though it was the codeblock.

const fixtures = import.meta.glob<string>('./fixtures/**/*.*', { query: '?raw', import: 'default' })

// A temporary list of regex to match with the path of the file to test
const filters: RegExp[] = [
  // /completions-files/,
]

if (process.env.CI && filters.length)
  throw new Error('Should not filters fixture tests in CI, did you forget to remove them?')

const twoslasher = createTwoslasher()

Object.entries(fixtures).forEach(([path, fixture]) => {
  path = path.replace(/\\/g, '/')
  const expectThrows = path.includes('/throws/')
  const outExt = expectThrows ? '.txt' : '.json'
  const outPath = path.replace('/fixtures/', '/results/') + outExt

  it.skipIf(filters.length && !filters.some(f => path.match(f)))(
    path,
    async () => {
      let result: TwoslashGenericResult = undefined!
      try {
        result = twoslasher(
          await fixture(),
          fileURLToPath(new URL(path, import.meta.url)),
        )
      }
      catch (err: any) {
        if (expectThrows) {
          expect(err.message).toMatchFileSnapshot(outPath)
          return
        }
        else {
          throw err
        }
      }

      if (expectThrows) {
        throw new Error('Expected to throw')
      }

      else {
        await expect(JSON.stringify(result, null, 2))
          .toMatchFileSnapshot(outPath)
      }
    },
  )
})
