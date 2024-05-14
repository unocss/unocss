import antfu from '@antfu/eslint-config'

export default antfu(
  {
    regexp: {
      overrides: {
        'regexp/no-empty-capturing-group': 'off',
        'regexp/no-empty-group': 'off',
      },
    },
  },
  {
    ignores: [
      '**/.svelte-kit',
      '**/*.global.js',
      'bench/source/gen*.js',
      'packages/preset-icons/src/collections.json',
      'interactive/guides/vendor/*.md',
      'packages/eslint-plugin/fixtures',
      'docs/.vitepress/cache',
    ],
  },
  {
    rules: {
      'style/jsx-child-element-spacing': 'off',
      'ts/no-invalid-void-type': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: ['unocss'],
        },
      ],
    },
  },
  {
    files: [
      'playground/**/*.ts',
      'examples/**/*.ts',
      'test/fixtures/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: [
      '*.d.ts',
    ],
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
  {
    files: [
      'packages/vscode/**/*.ts',
    ],
    rules: {
      'unicorn/prefer-node-protocol': 'off',
    },
  },
  {
    files: [
      '**/*.md/*.[jt]s',
    ],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
      'no-labels': 'off',
      'ts/no-unused-vars': 'off',
      'ts/no-var-requires': 'off',
    },
  },
  {
    name: 'tests',
    files: [
      '**/*.test.ts',
    ],
    rules: {
      'antfu/indent-unindent': ['error', { tags: ['$', 'html'] }],
    },
  },
)
