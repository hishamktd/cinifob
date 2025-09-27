'use client';

import React from 'react';

import { Box, Container } from '@mui/material';

import { AppHeader } from '../app-header';

interface MainLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disablePadding?: boolean;
}

export const MainLayout = ({
  children,
  maxWidth = 'lg',
  disablePadding = false,
}: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Box component="main" sx={{ flexGrow: 1, py: disablePadding ? 0 : 3 }}>
        <Container maxWidth={maxWidth}>{children}</Container>
      </Box>
    </Box>
  );
};