import * as handlers from './handlers'

export type HandlerName = keyof typeof handlers

export const handlersNames = Object.keys(handlers) as HandlerName[]

export type Handler = {[K in HandlerName]: Handler} & {
  (str: string): string | undefined
  __options: {
    sequence: HandlerName[]
  }
}

const handler = function(
  this: Handler,
  str: string,
): string | number | undefined {
  const s = this.__options?.sequence || []
  this.__options.sequence = []
  for (const n of s) {
    const res = handlers[n](str)
    if (res)
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

handlersNames.forEach((i) => {
  Object.defineProperty(handler, i, {
    enumerable: true,
    get() {
      return addProcessor(this, i)
    },
  })
})

export { handler }
