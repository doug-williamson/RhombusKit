import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import type { MenuItem } from './menu.types';

/**
 * `<rhombus-menu>` — a MatMenu wrapper driven by an `items` array. Each
 * `MenuItem` is either a command (its own `action` callback) or a navigation
 * link (`routerLink` / `href`, rendered as a real `<a mat-menu-item>`); dispatch
 * or navigation is co-located with the item (there is no `(itemClick)` output).
 * The trigger is whatever you project as content; pass `[iconButton]="true"` for
 * the round icon-button treatment. The panel renders in the CDK overlay and is
 * themed under `.cdk-overlay-container`.
 *
 * `<rhombus-overflow-menu>` is the icon-button preset of this component.
 *
 * ```html
 * <rhombus-menu [items]="actions" ariaLabel="Row actions">
 *   <span>Actions</span>
 * </rhombus-menu>
 * ```
 */
@Component({
  selector: 'rhombus-menu',
  standalone: true,
  imports: [MatMenuModule, MatIconModule, MatDividerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-menu.component.scss',
  template: `
    <button
      type="button"
      class="rhombus-menu__trigger"
      [class.rhombus-menu__trigger--icon]="iconButton()"
      [matMenuTriggerFor]="menu"
      [attr.aria-label]="ariaLabel() || null"
      (click)="$event.stopPropagation()"
    >
      <ng-content></ng-content>
    </button>

    <mat-menu #menu="matMenu" class="rhombus-menu__panel">
      @for (item of items(); track item.label; let i = $index) {
        @if (i > 0 && item.dividerBefore) {
          <mat-divider />
        }
        @if (item.routerLink != null) {
          <a
            mat-menu-item
            [disabled]="item.disabled ?? false"
            [class]="
              'rhombus-menu__item rhombus-menu__item--' + (item.variant ?? 'default')
            "
            [routerLink]="item.disabled ? null : item.routerLink"
            [attr.target]="item.target"
            [attr.rel]="item.rel"
            (click)="item.action?.()"
          >
            @if (item.icon) {
              <mat-icon>{{ item.icon }}</mat-icon>
            }
            <span>{{ item.label }}</span>
          </a>
        } @else if (item.href != null) {
          <a
            mat-menu-item
            [disabled]="item.disabled ?? false"
            [class]="
              'rhombus-menu__item rhombus-menu__item--' + (item.variant ?? 'default')
            "
            [attr.href]="item.disabled ? null : item.href"
            [attr.target]="item.target"
            [attr.rel]="item.rel"
            (click)="item.action?.()"
          >
            @if (item.icon) {
              <mat-icon>{{ item.icon }}</mat-icon>
            }
            <span>{{ item.label }}</span>
          </a>
        } @else {
          <button
            mat-menu-item
            [disabled]="item.disabled ?? false"
            [class]="
              'rhombus-menu__item rhombus-menu__item--' + (item.variant ?? 'default')
            "
            (click)="item.action?.()"
          >
            @if (item.icon) {
              <mat-icon>{{ item.icon }}</mat-icon>
            }
            <span>{{ item.label }}</span>
          </button>
        }
      }
    </mat-menu>
  `,
})
export class RhombusMenuComponent {
  /** The menu entries. */
  readonly items = input.required<MenuItem[]>();
  /** Render the trigger as a round icon button (default `false`). */
  readonly iconButton = input<boolean>(false);
  /** Accessible label for the trigger (recommended for icon-only triggers). */
  readonly ariaLabel = input<string>('');
}
