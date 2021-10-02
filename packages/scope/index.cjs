module.exports = () => {
  throw new Error('getMiniwindScope() is a compile macro but get called directly, have you include this file to Miniwind\'s target')
}
