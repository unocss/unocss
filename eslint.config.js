import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    vue: true,
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
      '**/fixtures/**',
      'bench/source/gen*.js',
      'docs/.vitepress/cache',
      'interactive/guides/vendor/*.md',
      'test/cases/preset-attributify/**',
      'packages-presets/reset/**/*.css',
      'packages-presets/preset-icons/src/collections.json',
      'packages-integrations/eslint-plugin/fixtures',
      'packages-integrations/vscode/src/generated',

      // Nested CSS
      'interactive/markdown.css',
      'playground/src/main.css',
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
      'playground/**/*.?([mc])ts',
      'examples/**/*.?([mc])ts',
      'test/fixtures/**/*.?([mc])ts',
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
      'packages-integrations/vscode/**/*.ts',
    ],
    rules: {
      'unicorn/prefer-node-protocol': 'off',
    },
  },
  {
    files: [
      '**/*.md/*.[jt]s',
      'virtual-shared/docs/src/default-config.ts',
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
