import type { ResolvedConfig, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'

const wind4Metadata = Symbol('wind4-metadata')

export type Wind4Context = Pick<RuleContext<Theme>, 'theme' | 'generator'>
export type ThemeInput = Theme | Wind4Context

export interface TrackingState {
  themeDeps: Set<string>
  propertyDeps: Map<string, string>
}

export function isContext(input: ThemeInput): input is Wind4Context {
  return 'theme' in input && 'generator' in input
    && typeof input.generator === 'object' && input.generator !== null
    && 'config' in input.generator && 'generate' in input.generator
    && typeof input.generator.generate === 'function'
}

export function getTheme(input: ThemeInput): Theme {
  return isContext(input) ? input.theme : input
}

export function getTrackingState(context?: Wind4Context): TrackingState | undefined {
  return context && getConfigTrackingState(context.generator.config)
}

export function getConfigTrackingState(config: Readonly<ResolvedConfig<Theme>>): TrackingState | undefined {
  const meta = config.presets.find(p => p.meta && Object.hasOwn(p.meta, wind4Metadata))?.meta
  if (meta?.themeDeps instanceof Set && meta.propertyDeps instanceof Map)
    return { themeDeps: meta.themeDeps, propertyDeps: meta.propertyDeps }
}

export function resolveTrackingMeta(meta: Record<string, any> | undefined): Record<string, any> {
  return Object.create(Object.getPrototypeOf(meta ?? {}), {
    ...Object.getOwnPropertyDescriptors(meta ?? {}),
    [wind4Metadata]: { value: true },
    themeDeps: { value: new Set<string>(), enumerable: true, writable: true, configurable: true },
    propertyDeps: { value: new Map<string, string>(), enumerable: true, writable: true, configurable: true },
  })
}
