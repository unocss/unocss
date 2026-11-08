// Builds the page once with runtime themes and once per theme combination
// with build themes, then prints the HTML and CSS sizes of each build.
import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

const clients = ['acme', 'globex', 'initech']
const schemes = ['day', 'night']

function build(label, env) {
  const outDir = join('dist', label)
  execSync('npx vite build --logLevel error', {
    stdio: 'inherit',
    env: { ...process.env, ...env, OUT_DIR: outDir },
  })
  return measure(outDir)
}

function measure(dir) {
  const html = readFileSync(join(dir, 'index.html'))
  const css = readdirSync(join(dir, 'assets'))
    .filter(file => file.endsWith('.css'))
    .map(file => readFileSync(join(dir, 'assets', file)))
  const cssAll = Buffer.concat(css)
  return {
    html: html.length,
    htmlGzip: gzipSync(html).length,
    css: cssAll.length,
    cssGzip: gzipSync(cssAll).length,
  }
}

const rows = [['runtime themes (all)', build('runtime', { THEMES: 'runtime' })]]
for (const client of clients) {
  for (const scheme of schemes)
    rows.push([`build themes: ${client} + ${scheme}`, build(`${client}-${scheme}`, { CLIENT: client, SCHEME: scheme })])
}

const kb = n => `${(n / 1024).toFixed(2)} kB`
const pct = (n, base) => base === n ? '' : ` (${Math.round((n / base - 1) * 100)}%)`
const [, base] = rows[0]

const lines = ['', '| Build | HTML | HTML gzip | CSS | CSS gzip |', '| --- | --- | --- | --- | --- |']
for (const [label, m] of rows)
  lines.push(`| ${label} | ${kb(m.html)}${pct(m.html, base.html)} | ${kb(m.htmlGzip)}${pct(m.htmlGzip, base.htmlGzip)} | ${kb(m.css)}${pct(m.css, base.css)} | ${kb(m.cssGzip)}${pct(m.cssGzip, base.cssGzip)} |`)
process.stdout.write(`${lines.join('\n')}\n`)
