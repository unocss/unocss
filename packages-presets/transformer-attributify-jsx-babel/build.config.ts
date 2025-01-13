import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'magic-string',
    '@babel/core',
    '@babel/preset-typescript',
    '@babel/plugin-syntax-jsx',
  ],
})
