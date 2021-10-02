import { join } from 'path'
import fs from 'fs-extra'
import { targets, dir } from './meta.mjs'

for (const target of targets.slice(1)) {
  await fs.remove(join(dir, 'fixtures', target, 'src'))
  await fs.copy(join(dir, 'fixtures/none/src'), join(dir, 'fixtures', target, 'src'))
}
