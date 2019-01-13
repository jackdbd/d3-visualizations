const config = {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css)$': 'identity-obj-proxy',
  },
  modulePathIgnorePatterns: ['/build/', '/node_modules/'],
  setupTestFrameworkScriptFile: '<rootDir>/setupJest.js',
  testEnvironment: 'jsdom',
  testRegex: '/__tests__/.*\\.(js|ts)$',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|ts|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|ts)$',
    '^.+\\.module\\.(css)$',
  ],
};

module.exports = config;
