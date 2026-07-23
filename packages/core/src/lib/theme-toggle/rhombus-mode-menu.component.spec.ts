import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  RhombusThemeService,
  provideRhombusTheme,
  type ThemeName,
} from '@rhombuskit/theme-engine';
import { axe } from '../../testing/axe';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusModeMenuComponent } from './rhombus-mode-menu.component';

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

// Caller-trusted names; cast since they are not in the default ThemeRegistry.
const LIGHT = 'aurora-day' as ThemeName;
const DARK = 'aurora-night' as ThemeName;

function configure(providers: unknown[]): void {
  TestBed.resetTestingModule();
  localStorage.clear();
  mockMatchMedia(false);
  TestBed.configureTestingModule({
    providers: [provideNoopAnimations(), ...providers],
  });
}

/** The name fed to the (single) trigger <rhombus-icon>. */
function triggerIconName(fixture: ComponentFixture<unknown>): string {
  return fixture.debugElement.query(By.directive(RhombusIconComponent))
    .componentInstance.name();
}

function render(): ComponentFixture<RhombusModeMenuComponent> {
  configure([provideRhombusTheme({ light: LIGHT, dark: DARK })]);
  const fixture = TestBed.createComponent(RhombusModeMenuComponent);
  fixture.detectChanges();
  return fixture;
}

/** Open the menu and return its option buttons in [Light, Dark, System] order. */
function openItems(
  fixture: ComponentFixture<RhombusModeMenuComponent>,
): HTMLButtonElement[] {
  (
    fixture.nativeElement.querySelector(
      '.rhombus-mode-menu__trigger',
    ) as HTMLElement
  ).click();
  fixture.detectChanges();
  const panels = document.querySelectorAll('.rhombus-mode-menu__panel');
  const panel = panels[panels.length - 1];
  return Array.from(
    panel.querySelectorAll('button[mat-menu-item]'),
  ) as HTMLButtonElement[];
}

describe('RhombusModeMenuComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders exactly three mode options: Light, Dark, System', () => {
    const items = openItems(render());
    expect(items).toHaveLength(3);
    expect(items.map((b) => b.textContent?.trim())).toEqual([
      'Light',
      'Dark',
      'System',
    ]);
  });

  it('Light option calls setMode("light")', () => {
    const fixture = render();
    const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setMode');
    openItems(fixture)[0].click();
    expect(spy).toHaveBeenCalledWith('light');
  });

  it('Dark option calls setMode("dark")', () => {
    const fixture = render();
    const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setMode');
    openItems(fixture)[1].click();
    expect(spy).toHaveBeenCalledWith('dark');
  });

  it('System option calls setMode("system")', () => {
    const fixture = render();
    const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setMode');
    openItems(fixture)[2].click();
    expect(spy).toHaveBeenCalledWith('system');
  });

  it('marks the active mode with aria-checked and the active class', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setMode('dark');
    fixture.detectChanges();
    const [light, dark, system] = openItems(fixture);
    expect(dark.getAttribute('aria-checked')).toBe('true');
    expect(dark.classList).toContain('rhombus-mode-menu__item--active');
    expect(light.getAttribute('aria-checked')).toBe('false');
    expect(system.getAttribute('aria-checked')).toBe('false');
  });

  it('trigger icon reflects the light mode', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setMode('light');
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('light_mode');
  });

  it('trigger icon reflects the dark mode', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setMode('dark');
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('dark_mode');
  });

  it('trigger icon reflects following the OS (system)', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setMode('system');
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('contrast');
  });

  it('respects a custom mode icon input', () => {
    const fixture = render();
    fixture.componentRef.setInput('darkIcon', 'nightlight');
    TestBed.inject(RhombusThemeService).setMode('dark');
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('nightlight');
  });

  it('aria-label names the active mode', () => {
    const fixture = render();
    TestBed.inject(RhombusThemeService).setMode('dark');
    fixture.detectChanges();
    const label = (
      fixture.nativeElement.querySelector(
        '.rhombus-mode-menu__trigger',
      ) as HTMLElement
    ).getAttribute('aria-label');
    expect(label).toContain('dark');
  });

  it('the open menu has no accessibility violations', async () => {
    const fixture = render();
    openItems(fixture);
    const panel = document.querySelector(
      '.rhombus-mode-menu__panel',
    ) as HTMLElement;
    expect(await axe(panel)).toHaveNoViolations();
  });
});
