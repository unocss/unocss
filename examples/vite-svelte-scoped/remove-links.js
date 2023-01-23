import { promises as fsPromises } from 'fs'

async function replaceInFile(filename, replacement) {
  try {
    const contents = await fsPromises.readFile(filename, 'utf-8')
    const replaced = contents.replace(/"link:...+"/gi, replacement)
    await fsPromises.writeFile(filename, replaced)
  }
  catch (err) {
    console.error(err)
  }
}

replaceInFile('./package.json', '"latest"')
