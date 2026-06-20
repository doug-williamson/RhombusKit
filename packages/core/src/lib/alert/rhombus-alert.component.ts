import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/** Severity of an alert; selects the shared `--toast-<variant>-*` colour pair. */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const SEVERITY_LABELS: Record<AlertVariant, string> = {
  info: 'Information:',
  success: 'Success:',
  warning: 'Warning:',
  error: 'Error:',
};

/**
 * `<rhombus-alert>` — a persistent, inline severity banner (distinct from the
 * transient toast). Project the message as content; pass a `title` for a heading
 * and `dismissible` for a close button. Severity is conveyed by colour, by a
 * visually-hidden prefix (so it is not colour-only), and reuses the shared
 * `--toast-<variant>-bg/text` contract tokens. Bespoke — no Material primitive.
 *
 * ```html
 * <rhombus-alert variant="warning" title="Heads up" dismissible (dismissed)="onClose()">
 *   Your storage is almost full.
 * </rhombus-alert>
 * ```
 */
@Component({
  selector: 'rhombus-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-alert.component.scss',
  template: `
    @if (!closed()) {
      <div
        class="rhombus-alert"
        [attr.role]="role()"
        [class.rhombus-alert--info]="variant() === 'info'"
        [class.rhombus-alert--success]="variant() === 'success'"
        [class.rhombus-alert--warning]="variant() === 'warning'"
        [class.rhombus-alert--error]="variant() === 'error'"
      >
        <div class="rhombus-alert__body">
          <span class="rhombus-alert__severity">{{ severityLabel() }}</span>
          @if (title()) {
            <p class="rhombus-alert__title">{{ title() }}</p>
          }
          <div class="rhombus-alert__message"><ng-content></ng-content></div>
        </div>
        @if (dismissible()) {
          <button
            type="button"
            class="rhombus-alert__dismiss"
            aria-label="Dismiss alert"
            (click)="dismiss()"
          >
            &times;
          </button>
        }
      </div>
    }
  `,
})
export class RhombusAlertComponent {
  /** Severity. Defaults to `'info'`. */
  readonly variant = input<AlertVariant>('info');
  /** Optional heading shown above the message. */
  readonly title = input<string>('');
  /** Show a close button. Accepts a bare attribute (`dismissible`). */
  readonly dismissible = input(false, { transform: booleanAttribute });

  /** Emits when the alert is dismissed via its close button. */
  readonly dismissed = output<void>();

  protected readonly closed = signal(false);
  protected readonly severityLabel = computed(
    () => SEVERITY_LABELS[this.variant()]
  );
  /**
   * ARIA live role: `'alert'` (assertive) for error/warning so it interrupts,
   * `'status'` (polite) for info/success so it's announced without interrupting.
   * Without this the banner conveyed severity only visually + via the hidden
   * prefix; assistive tech now announces it when it appears or updates.
   */
  protected readonly role = computed<'alert' | 'status'>(() =>
    this.variant() === 'error' || this.variant() === 'warning'
      ? 'alert'
      : 'status'
  );

  protected dismiss(): void {
    this.closed.set(true);
    this.dismissed.emit();
  }
}
