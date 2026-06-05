import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
 * `<rhombus-checkbox>` — wrapper over `<mat-checkbox>`.
 *
 * Two usage modes, mirroring the other RhombusKit form controls:
 *   • reactive forms — pass a `FormControl<boolean>` via `[control]`
 *   • lightweight    — `[(checked)]` (or `[checked]` + `(checkedChange)`)
 *
 * No ControlValueAccessor is implemented (an explicit `control` input sidesteps
 * the CVA lifecycle, as on `<rhombus-input>` / `<rhombus-select>`).
 *
 * ```html
 * <rhombus-checkbox label="Remember me" [control]="rememberCtrl" />
 * <rhombus-checkbox label="Select all" [(checked)]="allSelected" />
 * ```
 */
@Component({
  selector: 'rhombus-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule, MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-checkbox.component.scss',
  template: `
    @if (control(); as ctrl) {
      <mat-checkbox
        class="rhombus-checkbox"
        [formControl]="ctrl"
        [required]="required()"
        [labelPosition]="labelPosition()"
        >{{ label() }}</mat-checkbox
      >
    } @else {
      <mat-checkbox
        class="rhombus-checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        [required]="required()"
        [labelPosition]="labelPosition()"
        (change)="checkedChange.emit($event.checked)"
        >{{ label() }}</mat-checkbox
      >
    }
  `,
})
export class RhombusCheckboxComponent {
  /** Text rendered beside the checkbox; empty (default) for no label. */
  readonly label = input<string>('');
  /** Checked state in lightweight (`[(checked)]`) mode; ignored when `control` is set. Defaults to `false`. */
  readonly checked = input<boolean>(false);
  /** Disables the checkbox in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the checkbox required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Whether the label sits `before` or `after` (default) the checkbox. */
  readonly labelPosition = input<'before' | 'after'>('after');
  /** Reactive-forms `FormControl<boolean>`; when set, the standalone `checked`/`disabled` inputs are ignored. */
  readonly control = input<FormControl<boolean> | null>(null);

  /** Emits the new checked state when the user toggles the checkbox (lightweight mode only). */
  readonly checkedChange = output<boolean>();
}
