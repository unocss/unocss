import type { NextConfig } from 'next'
import { withDevframe } from '@devframes/next/single'

const nextConfig: NextConfig = {
  // Keep the devframe host out of the bundle — its optional MCP adapter
  // imports peer packages that are lazily loaded at runtime only
  serverExternalPackages: ['devframe', '@devframes/next', '@unocss/inspector'],
}

// Sets `skipTrailingSlashRedirect` so the inspector SPA's relative assets
// resolve under /__unocss/
export default withDevframe({ ...nextConfig })
