import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import type { OverflowMenuItem } from './overflow-menu.types';

@Component({
  selector: 'rhombus-overflow-menu',
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RhombusIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-overflow-menu.component.scss',
  template: `
    <button
      matIconButton
      [matMenuTriggerFor]="menu"
      [attr.aria-label]="ariaLabel()"
      class="rhombus-overflow-menu__trigger"
      (click)="$event.stopPropagation()"
    >
      <rhombus-icon [name]="triggerIcon()" />
    </button>

    <mat-menu #menu="matMenu" class="rhombus-overflow-menu__panel">
      @for (item of items(); track item.label; let i = $index) {
        @if (i > 0 && item.dividerBefore) {
          <mat-divider />
        }
        <button
          mat-menu-item
          [disabled]="item.disabled ?? false"
          [class]="
            'rhombus-overflow-menu__item rhombus-overflow-menu__item--' +
            (item.variant ?? 'default')
          "
          (click)="item.action()"
        >
          @if (item.icon) {
            <mat-icon>{{ item.icon }}</mat-icon>
          }
          <span>{{ item.label }}</span>
        </button>
      }
    </mat-menu>
  `,
})
export class RhombusOverflowMenuComponent {
  items = input.required<OverflowMenuItem[]>();
  triggerIcon = input<string>('more_vert');
  ariaLabel = input<string>('More actions');
}
