import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export function getReset(injectReset: string): string {
  if (injectReset.startsWith('@unocss/reset'))
    return readFileSync(resolve(_dirname, `../node_modules/${injectReset}`), 'utf-8')

  if (injectReset.startsWith('.')) {
    const resolved = resolve(process.cwd(), injectReset)
    if (!isFile(resolved))
      throw new Error(`"${injectReset}" given as your injectReset value is not a valid file path relative to the root of your project, where your vite config file sits. To give an example, if you placed a reset.css in your src directory, "./src/reset.css" would work.`)

    return readFileSync(resolved, 'utf-8')
  }

  if (injectReset.startsWith('/'))
    throw new Error(`Your injectReset value: "${injectReset}" is not a valid file path. To give an example, if you placed a reset.css in your src directory, "./src/reset.css" would work.`)

  const resolvedFromNodeModules = resolve(process.cwd(), 'node_modules', injectReset)
  if (!isFile(resolvedFromNodeModules))
    throw new Error(`"${injectReset}" given as your injectReset value is not a valid file path relative to your project's node_modules folder. Can you confirm that you've installed "${injectReset}"?`)

  return readFileSync(resolvedFromNodeModules, 'utf-8')
}

function isFile(path: string) {
  return existsSync(path) && statSync(path).isFile()
}
