'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

import {
  Box,
  Container,
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';

import { ContentCard } from '@/components/content-card';
import { AppIcon } from '@core/components/app-icon';
import { AppSearchBar } from '@core/components/app-search-bar';
import { AppPagination } from '@core/components/app-pagination';
import { AppEmptyState } from '@core/components/app-empty-state';
import { MainLayout } from '@core/components/layout/main-layout';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

interface TVShow {
  id: number;
  tmdbId: number;
  mediaType: 'tv';
  title: string;
  overview?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  date?: string;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  genreIds?: number[];
}

interface Genre {
  id: number;
  name: string;
}

const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

export default function TVPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchTVShows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        mediaType: 'tv',
        sortBy: sortBy,
      });

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }

      if (selectedGenre) {
        params.append('genres', selectedGenre);
      }

      const response = await fetch(`/api/browse?${params}`);
      const data = await response.json();

      if (data.results) {
        const transformedShows = data.results.map((show: any) => ({
          id: show.id,
          tmdbId: show.id,
          mediaType: 'tv' as const,
          title: show.name || show.original_name,
          overview: show.overview,
          posterPath: show.poster_path,
          backdropPath: show.backdrop_path,
          date: show.first_air_date,
          voteAverage: show.vote_average,
          voteCount: show.vote_count,
          popularity: show.popularity,
          genreIds: show.genre_ids,
        }));
        setTvShows(transformedShows);
        setTotalPages(data.totalPages || 0);
        setTotalResults(data.totalResults || 0);
      }
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      showToast('Failed to fetch TV shows', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, debouncedSearchQuery, selectedGenre, showToast]);

  useEffect(() => {
    fetchTVShows();
  }, [fetchTVShows]);

  const handleSortChange = (_: React.MouseEvent<HTMLElement>, newSort: string | null) => {
    if (newSort) {
      setSortBy(newSort);
      setPage(1);
    }
  };

  const handleGenreChange = (event: { target: { value: string } }) => {
    setSelectedGenre(event.target.value);
    setPage(1);
  };

  const getSortOptions = () => [
    { value: 'popular', label: 'Popular', icon: 'mdi:fire' },
    { value: 'trending', label: 'Trending', icon: 'mdi:trending-up' },
    { value: 'top_rated', label: 'Top Rated', icon: 'mdi:star' },
    { value: 'on_the_air', label: 'On The Air', icon: 'mdi:broadcast' },
    { value: 'airing_today', label: 'Airing Today', icon: 'mdi:calendar-today' },
  ];

  const handleTVAction = async (item: TVShow, action: 'watchlist' | 'watched') => {
    if (!session) {
      showToast(
        `Please login to ${action === 'watchlist' ? 'add to watchlist' : 'mark as watched'}`,
        'warning',
      );
      return;
    }

    // TV show support coming soon
    showToast('TV show support coming soon!', 'info');
  };

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            TV Shows
          </Typography>

          {/* Search Bar */}
          <AppSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            placeholder="Search for TV shows..."
            loading={loading}
            sx={{ mb: 3 }}
          />

          {/* Filters */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            {/* Sort and Genre Row */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              {/* Sort Options */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Sort By
                  </Typography>
                  <Chip
                    label="TV Filters"
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                <ToggleButtonGroup
                  value={sortBy}
                  exclusive
                  onChange={handleSortChange}
                  aria-label="sort by"
                  fullWidth
                  sx={{
                    '& .MuiToggleButton-root': {
                      py: 1,
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  {getSortOptions().map((option) => (
                    <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AppIcon icon={option.icon} size={18} />
                        <span>{option.label}</span>
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Genre Filter */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 250px' } }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Genre
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedGenre}
                    onChange={handleGenreChange}
                    displayEmpty
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <MenuItem value="">
                      <em>All Genres</em>
                    </MenuItem>
                    {TV_GENRES.map((genre) => (
                      <MenuItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Stack>

          {/* Results Info */}
          {!loading && totalResults > 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Found {totalResults} TV shows
              </Typography>
              {selectedGenre && (
                <Chip
                  label={TV_GENRES.find((g) => g.id.toString() === selectedGenre)?.name}
                  size="small"
                  onDelete={() => setSelectedGenre('')}
                />
              )}
            </Box>
          )}

          {/* Content Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 12 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <Box
                    sx={{
                      height: 400,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.6 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.6 },
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : tvShows.length === 0 ? (
            <AppEmptyState
              icon="mdi:television-classic"
              title={searchQuery ? 'No TV shows found' : 'No TV shows available'}
              description={
                searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Start searching or browse popular TV shows'
              }
            />
          ) : (
            <>
              <Grid container spacing={3}>
                {tvShows.map((tvShow) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`tv-${tvShow.tmdbId}`}>
                    <ContentCard item={tvShow} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <AppPagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalResults}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  showInfo
                  position="center"
                />
              )}
            </>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
