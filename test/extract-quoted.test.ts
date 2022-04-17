import { readFile } from 'fs/promises'
import { extractQuoted } from '@unocss/core'
import { describe, expect, test } from 'vitest'

describe('extractString', async() => {
  const code = await readFile('./test/assets/extract-quoted.ts', 'utf-8')

  test('works', () => {
    const strings = extractQuoted(code)
    expect(strings).toMatchInlineSnapshot(`
      [
        "",
        "",
        "",
        "foo",
        "bar",
        "baz",
        "foo\\\\'bar\\\\\\"baz",
        "foo\${'bar'}\${'baz'}",
        "foo\${'bar'}baz\${\`spam\`}ham eggs",
        "foo\${\`spam\${\\"ham\\"}\${'eggs'}\`}\${\`bacon\`}bar",
      ]
    `)
  }, 1000)

  test('should extract deep template string', () => {
    const strings = extractQuoted(code, { deep: true })
    expect(strings).toMatchInlineSnapshot(`
      [
        "",
        "",
        "",
        "foo",
        "bar",
        "baz",
        "foo\\\\'bar\\\\\\"baz",
        "bar",
        "baz",
        "foo\${'bar'}\${'baz'}",
        "bar",
        "spam",
        "foo\${'bar'}baz\${\`spam\`}ham eggs",
        "ham",
        "eggs",
        "spam\${\\"ham\\"}\${'eggs'}",
        "bacon",
        "foo\${\`spam\${\\"ham\\"}\${'eggs'}\`}\${\`bacon\`}bar",
      ]
    `)
  }, 1000)

  test('should extract static template only', () => {
    const strings = extractQuoted(
      code,
      {
        templateStaticOnly: true,
        details: true,
      })
      .filter(({ value: { length } }) => length)
    expect(strings).toMatchSnapshot()
  }, 1000)
})
