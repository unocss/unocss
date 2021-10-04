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
}
