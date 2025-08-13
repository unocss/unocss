import type { Provider } from '../types'
import { createGoogleCompatibleProvider } from './google'

// https://fonts.coollabs.io/
export const CoolLabsFontsProvider: Provider = createGoogleCompatibleProvider('coollabs', 'https://api.fonts.coollabs.io')
