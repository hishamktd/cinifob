'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Fade,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
  styled,
} from '@mui/material';

import { AppIcon, AppButton, AppSearchBar } from '@core/components';
import { useThemeContext } from '@/contexts/ThemeContext';
import { MobileDrawer } from '@core/components/layout/mobile-drawer';
import { ROUTES } from '@core/constants';

// Styled components for enhanced design
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(20px)',
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.8)})`
      : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(90deg, rgba(139, 69, 19, 0.05), rgba(255, 140, 0, 0.05), rgba(139, 69, 19, 0.05))'
        : 'linear-gradient(90deg, rgba(25, 118, 210, 0.05), rgba(156, 39, 176, 0.05), rgba(25, 118, 210, 0.05))',
    zIndex: -1,
  },
}));

const StyledNavButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 1.5),
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.grey[700],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)'
        : 'linear-gradient(45deg, transparent, rgba(0,0,0,0.05), transparent)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.08),
    color: theme.palette.primary.main,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    '&::before': {
      transform: 'translateX(100%)',
    },
  },
  '&.active': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.12),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const CompactSearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      transform: 'scale(1.02)',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      transform: 'scale(1.05)',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

export const AppHeader = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleTheme: toggleColorMode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

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

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchSubmit = useCallback((value: string) => {
    if (value.trim()) {
      // Navigate to browse page with search query
      window.location.href = `${ROUTES.BROWSE}?q=${encodeURIComponent(value.trim())}`;
    }
  }, []);

  const isActiveRoute = useCallback(
    (route: string) => {
      return pathname === route;
    },
    [pathname],
  );

  const navigationItems = [
    { label: 'Browse', route: ROUTES.BROWSE, icon: 'solar:magnifer-linear' },
    { label: 'Movies', route: ROUTES.MOVIES, icon: 'solar:play-circle-bold' },
    { label: 'TV Shows', route: ROUTES.TV, icon: 'solar:tv-bold' },
    { label: 'Watchlist', route: '/watchlist/unified', icon: 'solar:bookmark-bold' },
    { label: 'Watched', route: ROUTES.WATCHED, icon: 'solar:check-circle-bold' },
    { label: 'Dashboard', route: ROUTES.DASHBOARD, icon: 'solar:chart-square-bold' },
  ];

  return (
    <GlassAppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Logo and Brand Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flex: '0 0 auto',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          component={Link}
          href={ROUTES.HOME}
        >
          <Box
            sx={{
              position: 'relative',
              mr: 1.5,
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -2,
                borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                animation: 'spin 3s linear infinite',
                opacity: 0.7,
                zIndex: -1,
              },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          >
            <AppIcon
              icon="solar:videocamera-bold"
              size={isMobile ? 28 : 32}
              style={{ color: theme.palette.primary.main }}
            />
          </Box>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            CiniFob
          </Typography>
        </Box>

        {/* Search Bar - Desktop/Tablet */}
        {!isMobile && (
          <Box
            sx={{
              flex: '1 1 auto',
              maxWidth: 400,
              display: 'flex',
              alignItems: 'center',
              mx: 2,
            }}
          >
            <CompactSearchBar
              size="small"
              placeholder="Search movies, TV shows..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(searchValue);
                }
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AppIcon
                      icon="solar:magnifer-linear"
                      size={20}
                      color={searchFocused ? 'primary' : 'text.secondary'}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchValue('')}
                      sx={{ transition: 'all 0.2s' }}
                    >
                      <AppIcon icon="solar:close-circle-bold" size={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-input': {
                  py: 1,
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>
        )}

        {/* Navigation Links - Desktop Only */}
        {!isTablet && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flex: '0 0 auto',
            }}
          >
            {navigationItems.map((item) => (
              <StyledNavButton
                key={item.route}
                onClick={() => router.push(item.route)}
                className={isActiveRoute(item.route) ? 'active' : ''}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <AppIcon icon={item.icon} size={16} />
                <span>{item.label}</span>
              </StyledNavButton>
            ))}
          </Box>
        )}

        {/* Spacer for mobile and tablet */}
        {(isMobile || isTablet) && <Box sx={{ flexGrow: 1 }} />}

        {/* Right Side Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: isTablet ? 0 : 'auto',
            flex: '0 0 auto',
          }}
        >
          {/* Notifications */}
          {status === 'authenticated' && (
            <IconButton
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Badge
                badgeContent={3}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    animation: 'pulse 2s infinite',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <AppIcon icon="solar:bell-bold" size={20} />
              </Badge>
            </IconButton>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleColorMode}
            sx={{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'rotate(180deg) scale(1.1)',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <AppIcon
              icon={mode === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'}
              size={20}
              color={mode === 'dark' ? 'warning.main' : 'info.main'}
            />
          </IconButton>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={handleMobileDrawerOpen}
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <AppIcon icon="solar:hamburger-menu-linear" size={22} />
            </IconButton>
          )}

          {/* User Profile */}
          {status === 'authenticated' && session?.user ? (
            <>
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Avatar
                  src={session.user.image || undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    backdropFilter: 'blur(20px)',
                    background: alpha(theme.palette.background.paper, 0.9),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem href={ROUTES.PROFILE} onClick={handleClose} sx={{ gap: 1.5, py: 1 }}>
                  <AppIcon icon="solar:user-bold" size={18} />
                  Profile
                </MenuItem>
                <MenuItem href="/settings" onClick={handleClose} sx={{ gap: 1.5, py: 1 }}>
                  <AppIcon icon="solar:settings-bold" size={18} />
                  Settings
                </MenuItem>
                <MenuItem
                  onClick={handleSignOut}
                  sx={{
                    gap: 1.5,
                    py: 1,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <AppIcon icon="solar:logout-3-bold" size={18} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Fade in>
              <Button
                variant="contained"
                href={ROUTES.LOGIN}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AppIcon icon="solar:login-3-bold" size={16} />
                  <span>Login</span>
                </Box>
              </Button>
            </Fade>
          )}
        </Box>
      </Toolbar>
      <MobileDrawer open={mobileDrawerOpen} onClose={handleMobileDrawerClose} />
    </GlassAppBar>
  );
};
