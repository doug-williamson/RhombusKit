import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RHOMBUS_DENSITY } from './rhombus-density.tokens';
import { DENSITY_ATTRIBUTE, RhombusDensityService } from './rhombus-density.service';

/**
 * Service-level behaviour. Unlike the providers spec — which must never name
 * this class — these tests inject it directly, because what they exercise is
 * the service's own contract: the seed value, the synchronous first write, and
 * the runtime signal→attribute path.
 */
describe('RhombusDensityService', () => {
  const html = () => document.documentElement;

  beforeEach(() => {
    html().removeAttribute(DENSITY_ATTRIBUTE);
    TestBed.resetTestingModule();
  });

  afterAll(() => html().removeAttribute(DENSITY_ATTRIBUTE));

  it("defaults to 'default' when nothing is configured", () => {
    const service = TestBed.inject(RhombusDensityService);
    expect(service.density()).toBe('default');
    expect(html().getAttribute(DENSITY_ATTRIBUTE)).toBe('default');
  });

  it('seeds from RHOMBUS_DENSITY', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: RHOMBUS_DENSITY, useValue: 'comfortable' }],
    });
    expect(TestBed.inject(RhombusDensityService).density()).toBe('comfortable');
  });

  it('writes the attribute synchronously on construction, before any effect flush', () => {
    // The constructor applies eagerly and the effect carries only later changes.
    // Effects flush on a scheduler whose ordering relative to SSR serialisation
    // is not contractual, so a prerendered document must not depend on one.
    TestBed.configureTestingModule({
      providers: [{ provide: RHOMBUS_DENSITY, useValue: 'compact' }],
    });
    TestBed.inject(RhombusDensityService);
    // No detectChanges()/flushEffects() between construction and this assertion.
    expect(html().getAttribute(DENSITY_ATTRIBUTE)).toBe('compact');
  });

  it('re-writes the attribute when the signal changes at runtime', () => {
    const service = TestBed.inject(RhombusDensityService);
    service.density.set('compact');
    TestBed.flushEffects();
    expect(html().getAttribute(DENSITY_ATTRIBUTE)).toBe('compact');

    service.density.set('comfortable');
    TestBed.flushEffects();
    expect(html().getAttribute(DENSITY_ATTRIBUTE)).toBe('comfortable');
  });

  it('writes through the injected DOCUMENT, not the document global', () => {
    // The service must carry no isPlatformBrowser guard: density is a bootstrap
    // constant known at prerender, so writing it through the injected document
    // bakes the level into the emitted HTML. Guarding would trade a correct
    // prerender for a hydration-time layout shift.
    //
    // Proven by swapping DOCUMENT for a stand-in: if the service reached for the
    // global instead, the real <html> would be mutated and the stand-in
    // untouched.
    const fake = document.implementation.createHTMLDocument('stand-in');
    TestBed.configureTestingModule({
      providers: [
        { provide: RHOMBUS_DENSITY, useValue: 'compact' },
        { provide: DOCUMENT, useValue: fake },
      ],
    });
    TestBed.inject(RhombusDensityService);

    expect(fake.documentElement.getAttribute(DENSITY_ATTRIBUTE)).toBe('compact');
    expect(html().hasAttribute(DENSITY_ATTRIBUTE)).toBe(false);
  });
});
