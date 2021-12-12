import type { Update, UpdatePayload } from 'vite/types/hmrPayload'

const MODULE_PATH = '/@vite/client'

const _onModuleUpdated = createEventHook<Update>()
const _onConfigChanged = createEventHook<void>()
export const onModuleUpdated = _onModuleUpdated.on
export const onConfigChanged = _onConfigChanged.on

import(/* @vite-ignore */ MODULE_PATH)
  .then((c) => {
    const hmr = c.createHotContext('/')
    hmr.on('vite:beforeUpdate', (update: UpdatePayload) => {
      update.updates.forEach((u) => {
        _onModuleUpdated.trigger(u)
      })
    })
    hmr.on('unocss:config-changed', () => {
      _onConfigChanged.trigger()
    })
  })
  .catch((e) => {
    console.error('failed to connect to client vite server, you might need to do manual refresh to see the updates')
    console.error(e)
  })
