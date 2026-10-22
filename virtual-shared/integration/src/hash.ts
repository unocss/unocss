import crypto from 'node:crypto'

const hash
  // crypto.hash is supported in Node 21.7.0+, 20.12.0+
  = crypto.hash
    ?? ((
      algorithm: string,
      data: crypto.BinaryLike,
      outputEncoding: crypto.BinaryToTextEncoding,
    ) => crypto.createHash(algorithm).update(data).digest(outputEncoding))

export function getHash(input: string, length = 8) {
  return hash('sha256', input, 'hex').substring(0, length)
}
