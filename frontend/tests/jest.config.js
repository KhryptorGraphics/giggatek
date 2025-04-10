/**
 * Jest configuration for GigGatek frontend tests
 */

module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: '../',
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  // matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // An array of regexp pattern strings that are matched against all source file paths
  // matched files will have their coverage information collected
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/vendor/**/*.js'
  ],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'tests/coverage',
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Setup files to run before each test
  setupFiles: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Mock files for testing
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js'
  }
};
