// @ts-nocheck
const { default: freshConfig } = await import(Deno.args[0])
const unoConfig = freshConfig.plugins.filter(it => it.name === 'unocss')
console.log(JSON.stringify(unoConfig))
