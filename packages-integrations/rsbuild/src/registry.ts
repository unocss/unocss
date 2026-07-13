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

function getRegistry(): RegistryState {
  globalRegistry[registryKey] ??= {
    contexts: new Map(),
    sequence: 0,
  }
  return globalRegistry[registryKey]
}

export function registerContext(context: NativeContext): string {
  const registry = getRegistry()
  registry.sequence += 1
  const id = `${process.pid}-${registry.sequence}`
  registry.contexts.set(id, context)
  return id
}

export function getContext(id: string): NativeContext | undefined {
  return getRegistry().contexts.get(id)
}

export function unregisterContext(id: string): void {
  getRegistry().contexts.delete(id)
}

export function getRegisteredContextCount(): number {
  return getRegistry().contexts.size
}
