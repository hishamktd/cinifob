'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { ROUTES } from '@core/constants';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer = React.memo(({ open, onClose }: MobileDrawerProps) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: ROUTES.LOGIN });
    onClose();
  }, [onClose]);

  const menuItems = useMemo(
    () => [
      { title: 'Home', icon: 'solar:home-2-bold', href: ROUTES.HOME },
      { title: 'Movies', icon: 'solar:play-circle-bold', href: ROUTES.MOVIES },
      { title: 'Browse', icon: 'solar:magnifer-linear', href: ROUTES.BROWSE },
      { title: 'TV Shows', icon: 'solar:tv-bold', href: ROUTES.TV },
      { title: 'Watchlist', icon: 'solar:bookmark-bold', href: ROUTES.WATCHLIST },
      { title: 'Watched', icon: 'solar:check-circle-bold', href: ROUTES.WATCHED },
      { title: 'Dashboard', icon: 'solar:chart-square-bold', href: ROUTES.DASHBOARD },
      { title: 'Profile', icon: 'solar:user-bold', href: ROUTES.PROFILE },
    ],
    [],
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AppIcon icon="mdi:movie-open-outline" size={32} style={{ marginRight: 8 }} />
          <Typography variant="h6" fontWeight={600}>
            CiniFob
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <AppIcon icon="solar:close-circle-bold" size={24} />
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={onClose}
              selected={pathname === item.href}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AppIcon icon={item.icon} size={24} />
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        {status === 'authenticated' && session?.user ? (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Logged in as
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }} noWrap>
              {session.user.email}
            </Typography>
            <ListItemButton
              onClick={handleSignOut}
              sx={{
                borderRadius: 1,
                bgcolor: 'error.main',
                color: 'error.contrastText',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <AppIcon icon="solar:logout-3-bold" size={20} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </Box>
        ) : (
          <ListItemButton
            component={Link}
            href={ROUTES.LOGIN}
            onClick={onClose}
            sx={{
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <AppIcon icon="solar:login-3-bold" size={20} />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItemButton>
        )}
      </Box>
    </Drawer>
  );
});

MobileDrawer.displayName = 'MobileDrawer';
