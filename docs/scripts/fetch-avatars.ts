import { fileURLToPath } from 'node:url'
import { join, resolve } from 'pathe'
import fs from 'fs-extra'
import { $fetch } from 'ofetch'

const docsDir = resolve(fileURLToPath(import.meta.url), '../..').replace(/\//g, '/')
const pathContributors = resolve(docsDir, '.vitepress/contributor-names.json').replace(/\//g, '/')
const dirAvatars = resolve(docsDir, 'public/user-avatars/').replace(/\//g, '/')

let contributors: string[] = []

async function download(url: string, fileName: string) {
  if (fs.existsSync(fileName))
    return
  // eslint-disable-next-line no-console
  console.log('downloading', fileName)
  try {
    const image = await $fetch(url, { responseType: 'arrayBuffer' })
    await fs.writeFile(fileName, Buffer.from(image))
  }
  catch {}
}

async function fetchAvatars() {
  await fs.ensureDir(dirAvatars)
  contributors = JSON.parse(await fs.readFile(pathContributors, { encoding: 'utf-8' }))

  await Promise.all(contributors.map(name => download(`https://github.com/${name}.png?size=100`, join(dirAvatars, `${name}.png`))))
}

fetchAvatars()
