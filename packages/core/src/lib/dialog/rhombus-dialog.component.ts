import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { MatDialogTitle } from '@angular/material/dialog';

/**
 * `<rhombus-dialog>` — the standard RhombusKit dialog chrome: an optional
 * heading, a body, and a footer action row. Drop it inside any component you
 * open with {@link RhombusDialogService} (or `MatDialog`) to get consistent
 * padding and typography, plus Material's `aria-labelledby` wiring via
 * `mat-dialog-title`.
 *
 * Project the body as default content and the buttons via
 * `[rhombusDialogActions]`.
 *
 * ```html
 * <rhombus-dialog [title]="'Rename project'">
 *   <rhombus-input [(value)]="name" />
 *   <div rhombusDialogActions>
 *     <rhombus-button appearance="text" (click)="ref.close()">Cancel</rhombus-button>
 *     <rhombus-button (click)="ref.close(name)">Save</rhombus-button>
 *   </div>
 * </rhombus-dialog>
 * ```
 */
@Component({
  selector: 'rhombus-dialog',
  standalone: true,
  imports: [MatDialogTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-dialog.component.scss',
  template: `
    @if (title()) {
      <h2 class="rhombus-dialog__title" mat-dialog-title>{{ title() }}</h2>
    }
    <div class="rhombus-dialog__content">
      <ng-content></ng-content>
    </div>
    <div class="rhombus-dialog__actions">
      <ng-content select="[rhombusDialogActions]"></ng-content>
    </div>
  `,
})
export class RhombusDialogComponent {
  /**
   * Dialog heading. When set, it is wired as the dialog's accessible label via
   * `mat-dialog-title`; when empty the heading is omitted (supply an
   * `ariaLabel` through {@link RhombusDialogService} instead).
   */
  readonly title = input<string>('');
}
