'use client';

import React, { useState, useEffect } from 'react';

import {
  Box,
  Typography,
  Grid,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';

import { ContentCard } from '@/components/content-card';
import { AppIcon } from '@core/components/app-icon';
import { useToast } from '@/hooks/useToast';
import { useMovieStatus } from '@/hooks/useMovieStatus';
import { movieService } from '@/services/movie.service';

interface ContentItem {
  id: number;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  overview?: string;
  posterPath?: string | null;
  date?: string;
  voteAverage?: number;
  relationType?: string;
}

interface RelatedContentProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  title?: string;
  maxItems?: number;
  showTypeFilter?: boolean;
}

export const RelatedContent = ({
  contentId,
  contentType,
  title = 'Related Content',
  maxItems = 8,
  showTypeFilter = true,
}: RelatedContentProps) => {
  // const router = useRouter(); // Unused variable
  const { showToast } = useToast();
  const { addToWatchlist, removeFromWatchlist, markAsWatched, isInWatchlist, isWatched } =
    useMovieStatus();

  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [relationType, setRelationType] = useState<'both' | 'similar' | 'recommendations'>('both');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchRelatedContent();
  }, [contentId, contentType, relationType]);

  const fetchRelatedContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/content/${contentType}/${contentId}/related?relationType=${relationType}`,
      );
      const data = await response.json();

      if (data.results) {
        setRelatedContent(data.results);
      }
    } catch (error) {
      console.error('Error fetching related content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentAction = async (item: ContentItem, action: 'watchlist' | 'watched') => {
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
          await movieService.addToWatchlist({
            ...item,
            posterPath: item.posterPath || undefined,
          });
          addToWatchlist(item.tmdbId);
          showToast('Added to watchlist', 'success');
        }
      } else {
        const watched = isWatched(item.tmdbId);
        if (watched) {
          showToast('Already marked as watched', 'info');
        } else {
          await movieService.markAsWatched({
            ...item,
            posterPath: item.posterPath || undefined,
          });
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

  const displayedContent = showAll ? relatedContent : relatedContent.slice(0, maxItems);

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (relatedContent.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Card sx={{ bgcolor: 'background.default' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AppIcon icon="mdi:movie-search-outline" size={48} color="text.disabled" />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              No related content found
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{title}</Typography>

        {showTypeFilter && (
          <ToggleButtonGroup
            value={relationType}
            exclusive
            onChange={(_, newType) => newType && setRelationType(newType)}
            size="small"
          >
            <ToggleButton value="both" aria-label="both">
              <AppIcon icon="mdi:all-inclusive" size={18} style={{ marginRight: 4 }} />
              All
            </ToggleButton>
            <ToggleButton value="similar" aria-label="similar">
              <AppIcon icon="mdi:approximately-equal" size={18} style={{ marginRight: 4 }} />
              Similar
            </ToggleButton>
            <ToggleButton value="recommendations" aria-label="recommendations">
              <AppIcon icon="mdi:thumb-up" size={18} style={{ marginRight: 4 }} />
              Recommended
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      <Grid container spacing={3}>
        {displayedContent.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${item.mediaType}-${item.tmdbId}`}>
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

      {relatedContent.length > maxItems && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => setShowAll(!showAll)}
            endIcon={<AppIcon icon={showAll ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
          >
            {showAll ? 'Show Less' : `Show All (${relatedContent.length})`}
          </Button>
        </Box>
      )}
    </Box>
  );
};
