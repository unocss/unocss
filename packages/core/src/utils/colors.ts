/* eslint-disable no-case-declarations */
const hexRE = /^#?([\da-f]+)$/i

export function hex2rgba(hex = ''): [number, number, number, number] | [number, number, number] | undefined {
  const [, body] = hex.match(hexRE) || []

  if (!body)
    return

  switch (body.length) {
    case 3:
    case 4:
      const digits = Array.from(body, s => Number.parseInt(s, 16)).map(n => (n << 4) | n)
      if (body.length === 3)
        return digits as [number, number, number]
      digits[3] = Math.round(digits[3] / 255 * 100) / 100
      return digits as [number, number, number, number]
    case 6:
    case 8:
      const value = Number.parseInt(body, 16)
      if (body.length === 6)
        return [(value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF]
      return [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, Math.round((value & 0xFF) / 255 * 100) / 100]
  }
}
