import UnoCSS from '@unocss/vite'
import { defineConfig } from 'vite'

// simulates a framework (e.g. Nuxt) that builds a named environment into an
// outDir different from the top-level `build.outDir`, as with Vite 8's
// Environment API — see #5323
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  environments: {
    client: {
      build: {
        outDir: 'dist-client',
      },
    },
    ssr: {
      build: {
        outDir: 'dist-ssr',
        ssr: true,
        rollupOptions: {
          input: 'src/entry-server.ts',
        },
      },
    },
  },
  builder: {
    sharedConfigBuild: true,
    async buildApp(builder) {
      await builder.build(builder.environments.ssr)
      await builder.build(builder.environments.client)
    },
  },
  plugins: [
    UnoCSS(),
  ],
})
