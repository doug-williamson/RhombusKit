import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRhombusDensity } from './rhombus-density.providers';

/**
 * THE PROVIDER-WIRING GATE.
 *
 * This file must NEVER name `RhombusDensityService`. Not in an import, not in a
 * `TestBed.inject()`, not in a type annotation. A grep for it in the PR
 * checklist enforces that, and the reason is specific:
 *
 * An earlier revision shipped `provideRhombusDensity()` as nothing but a token
 * provider, with the service `providedIn: 'root'`. Angular builds root services
 * LAZILY, so nothing ever constructed it, the attribute was never written, and
 * every density level was a silent no-op. The whole test plan passed anyway —
 * because every test injected the service by hand first, which constructed it
 * and made the feature appear to work.
 *
 * So these tests drive only the PUBLIC path: register the provider, render a
 * component, assert the DOM. If the eager initializer is ever removed, they go
 * red. If someone "fixes" a failure here by adding an explicit inject of the
 * service, the gate is blind again and the bug can ship a second time.
 */
@Component({ standalone: true, template: '' })
class HostComponent {}

describe('provideRhombusDensity', () => {
  const html = () => document.documentElement;

  beforeEach(() => {
    // jsdom shares one document across the file, and the service writes
    // unconditionally (no removeAttribute path). Without this reset the
    // "no provider" case would pass or fail depending on test order.
    html().removeAttribute('data-density');
    TestBed.resetTestingModule();
  });

  afterAll(() => html().removeAttribute('data-density'));

  /** Bootstrap through the public surface only — never inject the service. */
  function bootstrap(providers: unknown[] = []) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: providers as never[],
    });
    TestBed.createComponent(HostComponent).detectChanges();
  }

  it('writes the level onto <html> without anything injecting the service', () => {
    bootstrap([provideRhombusDensity('compact')]);
    expect(html().getAttribute('data-density')).toBe('compact');
  });

  it.each(['compact', 'default', 'comfortable'] as const)(
    'applies the %s level',
    (level) => {
      bootstrap([provideRhombusDensity(level)]);
      expect(html().getAttribute('data-density')).toBe(level);
    }
  );

  it('writes nothing when the provider is absent', () => {
    // The non-breaking guarantee at its narrowest: an app that never calls
    // provideRhombusDensity must leave <html> untouched, so no [data-density]
    // block matches and the generated :root values apply unchanged.
    bootstrap();
    expect(html().hasAttribute('data-density')).toBe(false);
  });

  it("writes 'default' explicitly rather than omitting the attribute", () => {
    // Deliberate: 'default' is a real, assertable state. The showcase relies on
    // it, and the e2e geometry gate accepts both null and 'default' precisely
    // because this is unconditional.
    bootstrap([provideRhombusDensity('default')]);
    expect(html().getAttribute('data-density')).toBe('default');
  });
});
