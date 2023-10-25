import type { Connection } from 'vscode-languageserver'
import type { LanguageServiceLogger } from './types'

export const log: LanguageServiceLogger = {
  // eslint-disable-next-line no-console
  appendLine: console.log,
}

export function createLogger(connection: Connection): LanguageServiceLogger {
  return {
    appendLine: connection.console.log.bind(connection.console),
  }
}
