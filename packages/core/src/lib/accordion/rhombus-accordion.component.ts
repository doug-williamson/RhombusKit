import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  contentChildren,
  effect,
  input,
} from '@angular/core';
import { RhombusAccordionPanelComponent } from './rhombus-accordion-panel.component';

/** Arrow-key roving keys handled at the accordion level (WAI-ARIA APG). */
const ROVING_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

/**
 * `<rhombus-accordion>` — a vertical stack of collapsible
 * `<rhombus-accordion-panel>`s. Hand-rolled (native `<button>` headers +
 * `role="region"` bodies), so it carries no `--mat-sys-*` and needs no
 * `::ng-deep` to theme — everything routes through the @rhombuskit/tokens
 * contract.
 *
 * - `multi` controls single- vs multi-expand. In single mode (default), opening
 *   one panel collapses the others; in `multi` mode panels are independent.
 * - Keyboard (APG Accordion): the panel headers are native buttons (Enter/Space
 *   toggle); the accordion adds Arrow Up/Down to move focus between headers and
 *   Home/End to jump to the first/last.
 *
 * ```html
 * <rhombus-accordion>
 *   <rhombus-accordion-panel title="Shipping" [expanded]="true">…</rhombus-accordion-panel>
 *   <rhombus-accordion-panel title="Returns">…</rhombus-accordion-panel>
 * </rhombus-accordion>
 * ```
 */
@Component({
  selector: 'rhombus-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-accordion.component.scss',
  host: {
    class: 'rhombus-accordion',
    '(keydown)': 'onKeydown($event)',
  },
  template: `<ng-content />`,
})
export class RhombusAccordionComponent {
  /** Allow multiple panels open at once; otherwise opening one closes the rest. */
  readonly multi = input(false, { transform: booleanAttribute });

  protected readonly panels = contentChildren(RhombusAccordionPanelComponent);

  /** Panels open at the end of the previous reconcile — lets us spot the one just opened. */
  private prevOpen = new WeakSet<RhombusAccordionPanelComponent>();

  constructor() {
    // Single-expand: when more than one panel is open, keep the one the user
    // just opened (or the first, on initial over-configuration) and close the
    // rest. Reading each expanded() makes this reactive; the writes settle on
    // the next run (openNow drops to one).
    effect(() => {
      const panels = this.panels();
      const openNow = panels.filter((p) => p.expanded());
      if (!this.multi() && openNow.length > 1) {
        const justOpened = openNow.filter((p) => !this.prevOpen.has(p));
        const keep = justOpened[0] ?? openNow[0];
        for (const panel of openNow) {
          if (panel !== keep) panel.expanded.set(false);
        }
      }
      this.prevOpen = new WeakSet(panels.filter((p) => p.expanded()));
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!ROVING_KEYS.includes(event.key)) return;
    const panels = this.panels();
    const index = panels.findIndex(
      (p) => p.headerElement() === event.target
    );
    if (index === -1) return; // a keydown inside panel content, not on a header

    event.preventDefault();
    const last = panels.length - 1;
    let next = index;
    switch (event.key) {
      case 'ArrowDown':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowUp':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
    }
    panels[next].focusHeader();
  }
}
