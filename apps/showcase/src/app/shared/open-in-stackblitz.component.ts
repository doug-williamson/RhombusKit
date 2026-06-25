import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';
import type { Project } from '@stackblitz/sdk';
import { RhombusButtonComponent } from '@rhombuskit/core';
import { STACKBLITZ_STARTER } from './stackblitz-starter';

/**
 * "Open in StackBlitz" button. The StackBlitz SDK is imported lazily inside the
 * click handler so it never loads during SSG prerender or in the initial bundle
 * — only when a browser visitor actually clicks. Starters pull @rhombuskit/*
 * from public npm (or a CDN), so they work regardless of repo privacy.
 *
 * Defaults to the Angular core starter; pass `[project]` / `openFile` / `label`
 * to open a different one (e.g. the framework-agnostic tokens starter).
 */
@Component({
  selector: 'app-open-in-stackblitz',
  standalone: true,
  imports: [RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-button variant="secondary" trailingIcon="open_in_new" (click)="open()">
      {{ label() }}
    </rhombus-button>
  `,
})
export class OpenInStackblitzComponent {
  /** Project to open. Defaults to the Angular core starter. */
  readonly project = input<Project>(STACKBLITZ_STARTER);
  /** File to focus when the project opens. */
  readonly openFile = input<string>('src/app/app.component.ts');
  /** Button label. */
  readonly label = input<string>('Open the starter in StackBlitz');

  private readonly platformId = inject(PLATFORM_ID);

  protected async open(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const sdk = (await import('@stackblitz/sdk')).default;
    sdk.openProject(this.project(), {
      newWindow: true,
      openFile: this.openFile(),
    });
  }
}
