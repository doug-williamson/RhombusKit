import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { toHaveNoViolations } from 'jest-axe';

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// Make `expect(await axe(el)).toHaveNoViolations()` available to every spec.
// Use the component-scoped `axe` from ./testing/axe so page-level rules don't
// flag isolated component fixtures.
expect.extend(toHaveNoViolations);
