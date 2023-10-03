import { mergeDeep } from '@unocss/core'
import { expect, it } from 'vitest'
import { addRemToPxComment, getColorString } from '@unocss/vscode/utils'
import { cartesian } from '@unocss/autocomplete'
import { getStringComponent } from '@unocss/rule-utils'

it('mergeDeep', () => {
  expect(mergeDeep<any>({
    foo: true,
    bar: 1,
    arr: [1],
  }, {
    bar: {},
    arr: [2],
  } as any))
    .toMatchInlineSnapshot(`
      {
        "arr": [
          2,
        ],
        "bar": {},
        "foo": true,
      }
    `)

  expect(mergeDeep<any>(
    {
      foo: true,
      bar: 1,
      arr: [1],
    },
    {
      bar: {},
      arr: [2],
    } as any,
    true,
  ))
    .toMatchInlineSnapshot(`
      {
        "arr": [
          1,
          2,
        ],
        "bar": {},
        "foo": true,
      }
    `)
})

it('getComponents', () => {
  const fn1 = (s: string) => getStringComponent(s, '(', ')', ',')

  expect(fn1('comma,separated')).eql(['comma', 'separated'])
  expect(fn1('comma ,separated')).eql(['comma ', 'separated'])
  expect(fn1('comma, separated')).eql(['comma', ' separated'])
  expect(fn1('comma , separated ')).eql(['comma ', ' separated '])

  expect(fn1('first,')).eql(undefined)
  expect(fn1(',last')).eql(undefined)

  expect(fn1('comma,separated,')).eql(['comma', 'separated,'])
  expect(fn1('comma,separated,once')).eql(['comma', 'separated,once'])
  expect(fn1('comma(),separated(value)')).eql(['comma()', 'separated(value)'])
  expect(fn1('not(comma,separated)')).eql(['not(comma,separated)', ''])
})

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

  expect(getColorString(textAmber)).eql('rgba(251, 191, 36, 1)')
  expect(getColorString(textAmberImportant)).eql('rgba(251, 191, 36, 1)')
  expect(getColorString(bgAmber)).eql('rgba(251, 191, 36, 1)')
  expect(getColorString(bgAmberImportant)).eql('rgba(251, 191, 36, 1)')
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

it('cartesian', () => {
  const a = ['a', 'b', 'c']
  const b = ['1', '2', '3']
  // multiple
  expect(cartesian([a, b])).eql([
    ['a', '1'],
    ['a', '2'],
    ['a', '3'],
    ['b', '1'],
    ['b', '2'],
    ['b', '3'],
    ['c', '1'],
    ['c', '2'],
    ['c', '3'],
  ])
  // single
  expect(cartesian([a])).eql([
    ['a'],
    ['b'],
    ['c'],
  ])
})
