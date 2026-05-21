import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { presetWind4 } from '../../../packages-presets/preset-wind4'
import { addRemToPxComment, getColorString, parseColorToRGBA, shouldProvideAutocomplete } from '../src/index'

describe('getColorString', () => {
  it('getColorString success', () => {
    const textAmber = `
  /* layer: default */
  .text-amber {
    --un-text-opacity: 1;
    color: rgba(251, 191, 36, var(--un-text-opacity));
  }`

    const textAmberImportant = `
  /* layer: default */
  .\!text-amber {
    --un-text-opacity: 1 !important;
    color: rgba(251, 191, 36, var(--un-text-opacity)) !important;
  }`

    const bgAmber = `
  /* layer: default */
  .bg-amber {
    --un-bg-opacity: 1;
    background-color: rgba(251, 191, 36, var(--un-bg-opacity));
  }`

    const bgAmberImportant = `
  /* layer: default */
  .\!bg-amber {
    --un-bg-opacity: 1 !important;
    background-color: rgba(251, 191, 36, var(--un-bg-opacity)) !important;
  }
  `

    const bgOklch = `
  /* layer: default */
  .bg-dark-red {
    --un-bg-opacity: 1;
    background-color: oklch(44.4% 0.177 26.899 / var(--un-bg-opacity));
  }`

    const bgOklchImportant = `
  /* layer: default */
  .\!bg-dark-red {
    --un-bg-opacity: 1 !important;
    background-color: oklch(44.4% 0.177 26.899 / var(--un-bg-opacity)) !important;
  }`

    expect(getColorString(textAmber)).eql('rgba(251, 191, 36, 1)')
    expect(getColorString(textAmberImportant)).eql('rgba(251, 191, 36, 1)')

    expect(getColorString(bgAmber)).eql('rgba(251, 191, 36, 1)')
    expect(getColorString(bgAmberImportant)).eql('rgba(251, 191, 36, 1)')

    expect(getColorString(bgOklch)).eql('oklch(44.4% 0.177 26.899 / 1)')
    expect(getColorString(bgOklchImportant)).eql('oklch(44.4% 0.177 26.899 / 1)')
  })

  it('getColorString with wind4 color-mix and supports blocks', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
    })

    const { css: wind4Text } = await uno.generate('text-red-400')

    expect(getColorString(wind4Text)).toEqual('oklch(70.4% 0.191 22.216 / 100%)')

    const { css: wind4Bg } = await uno.generate('bg-green-200')

    expect(getColorString(wind4Bg)).toEqual('oklch(92.5% 0.084 155.995 / 100%)')

    const { css: wind4Bg2 } = await uno.generate('bg-blue-600/50')

    expect(getColorString(wind4Bg2)).toEqual('oklch(54.6% 0.245 262.881 / 50%)')

    const { css: wind4fill } = await uno.generate('fill-amber')

    expect(getColorString(wind4fill)).toEqual('oklch(82.8% 0.189 84.429 / 100%)')

    const uno2 = await createGenerator({
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
      outputToCssLayers: true,
    })

    const { css: wind4Bg3 } = await uno2.generate('bg-pink-700')

    expect(getColorString(wind4Bg3)).toEqual('oklch(52.5% 0.223 3.958 / 100%)')
  })

  it('getColorString with wind4 shadow/ring CSS custom properties', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
    })

    const { css: shadowRed } = await uno.generate('shadow-red-300')

    expect(getColorString(shadowRed)).toEqual('oklch(80.8% 0.114 19.571 / 100%)')

    const { css: shadowRedOpacity } = await uno.generate('shadow-red-300/30')

    expect(getColorString(shadowRedOpacity)).toEqual('oklch(80.8% 0.114 19.571 / 30%)')

    const { css: ringBlue } = await uno.generate('ring-blue-500')

    expect(getColorString(ringBlue)).toEqual('oklch(62.3% 0.214 259.815 / 100%)')

    const { css: shadowHex4 } = await uno.generate('shadow-#f903')

    expect(getColorString(shadowHex4)).toEqual('#f903')
  })
})

it('parseColorToRGBA with oklch colors', () => {
  expect(parseColorToRGBA('oklch(54.6% 0.245 262.881)')).toMatchObject({
    alpha: 1,
    blue: 0.9882352941176471,
    green: 0.36470588235294116,
    red: 0.08235294117647059,
  })

  expect(parseColorToRGBA('oklch(54.6% 0.245 262.881 / 50%)')).toMatchObject({
    alpha: 0.5,
    blue: 0.9882352941176471,
    green: 0.36470588235294116,
    red: 0.08235294117647059,
  })
})

it('addRemToPxComment', () => {
  const text = `
  /* layer: default */
  .m-9 {
    margin: 2.25rem;
  }`

  for (let i = 10; i < 32; i += 1) {
    expect(addRemToPxComment(text, i)).eql(`
  /* layer: default */
  .m-9 {
    margin: 2.25rem; /* ${i / 4 * 9}px */
  }`)
  }

  expect(addRemToPxComment(text, 0)).eql(text)
  expect(addRemToPxComment(text, -1)).eql(text)

  const importantText = `
  /* layer: default */
  .\!m-9 {
    margin: 2.25rem !important;
  }`

  const importantComment = addRemToPxComment(importantText, 16)

  expect(importantComment).eql(`
  /* layer: default */
  .\!m-9 {
    margin: 2.25rem !important; /* 36px */
  }`)
})

describe('shouldProvideAutocomplete', () => {
  const shouldPrefix = 'should_provide'
  const notProvidePrefix = 'not_provide'
  const code = `
<script setup lang="ts"></script>
<template>
${notProvidePrefix}
  <div id='app' ${shouldPrefix}> ${notProvidePrefix}
    ${notProvidePrefix}<div ${shouldPrefix} jsx={<div ${shouldPrefix}>${notProvidePrefix}</div>} class="[>500px]:w-[200px] list1 ${shouldPrefix}" fw600 ${shouldPrefix} font-size-10 color-red ${shouldPrefix}>${notProvidePrefix}</div>${notProvidePrefix}
  </div>${notProvidePrefix}
</template>
<style scoped>
.list2 > .item {
  @apply mb-5 ${shouldPrefix};
}
</style>`

  it('notProvideAutocomplete', () => {
    const notProvidePrefixReg = new RegExp(notProvidePrefix, 'g')
    for (const match of code.matchAll(notProvidePrefixReg)) {
      expect(shouldProvideAutocomplete(code, 'foo.vue', match.index)).toBe(false)
    }
  })

  it('shouldProvideAutocomplete', () => {
    const shouldProvidePrefixReg = new RegExp(shouldPrefix, 'g')
    for (const match of code.matchAll(shouldProvidePrefixReg)) {
      expect(shouldProvideAutocomplete(code, 'foo.vue', match.index)).toBe(true)
    }
  })
})
