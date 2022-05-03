import type { UserConfig } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { breakpointsTailwind } from '@vueuse/core'
import { createSearch, evaluateUserConfig } from '@unocss/shared-docs'
// @ts-expect-error anyway
import defaultConfigStr from '../../packages/shared-docs/src/defaultConfig.ts?raw'
import type { ResultItem } from '~/types'
import { mdnIndex as docs } from '~/data/mdn-index'
import { guideIndex as guides } from '~/data/guides'

import { defaultConfig } from '~/unocss.config'

export { defaultConfigStr }

export const isCompact = useStorage('uno-interact-compact', false)
export const toggleCompact = useToggle(isCompact)

export const uno = createGenerator({}, defaultConfig)
export const searcher = createSearch({ uno, docs, guides })

export const input = ref('')
export const selectIndex = ref(0)
export const isSearching = ref(false)
export const isModalOpen = ref(true)
export const currentTab = ref<'search' | 'config'>('search')
export const searchResult = shallowRef<ResultItem[]>([])

export const breakpoints = useBreakpoints(breakpointsTailwind)
export const isDesktop = breakpoints.lg
export const isMobile = logicNot(isDesktop)

export const userConfigRaw = useStorage('unocss-docs-config', '')
export const userConfigLoading = ref(true)
export const userConfig = ref<UserConfig | undefined>()

async function load() {
  userConfigLoading.value = true
  try {
    userConfig.value = await evaluateUserConfig(userConfigRaw.value || defaultConfigStr)
  }
  catch (e) {
    console.error(e)
  }
  finally {
    userConfigLoading.value = false
  }
}

watch(userConfig, () => {
  uno.setConfig(userConfig.value || {}, defaultConfig)
})

load()
