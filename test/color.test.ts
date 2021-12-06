import { hex2rgba } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('color utils', () => {
  it('convert hex to rgb', () => {
    expect(hex2rgba('#fff')).eql([255, 255, 255])
    expect(hex2rgba('fff')).eql([255, 255, 255])
    expect(hex2rgba('#000')).eql([0, 0, 0])
    expect(hex2rgba('#264512')).eql([38, 69, 18])
    expect(hex2rgba('#123')).eql([17, 34, 51])
    expect(hex2rgba('#abd3')).eql([170, 187, 221, 0.2])
    expect(hex2rgba('#95723489')).eql([149, 114, 52, 0.54])
    expect(hex2rgba('95723489')).eql([149, 114, 52, 0.54])
    expect(hex2rgba('#12')).eql(undefined)
    expect(hex2rgba('#12123')).eql(undefined)
  })
})
