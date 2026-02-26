/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    // strict: false mirrors the project tsconfig.json setting so tests
    // compile under the same rules as the main source.
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: false } }],
  },
};
