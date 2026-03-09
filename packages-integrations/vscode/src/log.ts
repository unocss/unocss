import type { LogOutputChannel } from 'vscode'
import { window } from 'vscode'

class Logger {
  readonly channel: LogOutputChannel

  constructor() {
    this.channel = window.createOutputChannel('UnoCSS', { log: true })
  }

  info(message: string): void {
    this.channel.info(message)
  }

  warn(message: string): void {
    this.channel.warn(message)
  }

  error(message: string | Error, ...args: unknown[]): void {
    this.channel.error(message, ...args)
  }
}

export const log = new Logger()
