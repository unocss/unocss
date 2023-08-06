import { basename, dirname, extname, resolve } from 'node:path'
import { opendir, readFile } from 'node:fs/promises'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import type { AsyncSpriteIconsFactory, SpriteIcon } from '@unocss/preset-icons'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import type { AutoInstall } from '@iconify/utils/lib/loader/fs'
import { loadCollectionFromFS } from '@iconify/utils/lib/loader/fs'
import { searchForIcon } from '@iconify/utils/lib/loader/modern'

const iconDirectory = resolve(__dirname, 'icons')

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app/',
  plugins: [
    Vue(),
    UnoCSS({
      shortcuts: [
        { logo: 'i-logos-vue w-6em h-6em transform transition-800' },
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          warn: true,
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
          collections: {
            custom: FileSystemIconLoader(iconDirectory),
          },
          sprites: {
            sprites: {
              'custom-mdi': createLoadCollectionFromFSAsyncIterator('mdi', {
                include: ['account', 'alert-octagram', 'access-point-network'],
              }),
              'custom-fs': createFileSystemIconLoaderAsyncIterator('icons', 'custom-fs'),
              'custom': <SpriteIcon[]>[{
                name: 'animated',
                svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><style>
  path.animated { 
    fill-opacity: 0;
    animation: animated-test-animation 2s linear forwards;
  }
  @keyframes animated-test-animation {
    from {
      fill-opacity: 0;
    }
    to {
      fill-opacity: 1;
    }
  }
  </style><path class="animated" fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/></svg>`,
              }, {
                name: 'close',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/></svg>',
              }, {
                name: 'chevron-down',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42Z"/></svg>',
              }, {
                name: 'chevron-up',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6l1.41 1.41Z"/></svg>',
              }],
            },
          },
        }),
      ],
    }),
  ],
})

/* TODO BEGIN-CLEANUP: types from @iconify/utils: remove them once published */
function createLoadCollectionFromFSAsyncIterator(
  collection: string,
  options: {
    autoInstall?: AutoInstall
    include?: string[] | ((icon: string) => boolean)
  } = { autoInstall: false },
) {
  const include = options.include ?? (() => true)
  const useInclude: (icon: string) => boolean
      = typeof include === 'function'
        ? include
        : (icon: string) => include.includes(icon)

  return <AsyncSpriteIconsFactory> async function* () {
    const iconSet = await loadCollectionFromFS(collection)
    if (iconSet) {
      const icons = Object.keys(iconSet.icons).filter(useInclude)
      for (const id of icons) {
        const iconData = await searchForIcon(
          iconSet,
          collection,
          [id],
          options,
        )
        if (iconData) {
          yield {
            name: id,
            svg: iconData,
            collection,
          }
        }
      }
    }
  }
}
function createFileSystemIconLoaderAsyncIterator(
  dir: string,
  collection = dirname(dir),
  include: string[] | ((icon: string) => boolean) = () => true,
) {
  const useInclude: (icon: string) => boolean
      = typeof include === 'function'
        ? include
        : (icon: string) => include.includes(icon)

  return <AsyncSpriteIconsFactory> async function* () {
    const stream = await opendir(dir)
    for await (const file of stream) {
      if (!file.isFile() || extname(file.name) !== '.svg')
        continue

      const name = basename(file.name).slice(0, -4)
      if (useInclude(name)) {
        yield {
          name,
          svg: await readFile(resolve(dir, file.name), 'utf-8'),
          collection,
        }
      }
    }
  }
}
/* TODO END-CLEANUP: types from @iconify/utils: remove them once published */
