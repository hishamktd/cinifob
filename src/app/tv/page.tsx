'use client';

import React, { useEffect, useState, useCallback } from 'react';

import { Box, Container, Grid, Typography, Chip } from '@mui/material';

import { ContentCard } from '@/components/content-card';
import {
  AppSearchBar,
  AppPagination,
  AppEmptyState,
  MainLayout,
  AppTabs,
  AppSelect,
  type AppTabItem,
} from '@core/components';
import type { SelectOption } from '@core/components/app-select/types';
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
  const { showToast } = useToast();

  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [selectedGenre, setSelectedGenre] = useState<SelectOption | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchTVShows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        type: 'tv',
        sort: sortBy,
      });

      if (debouncedSearchQuery) {
        params.append('query', debouncedSearchQuery);
      }

      if (selectedGenre) {
        params.append('genre', selectedGenre.value.toString());
      }

      const response = await fetch(`/api/browse?${params}`);
      const data = await response.json();

      if (data.results) {
        // The API already returns data in the correct format
        const transformedShows = data.results.map(
          (show: {
            id?: number;
            tmdbId?: number;
            name?: string;
            title?: string;
            posterPath?: string;
            poster_path?: string;
            overview?: string;
            firstAirDate?: string;
            first_air_date?: string;
            voteAverage?: number;
            vote_average?: number;
          }) => ({
            id: show.id || show.tmdbId,
            tmdbId: show.tmdbId || show.id,
            mediaType: 'tv' as const,
            title: show.title || show.name,
            overview: show.overview,
            posterPath: show.posterPath,
            backdropPath: show.backdropPath,
            date: show.date,
            voteAverage: show.voteAverage,
            voteCount: show.voteCount,
            popularity: show.popularity,
            genreIds: show.genreIds,
          }),
        );
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

  const handleTabChange = (tabId: string) => {
    if (tabId !== sortBy) {
      setSortBy(tabId);
      setPage(1);
    }
  };

  const handleGenreChange = (option: SelectOption | null) => {
    setSelectedGenre(option);
    setPage(1);
  };

  const getTabItems = (): AppTabItem[] => [
    {
      id: 'popular',
      label: 'Popular',
      icon: 'mdi:fire',
      content: renderContent(),
    },
    {
      id: 'on_the_air',
      label: 'On The Air',
      icon: 'mdi:broadcast',
      content: renderContent(),
    },
    {
      id: 'airing_today',
      label: 'Airing Today',
      icon: 'mdi:calendar-today',
      content: renderContent(),
    },
    {
      id: 'top_rated',
      label: 'Top Rated',
      icon: 'mdi:star',
      content: renderContent(),
    },
  ];

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            TV Shows
          </Typography>

          <AppSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            placeholder="Search for TV shows..."
            loading={loading}
            sx={{ mb: 3, width: '100%' }}
          />

          {/* Genre Filter */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { xs: '100%', sm: 300 } }}>
              <AppSelect
                label="Genre"
                placeholder="All Genres"
                isClearable
                value={selectedGenre}
                onChange={(newValue) => handleGenreChange(newValue as SelectOption | null)}
                options={[
                  ...TV_GENRES.map((genre) => ({
                    value: genre.id.toString(),
                    label: genre.name,
                  })),
                ]}
                fullWidth
              />
            </Box>
          </Box>

          {/* Results Info */}
          {!loading && totalResults > 0 && (
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Found {totalResults} TV shows
              </Typography>
              {selectedGenre && (
                <Chip
                  label={selectedGenre.label}
                  size="small"
                  onDelete={() => setSelectedGenre(null)}
                />
              )}
            </Box>
          )}

          {searchQuery ? (
            <Box sx={{ mb: 4 }}>{renderContent()}</Box>
          ) : (
            <AppTabs
              tabs={getTabItems()}
              defaultTab={sortBy}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 4 }}
            />
          )}
        </Box>
      </Container>
    </MainLayout>
  );

  function renderContent() {
    return (
      <>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 12 }).map((_, index) => (
              <Grid size={{ xs: 4, sm: 6, md: 4, lg: 3 }} key={index}>
                <Box
                  sx={{
                    height: 400,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
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
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {tvShows.map((tvShow) => (
                <Grid size={{ xs: 4, sm: 6, md: 4, lg: 3 }} key={`tv-${tvShow.tmdbId}`}>
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
      </>
    );
  }
}
