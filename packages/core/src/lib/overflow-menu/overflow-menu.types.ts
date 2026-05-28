export interface OverflowMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  dividerBefore?: boolean;
}
