export function html([source]: TemplateStringsArray): string {
  return source
    .split('\n')
    .map(l => l.trim())
    .join('\n')
}
