'use client';

import React, { useCallback } from 'react';
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
import { MobileDrawer } from '@core/components/layout/mobile-drawer';
import { ROUTES } from '@core/constants';

export const AppHeader = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: ROUTES.LOGIN });
  }, []);

  const handleMobileDrawerOpen = useCallback(() => setMobileDrawerOpen(true), []);
  const handleMobileDrawerClose = useCallback(() => setMobileDrawerOpen(false), []);

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      }}
    >
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
            href={ROUTES.HOME}
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
              <Button color="inherit" component={Link} href={ROUTES.MOVIES}>
                Movies
              </Button>
              <Button color="inherit" component={Link} href={ROUTES.BROWSE}>
                Browse
              </Button>
              <Button color="inherit" component={Link} href={ROUTES.TV}>
                TV Shows
              </Button>
              <Button color="inherit" component={Link} href={ROUTES.WATCHLIST}>
                Watchlist
              </Button>
              <Button color="inherit" component={Link} href={ROUTES.WATCHED}>
                Watched
              </Button>
              <Button color="inherit" component={Link} href={ROUTES.DASHBOARD}>
                Dashboard
              </Button>
            </>
          )}

          <IconButton onClick={toggleColorMode} color="inherit">
            <AppIcon icon={mode === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} size={24} />
          </IconButton>

          {isMobile && (
            <IconButton color="inherit" onClick={handleMobileDrawerOpen}>
              <AppIcon icon="solar:hamburger-menu-linear" size={24} />
            </IconButton>
          )}

          {status === 'authenticated' && session?.user ? (
            <>
              <IconButton onClick={handleMenu} color="inherit">
                <AppIcon icon="mdi:account-circle" size={28} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
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
      <MobileDrawer open={mobileDrawerOpen} onClose={handleMobileDrawerClose} />
    </AppBar>
  );
};
