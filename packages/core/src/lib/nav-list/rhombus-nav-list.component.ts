import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusNavSection } from './nav-list.types';

/**
 * `<rhombus-nav-list>` — a persistent, vertical, sectioned navigation list,
 * designed to fill the app-shell `[shellNav]` slot (or any sidebar / "link in
 * bio" column). Router items (with `routerLink`) self-highlight via
 * `routerLinkActive` and render `aria-current="page"`; `href` items point at an
 * external destination and accept a manual `active` flag. The whole list is a
 * `<nav>` landmark, items are real `<a>` links (native keyboard order + focus
 * ring), and every colour flows through the @rhombuskit/tokens contract —
 * including the previously-dormant `--nav-active-bg` / `--nav-active-text`.
 *
 * Drop it into the shell with the slot marker:
 * `<rhombus-nav-list shellNav [sections]="nav" />`.
 */
@Component({
  selector: 'rhombus-nav-list',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-nav-list.component.scss',
  template: `
    <nav class="rhombus-nav-list" [attr.aria-label]="ariaLabel()">
      @for (section of sections(); track $index) {
        <div class="rhombus-nav-list__section">
          @if (section.heading) {
            <p class="rhombus-nav-list__heading">{{ section.heading }}</p>
          }
          <ul
            class="rhombus-nav-list__group"
            [attr.aria-label]="section.heading || null"
          >
            @for (item of section.items; track item.label) {
              <li class="rhombus-nav-list__cell">
                @if (item.routerLink != null) {
                  <a
                    class="rhombus-nav-list__item"
                    [class.rhombus-nav-list__item--disabled]="item.disabled"
                    [routerLink]="item.disabled ? null : item.routerLink"
                    routerLinkActive="rhombus-nav-list__item--active"
                    [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                    #rla="routerLinkActive"
                    [attr.aria-current]="rla.isActive ? 'page' : null"
                    [attr.aria-disabled]="item.disabled ? 'true' : null"
                    [attr.tabindex]="item.disabled ? -1 : null"
                  >
                    <ng-container
                      *ngTemplateOutlet="row; context: { $implicit: item }"
                    />
                  </a>
                } @else if (item.href != null) {
                  <a
                    class="rhombus-nav-list__item"
                    [class.rhombus-nav-list__item--active]="item.active"
                    [class.rhombus-nav-list__item--disabled]="item.disabled"
                    [attr.href]="item.disabled ? null : item.href"
                    [attr.target]="item.target"
                    [attr.rel]="item.rel"
                    [attr.aria-current]="item.active ? 'page' : null"
                    [attr.aria-disabled]="item.disabled ? 'true' : null"
                    [attr.tabindex]="item.disabled ? -1 : null"
                  >
                    <ng-container
                      *ngTemplateOutlet="row; context: { $implicit: item }"
                    />
                  </a>
                } @else {
                  <span
                    class="rhombus-nav-list__item"
                    [class.rhombus-nav-list__item--active]="item.active"
                    [class.rhombus-nav-list__item--disabled]="item.disabled"
                    [attr.aria-current]="item.active ? 'page' : null"
                  >
                    <ng-container
                      *ngTemplateOutlet="row; context: { $implicit: item }"
                    />
                  </span>
                }
              </li>
            }
          </ul>
        </div>
      }
    </nav>

    <!-- Shared row body (icon · label · trailing badge) for every item kind. -->
    <ng-template #row let-item>
      @if (item.icon) {
        <rhombus-icon class="rhombus-nav-list__icon" [name]="item.icon" />
      }
      <span class="rhombus-nav-list__label">{{ item.label }}</span>
      @if (item.badge != null) {
        <span
          class="rhombus-nav-list__badge"
          [class.rhombus-nav-list__badge--dot]="item.badge === 'dot'"
        >
          @if (item.badge !== 'dot') {
            {{ item.badge }}
          }
        </span>
      }
    </ng-template>
  `,
})
export class RhombusNavListComponent {
  /** Sections of nav items, top to bottom. */
  readonly sections = input.required<RhombusNavSection[]>();
  /** Accessible label for the `<nav>` landmark. Defaults to `'Primary'`. */
  readonly ariaLabel = input<string>('Primary');
}
