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
  readonly label = input<string>('');
  readonly checked = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly control = input<FormControl<boolean> | null>(null);

  readonly checkedChange = output<boolean>();
}
