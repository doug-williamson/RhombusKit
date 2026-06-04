import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusMenuComponent } from '../menu/rhombus-menu.component';
import type { OverflowMenuItem } from './overflow-menu.types';

/**
 * `<rhombus-overflow-menu>` — the icon-button preset of `<rhombus-menu>`: a
 * "⋯" trigger that opens an `items`-driven action menu. Each
 * {@link OverflowMenuItem} carries its own `action` callback (dispatch is
 * co-located with the item; no `(itemClick)` output).
 *
 * ```html
 * <rhombus-overflow-menu [items]="rowActions" ariaLabel="Row actions" />
 * ```
 */
@Component({
  selector: 'rhombus-overflow-menu',
  standalone: true,
  imports: [RhombusMenuComponent, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <rhombus-menu [items]="items()" [iconButton]="true" [ariaLabel]="ariaLabel()">
      <rhombus-icon [name]="triggerIcon()" />
    </rhombus-menu>
  `,
})
export class RhombusOverflowMenuComponent {
  /** The menu entries. */
  readonly items = input.required<OverflowMenuItem[]>();
  /** Trigger icon name. Defaults to `'more_vert'`. */
  readonly triggerIcon = input<string>('more_vert');
  /** Accessible label for the icon-only trigger. Defaults to `'More actions'`. */
  readonly ariaLabel = input<string>('More actions');
}
