declare module 'eslint' {
  interface SharedConfigurationSettings {
    unocss?: {
      configPath?: string
    }
  }
}

declare module '@typescript-eslint/utils/ts-eslint' {
  interface SharedConfigurationSettings {
    unocss?: {
      configPath?: string
    }
  }
}

export {}
