import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTheme } from '@/hooks/useTheme';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

const mockTheme = createTheme({
  palette: {
    mode: 'light'
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorageMock.getItem).mockReturnValue(null);
  });

  it('returns current theme mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe('light');
  });

  it('toggles theme mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe('light');
  });

  it('sets specific theme mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.mode).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.mode).toBe('light');
  });

  it('persists theme preference in localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'dark');
  });

  it('returns theme colors', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors).toHaveProperty('primary');
    expect(result.current.colors).toHaveProperty('secondary');
    expect(result.current.colors).toHaveProperty('background');
    expect(result.current.colors).toHaveProperty('text');
  });

  it('returns theme breakpoints', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.breakpoints).toHaveProperty('xs');
    expect(result.current.breakpoints).toHaveProperty('sm');
    expect(result.current.breakpoints).toHaveProperty('md');
    expect(result.current.breakpoints).toHaveProperty('lg');
    expect(result.current.breakpoints).toHaveProperty('xl');
  });

  it('provides isDark and isLight helpers', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(false);
    expect(result.current.isLight).toBe(true);

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.isDark).toBe(true);
    expect(result.current.isLight).toBe(false);
  });

  it('calculates contrast text color', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    const lightBg = '#ffffff';
    const darkBg = '#000000';

    expect(result.current.getContrastText(lightBg)).toBe('#000000');
    expect(result.current.getContrastText(darkBg)).toBe('#ffffff');
  });

  it('provides spacing utility', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.spacing(1)).toBe('8px');
    expect(result.current.spacing(2)).toBe('16px');
    expect(result.current.spacing(3)).toBe('24px');
  });
});