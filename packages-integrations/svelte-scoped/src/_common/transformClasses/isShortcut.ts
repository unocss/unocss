import type { Shortcut } from '@unocss/core'

export function isShortcut(token: string, shortcuts: Shortcut<object>[]): boolean {
  return shortcuts.some(s => s[0] === token)
}
