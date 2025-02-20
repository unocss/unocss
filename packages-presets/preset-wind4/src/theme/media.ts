import type { Theme } from './types'

export const media = {
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  os_dark: '(prefers-color-scheme: dark)',
  os_light: '(prefers-color-scheme: light)',
  motion_ok: '(prefers-reduced-motion: no-preference)',
  motion_not_ok: '(prefers-reduced-motion: reduce)',
  high_contrast: '(prefers-contrast: high)',
  low_contrast: '(prefers-contrast: low)',
  opacity_ok: '(prefers-reduced-transparency: no-preference)',
  opacity_not_ok: '(prefers-reduced-transparency: reduce)',
  use_data_ok: '(prefers-reduced-data: no-preference)',
  use_data_not_ok: '(prefers-reduced-data: reduce)',
  touch: '(hover: none) and (pointer: coarse)',
  stylus: '(hover: none) and (pointer: fine)',
  pointer: '(hover) and (pointer: coarse)',
  mouse: '(hover) and (pointer: fine)',
  hd_color: '(dynamic-range: high)',
} satisfies Theme['media']
