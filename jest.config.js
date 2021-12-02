module.exports = {
  roots: [
    '<rootDir>/test',
  ],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@unocss/([^/]*)$': '<rootDir>/packages/$1/src/index.ts',
    '^@unocss/([^/]*?)/(.*?)$': '<rootDir>/packages/$1/src/$2.ts',
    '^@unocss/([^/]*?)/dist/(.*?)$': '<rootDir>/packages/$1/dist/$2.cjs',
    '^unocss$': '<rootDir>/packages/unocss/src/index.ts',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/bench/',
    '/playground/',
    '/vite',
    '/packages/core/src/utils/map.ts',
    '/packages/core/src/utils/layer.ts',
    '/packages/cli',
    '/packages/inspector',
    '/packages/nuxt',
    '/packages/extractor',
  ],
}
