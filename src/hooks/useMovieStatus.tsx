'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface MovieStatusContextType {
  watchlistIds: Set<number>;
  watchedIds: Set<number>;
  isInWatchlist: (tmdbId: number) => boolean;
  isWatched: (tmdbId: number) => boolean;
  addToWatchlist: (tmdbId: number) => void;
  removeFromWatchlist: (tmdbId: number) => void;
  markAsWatched: (tmdbId: number) => void;
  unmarkAsWatched: (tmdbId: number) => void;
  refreshStatus: () => Promise<void>;
}

const MovieStatusContext = createContext<MovieStatusContextType | undefined>(undefined);

export function MovieStatusProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());

  const fetchMovieStatus = useCallback(async () => {
    if (status !== 'authenticated') {
      setWatchlistIds(new Set());
      setWatchedIds(new Set());
      return;
    }

    try {
      const response = await fetch('/api/user/movie-status');
      if (response.ok) {
        const data = await response.json();
        setWatchlistIds(new Set(data.watchlist));
        setWatchedIds(new Set(data.watched));
      }
    } catch (error) {
      console.error('Error fetching movie status:', error);
    }
  }, [status]);

  useEffect(() => {
    fetchMovieStatus();
  }, [fetchMovieStatus]);

  const isInWatchlist = useCallback(
    (tmdbId: number) => {
      return watchlistIds.has(tmdbId);
    },
    [watchlistIds],
  );

  const isWatched = useCallback(
    (tmdbId: number) => {
      return watchedIds.has(tmdbId);
    },
    [watchedIds],
  );

  const addToWatchlist = useCallback((tmdbId: number) => {
    setWatchlistIds((prev) => new Set([...prev, tmdbId]));
    // Remove from watched if it was there
    setWatchedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tmdbId);
      return newSet;
    });
  }, []);

  const removeFromWatchlist = useCallback((tmdbId: number) => {
    setWatchlistIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tmdbId);
      return newSet;
    });
  }, []);

  const markAsWatched = useCallback((tmdbId: number) => {
    setWatchedIds((prev) => new Set([...prev, tmdbId]));
    // Remove from watchlist if it was there
    setWatchlistIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tmdbId);
      return newSet;
    });
  }, []);

  const unmarkAsWatched = useCallback((tmdbId: number) => {
    setWatchedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tmdbId);
      return newSet;
    });
  }, []);

  return (
    <MovieStatusContext.Provider
      value={{
        watchlistIds,
        watchedIds,
        isInWatchlist,
        isWatched,
        addToWatchlist,
        removeFromWatchlist,
        markAsWatched,
        unmarkAsWatched,
        refreshStatus: fetchMovieStatus,
      }}
    >
      {children}
    </MovieStatusContext.Provider>
  );
}

export function useMovieStatus() {
  const context = useContext(MovieStatusContext);
  if (!context) {
    // Return default values for SSR/test environments
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return {
        watchlistIds: new Set<number>(),
        watchedIds: new Set<number>(),
        isInWatchlist: () => false,
        isWatched: () => false,
        addToWatchlist: () => {},
        removeFromWatchlist: () => {},
        markAsWatched: () => {},
        unmarkAsWatched: () => {},
        refreshStatus: async () => {},
      };
    }
    throw new Error('useMovieStatus must be used within a MovieStatusProvider');
  }
  return context;
}
