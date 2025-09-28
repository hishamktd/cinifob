import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useMemo } from 'react';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user || null;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
    return result || { ok: false, error: 'Login failed' };
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return {
      ok: response.ok,
      error: result.error,
      ...result,
    };
  }, []);

  const updateSession = useCallback(async () => {
    await update();
  }, [update]);

  const hasRole = useCallback(
    (role: string) => {
      return (user as { role?: string })?.role === role;
    },
    [user],
  );

  const isSessionExpired = useMemo(() => {
    if (!session) return false;
    const expires = new Date(session.expires);
    return expires < new Date();
  }, [session]);

  const refreshToken = useCallback(async () => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
    });
    const data = await response.json();
    return data.accessToken;
  }, []);

  const getSession = useCallback(async () => {
    return session;
  }, [session]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateSession,
    hasRole,
    isSessionExpired,
    refreshToken,
    getSession,
  };
}
