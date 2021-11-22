import { createHash } from 'crypto'

export function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

export function getPath(id: string) {
  return id.replace(/\?.*$/, '')
}
