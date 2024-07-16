import { expect, it } from 'vitest'
import { addRemToPxComment, getColorString, shouldProvideAutocomplete } from '@unocss/vscode/utils'

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

it('shouldProvideAutocomplete', () => {
  const shouldPrefix = 'should_provide'
  const notProvidePrefix = 'not_provide'
  const code = `
<script setup lang="ts"></script>
<template>
${notProvidePrefix}1
  <div id='app' ${shouldPrefix}1> ${notProvidePrefix}2
    ${notProvidePrefix}3<div ${shouldPrefix}2 class="list1 ${shouldPrefix}3" fw600 ${shouldPrefix}4 font-size-10 color-red ${shouldPrefix}5>${notProvidePrefix}4</div>${notProvidePrefix}5
  </div>${notProvidePrefix}6
</template>
<style scoped>
.list2 > .item {
  @apply mb-5 ${shouldPrefix}6;
}
</style>`

  for (let i = 1; i < 100; i++) {
    const offset = code.indexOf(`${notProvidePrefix}${i}`)
    if (offset === -1)
      break
    expect(shouldProvideAutocomplete(code, offset)).toBe(false)
  }

  for (let i = 1; i < 100; i++) {
    const offset = code.indexOf(`${shouldPrefix}${i}`)
    if (offset === -1)
      break
    expect(shouldProvideAutocomplete(code, offset)).toBe(true)
  }
})
