import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { RhombusButtonComponent } from '@rhombuskit/core';
import { STACKBLITZ_STARTER } from './stackblitz-starter';

/**
 * "Open the starter in StackBlitz" button. The StackBlitz SDK is imported
 * lazily inside the click handler so it never loads during SSG prerender or in
 * the initial bundle — only when a browser visitor actually clicks. The starter
 * pulls @rhombuskit/* from public npm, so it works regardless of repo privacy.
 */
@Component({
  selector: 'app-open-in-stackblitz',
  standalone: true,
  imports: [RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-button variant="secondary" trailingIcon="open_in_new" (click)="open()">
      Open the starter in StackBlitz
    </rhombus-button>
  `,
})
export class OpenInStackblitzComponent {
  private readonly platformId = inject(PLATFORM_ID);

  protected async open(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const sdk = (await import('@stackblitz/sdk')).default;
    sdk.openProject(STACKBLITZ_STARTER, {
      newWindow: true,
      openFile: 'src/app/app.component.ts',
    });
  }
}
