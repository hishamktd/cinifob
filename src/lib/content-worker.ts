interface PrefetchRequest {
  id: number;
  type: 'movie' | 'tv';
  priority: 'high' | 'low';
}

class ContentPrefetchWorker {
  private queue: PrefetchRequest[] = [];
  private processing = false;
  private processedIds = new Set<string>();
  private failedIds = new Map<string, number>(); // key -> retry count

  async prefetchContent(id: number, type: 'movie' | 'tv', priority: 'high' | 'low' = 'low') {
    const key = `${type}-${id}`;

    // Skip if already processed successfully
    if (this.processedIds.has(key)) {
      return;
    }

    // Skip if failed too many times
    const retryCount = this.failedIds.get(key) || 0;
    if (retryCount >= 3) {
      return;
    }

    // Check if already in queue
    const existingIndex = this.queue.findIndex((item) => item.id === id && item.type === type);
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
    this.queue.push({ id, type, priority });
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

      const key = `${item.type}-${item.id}`;

      try {
        // Fetch main content
        const endpoint = item.type === 'movie' ? `/api/movies/${item.id}` : `/api/tv/${item.id}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'X-Prefetch': 'true', // Mark as prefetch request
          },
        });

        if (response.ok) {
          this.processedIds.add(key);
          this.failedIds.delete(key);
          console.log(`✅ Prefetched ${item.type} ${item.id}`);

          // Also prefetch related content in background with low priority
          this.prefetchRelated(item.id, item.type);
        } else {
          throw new Error(`Failed to prefetch: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to prefetch ${item.type} ${item.id}:`, error);
        const retryCount = (this.failedIds.get(key) || 0) + 1;
        this.failedIds.set(key, retryCount);
      }

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.processing = false;
  }

  private async prefetchRelated(id: number, type: 'movie' | 'tv') {
    try {
      // Prefetch related content with a delay
      setTimeout(async () => {
        const response = await fetch(`/api/content/${type}/${id}/related?type=similar&limit=6`, {
          method: 'GET',
          headers: {
            'X-Prefetch': 'true',
          },
        });

        if (response.ok) {
          console.log(`✅ Prefetched related content for ${type} ${id}`);
        }
      }, 2000); // 2 second delay for related content
    } catch (error) {
      console.error(`Failed to prefetch related content for ${type} ${id}:`, error);
    }
  }

  // Batch prefetch multiple items (e.g., from a list view)
  async prefetchBatch(
    items: Array<{ id: number; type: 'movie' | 'tv' }>,
    priority: 'high' | 'low' = 'low',
  ) {
    for (const item of items) {
      this.prefetchContent(item.id, item.type, priority);
    }
  }

  // Clear processed cache (call periodically to free memory)
  clearCache() {
    this.processedIds.clear();
    this.failedIds.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      processed: this.processedIds.size,
      failed: this.failedIds.size,
      queued: this.queue.length,
      processing: this.processing,
    };
  }
}

// Create singleton instance
export const contentPrefetchWorker = new ContentPrefetchWorker();

// Clear cache every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      contentPrefetchWorker.clearCache();
      console.log('🧹 Cleared prefetch cache');
    },
    30 * 60 * 1000,
  );
}
