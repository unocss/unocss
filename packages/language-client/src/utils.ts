import { MarkdownString } from 'vscode'

export function getMarkdown(code: string, lang?: string) {
  return new MarkdownString(getMarkdownCodeBlock(code, lang))
}

export function getMarkdownCodeBlock(code: string, lang = '') {
  return `\`\`\`${lang}\n${code}\n\`\`\``
}
