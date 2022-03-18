export const isNode = typeof process < 'u' && typeof process.stdout < 'u'
export const isVSCode = isNode && !!process.env.VSCODE_CWD
