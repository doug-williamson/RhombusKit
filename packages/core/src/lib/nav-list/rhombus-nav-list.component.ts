import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import {
  NavListAppearance,
  RhombusNavItem,
  RhombusNavSection,
} from './nav-list.types';

/** Per-instance id seed for `aria-controls` wiring (SSR-safe, deterministic). */
let nextId = 0;

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
 * Three opt-in behaviours layer on top: per-item `locked` items stay focusable
 * and fire `action` / `(itemAction)` instead of navigating (for plan/feature
 * gates); `collapsible` sections turn their heading into a disclosure toggle;
 * and `appearance="list"` renders full-width "link-row" cells.
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
    <nav
      class="rhombus-nav-list"
      [class.rhombus-nav-list--list]="appearance() === 'list'"
      [attr.aria-label]="ariaLabel()"
    >
      @for (section of sections(); track $index; let si = $index) {
        <div class="rhombus-nav-list__section">
          @if (section.heading) {
            @if (section.collapsible) {
              <button
                type="button"
                class="rhombus-nav-list__heading rhombus-nav-list__heading--toggle"
                [attr.aria-expanded]="isExpanded(si, section)"
                [attr.aria-controls]="sectionId(si)"
                (click)="toggleSection(si, section)"
              >
                <span class="rhombus-nav-list__heading-label">{{ section.heading }}</span>
                <rhombus-icon
                  class="rhombus-nav-list__chevron"
                  [class.rhombus-nav-list__chevron--open]="isExpanded(si, section)"
                  name="chevron_right"
                />
              </button>
            } @else {
              <p class="rhombus-nav-list__heading">{{ section.heading }}</p>
            }
          }
          <ul
            class="rhombus-nav-list__group"
            [id]="sectionId(si)"
            [attr.aria-label]="section.heading || null"
            [hidden]="section.collapsible && !isExpanded(si, section)"
          >
            @for (item of section.items; track item.label) {
              <li class="rhombus-nav-list__cell">
                @if (item.locked && !item.disabled) {
                  <button
                    type="button"
                    class="rhombus-nav-list__item rhombus-nav-list__item--locked"
                    (click)="activate(item)"
                  >
                    <ng-container
                      *ngTemplateOutlet="row; context: { $implicit: item }"
                    />
                  </button>
                } @else if (item.routerLink != null) {
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

    <!-- Shared row body (icon · label · badge · trailing icon · lock) for every
         item kind. -->
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
      @if (item.trailingIcon) {
        <rhombus-icon
          class="rhombus-nav-list__trailing-icon"
          [name]="item.trailingIcon"
        />
      }
      @if (item.locked) {
        <rhombus-icon class="rhombus-nav-list__lock" name="lock" />
      }
    </ng-template>
  `,
})
export class RhombusNavListComponent {
  /** Sections of nav items, top to bottom. */
  readonly sections = input.required<RhombusNavSection[]>();
  /** Accessible label for the `<nav>` landmark. Defaults to `'Primary'`. */
  readonly ariaLabel = input<string>('Primary');
  /**
   * List appearance: `'sidebar'` (default, compact rows) or `'list'`
   * (full-width "link-row" cells for link-in-bio pages).
   */
  readonly appearance = input<NavListAppearance>('sidebar');

  /**
   * Emits the activated item when a `locked` item is clicked (alongside the
   * item's own `action`). Use it to open an upgrade sheet/dialog without
   * navigating.
   */
  readonly itemAction = output<RhombusNavItem>();

  private readonly idBase = `rhombus-nav-list-${nextId++}`;
  /** Per-section expanded overrides set after the user toggles a disclosure. */
  private readonly expandedOverrides = signal<Map<number, boolean>>(new Map());

  /** Stable id for a section's `<ul>`, used as the disclosure `aria-controls`. */
  protected sectionId(index: number): string {
    return `${this.idBase}-section-${index}`;
  }

  /** Whether a section is currently expanded (override, else the seed). */
  protected isExpanded(index: number, section: RhombusNavSection): boolean {
    const override = this.expandedOverrides().get(index);
    return override ?? section.expanded ?? true;
  }

  /** Flip a collapsible section's expanded state. */
  protected toggleSection(index: number, section: RhombusNavSection): void {
    const next = new Map(this.expandedOverrides());
    next.set(index, !this.isExpanded(index, section));
    this.expandedOverrides.set(next);
  }

  /** Run a locked item's callback and emit `(itemAction)`. */
  protected activate(item: RhombusNavItem): void {
    item.action?.();
    this.itemAction.emit(item);
  }
}
