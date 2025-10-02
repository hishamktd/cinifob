'use client';

import React from 'react';
import {
  Box,
  Container,
  Skeleton,
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { AppIcon } from '@core/components';

interface ContentLoadingProps {
  title: string;
  subtitle: string;
  showStats?: boolean;
  showFilters?: boolean;
  itemCount?: number;
}

export const ContentLoading: React.FC<ContentLoadingProps> = ({
  title,
  subtitle,
  // showStats = true, // Unused parameter
  showFilters = true,
  itemCount = 8,
}) => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* Filters Skeleton */}
      {showFilters && (
        <>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup value="all" exclusive disabled size="small">
              <ToggleButton value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AppIcon icon="mdi:view-grid" size={16} />
                  <Skeleton width={25} />
                </Box>
              </ToggleButton>
              <ToggleButton value="movies">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AppIcon icon="mdi:movie" size={16} />
                  <Skeleton width={60} />
                </Box>
              </ToggleButton>
              <ToggleButton value="tv">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AppIcon icon="mdi:television-classic" size={16} />
                  <Skeleton width={75} />
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {['Date Added', 'Title', 'Release Date', 'Rating', 'Type'].map((label) => (
              <Skeleton
                key={label}
                variant="rounded"
                width={100}
                height={32}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </>
      )}

      {/* Stats removed for cleaner look - matches actual loaded content */}

      {/* Content Grid Skeleton */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          '@media (min-width: 600px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 2.5,
          },
          '@media (min-width: 960px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 3,
          },
          '@media (min-width: 1280px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          },
          '@media (min-width: 1920px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          },
        }}
      >
        {Array.from({ length: itemCount }).map((_, index) => (
          <Card
            key={index}
            sx={{
              height: '100%',
              animation: 'fadeIn 0.3s ease-in-out',
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'both',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                paddingTop: '150%',
                overflow: 'hidden',
                bgcolor: 'action.hover',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon icon="mdi:image" size={64} color="text.disabled" />
              </Box>
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="text" width={70} height={16} />
              </Box>
              <Skeleton variant="text" width="90%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={14} />
              <Skeleton variant="text" width="100%" height={14} />
              <Skeleton variant="text" width="60%" height={14} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

// Standalone loading page component
export const ContentLoadingPage: React.FC<{
  type: 'watchlist' | 'watched';
}> = ({ type }) => {
  const config = {
    watchlist: {
      title: 'My Watchlist',
      subtitle: 'Loading your watchlist...',
    },
    watched: {
      title: 'Watched Content',
      subtitle: 'Loading your watched movies and TV shows...',
    },
  };

  return <ContentLoading {...config[type]} />;
};
