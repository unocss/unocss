import { Ref, unref } from 'vue'
import { ModuleInfo, ProjectInfo } from '../../types'

const API_ROOT = '/__unocss/inspect_api'

export const info = ref<ProjectInfo>()

fetch(API_ROOT).then(r => r.json()).then(r => info.value = r)

export function fetchModule(id: string | Ref<string>) {
  return useFetch(computed(() => `${API_ROOT}/module?id=${encodeURIComponent(unref(id))}`), { refetch: true })
    .json<ModuleInfo>()
}
