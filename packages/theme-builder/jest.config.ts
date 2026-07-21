module.exports = {
  displayName: 'theme-builder',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/packages/theme-builder',
  // Count every shippable source file, not just the ones a test imports, so the
  // ratchet stays honest (mirrors packages/core/jest.config.ts).
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/index.ts'],
  coverageReporters: ['text-summary', 'json-summary', 'html', 'lcov'],
  // The generator is the correctness core — gate it (§6.4 of the design spec).
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
      functions: 90,
      branches: 90,
    },
  },
  // Resolve the sibling workspace package to its source (mirrors the
  // tsconfig.base.json path mapping) so tests don't need a prebuilt dist.
  moduleNameMapper: {
    '^@rhombuskit/tokens$': '<rootDir>/../tokens/src/index.ts',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
