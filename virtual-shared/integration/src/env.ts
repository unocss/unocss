/**
 * Detect the VS Code **extension host** process (and its children, e.g. the language
 * server). This must not match the integrated terminal, which may still expose
 * `VSCODE_CWD` but has `ELECTRON_*` stripped from its environment.
 *
 * @see https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/node/extensionHostProcess.ts
 * @see https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/extensions/common/extensionHostEnv.ts
 */
export function isVSCodeExtensionHostEnv(
  env: Record<string, string | undefined>,
): boolean {
  if (env.ELECTRON_RUN_AS_NODE === '1')
    return true

  if (env.VSCODE_EXTHOST_WILL_SEND_SOCKET === '1')
    return true

  if (env.VSCODE_WILL_SEND_MESSAGE_PORT === '1')
    return true

  return false
}

export function getEnvFlags() {
  // eslint-disable-next-line node/prefer-global/process
  const isNode = typeof process !== 'undefined' && process.stdout
  // eslint-disable-next-line node/prefer-global/process
  const isVSCode = isNode && isVSCodeExtensionHostEnv(process.env)
  // eslint-disable-next-line node/prefer-global/process
  const isESLint = isNode && !!process.env.ESLINT

  return {
    isNode,
    isVSCode,
    isESLint,
  }
}
