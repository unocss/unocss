import { describePackagesApiSnapshots } from 'tsnapi/vitest'
import { normalizeRuntimeChunkHashes, normalizeValueHandlerKeys } from './api-snapshot-utils'

// tsnapi reads built dist, so packages must be built first (as with the rest of
// the suite, which resolves packages through their `exports` → dist). CI runs
// `nr build` before `nr test`; run `pnpm build` locally before this test.
//
// Only snapshot publishable libraries; skip non-lib workspaces, deprecated
// presets, the private vscode extension, and reset (ships static CSS).
const libDirs = ['/packages-engine/', '/packages-integrations/', '/packages-presets/']
const skip = new Set(['@unocss/vscode', '@unocss/reset'])

await describePackagesApiSnapshots({
  filter(ctx) {
    const root = ctx.packageRoot.replaceAll('\\', '/')
    if (!libDirs.some(dir => root.includes(dir)))
      return false
    if (skip.has(ctx.packageName))
      return false
  },
  transformEntries(entries, { surface }) {
    if (surface === 'runtime') {
      // Internal chunk hashes change with implementations and build tooling,
      // even when the public exports stay the same.
      for (const entry of entries) {
        if (entry.kind === 're-export')
          entry.text = normalizeRuntimeChunkHashes(entry.text)
      }
      return
    }
    // Presets export large default-data objects (theme, color palettes, keyframe
    // maps) whose inlined shape dominates the dts snapshots without carrying real
    // API signal. Collapse those object literals so the export is still guarded
    // (rename/removal shows up) while the noisy key list stays out of the diff.
    for (const entry of entries) {
      entry.text = normalizeValueHandlerKeys(entry.text)
      if (entry.kind === 'variable' && entry.text.split('\n').length > 12)
        entry.text = entry.text.replace(/:[\s\S]*$/, ': { /* collapsed */ }')
    }
  },
})
