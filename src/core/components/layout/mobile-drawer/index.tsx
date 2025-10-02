'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  Typography,
  alpha,
  styled,
  useTheme,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { ROUTES } from '@core/constants';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface UserStats {
  watchlistCount: number;
  watchedCount: number;
  favoriteGenre: string;
}

// Styled components for enhanced design
const GlassDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 320,
    background:
      theme.palette.mode === 'dark'
        ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`
        : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.default, 0.95)})`,
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `inset -1px 0 0 ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 1.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  '&:hover': {
    transform: 'translateX(4px)',
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '&::before': {
      opacity: 1,
    },
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    fontWeight: 600,
    transform: 'translateX(8px)',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 3,
      height: '60%',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 2px 2px 0',
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
  },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.success.main, 0.1)})`,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: theme.palette.info.main,
  },
}));

export const MobileDrawer = React.memo(({ open, onClose }: MobileDrawerProps) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState<UserStats>({
    watchlistCount: 0,
    watchedCount: 0,
    favoriteGenre: 'Unknown',
  });
  // const [statsLoading, setStatsLoading] = useState(false); // Currently unused

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: ROUTES.LOGIN });
    onClose();
  }, [onClose]);

  // Fetch user stats when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // setStatsLoading(true);
      // Simulate API calls - replace with actual API endpoints
      Promise.all([
        fetch('/api/user/watchlist')
          .then((res) => res.json())
          .catch(() => ({ data: [] })),
        fetch('/api/user/watched')
          .then((res) => res.json())
          .catch(() => ({ data: [] })),
      ])
        .then(([watchlist, watched]) => {
          setUserStats({
            watchlistCount: watchlist.data?.length || 0,
            watchedCount: watched.data?.length || 0,
            favoriteGenre: 'Action', // This would come from user preferences
          });
        })
        .finally(() => {
          /* setStatsLoading(false) */
        });
    }
  }, [status, session]);

  const menuItems = useMemo(
    () => [
      {
        title: 'Home',
        icon: 'solar:home-2-bold',
        href: ROUTES.HOME,
        color: 'primary',
        description: 'Discover trending content',
      },
      {
        title: 'Browse',
        icon: 'solar:magnifer-linear',
        href: ROUTES.BROWSE,
        color: 'info',
        description: 'Search and filter content',
      },
      {
        title: 'Movies',
        icon: 'solar:play-circle-bold',
        href: ROUTES.MOVIES,
        color: 'secondary',
        description: 'Browse movie collection',
      },
      {
        title: 'TV Shows',
        icon: 'solar:tv-bold',
        href: ROUTES.TV,
        color: 'warning',
        description: 'Explore TV series',
      },
      {
        title: 'Watchlist',
        icon: 'solar:bookmark-bold',
        href: '/watchlist/unified',
        color: 'success',
        description: 'Your saved content',
        badge: userStats.watchlistCount,
        protected: true,
      },
      {
        title: 'Watched',
        icon: 'solar:check-circle-bold',
        href: ROUTES.WATCHED,
        color: 'error',
        description: "Content you've seen",
        badge: userStats.watchedCount,
        protected: true,
      },
      {
        title: 'Dashboard',
        icon: 'solar:chart-square-bold',
        href: ROUTES.DASHBOARD,
        color: 'primary',
        description: 'Your viewing analytics',
        protected: true,
      },
      {
        title: 'Feedback',
        icon: 'mdi:message-alert',
        href: '/feedback',
        color: 'info',
        description: 'Report issues & suggestions',
      },
    ],
    [userStats],
  );

  return (
    <GlassDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      SlideProps={{
        direction: 'right',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                size={28}
                style={{ color: theme.palette.primary.main }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
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
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                transform: 'rotate(90deg) scale(1.1)',
              },
            }}
          >
            <AppIcon icon="solar:close-circle-bold" size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* User Profile Section */}
      {status === 'authenticated' && session?.user && (
        <Fade in timeout={600}>
          <Box sx={{ p: 2.5, pb: 1.5 }}>
            <ProfileCard>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={session.user.image || undefined}
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 1.5,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {session.user.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {session.user.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Quick Stats */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <StatsChip
                    size="small"
                    icon={<AppIcon icon="solar:bookmark-bold" size={14} />}
                    label={`${userStats.watchlistCount} in list`}
                  />
                  <StatsChip
                    size="small"
                    icon={<AppIcon icon="solar:check-circle-bold" size={14} />}
                    label={`${userStats.watchedCount} watched`}
                  />
                </Box>
              </CardContent>
            </ProfileCard>
          </Box>
        </Fade>
      )}

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 0.5, py: 1 }}>
        {menuItems.map((item, index) => {
          // Hide protected items if not authenticated
          if (item.protected && status !== 'authenticated') {
            return null;
          }

          return (
            <Slide
              key={item.href}
              direction="right"
              in={open}
              timeout={300 + index * 50}
              style={{ transitionDelay: open ? `${index * 50}ms` : '0ms' }}
            >
              <ListItem disablePadding>
                <StyledListItemButton
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  selected={pathname === item.href}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background:
                          pathname === item.href
                            ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.1)})`
                            : 'transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <AppIcon
                        icon={item.icon}
                        size={20}
                        color={pathname === item.href ? 'primary' : item.color}
                      />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={pathname === item.href ? 600 : 500}>
                          {item.title}
                        </Typography>
                        {item.badge && item.badge > 0 && (
                          <Chip
                            size="small"
                            label={item.badge}
                            sx={{
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: alpha(theme.palette.primary.main, 0.15),
                              color: theme.palette.primary.main,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem', opacity: 0.8 }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                </StyledListItemButton>
              </ListItem>
            </Slide>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      {/* Footer Section */}
      <Box
        sx={{
          p: 2.5,
          mt: 'auto',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.5)}, ${alpha(theme.palette.background.default, 0.3)})`,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {status === 'authenticated' && session?.user ? (
          <Box>
            <StyledListItemButton
              onClick={handleSignOut}
              sx={{
                background: `linear-gradient(45deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.dark, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                color: theme.palette.error.main,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(theme.palette.error.main, 0.15)}, ${alpha(theme.palette.error.dark, 0.1)})`,
                  transform: 'translateX(0) scale(1.02)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  <AppIcon icon="solar:logout-3-bold" size={18} color="error" />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    Sign Out
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Logout from your account
                  </Typography>
                }
              />
            </StyledListItemButton>
          </Box>
        ) : (
          <StyledListItemButton
            onClick={() => {
              router.push(ROUTES.LOGIN);
              onClose();
            }}
            sx={{
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              color: theme.palette.primary.main,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                transform: 'translateX(0) scale(1.02)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  background: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <AppIcon icon="solar:login-3-bold" size={18} color="primary" />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={600}>
                  Sign In
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Access your account
                </Typography>
              }
            />
          </StyledListItemButton>
        )}

        {/* App Version & Links */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              fontSize: '0.7rem',
              opacity: 0.7,
            }}
          >
            CiniFob v1.0.0
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              fontSize: '0.65rem',
              opacity: 0.5,
              mt: 0.5,
            }}
          >
            Your movie companion
          </Typography>
        </Box>
      </Box>
    </GlassDrawer>
  );
});

MobileDrawer.displayName = 'MobileDrawer';
