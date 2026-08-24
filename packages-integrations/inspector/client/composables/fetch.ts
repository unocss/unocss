import type { Ref, ShallowRef } from 'vue'
import type { ModuleInfo, OverviewInfo, ProjectInfo, ReplResult } from '../../types'
import { shallowRef, unref } from 'vue'
import { onConfigChanged, onInvalidated, onModuleUpdated, onReconnected, rpcCall } from './rpc'

export interface RpcQuery<T> {
  data: ShallowRef<T | null>
  isFetching: Ref<boolean>
  error: ShallowRef<unknown>
  execute: () => Promise<void>
}

function createQuery<T>(fn: () => Promise<T>, options: { immediate?: boolean } = {}): RpcQuery<T> {
  const data = shallowRef<T | null>(null)
  const isFetching = ref(false)
  const error = shallowRef<unknown>(null)
  let version = 0

  async function execute() {
    const current = ++version
    isFetching.value = true
    try {
      const result = await fn()
      if (current === version) {
        data.value = result
        error.value = null
      }
    }
    catch (e) {
      if (current === version)
        error.value = e
    }
    finally {
      if (current === version)
        isFetching.value = false
    }
  }

  if (options.immediate !== false)
    execute()

  return { data, isFetching, error, execute }
}

export const infoFetch = createQuery<ProjectInfo>(() => rpcCall('get-project-info'))
export const overviewFetch = createQuery<OverviewInfo>(() => rpcCall('get-overview'), { immediate: false })

export const info = infoFetch.data
export const overview = overviewFetch.data

function refreshProject() {
  infoFetch.execute()
  overviewFetch.execute()
}

onConfigChanged(refreshProject)
onInvalidated(refreshProject)
onReconnected(refreshProject)

export function fetchModule(id: string | Ref<string>) {
  const result = createQuery<ModuleInfo | null>(() => rpcCall('get-module-info', unref(id)))

  watch(() => unref(id), () => result.execute())
  onConfigChanged(() => result.execute())
  onReconnected(() => result.execute())
  onModuleUpdated((update) => {
    const currentId = unref(id)
    if (update.path === currentId || currentId.startsWith(`${update.path}?`)) {
      setTimeout(() => {
        result.execute()
      }, 50)
    }
  })

  return result
}

export function fetchRepl(input: Ref<string>, includeSafelist: Ref<boolean>) {
  const debounced = useDebounce(input, 500)
  const result = createQuery<ReplResult>(() => rpcCall('generate-repl', debounced.value, includeSafelist.value))

  watch([debounced, includeSafelist], () => result.execute())
  onConfigChanged(() => result.execute())
  onReconnected(() => result.execute())

  return result
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
      nodeModules: { children: {}, items: [] },
    }
  }

  const inWorkspace: ModuleDest[] = []
  const inRoot: ModuleDest[] = []
  const inNodeModules: ModuleDest[] = []
  info.value
    .modules
    .map(i => ({ full: i, path: i }))
    .forEach((i) => {
      if (i.full.includes('node_modules'))
        inNodeModules.push(i)
      else if (i.full.startsWith(info.value!.root))
        inWorkspace.push(i)
      else
        inRoot.push(i)
    })
  inWorkspace.forEach(i => i.path = i.path.slice(info.value!.root.length + 1))

  return {
    workspace: toTree(inWorkspace, 'Project Root'),
    nodeModules: toTree(inNodeModules, 'Node Modules'),
    root: toTree(inRoot, 'Disk Root'),
  }
})

function toTree(modules: ModuleDest[], name: string) {
  const node: TreeNode = { name, children: {}, items: [] }

  function add(mod: ModuleDest, parts: string[], current = node) {
    if (!mod)
      return

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

  function flat(node: TreeNode) {
    if (!node)
      return
    const children = Object.values(node.children)
    if (children.length === 1 && !node.items.length) {
      const child = children[0]
      node.name = node.name ? `${node.name}/${child.name}` : child.name
      node.items = child.items
      node.children = child.children
      flat(node)
    }
    else {
      children.forEach(flat)
    }
  }

  Object.values(node.children).forEach(flat)

  return node
}
