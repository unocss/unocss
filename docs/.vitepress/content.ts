export interface Integration {
  icon: string
  name: string
  link: string
  target?: string
  secondary?: string
}

export interface Example {
  name: string
  path: string
  stackblitz?: boolean
  codesandbox?: boolean
  icon?: string
  icons?: string[]
}

// @unocss-include

export const integrations: Integration[] = [
  { name: 'Vite', link: '/integrations/vite', icon: 'i-logos-vitejs' },
  { name: 'Nuxt', link: '/integrations/nuxt', icon: 'i-logos-nuxt-icon' },
  { name: 'Astro', link: '/integrations/astro', icon: 'i-logos-astro-icon dark:invert' },
  { name: 'Svelte', secondary: '(Scoped)', link: '/integrations/svelte-scoped', icon: 'i-logos-svelte-icon' },
  { name: 'Webpack', link: '/integrations/webpack', icon: 'i-logos-webpack' },
  { name: 'CDN Runtime', link: '/integrations/runtime', icon: 'i-logos-javascript' },
  { name: 'CLI', link: '/integrations/cli', icon: 'i-carbon-terminal' },
  { name: 'PostCSS', link: '/integrations/postcss', icon: 'i-logos-postcss' },
  { name: 'ESLint', link: '/integrations/eslint', icon: 'i-logos-eslint' },
  { name: 'VS Code', link: '/integrations/vscode', icon: 'i-logos-visual-studio-code' },
]

export const examples: Example[] = [
  {
    name: 'astro',
    path: 'examples/astro',
    icon: 'i-logos-astro-icon dark:invert',
    stackblitz: true,
  },
  {
    name: 'quasar',
    path: 'examples/quasar',
    icon: 'i-vscode-icons-file-type-quasar',
    stackblitz: true,
  },
  {
    name: 'sveltekit-scoped',
    path: 'examples/sveltekit-scoped',
    icon: 'i-logos-svelte-icon',
    stackblitz: true,
  },
  {
    name: 'vite-solid',
    path: 'examples/vite-solid',
    icons: [
      'i-logos-vitejs',
      'i-logos-solidjs-icon',
    ],
    stackblitz: true,
  },
  {
    name: 'vue-cli4',
    path: 'examples/vue-cli4',
    icons: [
      'i-logos-webpack',
      'i-logos-vue',
    ],
    stackblitz: true,
  },
  {
    name: 'astro-vue',
    path: 'examples/astro-vue',
    icons: [
      'i-logos-astro-icon dark:invert',
      'i-logos-vue',
    ],
    stackblitz: true,
  },
  {
    name: 'qwik',
    path: 'examples/qwik',
    icon: 'i-logos-qwik-icon',
    // stackblitz: true,
  },
  {
    name: 'vite-elm',
    path: 'examples/vite-elm',
    icons: [
      'i-logos-vitejs',
      'i-logos-elm',
    ],
    // stackblitz: true,
  },
  {
    name: 'vite-svelte',
    path: 'examples/vite-svelte',
    icons: [
      'i-logos-vitejs',
      'i-logos-svelte-icon',
    ],
    stackblitz: true,
  },
  {
    name: 'vue-cli5',
    path: 'examples/vue-cli5',
    icons: [
      'i-logos-webpack',
      'i-logos-vue',
    ],
    stackblitz: true,
  },
  {
    name: 'next',
    path: 'examples/next',
    icon: 'i-logos-nextjs-icon',
    // stackblitz: true,
    codesandbox: true,
  },
  {
    name: 'vite-lightningcss',
    path: 'examples/vite-lightningcss',
    icons: [
      'i-logos-vitejs',
      'i-ph-lightning text-yellow',
    ],
    // lightingcss is not supported by stackblitz yet
    // stackblitz: true,
  },
  {
    name: 'vite-lit',
    path: 'examples/vite-lit',
    icons: [
      'i-logos-vitejs',
      'i-logos-lit-icon',
    ],
    stackblitz: true,
  },
  {
    name: 'vite-svelte-postcss',
    path: 'examples/vite-svelte-postcss',
    icons: [
      'i-logos-postcss',
      'i-logos-svelte-icon',
    ],
    stackblitz: true,
  },
  {
    name: 'nuxt2',
    path: 'examples/nuxt2',
    icon: 'i-logos-nuxt-icon',
    stackblitz: true,
  },
  {
    name: 'remix',
    path: 'examples/remix',
    icon: 'i-logos-remix-icon dark:invert',
    stackblitz: true,
  },
  {
    name: 'vite-preact',
    path: 'examples/vite-preact',
    icons: [
      'i-logos-vitejs',
      'i-logos-preact',
    ],
    stackblitz: true,
  },
  {
    name: 'vite-vue3',
    path: 'examples/vite-vue3',
    icons: [
      'i-logos-vitejs',
      'i-logos-vue',
    ],
    stackblitz: true,
  },
  {
    name: 'nuxt2-webpack',
    path: 'examples/nuxt2-webpack',
    icons: [
      'i-logos-webpack',
      'i-logos-nuxt-icon',
    ],
    stackblitz: true,
  },
  {
    name: 'sveltekit',
    path: 'examples/sveltekit',
    icon: 'i-logos-svelte-icon',
    stackblitz: true,
  },
  {
    name: 'vite-pug',
    path: 'examples/vite-pug',
    icons: [
      'i-logos-vitejs',
      'i-logos-pug',
    ],
    stackblitz: true,
  },
  {
    name: 'vite-vue3-postcss',
    path: 'examples/vite-vue3-postcss',
    icons: [
      'i-logos-postcss',
      'i-logos-vue',
    ],
    stackblitz: true,
  },
  {
    name: 'nuxt3',
    path: 'examples/nuxt3',
    icon: 'i-logos-nuxt-icon',
    stackblitz: true,
  },
  {
    name: 'sveltekit-preprocess',
    path: 'examples/sveltekit-preprocess',
    icon: 'i-logos-svelte-icon',
    stackblitz: true,
  },
  {
    name: 'vite-react',
    path: 'examples/vite-react',
    icons: [
      'i-logos-vitejs',
      'i-logos-react',
    ],
    stackblitz: true,
  },
  {
    name: 'vite-angular',
    path: 'examples/vite-angular',
    icons: [
      'i-logos-vitejs',
      'i-logos-angular-icon',
    ],
    stackblitz: true,
  },
]
  .sort((a, b) => a.name.localeCompare(b.name))
