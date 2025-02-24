import fs from 'node:fs'

updateDependencyLinksToLatest('./package.json')

function updateDependencyLinksToLatest(filename) {
  try {
    const contents = fs.readFileSync(filename, 'utf-8')
    const updatedContent = contents.replace(/"link:.{3,}"/gi, '"latest"')
    fs.writeFileSync(filename, updatedContent)
  }
  catch (err) {
    console.error(err)
  }
}
