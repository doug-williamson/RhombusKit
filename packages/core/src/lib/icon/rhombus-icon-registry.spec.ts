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
});
