import type { ThemeAAFailure } from './validate';

/** Thrown when a generated theme cannot be made AA-clean — the generator never returns sub-AA. */
export class ThemeAAError extends Error {
  constructor(
    readonly mode: 'light' | 'dark',
    readonly failures: ThemeAAFailure[],
  ) {
    super(
      `Generated ${mode} theme failed WCAG AA on ${failures.length} pair(s): ` +
        failures
          .map((f) => `${f.fg} on ${f.bg} = ${f.ratio.toFixed(2)}:1 (needs ${f.min}:1)`)
          .join('; '),
    );
    this.name = 'ThemeAAError';
  }
}
