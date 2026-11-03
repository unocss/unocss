import { useEventListener } from '@vueuse/core'

export function useMagicKey(action: () => void, exit: () => void) {
  useEventListener(window, 'keydown', (event) => {
    if (event.key === 'Escape') {
      exit()
    }
    else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'u' && !event.repeat) {
      event.preventDefault()
      action()
    }
  })
}
