'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Welcome back, {session.user?.name || session.user?.email}!
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AppIcon icon="mdi:movie-check" size={24} color="primary" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      0
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Movies Watched
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AppIcon icon="mdi:bookmark" size={24} color="secondary" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      0
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    In Watchlist
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AppIcon icon="mdi:star" size={24} color="warning" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      0
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Movies Rated
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AppIcon icon="mdi:clock-outline" size={24} color="info" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      0h
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Watch Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No recent activity to show
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Favorite Genres
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Watch some movies to see your favorite genres
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}