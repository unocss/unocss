import type { UnoGenerator } from '@unocss/core'
import { dirname } from 'node:path'
import process from 'node:process'
import { loadConfig } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import { runAsWorker } from 'synckit'
import { createPositionConverter, resolveNodePositions } from 'twoslash-protocol'
import { getMatchedPositionsFromCode } from '#integration/match-positions'

const generators = new Map<string, Promise<UnoGenerator>>()

async function getGenerator(configPath?: string, id?: string) {
  const searchFrom = configPath
    ? process.cwd()
    : id
      ? dirname(id)
      : process.cwd()

  const cacheKey = configPath || searchFrom
  let promise = generators.get(cacheKey)
  if (!promise) {
    promise = loadConfig(searchFrom, configPath)
      .then(({ config }) => createGenerator({ ...config, warn: false }))
    generators.set(cacheKey, promise)
  }
  return await promise
}

runAsWorker(async (code: string, filename?: string, configPath?: string) => {
  const uno = await getGenerator(configPath, filename)
  const positions = await getMatchedPositionsFromCode(uno, code, filename ?? '')

  const tokens = [...new Set(positions.map(p => p[2]))]
  const cssCache = new Map(
    await Promise.all(
      tokens.map(async token => [
        token,
        (await uno.generate(new Set([token]), { preflights: false, safelist: false })).css.trim(),
      ] as const),
    ),
  )

  const pc = createPositionConverter(code)

  const nodes = resolveNodePositions(
    positions.map(([start, end, text]) => ({
      type: 'hover',
      text: cssCache.get(text)!,
      start,
      target: text,
      length: end - start,
    })),
    code,
  ).filter(i => i.line < pc.lines.length)

  return { code, nodes }
})
