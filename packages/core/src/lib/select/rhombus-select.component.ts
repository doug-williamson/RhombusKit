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
  /** Floating `<mat-label>` text; empty (default) for no label. */
  readonly label = input<string>('');
  /** Placeholder shown when no option is selected. */
  readonly placeholder = input<string>('');
  /** Form-field appearance, mapped to Material's `outline` (default) or `fill`. */
  readonly appearance = input<FormFieldAppearance>('outline');
  /** Density scale applied via host classes; defaults to `md`. */
  readonly size = input<FormFieldSize>('md');
  /** Disables the select in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the select required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Allows selecting multiple options when `true`. Defaults to `false`. */
  readonly multiple = input<boolean>(false);
  /** Subscript hint text shown below the field; `null` (default) hides the hint. */
  readonly hint = input<string | null>(null);
  /** Flat list of options to render; ignored when `groups` is non-empty. Defaults to `[]`. */
  readonly options = input<SelectOption<T>[]>([]);
  /** Grouped options (`{ groupLabel, options }`); takes precedence over `options`. Defaults to `[]`. */
  readonly groups = input<SelectOptionGroup<T>[]>([]);
  /** Whether subscript space is reserved (`fixed`) or collapses (`dynamic`, default). */
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  /** Reactive-forms `FormControl`; when set, the standalone `disabled` input is ignored. */
  readonly control = input<FormControl | null>(null);

  /** Emits the selected value (or array of values when `multiple`) whenever the user changes selection. */
  readonly selectionChange = output<T | T[]>();

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );
}
