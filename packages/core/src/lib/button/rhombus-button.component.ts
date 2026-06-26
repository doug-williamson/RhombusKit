import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/**
 * Visual variant — picks the colour role applied to the button.
 * `primary` and `secondary` use the system token bridge defaults;
 * `ghost` and `danger` locally rebind `--mat-sys-primary` for their look.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Padding scale. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Material 21 button appearance. `tonal` and `elevated` are accepted by
 * MatButton but intentionally not part of RhombusKit's public API in
 * Phase 2 — we ship a curated subset.
 */
export type ButtonAppearance = 'filled' | 'outlined' | 'text';

@Component({
  selector: 'rhombus-button',
  standalone: true,
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-button.component.scss',
  // Renders an inner element matching MatButton (so the styling/tokens are
  // identical), swapping <button> for <a> when a link target is set. The icon +
  // projected-label body lives in one #content template stamped into the active
  // branch, so there is exactly one <ng-content/>. MatButton owns the disabled
  // semantics on the anchor (aria-disabled + tab removal, since <a> has no native
  // :disabled); we also drop the href/routerLink so it isn't activatable.
  template: `
    @if (routerLink() != null) {
      <a
        [matButton]="appearance()"
        [class]="hostClasses()"
        [disabled]="disabled()"
        [routerLink]="disabled() ? null : routerLink()"
        [attr.target]="disabled() ? null : target()"
        [attr.rel]="computedRel()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else if (href() != null) {
      <a
        [matButton]="appearance()"
        [class]="hostClasses()"
        [disabled]="disabled()"
        [attr.href]="disabled() ? null : href()"
        [attr.target]="disabled() ? null : target()"
        [attr.rel]="computedRel()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <button
        [matButton]="appearance()"
        [disabled]="disabled()"
        [class]="hostClasses()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    }

    <ng-template #content>
      @if (leadingIcon()) {
        <mat-icon>{{ leadingIcon() }}</mat-icon>
      }
      <ng-content />
      @if (trailingIcon()) {
        <mat-icon iconPositionEnd>{{ trailingIcon() }}</mat-icon>
      }
    </ng-template>
  `,
})
export class RhombusButtonComponent {
  /** Colour role: `primary` (default) | `secondary` | `ghost` | `danger`. */
  readonly variant = input<ButtonVariant>('primary');
  /** Padding scale: `sm` | `md` (default) | `lg`. */
  readonly size = input<ButtonSize>('md');
  /** MatButton appearance: `filled` (default) | `outlined` | `text`. */
  readonly appearance = input<ButtonAppearance>('filled');
  /** Disables the button when `true`. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Material icon name rendered before the projected label; `null` (default) hides it. */
  readonly leadingIcon = input<string | null>(null);
  /** Material icon name rendered after the projected label; `null` (default) hides it. */
  readonly trailingIcon = input<string | null>(null);

  /**
   * Router destination. When set, the button renders as a real `<a>` (with
   * `routerLink`) carrying identical styling — for nav CTAs, "back to home", etc.
   * Takes precedence over `href`. `null` (default) renders a `<button>`.
   */
  readonly routerLink = input<string | unknown[] | null>(null);
  /**
   * Plain anchor destination. When set (and `routerLink` is not), the button
   * renders as `<a href>`. `null` (default) renders a `<button>`.
   */
  readonly href = input<string | null>(null);
  /** Anchor `target` (e.g. `_blank`), forwarded to the rendered `<a>`. */
  readonly target = input<string | null>(null);
  /**
   * Anchor `rel`. When omitted and `target="_blank"`, defaults to
   * `noopener noreferrer` to harden the external link.
   */
  readonly rel = input<string | null>(null);

  /** True when a link target is set, so the button renders as an anchor. */
  protected readonly isLink = computed(
    () => this.routerLink() != null || this.href() != null
  );

  /** The `rel` actually applied: the explicit value, or a safe `_blank` default. */
  protected readonly computedRel = computed(() => {
    const explicit = this.rel();
    if (explicit) return explicit;
    return this.target() === '_blank' ? 'noopener noreferrer' : null;
  });

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-button',
      `rhombus-button--${this.variant()}`,
      `rhombus-button--${this.size()}`,
      `rhombus-button--${this.appearance()}`,
    ].join(' ')
  );
}
