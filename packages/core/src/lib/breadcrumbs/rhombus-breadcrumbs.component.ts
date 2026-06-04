import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/** A single breadcrumb. Omit `link` for the current (last) page. */
export interface BreadcrumbItem {
  /** Display text. */
  label: string;
  /** `routerLink` target (string path or commands array). Omit for the current page. */
  link?: string | unknown[];
}

/**
 * `<rhombus-breadcrumbs>` — an accessible breadcrumb trail
 * (`<nav aria-label="Breadcrumb"><ol>`). Linked entries render as `routerLink`
 * anchors; the last entry is the current page (`aria-current="page"`, never a
 * link). Separators are decorative (`aria-hidden`). Bespoke — no Material
 * primitive; colours flow through the contract tokens.
 *
 * ```html
 * <rhombus-breadcrumbs
 *   [items]="[
 *     { label: 'Home', link: '/' },
 *     { label: 'Projects', link: '/projects' },
 *     { label: 'RhombusKit' },
 *   ]"
 * />
 * ```
 */
@Component({
  selector: 'rhombus-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-breadcrumbs.component.scss',
  template: `
    <nav class="rhombus-breadcrumbs" [attr.aria-label]="ariaLabel()">
      <ol class="rhombus-breadcrumbs__list">
        @for (item of items(); track item.label; let last = $last) {
          <li class="rhombus-breadcrumbs__item">
            @if (item.link && !last) {
              <a class="rhombus-breadcrumbs__link" [routerLink]="item.link">{{
                item.label
              }}</a>
            } @else {
              <span
                class="rhombus-breadcrumbs__current"
                [attr.aria-current]="last ? 'page' : null"
                >{{ item.label }}</span
              >
            }
            @if (!last) {
              <span class="rhombus-breadcrumbs__separator" aria-hidden="true">{{
                separator()
              }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class RhombusBreadcrumbsComponent {
  /** The breadcrumb trail, root first. */
  readonly items = input.required<BreadcrumbItem[]>();
  /** Visual separator between entries. Defaults to `'/'`. */
  readonly separator = input<string>('/');
  /** Accessible label for the nav landmark. Defaults to `'Breadcrumb'`. */
  readonly ariaLabel = input<string>('Breadcrumb');
}
