import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { presetWind4Targets } from './assets/preset-wind4-targets'

const uno = await createGenerator({
  presets: [
    presetWind4(),
  ],
})

describe('preset-wind', () => {
  it('targets', async () => {
    const targets = presetWind4Targets
    const code = targets.join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: preflights } = await uno.generate('')

    const unmatched = []
    for (const i of targets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-targets.css')
    await expect(preflights).toMatchFileSnapshot('./assets/output/preset-wind4-preflights.css')

    // The following is a list of safe differences, the expected behavior of `preset-wind4` is inconsistent with `preset-wind3`.
    expect(unmatched).toMatchInlineSnapshot(`
      [
        "outline-none",
        "outline-size-none",
        "outline-color-red-1",
        "outline-blue-2",
        "border-size-none",
        "border-red2",
        "color-blue-gray",
        "color-blue-gray-400",
        "color-bluegray",
        "color-bluegray-400",
        "color-blue-gray-400/10",
        "color-blue-gray/10",
        "color-bluegray-400/10",
        "color-bluegray/10",
        "text-red2",
        "ring-red2",
        "ring-red2/5",
        "ring-width-px",
        "ring-size-px",
        "ring-offset-red2",
        "ring-offset-red2/5",
        "decoration-size-none",
        "decoration-offset-none",
        "flex-basis-1/2",
        "basis-none",
        "gap-none",
        "inset-none",
        "ring-none",
        "ring-offset-none",
        "ring-offset-green5",
        "p-ie-none",
        "m-inline-none",
        "pxy",
        "p-xy",
        "p-is",
        "mxy",
        "m-xy",
        "-m-md",
        "m--md",
        "m-md",
        "stroke-size-none",
        "stroke-offset-none",
        "translate-y-1/4",
        "translate-full",
        "translate-x-full",
        "preserve-3d",
        "preserve-flat",
        "indent-1/2",
        "indent-lg",
        "focus-visible:outline-none",
        "-mt-safe",
        "-!mb-safe",
        "!-ms-safe",
        "-translate-full",
        "-translate-x-full",
        "-translate-y-1/2",
        "before:translate-y-full",
        "placeholder-color-red-1",
        "hover:not-first:checked:bg-true-gray/10",
        "hover:is-first:checked:bg-true-gray/10",
        "@container-inline-size",
        "@container/label-inline-size",
        "@container-size",
        "@container/label-size",
        "divide-block-4",
        "divide-inline-4",
        "divide-inline-reverse",
        "divide-x-none",
        "divide-inline-none",
        "line-clamp-unset",
        "scroll-m-none",
        "scroll-p-inline-none",
        "space-y-none",
        "space-inline-2",
        "space-block-4",
        "space-block-none",
        "space-inline-reverse",
        "space-inline-$space",
        "border-spacing-none",
        "divide-inline-$variable",
        "uno-layer-_pre:contrast-less:bg-gray-3",
        "placeholder-inherit",
        "-space-x-4",
        "data-dropdown:ring-green",
      ]
    `)
  })
})
