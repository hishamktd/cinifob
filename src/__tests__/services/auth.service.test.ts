import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/auth.service';
import axios from 'axios';
import { signIn, signOut, getSession } from 'next-auth/react';

// Mock dependencies
vi.mock('axios');
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('successfully logs in user', async () => {
      vi.mocked(signIn).mockResolvedValue({
        error: null,
        ok: true,
        status: 200,
        url: '/dashboard',
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        ok: true,
        error: null,
        url: '/dashboard',
      });

      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('handles login failure', async () => {
      vi.mocked(signIn).mockResolvedValue({
        error: 'Invalid credentials',
        ok: false,
        status: 401,
        url: null,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('validates email format', async () => {
      await expect(
        authService.login({
          email: 'invalid-email',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email format');

      expect(signIn).not.toHaveBeenCalled();
    });

    it('validates password length', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: '123',
        }),
      ).rejects.toThrow('Password must be at least 6 characters');

      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('successfully registers new user', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          message: 'User created successfully',
          user: {
            id: 'user123',
            email: 'new@example.com',
            name: 'New User',
          },
        },
      });

      const result = await authService.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 'user123',
        email: 'new@example.com',
        name: 'New User',
      });

      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });
    });

    it('handles registration failure', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Email already exists' },
        },
      });

      const result = await authService.register({
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('validates registration input', async () => {
      await expect(
        authService.register({
          name: '',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Name is required');

      await expect(
        authService.register({
          name: 'Test',
          email: 'invalid',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email format');

      await expect(
        authService.register({
          name: 'Test',
          email: 'test@example.com',
          password: '123',
        }),
      ).rejects.toThrow('Password must be at least 6 characters');
    });

    it('auto-logs in after successful registration', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          message: 'User created successfully',
          user: { id: 'user123', email: 'new@example.com' },
        },
      });

      vi.mocked(signIn).mockResolvedValue({
        error: null,
        ok: true,
        status: 200,
        url: '/dashboard',
      });

      const result = await authService.register(
        {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        },
        true,
      ); // autoLogin = true

      expect(result.success).toBe(true);
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'new@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  describe('logout', () => {
    it('successfully logs out user', async () => {
      vi.mocked(signOut).mockResolvedValue({ url: '/' });

      await authService.logout();

      expect(signOut).toHaveBeenCalledWith({ redirect: false });
    });

    it('clears local storage on logout', async () => {
      const clearSpy = vi.spyOn(localStorage, 'clear');

      vi.mocked(signOut).mockResolvedValue({ url: '/' });

      await authService.logout();

      expect(clearSpy).toHaveBeenCalled();
    });

    it('handles logout with redirect', async () => {
      vi.mocked(signOut).mockResolvedValue({ url: '/goodbye' });

      await authService.logout('/goodbye');

      expect(signOut).toHaveBeenCalledWith({
        redirect: true,
        callbackUrl: '/goodbye',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('returns current user from session', async () => {
      const mockSession = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2025-01-01',
      };

      vi.mocked(getSession).mockResolvedValue(mockSession);

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockSession.user);
    });

    it('returns null when no session', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('successfully updates password', async () => {
      vi.mocked(axios.put).mockResolvedValue({
        data: { message: 'Password updated successfully' },
      });

      const result = await authService.updatePassword({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(true);
      expect(axios.put).toHaveBeenCalledWith('/api/auth/password', {
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
      });
    });

    it('handles incorrect current password', async () => {
      vi.mocked(axios.put).mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Current password is incorrect' },
        },
      });

      const result = await authService.updatePassword({
        currentPassword: 'wrongpass',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Current password is incorrect');
    });

    it('validates password requirements', async () => {
      await expect(
        authService.updatePassword({
          currentPassword: 'oldpass123',
          newPassword: '123',
        }),
      ).rejects.toThrow('New password must be at least 6 characters');
    });
  });

  describe('forgotPassword', () => {
    it('sends password reset email', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Password reset email sent' },
      });

      const result = await authService.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent');
      expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com',
      });
    });

    it('handles non-existent email', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'If the email exists, a reset link will be sent' },
      });

      const result = await authService.forgotPassword('nonexistent@example.com');

      // Should not reveal whether email exists
      expect(result.success).toBe(true);
      expect(result.message).toBe('If the email exists, a reset link will be sent');
    });
  });

  describe('resetPassword', () => {
    it('successfully resets password with token', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Password reset successfully' },
      });

      const result = await authService.resetPassword({
        token: 'reset-token-123',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token: 'reset-token-123',
        newPassword: 'newpass123',
      });
    });

    it('handles invalid or expired token', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid or expired token' },
        },
      });

      const result = await authService.resetPassword({
        token: 'invalid-token',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });
  });

  describe('verifyEmail', () => {
    it('verifies email with token', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Email verified successfully' },
      });

      const result = await authService.verifyEmail('verification-token');

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith('/api/auth/verify-email', {
        token: 'verification-token',
      });
    });

    it('handles invalid verification token', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid verification token' },
        },
      });

      const result = await authService.verifyEmail('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification token');
    });
  });

  describe('refreshToken', () => {
    it('refreshes access token', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      });

      const tokens = await authService.refreshToken('old-refresh-token');

      expect(tokens.accessToken).toBe('new-access-token');
      expect(tokens.refreshToken).toBe('new-refresh-token');
    });

    it('handles token refresh failure', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Invalid refresh token' },
        },
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('validateSession', () => {
    it('validates active session', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user123' },
        expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      });

      const isValid = await authService.validateSession();

      expect(isValid).toBe(true);
    });

    it('invalidates expired session', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user123' },
        expires: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      });

      const isValid = await authService.validateSession();

      expect(isValid).toBe(false);
    });

    it('returns false for no session', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const isValid = await authService.validateSession();

      expect(isValid).toBe(false);
    });
  });
});
