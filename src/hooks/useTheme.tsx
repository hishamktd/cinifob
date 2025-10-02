import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'system' | 'auto';

export function useTheme() {
  const muiTheme = useMuiTheme();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load theme preference from localStorage
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode === 'dark') {
      setMode('dark');
    } else if (savedMode === 'system' || savedMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode === 'system' || savedMode === 'auto') {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  }, [mode]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    if (newMode === 'system' || newMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
      localStorage.setItem('theme-mode', newMode);
    } else if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
      localStorage.setItem('theme-mode', newMode);
    }
  }, []);

  const applyThemeOverrides = useCallback(
    (overrides: { palette?: { primary?: { main?: string } } }) => {
      const primaryMain = overrides.palette?.primary?.main;
      if (primaryMain) {
        setCustomColors((prev) => ({
          ...prev,
          primary: primaryMain,
        }));
      }
    },
    [],
  );

  const resetTheme = useCallback(() => {
    setMode('light');
    setCustomColors({});
    localStorage.removeItem('theme-mode');
  }, []);

  const getContrastText = useCallback((background: string) => {
    // Simple contrast calculation
    const hex = background.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, []);

  const spacing = useCallback((value: number) => {
    return `${value * 8}px`;
  }, []);

  const colors = useMemo(
    () => ({
      primary: customColors.primary || muiTheme.palette.primary.main,
      secondary: muiTheme.palette.secondary.main,
      background: muiTheme.palette.background.default,
      text: muiTheme.palette.text.primary,
    }),
    [muiTheme, customColors],
  );

  const breakpoints = useMemo(
    () => ({
      xs: muiTheme.breakpoints.values.xs,
      sm: muiTheme.breakpoints.values.sm,
      md: muiTheme.breakpoints.values.md,
      lg: muiTheme.breakpoints.values.lg,
      xl: muiTheme.breakpoints.values.xl,
    }),
    [muiTheme],
  );

  const variants = useMemo(
    () => ({
      button: {},
      card: {},
      paper: {},
    }),
    [],
  );

  return {
    mode,
    toggleTheme,
    setTheme,
    colors,
    breakpoints,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    applyThemeOverrides,
    resetTheme,
    variants,
    getContrastText,
    spacing,
    customColors,
    setCustomColors,
  };
}
