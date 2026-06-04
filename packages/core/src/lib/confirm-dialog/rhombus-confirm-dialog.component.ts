import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RhombusButtonComponent } from '../button/rhombus-button.component';
import { RhombusDialogComponent } from '../dialog/rhombus-dialog.component';
import { RhombusDialogActionsDirective } from '../dialog/rhombus-dialog-actions.directive';
import type { ConfirmConfig } from './confirm-dialog.types';

@Component({
  selector: 'rhombus-confirm-dialog',
  standalone: true,
  imports: [
    RhombusDialogComponent,
    RhombusDialogActionsDirective,
    RhombusButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-confirm-dialog.component.scss',
  template: `
    <rhombus-dialog [title]="data.title">
      <p class="rhombus-confirm-dialog__message">{{ data.message }}</p>
      <div rhombusDialogActions>
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
    </rhombus-dialog>
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
