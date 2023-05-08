import { assignDefaultToColors, assignShortcutsToColors, mergeDeep } from '@unocss/core'
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

  expect(mergeDeep<any>({
    foo: true,
    bar: 1,
    arr: [1],
  }, {
    bar: {},
    arr: [2],
  } as any,
  true))
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

it('assignDefaultToColors', () => {
  const colors = {
    inherit: 'inherit',
    current: 'currentColor',
    transparent: 'transparent',
    black: '#000',
    white: '#fff',
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
      DEFAULT: '#16a34a',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  }

  assignDefaultToColors(colors)

  expect(colors).toStrictEqual({
    inherit: 'inherit',
    current: 'currentColor',
    transparent: 'transparent',
    black: '#000',
    white: '#fff',
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
      DEFAULT: '#f87171',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
      DEFAULT: '#16a34a',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
      DEFAULT: '#60a5fa',
    },
  })
})

it('assignShortcutsToColors', () => {
  const colors = {
    inherit: 'inherit',
    current: 'currentColor',
    transparent: 'transparent',
    black: '#000',
    white: '#fff',
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    green: {
      1: '#00ff00',
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
      DEFAULT: '#16a34a',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  }

  assignShortcutsToColors(colors)

  expect(colors).toStrictEqual({
    inherit: 'inherit',
    current: 'currentColor',
    transparent: 'transparent',
    black: '#000',
    white: '#fff',
    red: {
      1: '#fee2e2',
      2: '#fecaca',
      3: '#fca5a5',
      4: '#f87171',
      5: '#ef4444',
      6: '#dc2626',
      7: '#b91c1c',
      8: '#991b1b',
      9: '#7f1d1d',
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    green: {
      1: '#00ff00',
      2: '#bbf7d0',
      3: '#86efac',
      4: '#4ade80',
      5: '#22c55e',
      6: '#16a34a',
      7: '#15803d',
      8: '#166534',
      9: '#14532d',
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
      DEFAULT: '#16a34a',
    },
    blue: {
      1: '#dbeafe',
      2: '#bfdbfe',
      3: '#93c5fd',
      4: '#60a5fa',
      5: '#3b82f6',
      6: '#2563eb',
      7: '#1d4ed8',
      8: '#1e40af',
      9: '#1e3a8a',
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  })
})
