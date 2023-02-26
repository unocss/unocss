import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pkgJson = path.join(__dirname, '../package.json')
const pkg = fs.readJsonSync(pkgJson)
pkg.packageManager = `pnpm@${pkg.devDependencies.pnpm}`
fs.writeJsonSync(pkgJson, pkg, { spaces: 2 })
