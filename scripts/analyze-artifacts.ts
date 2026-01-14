/**
 * Build Artifacts Analysis Script
 *
 * This script analyzes build artifacts and generates a comparison report
 * for use in GitHub Actions PR comments.
 */

import type { Stats } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { sync as gzip } from 'gzip-size'
import { glob } from 'tinyglobby'

// ============================================================================
// Type Definitions
// ============================================================================

interface FileInfo {
  path: string
  size: number
  gzipSize: number
}

interface PackageArtifacts {
  name: string
  files: FileInfo[]
  totalSize: number
  totalGzipSize: number
  fileCount: number
}

interface ArtifactsReport {
  timestamp: string
  commit: string
  packages: PackageArtifacts[]
}

interface FileChange {
  path: string
  beforeSize: number
  afterSize: number
  sizeDiff: number
  gzipDiff: number
  isNew: boolean
  isRemoved: boolean
}

interface ComparisonResult {
  packageName: string
  before: PackageArtifacts | null
  after: PackageArtifacts | null
  sizeDiff: number
  sizeDiffPercent: number
  gzipDiff: number
  gzipDiffPercent: number
  fileCountDiff: number
  newFiles: string[]
  removedFiles: string[]
  fileChanges: FileChange[]
  hasAnomaly: boolean
  anomalyReasons: string[]
}

// ============================================================================
// Constants
// ============================================================================

const ANOMALY_THRESHOLDS = {
  SIZE_INCREASE_PERCENT: 0.1, // 10%
  FILE_COUNT_INCREASE: 5,
  ABSOLUTE_SIZE_INCREASE: 50 * 1024, // 50KB
} as const

const PACKAGE_PATTERNS = [
  'packages-engine/*',
  'packages-integrations/*',
  'packages-presets/*',
] as const

const FILE_PATTERNS = ['**/*.{js,mjs,cjs,d.ts,d.mts,d.cts,css,json}'] as const

const SIZE_UNITS = {
  KB: 1024,
  MB: 1024 * 1024,
} as const

const GITHUB_REPO = 'unocss/unocss' as const

// ============================================================================
// File Analysis
// ============================================================================

async function getFileInfo(filePath: string): Promise<FileInfo> {
  const content = await fs.readFile(filePath)
  const stats: Stats = await fs.stat(filePath)

  return {
    path: filePath,
    size: stats.size,
    gzipSize: gzip(content),
  }
}

async function getPackageName(packagePath: string): Promise<string> {
  const packageJsonPath = path.join(packagePath, 'package.json')
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
    return packageJson.name || path.basename(packagePath)
  }
  catch {
    return path.basename(packagePath)
  }
}

async function analyzePackage(packagePath: string): Promise<PackageArtifacts | null> {
  const distPath = path.join(packagePath, 'dist')

  try {
    await fs.access(distPath)
  }
  catch {
    return null
  }

  const packageName = await getPackageName(packagePath)
  const files = await glob(FILE_PATTERNS, {
    cwd: distPath,
    absolute: true,
    expandDirectories: false,
  })

  if (files.length === 0) {
    return null
  }

  const fileInfos: FileInfo[] = []
  for (const file of files) {
    try {
      const info = await getFileInfo(file)
      info.path = path.relative(distPath, file)
      fileInfos.push(info)
    }
    catch {
      // Skip files that can't be read
    }
  }

  const totalSize = fileInfos.reduce((sum, f) => sum + f.size, 0)
  const totalGzipSize = fileInfos.reduce((sum, f) => sum + f.gzipSize, 0)

  return {
    name: packageName,
    files: fileInfos,
    totalSize,
    totalGzipSize,
    fileCount: fileInfos.length,
  }
}

async function analyzeAllPackages(): Promise<ArtifactsReport> {
  const packageDirs = await glob(PACKAGE_PATTERNS, {
    cwd: process.cwd(),
    onlyDirectories: true,
    expandDirectories: false,
  })

  const packages: PackageArtifacts[] = []

  for (const dir of packageDirs) {
    const fullPath = path.join(process.cwd(), dir)
    const artifacts = await analyzePackage(fullPath)
    if (artifacts) {
      packages.push(artifacts)
    }
  }

  // Sort by package name
  packages.sort((a, b) => a.name.localeCompare(b.name))

  return {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'unknown',
    packages,
  }
}

function compareReports(before: ArtifactsReport, after: ArtifactsReport): ComparisonResult[] {
  const results: ComparisonResult[] = []
  const allPackageNames = new Set<string>()

  before.packages.forEach(p => allPackageNames.add(p.name))
  after.packages.forEach(p => allPackageNames.add(p.name))

  for (const name of allPackageNames) {
    const beforePkg = before.packages.find(p => p.name === name) || null
    const afterPkg = after.packages.find(p => p.name === name) || null

    const beforeSize = beforePkg?.totalSize || 0
    const afterSize = afterPkg?.totalSize || 0
    const beforeGzip = beforePkg?.totalGzipSize || 0
    const afterGzip = afterPkg?.totalGzipSize || 0
    const beforeCount = beforePkg?.fileCount || 0
    const afterCount = afterPkg?.fileCount || 0

    const sizeDiff = afterSize - beforeSize
    const sizeDiffPercent = beforeSize > 0 ? (sizeDiff / beforeSize) * 100 : (afterSize > 0 ? 100 : 0)
    const gzipDiff = afterGzip - beforeGzip
    const gzipDiffPercent = beforeGzip > 0 ? (gzipDiff / beforeGzip) * 100 : (afterGzip > 0 ? 100 : 0)
    const fileCountDiff = afterCount - beforeCount

    const beforeFilesMap = new Map(beforePkg?.files.map(f => [f.path, f]) || [])
    const afterFilesMap = new Map(afterPkg?.files.map(f => [f.path, f]) || [])
    const allFilePaths = new Set([...beforeFilesMap.keys(), ...afterFilesMap.keys()])

    const newFiles = [...afterFilesMap.keys()].filter(f => !beforeFilesMap.has(f))
    const removedFiles = [...beforeFilesMap.keys()].filter(f => !afterFilesMap.has(f))

    // Calculate per-file changes
    const fileChanges: FileChange[] = []
    for (const filePath of allFilePaths) {
      const beforeFile = beforeFilesMap.get(filePath)
      const afterFile = afterFilesMap.get(filePath)
      fileChanges.push({
        path: filePath,
        beforeSize: beforeFile?.size || 0,
        afterSize: afterFile?.size || 0,
        sizeDiff: (afterFile?.size || 0) - (beforeFile?.size || 0),
        gzipDiff: (afterFile?.gzipSize || 0) - (beforeFile?.gzipSize || 0),
        isNew: !beforeFile,
        isRemoved: !afterFile,
      })
    }
    // Sort by absolute size diff (largest changes first)
    fileChanges.sort((a, b) => Math.abs(b.sizeDiff) - Math.abs(a.sizeDiff))

    // Check for anomalies
    const anomalyReasons = detectAnomalies({
      sizeDiff,
      sizeDiffPercent,
      fileCountDiff,
      beforePkg,
      afterPkg,
    })

    results.push({
      packageName: name,
      before: beforePkg,
      after: afterPkg,
      sizeDiff,
      sizeDiffPercent,
      gzipDiff,
      gzipDiffPercent,
      fileCountDiff,
      newFiles,
      removedFiles,
      fileChanges,
      hasAnomaly: anomalyReasons.length > 0,
      anomalyReasons,
    })
  }

  // Sort: anomalies first, then by name
  results.sort((a, b) => {
    if (a.hasAnomaly !== b.hasAnomaly) {
      return a.hasAnomaly ? -1 : 1
    }
    return a.packageName.localeCompare(b.packageName)
  })

  return results
}

// ============================================================================
// Anomaly Detection
// ============================================================================

interface AnomalyDetectionInput {
  sizeDiff: number
  sizeDiffPercent: number
  fileCountDiff: number
  beforePkg: PackageArtifacts | null
  afterPkg: PackageArtifacts | null
}

function detectAnomalies(input: AnomalyDetectionInput): string[] {
  const { sizeDiff, sizeDiffPercent, fileCountDiff, beforePkg, afterPkg } = input
  const reasons: string[] = []

  if (sizeDiffPercent > ANOMALY_THRESHOLDS.SIZE_INCREASE_PERCENT * 100 && sizeDiff > SIZE_UNITS.KB)
    reasons.push(`Size increased by ${sizeDiffPercent.toFixed(1)}%`)

  if (sizeDiff > ANOMALY_THRESHOLDS.ABSOLUTE_SIZE_INCREASE)
    reasons.push(`Size increased by ${formatBytes(sizeDiff)}`)

  if (fileCountDiff > ANOMALY_THRESHOLDS.FILE_COUNT_INCREASE)
    reasons.push(`${fileCountDiff} new files added`)

  if (!beforePkg && afterPkg)
    reasons.push('New package detected')

  if (beforePkg && !afterPkg)
    reasons.push('Package removed')

  return reasons
}

// ============================================================================
// Formatting Utilities
// ============================================================================

function formatBytes(bytes: number): string {
  const absBytes = Math.abs(bytes)
  if (absBytes < SIZE_UNITS.KB)
    return `${bytes} B`
  if (absBytes < SIZE_UNITS.MB)
    return `${(bytes / SIZE_UNITS.KB).toFixed(2)} KB`
  return `${(bytes / SIZE_UNITS.MB).toFixed(2)} MB`
}

function formatDiff(diff: number, percent: number): string {
  if (diff === 0)
    return '—'

  const sign = diff > 0 ? '+' : ''
  const emoji = diff > 0 ? '⬆️' : '⬇️'
  return `${sign}${formatBytes(diff)} (${sign}${percent.toFixed(1)}%) ${emoji}`
}

function formatPercent(percent: number): string {
  if (percent === 0)
    return '—'

  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(1)}%`
}

function getFileChangeEmoji(file: FileChange): string {
  if (file.isNew)
    return '🆕 '
  if (file.isRemoved)
    return '🗑️ '
  if (file.sizeDiff > 0)
    return '⬆️ '
  if (file.sizeDiff < 0)
    return '⬇️ '
  return ''
}

function getPackageStatusEmoji(comparison: ComparisonResult): string {
  if (comparison.hasAnomaly)
    return '🚨'
  if (comparison.sizeDiff > 0)
    return '📈'
  if (comparison.sizeDiff < 0)
    return '📉'
  return '✅'
}

function formatSizeTransition(before: number, after: number, diff: number, percent: number): string {
  if (diff === 0)
    return formatBytes(after)
  return `${formatBytes(before)} → ${formatBytes(after)} (${formatPercent(percent)})`
}

// ============================================================================
// Markdown Report Generation
// ============================================================================

function generateMarkdownReport(comparisons: ComparisonResult[], beforeCommit: string, afterCommit: string): string {
  const lines: string[] = []

  lines.push('## 📦 Build Artifacts Analysis')
  lines.push('')

  const beforeHash = beforeCommit.substring(0, 7)
  const afterHash = afterCommit.substring(0, 7)
  const beforeLink = `[\`${beforeHash}\`](https://github.com/${GITHUB_REPO}/commit/${beforeCommit})`
  const afterLink = `[\`${afterHash}\`](https://github.com/${GITHUB_REPO}/commit/${afterCommit})`
  lines.push(`Comparing ${beforeLink} → ${afterLink}`)
  lines.push('')

  // Summary section
  const anomalies = comparisons.filter(c => c.hasAnomaly)
  const totalSizeDiff = comparisons.reduce((sum, c) => sum + c.sizeDiff, 0)
  const totalGzipDiff = comparisons.reduce((sum, c) => sum + c.gzipDiff, 0)
  const totalSizeBefore = comparisons.reduce((sum, c) => sum + (c.before?.totalSize || 0), 0)
  const totalGzipBefore = comparisons.reduce((sum, c) => sum + (c.before?.totalGzipSize || 0), 0)
  const totalSizeAfter = comparisons.reduce((sum, c) => sum + (c.after?.totalSize || 0), 0)
  const totalGzipAfter = comparisons.reduce((sum, c) => sum + (c.after?.totalGzipSize || 0), 0)
  const totalSizePercent = totalSizeBefore > 0 ? (totalSizeDiff / totalSizeBefore) * 100 : 0
  const totalGzipPercent = totalGzipBefore > 0 ? (totalGzipDiff / totalGzipBefore) * 100 : 0

  const totalSizeStr = formatSizeTransition(totalSizeBefore, totalSizeAfter, totalSizeDiff, totalSizePercent)
  const totalGzipStr = formatSizeTransition(totalGzipBefore, totalGzipAfter, totalGzipDiff, totalGzipPercent)

  lines.push('### 📊 Summary')
  lines.push('')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Packages analyzed | ${comparisons.length} |`)
  lines.push(`| Total size | ${totalSizeStr} |`)
  lines.push(`| Total gzip size | ${totalGzipStr} |`)
  lines.push(`| ⚠️ Anomalies | ${anomalies.length} |`)
  lines.push('')

  // Anomaly warnings
  if (anomalies.length > 0) {
    lines.push('### ⚠️ Anomalies Detected')
    lines.push('')
    for (const anomaly of anomalies) {
      lines.push(`<details open>`)
      lines.push(`<summary><strong>🚨 ${anomaly.packageName}</strong></summary>`)
      lines.push('')
      lines.push('**Issues:**')
      for (const reason of anomaly.anomalyReasons) {
        lines.push(`- ${reason}`)
      }
      lines.push('')
      if (anomaly.newFiles.length > 0) {
        lines.push('**New files:**')
        for (const file of anomaly.newFiles.slice(0, 10)) {
          lines.push(`- \`${file}\``)
        }
        if (anomaly.newFiles.length > 10) {
          lines.push(`- ... and ${anomaly.newFiles.length - 10} more`)
        }
        lines.push('')
      }
      if (anomaly.removedFiles.length > 0) {
        lines.push('**Removed files:**')
        for (const file of anomaly.removedFiles.slice(0, 10)) {
          lines.push(`- \`${file}\``)
        }
        if (anomaly.removedFiles.length > 10) {
          lines.push(`- ... and ${anomaly.removedFiles.length - 10} more`)
        }
        lines.push('')
      }
      lines.push('</details>')
      lines.push('')
    }
  }

  // Detailed package reports
  lines.push('<details>')
  lines.push('<summary><strong>📦 Package Details</strong></summary>')
  lines.push('')

  for (const comparison of comparisons) {
    const statusEmoji = getPackageStatusEmoji(comparison)
    const openState = comparison.hasAnomaly ? ' open' : ''

    // Format: Package Name — Current Size (Percent Change)
    const currentSize = formatBytes(comparison.after?.totalSize || 0)
    const percentInfo = comparison.sizeDiffPercent !== 0 ? ` (${formatPercent(comparison.sizeDiffPercent)})` : ''

    lines.push(`<details${openState}>`)
    lines.push(`<summary>${statusEmoji} <strong>${comparison.packageName}</strong> — ${currentSize}${percentInfo}</summary>`)
    lines.push('')

    if (!comparison.before) {
      lines.push('> 🆕 **New package**')
      lines.push('')
    }
    else if (!comparison.after) {
      lines.push('> 🗑️ **Package removed**')
      lines.push('')
    }

    lines.push('| Metric | Before | After | Diff |')
    lines.push('|--------|--------|-------|------|')
    lines.push(`| Raw size | ${formatBytes(comparison.before?.totalSize || 0)} | ${formatBytes(comparison.after?.totalSize || 0)} | ${formatDiff(comparison.sizeDiff, comparison.sizeDiffPercent)} |`)
    lines.push(`| Gzip size | ${formatBytes(comparison.before?.totalGzipSize || 0)} | ${formatBytes(comparison.after?.totalGzipSize || 0)} | ${formatDiff(comparison.gzipDiff, comparison.gzipDiffPercent)} |`)
    lines.push(`| File count | ${comparison.before?.fileCount || 0} | ${comparison.after?.fileCount || 0} | ${comparison.fileCountDiff > 0 ? '+' : ''}${comparison.fileCountDiff} |`)
    lines.push('')

    // File details (collapsed by default) - sorted by size change
    if (comparison.fileChanges.length > 0) {
      lines.push('<details>')
      lines.push('<summary>📄 File breakdown (sorted by size change)</summary>')
      lines.push('')
      lines.push('| File | Before | After | Diff |')
      lines.push('|------|--------|-------|------|')

      for (const file of comparison.fileChanges.slice(0, 20)) {
        const prefix = getFileChangeEmoji(file)
        const diffStr = file.sizeDiff === 0 ? '—' : `${file.sizeDiff > 0 ? '+' : ''}${formatBytes(file.sizeDiff)}`
        lines.push(`| ${prefix}\`${file.path}\` | ${formatBytes(file.beforeSize)} | ${formatBytes(file.afterSize)} | ${diffStr} |`)
      }

      if (comparison.fileChanges.length > 20) {
        lines.push(`| ... | ${comparison.fileChanges.length - 20} more files | | |`)
      }

      lines.push('')
      lines.push('</details>')
    }

    lines.push('')
    lines.push('</details>')
    lines.push('')
  }

  lines.push('</details>')

  return lines.join('\n')
}

// ============================================================================
// CLI Commands
// ============================================================================

async function handleAnalyzeCommand(outputPath: string = 'artifacts-report.json'): Promise<void> {
  const report = await analyzeAllPackages()
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2))
  console.log(`Artifacts report saved to ${outputPath}`)
  console.log(`Analyzed ${report.packages.length} packages`)
}

async function handleCompareCommand(beforePath: string, afterPath: string, outputPath: string = 'comparison-report.md'): Promise<void> {
  const beforeReport: ArtifactsReport = JSON.parse(await fs.readFile(beforePath, 'utf8'))
  const afterReport: ArtifactsReport = JSON.parse(await fs.readFile(afterPath, 'utf8'))

  const comparisons = compareReports(beforeReport, afterReport)
  const markdown = generateMarkdownReport(comparisons, beforeReport.commit, afterReport.commit)

  await fs.writeFile(outputPath, markdown)
  console.log(`Comparison report saved to ${outputPath}`)

  // Output summary for GitHub Actions
  const anomalies = comparisons.filter(c => c.hasAnomaly)
  if (anomalies.length > 0) {
    console.log(`::warning::Found ${anomalies.length} anomalies in build artifacts`)
    for (const anomaly of anomalies)
      console.log(`::warning::${anomaly.packageName}: ${anomaly.anomalyReasons.join(', ')}`)
  }
}

function printUsage(): void {
  console.log('Build Artifacts Analysis Tool')
  console.log('')
  console.log('Usage:')
  console.log('  analyze-artifacts.ts analyze [output.json]    - Analyze current build')
  console.log('  analyze-artifacts.ts compare <before.json> <after.json> [output.md] - Compare reports')
}

async function main() {
  const [command, ...args] = process.argv.slice(2)

  if (command === 'analyze') {
    await handleAnalyzeCommand(args[0])
  }
  else if (command === 'compare') {
    const [beforePath, afterPath, outputPath] = args
    if (!beforePath || !afterPath) {
      console.error('Usage: analyze-artifacts.ts compare <before.json> <after.json> [output.md]')
      process.exit(1)
    }
    await handleCompareCommand(beforePath, afterPath, outputPath)
  }
  else {
    printUsage()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
