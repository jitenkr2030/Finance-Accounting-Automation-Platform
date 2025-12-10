module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/**/__tests__/**/*.js',
    '<rootDir>/**/?(*.)+(spec|test).[tj]s'
  ],
  
  // Test timeout
  testTimeout: 30000,
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Coverage paths to ignore
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/uploads/',
    '/logs/',
    '/config/',
    '/middleware/auth.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module name mapping for easier imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/.next/',
    '/build/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true
};