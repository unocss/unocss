import type { ReplResult, SerializedUnoCSSSettings } from '../../types'
import { rpcCall } from '../client-rpc'

export function useUnoCSS() {
  return {
    getSettings: () => rpcCall<SerializedUnoCSSSettings>('get-settings'),
    generateCSS: (tokens: string, _options?: { preflights?: boolean, safelist?: boolean }) =>
      rpcCall<ReplResult>('generate-repl', tokens, false),
    async formatHTML(html: string) {
      const [{ format }, { default: plugin }] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/html'),
      ])
      return format(html, { parser: 'html', plugins: [plugin], htmlWhitespaceSensitivity: 'strict' })
    },
  }
}
