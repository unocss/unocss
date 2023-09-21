import plugin from '@unocss/eslint-plugin'

export default [
  {
    plugins: {
      unocss: plugin,
    },
    rules: plugin.configs.recommended.rules,
  },
]
