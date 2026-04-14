import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id: number;
  email: string;
  google_account_id: string | null;
  nohp: string | null;
  nohp_verified: boolean;
  nama_pemain: string | null;
  provinsi: string | null;
  kabupaten: string | null;
  kabupatenn: string | null;
  strong_hand: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuthSession = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  initializing: boolean;
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginWithGoogleIdToken: (idToken: string) => Promise<AuthSession>;
  restoreFromApi: () => Promise<void>;
  logout: () => Promise<void>;
  authenticatedFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const SESSION_KEY = 'auth.session.v1';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const AuthContext = createContext<AuthContextValue | null>(null);

type BackendGoogleLoginResponse = {
  access_token: string;
  data: AuthUser;
};

async function postGoogleLogin(idToken: string): Promise<AuthSession> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.');
  }

  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  const json = (await res.json()) as BackendGoogleLoginResponse & { message?: string };
  if (!res.ok) {
    throw new Error(json?.message || 'Google login failed.');
  }

  return {
    token: json.access_token,
    user: json.data,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw && mounted) {
          setSession(JSON.parse(raw) as AuthSession);
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = useCallback(async (next: AuthSession | null) => {
    setSession(next);
    if (!next) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
  }, []);

  const loginWithGoogleIdToken = useCallback(
    async (idToken: string): Promise<AuthSession> => {
      const next = await postGoogleLogin(idToken);
      await persistSession(next);
      return next;
    },
    [persistSession],
  );

  const authenticatedFetch = useCallback(
    async (path: string, init?: RequestInit): Promise<Response> => {
      if (!API_BASE_URL) {
        throw new Error('API base URL is not configured.');
      }
      if (!session?.token) {
        throw new Error('No active session token.');
      }

      return fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init?.headers || {}),
          Authorization: `Bearer ${session.token}`,
        },
      });
    },
    [session?.token],
  );

  const restoreFromApi = useCallback(async () => {
    if (!session?.token) {
      return;
    }

    const res = await authenticatedFetch('/auth/me');
    if (!res.ok) {
      await persistSession(null);
      return;
    }

    const json = (await res.json()) as { data: AuthUser };
    await persistSession({
      token: session.token,
      user: json.data,
    });
  }, [authenticatedFetch, persistSession, session]);

  const logout = useCallback(async () => {
    await persistSession(null);
  }, [persistSession]);

  useEffect(() => {
    if (initializing || !session?.token) {
      return;
    }
    restoreFromApi().catch(() => {
      // Ignore bootstrap refresh failures; session is cleared inside restoreFromApi.
    });
  }, [initializing, restoreFromApi, session?.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: !!session?.token,
      loginWithGoogleIdToken,
      restoreFromApi,
      logout,
      authenticatedFetch,
    }),
    [authenticatedFetch, initializing, loginWithGoogleIdToken, logout, restoreFromApi, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
