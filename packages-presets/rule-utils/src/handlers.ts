export type ValueHandlerCallback<T extends object> = (str: string, theme?: T) => string | number | undefined

export type ValueHandler<K extends string, T extends object> = { [S in K]: ValueHandler<K, T> } & {
  (str: string, theme?: T): string | undefined
  __options: {
    sequence: K[]
  }
}

export function createValueHandler<K extends string, T extends object>(handlers: Record<K, ValueHandlerCallback<T>>): ValueHandler<K, T> {
  const handler = function (
    this: ValueHandler<K, T>,
    str: string,
    theme?: T,
  ): string | number | undefined {
    const s = this.__options?.sequence || []
    this.__options.sequence = []
    for (const n of s) {
      const res = handlers[n](str, theme)
      if (res != null)
        return res
    }
  } as unknown as ValueHandler<K, T>

  function addProcessor(that: ValueHandler<K, T>, name: K) {
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
