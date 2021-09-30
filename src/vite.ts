import { createHash } from 'crypto'
import { Plugin } from 'vite'
import { MiniwindRule } from './types'
import { createGenerator, defaultRules } from '.'

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

const VIRTUAL_PREFIX = '/@virtual/miniwind/'

export default function MiniwindVitePlugin(rules: MiniwindRule[] = defaultRules): Plugin {
  const generate = createGenerator(rules)
  const map = new Map<string, [string, string]>()

  return {
    name: 'miniwind',
    enforce: 'post',
    transform(code, id) {
      if (id.endsWith('.css'))
        return null

      const style = generate(code)
      if (!style)
        return null

      const hash = getHash(id)
      map.set(hash, [id, style])
      return `import "${VIRTUAL_PREFIX}${hash}.css";${code}`
    },
    resolveId(id) {
      return id.startsWith(VIRTUAL_PREFIX) ? id : null
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX))
        return null

      const hash = id.slice(VIRTUAL_PREFIX.length, -'.css'.length)

      const [source, css] = map.get(hash) || []

      if (source)
        this.addWatchFile(source)

      return css
    },
  }
}
