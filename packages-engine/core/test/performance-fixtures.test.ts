import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import {
  customRuleProfile,
  customRuleToken,
  defaultProfile,
  variantProfile,
  variantToken,
  workloads,
} from './performance-fixtures'

async function expectWorkloadResult(
  config: typeof defaultProfile,
  tokens: string[],
  expectedTokens: string[],
  rule: (token: string) => string,
) {
  const uno = await createGenerator(config)
  const result = await uno.generate(tokens, { preflights: false, safelist: false })

  expect([...result.matched]).toEqual(expectedTokens)
  expect(result.css).toBe([
    '/* layer: default */',
    ...expectedTokens
      .toSorted()
      .map(rule),
  ].join('\n'))
}

describe('performance fixtures', () => {
  it('generates the expected default-profile output for each workload', async () => {
    for (const tokens of Object.values(workloads)) {
      const expectedTokens = tokens.filter(token => token.startsWith('matched-'))
      await expectWorkloadResult(
        defaultProfile,
        tokens,
        expectedTokens,
        token => `.${token}{--matched:${token.slice('matched-'.length)};}`,
      )
    }
  })

  it('generates the expected variant-profile output for each workload', async () => {
    for (const tokens of Object.values(workloads)) {
      const variantTokens = tokens.map(token => token.startsWith('matched-') ? `hover:${token}` : token)
      const expectedTokens = variantTokens.filter(token => token.startsWith('hover:matched-'))
      await expectWorkloadResult(
        variantProfile,
        variantTokens,
        expectedTokens,
        token => `.hover\\:${token.slice('hover:'.length)}:hover{--matched:${token.slice('hover:matched-'.length)};}`,
      )
    }
  })

  it('generates the expected custom-rule output for each workload', async () => {
    for (const tokens of Object.values(workloads)) {
      const customRuleTokens = tokens.map(token => token.startsWith('matched-') ? token.replace('matched-', 'value-') : token)
      const expectedTokens = customRuleTokens.filter(token => token.startsWith('value-'))
      await expectWorkloadResult(
        customRuleProfile,
        customRuleTokens,
        expectedTokens,
        token => `.${token}{--value:${token.slice('value-'.length)};}`,
      )
    }
  })

  it('generates the expected individual variant and custom rule output', async () => {
    const variantGenerator = await createGenerator(variantProfile)
    const variantResult = await variantGenerator.generate([variantToken], { preflights: false, safelist: false })
    expect([...variantResult.matched]).toEqual([variantToken])
    expect(variantResult.css).toBe('/* layer: default */\n.hover\\:matched-1:hover{--matched:1;}')

    const customRuleGenerator = await createGenerator(customRuleProfile)
    const customRuleResult = await customRuleGenerator.generate([customRuleToken], { preflights: false, safelist: false })
    expect([...customRuleResult.matched]).toEqual([customRuleToken])
    expect(customRuleResult.css).toBe('/* layer: default */\n.value-1{--value:1;}')
  })
})
