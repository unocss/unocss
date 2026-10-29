import { ref } from 'vue'

export const INSPECTOR_SEARCH_EVENT = 'unocss-inspector:search'

const searchQuery = ref('')

export function useInspectorSearch() {
  function searchUtility(value: string) {
    searchQuery.value = value

    if (typeof window !== 'undefined')
      window.dispatchEvent(new CustomEvent(INSPECTOR_SEARCH_EVENT, { detail: value }))
  }

  return {
    searchQuery,
    searchUtility,
  }
}
