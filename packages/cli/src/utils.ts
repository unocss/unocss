export function debouncePromise<T extends unknown[]>(
  fn: (...args: T) => Promise<void>,
  delay: number,
  onError: (err: unknown) => void,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let promiseInFly: Promise<void> | undefined
  let callbackPending: (() => void) | undefined

  return function debounced(...args: Parameters<typeof fn>) {
    if (promiseInFly) {
      callbackPending = () => {
        debounced(...args)
        callbackPending = undefined
      }
    }
    else {
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = undefined
        promiseInFly = fn(...args)
          .catch(onError)
          .finally(() => {
            promiseInFly = undefined
            if (callbackPending) callbackPending()
          })
      }, delay)
    }
  }
}
