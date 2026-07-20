import { Component, EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRhombusDensity } from './rhombus-density.providers';

/**
 * THE PROVIDER-WIRING GATE.
 *
 * This file must NEVER IMPORT OR INJECT `RhombusDensityService` — no import, no
 * `TestBed.inject()`, no type annotation. (Prose mentions like this one are
 * fine and unavoidable; the enforceable check is that the file's import list
 * does not reference it, not a bare grep for the identifier.) The reason is
 * specific:
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

  describe('dev-mode diagnostics', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => warn.mockRestore());

    it('does not warn for a correct bootstrap registration', () => {
      bootstrap([provideRhombusDensity('compact')]);
      expect(warn).not.toHaveBeenCalled();
    });

    it('warns when the level cannot reach the root service', () => {
      // The real child-injector case, not a simulation of it. Registering the
      // provider in a CHILD environment injector (a route's providers, or any
      // lazily-created one) splits the two lookups: RHOMBUS_DENSITY resolves to
      // the child's 'compact', while the service is providedIn:'root' and so is
      // built from the ROOT injector, seeded 'default'. The level is silently
      // ignored — which is exactly what the mismatch detects.
      //
      // Note this cannot be reproduced by stacking both providers in one array:
      // they would resolve from the same injector and always agree.
      bootstrap();
      createEnvironmentInjector(
        [provideRhombusDensity('compact')],
        TestBed.inject(EnvironmentInjector)
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('registered in a child')
      );
      // And the child's level is genuinely ignored: resolving the service from
      // the child builds the ROOT one, seeded from the root token, so <html>
      // carries 'default' — never the 'compact' that was asked for. That is the
      // silent no-op the warning exists to surface.
      expect(html().getAttribute('data-density')).toBe('default');
    });

    it('warns when a Material density scale is active alongside ours', () => {
      // --mat-checkbox-state-layer-size is emitted by mat.theme((density: N))
      // only when N !== 0, and RhombusKit declares it nowhere, so a non-empty
      // value at the document root is proof of a competing scale.
      html().style.setProperty('--mat-checkbox-state-layer-size', '40px');
      try {
        bootstrap([provideRhombusDensity('compact')]);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('Material density scale')
        );
      } finally {
        html().style.removeProperty('--mat-checkbox-state-layer-size');
      }
    });
  });
});
