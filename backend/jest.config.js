module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/database.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testTimeout: 30000,
  verbose: true,
};
