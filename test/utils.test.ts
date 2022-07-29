import { mergeDeep } from '@unocss/core'
import { getComponent } from '@unocss/preset-mini/utils'
import { expect, it } from 'vitest'

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
})

it('getComponents', () => {
  const fn1 = (s: string) => getComponent(s, '(', ')', ',')

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
