'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import {
  Box,
  Container,
  Grid,
  Pagination,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material';

import { MovieCard } from '@/components/movie/movie-card';
import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { MovieSearchType } from '@core/enums';
import { useToast } from '@/hooks/useToast';
import { movieService } from '@/services/movie.service';
import { Movie } from '@/types';

export default function MoviesPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Partial<Movie>[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<MovieSearchType>(MovieSearchType.POPULAR);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchMovies = async (query?: string, pageNum = 1, type = searchType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        type,
      });
      if (query) {
        params.append('query', query);
      }

      const response = await fetch(`/api/movies/search?${params}`);
      const data = await response.json();

      if (data.movies) {
        setMovies(data.movies);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies('', 1, searchType);
  }, [searchType]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPage(1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (query) {
        setSearchType(MovieSearchType.SEARCH);
        fetchMovies(query, 1, MovieSearchType.SEARCH);
      } else {
        fetchMovies('', 1, searchType);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    fetchMovies(searchQuery, value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: string | null) => {
    if (newType && newType !== searchType) {
      setSearchType(newType);
      setSearchQuery('');
      setPage(1);
    }
  };

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Browse Movies
          </Typography>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AppIcon icon="mdi:magnify" />
                  </InputAdornment>
                ),
              }}
            />

            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={handleTypeChange}
              aria-label="movie type"
            >
              <ToggleButton value={MovieSearchType.POPULAR} aria-label="popular">
                Popular
              </ToggleButton>
              <ToggleButton value={MovieSearchType.TRENDING} aria-label="trending">
                Trending
              </ToggleButton>
              <ToggleButton value={MovieSearchType.UPCOMING} aria-label="upcoming">
                Upcoming
              </ToggleButton>
              <ToggleButton value={MovieSearchType.NOW_PLAYING} aria-label="now playing">
                Now Playing
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {movies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie.tmdbId}>
                    <MovieCard
                      movie={movie}
                      onAddToWatchlist={async () => {
                        if (!session) {
                          showToast('Please login to add to watchlist', 'warning');
                          return;
                        }
                        try {
                          await movieService.addToWatchlist(movie);
                          showToast('Added to watchlist', 'success');
                        } catch (error: any) {
                          showToast(error.message || 'Failed to add to watchlist', 'error');
                        }
                      }}
                      onMarkAsWatched={async () => {
                        if (!session) {
                          showToast('Please login to mark as watched', 'warning');
                          return;
                        }
                        try {
                          await movieService.markAsWatched(movie);
                          showToast('Marked as watched', 'success');
                        } catch (error: any) {
                          showToast(error.message || 'Failed to mark as watched', 'error');
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}