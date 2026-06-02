import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  RhombusThemeService,
  provideRhombusTheme,
  type ThemeName,
} from '@rhombuskit/theme-engine';
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
