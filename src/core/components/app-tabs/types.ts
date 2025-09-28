import { ReactNode } from 'react';
import { TabsProps, SxProps, Theme } from '@mui/material';

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface AppTabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

export interface AppTabsProps {
  tabs: AppTabItem[];
  defaultTab?: string;
  orientation?: TabsProps['orientation'];
  variant?: TabsProps['variant'];
  centered?: boolean;
  onChange?: (tabId: string) => void;
  sx?: SxProps<Theme>;
  tabsSx?: SxProps<Theme>;
  panelSx?: SxProps<Theme>;
  indicatorColor?: TabsProps['indicatorColor'];
  textColor?: TabsProps['textColor'];
}
