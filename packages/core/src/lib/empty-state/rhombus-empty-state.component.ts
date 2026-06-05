import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RhombusButtonComponent } from '../button/rhombus-button.component';

/**
 * `<rhombus-empty-state>` — a centered icon + heading + optional body + optional
 * CTA, for "nothing here yet" surfaces (empty lists, columns, search results).
 *
 * Lifts FolioKit's dead `EmptyStateComponent` and bakes in its canonical
 * `_layout.scss` styling (which the original shipped none of). The icon is a
 * Material **ligature** name (e.g. `inbox`), not an `[svgIcon]` registry id, and
 * the CTA composes `rhombus-button` rather than a raw Material button.
 *
 * This is an element (`rhombus-empty-state`); it does not collide with the
 * data-table's attribute directive `[rhombusEmptyState]` and may nest inside it.
 */
@Component({
  selector: 'rhombus-empty-state',
  standalone: true,
  imports: [MatIconModule, RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-empty-state.component.scss',
  template: `
    <div class="rhombus-empty-state">
      <mat-icon class="rhombus-empty-state__icon">{{ icon() }}</mat-icon>
      <p class="rhombus-empty-state__heading">{{ heading() }}</p>
      @if (body()) {
        <p class="rhombus-empty-state__body">{{ body() }}</p>
      }
      @if (ctaLabel()) {
        <rhombus-button variant="primary" (click)="ctaClick.emit()">{{ ctaLabel() }}</rhombus-button>
      }
    </div>
  `,
})
export class RhombusEmptyStateComponent {
  /** Material icon ligature name shown above the heading; defaults to `'inbox'`. */
  readonly icon = input<string>('inbox');
  /** Primary heading text (required). */
  readonly heading = input.required<string>();
  /** Optional supporting body text shown below the heading. */
  readonly body = input<string>('');
  /** Label for the optional CTA button; when empty, no button is rendered. */
  readonly ctaLabel = input<string>('');
  /** Emits when the CTA button is clicked. */
  readonly ctaClick = output<void>();
}
