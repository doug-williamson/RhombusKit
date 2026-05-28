import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {
  FormFieldAppearance,
  FormFieldSize,
  RhombusFormFieldComponent,
} from '../form-field/rhombus-form-field.component';

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
 * `<rhombus-select>` — presentational wrapper over `<mat-form-field>` +
 * `<mat-select>`. Generic over the option value type T. Consumers attach
 * `[formControl]` / `[(ngModel)]` directly to the projected mat-select if
 * they need form integration (the wrapper passes through implicitly via
 * the directive being on the consumer's binding).
 *
 * Pass either `options` (flat) OR `groups` (grouped). If both are
 * supplied, `groups` wins.
 */
@Component({
  selector: 'rhombus-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatSelectModule, RhombusFormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-select.component.scss',
  template: `
    <rhombus-form-field
      [appearance]="appearance()"
      [size]="size()"
      [subscriptSizing]="subscriptSizing()"
    >
      <span slot="label">{{ label() }}</span>

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
                <mat-option
                  [value]="opt.value"
                  [disabled]="opt.disabled ?? false"
                >
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

      @if (hint()) {
        <span slot="hint">{{ hint() }}</span>
      }

      <ng-content select="[slot=error]" ngProjectAs="[slot=error]" />
    </rhombus-form-field>
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

  readonly selectionChange = output<T | T[]>();
}
