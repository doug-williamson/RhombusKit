import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenInStackblitzComponent } from './open-in-stackblitz.component';
import { STACKBLITZ_STARTER } from './stackblitz-starter';

describe('OpenInStackblitzComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenInStackblitzComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('renders the StackBlitz CTA button', () => {
    const fixture = TestBed.createComponent(OpenInStackblitzComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Open the starter in StackBlitz',
    );
  });
});

describe('STACKBLITZ_STARTER', () => {
  it('is a self-contained node-template Angular project', () => {
    expect(STACKBLITZ_STARTER.template).toBe('node');
    const files = STACKBLITZ_STARTER.files;
    for (const required of [
      'package.json',
      'angular.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'src/index.html',
      'src/main.ts',
      'src/styles.scss',
      'src/app/app.component.ts',
    ]) {
      expect(files[required]).toBeTruthy();
    }
  });

  it('pins RhombusKit + Angular 21 from public npm and has a start script', () => {
    const pkg = JSON.parse(STACKBLITZ_STARTER.files['package.json']);
    expect(pkg.scripts.start).toBe('ng serve');
    expect(pkg.dependencies['@rhombuskit/core']).toBe('^1.8.0');
    expect(pkg.dependencies['@angular/core']).toBe('^21.0.0');
    // core's Code Block lazy-loads highlight.js via dynamic import(); the app
    // bundler resolves it at build time, so the starter must declare it or
    // `ng build` fails. (Enforced end-to-end by the smoke-test-stackblitz gate.)
    expect(pkg.dependencies['highlight.js']).toBe('^11.0.0');
  });

  it('imports the SCSS layers in the required order', () => {
    const styles = STACKBLITZ_STARTER.files['src/styles.scss'];
    const tokens = styles.indexOf('@rhombuskit/tokens/scss');
    const preset = styles.indexOf('@rhombuskit/material-preset/scss');
    const core = styles.indexOf('@rhombuskit/core/scss');
    expect(tokens).toBeGreaterThanOrEqual(0);
    expect(tokens).toBeLessThan(preset);
    expect(preset).toBeLessThan(core);
  });
});
