interface PrefetchRequest {
  tmdbId: number;
  priority: 'high' | 'low';
}

class MoviePrefetchWorker {
  private queue: PrefetchRequest[] = [];
  private processing = false;
  private processedIds = new Set<number>();
  private failedIds = new Map<number, number>(); // id -> retry count

  async prefetchMovie(tmdbId: number, priority: 'high' | 'low' = 'low') {
    // Skip if already processed successfully
    if (this.processedIds.has(tmdbId)) {
      return;
    }

    // Skip if failed too many times
    const retryCount = this.failedIds.get(tmdbId) || 0;
    if (retryCount >= 3) {
      return;
    }

    // Check if already in queue
    const existingIndex = this.queue.findIndex((item) => item.tmdbId === tmdbId);
    if (existingIndex !== -1) {
      // If priority is high and existing is low, upgrade priority
      if (priority === 'high' && this.queue[existingIndex].priority === 'low') {
        this.queue[existingIndex].priority = 'high';
        // Re-sort queue
        this.sortQueue();
      }
      return;
    }

    // Add to queue
    this.queue.push({ tmdbId, priority });
    this.sortQueue();

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      if (a.priority === b.priority) return 0;
      return a.priority === 'high' ? -1 : 1;
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      try {
        // Call our API endpoint which handles caching
        const response = await fetch(`/api/movies/${item.tmdbId}`, {
          method: 'GET',
          headers: {
            'X-Prefetch': 'true', // Mark as prefetch request
          },
        });

        if (response.ok) {
          this.processedIds.add(item.tmdbId);
          this.failedIds.delete(item.tmdbId);
          console.log(`✅ Prefetched movie ${item.tmdbId}`);
        } else {
          throw new Error(`Failed to prefetch: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to prefetch movie ${item.tmdbId}:`, error);
        const retryCount = (this.failedIds.get(item.tmdbId) || 0) + 1;
        this.failedIds.set(item.tmdbId, retryCount);
      }

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.processing = false;
  }

  // Batch prefetch multiple movies (e.g., from a list view)
  async prefetchBatch(tmdbIds: number[], priority: 'high' | 'low' = 'low') {
    for (const tmdbId of tmdbIds) {
      this.prefetchMovie(tmdbId, priority);
    }
  }

  // Clear processed cache (call periodically to free memory)
  clearCache() {
    this.processedIds.clear();
    this.failedIds.clear();
  }
}

// Create singleton instance
export const moviePrefetchWorker = new MoviePrefetchWorker();
