module.exports = () => {
  throw new Error('getUnocssScope() is a compile macro but get called directly, have you include this file to Unocss\'s target')
}
