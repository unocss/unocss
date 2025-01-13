const sourceMapRE = /\/\/#\s*sourceMappingURL=.*\n?/g

export function removeSourceMap(code: string) {
  if (code.includes('sourceMappingURL='))
    return code.replace(sourceMapRE, '')
  return code
}
