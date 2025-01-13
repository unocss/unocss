import type { Theme } from './types'
import { boxShadowsBase, ringBase, transformBase } from '../rules'

export const preflightBase = {
  ...transformBase,
  ...boxShadowsBase,
  ...ringBase,
} satisfies Theme['preflightBase']
