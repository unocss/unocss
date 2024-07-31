import { expect, it } from 'vitest'
import { getStringComponent } from '@unocss/rule-utils'

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
