import { relative } from 'path'
import { DecorationOptions, DecorationRangeBehavior, MarkdownString, Range, StatusBarAlignment, window, workspace } from 'vscode'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'
import { getMatchedPositions } from '../../inspector/client/composables/pos'
import { createContext, INCLUDE_COMMENT_IDE } from '../../plugins-common'

export async function activate() {
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath
  if (!cwd)
    return

  const log = window.createOutputChannel('UnoCSS')

  const context = createContext(cwd, {}, [
    sourcePluginFactory({
      files: [
        'vite.config',
        'svelte.config',
        'astro.config',
      ],
      targetModule: 'unocss/vite',
    }),
    sourceObjectFields({
      files: 'nuxt.config',
      fields: 'unocss',
    }),
  ])

  const { sources } = await context.ready

  if (!sources.length) {
    log.appendLine('No config files found, disabled')
    return
  }

  log.appendLine(`Configuration loaded from\n${sources.map(s => ` - ${relative(cwd, s)}`).join('\n')}`)

  const { uno, filter } = context
  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  workspace.onDidSaveTextDocument(async(doc) => {
    if (sources.includes(doc.uri.fsPath)) {
      try {
        await context.reloadConfig()
        log.appendLine(`Config reloaded by ${relative(cwd, doc.uri.fsPath)}`)
      }
      catch (e) {
        log.appendLine('Error on loading config')
        log.appendLine(String(e))
      }
    }
  })

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  async function updateAnnotation(editor = window.activeTextEditor) {
    const doc = editor?.document
    if (!doc)
      return reset()

    const code = doc.getText()
    const id = doc.uri.fsPath

    if (!code || (!code.includes(INCLUDE_COMMENT_IDE) && !filter(code, id)))
      return reset()

    const result = await uno.generate(code, { id, preflights: false, minify: true })

    const ranges: DecorationOptions[] = await Promise.all(
      getMatchedPositions(code, Array.from(result.matched))
        .map(async(i): Promise<DecorationOptions> => {
          const css = (await uno.generate(new Set([i[2]]), { preflights: false })).css
          return {
            range: new Range(doc.positionAt(i[0]), doc.positionAt(i[1])),
            get hoverMessage() {
              const prettified = prettier.format(css, {
                parser: 'css',
                plugins: [parserCSS],
              })
              return new MarkdownString(`\`\`\`css\n${prettified}\n\`\`\``)
            },
          }
        }),
    )

    editor.setDecorations(UnderlineDecoration, ranges)
    status.text = `UnoCSS: ${result.matched.size}`
    status.tooltip = new MarkdownString(`${result.matched.size} utilities used in this file`)
    status.show()

    function reset() {
      editor?.setDecorations(UnderlineDecoration, [])
      status.hide()
    }
  }

  const throttledUpdateAnnotation = throttle(updateAnnotation, 200)

  window.onDidChangeActiveTextEditor(updateAnnotation)
  workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      throttledUpdateAnnotation()
  })
  updateAnnotation()
}

export function deactivate() {}

function throttle<T extends((...args: any) => any)>(func: T, timeFrame: number) {
  let lastTime = 0
  let timer: any
  return function() {
    const now = Date.now()
    clearTimeout(timer)
    if (now - lastTime >= timeFrame) {
      func()
      lastTime = now
    }
    else {
      timer = setTimeout(func, timeFrame)
    }
  }
}
