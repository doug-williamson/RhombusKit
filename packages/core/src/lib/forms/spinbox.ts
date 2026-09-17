import {
  effect,
  ModelSignal,
  OutputEmitterRef,
  Signal,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { mirrorControl } from './mirror-control';

/** Configuration for {@link createSpinbox} — the component's own signal inputs, passed as accessors. */
export interface SpinboxConfig {
  /** The public reactive-forms control input; `null` in lightweight mode. */
  control: () => FormControl<number | null> | null;
  /** The public `value` model (lightweight mode). */
  value: ModelSignal<number | null>;
  /** The public `disabled` input; ignored once a control is bound. */
  disabled: () => boolean;
  min: () => number | null;
  max: () => number | null;
  /** Increment for the ± buttons and the arrow keys. */
  step: () => number;
  /** Increment for PageUp / PageDown; `null` means `step * 10`. */
  largeStep: () => number | null;
  /** The public `valueChange` output (lightweight mode). */
  valueChange: OutputEmitterRef<number | null>;
}

/** What {@link createSpinbox} hands back for the component's template to bind. */
export interface Spinbox {
  /** The private control bound to the `<input type="number">`. */
  readonly internal: FormControl<number | null>;
  /** Disabled state for the ± buttons (the mirror disables the input silently). */
  readonly fieldDisabled: Signal<boolean>;
  increment(): void;
  decrement(): void;
  /** Arrow ±step · PageUp/PageDown ±largeStep · Home/End → bounds. */
  onKeydown(event: KeyboardEvent): void;
  /** Clamp the typed value into range; an empty field stays `null`. */
  onBlur(): void;
}

/**
 * The shared numeric core behind every RhombusKit spinbox (`rhombus-number-input`,
 * `rhombus-quantity-input`). One owner for the behaviour the two components must
 * keep identical:
 *
 * - `[control]` / `[(value)]` mirrored onto one private `FormControl` via
 *   {@link mirrorControl} (identity mapping), plus the lightweight value seed;
 * - disabled tracking for the ± buttons — the lightweight input, or the bound
 *   control's status (re-subscribing when the instance swaps);
 * - step / clamp / commit, `largeStep ?? step * 10`, the keyboard map, and
 *   clamp-on-blur (never per keystroke).
 *
 * Must be called from an injection context (a component field initializer or
 * constructor): it registers `effect`s and `mirrorControl` uses `takeUntilDestroyed`.
 */
export function createSpinbox(config: SpinboxConfig): Spinbox {
  const { control, value, disabled, min, max, step, largeStep, valueChange } = config;
  const internal = new FormControl<number | null>(null);
  const fieldDisabled = signal(false);

  const clamp = (input: number): number => {
    const lo = min();
    const hi = max();
    let result = input;
    if (lo != null) result = Math.max(lo, result);
    if (hi != null) result = Math.min(hi, result);
    return result;
  };

  const commit = (next: number): void => {
    if (internal.value !== next) {
      internal.setValue(next);
    }
  };

  const stepBy = (delta: number): void => {
    const current = internal.value;
    const base = current == null ? (min() ?? 0) : current + delta;
    commit(clamp(base));
  };

  const toBound = (bound: number | null): void => {
    if (bound != null) {
      commit(bound);
    }
  };

  const largeStepValue = (): number => largeStep() ?? step() * 10;

  mirrorControl<number, number>({
    external: control,
    internal,
    toInternal: (v) => v,
    toExternal: (v) => v,
    onExternalChange: (v) => {
      // In control mode the bound control is the source of truth (the mirror
      // already wrote to it); value / valueChange belong to lightweight mode.
      if (control()) return;
      value.set(v);
      valueChange.emit(v);
    },
    disabled,
  });

  // Seed the internal control from the lightweight value model (the mirror only
  // seeds from a bound control). Silent write — no echo back through the emit.
  effect(() => {
    if (control()) return;
    const v = value();
    if (internal.value !== v) {
      internal.setValue(v, { emitEvent: false });
    }
  });

  // Track disabled for the ± buttons: the lightweight input, or the bound
  // control's status (re-subscribing when its instance swaps).
  effect((onCleanup) => {
    const ctrl = control();
    if (!ctrl) {
      fieldDisabled.set(disabled());
      return;
    }
    fieldDisabled.set(ctrl.disabled);
    const sub = ctrl.statusChanges.subscribe(() => fieldDisabled.set(ctrl.disabled));
    onCleanup(() => sub.unsubscribe());
  });

  return {
    internal,
    fieldDisabled: fieldDisabled.asReadonly(),
    increment: () => stepBy(step()),
    decrement: () => stepBy(-step()),
    onKeydown: (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          stepBy(step());
          break;
        case 'ArrowDown':
          event.preventDefault();
          stepBy(-step());
          break;
        case 'PageUp':
          event.preventDefault();
          stepBy(largeStepValue());
          break;
        case 'PageDown':
          event.preventDefault();
          stepBy(-largeStepValue());
          break;
        case 'Home':
          event.preventDefault();
          toBound(min());
          break;
        case 'End':
          event.preventDefault();
          toBound(max());
          break;
      }
    },
    onBlur: (): void => {
      const current = internal.value;
      if (current != null) {
        commit(clamp(current));
      }
    },
  };
}
