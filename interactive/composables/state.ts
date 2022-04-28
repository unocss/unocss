import { createGenerator } from '@unocss/core'
import { createAutocomplete } from '@unocss/autocomplete'
import { breakpointsTailwind } from '@vueuse/core'
import type { ResultItem, RuleItem } from '~/types'

import { defaultConfig } from '~/unocss.config'

export const isCompact = useStorage('uno-interact-compact', false)
export const toggleCompact = useToggle(isCompact)

export const uno = createGenerator({}, defaultConfig)
export const ac = createAutocomplete(uno)

export const matchedMap = reactive(new Map<string, RuleItem>())
export const featuresMap = reactive(new Map<string, Set<RuleItem>>())

export const input = ref('')
export const selectIndex = ref(0)
export const isSearching = ref(false)
export const isModalOpen = ref(true)
export const searchResult = shallowRef<ResultItem[]>([])

export const breakpoints = useBreakpoints(breakpointsTailwind)
export const isDesktop = breakpoints.lg
export const isMobile = logicNot(isDesktop)
