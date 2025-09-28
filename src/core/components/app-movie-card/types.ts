import { Movie } from '@/types';

export interface AppMovieCardProps {
  movie: Partial<Movie>;
  onAddToWatchlist?: () => void;
  onMarkAsWatched?: () => void;
  onRatingChange?: (rating: number | null) => void;
  showActions?: boolean;
  showRating?: boolean;
  userRating?: number | null;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact';
  enablePrefetch?: boolean;
}
