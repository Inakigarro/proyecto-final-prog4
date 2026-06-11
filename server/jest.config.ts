import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/seeders/**',
    '!src/__tests__/**',
    '!src/index.ts',
  ],
  // 30 s es suficiente para unit tests; los de integración sobreescriben con jest.setTimeout()
  testTimeout: 30000,
};

export default config;
