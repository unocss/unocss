import type { UserConfig } from 'tsdown'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'tsdown'

function globEntries(dir: string) {
  return readdirSync(dir).map(file => join(dir, file))
}

const sharedConfig: UserConfig = {
  format: 'iife',
  platform: 'browser',
  dts: false,
  minify: true,
  clean: false,
  noExternal: [/^@unocss\//, /^@iconify\//],
  outputOptions: {
    entryFileNames: '[name].global.js',
  },
  outDir: '.',
}

export default defineConfig([
  {
    entry: ['src/index.ts'],
    clean: true,
    dts: true,
    platform: 'browser',
    failOnWarn: true,
    publint: true,
    attw: {
      ignoreRules: ['cjs-resolves-to-esm'],
    },
  },
  ...globEntries('src/cdn').map(entry => ({ entry, ...sharedConfig })),
  ...globEntries('src/presets').map(entry => ({ entry, ...sharedConfig })),
])
