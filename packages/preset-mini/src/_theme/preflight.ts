import { boxShadowsBase, ringBase, transformBase } from '../rules'
import type { Theme } from './types'

export const preflightBase = {
  ...transformBase,
  ...boxShadowsBase,
  ...ringBase,
} satisfies Theme['preflightBase']
