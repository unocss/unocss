// @ts-nocheck
import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import UnoCss from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'

const config: UserConfig = {
	plugins: [
		UnoCss({
			mode: 'svelte-scoped', // 'svelte-scoped-compiled'
			shortcuts: [
				{ logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
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
			safelist: ['bg-orange-300'],
		}),
		sveltekit(),
	],
}

export default config
