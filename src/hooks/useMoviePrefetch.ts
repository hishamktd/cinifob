import { useCallback, useRef } from 'react';
import { moviePrefetchWorker } from '@/lib/movie-worker';

interface UseMoviePrefetchOptions {
  delay?: number; // Delay before prefetching (ms)
  priority?: 'high' | 'low';
}

export function useMoviePrefetch(options: UseMoviePrefetchOptions = {}) {
  const { delay = 300, priority = 'low' } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const prefetchMovie = useCallback(
    (tmdbId: number | undefined) => {
      if (!tmdbId) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        moviePrefetchWorker.prefetchMovie(tmdbId, priority);
      }, delay);
    },
    [delay, priority],
  );

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const prefetchMovies = useCallback(
    (tmdbIds: number[], immediate = false) => {
      if (immediate) {
        moviePrefetchWorker.prefetchBatch(tmdbIds, priority);
      } else {
        timeoutRef.current = setTimeout(() => {
          moviePrefetchWorker.prefetchBatch(tmdbIds, priority);
        }, delay);
      }
    },
    [delay, priority],
  );

  return {
    prefetchMovie,
    cancelPrefetch,
    prefetchMovies,
  };
}
