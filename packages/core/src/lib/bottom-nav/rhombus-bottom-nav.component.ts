// packages/core/src/lib/bottom-nav/rhombus-bottom-nav.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusBadgeDirective } from '../badge/rhombus-badge.directive';

/** A single bottom-navigation destination. */
export interface RhombusBottomNavItem {
  /** Stable key; the value emitted by `activeChange` and matched by `activeId`. */
  id: string;
  /** Visible text and the item's accessible name. */
  label: string;
  /** RhombusIcon glyph name (falls back to a Material icon). */
  icon: string;
  /** `routerLink` target. Omit for controlled (non-router) usage. */
  routerLink?: string | unknown[];
  /** Optional notification badge — a count, or `'dot'` for a marker. */
  badge?: number | 'dot';
  /** Renders the item inert. */
  disabled?: boolean;
}

/** Active-item treatment: plain recolour (`'color'`) or an M3 pill (`'pill'`). */
export type BottomNavIndicator = 'color' | 'pill';

/**
 * `<rhombus-bottom-nav>` — a Material-style bottom navigation bar. Router items
 * (with `routerLink`) self-highlight via `routerLinkActive`; controlled items
 * highlight when `activeId` matches. Bespoke markup; colours via contract tokens.
 */
@Component({
  selector: 'rhombus-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RhombusIconComponent, RhombusBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-bottom-nav.component.scss',
  template: `
    <nav
      class="rhombus-bottom-nav"
      [attr.aria-label]="ariaLabel()"
      [attr.data-indicator]="indicator()"
    >
      <ul class="rhombus-bottom-nav__list">
        @for (item of items(); track item.id) {
          <li class="rhombus-bottom-nav__cell">
            @if (item.routerLink != null) {
              <a
                class="rhombus-bottom-nav__item"
                [class.rhombus-bottom-nav__item--disabled]="item.disabled"
                [routerLink]="item.routerLink"
                routerLinkActive="rhombus-bottom-nav__item--active"
                #rla="routerLinkActive"
                [attr.aria-current]="rla.isActive ? 'page' : null"
                [attr.aria-disabled]="item.disabled ? 'true' : null"
                (click)="select(item)"
              >
                <rhombus-icon
                  class="rhombus-bottom-nav__icon"
                  [name]="item.icon"
                  [rhombusBadge]="item.badge === 'dot' ? '' : (item.badge ?? null)"
                  [rhombusBadgeHidden]="item.badge == null"
                  rhombusBadgeSize="small"
                />
                <span class="rhombus-bottom-nav__label">{{ item.label }}</span>
              </a>
            } @else {
              <button
                type="button"
                class="rhombus-bottom-nav__item"
                [class.rhombus-bottom-nav__item--active]="activeId() === item.id"
                [attr.aria-current]="activeId() === item.id ? 'page' : null"
                [disabled]="item.disabled"
                (click)="select(item)"
              >
                <rhombus-icon
                  class="rhombus-bottom-nav__icon"
                  [name]="item.icon"
                  [rhombusBadge]="item.badge === 'dot' ? '' : (item.badge ?? null)"
                  [rhombusBadgeHidden]="item.badge == null"
                  rhombusBadgeSize="small"
                />
                <span class="rhombus-bottom-nav__label">{{ item.label }}</span>
              </button>
            }
          </li>
        }
      </ul>
    </nav>
  `,
})
export class RhombusBottomNavComponent {
  /** Destinations, left to right. */
  readonly items = input.required<RhombusBottomNavItem[]>();
  /** Controlled active id (used when items have no `routerLink`). */
  readonly activeId = input<string>();
  /** Active-indicator treatment. Defaults to `'color'`. */
  readonly indicator = input<BottomNavIndicator>('color');
  /** Accessible label for the nav landmark. Defaults to `'Primary'`. */
  readonly ariaLabel = input<string>('Primary');
  /** Emits the selected item id. */
  readonly activeChange = output<string>();

  protected select(item: RhombusBottomNavItem): void {
    if (item.disabled) return;
    this.activeChange.emit(item.id);
  }
}
