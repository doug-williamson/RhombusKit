import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { RhombusButtonComponent } from '../button/rhombus-button.component';
import type { ConfirmConfig } from './confirm-dialog.types';

@Component({
  selector: 'rhombus-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-confirm-dialog.component.scss',
  template: `
    <div class="rhombus-confirm-dialog">
      <h2 class="rhombus-confirm-dialog__title">{{ data.title }}</h2>
      <p class="rhombus-confirm-dialog__message">{{ data.message }}</p>
      <div class="rhombus-confirm-dialog__actions">
        <rhombus-button
          variant="secondary"
          appearance="text"
          (click)="close(false)"
        >
          {{ data.cancelLabel ?? 'Cancel' }}
        </rhombus-button>
        <rhombus-button
          [variant]="data.variant === 'danger' ? 'danger' : 'primary'"
          appearance="filled"
          (click)="close(true)"
        >
          {{ data.confirmLabel ?? 'Confirm' }}
        </rhombus-button>
      </div>
    </div>
  `,
})
export class RhombusConfirmDialogComponent {
  protected data = inject<ConfirmConfig>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<RhombusConfirmDialogComponent, boolean>>(
    MatDialogRef
  );

  protected close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
