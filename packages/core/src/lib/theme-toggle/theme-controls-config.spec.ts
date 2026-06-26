import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  RhombusThemeService,
  provideRhombusTheme,
  provideRhombusThemes,
  type RegisteredTheme,
  type ThemeName,
} from '@rhombuskit/theme-engine';
import { axe } from '../../testing/axe';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusThemeMenuComponent } from './rhombus-theme-menu.component';
import { RhombusThemeToggleComponent } from './rhombus-theme-toggle.component';

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

describe('theme controls honor RHOMBUS_THEME_CONFIG', () => {
  afterEach(() => {
    // Dispose any open menu overlay so the next test queries a clean DOM.
    TestBed.resetTestingModule();
  });

  describe('rhombus-theme-menu under provideRhombusTheme({ light, dark })', () => {
    function renderMenu(): ComponentFixture<RhombusThemeMenuComponent> {
      configure([provideRhombusTheme({ light: LIGHT, dark: DARK })]);
      const fixture = TestBed.createComponent(RhombusThemeMenuComponent);
      fixture.detectChanges();
      return fixture;
    }

    /** Open the menu and return its option buttons in [Light, Dark, System] order. */
    function openOptions(
      fixture: ComponentFixture<RhombusThemeMenuComponent>,
    ): HTMLButtonElement[] {
      (
        fixture.nativeElement.querySelector(
          '.rhombus-theme-menu__trigger',
        ) as HTMLElement
      ).click();
      fixture.detectChanges();
      const panels = document.querySelectorAll('.rhombus-theme-menu__panel');
      const panel = panels[panels.length - 1];
      return Array.from(
        panel.querySelectorAll('button[mat-menu-item]'),
      ) as HTMLButtonElement[];
    }

    it('Light option calls setTheme with the configured light name', () => {
      const fixture = renderMenu();
      const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setTheme');
      openOptions(fixture)[0].click();
      expect(spy).toHaveBeenCalledWith(LIGHT);
    });

    it('Dark option calls setTheme with the configured dark name', () => {
      const fixture = renderMenu();
      const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setTheme');
      openOptions(fixture)[1].click();
      expect(spy).toHaveBeenCalledWith(DARK);
    });

    it("System option calls setTheme with the literal 'system'", () => {
      const fixture = renderMenu();
      const spy = jest.spyOn(TestBed.inject(RhombusThemeService), 'setTheme');
      openOptions(fixture)[2].click();
      expect(spy).toHaveBeenCalledWith('system');
    });

    it('marks the active option matching the configured preference', () => {
      const fixture = renderMenu();
      TestBed.inject(RhombusThemeService).setTheme(LIGHT);
      fixture.detectChanges();
      const [lightOpt, darkOpt] = openOptions(fixture);
      expect(lightOpt.classList).toContain('rhombus-theme-menu__item--active');
      expect(darkOpt.classList).not.toContain(
        'rhombus-theme-menu__item--active',
      );
    });
  });

  describe('rhombus-theme-toggle under provideRhombusTheme({ light, dark })', () => {
    function renderToggle(): ComponentFixture<RhombusThemeToggleComponent> {
      configure([provideRhombusTheme({ light: LIGHT, dark: DARK })]);
      const fixture = TestBed.createComponent(RhombusThemeToggleComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('shows the light icon when preference is the configured light name', () => {
      const fixture = renderToggle();
      TestBed.inject(RhombusThemeService).setTheme(LIGHT);
      fixture.detectChanges();
      expect(triggerIconName(fixture)).toBe('light_mode');
    });

    it('shows the dark icon when preference is the configured dark name', () => {
      const fixture = renderToggle();
      TestBed.inject(RhombusThemeService).setTheme(DARK);
      fixture.detectChanges();
      expect(triggerIconName(fixture)).toBe('dark_mode');
    });
  });

  describe('no provider: behavior is byte-identical to the rhombus-* defaults', () => {
    it('toggle maps rhombus-light to the light icon with no config', () => {
      configure([]);
      const fixture = TestBed.createComponent(RhombusThemeToggleComponent);
      TestBed.inject(RhombusThemeService).setTheme('rhombus-light');
      fixture.detectChanges();
      expect(triggerIconName(fixture)).toBe('light_mode');
    });

    it('toggle maps rhombus-dark to the dark icon with no config', () => {
      configure([]);
      const fixture = TestBed.createComponent(RhombusThemeToggleComponent);
      TestBed.inject(RhombusThemeService).setTheme('rhombus-dark');
      fixture.detectChanges();
      expect(triggerIconName(fixture)).toBe('dark_mode');
    });
  });
});

const teal = (mode: 'light' | 'dark'): RegisteredTheme => ({
  name: `community-teal-${mode}` as ThemeName,
  label: mode === 'light' ? 'Teal Light' : 'Teal Dark',
  mode,
  palette: 'teal',
});
const tealProviders = [provideRhombusThemes(teal('light'), teal('dark'))];

describe('theme controls — registry-driven (Phase 4)', () => {
  afterEach(() => TestBed.resetTestingModule());

  function renderMenu(): ComponentFixture<RhombusThemeMenuComponent> {
    configure(tealProviders);
    const fixture = TestBed.createComponent(RhombusThemeMenuComponent);
    fixture.detectChanges();
    return fixture;
  }

  function openMenuButtons(
    fixture: ComponentFixture<RhombusThemeMenuComponent>,
  ): HTMLButtonElement[] {
    (
      fixture.nativeElement.querySelector(
        '.rhombus-theme-menu__trigger',
      ) as HTMLElement
    ).click();
    fixture.detectChanges();
    const panels = document.querySelectorAll('.rhombus-theme-menu__panel');
    const panel = panels[panels.length - 1];
    return Array.from(
      panel.querySelectorAll('button[mat-menu-item]'),
    ) as HTMLButtonElement[];
  }

  const byText = (buttons: HTMLButtonElement[], text: string) =>
    buttons.find((b) => b.textContent?.trim() === text);

  it('Light preserves the active palette instead of reverting to rhombus', () => {
    const fixture = renderMenu();
    const service = TestBed.inject(RhombusThemeService);
    service.setTheme('community-teal-dark' as ThemeName);
    fixture.detectChanges();

    byText(openMenuButtons(fixture), 'Light')!.click();

    expect(service.current()).toBe('community-teal-light');
    expect(service.palette()).toBe('teal');
  });

  it('renders a palette section when more than one palette is registered', () => {
    const tealBtn = byText(openMenuButtons(renderMenu()), 'Teal');
    expect(tealBtn).toBeTruthy();
    expect(tealBtn?.getAttribute('role')).toBe('menuitemradio');
  });

  it('marks the active palette and mode as aria-checked', () => {
    const fixture = renderMenu();
    TestBed.inject(RhombusThemeService).setTheme('community-teal-dark' as ThemeName);
    fixture.detectChanges();
    const buttons = openMenuButtons(fixture);
    expect(byText(buttons, 'Dark')?.getAttribute('aria-checked')).toBe('true');
    expect(byText(buttons, 'Light')?.getAttribute('aria-checked')).toBe('false');
    expect(byText(buttons, 'Teal')?.getAttribute('aria-checked')).toBe('true');
  });

  it('menu trigger icon reflects an active community theme mode', () => {
    const fixture = renderMenu();
    TestBed.inject(RhombusThemeService).setTheme('community-teal-dark' as ThemeName);
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('dark_mode');
  });

  it('toggle trigger icon reflects an active community theme mode', () => {
    configure(tealProviders);
    const fixture = TestBed.createComponent(RhombusThemeToggleComponent);
    TestBed.inject(RhombusThemeService).setTheme('community-teal-dark' as ThemeName);
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('dark_mode');
  });

  it('menu marks System active when following the OS within a palette', () => {
    const fixture = renderMenu();
    TestBed.inject(RhombusThemeService).setTheme('system:teal');
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('contrast');
    const buttons = openMenuButtons(fixture);
    expect(byText(buttons, 'System')?.getAttribute('aria-checked')).toBe('true');
    expect(byText(buttons, 'Dark')?.getAttribute('aria-checked')).toBe('false');
    expect(byText(buttons, 'Teal')?.getAttribute('aria-checked')).toBe('true');
  });

  it('toggle trigger shows the system icon when following the OS within a palette', () => {
    configure(tealProviders);
    const fixture = TestBed.createComponent(RhombusThemeToggleComponent);
    TestBed.inject(RhombusThemeService).setTheme('system:teal');
    fixture.detectChanges();
    expect(triggerIconName(fixture)).toBe('contrast');
  });

  it('a single-family configured app (no -light/-dark stem) stays a 3-item menu', () => {
    configure([
      provideRhombusTheme({
        light: 'aurora-day' as ThemeName,
        dark: 'aurora-night' as ThemeName,
      }),
    ]);
    const fixture = TestBed.createComponent(RhombusThemeMenuComponent);
    fixture.detectChanges();
    const buttons = openMenuButtons(fixture);
    expect(buttons).toHaveLength(3);
    const panel = document.querySelector(
      '.rhombus-theme-menu__panel',
    ) as HTMLElement;
    expect(panel.querySelector('.rhombus-theme-menu__palettes')).toBeNull();
  });

  it('toggle aria-label reflects the active community theme (no raw id)', () => {
    configure(tealProviders);
    const fixture = TestBed.createComponent(RhombusThemeToggleComponent);
    TestBed.inject(RhombusThemeService).setTheme('community-teal-dark' as ThemeName);
    fixture.detectChanges();
    const label = (
      fixture.nativeElement.querySelector('button') as HTMLElement
    ).getAttribute('aria-label');
    expect(label).not.toContain('community-teal-dark');
    expect(label).toContain('Teal');
    expect(label).toContain('dark');
  });

  it('the open menu has no accessibility violations', async () => {
    const fixture = renderMenu();
    openMenuButtons(fixture);
    const panel = document.querySelector(
      '.rhombus-theme-menu__panel',
    ) as HTMLElement;
    expect(await axe(panel)).toHaveNoViolations();
  });
});
