const stringLiteralRE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g
const valueHandlerDeclarationRE = /^(export declare const (?:h|handler): import\("@unocss\/rule-utils"\)\.ValueHandler<)((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?:\s*\|\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'))+)(, object>;)$/
const runtimeReExportSourceRE = /^(export (?:\{[\s\S]*\}|\*(?: as [\w$]+)?) from )(["'])(\.{1,2}\/[^"'\r\n]+)\2(;?)$/
const chunkHashRE = /-[\w-]{8}(\.[cm]?js)$/

export function normalizeRuntimeChunkHashes(text: string): string {
  return text.replace(runtimeReExportSourceRE, (_, prefix, quote, source: string, suffix) =>
    `${prefix}${quote}${source.replace(chunkHashRE, '-[hash]$1')}${quote}${suffix}`)
}

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
