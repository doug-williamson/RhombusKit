module.exports = {
  displayName: 'core',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/packages/core',
  // Count EVERY shippable source file, not just the ones a test happens to
  // import — otherwise untested components are silently absent and coverage
  // reads far higher than it is. This makes the ratchet honest.
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/lib/**/*.spec.ts',
    '!src/lib/**/*.spec-helpers.ts',
    '!src/lib/**/index.ts',
  ],
  coverageReporters: ['text-summary', 'json-summary', 'html', 'lcov'],
  // Ratchet: floor sits just under the current measured baseline so it blocks
  // regressions today. Raise these toward 80% lines as Phase 3 backfills tests.
  // Baseline at 0.7.x: lines 66.2 / stmts 66.1 / fns 69.6 / branches 87.7.
  coverageThreshold: {
    global: {
      lines: 64,
      statements: 64,
      functions: 66,
      branches: 84,
    },
  },
  // Resolve the sibling workspace package to its source (mirrors the
  // tsconfig.base.json path mapping) so tests don't need a prebuilt dist.
  moduleNameMapper: {
    '^@rhombuskit/theme-engine$': '<rootDir>/../theme-engine/src/index.ts',
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
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
