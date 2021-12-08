export type ValueHandlerCallback = (str: string) => string | number | undefined

export type ValueHandler<K> = {
  (str: string): string | undefined
  __options: {
    sequence: K[]
  }
} & (K extends string ? { [S in K]: ValueHandler<any> }: never)

export function createValueHandler<T extends Record<string, ValueHandlerCallback>>(handlers: T): ValueHandler<keyof T> {
  const handler = function(
    this: ValueHandler<keyof T>,
    str: string,
  ): string | number | undefined {
    const s = this.__options?.sequence || []
    this.__options.sequence = []
    for (const n of s) {
      const res = handlers[n](str)
      if (res != null)
        return res
    }
    return undefined
  } as unknown as ValueHandler<keyof T>

  function addProcessor(that: ValueHandler<keyof T>, name: keyof T) {
    if (!that.__options) {
      that.__options = {
        sequence: [],
      }
    }
    that.__options.sequence.push(name)
    return that
  }

  for (const name of Object.keys(handlers)) {
    Object.defineProperty(handler, name, {
      enumerable: true,
      get() {
        return addProcessor(this, name)
      },
    })
  }

  return handler
}
