import { ButtonProps } from '@mui/material';

export interface AppButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon'> {
  loading?: boolean;
  startIcon?: string;
  endIcon?: string;
  iconSize?: number;
  variant?: 'text' | 'outlined' | 'contained';
}
