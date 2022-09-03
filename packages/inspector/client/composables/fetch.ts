import type { Ref } from 'vue'
import { unref } from 'vue'
import type { ModuleInfo, OverviewInfo, ProjectInfo, Result } from '../../types'
import { onConfigChanged, onModuleUpdated } from './hmr'

const API_ROOT = '/__unocss_api'

export const infoFetch = useFetch(API_ROOT).json<ProjectInfo>()
export const overviewFetch = useFetch(`${API_ROOT}/overview`, { immediate: false }).json<OverviewInfo>()

export const info = infoFetch.data
export const overview = overviewFetch.data

onConfigChanged(() => {
  infoFetch.execute()
  overviewFetch.execute()
})

export function fetchModule(id: string | Ref<string>) {
  const result = useFetch(computed(() => `${API_ROOT}/module?id=${encodeURIComponent(unref(id))}`), { refetch: true })
    .json<ModuleInfo>()

  onConfigChanged(() => result.execute())
  onModuleUpdated((update) => {
    if (update.path === unref(id) || update.path === unref(id).slice(info.value?.root.length || 0)) {
      setTimeout(() => {
        result.execute()
      }, 50)
    }
  })

  return result
}

export function fetchRepl(input: Ref<string>, includeSafelist: Ref<boolean>) {
  const debounced = useDebounce(input, 500)
  return useFetch(computed(() => `${API_ROOT}/repl?token=${encodeURIComponent(debounced.value)}&safelist=${includeSafelist.value}`), { refetch: true })
    .json<Result>()
}

export interface ModuleDest {
  full: string
  path: string
}

export interface TreeNode {
  name?: string
  children: Record<string, TreeNode>
  items: ModuleDest[]
}

export const moduleTree = computed(() => {
  if (!info.value) {
    return {
      workspace: { children: {}, items: [] },
      root: { children: {}, items: [] },
    }
  }

  const modules: ModuleDest[] = info.value.modules.map(i => ({ full: i, path: i }))
  const inWorkspace = modules.filter(i => i.full.startsWith(info.value!.root))
  const inRoot = modules.filter(i => !i.full.startsWith(info.value!.root))
  inWorkspace.forEach(i => i.path = i.path.slice(info.value!.root.length + 1))

  return {
    workspace: toTree(inWorkspace, 'Project Root'),
    root: toTree(inRoot, 'Disk Root'),
  }
})

function toTree(modules: ModuleDest[], name: string) {
  const node: TreeNode = { name, children: {}, items: [] }

  function add(mod: ModuleDest, parts: string[], current = node) {
    if (parts.length <= 1) {
      current.items.push(mod)
      return
    }

    const first = parts.shift()!
    if (!current.children[first])
      current.children[first] = { name: first, children: {}, items: [] }
    add(mod, parts, current.children[first])
  }

  modules.forEach((m) => {
    const parts = m.path.split(/\//g).filter(Boolean)
    add(m, parts)
  })

  return node
}
