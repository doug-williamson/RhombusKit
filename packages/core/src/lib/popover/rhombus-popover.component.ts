// packages/core/src/lib/popover/rhombus-popover.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

/** Preferred placement of the panel relative to its trigger. */
export type RhombusPopoverPosition =
  | 'below-start'
  | 'below-end'
  | 'above-start'
  | 'above-end'
  | 'auto';

/**
 * Handle a trigger registers so projected content can close the panel.
 *
 * Not re-exported from the package barrel — an internal cross-file contract
 * between the popover panel and its trigger directive. Deliberately left
 * un-tagged so `stripInternal` keeps its declaration in the emitted `.d.ts`
 * (the trigger directive's declaration imports it); it never reaches the
 * public surface, since the barrel does not export it.
 */
export interface RhombusPopoverTriggerHandle {
  close(): void;
}

/**
 * `<rhombus-popover>` — a CDK-Overlay panel that hosts arbitrary projected
 * content, attached to a trigger via `[rhombusPopoverTriggerFor]`. Focus-trapped,
 * dismissed on `Escape` / outside click, themed through the contract tokens.
 */
@Component({
  selector: 'rhombus-popover',
  standalone: true,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-popover.component.scss',
  template: `
    <ng-template>
      <div
        class="rhombus-popover__panel"
        role="dialog"
        [attr.aria-label]="ariaLabel() || null"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class RhombusPopoverComponent {
  /** Preferred placement; flips to the opposite side when there is no room. */
  readonly position = input<RhombusPopoverPosition>('below-start');
  /** Gap (px) between the trigger and the panel. */
  readonly offset = input<number>(8);
  /** Panel width: a px number, `'trigger'` (match the trigger), or `'auto'`. */
  readonly panelWidth = input<number | 'trigger' | 'auto'>('auto');
  /** Accessible name for the dialog panel. */
  readonly ariaLabel = input<string>();
  /** Emitted after the panel opens. */
  readonly opened = output<void>();
  /** Emitted after the panel closes. */
  readonly closed = output<void>();

  private readonly template = viewChild.required(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private trigger?: RhombusPopoverTriggerHandle;

  /** @internal Called by the trigger so {@link close} can delegate to it. */
  attachTrigger(trigger: RhombusPopoverTriggerHandle): void {
    this.trigger = trigger;
  }

  /** @internal Builds the portal the trigger attaches to the overlay. */
  createPortal(): TemplatePortal {
    return new TemplatePortal(this.template(), this.viewContainerRef);
  }

  /** @internal Connected positions derived from {@link position} + {@link offset}. */
  connectedPositions(): ConnectedPosition[] {
    const o = this.offset();
    const map: Record<
      Exclude<RhombusPopoverPosition, 'auto'>,
      ConnectedPosition
    > = {
      'below-start': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: o },
      'below-end': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: o },
      'above-start': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -o },
      'above-end': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -o },
    };
    const fallback: Record<Exclude<RhombusPopoverPosition, 'auto'>, ConnectedPosition> = {
      'below-start': map['above-start'],
      'below-end': map['above-end'],
      'above-start': map['below-start'],
      'above-end': map['below-end'],
    };
    const pos = this.position();
    if (pos === 'auto') {
      return [map['below-start'], map['below-end'], map['above-start'], map['above-end']];
    }
    return [map[pos], fallback[pos]];
  }

  /** Close the popover from projected content (e.g. after a selection). */
  close(): void {
    this.trigger?.close();
  }
}
