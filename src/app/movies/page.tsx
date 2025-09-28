'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { MainLayout } from '@core/components';
import MoviesPageView from '@/views/movies';
import { MovieSearchType } from '@core/enums';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { useMovieStatus } from '@/hooks/useMovieStatus';
import { movieService } from '@/services/movie.service';
import { Movie } from '@/types';

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

  const handleAddToWatchlist = async (movie: Partial<Movie>) => {
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
        inWatchlist ? 'Failed to remove from watchlist' : 'Failed to add to watchlist',
        'error',
      );
    }
  };

  const handleMarkAsWatched = async (movie: Partial<Movie>) => {
    if (!session) {
      showToast('Please login to mark as watched', 'warning');
      return;
    }
    if (!movie.tmdbId) return;

    const watched = isWatched(movie.tmdbId);
    try {
      if (watched) {
        showToast('Already marked as watched', 'info');
      } else {
        await movieService.markAsWatched(movie);
        markAsWatched(movie.tmdbId);
        showToast('Marked as watched', 'success');
      }
    } catch {
      showToast('Failed to mark as watched', 'error');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMovies(searchQuery, newPage);
  };

  const handleBrowsePopular = () => {
    setSearchType(MovieSearchType.POPULAR);
    setSearchQuery('');
    fetchMovies('', 1, MovieSearchType.POPULAR);
  };

  return (
    <MainLayout>
      <MoviesPageView
        movies={movies}
        loading={loading}
        searchQuery={searchQuery}
        searchType={searchType}
        page={page}
        totalPages={totalPages}
        isInWatchlist={isInWatchlist}
        isWatched={isWatched}
        onSearchChange={handleSearchChange}
        onSearch={(query) => {
          setSearchType(MovieSearchType.SEARCH);
          fetchMovies(query, 1, MovieSearchType.SEARCH);
        }}
        onTabChange={handleTabChange}
        onPageChange={handlePageChange}
        onAddToWatchlist={handleAddToWatchlist}
        onMarkAsWatched={handleMarkAsWatched}
        onBrowsePopular={handleBrowsePopular}
      />
    </MainLayout>
  );
}
