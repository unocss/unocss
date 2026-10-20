const stringLiteralRE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g
const valueHandlerDeclarationRE = /^(export declare const (?:h|handler): import\("@unocss\/rule-utils"\)\.ValueHandler<)((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?:\s*\|\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'))+)(, object>;)$/

export function normalizeValueHandlerKeys(text: string): string {
  const match = text.match(valueHandlerDeclarationRE)
  if (!match)
    return text
  const [, prefix, union, suffix] = match
  const keys = union.match(stringLiteralRE)
  if (!keys)
    return text
  return `${prefix}${keys.sort().join(' | ')}${suffix}`
}
