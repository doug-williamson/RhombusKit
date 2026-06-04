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
  // Ratchet: floor sits just under the current measured coverage so it blocks
  // regressions. Raise these as later phases backfill tests; target 80%+ lines.
  // 0.7.x baseline was 66% lines; Phase 1 form-field specs lifted it to ~82%.
  // Phase 3 backfilled the older untested components (button/card/badge/chip/
  // icon/form-field/input/textarea/select), measured ~98% lines / 89% branches.
  coverageThreshold: {
    global: {
      lines: 95,
      statements: 95,
      functions: 90,
      branches: 88,
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
