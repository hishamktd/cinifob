export interface AppEmptyStateProps {
  icon?: string;
  iconSize?: number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
  variant?: 'default' | 'minimal' | 'illustration';
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
}
