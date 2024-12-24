import type { UnoGenerator } from '@unocss/core'
import type { CancellationToken, ExtensionContext, Position, ReferenceContext, ReferenceProvider, TextDocument } from 'vscode'
import type { ContextLoader } from './contextLoader'
import { getMatchedPositionsFromCode } from '@unocss/shared-common'
import { languages, Location, Range, window, workspace } from 'vscode'
import { useConfigurations } from './configuration'
import { defaultIdeMatchExclude, defaultIdeMatchInclude } from './integration'

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
    window.showInformationMessage(`SimpleReferenceProvider 222 called with position: ${position} on document: ${document.uri}`)

    const ctx = await this.loader.resolveClosestContext(document.getText(), document.uri.fsPath)
    if (!ctx) {
      window.showWarningMessage(`No context found for document ${document.uri}`)
      return undefined
    }

    const { configuration } = useConfigurations(this.ext)

    const options = configuration.strictAnnotationMatch
      ? {
          includeRegex: defaultIdeMatchInclude,
          excludeRegex: defaultIdeMatchExclude,
        }
      : undefined

    const positions = await getMatchedPositionsFromCode(
      ctx.uno,
      document.getText(),
      document.uri.fsPath,
      options,
    )

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
      const usages = await findUsagesOfUtils(this.ext, doc, names, ctx.uno)
      locations.push(...usages)
    }

    return locations
  }
}

async function findUsagesOfUtils(
  ext: ExtensionContext,
  doc: TextDocument,
  names: string[],
  uno: UnoGenerator,
): Promise<Location[]> {
  const { configuration } = useConfigurations(ext)

  const options = configuration.strictAnnotationMatch
    ? {
        includeRegex: defaultIdeMatchInclude,
        excludeRegex: defaultIdeMatchExclude,
      }
    : undefined

  const positions = await getMatchedPositionsFromCode(
    uno,
    doc.getText(),
    doc.uri.fsPath,
    options,
  ) || []

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
