const { default: nxPreset } = require('@nx/jest/preset');

module.exports = {
  ...nxPreset,
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'kessel-sdk',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ]
};
