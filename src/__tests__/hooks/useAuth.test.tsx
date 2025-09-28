import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { SessionProvider } from 'next-auth/react';
import { signIn, signOut, useSession } from 'next-auth/react';
import React from 'react';

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn()
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={null}>{children}</SessionProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user when authenticated', () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      },
      expires: '2025-01-01'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns null user when not authenticated', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('shows loading state', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn()
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('handles login', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    vi.mocked(signIn).mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: '/dashboard'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(response.ok).toBe(true);
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false
    });
  });

  it('handles login error', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    vi.mocked(signIn).mockResolvedValue({
      error: 'Invalid credentials',
      ok: false,
      status: 401,
      url: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      expect(response.ok).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });
  });

  it('handles logout', async () => {
    const mockSession = {
      user: { id: 'user123', email: 'test@example.com' },
      expires: '2025-01-01'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });

    vi.mocked(signOut).mockResolvedValue({ url: '/' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });

  it('handles register', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'User created successfully' })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      });
      expect(response.ok).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      })
    });
  });

  it('handles register error', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Email already exists' })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.register({
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      });
      expect(response.ok).toBe(false);
      expect(response.error).toBe('Email already exists');
    });
  });

  it('updates session', async () => {
    const updateFn = vi.fn();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user123' }, expires: '2025-01-01' },
      status: 'authenticated',
      update: updateFn
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.updateSession();
    });

    expect(updateFn).toHaveBeenCalled();
  });

  it('checks if user has role', () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      },
      expires: '2025-01-01'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(false);
  });

  it('checks if session is expired', () => {
    const expiredSession = {
      user: { id: 'user123' },
      expires: '2020-01-01' // Past date
    };

    vi.mocked(useSession).mockReturnValue({
      data: expiredSession,
      status: 'authenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isSessionExpired).toBe(true);
  });

  it('refreshes token', async () => {
    const mockSession = {
      user: { id: 'user123' },
      expires: '2025-01-01',
      accessToken: 'old-token'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-token' })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const newToken = await result.current.refreshToken();
      expect(newToken).toBe('new-token');
    });
  });

  it('gets current session', async () => {
    const mockSession = {
      user: { id: 'user123', email: 'test@example.com' },
      expires: '2025-01-01'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    const session = await result.current.getSession();
    expect(session).toEqual(mockSession);
  });
});