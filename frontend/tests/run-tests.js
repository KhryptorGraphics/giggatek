/**
 * GigGatek Test Runner
 * Runs the tests for the GigGatek frontend
 */

const jest = require('jest');

// Set up Jest configuration
const jestConfig = {
    verbose: true,
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js'
    },
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/vendor/**/*.js'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

// Run Jest with the configuration
jest.run(['--config', JSON.stringify(jestConfig)]);
