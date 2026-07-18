import { effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

/** Configuration for {@link mirrorControl}. */
export interface MirrorControlConfig<Ext, Int> {
  /**
   * Signal accessor for the public reactive-forms control (the component's
   * `control` / `rangeControl` input). May be `null` in lightweight mode.
   */
  external: () => AbstractControl | null;
  /** The private control bound to the underlying Material primitive. */
  internal: AbstractControl;
  /** Convert an external value into the internal control's value. */
  toInternal: (value: Ext | null) => Int | null;
  /** Convert an internal value back into the external control's value. */
  toExternal: (value: Int | null) => Ext | null;
  /** Equality used to skip redundant external writes; defaults to `===`. */
  equal?: (a: Ext | null, b: Ext | null) => boolean;
  /** Called with the external-shaped value whenever the user changes the internal control. */
  onExternalChange?: (value: Ext | null) => void;
  /** Lightweight disabled state, applied to the internal control only when no external control is bound. */
  disabled?: () => boolean;
}

/**
 * Bidirectionally mirror a public reactive-forms control to a private control
 * that is bound to a Material primitive, converting values at the boundary.
 *
 * This is the shared machinery behind the form controls whose public value type
 * differs from what Material binds to (e.g. the Date Picker's ISO-string public
 * value over Material's `Date`, or the Slider's `{start,end}` range over two
 * numeric thumbs). It provides:
 *
 * - **internal → external**: on a user change, convert and push to the bound
 *   control (only when the value actually differs) and invoke `onExternalChange`.
 * - **external → internal**: seed from the bound control and follow its value /
 *   disabled changes, re-subscribing when the control instance is swapped.
 * - a `syncing` guard so a programmatic external write never echoes back as a
 *   user change.
 * - an optional lightweight `disabled` mirror used when no control is bound.
 *
 * Must be called from an injection context (a component constructor), because it
 * registers an `effect` and uses `takeUntilDestroyed`.
 */
export function mirrorControl<Ext, Int>(config: MirrorControlConfig<Ext, Int>): void {
  const { external, internal, toInternal, toExternal, onExternalChange } = config;
  const equal = config.equal ?? ((a, b) => a === b);
  let syncing = false;

  const setInternalDisabled = (disabled: boolean): void => {
    const wasSyncing = syncing;
    syncing = true;
    if (disabled && !internal.disabled) {
      internal.disable({ emitEvent: false });
    } else if (!disabled && internal.disabled) {
      internal.enable({ emitEvent: false });
    }
    syncing = wasSyncing;
  };

  const writeInternal = (value: Int | null, disabled: boolean): void => {
    syncing = true;
    internal.setValue(value, { emitEvent: false });
    setInternalDisabled(disabled);
    syncing = false;
  };

  // internal → external: the user changed the underlying control.
  internal.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
    if (syncing) return;
    const extValue = toExternal(value as Int | null);
    const ctrl = external();
    if (ctrl && !equal(ctrl.value as Ext | null, extValue)) {
      ctrl.setValue(extValue);
    }
    onExternalChange?.(extValue);
  });

  // external → internal: seed from the bound control and follow it; re-subscribe
  // when the control instance is swapped.
  effect((onCleanup) => {
    const ctrl = external();
    if (!ctrl) return;
    writeInternal(toInternal(ctrl.value as Ext | null), ctrl.disabled);
    const valueSub = ctrl.valueChanges.subscribe((v) =>
      writeInternal(toInternal(v as Ext | null), ctrl.disabled)
    );
    const statusSub = ctrl.statusChanges.subscribe(() =>
      setInternalDisabled(ctrl.disabled)
    );
    onCleanup(() => {
      valueSub.unsubscribe();
      statusSub.unsubscribe();
    });
  });

  // Lightweight mode (no control): mirror the standalone disabled signal.
  if (config.disabled) {
    const disabledSignal = config.disabled;
    effect(() => {
      if (external()) return;
      setInternalDisabled(disabledSignal());
    });
  }
}
