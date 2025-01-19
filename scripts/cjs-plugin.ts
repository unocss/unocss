import type { Plugin } from 'rollup'
import type { BuildContext } from 'unbuild'
import { findExports, findStaticImports, parseStaticImport } from 'mlly'

export function fixCJSExportTypePlugin(ctx: BuildContext): Plugin {
  const regexp = /export\s*\{([^}]*)\}/
  const defaultExportRegexp = /\s*as\s+default\s*/
  const typeExportRegexp = /\s*type\s+/
  return {
    name: 'unbuild-fix-cjs-export-type',
    renderChunk(code, info) {
      if (
        info.type !== 'chunk'
        || !(
          info.fileName.endsWith('.d.ts') || info.fileName.endsWith('.d.cts')
        )
        || !info.isEntry
        || !info.exports?.length
        || !info.exports.includes('default')
      ) {
        return
      }

      const defaultExport = findExports(code).find(e =>
        e.names.includes('default'),
      )

      if (!defaultExport) {
        return
      }

      const match = defaultExport.code.match(regexp)
      if (!match?.length) {
        return
      }

      let defaultAlias: string | undefined
      const exportsEntries: string[] = []
      for (const exp of match[1].split(',').map(e => e.trim())) {
        const m = exp.match(defaultExportRegexp)
        if (m) {
          defaultAlias = exp.replace(m[0], '')
        }
        else {
          exportsEntries.push(exp)
        }
      }

      if (!defaultAlias) {
        // handle default export like:
        // import defaultExport from '<some-identifier>'
        // export default defaultExport
        // dts plugin will generate code like:
        // import defaultExport from '<some-identifier>';
        // export { default } from '<some-identifier>';
        const defaultStaticImport = findStaticImports(code).find(i => i.specifier === defaultExport.specifier)
        const defaultImport = defaultStaticImport ? parseStaticImport(defaultStaticImport).defaultImport : undefined
        if (!defaultExport) {
          ctx.warnings.add(`Incorrect default export: ${info.fileName}`)
          return
        }
        // this will generate the following code:
        // import defaultExport from '<some-identifier>';
        // export = defaultExport;
        return code.replace(
          defaultExport.code,
          `export = ${defaultImport}`,
        )
      }

      let exportStatement = exportsEntries.length > 0 ? undefined : ''

      // replace export { type A, type B, type ... } with export type { A, B, ... }
      // that's, if all remaining exports are type exports, replace export {} with export type {}
      if (exportStatement === undefined) {
        let someExternalExport = false
        const allRemainingExports = exportsEntries.map((exp) => {
          if (someExternalExport) {
            return [exp, ''] as const
          }
          if (!info.imports.includes(exp)) {
            const m = exp.match(typeExportRegexp)
            if (m) {
              const name = exp.replace(m[0], '').trim()
              if (!info.imports.includes(name)) {
                return [exp, name] as const
              }
            }
          }
          someExternalExport = true
          return [exp, ''] as const
        })
        exportStatement = someExternalExport
          ? `;\nexport { ${allRemainingExports.map(([e, _]) => e).join(', ')} }`
          : `;\nexport type { ${allRemainingExports.map(([_, t]) => t).join(', ')} }`
      }

      return code.replace(
        defaultExport.code,
        `export = ${defaultAlias}${exportStatement}`,
      )
    },
  } as Plugin
}
