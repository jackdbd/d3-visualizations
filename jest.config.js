const config = {
  collectCoverage: true,
  collectCoverageFrom: ['src/js/*.{js,ts}'],
  coverageDirectory: "./coverage/",
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
  modulePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/src/setupJest.js'],
  testEnvironment: 'jsdom',
  testRegex: 'src/__tests__/.*\\.(js|ts)$',
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
