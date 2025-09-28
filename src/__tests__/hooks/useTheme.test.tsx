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

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
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

  it('loads theme preference from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe('dark');
  });

  it('detects system preference', () => {
    // Mock matchMedia
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    global.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.mode).toBe('dark');
  });

  it('updates when system preference changes', () => {
    const listeners: Record<string, Function> = {};

    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: (event: string, handler: Function) => {
        listeners[event] = handler;
      },
      removeEventListener: vi.fn()
    }));

    global.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.mode).toBe('light');

    // Simulate system preference change
    act(() => {
      listeners.change({ matches: true });
    });

    expect(result.current.mode).toBe('dark');
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

  it('applies custom theme overrides', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.applyThemeOverrides({
        palette: {
          primary: {
            main: '#ff0000'
          }
        }
      });
    });

    expect(result.current.colors.primary).toBe('#ff0000');
  });

  it('resets theme to defaults', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
      result.current.applyThemeOverrides({
        palette: {
          primary: {
            main: '#ff0000'
          }
        }
      });
    });

    act(() => {
      result.current.resetTheme();
    });

    expect(result.current.mode).toBe('light');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-mode');
  });

  it('provides theme variants', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.variants).toHaveProperty('button');
    expect(result.current.variants).toHaveProperty('card');
    expect(result.current.variants).toHaveProperty('paper');
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

  it('handles theme preference with auto mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('auto');
    });

    // Should default to system preference
    expect(['light', 'dark']).toContain(result.current.mode);
  });

  it('provides custom color palette', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setCustomColors({
        accent: '#ff6b6b',
        highlight: '#4ecdc4'
      });
    });

    expect(result.current.customColors.accent).toBe('#ff6b6b');
    expect(result.current.customColors.highlight).toBe('#4ecdc4');
  });
});