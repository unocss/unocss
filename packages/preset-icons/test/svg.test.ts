import { createGenerator } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import { describe, expect, it } from 'vitest'
import { loadIcon } from '@iconify/utils'

describe('preset-icons svg', () => {
  // source: i-ph-arrow-down-right-bold
  const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M204 88v104a12 12 0 0 1-12 12H88a12 12 0 0 1 0-24h75L55.51 72.48a12 12 0 0 1 17-17L180 163V88a12 12 0 0 1 24 0"/></svg>`

  it('should load SVG by loadIcon', async () => {
    const svg = await loadIcon('custom', 'arrow', {
      customCollections: {
        custom: {
          arrow: svgData,
        },
      },
    })

    expect(svg).toMatchInlineSnapshot(`"<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M204 88v104a12 12 0 0 1-12 12H88a12 12 0 0 1 0-24h75L55.51 72.48a12 12 0 0 1 17-17L180 163V88a12 12 0 0 1 24 0"/></svg>"`)
  })

  const uno = createGenerator({
    presets: [
      presetIcons({
        collections: {
          custom: {
            arrow: svgData,
          },
        },
      }),
    ],
  })

  it('should generate CSS for custom SVG icon', async () => {
    const { css } = await uno.generate('<button class="i-custom:arrow" />', { preflights: false })
    await expect(css).toMatchInlineSnapshot(`
      "/* layer: icons */
      .i-custom\\:arrow{--un-icon:url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 256 256'%3E%3Cpath fill='currentColor' d='M204 88v104a12 12 0 0 1-12 12H88a12 12 0 0 1 0-24h75L55.51 72.48a12 12 0 0 1 17-17L180 163V88a12 12 0 0 1 24 0'/%3E%3C/svg%3E");-webkit-mask:var(--un-icon) no-repeat;mask:var(--un-icon) no-repeat;-webkit-mask-size:100% 100%;mask-size:100% 100%;background-color:currentColor;color:inherit;width:1em;height:1em;}"
    `)
  })

  it('should generate CSS for iconify SVG icon', async () => {
    const { css } = await uno.generate('<button class="i-ph-arrow-down-right-bold" />', { preflights: false })
    await expect(css).toMatchInlineSnapshot(`
      "/* layer: icons */
      .i-ph-arrow-down-right-bold{--un-icon:url("data:image/svg+xml;utf8,%3Csvg viewBox='0 0 256 256' width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath fill='currentColor' d='M204 88v104a12 12 0 0 1-12 12H88a12 12 0 0 1 0-24h75L55.51 72.48a12 12 0 0 1 17-17L180 163V88a12 12 0 0 1 24 0'/%3E%3C/svg%3E");-webkit-mask:var(--un-icon) no-repeat;mask:var(--un-icon) no-repeat;-webkit-mask-size:100% 100%;mask-size:100% 100%;background-color:currentColor;color:inherit;width:1em;height:1em;}"
    `)
  })
})
