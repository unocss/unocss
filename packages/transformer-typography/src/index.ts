import type { SourceCodeTransformer, StringifiedUtil } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'

// TODO(equt) This does compile in TS, but somehow the rollup TS plugin cannot handle it.
// export type Tokens = string | Tokens[]

// e.g., `text-sm`, `w-4`, or `md:dark:bg-dark-100`
export type Tokens = string | string[]

const normalizeToken = (token: Tokens) =>
  typeof token === 'string' ? token.split(' ') : token

// ```
// {
//   "p": "font-sans text-sm",
//   "code": ["text-sm", "bg-light-100", ["px-2", "py-1"]],
//   "blockquote p": ["font-serif"],
// }
// ```
export type Rules = Record<string, Tokens>

export interface TransformerTypographyOptions {
  utilities?: Record<string, Rules>
}

export default function transformerTypography({
  utilities,
}: TransformerTypographyOptions = {}): SourceCodeTransformer {
  const loaded = new Set<string>()

  return {
    name: 'typography',
    enforce: 'pre',
    transform: (code, _id, { uno }) => {
      const sfc = code.toString()

      // FIXME If present
      const contains = (utility: string): boolean =>
        new RegExp(escapeRegExp(utility)).test(sfc)

      uno.config.preflights.push({
        layer: 'typography',
        getCSS: async () => {
          const parseTokens = async (tokens: Tokens) => {
            const flattened = await Promise.all(
              normalizeToken(tokens).map(token => uno.parseToken(token)),
            )

            const utils = flattened
              .filter((x): x is StringifiedUtil[] => !!x)
              .flat()
              .map(([_id, _selector, body, parent]) => ({ body, parent }))

            return utils.reduce((acc, { body, parent }) => {
              const v = acc.get(parent)
              if (v)
                acc.set(parent, v + body)

              else
                acc.set(parent, body)

              return acc
            }, new Map<string | undefined, string>())
          }

          const buildCSS = async (
            utility: string,
            selector: string,
            tokens: Tokens,
          ) =>
            Array.from(await parseTokens(tokens)).reduce(
              (acc, [parent, body]) =>
                `${acc
                }\n${
                parent
                  ? `${parent}{.${utility} ${selector}{${body}}}`
                  : `.${utility} ${selector}{${body}}`}`,
              '',
            )

          const parseRule = async ([utility, rules]: [string, Rules]) => {
            const css = await Promise.all(
              Object.entries(rules).map(([selector, tokens]) =>
                buildCSS(utility, selector, tokens),
              ),
            )
            return css.join('')
          }

          return (
            await Promise.all(
              Object.entries(utilities ?? {})
                .filter(
                  ([utility]) => contains(utility) && !loaded.has(utility),
                )
                .map(parseRule),
            )
          ).join('\n')
        },
      })
    },
  }
}
