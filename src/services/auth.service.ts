import axios, { AxiosError } from 'axios';
import { signIn, signOut, getSession } from 'next-auth/react';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    // Validate input
    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    return {
      ok: result?.ok || false,
      error: result?.error || null,
      url: result?.url || null,
    };
  }

  async register(data: RegisterData, autoLogin = false) {
    // Validate input
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name is required');
    }
    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      const response = await axios.post('/api/auth/register', data);

      if (autoLogin) {
        await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });
      }

      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          (error as AxiosError<{ error: string }>).response?.data?.error || 'Registration failed',
      };
    }
  }

  async logout(redirectTo?: string) {
    localStorage.clear();

    if (redirectTo) {
      return signOut({ redirect: true, callbackUrl: redirectTo });
    }

    return signOut({ redirect: false });
  }

  async getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }) {
    if (data.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    try {
      const response = await axios.put('/api/auth/password', data);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          (error as AxiosError<{ error: string }>).response?.data?.error ||
          'Failed to update password',
      };
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          (error as AxiosError<{ error: string }>).response?.data?.error ||
          'Failed to send reset email',
      };
    }
  }

  async resetPassword(data: { token: string; newPassword: string }) {
    try {
      const response = await axios.post('/api/auth/reset-password', data);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          (error as AxiosError<{ error: string }>).response?.data?.error ||
          'Failed to reset password',
      };
    }
  }

  async verifyEmail(token: string) {
    try {
      const response = await axios.post('/api/auth/verify-email', { token });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          (error as AxiosError<{ error: string }>).response?.data?.error ||
          'Failed to verify email',
      };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await axios.post('/api/auth/refresh', { refreshToken });
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to refresh token');
    }
  }

  async validateSession() {
    const session = await getSession();
    if (!session) return false;

    const expires = new Date(session.expires);
    return expires > new Date();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();
