import { useCallback, useRef } from 'react';
import { contentPrefetchWorker } from '@/lib/content-worker';

interface UseContentPrefetchOptions {
  delay?: number; // Delay before prefetching (ms)
  priority?: 'high' | 'low';
}

export function useContentPrefetch(options: UseContentPrefetchOptions = {}) {
  const { delay = 200, priority = 'low' } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const prefetchContent = useCallback(
    (id: number | undefined, type: 'movie' | 'tv') => {
      if (!id) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for delayed prefetch
      timeoutRef.current = setTimeout(() => {
        contentPrefetchWorker.prefetchContent(id, type, priority);
      }, delay);
    },
    [delay, priority],
  );

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const prefetchBatch = useCallback(
    (items: Array<{ id: number; type: 'movie' | 'tv' }>, immediate = false) => {
      if (immediate) {
        contentPrefetchWorker.prefetchBatch(items, priority);
      } else {
        timeoutRef.current = setTimeout(() => {
          contentPrefetchWorker.prefetchBatch(items, priority);
        }, delay);
      }
    },
    [delay, priority],
  );

  // Hover handlers for easy integration
  const handleHover = useCallback(
    (id: number | undefined, type: 'movie' | 'tv') => {
      prefetchContent(id, type);
    },
    [prefetchContent],
  );

  const handleHoverEnd = useCallback(() => {
    cancelPrefetch();
  }, [cancelPrefetch]);

  return {
    prefetchContent,
    cancelPrefetch,
    prefetchBatch,
    handleHover,
    handleHoverEnd,
  };
}
