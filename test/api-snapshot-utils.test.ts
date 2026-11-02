import { describe, expect, it } from 'vitest'
import { normalizeRuntimeChunkHashes, normalizeValueHandlerKeys } from './api-snapshot-utils'

const canonicalKeys = '"auto" | "bracket" | "bracketOfColor" | "bracketOfLength" | "bracketOfPosition" | "cssvar" | "degree" | "fraction" | "global" | "number" | "numberWithUnit" | "percent" | "position" | "properties" | "px" | "rem" | "time"'

describe('normalizeRuntimeChunkHashes', () => {
  it.each([
    ['CFK9WC_B', 'DrAY5B7v'],
    ['CzKmRlKa', 'CaSPAImY'],
    ['K9rl2fgR', 'BGKI-Ine'],
  ])('ignores chunk hash changes from %s to %s', (before, after) => {
    const reExport = (hash: string) => `export { t as colors } from "./colors-${hash}.mjs";`
    const expected = 'export { t as colors } from "./colors-[hash].mjs";'

    expect(normalizeRuntimeChunkHashes(reExport(before))).toBe(expected)
    expect(normalizeRuntimeChunkHashes(reExport(after))).toBe(expected)
  })

  it.each([
    ['export * from "../chunks/shared-CFK9WC_B.js";', 'export * from "../chunks/shared-[hash].js";'],
    ['export * as utils from \'./utils-BGKI-Ine.cjs\'', 'export * as utils from \'./utils-[hash].cjs\''],
  ])('normalizes relative re-export sources: %s', (source, expected) => {
    expect(normalizeRuntimeChunkHashes(source)).toBe(expected)
  })

  it('keeps changes to exports and chunk names detectable', () => {
    const original = normalizeRuntimeChunkHashes('export { t as colors, n as theme } from "./colors-CFK9WC_B.mjs";')
    const changed = [
      'export { t as colors } from "./colors-DrAY5B7v.mjs";',
      'export { t as palette, n as theme } from "./colors-DrAY5B7v.mjs";',
      'export { t as colors, n as theme, r as rules } from "./colors-DrAY5B7v.mjs";',
      'export { t as colors, n as theme } from "./theme-DrAY5B7v.mjs";',
    ]

    for (const source of changed)
      expect(normalizeRuntimeChunkHashes(source)).not.toBe(original)
  })

  it.each([
    'export * from "@unocss/rule-utils";',
    'export * from "some-package/colors-CFK9WC_B.mjs";',
    'export * from "https://example.com/colors-CFK9WC_B.mjs";',
    'export { t as colors } from "./colors.mjs";',
    'export { t as colors } from "./colors-CFK9WC_B.d.mts";',
    'export { t as colors } from "./colors-short.mjs";',
    'export const example = \'export { t as colors } from "./colors-CFK9WC_B.mjs";\';',
  ])('leaves unrelated text unchanged: %s', (source) => {
    expect(normalizeRuntimeChunkHashes(source)).toBe(source)
  })

  it('only rewrites the source, preserving quoted export names', () => {
    const source = 'export { t as "./colors-CFK9WC_B.mjs" } from "./utils-BGKI-Ine.mjs";'

    expect(normalizeRuntimeChunkHashes(source)).toBe('export { t as "./colors-CFK9WC_B.mjs" } from "./utils-[hash].mjs";')
  })
})

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
