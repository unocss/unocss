import { describe, expect, it } from 'vitest'
import { addRemToPxComment, getColorString, shouldProvideAutocomplete } from '../src/utils'

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

  expect(getColorString(textAmber)).eql('rgba(251, 191, 36,  1)')
  expect(getColorString(textAmberImportant)).eql('rgba(251, 191, 36,  1 )')
  expect(getColorString(bgAmber)).eql('rgba(251, 191, 36,  1)')
  expect(getColorString(bgAmberImportant)).eql('rgba(251, 191, 36,  1 )')
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
