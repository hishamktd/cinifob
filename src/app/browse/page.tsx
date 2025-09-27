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

import { ContentCard, ContentCardSkeleton } from '@/components/content-card';
import { AppIcon, AppSearchBar, AppPagination, AppEmptyState, MainLayout } from '@core/components';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { useMovieStatus } from '@/hooks/useMovieStatus';
import { movieService } from '@/services/movie.service';

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
  const [sortBy, setSortBy] = useState<string>('popular');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
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
        params.append('genre', selectedGenre);
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

  const handleMediaTypeChange = (_: React.MouseEvent<HTMLElement>, newType: string | null) => {
    if (newType) {
      setMediaType(newType as 'all' | 'movie' | 'tv');
      setSelectedGenre(''); // Reset genre when changing media type
      setPage(1);
    }
  };

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

  const getSortOptions = () => {
    if (mediaType === 'movie') {
      return [
        { value: 'popular', label: 'Popular', icon: 'mdi:fire' },
        { value: 'trending', label: 'Trending', icon: 'mdi:trending-up' },
        { value: 'top_rated', label: 'Top Rated', icon: 'mdi:star' },
        { value: 'now_playing', label: 'Now Playing', icon: 'mdi:play-circle' },
        { value: 'upcoming', label: 'Upcoming', icon: 'mdi:calendar-clock' },
      ];
    } else if (mediaType === 'tv') {
      return [
        { value: 'popular', label: 'Popular', icon: 'mdi:fire' },
        { value: 'trending', label: 'Trending', icon: 'mdi:trending-up' },
        { value: 'top_rated', label: 'Top Rated', icon: 'mdi:star' },
        { value: 'on_the_air', label: 'On The Air', icon: 'mdi:broadcast' },
        { value: 'airing_today', label: 'Airing Today', icon: 'mdi:calendar-today' },
      ];
    }

    // For 'all' media type, show only common filters
    return [
      { value: 'popular', label: 'Popular', icon: 'mdi:fire' },
      { value: 'trending', label: 'Trending', icon: 'mdi:trending-up' },
      { value: 'top_rated', label: 'Top Rated', icon: 'mdi:star' },
    ];
  };

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
          await movieService.addToWatchlist(item);
          addToWatchlist(item.tmdbId);
          showToast('Added to watchlist', 'success');
        }
      } else {
        const watched = isWatched(item.tmdbId);
        if (watched) {
          showToast('Already marked as watched', 'info');
        } else {
          await movieService.markAsWatched(item);
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
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Browse
          </Typography>

          {/* Search Bar */}
          <AppSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            placeholder={`Search for ${mediaType === 'all' ? 'movies and TV shows' : mediaType === 'movie' ? 'movies' : 'TV shows'}...`}
            loading={loading}
            sx={{ mb: 3 }}
          />

          {/* Filters */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            {/* Media Type Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Content Type
              </Typography>
              <ToggleButtonGroup
                value={mediaType}
                exclusive
                onChange={handleMediaTypeChange}
                aria-label="media type"
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 1,
                  },
                }}
              >
                <ToggleButton value="all" aria-label="all">
                  <AppIcon icon="mdi:all-inclusive" size={20} style={{ marginRight: 8 }} />
                  All
                </ToggleButton>
                <ToggleButton value="movie" aria-label="movies">
                  <AppIcon icon="mdi:movie-open-outline" size={20} style={{ marginRight: 8 }} />
                  Movies
                </ToggleButton>
                <ToggleButton value="tv" aria-label="tv shows">
                  <AppIcon icon="mdi:television-classic" size={20} style={{ marginRight: 8 }} />
                  TV Shows
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Sort and Genre Row */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              {/* Sort Options */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Sort By
                  </Typography>
                  {mediaType !== 'all' && (
                    <Chip
                      label={mediaType === 'movie' ? 'Movie Filters' : 'TV Filters'}
                      size="small"
                      color={mediaType === 'movie' ? 'success' : 'error'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
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
                    {getGenreList().map((genre) => (
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
                Found {totalResults} results
              </Typography>
              {selectedGenre && (
                <Chip
                  label={getGenreList().find((g) => g.id.toString() === selectedGenre)?.name}
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
        </Box>
      </Container>
    </MainLayout>
  );
}
