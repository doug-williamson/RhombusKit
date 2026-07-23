import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  RhombusThemeService,
  provideRhombusThemes,
  type RegisteredTheme,
  type ThemeName,
} from '@rhombuskit/theme-engine';
import { axe } from '../../testing/axe';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusPalettePickerComponent } from './rhombus-palette-picker.component';

/** jsdom has no matchMedia; stub it so the service's browser branch can run. */
function mockMatchMedia(matches = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

const teal = (mode: 'light' | 'dark'): RegisteredTheme => ({
  name: `community-teal-${mode}` as ThemeName,
  label: mode === 'light' ? 'Teal Light' : 'Teal Dark',
  mode,
  palette: 'teal',
});
/** Two palettes: the built-in `rhombus` + a registered `teal` → picker renders. */
const tealProviders = [provideRhombusThemes(teal('light'), teal('dark'))];

function configure(providers: unknown[]): void {
  TestBed.resetTestingModule();
  localStorage.clear();
  mockMatchMedia(false);
  TestBed.configureTestingModule({
    providers: [provideNoopAnimations(), ...providers],
  });
}

function render(
  providers: unknown[] = tealProviders,
): ComponentFixture<RhombusPalettePickerComponent> {
  configure(providers);
  const fixture = TestBed.createComponent(RhombusPalettePickerComponent);
  fixture.detectChanges();
  return fixture;
}

function triggerIconName(fixture: ComponentFixture<unknown>): string {
  return fixture.debugElement.query(By.directive(RhombusIconComponent))
    .componentInstance.name();
}

function openItems(
  fixture: ComponentFixture<RhombusPalettePickerComponent>,
): HTMLButtonElement[] {
  (
    fixture.nativeElement.querySelector(
      '.rhombus-palette-picker__trigger',
    ) as HTMLElement
  ).click();
  fixture.detectChanges();
  const panels = document.querySelectorAll('.rhombus-palette-picker__panel');
  const panel = panels[panels.length - 1];
  return Array.from(
    panel.querySelectorAll('button[mat-menu-item]'),
  ) as HTMLButtonElement[];
}

// Match on contained text, not exact: a themeIcons entry renders a <mat-icon>
// fallback whose ligature text joins the button's textContent (e.g. "grid_viewTeal").
const byText = (buttons: HTMLButtonElement[], text: string) =>
  buttons.find((b) => b.textContent?.includes(text));

describe('RhombusPalettePickerComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders one menuitemradio per registered palette', () => {
    const items = openItems(render());
    expect(items).toHaveLength(2);
    expect(items.every((b) => b.getAttribute('role') === 'menuitemradio')).toBe(
      true,
    );
    expect(byText(items, 'Teal')).toBeTruthy();
  });

  it('clicking a palette calls setPalette with its id', () => {
    const fixture = render();
    const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setPalette');
    byText(openItems(fixture), 'Teal')!.click();
    expect(spy).toHaveBeenCalledWith('teal');
  });

  it('marks the active palette with aria-checked and the active class', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setTheme(
      'community-teal-dark' as ThemeName,
    );
    fixture.detectChanges();
    const items = openItems(fixture);
    const tealBtn = byText(items, 'Teal')!;
    const other = items.find((b) => b !== tealBtn)!;
    expect(tealBtn.getAttribute('aria-checked')).toBe('true');
    expect(tealBtn.classList).toContain(
      'rhombus-palette-picker__item--active',
    );
    expect(other.getAttribute('aria-checked')).toBe('false');
  });

  it('trigger aria-label names the active palette label, not the raw id', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setTheme(
      'community-teal-dark' as ThemeName,
    );
    fixture.detectChanges();
    const label = (
      fixture.nativeElement.querySelector(
        '.rhombus-palette-picker__trigger',
      ) as HTMLElement
    ).getAttribute('aria-label');
    expect(label).toContain('Teal');
    expect(label).not.toContain('community-teal-dark');
  });

  it('trigger icon defaults to "palette" and honours a themeIcons mapping', () => {
    const fixture = render();
    // Default active palette is the built-in rhombus; no mapping → default icon.
    expect(triggerIconName(fixture)).toBe('palette');
    fixture.componentRef.setInput('themeIcons', { rhombus: 'grid_view' });
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('grid_view');
  });

  it('renders an item icon only for palettes present in themeIcons', () => {
    const fixture = render();
    fixture.componentRef.setInput('themeIcons', { teal: 'grid_view' });
    fixture.detectChanges();
    const items = openItems(fixture);
    const tealBtn = byText(items, 'Teal')!;
    const other = items.find((b) => b !== tealBtn)!;
    expect(tealBtn.querySelector('rhombus-icon')).toBeTruthy();
    expect(other.querySelector('rhombus-icon')).toBeNull();
  });

  it('renders nothing when only one palette is registered (graceful degrade)', () => {
    const fixture = render([]); // no registered palettes → built-in rhombus only
    expect(
      fixture.nativeElement.querySelector('.rhombus-palette-picker__trigger'),
    ).toBeNull();
    expect(
      document.querySelector('.rhombus-palette-picker__panel'),
    ).toBeNull();
  });

  it('the open menu has no accessibility violations', async () => {
    const fixture = render();
    openItems(fixture);
    const panel = document.querySelector(
      '.rhombus-palette-picker__panel',
    ) as HTMLElement;
    expect(await axe(panel)).toHaveNoViolations();
  });
});
