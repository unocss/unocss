module.exports = () => {
  throw new Error('getHumminScope() is a compile macro but get called directly, have you include this file to Hummin\'s target')
}
