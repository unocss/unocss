import { readFile } from 'node:fs/promises'
import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { parse } from 'postcss'
import { compile } from 'tailwindcss'

export const tailwindTheme = readFile(new URL(import.meta.resolve('tailwindcss/theme.css')), 'utf8')

export async function generate(candidates: string | string[]) {
  const tokens = typeof candidates === 'string' ? [candidates] : candidates
  const uno = await createGenerator({ presets: [presetWind4()] })
  const tailwind = await compile(`${await tailwindTheme}\n@tailwind utilities;`)
  return {
    wind: parse((await uno.generate(tokens)).css),
    tailwind: parse(tailwind.build(tokens)),
  }
}

export function declarations(root: ReturnType<typeof parse>, candidate: string) {
  const result: Record<string, string> = {}
  root.walkRules((rule) => {
    if (rule.selector === `.${escapeSelector(candidate)}` && rule.parent?.type === 'root') {
      for (const node of rule.nodes) {
        if (node.type === 'decl')
          result[node.prop] = node.value
      }
    }
  })
  return result
}

export function declarationPaths(root: ReturnType<typeof parse>, property: string, value: string) {
  const paths: string[] = []
  root.walkDecls(property, (decl) => {
    if (decl.value !== value)
      return
    const path: string[] = []
    let node = decl.parent
    while (node && node.type !== 'root') {
      if (node.type === 'rule')
        path.push(node.selector)
      if (node.type === 'atrule')
        path.push(`@${node.name} ${node.params}`)
      node = node.parent
    }
    paths.push(path.reverse().join(' '))
  })
  return paths
}
