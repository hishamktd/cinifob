'use client';

import React from 'react';
import { Box, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AppPaginationProps } from './types';

export const AppPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  position = 'center',
  variant = 'default',
  size = 'medium',
  ...props
}: AppPaginationProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  const getItemsInfo = () => {
    if (!totalItems || !itemsPerPage) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return `${startItem}-${endItem} of ${totalItems}`;
  };

  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[position];

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: variant === 'compact' || isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent,
        gap: 2,
        py: 2,
      }}
    >
      {showInfo && getItemsInfo() && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            order: position === 'right' ? 1 : 0,
            textAlign: isMobile ? 'center' : 'inherit',
          }}
        >
          {getItemsInfo()}
        </Typography>
      )}

      <Pagination
        {...props}
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        size={isMobile ? 'small' : size}
        siblingCount={isMobile ? 0 : 1}
        boundaryCount={isMobile ? 1 : 2}
        shape="rounded"
        color="primary"
        sx={{
          '& .MuiPagination-ul': {
            justifyContent: 'center',
          },
          ...props.sx,
        }}
      />
    </Box>
  );
};

export type { AppPaginationProps } from './types';
