import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';
import { RhombusSheetRef } from './rhombus-sheet-ref';

let nextId = 0;

/**
 * `<rhombus-sheet>` — the standard chrome for a sheet opened with
 * {@link RhombusSheetService}: an optional heading, a scrollable body, and a
 * footer action row. Drop it as the root of the component you open to get
 * consistent padding, the slide-in surface, and accessible-name wiring.
 *
 * When `title` is set it drives the sheet's `aria-labelledby` (via the ref);
 * otherwise supply a `config.ariaLabel` at open time. A sheet with neither
 * fails loud. The chrome does **not** re-declare `role="dialog"` / `aria-modal`
 * — the CDK dialog container already owns those.
 *
 * Project the body as default content and the buttons via `[rhombusSheetActions]`.
 *
 * ```html
 * <rhombus-sheet title="Filters">
 *   <rhombus-select ... />
 *   <div rhombusSheetActions>
 *     <rhombus-button appearance="text" rhombusSheetClose>Cancel</rhombus-button>
 *     <rhombus-button (click)="apply()">Apply</rhombus-button>
 *   </div>
 * </rhombus-sheet>
 * ```
 */
@Component({
  selector: 'rhombus-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-sheet.component.scss',
  template: `
    @if (title() || dismissible()) {
      <header class="rhombus-sheet__header">
        @if (title()) {
          <h2 class="rhombus-sheet__title" [id]="titleId">{{ title() }}</h2>
        }
        @if (dismissible()) {
          <button
            type="button"
            class="rhombus-sheet__dismiss"
            aria-label="Close"
            (click)="dismiss()"
          >
            &times;
          </button>
        }
      </header>
    }
    <div class="rhombus-sheet__body"><ng-content /></div>
    <div class="rhombus-sheet__footer">
      <ng-content select="[rhombusSheetActions]" />
    </div>
  `,
})
export class RhombusSheetComponent {
  /** Heading; when set it becomes the sheet's accessible name (`aria-labelledby`). */
  readonly title = input<string>('');
  /** Show the header close (×) button. Accepts a bare attribute. Defaults to `true`. */
  readonly dismissible = input(true, { transform: booleanAttribute });

  protected readonly titleId = `rhombus-sheet-title-${nextId++}`;
  private readonly sheetRef = inject(RhombusSheetRef, { optional: true });

  constructor() {
    // Wire the title as the accessible name as soon as it is known (during CD,
    // before the ref's deferred name check). No-op outside a sheet overlay.
    effect(() => {
      if (this.title()) {
        this.sheetRef?._setLabelledBy(this.titleId);
      }
    });
    // Run the slide-in once the chrome (and its styles) have rendered. Idempotent
    // with the ref's own fallback activation.
    afterNextRender(() => this.sheetRef?._activate());
  }

  protected dismiss(): void {
    this.sheetRef?.close();
  }
}
