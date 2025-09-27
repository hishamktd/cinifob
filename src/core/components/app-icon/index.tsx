'use client';

import React from 'react';

import { Icon as IconifyIcon } from '@iconify/react';

import { AppIconProps } from './types';

export const AppIcon = ({ icon, size = 24, width, height, ...props }: AppIconProps) => {
  return <IconifyIcon icon={icon} width={width || size} height={height || size} {...props} />;
};

export type { AppIconProps } from './types';