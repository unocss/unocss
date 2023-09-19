export const isNode = typeof process < 'u' && typeof process.stdout < 'u' && !process.versions.deno
export const isVSCode = isNode && !!process.env.VSCODE_CWD
