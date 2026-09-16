import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { RhombusIconRegistry } from './rhombus-icon-registry';

/**
 * The registry docblock promises that the library's own components render
 * "without any consumer registration and without the Material Icons font".
 * That is only true if every glyph name a kit template hands to
 * `<rhombus-icon>` is pre-seeded in `RHOMBUS_DEFAULT_GLYPHS` — an unseeded
 * name falls through to `<mat-icon>{{ name }}</mat-icon>` and, on a host
 * with no icon font, paints the literal word ("chevron_right") where the
 * glyph belongs. Nothing in jsdom, axe or the accessibility tree can see that
 * (the host is aria-hidden either way), so this spec reads the authored
 * sources instead: every literal icon name in a kit template, and every
 * `*Icon` input default that feeds a `[name]` binding, must resolve in a bare
 * registry. A new component that asks for an unregistered glyph then fails
 * `nx test core`, not a consumer's browser.
 */

const LIB_ROOT = join(__dirname, '..');

/** Every non-spec component source under packages/core/src/lib. */
function componentSources(dir = LIB_ROOT): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return componentSources(path);
    return /\.component\.ts$/.test(entry) && !/\.spec/.test(entry) ? [path] : [];
  });
}

/** The inline template literal only — never docblocks or examples. */
function templateOf(source: string): { text: string; offset: number } | null {
  const m = /template:\s*(`)([^`]*)`/.exec(source) ?? /template:\s*(')([^']*)'/.exec(source);
  if (!m) return null;
  return { text: m[2], offset: m.index + m[0].indexOf(m[1]) + 1 };
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

interface GlyphUse {
  name: string;
  where: string;
}

/** Glyph names the kit's own templates and input defaults hand to <rhombus-icon>. */
export function collectKitGlyphUses(): GlyphUse[] {
  const uses: GlyphUse[] = [];
  for (const file of componentSources()) {
    const source = readFileSync(file, 'utf8');
    const template = templateOf(source);
    if (!template) continue;
    const where = (index: number): string =>
      `${relative(LIB_ROOT, file).replace(/\\/g, '/')}:${lineAt(source, index)}`;

    // (a) static literals: <rhombus-icon … name="chevron_right" />
    for (const m of template.text.matchAll(/<rhombus-icon\b[^>]*?\sname="([^"]+)"/g)) {
      uses.push({ name: m[1], where: where(template.offset + m.index) });
    }

    // (b) quoted literals inside a binding: [name]="copied() ? 'check' : 'content_copy'"
    let hasNameBinding = false;
    for (const m of template.text.matchAll(/<rhombus-icon\b[^>]*?\[name\]="([^"]*)"/g)) {
      hasNameBinding = true;
      for (const literal of m[1].matchAll(/'([a-z0-9_]+)'/g)) {
        uses.push({ name: literal[1], where: where(template.offset + m.index) });
      }
    }

    // (c) *Icon input defaults that feed a [name] binding:
    //     readonly defaultIcon = input<string>('palette')
    if (hasNameBinding) {
      for (const m of source.matchAll(
        /readonly\s+\w*[iI]con\s*=\s*input(?:<[^>]*>)?\(\s*'([^']+)'/g
      )) {
        uses.push({ name: m[1], where: where(m.index) });
      }
    }
  }
  return uses;
}

describe('kit glyph coverage', () => {
  it('pre-seeds every icon name the kit\'s own templates and *Icon input defaults hand to <rhombus-icon>', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(RhombusIconRegistry);

    const uses = collectKitGlyphUses();
    // Sanity: the scan must actually see the kit's templates.
    expect(uses.length).toBeGreaterThan(5);

    const missing = [...new Set(
      uses.filter((u) => !registry.has(u.name)).map((u) => `${u.name} <- ${u.where}`)
    )].sort();
    expect(missing).toEqual([]);
  });
});
