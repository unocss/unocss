import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import readYamlFile from 'read-yaml-file'
import { isCI } from 'std-env'
import { glob } from 'tinyglobby'

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function replaceCatalogEntries(
  pnpmCatalog: Record<string, string>,
  packageJsonPath: string,
) {
  const packageJsonObj = JSON.parse(await readFile(packageJsonPath, 'utf8'))

  for (const depObjKey of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const depObj = packageJsonObj[depObjKey]
    if (!depObj)
      continue
    for (const depName of Object.keys(depObj)) {
      if (depObj[depName] === 'catalog:') {
        const catalogVersion = pnpmCatalog[depName]
        if (!catalogVersion)
          throw new Error(`Missing pnpm catalog version for ${depName}`)
        depObj[depName] = catalogVersion
      }
      else if (depObj[depName].startsWith('catalog:')) {
        throw new Error('multiple named catalogs not supported')
      }
    }
  }

  // prevent apply changes to package.json if not running in CI
  if (isCI) {
    await writeFile(packageJsonPath, JSON.stringify(packageJsonObj, null, 2))
  }

  return [packageJsonPath, {
    dependencies: packageJsonObj.dependencies,
    devDependencies: packageJsonObj.devDependencies,
    peerDependencies: packageJsonObj.peerDependencies,
  }] as const
}

async function patchCatalogEntries() {
  const [catalog, packageJsonPaths] = await Promise.all([
    readYamlFile(
      resolve(cwd, 'pnpm-workspace.yaml'),
    ).then((yaml: any) => yaml.catalog as Record<string, string>),
    glob('packages-*/*/package.json', { cwd, expandDirectories: false, absolute: true }),
  ])
  const result = await Promise.all(
    packageJsonPaths.map(packageJsonPath =>
      replaceCatalogEntries(catalog, resolve(cwd, packageJsonPath)),
    ),
  )
  if (!isCI) {
    for (const [pkg, entries] of result) {
      console.log(pkg)
      console.log(entries)
    }
  }
}

patchCatalogEntries()
