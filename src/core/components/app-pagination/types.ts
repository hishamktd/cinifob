import { PaginationProps } from '@mui/material';

export interface AppPaginationProps extends Omit<PaginationProps, 'onChange' | 'variant'> {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  position?: 'left' | 'center' | 'right';
  variant?: 'default' | 'compact';
}
