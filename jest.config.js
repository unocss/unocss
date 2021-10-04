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
    '^@unocss/(.*)$': '<rootDir>/packages/$1/src/index.ts',
    '^unocss$': '<rootDir>/packages/unocss/src/index.ts',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/bench/',
    '/playground/',
    '/vite',
    'core/src/utils/playground.ts',
    'core/src/utils/object.ts',
    'core/src/utils/map.ts',
  ],
}
