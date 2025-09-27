'use client';

import React, { useState } from 'react';

import { Box, Button, Card, CardContent, Grid, Paper, Typography } from '@mui/material';

import { AppDatePicker } from '@core/components/app-date-picker';
import { AppIcon } from '@core/components/app-icon';
import { AppSelect, SelectOption } from '@core/components/app-select';
import { MainLayout } from '@core/components/layout/main-layout';

export default function Home() {
  const [selectedValue, setSelectedValue] = useState<SelectOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const options: SelectOption[] = [
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'horror', label: 'Horror' },
    { value: 'scifi', label: 'Science Fiction' },
  ];

  return (
    <MainLayout>
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to CiniFob
        </Typography>
        <Typography variant="h5" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Track your movies, manage your watchlist, and discover new films
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppIcon icon="solar:play-circle-bold" size={32} color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Track Movies
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Keep track of all the movies you have watched and rate them
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppIcon icon="solar:bookmark-bold" size={32} color="secondary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Watchlist
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Save movies to watch later and never miss a great film
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppIcon icon="solar:chart-bold" size={32} color="success" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Statistics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View your watching habits and discover your favorite genres
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 4, mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Component Demo
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <AppSelect
                label="Select Genre"
                placeholder="Choose a genre"
                options={options}
                value={selectedValue}
                onChange={(value) => setSelectedValue(value as SelectOption)}
                isClearable
                required
                helperText="Select your favorite movie genre"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <AppDatePicker
                label="Watch Date"
                value={selectedDate}
                onChange={setSelectedDate}
                maxDate={new Date()}
                required
                helperText="When did you watch this movie?"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" startIcon={<AppIcon icon="solar:add-circle-bold" />}>
                  Add to Watchlist
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AppIcon icon="solar:play-circle-linear" />}
                >
                  Mark as Watched
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  startIcon={<AppIcon icon="solar:heart-linear" />}
                >
                  Add to Favorites
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MainLayout>
  );
}