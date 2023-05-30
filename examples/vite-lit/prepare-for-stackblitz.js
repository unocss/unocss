import { readFileSync, writeFileSync } from 'node:fs'

updateDependencyLinksToLatest('./package.json')

function updateDependencyLinksToLatest(filename) {
  try {
    const contents = readFileSync(filename, 'utf-8')
    const updatedContent = contents.replace(/"link:...+"/gi, '"latest"')
    writeFileSync(filename, updatedContent)
  }
  catch (err) {
    console.error(err)
  }
}
