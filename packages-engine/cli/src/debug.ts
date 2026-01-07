import type { FileEntryItem, ResolvedCliOptions } from './types'
import { yellow } from 'colorette'
import consola from 'consola'
import { relative } from 'pathe'

/**
 * generate and print a debug details table
 *
 * Example:
 *
 * File Generation Details:
 * ---------------------+----------------------
 * | Output File        | Source Files (1)    |
 * ---------------------+----------------------
 * | src/styles/uno.css | src/styles/mock.css |
 * ---------------------+----------------------
 */
export function debugDetailsTable(options: ResolvedCliOptions, outFile: string, files: FileEntryItem[]) {
  const table = [['Output File', `Source Files (${files.length})`]]
  files.forEach((f, i) => {
    table.push([i === 0 ? relative(options.cwd!, outFile) : '', relative(options.cwd, f.id)])
  })

  const colWidths = table[0].map((_, colIndex) =>
    Math.max(...table.map(row => row[colIndex].length)),
  )

  const separator = colWidths.map(width => '-'.repeat(width + 3)).join('+')

  consola.log(yellow('File Generation Details:'))
  consola.log(separator)
  for (const row of table) {
    const rowStr = row
      .map((cell, index) => ` ${cell.padEnd(colWidths[index])} `)
      .join('|')
    consola.log(`|${rowStr}|`)
    consola.log(separator)
  }
}
