import type { AttributifyResolverParams } from '..'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'

// @ts-expect-error ignore
const traverse = (_traverse.default || _traverse) as typeof _traverse

export async function attributifyJsxBabelResolver(params: AttributifyResolverParams) {
  const { code, uno, isBlocked } = params
  const tasks: Promise<void>[] = []
  const ast = parse(code.toString(), {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  if (ast.errors?.length) {
    throw new Error(`Babel parse errors:\n${ast.errors.join('\n')}`)
  }

  traverse(ast, {
    JSXAttribute(path) {
      if (path.node.value === null) {
        const attr = path.node.name.type === 'JSXNamespacedName'
          ? `${path.node.name.namespace.name}:${path.node.name.name.name}`
          : path.node.name.name

        if (isBlocked(attr))
          return

        tasks.push(
          uno.parseToken(attr).then((matched) => {
            if (matched) {
              code.appendRight(path.node.end!, '=""')
            }
          }),
        )
      }
    },
  })

  await Promise.all(tasks)
}
