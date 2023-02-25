import { readFileSync, writeFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
pkg.packageManager = `pnpm@${pkg.devDependencies.pnpm}`
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
