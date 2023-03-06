import { createHash } from 'node:crypto'

export function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .slice(0, length)
}
