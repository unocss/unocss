import { createGenerator } from '@unocss/core'
import { presetWind3 } from '@unocss/preset-wind3'
import { runAsWorker } from 'synckit'
import { createPositionConverter, resolveNodePositions } from 'twoslash-protocol'
import { getMatchedPositionsFromCode } from '#integration/match-positions'

let uno: Awaited<ReturnType<typeof createGenerator>> | null = null

runAsWorker(async (code: string, filename: string | undefined) => {
  if (!uno)
    uno = await createGenerator({ presets: [presetWind3()] })

  const positions = await getMatchedPositionsFromCode(uno, code, filename ?? '')

  const pc = createPositionConverter(code)

  const nodes = resolveNodePositions(
    positions.map(([start, end, text]) => ({
      type: 'hover',
      text,
      start,
      target: text,
      length: end - start,
    })),
    code,
  ).filter(i => i.line < pc.lines.length)

  return { code, nodes }
})
