import type { UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import type { SvelteScopedContext } from '../types'
import type { UnocssSveltePreprocessOptions } from './types'
import process from 'node:process'
import { createRecoveryConfigLoader } from '@unocss/config'
import { createGenerator, warnOnce } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import MagicString from 'magic-string'
import { transformClasses } from '../_common/transformClasses'
import { checkForApply, transformStyle } from '../_common/transformStyle'
import { themeRE } from '../_common/transformTheme'
import { addGeneratedStylesIntoStyleBlock } from './addGeneratedStyles'
import { wrapSelectorsWithGlobal } from './wrapGlobal'

export function UnocssSveltePreprocess(options: UnocssSveltePreprocessOptions = {}, unoContextFromVite?: SvelteScopedContext, isViteBuild?: () => boolean): PreprocessorGroup {
  if (!options.classPrefix)
    options.classPrefix = 'usp-'

  let uno: UnoGenerator

  const loadConfig = createRecoveryConfigLoader()

  return {
    markup: async ({ content, filename }) => {
      if (!uno)
        uno = await getGenerator((await loadConfig(process.cwd(), options.configOrPath)).config, unoContextFromVite)

      if (isViteBuild && options.combine === undefined)
        options.combine = isViteBuild()

      const s = new MagicString(content)

      const transformed = await transformClasses({ s, filename: filename ?? '', uno, options, removeCommentsToMakeGlobalWrappingEasy: true })

      if (!transformed)
        return

      const cssPreparedForSvelteCompiler = wrapSelectorsWithGlobal(transformed.generatedStyles)

      addGeneratedStylesIntoStyleBlock(s, cssPreparedForSvelteCompiler)

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true, source: filename ?? '' }),
        }
      }
    },

    style: async ({ content, attributes, filename }) => {
      // deprecated the `uno:preflights` syntax because Svelte 4 disallows colons in custom attributes and thus will split `uno:preflights` into two attributes
      const svelte3AddPreflights = attributes['uno:preflights']
      const svelte3AddSafelist = attributes['uno:safelist']
      const svelte4DeprecatedAddPreflights = attributes.uno && attributes.preflights
      const svelte4DeprecatedAddSafelist = attributes.uno && attributes.safelist

      let addPreflights = attributes['uno-preflights'] || svelte3AddPreflights || svelte4DeprecatedAddPreflights
      let addSafelist = attributes['uno-safelist'] || svelte3AddSafelist || svelte4DeprecatedAddSafelist

      if (unoContextFromVite && (addPreflights || addSafelist)) {
        // Svelte 4 style preprocessors will be able to remove attributes after handling them, but for now we must ignore them when using the Vite plugin to avoid a SvelteKit app double-processing that which a component library already processed.
        addPreflights = false
        addSafelist = false
        warnOnce('Notice for those transitioning to @unocss/svelte-scoped/vite: uno-preflights and uno-safelist are only for use in component libraries. Please see the documentation for how to add preflights and safelist into your head tag. If you are consuming a component library built by @unocss/svelte-scoped/preprocess, you can ignore this upgrade notice.') // remove notice in future
      }

      const { hasApply, applyVariables } = checkForApply(content, options.applyVariables)
      const hasThemeFn = options.transformThemeDirective === false
        ? false
        : !!content.match(themeRE)

      const changeNeeded = addPreflights || addSafelist || hasApply || hasThemeFn
      if (!changeNeeded)
        return

      if (!uno)
        uno = await getGenerator((await loadConfig()).config)

      let preflightsSafelistCss = ''
      if (addPreflights || addSafelist) {
        const { css } = await uno.generate([], { preflights: !!addPreflights, safelist: !!addSafelist, minify: true })
        preflightsSafelistCss = wrapSelectorsWithGlobal(css)
      }

      if (hasApply || hasThemeFn) {
        const s = new MagicString(content)

        await transformStyle({
          s,
          uno,
          prepend: preflightsSafelistCss,
          applyVariables,
          transformThemeFn: hasThemeFn,
        })

        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true, source: filename ?? '' }),
          }
        }
      }

      if (preflightsSafelistCss)
        return { code: preflightsSafelistCss + content }
    },
  }
}

async function getGenerator(config: UserConfig, unoContextFromVite?: SvelteScopedContext) {
  if (unoContextFromVite) {
    await unoContextFromVite.ready
    return unoContextFromVite.uno
  }

  const defaults: UserConfigDefaults = {
    presets: [
      presetUno(),
    ],
  }
  return createGenerator(config, defaults)
}
