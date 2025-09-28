'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

import { Box, Container, Grid, Typography, Chip } from '@mui/material';

import { ContentCard, ContentCardSkeleton } from '@/components/content-card';
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
import { useMovieStatus } from '@/hooks/useMovieStatus';
import { movieService } from '@/services/movie.service';
import type { Movie } from '@/types';

interface ContentItem {
  id: number;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
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

const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

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

export default function BrowsePage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { addToWatchlist, removeFromWatchlist, markAsWatched, isInWatchlist, isWatched } =
    useMovieStatus();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy] = useState<string>('popular');
  const [selectedGenre, setSelectedGenre] = useState<SelectOption | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        type: mediaType,
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
        setContent(data.results);
        setTotalPages(data.totalPages || 0);
        setTotalResults(data.totalResults || 0);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      showToast('Failed to fetch content', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, mediaType, sortBy, debouncedSearchQuery, selectedGenre, showToast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleTabChange = (tabId: string) => {
    const newType = tabId as 'all' | 'movie' | 'tv';
    if (newType !== mediaType) {
      setMediaType(newType);
      setSelectedGenre(null); // Reset genre when changing media type
      setPage(1);
    }
  };

  const handleGenreChange = (option: SelectOption | null) => {
    setSelectedGenre(option);
    setPage(1);
  };

  const getGenreList = () => {
    if (mediaType === 'tv') return TV_GENRES;
    if (mediaType === 'movie') return MOVIE_GENRES;
    // For 'all', combine unique genres
    const combined = [...MOVIE_GENRES, ...TV_GENRES];
    const unique = combined.filter(
      (genre, index, self) => index === self.findIndex((g) => g.id === genre.id),
    );
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getTabItems = (): AppTabItem[] => [
    {
      id: 'all',
      label: 'All',
      icon: 'mdi:all-inclusive',
      content: renderContent(),
    },
    {
      id: 'movie',
      label: 'Movies',
      icon: 'mdi:movie-open-outline',
      content: renderContent(),
    },
    {
      id: 'tv',
      label: 'TV Shows',
      icon: 'mdi:television-classic',
      content: renderContent(),
    },
  ];

  const handleContentAction = async (item: ContentItem, action: 'watchlist' | 'watched') => {
    if (!session) {
      showToast(
        `Please login to ${action === 'watchlist' ? 'add to watchlist' : 'mark as watched'}`,
        'warning',
      );
      return;
    }

    // For now, only handle movies (until TV support is added)
    if (item.mediaType === 'tv') {
      showToast('TV show support coming soon!', 'info');
      return;
    }

    try {
      if (action === 'watchlist') {
        const inWatchlist = isInWatchlist(item.tmdbId);
        if (inWatchlist) {
          await movieService.removeFromWatchlist(item.tmdbId);
          removeFromWatchlist(item.tmdbId);
          showToast('Removed from watchlist', 'success');
        } else {
          await movieService.addToWatchlist(item as Partial<Movie>);
          addToWatchlist(item.tmdbId);
          showToast('Added to watchlist', 'success');
        }
      } else {
        const watched = isWatched(item.tmdbId);
        if (watched) {
          showToast('Already marked as watched', 'info');
        } else {
          await movieService.markAsWatched(item as Partial<Movie>);
          markAsWatched(item.tmdbId);
          showToast('Marked as watched', 'success');
        }
      }
    } catch {
      showToast(
        `Failed to ${action === 'watchlist' ? 'update watchlist' : 'mark as watched'}`,
        'error',
      );
    }
  };

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
            Browse
          </Typography>

          <AppSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            placeholder={`Search for ${mediaType === 'all' ? 'movies and TV shows' : mediaType === 'movie' ? 'movies' : 'TV shows'}...`}
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
                  ...getGenreList().map((genre) => ({
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
                Found {totalResults} results
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
              defaultTab={mediaType}
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
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                <ContentCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : content.length === 0 ? (
          <AppEmptyState
            icon="mdi:movie-search-outline"
            title={searchQuery ? 'No results found' : 'No content available'}
            description={
              searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start searching or browse popular content'
            }
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {content.map((item) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  key={`${item.mediaType}-${item.tmdbId}`}
                >
                  <ContentCard
                    item={item}
                    isInWatchlist={item.mediaType === 'movie' && isInWatchlist(item.tmdbId)}
                    isWatched={item.mediaType === 'movie' && isWatched(item.tmdbId)}
                    onAddToWatchlist={() => handleContentAction(item, 'watchlist')}
                    onMarkAsWatched={() => handleContentAction(item, 'watched')}
                  />
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
