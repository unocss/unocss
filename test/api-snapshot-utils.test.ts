import { describe, expect, it } from 'vitest'
import { normalizeValueHandlerKeys } from './api-snapshot-utils'

const canonicalKeys = '"auto" | "bracket" | "bracketOfColor" | "bracketOfLength" | "bracketOfPosition" | "cssvar" | "degree" | "fraction" | "global" | "number" | "numberWithUnit" | "percent" | "position" | "properties" | "px" | "rem" | "time"'

describe('normalizeValueHandlerKeys', () => {
  it('normalizes the macOS and Windows CI orders identically', () => {
    const macos = 'export declare const handler: import("@unocss/rule-utils").ValueHandler<"number" | "auto" | "position" | "numberWithUnit" | "rem" | "px" | "percent" | "fraction" | "bracket" | "bracketOfColor" | "bracketOfLength" | "bracketOfPosition" | "cssvar" | "time" | "degree" | "global" | "properties", object>;'
    const windows = 'export declare const handler: import("@unocss/rule-utils").ValueHandler<"number" | "numberWithUnit" | "auto" | "rem" | "px" | "percent" | "fraction" | "bracket" | "bracketOfColor" | "bracketOfLength" | "bracketOfPosition" | "cssvar" | "time" | "degree" | "global" | "properties" | "position", object>;'
    const expected = `export declare const handler: import("@unocss/rule-utils").ValueHandler<${canonicalKeys}, object>;`

    expect(normalizeValueHandlerKeys(macos)).toBe(expected)
    expect(normalizeValueHandlerKeys(windows)).toBe(expected)
  })

  it('keeps a removed member detectable', () => {
    const complete = 'export declare const h: import("@unocss/rule-utils").ValueHandler<"number" | "auto" | "position", object>;'
    const removed = 'export declare const h: import("@unocss/rule-utils").ValueHandler<"number" | "auto", object>;'

    expect(normalizeValueHandlerKeys(complete)).toBe('export declare const h: import("@unocss/rule-utils").ValueHandler<"auto" | "number" | "position", object>;')
    expect(normalizeValueHandlerKeys(removed)).toBe('export declare const h: import("@unocss/rule-utils").ValueHandler<"auto" | "number", object>;')
    expect(normalizeValueHandlerKeys(removed)).not.toBe(normalizeValueHandlerKeys(complete))
  })

  it('leaves unrelated and mixed unions unchanged', () => {
    const unrelated = 'export type Mode = "manual" | "auto";'
    const otherExport = 'export declare const other: import("@unocss/rule-utils").ValueHandler<"manual" | "auto", object>;'
    const unqualified = 'export declare const handler: ValueHandler<"manual" | "auto", object>;'
    const mixed = 'export declare const handler: import("@unocss/rule-utils").ValueHandler<"auto" | string | "number", object>;'

    expect(normalizeValueHandlerKeys(unrelated)).toBe(unrelated)
    expect(normalizeValueHandlerKeys(otherExport)).toBe(otherExport)
    expect(normalizeValueHandlerKeys(unqualified)).toBe(unqualified)
    expect(normalizeValueHandlerKeys(mixed)).toBe(mixed)
  })

  it('does not rewrite ValueHandler text inside a string-literal type', () => {
    const source = 'export type Example = \'export declare const handler: import("@unocss/rule-utils").ValueHandler<"number" | "auto", object>;\';'

    expect(normalizeValueHandlerKeys(source)).toBe(source)
  })

  it('preserves duplicate members', () => {
    expect(normalizeValueHandlerKeys(
      'export declare const handler: import("@unocss/rule-utils").ValueHandler<"number" | "auto" | "number", object>;',
    )).toBe(
      'export declare const handler: import("@unocss/rule-utils").ValueHandler<"auto" | "number" | "number", object>;',
    )
  })
})
