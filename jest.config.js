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
    '^@hummin/(.*)$': '<rootDir>/packages/$1/src/index.ts',
    '^hummin$': '<rootDir>/packages/hummin/src/index.ts',
  },
}
