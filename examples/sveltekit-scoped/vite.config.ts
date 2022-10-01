// @ts-nocheck
import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import UnoCss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'

const config: UserConfig = {
	plugins: [
		UnoCss({
			mode: 'svelte-scoped',
			extractors: [extractorSvelte],
			shortcuts: [
				{ logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
				{ foo: 'bg-yellow-400' },
				{ bar: 'bg-green-400' },
			],
			presets: [
				presetUno(),
				presetIcons({
					prefix: 'i-',
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
