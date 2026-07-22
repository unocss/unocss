import type { UnoGenerator } from '@unocss/core'

export async function needsGenerated(token: string, uno: UnoGenerator): Promise<boolean> {
  const inSafelist = uno.config.safelist.includes(token)
  if (inSafelist)
    return false

  const result = await uno.parseToken(token)
  return !!result
}
