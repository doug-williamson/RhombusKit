export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string; // default 'Confirm'
  cancelLabel?: string; // default 'Cancel'
  variant?: 'default' | 'danger'; // drives confirm button styling; default 'default'
}
