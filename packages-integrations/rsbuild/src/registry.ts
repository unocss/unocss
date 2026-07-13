import type { NativeContext } from './context'
import process from 'node:process'

interface RegistryState {
  contexts: Map<string, NativeContext>
  sequence: number
}

const registryKey = Symbol.for('@unocss/rsbuild/context-registry')
const globalRegistry = globalThis as typeof globalThis & {
  [registryKey]?: RegistryState
}

/** 获取当前进程共享的 loader context registry。 */
function getRegistry(): RegistryState {
  globalRegistry[registryKey] ??= {
    contexts: new Map(),
    sequence: 0,
  }
  return globalRegistry[registryKey]
}

/**
 * 注册 compiler 对应的 UnoCSS context。
 *
 * @param context 待注册的原生 integration 上下文。
 * @returns 传递给 Rspack loader 的唯一 context ID。
 */
export function registerContext(context: NativeContext): string {
  const registry = getRegistry()
  registry.sequence += 1
  const id = `${process.pid}-${registry.sequence}`
  registry.contexts.set(id, context)
  return id
}

/**
 * 按 ID 获取 loader 所属的 UnoCSS context。
 *
 * @param id context 唯一标识。
 * @returns 已注册 context，不存在时返回 undefined。
 */
export function getContext(id: string): NativeContext | undefined {
  return getRegistry().contexts.get(id)
}

/**
 * 注销 compiler context，释放进程级引用。
 *
 * @param id context 唯一标识。
 */
export function unregisterContext(id: string): void {
  getRegistry().contexts.delete(id)
}
