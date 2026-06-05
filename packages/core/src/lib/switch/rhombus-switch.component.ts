import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

/**
 * `<rhombus-switch>` — wrapper over `<mat-slide-toggle>`. Same control model as
 * `<rhombus-checkbox>`: `[control]` for reactive forms, `[(checked)]` otherwise.
 * No ControlValueAccessor.
 *
 * The track colour is driven by the `--switch-track-on` / `--switch-track-off`
 * contract tokens (see the component SCSS), so a toggle reads as a toggle rather
 * than borrowing button colours.
 *
 * ```html
 * <rhombus-switch label="Email notifications" [(checked)]="notify" />
 * ```
 */
@Component({
  selector: 'rhombus-switch',
  standalone: true,
  imports: [ReactiveFormsModule, MatSlideToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-switch.component.scss',
  template: `
    @if (control(); as ctrl) {
      <mat-slide-toggle
        class="rhombus-switch"
        [formControl]="ctrl"
        [required]="required()"
        [labelPosition]="labelPosition()"
        >{{ label() }}</mat-slide-toggle
      >
    } @else {
      <mat-slide-toggle
        class="rhombus-switch"
        [checked]="checked()"
        [disabled]="disabled()"
        [required]="required()"
        [labelPosition]="labelPosition()"
        (change)="checkedChange.emit($event.checked)"
        >{{ label() }}</mat-slide-toggle
      >
    }
  `,
})
export class RhombusSwitchComponent {
  /** Text rendered beside the toggle; empty (default) for no label. */
  readonly label = input<string>('');
  /** On/off state in lightweight (`[(checked)]`) mode; ignored when `control` is set. Defaults to `false`. */
  readonly checked = input<boolean>(false);
  /** Disables the toggle in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the toggle required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Whether the label sits `before` or `after` (default) the toggle. */
  readonly labelPosition = input<'before' | 'after'>('after');
  /** Reactive-forms `FormControl<boolean>`; when set, the standalone `checked`/`disabled` inputs are ignored. */
  readonly control = input<FormControl<boolean> | null>(null);

  /** Emits the new on/off state when the user toggles the switch (lightweight mode only). */
  readonly checkedChange = output<boolean>();
}
