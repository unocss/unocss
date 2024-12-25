import type { UnoGenerator } from '@unocss/core'
import type { CancellationToken, ExtensionContext, Position, ReferenceContext, ReferenceProvider, TextDocument } from 'vscode'
import type { ContextLoader } from './contextLoader'
import { languages, Location, Range, window, workspace } from 'vscode'
import { getMatchedPositionsFromDoc } from './getMatched'

export class UsageReferenceProvider implements ReferenceProvider {
  constructor(
    public ext: ExtensionContext,
    public loader: ContextLoader,
  ) {

  }

  public async provideReferences(
    document: TextDocument,
    position: Position,
    _context: ReferenceContext,
    _token: CancellationToken,
  ): Promise<Location[] | undefined> {
    const ctx = await this.loader.resolveClosestContext(document.getText(), document.uri.fsPath)
    if (!ctx) {
      return undefined
    }

    const positions = await getMatchedPositionsFromDoc(ctx.uno, document)

    const index = document.offsetAt(position)
    const matched = positions.find(i => i[0] <= index && i[1] >= index)

    if (!matched) {
      return undefined
    }

    const names = [matched[2]]

    // TODO: find utils alias
    if (names[0] === 'm3')
      names.push('m-3', '[m="3"]')

    window.showInformationMessage(`Matched: ${JSON.stringify(names)}`)

    const locations: Location[] = []

    // TODO: Use Uno's context to find files
    const files = await workspace.findFiles('**/*.vue', '**/node_modules/**', 1000)
    window.showInformationMessage(`Found ${files.length} files, ${files.map(i => i.fsPath).join(', ')}`)

    for (const file of files) {
      const doc = await workspace.openTextDocument(file)
      const usages = await findUsagesOfUtils(doc, names, ctx.uno)
      locations.push(...usages)
    }

    return locations
  }
}

async function findUsagesOfUtils(
  doc: TextDocument,
  names: string[],
  uno: UnoGenerator,
): Promise<Location[]> {
  const positions = await getMatchedPositionsFromDoc(uno, doc) || []

  return positions
    .filter(i => names.includes(i[2]))
    .map(i => new Location(doc.uri, new Range(doc.positionAt(i[0]), doc.positionAt(i[1]))))
}

export function registerUsageProvider(ext: ExtensionContext, ctx: ContextLoader) {
  // TODO: use a more languages
  const provider = languages.registerReferenceProvider(
    { language: 'vue' },
    new UsageReferenceProvider(ext, ctx),
  )

  ext.subscriptions.push(provider)
}
