/* eslint-disable no-undef */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/__tests__/integration/**/*.test.ts?(x)'],
  displayName: 'integration',
};
