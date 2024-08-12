import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('content', () => {
  const uno = createGenerator({
    presets: [{
      name: 'test',
      content: {
        filesystem: ['foo/bar.css'],
        inline: ['bg-blue-1'],
      },
    }],
    content: {
      filesystem: ['foo.js'],
    },
  })
  it('should work', () => {
    expect(uno.config.content).toMatchObject({
      filesystem: ['foo/bar.css', 'foo.js'],
      inline: ['bg-blue-1'],
      pipeline: { include: [], exclude: [] },
      plain: [],
    })
  })
})
