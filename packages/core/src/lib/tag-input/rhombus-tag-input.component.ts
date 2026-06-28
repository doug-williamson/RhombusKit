import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  ChipVariant,
  RhombusChipDirective,
} from '../chip/rhombus-chip.directive';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';

/**
 * `<rhombus-tag-input>` — a first-class, editable **tag input** bound to a
 * `string[]`: type a value and press Enter (or a separator key) to add a chip,
 * click its `×` to remove it. Wraps `<mat-form-field>` + `<mat-chip-grid>` +
 * `matChipInput`, so it gains the form-field chrome (floating label, hint, error
 * subscript) of the other RhombusKit form primitives, and each chip is themed by
 * the same `[rhombusChip]` bridge as the selectable Chip.
 *
 * This is the editor counterpart to the selection-oriented `[rhombusChipGroup]`
 * (which decorates `<mat-chip-listbox>`): reach for the tag input when the user
 * *authors* a free-text list (labels, recipients, keywords) rather than picking
 * from a fixed set. It owns the add-on-enter / separator-key / removable-chip
 * plumbing so consumers never touch Material's chip-grid internals.
 *
 * Two usage modes, mirroring the other RhombusKit form controls:
 *   • reactive forms — pass a `FormControl<string[]>` via `[control]`
 *   • lightweight    — `[(tags)]` (or `[tags]` + `(tagsChange)`)
 *
 * No ControlValueAccessor is implemented (an explicit `control` input sidesteps
 * the CVA lifecycle, as on `<rhombus-input>` / `<rhombus-select>`). The component
 * renders the chips itself from the active value source — `MatChipGrid` never
 * holds the array — so the `[control]` binding carries only disabled / error /
 * touched state through to the form field.
 *
 * ```html
 * <rhombus-tag-input label="Tags" [(tags)]="keywords" />
 * <rhombus-tag-input label="Recipients" [control]="recipientsCtrl" variant="primary" />
 * ```
 *
 * Projected slot (found by Material's descendants:true query):
 *   <span rhombusError>…</span>            error subscript text
 */
@Component({
  selector: 'rhombus-tag-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    RhombusChipDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-tag-input.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      <mat-chip-grid
        #grid
        [formControl]="gridControl()"
        [required]="required()"
        [attr.aria-label]="ariaLabel() || label() || 'Tags'"
      >
        @for (tag of tagList(); track tag) {
          <mat-chip-row
            rhombusChip
            [value]="tag"
            [variant]="variant()"
            [removable]="!disabledState()"
            (removed)="removeTag($index)"
          >
            <span class="rhombus-tag-input__label">{{ tag }}</span>
            @if (!disabledState()) {
              <button
                matChipRemove
                type="button"
                class="rhombus-tag-input__remove"
                [attr.aria-label]="'Remove ' + tag"
              >
                <mat-icon>cancel</mat-icon>
              </button>
            }
          </mat-chip-row>
        }
      </mat-chip-grid>
      <!-- The text field lives OUTSIDE the chip grid: an <input> is not a valid
           child of role="grid", so nesting it trips axe's aria-required-children.
           matChipInputFor wires it to the grid by id regardless of DOM position. -->
      <input
        [placeholder]="placeholder()"
        [matChipInputFor]="grid"
        [matChipInputSeparatorKeyCodes]="separatorKeyCodes()"
        [matChipInputAddOnBlur]="addOnBlur()"
        (matChipInputTokenEnd)="addTag($event)"
      />

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusTagInputComponent {
  /** Floating `<mat-label>` text; empty (default) for no label. */
  readonly label = input<string>('');
  /** Placeholder shown in the text field when empty. Defaults to `''`. */
  readonly placeholder = input<string>('');
  /** Form-field appearance, mapped to Material's `outline` (default) or `fill`. */
  readonly appearance = input<FormFieldAppearance>('outline');
  /** Density scale applied via host classes; defaults to `md`. */
  readonly size = input<FormFieldSize>('md');
  /** Disables the field in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the field required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Subscript hint text shown below the field; `null` (default) hides the hint. */
  readonly hint = input<string | null>(null);
  /** Whether subscript space is reserved (`fixed`) or collapses (`dynamic`, default). */
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  /** Chip colour role applied to every tag via `[rhombusChip]`; defaults to `default`. */
  readonly variant = input<ChipVariant>('default');
  /**
   * Accessible name for the chip grid. Falls back to `label`, then `'Tags'`.
   * `null` (default) defers to that fallback.
   */
  readonly ariaLabel = input<string | null>(null);
  /** Optional cap on the number of tags; further additions are ignored. `null` (default) is unlimited. */
  readonly maxTags = input<number | null>(null);
  /** Commit the pending text as a tag when the field loses focus. Defaults to `false`. */
  readonly addOnBlur = input<boolean>(false);
  /** Key codes that commit the pending text (Material `matChipInputSeparatorKeyCodes`). Defaults to Enter + comma. */
  readonly separatorKeyCodes = input<number[]>([ENTER, COMMA]);

  /** Tags in lightweight (`[(tags)]`) mode; ignored when `control` is set. Defaults to `[]`. */
  readonly tags = input<string[]>([]);
  /** Reactive-forms `FormControl<string[]>`; when set, the standalone `tags`/`disabled` inputs are ignored. */
  readonly control = input<FormControl<string[]> | null>(null);

  /** Emits the new tag array whenever a tag is added or removed (lightweight mode). */
  readonly tagsChange = output<string[]>();

  /** Carries lightweight disabled state and a valid NgControl to the chip grid. */
  private readonly fallbackControl = new FormControl<string[]>([], {
    nonNullable: true,
  });

  /** The list actually rendered as chips — mirrors the active value source. */
  protected readonly tagList = signal<string[]>([]);

  /** The control bound to the grid: the consumer's, else the internal fallback. */
  protected readonly gridControl = computed(
    () => this.control() ?? this.fallbackControl,
  );

  /** Effective disabled state (the consumer's control wins when present). */
  protected readonly disabledState = computed(() => {
    const ctrl = this.control();
    return ctrl ? ctrl.disabled : this.disabled();
  });

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      'rhombus-tag-input',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' '),
  );

  constructor() {
    // Mirror whichever value source is active into the rendered chip list:
    // the reactive control's value (tracking later external setValue calls), or
    // the lightweight `tags` input.
    effect((onCleanup) => {
      const ctrl = this.control();
      if (ctrl) {
        this.tagList.set(ctrl.value ?? []);
        const sub = ctrl.valueChanges.subscribe((value) =>
          this.tagList.set(value ?? []),
        );
        onCleanup(() => sub.unsubscribe());
      } else {
        this.tagList.set(this.tags());
      }
    });

    // In lightweight mode the disabled state rides the fallback control bound to
    // the grid (so the grid + text input disable together).
    effect(() => {
      const disabled = this.disabled();
      if (this.control()) return; // the consumer's control owns its disabled state
      if (disabled) this.fallbackControl.disable({ emitEvent: false });
      else this.fallbackControl.enable({ emitEvent: false });
    });
  }

  /** Commit the pending text as a new tag (trimmed; de-duplicated; capped). */
  protected addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    event.chipInput?.clear();
    if (!value || this.disabledState()) return;

    const current = this.tagList();
    if (current.includes(value)) return; // tags are a set — ignore duplicates
    const max = this.maxTags();
    if (max != null && current.length >= max) return;

    this.commit([...current, value]);
  }

  /** Remove the tag at `index`. */
  protected removeTag(index: number): void {
    if (this.disabledState()) return;
    const current = this.tagList();
    if (index < 0 || index >= current.length) return;
    const next = current.slice();
    next.splice(index, 1);
    this.commit(next);
  }

  /** Push the next tag array to the active sink (reactive control or output). */
  private commit(next: string[]): void {
    const ctrl = this.control();
    if (ctrl) {
      ctrl.setValue(next);
      ctrl.markAsDirty();
      ctrl.markAsTouched();
    } else {
      this.tagList.set(next);
      this.tagsChange.emit(next);
    }
  }
}
