export default () => {
  throw new Error('getNanowindScope() is a compile macro but get called directly, have you include this file to Nanowind\'s target')
}
