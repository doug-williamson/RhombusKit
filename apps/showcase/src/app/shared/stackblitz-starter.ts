import type { Project } from '@stackblitz/sdk';

// A self-contained Angular 21 + RhombusKit project opened via the StackBlitz
// SDK. It uses the `node` WebContainers template and pulls @rhombuskit/* from
// the public npm registry, so it boots without any access to this repo (which
// stays private until launch). The `import type` above is erased at compile
// time — only open-in-stackblitz.component.ts loads the SDK at runtime, lazily.

const PACKAGE_JSON = JSON.stringify(
  {
    name: 'rhombuskit-starter',
    version: '0.0.0',
    scripts: { start: 'ng serve', build: 'ng build' },
    dependencies: {
      '@angular/animations': '^21.0.0',
      '@angular/cdk': '^21.0.0',
      '@angular/common': '^21.0.0',
      '@angular/compiler': '^21.0.0',
      '@angular/core': '^21.0.0',
      '@angular/forms': '^21.0.0',
      '@angular/material': '^21.0.0',
      '@angular/platform-browser': '^21.0.0',
      '@angular/router': '^21.0.0',
      '@rhombuskit/core': '^1.5.0',
      '@rhombuskit/material-preset': '^1.5.0',
      '@rhombuskit/theme-engine': '^1.5.0',
      '@rhombuskit/tokens': '^1.5.0',
      rxjs: '^7.8.0',
      tslib: '^2.3.0',
      'zone.js': '~0.16.0',
    },
    devDependencies: {
      '@angular/build': '^21.0.0',
      '@angular/cli': '^21.0.0',
      '@angular/compiler-cli': '^21.0.0',
      typescript: '~5.9.0',
    },
  },
  null,
  2,
);

const ANGULAR_JSON = JSON.stringify(
  {
    $schema: './node_modules/@angular/cli/lib/config/schema.json',
    version: 1,
    projects: {
      'rhombuskit-starter': {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              outputPath: 'dist',
              index: 'src/index.html',
              browser: 'src/main.ts',
              polyfills: ['zone.js'],
              tsConfig: 'tsconfig.app.json',
              styles: ['src/styles.scss'],
            },
          },
          serve: {
            builder: '@angular/build:dev-server',
            options: { buildTarget: 'rhombuskit-starter:build' },
          },
        },
      },
    },
  },
  null,
  2,
);

const TSCONFIG_JSON = JSON.stringify(
  {
    compileOnSave: false,
    compilerOptions: {
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      moduleResolution: 'bundler',
      target: 'ES2022',
      module: 'ES2022',
      lib: ['ES2022', 'dom'],
    },
    angularCompilerOptions: { strictTemplates: true },
  },
  null,
  2,
);

const TSCONFIG_APP_JSON = JSON.stringify(
  {
    extends: './tsconfig.json',
    compilerOptions: { outDir: './out-tsc/app', types: [] },
    files: ['src/main.ts'],
  },
  null,
  2,
);

const INDEX_HTML = `<!doctype html>
<html lang="en" data-theme="rhombus-light">
  <head>
    <meta charset="utf-8" />
    <title>RhombusKit starter</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`;

const MAIN_TS = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRhombusTheme } from '@rhombuskit/theme-engine';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideAnimationsAsync(), provideRhombusTheme()],
}).catch((err) => console.error(err));
`;

const STYLES_SCSS = `// Order matters — see the RhombusKit setup guide.
@use '@rhombuskit/tokens/scss' as tokens;
@use '@rhombuskit/material-preset/scss' as preset;
@use '@rhombuskit/core/scss' as core;

body {
  margin: 0;
  padding: 2rem;
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text-primary);
}
`;

const APP_COMPONENT_TS = `import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusThemeToggleComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RhombusButtonComponent, RhombusThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
      <h1 style="margin:0;font-size:1.5rem">RhombusKit starter</h1>
      <rhombus-theme-toggle />
    </header>

    <p style="color:var(--text-secondary)">
      Edit <code>src/app/app.component.ts</code>. Flip the toggle — the whole UI
      re-themes from one design-token contract.
    </p>

    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
      <rhombus-button variant="primary">Primary</rhombus-button>
      <rhombus-button variant="secondary">Secondary</rhombus-button>
      <rhombus-button variant="ghost">Ghost</rhombus-button>
      <rhombus-button variant="danger">Danger</rhombus-button>
    </div>
  \`,
})
export class AppComponent {}
`;

/** The RhombusKit "Open in StackBlitz" starter project. */
export const STACKBLITZ_STARTER: Project = {
  title: 'RhombusKit starter',
  description:
    'A minimal Angular 21 app using @rhombuskit/core, themed by the design-token contract.',
  template: 'node',
  files: {
    'package.json': PACKAGE_JSON,
    'angular.json': ANGULAR_JSON,
    'tsconfig.json': TSCONFIG_JSON,
    'tsconfig.app.json': TSCONFIG_APP_JSON,
    'src/index.html': INDEX_HTML,
    'src/main.ts': MAIN_TS,
    'src/styles.scss': STYLES_SCSS,
    'src/app/app.component.ts': APP_COMPONENT_TS,
  },
};
