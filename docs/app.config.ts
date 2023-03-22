export default defineAppConfig({
  github: {
    owner: 'unocss',
    repo: 'unocss',
    branch: 'main',
  },
  docus: {
    title: 'UnoCSS',
    titleTemplate: '%s · UnoCSS',
    description: 'The instant on-demand Atomic CSS engine',
    socials: {
      twitter: '@antfu7',
      github: 'unocss/unocss',
    },
    header: {
      logo: true,
      title: 'UnoCSS',
    },
    aside: {
      level: 1,
    },
    cover: {
      src: '/cover/default.png',
      alt: 'UnoCSS',
    },
    footer: {
      credits: {
        icon: '',
        text: 'MIT license - Copyright © 2021-PRESENT Anthony Fu and UnoCSS contributors',
        href: 'https://github.com/unocss/unocss/blob/main/LICENSE',
      },
      textLinks: [
        { text: 'Built with Docus', href: 'https://docus.dev/' },
        { text: 'Deploys on Netlify', href: 'https://www.netlify.com/' },
        { text: 'Vue Telescope', href: 'https://vuetelescope.com' },
      ],
    },
  },
})
