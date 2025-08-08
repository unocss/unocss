export function getEnvFlags() {
  // eslint-disable-next-line node/prefer-global/process
  const isNode = typeof process !== 'undefined' && process.stdout
  // eslint-disable-next-line node/prefer-global/process
  const isVSCode = isNode && !!process.env.VSCODE_CWD
  // eslint-disable-next-line node/prefer-global/process
  const isESLint = isNode && !!process.env.ESLINT

  return {
    isNode,
    isVSCode,
    isESLint,
  }
}
