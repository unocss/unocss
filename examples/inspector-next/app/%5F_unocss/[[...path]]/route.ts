import process from 'node:process'
import { createDevframeNextHandler } from '@devframes/next/single'
import { createStandaloneInspectorDevframe } from '@unocss/inspector/devframe'
import config from '@/uno.config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Build a standalone UnoCSS context by scanning the project files once at
// startup, then host the inspector devframe from this catch-all route.
// The RPC WebSocket runs on a side-car port advertised through
// `/__unocss/__connection.json`, gated by devframe's one-time-code auth
// (the code is printed in the Next dev terminal).
const handlerPromise = createStandaloneInspectorDevframe({
  root: process.cwd(),
  // Pass the config inline (`configFile: false` skips the file loader,
  // which doesn't play well with the Next bundler)
  config: { ...config, configFile: false },
  patterns: ['app/**/*.{ts,tsx,html}'],
  // (cast: pnpm may instantiate devframe twice across the linked monorepo)
}).then(({ definition }) => createDevframeNextHandler(definition as any))

export async function GET(request: Request) {
  return (await handlerPromise).fetch(request)
}
