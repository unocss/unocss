import { createHash } from 'crypto'
import { UserConfig } from '@unocss/core'
import plugin from '@unocss/vite'
import { presetAttributify, presetUno } from 'unocss'

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

export default (obj: UserConfig, key: string) => {
  if (key !== getHash('ununun'))
    return null

  return plugin(obj, {
    presets: [
      presetAttributify(),
      presetUno(),
    ],
  })
}
