import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { RhombusIconRegistry } from './rhombus-icon-registry';
import { provideRhombusIcons } from './rhombus-icon.providers';

const BUILT_INS = [
  'more_vert',
  'light_mode',
  'dark_mode',
  'contrast',
  'trending_up',
  'trending_down',
  'trending_flat',
  // Stepper step-state indicators (number state renders text, not a glyph).
  'edit',
  'done',
  'error',
  // Reorder list functional affordances.
  'drag_indicator',
  'arrow_upward',
  'arrow_downward',
  // Disclosure chevron (accordion-panel, nav-list), nav-list lock marker and
  // palette-picker's default trigger — every name a kit template renders.
  'chevron_right',
  'lock',
  'palette',
];

describe('RhombusIconRegistry', () => {
  let registry: RhombusIconRegistry;
  let sanitizer: DomSanitizer;

  /** Resolve the registered SVG back to its trusted string for assertions. */
  function html(name: string): string | null {
    const safe = registry.get(name);
    return safe ? sanitizer.sanitize(SecurityContext.HTML, safe) : null;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(RhombusIconRegistry);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('pre-seeds the built-in default glyphs as currentColor SVG', () => {
    for (const name of BUILT_INS) {
      expect(registry.has(name)).toBe(true);
      const svg = html(name);
      expect(svg).toContain('<svg');
      expect(svg).toContain('fill="currentColor"');
      expect(svg).toContain('<path');
    }
  });

  it('registers a single icon by name', () => {
    expect(registry.has('foo')).toBe(false);
    registry.register('foo', '<svg id="foo"></svg>');
    expect(registry.has('foo')).toBe(true);
    expect(html('foo')).toContain('id="foo"');
  });

  it('registers a whole name → SVG map at once', () => {
    registry.register({ a: '<svg id="a"></svg>', b: '<svg id="b"></svg>' });
    expect(registry.has('a')).toBe(true);
    expect(registry.has('b')).toBe(true);
  });

  it('overrides an existing name on re-register', () => {
    registry.register('x', '<svg id="one"></svg>');
    registry.register('x', '<svg id="two"></svg>');
    expect(html('x')).toContain('id="two"');
  });

  it('returns undefined / false for an unregistered name', () => {
    expect(registry.get('nope')).toBeUndefined();
    expect(registry.has('nope')).toBe(false);
  });
});

describe('provideRhombusIcons', () => {
  it('registers the supplied icon set into the RhombusIconRegistry', () => {
    TestBed.configureTestingModule({
      providers: [provideRhombusIcons({ custom_x: '<svg id="custom"></svg>' })],
    });
    const registry = TestBed.inject(RhombusIconRegistry);
    expect(registry.has('custom_x')).toBe(true);
    // Built-ins remain available alongside the registered set.
    expect(registry.has('more_vert')).toBe(true);
  });

  it('lets a consumer registration win over a pre-seeded built-in', () => {
    // Seeding runs in the registry constructor; provideRhombusIcons registers
    // afterwards, so a consumer that already ships its own chevron keeps it.
    // This is what makes seeding a new built-in name a non-breaking change.
    TestBed.configureTestingModule({
      providers: [provideRhombusIcons({ chevron_right: '<svg id="mine"></svg>' })],
    });
    const registry = TestBed.inject(RhombusIconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);
    const svg = sanitizer.sanitize(SecurityContext.HTML, registry.get('chevron_right') ?? null);
    expect(svg).toContain('id="mine"');
  });
});
