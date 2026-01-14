import type { AttributifyResolverParams } from '..'
import { parseSync } from 'oxc-parser'
import { walk } from 'oxc-walker'

export async function attributifyJsxOxcResolver(params: AttributifyResolverParams) {
  const { code, id, uno, isBlocked } = params
  const tasks: Promise<void>[] = []
  const ast = parseSync(id, code.toString(), {
    sourceType: 'module',
  })

  if (ast.errors?.length) {
    throw new Error(`Oxc parse errors:\n${ast.errors.join('\n')}`)
  }

  walk(ast.program, {
    enter(node) {
      if (node.type !== 'JSXAttribute')
        return

      if (node.value === null) {
        const attr = node.name.type === 'JSXNamespacedName'
          ? `${node.name.namespace.name}:${node.name.name.name}`
          : node.name.name

        if (isBlocked(attr))
          return

        tasks.push(
          uno.parseToken(attr).then((matched) => {
            if (matched) {
              code.appendRight(node.end, '=""')
            }
          }),
        )
      }
    },
  })

  await Promise.all(tasks)
}
