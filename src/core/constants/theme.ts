export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: '50%',
} as const;

export const Z_INDEX = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];
export type Breakpoint = keyof typeof BREAKPOINTS;
export type Spacing = keyof typeof SPACING;
export type BorderRadius = keyof typeof BORDER_RADIUS;
