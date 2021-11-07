import { hex2rgba } from '@unocss/core'

describe('color utils', () => {
  it('convert hex to rgb', () => {
    expect(hex2rgba('#fff')).toEqual([255, 255, 255])
    expect(hex2rgba('fff')).toEqual([255, 255, 255])
    expect(hex2rgba('#000')).toEqual([0, 0, 0])
    expect(hex2rgba('#264512')).toEqual([38, 69, 18])
    expect(hex2rgba('#123')).toEqual([17, 34, 51])
    expect(hex2rgba('#abd3')).toEqual([170, 187, 221, 0.2])
    expect(hex2rgba('#95723489')).toEqual([149, 114, 52, 0.54])
    expect(hex2rgba('95723489')).toEqual([149, 114, 52, 0.54])
    expect(hex2rgba('#12')).toEqual(undefined)
    expect(hex2rgba('#12123')).toEqual(undefined)
  })
})
