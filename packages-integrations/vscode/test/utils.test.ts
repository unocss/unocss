import { describe, expect, it } from 'vitest'
import { addRemToPxComment, addSpacingToPxComment, getColorString, parseSpacingValue, shouldProvideAutocomplete } from '../src/utils'

it('getColorString', () => {
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

  expect(getColorString(textAmber)).eql('rgba(251, 191, 36,  1)')
  expect(getColorString(textAmberImportant)).eql('rgba(251, 191, 36,  1 )')

  expect(getColorString(bgAmber)).eql('rgba(251, 191, 36,  1)')
  expect(getColorString(bgAmberImportant)).eql('rgba(251, 191, 36,  1 )')

  expect(getColorString(bgOklch)).eql('oklch(44.4% 0.177 26.899 /  1)')
  expect(getColorString(bgOklchImportant)).eql('oklch(44.4% 0.177 26.899 /  1 )')
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

it('parseSpacingValue', () => {
  expect(parseSpacingValue('1px')).eql(1)
  expect(parseSpacingValue('4px')).eql(4)
  expect(parseSpacingValue('0.25rem')).eql(4)
  expect(parseSpacingValue('0.25rem', 16)).eql(4)
  expect(parseSpacingValue('0.25rem', 20)).eql(5)
  expect(parseSpacingValue('1rem')).eql(16)
  expect(parseSpacingValue('2')).eql(2)
  expect(parseSpacingValue('-1px')).eql(-1)
  expect(parseSpacingValue('invalid')).eql(undefined)
})

it('addSpacingToPxComment', () => {
  const text = `
  /* layer: default */
  .w-16 {
    width: calc(var(--spacing) * 16);
  }`

  expect(addSpacingToPxComment(text, '1px')).eql(`
  /* layer: default */
  .w-16 {
    width: calc(var(--spacing) * 16) /* 1px * 16 = 16px */;
  }`)

  expect(addSpacingToPxComment(text, '4px')).eql(`
  /* layer: default */
  .w-16 {
    width: calc(var(--spacing) * 16) /* 4px * 16 = 64px */;
  }`)

  expect(addSpacingToPxComment(text, '0.25rem')).eql(`
  /* layer: default */
  .w-16 {
    width: calc(var(--spacing) * 16) /* 0.25rem * 16 = 64px */;
  }`)

  expect(addSpacingToPxComment(text, '0.25rem', 20)).eql(`
  /* layer: default */
  .w-16 {
    width: calc(var(--spacing) * 16) /* 0.25rem * 16 = 80px */;
  }`)

  const negativeText = `
  /* layer: default */
  .-m-4 {
    margin: calc(var(--spacing) * -4);
  }`

  expect(addSpacingToPxComment(negativeText, '1px')).eql(`
  /* layer: default */
  .-m-4 {
    margin: calc(var(--spacing) * -4) /* 1px * -4 = -4px */;
  }`)

  expect(addSpacingToPxComment(text, undefined)).eql(text)
  expect(addSpacingToPxComment(text, '')).eql(text)
  expect(addSpacingToPxComment(undefined, '1px')).eql('')

  const multipleText = `
  .p-4 {
    padding-top: calc(var(--spacing) * 4);
    padding-right: calc(var(--spacing) * 4);
    padding-bottom: calc(var(--spacing) * 4);
    padding-left: calc(var(--spacing) * 4);
  }`

  expect(addSpacingToPxComment(multipleText, '1px')).eql(`
  .p-4 {
    padding-top: calc(var(--spacing) * 4) /* 1px * 4 = 4px */;
    padding-right: calc(var(--spacing) * 4) /* 1px * 4 = 4px */;
    padding-bottom: calc(var(--spacing) * 4) /* 1px * 4 = 4px */;
    padding-left: calc(var(--spacing) * 4) /* 1px * 4 = 4px */;
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
