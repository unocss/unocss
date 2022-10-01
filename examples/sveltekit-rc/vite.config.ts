// @ts-nocheck
import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import UnoCss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

const config: UserConfig = {
	plugins: [
		UnoCss({
			extractors: [extractorSvelte],
			shortcuts: [
				{ logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
				{ foo: 'bg-yellow-400' },
				{ bar: 'bg-green-400' },
			],
			presets: [
				presetUno(),
				presetIcons({
					collections: {
						custom: {
							// do not remove LF: testing trimCustomSvg on universal icon loader
							circle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
<circle cx="60" cy="60" r="50"/>
</svg>
`,
						},
						customfsl: FileSystemIconLoader(
							'./icons',
							svg => svg.replace('<svg ', '<svg fill="currentColor" '),
						),
					},
					extraProperties: {
						'display': 'inline-block',
						'vertical-align': 'middle',
					},
				}),
			],
		}),
		sveltekit(),
	],
}

export default config
