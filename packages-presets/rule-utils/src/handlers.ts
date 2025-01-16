export type ValueHandlerCallback = (str: string) => string | number | undefined

export type ValueHandler<K extends string> = { [S in K]: ValueHandler<K> } & {
  (str: string): string | undefined
  __options: {
    sequence: K[]
  }
}

export function createValueHandler<K extends string>(handlers: Record<K, ValueHandlerCallback>): ValueHandler<K> {
  const handler = function (
    this: ValueHandler<K>,
    str: string,
  ): string | number | undefined {
    const s = this.__options?.sequence || []
    this.__options.sequence = []
    for (const n of s) {
      const res = handlers[n](str)
      if (res != null)
        return res
    }
  } as unknown as ValueHandler<K>

  function addProcessor(that: ValueHandler<K>, name: K) {
    if (!that.__options) {
      that.__options = {
        sequence: [],
      }
    }
    that.__options.sequence.push(name)
    return that
  }

  for (const name of Object.keys(handlers) as K[]) {
    Object.defineProperty(handler, name, {
      enumerable: true,
      configurable: true,
      get() {
        return addProcessor(this, name)
      },
    })
  }

  return handler
}
