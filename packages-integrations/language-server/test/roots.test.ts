import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveWorkspaceRoots } from '../src/utils/roots'

describe('resolveWorkspaceRoots', () => {
  it('defaults to all workspace folders when no root is configured', () => {
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
    const root = resolveWorkspaceRoots(undefined, {
      workspaceRootPath: '/home/user/project',
    })

    expect(root).toEqual([path.normalize('/home/user/project')])
  })

  it('keeps absolute configured roots as-is', () => {
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
    const root = resolveWorkspaceRoots('C:/workspace/packages/app', {
      workspaceRootPath: '/home/runner/workspace',
      workspaceFolderPaths: ['/home/runner/workspace/app'],
    })

    expect(root).toEqual([path.normalize('C:/workspace/packages/app')])
  })

  it('matches a configured name to a known workspace folder by path suffix', () => {
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
    const root = resolveWorkspaceRoots('packages/app', {
      workspaceRootPath: '/tmp/mono',
      workspaceFolderPaths: ['/tmp/mono'],
    })

    expect(root).toEqual([path.normalize('/tmp/mono/packages/app')])
  })
})
