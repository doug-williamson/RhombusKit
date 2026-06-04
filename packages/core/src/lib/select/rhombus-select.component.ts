import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup<T = string> {
  groupLabel: string;
  options: SelectOption<T>[];
}

/**
 * `<rhombus-select>` — wrapper over `<mat-form-field>` + `<mat-select>`.
 * Generic over the option value type T. The component owns the
 * `<mat-select>`; reactive-forms consumers pass a FormControl via
 * `control`. No ControlValueAccessor.
 *
 * Pass either `options` (flat) OR `groups` (grouped). If both are
 * supplied, `groups` wins.
 */
@Component({
  selector: 'rhombus-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-select.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      @if (control(); as ctrl) {
        <mat-select
          [formControl]="ctrl"
          [placeholder]="placeholder()"
          [required]="required()"
          [multiple]="multiple()"
          panelClass="rhombus-select-panel"
          (selectionChange)="selectionChange.emit($event.value)"
        >
          @if (groups().length > 0) {
            @for (group of groups(); track group.groupLabel) {
              <mat-optgroup [label]="group.groupLabel">
                @for (opt of group.options; track opt.value) {
                  <mat-option [value]="opt.value" [disabled]="opt.disabled ?? false">
                    {{ opt.label }}
                  </mat-option>
                }
              </mat-optgroup>
            }
          } @else {
            @for (opt of options(); track opt.value) {
              <mat-option [value]="opt.value" [disabled]="opt.disabled ?? false">
                {{ opt.label }}
              </mat-option>
            }
          }
        </mat-select>
      } @else {
        <mat-select
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [multiple]="multiple()"
          panelClass="rhombus-select-panel"
          (selectionChange)="selectionChange.emit($event.value)"
        >
          @if (groups().length > 0) {
            @for (group of groups(); track group.groupLabel) {
              <mat-optgroup [label]="group.groupLabel">
                @for (opt of group.options; track opt.value) {
                  <mat-option [value]="opt.value" [disabled]="opt.disabled ?? false">
                    {{ opt.label }}
                  </mat-option>
                }
              </mat-optgroup>
            }
          } @else {
            @for (opt of options(); track opt.value) {
              <mat-option [value]="opt.value" [disabled]="opt.disabled ?? false">
                {{ opt.label }}
              </mat-option>
            }
          }
        </mat-select>
      }

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusSelectComponent<T = string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly appearance = input<FormFieldAppearance>('outline');
  readonly size = input<FormFieldSize>('md');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly multiple = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly options = input<SelectOption<T>[]>([]);
  readonly groups = input<SelectOptionGroup<T>[]>([]);
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  readonly control = input<FormControl | null>(null);

  readonly selectionChange = output<T | T[]>();

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );
}
