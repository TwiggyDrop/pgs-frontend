import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon" [class.danger]="data.danger" aria-hidden="true">
        <mat-icon>{{ data.danger ? 'warning' : 'help_outline' }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="cancel()" [attr.aria-label]="data.cancelLabel ?? 'Cancel'">
          {{ data.cancelLabel ?? 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [class.danger-btn]="data.danger"
          (click)="confirm()"
          [attr.aria-label]="data.confirmLabel ?? 'Confirm'">
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 8px; max-width: 400px; }

    .dialog-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-primary-subtle);
      margin-bottom: 16px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--color-primary);
      }

      &.danger {
        background: var(--color-danger-bg);
        mat-icon { color: var(--color-danger-text); }
      }
    }

    h2[mat-dialog-title] {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin: 0 0 8px;
      padding: 0;
    }

    mat-dialog-content p {
      font-size: var(--text-base);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      margin: 0;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 0 0;
      margin: 0;
    }

    .danger-btn {
      background: var(--color-danger-solid) !important;
      color: white !important;
    }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  confirm() { this.dialogRef.close(true); }
  cancel()  { this.dialogRef.close(false); }
}

