import type { ExtensionContext } from 'vscode'
import { workspace } from 'vscode'
import { createLanguageClient, stopClient } from './client'
import { registerCommands } from './commands'
import { getConfig } from './configs'
import { version } from './generated/meta'
import { log } from './log'
import { registerDecorations } from './ui/decorations'
import { createStatusBar } from './ui/statusBar'

export async function activate(ext: ExtensionContext) {
  log.appendLine(`⚪️ UnoCSS for VS Code v${version}`)

  const projectPath = workspace.workspaceFolders?.[0].uri.fsPath
  if (!projectPath) {
    log.appendLine('➖ No active workspace found, UnoCSS is disabled')
    return
  }

  const config = getConfig()
  if (config.disable) {
    log.appendLine('➖ Disabled by configuration')
    return
  }

  try {
    const client = await createLanguageClient(ext)
    log.appendLine('🔌 Connecting to Language Server...')
    await client.start()

    // Register VSCode-specific features
    const decorations = registerDecorations(ext, client)
    registerCommands(ext, client, decorations)
    createStatusBar(ext, client)
  }
  catch (e: any) {
    log.appendLine('❌ Failed to start Language Server')
    log.appendLine(String(e.stack ?? e))
  }
}

export async function deactivate() {
  await stopClient()
}
