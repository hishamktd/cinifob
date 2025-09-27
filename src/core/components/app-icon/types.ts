import { IconProps as IconifyProps } from '@iconify/react';

export interface AppIconProps extends Omit<IconifyProps, 'icon'> {
  icon: string;
  size?: number;
}
