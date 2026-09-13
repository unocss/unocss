import { version } from 'vite'

export const supportsEnvironmentHmr = Number.parseInt(version) >= 8
