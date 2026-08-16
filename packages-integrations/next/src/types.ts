// subset of the webpack loader context Turbopack implements.
export interface LoaderContext {
  resourcePath: string
  rootContext: string // project root
  async: () => (err: Error | null, code?: string, map?: any) => void
  addDependency: (file: string) => void
  addContextDependency: (dir: string) => void
}

// importing from next brings in `next/types/global.d.ts` which breaks `import.meta.glob<T>()`
export interface NextConfigLike {
  turbopack?: {
    rules?: Record<string, unknown>
  }
  webpack?: ((config: any, context: any) => any) | null
}
