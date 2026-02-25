/* eslint-disable no-undef */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testPathIgnorePatterns: ['integration'],
  displayName: 'unit',
};
