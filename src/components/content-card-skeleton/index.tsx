'use client';

import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

export const ContentCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Poster Image Skeleton */}
      <Skeleton
        variant="rectangular"
        sx={{
          aspectRatio: '2/3',
          width: '100%',
        }}
      />

      {/* Content Skeleton */}
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title */}
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 0.5 }} />

        {/* Subtitle/Date */}
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={40} height={20} />
        </Box>

        {/* Genre tags */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const ContentGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </>
  );
};
