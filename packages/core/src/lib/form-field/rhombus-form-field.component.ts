import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

export type FormFieldAppearance = 'outline' | 'fill';
export type FormFieldSize = 'sm' | 'md' | 'lg';

/**
 * `<rhombus-form-field>` — internal shared shell for the RhombusKit form
 * primitives (input, textarea, select). Not exported from
 * `@rhombuskit/core`. Centralises the `<mat-form-field>` wrapper, slot
 * projection, size variants, and CONTRACT-driven token bindings so the
 * three public components stay thin.
 *
 * Slot contract (set on a child element):
 *   [slot=label]   → <mat-label>
 *   [matPrefix]    → matPrefix (passes through)
 *   default        → control (input / textarea / mat-select)
 *   [matSuffix]    → matSuffix (passes through)
 *   [slot=hint]    → <mat-hint>
 *   [slot=error]   → <mat-error>
 */
@Component({
  selector: 'rhombus-form-field',
  standalone: true,
  imports: [MatFormFieldModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-form-field.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>
        <ng-content select="[slot=label]" />
      </mat-label>

      <ng-content select="[matPrefix]" />

      <ng-content />

      <ng-content select="[matSuffix]" />

      <mat-hint>
        <ng-content select="[slot=hint]" />
      </mat-hint>

      <mat-error>
        <ng-content select="[slot=error]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusFormFieldComponent {
  readonly appearance = input<FormFieldAppearance>('outline');
  readonly size = input<FormFieldSize>('md');
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );
}
