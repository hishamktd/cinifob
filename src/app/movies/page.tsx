'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { Box, Container, Grid, Typography } from '@mui/material';

import { AppPagination, AppSearchBar, AppEmptyState, MainLayout, AppTabs } from '@core/components';
import { ContentCard, ContentCardSkeleton } from '@/components/content-card';
import { MovieSearchType } from '@core/enums';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { useMovieStatus } from '@/hooks/useMovieStatus';
import { movieService } from '@/services/movie.service';
import { Movie } from '@/types';
import { AppTabItem } from '@core/components/app-tabs';

export default function MoviesPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { addToWatchlist, removeFromWatchlist, markAsWatched, isInWatchlist, isWatched } =
    useMovieStatus();
  const [movies, setMovies] = useState<Partial<Movie>[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchType, setSearchType] = useState<MovieSearchType>(MovieSearchType.POPULAR);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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
    if (debouncedSearchQuery) {
      setSearchType(MovieSearchType.SEARCH);
      fetchMovies(debouncedSearchQuery, 1, MovieSearchType.SEARCH);
    } else if (searchType !== MovieSearchType.SEARCH) {
      fetchMovies('', 1, searchType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, searchType]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);

    if (!query && searchType === MovieSearchType.SEARCH) {
      setSearchType(MovieSearchType.POPULAR);
    }
  };

  const handleTabChange = (tabId: string) => {
    const newType = tabId as MovieSearchType;
    if (newType !== searchType) {
      setSearchType(newType);
      setSearchQuery('');
      setPage(1);
    }
  };

  const renderContent = () => {
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
        ) : movies.length === 0 ? (
          <AppEmptyState
            icon="mdi:movie-search-outline"
            title={searchQuery ? `No movies found for "${searchQuery}"` : 'No movies found'}
            description={
              searchQuery
                ? 'Try adjusting your search terms or browse our popular movies.'
                : 'Discover amazing movies by searching or browsing our collection.'
            }
            actionLabel="Browse Popular"
            actionIcon="mdi:fire"
            onAction={() => {
              setSearchType(MovieSearchType.POPULAR);
              setSearchQuery('');
              fetchMovies('', 1, MovieSearchType.POPULAR);
            }}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {movies.map((movie) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={movie.tmdbId}>
                  <ContentCard
                    item={{
                      id: movie.id || 0,
                      tmdbId: movie.tmdbId || 0,
                      mediaType: 'movie',
                      title: movie.title || 'Unknown Title',
                      overview: movie.overview,
                      posterPath: movie.posterPath,
                      backdropPath: movie.backdropPath,
                      date: movie.releaseDate?.toString(),
                      voteAverage: movie.voteAverage,
                      voteCount: movie.voteCount,
                      popularity: movie.popularity,
                      genreIds: Array.isArray(movie.genres)
                        ? typeof movie.genres[0] === 'object'
                          ? (movie.genres as unknown as { id: number }[]).map((g) => g.id)
                          : (movie.genres as (string | number)[]).map((g) => Number(g))
                        : undefined,
                    }}
                    isInWatchlist={movie.tmdbId ? isInWatchlist(movie.tmdbId) : false}
                    isWatched={movie.tmdbId ? isWatched(movie.tmdbId) : false}
                    onAddToWatchlist={async () => {
                      if (!session) {
                        showToast('Please login to add to watchlist', 'warning');
                        return;
                      }
                      if (!movie.tmdbId) return;

                      const inWatchlist = isInWatchlist(movie.tmdbId);
                      try {
                        if (inWatchlist) {
                          await movieService.removeFromWatchlist(movie.tmdbId);
                          removeFromWatchlist(movie.tmdbId);
                          showToast('Removed from watchlist', 'success');
                        } else {
                          await movieService.addToWatchlist(movie);
                          addToWatchlist(movie.tmdbId);
                          showToast('Added to watchlist', 'success');
                        }
                      } catch {
                        showToast(
                          inWatchlist
                            ? 'Failed to remove from watchlist'
                            : 'Failed to add to watchlist',
                          'error',
                        );
                      }
                    }}
                    onMarkAsWatched={async () => {
                      if (!session) {
                        showToast('Please login to mark as watched', 'warning');
                        return;
                      }
                      if (!movie.tmdbId) return;

                      const watched = isWatched(movie.tmdbId);
                      try {
                        if (watched) {
                          // For now, we don't have an unwatch API, so just show message
                          showToast('Already marked as watched', 'info');
                        } else {
                          await movieService.markAsWatched(movie);
                          markAsWatched(movie.tmdbId);
                          showToast('Marked as watched', 'success');
                        }
                      } catch {
                        showToast('Failed to mark as watched', 'error');
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  fetchMovies(searchQuery, newPage);
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
  };

  const getTabItems = (): AppTabItem[] => [
    {
      id: MovieSearchType.POPULAR,
      label: 'Popular',
      icon: 'mdi:fire',
      content: renderContent(),
    },
    {
      id: MovieSearchType.NOW_PLAYING,
      label: 'Now Playing',
      icon: 'mdi:play-circle',
      content: renderContent(),
    },
    {
      id: MovieSearchType.UPCOMING,
      label: 'Upcoming',
      icon: 'mdi:calendar-clock',
      content: renderContent(),
    },
    {
      id: MovieSearchType.TOP_RATED,
      label: 'Top Rated',
      icon: 'mdi:star',
      content: renderContent(),
    },
  ];

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Browse Movies
          </Typography>

          <AppSearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={(query) => {
              setSearchType(MovieSearchType.SEARCH);
              fetchMovies(query, 1, MovieSearchType.SEARCH);
            }}
            placeholder="Search for movies..."
            loading={loading}
            sx={{ mb: 3, width: '100%' }}
          />

          {searchQuery ? (
            <Box sx={{ mb: 4 }}>{renderContent()}</Box>
          ) : (
            <AppTabs
              tabs={getTabItems()}
              defaultTab={searchType}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 4 }}
            />
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
