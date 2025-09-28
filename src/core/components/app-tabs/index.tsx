'use client';

import React, { useState, useCallback, useMemo, SyntheticEvent } from 'react';
import { Box, Tab, Tabs, Typography, Badge } from '@mui/material';
import { AppIcon } from '@core/components/app-icon';
import { TabPanelProps, AppTabsProps } from './types';

const TabPanel = React.memo((props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

export const AppTabs = React.memo(
  ({
    tabs,
    defaultTab,
    orientation = 'horizontal',
    variant = 'standard',
    centered = false,
    onChange,
    sx,
    tabsSx,
    panelSx,
    indicatorColor = 'primary',
    textColor = 'inherit',
  }: AppTabsProps) => {
    const [value, setValue] = useState(() => {
      if (defaultTab) {
        const index = tabs.findIndex((tab) => tab.id === defaultTab);
        return index !== -1 ? index : 0;
      }
      return 0;
    });

    const handleChange = useCallback(
      (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (onChange && tabs[newValue]) {
          onChange(tabs[newValue].id);
        }
      },
      [onChange, tabs],
    );

    const a11yProps = useCallback((index: number): { id: string; 'aria-controls': string } => {
      return {
        id: `app-tab-${index}`,
        'aria-controls': `app-tabpanel-${index}`,
      };
    }, []);

    const tabItems = useMemo(() => {
      return tabs.map((tab, index) => (
        <Tab
          key={tab.id}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {tab.icon && <AppIcon icon={tab.icon} size={20} />}
              <Typography variant="body2">{tab.label}</Typography>
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge
                  badgeContent={tab.badge}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      position: 'static',
                      transform: 'none',
                      ml: 1,
                    },
                  }}
                />
              )}
            </Box>
          }
          disabled={tab.disabled}
          {...a11yProps(index)}
          sx={{
            textTransform: 'none',
            minHeight: 48,
          }}
        />
      ));
    }, [tabs, a11yProps]);

    const tabPanels = useMemo(() => {
      return tabs.map((tab, index) => (
        <TabPanel key={tab.id} value={value} index={index}>
          <Box sx={panelSx}>{tab.content}</Box>
        </TabPanel>
      ));
    }, [tabs, value, panelSx]);

    return (
      <Box
        sx={{
          width: '100%',
          display: orientation === 'vertical' ? 'flex' : 'block',
          ...sx,
        }}
      >
        <Tabs
          orientation={orientation}
          variant={variant}
          value={value}
          onChange={handleChange}
          centered={centered}
          indicatorColor={indicatorColor}
          textColor={textColor}
          aria-label="app tabs"
          sx={{
            borderBottom: orientation === 'horizontal' ? 1 : 0,
            borderRight: orientation === 'vertical' ? 1 : 0,
            borderColor: 'divider',
            minWidth: orientation === 'vertical' ? 200 : 'auto',
            '& .MuiTab-root': {
              fontWeight: 500,
              textTransform: 'none',
              '&.Mui-selected': {
                fontWeight: 600,
              },
            },
            ...tabsSx,
          }}
        >
          {tabItems}
        </Tabs>
        <Box sx={{ flex: 1, width: '100%' }}>{tabPanels}</Box>
      </Box>
    );
  },
);

AppTabs.displayName = 'AppTabs';

export type { AppTabItem, AppTabsProps, TabPanelProps } from './types';
