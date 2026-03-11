import type { UserConfig } from '@unocss/core'
import type { NodeWithoutPosition, TwoslashGenericFunction, TwoslashGenericResult } from 'twoslash-protocol'
import { getMatchedPositionsFromCode } from '#integration/match-positions'
import { createGenerator } from '@unocss/core'
import { quansync } from 'quansync/macro'
import { createPositionConverter, resolveNodePositions } from 'twoslash-protocol'

export interface CreateTwoslashUnoCSSOptions {
  config?: UserConfig
  /**
   * Custom code transform before sending to UnoCSS for generate
   *
   * This does not affect the code rendering
   */
  preprocess?: (code: string) => string
}

export function createTwoslasher(options: CreateTwoslashUnoCSSOptions = {}): TwoslashGenericFunction {
  const {
    config,
    preprocess = code => code,
  } = options
  const uno = createGenerator(config)

  const twoslasher = quansync(async (code: string): Promise<TwoslashGenericResult> => {
    const positions = await getMatchedPositionsFromCode(await uno, preprocess(code))

    const pc = createPositionConverter(code)

    const results = positions
      .values()
      .map(([start, end, text]) => {
        return {
          type: 'hover',
          text,
          start,
          target: text,
          length: end - start,
        } satisfies NodeWithoutPosition
      })
      .toArray()

    const nodes = resolveNodePositions(results, code)
      .filter(i => i.line < pc.lines.length) // filter out messages outside of the code

    return {
      code,
      nodes,
    } satisfies TwoslashGenericResult
  })

  return twoslasher.sync
}
