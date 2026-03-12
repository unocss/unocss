import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveWorkspaceRoots } from '../src/utils/roots'

describe('resolveWorkspaceRoots', () => {
  it('defaults to all workspace folders when no root is configured', () => {
    // Multi-root workspace, no unocss.root set → scan every folder
    //
    // t:/projects/
    // ├── proj-a/   ← workspace folder 1 (returned)
    // └── proj-b/   ← workspace folder 2 (returned)

    const root = resolveWorkspaceRoots(undefined, {
      workspaceRootPath: 't:/projects/proj-a',
      workspaceFolderPaths: [
        't:/projects/proj-a',
        't:/projects/proj-b',
      ],
    })

    expect(root).toEqual([
      path.normalize('t:/projects/proj-a'),
      path.normalize('t:/projects/proj-b'),
    ])
  })

  it('defaults to all workspace folders when root is an empty array', () => {
    // unocss.root = [] is treated the same as unconfigured
    //
    // t:/projects/
    // ├── proj-a/   ← workspace folder 1 (returned)
    // └── proj-b/   ← workspace folder 2 (returned)

    const root = resolveWorkspaceRoots([], {
      workspaceRootPath: 't:/projects/proj-a',
      workspaceFolderPaths: [
        't:/projects/proj-a',
        't:/projects/proj-b',
      ],
    })

    expect(root).toEqual([
      path.normalize('t:/projects/proj-a'),
      path.normalize('t:/projects/proj-b'),
    ])
  })

  it('falls back to workspaceRootPath when no folder paths and no root configured', () => {
    // Single-folder window (no .code-workspace file), no unocss.root
    //
    // /home/user/project/   ← the only root (returned)

    const root = resolveWorkspaceRoots(undefined, {
      workspaceRootPath: '/home/user/project',
    })

    expect(root).toEqual([path.normalize('/home/user/project')])
  })

  it('keeps absolute configured roots as-is', () => {
    // unocss.root points to a subpackage via its full absolute path
    //
    // d:/mono/
    // ├── packages/
    // │   ├── app/    ← unocss.root = "d:/mono/packages/app" (returned)
    // │   └── docs/   ← workspace folder, not targeted
    // └── (workspace root)

    const root = resolveWorkspaceRoots('d:/mono/packages/app', {
      workspaceRootPath: 'd:/mono',
      workspaceFolderPaths: [
        'd:/mono',
        'd:/mono/packages/docs',
      ],
    })

    expect(root).toEqual([path.normalize('d:/mono/packages/app')])
  })

  it('keeps windows absolute roots as-is on non-windows runtimes', () => {
    // Team shares settings with a Windows-style absolute path; server runs on POSIX
    //
    // C:/workspace/packages/app/   ← unocss.root (Windows path, returned as-is)
    // /home/runner/workspace/
    // └── app/                     ← workspace folder on POSIX host

    const root = resolveWorkspaceRoots('C:/workspace/packages/app', {
      workspaceRootPath: '/home/runner/workspace',
      workspaceFolderPaths: ['/home/runner/workspace/app'],
    })

    expect(root).toEqual([path.normalize('C:/workspace/packages/app')])
  })

  it('matches a configured name to a known workspace folder by path suffix', () => {
    // unocss.root is just the folder name; matched against workspace folder paths
    //
    // d:/mono/               ← workspaceFileDir (.code-workspace lives here)
    // ├── app/               ← workspace folder 1, not targeted
    // └── docs/              ← workspace folder 2, matched by suffix "docs" (returned)

    const root = resolveWorkspaceRoots('docs', {
      workspaceRootPath: 'd:/mono/app',
      workspaceFileDir: 'd:/mono',
      workspaceFolderPaths: [
        'd:/mono/app',
        'd:/mono/docs',
      ],
    })

    expect(root).toEqual([path.normalize('d:/mono/docs')])
  })

  it('matches multiple configured names to known workspace folders', () => {
    // unocss.root lists folder names; each is matched against workspace folder paths
    //
    // t:/projects/           ← workspaceFileDir (.code-workspace lives here)
    // ├── proj-a/            ← workspace folder, matched by "proj-a" (returned)
    // └── proj-b/            ← workspace folder, matched by "proj-b" (returned)

    const root = resolveWorkspaceRoots(
      ['proj-a', 'proj-b'],
      {
        workspaceRootPath: 't:/projects/proj-a',
        workspaceFileDir: 't:/projects',
        workspaceFolderPaths: [
          't:/projects/proj-a',
          't:/projects/proj-b',
        ],
      },
    )

    expect(root).toEqual([
      path.normalize('t:/projects/proj-a'),
      path.normalize('t:/projects/proj-b'),
    ])
  })

  it('falls back to first resolved candidate when relative root does not exist on disk', () => {
    // Monorepo with a subpackage path that hasn't been created yet (or is just a typo)
    //
    // /tmp/mono/             ← workspace root
    // └── packages/
    //     └── app/           ← unocss.root = "packages/app", no name match found,
    //                           path doesn't exist → resolved candidate returned as-is

    const root = resolveWorkspaceRoots('packages/app', {
      workspaceRootPath: '/tmp/mono',
      workspaceFolderPaths: ['/tmp/mono'],
    })

    expect(root).toEqual([path.normalize('/tmp/mono/packages/app')])
  })
})
