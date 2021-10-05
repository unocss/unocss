import { createHash } from 'crypto'
import { UserConfig } from '@unocss/core'
import { presetAttributify } from '@unocss/preset-attributify'
import { presetDefault } from '@unocss/preset-default'
import plugin from '@unocss/vite'

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

export default (obj: UserConfig, key: string) => {
  // 0dc2327d
  if (key !== getHash('ununun'))
    return null

  return plugin({
    presets: [
      presetAttributify(),
      presetDefault(),
    ],
    ...obj,
  })
}
