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
    '^@miniwind/(.*)$': '<rootDir>/packages/$1/src/index.ts',
    '^miniwind$': '<rootDir>/packages/miniwind/src/index.ts',
  },
}
