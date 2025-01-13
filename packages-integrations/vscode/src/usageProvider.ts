import type { CancellationToken, Position, ReferenceContext, ReferenceProvider, TextDocument } from 'vscode'
import type { ContextLoader } from './contextLoader'
import { env, languages, Location, Range, Uri, window, workspace } from 'vscode'
import { getLanguageIds } from './configs'
import { getMatchedPositionsFromDoc } from './getMatched'

export class UsageReferenceProvider implements ReferenceProvider {
  warned = false

  constructor(
    public loader: ContextLoader,
  ) { }

  public async provideReferences(
    document: TextDocument,
    position: Position,
    _context: ReferenceContext,
    _token: CancellationToken,
  ): Promise<Location[] | undefined> {
    const ctx = await this.loader.resolveClosestContext(document.getText(), document.uri.fsPath)
    if (!ctx || !ctx.filter(document.getText(), document.uri.fsPath))
      return undefined

    const positions = await getMatchedPositionsFromDoc(ctx.uno, document)
    const index = document.offsetAt(position)
    const matched = positions.find(i => i[0] <= index && i[1] >= index)

    if (!matched || !matched[2]) {
      return undefined
    }

    if (!this.warned) {
      window.showInformationMessage(
        `[UnoCSS] Find all references is an experimental feature`,
        'Dismiss',
        'Report Issue',
      ).then((r) => {
        if (r !== 'Report Issue')
          return
        env.openExternal(Uri.parse('https://github.com/unocss/unocss/pull/4353'))
      })
      this.warned = true
    }

    const name = matched[2]

    // TODO: Use Uno's context to find files
    const files = await workspace.findFiles(
      `**/*.{vue,html,js,ts,jsx,tsx,svelte,astro,elm,php,phtml,mdx,md}`,
      '**/{node_modules,.git,dist,.output,.cache,cache}/**',
      1000,
    )

    const result = (
      await Promise.all(files.map(async (f) => {
        const doc = await workspace.openTextDocument(f)
        if (!ctx.filter(doc.getText(), f.fsPath))
          return undefined
        const positions = await getMatchedPositionsFromDoc(ctx.uno, doc)
        return {
          doc,
          positions,
        }
      }))
    ).filter(i => !!i)

    // @ts-expect-error backward compatibility, _cache was a private field, now it's public
    const cacheMap = (ctx.uno.cache || ctx.uno._cache || new Map()) as typeof ctx.uno.cache
    const target = cacheMap.get(name)

    if (!target) {
      return positions
        .filter(i => i[2] === name)
        .map(i => new Location(document.uri, new Range(document.positionAt(i[0]), document.positionAt(i[1]))))
    }

    // Find all names that match the record (alias)
    const names = new Set([
      name,
      ...([...cacheMap.entries()])
        .filter(([_, utils]) => {
          if (!utils)
            return false
          if (utils.length !== target.length)
            return false
          return utils.every((item, index) => item[2] === target[index][2])
        })
        .map(i => i[0]),
    ])

    return Object.values(result).flatMap(({ doc, positions }) => {
      return positions
        .filter(i => names.has(i[2]))
        .map(i => new Location(doc.uri, new Range(doc.positionAt(i[0]), doc.positionAt(i[1]))))
    })
  }
}

export async function registerUsageProvider(loader: ContextLoader) {
  const provider = new UsageReferenceProvider(loader)

  loader.ext.subscriptions.push(
    languages.registerReferenceProvider(
      await getLanguageIds(),
      provider,
    ),
  )
}
