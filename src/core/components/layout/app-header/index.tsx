'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { useThemeMode } from '@contexts/ThemeContext';

export const AppHeader = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AppIcon
            icon="mdi:movie-open-outline"
            size={32}
            style={{ marginRight: theme.spacing(1) }}
          />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
            }}
          >
            CiniFob
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isMobile && (
            <>
              <Button color="inherit" component={Link} href="/movies">
                Browse
              </Button>
              <Button color="inherit" component={Link} href="/watchlist">
                Watchlist
              </Button>
              <Button color="inherit" component={Link} href="/watched">
                Watched
              </Button>
              <Button color="inherit" component={Link} href="/dashboard">
                Dashboard
              </Button>
            </>
          )}

          <IconButton onClick={toggleColorMode} color="inherit">
            <AppIcon
              icon={mode === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'}
              size={24}
            />
          </IconButton>

          {isMobile && (
            <IconButton color="inherit">
              <AppIcon icon="solar:hamburger-menu-linear" size={24} />
            </IconButton>
          )}

          {status === 'authenticated' && session?.user ? (
            <>
              <IconButton onClick={handleMenu} color="inherit">
                <AppIcon icon="mdi:account-circle" size={28} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={Link} href="/profile" onClick={handleClose}>
                  Profile
                </MenuItem>
                <MenuItem component={Link} href="/settings" onClick={handleClose}>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleSignOut}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              href="/login"
              sx={{ ml: 1 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};