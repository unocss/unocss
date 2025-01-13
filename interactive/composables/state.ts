import type { UserConfig } from '@unocss/core'
import type { Ref } from 'vue'
import type { ResultItem } from '~/types'
import { createSearch, evaluateUserConfig } from '#docs'
import defaultConfigRaw from '#docs/default-config.ts?raw'
import { unocssBundle } from '#docs/unocss-bundle'
import { createGenerator } from '@unocss/core'
import { breakpointsTailwind } from '@vueuse/core'
import { guideIndex as guides } from '~/data/guides'
import { mdnIndex as docs } from '~/data/mdn-index'
import { defaultConfig } from '~/uno.config'

export { defaultConfigRaw }

export const isCompact = useLocalStorage('uno-interact-compact', false)
export const toggleCompact = useToggle(isCompact)

export const searcher: Ref<ReturnType<typeof createSearch>> = shallowRef()

const _uno = createGenerator({}, defaultConfig)

_uno.then((uno) => {
  const search = createSearch({ uno, docs, guides })
  searcher.value = search
})

const initParams = new URLSearchParams(location.search)

export const input = ref(initParams.get('s')?.toString() || '')
export const selectIndex = ref(0)
export const isSearching = ref(false)
export const isModalOpen = ref(true)
export const currentTab = ref<'search' | 'config'>('search')
export const searchResult = shallowRef<ResultItem[]>([])

export const breakpoints = useBreakpoints(breakpointsTailwind)
export const isDesktop = breakpoints.lg
export const isMobile = logicNot(isDesktop)

export const userConfigRaw = useLocalStorage('unocss-docs-config', '')
export const userConfigLoading = ref(true)
export const userConfig = ref<UserConfig | undefined>()

async function load() {
  userConfigLoading.value = true
  try {
    userConfig.value = await evaluateUserConfig(userConfigRaw.value || defaultConfigRaw, unocssBundle)
  }
  catch (e) {
    console.error(e)
  }
  finally {
    userConfigLoading.value = false
  }
}

watch(userConfig, async () => {
  (await _uno).setConfig(userConfig.value || {}, defaultConfig)
})

load()
