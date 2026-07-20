import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  DataTableHostComponent,
  PEOPLE,
} from './rhombus-data-table.spec-helpers';

/**
 * Table-local `density`.
 *
 * The table is the one component with its own density knob, because "this one
 * grid stays dense / stays default" is the most-requested escape from an
 * app-wide level, and its ramp removes no touch target at any exposed level.
 *
 * WHERE THE ATTRIBUTE GOES IS LOAD-BEARING. The component has no `host:` block
 * and is `ViewEncapsulation.None`, so neither a host binding nor `:host` can
 * reach the element the SCSS targets. The attribute must land on the inner
 * `.rhombus-data-table` template div, which is the ancestor of the rows, the
 * header, the footer and the paginator. An earlier draft bound it to the host
 * and the whole feature was a guaranteed no-op.
 *
 * `'default'` MUST emit a real attribute rather than being treated as "no
 * value". It is the entire mechanism by which one table escapes a global
 * `provideRhombusDensity('compact')` — an earlier draft matched nothing for
 * `'default'`, so a table could not opt back out. The corresponding SCSS block
 * restates Material's scale-0 literals for the same reason.
 *
 * jsdom has no layout engine, so this spec asserts the ATTRIBUTE contract only.
 * The rendered geometry each level produces is asserted in Playwright
 * (`apps/showcase-e2e/tests/`), which is also the only place the touch-target
 * rebinding at `dense` can be measured.
 */
describe('rhombus-data-table table-local density', () => {
  let fixture: ComponentFixture<DataTableHostComponent>;
  let host: DataTableHostComponent;
  let el: HTMLElement;

  /** The inner template div the SCSS keys off — NOT the component host. */
  const panel = (): HTMLElement => {
    const found = el.querySelector<HTMLElement>('.rhombus-data-table');
    if (!found) throw new Error('.rhombus-data-table div not found');
    return found;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(DataTableHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;

    host.data.set(PEOPLE);
    host.paginated.set(false);
    fixture.detectChanges();
  });

  it('emits no data-density attribute when density is not set', () => {
    // The byte-identical promise, at the component level: an unconfigured table
    // must carry no attribute at all, so no density block can match it.
    expect(panel().hasAttribute('data-density')).toBe(false);
  });

  it('reflects density onto the inner template div, not the host', () => {
    host.density.set('compact');
    fixture.detectChanges();

    expect(panel().getAttribute('data-density')).toBe('compact');
    // The host must stay clean — if the binding ever migrates there, the SCSS
    // (which selects `.rhombus-data-table[data-density=…]`) silently stops
    // matching and every level becomes a no-op.
    const hostEl = el.querySelector('rhombus-data-table');
    expect(hostEl?.hasAttribute('data-density')).toBe(false);
  });

  it("emits a real attribute for 'default' — the escape from a global level", () => {
    host.density.set('default');
    fixture.detectChanges();

    // Not "absent because default is the no-op level": this attribute is what
    // lets one table render at 52px inside an app-wide compact.
    expect(panel().getAttribute('data-density')).toBe('default');
  });

  it("accepts the table-only 'dense' step", () => {
    host.density.set('dense');
    fixture.detectChanges();

    // 'dense' has no global equivalent — it drops below every other component's
    // floor, so it exists only here.
    expect(panel().getAttribute('data-density')).toBe('dense');
  });

  it('removes the attribute again when density is cleared', () => {
    host.density.set('comfortable');
    fixture.detectChanges();
    expect(panel().getAttribute('data-density')).toBe('comfortable');

    host.density.set(undefined);
    fixture.detectChanges();
    expect(panel().hasAttribute('data-density')).toBe(false);
  });
});
