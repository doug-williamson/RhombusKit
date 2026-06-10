import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RhombusCodeBlockComponent } from '@rhombuskit/core';

/**
 * `<app-example>` — a live demo paired with its collapsible source, mirroring
 * Angular Material's example viewer: the rendered result sits on top and the
 * code is tucked behind a "View source" toggle (collapsed by default).
 *
 *   <app-example [code]="usage">
 *     <rhombus-button variant="primary">Save changes</rhombus-button>
 *   </app-example>
 *
 * The projected content is the live demo; `code` is the snippet shown when the
 * source is expanded (copy button comes from `<rhombus-code-block>`).
 */
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [MatIconModule, RhombusCodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './example.component.scss',
  template: `
    <div class="example">
      <div class="example__preview">
        <ng-content />
      </div>
      <button
        type="button"
        class="example__toggle"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        <mat-icon>code</mat-icon>
        <span>{{ open() ? 'Hide source' : 'View source' }}</span>
      </button>
      @if (open()) {
        <rhombus-code-block [language]="language()" [code]="code()" />
      }
    </div>
  `,
})
export class ExampleComponent {
  /** Source snippet revealed when "View source" is expanded (required). */
  readonly code = input.required<string>();
  /** Language grammar / label for the snippet; defaults to `'typescript'`. */
  readonly language = input<string>('typescript');

  protected readonly open = signal(false);
}
