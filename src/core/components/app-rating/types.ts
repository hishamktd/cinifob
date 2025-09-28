import { RatingProps } from '@mui/material';

export interface AppRatingProps extends Omit<RatingProps, 'icon' | 'emptyIcon'> {
  label?: string;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  variant?: 'default' | 'compact' | 'detailed';
  icon?: string;
  emptyIcon?: string;
  iconSize?: number;
  color?: string;
  emptyColor?: string;
}
