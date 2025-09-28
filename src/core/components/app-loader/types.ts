export interface AppLoaderProps {
  type?: 'circular' | 'linear' | 'skeleton' | 'dots';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  skeletonVariant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  skeletonLines?: number;
  skeletonHeight?: number | string;
  skeletonWidth?: number | string;
}
