import * as miniHandlers from './handlers'

export type ValueHandlerCallback = (str: string) => string | number | undefined

export type HandlerName = (keyof typeof miniHandlers) | string

export const handlersNames = Object.keys(miniHandlers) as HandlerName[]

export type Handler = {[K in HandlerName]: Handler} & {
  (str: string): string | undefined
  __options: {
    sequence: HandlerName[]
  }
}

const handlers: Record<string, ValueHandlerCallback> = {}

const handler = function(
  this: Handler,
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
} as unknown as Handler

function addProcessor(that: Handler, name: HandlerName) {
  if (!that.__options) {
    that.__options = {
      sequence: [],
    }
  }
  that.__options.sequence.push(name)
  return that
}

Object.entries(miniHandlers).forEach(([name, callback]) => registerProcessor(name, callback))

export function registerProcessor(name: HandlerName, callback: ValueHandlerCallback) {
  if (!(name in handlers)) {
    Object.defineProperty(handler, name, {
      enumerable: true,
      get() {
        return addProcessor(this, name)
      },
    })
  }

  handlers[name] = callback
}

export { handler }
